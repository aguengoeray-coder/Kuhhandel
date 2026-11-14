// Kuhhandel – Spieltisch im Querformat (alle Spielphasen)
import { shopAvatar, shopAvatarFull } from './shopavatars.js';
import {
  ANIMALS, ANIMAL_BY_ID, DONKEY_PAYOUTS, BID_STEP, CANTPAY_HOLD_MS, AUCTION_START_MS, AUCTION_BID_MS, auctionStartMs, auctionBidMs, isTurbo,
  viewFor, possibleTrades, scores, currentPlayer,
  drawForAuction, bid, passAuction, closeAuction, pay,
  startTrade, acceptTrade, counterTrade, bestPay,
  RAT, RAT_COUNT, SPECIAL_VALUE, awards, SPECIAL_TICK_MS, SPECIAL_FROM, BATZEN_SHOW_MS, scoreFor,
  isBoerse, kursValue, KURS_STEP, DIVIDENDE, HEKTIK_COUNT, HEKTIK_MS,
  ratCurrent, ratLay, ratTake, buzz, rpsPick, specialDecide, specialStage, specialNumber, specialResult, specialDecideAt, chooseBlock, batzenStage, showBatzen,
} from '../src/engine.js';
import { art, STAR } from './animals.js';
import { haptic } from './haptics.js';

export const SEAT_COLORS = ['#C2570C', '#1D5FC2', '#B8285F', '#6D3FC0'];
export const ANIMAL_COLORS = {
  // deutlich unterschiedliche Farben je Tierart
  pferd: '#E3262E',   // knallrot
  kuh: '#1E3A8A',     // dunkelblau
  schwein: '#C2185B', // dunkelrosa
  esel: '#F28C1B',    // orange
  katze: '#8E44AD',   // lila
  hund: '#5EC4F0',    // hellblau
  hahn: '#8EDB5A',    // hellgrün
  gans: '#FFD23F',    // gelb
  schaf: '#14A39A',   // türkis
  ziege: '#7A4E2D',   // braun
  ratte: '#8D8790',   // grau
};
// Dunkle Farben bekommen weiße Schrift auf dem Namensband
const DARK_ANIMALS = new Set(['pferd', 'kuh', 'schwein', 'katze', 'ziege', 'schaf']);
const RPS_ICON = { stein: '✊', schere: '✌️', papier: '✋' };
const RPS_NAME = { stein: 'Stein', schere: 'Schere', papier: 'Papier' };
const MONEY_COLORS = { 0: '#ECE7DB', 10: '#F6D98B', 20: '#F2B880', 50: '#A8D5B5', 100: '#9FC9E8', 200: '#C9B6E4', 500: '#E7A1A0' };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sum = (a) => a.reduce((x, y) => x + y, 0);
const aname = (id) => (id === RAT ? 'Ratte' : ANIMAL_BY_ID[id].name);
// Tier mit Artikel im Akkusativ: „den Hahn“, „die Kuh“, „das Schwein“
const ART_AKK = { hahn: 'den', gans: 'die', katze: 'die', hund: 'den', schaf: 'das', ziege: 'die', esel: 'den', schwein: 'das', kuh: 'die', pferd: 'das', [RAT]: 'die' };
const theAnimal = (id) => `${ART_AKK[id] || 'die'} ${aname(id)}`;
// Esel-Wurf: wann der erste Papierball fliegt, Abstand zwischen den Würfen, Flugzeit (ms ab Aufdecken)
const ESEL_THROW_AT = 2450, ESEL_THROW_GAP = 360, ESEL_FLIGHT = 300;
const PUNCH_MS = 3400; // Admin-Fähigkeit „Verprügeln“: Dauer der Animation
// Börsen-Chaos: aktuelle Kurse des gerade gezeichneten Spiels (null = Grundwerte)
let KURSE = null;
const aval = (id) => (id === RAT ? null : kursValue(id, KURSE));
const specialsOf = (p) => p.specials || [];
const ratsOf = (p) => p.animals[RAT] || 0;
const karten = (n) => (n === 1 ? '1 Karte' : `${n} Karten`);
const initial = (n) => esc((n || '?').trim().charAt(0).toUpperCase());

// ---------- kleine Bausteine ----------

// Innenleben eines Geldscheins: große Zahl in der Mitte, kleine Zahlen oben links und unten rechts
const mIn = (v) => `<span class="mv">${v}</span>`;
// Glitzer: funkelnde Sterne über wertvollen Karten (große Scheine, Schwein/Kuh/Pferd)
const GLITZ = [[12, 18], [86, 10], [50, 4], [94, 52], [6, 60], [70, 90], [24, 94], [58, 40], [36, 66], [80, 72], [16, 38], [44, 22], [66, 14], [92, 88]];
const glitz = (n, cls = '') => `<span class="glitz ${cls}" aria-hidden="true">${GLITZ.slice(0, n).map(([x, y], k) => `<i style="--x:${x}%;--y:${y}%;--d:${(k * 263) % 1300}ms;--s:${(0.6 + ((k * 37) % 50) / 100).toFixed(2)}"></i>`).join('')}</span>`;

function moneyCard(v, { idx = null, selected = false, size = '' } = {}) {
  const cls = `money ${size} ${selected ? 'sel' : ''}`;
  const style = `--m:${MONEY_COLORS[v] || '#eee'}`;
  if (idx === null) return `<div class="${cls}" style="${style}">${mIn(v)}</div>`;
  return `<button type="button" class="${cls}" style="${style}" data-a="toggle" data-v="${idx}" aria-pressed="${selected}" aria-label="Geldkarte ${v}">${mIn(v)}</button>`;
}

// Ausgewählte Scheine: Tippen nimmt sie wieder zurück
function chosenCards(money, sel, empty = 4, added = null) {
  const cards = sel.map((i) => `<button type="button" class="money xs ${i === added ? 'in' : ''}" style="--m:${MONEY_COLORS[money[i]]}" data-a="remove" data-v="${i}" aria-label="${money[i]} zurücknehmen">${mIn(money[i])}</button>`).join('');
  return cards + Array.from({ length: Math.max(0, empty - sel.length) }, () => '<div class="slot"></div>').join('');
}

function animalMini(id, n) {
  const shadows = [];
  for (let i = 1; i < n; i++) shadows.push(`${i * 3}px ${-i * 3}px 0 -1px #D6CCB4`);
  const v = aval(id);
  return `<div class="amini ${n === 4 && id !== RAT ? 'quartet' : ''} ${id === RAT ? 'rat' : ''}" title="${aname(id)}">
    <div class="acard" style="--a:${ANIMAL_COLORS[id]};box-shadow:${shadows.join(',') || 'none'}"><i></i><b>${art(id)}</b>${v != null ? `<em class="cv">${v}</em>` : ''}</div>
    <span>${n === 4 && id !== RAT ? aname(id) + ' ✓' : aname(id) + ' ×' + n}</span>
  </div>`;
}

// Auslage: ein Stapel pro Tierart, jede weitere Karte sichtbar versetzt dahinter
function stackHtml(id, n, { special = false, bump = false, tap = false, trade = false } = {}) {
  const v = aval(id);
  const done = n === 4 && id !== RAT;
  const cards = Array.from({ length: n }, (_, k) => `<div class="scard ${DARK_ANIMALS.has(id) ? 'dark' : ''}" style="--k:${n - 1 - k};--a:${ANIMAL_COLORS[id]}">${k === n - 1 ? `${v != null ? `<em>${v}</em>` : ''}<b>${art(id)}</b>` : ''}</div>`).join('');
  const near = n === 3 && id !== RAT;
  const label = `${n}×`; // v0.56.2: wie bei den Mitspielern – Anzahl statt „noch …“
  return `<div class="stack ${done ? 'done' : ''} ${near ? 'near' : ''} ${id === RAT ? 'rat' : ''} ${bump ? 'bump' : ''} ${trade ? 'cantrade' : ''}" data-animal="${id}" style="--n:${n}" title="${n}× ${aname(id)}${special ? ' + Spezialkarte' : ''}"${tap ? ` data-a="setTrade" data-v="${id}" role="button" aria-label="${trade ? `Kuhhandel um ${aname(id)}` : `${aname(id)}: kein Kuhhandel möglich`}"` : ''}>
    <div class="spile">${cards}${special ? `<span class="sstar">${STAR}</span>` : ''}${done ? '<span class="scheck">✓</span>' : ''}</div>
    <span class="slabel">${label}</span>
  </div>`;
}

// Spezialkarte (klein): Tierbild mit Stern, Wert 250
function specialMini(id) {
  return `<div class="amini special" data-animal="${id}" title="${aname(id)}-Spezialkarte">
    <div class="acard sp" style="--a:${ANIMAL_COLORS[id]}"><i></i><b>${art(id)}</b>${STAR}<em class="cv">${SPECIAL_VALUE}</em></div>
    <span>${aname(id)} ★</span>
  </div>`;
}

// Kleine Symbole in der Spielerspalte: „2× [Tier]“, Ratten, Spezialkarten
// Höchstens eine Reihe: Quartette zuerst, dann Ratten, Spezialkarten, dann nach Anzahl und Wert; Rest als „+N“
const CHIP_MAX = 7; // passt in eine Reihe unter dem Profil
function playerChips(p, tradeable = new Set(), max = CHIP_MAX) {
  const items = [];
  const chip = (id, cls, inner, title) => (tradeable.has(id)
    ? `<button type="button" class="chip ${cls} tradechip" data-a="tradeWith" data-v="${esc(p.id)}|${id}" aria-label="Kuhhandel mit ${esc(p.name)} um ${aname(id)}">${inner}</button>`
    : `<span class="chip ${cls}" title="${title}">${inner}</span>`);
  for (const a of ANIMALS) {
    const n = p.animals[a.id] || 0;
    if (n > 0) items.push({ rank: n === 4 ? 0 : tradeable.has(a.id) ? 1 : 3, n, val: a.value, html: chip(a.id, `card ${n === 4 ? 'done' : n === 3 ? 'near3' : ''}`, `${miniCard(a.id)}<em>${n === 4 ? '✓' : `${n}×`}</em>`, `${n}× ${a.name}`) });
  }
  const r = ratsOf(p);
  if (r > 0) items.push({ rank: tradeable.has(RAT) ? 1 : 2, n: r, val: 0, html: chip(RAT, 'card rat', `${miniCard(RAT)}<em>${r}×</em>`, `${r}× Ratte`) });
  for (const id of specialsOf(p)) items.push({ rank: 4, n: 1, val: SPECIAL_VALUE, html: `<span class="chip card sp" title="${aname(id)}-Spezialkarte">${miniCard(id)}${STAR}</span>` });
  items.sort((x, y) => x.rank - y.rank || y.n - x.n || y.val - x.val);
  if (items.length <= max) return items.map((x) => x.html).join('');
  return items.slice(0, max - 1).map((x) => x.html).join('') + `<span class="chip more">+${items.length - max + 1}</span>`;
}

// Rechnung für die Wertung, z. B. „(800 + 250★ + 1000) × 2 + 250★ = 4350“
export function scoreFormula(p, blocked = null, withMoney = false) {
  const specials = p.specials || [];
  const quartets = ANIMALS.filter((a) => p.animals[a.id] === 4 && a.id !== blocked);
  const parts = [];
  for (const a of quartets) parts.push(specials.includes(a.id) ? `${aval(a.id)}+${SPECIAL_VALUE}★` : `${aval(a.id)}`);
  const loose = specials.filter((id) => !quartets.some((a) => a.id === id)).length;
  const r = scoreFor(p, blocked, withMoney, KURSE); const total = r.score;
  let text = quartets.length ? `(${parts.join(' + ')}) × ${quartets.length}` : '';
  if (loose) text += `${text ? ' + ' : ''}${loose > 1 ? `${loose} × ` : ''}${SPECIAL_VALUE}★`;
  if (withMoney && r.money) text += `${text ? ' + ' : ''}${r.money} Geld`;
  return `${text || 'keine Quartette'} = ${total}`;
}

// Großansicht eines Mitspielers (im Emoji-Fenster): Tiere, Ratten, Spezialkarten, Kartenanzahl
function playerDetail(p, withScore = false) {
  const items = [];
  for (const a of ANIMALS) {
    const n = p.animals[a.id] || 0;
    if (n) items.push(`<span class="pd ${n === 4 ? 'done' : ''}">${miniCard(a.id)}<b>${n}×</b><small>${aval(a.id)}</small></span>`);
  }
  const r = ratsOf(p);
  if (r) items.push(`<span class="pd">${miniCard(RAT)}<b>${r}×</b><small>Ratte</small></span>`);
  for (const id of specialsOf(p)) items.push(`<span class="pd sp"><span class="pdsp">${miniCard(id)}${STAR}</span><b>★</b><small>${SPECIAL_VALUE}</small></span>`);
  const count = Array.isArray(p.money) ? p.money.length : p.money;
  const pts = withScore ? `<div class="pdscore"><span>Punkte</span><b>${scoreFor(p, null, false, KURSE).score}</b><small>${scoreFormula(p)}</small></div>` : '';
  return `<div class="pdetail">${pts}<div class="pdgrid">${items.join('') || '<em>Noch keine Karten</em>'}</div>${withScore ? '' : `<small>${karten(count)} Geld</small>`}</div>`;
}

function specialCard(id, extraRows = '', cls = '') {
  return `<div class="bigcard spcard ${cls}">${playCard(id, 'special')}
    <div class="bcinfo"><div class="bctitle">Spezialkarte<small>Wert ${SPECIAL_VALUE} · nicht handelbar</small></div>${extraRows}</div>
  </div>`;
}

function ratCard(extraRows = '', cls = '') {
  return `<div class="bigcard ratcard ${cls}">${playCard(RAT, 'rat')}
    <div class="bcinfo"><div class="bctitle">Ratte<small>Wer am Ende alle 4 hat: −1 Quartett</small></div>${extraRows}</div>
  </div>`;
}

// Eine Spielkarte im Hochformat: Wert oben links und unten rechts, Bild in der Mitte, Name unten auf einem Band
// Kleine Tierkarte (Strahlen, ohne Kreis) für Kacheln und Zeilen
export function miniCard(id, cls = '') {
  return `<span class="mcard ${cls} ${DARK_ANIMALS.has(id) ? 'dark' : ''}" style="--a:${ANIMAL_COLORS[id]}">${art(id)}</span>`;
}

function playCard(id, kind = 'animal') {
  const val = kind === 'special' ? SPECIAL_VALUE : kind === 'rat' ? '' : ANIMAL_BY_ID[id].value;
  const name = aname(id).toUpperCase();
  return `<div class="pcard ${kind} ${DARK_ANIMALS.has(id) ? 'dark' : ''}" style="--a:${ANIMAL_COLORS[id]}">
    ${val !== '' ? `<span class="pcv">${val}</span>` : ''}
    ${kind === 'special' ? `<span class="pcstar">${STAR}</span>` : ''}
    <div class="pcart">${art(id)}</div>
    <div class="pcname">${name}</div>
  </div>`;
}

function bigAnimalCard(id, extraRows = '', cls = '') {
  return `<div class="bigcard ${cls}">${playCard(id)}
    <div class="bcinfo"><div class="bctitle">${esc(aname(id))}<small>Quartettwert ${ANIMAL_BY_ID[id].value}</small></div>${extraRows}</div>
  </div>`;
}

let avatarLookup = () => null; // wird pro Darstellung gesetzt (Spielerbild aus dem Profil)
function avatar(p, idx, extra = '') {
  const pr = avatarLookup(p.id);
  if (pr?.shop) return `<div class="avatar pic shopav" style="--c:${SEAT_COLORS[idx]}" aria-hidden="true">${shopAvatar(pr.shop)}</div>${extra}`;
  if (pr) return `<div class="avatar pic" style="--c:${SEAT_COLORS[idx]};--bg:${pr.color}" aria-hidden="true">${art(pr.animal)}</div>${extra}`;
  return `<div class="avatar" style="--c:${SEAT_COLORS[idx]}" aria-hidden="true">${initial(p.name)}</div>${extra}`;
}

// v0.54: Ganzkörper-Figur (Siegertreppchen, Jubel) – ohne Shop-Avatar der runde Kopf
function figure(p, idx, cls = '') {
  const pr = avatarLookup(p.id);
  return pr?.shop ? `<span class="pfig ${cls}" style="--c:${SEAT_COLORS[idx]}" aria-hidden="true">${shopAvatarFull(pr.shop)}</span>` : avatar(p, idx);
}

// ---------- Hauptfunktion ----------

// Nach einem Ergebnis (Zuschlag, Kuhhandel, Spezialkarte, Ratte, Geldschein) kurz Pause, bevor aufgedeckt werden darf
// Auslage: bei wenigen Tieren etwas größer (mehr Platz ist zwischen Stapel und Geld nicht)
const AUSLAGE_MAX = 1;
const SHELF_MAX = 1.18; // v0.59.1: Mitte kleiner → Tiere größer (Alps Wahl B) // v0.59: Regal über dem Geld – eine Reihe, höchstens 90 % (passt unter die Karte in der Mitte)
const DEMO_JUB = typeof location !== 'undefined' && new URLSearchParams(location.search).has('mejub'); // Screenshot: deine Figur jubelt
export const CALM_MS = 2500;
// Ergebnis-Fenster: so lange bleibt es stehen
const EV_WAIT = { auction_won: 3000, special_won: 3500, trade: 4800, rat_taken: 3500 }; // Kuhhandel: inkl. ~1 s Aufdecken
// Stapel leer (nur noch Kuhhandel): Ergebnis kürzer zeigen, damit es flott weitergeht
export const evWait = (type, deckLeft) => (type === 'trade' && deckLeft === 0 ? 3800 : EV_WAIT[type]);
// Verschnaufpause nach einem Ergebnis: so lange wie das Ergebnis-Fenster steht (+0,5 s für langsamere Handys)
// Ablauf nach einem Ergebnis – EIN Plan, aus den echten Flügen berechnet (nicht geschätzt):
//   Fenster steht (W) → Tier fliegt → Geld fliegt (Kuhhandel: erst Angebot hin, wenn gelandet Gegenangebot zurück)
//   → kurze Ruhe → gelber „dran“-Rahmen wandert → erst dann darf aufgedeckt werden.
const FLY_MS = 1200; // Tierkarte (.fly)
const MFLY_MS = 1000; // ein Geldschein (.mfly)
const MSTEP = 70; // Abstand zwischen zwei Scheinen
const HALO_PAUSE = 700; // Ruhe nach dem letzten Schein
const OFFER_FLY = 1350; // Kuhhandel: Angebot fliegt los, wenn der „KUHHANDEL!“-Auftritt ausblendet
const OFFER_LAND = OFFER_FLY + MFLY_MS - 150; // … und liegt dann in der Mitte
const HALO_MS = 900; // Rahmen wandert
const cntOf = (x) => (Array.isArray(x) ? x.length : x || 0);
const streamMs = (c) => (Math.min(c, 15) - 1) * MSTEP + MFLY_MS;
export function choreo(le, deckLeft, W = evWait(le.type, deckLeft) || 0, piles = null) {
  const n = le.type === 'trade' ? le.count || 1 : 1;
  const payAt = W + FLY_MS + (n - 1) * 120; // Tier ist gelandet
  const streams = [];
  if (le.type === 'auction_won' && le.amount > 0 && le.payer && le.payee) streams.push({ from: le.payer, to: le.payee, count: le.cardCount || 1, at: payAt });
  if (le.type === 'special_won' && le.count > 0 && le.payer && le.payee) streams.push({ from: le.payer, to: le.payee, count: le.count, at: payAt });
  // Kuhhandel: das Geld wird schon im Ergebnisfenster getauscht (Stapel rutschen auf die andere Seite) – danach fliegt nur das Tier
  if (le.type === 'rat_taken') {
    // v0.52.1: der Topf liegt in der Mitte – von dort fliegt das ganze Geld zum Nehmer (nicht aus den Händen der anderen)
    if (le.count) streams.push({ from: '@pot', to: le.player, count: le.count, at: payAt });
  }
  const end = Math.max(payAt, ...streams.map((x) => x.at + streamMs(x.count)));
  return { W, payAt, streams, end, haloAt: end + HALO_PAUSE, calm: end + HALO_PAUSE + HALO_MS };
}
export const calmFor = (le, deckLeft) => (le && EV_WAIT[le.type] ? choreo(le, deckLeft).calm : CALM_MS);
const CANTPAY_MS = CANTPAY_HOLD_MS; // „Kann nicht zahlen“: so lange sehen alle die Scheine groß (Spiel wartet so lange)
export const CALM_TYPES = ['auction_won', 'trade', 'special_won', 'rat_taken', 'money_drawn'];

// Auslage passt nicht in ihre Breite (viele Tiere, große Schrift)? Dann nachmessen und kleiner machen – nie unter die Knöpfe
function fitAuslage(root) {
  const a = root.querySelector('.auslage');
  if (!a || !a.children.length) return;
  const box = a.getBoundingClientRect();
  const kids = [...a.children].map((e) => e.getBoundingClientRect()).filter((r) => r.width);
  if (!kids.length || !box.width) return;
  const used = Math.max(...kids.map((r) => r.right)) - Math.min(...kids.map((r) => r.left));
  if (used <= box.width + 1) return;
  const sc = Number(a.style.getPropertyValue('--sc')) || 1;
  a.style.setProperty('--sc', (sc * (box.width / used) * 0.97).toFixed(3));
}

// Hohe Plätze oben (3 Spieler, viele Tiere): Tischmitte nach unten rücken, damit die Zeile „… versteigert“ nicht in den Platz ragt
function fitTop(root) {
  const st = root.querySelector('.stage');
  const gt = st && st.querySelector('.gtable');
  if (!gt) return;
  const S = st.getBoundingClientRect();
  const s = S.height / st.offsetHeight || 1;
  const tops = [...st.querySelectorAll('.gright > .prow.seat-t, .gright > .prow.seat-tl, .gright > .prow.seat-tr')];
  if (!tops.length) return;
  const bottom = Math.max(...tops.map((e) => (e.getBoundingClientRect().bottom - S.top) / s));
  const pad = Math.round(bottom + 4 - gt.offsetTop); // 4 px Luft unter dem Platz
  const base = parseFloat(getComputedStyle(gt).paddingTop) || 62;
  if (pad > base) gt.style.paddingTop = `${Math.min(pad, base + 30)}px`;
}

// Eigene neue Karte: genau auf den passenden Stapel in deiner Auslage fliegen lassen (Ziel erst nach dem Zeichnen bekannt)
function aimFly(root) {
  const stage = root.querySelector('#stage');
  if (!stage) return;
  const sr = stage.getBoundingClientRect();
  const sc = sr.width / stage.offsetWidth || 1;
  const aimed = [];
  root.querySelectorAll('.fly[data-flyto]').forEach((f) => {
    const id = f.dataset.flyto;
    const t = root.querySelector(`.auslage [data-animal="${id}"] .spile, .auslage [data-animal="${id}"] .acard`);
    if (!t) return;
    const r = t.getBoundingClientRect();
    if (!r.width) return;
    const cx = (r.left + r.width / 2 - sr.left) / sc;
    const cy = (r.top + r.height / 2 - sr.top) / sc;
    f.style.setProperty('--tx', `${Math.round(cx - (f.offsetLeft + f.offsetWidth / 2))}px`);
    f.style.setProperty('--ty', `${Math.round(cy - (f.offsetTop + f.offsetHeight / 2))}px`);
    f.style.setProperty('--fs', (r.width / sc / f.offsetWidth).toFixed(3));
    aimed.push(f);
  });
  // wie in aimFx: Animation mit dem gemessenen Ziel neu anlegen
  aimed.forEach((f) => { f.style.animationName = 'none'; });
  if (aimed.length) void stage.offsetWidth;
  aimed.forEach((f) => { f.style.animationName = ''; });
}

