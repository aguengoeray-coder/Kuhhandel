-- v1.6 (Alp 28.11.2026 17:06): 6 neue Beinteile für die Kuh-Kiste
-- Rückweg: delete from public.shop_box_pool where item_id in ('beine:gummistiefel','beine:cowboy','beine:hoverboard','beine:moonboots','beine:jetpack','beine:lavastiefel');
insert into public.shop_box_pool (item_id, rarity) values
  ('beine:gummistiefel', 'gewoehnlich'),
  ('beine:cowboy', 'selten'),
  ('beine:hoverboard', 'episch'),
  ('beine:moonboots', 'episch'),
  ('beine:jetpack', 'legendaer'),
  ('beine:lavastiefel', 'legendaer')
on conflict (item_id) do update set rarity = excluded.rarity;
