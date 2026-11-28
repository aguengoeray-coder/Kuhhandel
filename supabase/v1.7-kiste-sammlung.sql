-- v1.7 (Alp 28.11.2026 18:45): 8 neue Köpfe, Sammelbuch mit Belohnungen, Doppelte an Freunde verschenken
-- Rückweg: drop function if exists public.shop_claim_book(int), public.shop_gift_item(uuid, text);
--   alter table public.shop_box_state drop column if exists book_claimed;
--   delete from public.shop_box_pool where item_id in ('kopf:cowboyhut','kopf:kochmuetze','kopf:taucherbrille','kopf:partyhut','kopf:wikinger','kopf:krone','kopf:heiligenschein','kopf:hoerner');
insert into public.shop_box_pool (item_id, rarity) values
  ('kopf:cowboyhut', 'gewoehnlich'),
  ('kopf:kochmuetze', 'gewoehnlich'),
  ('kopf:taucherbrille', 'selten'),
  ('kopf:partyhut', 'selten'),
  ('kopf:wikinger', 'episch'),
  ('kopf:krone', 'episch'),
  ('kopf:heiligenschein', 'legendaer'),
  ('kopf:hoerner', 'legendaer')
on conflict (item_id) do update set rarity = excluded.rarity;

alter table public.shop_box_state add column if not exists book_claimed int[] not null default '{}';

-- Sammelbuch: Anteil verschiedener Kisten-Teile (ohne Saison-Teile außerhalb ihres Monats zählt trotzdem der ganze Pool)
-- Stufen: 25 % → 3 Gratis-Kisten, 50 % → 250 Dublonen, 75 % → 10 Gratis-Kisten, 100 % → 1000 Dublonen (je einmal)
create or replace function public.shop_claim_book(p_level int)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_uid uuid := auth.uid(); v_have int; v_all int; v_dub int := 0; v_box int := 0; st public.shop_box_state;
begin
  if v_uid is null then raise exception 'Bitte anmelden'; end if;
  if p_level not in (25, 50, 75, 100) then raise exception 'Unbekannte Stufe'; end if;
  insert into public.shop_box_state (user_id) values (v_uid) on conflict (user_id) do nothing;
  select * into st from public.shop_box_state where user_id = v_uid for update;
  if p_level = any(st.book_claimed) then raise exception 'Schon abgeholt'; end if;
  select count(*) into v_all from public.shop_box_pool;
  select count(*) into v_have from public.shop_inventory i where i.user_id = v_uid and exists (select 1 from public.shop_box_pool b where b.item_id = i.item_id);
  if v_have * 100 < p_level * v_all then raise exception 'Noch nicht genug gesammelt (% von %)', v_have, v_all; end if;
  case p_level when 25 then v_box := 3; when 50 then v_dub := 250; when 75 then v_box := 10; else v_dub := 1000; end case;
  update public.shop_box_state set book_claimed = book_claimed || p_level where user_id = v_uid;
  insert into public.shop_wallets (user_id, balance, free_boxes) values (v_uid, v_dub, v_box)
    on conflict (user_id) do update set balance = public.shop_wallets.balance + v_dub, free_boxes = public.shop_wallets.free_boxes + v_box, updated_at = now();
  return jsonb_build_object('level', p_level, 'dublonen', v_dub, 'boxes', v_box, 'have', v_have, 'all', v_all);
end $$;

-- Doppeltes Teil an einen Freund verschenken (nur wenn man es mindestens zweimal hat – das eigene bleibt)
create or replace function public.shop_gift_item(p_to uuid, p_item text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_uid uuid := auth.uid(); v_n int; v_name text;
begin
  if v_uid is null then raise exception 'Bitte anmelden'; end if;
  if p_to is null or p_to = v_uid then raise exception 'Such dir einen Mitspieler aus'; end if;
  select name into v_name from public.profiles where id = p_to;
  if v_name is null then raise exception 'Spieler nicht gefunden'; end if;
  select n into v_n from public.shop_inventory where user_id = v_uid and item_id = p_item for update;
  if coalesce(v_n, 0) < 2 then raise exception 'Verschenken geht nur mit Doppelten'; end if;
  update public.shop_inventory set n = n - 1 where user_id = v_uid and item_id = p_item;
  insert into public.shop_inventory (user_id, item_id) values (p_to, p_item) on conflict (user_id, item_id) do update set n = public.shop_inventory.n + 1;
  return jsonb_build_object('to', v_name, 'item', p_item, 'left', v_n - 1);
end $$;

revoke all on function public.shop_claim_book(int), public.shop_gift_item(uuid, text) from public, anon;
grant execute on function public.shop_claim_book(int), public.shop_gift_item(uuid, text) to authenticated;
