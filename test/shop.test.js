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
    assert.match(html, /<svg\b/);
    assert.match(html, new RegExp('data-avatar="' + item.id + '"'));
  }
});

test('Shop-Sprüche und Preise entsprechen dem vereinbarten Katalog', () => {
  assert.equal(SHOP_SAYINGS.length, 8);
  assert.equal(SHOP_SAYINGS.filter((item) => item.price === 10).length, 7);
  assert.equal(SHOP_SAYINGS.find((item) => item.id === 'spruch-gute-ideen')?.price, 20);
  assert.equal(new Set(SHOP_SAYINGS.map((item) => item.id)).size, 8);
});

test('Shop-Modul exportiert den vereinbarten renderShop-Einstieg', () => {
  assert.equal(typeof renderShop, 'function');
});
