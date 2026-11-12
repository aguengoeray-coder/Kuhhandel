// Ergebnisse sammeln, mit der Liste bekannter Punkte abgleichen und als Bericht schreiben.
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';

export const OUT = new URL('../../e2e-report/', import.meta.url);
mkdirSync(new URL('shots/', OUT), { recursive: true });

const KNOWN = JSON.parse(readFileSync(new URL('../known-issues.json', import.meta.url), 'utf8')).bekannt || [];
// Ein Eintrag passt, wenn alle angegebenen Felder (seite, art, ziel als RegExp) passen.
export function known(seite, m) {
  return KNOWN.find((k) => (!k.seite || new RegExp(k.seite).test(seite)) && (!k.art || k.art === m.art) && (!k.ziel || new RegExp(k.ziel).test(m.ziel)));
}

export function key(m) { return `${m.art}|${m.ziel}`; }

// Bericht als Markdown (für GitHub-Zusammenfassung und PR-Bericht)
export function writeReport(file, title, rows, extra = '') {
  const neu = rows.filter((r) => r.stufe === 'fehler' && !r.bekannt);
  const bek = rows.filter((r) => r.stufe === 'fehler' && r.bekannt);
  const hin = rows.filter((r) => r.stufe === 'hinweis');
  const tbl = (list, max = 60) => list.length ? ['| Seite | Größe | Art | Element | Details |', '|---|---|---|---|---|', ...list.slice(0, max).map((r) => `| ${r.seite} | ${r.vp} | ${r.art} | ${String(r.ziel).replace(/\|/g, '/')} | ${String(r.text).replace(/\|/g, '/')}${r.shot ? ` (📷 ${r.shot})` : ''} |`), list.length > max ? `\n… und ${list.length - max} weitere (siehe results JSON)` : ''].join('\n') : '_keine_';
  const md = [`## ${neu.length ? '❌' : '✅'} ${title}`, '',
    `**Neue Fehler: ${neu.length}** · bekannte Punkte: ${bek.length} · Hinweise: ${hin.length}`, '', extra,
    '### Neue Fehler', tbl(neu), '',
    '<details><summary>Bekannte Punkte (known-issues.json)</summary>', '', tbl(bek), '', '</details>', '',
    '<details><summary>Hinweise (kleine Schrift, kleine Tippflächen …)</summary>', '', tbl(groupHints(hin)), '', '</details>', ''].join('\n');
  writeFileSync(new URL(file + '.md', OUT), md);
  writeFileSync(new URL(file + '.json', OUT), JSON.stringify(rows, null, 1));
  return { neu, bek, hin, md };
}

// Hinweise zusammenfassen: gleiche Art+Element über alle Seiten nur einmal
function groupHints(list) {
  const m = new Map();
  for (const r of list) { const k = r.art + '|' + r.ziel; if (!m.has(k)) m.set(k, { ...r, seiten: new Set() }); m.get(k).seiten.add(`${r.seite}@${r.vp}`); }
  return [...m.values()].map((r) => ({ ...r, seite: [...r.seiten].slice(0, 3).join(', ') + (r.seiten.size > 3 ? ` +${r.seiten.size - 3}` : ''), vp: '' }));
}

export function appendSummary(md) {
  const f = process.env.GITHUB_STEP_SUMMARY;
  if (f && existsSync(f)) writeFileSync(f, md + '\n', { flag: 'a' });
}
