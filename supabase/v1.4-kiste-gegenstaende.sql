-- v1.4 (Alp 28.11.2026 13:57): 16 neue Gegenstände (je 4 pro Seltenheit) + Stufe „Mythisch“ (bunt):
-- nur aus der Schmiede, wenn man zweimal DENSELBEN legendären Gegenstand kombiniert. Mythisch ist nicht in der Kiste.
-- Rückweg: delete from public.shop_box_pool where item_id in (…16 neue…); shop_combine aus v1.0-schmiede.sql neu einspielen.
insert into public.shop_box_pool (item_id, rarity) values
  ('ding:fliegenklatsche', 'gewoehnlich'),
  ('ding:kochloeffel', 'gewoehnlich'),
  ('ding:regenschirm', 'gewoehnlich'),
  ('ding:baguette', 'gewoehnlich'),
  ('ding:trompete', 'selten'),
  ('ding:zauberstab', 'selten'),
  ('ding:steinschleuder', 'selten'),
  ('ding:fernrohr', 'selten'),
  ('ding:dreizack', 'episch'),
  ('ding:egitarre', 'episch'),
  ('ding:lasersaebel', 'episch'),
  ('ding:bumerang', 'episch'),
  ('ding:koenigszepter', 'legendaer'),
  ('ding:drachenaxt', 'legendaer'),
  ('ding:sternenbogen', 'legendaer'),
  ('ding:sense', 'legendaer')
on conflict (item_id) do update set rarity = excluded.rarity;

create or replace function public.shop_combine(p_a text, p_b text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid(); ra text; rb text; v_next text; v_item text; v_dupe boolean; v_left int; x text;
  v_mythic text[] := array['ding:regenbogenklinge','ding:kosmoshammer','ding:einhornlanze']; -- = Mythisch in js/outfits.js (Test prüft)
begin
  if v_uid is null then raise exception 'Bitte anmelden'; end if;
  if p_a is null or p_b is null or p_a not like 'ding:%' or p_b not like 'ding:%' then raise exception 'Nur Gegenstände lassen sich schmieden'; end if;
  select rarity into ra from public.shop_box_pool where item_id = p_a;
  select rarity into rb from public.shop_box_pool where item_id = p_b;
  if ra is null or rb is null or ra <> rb then raise exception 'Beide Gegenstände brauchen dieselbe Seltenheit'; end if;
  v_next := case ra when 'gewoehnlich' then 'selten' when 'selten' then 'episch' when 'episch' then 'legendaer' when 'legendaer' then 'mythisch' else null end;
  if v_next is null then raise exception 'Höher geht es nicht'; end if;
  if v_next = 'mythisch' and p_a <> p_b then raise exception 'Für Mythisch brauchst du zweimal denselben legendären Gegenstand'; end if;
  perform 1 from public.shop_inventory where user_id = v_uid and item_id in (p_a, p_b) for update;
  if p_a = p_b then
    if coalesce((select n from public.shop_inventory where user_id = v_uid and item_id = p_a), 0) < 2 then raise exception 'Dafür brauchst du das Teil zweimal'; end if;
  elsif not exists (select 1 from public.shop_inventory where user_id = v_uid and item_id = p_a) or not exists (select 1 from public.shop_inventory where user_id = v_uid and item_id = p_b) then
    raise exception 'Das Teil hast du nicht';
  end if;
  foreach x in array array[p_a, p_b] loop
    update public.shop_inventory set n = n - 1 where user_id = v_uid and item_id = x returning n into v_left;
    if v_left <= 0 then
      delete from public.shop_inventory where user_id = v_uid and item_id = x;
      update public.shop_wallets set outfit = outfit - 'ding' where user_id = v_uid and outfit ->> 'ding' = x;
    end if;
  end loop;
  if v_next = 'mythisch' then
    v_item := v_mythic[1 + floor(random() * array_length(v_mythic, 1))::int];
  else
    select item_id into v_item from public.shop_box_pool where rarity = v_next and item_id like 'ding:%'
      and (nur_monat is null or nur_monat = extract(month from now() at time zone 'Europe/Berlin')::int) order by random() limit 1;
  end if;
  v_dupe := exists (select 1 from public.shop_inventory where user_id = v_uid and item_id = v_item);
  insert into public.shop_inventory (user_id, item_id) values (v_uid, v_item)
    on conflict (user_id, item_id) do update set n = public.shop_inventory.n + 1;
  insert into public.shop_box_log (user_id, item_id, rarity, dupe, refund) values (v_uid, v_item, case when v_next = 'mythisch' then 'legendaer' else v_next end, v_dupe, 0);
  return jsonb_build_object('item', v_item, 'rarity', v_next, 'dupe', v_dupe, 'used', jsonb_build_array(p_a, p_b));
end $$;
revoke all on function public.shop_combine(text, text) from public, anon;
grant execute on function public.shop_combine(text, text) to authenticated;
