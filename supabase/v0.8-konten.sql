-- Kuhhandel v0.8: Profile (Spielerbild), Ergebnisse für die Bestenliste, Gastgeber-Rechte im Warteraum
-- Im Supabase-Dashboard unter "SQL Editor" einfügen und auf "Run" klicken (am besten in den 3 Teilen unten).

-- ===== Teil 1: Profile und Ergebnisse =====

create table if not exists public.profiles (
  id uuid primary key,
  name text not null,
  animal text not null default 'kuh',
  color text not null default '#7FA88A',
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles_upsert" on public.profiles;
create policy "profiles_upsert" on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create table if not exists public.game_results (
  game_id uuid not null,
  player_id uuid not null,
  name text not null,
  score integer not null,
  quartets integer not null,
  won boolean not null,
  players integer not null,
  created_at timestamptz not null default now(),
  primary key (game_id, player_id)
);
alter table public.game_results enable row level security;
drop policy if exists "results_select" on public.game_results;
create policy "results_select" on public.game_results for select to authenticated using (true);

-- ===== Teil 2: Ergebnisse eintragen =====

-- Ergebnisse eines beendeten Spiels eintragen (darf jeder Mitspieler, doppelt wird ignoriert)
create or replace function public.record_results(p_game uuid, p_rows jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
declare g public.games;
begin
  select * into g from public.games where id = p_game;
  if g.id is null or g.status <> 'ended' then raise exception 'Spiel ist nicht beendet'; end if;
  if not (g.players @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))) then
    raise exception 'Du sitzt nicht in diesem Spiel';
  end if;
  insert into public.game_results (game_id, player_id, name, score, quartets, won, players)
  select p_game, (r->>'player_id')::uuid, left(r->>'name', 16), (r->>'score')::int, (r->>'quartets')::int, (r->>'won')::boolean, jsonb_array_length(g.players)
    from jsonb_array_elements(p_rows) r
   where g.players @> jsonb_build_array(jsonb_build_object('id', r->>'player_id'))
  on conflict do nothing;
end $$;

-- ===== Teil 3: Gastgeber-Rechte im Warteraum =====

-- Gastgeber entfernt einen Spieler aus dem Warteraum
create or replace function public.kick_player(p_game uuid, p_player text)
returns void
language plpgsql security definer set search_path = public
as $$
declare g public.games;
begin
  select * into g from public.games where id = p_game for update;
  if g.id is null or g.status <> 'lobby' then return; end if;
  if g.host <> auth.uid() then raise exception 'Nur der Gastgeber darf das'; end if;
  update public.games
     set players = (select coalesce(jsonb_agg(p order by ord), '[]'::jsonb)
                      from jsonb_array_elements(g.players) with ordinality as t(p, ord)
                     where p->>'id' <> p_player),
         version = version + 1, updated_at = now()
   where id = p_game;
end $$;

-- Warteraum verlassen: geht der Gastgeber, wird der Nächste Gastgeber (leer = Spiel löschen)
create or replace function public.leave_game(p_game uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare g public.games; rest jsonb;
begin
  select * into g from public.games where id = p_game for update;
  if g.id is null or g.status <> 'lobby' then return; end if;
  select coalesce(jsonb_agg(p order by ord), '[]'::jsonb) into rest
    from jsonb_array_elements(g.players) with ordinality as t(p, ord)
   where p->>'id' <> auth.uid()::text;
  if jsonb_array_length(rest) = 0 then
    delete from public.games where id = p_game;
  else
    update public.games
       set players = rest,
           host = case when g.host = auth.uid() then (rest->0->>'id')::uuid else g.host end,
           version = version + 1, updated_at = now()
     where id = p_game;
  end if;
end $$;

grant execute on function public.record_results(uuid, jsonb) to authenticated;
grant execute on function public.kick_player(uuid, text) to authenticated;
grant execute on function public.leave_game(uuid) to authenticated;
