-- v1.0 Schmiede: 2 Gegenstände gleicher Seltenheit → 1 zufälliger Gegenstand der nächsten Seltenheit (Alp 22.11.2026 20:17)
-- Gewöhnlich (grau) → Selten (blau) → Episch (lila) → Legendär (gold). Nur Fach „Gegenstand“ (ding:…), Legendär lässt sich nicht weiter schmieden.
-- Rückweg: drop function if exists public.shop_combine(text, text);
create or replace function public.shop_combine(p_a text, p_b text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid(); ra text; rb text; v_next text; v_item text; v_dupe boolean; v_left int; x text;
begin
  if v_uid is null then raise exception 'Bitte anmelden'; end if;
  if p_a is null or p_b is null or p_a not like 'ding:%' or p_b not like 'ding:%' then raise exception 'Nur Gegenstände lassen sich schmieden'; end if;
  select rarity into ra from public.shop_box_pool where item_id = p_a;
  select rarity into rb from public.shop_box_pool where item_id = p_b;
  if ra is null or rb is null or ra <> rb then raise exception 'Beide Gegenstände brauchen dieselbe Seltenheit'; end if;
  v_next := case ra when 'gewoehnlich' then 'selten' when 'selten' then 'episch' when 'episch' then 'legendaer' else null end;
  if v_next is null then raise exception 'Legendär ist schon die höchste Stufe'; end if;
  -- Besitz prüfen (gleiches Teil zweimal → mindestens 2 Stück)
  perform 1 from public.shop_inventory where user_id = v_uid and item_id in (p_a, p_b) for update;
  if p_a = p_b then
    if coalesce((select n from public.shop_inventory where user_id = v_uid and item_id = p_a), 0) < 2 then raise exception 'Dafür brauchst du das Teil zweimal'; end if;
  elsif not exists (select 1 from public.shop_inventory where user_id = v_uid and item_id = p_a) or not exists (select 1 from public.shop_inventory where user_id = v_uid and item_id = p_b) then
    raise exception 'Das Teil hast du nicht';
  end if;
  -- verbrauchen; ganz weg → auch aus dem Outfit nehmen
  foreach x in array array[p_a, p_b] loop
    update public.shop_inventory set n = n - 1 where user_id = v_uid and item_id = x returning n into v_left;
    if v_left <= 0 then
      delete from public.shop_inventory where user_id = v_uid and item_id = x;
      update public.shop_wallets set outfit = outfit - 'ding' where user_id = v_uid and outfit ->> 'ding' = x;
    end if;
  end loop;
  select item_id into v_item from public.shop_box_pool where rarity = v_next and item_id like 'ding:%'
    and (nur_monat is null or nur_monat = extract(month from now() at time zone 'Europe/Berlin')::int) order by random() limit 1;
  v_dupe := exists (select 1 from public.shop_inventory where user_id = v_uid and item_id = v_item);
  insert into public.shop_inventory (user_id, item_id) values (v_uid, v_item)
    on conflict (user_id, item_id) do update set n = public.shop_inventory.n + 1;
  insert into public.shop_box_log (user_id, item_id, rarity, dupe, refund) values (v_uid, v_item, v_next, v_dupe, 0);
  return jsonb_build_object('item', v_item, 'rarity', v_next, 'dupe', v_dupe, 'used', jsonb_build_array(p_a, p_b));
end $$;
revoke all on function public.shop_combine(text, text) from public, anon;
grant execute on function public.shop_combine(text, text) to authenticated;
