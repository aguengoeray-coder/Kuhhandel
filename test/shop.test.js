import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SHOP_AVATARS, shopAvatar, shopAvatarFull, SHOP_AVATAR_FULL_CSS } from '../js/shopavatars.js';
import { SHOP_SAYINGS, renderShop } from '../js/shop.js';

test('Shop enthält 14 eindeutige Avatare (11 + 3 Kult) mit den vereinbarten Preisen', () => {
  assert.equal(SHOP_AVATARS.length, 14);
  assert.equal(new Set(SHOP_AVATARS.map((item) => item.id)).size, 14);
  for (const item of SHOP_AVATARS) {
    assert.ok(item.id && item.name);
    assert.ok(['selten', 'episch', 'legendaer', 'kult'].includes(item.tier));
    assert.equal(item.price, { selten: 30, episch: 40, legendaer: 60, kult: 50 }[item.tier]);
  }
});

test('Jeder Shop-Avatar rendert eigenständiges SVG-Markup', () => {
  for (const item of SHOP_AVATARS) {
    const html = shopAvatar(item.id);
    assert.match(html, /<svg\b/);
    assert.match(html, new RegExp('data-avatar="' + item.id + '"'));
  }
});

test('Shop-Sprüche entsprechen exakt dem freigegebenen Katalog und den Preisen', () => {
  assert.deepEqual(SHOP_SAYINGS.map(({text,price})=>[text,price]), [
    ['👍👍',10],
    ['Passt schon, passt schon!',10],
    ['BLABLABLABLA!!',10],
    ['Nico, schrei nicht!',10],
    ['Das ist eine gute Idee!',10],
    ['IHH, du Ekliger!',10],
    ['Bastard',10],
    ['Ich habe nur gute Ideen',20]
  ]);
  assert.equal(new Set(SHOP_SAYINGS.map((item) => item.id)).size, 8);
});

test('Shop-Modul exportiert den vereinbarten renderShop-Einstieg', () => {
  assert.equal(typeof renderShop, 'function');
});


test('Shop-Demo verwendet die echten Artikel-IDs und Preise statt einer veralteten Kopie', () => {
  const demo = readFileSync(new URL('../shop-demo.html', import.meta.url), 'utf8');
  assert.ok(demo.includes("import { renderShop, SHOP_SAYINGS } from './js/shop.js';"));
  assert.ok(demo.includes("import { SHOP_AVATARS } from './js/shopavatars.js';"));
  assert.ok(demo.includes('Object.fromEntries([...SHOP_AVATARS,...SHOP_SAYINGS]'));
  assert.match(demo, /spruch-nico/);
  assert.match(demo, /spruch-gute-ideen/);
});

test('Shop-SQL beschränkt Schreib-RPCs auf angemeldete Nutzer', () => {
  const sql = readFileSync(new URL('../supabase/v0.48-shop.sql', import.meta.url), 'utf8');
  assert.ok(sql.includes('revoke all on function public.record_results(uuid, jsonb) from public, anon, authenticated;'));
  assert.ok(sql.includes('grant execute on function public.record_results(uuid, jsonb) to authenticated;'));
  assert.ok(sql.includes('revoke all on function public.shop_credit_game_winners(uuid) from public, anon, authenticated;'));
});

test('Datenbank-Preisliste kennt jeden Shop-Artikel mit demselben Preis wie die App', () => {
  const sql = readFileSync(new URL('../supabase/v0.48-shop.sql', import.meta.url), 'utf8') + readFileSync(new URL('../supabase/v0.49-kult-avatare.sql', import.meta.url), 'utf8');
  for (const item of [...SHOP_AVATARS, ...SHOP_SAYINGS]) assert.ok(sql.includes(`when '${item.id}' then ${item.price}`), `${item.id} fehlt oder falscher Preis in der SQL`);
  for (const item of SHOP_AVATARS) assert.ok(sql.includes(`'${item.id}'`), `${item.id} fehlt in shop_set_avatar`);
});

test('Jeder Avatar hat einen ganzen Körper (Shop + Startseite) mit Kopf, Körper und Bewegung', () => {
  for (const item of SHOP_AVATARS) {
    const html = shopAvatarFull(item.id);
    assert.match(html, /viewBox="0 0 120 200"/, item.id);
    assert.match(html, /class="sa-body"[^>]*>\s*\S/, `${item.id}: Körper fehlt`);
    assert.match(html, /class="sa-head"/, item.id);
    assert.match(html, new RegExp(`data-motion="${item.motion}"`), item.id);
  }
  assert.match(SHOP_AVATAR_FULL_CSS, /\.shop-avatar-full \.sa-low\{display:none\}/);
  assert.equal(shopAvatarFull('gibt-es-nicht'), '');
});
