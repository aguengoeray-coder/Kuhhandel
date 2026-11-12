import test from 'node:test';
import assert from 'node:assert/strict';
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
    assert.match(html, /<svg\\b/);
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
