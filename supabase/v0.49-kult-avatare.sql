-- v0.49 Kult-Avatare: Der verletzte Bennet, Der schreiende Nico, Der quasselnde Alp (je 50 Dublonen)
-- Ersetzt nur die beiden Funktionen shop_buy und shop_set_avatar (neue Preisliste). Keine Daten werden verändert.

-- 3. Serverseitiger Festpreis, Sperre des Wallets und atomarer Kauf.
create or replace function public.shop_buy(p_item_id text)
returns table (new_balance integer, item_id text)
language plpgsql security definer set search_path = public
as $$
declare v_price integer; v_balance integer;
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  v_price := case p_item_id
    when 'noergler' then 30 when 'opa-ratte' then 30
    when 'business-huhn' then 30 when 'spar-schwein' then 30
    when 'boersen-gauner' then 40 when 'disco-kuh' then 40
    when 'raketen-esel' then 40 when 'piraten-papagei' then 40
    when 'daemonenritter' then 60 when 'cyborg-hahn' then 60
    when 'kuh-kaiser' then 60
    when 'bennet-verletzt' then 50 when 'nico-schreit' then 50
    when 'alp-quasselt' then 50
    when 'spruch-daumen' then 10 when 'spruch-passt-schon' then 10
    when 'spruch-blablabla' then 10 when 'spruch-nico' then 10
    when 'spruch-gute-idee' then 10 when 'spruch-ihh' then 10
    when 'spruch-bastard' then 10 when 'spruch-gute-ideen' then 20
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
  if p_avatar_id not in ('noergler','opa-ratte','business-huhn','spar-schwein',
    'boersen-gauner','disco-kuh','raketen-esel','piraten-papagei',
    'daemonenritter','cyborg-hahn','kuh-kaiser',
    'bennet-verletzt','nico-schreit','alp-quasselt') then
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

-- Ende v0.49 Kult-Avatare.
