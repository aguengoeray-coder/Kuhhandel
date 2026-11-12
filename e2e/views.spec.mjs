// Alle Ansichten in allen Bildschirmgrößen öffnen und das Layout prüfen.
// Start: node --test e2e/   (lokal ggf. NODE_PATH=$(npm root -g) davor)
// Nur einzelne Seiten: E2E_ONLY=start,turn,auction node --test e2e/views.spec.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { chromium, VIEWPORTS } from './lib/pw.mjs';
import { startServer } from './lib/server.mjs';
import { pageChecks, tableOverlaps } from './lib/checks.mjs';
import { known, key, writeReport, appendSummary, OUT } from './lib/report.mjs';

// Alle Spiel-Demos aus js/demo.js (case 'xyz') – neue Demos werden automatisch mitgeprüft
const demoSrc = readFileSync(new URL('../js/demo.js', import.meta.url), 'utf8');
const GAME_DEMOS = [...new Set([...demoSrc.matchAll(/case '([a-z0-9]+)'/g)].map((m) => m[1]))];

const PAGES = [
  { seite: 'start', q: '?demo=start&klick=1' },
  { seite: 'start-debug', q: '?demo=start&klick=1&debug=1' },
  { seite: 'start-einstellungen', q: '?demo=start&klick=1', klick: '[data-dock="settings"]' },
  { seite: 'start-bestenliste', q: '?demo=start&klick=1', klick: '[data-dock="stats"]' },
  { seite: 'start-regeln', q: '?demo=start&klick=1', klick: '[data-dock="rules"]' },
  { seite: 'warteraum', q: '?demo=room&klick=1' },
  ...GAME_DEMOS.map((d) => ({ seite: d, q: `?demo=${d}` })),
  // Shop (kommt mit v0.48): wird automatisch mitgeprüft, sobald shop-demo.html im Repo liegt
  ...(existsSync(new URL('../shop-demo.html', import.meta.url)) ? [{ seite: 'shop', q: 'shop-demo.html?' }] : []),
  ...['auction', 'self', 'trade', 'special', 'specialself', 'gift', 'money', 'rat', 'ratgot'].map((ev) => ({ seite: `ergebnis-${ev}`, q: `?demo=turn&ev=${ev}&pop=1` })),
];
const ONLY = process.env.E2E_ONLY ? process.env.E2E_ONLY.split(',') : null;

test('Layout aller Ansichten in 4 Bildschirmgrößen', { timeout: 15 * 60 * 1000 }, async () => {
  const srv = await startServer();
  const browser = await chromium.launch();
  const rows = []; let shots = 0;
  const pages = PAGES.filter((p) => !ONLY || ONLY.includes(p.seite));
  try {
    // je Bildschirmgröße ein eigener Durchlauf, alle vier gleichzeitig
    await Promise.all(VIEWPORTS.map(async (vp) => {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      for (const pg of pages) {
        const errs = [];
        const onErr = (e) => errs.push(e.message || String(e));
        const onCon = (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_|fonts\.g|navigator\.vibrate/.test(m.text())) errs.push(m.text()); };
        page.on('pageerror', onErr); page.on('console', onCon);
        await page.goto(srv.url + '/' + pg.q, { waitUntil: 'load' });
        await page.waitForTimeout(1200);
        if (pg.klick) { await page.click(pg.klick).catch((e) => errs.push('Klick ging nicht: ' + pg.klick)); await page.waitForTimeout(600); }
        await page.waitForTimeout(400);
        const found = [...await page.evaluate(pageChecks), ...await page.evaluate(tableOverlaps)];
        for (const e of errs) found.push({ art: 'js-fehler', stufe: 'fehler', ziel: 'Konsole', text: e.slice(0, 160) });
        page.off('pageerror', onErr); page.off('console', onCon);
        const uniq = new Map(); for (const m of found) if (!uniq.has(key(m))) uniq.set(key(m), m);
        let shot = null;
        for (const m of uniq.values()) {
          const k = known(pg.seite, m);
          const r = { seite: pg.seite, vp: `${vp.width}×${vp.height}`, ...m, bekannt: k ? k.grund : null };
          if (r.stufe === 'fehler' && !r.bekannt) {
            if (!shot && shots < 80) { shots++; shot = `shots/${pg.seite}_${vp.width}x${vp.height}.png`; await page.screenshot({ path: new URL(shot, OUT).pathname }); }
            r.shot = shot;
          }
          rows.push(r);
        }
      }
      await ctx.close();
    }));
  } finally { await browser.close(); await srv.close(); }
  const rep = writeReport('views', `Layout: ${pages.length} Ansichten × ${VIEWPORTS.length} Größen`, rows,
    `Größen: ${VIEWPORTS.map((v) => `${v.width}×${v.height}`).join(', ')}. Screenshots der Fehler: Artefakt „e2e-report“ → shots/.\n`);
  appendSummary(rep.md);
  assert.equal(rep.neu.length, 0, `${rep.neu.length} neue Layout-Fehler:\n` + rep.neu.slice(0, 15).map((r) => `- ${r.seite} @${r.vp}: ${r.art} ${r.ziel} – ${r.text}`).join('\n'));
});
