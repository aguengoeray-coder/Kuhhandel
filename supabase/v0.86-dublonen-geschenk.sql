-- v0.86 Geschenk (Alp, 21.11.2026 19:25): jedes echte Konto (mit Namen, ohne anonyme Testkonten) bekommt +100 Dublonen.
-- Einmalig ausführen. Rückweg: update public.shop_wallets w set balance = greatest(0, balance - 100), updated_at = now()
--   from public.profiles p where p.id = w.user_id and p.name is not null;
update public.shop_wallets w
   set balance = balance + 100, updated_at = now()
  from public.profiles p
 where p.id = w.user_id and p.name is not null;
