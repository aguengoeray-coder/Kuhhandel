-- ============================================================================
-- v0.55 Dublonen für alle + Schutz der Spielstände  –  ENTWURF, NOCH NICHT AUSFÜHREN
-- ============================================================================
-- 🔴 Nur Alp führt diese Datei aus (Supabase → SQL Editor), und erst nachdem
--    die passende App-Version (create_rematch per RPC) live ist. Reihenfolge und
--    Begründung: supabase/v0.55-sicherheit-vorschlag.md
--
-- Was diese Datei macht:
--   A. Wächter auf public.games: Clients können Stammdaten, Mitspieler (nur noch per
--      Beitreten/Verlassen), Status-Rückschritte und beendete Spiele nicht mehr verändern;
--      neue Spiele beginnen immer im Warteraum nur mit dir selbst.
--   B. Revanche über eine Server-Funktion (create_rematch) statt direktem Insert.
--   C. Belohnungen nur für echte Partien: ≥ 3 echte Konten, ≥ 6 Minuten, ≥ 25 Züge.
--   D. Neue Belohnungen: +2 je Partie, +5 je Quartett (max. 5), +10 Sieg,
--      höchstens 60 Dublonen pro Spieler und Tag (Zeitzone Europe/Berlin).
--   Alles idempotent: mehrfaches Ausführen schadet nicht.
-- ============================================================================

-- ---------- A. Wächter für Spielstände ----------
create or replace function public.games_guard()
returns trigger language plpgsql set search_path = public
as $$
begin
  -- Server-Funktionen (join_game, kick_player, create_rematch …) laufen als Eigentümer
  -- und sind selbst geprüft; der Wächter gilt nur für direkte Änderungen aus der App.
  if current_user not in ('authenticated', 'anon') then return new; end if;

  if tg_op = 'INSERT' then
    if new.status <> 'lobby' then raise exception 'Neue Spiele beginnen im Warteraum.'; end if;
    if jsonb_array_length(coalesce(new.players, '[]'::jsonb)) <> 1
       or not (new.players @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))) then
      raise exception 'Ein neues Spiel enthält nur dich selbst.';
    end if;
    return new;
  end if;

  if new.id <> old.id or new.host <> old.host or new.code <> old.code or new.created_at <> old.created_at then
    raise exception 'Spiel-Stammdaten sind unveränderlich.';
  end if;
  if new.version <> old.version + 1 then raise exception 'Version muss genau um 1 steigen.'; end if;
  if new.players is distinct from old.players then
    raise exception 'Mitspieler ändern sich nur über Beitreten/Verlassen.'; -- join_game, leave_game, kick_player
  end if;
  if old.status = 'playing' and new.status = 'lobby' then raise exception 'Ein laufendes Spiel geht nicht zurück in den Warteraum.'; end if;
  if new.status = 'ended' and coalesce(new.state->>'phase', '') <> 'ended' then
    raise exception 'Ein Spiel endet nur mit einem fertigen Spielstand.';
  end if;
  if old.status = 'ended' then
    -- nach dem Ende darf nur noch die Revanche-Verknüpfung dazukommen
    if new.status <> 'ended' or (new.state - 'rematchId') is distinct from (old.state - 'rematchId') then
      raise exception 'Beendete Spiele sind abgeschlossen.';
    end if;
  end if;
  -- der Spielverlauf wächst nur (keine nachträglich „bereinigten“ Partien)
  if old.status = 'playing' and jsonb_array_length(coalesce(new.state->'log', '[]'::jsonb)) < jsonb_array_length(coalesce(old.state->'log', '[]'::jsonb)) then
    raise exception 'Der Spielverlauf kann nicht gekürzt werden.';
  end if;
  return new;
end $$;

drop trigger if exists games_guard on public.games;
create trigger games_guard before insert or update on public.games
for each row execute function public.games_guard();

-- ---------- B. Revanche serverseitig anlegen ----------
create or replace function public.create_rematch(p_from uuid, p_id uuid, p_code text, p_players jsonb, p_state jsonb)
returns public.games language plpgsql security definer set search_path = public
as $$
declare old_g public.games; new_g public.games;
begin
  select * into old_g from public.games where id = p_from;
  if old_g.id is null or old_g.status <> 'ended' then raise exception 'Revanche nur nach einem beendeten Spiel.'; end if;
  if auth.uid() is null or not (old_g.players @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))) then
    raise exception 'Du sitzt nicht in diesem Spiel.';
  end if;
  -- nur Spieler aus der alten Partie, keine neuen/erfundenen Konten
  if exists (select 1 from jsonb_array_elements(p_players) p
              where not (old_g.players @> jsonb_build_array(jsonb_build_object('id', p->>'id')))) then
    raise exception 'Revanche nur mit den bisherigen Spielern.';
  end if;
  insert into public.games (id, code, host, status, players, state, version)
  values (p_id, left(p_code, 8), auth.uid(), 'playing', p_players, p_state, 1)
  returning * into new_g;
  return new_g;
end $$;
revoke all on function public.create_rematch(uuid, uuid, text, jsonb, jsonb) from public, anon;
grant execute on function public.create_rematch(uuid, uuid, text, jsonb, jsonb) to authenticated;

-- ---------- C./D. Belohnungen: Buchungen je Spiel, Spieler und Art ----------
create table if not exists public.shop_rewards (
  game_id uuid not null,
  player_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('partie', 'quartett', 'sieg')),
  amount integer not null check (amount between 0 and 25),
  created_at timestamptz not null default now(),
  primary key (game_id, player_id, kind)
);
alter table public.shop_rewards enable row level security;
drop policy if exists "shop_rewards_select_own" on public.shop_rewards;
create policy "shop_rewards_select_own" on public.shop_rewards
  for select to authenticated using (player_id = auth.uid());
