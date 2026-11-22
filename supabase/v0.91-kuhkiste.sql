-- v0.91 Kuh-Kiste, Inventar, Outfits (4 Fächer) und Erfolgs-Zubehör (Alps Go 22.11.2026 03:07)
-- Gezogen wird NUR hier auf dem Server (Zufall, Pech-Schutz, Dublonen zurück bei Doppelten) – die App zeigt nur an.
-- Preis 40 Dublonen · Gewöhnlich 60 % · Selten 27 % · Episch 10 % · Legendär 3 %
-- Pech-Schutz: spätestens jede 25. Kiste legendär, spätestens jede 8. mindestens episch
-- Doppelt: Dublonen zurück (5 / 10 / 20 / 50)
--
-- Rückweg (alles wieder entfernen, KEINE Dublonen-Rückbuchung):
--   drop function if exists public.shop_open_box(); drop function if exists public.shop_set_outfit(jsonb);
--   drop function if exists public.shop_public_outfits(uuid[]); drop function if exists public.shop_titles();
--   drop table if exists public.shop_box_log, public.shop_box_state, public.shop_inventory, public.shop_box_pool;
--   alter table public.shop_wallets drop column if exists outfit;

create table if not exists public.shop_box_pool (
  item_id text primary key,
  rarity text not null check (rarity in ('gewoehnlich','selten','episch','legendaer'))
);
alter table public.shop_box_pool enable row level security;
drop policy if exists shop_box_pool_read on public.shop_box_pool;
create policy shop_box_pool_read on public.shop_box_pool for select to authenticated using (true);
revoke all on public.shop_box_pool from anon;
revoke insert, update, delete, truncate, references, trigger on public.shop_box_pool from authenticated;
grant select on public.shop_box_pool to authenticated;

insert into public.shop_box_pool (item_id, rarity) values
  ('ding:gummihuhn', 'gewoehnlich'),
  ('ding:heugabel', 'gewoehnlich'),
  ('ding:melkeimer', 'gewoehnlich'),
  ('ding:karotte', 'gewoehnlich'),
  ('brust:ringelshirt', 'gewoehnlich'),
  ('beine:jogginghose', 'gewoehnlich'),
  ('ding:auktionshammer', 'selten'),
  ('ding:kuhglocke', 'selten'),
  ('ding:lasso', 'selten'),
  ('brust:holzfaeller', 'selten'),
  ('beine:latzhose', 'selten'),
  ('design-casino', 'selten'),
  ('design-bauernhof', 'selten'),
  ('ding:goldhammer', 'episch'),
  ('ding:geldkoffer', 'episch'),
  ('ding:gurkensaebel', 'episch'),
  ('brust:smoking', 'episch'),
  ('beine:kuhfleck', 'episch'),
  ('brust:astronaut', 'episch'),
  ('beine:astronaut', 'episch'),
  ('design-ozean', 'episch'),
  ('design-strand', 'episch'),
  ('ding:donnerhammer', 'legendaer'),
  ('ding:kristallglocke', 'legendaer'),
  ('brust:goldruestung', 'legendaer'),
  ('beine:raketenstiefel', 'legendaer'),
  ('kopf:goldkuh', 'legendaer'),
  ('design-winter', 'legendaer')
on conflict (item_id) do update set rarity = excluded.rarity;

create table if not exists public.shop_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  n int not null default 1,
  got_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
alter table public.shop_inventory enable row level security;
drop policy if exists shop_inventory_own on public.shop_inventory;
create policy shop_inventory_own on public.shop_inventory for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.shop_inventory from anon;
revoke insert, update, delete, truncate, references, trigger on public.shop_inventory from authenticated;
grant select on public.shop_inventory to authenticated;

create table if not exists public.shop_box_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  opened int not null default 0,
  since_legend int not null default 0,
  since_epic int not null default 0
);
alter table public.shop_box_state enable row level security;
drop policy if exists shop_box_state_own on public.shop_box_state;
create policy shop_box_state_own on public.shop_box_state for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.shop_box_state from anon;
revoke insert, update, delete, truncate, references, trigger on public.shop_box_state from authenticated;
grant select on public.shop_box_state to authenticated;

create table if not exists public.shop_box_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  rarity text not null,
  dupe boolean not null default false,
  refund int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists shop_box_log_user on public.shop_box_log (user_id, created_at desc);
alter table public.shop_box_log enable row level security;
drop policy if exists shop_box_log_own on public.shop_box_log;
create policy shop_box_log_own on public.shop_box_log for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.shop_box_log from anon;
revoke insert, update, delete, truncate, references, trigger on public.shop_box_log from authenticated;
grant select on public.shop_box_log to authenticated;

alter table public.shop_wallets add column if not exists outfit jsonb not null default '{}'::jsonb;

