-- 22.11.2026 16:14: Alp wünscht 700–800 Dublonen zum Testen der Kuh-Kiste → +800 für sein Admin-Konto
-- Rückweg: update public.shop_wallets set balance = greatest(0, balance - 800), updated_at = now() where user_id = '6110143b-9762-4ccc-8774-8990672b44dc';
update public.shop_wallets set balance = balance + 800, updated_at = now() where user_id = '6110143b-9762-4ccc-8774-8990672b44dc';
