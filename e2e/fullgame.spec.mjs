// Komplette Partien mit Test-Spielern (Debug-Modus) bis zum Siegertreppchen.
// Ein Mensch (Alp) wird automatisch gespielt: bezahlen, bieten, Kuhhandel, Ratte, Spezialkarte …
// Rot, wenn: Spiel hängt (40 s keine Änderung), JavaScript-Fehler, kein Spielende, Überlappungen am Tisch.
import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from './lib/pw.mjs';
import { startServer } from './lib/server.mjs';
import { tableOverlaps } from './lib/checks.mjs';
import { known, writeReport, appendSummary, OUT } from './lib/report.mjs';

// spaet=1: Partie startet kurz vor Schluss (volle Plätze, viel Geld) – schnell und anspruchsvoll fürs Layout
const GAMES = [
  { name: 'spiel3-spaet', q: '?debug=1&demo=testspiel3&spaet=1', vp: [852, 393], seed: 11 },
  { name: 'spiel4-spaet', q: '?debug=1&demo=testspiel&spaet=1', vp: [667, 375], seed: 23 },
  // von Anfang an: eine ganze Partie dauert 10+ Minuten → hier nur 4 Minuten spielen (darf nicht hängen, keine Fehler)
  { name: 'spiel4-anfang', q: '?debug=1&demo=testspiel', vp: [932, 430], seed: 11, dauer: 240000 },
  { name: 'spiel3-anfang', q: '?debug=1&demo=testspiel3', vp: [800, 360], seed: 23, dauer: 240000 },
];
const MAX_MS = Number(process.env.E2E_GAME_MS || 420000);

async function play(browser, url, g) {
  const page = await browser.newPage({ viewport: { width: g.vp[0], height: g.vp[1] } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_|fonts\.g|navigator\.vibrate/.test(m.text())) errs.push(m.text()); });
  // fester Zufall → gleiche Partie bei jedem Lauf; Geldscheine im Stapel an
  await page.addInitScript((seed) => {
    let a = seed >>> 0;
    Math.random = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    try { localStorage.setItem('kh_dbg_money', '1'); } catch {}
  }, g.seed);
  await page.goto(url + '/' + g.q); await page.waitForTimeout(600);
  const $ = (s) => page.$(s);
  const tap = async (s) => { const e = await $(s); if (e) { await e.click({ force: true }).catch(() => {}); return true; } return false; };
  const panel = async (sel) => { await tap('[data-dbg="panel"]'); await tap(sel); if (await $('.dpanel')) await tap('[data-dbg="panel"]'); await page.waitForTimeout(150); };
  await panel('[data-dbg="bots"]'); await panel('[data-dbg="fast"]');

  const st = { ended: false, stuck: null, overlaps: new Map(), steps: 0, events: {} };
  let lastSig = '', sigAt = Date.now(); let shots = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < (g.dauer || MAX_MS)) {
    st.steps++;
    await page.waitForTimeout(120);
    for (const m of await page.evaluate(tableOverlaps).catch(() => [])) {
      if (!st.overlaps.has(m.ziel)) {
        let shot = null;
        if (shots < 4) { shots++; shot = `shots/${g.name}_${shots}.png`; await page.screenshot({ path: new URL(shot, OUT).pathname }); }
        const phase = await page.evaluate(() => ((document.querySelector('.tbanner') || {}).textContent || '').replace(/\s+/g, ' ').slice(0, 40)).catch(() => '');
        st.overlaps.set(m.ziel, { ...m, text: `${m.text} – bei „${phase}“`, shot });
      }
    }
    const ph = await page.evaluate(() => ({ tally: !!document.querySelector('.tally'), podium: !!document.querySelector('.podium'), ev: [...document.querySelectorAll('.evcard:not(.evout .evcard) .ec-kind')].map((e) => e.textContent) })).catch(() => ({}));
    (ph.ev || []).forEach((x) => { st.events[x] = (st.events[x] || 0) + 1; });
    if (ph.podium) { st.ended = true; st.endS = Math.round((Date.now() - t0) / 1000); await page.waitForTimeout(1500); await tap('[data-a="recap"]'); await page.waitForTimeout(700); break; }
    if (ph.tally) continue;
    // hängt? (Banner, Stapel, Höchstgebot und Geldanzahl 40 s unverändert) – ein langes Bietgefecht
    // der Test-Spieler (jedes Gebot startet die Uhr neu) ist Fortschritt, kein Hänger
    const sig = await page.evaluate(() => [(document.querySelector('.tbanner') || {}).textContent, (document.querySelector('.deck-count') || {}).textContent, (document.querySelector('.bidbox b') || {}).textContent, [...document.querySelectorAll('.prow .mcount, .prow b')].map((e) => e.textContent).join(',')].join('|')).catch(() => lastSig);
    if (sig !== lastSig) { lastSig = sig; sigAt = Date.now(); }
    else if (Date.now() - sigAt > 40000) {
      st.stuck = sig.slice(0, 120);
      st.stuckShot = `shots/${g.name}_haengt.png`; await page.screenshot({ path: new URL(st.stuckShot, OUT).pathname });
      st.buttons = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => (b.dataset.a || '') + (b.disabled ? '(aus)' : '') + ':' + b.textContent.trim().slice(0, 20)).join(' ; '));
      break;
    }
    // Ergebnis-Fenster manchmal per Tipp schließen
    if ((ph.ev || []).length && st.steps % 3 === 0 && await tap('.evcard[data-a="resClose"]')) continue;
    // Bezahlen: Scheine im Fächer antippen, sonst Vorschlag
    if (await $('[data-a="pay"]')) {
      for (let i = 0; i < 12; i++) { if (await $('[data-a="pay"]:not([disabled])')) break; if (!await tap('.fan-wrap button.money.fan.pick:last-of-type')) break; await page.waitForTimeout(40); }
      if (await tap('[data-a="pay"]:not([disabled])')) continue;
      await tap('[data-a="autopay"],[data-a="autocount"]'); await page.waitForTimeout(60);
      await tap('[data-a="pay"]:not([disabled])'); continue;
    }
    // Kuhhandel beantworten
    if (await $('[data-a="counter"]')) { if (st.steps % 3 === 0) { await tap('[data-a="accept"]'); continue; } await tap('.fan-wrap button.money.fan.pick'); await page.waitForTimeout(50); await tap('[data-a="counter"]:not([disabled])'); continue; }
    // Ratte: Schein legen oder nehmen
    if (await $('[data-a="ratTake"]')) { if (st.steps % 3 && await tap('.fan-wrap button.money.fan.pick')) { await page.waitForTimeout(50); if (await tap('[data-a="ratGo"]:not([disabled])')) continue; } await tap('[data-a="ratTake"]'); continue; }
    // Kuhhandel (Schritt 2 offen)
    if (await $('[data-a="tradeGo"]')) { if (!await tap('[data-a="tradeGo"]:not([disabled])')) { if (!await tap('.fan-wrap button.money.fan.pick')) await tap('[data-a="tradeClose"]'); } continue; }
    if (await tap('.tp-t')) continue;
    if (st.steps % 2 === 0 && await tap('[data-a="tradeOpen"]:not([disabled])')) {
      await page.waitForTimeout(80); await tap('.tp-t'); await page.waitForTimeout(80); await tap('.fan-wrap button.money.fan.pick'); await page.waitForTimeout(50);
      if (!await tap('[data-a="tradeGo"]:not([disabled])')) await tap('[data-a="tradeClose"]');
      continue;
    }
    for (const sel of ['[data-a="block"]', '[data-a="batzen"]', 'button.pill[data-a="auction"]:not([disabled])', 'button.bidbtn:not([disabled])', '[data-a="sell"]', '[data-a="spSell"]', '[data-a="buzz"]:not([disabled])', '[data-a="rps"]']) if (await tap(sel)) break;
  }
  await page.close();
  return { ...st, errs: [...new Set(errs)] };
}