-- Kiste öffnen
create or replace function public.shop_open_box()
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid(); v_bal int; st public.shop_box_state; r float8; v_rar text; v_item text; v_dupe boolean; v_refund int := 0;
begin
  if v_uid is null then raise exception 'Bitte anmelden'; end if;
  select balance into v_bal from public.shop_wallets where user_id = v_uid for update;
  if v_bal is null or v_bal < 40 then raise exception 'Zu wenig Dublonen (40 nötig)'; end if;
  insert into public.shop_box_state (user_id) values (v_uid) on conflict (user_id) do nothing;
  select * into st from public.shop_box_state where user_id = v_uid for update;
  r := random();
  v_rar := case when r < 0.03 then 'legendaer' when r < 0.13 then 'episch' when r < 0.40 then 'selten' else 'gewoehnlich' end;
  if st.since_legend + 1 >= 25 then v_rar := 'legendaer';
  elsif st.since_epic + 1 >= 8 and v_rar in ('gewoehnlich','selten') then v_rar := 'episch'; end if;
  select item_id into v_item from public.shop_box_pool where rarity = v_rar order by random() limit 1;
  v_dupe := exists (select 1 from public.shop_inventory where user_id = v_uid and item_id = v_item);
  if v_dupe then
    v_refund := case v_rar when 'gewoehnlich' then 5 when 'selten' then 10 when 'episch' then 20 else 50 end;
    update public.shop_inventory set n = n + 1 where user_id = v_uid and item_id = v_item;
  else
    insert into public.shop_inventory (user_id, item_id) values (v_uid, v_item);
  end if;
  update public.shop_wallets set balance = balance - 40 + v_refund, updated_at = now() where user_id = v_uid returning balance into v_bal;
  update public.shop_box_state set opened = opened + 1,
    since_legend = case when v_rar = 'legendaer' then 0 else since_legend + 1 end,
    since_epic = case when v_rar in ('episch','legendaer') then 0 else since_epic + 1 end
   where user_id = v_uid;
  insert into public.shop_box_log (user_id, item_id, rarity, dupe, refund) values (v_uid, v_item, v_rar, v_dupe, v_refund);
  return jsonb_build_object('item', v_item, 'rarity', v_rar, 'dupe', v_dupe, 'refund', v_refund, 'balance', v_bal);
end $$;

-- Outfit anziehen (jedes Fach nur mit Teilen, die man besitzt)
create or replace function public.shop_set_outfit(p_outfit jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_uid uuid := auth.uid(); k text; v text; v_av text; v_out jsonb := '{}'::jsonb;
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
  update public.shop_wallets set outfit = v_out, updated_at = now() where user_id = v_uid;
  return v_out;
end $$;

-- Outfits der Mitspieler (für den Tisch)
create or replace function public.shop_public_outfits(p_ids uuid[])
returns table(user_id uuid, active_avatar text, outfit jsonb)
language sql stable security definer set search_path = public
as $$
  select w.user_id, w.active_avatar, w.outfit from public.shop_wallets w
   where w.user_id = any(p_ids) limit 50;
$$;

-- Erfolgs-Zubehör: immer nur der aktuelle Rekordhalter (Krone, Rattenschwanz, Geldregen)
create or replace function public.shop_titles()
returns table(title text, user_id uuid, value int)
language sql stable security definer set search_path = public
as $$
  (select 'krone'::text, r.player_id, sum(coalesce((r.extras->>'tradesWon')::int, 0))::int v
     from public.game_results r group by r.player_id having sum(coalesce((r.extras->>'tradesWon')::int, 0)) > 0 order by v desc, min(r.created_at) limit 1)
  union all
  (select 'rattenschwanz'::text, r.player_id, sum(coalesce((r.extras->>'ratsTaken')::int, 0))::int v
     from public.game_results r group by r.player_id having sum(coalesce((r.extras->>'ratsTaken')::int, 0)) > 0 order by v desc, min(r.created_at) limit 1)
  union all
  (select 'geldregen'::text, x.player_id, count(*)::int v from (
      select r.player_id, (r.extras->>'money')::int m, max((r.extras->>'money')::int) over (partition by r.game_id) mx
        from public.game_results r where r.extras ? 'money') x
     where x.m = x.mx and x.mx > 0 group by x.player_id order by v desc limit 1);
$$;

revoke all on function public.shop_open_box() from public, anon;
revoke all on function public.shop_set_outfit(jsonb) from public, anon;
revoke all on function public.shop_public_outfits(uuid[]) from public, anon;
revoke all on function public.shop_titles() from public, anon;
grant execute on function public.shop_open_box() to authenticated;
grant execute on function public.shop_set_outfit(jsonb) to authenticated;
grant execute on function public.shop_public_outfits(uuid[]) to authenticated;
grant execute on function public.shop_titles() to authenticated;
