-- v1.1 (Alp 22.11.2026 21:19/21:21, 28.11.2026 11:31 tägliche Gratis-Kiste, 11:34 Dublonen ohne Tageslimit, auch kurze Partien): Admin verschenkt Dublonen/Gratis-Kisten, Set-Jackpot in der Kiste (sehr selten),
-- Set-Effekt frei wählbar, wenn man das Set komplett hat (Outfit-Feld "fx").
-- Rückweg: shop_game_counts + shop_credit_game aus v0.55-dublonen-sicherheit.sql neu einspielen; drop function if exists public.admin_gift(uuid, int, int); drop table if exists public.shop_box_sets;
--   alter table public.shop_wallets drop column if exists free_boxes; shop_open_box aus v0.92-kiste-ruestung.sql und shop_set_outfit aus v0.91-kuhkiste.sql neu einspielen.

alter table public.shop_wallets add column if not exists free_boxes int not null default 0 check (free_boxes >= 0);
alter table public.shop_box_state add column if not exists last_free date; -- Tag (Europe/Berlin) der letzten täglichen Gratis-Kiste

-- Kisten-Sets (gleich BOX_SETS in js/outfits.js, Test prüft)
create table if not exists public.shop_box_sets (set_id text primary key, parts text[] not null, nur_monat smallint);
alter table public.shop_box_sets enable row level security;
drop policy if exists shop_box_sets_read on public.shop_box_sets;
create policy shop_box_sets_read on public.shop_box_sets for select to authenticated using (true);
insert into public.shop_box_sets (set_id, parts, nur_monat) values
  ('ritter', array['kopf:ritter','brust:ritter','beine:ritter'], null),
  ('samurai', array['kopf:samurai','brust:samurai','beine:samurai'], null),
  ('astronaut', array['kopf:astronaut','brust:astronaut','beine:astronaut'], null),
  ('weihnachtsmann', array['kopf:weihnachtsmann','brust:weihnachtsmann','beine:weihnachtsmann'], 12),
  ('goldkuh', array['kopf:goldkuh','brust:goldruestung','beine:goldhufe'], null),
  ('pharao', array['kopf:pharao','brust:pharao','beine:pharao'], null)
on conflict (set_id) do update set parts = excluded.parts, nur_monat = excluded.nur_monat;

-- Admin: Dublonen und Gratis-Kisten verschenken
create or replace function public.admin_gift(p_user uuid, p_dublonen int, p_boxes int)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare r public.shop_wallets;
begin
  perform public.require_admin();
  if coalesce(p_dublonen, 0) < 0 or coalesce(p_dublonen, 0) > 10000 or coalesce(p_boxes, 0) < 0 or coalesce(p_boxes, 0) > 100 then raise exception 'Höchstens 10.000 Dublonen und 100 Kisten auf einmal'; end if;
  insert into public.shop_wallets (user_id, balance, free_boxes) values (p_user, coalesce(p_dublonen, 0), coalesce(p_boxes, 0))
    on conflict (user_id) do update set balance = public.shop_wallets.balance + coalesce(p_dublonen, 0), free_boxes = public.shop_wallets.free_boxes + coalesce(p_boxes, 0), updated_at = now()
    returning * into r;
  return jsonb_build_object('balance', r.balance, 'free_boxes', r.free_boxes);
end $$;
revoke all on function public.admin_gift(uuid, int, int) from public, anon;
grant execute on function public.admin_gift(uuid, int, int) to authenticated;

-- Kiste öffnen: Gratis-Kiste zuerst; 0,5 % Set-Jackpot = ein ganzes Kisten-Set auf einmal
create or replace function public.shop_open_box()
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid(); v_bal int; v_free int; st public.shop_box_state; r float8; v_rar text; v_item text; v_dupe boolean; v_refund int := 0;
  v_set text; v_parts text[]; p text; v_cost int := 40; v_daily boolean := false; v_today date := (now() at time zone 'Europe/Berlin')::date;
