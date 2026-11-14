-- ============================================================================
-- v0.63 Shop: Eigener Spruch (50 Dublonen) – Alps Wunsch 14.11.2026
-- ============================================================================
-- 1. Preisliste shop_buy + 'spruch-eigener' (sonst wie v0.61)
-- 2. Tabelle shop_custom_sayings: ein selbst gewählter Spruch pro Spieler (1–40 Zeichen, eine Zeile)
--    Zugriff nur über die zwei Funktionen unten (keine direkten Rechte).
-- 3. shop_set_custom_saying(text): nur wer den Spruch gekauft hat; Text wird gekürzt/geprüft
-- 4. shop_public_sayings(ids): Mitspieler lesen die Sprüche der Leute an ihrem Tisch (wie shop_public_avatars)
-- Löscht/ändert keine bestehenden Daten. Idempotent.
-- Rückweg: drop function public.shop_set_custom_saying(text); drop function public.shop_public_sayings(uuid[]);
--          drop table public.shop_custom_sayings;  + supabase/v0.61-emote-pruegel.sql erneut (Preisliste)
-- ============================================================================

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
    when 'emote-pruegel' then 100
    when 'spruch-eigener' then 50
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

create table if not exists public.shop_custom_sayings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 40 and text !~ '[\r\n]'),
  updated_at timestamptz not null default now()
);
alter table public.shop_custom_sayings enable row level security;
revoke all on public.shop_custom_sayings from public, anon, authenticated;

create or replace function public.shop_set_custom_saying(p_text text)
returns text language plpgsql security definer set search_path = public
as $$
declare v text;
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  if not exists (select 1 from public.shop_purchases where user_id = auth.uid() and item_id = 'spruch-eigener') then
    raise exception 'Den eigenen Spruch gibt es im Shop';
  end if;
  v := btrim(regexp_replace(coalesce(p_text, ''), '\s+', ' ', 'g'));
  if char_length(v) < 1 then raise exception 'Bitte einen Spruch eingeben'; end if;
  if char_length(v) > 40 then raise exception 'Höchstens 40 Zeichen'; end if;
  insert into public.shop_custom_sayings (user_id, text, updated_at) values (auth.uid(), v, now())
  on conflict (user_id) do update set text = excluded.text, updated_at = now();
  return v;
end $$;
revoke all on function public.shop_set_custom_saying(text) from public, anon;
grant execute on function public.shop_set_custom_saying(text) to authenticated;

create or replace function public.shop_public_sayings(p_ids uuid[])
returns table (user_id uuid, text text)
language sql stable security definer set search_path = public
as $$ select c.user_id, c.text from public.shop_custom_sayings c where c.user_id = any(p_ids) limit 50; $$;
revoke all on function public.shop_public_sayings(uuid[]) from public, anon;
grant execute on function public.shop_public_sayings(uuid[]) to authenticated;

-- Prüfung:
-- select position('spruch-eigener' in prosrc) > 0 from pg_proc where proname = 'shop_buy';
-- select count(*) from pg_proc where proname in ('shop_set_custom_saying', 'shop_public_sayings');  -- 2
