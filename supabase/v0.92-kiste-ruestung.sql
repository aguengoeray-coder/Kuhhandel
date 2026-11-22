-- v0.92 Kuh-Kiste: Waffen-Stufen + Rüstungs-Sets (Alps Go 22.11.2026 10:19)
-- Weihnachtsmann-Set nur im Dezember (Spalte nur_monat, Zeit Europe/Berlin).
-- Rückweg:
--   delete from public.shop_box_pool where item_id in ('ding:holzschwert','ding:eisenschwert','ding:lanze','ding:kristallschwert','ding:katana','ding:flammenschwert',
--     'kopf:ritter','brust:ritter','beine:ritter','kopf:samurai','brust:samurai','beine:samurai','kopf:astronaut','kopf:weihnachtsmann','brust:weihnachtsmann','beine:weihnachtsmann');
--   shop_open_box aus supabase/v0.91-kuhkiste.sql neu einspielen; alter table public.shop_box_pool drop column if exists nur_monat;
-- (Gezogene Teile bleiben im Inventar – Löschen nur mit Alp.)

alter table public.shop_box_pool add column if not exists nur_monat smallint check (nur_monat between 1 and 12);

insert into public.shop_box_pool (item_id, rarity) values
  ('ding:holzschwert', 'gewoehnlich'),
  ('ding:eisenschwert', 'selten'),
  ('ding:lanze', 'selten'),
  ('ding:kristallschwert', 'episch'),
  ('ding:katana', 'episch'),
  ('ding:flammenschwert', 'legendaer'),
  ('kopf:ritter', 'selten'),
  ('brust:ritter', 'selten'),
  ('beine:ritter', 'selten'),
  ('kopf:samurai', 'episch'),
  ('brust:samurai', 'episch'),
  ('beine:samurai', 'episch'),
  ('kopf:astronaut', 'legendaer'),
  ('kopf:weihnachtsmann', 'episch'),
  ('brust:weihnachtsmann', 'episch'),
  ('beine:weihnachtsmann', 'episch')
on conflict (item_id) do update set rarity = excluded.rarity;

update public.shop_box_pool set nur_monat = 12 where item_id in ('kopf:weihnachtsmann','brust:weihnachtsmann','beine:weihnachtsmann');

-- Kiste öffnen (v0.92: Saison-Teile nur in ihrem Monat)
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
  select item_id into v_item from public.shop_box_pool where rarity = v_rar
    and (nur_monat is null or nur_monat = extract(month from now() at time zone 'Europe/Berlin')::int) order by random() limit 1;
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