test('Komplette Partien mit Test-Spielern', { timeout: 20 * 60 * 1000 }, async () => {
  const srv = await startServer();
  const browser = await chromium.launch();
  const rows = []; const lines = [];
  try {
    for (let i = 0; i < GAMES.length; i += 2) {
      const res = await Promise.all(GAMES.slice(i, i + 2).map((g) => play(browser, srv.url, g).then((r) => [g, r])));
      for (const [g, r] of res) {
        const vp = `${g.vp[0]}×${g.vp[1]}`;
        lines.push(`| ${g.name} | ${vp} | ${r.ended ? `✅ nach ${r.endS} s` : g.dauer && !r.stuck ? `✅ ${g.dauer / 60000} min gespielt` : '❌'} | ${r.stuck ? `❌ ${r.stuck}` : '–'} | ${r.errs.length} | ${r.overlaps.size} | ${Object.entries(r.events).map(([k, v]) => `${k} ${v}`).join(', ').slice(0, 120)} |`);
        if (!r.ended && !r.stuck && !g.dauer) rows.push({ seite: g.name, vp, art: 'kein-ende', stufe: 'fehler', ziel: 'Partie', text: `nach ${MAX_MS / 1000} s kein Siegertreppchen` });
        if (r.stuck) rows.push({ seite: g.name, vp, art: 'haengt', stufe: 'fehler', ziel: 'Partie', text: `40 s keine Änderung: ${r.stuck} · Knöpfe: ${(r.buttons || '').slice(0, 160)}`, shot: r.stuckShot });
        for (const e of r.errs) rows.push({ seite: g.name, vp, art: 'js-fehler', stufe: 'fehler', ziel: 'Konsole', text: e.slice(0, 160) });
        for (const m of r.overlaps.values()) { const k = known(g.name, m); rows.push({ seite: g.name, vp, ...m, bekannt: k ? k.grund : null }); }
      }
    }
  } finally { await browser.close(); await srv.close(); }
  const table = ['| Partie | Größe | Ende | Hängt | JS-Fehler | Überlappungen | Ereignisse |', '|---|---|---|---|---|---|---|', ...lines].join('\n');
  const rep = writeReport('fullgame', `Komplette Partien (${GAMES.length})`, rows, table + '\n');
  appendSummary(rep.md);
  assert.equal(rep.neu.length, 0, `${rep.neu.length} Probleme in den Partien:\n` + rep.neu.slice(0, 10).map((r) => `- ${r.seite}: ${r.art} ${r.ziel} – ${r.text}`).join('\n'));
});