begin
  if v_uid is null then raise exception 'Bitte anmelden'; end if;
  insert into public.shop_wallets (user_id, balance) values (v_uid, 0) on conflict (user_id) do nothing;
  select balance, free_boxes into v_bal, v_free from public.shop_wallets where user_id = v_uid for update;
  insert into public.shop_box_state (user_id) values (v_uid) on conflict (user_id) do nothing;
  select * into st from public.shop_box_state where user_id = v_uid for update;
  -- Reihenfolge: tägliche Gratis-Kiste → geschenkte Gratis-Kisten → 40 Dublonen
  if st.last_free is distinct from v_today then v_cost := 0; v_daily := true;
  elsif coalesce(v_free, 0) > 0 then v_cost := 0;
  elsif v_bal < 40 then raise exception 'Zu wenig Dublonen (40 nötig)'; end if;
  -- Set-Jackpot (sehr selten)
  if random() < 0.005 then
    select set_id, parts into v_set, v_parts from public.shop_box_sets
      where nur_monat is null or nur_monat = extract(month from now() at time zone 'Europe/Berlin')::int order by random() limit 1;
  end if;
  if v_set is not null then
    v_rar := 'legendaer'; v_item := v_parts[1]; v_dupe := false;
    foreach p in array v_parts loop
      insert into public.shop_inventory (user_id, item_id) values (v_uid, p) on conflict (user_id, item_id) do update set n = public.shop_inventory.n + 1;
      insert into public.shop_box_log (user_id, item_id, rarity, dupe, refund) values (v_uid, p, 'legendaer', false, 0);
    end loop;
  else
    r := random();
    v_rar := case when r < 0.03 then 'legendaer' when r < 0.13 then 'episch' when r < 0.40 then 'selten' else 'gewoehnlich' end;
    if st.since_legend + 1 >= 25 then v_rar := 'legendaer';
    elsif st.since_epic + 1 >= 8 and v_rar in ('gewoehnlich','selten') then v_rar := 'episch'; end if;
    select item_id into v_item from public.shop_box_pool where rarity = v_rar
      and (nur_monat is null or nur_monat = extract(month from now() at time zone 'Europe/Berlin')::int) order by random() limit 1;
    v_dupe := exists (select 1 from public.shop_inventory where user_id = v_uid and item_id = v_item);
    if v_dupe then
      v_refund := case v_rar when 'gewoehnlich' then 5 when 'selten' then 10 when 'episch' then 20 else 50 end;
      update public.shop_inventory set n = n + 1 where user_id = v_uid and item_id = v_item;
    else
      insert into public.shop_inventory (user_id, item_id) values (v_uid, v_item);
    end if;
    insert into public.shop_box_log (user_id, item_id, rarity, dupe, refund) values (v_uid, v_item, v_rar, v_dupe, v_refund);
  end if;
  update public.shop_wallets set balance = balance - v_cost + v_refund, free_boxes = free_boxes - case when v_cost = 0 and not v_daily then 1 else 0 end, updated_at = now()
    where user_id = v_uid returning balance, free_boxes into v_bal, v_free;
  update public.shop_box_state set opened = opened + 1, last_free = case when v_daily then v_today else last_free end,
    since_legend = case when v_rar = 'legendaer' then 0 else since_legend + 1 end,
    since_epic = case when v_rar in ('episch','legendaer') then 0 else since_epic + 1 end
   where user_id = v_uid;
  return jsonb_build_object('item', v_item, 'rarity', v_rar, 'dupe', v_dupe, 'refund', v_refund, 'balance', v_bal, 'free_boxes', v_free, 'set', v_set, 'parts', to_jsonb(v_parts), 'daily', v_daily, 'daily_next', case when v_daily or st.last_free = v_today then false else true end);
end $$;

