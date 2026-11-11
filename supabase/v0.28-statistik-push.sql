-- v0.28: Eigene Statistik + Push-Benachrichtigungen („Du bist dran“)
-- Einmal komplett im Supabase-SQL-Editor ausführen. Kann gefahrlos mehrmals laufen.
-- WICHTIG: Ganz unten in Teil B das Wort GEHEIMWORT_HIER durch das Geheimwort aus dem Chat ersetzen.

-- ===== Teil A: Eigene Statistik =====

-- 1) Neue Spalte für die Zusatzwerte
alter table public.game_results add column if not exists extras jsonb;

-- 2) Ergebnisse eintragen – jetzt mit Zusatzwerten (sonst unverändert)
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
  insert into public.game_results (game_id, player_id, name, score, quartets, won, players, extras)
  select p_game, (r->>'player_id')::uuid, left(r->>'name', 16), (r->>'score')::int, (r->>'quartets')::int, (r->>'won')::boolean, jsonb_array_length(g.players),
         case when jsonb_typeof(r->'extras') = 'object' then r->'extras' else null end
    from jsonb_array_elements(p_rows) r
   where g.players @> jsonb_build_array(jsonb_build_object('id', r->>'player_id'))
  on conflict do nothing;
end $$;

grant execute on function public.record_results(uuid, jsonb) to authenticated;


-- ===== Teil B: Push-Benachrichtigungen =====

-- Erweiterung zum Verschicken von Web-Anfragen aus der Datenbank
create extension if not exists pg_net;

-- Welche Geräte wollen benachrichtigt werden (ein Eintrag je Gerät)
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null,
  sub jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security; -- nur über die Funktionen unten

create or replace function public.save_push(p_sub jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or p_sub->>'endpoint' is null then raise exception 'Nicht angemeldet'; end if;
  insert into public.push_subscriptions (endpoint, user_id, sub) values (p_sub->>'endpoint', auth.uid(), p_sub)
  on conflict (endpoint) do update set user_id = auth.uid(), sub = excluded.sub, created_at = now();
end $$;
grant execute on function public.save_push(jsonb) to authenticated;

create or replace function public.delete_push(p_endpoint text)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.push_subscriptions where endpoint = p_endpoint and user_id = auth.uid();
end $$;
grant execute on function public.delete_push(text) to authenticated;

-- Wohin gemeldet wird + Geheimwort (nur die Datenbank selbst liest das)
create table if not exists public.push_settings (id int primary key default 1, url text not null, secret text not null);
alter table public.push_settings enable row level security;

-- Wer muss gerade etwas tun? (gleiche Logik wie im Spiel)
create or replace function public.kh_needer(s jsonb)
returns text language sql immutable as $$
  select case s->>'phase'
    when 'turn' then s->'players'->((s->>'turn')::int)->>'id'
    when 'payment' then s->'payment'->>'payer'
    when 'trade' then s->'trade'->>'target'
    when 'block' then s->'block'->>'player'
    when 'rat' then s->'rat'->'order'->>(((s->'rat'->>'idx')::int) % greatest(1, jsonb_array_length(s->'rat'->'order')))
    else null end
$$;

-- Nach jeder Spieländerung: Ist jemand Neues dran? Dann seine Geräte benachrichtigen
create or replace function public.kh_push_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare n text; o text; uid text; subs jsonb; cfg record;
begin
  begin
    if new.status <> 'playing' then return new; end if;
    n := public.kh_needer(new.state);
    o := public.kh_needer(old.state);
    if n is null then return new; end if;
    if n = o and (new.state->>'phase') is not distinct from (old.state->>'phase') then return new; end if;
    select p->>'id' into uid from jsonb_array_elements(new.players) p where coalesce(p->>'seat', p->>'id') = n limit 1;
    if uid is null then uid := n; end if;
    select jsonb_agg(sub) into subs from public.push_subscriptions where user_id::text = uid;
    if subs is null then return new; end if;
    select * into cfg from public.push_settings where id = 1;
    if cfg.url is null then return new; end if;
    perform net.http_post(
      url := cfg.url,
      body := jsonb_build_object('subs', subs, 'game', new.id),
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', cfg.secret)
    );
  exception when others then
    null; -- Benachrichtigungen dürfen das Spiel nie aufhalten
  end;
  return new;
end $$;

drop trigger if exists kh_push on public.games;
create trigger kh_push after update on public.games for each row execute function public.kh_push_notify();

-- Ziel und Geheimwort eintragen (GEHEIMWORT_HIER ersetzen!)
insert into public.push_settings (id, url, secret)
values (1, 'https://kuhhandel.a-guengoeray.workers.dev/push', 'GEHEIMWORT_HIER')
on conflict (id) do update set url = excluded.url, secret = excluded.secret;
