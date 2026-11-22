-- v0.95 Outfit-Speicher im Konto (3 Plätze) statt nur auf dem Gerät (Alps Go 22.11.2026 14:28)
-- Rückweg: drop function if exists public.shop_set_presets(jsonb); alter table public.shop_wallets drop column if exists outfit_presets;
alter table public.shop_wallets add column if not exists outfit_presets jsonb not null default '[]'::jsonb;

create or replace function public.shop_set_presets(p_presets jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_uid uuid := auth.uid(); e jsonb;
begin
  if v_uid is null then raise exception 'Bitte anmelden'; end if;
  if jsonb_typeof(p_presets) <> 'array' or jsonb_array_length(p_presets) > 3 or length(p_presets::text) > 2000 then raise exception 'Ungültige Outfits'; end if;
  for e in select * from jsonb_array_elements(p_presets) loop
    if jsonb_typeof(e) not in ('object', 'null') then raise exception 'Ungültige Outfits'; end if;
  end loop;
  update public.shop_wallets set outfit_presets = p_presets, updated_at = now() where user_id = v_uid;
  return p_presets;
end $$;
revoke all on function public.shop_set_presets(jsonb) from public, anon;
grant execute on function public.shop_set_presets(jsonb) to authenticated;