-- Outfit anziehen: zusätzlich "fx" = Set-Effekt eines Sets, das man komplett besitzt
create or replace function public.shop_set_outfit(p_outfit jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_uid uuid := auth.uid(); k text; v text; v_av text; v_out jsonb := '{}'::jsonb; v_parts text[];
begin
  if v_uid is null then raise exception 'Bitte anmelden'; end if;
  for k in select unnest(array['kopf','brust','beine','ding']) loop
    v := nullif(p_outfit->>k, '');
    if v is null then continue; end if;
    if position(':' in v) = 0 or split_part(v, ':', 1) <> k then raise exception 'Falsches Fach: %', v; end if;
    v_av := split_part(v, ':', 2);
    if k <> 'ding' and v_av in ('noergler','opa-ratte','business-huhn','spar-schwein','boersen-gauner','disco-kuh','raketen-esel','piraten-papagei','daemonenritter','cyborg-hahn','kuh-kaiser','bennet-verletzt','nico-schreit','alp-quasselt','mr-passt-schon','mama-sports','dumme-kuh','dickes-huhn','bontje-lebkuchen','schmatz-zwillinge','nacht-gohan','mogli-schielt','dicker-gojo')
       and exists (select 1 from public.shop_purchases where user_id = v_uid and item_id = v_av) then
      v_out := v_out || jsonb_build_object(k, v); continue;
    end if;
    if exists (select 1 from public.shop_inventory where user_id = v_uid and item_id = v) then
      v_out := v_out || jsonb_build_object(k, v); continue;
    end if;
    raise exception 'Dieses Teil hast du nicht: %', v;
  end loop;
  v := nullif(p_outfit->>'fx', '');
  if v is not null then
    select parts into v_parts from public.shop_box_sets where set_id = v;
    if v_parts is not null then
      if (select count(*) from public.shop_inventory where user_id = v_uid and item_id = any(v_parts)) < 3 then raise exception 'Dafür brauchst du das ganze Set'; end if;
    elsif not exists (select 1 from public.shop_purchases where user_id = v_uid and item_id = v) then raise exception 'Dafür brauchst du das ganze Set';
    end if;
    v_out := v_out || jsonb_build_object('fx', v);
  end if;
  update public.shop_wallets set outfit = v_out, updated_at = now() where user_id = v_uid;
  return v_out;
end $$;

-- Status für die App: tägliche Gratis-Kiste noch offen? Gratis-Kisten auf Vorrat?
create or replace function public.shop_box_status()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'daily', coalesce((select last_free from public.shop_box_state where user_id = auth.uid()), date '2000-01-01') < (now() at time zone 'Europe/Berlin')::date,
    'free_boxes', coalesce((select free_boxes from public.shop_wallets where user_id = auth.uid()), 0));
$$;
revoke all on function public.shop_box_status() from public, anon;
grant execute on function public.shop_box_status() to authenticated;

-- Dublonen für jede beendete Partie mit mind. 2 angemeldeten Spielern (keine Mindestdauer/-züge mehr), kein Tageslimit
create or replace function public.shop_game_counts(g public.games)
returns boolean language sql stable security definer set search_path = public
as $$
  select g.status = 'ended'
     and coalesce(g.state->>'phase', '') = 'ended'
     and (select count(distinct u.id) from jsonb_array_elements(g.players) p
            join auth.users u on u.id::text = p->>'id') >= 2;
$$;
revoke all on function public.shop_game_counts(public.games) from public, anon, authenticated;

create or replace function public.shop_credit_game(p_game uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  g public.games; pl jsonb; sp jsonb; v_uid uuid; v_seat text; v_q int; k record;
begin
  select * into g from public.games where id = p_game;
  if g.id is null or not public.shop_game_counts(g) then return; end if;
  for pl in select * from jsonb_array_elements(g.players) loop
    v_uid := (pl->>'id')::uuid;
    v_seat := coalesce(pl->>'seat', pl->>'id');
    if not exists (select 1 from auth.users where id = v_uid) then continue; end if;
    select s into sp from jsonb_array_elements(g.state->'players') s where s->>'id' = v_seat limit 1;
    select count(*) into v_q from jsonb_each_text(coalesce(sp->'animals', '{}'::jsonb)) a
     where a.key <> 'ratte' and a.value ~ '^[0-9]+$' and a.value::int >= 4;
    for k in select * from (values
        ('partie', 2),
        ('quartett', 5 * least(v_q, 5)),
        ('sieg', case when coalesce(g.state->'winner', '[]'::jsonb) ? v_seat then 10 else 0 end)
      ) as t(kind, amount)
    loop
      if k.amount <= 0 then continue; end if;
      with ins as (
        insert into public.shop_rewards (game_id, player_id, kind, amount)
        values (p_game, v_uid, k.kind, k.amount)
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