revoke all on public.shop_rewards from anon, authenticated;
grant select on public.shop_rewards to authenticated;

-- Ist das eine echte Partie? (gegen Spiele mit erfundenen Mitspielern und Blitz-„Partien“)
create or replace function public.shop_game_counts(g public.games)
returns boolean language sql stable security definer set search_path = public
as $$
  select g.status = 'ended'
     and coalesce(g.state->>'phase', '') = 'ended'
     and (select count(distinct u.id) from jsonb_array_elements(g.players) p
            join auth.users u on u.id::text = p->>'id') >= 3
     and now() - g.created_at >= interval '6 minutes'      -- created_at ist fest (Wächter), updated_at nicht
     and jsonb_array_length(coalesce(g.state->'log', '[]'::jsonb)) >= 25;
$$;
revoke all on function public.shop_game_counts(public.games) from public, anon, authenticated;

create or replace function public.shop_credit_game(p_game uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  g public.games; pl jsonb; sp jsonb; v_uid uuid; v_seat text; v_q int; v_left int; v_amt int; k record;
  v_today timestamptz := date_trunc('day', now() at time zone 'Europe/Berlin') at time zone 'Europe/Berlin';
begin
  select * into g from public.games where id = p_game;
  if g.id is null or not public.shop_game_counts(g) then return; end if; -- keine echte Partie: keine Dublonen

  for pl in select * from jsonb_array_elements(g.players) loop
    v_uid := (pl->>'id')::uuid;
    v_seat := coalesce(pl->>'seat', pl->>'id');
    if not exists (select 1 from auth.users where id = v_uid) then continue; end if;
    select s into sp from jsonb_array_elements(g.state->'players') s where s->>'id' = v_seat limit 1;
    -- Quartette aus dem gespeicherten Spielstand (nicht aus Browser-Angaben), Ratten zählen nicht
    select count(*) into v_q from jsonb_each_text(coalesce(sp->'animals', '{}'::jsonb)) a
     where a.key <> 'ratte' and a.value ~ '^[0-9]+$' and a.value::int >= 4;
    for k in select * from (values
        ('partie', 2),
        ('quartett', 5 * least(v_q, 5)),
        ('sieg', case when coalesce(g.state->'winner', '[]'::jsonb) ? v_seat then 10 else 0 end)
      ) as t(kind, amount)
    loop
      if k.amount <= 0 then continue; end if;
      -- Tagesgrenze 60 (alte Siegprämien aus v0.48 zählen mit)
      select 60 - coalesce((select sum(amount) from public.shop_rewards where player_id = v_uid and created_at >= v_today), 0)
                - coalesce((select sum(amount) from public.shop_win_rewards where player_id = v_uid and created_at >= v_today), 0)
        into v_left;
      v_amt := greatest(0, least(k.amount, v_left));
      if v_amt = 0 then continue; end if;
      with ins as (
        insert into public.shop_rewards (game_id, player_id, kind, amount)
        values (p_game, v_uid, k.kind, v_amt)
        on conflict (game_id, player_id, kind) do nothing
        returning amount
      )
      insert into public.shop_wallets (user_id, balance)
      select v_uid, amount from ins
      on conflict (user_id) do update set balance = public.shop_wallets.balance + excluded.balance, updated_at = now();
    end loop;
  end loop;
end $$;
revoke all on function public.shop_credit_game(uuid) from public, anon, authenticated;

-- record_results: wie v0.48, ruft aber die neue Gutschrift auf (statt nur der Siegprämie)
create or replace function public.record_results(p_game uuid, p_rows jsonb)
returns void language plpgsql security definer set search_path = public
as $$
declare g public.games;
begin
  select * into g from public.games where id = p_game;
  if g.id is null or g.status <> 'ended' then raise exception 'Spiel ist nicht beendet'; end if;
  if auth.uid() is null or not
    (g.players @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))) then
    raise exception 'Du sitzt nicht in diesem Spiel';
  end if;

  insert into public.game_results
    (game_id, player_id, name, score, quartets, won, players, extras)
  select p_game, (r->>'player_id')::uuid, left(r->>'name',16),
         (r->>'score')::int, (r->>'quartets')::int,
         exists (
           select 1
             from jsonb_array_elements(g.players) as pl(player)
             join jsonb_array_elements_text(coalesce(g.state->'winner','[]'::jsonb)) as w(seat_id)
               on w.seat_id = coalesce(pl.player->>'seat', pl.player->>'id')
            where pl.player->>'id' = r->>'player_id'
         ),
         jsonb_array_length(g.players),
         case when jsonb_typeof(r->'extras')='object' then r->'extras' else null end
    from jsonb_array_elements(p_rows) r
   where g.players @> jsonb_build_array(jsonb_build_object('id',r->>'player_id'))
  on conflict do nothing;

  perform public.shop_credit_game(p_game);
end $$;
revoke all on function public.record_results(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.record_results(uuid, jsonb) to authenticated;

-- Eigene Gutschriften dieser Partie (für die Siegerehrung: „+2 Partie · +10 Quartette · +10 Sieg“)
create or replace function public.shop_my_rewards(p_game uuid)
returns table (kind text, amount integer)
language sql stable security definer set search_path = public
as $$ select kind, amount from public.shop_rewards where game_id = p_game and player_id = auth.uid(); $$;
revoke all on function public.shop_my_rewards(uuid) from public, anon;
grant execute on function public.shop_my_rewards(uuid) to authenticated;

-- Ende v0.55-Entwurf.
