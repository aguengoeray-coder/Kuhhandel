// Einheitliche Größen: In jeder Phase gleich groß (bei gleicher Spielerzahl und Bildschirmgröße):
// die große Karte in der Mitte (Stapel bzw. Tierkarte) und die Überschrift oben.
// Sonst „springt“ der Tisch von Phase zu Phase.
import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium, VIEWPORTS } from './lib/pw.mjs';
import { startServer } from './lib/server.mjs';
import { writeReport, appendSummary } from './lib/report.mjs';

const DEMOS = ['turn', 'mustdraw', 'auction', 'auctionrun', 'auctioneer', 'rat', 'ratme', 'special', 'specialdecide', 'specialbuzzed', 'auction3'];
const TOL = 2;

test('Große Karte und Überschrift sind in allen Phasen gleich groß', { timeout: 10 * 60 * 1000 }, async () => {
  const srv = await startServer();
  const browser = await chromium.launch();
  const rows = []; const lines = [];
  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      const groups = {};
      for (const d of DEMOS) {
        await page.goto(`${srv.url}/?demo=${d}`); await page.waitForTimeout(1300);
        const m = await page.evaluate(() => {
          const st = document.getElementById('stage'); const sc = st.getBoundingClientRect().width / st.offsetWidth;
          const card = document.querySelector('.tcenter .aucard .pcard, .tcenter .bigcard .pcard, .tcenter .deck');
          const ban = document.querySelector('.gtable > .tbanner');
          const r = card?.getBoundingClientRect();
          return { p: document.querySelectorAll('.prow').length + 1, card: r ? [Math.round(r.width / sc), Math.round(r.height / sc)] : null, font: ban ? parseFloat(getComputedStyle(ban).fontSize) : null };
        });
        (groups[m.p] = groups[m.p] || []).push({ d, ...m });
      }
      for (const [p, list] of Object.entries(groups)) {
        const ref = list.find((x) => x.card) || list[0];
        for (const x of list) {
          const bad = [];
          if (x.card && ref.card && (Math.abs(x.card[0] - ref.card[0]) > TOL || Math.abs(x.card[1] - ref.card[1]) > TOL)) bad.push(`Karte ${x.card.join('×')} statt ${ref.card.join('×')}`);
          if (x.font !== ref.font) bad.push(`Überschrift ${x.font}px statt ${ref.font}px`);
          if (bad.length) rows.push({ seite: x.d, vp: `${vp.width}×${vp.height}`, art: 'groesse', stufe: 'fehler', ziel: `${p} Spieler`, text: bad.join(', ') });
        }
        lines.push(`| ${vp.width}×${vp.height} | ${p} | ${ref.card ? ref.card.join('×') : '–'} | ${ref.font}px | ${list.map((x) => x.d).join(', ')} |`);
      }
      await page.close();
    }
  } finally { await browser.close(); await srv.close(); }
  const rep = writeReport('sizes', 'Einheitliche Größen', rows, ['| Größe | Spieler | große Karte | Überschrift | Ansichten |', '|---|---|---|---|---|', ...lines].join('\n') + '\n');
  appendSummary(rep.md);
  assert.equal(rep.neu.length, 0, rep.neu.map((r) => `- ${r.seite} @${r.vp}: ${r.text}`).join('\n'));
});
