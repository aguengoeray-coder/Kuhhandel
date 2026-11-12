import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SHOP_AVATARS, shopAvatar } from '../js/shopavatars.js';
import { SHOP_SAYINGS, renderShop } from '../js/shop.js';

test('Shop enthält elf eindeutige Avatare mit den vereinbarten Preisen', () => {
  assert.equal(SHOP_AVATARS.length, 11);
  assert.equal(new Set(SHOP_AVATARS.map((item) => item.id)).size, 11);
  for (const item of SHOP_AVATARS) {
    assert.ok(item.id && item.name);
    assert.ok(['selten', 'episch', 'legendaer'].includes(item.tier));
    assert.equal(item.price, item.tier === 'selten' ? 30 : item.tier === 'episch' ? 40 : 60);
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
  assert.match(sql, /revoke all on function public\\.record_results\\(uuid, jsonb\\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\\.record_results\\(uuid, jsonb\\) to authenticated/i);
  assert.match(sql, /revoke all on function public\\.shop_credit_game_winners\\(uuid\\) from public, anon, authenticated/i);
});
