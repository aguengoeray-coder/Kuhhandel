import { art } from './animals.js';

// Aussehen: Spielfeld, Hintergrund und Kartenrücken – jeder wählt selbst (gespeichert nur auf diesem Gerät)

const W = (a) => `rgba(255,255,255,${a})`;
const D = (a) => `rgba(0,0,0,${a})`;

// Muster als CSS-Hintergrundbild (liegt über der Farbe)
const PATTERNS = {
  glatt: { name: 'Glatt', css: 'none' },
  filz: { name: 'Filz', css: `radial-gradient(${W(0.05)} 1px, transparent 1.5px) 0 0 / 6px 6px` },
  streifen: { name: 'Streifen', css: `repeating-linear-gradient(135deg, ${W(0.08)} 0 24px, transparent 24px 48px)` },
  karo: { name: 'Karo', css: `linear-gradient(${W(0.06)} 50%, transparent 50%) 0 0 / 40px 40px, linear-gradient(90deg, ${W(0.06)} 50%, transparent 50%) 0 0 / 40px 40px` },
  punkte: { name: 'Punkte', css: `radial-gradient(${W(0.1)} 3px, transparent 3.5px) 0 0 / 26px 26px` },
  rauten: { name: 'Rauten', css: `linear-gradient(45deg, ${W(0.06)} 25%, transparent 25% 75%, ${W(0.06)} 75%) 0 0 / 36px 36px, linear-gradient(-45deg, ${W(0.06)} 25%, transparent 25% 75%, ${W(0.06)} 75%) 0 0 / 36px 36px` },
  dielen: { name: 'Dielen', css: `repeating-linear-gradient(90deg, ${D(0.12)} 0 2px, transparent 2px 64px), repeating-linear-gradient(0deg, transparent 0 150px, ${D(0.08)} 150px 152px)` },
  wellen: { name: 'Wellen', css: `radial-gradient(circle at 50% 100%, transparent 14px, ${W(0.07)} 15px 17px, transparent 18px) 0 0 / 36px 18px` },
  zickzack: { name: 'Zickzack', css: `linear-gradient(135deg, ${W(0.07)} 25%, transparent 25%) -14px 0 / 28px 28px, linear-gradient(225deg, ${W(0.07)} 25%, transparent 25%) -14px 0 / 28px 28px` },
  kreise: { name: 'Kreise', css: `repeating-radial-gradient(circle at 50% 50%, transparent 0 10px, ${W(0.06)} 10px 12px) 0 0 / 44px 44px` },
  fischgraet: { name: 'Fischgrät', css: `repeating-linear-gradient(45deg, ${W(0.06)} 0 6px, transparent 6px 24px) 0 0 / 24px 48px, repeating-linear-gradient(-45deg, ${W(0.06)} 0 6px, transparent 6px 24px) 0 24px / 24px 48px` },
  schnee: { name: 'Schnee', css: `radial-gradient(${W(0.55)} 1.2px, transparent 1.8px) 0 0 / 22px 22px, radial-gradient(${W(0.35)} 1px, transparent 1.5px) 11px 13px / 22px 22px, radial-gradient(${W(0.22)} 1.4px, transparent 2px) 5px 7px / 31px 31px` },
};

// Muster für die Kartenrückseiten (klein, gut erkennbar)
const BACK_PATTERNS = {
  streifen: { name: 'Streifen', css: `repeating-linear-gradient(45deg, ${W(0.16)} 0 5px, transparent 5px 10px)` },
  karo: { name: 'Karo', css: `linear-gradient(${W(0.16)} 50%, transparent 50%) 0 0 / 10px 10px, linear-gradient(90deg, ${W(0.16)} 50%, transparent 50%) 0 0 / 10px 10px` },
  punkte: { name: 'Punkte', css: `radial-gradient(${W(0.35)} 2px, transparent 2.5px) 0 0 / 9px 9px` },
  rauten: { name: 'Rauten', css: `linear-gradient(45deg, ${W(0.18)} 25%, transparent 25% 75%, ${W(0.18)} 75%) 0 0 / 12px 12px, linear-gradient(-45deg, ${W(0.18)} 25%, transparent 25% 75%, ${W(0.18)} 75%) 0 0 / 12px 12px` },
  zickzack: { name: 'Zickzack', css: `linear-gradient(135deg, ${W(0.22)} 25%, transparent 25%) -5px 0 / 10px 10px, linear-gradient(225deg, ${W(0.22)} 25%, transparent 25%) -5px 0 / 10px 10px` },
  kreise: { name: 'Kreise', css: `repeating-radial-gradient(circle at 50% 50%, transparent 0 3px, ${W(0.25)} 3px 4.5px) 0 0 / 14px 14px` },
  gitter: { name: 'Gitter', css: `linear-gradient(${W(0.24)} 1.5px, transparent 1.5px) 0 0 / 8px 8px, linear-gradient(90deg, ${W(0.24)} 1.5px, transparent 1.5px) 0 0 / 8px 8px` },
  glatt: { name: 'Glatt', css: 'none' },
};

