import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SHOP_AVATARS, shopAvatar, shopAvatarFull, SHOP_AVATAR_FULL_CSS } from '../js/shopavatars.js';
import { SHOP_SAYINGS, SHOP_EMOTES, renderShop } from '../js/shop.js';

test('Shop enthält 23 eindeutige Avatare mit den vereinbarten Preisen', () => {
  assert.equal(SHOP_AVATARS.length, 23);
  assert.equal(new Set(SHOP_AVATARS.map((item) => item.id)).size, 23);
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
    ['Ich habe nur gute Ideen',20],
    ['Ich bin das dicke Huhn und gehe heute schwimmen',10],
    ['Hey, du bist eine dumme Kuh!',10],
    ['Ich habe Hunger',10],
    ['Bau mal einen',10],
    ['Lass uns auf einen Kurzen zu den ukrainischen Nachbarn',10],
    ['Schmatz nicht!!',10],
    ['Can I ask you by any chance how old you are? 📱',10]
  ]);
  assert.equal(new Set(SHOP_SAYINGS.map((item) => item.id)).size, 15);
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
  const sql = readFileSync(new URL('../supabase/v0.48-shop.sql', import.meta.url), 'utf8') + readFileSync(new URL('../supabase/v0.58-neue-charaktere.sql', import.meta.url), 'utf8') + readFileSync(new URL('../supabase/v0.61-emote-pruegel.sql', import.meta.url), 'utf8');
  for (const item of [...SHOP_AVATARS, ...SHOP_SAYINGS, ...SHOP_EMOTES]) assert.ok(sql.includes(`when '${item.id}' then ${item.price}`), `${item.id} fehlt oder falscher Preis in der SQL`);
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

test('v0.55 Dublonen-SQL: Wächter, Revanche per RPC, Beträge und Tagesgrenze passen zur App', () => {
  const sql = readFileSync(new URL('../supabase/v0.55-dublonen-sicherheit.sql', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const game = readFileSync(new URL('../js/game.js', import.meta.url), 'utf8');
  // Wächter auf games: Insert nur im Warteraum, Mitspieler nur per RPC, beendete Spiele fest
  assert.match(sql, /create trigger games_guard before insert or update on public\.games/);
  assert.match(sql, /Neue Spiele beginnen im Warteraum/);
  assert.match(sql, /Mitspieler ändern sich nur über Beitreten\/Verlassen/);
  assert.match(sql, /Beendete Spiele sind abgeschlossen/);
  // echte Partie: ≥ 3 Konten, ≥ 6 Minuten (Serverzeit), ≥ 25 Züge
  assert.match(sql, />= 3\s/); assert.match(sql, /now\(\) - g\.created_at >= interval '6 minutes'/); assert.match(sql, />= 25;/);
  // Beträge + Tagesgrenze
  assert.match(sql, /\('partie', 2\)/); assert.match(sql, /\('quartett', 5 \* least\(v_q, 5\)\)/); assert.match(sql, /then 10 else 0/); assert.match(sql, /select 60 - /);
  // Revanche läuft über die Server-Funktion (mit Rückfall, solange das SQL fehlt)
  assert.match(sql, /grant execute on function public\.create_rematch\(uuid, uuid, text, jsonb, jsonb\) to authenticated/);
  assert.match(app, /sb\.rpc\('create_rematch'/);
  // Siegertreppchen kennt alle Buchungsarten aus dem SQL
  for (const kind of ['partie', 'quartett', 'sieg']) { assert.match(sql, new RegExp(`'${kind}'`)); assert.match(game, new RegExp(`${kind}: '`)); }
  assert.match(app, /sb\.rpc\('shop_my_rewards'/);
});

test('v0.58: zwei Gratis-Sprüche – nur Sprüche, höchstens 2, App und SQL passen zusammen', () => {
  const sql = readFileSync(new URL('../supabase/v0.58-neue-charaktere.sql', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.match(sql, /function public\.shop_claim_free\(p_item_id text\)/);
  assert.match(sql, /if v_used >= 2 then/);
  assert.match(sql, /not like 'spruch-%'/);
  assert.match(sql, /check \(price >= 0\)/);
  for (const item of SHOP_SAYINGS) assert.ok(sql.includes(`'${item.id}'`), item.id);
  assert.match(app, /sb\.rpc\('shop_claim_free'/);
  assert.match(app, /2 - freeUsed/);
});

test('v0.61: Emote „Verprügeln“ – im Shop, SQL-Preis aktuell, App erlaubt es Käufern und Admins', () => {
  assert.deepEqual(SHOP_EMOTES.map(({ id, price }) => [id, price]), [['emote-pruegel', 100]]);
  const sql = readFileSync(new URL('../supabase/v0.61-emote-pruegel.sql', import.meta.url), 'utf8');
  // die neue shop_buy kennt weiterhin alle Avatare und Sprüche (sie ersetzt die Funktion komplett)
  for (const item of [...SHOP_AVATARS, ...SHOP_SAYINGS, ...SHOP_EMOTES]) assert.ok(sql.includes(`when '${item.id}' then ${item.price}`), item.id);
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.match(app, /function canPunch\(\) \{ return !!ui\.isAdmin \|\| shopMe\.owned\.has\('emote-pruegel'\); \}/);
});
