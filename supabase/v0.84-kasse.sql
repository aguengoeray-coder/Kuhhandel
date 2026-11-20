-- v0.84 „Einsatz & Kasse“ (Alp, 20.11.2026): Schuldenbuch für Echtgeld-Runden unter Freunden.
-- Die App bewegt KEIN Geld – sie merkt sich nur, wer wem was schuldet. Bezahlt wird unter euch.
-- Einsatz steht in games.state.settings.stake (Euro pro Kopf), Zustimmung in settings.stakeOk { sitz: true }.
-- Am Spielende: jeder Verlierer schuldet jedem Sieger stake / Anzahl Sieger (Topf geht an Platz 1, bei Gleichstand/Team geteilt).
-- Rückweg: drop function public.kasse_paid_pair(uuid); drop function public.kasse_settle(uuid); drop table public.kasse;

create table if not exists public.kasse (
  id bigserial primary key,
  game_id uuid not null,
  debtor uuid not null references auth.users(id) on delete cascade,
  creditor uuid not null references auth.users(id) on delete cascade,
  cents int not null check (cents > 0),
  stake_cents int not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  unique (game_id, debtor, creditor)
);
create index if not exists kasse_debtor_idx on public.kasse (debtor);
create index if not exists kasse_creditor_idx on public.kasse (creditor);
alter table public.kasse enable row level security;
-- Eure Runde ist klein: alle angemeldeten Spieler sehen das ganze Schuldenbuch (Bilanz pro Person). Schreiben nur über die Funktionen.
drop policy if exists kasse_select on public.kasse;
create policy kasse_select on public.kasse for select to authenticated using (true);
revoke all on public.kasse from anon;
grant select on public.kasse to authenticated;

-- Abrechnen (idempotent): ruft jeder Mitspieler nach Spielende auf, gebucht wird nur einmal
create or replace function public.kasse_settle(p_game uuid)
returns int language plpgsql security definer set search_path = public
as $$
declare
  g public.games;
  v_stake int;
  v_n int := 0;
  v_winners uuid[];
  v_players uuid[];
  v_ok jsonb;
  w uuid; l uuid;
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  select * into g from public.games where id = p_game;
  if g.id is null or g.status <> 'ended' then raise exception 'Spiel ist nicht beendet'; end if;
  if not (g.players @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))) then
    raise exception 'Du sitzt nicht in diesem Spiel';
  end if;
  v_stake := coalesce(nullif(g.state->'settings'->>'stake', '')::int, 0);
  if v_stake <= 0 or v_stake > 100 then return 0; end if;
  v_ok := coalesce(g.state->'settings'->'stakeOk', '{}'::jsonb);
  -- nur wenn wirklich alle zugestimmt haben
  if exists (select 1 from jsonb_array_elements(g.players) pl(p)
              where coalesce((v_ok->>coalesce(pl.p->>'seat', pl.p->>'id'))::boolean, false) is not true) then
    return 0;
  end if;
  select array_agg((pl.p->>'id')::uuid) into v_players from jsonb_array_elements(g.players) pl(p);
  select array_agg((pl.p->>'id')::uuid) into v_winners
    from jsonb_array_elements(g.players) pl(p)
    join jsonb_array_elements_text(coalesce(g.state->'winner', '[]'::jsonb)) wn(seat) on wn.seat = coalesce(pl.p->>'seat', pl.p->>'id');
  if v_winners is null or array_length(v_winners, 1) = 0 then return 0; end if;
  foreach l in array v_players loop
    if l = any(v_winners) then continue; end if;
    foreach w in array v_winners loop
      insert into public.kasse (game_id, debtor, creditor, cents, stake_cents)
      values (p_game, l, w, round(v_stake * 100.0 / array_length(v_winners, 1))::int, v_stake * 100)
      on conflict do nothing;
      if found then v_n := v_n + 1; end if;
    end loop;
  end loop;
  return v_n;
end $$;

-- „Bezahlt ✓“: nur wer unterm Strich Geld bekommt, hakt alle offenen Posten mit dieser Person ab
create or replace function public.kasse_paid_pair(p_other uuid)
returns int language plpgsql security definer set search_path = public
as $$
declare v_net bigint; v_n int;
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  select coalesce(sum(case when creditor = auth.uid() then cents else -cents end), 0) into v_net
    from public.kasse
   where paid_at is null and ((creditor = auth.uid() and debtor = p_other) or (debtor = auth.uid() and creditor = p_other));
  if v_net <= 0 then raise exception 'Abhaken darf nur, wer das Geld bekommt'; end if;
  update public.kasse set paid_at = now()
   where paid_at is null and ((creditor = auth.uid() and debtor = p_other) or (debtor = auth.uid() and creditor = p_other));
  get diagnostics v_n = row_count;
  return v_n;
end $$;

revoke all on function public.kasse_settle(uuid) from public, anon;
revoke all on function public.kasse_paid_pair(uuid) from public, anon;
grant execute on function public.kasse_settle(uuid) to authenticated;
grant execute on function public.kasse_paid_pair(uuid) to authenticated;