const TABLES = {
  petrol: { name: 'Petrol', c: ['#1F7A80', '#16626A', '#0F4D55'] },
  gruen: { name: 'Grün', c: ['#3E9461', '#2E7D4F', '#256A42'] },
  dunkelgruen: { name: 'Tannengrün', c: ['#2F8556', '#226B43', '#1A5535'] },
  blau: { name: 'Nachtblau', c: ['#2C4F8A', '#213E70', '#172E55'], tip: true },
  bordeaux: { name: 'Bordeaux', c: ['#8E2D3D', '#74212F', '#5A1824'] },
  holz: { name: 'Holz', c: ['#9A6B3F', '#7F5530', '#664222'] },
  anthrazit: { name: 'Anthrazit', c: ['#4A4F56', '#3A3E44', '#2B2E33'] },
  ozean: { name: 'Ozean', c: ['#2386B8', '#1A6E9A', '#12567A'] },
  lila: { name: 'Pflaume', c: ['#6A3F9E', '#553284', '#402566'] },
  oliv: { name: 'Oliv', c: ['#6F7F35', '#5B6A2B', '#465221'] },
  schoko: { name: 'Schoko', c: ['#6B4A3A', '#57392C', '#422A20'] },
};

const BACKGROUNDS = {
  bordeaux: { name: 'Bordeaux', c: '#7A1F2E' },
  wiese: { name: 'Wiese', c: '#6FB552' },
  heu: { name: 'Heu', c: '#C8962E' },
  scheune: { name: 'Scheune', c: '#B5452F' },
  nachtblau: { name: 'Nachtblau', c: '#1E2A44', tip: true },
  anthrazit: { name: 'Anthrazit', c: '#2E3136' },
  ozean: { name: 'Ozean', c: '#1B4F72' },
  wald: { name: 'Wald', c: '#2F5D3A' },
  pflaume: { name: 'Pflaume', c: '#4A2C6B' },
  sand: { name: 'Sand', c: '#B08D57' },
  koralle: { name: 'Koralle', c: '#C2573E' },
  himmel: { name: 'Himmel', c: '#4A90C2' },
};

const BACKS = {
  rot: { name: 'Rot', c: ['#C8372D', '#9E2A22'], tip: true },
  blau: { name: 'Blau', c: ['#1D5FC2', '#164A99'] },
  schwarz: { name: 'Schwarz', c: ['#2B2F36', '#1A1D22'] },
  gruen: { name: 'Grün', c: ['#2E7D4F', '#22603C'] },
  gold: { name: 'Gold', c: ['#D99A1E', '#A8760F'] },
  lila: { name: 'Lila', c: ['#6D3FC0', '#542F96'] },
  tuerkis: { name: 'Türkis', c: ['#14A39A', '#0E7D76'] },
  orange: { name: 'Orange', c: ['#E07A1F', '#B45F12'] },
  rosa: { name: 'Pink', c: ['#C2185B', '#951246'] },
  weiss: { name: 'Weiß', c: ['#E9E4D8', '#C9C2B2'] },
};

