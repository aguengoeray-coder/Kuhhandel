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
  // 3 Spieler (Regression v0.52.2: Kuhhandel-Feld überdeckte „Abbrechen“ bzw. dein Geld) – nur Demos, die mit 3 Spielern funktionieren
  ...['turn', 'tradesetup', 'tradeum2', 'traderespond', 'traderatrespond', 'auction3', 'block', 'ended'].filter((d) => GAME_DEMOS.includes(d)).map((d) => ({ seite: `${d}-3sp`, q: `?p=3&demo=${d}` })),
  // Startseite mit großem Ganzkörper-Avatar (v0.52) und ohne Avatar
  // v0.56: deine Figur unten rechts (Shop-Avatar ganz) + 3 Spieler
  // v0.60 Börsen-Chaos: jede News-Karte + Kurszettel mit 3 Spielern
  ...['crash-pferd', 'dividende', 'steuer', 'panik', 'hektik'].map((k) => ({ seite: `news-${k}`, q: `?demo=news&k=${k}` })),
  { seite: 'boerse-3sp', q: '?p=3&demo=boerse' },
  // v0.61 Admin-Fähigkeit: Prügel-Animation (Ziel oben und rechts)
  { seite: 'pruegel-oben', q: '?demo=turn&allav=1&punch=u3' },
  { seite: 'pruegel-rechts', q: '?demo=turn&allav=1&punch=u4&pfrom=u2' },
  { seite: 'turn-figur', q: '?demo=turn&allav=1' },
  { seite: 'turn-figur-3sp', q: '?p=3&demo=turn&allav=1' },
  // v0.64 Figuren-Theater: jede kostenlose Szene wird im 4er- und Baum-Szene zusätzlich im 3er-Tisch geprüft.
  ...['verschwoerung', 'torte', 'auslachen', 'schleimen', 'baum'].map((scene) => ({ seite: `theater-${scene}`, q: '?demo=turn&allav=1', klick: '.meplate .mefig', klick2: `.rp-scene[data-v="${scene}"]`, scene, players: 4 })),
  { seite: 'theater-baum-3sp', q: '?p=3&demo=turn&allav=1', klick: '.meplate .mefig', klick2: '.rp-scene[data-v="baum"]', scene: 'baum', players: 3 },
  { seite: 'start-avatar', q: '?demo=start&klick=1&myav=kuh-kaiser' },
  // Siegertreppchen mit Ganzkörper-Avataren (v0.54)
  { seite: 'podest-avatare', q: '?demo=ended&allav=1&podium=1' },
  // v0.55: Dublonen-Aufstellung am Treppchen (mit Gutschrift / Partie zählt nicht)
  { seite: 'podest-dublonen', q: '?demo=ended&allav=1&rw=1&podium=1' },
  { seite: 'podest-keine-dublonen', q: '?demo=ended&rw=0&podium=1' },
  { seite: 'podest-avatare-3sp', q: '?p=3&demo=ended&allav=1&podium=1' },
  { seite: 'shop-avatare', q: '?demo=start&klick=1', klick: '[data-dock="shop"]' },
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
        if (pg.klick) { await page.click(pg.klick).catch((e) => errs.push('Klick ging nicht: ' + pg.klick)); await page.waitForTimeout(350); }
        if (pg.klick2) { await page.click(pg.klick2).catch((e) => errs.push('Szenen-Klick ging nicht: ' + pg.klick2)); await page.waitForTimeout(450); }
        if (pg.scene) await page.waitForTimeout(pg.scene === 'baum' ? 3300 : 1900);
        else await page.waitForTimeout(400);
        const found = [...await page.evaluate(pageChecks), ...await page.evaluate(tableOverlaps)];
        if (pg.scene) {
          const theater = await page.evaluate(() => {
            const figures = [...document.querySelectorAll('.theater-figure')];
            const rects = figures.map((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { width: r.width, height: r.height, cssWidth: cs.width, cssHeight: cs.height }; });
            const sameRenderedSize = rects.every((r) => Math.abs(r.width - rects[0]?.width) < 1 && Math.abs(r.height - rects[0]?.height) < 1);
            const stage = document.querySelector('#stage')?.getBoundingClientRect();
            const targets = rects.map((r, i) => {
              if (!stage) return Infinity;
              const n = rects.length, angle = -Math.PI / 2 + i * Math.PI * 2 / n;
              const rx = Math.min(126, stage.width * .16), ry = Math.min(76, stage.height * .20);
              const x = stage.left + stage.width / 2 + Math.cos(angle) * rx;
              const y = stage.top + stage.height * .52 + Math.sin(angle) * ry;
              const actor = document.querySelectorAll('.theater-actor')[i].getBoundingClientRect();
              return Math.round(Math.hypot(actor.left + actor.width / 2 - x, actor.top + actor.height / 2 - y));
            });
            return { count: document.querySelectorAll('.theater-actor').length, rects: rects.map((r) => [Math.round(r.width), Math.round(r.height)]), cssSizes: rects.map((r) => [r.cssWidth, r.cssHeight]), sameRenderedSize, targetErrors: targets, title: !!document.querySelector('.theater-title') };
          });
          if (!theater.title || theater.count !== pg.players || !theater.sameRenderedSize || theater.cssSizes.some((z) => z[0] !== '72px' || z[1] !== '120px') || theater.targetErrors.some((d) => d > 28)) found.push({ art: 'figuren-theater', stufe: 'fehler', ziel: pg.scene, text: JSON.stringify(theater) });
        }
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
