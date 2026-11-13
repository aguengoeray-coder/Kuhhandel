-- v0.58 Neue Charaktere + Sprüche: 9 Avatare (Kult: Mr. Passt Schon · Legendär: Die dumme Kuh · Selten: Mama Sports,
-- Dickes Huhn, Bontje Lebkuchen, Die schmatzenden Zwillinge, Nacht-Gohan, Der schielende Mogli, Der dicke Gojo) + 7 Sprüche.
-- Ersetzt shop_buy (Preisliste) und shop_set_avatar (erlaubte Avatare), neu: shop_claim_free (2 Sprüche gratis).
-- Keine Daten werden verändert (nur die Preis-Prüfung erlaubt jetzt 0 für Gratis-Sprüche).
-- Preisliste wird aus js/shopavatars.js + js/shop.js erzeugt; test/shop.test.js prüft, dass beides übereinstimmt.
-- Rückweg: supabase/v0.49-kult-avatare.sql erneut ausführen + drop function public.shop_claim_free(text);

-- 3. Serverseitiger Festpreis, Sperre des Wallets und atomarer Kauf.
create or replace function public.shop_buy(p_item_id text)
returns table (new_balance integer, item_id text)
language plpgsql security definer set search_path = public
as $$
declare v_price integer; v_balance integer;
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  v_price := case p_item_id
    when 'noergler' then 30
    when 'opa-ratte' then 30
    when 'business-huhn' then 30
    when 'spar-schwein' then 30
    when 'boersen-gauner' then 40
    when 'disco-kuh' then 40
    when 'raketen-esel' then 40
    when 'piraten-papagei' then 40
    when 'daemonenritter' then 60
    when 'cyborg-hahn' then 60
    when 'kuh-kaiser' then 60
    when 'bennet-verletzt' then 50
    when 'nico-schreit' then 50
    when 'alp-quasselt' then 50
    when 'mr-passt-schon' then 50
    when 'mama-sports' then 30
    when 'dumme-kuh' then 60
    when 'dickes-huhn' then 30
    when 'bontje-lebkuchen' then 30
    when 'schmatz-zwillinge' then 30
    when 'nacht-gohan' then 30
    when 'mogli-schielt' then 30
    when 'dicker-gojo' then 30
    when 'spruch-daumen' then 10
    when 'spruch-passt-schon' then 10
    when 'spruch-blablabla' then 10
    when 'spruch-nico' then 10
    when 'spruch-gute-idee' then 10
    when 'spruch-ihh' then 10
    when 'spruch-bastard' then 10
    when 'spruch-gute-ideen' then 20
    when 'spruch-dickes-huhn' then 10
    when 'spruch-dumme-kuh' then 10
    when 'spruch-hunger' then 10
    when 'spruch-bau-mal' then 10
    when 'spruch-kurzer' then 10
    when 'spruch-schmatz' then 10
    when 'spruch-how-old' then 10
    else null end;
  if v_price is null then raise exception 'Unbekannter Shop-Artikel'; end if;

  insert into public.shop_wallets (user_id, balance)
  values (auth.uid(), 0) on conflict (user_id) do nothing;
  select w.balance into v_balance from public.shop_wallets w
   where w.user_id = auth.uid() for update;
  if exists (select 1 from public.shop_purchases p
             where p.user_id = auth.uid() and p.item_id = p_item_id) then
    raise exception 'Diesen Artikel hast du bereits';
  end if;
  if v_balance < v_price then raise exception 'Nicht genügend Dublonen'; end if;

  insert into public.shop_purchases (user_id, item_id, price)
  values (auth.uid(), p_item_id, v_price);
  update public.shop_wallets
     set balance = balance - v_price, updated_at = now()
   where user_id = auth.uid() returning balance into v_balance;
  return query select v_balance, p_item_id;
end $$;
revoke all on function public.shop_buy(text) from public, anon;
grant execute on function public.shop_buy(text) to authenticated;

-- 4. Nur gekaufte Avatare aktivieren.
create or replace function public.shop_set_avatar(p_avatar_id text)
returns text language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  if p_avatar_id not in ('noergler','opa-ratte','business-huhn','spar-schwein','boersen-gauner','disco-kuh','raketen-esel','piraten-papagei','daemonenritter','cyborg-hahn','kuh-kaiser','bennet-verletzt','nico-schreit','alp-quasselt','mr-passt-schon','mama-sports','dumme-kuh','dickes-huhn','bontje-lebkuchen','schmatz-zwillinge','nacht-gohan','mogli-schielt','dicker-gojo') then
    raise exception 'Ungültiger Avatar';
  end if;
  if not exists (select 1 from public.shop_purchases
    where user_id = auth.uid() and item_id = p_avatar_id) then
    raise exception 'Diesen Avatar hast du nicht gekauft';
  end if;
  update public.shop_wallets set active_avatar = p_avatar_id, updated_at = now()
   where user_id = auth.uid();
  return p_avatar_id;
end $$;
revoke all on function public.shop_set_avatar(text) from public, anon;
grant execute on function public.shop_set_avatar(text) to authenticated;

-- 5. Zwei Sprüche gratis für jeden (Preis 0, nur Sprüche, höchstens 2 pro Konto)
alter table public.shop_purchases drop constraint if exists shop_purchases_price_check;
alter table public.shop_purchases add constraint shop_purchases_price_check check (price >= 0);

create or replace function public.shop_claim_free(p_item_id text)
returns text language plpgsql security definer set search_path = public
as $$
declare v_used int;
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  if p_item_id not like 'spruch-%' then raise exception 'Gratis gibt es nur Sprüche'; end if;
  -- muss ein echter Shop-Spruch sein (Preisliste aus shop_buy)
  if p_item_id not in ('spruch-daumen','spruch-passt-schon','spruch-blablabla','spruch-nico','spruch-gute-idee','spruch-ihh','spruch-bastard','spruch-gute-ideen','spruch-dickes-huhn','spruch-dumme-kuh','spruch-hunger','spruch-bau-mal','spruch-kurzer','spruch-schmatz','spruch-how-old') then raise exception 'Unbekannter Spruch'; end if;
  insert into public.shop_wallets (user_id, balance) values (auth.uid(), 0) on conflict (user_id) do nothing;
  perform 1 from public.shop_wallets where user_id = auth.uid() for update; -- gleichzeitiges Doppeltippen sperren
  select count(*) into v_used from public.shop_purchases where user_id = auth.uid() and price = 0;
  if v_used >= 2 then raise exception 'Deine zwei Gratis-Sprüche hast du schon'; end if;
  if exists (select 1 from public.shop_purchases where user_id = auth.uid() and item_id = p_item_id) then
    raise exception 'Diesen Spruch hast du bereits';
  end if;
  insert into public.shop_purchases (user_id, item_id, price) values (auth.uid(), p_item_id, 0);
  return p_item_id;
end $$;
revoke all on function public.shop_claim_free(text) from public, anon;
grant execute on function public.shop_claim_free(text) to authenticated;

-- Ende v0.58 neue Charaktere.