// v0.90 (Alp): wenige, gut abgestimmte Vorlagen (Spielfeld, Hintergrund, Kartenrücken passen zusammen) –
// besondere Designs mit auffälligen Mustern gibt es im Shop / in der Kuh-Kiste (Besitz: Shop-Gegenstand „design-<id>“)
export const PRESETS = {
  nachtblau: { name: 'Nachtblau', tip: true, v: { table: 'blau', tablePat: 'filz', bg: 'nachtblau', bgPat: 'filz', back: 'rot', backPat: 'streifen' } },
  smaragd: { name: 'Smaragd', v: { table: 'dunkelgruen', tablePat: 'filz', bg: 'wald', bgPat: 'filz', back: 'gold', backPat: 'rauten' } },
  bordeaux: { name: 'Bordeaux', v: { table: 'bordeaux', tablePat: 'filz', bg: 'anthrazit', bgPat: 'filz', back: 'gold', backPat: 'streifen' } },
  petrol: { name: 'Petrol', v: { table: 'petrol', tablePat: 'filz', bg: 'ozean', bgPat: 'filz', back: 'orange', backPat: 'streifen' } },
  pflaume: { name: 'Pflaume', v: { table: 'lila', tablePat: 'filz', bg: 'pflaume', bgPat: 'filz', back: 'gold', backPat: 'karo' } },
  anthrazit: { name: 'Anthrazit', v: { table: 'anthrazit', tablePat: 'filz', bg: 'anthrazit', bgPat: 'glatt', back: 'rot', backPat: 'streifen' } },
};
export const SPECIAL_PRESETS = {
  casino: { name: 'Casino', rarity: 'selten', v: { table: 'petrol', tablePat: 'glatt', bg: 'bordeaux', bgPat: 'streifen', back: 'rot', backPat: 'streifen' } },
  bauernhof: { name: 'Bauernhof', rarity: 'selten', v: { table: 'dunkelgruen', tablePat: 'filz', bg: 'heu', bgPat: 'dielen', back: 'rot', backPat: 'karo' } },
  ozean: { name: 'Ozean', rarity: 'episch', v: { table: 'ozean', tablePat: 'wellen', bg: 'ozean', bgPat: 'wellen', back: 'tuerkis', backPat: 'kreise' } },
  strand: { name: 'Strand', rarity: 'episch', v: { table: 'petrol', tablePat: 'wellen', bg: 'sand', bgPat: 'punkte', back: 'rosa', backPat: 'punkte' } },
  winter: { name: 'Winter', rarity: 'legendaer', v: { table: 'blau', tablePat: 'schnee', bg: 'nachtblau', bgPat: 'schnee', back: 'rot', backPat: 'streifen' } },
};
// Zum Spielfeld passender Hintergrund (beim freien Mischen automatisch)
const BG_FOR = { blau: 'nachtblau', dunkelgruen: 'wald', gruen: 'wald', bordeaux: 'anthrazit', petrol: 'ozean', ozean: 'ozean', lila: 'pflaume', anthrazit: 'anthrazit', holz: 'anthrazit', oliv: 'wald', schoko: 'anthrazit' };
export function bgForTable(table) { return BG_FOR[table] || 'nachtblau'; }
const FREE_TABLES = ['blau', 'dunkelgruen', 'bordeaux', 'petrol', 'lila', 'anthrazit', 'holz'];
const FREE_BACKS = ['rot', 'gold', 'blau', 'schwarz', 'gruen', 'orange'];
const FREE_PATS = ['filz', 'glatt', 'streifen'];
export const DEFAULT_THEME = PRESETS.nachtblau.v;

const KEY = 'kh_theme';
export function loadTheme(store) {
  let t;
  // Große Schrift ist Standard – aus nur, wenn man sie selbst ausgeschaltet hat (dann steht bigText: '')
  try { t = { ...DEFAULT_THEME, bigText: '1', ...JSON.parse(store.get(KEY) || '{}') }; } catch { t = { ...DEFAULT_THEME, bigText: '1' }; }
  if (!BACK_PATTERNS[t.backPat]) t.backPat = DEFAULT_THEME.backPat; // z. B. entfernte Kuhflecken
  return t;
}
export function saveTheme(store, t) { store.set(KEY, JSON.stringify(t)); }

