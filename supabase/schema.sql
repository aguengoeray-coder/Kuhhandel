-- Kuhhandel: Datenbank einrichten
-- Im Supabase-Dashboard unter "SQL Editor" komplett einfügen und auf "Run" klicken.

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  host uuid not null,
  status text not null default 'lobby' check (status in ('lobby', 'playing', 'ended')),
  players jsonb not null default '[]'::jsonb,   -- [{ "id": "<user-id>", "name": "Alp" }]
  state jsonb,                                  -- kompletter Spielstand (src/engine.js)
  version integer not null default 0,           -- schützt vor gleichzeitigen Änderungen
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.games enable row level security;

-- Alle angemeldeten Spieler dürfen Spiele sehen (Lobby-Liste)
drop policy if exists "games_select" on public.games;
create policy "games_select" on public.games
  for select to authenticated using (true);

-- Ein Spiel anlegen darf jeder, aber nur mit sich selbst als Gastgeber
drop policy if exists "games_insert" on public.games;
create policy "games_insert" on public.games
  for insert to authenticated with check (host = auth.uid());

-- Ändern dürfen nur Spieler, die in diesem Spiel sitzen
drop policy if exists "games_update" on public.games;
create policy "games_update" on public.games
  for update to authenticated
  using (players @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)))
  with check (players @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)));

-- Beitreten (sicher, auch wenn zwei gleichzeitig beitreten)
create or replace function public.join_game(p_game uuid, p_name text)
returns public.games
language plpgsql security definer set search_path = public
as $$
declare g public.games;
begin
  select * into g from public.games where id = p_game for update;
  if g.id is null then raise exception 'Spiel nicht gefunden'; end if;
  if g.players @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)) then
    return g; -- schon drin
  end if;
  if g.status <> 'lobby' then raise exception 'Das Spiel hat schon begonnen'; end if;
  if jsonb_array_length(g.players) >= 4 then raise exception 'Das Spiel ist voll'; end if;
  update public.games
     set players = players || jsonb_build_array(jsonb_build_object('id', auth.uid()::text, 'name', left(trim(p_name), 16))),
         version = version + 1, updated_at = now()
   where id = p_game
   returning * into g;
  return g;
end $$;

-- Warteraum verlassen (geht der Gastgeber, wird das Spiel gelöscht)
create or replace function public.leave_game(p_game uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare g public.games;
begin
  select * into g from public.games where id = p_game for update;
  if g.id is null or g.status <> 'lobby' then return; end if;
  if g.host = auth.uid() then
    delete from public.games where id = p_game;
  else
    update public.games
       set players = (select coalesce(jsonb_agg(p), '[]'::jsonb) from jsonb_array_elements(g.players) p where p->>'id' <> auth.uid()::text),
           version = version + 1, updated_at = now()
     where id = p_game;
  end if;
end $$;

grant execute on function public.join_game(uuid, text) to authenticated;
grant execute on function public.leave_game(uuid) to authenticated;

-- Echtzeit-Updates für die Tabelle einschalten
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'games') then
    alter publication supabase_realtime add table public.games;
  end if;
end $$;