// Wo sitzt jemand auf der Bühne? Mitspieler: Mitte ihres Bildes am Platz · du: dein Geld unten (sonst unten Mitte)
function seatPoint(root, pid, sr, sc) {
  // „@pot“: der Topf in der Mitte (Rattenrunde) – ist er schon weg, die Tischmitte
  if (pid === '@me') {
    const el = root.querySelector('.meplate .mefig');
    if (el) { const r = el.getBoundingClientRect(); return { x: (r.left + r.width / 2 - sr.left) / sc, y: (r.top + r.height * 0.3 - sr.top) / sc }; }
  }
  // „@card“: Mitte der Karte in der Mitte · „@esel“: Wurfhand des Muskel-Esels (über der Karte, rechts)
  if (pid === '@card' || pid === '@esel') {
    const el = root.querySelector('.tcenter .aucard') || root.querySelector('.tcenter .bigcard') || root.querySelector('.tcenter');
    if (el) { const r = el.getBoundingClientRect(); const cx = (r.left + r.width / 2 - sr.left) / sc, cy = (r.top + r.height / 2 - sr.top) / sc, top = (r.top - sr.top) / sc;
      return pid === '@card' ? { x: cx, y: cy } : { x: cx + 60, y: top + 40 }; }
  }
  // v0.62 „Profilbild wird lebendig“: '@near:<pid>' = Stehplatz neben dem Profilbild Richtung Tischmitte,
  // '@myfan' = Mitte deines Geldes, '@cl'/'@cr' = links/rechts der Tischmitte (Polonaise)
  if (pid === '@cl' || pid === '@cr') return { x: sr.width / sc / 2 + (pid === '@cl' ? -150 : 150), y: sr.height / sc * 0.5 };
  if (pid === '@myfan') {
    const fans = [...root.querySelectorAll('.fan-wrap .money.fan')].map((e) => e.getBoundingClientRect());
    if (fans.length) { const l = Math.min(...fans.map((r) => r.left)); const rr = Math.max(...fans.map((r) => r.right)); const t = Math.min(...fans.map((r) => r.top)); return { x: ((l + rr) / 2 - sr.left) / sc, y: (t + 10 - sr.top) / sc }; }
    return { x: sr.width / sc / 2, y: sr.height / sc - 50 };
  }
  if (typeof pid === 'string' && pid.startsWith('@near:')) {
    const who = pid.slice(6);
    const a = seatPoint(root, who, sr, sc);
    if (who === '@me') return { x: a.x - 6, y: a.y + 8 };
    const cx = sr.width / sc / 2, cy = sr.height / sc / 2;
    const dx = cx - a.x, dy = cy - a.y, d = Math.hypot(dx, dy) || 1;
    return { x: a.x + (dx / d) * 64, y: a.y + (dy / d) * 64 + 26 };
  }
  // „@offer“: das verdeckte Angebot in der Mitte (Kuhhandel/Rattenhandel)
  if (pid === '@pot' || pid === '@offer') {
    const el = pid === '@offer' ? root.querySelector('.tpanel .kslots') || root.querySelector('.tcenter') : root.querySelector('.potbox .pot') || root.querySelector('.tcenter');
    if (el) { const r = el.getBoundingClientRect(); return { x: (r.left + r.width / 2 - sr.left) / sc, y: (r.top + r.height / 2 - sr.top) / sc }; }
    return { x: sr.width / sc / 2, y: sr.height / sc / 2 };
  }
  const seat = root.querySelector(`.prow[data-pid="${CSS.escape(pid)}"] .avatar`);
  if (seat) { const r = seat.getBoundingClientRect(); return { x: (r.left + r.width / 2 - sr.left) / sc, y: (r.top + r.height / 2 - sr.top) / sc }; }
  // du (kein Platz oben): Mitte deines Geldfächers – oder unten Mitte, wenn gerade keiner da ist
  const fans = [...root.querySelectorAll('.fan-wrap .money.fan')].map((e) => e.getBoundingClientRect());
  if (fans.length) { const l = Math.min(...fans.map((r) => r.left)); const rr = Math.max(...fans.map((r) => r.right)); const t = Math.min(...fans.map((r) => r.top)); return { x: ((l + rr) / 2 - sr.left) / sc, y: (t + 24 - sr.top) / sc }; }
  return { x: sr.width / sc / 2, y: sr.height / sc - 38 };
}
// v0.59: Sprechblasen kommen aus dem Mund – unter dem Bild des Mitspielers, Zipfel nach oben zum Mund.
// Steht das Bild rechts auf der Bühne, wächst die Blase nach links (sonst ragte sie aus dem Bildschirm).
function mouthBubbles(root) {
  const stage = root.querySelector('#stage');
  if (!stage) return;
  const sr = stage.getBoundingClientRect();
  const sc = sr.width / stage.offsetWidth || 1;
  root.querySelectorAll('.prow > .rbubble').forEach((b) => {
    const pr = b.parentElement; const av = pr.querySelector('.avatar');
    if (!av) return;
    const a = av.getBoundingClientRect(); const r = pr.getBoundingClientRect();
    const ax = (a.left - r.left) / sc, ay = (a.top - r.top) / sc, aw = a.width / sc;
    const right = (a.left + a.width / 2 - sr.left) / sc > stage.offsetWidth * 0.62;
    b.classList.add('mouth'); b.classList.toggle('rt', right);
    b.style.top = `${Math.round(ay + aw * 0.86)}px`;
    if (right) { b.style.left = 'auto'; b.style.right = `${Math.round(r.width / sc - ax - aw * 0.5 - 18)}px`; }
    else { b.style.right = 'auto'; b.style.left = `${Math.round(ax + aw * 0.5 - 18)}px`; }
  });
}
// Effekte mit data-aim-to / data-aim-from: Start und Ziel nach dem Zeichnen messen (kein fest eingebautes Ziel mehr)
function aimFx(root) {
  const stage = root.querySelector('#stage');
  if (!stage) return;
  const sr = stage.getBoundingClientRect();
  const sc = sr.width / stage.offsetWidth || 1;
  const aimed = [];
  root.querySelectorAll('[data-aim-to]').forEach((f) => {
    if (f.dataset.aimFrom) {
      const a = seatPoint(root, f.dataset.aimFrom, sr, sc);
      f.style.left = `${Math.round(a.x - f.offsetWidth / 2 + (Number(f.dataset.aimFdx) || 0))}px`;
      f.style.top = `${Math.round(a.y - f.offsetHeight / 2)}px`;
    }
    const b = seatPoint(root, f.dataset.aimTo, sr, sc);
    // Bezugspunkt: Mitte des Elements (bei „center“ ist es schon per translate(-50%,-50%) mittig gesetzt)
    const cx = f.dataset.aimAnchor === 'center' ? f.offsetLeft : f.offsetLeft + f.offsetWidth / 2;
    const cy = f.dataset.aimAnchor === 'center' ? f.offsetTop : f.offsetTop + f.offsetHeight / 2;
    f.style.setProperty('--tx', `${Math.round(b.x - cx + (Number(f.dataset.aimTdx) || 0))}px`);
    f.style.setProperty('--ty', `${Math.round(b.y - cy)}px`);
    if (f.dataset.aimScale) f.style.setProperty('--fs', f.dataset.aimScale);
    aimed.push(f);
  });
  // Animation neu anlegen, damit sie sicher mit dem gemessenen Ziel läuft (sonst fliegt sie in manchen Browsern
  // mit dem Startwert 0 los, weil das Ziel erst nach dem Zeichnen feststeht). seekFx spult danach auf die richtige Zeit.
  aimed.forEach((f) => { f.style.animationName = 'none'; });
  if (aimed.length) void stage.offsetWidth;
  aimed.forEach((f) => { f.style.animationName = ''; });
}

// Dauerschleifen (Wackeln, Leuchten, Sanduhr): an eine gemeinsame Uhr hängen, damit sie beim Neuzeichnen nicht auf Anfang springen
function syncLoops() {
  if (!document.getAnimations) return;
  document.getAnimations().forEach((a) => {
    try { if (a.effect && a.effect.getTiming().iterations === Infinity && a.startTime !== 0) a.startTime = 0; } catch { /* egal */ }
  });
}

// v0.62 Laufwege mit mehreren Stationen: data-route="a;b;c", data-offs="0,.3,1" (optional), data-dur, data-delay (ms)
function routeFx(root) {
  const stage = root.querySelector('#stage');
  if (!stage) return;
  const sr = stage.getBoundingClientRect(); const sc = sr.width / stage.offsetWidth || 1;
  root.querySelectorAll('[data-route]').forEach((f) => {
    const pts = f.dataset.route.split(';').map((pid) => seatPoint(root, pid, sr, sc));
    if (!pts.length || !f.animate) return;
    f.style.left = `${Math.round(pts[0].x - f.offsetWidth / 2)}px`; f.style.top = `${Math.round(pts[0].y - f.offsetHeight / 2)}px`;
    const offs = f.dataset.offs ? f.dataset.offs.split(',').map(Number) : pts.map((_, i) => i / Math.max(1, pts.length - 1));
    const kf = pts.map((pt, i) => ({ transform: `translate(${Math.round(pt.x - pts[0].x)}px, ${Math.round(pt.y - pts[0].y)}px)`, offset: Math.min(1, Math.max(0, offs[i] ?? i / (pts.length - 1))) }));
    try { f.animate(kf, { duration: Number(f.dataset.dur) || 2000, delay: Number(f.dataset.delay) || 0, fill: 'both', easing: 'ease-in-out' }); } catch { /* egal */ }
  });
}

// Einmal-Effekte, die schon laufen: Animationen auf die vergangene Zeit vorspulen (statt von vorn zu beginnen)
function seekFx(root) {
  root.querySelectorAll('[data-fxat]').forEach((w) => {
    const el = Date.now() - Number(w.dataset.fxat);
    if (el < 40) return;
    w.querySelectorAll('*').forEach((n) => (n.getAnimations ? n.getAnimations() : []).forEach((a) => { try { a.currentTime = el; } catch { /* egal */ } }));
  });
}

// ---------- v0.63 Encounter-Intro („VS“): Farbflächen + Figuren sliden rein, VS-Knall, dann weiter ----------
// Reine Anzeige (keine Spiellogik). parts: [{ fig, name, color, tag }], 2–n Teilnehmer; Aufteilung in schräge Bänder.
export const INTRO_MS = 1500, INTRO_SHORT_MS = 750;
const INTRO_DIRS = { 2: ['lt', 'rb'], 3: ['l', 't', 'r'], 4: ['l', 't', 'b', 'r'] };
function encounterHtml({ parts, title, badge = '', center = '', vs = 'VS', sub = '', short = false, rival = false, dark = false }) {
  const n = parts.length; const slant = n === 2 ? 11 : 6;
  const b = (k, top) => (k <= 0 ? 0 : k >= n ? 100 : (k / n) * 100 + (top ? slant : -slant));
  const dirs = INTRO_DIRS[n] || parts.map((_, i) => (i % 2 ? 'b' : 't'));
  const bands = parts.map((p, i) => {
    const poly = `polygon(${b(i, true)}% 0, ${b(i + 1, true)}% 0, ${b(i + 1, false)}% 100%, ${b(i, false)}% 100%)`;
    const cx = (b(i, true) + b(i + 1, true) + b(i, false) + b(i + 1, false)) / 4;
    return `<div class="eiband d-${dirs[i]}" style="--c:${p.color};clip-path:${poly};--k:${i}"><i class="eilines"></i></div>
      <div class="eiwho d-${dirs[i]}" style="left:${cx}%;--k:${i};--c:${p.color}"><div class="eifig">${p.fig}</div><b class="einame">${esc(p.name)}</b>${p.tag ? `<small class="eitag">„${esc(p.tag)}“</small>` : ''}</div>`;
  }).join('');
  return `<div class="eintro n${n} ${vs.length > 5 ? 'longvs' : ''} ${short ? 'short' : ''} ${dark ? 'dark' : ''} ${rival ? 'rival' : ''}" data-a="introSkip" role="button" aria-label="${esc(title)} – Tippen überspringt" style="--dur:${short ? INTRO_SHORT_MS : INTRO_MS}ms">
    ${bands}<i class="eiflash"></i>
    <div class="eititle"><b>${esc(title)}</b>${badge ? `<span class="eibadge">${esc(badge)}</span>` : ''}</div>
    <div class="eivs">${rival ? '<i class="eiflame"></i>' : ''}<b>${esc(vs)}</b>${center}${sub ? `<small class="eisub">${esc(sub)}</small>` : ''}</div></div>`;
}

// ---------- v0.62 „Profilbild wird lebendig“ ----------
// Standard-Körper für alle ohne Shop-Avatar: einfacher Körper in Platzfarbe, das runde Profilbild ist der Kopf
function genericBody(color) {
  const K = '#2B2B2B', S = `stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  return `<svg class="gbody" viewBox="0 0 120 200" aria-hidden="true">
    <path d="M48 150 44 190h15l3-38M72 150l4 40H61l-3-38" fill="#3B3F4A" ${S}/><path d="M40 188h21v8H38zM61 188h21l2 8H61z" fill="#2B2B2B" ${S}/>
    <path class="garm l" d="M36 86c-12 6-18 22-18 38l10 2 8-24" fill="${color}" ${S}/><circle cx="23" cy="128" r="7" fill="#F2C9A0" ${S}/>
    <path class="garm r" d="M84 86c12 6 18 22 18 38l-10 2-8-24" fill="${color}" ${S}/><circle cx="97" cy="128" r="7" fill="#F2C9A0" ${S}/>
    <path d="M34 84c6-8 16-12 26-12s20 4 26 12l-4 70H38z" fill="${color}" ${S}/><path d="M60 76v74" stroke="rgba(0,0,0,.25)" stroke-width="3"/></svg>`;
}
// Ganzkörper-Figur eines Spielers: Shop-Avatar (eigener Körper) oder Standard-Körper + Profilbild als Kopf
function aliveFig(p, i, shop) {
  if (shop) return `<div class="afull">${shopAvatarFull(shop)}</div>`;
  return `<div class="agen">${genericBody(SEAT_COLORS[i] || '#1D5FC2')}<div class="ahead">${avatar(p, i)}</div></div>`;
}

// ---------- v0.61.1 Muskel-Esel (Alps Wunsch): klettert aus der Karte, wirft mit Wucht, klettert zurück ----------
// eigene Zeichnung: Kopf = unser Esel-Bild, dazu trainierter Körper (Brust, Sixpack, Bizeps), rote Shorts.
// throwDelay: wann der erste Wurf-Schwung beginnt (ms, relativ), n: Anzahl Würfe (= Spieler)
function muscleDonkey(throwDelay, n) {
  const F = '#AEB4BC', D = '#9AA0A8', K = '#2B2B2B', S = `stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const swing = `style="animation-delay:${throwDelay}ms;animation-iteration-count:${n}"`;
  return `<svg class="mdonkey" viewBox="0 0 150 210" aria-hidden="true">
    <g class="etwist" ${swing}>
      <path d="M58 150 54 192h17l3-40M92 150l4 42H79l-3-40" fill="${F}" ${S}/>
      <path d="M50 191h23v9H48zM77 191h23l2 9H77z" fill="#4A4248" ${S}/>
      <path d="M68 62h16v14H68z" fill="${D}" ${S}/>
      <path d="M30 80c8-10 24-12 46-12s38 2 46 12l-14 52c-4 8-16 12-32 12s-28-4-32-12z" fill="${F}" ${S}/>
      <path d="M48 84c8 10 20 10 26 2M104 84c-8 10-20 10-26 2" fill="none" ${S}/>
      <path d="M66 104h20M64 116h24M66 128h20M76 100v34" fill="none" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M50 136h52l4 24H46z" fill="#E5484D" ${S}/><path d="M50 142h52" stroke="#fff" stroke-width="3"/>
      <g class="earm-l"><path d="M36 82c-14 4-22 16-24 30 0 6 4 8 8 6l10-18" fill="${F}" ${S}/><path d="M14 112c-4-10-2-24 6-32 6-2 12 2 10 8l-6 26" fill="${F}" ${S}/>
        <ellipse cx="22" cy="96" rx="9" ry="7" fill="${D}" opacity=".55"/><circle cx="24" cy="76" r="9" fill="${F}" ${S}/>
        <g class="ebills"><rect x="14" y="60" width="22" height="14" rx="2" fill="#A8D5B5" ${S} stroke-width="2"/><rect x="18" y="56" width="22" height="14" rx="2" fill="#F6D98B" ${S} stroke-width="2" transform="rotate(-12 29 63)"/></g></g>
      ${art('esel').replace('<svg ', '<svg x="41" y="0" width="70" height="70" ')}
      <path class="eangry" d="M58 30l12 5M94 30l-12 5" stroke="${K}" stroke-width="3.4" stroke-linecap="round"/>
      <g class="earm-r" ${swing}><path d="M114 82c14 2 24 14 26 28l-12 4-10-14" fill="${F}" ${S}/><path d="M128 114c2 10-2 18-8 22l-8-4 6-20" fill="${F}" ${S}/>
        <ellipse cx="128" cy="100" rx="9" ry="7" fill="${D}" opacity=".55"/><circle cx="118" cy="138" r="9" fill="${F}" ${S}/>
        <circle class="ehandball" cx="118" cy="148" r="9" fill="#A8D5B5" ${S} stroke-width="2"/></g>
    </g></svg>`;
}

// ---------- Börsen-Chaos: News-Karte, Kurszettel ----------
const NEWS_ICON = { rallye: '📈', crash: '📉', dividende: '💰', steuer: '🧾', panik: '🔀', hektik: '⚡' };
function newsTitle(e) {
  if (e.kind === 'rallye') return `Kursrallye ${aname(e.animal)}`;
  if (e.kind === 'crash') return `Kurssturz ${aname(e.animal)}`;
  return ({ dividende: 'Dividende', steuer: 'Steuerprüfung', panik: 'Marktpanik', hektik: 'Hektik' })[e.kind] || 'Börsen-News';
}
function newsReveal(e, meId, nameOf) {
  let body = '';
  let mine = '';
  if (e.kind === 'rallye' || e.kind === 'crash') body = `<div class="nwkurs">${miniCard(e.animal)}<s>${e.from}</s><b class="${e.kind === 'rallye' ? 'up' : 'down'}">${e.to} ${e.kind === 'rallye' ? '▲' : '▼'}</b></div><small>${e.kind === 'rallye' ? '+' : '−'}${e.pct || KURS_STEP} % bis Spielende</small>`;
  else if (e.kind === 'dividende') body = `<p>Alle bekommen <b>${e.amount ?? DIVIDENDE}</b> aus der Bank.</p>`;
  else if (e.kind === 'steuer') { body = '<p>Alle geben ihren <b>höchsten Schein</b> ab.</p>'; const l = e.lost && e.lost[meId]; mine = l != null ? `Du gibst <b>${l}</b> ab` : 'Du hattest keinen Schein'; }
  else if (e.kind === 'panik') { body = '<p>Jeder schiebt einen <b>zufälligen Schein</b> nach links.</p>'; const m = e.moved || {}; mine = `${m.gave != null ? `Du gibst <b>${m.gave}</b>` : 'Du gibst nichts'} · ${m.got != null ? `bekommst <b>${m.got}</b> von ${esc(nameOf(m.from))}` : 'bekommst nichts'}`; }
  else if (e.kind === 'hektik') body = `<p>Die nächsten <b>${HEKTIK_COUNT}</b> Versteigerungen laufen nur <b>${HEKTIK_MS / 1000} s</b>.</p>`;
  return `<div class="newsreveal k-${e.kind}" role="status"><div class="nwcard"><span class="nwtag">Börsen-News</span><i class="nwicon">${NEWS_ICON[e.kind] || '📰'}</i><b class="nwtitle">${esc(newsTitle(e))}</b>${body}${mine ? `<span class="nwmine">${mine}</span>` : ''}</div></div>`;
}
function kursZettel(state) {
  if (!isBoerse(state) || !state.kurse) return '';
  const rows = ANIMALS.filter((a) => state.kurse[a.id]).map((a) => { const up = state.kurse[a.id] > 0; return `<span class="kz ${up ? 'up' : 'down'}" style="--a:${ANIMAL_COLORS[a.id]}" title="${aname(a.id)}"><em>${art(a.id)}</em><b>${aval(a.id)}</b><i>${up ? '▲' : '▼'}</i></span>`; });
  return rows.length ? `<span class="kurszettel" aria-label="Kurse">${rows.join('')}</span>` : '';
}

