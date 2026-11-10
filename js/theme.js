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
};

// Muster für die Kartenrückseiten (klein, gut erkennbar)
const BACK_PATTERNS = {
  streifen: { name: 'Streifen', css: `repeating-linear-gradient(45deg, ${W(0.16)} 0 5px, transparent 5px 10px)` },
  karo: { name: 'Karo', css: `linear-gradient(${W(0.16)} 50%, transparent 50%) 0 0 / 10px 10px, linear-gradient(90deg, ${W(0.16)} 50%, transparent 50%) 0 0 / 10px 10px` },
  punkte: { name: 'Punkte', css: `radial-gradient(${W(0.35)} 2px, transparent 2.5px) 0 0 / 9px 9px` },
  rauten: { name: 'Rauten', css: `linear-gradient(45deg, ${W(0.18)} 25%, transparent 25% 75%, ${W(0.18)} 75%) 0 0 / 12px 12px, linear-gradient(-45deg, ${W(0.18)} 25%, transparent 25% 75%, ${W(0.18)} 75%) 0 0 / 12px 12px` },
  kuh: { name: 'Kuhflecken', css: `radial-gradient(ellipse 30% 22% at 25% 28%, ${W(0.85)} 98%, transparent), radial-gradient(ellipse 26% 30% at 72% 62%, ${W(0.85)} 98%, transparent), radial-gradient(ellipse 14% 12% at 80% 14%, ${W(0.85)} 98%, transparent), radial-gradient(ellipse 16% 12% at 22% 82%, ${W(0.85)} 98%, transparent)` },
  glatt: { name: 'Glatt', css: 'none' },
};

const TABLES = {
  petrol: { name: 'Petrol', c: ['#1F7A80', '#16626A', '#0F4D55'], tip: true },
  gruen: { name: 'Grün', c: ['#3E9461', '#2E7D4F', '#256A42'] },
  dunkelgruen: { name: 'Tannengrün', c: ['#2F8556', '#226B43', '#1A5535'] },
  blau: { name: 'Nachtblau', c: ['#2C4F8A', '#213E70', '#172E55'] },
  bordeaux: { name: 'Bordeaux', c: ['#8E2D3D', '#74212F', '#5A1824'] },
  holz: { name: 'Holz', c: ['#9A6B3F', '#7F5530', '#664222'] },
  anthrazit: { name: 'Anthrazit', c: ['#4A4F56', '#3A3E44', '#2B2E33'] },
};

const BACKGROUNDS = {
  bordeaux: { name: 'Bordeaux', c: '#7A1F2E', tip: true },
  wiese: { name: 'Wiese', c: '#6FB552' },
  heu: { name: 'Heu', c: '#C8962E' },
  scheune: { name: 'Scheune', c: '#B5452F' },
  nachtblau: { name: 'Nachtblau', c: '#1E2A44' },
  anthrazit: { name: 'Anthrazit', c: '#2E3136' },
};

const BACKS = {
  rot: { name: 'Rot', c: ['#C8372D', '#9E2A22'], tip: true },
  blau: { name: 'Blau', c: ['#1D5FC2', '#164A99'] },
  schwarz: { name: 'Schwarz', c: ['#2B2F36', '#1A1D22'] },
  gruen: { name: 'Grün', c: ['#2E7D4F', '#22603C'] },
  gold: { name: 'Gold', c: ['#D99A1E', '#A8760F'] },
  lila: { name: 'Lila', c: ['#6D3FC0', '#542F96'] },
};

// Fertige Zusammenstellungen
export const PRESETS = {
  casino: { name: 'Casino', tip: true, v: { table: 'petrol', tablePat: 'glatt', bg: 'bordeaux', bgPat: 'streifen', back: 'rot', backPat: 'streifen' } },
  bauernhof: { name: 'Bauernhof', v: { table: 'dunkelgruen', tablePat: 'filz', bg: 'heu', bgPat: 'dielen', back: 'rot', backPat: 'kuh' } },
  klassisch: { name: 'Klassisch', v: { table: 'gruen', tablePat: 'glatt', bg: 'wiese', bgPat: 'streifen', back: 'rot', backPat: 'streifen' } },
  scheune: { name: 'Scheune', v: { table: 'dunkelgruen', tablePat: 'glatt', bg: 'scheune', bgPat: 'dielen', back: 'blau', backPat: 'karo' } },
  nacht: { name: 'Nacht', v: { table: 'blau', tablePat: 'filz', bg: 'anthrazit', bgPat: 'punkte', back: 'gold', backPat: 'rauten' } },
};
export const DEFAULT_THEME = PRESETS.casino.v;

const KEY = 'kh_theme';
export function loadTheme(store) {
  try { return { ...DEFAULT_THEME, ...JSON.parse(store.get(KEY) || '{}') }; } catch { return { ...DEFAULT_THEME }; }
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

// Inhalt des Fensters „Aussehen“
export function themeModal(t) {
  const tb = TABLES[t.table] || TABLES.petrol;
  const bg = BACKGROUNDS[t.bg] || BACKGROUNDS.bordeaux;
  const bk = BACKS[t.back] || BACKS.rot;
  const presetOn = Object.entries(PRESETS).find(([, p]) => Object.keys(p.v).every((k) => p.v[k] === t[k]))?.[0];
  return `<h2>Aussehen</h2>
    <p class="tnote">Gilt nur auf diesem Gerät. ${tipMark} = unsere Empfehlung.</p>
    <div class="tprev" aria-hidden="true"><div class="tprev-table"><span class="tprev-card"></span><span class="tprev-back"></span><span class="tprev-back b2"></span></div></div>
    <h3>Vorlagen</h3>
    <div class="tpresets">${Object.entries(PRESETS).map(([id, p]) => `<button type="button" class="tpreset ${presetOn === id ? 'on' : ''}" data-m="themePreset" data-v="${id}">
      <span class="tpp" style="background:${(PATTERNS[p.v.bgPat] || PATTERNS.glatt).css === 'none' ? '' : `${PATTERNS[p.v.bgPat].css},`} ${BACKGROUNDS[p.v.bg].c}"><i style="background:${TABLES[p.v.table].c[1]}"></i><b style="background:${BACKS[p.v.back].c[0]}"></b></span>
      <small>${esc(p.name)}</small>${p.tip ? tipMark : ''}</button>`).join('')}</div>
    <h3>Spielfeld</h3>
    ${swatches('table', TABLES, t.table, (o) => `background:${o.c[1]}`)}
    ${patterns('tablePat', PATTERNS, t.tablePat, tb.c[1], 'glatt')}
    <h3>Hintergrund</h3>
    ${swatches('bg', BACKGROUNDS, t.bg, (o) => `background:${o.c}`)}
    ${patterns('bgPat', PATTERNS, t.bgPat, bg.c, 'streifen')}
    <h3>Kartenrücken</h3>
    ${swatches('back', BACKS, t.back, (o) => `background:${o.c[0]}`)}
    ${patterns('backPat', BACK_PATTERNS, t.backPat, bk.c[0], 'streifen')}
    <div class="tfoot"><button type="button" class="pill pill-white pill-small" data-m="themeReset">Zurück auf Empfehlung</button></div>`;
}