// Farben als CSS-Variablen setzen – das Stylesheet nutzt nur diese
export function applyTheme(t) {
  const r = document.documentElement.style;
  const tb = TABLES[t.table] || TABLES.petrol;
  const bg = BACKGROUNDS[t.bg] || BACKGROUNDS.bordeaux;
  const bk = BACKS[t.back] || BACKS.rot;
  r.setProperty('--tbl-1', tb.c[0]); r.setProperty('--tbl-2', tb.c[1]); r.setProperty('--tbl-3', tb.c[2]);
  r.setProperty('--tbl-pat', (PATTERNS[t.tablePat] || PATTERNS.glatt).css);
  r.setProperty('--bg', bg.c);
  r.setProperty('--bg-pat', (PATTERNS[t.bgPat] || PATTERNS.streifen).css);
  r.setProperty('--back', bk.c[0]); r.setProperty('--back-2', bk.c[1]);
  r.setProperty('--back-pat', (BACK_PATTERNS[t.backPat] || BACK_PATTERNS.streifen).css);
  document.documentElement.classList.toggle('bigtext', !!t.bigText);
  document.documentElement.dataset.fx = t.fx || 'alle'; // v0.94 Set-Effekte am Tisch: alle / nur meine / aus
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', bg.c);
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const tipMark = '<i class="ttip" title="Empfehlung">★</i>';

function swatches(key, list, cur, style) {
  return `<div class="tsw">${Object.entries(list).map(([id, o]) => `<button type="button" class="sw ${cur === id ? 'on' : ''}" data-m="theme" data-k="${key}" data-v="${id}" aria-pressed="${cur === id}" aria-label="${esc(o.name)}">
    <span class="swc" style="${style(o)}"></span><small>${esc(o.name)}</small>${o.tip ? tipMark : ''}</button>`).join('')}</div>`;
}
function patterns(key, list, cur, color, tip) {
  return `<div class="tsw">${Object.entries(list).map(([id, o]) => `<button type="button" class="sw ${cur === id ? 'on' : ''}" data-m="theme" data-k="${key}" data-v="${id}" aria-pressed="${cur === id}" aria-label="Muster ${esc(o.name)}">
    <span class="swc" style="background:${o.css === 'none' ? '' : `${o.css},`} ${color}"></span><small>${esc(o.name)}</small>${id === tip ? tipMark : ''}</button>`).join('')}</div>`;
}

// Inhalt des Fensters „Aussehen“ (v0.90 abgespeckt: Vorlagen + wenige freie Farben; Spezial-Designs aus dem Shop)
export function themeModal(t, owned = []) {
  const tb = TABLES[t.table] || TABLES.blau;
  const all = { ...PRESETS, ...SPECIAL_PRESETS };
  const presetOn = Object.entries(all).find(([, p]) => Object.keys(p.v).every((k) => p.v[k] === t[k]))?.[0];
  const pick = (obj, ids) => Object.fromEntries(ids.filter((id) => obj[id]).map((id) => [id, obj[id]]));
  const tile = (id, p, locked) => `<button type="button" class="tpreset ${presetOn === id ? 'on' : ''} ${locked ? 'locked' : ''} ${p.rarity ? `r-${p.rarity}` : ''}" data-m="${locked ? 'themeShop' : 'themePreset'}" data-v="${id}" ${locked ? 'aria-label="Im Shop"' : ''}>
      <span class="tpp" style="background:${(PATTERNS[p.v.tablePat] || PATTERNS.glatt).css === 'none' ? '' : `${PATTERNS[p.v.tablePat].css},`} ${TABLES[p.v.table].c[1]}"><i></i><b style="background:${BACKS[p.v.back].c[0]}"></b><s style="background:${BACKGROUNDS[p.v.bg].c}"></s>${locked ? '<em>🔒</em>' : ''}</span>
      <small>${esc(p.name)}</small>${p.tip ? tipMark : ''}</button>`;
  return `<h2>🎨 Aussehen</h2>
    <div class="tlayout v2">
    <div class="tprevcol">
      <div class="tprev" aria-hidden="true">
        <div class="tprev-table">
          <span class="tpv-banner">Du bist dran</span>
          <span class="tpv-deck"><i></i><i></i><i></i></span>
          <span class="tpv-card">${art('kuh')}</span>
          <span class="tpv-money"><i style="--m:#F6F1E4">0</i><i style="--m:#F6D98B">10</i><i style="--m:#BFE3C8">50</i></span>
        </div>
        <span class="tpv-player"><b></b><em>Du</em></span>
      </div>
      <button type="button" class="tbig ${t.bigText ? 'on' : ''}" data-m="theme" data-k="bigText" data-v="${t.bigText ? '' : '1'}" aria-pressed="${!!t.bigText}"><span class="tgl"><i></i></span>Große Schrift</button>
      <div class="tfx" role="group" aria-label="Set-Effekte am Tisch"><span>✨ Effekte am Tisch</span>${[['', 'Alle'], ['meine', 'Nur meine'], ['aus', 'Aus']].map(([v, n]) => `<button type="button" class="${(t.fx || '') === v ? 'on' : ''}" data-m="theme" data-k="fx" data-v="${v}" aria-pressed="${(t.fx || '') === v}">${n}</button>`).join('')}</div>
      <div class="tfoot"><button type="button" class="pill pill-white pill-small" data-m="themeReset">Zurück auf Nachtblau</button></div>
    </div>
    <div class="toptions">
    <h3>Vorlagen</h3>
    <div class="tpresets">${Object.entries(PRESETS).map(([id, p]) => tile(id, p, false)).join('')}</div>
    <h3>Spezial-Designs <small class="th3note">aus dem Shop &amp; der Kuh-Kiste</small></h3>
    <div class="tpresets special">${Object.entries(SPECIAL_PRESETS).map(([id, p]) => tile(id, p, !owned.includes(`design-${id}`))).join('')}</div>
    <h3>Selbst mischen</h3>
    <div class="tmix"><span>Spielfeld</span>${swatches('table', pick(TABLES, FREE_TABLES), t.table, (o) => `background:${o.c[1]}`)}</div>
    <div class="tmix"><span>Muster</span>${patterns('tablePat', pick(PATTERNS, FREE_PATS), t.tablePat, tb.c[1], 'filz')}</div>
    <div class="tmix"><span>Karten</span>${swatches('back', pick(BACKS, FREE_BACKS), t.back, (o) => `background:${o.c[0]}`)}</div>
    </div></div>`;
}