export function renderGame(root, ctx) {
  const { state, meId, local } = ctx;
  KURSE = state.kurse || null;
  avatarLookup = ctx.avatarFor || (() => null);
  const sounds = [];
  const later = []; // Geräusche mit Verzögerung (z. B. Tierlaut, wenn die Karte umgedreht ist)
  const feel = (k) => { if (!local.haptAt || Date.now() - local.haptAt > 300) { local.haptAt = Date.now(); haptic(k, ctx.vibe !== false); } };
  const v = viewFor(state, meId);
  const meIdx = v.players.findIndex((p) => p.id === meId);
  const me = v.players[meIdx];
  const idxOf = (id) => v.players.findIndex((p) => p.id === id);
  const nameOf = (id) => (id === meId ? 'Du' : v.players[idxOf(id)]?.name || '?');
  // v0.62 „Profilbild wird lebendig“: Figur springt aus dem Profilbild (Kopf = Profilbildgröße) und steht daneben
  const figOf = (pid) => { const i = idxOf(pid); const pr = avatarLookup(pid); return aliveFig(v.players[i], i, pr?.shop); };
  const MOTH = '<svg viewBox="0 0 40 24" aria-hidden="true"><path d="M20 12C14 2 4 0 2 6s6 10 16 8C10 18 6 24 12 24s8-6 8-10c0 4 2 10 8 10s2-6-6-10c10 2 18-2 16-8S26 2 20 12z" fill="#B9B1A3" stroke="#3a332c" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 8v10" stroke="#3a332c" stroke-width="2.4" stroke-linecap="round"/></svg>';
  // Profilbild ist „leer“, solange die Figur draußen ist (Platz bekommt Klasse .out)
  const outMark = (pid, from, until) => { local.out = local.out || {}; const o = local.out[pid]; local.out[pid] = { from: o && o.until > Date.now() ? Math.min(o.from, from) : from, until: Math.max(o && o.until > Date.now() ? o.until : 0, until) }; wakeLocal(from); wakeLocal(until + 20); };
  // aliveGag: el = schon vergangene Zeit, delay = Start später (ms), raw = ohne eigene Vorspul-Hülle (für keepFx)
  const aliveGag = (pid, kind, el, dur, delay = 0, raw = false) => {
    if (idxOf(pid) < 0) return '';
    const at = pid === meId ? '@me' : esc(pid);
    const t0 = Date.now() - el;
    outMark(pid, t0 + delay, t0 + delay + dur);
    let extra = '';
    if (kind === 'pleite') extra = `<i class="ptasche l"></i><i class="ptasche r"></i><i class="pstaub"></i>${[0, 1, 2].map((k) => `<i class="pmotte m${k}" style="animation-delay:${delay + 700 + k * 260}ms">${MOTH}</i>`).join('')}<b class="pstempel" style="animation-delay:${delay + 500}ms">PLEITE!</b>`;
    if (kind === 'cheer') extra = `<b class="ameins" style="animation-delay:${delay + 350}ms">Meins!</b>${[0, 1, 2, 3, 4, 5].map((k) => `<i class="aconf c${k}" style="animation-delay:${delay + 300 + k * 40}ms"></i>`).join('')}`;
    const html = `<div class="alive k-${kind} ${pid === meId ? 'mine' : ''}" data-aim-from="${at}" data-aim-to="@near:${at}" style="--tx:0px;--ty:0px;--dur:${dur}ms;animation-delay:${delay}ms" aria-hidden="true"><div class="afig" style="animation-delay:${delay}ms">${figOf(pid)}</div>${extra}</div>`;
    return raw ? html : `<div class="fxk" data-fxat="${t0}">${html}</div>`;
  };
  // Tier-Figur (Kopf = Kartenbild) für Ratte, Polonaise, Kuhhandel-Koffer
  const beast = (id, cls = '', inner = '') => `<div class="beast ${cls}" style="--a:${ANIMAL_COLORS[id] || '#888'}"><i class="blegs"><b></b><b></b></i><i class="bhead">${art(id)}</i>${inner}</div>`;
  // v0.61 Prügel-Animation (Comic, keine echte Gewalt): Laufen → Staubwolke mit POW/BAM → zurück
  const punchFx = (pu) => {
    const src = pu.from === meId ? '@me' : esc(pu.from); const dst = pu.to === meId ? '@me' : esc(pu.to);
    const pr = avatarLookup(pu.from);
    const fig = figOf(pu.from);
    outMark(pu.from, pu.at, pu.at + PUNCH_MS);
    const who = `${esc(pu.from === meId ? 'Du' : nameOf(pu.from))} ${pu.from === meId ? 'verprügelst' : 'verprügelt'} ${esc(pu.to === meId ? 'dich' : nameOf(pu.to))}!`;
    return `<div class="pwalk ${pu.from === meId ? 'mine' : ''} ${pr?.shop ? 'full' : 'gen'}" data-aim-from="${src}" data-aim-to="${dst}" style="--tx:0px;--ty:0px" aria-hidden="true">${fig}</div>
      <div class="pcloud ${pu.to !== meId && /^t/.test(seatOf(pu.to)) ? 'low' : ''}" data-aim-from="${dst}" data-aim-to="${dst}" style="--tx:0px;--ty:0px" role="status"><i class="pc c1"></i><i class="pc c2"></i><i class="pc c3"></i><i class="pc c4"></i>
        <b class="pw w1">POW!</b><b class="pw w2">BAM!</b><b class="pw w3">KLATSCH!</b><em class="ps s1">⭐</em><em class="ps s2">✨</em><em class="ps s3">⭐</em><span class="pf f1">👊</span><span class="pf f2">🦶</span><span class="plabel">${who}</span></div>`;
  };
  const cur = currentPlayer(v);
  const myTurn = cur.id === meId;

  // Auswahl zurücksetzen, sobald sich im Spiel etwas getan hat
  const key = `${state.phase}|${state.turn}|${state.log.length}`;
  if (local.key !== key) {
    local.key = key;
    local.sel = [];
    local.ratSel = null;
    if (state.phase !== 'turn') local.tradeOpen = false;
  }
  let selSum = local.sel.reduce((s, i) => s + (me.money[i] ?? 0), 0);

  // Animationen nur bei echten Neuigkeiten abspielen, nicht bei jedem Neuzeichnen
  const prev = local.prev || {};
  const fresh = prev.logLen !== undefined && state.log.length !== prev.logLen;
  const entered = prev.phase !== state.phase;
  // Ist das letzte Ereignis wirklich neu? (Gebote, Herausforderungen usw. schreiben ins Protokoll, ändern es aber nicht)
  // Kennung aus Nummer und Art: zwei Ereignisse mit derselben Nummer (z. B. „umsonst“ und danach Geldschein) gelten trotzdem beide als neu
  const evN = v.lastEvent ? `${v.lastEvent.n}|${v.lastEvent.type}` : null;
  const evFresh = fresh && evN != null && local.seenEvN !== evN;
  if (evN != null) local.seenEvN = evN;
  // Verschnaufpause: nach einem Ergebnis kurz nicht weiter aufdecken, damit alle sehen, was passiert ist
  if (evFresh && state.phase === 'turn' && CALM_TYPES.includes(v.lastEvent?.type)) { local.calmDur = EV_WAIT[v.lastEvent.type] ? choreo(v.lastEvent, v.deck, undefined, v.lastEvent.type === 'rat_taken' ? local.ratLaid : null).calm : CALM_MS; local.calmUntil = Date.now() + local.calmDur; }
  const calmLeft = state.phase === 'turn' ? Math.max(0, (local.calmUntil || 0) - Date.now()) : 0;
  if (evFresh && state.phase === 'turn' && EV_WAIT[v.lastEvent?.type] && local.holder) local.turnHold = { id: local.holder, until: Date.now() + choreo(v.lastEvent, v.deck, undefined, v.lastEvent.type === 'rat_taken' ? local.ratLaid : null).haloAt }; // Rahmen wandert erst nach Tier + Geld + Ruhe
  if (local.turnHold && (Date.now() >= local.turnHold.until || state.phase !== 'turn')) local.turnHold = null;
  // Dein Geld kommt und geht sichtbar aus deiner Hand: bezahlte Scheine bleiben im Fächer, bis sie losfliegen;
  // bekommene erscheinen erst, wenn sie gelandet sind (und leuchten kurz).
  if (evFresh && (state.phase === 'turn' || state.phase === 'ended') && EV_WAIT[v.lastEvent?.type] && Array.isArray(me.money) && local.prevMoney) {
    const le0 = v.lastEvent; const t0 = Date.now();
    const ch0 = choreo(le0, v.deck, undefined, le0.type === 'rat_taken' ? local.ratLaid : null);
    const minus = (a, b) => { const r = [...a]; b.forEach((x) => { const i = r.indexOf(x); if (i >= 0) r.splice(i, 1); }); return r; };
    let lose; let gain;
    if (le0.type === 'trade' && (le0.challenger === meId || le0.target === meId) && Array.isArray(le0.offer)) {
      const counter = le0.accepted || !Array.isArray(le0.counter) ? [] : le0.counter;
      lose = le0.challenger === meId ? le0.offer : counter; gain = le0.challenger === meId ? counter : le0.offer;
    } else { lose = minus(local.prevMoney, me.money); gain = minus(me.money, local.prevMoney); }
    const outS = ch0.streams.find((x) => x.from === meId); const inS = ch0.streams.filter((x) => x.to === meId);
    local.handFx = lose.length || gain.length ? {
      lose: [...lose].sort((a, b) => a - b), gain: [...gain].sort((a, b) => a - b),
      loseAt: outS ? t0 + outS.at : le0.type === 'trade' ? t0 + ch0.W : t0,
      gainAt: inS.length ? t0 + Math.min(...inS.map((x) => x.at)) + MFLY_MS - 60 : le0.type === 'trade' ? t0 + ch0.W : t0,
    } : null;
  }
  if (Array.isArray(me.money)) local.prevMoney = me.money.slice();
  if (local.handFx && Date.now() > Math.max(local.handFx.loseAt, local.handFx.gainAt) + 1000) local.handFx = null;
  const outbidTag = () => { const t = Date.now() - (local.outbidAt || 0); return t < 1600 ? `<span class="outbid" aria-live="polite" style="animation-delay:-${t}ms">Überboten!</span>` : ''; };
  const realHolder = state.phase === 'ended' || state.phase === 'block' ? null : state.phase === 'rat' ? ratCurrent(v) : currentPlayer(v).id;
  const shownHolder = local.turnHold ? local.turnHold.id : realHolder;
  // „Wer ist dran“ wechselt: Platz leuchtet kurz auf, Überschrift klappt um (statt wandernder Kreis)
  if (shownHolder && local.flashFor !== shownHolder) { if (local.flashFor !== undefined) local.turnFlashAt = Date.now(); local.flashFor = shownHolder; }
  const flashEl = local.turnFlashAt ? Date.now() - local.turnFlashAt : 1e9;
  const flashing = flashEl < 1600;
  // Überboten: du lagst vorne, jetzt jemand anderes – das Schild erscheint über dem neuen Höchstgebot
  if (state.phase === 'auction' && prev.phase === 'auction' && prev.highMe && state.auction?.high && state.auction.high.player !== meId) local.outbidAt = Date.now();
  local.prev = { logLen: state.log.length, phase: state.phase, highMe: state.phase === 'auction' && state.auction?.high?.player === meId, aucId: state.phase === 'auction' ? state.log.length : null };

  const H = {}; // Klick-Aktionen dieser Darstellung
  H.addv = (val) => {
    const v = Number(val);
    const i = me.money.findIndex((m, k) => m === v && !local.sel.includes(k));
    if (i >= 0) { local.sel = [...local.sel, i]; local.justAdded = i; ctx.rerender(); }
  };
  H.remove = (i) => { local.sel = local.sel.filter((x) => x !== Number(i)); ctx.rerender(); };
  H.toggle = (i) => {
    i = Number(i);
    local.sel = local.sel.includes(i) ? local.sel.filter((x) => x !== i) : [...local.sel, i];
    ctx.rerender();
  };

  // ----- rechte Spalte: alle Spieler -----
  const auction = v.auction;
  const others = v.players.filter((p) => p.id !== meId);
  // Sitzordnung wie am echten Tisch: du unten, im Uhrzeigersinn weiter – links, oben, rechts (bei 3 Spielern oben links/oben rechts)
  const myIdx = v.players.findIndex((p) => p.id === meId);
  const seatList = v.players.map((_, k) => v.players[(Math.max(0, myIdx) + 1 + k) % v.players.length]).filter((p) => p.id !== meId);
  const SEATS = seatList.length >= 3 ? ['l', 't', 'r'] : seatList.length === 2 ? ['tl', 'tr'] : ['t'];
  const seatOf = (id) => SEATS[seatList.findIndex((p) => p.id === id)] || null;
  // Kuhhandel Schritt 1 (Gegner + Tier wählen): mögliche Gegner lassen sich auch direkt am Platz antippen
  const pickTrades = state.phase === 'turn' && myTurn && local.tradeOpen && !local.tradePicked ? possibleTrades(state, meId) : null;
  const pickTargets = pickTrades ? [...new Set(pickTrades.map((t) => t.target))] : [];
  if (pickTrades && !pickTargets.includes(local.tradeTarget)) local.tradeTarget = pickTargets[0];
  const tradeMap = {};
  if (state.phase === 'turn' && myTurn && !v.mustDraw && !calmLeft) possibleTrades(state, meId).forEach((t) => { (tradeMap[t.target] ||= new Set()).add(t.animal); });
  // dezente Pfeile zwischen den Plätzen: so herum wird gespielt
  const seatArrows = SEATS.length === 3
    ? '<span class="seatarrow" style="left:150px;top:24px" aria-hidden="true">↻</span><span class="seatarrow" style="left:676px;top:24px" aria-hidden="true">↻</span>'
    : SEATS.length === 2 ? '<span class="seatarrow" style="left:50%;top:16px;transform:translateX(-50%)" aria-hidden="true">→</span>' : '';
  // Gebots-Blase: bietet derselbe gleich nochmal, hüpft seine Blase nur (statt neu einzublenden)
  const bidKey2 = state.phase === 'auction' && auction.high ? `${auction.opensAt}|${auction.high.player}` : null;
  const bidAgain = !!bidKey2 && local.lastBidKey === bidKey2;
  if (fresh) local.lastBidKey = bidKey2;
  const playersCol = seatArrows + v.players.map((p, i) => {
    const isMe = p.id === meId;
    const count = Array.isArray(p.money) ? p.money.length : p.money;
    let status = karten(count);
    if (state.phase === 'auction') {
      if (p.id === auction.auctioneer) status = 'versteigert';
      else if (auction.passed.includes(p.id)) status = 'gepasst';
      else if (auction.caps[p.id] != null) status = `max. ${auction.caps[p.id]}`;
    }
    if (state.phase === 'rat') {
      const laid = v.rat.laid[p.id] || 0;
      if (laid) status = `${laid} gelegt`;
    }
    if (state.phase === 'special') {
      const sp = v.special;
      if (p.id === sp.revealer) status = 'Aufdecker';
      else if (sp.buzzes[p.id] != null) status = `Buzz ${sp.buzzes[p.id]}`;
      else if (sp.caps[p.id] != null) status = sp.caps[p.id] === 0 ? 'kein Buzz' : `erst ab ${sp.caps[p.id]}`;
    }
    const chips = playerChips(p, tradeMap[p.id], p.id === meId ? 5 : CHIP_MAX); // deine eigenen Tiere liegen groß in der Auslage
    const isLeader = state.phase === 'auction' && auction.high && auction.high.player === p.id;
    if (isLeader) status = `🔨 ${auction.high.amount}`;
    const turnMark = shownHolder === p.id ? ` turn${flashing ? ' turnin' : ''}` : '';
    const offline = ctx.online && !isMe && !ctx.online.has(p.id);
    if (offline) status = 'offline';
    const bot = (ctx.autoplay || []).includes(p.id);
    if (bot) status = '🤖 Bot';
    const dim = (state.phase === 'auction' && auction.passed.includes(p.id)) || offline ? ' dim' : '';
    let coin = '';
    if (evFresh && v.lastEvent?.type === 'money_drawn' && v.lastEvent.player === p.id) coin = `<span class="coinpop big">+${v.lastEvent.value}</span>`;
    if (fresh && isLeader && state.log[state.log.length - 1]?.includes('bietet')) coin = `<span class="coinpop bidpop ${bidAgain ? 'again' : ''}" style="--c:${SEAT_COLORS[i]}">${auction.high.amount}!</span>`;
    const said = ctx.reactions?.[p.id];
    const from = said?.from && said.from !== p.id ? said.from : null;
    const fromIdx = from ? idxOf(from) : -1;
 const isEhrlich = said?.text?.startsWith('Ehrliches, männliches');
    const isUnehrlich = said?.text?.startsWith('Unehrliches');
    const isEmo = said && /^\p{Extended_Pictographic}[\p{Extended_Pictographic}\u200d\ufe0f]*$/u.test(said.text);
    const bubble = said ? `<div class="rbubble ${isEmo ? 'emo' : ''} ${from ? 'to' : ''} ${isEhrlich ? 'ehrlich' : ''} ${isUnehrlich ? 'ehrlich unehrlich' : ''}" ${fromIdx >= 0 ? `style="--c:${SEAT_COLORS[fromIdx]}"` : ''}>${fromIdx >= 0 ? `<small>${esc(nameOf(from))} →</small>` : ''}${esc(said.text)}</div>` : '';
    let nudge = ctx.nudgeWho === p.id && !isMe ? `<button type="button" class="nudge" data-a="nudge" data-v="${esc(p.id)}" aria-label="${esc(p.name)} anstupsen">👉 Anstupsen</button>` : '';
    if (ctx.canTakeover && ctx.canTakeover(p.id)) nudge = `<button type="button" class="nudge takeover" data-a="takeover" data-v="${esc(p.id)}" aria-label="Test-Spieler übernimmt für ${esc(p.name)}">🤖 Für ${esc(p.name)} übernehmen</button>`;
    // du sitzt unten: kein eigener Platz – nur Sprechblasen erscheinen über deinem Geld
    if (isMe) return said ? `<div class="mebubble ${state.phase === 'payment' || state.phase === 'trade' || state.phase === 'rat' || local.tradeOpen ? 'up' : ''}">${bubble}</div>` : '';
    const laidN = state.phase === 'rat' ? (v.rat.laid[p.id] || 0) : 0;
    const ratPile = laidN ? `<div class="ratpile" aria-label="${laidN} gelegt">${Array.from({ length: Math.min(laidN, 6) }, () => '<i></i>').join('')}<b>${laidN}</b></div>` : '';
    return `<div class="prow seat-${seatOf(p.id)}${turnMark}${dim}${isLeader ? ' leader' : ''}${local.out && local.out[p.id] && local.out[p.id].from <= Date.now() && Date.now() < local.out[p.id].until ? ' out' : ''}" data-pid="${esc(p.id)}" style="--c:${SEAT_COLORS[i]}${flashing ? `;--fl:-${flashEl}ms` : ''}">${coin}${ratPile}
      ${bubble}${nudge}${pickTargets.includes(p.id) ? `<button type="button" class="seatpick ${local.tradeTarget === p.id ? 'on' : ''}" data-a="tTarget" data-v="${esc(p.id)}" aria-label="Kuhhandel mit ${esc(p.name)}"><span>${local.tradeTarget === p.id ? '✓ gewählt' : 'antippen'}</span></button>` : ''}
      <div class="pid" data-a="reactTo" data-v="${esc(p.id)}" role="button" aria-label="${esc(isMe ? 'Reaktion senden' : `Reaktion an ${p.name}`)}">
        ${turnMark ? '<span class="turnhint" aria-label="ist dran">⏳</span>' : ''}${avatar(p, i)}
        <div class="pname"><span class="ribbon-s" style="--c:${SEAT_COLORS[i]}">${esc(isMe ? 'Du' : p.name)}</span><span class="tag-s ${isLeader && fresh ? 'pop' : ''}">${status === karten(count) ? `<span class="mcnt" title="${karten(count)} Geld"><i></i>${count}</span>` : status}</span></div>
      </div>
      <div class="chips" data-a="reactTo" data-v="${esc(p.id)}">${chips}</div>
    </div>`;
  }).join('');

  // ----- Versteigerung: findet direkt auf dem Tisch statt -----
  let wake = null; // wann neu zeichnen (Aufdecken, Buzzer-Countdown) – in Serverzeit
  const wakeLocal = (t) => { const w = t + (ctx.now() - Date.now()); if (!wake || wake > w) wake = w; }; // Gerätezeit → Serverzeit
  if (flashing) wakeLocal(local.turnFlashAt + 1650); // Aufleuchten „wer ist dran“ danach einmal beenden
  if (calmLeft) wakeLocal(Date.now() + calmLeft + 30);
  let pickMode = null; // 'sel': Scheine im Fächer antippen → ins Feld · 'rat': einen Schein zum Legen anheben
  let aucCenter = '';
  let aucLeft = '';
  let aucBanner = '';
  local.urgeNow = false; // Auktionator soll entscheiden (Schild leuchtet)
  if (state.phase === 'auction') {
    const a = auction;
    const iAmAuctioneer = a.auctioneer === meId;
    const high = a.high ? a.high.amount : 0;
    const cap = a.caps[meId];
    const nowR = ctx.now();
    const held = a.holdUntil != null && nowR < a.holdUntil; // nach „kann nicht zahlen“: alle schauen erst die Scheine an
    if (held && (!wake || wake > a.holdUntil)) wake = a.holdUntil;
    const canBid = (amt) => !held && (cap == null || amt <= cap);
    const revealing = a.opensAt != null && nowR < a.opensAt;
    if (revealing) wake = a.opensAt; // nach der Animation neu zeichnen
    // Kleiner, dezenter Infokasten – erscheint erst nach dem Aufdecken
    const infoKey = `${a.opensAt}|${a.animal}`;
    const infoFresh = !revealing && local.infoShown !== infoKey;
    if (!revealing) local.infoShown = infoKey;
    const holders = v.players.map((p, i) => [p, i]).filter(([p]) => p.animals[a.animal] > 0);
    const ainfo = `<div class="owners ${infoFresh ? 'fade' : ''}">
      ${holders.length ? `<small>Haben schon</small><div class="olist">${holders.map(([p, i]) => `<span class="own ${p.id === meId ? 'me' : ''}">${avatar(p, i)}<b>${p.id === meId ? 'Du' : esc(p.name)} ×${p.animals[a.animal]}</b></span>`).join('')}</div>`
        : '<span class="onew">Neu im Spiel</span>'}
      ${a.animal === 'esel' && v.lastEvent?.type === 'donkey' ? `<span class="ebonus">Esel-Bonus: alle +${v.lastEvent.payout}</span>` : ''}
    </div>`;
    // Countdown: Ring um die Karte – bieten nur solange er läuft, Zuschlag erst danach
    const now = ctx.now();
    const running = a.endsAt != null && now < a.endsAt && !revealing; // läuft auch während der Pause nach „kann nicht zahlen“ (Uhr zeigt 15 … 11, Bieten gesperrt)
    const secs = running ? Math.ceil((a.endsAt - now) / 1000) : 0;
    const total = a.high ? auctionBidMs(state) : auctionStartMs(state);
    const pct = running ? Math.max(0, Math.min(100, ((a.endsAt - now) / total) * 100)) : 0;
    const card = revealing
      ? `<div class="revealcard ${aval(a.animal) >= 650 ? 'big' : ''}">${playCard(a.animal)}${aval(a.animal) >= 650 ? glitz(14, 'burst') : ''}</div>`
      : `<div class="aucard center ringwrap ${infoFresh ? 'settle' : ''} ${running ? (secs <= 3 ? 'low' : '') : 'over'}" ${a.endsAt != null ? `data-ends="${a.endsAt}" data-total="${total}" data-fmt="n"` : ''}>
          ${playCard(a.animal)}${aval(a.animal) >= 650 ? glitz(7, 'calm') : ''}
          <svg class="ring" viewBox="0 0 112 152" aria-hidden="true"><rect class="ringbg" x="4" y="4" width="104" height="144" rx="16" pathLength="100"></rect><rect class="ringp" x="4" y="4" width="104" height="144" rx="16" pathLength="100" style="stroke-dashoffset:${100 - pct}"></rect></svg>
          <span class="ringsec">${running ? secs : '✓'}</span></div>`;
    // Auktionator lässt sich Zeit: nach 8 s freundlicher Hinweis, die Knöpfe pulsieren
    const URGE_MS = 8000;
    const urge = iAmAuctioneer && !revealing && !running && a.endsAt != null && now - a.endsAt >= URGE_MS;
    local.urgeNow = urge;
    if (iAmAuctioneer && !revealing && !running && a.endsAt != null && !urge && (!wake || wake > a.endsAt + URGE_MS + 20)) wake = a.endsAt + URGE_MS + 20; // Serverzeit
    const countdown = !revealing && !running && a.endsAt != null ? '<div class="timeup">Zeit abgelaufen</div>' : '';

    const ev = v.lastEvent;
    const info = ev?.type === 'cant_pay' && !a.high
      ? `<div class="reveal-row ${fresh ? 'shake' : ''}"><strong>${esc(nameOf(ev.player))} ${ev.player === meId ? 'kannst' : 'kann'} ${ev.amount} nicht zahlen:</strong>
          <span class="reveal-cards">${ev.revealed.length > 8
            // viele Scheine: zusammengefasst („×6“), damit die Zeile nicht nach unten in die Tierreihe wächst
            ? [...new Set(ev.revealed)].sort((x, y) => x - y).map((m) => `<span class="rvgrp">${moneyCard(m, { size: 'xs' })}<b>×${ev.revealed.filter((x) => x === m).length}</b></span>`).join('')
            : ev.revealed.map((m) => moneyCard(m, { size: 'xs' })).join('') || 'keine Karten'}</span>
          <span>→ max. ${ev.amount - BID_STEP}</span></div>`
      : (() => {
        // Gebots-Schild: wer bietet wie viel – groß, mit Spielerfarbe, springt bei jedem neuen Gebot auf
        if (!a.high) return '<div class="bidbox empty"><span>Noch kein Gebot</span></div>';
        const bi = idxOf(a.high.player);
        const key = `${a.opensAt}|${a.high.player}|${a.high.amount}`;
        const isNew = local.bidKey !== key;
        local.bidKey = key;
        return `<div class="bidbox ${isNew ? 'pop' : ''}" style="--c:${SEAT_COLORS[bi]}">
          ${avatar(v.players[bi], bi)}<span class="bwho">${a.high.player === meId ? '🔨 Du<small>führst</small>' : `${esc(nameOf(a.high.player))}<small>bietet</small>`}</span><b>${high}</b>${outbidTag()}</div>`;
      })();

    aucBanner = urge ? 'Alle warten auf dich!' : `${esc(nameOf(a.auctioneer))} ${iAmAuctioneer ? 'versteigerst' : 'versteigert'}`;
    // Nach Ablauf entscheidet der Auktionator: „Zuschlag“ sitzt beim Gebot des Höchstbietenden, „Selbst kaufen“ unten links – weit auseinander
    const decideHere = iAmAuctioneer && !revealing && !running && a.high;
    const sellBtn = decideHere ? `<button type="button" class="tbtn accept sidebtn ${urge ? 'urge' : ''}" data-a="sell"><small>ZUSCHLAG AN</small>${esc(nameOf(a.high.player))} · ${high}</button>` : '';
    aucCenter = revealing ? `<div class="auc aucreveal">${card}</div>` : `<div class="auc aucmain"><div class="aucrow"><div class="aside l">${ainfo}</div>${card}<div class="aside r">${info}${sellBtn}</div></div>${countdown}</div>`;

    if (iAmAuctioneer) {
      const myTotal = sum(me.money);
      if (revealing) {
        aucLeft = `<div class="ldecide">Du deckst auf …</div>`;
      } else if (running) {
        aucLeft = ''; // „Du versteigerst“ steht schon oben im Schild
      } else if (a.high) {
        aucLeft = `<button type="button" class="pill pill-white ${urge ? 'urge' : ''}" data-a="buy" ${myTotal >= high ? '' : 'disabled'}><small>${myTotal >= high ? 'SELBST KAUFEN' : 'ZU WENIG GELD'}</small>${high}</button>`;
      } else {
        aucLeft = `<button type="button" class="pill pill-red" data-a="sell"><small>NIEMAND HAT GEBOTEN</small>Tier nehmen</button>`;
      }
    } else if (revealing) {
      aucLeft = `<div class="ldecide">Karte wird aufgedeckt …</div>`;
    } else if (running) {
      const passed = a.passed.includes(meId);
      // Ein Knopf pro Scheinwert, den es im Spiel gibt: aufs Höchstgebot draufbieten
      const steps = [10, 20, 50, 100]; // mehr bieten = mehrmals tippen (z. B. 100, dann 20)
      const mine = sum(me.money);
      aucLeft = `<div class="lhead">Bieten <small>${held ? 'gleich geht’s los …' : `mind. ${high + BID_STEP}`}</small></div>
        <div class="bidgrid">${steps.map((st) => {
          const amt = high + st;
          const over = amt > mine;
          return `<button type="button" class="bidbtn ${over ? 'over' : ''}" data-a="bid" data-v="${amt}" ${canBid(amt) ? '' : 'disabled'} aria-label="${amt} bieten${over ? ', mehr als du hast' : ''}"><b>${amt}</b><small>${over ? '⚠ zu viel' : `+${st}`}</small></button>`;
        }).join('')}</div>
        <button type="button" class="pill pill-white pill-small passbtn" data-a="pass" ${passed ? 'disabled' : ''}>${passed ? 'Gepasst' : 'Passen'}</button>`;
    } else {
      aucLeft = `<div class="ldecide">${esc(nameOf(a.auctioneer))} entscheidet …</div>`;
    }

    const tick = () => haptic('tap', ctx.vibe !== false);
  H.bid = (amt) => { tick(); ctx.act((s) => bid(s, meId, Number(amt), ctx.now())); };
    H.pass = () => ctx.act((s) => passAuction(s, meId, ctx.now()));
    H.sell = () => ctx.act((s) => closeAuction(s, meId, 'sell', ctx.now()));
    H.buy = () => ctx.act((s) => closeAuction(s, meId, 'buy', ctx.now()));
  }

  // ----- Rattenrunde: reihum Karte legen oder Ratte nehmen -----
  if (state.phase === 'rat') {
    const r = v.rat;
    const turnId = ratCurrent(v);
    const potCount = r.pot;
    const pot = `<div class="pot">${Array.from({ length: Math.min(potCount, 14) }, (_, k) => `<div class="money xs back" style="--r:${(k * 37) % 21 - 10}deg"></div>`).join('') || '<span>noch leer</span>'}</div>`;
    aucBanner = 'Rattenrunde';
    aucCenter = `<div class="auc aucmain"><div class="aucrow">
      <div class="aside l"><div class="ratnow ${turnId === meId ? 'me' : ''}">${turnId === meId ? 'Du bist dran' : `${esc(nameOf(turnId))} ist dran`}</div></div>
      <div class="bigcard compact ${entered ? 'deal' : ''}">${playCard(RAT, 'rat')}</div>
      <div class="aside r"><div class="potbox">${pot}<small>Gelegt: <b>${karten(potCount)}</b></small></div>${turnId === meId ? `<button type="button" class="tbtn counter sidebtn" data-a="ratTake"><small>RATTE NEHMEN</small>+ ${karten(potCount)}</button>` : ''}</div>
    </div></div>`;
    if (turnId === meId) {
      const values = [...new Set(me.money)].sort((a, b) => a - b);
      if (local.ratSel != null && !values.includes(local.ratSel)) local.ratSel = null;
      // Dein niedrigster Schein ist vorgewählt – nur noch „Verdeckt legen“ drücken (oder einen anderen antippen)
      if (local.ratSel == null && values.length) local.ratSel = Math.min(...values);
      aucLeft = `${values.length ? `<button type="button" class="pill pill-white" data-a="ratGo" ${local.ratSel != null ? '' : 'disabled'}><small>VERDECKT LEGEN</small>${local.ratSel != null ? `${local.ratSel}er legen` : 'Schein antippen · 2× tippen legt'}</button>` : ''}`;
      if (values.length) pickMode = 'rat';
    } else {
      aucLeft = `<div class="ldecide">${esc(nameOf(turnId))} überlegt …</div>`;
    }
    H.ratLay = (val) => { const i = me.money.indexOf(Number(val)); if (i >= 0) ctx.act((s) => ratLay(s, meId, i)); };
    // Antippen wählt den Schein, schnelles Doppeltippen legt ihn direkt in die Mitte
    H.ratPick = (val) => {
      const n = Number(val); const t = Date.now();
      if (local.ratTap && local.ratTap.m === n && t - local.ratTap.at < 400) { local.ratTap = null; local.ratSel = null; H.ratLay(n); return; }
      local.ratTap = { m: n, at: t };
      local.ratSel = n; ctx.rerender();
    };
    H.ratGo = () => { if (local.ratSel != null) H.ratLay(local.ratSel); };
    H.ratTake = () => ctx.act((s) => ratTake(s, meId));
  }

  // ----- Spezialkarte: Buzzer-Countdown, Schnick-Schnack-Schnuck, Entscheidung -----
  if (state.phase === 'special') {
    const sp = v.special;
    const now = ctx.now();
    const stage = specialStage(v, now);
    const num = specialNumber(v, now);
    const iRevealed = sp.revealer === meId;
    const res = specialResult(v);
    const top = Object.values(sp.buzzes).length ? Math.max(...Object.values(sp.buzzes)) : null;
    const buzzed = Object.keys(sp.buzzes).filter((id) => sp.buzzes[id] === top);
    const bz = batzenStage(v, now);
    if (bz === 'ask') wake = sp.batzen.until;
    else if (bz === 'show') wake = sp.batzen.at + BATZEN_SHOW_MS;
    else if (stage === 'wait') wake = sp.startsAt;
    else if (stage === 'countdown') wake = Math.min(sp.startsAt + Math.floor((now - sp.startsAt) / SPECIAL_TICK_MS + 1) * SPECIAL_TICK_MS, specialDecideAt(v));

    let big = '';
    if (bz === 'ask') big = `<button type="button" class="batzenbtn" data-a="batzen"><b>Zeig Batzen!</b><small>noch ${Math.max(1, Math.ceil((sp.batzen.until - now) / 1000))} s</small></button>`;
    else if (stage === 'wait') big = `<div class="bignum wait"><small>Achtung …</small>${SPECIAL_FROM}</div>`;
    // Nach dem ersten Buzz bleibt die Zahl stehen (die kurze Gleichzieh-Zeit läuft unsichtbar weiter)
    else if (stage === 'countdown' && top != null) big = `<div class="bignum hit ${(() => { const sig = `${sp.startsAt}|${top}|${buzzed.join()}`; if (local.hitSig !== sig) { local.hitSig = sig; local.hitAt = Date.now(); } return Date.now() - local.hitAt < 450 ? 'hitin' : ''; })()}"><small>${buzzed.map((id) => esc(id === meId ? 'Du' : nameOf(id))).join(' & ')}</small>${top}</div>`;
    else if (stage === 'countdown') big = `<div class="bignum ${num <= 3 ? 'low' : ''}"><small>Karten</small>${num}</div>`;
    const ev = v.lastEvent;
    let info = '';
    if (ev?.type === 'cant_pay' && ev.special && !Object.keys(sp.buzzes).length) {
      // kurz: die Scheine hat das große Fenster schon allen gezeigt, „erst ab N“ steht auch am Platz
      info = `<div class="aucinfo ${fresh ? 'pop' : ''}">${esc(nameOf(ev.player))} ${ev.player === meId ? 'hast' : 'hat'} keine ${ev.count} Karten · erst ab <b>${ev.revealed.length}</b></div>`;
    } else if (top != null && sp.winner && buzzed.length > 1) {
      info = `<div class="aucinfo">${esc(sp.winner === meId ? 'Du gewinnst' : `${nameOf(sp.winner)} gewinnt`)} Schnick-Schnack-Schnuck · bei <b>${top}</b></div>`;
    } else if (top != null) {
      info = `<div class="aucinfo ${fresh ? 'pop' : ''}">${buzzed.map((id) => esc(nameOf(id))).join(' & ')} ${buzzed.length > 1 ? 'buzzern' : buzzed[0] === meId ? 'buzzerst' : 'buzzert'} bei <b>${top}</b></div>`;
    } else if (stage === 'decide') {
      info = '<div class="aucinfo">Niemand hat gebuzzert</div>';
    }
    // Aufdecker entscheidet: „Verkaufen“ sitzt neben der Karte (beim Buzzer-Gewinner), „Selbst kaufen“ unten links
    if (!big && stage !== 'wait' && stage !== 'countdown' && stage !== 'rps' && iRevealed && res) big = `<button type="button" class="tbtn accept sidebtn" data-a="spSell"><small>VERKAUFEN</small>${esc(nameOf(res.player))} zahlt dir ${karten(res.count)}</button>`;
    aucBanner = `${esc(nameOf(sp.revealer))} ${iRevealed ? 'hast' : 'hat'} eine Spezialkarte`;
    aucCenter = `<div class="auc aucmain"><div class="aucrow">
      <div class="aside l">${(() => { const hs = v.players.map((p, i) => [p, i]).filter(([p]) => p.animals[sp.animal] > 0); return `<div class="owners">${hs.length ? `<small>${esc(aname(sp.animal))} haben</small><div class="olist">${hs.map(([p, i]) => `<span class="own ${p.id === meId ? 'me' : ''}">${avatar(p, i)}<b>${p.id === meId ? 'Du' : esc(p.name)} ×${p.animals[sp.animal]}</b></span>`).join('')}</div>` : `<span class="onew">Noch keiner hat ${esc(aname(sp.animal))}</span>`}</div>`; })()}</div>
      <div class="bigcard compact ${entered ? 'deal' : ''}">${playCard(sp.animal, 'special')}</div>
      <div class="aside r">${big || ''}</div>
    </div>${info}</div>`;
    // Batzen liegen auf dem Tisch: jeder Geldstapel verdeckt mit Anzahl
    if (bz === 'show') {
      const cnt = sp.batzen.counts || {};
      aucCenter = `<div class="batzen ${fresh ? 'in' : ''}">
        <div class="bztitle"><span>${esc(sp.batzen.by === meId ? 'Du' : nameOf(sp.batzen.by))}:</span> „Zeig Batzen!“</div>
        <div class="bzrow">${v.players.map((p, i) => { const n = cnt[p.id] ?? 0; return `<div class="bzp" style="--c:${SEAT_COLORS[i]}">
          <div class="bzstack" style="--n:${Math.min(n, 12)}">${Array.from({ length: Math.min(n, 12) }, (_, k) => `<i style="--k:${k}"></i>`).join('')}${n ? '' : '<em>leer</em>'}</div>
          <b>${n}</b><span>${avatar(p, i)}${esc(p.id === meId ? 'Du' : p.name)}</span></div>`; }).join('')}</div>
      </div>`;
    }
    H.batzen = () => ctx.act((s) => showBatzen(s, meId, ctx.now()));

    if (stage === 'wait' || stage === 'countdown') {
      if (iRevealed) {
        aucLeft = '<div class="ldecide">Die anderen buzzern …</div>';
      } else {
        const cap = sp.caps[meId];
        const mine = sp.buzzes[meId];
        const blocked = stage === 'wait' || mine != null || (top != null && num < top) || (cap != null && num > cap);
        const label = mine != null ? `Gebuzzert bei ${mine}` : cap === 0 ? 'Keine Karten – kein Buzz' : stage === 'wait' ? (cap != null ? `Gleich … · erst ab ${cap}` : 'Gleich …') : top != null && num < top ? 'Zu spät' : cap != null && num > cap ? `Erst ab ${cap}` : `bei ${num} = ${karten(num)}`;
        aucLeft = `<div class="lhead">Spezialkarte</div>
          <button type="button" class="buzzer" data-a="buzz" ${blocked ? 'disabled' : ''}><b>BUZZ!</b><small>${label}</small></button>`;
      }
    } else if (stage === 'rps') {
      const r = sp.rps;
      const players = r ? r.players : buzzed;
      const inIt = players.includes(meId);
      const picked = r?.picks?.[meId];
      const last = r?.last;
      const lastRow = last ? `<div class="rpslast">${Object.entries(last.picks).map(([id, c]) => `${esc(nameOf(id))} ${RPS_ICON[c]}`).join(' · ')}${last.winners ? '' : ' → nochmal!'}</div>` : '';
      aucCenter = `<div class="auc spauc"><div class="bigcard compact">${playCard(sp.animal, 'special')}</div><div class="aucinfo">Gleichstand bei <b>${top}</b>: ${players.map((id) => esc(nameOf(id))).join(' gegen ')}</div>${lastRow}</div>`;
      if (inIt && !picked) {
        aucLeft = `<div class="lhead">Schnick-Schnack-Schnuck</div>
          <div class="rpsgrid">${['stein', 'schere', 'papier'].map((c) => `<button type="button" class="rpsbtn" data-a="rps" data-v="${c}"><b>${RPS_ICON[c]}</b><small>${RPS_NAME[c]}</small></button>`).join('')}</div>`;
      } else if (inIt) {
        aucLeft = `<div class="ldecide">Du hast ${RPS_ICON[picked]} gewählt.<br>Warte auf die anderen …</div>`;
      } else {
        aucLeft = `<div class="ldecide">${players.map((id) => esc(nameOf(id))).join(' und ')} spielen Schnick-Schnack-Schnuck …</div>`;
      }
    } else if (iRevealed) {
      if (!res) {
        aucLeft = `<button type="button" class="pill pill-red" data-a="spSell"><small>NIEMAND HAT GEBUZZERT</small>Karte nehmen</button>`;
      } else {
        const canBuy = me.money.length >= res.count;
        aucLeft = `<button type="button" class="pill pill-white" data-a="spBuy" ${canBuy ? '' : 'disabled'}><small>${canBuy ? 'SELBST KAUFEN' : 'ZU WENIG KARTEN'}</small>Du zahlst ${res.count}</button>`;
      }
    } else {
      aucLeft = `<div class="ldecide">${esc(nameOf(sp.revealer))} entscheidet …</div>`;
    }
    H.buzz = () => { const t = ctx.now(); haptic('buzz', ctx.vibe !== false); ctx.act((s) => buzz(s, meId, t)); };
    H.rps = (c) => ctx.act((s) => rpsPick(s, meId, c, ctx.now()));
    H.spSell = () => ctx.act((s) => specialDecide(s, meId, 'sell', ctx.now()));
    H.spBuy = () => ctx.act((s) => specialDecide(s, meId, 'buy', ctx.now()));
  }

  // ----- Bezahlen: auf dem Tisch statt in einem eigenen Fenster -----
  if (state.phase === 'payment') {
    const pm = v.payment;
    const isSp = !!pm.special;
    // v0.54.1: Die Karte bleibt genau dort, wo sie versteigert wurde (gleiche Größe, gleicher Platz) – nur der Stempel kommt dazu.
    // Links bleibt „Haben schon“, rechts – wo vorher das Gebot stand – erscheint die Kasse.
    const stamp = `<span class="stamp ${entered ? 'in' : ''}">Verkauft!</span>`;
    const card = isSp ? `<div class="bigcard compact paystay">${playCard(pm.special, 'special')}${stamp}</div>`
      : `<div class="aucard center ringwrap over paystay">${playCard(pm.animal)}<svg class="ring" viewBox="0 0 112 152" aria-hidden="true"><rect class="ringbg" x="4" y="4" width="104" height="144" rx="16" pathLength="100"></rect></svg>${stamp}</div>`;
    const payAnimal = isSp ? pm.special : pm.animal;
    const holders = v.players.map((p, i) => [p, i]).filter(([p]) => p.animals[payAnimal] > 0);
    const ownersHtml = `<div class="owners">${holders.length ? `<small>${isSp ? `${esc(aname(payAnimal))} haben` : 'Haben schon'}</small><div class="olist">${holders.map(([p, i]) => `<span class="own ${p.id === meId ? 'me' : ''}">${avatar(p, i)}<b>${p.id === meId ? 'Du' : esc(p.name)} ×${p.animals[payAnimal]}</b></span>`).join('')}</div>` : '<span class="onew">Neu im Spiel</span>'}</div>`;
    const payRow = (kasse) => `<div class="auc aucmain paymain"><div class="aucrow"><div class="aside l">${ownersHtml}</div>${card}<div class="aside r">${kasse}</div></div></div>`;
    if (pm.payer === meId) {
      // Einmal pro Zahlung vorwählen: genau passende Scheine (möglichst wenige) bzw. bei der Spezialkarte die kleinsten.
      // Passt nichts genau, wählt man selbst. Die Auswahl lässt sich vor dem Bezahlen ändern.
      if (local.autoKey !== local.key) {
        local.autoKey = local.key;
        if (!local.sel.length) {
          if (isSp) { if (me.money.length >= pm.count) local.sel = me.money.map((m, i) => [m, i]).sort((a, b) => a[0] - b[0]).slice(0, pm.count).map(([, i]) => i); }
          else { const idx = bestPay(me.money, pm.amount); if (idx.length <= 5 && idx.reduce((t, i) => t + me.money[i], 0) === pm.amount) local.sel = idx; } // mit vielen Kleinen: lieber selbst entscheiden
          local.autoSel = local.sel.length ? local.sel.join() : null;
        }
      }
      selSum = local.sel.reduce((t, i) => t + (me.money[i] ?? 0), 0);
      const n = local.sel.length;
      let status; let cls; let ready;
      if (isSp) {
        ready = n === pm.count;
        status = n < pm.count ? `Noch ${karten(pm.count - n)} wählen` : ready ? 'Passt' : `${karten(n - pm.count)} zu viel`;
        cls = ready ? 'ok' : 'bad';
      } else {
        const diff = selSum - pm.amount;
        ready = diff >= 0;
        status = diff < 0 ? `Es fehlen noch ${-diff}` : diff === 0 ? 'Passt genau' : `${diff} zu viel – kein Wechselgeld`;
        cls = diff < 0 ? 'bad' : diff === 0 ? 'ok' : 'warn';
      }
      aucBanner = isSp ? `Zahle ${karten(pm.count)} an ${esc(nameOf(pm.payee))}` : `Zahle ${pm.amount} an ${esc(nameOf(pm.payee))}`;
      const kN = Math.max(local.sel.length, isSp ? pm.count : 0); // viele Scheine: enger fächern statt zweite Reihe
      aucCenter = payRow(`<div class="kasse side ${entered ? 'pop' : ''}">
          <div class="khead">Zahle ${isSp ? karten(pm.count) : pm.amount} → ${avatar(v.players[idxOf(pm.payee)], idxOf(pm.payee))}<b>${esc(nameOf(pm.payee))}</b></div>
          <div class="kslots ${kN > 4 ? 'many' : ''} ${kN > 6 ? 'lots' : ''}" style="--ov:${kN > 4 ? Math.max(7, Math.ceil((kN * (kN > 6 ? 24 : 32) - 160) / (kN - 1))) : 0}px">${chosenCards(me.money, local.sel, isSp ? Math.max(pm.count, 1) : 3, local.justAdded)}</div>
          <div class="kline"><span>${isSp ? `${karten(n)} von ${pm.count}` : `${karten(n)} · ${selSum}`}</span><b class="paystatus ${cls}">${status}</b></div>
        </div>`);
      aucLeft = `<div class="lhead">${isSp ? `${esc(aname(pm.special))}-Spezialkarte` : `Für: ${esc(aname(pm.animal))}`}</div>
        ${local.autoSel && local.autoSel === local.sel.join() ? '' : `<button type="button" class="pill pill-white pill-small" data-a="${isSp ? 'autocount' : 'autopay'}">${isSp ? 'Kleinste wählen' : 'Passend wählen'}</button>`}
        <button type="button" class="pill pill-red" data-a="pay" ${ready ? '' : 'disabled'}><small>BEZAHLEN</small>${isSp ? karten(n) : `${karten(n)} · ${selSum}`}</button>`;
      pickMode = 'sel';
      H.pay = () => ctx.act((s) => pay(s, meId, local.sel));
      H.autopay = () => { local.sel = bestPay(me.money, pm.amount); ctx.rerender(); };
      H.autocount = () => { local.sel = me.money.map((m, i) => [m, i]).sort((a, b) => a[0] - b[0]).slice(0, pm.count).map(([, i]) => i); ctx.rerender(); };
    } else {
      aucBanner = `${esc(nameOf(pm.payer))} ${pm.payer === meId ? 'zahlst' : 'zahlt'}`;
      aucCenter = payRow(`<div class="kasse side waiting">
          <div class="khead">${avatar(v.players[idxOf(pm.payer)], idxOf(pm.payer))}<b>${esc(pm.payer === meId ? 'Du' : nameOf(pm.payer))}</b> → ${esc(pm.payee === meId ? 'dir' : nameOf(pm.payee))}</div>
          <div class="kslots">${Array.from({ length: Math.min(isSp ? pm.count : 3, 6) }, () => '<div class="money xs back"></div>').join('')}</div>
          <div class="kline"><b>${isSp ? karten(pm.count) : `${pm.amount} Taler`}</b></div></div>`);
      aucLeft = `<div class="ldecide">${esc(nameOf(pm.payer))} sucht ${isSp ? 'die Karten' : 'die Scheine'} aus …</div>`;
    }
  }

  // ----- Kuhhandel: auf dem Tisch statt in einem eigenen Fenster -----
  // Eigene Tiere im Kuhhandel (zum Nachsehen, das Tier, um das es geht, leuchtet)
  const myTiles = (focus) => {
    let ids = [...ANIMALS.map((a) => a.id), RAT].filter((id) => (me.animals[id] || 0) > 0);
    if (!ids.length) return '';
    // eine Reihe: das umkämpfte Tier zuerst, dann nach Anzahl; Rest als „+N“
    ids = ids.sort((x, y) => (y === focus) - (x === focus) || me.animals[y] - me.animals[x]);
    const more = ids.length > 6 ? ids.length - 5 : 0;
    if (more) ids = ids.slice(0, 5);
    return `<div class="atiles mine">${ids.map((id) => `<span class="atile ${id === focus ? 'on' : focus ? 'dim' : ''}" style="--a:${ANIMAL_COLORS[id]}" title="${me.animals[id]}× ${aname(id)}">${miniCard(id, 'fill')}${aval(id) != null ? `<em class="cv">${aval(id)}</em>` : ''}<span class="tcount">×${me.animals[id]}</span></span>`).join('')}${more ? `<span class="amore">+${more}</span>` : ''}</div>`;
  };
  const who = (id, label) => { const i = idxOf(id); return `<div class="twho">${avatar(v.players[i], i)}<span class="ribbon-s" style="--c:${SEAT_COLORS[i]}">${esc(label || nameOf(id))}</span></div>`; };
  // Einsatz sichtbar: jede Seite zeigt, was sie setzt und was sie hätte, wenn sie gewinnt
  const stakeOf = (id, animal, count, otherId) => {
    if (!animal) return '';
    const p = v.players[idxOf(id)]; const have = p.animals[animal] || 0; const isRat = animal === RAT;
    const winHave = isRat ? have - count : have + count; // Rattenhandel: wer gewinnt, wird sie los
    const quart = !isRat && winHave === 4;
    const mine = id === meId;
    const keep = have - count;
    return `<div class="tstake"><div class="tstk">${Array.from({ length: count }, () => miniCard(animal, 'fill')).join('')}${keep > 0 ? `<span class="tkeep" title="behält ${keep}">+${keep}</span>` : ''}</div>
      <small>${isRat ? (mine ? 'gewinnst du' : 'gewinnt') + ` → ${winHave ? `noch ${winHave}×` : 'keine Ratte mehr'}` : `${mine ? 'gewinnst du' : 'gewinnt'} → ${winHave}× ${esc(aname(animal))}${quart ? ' <b class="tq">Quartett!</b>' : ''}`}</small></div>`;
  };
  // Mitte: der Topf – alle eingesetzten Karten (beide Seiten), darunter worum es geht
  const tmid = (animal, count, extra = '') => {
    if (!animal) return `<div class="tmid"><div class="tmidcard empty">?</div><span class="tmidcnt">Tier wählen</span><span class="tvs">VS</span>${extra}</div>`;
    const n = count * 2; const isRat = animal === RAT;
    return `<div class="tmid tmpot"><div class="tpot" style="--pn:${n};--sp:${Math.min(22, Math.round(54 / Math.max(1, n - 1)))}px">${Array.from({ length: n }, (_, k) => `<span class="tpc" style="--k:${k}">${miniCard(animal, 'fill')}</span>`).join('')}</div>
      <span class="tmidcnt">${count} gegen ${count}</span><small class="tpotl">${isRat ? `Verlierer bekommt alle ${n}` : `Gewinner bekommt alle ${n}`}</small><span class="tvs">VS</span>${extra}</div>`;
  };
  // (alt) Mitte zwischen den beiden Seiten: das umkämpfte Tier groß, darunter „um 2“
  const tmidOld = (animal, count, extra = '') => `<div class="tmid">${animal ? `<div class="tmidcard">${playCard(animal, animal === RAT ? 'rat' : undefined)}</div><span class="tmidcnt">um ${count}</span>` : '<div class="tmidcard empty">?</div><span class="tmidcnt">Tier wählen</span>'}<span class="tvs">VS</span>${extra}</div>`;
  const animalStrip = (animal, count, note) => `<div class="tanimal" style="--a:${ANIMAL_COLORS[animal]}">${miniCard(animal)}<span><b>${count}× ${aname(animal)}${aval(animal) != null ? ` · ${aval(animal)}` : ''}</b>${note ? `<small>${note}</small>` : ''}</span></div>`;
  if (state.phase === 'turn' && myTurn && local.tradeOpen) {
    const trades0 = possibleTrades(state, meId);
    const targets = [...new Set(trades0.map((t) => t.target))];
    if (!targets.includes(local.tradeTarget)) local.tradeTarget = targets[0];
    const forTarget = trades0.filter((t) => t.target === local.tradeTarget);
    if (!forTarget.some((t) => t.animal === local.tradeAnimal)) local.tradeAnimal = forTarget[0]?.animal || null;
    const chosen = forTarget.find((t) => t.animal === local.tradeAnimal);
    const target = v.players[idxOf(local.tradeTarget)];
    const canOffer = chosen && (local.sel.length > 0 || me.money.length === 0);
    aucBanner = chosen?.animal === RAT ? 'Rattenhandel' : 'Kuhhandel';
    const tName = (id) => esc(nameOf(id));
    if (!local.tradePicked) {
      // Schritt 1: ein Fenster – Gegner oben, darunter große Kärtchen nur mit Tieren, die ihr beide habt
      const many = forTarget.length > 8 ? 'many' : '';
      aucCenter = `<div class="tpick ${entered ? 'pop' : ''}">
        <small class="tp-kind">Kuhhandel · Schritt 1 von 2${targets.length > 1 ? ' · Gegner auch direkt am Platz antippen' : ''}</small>
        <div class="tp-head"><b>Mit wem, um welches Tier?</b>
          <div class="tp-opps">${targets.map((id) => { const i = idxOf(id); return targets.length > 1 ? `<button type="button" class="tp-opp ${id === local.tradeTarget ? 'on' : ''}" data-a="tTarget" data-v="${esc(id)}">${avatar(v.players[i], i)}<span>${tName(id)}</span></button>` : `<span class="tp-opp on solo">${avatar(v.players[i], i)}<span>${tName(id)}</span></span>`; }).join('')}</div>
          <button type="button" class="tp-x" data-a="tradeClose" aria-label="Abbrechen">✕</button></div>
        <div class="tp-grid ${many}">${forTarget.map((t) => `<button type="button" class="tp-t" data-a="tAnimal" data-v="${t.animal}" style="--a:${ANIMAL_COLORS[t.animal]}" aria-label="${aname(t.animal)}: es geht um ${t.count}">
          <span class="tp-um">um ${t.count}</span>${miniCard(t.animal, 'fill')}${aval(t.animal) != null ? `<em class="tp-val">${aval(t.animal)}</em>` : ''}<span class="tp-nm">${esc(aname(t.animal))}</span>
          <span class="tp-cnt"><span class="me">Du ${me.animals[t.animal] || 0}</span><span class="op" style="--c:${SEAT_COLORS[idxOf(target.id)]}">${tName(target.id)} ${target.animals[t.animal] || 0}</span></span></button>`).join('')}</div>
      </div>`;
      aucLeft = '';
      aucBanner = ''; // das Fenster hat seine eigene Überschrift
      pickMode = null;
    } else {
      // Schritt 2: Geld wählen – Gegner und Tier stehen fest (antippen = ändern)
      aucCenter = `<div class="tduel ${local.pickedNow ? 'pop' : ''}">
      <div class="tpanel">
        ${who(meId, 'Du')}
        <div class="kslots ${local.sel.length > 5 ? 'many' : ''}">${chosenCards(me.money, local.sel, 3, local.justAdded)}</div>
        <div class="tline"><b>${karten(local.sel.length)} · ${selSum}</b></div>
        ${stakeOf(meId, chosen?.animal, chosen?.count || 0, target.id)}
      </div>
      ${tmid(chosen?.animal, chosen?.count)}
      <div class="tpanel">
        ${who(target.id)}
        ${stakeOf(target.id, chosen?.animal, chosen?.count || 0, meId)}
        <button type="button" class="pill pill-white pill-small tchange" data-a="tradeRepick">Gegner/Tier ändern</button>
      </div>
    </div>`;
      local.pickedNow = false;
      const moneyDone = local.sel.length > 0;
      const step = (n, label, val, state0) => `<div class="tstep ${state0}"><i>${state0 === 'done' ? '✓' : n}</i><span>${label}</span><b>${val}</b></div>`;
      aucCenter = `<div class="tsteps">
          ${step(1, 'Gegner + Tier', `${esc(target.name)} · ${chosen ? `${chosen.count}× ${esc(aname(chosen.animal))}` : '–'}`, 'done')}
          ${step(2, 'Geld', moneyDone ? karten(local.sel.length) : 'unten antippen', moneyDone ? 'done' : 'now')}
        </div>` + aucCenter;
      aucLeft = `
      <button type="button" class="pill pill-white pill-small" data-a="tradeClose">Abbrechen</button>
      <button type="button" class="pill pill-red" data-a="tradeGo" ${canOffer ? '' : 'disabled'}><small>ANGEBOT MACHEN</small>${karten(local.sel.length)}</button>`;
      pickMode = 'sel';
    }
    H.tTarget = (id) => { local.tradeTarget = id; local.tradeAnimal = null; local.tradePicked = false; ctx.rerender(); };
    H.tAnimal = (id) => { local.tradeAnimal = id; local.tradePicked = true; local.pickedNow = true; ctx.rerender(); };
    H.tradeRepick = () => { local.tradePicked = false; ctx.rerender(); };
    H.tradeClose = () => { local.tradeOpen = false; local.tradePicked = false; local.sel = []; ctx.rerender(); };
    H.tradeGo = () => ctx.act((s) => startTrade(s, meId, local.tradeTarget, local.tradeAnimal, local.sel));
  }

  if (state.phase === 'trade') {
    const t = v.trade;
    const TT = (Number(state.settings?.tradeTimer) || 0) && (isTurbo(state) ? 12 : Number(state.settings.tradeTimer)); // Turbo: 12 s
    let ttHtml = '';
    if (TT) {
      const tkey = `${state.log.length}|${t.challenger}|${t.animal}`;
      if (local.ttKey !== tkey) { local.ttKey = tkey; local.ttAt = Date.now() + (local.ttDelay || 0); local.ttDelay = 0; local.ttBuzzed = false; }
      const left = Math.max(0, Math.ceil((local.ttAt + TT * 1000 - Date.now()) / 1000));
      ttHtml = `<span class="ttimer ${left <= 5 ? 'low' : ''} ${left === 0 ? 'out' : ''}">${left ? `⏱ ${left} s` : '⏰ Zeit um!'}</span>`;
      if (left > 0) wakeLocal(Date.now() + 1000 - ((Date.now() - local.ttAt) % 1000) + 20);
      else if (!local.ttBuzzed) { local.ttBuzzed = true; sounds.push('nudge'); if (t.target === meId) haptic('heavy', ctx.vibe !== false); }
    }
    const offerCount = Array.isArray(t.offer) ? t.offer.length : t.offer;
    const offerCards = Array.isArray(t.offer) ? t.offer.map((m) => moneyCard(m, { size: 'xs' })).join('') : Array.from({ length: offerCount }, () => '<div class="money xs back"></div>').join('');
    const isRat = t.animal === RAT;
    // v0.52.1: das Angebot fliegt nach dem „KUHHANDEL!“-Auftritt vom Platz in die Mitte – erst dann liegen die Scheine dort
    const okey = `${state.log.length}|${t.challenger}|${t.target}|${t.animal}`;
    if (local.offerKey !== okey) { local.offerKey = okey; local.offerAt = entered ? Date.now() : 0; }
    const oel = local.offerAt ? Date.now() - local.offerAt : 1e9;
    const arr = oel < OFFER_LAND + 400 ? ` arr" style="--ad:${OFFER_LAND - oel}ms` : '';
    if (oel < OFFER_LAND + 400) wakeLocal(local.offerAt + OFFER_LAND + 450);
    aucBanner = `${isRat ? 'Rattenhandel' : 'Kuhhandel'}: ${esc(nameOf(t.challenger))} gegen ${esc(nameOf(t.target))}`;
    const challengerPanel = (extra = '') => `<div class="tpanel">
        ${who(t.challenger, t.challenger === meId ? 'Du' : null)}
        <div class="kslots${arr}">${offerCards || '<span class="tnone">keine Karten</span>'}</div>
        <div class="tline big"><b>${karten(offerCount)}${Array.isArray(t.offer) ? ` · ${sum(t.offer)}` : ''}</b><small>${Array.isArray(t.offer) ? 'dein Angebot' : 'verdeckt geboten'}</small></div>
        ${stakeOf(t.challenger, t.animal, t.count, t.target)}
        ${extra}
      </div>`;
    if (t.target === meId) {
      const canCounter = local.sel.length > 0 || me.money.length === 0;
      const acceptBtn = `<button type="button" class="tbtn accept" data-a="accept"><small>ANNEHMEN</small>${isRat ? 'Geld + Ratte nehmen' : 'Geld nehmen'}<em>${isRat ? `${t.count}× Ratte kommt zu dir` : `${t.count}× ${esc(aname(t.animal))} geht an ${esc(nameOf(t.challenger))}`}</em></button>`;
      const counterBtn = `<button type="button" class="tbtn counter" data-a="counter" ${canCounter ? '' : 'disabled'}><small>GEGENANGEBOT</small>${canCounter ? `${karten(local.sel.length)} · ${selSum} bieten` : 'Scheine unten antippen'}</button>`;
      aucCenter = `<div class="tduel respond ${entered ? 'pop' : ''}">${challengerPanel(acceptBtn)}
        ${tmid(t.animal, t.count, ttHtml)}
        <div class="tpanel">
          ${who(meId, 'Du')}
          ${stakeOf(meId, t.animal, t.count, t.challenger)}
          <div class="kslots ${local.sel.length > 5 ? 'many' : ''}">${chosenCards(me.money, local.sel, 3, local.justAdded)}</div>
          ${counterBtn}
        </div>
      </div>`;
      aucLeft = '';
      pickMode = 'sel';
      H.accept = () => ctx.act((s) => acceptTrade(s, meId));
      H.counter = () => ctx.act((s) => counterTrade(s, meId, local.sel));
    } else {
      aucCenter = `<div class="tduel">${challengerPanel()}
        ${tmid(t.animal, t.count, ttHtml)}
        <div class="tpanel">
          ${who(t.target)}
          ${stakeOf(t.target, t.animal, t.count, t.challenger)}
          <div class="kslots"><div class="slot q">?</div></div>
          <div class="tline"><b>überlegt …</b></div>
        </div>
      </div>
`;
      aucLeft = `<div class="ldecide">${t.challenger === meId ? `Warte auf die Antwort von ${esc(nameOf(t.target))} …` : `${esc(nameOf(t.target))} überlegt …`}</div>`;
    }
  }

  // ----- Spielende mit Ratten: Quartett blockieren, auf dem Tisch -----
  if (state.phase === 'block') {
    const bp = v.players[idxOf(v.block.player)];
    aucBanner = `${esc(bp.id === meId ? 'Du hast' : `${bp.name} hat`)} alle ${RAT_COUNT} Ratten`;
    if (bp.id === meId) {
      const opts = ANIMALS.filter((a) => me.animals[a.id] === 4);
      aucCenter = `<div class="blockpanel ${entered ? 'pop' : ''}">
        <p>Welches Quartett fällt weg?</p>
        <div class="blockgrid">${opts.map((a) => `<button type="button" class="blockopt" data-a="block" data-v="${a.id}" style="--a:${ANIMAL_COLORS[a.id]}">
          ${miniCard(a.id, 'big')}<b>${a.name}${specialsOf(me).includes(a.id) ? ` ${STAR}` : ''}</b><small>${scoreFor(me, a.id, false, KURSE).score} Punkte</small></button>`).join('')}</div>
      </div>`;
      aucLeft = `<div class="ldecide">Quartett wählen …</div>`;
      H.block = (id) => ctx.act((s) => chooseBlock(s, meId, id));
    } else {
      aucCenter = `<div class="auc">${ratCard('', 'compact')}<div class="aucinfo">${esc(bp.name)} wählt, welches Quartett nicht zählt …</div></div>`;
      aucLeft = `<div class="ldecide">Gleich ist das Spiel vorbei.</div>`;
    }
  }

  // ----- Tisch -----
  const canDraw = state.phase === 'turn' && myTurn && !local.tradeOpen && v.deck > 0 && !calmLeft;
  const lastLog = v.log[v.log.length - 1] || '';
  // Infozeile: leuchtet kurz auf, wenn etwas Neues drinsteht (läuft beim Neuzeichnen weiter)
  if (fresh && state.phase === 'turn') local.stripAt = Date.now() + (evFresh && EV_WAIT[v.lastEvent?.type] ? evWait(v.lastEvent.type, v.deck) : 0);
  const stripNew = state.phase === 'turn' && local.stripAt && Date.now() - local.stripAt < 1400 ? 'flash' : '';
  // Letzte Aktion als kleine Bildzeile (wer → was), sonst Textzeile
  // Spieler mit Bild; du = „Du“ / nach „von“ „dir“ / nach „an“ „dich“
  const who2 = (id, du = 'Du') => { const i = idxOf(id); return i >= 0 ? `<span class="evp">${avatar(v.players[i], i)}<b>${id === meId ? du : esc(v.players[i].name)}</b></span>` : ''; };
  let evStrip = '';
  const le0 = v.lastEvent;
  if (le0 && state.phase === 'turn') {
    const hat = (id) => (id === meId ? 'hast' : 'hat');
    const ea = (t) => `<span class="eva">${t}</span>`;
    const karten = (n) => `<b>${n}</b> Karte${n === 1 ? '' : 'n'}`;
    if (le0.type === 'auction_won') {
      // „Nico hat Kuh [Bild] von Alp für 90 gekauft“ · Vorkaufsrecht: „Alp hat Kuh [Bild] selbst gekauft – für 90 an Nico“
      if (!le0.amount) evStrip = `${who2(le0.buyer)}${ea(hat(le0.buyer))}${ea(aname(le0.animal))}${miniCard(le0.animal)}${ea('umsonst bekommen')}`;
      else if (le0.self) evStrip = `${who2(le0.buyer)}${ea(hat(le0.buyer))}${ea(aname(le0.animal))}${miniCard(le0.animal)}${ea(`selbst gekauft – ${le0.buyer === meId ? 'zahlst' : 'zahlt'} <b>${le0.amount}</b> an`)}${who2(le0.payee, 'dich')}`;
      else evStrip = `${who2(le0.buyer)}${ea(hat(le0.buyer))}${ea(aname(le0.animal))}${miniCard(le0.animal)}${ea('von')}${who2(le0.payee, 'dir')}${ea(`für <b>${le0.amount}</b> gekauft`)}`;
    } else if (le0.type === 'special_won') {
      const sp = `${miniCard(le0.animal)}<span class="evstar">${STAR}</span>`;
      if (!le0.count) evStrip = `${who2(le0.buyer)}${ea(hat(le0.buyer))}${ea(`die ${aname(le0.animal)}-Spezialkarte`)}${sp}${ea('umsonst bekommen')}`;
      else if (!le0.self) evStrip = `${who2(le0.buyer)}${ea(hat(le0.buyer))}${ea(`die ${aname(le0.animal)}-Spezialkarte`)}${sp}${ea('von')}${who2(le0.payee, 'dir')}${ea(`für ${karten(le0.count)} gekauft`)}`;
      else evStrip = `${who2(le0.buyer)}${ea(le0.buyer === meId ? 'behältst' : 'behält')}${ea(`die ${aname(le0.animal)}-Spezialkarte`)}${sp}${ea(`und ${le0.buyer === meId ? 'zahlst' : 'zahlt'} ${karten(le0.count)} an`)}${who2(le0.payee, 'dich')}`;
    } else if (le0.type === 'trade' && le0.animal === RAT) {
      const loser = le0.winner === le0.challenger ? le0.target : le0.challenger;
      evStrip = `${who2(loser)}${ea(hat(loser))}${ea(`<b>${le0.count}×</b> Ratte`)}${miniCard(RAT)}${ea('von')}${who2(le0.winner, 'dir')}${ea('bekommen')}`;
    } else if (le0.type === 'trade') {
      const loser = le0.winner === le0.challenger ? le0.target : le0.challenger;
      evStrip = `${who2(le0.winner)}${ea(hat(le0.winner))}${ea(`<b>${le0.count}×</b> ${aname(le0.animal)}`)}${miniCard(le0.animal)}${ea('von')}${who2(loser, 'dir')}${ea('ertauscht')}`;
    } else if (le0.type === 'money_drawn') evStrip = `${who2(le0.player)}${ea(`${hat(le0.player)} einen Geldschein gezogen`)}${moneyCard(le0.value)}`;
    else if (le0.type === 'news') evStrip = `${who2(le0.player)}${ea(`${hat(le0.player)} Börsen-News aufgedeckt:`)}${ea(`<b>${esc(newsTitle(le0))}</b>`)}`;
    else if (le0.type === 'rat_taken') evStrip = `${who2(le0.player)}${ea(`${hat(le0.player)} die Ratte genommen`)}${miniCard(RAT)}${ea(`und ${karten(le0.count)} bekommen`)}`;
  }
  // Auslage: immer sichtbar über dem Geld. Spezialkarte steckt im Stapel ihres Tiers.
  const lev = v.lastEvent;
  let bumpId = null;
  if (evFresh && lev) {
    if ((lev.type === 'auction_won' || lev.type === 'special_won') && lev.buyer === meId) bumpId = lev.animal;
    if (lev.type === 'trade' && lev.animal !== RAT && lev.winner === meId) bumpId = lev.animal;
    if (lev.type === 'rat_taken' && lev.player === meId) bumpId = RAT;
  }
  // Eigenes Set antippen (wenn du dran bist): Kuhhandel um dieses Tier – handelbare Sets leuchten
  const setTap = state.phase === 'turn' && myTurn && !local.tradeOpen && !v.mustDraw && !calmLeft;
  const setTrade = new Set(setTap ? possibleTrades(state, meId).map((t) => t.animal) : []);
  H.setTrade = (id) => {
    const t = possibleTrades(state, meId).find((x) => x.animal === id);
    if (t) { local.tradeOpen = true; local.tradePicked = true; local.sel = []; local.tradeTarget = t.target; local.tradeAnimal = id; local.setHint = null; }
    else local.setHint = { id, at: Date.now() };
    ctx.rerender();
  };
  const mySpecials = specialsOf(me);
  const myItems = [
    ...ANIMALS.filter((a) => me.animals[a.id] > 0).map((a) => stackHtml(a.id, me.animals[a.id], { special: mySpecials.includes(a.id), bump: bumpId === a.id, tap: setTap, trade: setTrade.has(a.id) })),
    ...mySpecials.filter((id) => !(me.animals[id] > 0)).map((id) => specialMini(id)),
    ...(ratsOf(me) ? [stackHtml(RAT, ratsOf(me), { bump: bumpId === RAT, tap: setTap, trade: setTrade.has(RAT) })] : []),
  ];
  const myAnimals = myItems.join('') || '<span class="noanimals">Noch keine Tiere</span>';
  // Dein Gebot führt: Geld-Fächer schimmert golden
  const iLead = state.phase === 'auction' && auction.high?.player === meId;
  // Viele Scheine: gleiche Werte zu einem Stapel mit „×N“ zusammenfassen, damit jeder Wert lesbar bleibt
  // Beim Auswählen (Bezahlen, Kuhhandel): ausgewählte Scheine liegen schon im Feld, im Fächer bleibt der Rest
  let handMoney = pickMode === 'sel' ? me.money.filter((_, i) => !local.sel.includes(i)) : me.money;
  const glowVals = [];
  if (local.handFx && !pickMode) {
    const hf = local.handFx; const tn = Date.now();
    if (tn < hf.gainAt) { const r = [...handMoney]; hf.gain.forEach((x) => { const i = r.indexOf(x); if (i >= 0) r.splice(i, 1); }); handMoney = r; wakeLocal(hf.gainAt + 10); }
    else if (tn < hf.gainAt + 1000) { glowVals.push(...hf.gain); wakeLocal(hf.gainAt + 1010); }
    if (tn < hf.loseAt) { handMoney = [...handMoney, ...hf.lose]; wakeLocal(hf.loseAt + 10); }
  }
  // v0.59 „Dein Platz“: Geld als Hand mit festen Fächern – jeder Wert hat immer denselben Platz (0 … 500),
  // fehlende Werte bleiben als blasser Platzhalter stehen, damit beim Zahlen/Bekommen nichts verrutscht
  const SLOTS = Object.keys(MONEY_COLORS).map(Number).sort((x, y) => x - y);
  const fanCards = SLOTS.map((val) => [val, handMoney.filter((m) => m === val).length]);
  const mid = (SLOTS.length - 1) / 2;
  let lifted = false;
  const fan = fanCards.map(([m, cnt], i) => {
    const off = i - mid;
    const style = `--m:${MONEY_COLORS[m]};--rot:${(off * 2.5).toFixed(1)}deg;--dy:${Math.round(Math.abs(off) * 2.5)}px`;
    if (!cnt) return `<span class="mghost" style="${style}" aria-hidden="true"><i>${m}</i></span>`;
    const lift = pickMode === 'rat' && local.ratSel === m && !lifted;
    if (lift) lifted = true;
    const inner = `${mIn(m)}${cnt > 1 ? `<span class="mcount">×${cnt}</span>` : ''}`;
    const gi = glowVals.indexOf(m); const glow = gi >= 0; if (glow) glowVals.splice(0, glowVals.length);
    if (!pickMode) return `<div class="money fan ${cnt > 1 ? 'multi' : ''} ${glow ? 'newcard' : ''}" style="${style}">${inner}</div>`;
    const label = pickMode === 'rat' ? `${m} zum Legen wählen` : `${m} ins Feld legen`;
    return `<button type="button" class="money fan pick ${cnt > 1 ? 'multi' : ''} ${lift ? 'lift' : ''}" style="${style}" data-a="${pickMode === 'rat' ? 'ratPick' : 'addv'}" data-v="${m}" aria-label="${label}"${lift ? ' aria-pressed="true"' : ''}>${inner}</button>`;
  }).join('');

  const trades = possibleTrades(state, meId);
  let leftActionsHtml = aucLeft;
  // Nicht dran: unten links bleibt frei (wer dran ist, steht oben im Schild und an der Sanduhr)
  if (state.phase === 'turn' && myTurn && !local.tradeOpen) {
    leftActionsHtml = `
      <button type="button" class="pill pill-red ${calmLeft ? 'calm' : ''}" data-a="auction" ${v.deck > 0 && !calmLeft ? '' : 'disabled'} ${calmLeft ? `style="--el:-${(local.calmDur || CALM_MS) - calmLeft}ms;--calm:${local.calmDur || CALM_MS}ms"` : ''}>KARTE<br>AUFDECKEN</button>
      <button type="button" class="pill pill-white" data-a="tradeOpen" ${trades.length && !v.mustDraw && !calmLeft ? '' : 'disabled'}>Kuhhandel</button>`;
  }
  const askMe = local.urgeNow || (state.phase === 'turn' && myTurn && !local.tradeOpen) || (state.phase === 'payment' && v.payment.payer === meId)
    || (state.phase === 'trade' && v.trade.target === meId) || (state.phase === 'rat' && ratCurrent(v) === meId) || (state.phase === 'block' && v.block.player === meId);
  const banner = aucBanner || (state.phase === 'ended' || state.phase === 'block' ? 'Spielende' : myTurn ? (v.mustDraw ? 'Nochmal aufdecken!' : 'Du bist dran') : `${esc(cur.name)} ist dran`);
  // Farbe des Spielers, der dran ist – erst wenn der Wechsel sichtbar ist (nach Tier + Geld), dann klappt die Überschrift um
  const banIdx = state.phase === 'turn' && !local.turnHold && realHolder ? idxOf(realHolder) : askMe ? meIdx : -1;
  const banFlip = flashing && state.phase === 'turn' && !aucBanner;
  const table = `<div class="gtable">
    <div class="tbanner ${askMe || banIdx >= 0 ? 'mine' : ''} ${banFlip ? 'flip' : ''} ${local.urgeNow ? 'pulse' : ''}" ${banIdx >= 0 || banFlip ? `style="${banIdx >= 0 ? `--c:${SEAT_COLORS[banIdx]};` : ''}--fl:-${flashEl}ms"` : ''}>${banner}</div>
    ${shownHolder === meId && realHolder === meId && state.phase === 'turn' ? `<div class="myglow ${flashing ? 'in' : ''}" style="--fl:-${Math.min(flashEl, 99999)}ms" aria-hidden="true"></div>` : ''}
    <div class="tcenter">${aucCenter || `
    <div class="deck-wrap">
      ${canDraw ? `<button type="button" class="deck go" data-a="auction" aria-label="Karte aufdecken"><span class="deckcow">${art('kuh')}</span><span class="deckgo">Tippen</span></button>`
        : `<div class="deck ${v.deck === 0 ? 'empty' : ''}">${v.deck > 0 ? `<span class="deckcow">${art('kuh')}</span>` : ''}</div>`}
      <span class="deck-count ${v.deck > 0 && v.deck <= 5 ? 'low' : ''}">${v.deck > 0 ? `${v.deck} im Stapel${v.deck <= 5 ? ' – bald nur noch Kuhhandel' : ''}` : 'Stapel leer – nur Kuhhandel'}${isTurbo(state) ? '<b class="turbotag">⚡ Turbo</b>' : ''}${isBoerse(state) ? `<b class="turbotag boersetag">📈 Börse${state.hektik ? ` · ⚡ Hektik ${state.hektik}` : ''}</b>` : ''}${kursZettel(state)}</span>
    </div>`}</div>
    <div class="auslage shelf ${local.tradeOpen || state.phase === 'trade' ? 'hide' : ''}" style="--sc:${Math.min(SHELF_MAX, 510 / Math.max(1, myItems.length * 36)).toFixed(3)}" aria-label="Deine Karten">${myAnimals}</div>
    ${leftActionsHtml ? `<div class="dock">${leftActionsHtml}</div>` : ''}
    <div class="fan-wrap slots ${pickMode ? 'picking' : ''} ${iLead ? 'leading' : ''}" aria-label="Dein Geld: ${sum(me.money)} Taler">${fan}${handMoney.length ? `<span class="fansum" aria-hidden="true">${sum(handMoney)}<i class="taler"></i></span>` : pickMode === 'sel' && me.money.length ? '<span class="fanempty">Alles im Feld</span>' : ''}</div>
  </div>`;

  // ----- Menü oben links in der Tischecke -----
  const left = `<div class="gleft">
    <div class="lround">
      <button type="button" class="round" data-a="menu" aria-label="Menü">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
      </button>
    </div>
    ${local.menu ? `<div class="menu">
      <div class="menu-row"><button type="button" class="pill pill-white pill-small" data-a="sound">🔊 Ton: ${ctx.soundName || (ctx.sound ? 'an' : 'aus')}</button>
      <button type="button" class="pill pill-white pill-small" data-a="vibe">Vibration: ${ctx.vibe !== false ? 'an' : 'aus'}</button>
      <button type="button" class="pill pill-white pill-small" data-a="intros">⚔️ Intros: ${ctx.introsOff ? 'aus' : 'an'}</button></div>
      ${state.settings?.standings && state.phase !== 'ended' ? '<button type="button" class="pill pill-white pill-small" data-a="standings">📊 Zwischenstand</button>' : ''}
      <button type="button" class="pill pill-white pill-small" data-a="modal" data-v="rules">Spielregeln</button>
      <button type="button" class="pill pill-white pill-small" data-a="modal" data-v="design">🎨 Aussehen</button>
      ${ctx.push != null ? `<button type="button" class="pill pill-white pill-small" data-a="push">🔔 Benachrichtigung: ${ctx.push ? 'an' : 'aus'}</button>` : ''}
      <button type="button" class="pill pill-white pill-small" data-a="modal" data-v="pin">Wiedereinstieg-Code</button>
      ${ctx.standalone ? '' : '<button type="button" class="pill pill-white pill-small" data-a="modal" data-v="install">Als App aufs Handy</button>'}
      <button type="button" class="pill pill-white pill-small" data-a="exit">Spiel verlassen</button></div>` : ''}
  </div>`;

  H.menu = () => { local.menu = !local.menu; local.reactOpen = false; ctx.rerender(); };
  // Zwischenstand (nur wenn im Warteraum erlaubt): rechnet nur mit dem, was offen liegt – Geld bleibt verdeckt
  H.standings = () => { local.standings = !local.standings; local.menu = false; ctx.rerender(); };
  const standingsHtml = local.standings && state.settings?.standings && state.phase !== 'ended' ? (() => {
    const rows = v.players.map((p, i) => ({ p, i, sc: scoreFor(p, null, false, KURSE) })).sort((a, b) => b.sc.score - a.sc.score);
    return `<div class="standings" data-a="standings" role="button" aria-label="Zwischenstand schließen">
      <h3>📊 Zwischenstand <small>${state.settings?.moneyCounts ? 'nur offene Quartette – Geld kommt am Ende dazu' : 'nur offene Quartette – Geld zählt nicht'}</small></h3>
      ${rows.map((r, k) => `<div class="strow"><i>${k + 1}.</i>${avatar(r.p, r.i)}<span>${esc(r.p.id === meId ? 'Du' : r.p.name)}</span><span class="stq">${r.sc.quartets.map((id) => `<span class="ci" style="--a:${ANIMAL_COLORS[id]}">${art(id)}</span>`).join('') || '–'}</span><b>${r.sc.score}</b></div>`).join('')}
      <small class="sthint">Antippen schließt</small></div>`;
  })() : '';
  // Reaktionen: eigenen Platz antippen = an alle, anderen Spieler antippen = an ihn
  H.reactTo = (id) => {
    if (!ctx.reactionList) return;
    local.reactTo = local.reactTo === id ? null : id;
    local.menu = false;
    ctx.rerender();
  };
  H.nudge = (id) => ctx.nudge && ctx.nudge(id);
  H.takeover = (id) => ctx.takeover && ctx.takeover(id);
  H.selfPlay = () => ctx.selfPlay && ctx.selfPlay(meId);
  H.reactClose = () => { local.reactTo = null; ctx.rerender(); };
  H.punch = (id) => { local.reactTo = null; if (ctx.punch) ctx.punch(id); ctx.rerender(); };
  H.react = (i) => { const to = local.reactTo; local.reactTo = null; ctx.react(ctx.reactionList[Number(i)], to === meId ? null : to); };
  H.exit = () => ctx.onExit();
  H.sound = () => ctx.toggleSound();
  H.vibe = () => ctx.toggleVibe && ctx.toggleVibe();
  H.intros = () => ctx.toggleIntros && ctx.toggleIntros();
  H.push = () => ctx.togglePush && ctx.togglePush();
  H.modal = (kind) => ctx.openModal(kind);
  H.auction = () => ctx.act((s) => drawForAuction(s, meId, ctx.now()));
  H.tradeOpen = () => { local.tradeOpen = true; local.tradePicked = false; local.sel = []; local.tradeTarget = null; local.tradeAnimal = null; ctx.rerender(); };
  H.tradeWith = (val) => { const [pid, animal] = String(val).split('|'); local.tradeOpen = true; local.tradePicked = true; local.sel = []; local.tradeTarget = pid; local.tradeAnimal = animal; ctx.rerender(); };

  // ----- Überlagerung je nach Phase -----
  let overlay = '';


  // Bezahlen läuft jetzt auf dem Tisch (siehe oben)

  // Kuhhandel und sein Ergebnis laufen jetzt auf dem Tisch (siehe oben)

  // Blockieren läuft jetzt auf dem Tisch (siehe oben)

  const iconsOf = (r) => `${r.quartets.map((id) => `<span class="ci" style="--a:${ANIMAL_COLORS[id]}" title="${aname(id)}">${art(id)}</span>`).join('')}${r.blocked ? `<span class="ci blocked" style="--a:${ANIMAL_COLORS[r.blocked]}" title="${aname(r.blocked)} – blockiert">${art(r.blocked)}</span>` : ''}${(r.specials || []).map((id) => `<span class="ci sp" style="--a:${ANIMAL_COLORS[id]}" title="${aname(id)}-Spezialkarte">${art(id)}${STAR}</span>`).join('')}${r.rats ? `<span class="ci" style="--a:${ANIMAL_COLORS[RAT]}" title="${r.rats}× Ratte">${art(RAT)}</span>` : ''}${r.money ? `<span class="cimoney" title="übriges Geld zählt mit">+${r.money}</span>` : ''}`;
  // Börsenbericht: die Momente des Spiels im Stil eines Kurszettels (auch zum Teilen in der Gruppe)
  const reportList = () => {
    const list = awards(state);
    let poor = null;
    for (const p of state.players) { const t = sum(p.money); if (!poor || t < poor.v) poor = { id: p.id, v: t }; }
    const rich = list.find((a) => a.key === 'rich');
    if (poor && (!rich || rich.who !== poor.id)) list.push({ key: 'poor', title: 'Pleitegeier', who: poor.id, name: state.players.find((p) => p.id === poor.id)?.name || '?', text: `nur noch ${poor.v} Taler` });
    return list;
  };
  const ICON = { buy: '💸', trade: '🐮', rat: '🐀', ratcards: '🧀', special: '⭐', money: '🍀', rich: '🏦', poor: '📉', bluff: '🃏', pech: '🌧️', tip: '💶', geiz: '🤏' };
  H.shareReport = async () => {
    const sc = scores(state).sort((a, b) => b.score - a.score);
    const text = ['📈 Börsenbericht – Team Rockets Tier Börse', `🏆 ${sc[0].name} gewinnt mit ${sc[0].score} Punkten`,
      ...sc.slice(1).map((r, k) => `${k + 2}. ${r.name} · ${r.score}`), '',
      ...reportList().map((a) => `${ICON[a.key] || '•'} ${a.title}: ${a.name} – ${a.text}`)].join('\n');
    try {
      if (navigator.share) { await navigator.share({ title: 'Börsenbericht', text }); return; }
      await navigator.clipboard.writeText(text); local.shared = Date.now(); ctx.rerender();
    } catch { /* abgebrochen */ }
  };
  // Spielende: erst die Abrechnung (Tippen überspringt), danach das Siegertreppchen mit Konfetti
  const TALLY_START = 500; const TALLY_STEP = 1500;
  // v0.63 (Alp): Spielende gemeinsam anschauen – nichts überspringen. Die Abrechnung startet erst,
  // wenn der letzte Zug (Ergebnis-Fenster, Flüge, Gags) fertig gezeigt ist.
  if (entered && state.phase === 'ended') {
    const lastWait = v.lastEvent && EV_WAIT[v.lastEvent.type] ? evWait(v.lastEvent.type, v.deck) + 2600 : 900;
    local.tallyAt = ctx.demoPodium ? Date.now() - 600000 : Date.now() + (fresh ? lastWait : 0); local.tallySkip = false; local.podiumShown = false;
  }
  const tallyTotal = TALLY_START + v.players.length * TALLY_STEP + 900;
  const tallyEl = local.tallyAt ? Date.now() - local.tallyAt : Infinity;
  const endWait = state.phase === 'ended' && tallyEl < 0; // letzter Zug läuft noch
  if (endWait) wakeLocal(local.tallyAt + 10);
  const tallyOn = state.phase === 'ended' && !endWait && !local.recap && tallyEl < tallyTotal;
  if (tallyOn) wakeLocal(local.tallyAt + tallyTotal + 20);
  // v0.63 Finale „Und der Sieger ist …“ (Trommelwirbel, dann Rampenlicht) – zwischen Abrechnung und Treppchen
  const FINALE_MS = 3200;
  const finaleOn = state.phase === 'ended' && !endWait && !local.recap && !tallyOn && tallyEl < tallyTotal + FINALE_MS && !ctx.demoPodium;
  if (finaleOn) wakeLocal(local.tallyAt + tallyTotal + FINALE_MS + 20);
  if (finaleOn && !local.finaleSound) { local.finaleSound = true; sounds.push('drum'); later.push(['fanfare', 1700]); }
  const podiumIn = state.phase === 'ended' && !endWait && !tallyOn && !finaleOn && !local.recap && !local.podiumShown;
  if (podiumIn) local.podiumShown = true;
  if (state.phase === 'ended' && local.recap) {
    const list = reportList();
    const copied = local.shared && Date.now() - local.shared < 3000;
    if (copied) wakeLocal(local.shared + 3050);
    overlay = `<div class="overlay endtable"><div class="ending recap">
      <h2>📈 Börsenbericht</h2>
      <ul>${list.map((a) => { const i = idxOf(a.who); return `<li><span class="atitle"><i>${ICON[a.key] || '•'}</i>${esc(a.title)}</span>${i >= 0 ? avatar(v.players[i], i) : ''}<span class="awho">${esc(a.who === meId ? 'Du' : a.name)}</span><span class="atext">${esc(a.text)}</span></li>`; }).join('') || '<li>Keine besonderen Momente – ein ruhiges Spiel.</li>'}</ul>
      <div class="endbtns"><button type="button" class="pill pill-white" data-a="shareReport">${copied ? 'Kopiert ✓' : '📤 Teilen'}</button><button type="button" class="pill pill-red" data-a="recap">Zurück zur Wertung</button></div>
    </div></div>`;
  } else if (state.phase === 'ended' && tallyOn) {
    // Abrechnung: Punkte werden einzeln hochgezählt – vom letzten Platz bis zum Sieger, dann das Siegertreppchen
    const s = scores(state).sort((a, b) => b.score - a.score);
    const ranked = s.map((r) => ({ ...r, place: s.findIndex((x) => x.score === r.score) + 1 }));
    const n = ranked.length;
    const cnt = typeof CSS !== 'undefined' && CSS.registerProperty ? 'cnt' : '';
    overlay = `<div class="overlay endtable"><div class="ending tally ${cnt}">
      <h2>Abrechnung</h2>
      <div class="tallyrows">${ranked.map((r, idx) => {
        const i = idxOf(r.id); const d = TALLY_START + (n - 1 - idx) * TALLY_STEP - tallyEl;
        return `<div class="trow ${r.place === 1 ? 'win' : ''}" style="--d:${d}ms;--to:${r.score};--c:${SEAT_COLORS[i]}"><i>${r.place === 1 ? '👑' : `${r.place}.`}</i>${avatar(v.players[i], i)}<span class="tname">${esc(r.id === meId ? 'Du' : r.name)}</span><span class="picons">${iconsOf(r)}</span><b class="tnum"><span>${r.score}</span></b></div>`;
      }).join('')}</div>
    </div></div>`;
  } else if (state.phase === 'ended' && finaleOn) {
    const sc0 = scores(state).sort((a, b) => b.score - a.score);
    const wins = sc0.filter((r) => r.score === sc0[0].score);
    const fEl = tallyEl - tallyTotal;
    overlay = `<div class="overlay endtable finale" style="--fel:-${fEl}ms"><div class="fspot"></div>
      <h2 class="ftitle">Und ${wins.length > 1 ? 'die Sieger sind' : 'der Sieger ist'} …</h2>
      <div class="fwin">${wins.map((r) => { const i = idxOf(r.id); return `<div class="fone" style="--c:${SEAT_COLORS[i]}"><div class="ffig">${figOf(r.id)}</div><b>${esc(r.id === meId ? 'Du!' : r.name)}</b><small>${r.score} Punkte</small></div>`; }).join('')}</div>
      ${Array.from({ length: 24 }, (_, k) => `<i class="fconf" style="--k:${k};--x:${(k * 37) % 100}%;--h:${(k * 47) % 360}"></i>`).join('')}</div>`;
  } else if (state.phase === 'ended' && !endWait) {
    const s = scores(state).sort((a, b) => b.score - a.score);
    // Platz nach Punkten (gleiche Punkte = gleicher Platz)
    const ranked = s.map((r) => ({ ...r, place: s.findIndex((x) => x.score === r.score) + 1 }));
    const top = ranked.slice(0, 3);
    const order = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
    const rest = ranked.slice(3);
    const winIdx = idxOf(s[0].id);
    const step = (r) => {
      const i = idxOf(r.id);
      return `<button type="button" class="pod p${Math.min(r.place, 3)} ${local.scoreOpen === r.id ? 'open' : ''}" data-a="scoreOpen" data-v="${esc(r.id)}" style="--c:${SEAT_COLORS[i]}">
        ${r.place === 1 ? '<span class="crown">👑</span>' : ''}${figure(v.players[i], i, `hop${r.place === 1 ? ' win' : ''}`)}
        <span class="pname2">${esc(r.id === meId ? 'Du' : r.name)}</span>
        <span class="pblock"><b>${r.score}</b><span class="picons">${iconsOf(r)}</span><i>${r.place}.</i></span>
        ${r.place === 1 && ctx.rewards && !ctx.myRewards ? '<span class="pdub">+10 <i class="dub" aria-label="Dublonen"></i></span>' : ''}</button>`;
    };
    // Rechnung steht immer da: erst die des Gewinners, Antippen zeigt die eines anderen
    const openRow = ranked.find((r) => r.id === local.scoreOpen) || ranked[0];
    const cols = ['#FFD34E', '#D7263D', '#1D5FC2', '#B8285F', '#6D3FC0', '#7FA88A', '#fff'];
    const confetti = podiumIn ? `<div class="confetti" aria-hidden="true">${Array.from({ length: 40 }, (_, k) =>
      `<i style="left:${(k * 37) % 100}%;background:${cols[k % cols.length]};animation-delay:${(k % 10) * 90}ms;animation-duration:${1600 + (k % 7) * 180}ms;transform:rotate(${k * 29}deg)"></i>`).join('')}</div>` : '';
    overlay = `<div class="overlay endtable ${podiumIn ? 'enter' : ''}">${confetti}<div class="ending podium">
      <h2 style="--c:${SEAT_COLORS[winIdx]}">${v.winner?.includes(meId) ? 'Du hast gewonnen!' : `${esc(s[0].name)} gewinnt!`}</h2>
      <div class="pods">${order.map(step).join('')}</div>
      ${rest.length ? `<div class="prest">${rest.map((r) => { const i = idxOf(r.id); return `<button type="button" class="prow4 ${local.scoreOpen === r.id ? 'open' : ''}" data-a="scoreOpen" data-v="${esc(r.id)}"><i>${r.place}.</i>${avatar(v.players[i], i)}<span>${esc(r.id === meId ? 'Du' : r.name)}</span><span class="picons">${iconsOf(r)}</span><b>${r.score}</b></button>`; }).join('')}</div>` : ''}
      ${ctx.rewards && ctx.myRewards ? (() => {
        // v0.55: was du in dieser Partie verdient hast (vom Server berechnet)
        const lbl = { partie: 'Mitgespielt', quartett: 'Quartette', sieg: 'Sieg' };
        const tot = ctx.myRewards.reduce((t, x) => t + x.amount, 0);
        return ctx.myRewards.length ? `<div class="pdubs">${ctx.myRewards.map((x) => `<span>+${x.amount} ${lbl[x.kind] || ''}</span>`).join('')}<b>= +${tot} <i class="dub" aria-label="Dublonen"></i></b></div>`
          : '<div class="pdubs none" title="Zählt erst ab 3 Spielern, 6 Minuten und 25 Zügen; höchstens 60 am Tag">Keine Dublonen<small>Partie zu kurz/klein oder Tageslimit</small></div>';
      })() : ''}
      <div class="sform2">${openRow ? `${esc(openRow.id === meId ? 'Du' : openRow.name)}: ${scoreFormula(state.players[idxOf(openRow.id)], openRow.blocked, !!state.settings?.moneyCounts)}${openRow.blocked ? ` · ${esc(aname(openRow.blocked))} blockiert` : ''}` : ''}</div>
      <div class="endbtns">
        <button type="button" class="pill pill-white" data-a="recap">📈 Börsenbericht</button>
        <button type="button" class="pill pill-red ${ctx.rematchId ? 'pulse' : ''}" data-a="rematch">${ctx.rematchId ? 'Revanche läuft – mitmachen' : 'Revanche'}</button>
        <button type="button" class="pill pill-white" data-a="exit">Zur Startseite</button>
      </div>
    </div></div>`;
  }

  H.rematch = () => ctx.onRematch();
  H.recap = () => { local.recap = !local.recap; ctx.rerender(); };
  H.tallySkip = () => { local.tallySkip = true; ctx.rerender(); };
  H.scoreOpen = (id) => { local.scoreOpen = local.scoreOpen === id ? null : id; ctx.rerender(); };

  // ----- Effekte: Tier fliegt zum neuen Besitzer, Konfetti am Ende, Quartett-Moment -----
  let effects = '';
  // Einmal-Effekte merken (Startzeit), damit sie beim nächsten Neuzeichnen an der richtigen Stelle weiterlaufen
  local.fx = (local.fx || []).filter((f) => f.until > Date.now());
  const keepFx = (html, dur, tag = null) => { if (html) local.fx.push({ html, at: Date.now(), until: Date.now() + dur, tag }); if (local.fx.length > 14) local.fx.splice(0, local.fx.length - 14); };
  const le = v.lastEvent;
  // Ergebnis-Fenster (ein Design für alles): Versteigerung, Spezialkarte, Kuhhandel.
  // Karte und Geld fliegen erst los, wenn das Fenster zugeht (Zeit um oder Antippen).
  const EV_DUR = EV_WAIT;
  const receiverOf = (e) => (e.type === 'rat_taken' ? e.player : e.type === 'trade' ? (e.animal === RAT ? (e.winner === e.challenger ? e.target : e.challenger) : e.winner) : e.buyer);
  const evSig = le && EV_DUR[le.type] ? `${le.type}|${le.n}` : null;
  let evNew = false;
  if (evSig && local.resSig !== evSig) { local.resSig = evSig; evNew = !!(evFresh || ctx.demoPop); }
  const evDelay = evNew ? evWait(le.type, v.deck) : 0;
  const quartets = [];
  v.players.forEach((p) => Object.entries(p.animals).forEach(([id, n]) => { if (n === 4) quartets.push(`${p.id}|${id}`); }));
  if (local.prevQuartets) {
    const added = quartets.filter((q) => !local.prevQuartets.includes(q));
    const [qp, qa] = added.length ? added[0].split('|') : [];
    if (added.length) { local.qSound = true; if (qp === meId) local.qMine = true; }
    if (added.length && evNew && receiverOf(le) === qp && le.animal === qa) local.qBadge = `${evSig}`; // Quartett steht als Abzeichen im Ergebnis-Fenster
    if (added.length) local.poloNext = { pid: qp, animal: qa, delay: evNew ? evDelay + 600 : 500 };
    else if (added.length) {
      const [pid, animal] = added[0].split('|');
      const who = pid === meId ? 'Du hast' : `${esc(nameOf(pid))} hat`;
      keepFx(`<div class="qpop" aria-live="polite"><div class="qcards">${[0, 1, 2, 3].map((k) => `<div class="qc" style="--k:${k};--a:${ANIMAL_COLORS[animal]}">${art(animal)}</div>`).join('')}</div>
        <b>Quartett!</b><span>${who} alle 4× ${aname(animal)}</span></div>`, 2900);
    }
  }
  local.prevQuartets = quartets;
  // Zuschlag: Hammer-Ton, „Verkauft!“-Stempel liegt auf der Karte beim Bezahlen
  if (entered && state.phase === 'payment' && (prev.phase === 'auction' || prev.phase === 'special')) sounds.push('gavel');
  if (evFresh && (state.phase === 'turn' || state.phase === 'ended') && le && (le.type === 'auction_won' || le.type === 'trade' || le.type === 'special_won' || le.type === 'rat_taken')) {
    let to = le.type === 'trade' ? le.winner : le.type === 'rat_taken' ? le.player : le.buyer;
    if (le.type === 'trade' && le.animal === RAT) to = le.winner === le.challenger ? le.target : le.challenger;
    const flyAnimal = le.type === 'rat_taken' ? RAT : le.animal;
    const mine = to === meId;
    const n = le.type === 'trade' ? le.count : 1;
    // Ziel wird nach dem Zeichnen gemessen: deine Auslage bzw. der Platz des Mitspielers
    keepFx(Array.from({ length: n }, (_, k) => `<div class="fly ${evDelay ? 'fromev' : ''}" ${mine ? `data-flyto="${flyAnimal}"` : `data-aim-to="${esc(to)}" data-aim-scale="0.32"`} style="--tx:0px;--ty:-120px;animation-delay:${evDelay + k * 120}ms">
      <div class="bigcard-head" style="--a:${ANIMAL_COLORS[flyAnimal]}"><span class="mono">${art(flyAnimal)}</span>${le.type === 'special_won' ? STAR : ''}</div></div>`).join('')
, evDelay + 1700 + n * 120, evDelay ? 'ev' : null);
  }
  // Der Zug wandert sichtbar im Uhrzeigersinn: ein goldener Schein gleitet vom alten zum neuen Platz
  const holder = shownHolder;
  local.holder = holder;
  if (local.turnHold) wakeLocal(local.turnHold.until + 30);

  // Geld fliegt (verdeckt) vom Platz des Zahlers zum Platz des Empfängers (Start und Ziel werden gemessen)
  const moneyFly = (from, to, count, delay = 0, vals = null) => {
    if (!count || (from !== '@pot' && idxOf(from) < 0) || idxOf(to) < 0) return '';
    const n = Math.min(count, 15);
    // deine eigenen Scheine fliegen offen: beim Bezahlen kurz hochgeschoben aus dem Fächer, beim Bekommen in den Fächer hinein
    const mine = (from === meId || to === meId) && vals && vals.length >= n ? (from === meId ? 'out' : 'in') : '';
    return Array.from({ length: n }, (_, k) => { const dx = Math.round((k - (n - 1) / 2) * Math.min(30, 200 / n));
      return mine ? `<div class="mfly mine ${mine}" data-aim-from="${esc(from)}" data-aim-to="${esc(to)}" ${mine === 'out' ? `data-aim-fdx="${dx}"` : `data-aim-tdx="${dx}"`} style="--m:${MONEY_COLORS[vals[k]]};animation-delay:${delay + k * MSTEP}ms">${vals[k]}</div>`
        : `<div class="mfly" data-aim-from="${esc(from)}" data-aim-to="${esc(to)}" style="animation-delay:${delay + k * MSTEP}ms"></div>`; }).join(''); // so viele Scheine, wie wirklich bezahlt werden
  };
  // Geld fliegt nach dem Ablauf-Plan: erst wenn das Tier gelandet ist; beim Kuhhandel das Gegenangebot erst, wenn das Angebot angekommen ist
  if (evFresh && le && (state.phase === 'turn' || state.phase === 'ended') && EV_WAIT[le.type]) {
    const tg = evDelay ? 'ev' : null;
    const ch = choreo(le, v.deck, evDelay, le.type === 'rat_taken' ? local.ratLaid : null);
    const hf = local.handFx; const gainLeft = hf ? [...hf.gain] : [];
    ch.streams.forEach((x) => { if (!x.from) return;
      const vals = !hf ? null : x.from === meId ? hf.lose : x.to === meId ? gainLeft.splice(0, Math.min(x.count, 15)) : null;
      keepFx(moneyFly(x.from, x.to, x.count, x.at, vals), x.at + streamMs(x.count) + 100, tg); });
    // v0.54: Jubel – wer das Tier bekommt (Versteigerung, Spezialkarte, Kuhhandel), dessen Figur hüpft kurz über seinem Platz
    const rid = le.type === 'rat_taken' ? null : receiverOf(le);
    const ri = rid ? idxOf(rid) : -1;
    if (rid === meId) {
      // v0.56: du jubelst selbst – deine Figur unten rechts hüpft, das 🎉 kommt von ihr
      local.meJubAt = Date.now() + ch.payAt - 150;
      keepFx(`<div class="cheerfx me burst" data-aim-to="@me" data-aim-anchor="center" style="animation-delay:${ch.payAt - 150}ms" aria-hidden="true"><i class="cheerstar">🎉</i></div>`, ch.payAt + 1700, tg);
    } else if (ri >= 0) {
      const pr = avatarLookup(rid);
      const inner = pr?.shop ? shopAvatarFull(pr.shop) : `<span class="cheerhead">${avatar(v.players[ri], ri)}</span>`;
      keepFx(`<div class="cheerfx ${rid === meId ? 'me' : ''} ${pr?.shop ? 'full' : ''}" data-aim-to="${esc(rid)}" data-aim-anchor="center" style="animation-delay:${ch.payAt - 150}ms" aria-hidden="true">${inner}<i class="cheerstar">🎉</i></div>`, ch.payAt + 1700, tg);
    }
  }
  // v0.52.1: Rattenrunde – wer eine Karte legt, dessen Schein fliegt verdeckt in den Topf in der Mitte
  if (state.phase === 'rat' && local.ratLaid && !entered) {
    Object.entries(v.rat.laid).forEach(([pid, c]) => { const d = c - (local.ratLaid[pid] || 0);
      if (d > 0 && idxOf(pid) >= 0) keepFx(Array.from({ length: Math.min(d, 3) }, (_, k) => `<div class="mfly topot" data-aim-from="${esc(pid)}" data-aim-to="@pot" style="animation-delay:${k * MSTEP}ms"></div>`).join(''), 1000 + 3 * MSTEP); });
  }
  if (state.phase === 'rat') local.ratLaid = { ...v.rat.laid }; else if (state.phase !== 'turn') local.ratLaid = null;

  // Geräusche zu den Ereignissen
  if (entered && (state.phase === 'rat' || state.phase === 'special')) sounds.push('flip');
  // Ratte aufgedeckt: Quieken, eine kleine Ratte huscht über den Tisch
  if (entered && state.phase === 'rat') { later.push(['quiek', 500]); keepFx([0, 1, 2].map((k) => `<div class="ratrun r${k}" aria-hidden="true">${art(RAT)}</div>`).join(''), 2600); } // ein ganzes Rattenrudel flitzt über den Tisch
  if (fresh && state.phase === 'rat' && !entered) sounds.push('bid');
  // Geldschein aus dem Stapel: Karte groß für alle zeigen, dann fliegt sie zum Spieler
  const lem = v.lastEvent;
  const moneySig = lem?.type === 'money_drawn' ? `${lem.n}|${lem.player}|${lem.value}` : null;
  if (moneySig && evFresh && local.moneySig !== moneySig) {
    local.moneySig = moneySig;
    keepFx(`<div class="moneyreveal" data-aim-to="${esc(lem.player)}" data-aim-anchor="center" style="--ty:0px;--tx:0px">
      <div class="money big" style="--m:${MONEY_COLORS[lem.value] || '#eee'}">${mIn(lem.value)}${lem.value >= 100 ? glitz(lem.value >= 500 ? 14 : lem.value >= 200 ? 10 : 6, lem.value >= 500 ? 'gold' : '') : ''}</div>
      <span class="mrlabel">${esc(lem.player === meId ? 'Du' : nameOf(lem.player))} ${lem.player === meId ? 'ziehst' : 'zieht'} <b>${lem.value}</b></span></div>`, 2700);
  }
  // Börsen-News aufgedeckt: große Karte in der Mitte (3,4 s), mit deinem persönlichen Teil (Steuer/Marktpanik)
  const newsSig = lem?.type === 'news' ? `${lem.n}|${lem.kind}` : null;
  if (newsSig && evFresh && local.newsSig !== newsSig) {
    local.newsSig = newsSig;
    keepFx(newsReveal(lem, meId, nameOf), 3400);
    sounds.push('flip'); later.push([lem.kind === 'crash' || lem.kind === 'steuer' ? 'boo' : lem.kind === 'hektik' ? 'tick' : 'coins', 600]);
  }
  // v0.61 Admin-Fähigkeit „Verprügeln“: Figur läuft hin, Prügelwolke, läuft zurück (bei allen)
  for (const pu of ctx.punches || []) {
    const sig = `${pu.from}|${pu.to}|${pu.at}`;
    local.punchSeen = local.punchSeen || [];
    if (local.punchSeen.includes(sig)) continue;
    local.punchSeen.push(sig); if (local.punchSeen.length > 20) local.punchSeen.shift();
    if (Date.now() - pu.at > 2500 || idxOf(pu.from) < 0 || idxOf(pu.to) < 0) continue;
    keepFx(punchFx(pu), PUNCH_MS);
    [1150, 1380, 1560, 1790, 1980, 2200].forEach((t) => later.push(['thud', t]));
    later.push(['wow', 2500]);
  }
  if (state.phase === 'special') {
    const sp = v.special;
    const t = ctx.now();
    const st = specialStage(v, t);
    const n = st === 'countdown' ? specialNumber(v, t) : null;
    if (n != null && n <= 3 && n > 0 && !Object.keys(sp.buzzes).length && local.lastTick !== `${sp.startsAt}|${n}`) { local.lastTick = `${sp.startsAt}|${n}`; sounds.push('tick'); }
    const nb = Object.keys(sp.buzzes).length;
    if ((local.prevBuzz ?? nb) < nb) sounds.push('buzz');
    local.prevBuzz = nb;
    // Schnick-Schnack-Schnuck: Hände schütteln, dann aufdecken
    const le2 = v.lastEvent;
    const sig = le2?.type === 'rps' ? JSON.stringify(le2) : null;
    if (sig && local.rpsSig !== sig) { local.rpsSig = sig; local.rpsShow = { ev: JSON.parse(sig), at: Date.now() }; sounds.push('rps'); }
  } else {
    local.prevBuzz = undefined;
  }
  if (evFresh && v.lastEvent?.type === 'batzen') sounds.push('batzen');
  if (entered && state.phase === 'ended') {
    const sc = scores(state).sort((a, b) => b.score - a.score);
    const last = sc.length > 1 && sc[sc.length - 1].id === meId && sc[sc.length - 1].score < sc[0].score;
    sc.forEach((_, k) => later.push(['drum', TALLY_START + k * TALLY_STEP])); // Trommelwirbel je Zeile
    const winAt = TALLY_START + (sc.length - 1) * TALLY_STEP + 1100;
    later.push(['glitz', winAt]); later.push([last ? 'boo' : 'fanfare', winAt + 300]);
  }
  if (entered && state.phase === 'auction') {
    sounds.push('flip');
    if (v.lastEvent?.type === 'donkey') { later.push(['crumple', 1850]); v.players.forEach((_, pi) => later.push(['thud', ESEL_THROW_AT + pi * ESEL_THROW_GAP + ESEL_FLIGHT - 20])); later.push(['coins', ESEL_THROW_AT + v.players.length * ESEL_THROW_GAP + ESEL_FLIGHT]); }
    const VOICE = { kuh: 'muh', esel: 'iah', hahn: 'kikeriki' };
    if (aval(auction.animal) >= 650) { sounds.push('drum'); later.push(['glitz', 1050]); } // teure Karte: Trommelwirbel, nach dem Umdrehen Glitzern
    if (VOICE[auction.animal]) later.push([VOICE[auction.animal], 1350]);
  }
  else if (fresh && state.phase === 'auction' && auction.high) sounds.push('bid');
  // Überboten: du lagst vorne, jetzt jemand anderes
  if (state.phase === 'auction' && prev.phase === 'auction' && prev.highMe && auction.high && auction.high.player !== meId) {
    sounds.push('outbid'); feel('outbid');
  }
  if (evFresh && le && (state.phase === 'turn' || state.phase === 'ended')) {
    if (le.type === 'auction_won') { sounds.push('gavel'); if (le.amount > 0) sounds.push('coins'); if (le.buyer === meId) feel('won'); }
    if (le.type === 'special_won') { sounds.push('gavel'); if (le.count > 0) sounds.push('coins'); if (le.buyer === meId) feel('won'); }
    if (le.type === 'rat_taken' && le.count > 0) sounds.push('coins');
    if (le.type === 'money_drawn') { sounds.push('flip'); sounds.push('coins'); if (le.value >= 100) later.push(['glitz', 300]); }
    if (le.type === 'trade') sounds.push('trade');
  }
  if (local.qSound) sounds.push('quartet');
  if (local.qMine) feel('quartet');
  local.qMine = false;
  // Kuhhandel-Herausforderung an dich / kann nicht zahlen: spürbar
  if (entered && state.phase === 'trade' && v.trade.target === meId) feel('challenge');
  // „KUHHANDEL!“: kurzer, großer Auftritt bei allen – wer fordert wen heraus, um was
  if (entered && state.phase === 'trade' && v.trade) {
    const t = v.trade; const ci = idxOf(t.challenger); const ti = idxOf(t.target); const isRat = t.animal === RAT;
    const nmx = (id) => esc(id === meId ? 'Du' : nameOf(id));
    keepFx(`<div class="khscrim" aria-hidden="true"></div><div class="khsplash ${isRat ? 'rat' : ''}" aria-live="polite">
      <b>${isRat ? 'RATTENHANDEL!' : 'KUHHANDEL!'}</b>
      <div class="khduo"><span class="khl" style="--c:${SEAT_COLORS[ci]}">${avatar(v.players[ci], ci)}<i>${nmx(t.challenger)}</i></span><em>⚔</em><span class="khr" style="--c:${SEAT_COLORS[ti]}">${avatar(v.players[ti], ti)}<i>${nmx(t.target)}</i></span></div>
      <small>um ${t.count}× ${esc(isRat ? 'Ratte' : aname(t.animal))}</small></div>`, 1500);
    later.push(['drum', 0]);
    const oc = Math.min(Array.isArray(t.offer) ? t.offer.length : t.offer || 0, 8);
    if (oc) keepFx(Array.from({ length: oc }, (_, k) => `<div class="mfly topot" data-aim-from="${esc(t.challenger)}" data-aim-to="@offer" style="animation-delay:${OFFER_FLY + k * MSTEP}ms"></div>`).join(''), OFFER_FLY + MFLY_MS + oc * MSTEP + 100);
  }
  // Große Auftritte – nur bei besonderen Ereignissen, höchstens einer pro Ergebnis (Rang: Gleichstand > Bluff > Geschenkt > Quartett)
  const boom = (title, sub, cls = '', delay = 0) => { keepFx(`<div class="khscrim" style="--d:${delay}ms" aria-hidden="true"></div><div class="khsplash boom ${cls}" style="--d:${delay}ms" aria-live="polite"><b>${title}</b><small>${sub}</small></div>`, delay + 1500); later.push(['wow', delay]); };
  const vb = (id, du, er) => (id === meId ? du : er);
  const nmB = (id) => esc(id === meId ? 'Du' : nameOf(id));
  if (evNew && le) {
    const isRatT = le.animal === RAT;
    const thing = le.type === 'trade' ? `${le.count}× ${esc(isRatT ? 'Ratte' : aname(le.animal))}` : '';
    const afterFlip = 1500; // Scheine sind umgedreht, Differenz steht da
    const zeros = (c) => Array.isArray(c) && c.length > 0 && c.every((m) => m === 0);
    const iAmIn = le.type === 'trade' && (le.challenger === meId || le.target === meId);
    const winCards = le.type === 'trade' ? (le.accepted || le.winner === le.challenger ? le.offer : le.counter) : null;
    if (le.type === 'trade' && !le.accepted && le.diff === 0) boom('GLEICHSTAND!', isRatT ? `${nmB(le.challenger)} ${vb(le.challenger, 'wirst', 'wird')} ${thing} los` : `${nmB(le.challenger)} ${vb(le.challenger, 'holst', 'holt')} ${thing} umsonst`, 'tie', afterFlip);
    // Bluff: nur die beiden Beteiligten sehen die Beträge – also auch nur sie den Auftritt
    else if (iAmIn && zeros(winCards)) boom('BLUFF!', `${nmB(le.winner)} ${vb(le.winner, 'gewinnst', 'gewinnt')} mit lauter Nullen`, 'bluff', le.accepted ? 300 : afterFlip);
    else if (le.type === 'special_won' && !le.count) boom('GESCHENKT!', `Niemand buzzert – ${nmB(le.buyer)} ${vb(le.buyer, 'bekommst', 'bekommt')} die Spezialkarte umsonst`, 'gift', 0);
    else if (local.qBadge === evSig) { const qp = receiverOf(le); boom('QUARTETT!', `${nmB(qp)} ${vb(qp, 'hast', 'hat')} alle 4× ${esc(aname(le.animal))}`, 'quartet', le.type === 'trade' && !le.accepted ? afterFlip : 300); }
  }
  // Alle Ratten bei einem: er muss ein Quartett blockieren
  if (entered && state.phase === 'block' && v.block) boom('RATTENKÖNIG!', `${nmB(v.block.player)} ${vb(v.block.player, 'hast', 'hat')} alle Ratten – ein Quartett zählt nicht`, 'rat', 0);
  if (evFresh && v.lastEvent?.type === 'cant_pay' && v.lastEvent.player === meId) feel('heavy');
  local.qSound = false;




  // Schnick-Schnack-Schnuck: 1,5 s Hände schütteln, dann 4 s Ergebnis – auch wenn es schon weitergeht
  const RPS_MS = 5500;
  if (local.rpsShow) {
    const el = Date.now() - local.rpsShow.at;
    if (el < RPS_MS) {
      const le2 = local.rpsShow.ev;
      const names = Object.keys(le2.picks);
      const nm = (id) => esc(id === meId ? 'Du' : nameOf(id));
      const result = le2.winners ? (le2.winners.length === 1 ? `${nm(le2.winners[0])} ${le2.winners[0] === meId ? 'gewinnst' : 'gewinnt'}!` : 'Weiter geht’s!') : 'Unentschieden – nochmal!';
      effects += `<div class="rpsshow v2" data-a="rpsClose" role="button" aria-live="polite" style="--el:-${el}ms">
        <div class="rpswords"><span>Schnick</span><span>Schnack</span><span>Schnuck!</span></div>
        <div class="rpshands">${names.map((id) => `<div class="rh"><div class="hand"><b class="shake">✊</b><b class="real">${RPS_ICON[le2.picks[id]]}</b></div><small>${nm(id)}</small></div>`).join('')}</div>
        <div class="rpsresult">${result}</div><i class="rtimer"></i></div>`;
      wakeLocal(local.rpsShow.at + RPS_MS + 50);
    } else local.rpsShow = null;
  }
  H.rpsClose = () => { local.rpsShow = null; ctx.rerender(); };

  // Ergebnis-Fenster: bleibt eine feste Zeit stehen (auch wenn es weitergeht), Tipp schließt.
  // Beim Schließen fliegen Karte und Geld los (siehe oben: Effekte mit Merker „ev“).
  if (evNew) {
    local.res = { ev: JSON.parse(JSON.stringify(le)), at: Date.now(), dur: evWait(le.type, v.deck), quartet: local.qBadge === evSig };
    // „Tippen zum Schließen“: nur bei den ersten Ergebnis-Fenstern auf diesem Gerät
    let seen = 0; try { seen = Number(localStorage.getItem('kh_evseen')) || 0; localStorage.setItem('kh_evseen', String(seen + 1)); } catch { /* egal */ }
    local.res.hint = seen < 8;
  }
  // ---------- v0.63 „Neuer Spitzenreiter!“: Krönchen fliegt zum neuen Führenden (nur wenn sich die Führung ändert) ----------
  if (state.phase !== 'ended') {
    const pts = v.players.map((p) => ({ id: p.id, sc: scoreFor(p, null, false, KURSE).score }));
    const top = Math.max(...pts.map((x) => x.sc));
    const leaders = pts.filter((x) => x.sc === top);
    const lead = top > 0 && leaders.length === 1 ? leaders[0].id : null;
    if (local.leadInit && lead && lead !== local.leader) {
      const from = local.leader && idxOf(local.leader) >= 0 ? (local.leader === meId ? '@me' : local.leader) : '@cl';
      const to = lead === meId ? '@me' : lead;
      const d = evFresh && EV_WAIT[le?.type] ? evWait(le.type, v.deck) + 900 : 400;
      keepFx(`<div class="crownfly" data-route="${esc(from)};${esc(to)}" data-offs="0,1" data-dur="1100" data-delay="${d}">👑</div>
        <div class="leadtag" data-aim-from="${esc(to)}" data-aim-to="${esc(to)}" style="--tx:0px;--ty:0px;animation-delay:${d + 1000}ms">${lead === meId ? 'Du führst!' : `${esc(nameOf(lead))} führt!`}</div>`, d + 3000);
      later.push(['glitz', d + 1050]);
    }
    if (lead) local.leader = lead;
    local.leadInit = true;
  }

  // ---------- v0.63 Encounter-Intros ----------
  local.duels = local.duels || {}; local.duelWins = local.duelWins || {};
  const pairKey = (a, b2) => [a, b2].sort().join('|');
  const partOf = (pid) => { const i = idxOf(pid); return { fig: figOf(pid), name: pid === meId ? 'Du' : (v.players[i]?.name || '?'), color: SEAT_COLORS[i] || '#1D5FC2', tag: ctx.taglineOf ? ctx.taglineOf(pid) : '' }; };
  const playIntro = (key, opts, sfx = true) => {
    if (local.introKey === key) return 0;
    local.introKey = key;
    if (ctx.introsOff) return 0;
    const dur = opts.short ? INTRO_SHORT_MS : INTRO_MS;
    keepFx(encounterHtml(opts), dur, 'intro');
    if (sfx) { sounds.push('flip'); later.push(['flip', 140]); later.push(['gavel', opts.short ? 320 : 700]); if (!opts.short) feel('heavy'); }
    return dur;
  };
  H.introSkip = () => { local.fx = local.fx.filter((f) => f.tag !== 'intro'); ctx.rerender(); };
  // Kuhhandel/Rattenhandel startet
  if (state.phase === 'trade' && v.trade && entered) {
    const t = v.trade; const pk = pairKey(t.challenger, t.target);
    const key = `trade|${state.log.length}|${t.challenger}|${t.target}`;
    if (local.introKey !== key) {
      local.duels[pk] = (local.duels[pk] || 0) + 1;
      const nth = local.duels[pk]; const w = local.duelWins[pk] || {};
      const maxPair = Math.max(...Object.values(local.duels));
      const rat = t.animal === RAT;
      const dur = playIntro(key, {
        parts: [partOf(t.challenger), partOf(t.target)],
        title: rat ? 'RATTENHANDEL!' : 'KUHHANDEL!', dark: rat,
        center: `<span class="eicard" style="--a:${ANIMAL_COLORS[t.animal] || '#888'}">${art(t.animal)}</span><span class="eium">um ${t.count}×</span>`,
        sub: nth > 1 ? `${nth}. Duell heute · ${w[t.challenger] || 0}:${w[t.target] || 0}` : '',
        short: nth >= 3, rival: nth >= 3 && nth === maxPair,
      });
      if (dur) local.ttDelay = dur; // Kuhhandel-Zeit startet erst nach dem Intro
    }
  }
  if (evFresh && le?.type === 'trade' && le.winner) { const pk = pairKey(le.challenger, le.target); local.duelWins[pk] = local.duelWins[pk] || {}; local.duelWins[pk][le.winner] = (local.duelWins[pk][le.winner] || 0) + 1; }
  // Schnick-Schnack-Schnuck beginnt (2–4 mit gleicher Zahl)
  if (state.phase === 'special' && v.special && specialStage(v, Date.now()) === 'rps') {
    const vals = Object.values(v.special.buzzes || {}); const mx = vals.length ? Math.max(...vals) : 0;
    const who = Object.keys(v.special.buzzes || {}).filter((id) => v.special.buzzes[id] === mx);
    if (who.length > 1) playIntro(`rps|${v.special.revealer}|${v.special.startsAt}|${who.join(',')}`, { parts: who.map(partOf), title: 'GLEICHSTAND!', vs: 'SCHNICK! SCHNACK! SCHNUCK!', center: `<span class="eium">bei ${mx}</span>` });
  }
  // Spielstart: alle Spieler, „Die Börse ist eröffnet!“
  if (state.phase === 'turn' && !v.lastEvent && state.log.length <= 2 && v.players.length >= 2) {
    playIntro(`start|${v.players.map((p) => p.id).join(',')}|${state.log[0] || ''}`, {
      parts: v.players.map((p) => partOf(p.id)), title: 'DIE BÖRSE IST ERÖFFNET!', vs: 'LOS!',
      badge: isTurbo(state) ? '⚡ Turbo' : isBoerse(state) ? '📈 Börsen-Chaos' : '',
    });
  }

  // ---------- v0.62 Gags ----------
  if (evNew && le) {
    // Versteigerung gewonnen: Gewinner springt aus dem Profilbild und jubelt (nach dem Ergebnis-Fenster)
    if (le.type === 'auction_won' && idxOf(le.buyer) >= 0) keepFx(aliveGag(le.buyer, 'cheer', 0, 2300, evDelay + 700, true), evDelay + 3100);
    // Kuhhandel entschieden: das Tier läuft beleidigt mit Koffer vom Abgeber zum Empfänger
    if (le.type === 'trade') {
      const to = receiverOf(le); const from = to === le.challenger ? le.target : le.challenger;
      if (idxOf(to) >= 0 && idxOf(from) >= 0) {
        const pt = (pid) => (pid === meId ? '@me' : pid);
        keepFx(`<div class="tripwalk" data-route="${esc(pt(from))};${esc(pt(to))}" data-dur="1900" data-delay="${evDelay + 250}">${beast(le.animal, 'walk', `<i class="bkoffer"></i>${le.count > 1 ? `<b class="bcount">${le.count}×</b>` : ''}`)}</div>`, evDelay + 2300);
        later.push(['trade', evDelay + 300]);
      }
    }
  }
  // Ratte aufgedeckt: die Ratte klettert aus der Karte, flitzt zu jedem Geldstapel, schnüffelt, und zurück
  if (le?.type === 'rat_drawn' && evFresh && local.ratRunSig !== le.n) {
    local.ratRunSig = le.n;
    const stops = v.players.map((p) => (p.id === meId ? '@myfan' : p.id));
    const SEG = 480, HOLD = 520, START = 900;
    const route = ['@card']; const offs = [0]; let t = 0;
    stops.forEach((st) => { t += SEG; route.push(st); offs.push(t); t += HOLD; route.push(st); offs.push(t); });
    t += SEG; route.push('@card'); offs.push(t);
    keepFx(`<div class="ratrun" data-route="${route.map(esc).join(';')}" data-offs="${offs.map((o) => (o / t).toFixed(3)).join(',')}" data-dur="${t}" data-delay="${START}">${beast(RAT, 'rat')}</div>`, START + t + 100);
    stops.forEach((_, k) => later.push(['tick', START + SEG * (k + 1) + HOLD * k + 120]));
  }
  // Quartett komplett: die 4 Tiere tanzen eine Polonaise über den Tisch und zurück
  if (local.poloNext) {
    const { pid, animal, delay } = local.poloNext; local.poloNext = null;
    const pt = pid === meId ? '@me' : pid;
    keepFx([0, 1, 2, 3].map((k) => `<div class="polo" data-route="${esc(pt)};@cl;@cr;${esc(pt)}" data-offs="0,.3,.7,1" data-dur="3000" data-delay="${delay + k * 190}">${beast(animal, 'dance')}</div>`).join(''), delay + 3800);
  }

  const closeRes = () => {
    if (!local.res) return;
    const left = local.res.at + local.res.dur - Date.now();
    // Flüge, die auf das Fenster warten, sofort starten
    if (left > 0) local.fx.forEach((f) => { if (f.tag === 'ev' && f.at >= local.res.at - 50) { f.at -= left; f.until -= left; } });
    if (local.stripAt > Date.now()) local.stripAt = Date.now(); // Infozeile erscheint, sobald das Fenster weg ist
    // Fenster früher zu: der ganze Ablauf (Flüge, Rahmen, Aufdecken) rückt um dieselbe Zeit vor
    if (left > 0 && local.turnHold) local.turnHold.until -= left;
    if (left > 0 && local.calmUntil) local.calmUntil -= left;
    if (left > 0 && local.handFx) { local.handFx.loseAt -= left; local.handFx.gainAt -= left; }
    if (local.res.html) keepFx(`<div class="evout" aria-hidden="true">${local.res.html}</div>`, 280);
    local.res = null;
  };
  // Neue Runde beginnt (aufdecken, Kuhhandel …): Fenster macht Platz
  if (local.res && !evNew && entered && ['auction', 'special', 'rat', 'trade', 'payment', 'block'].includes(state.phase)) closeRes();
  if (local.res) {
    const el = Date.now() - local.res.at;
    if (el < local.res.dur) {
      const e = local.res.ev;
      const nm = (id) => esc(id === meId ? 'Du' : nameOf(id));
      const verb = (id, du, er) => (id === meId ? du : er);
      const ecP = (id) => { const i = idxOf(id); return i >= 0 ? `<span class="ec-p">${avatar(v.players[i], i)}<b>${nm(id)}</b></span>` : ''; };
      const deal = (from, amt, to, cls = '') => `<div class="ec-deal">${ecP(from)}<span class="ec-arr">→</span><span class="ec-amt ${cls}">${amt}</span><span class="ec-arr">→</span>${ecP(to)}</div>`;
      let card = ''; let kind = ''; let title = ''; let body = ''; let tone = ''; let reveal = false; let duel = '';
      // Bausteine für die Ergebnis-Fenster nebeneinander (Versteigerung, Spezialkarte)
      const dSide = (id, role, inner, cls, tag) => `<div class="du-side ${cls}">${tag ? `<span class="du-tag">${tag}</span>` : ''}${ecP(id)}<span class="du-role">${role}</span>${inner}</div>`;
      const dMid = (cardHtml, sign) => `<div class="du-mid">${cardHtml}${sign}</div>`;
      if (e.type === 'auction_won') {
        kind = '🔨 Versteigerung';
        card = playCard(e.animal);
        if (!e.amount) { title = `${nm(e.buyer)} ${verb(e.buyer, 'bekommst', 'bekommt')} ${theAnimal(e.animal)} umsonst`; body = '<span class="ec-sub">Niemand hat geboten</span>'; }
        else {
          title = `${nm(e.buyer)} ${verb(e.buyer, 'kaufst', 'kauft')} ${theAnimal(e.animal)}${e.self ? ' selbst' : ''}`;
          // Käufer links (zahlt), Empfänger rechts – im selben Stil wie der Kuhhandel
          const payer = e.payer || e.buyer;
          duel = `<div class="du-row">${dSide(payer, e.self ? 'Auktionator' : 'höchstes Gebot', `<b class="du-sum">${e.amount}</b>${e.cardCount ? `<small class="du-note">mit ${karten(e.cardCount)}</small>` : ''}`, 'win', e.self ? 'kauft selbst' : verb(payer, 'kaufst', 'kauft'))}${dMid(playCard(e.animal), '<span class="du-vs">zahlt →</span>')}${dSide(e.payee, e.self ? 'höchstes Gebot' : 'Auktionator', `<b class="du-sum small">+ ${e.cardCount ? karten(e.cardCount) : e.amount}</b>`, '', '')}</div>`
            + (e.self ? `<div class="du-foot"><span class="du-pill">Vorkaufsrecht: ${nm(payer)} ${verb(payer, 'kaufst', 'kauft')} zum Höchstgebot</span></div>` : '');
        }
        tone = e.buyer === meId ? 'good' : '';
      } else if (e.type === 'special_won') {
        kind = '⭐ Spezialkarte';
        card = playCard(e.animal, 'special');
        title = `${nm(e.buyer)} ${verb(e.buyer, e.count ? 'kaufst' : 'bekommst', e.count ? 'kauft' : 'bekommt')} die ${esc(aname(e.animal))}-Spezialkarte${e.count ? '' : ' umsonst'}`;
        if (e.count) {
          // links wer kauft (und zahlt), rechts wer die Karten bekommt
          const backs = `<div class="ecr-cards">${Array.from({ length: Math.min(e.count, 10) }, () => '<span class="ecr-c back"></span>').join('')}</div>`;
          const buzzRole = `buzzert bei ${e.count}`;
          duel = `<div class="du-row">${dSide(e.payer, e.self ? 'deckt auf' : buzzRole, `${backs}<b class="du-sum small">zahlt ${karten(e.count)}</b>`, 'win', e.self ? 'kauft selbst' : verb(e.payer, 'kaufst', 'kauft'))}${dMid(playCard(e.animal, 'special'), '<span class="du-vs">zahlt →</span>')}${dSide(e.payee, e.self ? buzzRole : 'deckt auf · verkauft', `<b class="du-sum small">+ ${karten(e.count)}</b>`, '', '')}</div>`;
        } else body = '<span class="ec-sub">Niemand hat gebuzzert</span>';
        tone = e.buyer === meId ? 'good' : '';
      } else if (e.type === 'rat_taken') {
        kind = '🐀 Rattenrunde';
        card = playCard(RAT, 'rat');
        title = `${nm(e.player)} ${verb(e.player, 'nimmst', 'nimmt')} die Ratte`;
        // Wer nimmt, sieht die gewonnenen Scheine offen (mit Summe), alle anderen nur Rückseiten
        const got = Array.isArray(e.cards) ? [...e.cards].sort((x, y) => y - x) : null;
        const bills = e.count ? `<div class="ecr-cards ec-bills">${(got || Array.from({ length: e.count }, () => null)).slice(0, 10).map((m) => `<span class="ecr-c ${m == null ? 'back' : ''}" style="--m:${m == null ? '#ccc' : MONEY_COLORS[m] || '#eee'}">${m == null ? '' : m}</span>`).join('')}${got ? `<b class="du-sum">= ${got.reduce((t, m) => t + m, 0)}</b>` : ''}</div>` : '';
        body = `<div class="ec-deal">${ecP(e.player)}<span class="ec-arr">←</span><span class="ec-amt cards">${e.count ? `+ ${karten(e.count)}` : 'keine Karten'}</span></div>${bills}
          <span class="ec-sub">${e.count ? `Alle gelegten Karten gehören jetzt ${e.player === meId ? 'dir' : nm(e.player)}` : 'Es lag noch nichts in der Mitte'}</span>`;
      } else {
        const isRat = e.animal === RAT;
        kind = isRat ? '🐀 Rattenhandel' : '🐮 Kuhhandel';
        const loser = e.winner === e.challenger ? e.target : e.challenger;
        title = isRat ? `${nm(loser)} ${verb(loser, 'bekommst', 'bekommt')} ${e.count}× Ratte` : `${nm(e.winner)} ${verb(e.winner, 'gewinnst', 'gewinnt')} ${e.count}× ${esc(aname(e.animal))}`;
        kind += ` · um ${e.count}× ${esc(isRat ? 'Ratte' : aname(e.animal))}`;
        const winTag = isRat ? 'ist sie los' : 'gewinnt';
        // Mitte: der Topf – alle eingesetzten Karten beider Seiten (um 2 → 4 Karten)
        const potN = e.count * 2;
        const mid = (sign) => `<div class="du-mid"><div class="tpot du-pot" style="--pn:${potN};--sp:${Math.min(20, Math.round(48 / Math.max(1, potN - 1)))}px">${Array.from({ length: potN }, (_, k) => `<span class="tpc" style="--k:${k}">${miniCard(e.animal, 'fill')}</span>`).join('')}</div><span class="du-potl">${e.count} gegen ${e.count}</span>${sign}</div>`;
        // Duell nebeneinander: links Herausforderer, rechts Gegner, Tier in der Mitte
        const duSide = (id, role, inner, win, side = '') => `<div class="du-side ${win ? 'win' : 'lose'} ${side}">${win ? `<span class="du-tag">${winTag}</span>` : ''}${ecP(id)}<span class="du-role">${role}</span>${inner}</div>`;
        if (e.accepted) {
          const known = e.offerSum != null;
          const n = Array.isArray(e.offer) ? e.offer.length : e.offer;
          const amt = known ? `<b class="du-sum">${e.offerSum}</b>` : `<b class="du-sum small">${karten(n)}</b>`;
          const got = e.target === meId && known ? `+${e.offerSum} für dich` : `bekommt ${known ? e.offerSum : karten(n)}`;
          duel = `<div class="du-row">${duSide(e.challenger, verb(e.challenger, 'bietest', 'bietet'), amt, true)}${mid('<span class="du-vs ok">✓</span>')}${duSide(e.target, verb(e.target, 'nimmst an', 'nimmt an'), `<b class="du-sum small">${got}</b>`, false).replace('du-side lose', 'du-side')}</div>`;
        } else {
          const amts = e.offerSum != null && e.counterSum != null;
          const cw = e.winner === e.challenger;
          // Aufdecken wie am Tisch: beide Stapel werden Schein für Schein umgedreht, dann steht der Gewinner fest
          // (Unbeteiligte sehen nur die Rückseiten – Beträge bleiben verdeckt)
          const stack = (cards, total) => {
            const list = Array.isArray(cards) ? [...cards].sort((x, y) => y - x) : Array.from({ length: cards || 0 }, () => null);
            const openN = Math.floor((Date.now() - local.res.at - 400) / 160) + 1; // Karte k ist nach 250 + k·160 + 150 ms offen
            if (openN < list.length) wakeLocal(local.res.at + 400 + list.length * 160 + 20);
            return `<div class="ecr-cards">${list.map((m, k) => `<span class="ecr-c ${m == null ? 'back' : k < openN ? 'open' : ''}" style="--k:${k};--m:${m == null ? '#ccc' : MONEY_COLORS[m] || '#eee'}">${m == null ? '' : m}</span>`).join('') || '<em>–</em>'}</div>`
              + (total != null ? `<b class="ecr-sum du-sum">${total}</b>` : `<b class="ecr-sum du-sum small">${karten(list.length)}</b>`);
          };
          // Differenz sehen alle (auch Zuschauer) – groß in der Mitte unter dem Tier
          const diffBox = `<span class="du-diff ecr-after ${e.diff === 0 ? 'tie' : ''}"><small>Differenz</small><b>${e.diff}</b></span>`;
          duel = `<div class="du-row swap">${duSide(e.challenger, verb(e.challenger, 'forderst heraus', 'fordert heraus'), `<div class="du-pile">${stack(e.offer, amts ? e.offerSum : null)}</div>`, cw, 'sl')}${mid(`<span class="du-vs">VS</span>${diffBox}`)}${duSide(e.target, 'Gegenangebot', `<div class="du-pile">${stack(e.counter, amts ? e.counterSum : null)}</div>`, !cw, 'sr')}</div>`;
          const pills = e.diff === 0 ? [`Gleichstand – ${nm(e.challenger)} ${verb(e.challenger, 'gewinnst', 'gewinnt')}`] : [];
          if (amts && (e.challenger === meId || e.target === meId)) {
            const other = e.challenger === meId ? e.target : e.challenger;
            const mine = e.challenger === meId ? e.offerSum : e.counterSum;
            pills.push(`<span class="me">Du bekommst <b>${e.challenger === meId ? e.counterSum : e.offerSum}</b> · ${nm(other)} bekommt <b>${mine}</b></span>`);
          } else pills.push('Geld wird getauscht');
          duel += `<div class="du-foot ecr-after">${pills.map((x) => x.startsWith('<span') ? x.replace('<span class="me">', '<span class="du-pill me">') : `<span class="du-pill">${x}</span>`).join('')}</div>`;
          reveal = true;
        }
        tone = e.winner === meId ? 'good' : '';
      }
      const badge = local.res.quartet ? '<span class="ec-badge">Quartett!</span>' : '';
      // v0.54.1 Quittung: ruhige Ergebnis-Karte neben dem Stapel statt großem Fenster über dem Tisch
      // (nur der aufgedeckte Kuhhandel – Gebot gegen Gebot – bleibt der große Auftritt in der Mitte)
      const rcP = (id) => { const i = idxOf(id); return i >= 0 ? `<span class="rc-p">${avatar(v.players[i], i)}<b>${nm(id)}</b></span>` : ''; };
      let rc = null;
      // v0.57.1: Preis steht in der Überschrift („… für 140 [Schein]“), unten nur noch wer → wie viele Karten → wem
      const TALER = '<i class="taler" aria-label="Taler"></i>';
      if (e.type === 'auction_won') {
        rc = { to: e.buyer, card: miniCard(e.animal), money: e.amount ? { from: e.payer || e.buyer, to: e.payee, txt: e.cardCount ? karten(e.cardCount) : `${e.amount} ${TALER}` } : null, note: e.amount ? '' : 'umsonst – niemand hat geboten' };
        if (e.amount) title = `${nm(e.buyer)} ${verb(e.buyer, 'kaufst', 'kauft')} ${theAnimal(e.animal)}${e.self ? ' selbst' : ''} für ${e.amount} ${TALER}`;
      } else if (e.type === 'special_won') {
        rc = { to: e.buyer, card: miniCard(e.animal), sp: true, money: e.count ? { from: e.payer, to: e.payee, txt: karten(e.count) } : null, note: e.count ? '' : 'umsonst – niemand hat gebuzzert' };
        if (e.count) title = `${nm(e.buyer)} ${verb(e.buyer, 'kaufst', 'kauft')} die ${esc(aname(e.animal))}-Spezialkarte für ${karten(e.count)}`;
      } else if (e.type === 'rat_taken') {
        const sumOwn = Array.isArray(e.cards) && e.player === meId ? e.cards.reduce((t, m) => t + m, 0) : null;
        rc = { to: e.player, card: miniCard(RAT), money: e.count ? { pot: true, to: e.player, txt: `${karten(e.count)}${sumOwn != null ? ` = ${sumOwn} ${TALER}` : ''}` } : null, note: e.count ? '' : 'Es lag noch nichts in der Mitte' };
        if (e.count) title = `${nm(e.player)} ${verb(e.player, 'nimmst', 'nimmt')} die Ratte + ${karten(e.count)}`;
      } else if (e.type === 'trade' && e.accepted) {
        const n = Array.isArray(e.offer) ? e.offer.length : e.offer;
        rc = { to: e.challenger, card: miniCard(e.animal), cnt: e.count, money: { from: e.challenger, to: e.target, txt: karten(n) }, note: `${nm(e.target)} ${verb(e.target, 'nimmst', 'nimmt')} an` };
        title = `${nm(e.challenger)} ${verb(e.challenger, 'ertauschst', 'ertauscht')} ${e.count}× ${esc(aname(e.animal))} für ${e.offerSum != null ? `${e.offerSum} ${TALER}` : karten(n)}`;
      }
      if (rc && !reveal) {
        const moneyRow = rc.money ? `<div class="rc-line rc-cash">${rc.money.pot ? '<span class="rc-p pot"><i>🫙</i><b>Topf</b></span>' : rcP(rc.money.from)}<span class="rc-arr">→</span><span class="rc-amt">${rc.money.txt}</span><span class="rc-arr">→</span>${rcP(rc.money.to)}</div>` : '';
        const html = `<div class="evcard receipt ${tone}" data-a="resClose" role="button" aria-live="polite" style="--el:-${el}ms;--dur:${local.res.dur}ms">
          <small class="ec-kind">${kind}</small><b class="ec-title">${title}</b>
          <div class="rc-line rc-get"><span class="rc-card ${rc.sp ? 'sp' : ''}">${rc.card}${rc.sp ? '<i class="rc-star">★</i>' : ''}${rc.cnt > 1 ? `<em>×${rc.cnt}</em>` : ''}${badge}</span><span class="rc-arr">→</span>${rcP(rc.to)}</div>
          ${moneyRow}${rc.note ? `<small class="rc-note">${rc.note}</small>` : ''}
          ${local.res.quartet ? `<small class="rc-note q">Quartett! ${nm(receiverOf(e))} ${verb(receiverOf(e), 'hast', 'hat')} alle 4× ${esc(aname(e.animal))}</small>` : ''}<i class="rtimer"></i></div>`;
        local.res.html = html.replace('data-a="resClose" role="button" aria-live="polite" ', '');
        effects += html;
        wakeLocal(local.res.at + local.res.dur + 50);
      } else {
      const html = duel ? `<div class="evcard duel ${tone} ${reveal ? 'reveal' : ''}" data-a="resClose" role="button" aria-live="polite" style="--el:-${el}ms;--dur:${local.res.dur}ms">
        <small class="ec-kind">${kind}</small><b class="ec-title">${title}</b>${duel}${local.res.quartet ? `<span class="ec-sub du-q"><span class="ec-badge">Quartett!</span> ${nm(receiverOf(e))} ${verb(receiverOf(e), 'hast', 'hat')} jetzt alle 4× ${esc(aname(e.animal))}</span>` : ''}
        ${local.res.hint ? '<small class="ec-hint">Tippen zum Schließen</small>' : ''}<i class="rtimer"></i></div>` : `<div class="evcard ${tone} ${reveal ? 'reveal' : ''}" data-a="resClose" role="button" aria-live="polite" style="--el:-${el}ms;--dur:${local.res.dur}ms">
        <div class="ec-art">${card}${badge}</div>
        <div class="ec-body"><small class="ec-kind">${kind}</small><b class="ec-title">${title}</b>${body}${local.res.quartet ? `<span class="ec-sub">${nm(receiverOf(e))} ${verb(receiverOf(e), 'hast', 'hat')} jetzt alle 4× ${esc(aname(e.animal))}</span>` : ''}</div>
        ${local.res.hint ? '<small class="ec-hint">Tippen zum Schließen</small>' : ''}<i class="rtimer"></i></div>`;
      local.res.html = html.replace('data-a="resClose" role="button" aria-live="polite" ', '');
      effects += html;
      wakeLocal(local.res.at + local.res.dur + 50);
      }
    } else closeRes();
  }
  H.resClose = () => { closeRes(); ctx.rerender(); };

  // Kann nicht zahlen: alle Scheine groß für alle zeigen (5 s, Tipp schließt)
  const cpe = v.lastEvent;
  const cpSig = cpe?.type === 'cant_pay' ? `cp|${cpe.n}|${cpe.player}` : null;
  if (cpSig && local.cpSig !== cpSig) { local.cpSig = cpSig; if (evFresh || ctx.demoPop) local.cp = { ev: JSON.parse(JSON.stringify(cpe)), at: Date.now() }; }
  if (local.cp) {
    const el = Date.now() - local.cp.at;
    if (el < CANTPAY_MS) {
      const e = local.cp.ev;
      const mine = e.player === meId;
      const bills = [...e.revealed].sort((x, y) => x - y);
      const sum = bills.reduce((t, m) => t + m, 0);
      const need = e.special ? `${e.count} Karte${e.count === 1 ? '' : 'n'}` : `${e.amount} Taler`;
      const after = e.special ? `→ darf erst ab ${bills.length} buzzern` : `→ darf jetzt höchstens ${e.amount - BID_STEP} bieten`;
      const w = Math.max(30, Math.min(58, Math.floor(400 / Math.max(1, bills.length)) - 6));
      // v0.62 „Pleite!“: die Figur springt aus ihrem Profilbild, stülpt die leeren Hosentaschen raus, Motten flattern
      if (el < 3400) effects += aliveGag(e.player, 'pleite', el, 3400);
      effects += `<div class="cantpop" data-a="cpClose" role="button" aria-live="polite" style="--el:-${el}ms;--dur:${CANTPAY_MS}ms;--bw:${w}px">
        <small>Kann nicht zahlen</small>
        <b>${esc(mine ? 'Du' : nameOf(e.player))} ${mine ? 'kannst' : 'kann'} ${need} nicht zahlen</b>
        <div class="cpbills">${bills.map((m) => moneyCard(m)).join('') || '<span class="cpnone">keine Scheine</span>'}</div>
        <p><b>${bills.length}</b> Schein${bills.length === 1 ? '' : 'e'} · zusammen <b>${sum}</b> Taler</p>
        <em>${after}</em>
        <i class="rtimer"></i></div>`;
      wakeLocal(local.cp.at + CANTPAY_MS + 50);
    } else local.cp = null;
  }
  H.cpClose = () => { local.cp = null; ctx.rerender(); };

  // Esel aufgedeckt: eine große Einblendung, Scheine fliegen zu allen
  // (läuft über Neuzeichnen hinweg weiter: Startzeit merken, Animation an der richtigen Stelle fortsetzen)
  if (state.phase === 'auction' && v.lastEvent?.type === 'donkey') {
    const dSig = `${v.lastEvent.n}|${v.lastEvent.number}`;
    if (local.donkeySig !== dSig) { local.donkeySig = dSig; local.donkeyAt = entered ? Date.now() : 0; }
    const el = Date.now() - (local.donkeyAt || 0);
    if (local.donkeyAt && el < 4500) {
      // v0.60.1 Esel-Bonus (Alps Idee): Der Esel schnappt sich die Scheine, knüllt sie zusammen
      // und pfeffert jedem einzeln einen Papierball an den Kopf – BAM, BAM, BAM.
      if (el < 4500) {
        const BAMS = ['BAM!', 'ZACK!', 'PATSCH!', 'BAM!'];
        effects += `<div class="eclimb" data-aim-from="@card" data-aim-to="@card" style="--ty:0px;--tx:0px" aria-hidden="true"><div class="efig" style="animation-delay:${1500 - el}ms">${muscleDonkey(ESEL_THROW_AT - 180 - el, v.players.length)}</div></div>`;
        effects += v.players.map((p, pi) => {
          const t = ESEL_THROW_AT + pi * ESEL_THROW_GAP;
          const to = p.id === meId ? '@me' : esc(p.id);
          return `<div class="eball" data-aim-from="@esel" data-aim-to="${to}" style="animation-delay:${t - el}ms;--ty:0px;--tx:0px" aria-hidden="true"></div>`
            + `<div class="ebam" data-aim-from="${to}" data-aim-to="${to}" style="animation-delay:${t + ESEL_FLIGHT - el}ms;--ty:0px;--tx:0px;--rot:${pi % 2 ? 9 : -8}deg" aria-hidden="true">${BAMS[pi % BAMS.length]}</div>`;
        }).join('');
      }
      wakeLocal(Date.now() + 4600 - el); // danach einmal aufräumen
    }
  }

  // Letzte Karte / Stapel leer: kurz groß ankündigen (ändert die Taktik)
  if (local.prevDeck != null && v.deck !== local.prevDeck && v.deck <= 1 && state.phase !== 'ended') {
    keepFx(`<div class="lastcard" role="status">${v.deck === 1 ? '⚡ Letzte Karte im Stapel!' : '🐮 Stapel leer – ab jetzt nur noch Kuhhandel!'}</div>`, 4300);
    later.push(['last', 1400]);
  }
  // v0.63 „Letzte Karte!“: die letzte Stapelkarte wird aufgedeckt → Scheinwerfer auf die Mitte, Trommelwirbel
  if (local.prevDeck === 1 && v.deck === 0 && ['auction', 'special', 'rat'].includes(state.phase)) {
    keepFx(`<div class="spotlight" aria-hidden="true"><b>LETZTE KARTE!</b></div>`, 2600);
    sounds.push('drum');
  }
  local.prevDeck = v.deck;
  // Großes Gebot (+100 oder mehr auf einmal): Wow-Effekt am Gebots-Schild
  if (state.phase === 'auction' && auction.high) {
    const key = `${auction.opensAt}|${auction.animal}`;
    if (fresh && local.highKey === key && auction.high.amount - (local.highAmt || 0) >= 100 && auction.high.player !== meId) {
      keepFx(`<div class="wowpop" aria-hidden="true">Wow! +${auction.high.amount - (local.highAmt || 0)}</div>`, 1500);
      sounds.push('wow');
    }
    local.highKey = key; local.highAmt = auction.high.amount;
  } else if (state.phase !== 'auction') { local.highKey = null; local.highAmt = 0; }
  // Reaktionen fliegen sichtbar vom Absender zum Empfänger
  local.reactSeen = local.reactSeen || {};
  Object.entries(ctx.reactions || {}).forEach(([pid, r]) => {
    const sig = `${r.until}|${r.text}`;
    if (local.reactSeen[pid] === sig) return;
    local.reactSeen[pid] = sig;
    if (r.from && r.from !== pid && idxOf(r.from) >= 0 && idxOf(pid) >= 0) keepFx(`<div class="rfly" data-aim-from="${esc(r.from)}" data-aim-to="${esc(pid)}" aria-hidden="true">💬</div>`, 800);
  });

  // Set angetippt, mit dem kein Kuhhandel geht: kurzer Hinweis über der Auslage
  if (local.setHint && Date.now() - local.setHint.at < 2200) {
    const hid = local.setHint.id;
    effects += `<div class="sethint" role="status" style="--el:-${Date.now() - local.setHint.at}ms">${hid === RAT ? 'Rattenhandel geht nur mit jemandem, der auch eine Ratte hat' : `Keiner sonst hat ${esc(aname(hid))}${me.animals[hid] === 4 ? ' – dein Quartett ist sicher' : ''}`}</div>`;
    wakeLocal(local.setHint.at + 2250);
  } else local.setHint = null;

  // Einmaliger Hinweis zur neuen Sitzordnung (pro Gerät)
  if (local.seatTipAt == null && ctx.seatTip) {
    let seen = true;
    try { seen = !!localStorage.getItem('kh_seat_tip'); if (!seen) localStorage.setItem('kh_seat_tip', '1'); } catch { /* egal */ }
    local.seatTipAt = seen || state.phase === 'ended' ? 0 : Date.now();
  }
  if (local.seatTipAt && Date.now() - local.seatTipAt < 8000) {
    effects += `<div class="seattip" data-a="seatTipClose" role="button" style="--el:-${Date.now() - local.seatTipAt}ms"><b>Neu:</b> Ihr sitzt jetzt am Tisch – im Uhrzeigersinn. Links von dir ist als Nächstes dran. <span>💬 = Reaktion an alle</span></div>`;
    wakeLocal(local.seatTipAt + 8050);
  }
  H.seatTipClose = () => { local.seatTipAt = 0; ctx.rerender(); };

  // gemerkte Einmal-Effekte zeichnen; die Animationen werden nach dem Zeichnen auf die richtige Stelle vorgespult
  local.fx.forEach((f) => { effects += `<div class="fxk" data-fxat="${f.at}">${f.html}</div>`; wakeLocal(f.until + 30); });

  // 💬-Menü: oben Emojis (schnell), dann eigene gekaufte Sprüche, dann die Standard-Sprüche; Karten/Punkte ganz unten
  function reactPicker() {
    const list = ctx.reactionList, nE = ctx.reactionEmoji || 0, base = ctx.reactionBase ?? list.length;
    const to = local.reactTo, self = to === meId;
    const btn = (r, i, cls = '') => `<button type="button" class="${cls}${r.length > 18 ? ' long' : ''}" data-a="react" data-v="${i}">${esc(r)}</button>`;
    const emo = list.slice(0, nE).map((r, i) => btn(r, i, 'rp-emo')).join('');
    const std = list.slice(nE, base).map((r, k) => btn(r, nE + k, 'rp-say')).join('');
    const own = list.slice(base).map((r, k) => btn(r, base + k, 'rp-say bought')).join('');
    // v0.54.1: „Zuletzt passiert“ steht nicht mehr auf dem Tisch, sondern hier – wer es wissen will, schaut nach (nur das letzte Ereignis, kein Verlauf)
    const last = evStrip ? `<div class="rp-last"><small>Zuletzt passiert</small><div class="evstrip in">${evStrip}</div></div>` : lastLog ? `<div class="rp-last"><small>Zuletzt passiert</small><div class="tlog in">${esc(lastLog)}</div></div>` : '';
    return `<div class="reactpick v2 ${self ? 'self' : ''}">
      <div class="rphead"><span>${self ? '💬 An alle' : `💬 An ${esc(nameOf(to))}`}</span><button type="button" data-a="reactClose" aria-label="Schließen">✕</button></div>
      ${self && ctx.canPunch ? `<div class="rp-lbl rp-admin">${esc(ctx.punchLabel || '🥊 Verprügeln')}</div><div class="rp-punch">${v.players.filter((p) => p.id !== meId).map((p) => `<button type="button" class="rp-pu" data-a="punch" data-v="${esc(p.id)}" aria-label="${esc(p.name)} verprügeln">${avatar(p, idxOf(p.id))}<span>${esc(p.name)}</span></button>`).join('')}</div>` : ''}
      ${last}
      ${emo ? `<div class="rp-emos">${emo}</div>` : ''}
      ${own ? `<div class="rp-lbl">Deine Sprüche</div><div class="rp-says">${own}</div>` : ''}
      <div class="rp-lbl">Sprüche</div><div class="rp-says">${std}</div>
      <div class="rp-lbl">${self ? 'Deine Karten' : `Karten von ${esc(nameOf(to))}`}</div>
      ${playerDetail(v.players[idxOf(to)], self)}
    </div>`;
  }
  root.innerHTML = `<div class="stage-wrap"><div class="stage p${v.players.length}" id="stage">
    ${left}
    ${table}
    ${(() => { // v0.56: dein Platz unten rechts – deine Figur (Shop-Avatar ganz, sonst dein Bild), 💬 als Sprechblase über dem Kopf
      const pr = avatarLookup(meId); const now = Date.now(); const jub = DEMO_JUB || (local.meJubAt && now >= local.meJubAt && now < local.meJubAt + 1700);
      if (local.meJubAt && now < local.meJubAt + 1700) wakeLocal(now < local.meJubAt ? local.meJubAt : local.meJubAt + 1710);
      return `<div class="meplate ${pr?.shop ? 'full' : 'round'} ${jub ? 'jub' : ''} ${DEMO_JUB ? 'demo' : ''}" style="--c:${SEAT_COLORS[meIdx]}">
        <span class="mefig" ${ctx.reactionList ? `data-a="reactTo" data-v="${esc(meId)}" role="button" aria-label="Reaktion an alle (💬)"` : ''}>${pr?.shop ? shopAvatarFull(pr.shop) : avatar(me, meIdx)}</span><span class="mename">Du</span>${jub ? '<i class="mejubstar" aria-hidden="true">🎉</i>' : ''}</div>`;
    })()}
    <div class="gright">${playersCol}</div>
    ${overlay}
    ${standingsHtml}
    ${effects}
    ${wake ? `<i hidden data-wake="${wake}"></i>` : ''}
    ${(ctx.autoplay || []).includes(meId) && state.phase !== 'ended' ? `<div class="botbar" role="alert"><span>🤖 Ein Test-Spieler spielt gerade für dich.</span><button type="button" data-a="selfPlay">Selbst weiterspielen</button></div>` : ''}
    ${local.reactTo && ctx.reactionList && idxOf(local.reactTo) >= 0 ? '<div class="rpback" data-a="reactClose" aria-hidden="true"></div>' : ''}
    ${local.reactTo && ctx.reactionList && idxOf(local.reactTo) >= 0 ? reactPicker() : ''}
    ${ctx.toastMsg ? `<div class="toast" role="alert">${esc(ctx.toastMsg)}</div>` : ''}
  </div></div>`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const fn = H[b.dataset.a];
    if (fn) fn(b.dataset.v);
  };
  local.justAdded = null;
  fitStage();
  fitTop(root);
  fitAuslage(root);
  aimFly(root);
  aimFx(root);
  routeFx(root);
  mouthBubbles(root);
  seekFx(root);
  syncLoops();
  if (ctx.playSound) {
    [...new Set(sounds)].forEach((k, i) => setTimeout(() => ctx.playSound(k), i * 180));
    later.forEach(([k, ms]) => setTimeout(() => ctx.playSound(k), ms));
  }
}

