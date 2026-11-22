-- v0.92 Neue Kisten-Teile: Untergründe im Fach „Beine“ (Alps Go 22.11.2026 10:19)
-- Rückweg: delete from public.shop_box_pool where item_id in ('beine:rollschuhe','beine:stelzen','beine:skateboard','beine:traktor','beine:wolke');
insert into public.shop_box_pool (item_id, rarity) values
  ('beine:rollschuhe', 'gewoehnlich'),
  ('beine:stelzen', 'gewoehnlich'),
  ('beine:skateboard', 'selten'),
  ('beine:traktor', 'episch'),
  ('beine:wolke', 'legendaer')
on conflict (item_id) do update set rarity = excluded.rarity;
