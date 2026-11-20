-- v0.80 „Mein Profil“: Shop-Figur wieder ablegen (zurück zum Gratis-Tier)
-- shop_set_avatar(null) setzt active_avatar = null. Sonst unverändert gegenüber v0.58-neue-charaktere.sql.
-- Rückweg: v0.58-neue-charaktere.sql, Abschnitt shop_set_avatar, erneut ausführen.
create or replace function public.shop_set_avatar(p_avatar_id text)
returns text language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  if p_avatar_id is null then
    update public.shop_wallets set active_avatar = null, updated_at = now()
     where user_id = auth.uid();
    return null;
  end if;
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