// Bühne (844×390) passend auf den Bildschirm skalieren
export function fitStage() {
  const st = document.getElementById('stage');
  if (!st) return;
  // Platz innerhalb der sicheren Fläche (iPhone: Kamera-Aussparung und Home-Balken freilassen)
  const app = document.getElementById('app');
  const cs = app ? getComputedStyle(app) : null;
  const padX = cs ? parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) : 0;
  const padY = cs ? parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) : 0;
  const aw = window.innerWidth - padX, ah = window.innerHeight - padY;
  const s = Math.min(aw / 844, ah / 390);
  // Den ganzen Bildschirm nutzen: was in einer Richtung übrig ist, macht den Tisch breiter bzw. höher
  // (Plätze, Knöpfe, Geld und 💬 kleben an den Rändern, die Mitte bekommt den zusätzlichen Platz)
  const W = Math.round(Math.min(844 * 1.3, Math.max(844, aw / s)));
  const H = Math.round(Math.min(390 * 1.25, Math.max(390, ah / s)));
  st.style.width = `${W}px`;
  st.style.height = `${H}px`;
  st.style.setProperty('--cx', `${W / 2}px`);
  st.style.setProperty('--dh', `${H - 390}px`);
  st.style.transform = `scale(${s})`;
  st.classList.toggle('small', s < 0.9 || new URLSearchParams(location.search).has('small'));
  st.parentElement.style.width = `${W * s}px`;
  st.parentElement.style.height = `${H * s}px`;
  // Spielfeld läuft über den ganzen Bildschirm (Hintergrund am body): Spielerleiste rechts dort anfangen lassen, wo sie im Spiel beginnt
  const left = st.parentElement.getBoundingClientRect().left;
  document.body.style.setProperty('--sidex', `${Math.round(left + 628 * s)}px`);
}
window.addEventListener('resize', fitStage);
