-- v1.0.1 Zwei legendäre Sets (Alp 22.11.2026 21:00): Goldene Kuh (Kopf goldkuh + Brust goldruestung schon im Pool, neu: Goldene Hufe) und Pharao
-- Rückweg: delete from public.shop_box_pool where item_id in ('beine:goldhufe','kopf:pharao','brust:pharao','beine:pharao');
insert into public.shop_box_pool (item_id, rarity) values
  ('beine:goldhufe', 'legendaer'),
  ('kopf:pharao', 'legendaer'),
  ('brust:pharao', 'legendaer'),
  ('beine:pharao', 'legendaer')
on conflict (item_id) do update set rarity = excluded.rarity;
