// Kuhhandel – Spieltisch im Querformat (alle Spielphasen)
import { shopAvatar, shopAvatarFull } from './shopavatars.js';
import {
  logNo, GameError, ANIMALS, ANIMAL_BY_ID, DONKEY_PAYOUTS, BID_STEP, cantpayMs, infoFactor, revealMs, tradeTimerSec, hektikMs, pfaendShowMs, AUCTION_START_MS, AUCTION_BID_MS, auctionStartMs, auctionBidMs, isTurbo,
  viewFor, possibleTrades, scores, currentPlayer, missionStatus, animalsOf, isTeams, partnerOf, teamOf, teamPool,
  drawForAuction, bid, passAuction, closeAuction, pay,
  startTrade, acceptTrade, counterTrade, bestPay,
  RAT, RAT_COUNT, SPECIAL_VALUE, awards, SPECIAL_TICK_MS, SPECIAL_FROM, BATZEN_SHOW_MS, scoreFor,
  isBoerse, isNewsCard, kursValue, KURS_STEP, KURS_MAX_FACTOR, DIVIDENDE, HEKTIK_COUNT, BLIND_COUNT, isMoneyCard, playPfaendung, pfaendTargets,
  ratCurrent, ratLay, ratTake, buzz, rpsPick, specialDecide, specialStage, specialNumber, specialResult, specialDecideAt, chooseBlock, waitAuction, waitExtraMs, tradeWait, divideWait, batzenStage, showBatzen,
  isDuo, divideLook, divideChoose, divideTimeout, duoPass, DIVIDE_MS, isSpecialCard, specialAnimal, moneyValue, tempoFactor,
} from '../src/engine.js';
import { art, STAR } from './animals.js';
import { quartetShow, qshowMs, quartetSound, ratKingShow, kingMs, ratHat } from './quartets.js';
import { theaterFx, sceneScript, sceneHtml } from './theater.js';
import { SHOP_EMOTES } from './shop.js';
import { animalBody } from './beasts.js';
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
// v0.63.1: Zeiten ab dem Moment, in dem die Karte offen liegt – erst sieht man nur die Karte, dann klettert er raus
const ESEL_CLIMB_AT = 700, ESEL_THROW_AT = ESEL_CLIMB_AT + 950, ESEL_THROW_GAP = 360, ESEL_FLIGHT = 300, OUCH_MS = 1100;
const PUNCH_MS = 3400; // Admin-Fähigkeit „Verprügeln“: Dauer der Animation
// Börsen-Chaos: aktuelle Kurse des gerade gezeichneten Spiels (null = Grundwerte)
let KURSE = null;
const aval = (id) => (id === RAT || !id ? null : kursValue(id, KURSE));
// v0.81 Kurse wirken sofort (Alp): Weicht der Kurs vom Kartenwert ab, steht der alte Wert durchgestrichen und der neue farbig darunter
const kursDiff = (id) => { const v = aval(id); const base = id && ANIMAL_BY_ID[id] ? ANIMAL_BY_ID[id].value : null; return v != null && base != null && v !== base ? { base, v, up: v > base } : null; };
const valHtml = (id) => { const d = kursDiff(id); return d ? `<s>${d.base}</s><b class="kv ${d.up ? 'up' : 'down'}">${d.v}</b>` : `${aval(id) ?? ''}`; };
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
    <div class="acard" style="--a:${ANIMAL_COLORS[id]};box-shadow:${shadows.join(',') || 'none'}"><i></i><b>${art(id)}</b>${v != null ? `<em class="cv ${kursDiff(id) ? 'kursed' : ''}">${valHtml(id)}</em>` : ''}</div>
    <span>${n === 4 && id !== RAT ? aname(id) + ' ✓' : aname(id) + ' ×' + n}</span>
  </div>`;
}

// Auslage: ein Stapel pro Tierart, jede weitere Karte sichtbar versetzt dahinter
function stackHtml(id, n, { special = false, bump = false, tap = false, trade = false } = {}) {
  const v = aval(id);
  const done = n === 4 && id !== RAT;
  const cards = Array.from({ length: n }, (_, k) => `<div class="scard ${DARK_ANIMALS.has(id) ? 'dark' : ''}" style="--k:${n - 1 - k};--a:${ANIMAL_COLORS[id]}">${k === n - 1 ? `${v != null ? `<em class="${kursDiff(id) ? 'kursed' : ''}">${valHtml(id)}</em>` : ''}<b>${art(id)}</b>` : ''}</div>`).join('');
  const near = n === 3 && id !== RAT;
  const label = `${n}×`; // v0.56.2: wie bei den Mitspielern – Anzahl statt „noch …“
  return `<div class="stack ${done ? 'done' : ''} ${near ? 'near' : ''} ${id === RAT ? 'rat' : ''} ${bump ? 'bump' : ''} ${trade ? 'cantrade' : ''}" data-animal="${id}" style="--n:${n}" title="${n}× ${aname(id)}${special ? ' + Spezialkarte' : ''}"${tap ? ` data-a="setTrade" data-v="${id}" role="button" aria-label="${trade ? `Kuhhandel um ${aname(id)}` : `${aname(id)}: kein Kuhhandel möglich`}"` : ''}>
    <div class="spile">${cards}${special ? '<span class="spbadge big" aria-label="mit Spezialkarte">★</span>' : ''}${done ? '<span class="scheck">✓</span>' : ''}</div>
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
const CHIP_MAX = 99; // v0.89 (Alp): alle Sets der Mitspieler immer sichtbar, nichts eingeklappt (Kärtchen brechen in Reihen um)
function playerChips(p, tradeable = new Set(), max = CHIP_MAX) {
  const items = [];
  const chip = (id, cls, inner, title) => (tradeable.has(id)
    ? `<button type="button" class="chip ${cls} tradechip" data-animal="${id}" data-a="tradeWith" data-v="${esc(p.id)}|${id}" aria-label="Kuhhandel mit ${esc(p.name)} um ${aname(id)}">${inner}</button>`
    : `<span class="chip ${cls}" data-animal="${id}" title="${title}">${inner}</span>`);
  // v0.89 (Alp): Spezialkarte immer gleich und deutlich – goldener Stern UNTEN am Tier-Set; ohne das Tier ein eigenes Kärtchen mit Stern unten
  const sps = new Set(specialsOf(p));
  const spB = '<span class="spbadge" aria-label="mit Spezialkarte">★</span>';
  for (const a of ANIMALS) {
    const n = p.animals[a.id] || 0;
    const sp = sps.has(a.id) && n > 0;
    if (n > 0) items.push({ rank: n === 4 ? 0 : tradeable.has(a.id) ? 1 : 3, n, val: a.value, html: chip(a.id, `card ${n === 4 ? 'done' : n === 3 ? 'near3' : ''} ${sp ? 'hassp' : ''}`, `${miniCard(a.id)}<em>${n === 4 ? '✓' : `${n}×`}</em>${sp ? spB : ''}`, `${n}× ${a.name}${sp ? ' + Spezialkarte' : ''}`) });
  }
  const r = ratsOf(p);
  if (r > 0) items.push({ rank: tradeable.has(RAT) ? 1 : 2, n: r, val: 0, html: chip(RAT, 'card rat', `${miniCard(RAT)}<em>${r}×</em>`, `${r}× Ratte`) });
  for (const id of specialsOf(p)) if (!(p.animals[id] > 0)) items.push({ rank: 4, n: 1, val: SPECIAL_VALUE, html: `<span class="chip card sp hassp" title="${aname(id)}-Spezialkarte (ohne Tier)">${miniCard(id)}${spB}</span>` });
  items.sort((x, y) => x.rank - y.rank || y.n - x.n || y.val - x.val);
  if (items.length <= max) return items.map((x) => x.html).join('');
  return items.slice(0, max - 1).map((x) => x.html).join('') + `<span class="chip more">+${items.length - max + 1}</span>`;
}

// Rechnung für die Wertung, z. B. „(800 + 250★ + 1000) × 2 + 250★ = 4350“
export function scoreFormula(p, blocked = null, withMoney = false, mission = null) {
  const specials = p.specials || [];
  const quartets = ANIMALS.filter((a) => p.animals[a.id] === 4 && a.id !== blocked);
  const parts = [];
  for (const a of quartets) parts.push(specials.includes(a.id) ? `${aval(a.id)}+${SPECIAL_VALUE}★` : `${aval(a.id)}`);
  const loose = specials.filter((id) => !quartets.some((a) => a.id === id)).length;
  const r = scoreFor(p, blocked, withMoney, KURSE); const total = r.score;
  let text = quartets.length ? `(${parts.join(' + ')}) × ${quartets.length}` : '';
  if (loose) text += `${text ? ' + ' : ''}${loose > 1 ? `${loose} × ` : ''}${SPECIAL_VALUE}★`;
  if (withMoney && r.money) text += `${text ? ' + ' : ''}${r.money} Geld`;
  if (mission && mission.done) return `${text || 'keine Quartette'} + ${mission.bonus}🎯 = ${total + mission.bonus}`; // v0.82 Geheimauftrag
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

// v0.81 Blindmarkt: verdeckte Versteigerung – Rückseite mit Fragezeichen
function blindCard() {
  return `<div class="pcard blind" aria-label="Verdeckte Karte"><div class="pcblind"><b>?</b><small>BLINDMARKT</small></div><div class="pcname">KATZE IM SACK</div></div>`;
}

function playCard(id, kind = 'animal') {
  const val = kind === 'special' ? SPECIAL_VALUE : kind === 'rat' ? '' : ANIMAL_BY_ID[id].value;
  const name = aname(id).toUpperCase();
  const kd = kind === 'animal' ? kursDiff(id) : null; // v0.81: Börsen-Kurs auf der Karte
  return `<div class="pcard ${kind} ${DARK_ANIMALS.has(id) ? 'dark' : ''} ${kd ? 'kursed' : ''}" style="--a:${ANIMAL_COLORS[id]}">
    ${val !== '' ? `<span class="pcv">${kd ? `<s>${val}</s>` : val}</span>` : ''}${kd ? `<span class="pckurs ${kd.up ? 'up' : 'down'}">${kd.v}<i>${kd.up ? '▲' : '▼'}</i></span>` : ''}
    ${kind === 'special' ? `<span class="pcstar">${STAR}</span>` : ''}
    <div class="pcart">${art(id)}</div>
    <div class="pcname">${name}</div>
  </div>`;
}

// v0.77 Zu zweit: eine Stapelkarte groß zeigen (Tier, Ratte, Spezialkarte oder Geldschein)
function cardFace(card) {
  if (isMoneyCard(card)) { const v = moneyValue(card); return `<div class="money big divmoney" style="--m:${MONEY_COLORS[v] || '#eee'}">${mIn(v)}</div>`; }
  if (isSpecialCard(card)) return playCard(specialAnimal(card), 'special');
  if (card === RAT) return playCard(RAT, 'rat');
  return playCard(card);
}
function cardLabel(card) {
  if (isMoneyCard(card)) return `${moneyValue(card)} Taler`;
  if (isSpecialCard(card)) return `${aname(specialAnimal(card))}-Spezialkarte`;
  return aname(card);
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
  return pr?.shop ? `<span class="pfig ${cls}" style="--c:${SEAT_COLORS[idx]}" aria-hidden="true">${shopAvatarFull(pr.shop, '', pr.outfit)}</span>` : avatar(p, idx);
}

// ---------- Hauptfunktion ----------

// Nach einem Ergebnis (Zuschlag, Kuhhandel, Spezialkarte, Ratte, Geldschein) kurz Pause, bevor aufgedeckt werden darf
// Auslage: bei wenigen Tieren etwas größer (mehr Platz ist zwischen Stapel und Geld nicht)
const AUSLAGE_MAX = 1;
const SHELF_MAX = 1.18; // v0.59.1: Mitte kleiner → Tiere größer (Alps Wahl B) // v0.59: Regal über dem Geld – eine Reihe, höchstens 90 % (passt unter die Karte in der Mitte)
const DEMO_HANDTIP = typeof location !== 'undefined' && new URLSearchParams(location.search).has('handtip'); // Screenshot: Hinweis zur Handkarte
const DEMO_JUB = typeof location !== 'undefined' && new URLSearchParams(location.search).has('mejub'); // Screenshot: deine Figur jubelt
export const CALM_MS = 2500;
// Ergebnis-Fenster: so lange bleibt es stehen
// v0.78 (Alp): Ergebnis-Fenster länger – ohne Spielverlauf ist es die einzige Stelle, an der man sieht, wer was bekommt/zahlt
const EV_WAIT = { auction_won: 4500, special_won: 4500, trade: 5800, rat_taken: 4500 }; // Kuhhandel: inkl. ~1 s Aufdecken
// Tempo der laufenden Partie (Gemütlich/Normal/Schnell) – wird bei jedem Zeichnen gesetzt.
// INFO_F = Info-Fenster (Ergebnis, VS, News, Quartett-Show): folgen dem Tempo nur leicht (×1,3 / ×1 / ×0,85), damit man sie immer lesen kann
let INFO_F = 1, CUR_STATE = null;
export const setTempo = (stateOrSettings) => { INFO_F = infoFactor(stateOrSettings); CUR_STATE = stateOrSettings; };
// Stapel leer (nur noch Kuhhandel): Ergebnis kürzer zeigen, damit es flott weitergeht
// v0.72 Tempo: „umsonst“ (kein Geld fließt) – Fenster nur 2 s
// v0.76 (Alp): schneller Kuhhandel – laufen die Einsätze noch in die Mitte, wartet das Ergebnis, bis sie dort sind (TRADE_PRE = Vorlauf in ms je Ereignis)
const TRADE_PRE = new Map();
const tradePre = (le) => (le && le.type === 'trade' ? TRADE_PRE.get(le.n) || 0 : 0);
export const evWait = (type, deckLeft, le = null) => (EV_WAIT[type] == null ? undefined : Math.round((type === 'trade' && deckLeft === 0 ? 4800 : type === 'auction_won' && le && !(le.amount > 0) ? 3000 : EV_WAIT[type]) * INFO_F)) + tradePre(le);
// Verschnaufpause nach einem Ergebnis: so lange wie das Ergebnis-Fenster steht (+0,5 s für langsamere Handys)
// Ablauf nach einem Ergebnis – EIN Plan, aus den echten Flügen berechnet (nicht geschätzt):
//   Fenster steht (W) → Tier fliegt → Geld fliegt (Kuhhandel: erst Angebot hin, wenn gelandet Gegenangebot zurück)
//   → kurze Ruhe → gelber „dran“-Rahmen wandert → erst dann darf aufgedeckt werden.
const WALK_MS = 1500; // v0.70: ganzes Tier läuft aus der Mitte zum Stapel des Empfängers …
const CARD_MS = 350;  // … und wird dort zur Karte
const POT_WALK_MS = 1300; // Kuhhandel-Start: Tiere laufen in die Mitte
const FLY_MS = WALK_MS + CARD_MS; // Tier ist angekommen (danach fliegt Geld)
const MFLY_MS = 1000; // ein Geldschein (.mfly)
const MSTEP = 70; // Abstand zwischen zwei Scheinen
const HALO_PAUSE = 500; // Ruhe nach dem letzten Schein (v0.72: 700 → 500)
export const WALK_OVERLAP = 350; // v0.72: das Tier läuft schon los, während das Ergebnis-Fenster ausblendet
const OFFER_FLY = 1350; // Kuhhandel: Angebot fliegt los, wenn der „KUHHANDEL!“-Auftritt ausblendet
const OFFER_LAND = OFFER_FLY + MFLY_MS - 150; // … und liegt dann in der Mitte
const HALO_MS = 900; // Rahmen wandert
const cntOf = (x) => (Array.isArray(x) ? x.length : x || 0);
const streamMs = (c) => (Math.min(c, 15) - 1) * MSTEP + MFLY_MS;
export function choreo(le, deckLeft, W = evWait(le.type, deckLeft, le) || 0, piles = null) {
  const n = le.type === 'trade' ? le.count || 1 : 1;
  const payAt = Math.max(0, W - WALK_OVERLAP) + FLY_MS + (n - 1) * 120; // Tier ist gelandet
  const streams = [];
  if (le.type === 'auction_won' && le.amount > 0 && le.payer && le.payee) streams.push({ from: le.payer, to: le.payee, count: le.cardCount || 1, at: payAt });
  if (le.type === 'special_won' && le.count > 0 && le.payer && le.payee) streams.push({ from: le.payer, to: le.payee, count: le.count, at: payAt });
  // v0.72 Kuhhandel: nach den Tieren fliegt jedes Angebot aus der Mitte zu dem, der es bekommt (Angebot → Herausgeforderter, Gegenangebot → Herausforderer)
  if (le.type === 'trade') {
    if (cntOf(le.offer)) streams.push({ from: '@card', to: le.target, count: cntOf(le.offer), at: payAt });
    if (cntOf(le.counter)) streams.push({ from: '@card', to: le.challenger, count: cntOf(le.counter), at: payAt + 250 });
  }
  if (le.type === 'rat_taken') {
    // v0.52.1: der Topf liegt in der Mitte – von dort fliegt das ganze Geld zum Nehmer (nicht aus den Händen der anderen)
    if (le.count) streams.push({ from: '@pot', to: le.player, count: le.count, at: payAt });
  }
  const end = Math.max(payAt, ...streams.map((x) => x.at + streamMs(x.count)));
  return { W, payAt, streams, end, haloAt: end + HALO_PAUSE, calm: end + HALO_PAUSE + HALO_MS };
}
// v0.77 Quartett-Show: Hat dieses Ereignis ein Quartett vollgemacht? (Der Empfänger hat danach genau 4 – vorher waren es weniger.)
// v0.79 Rattenkönig: nur am Ende (Quartett opfern / Spielende) – hat ein Spieler alle Ratten des Spiels?
export function ratKingOf(state) {
  if (!state || (state.phase !== 'block' && state.phase !== 'ended')) return null;
  const owners = state.players.filter((p) => (p.animals?.[RAT] || 0) > 0);
  if (owners.length !== 1 || (Array.isArray(state.deck) && state.deck.includes(RAT))) return null;
  return owners[0].id;
}
export function quartetOf(le, state) {
  if (!le || !state) return null;
  const has4 = (pid, an) => an && an !== RAT && state.players.find((p) => p.id === pid)?.animals?.[an] === 4 ? { pid, animal: an } : null;
  if (le.type === 'auction_won') return has4(le.buyer, le.animal);
  if (le.type === 'trade' && le.animal !== RAT) return has4(le.winner, le.animal);
  if (le.type === 'divided') return [le.first, le.second].filter(Boolean).map((x) => has4(x.to, x.card)).find(Boolean) || null;
  return null;
}
const newsMs = () => Math.round(3400 * INFO_F); // Börsen-News-Karte (3,4 s bei Normal)
const qMs = () => qshowMs(INFO_F); // Dauer der Quartett-Show (5,5 s bei Normal)
const qExtraMs = () => qMs() + 300; // so lange wartet das Spiel zusätzlich
// Wann die laufende Quartett-Show sicher vorbei ist – solange darf niemand (auch kein Test-Spieler) weitermachen
let showUntilAt = 0;
export const showBusy = () => Date.now() < showUntilAt;
export const calmFor = (le, deckLeft, state = null) => (state && setTempo(state), 0) + (le && EV_WAIT[le.type] ? choreo(le, deckLeft).calm : CALM_MS) + (quartetOf(le, state) ? qExtraMs() : 0);
export const CALM_TYPES = ['auction_won', 'trade', 'special_won', 'rat_taken', 'money_drawn', 'divided'];

// Auslage passt nicht in ihre Breite (viele Tiere, große Schrift)? Dann nachmessen und kleiner machen – nie unter die Knöpfe
function fitAuslage(root) {
  const a = root.querySelector('.auslage');
  if (!a || !a.children.length) return;
  const box = a.getBoundingClientRect();
  const kids = [...a.children].map((e) => e.getBoundingClientRect()).filter((r) => r.width);
  if (!kids.length || !box.width) return;
  const used = Math.max(...kids.map((r) => r.right)) - Math.min(...kids.map((r) => r.left));
  const sc = Number(a.style.getPropertyValue('--sc')) || 1;
  let f = used > box.width + 1 ? (box.width / used) * 0.97 : 1;
  // v0.92: „Warte, warte, warte!“ (oder anderes in der Mitte) darf nicht auf die Auslage ragen → Auslage so weit verkleinern, dass sie darunter passt
  const left = Math.min(...kids.map((r) => r.left)) + (1 - f) * used / 2; const right = left + used * f;
  const top = Math.min(...kids.map((r) => r.top)); const bottom = Math.max(...kids.map((r) => r.bottom));
  for (const el of root.querySelectorAll('.stage .waitbtn, .stage .evstrip')) {
    const w = el.getBoundingClientRect();
    if (!w.width || w.right <= left || w.left >= right || w.bottom <= top + (bottom - top) * (1 - f)) continue;
    f = Math.min(f, Math.max(0.6, (bottom - w.bottom - 3) / (bottom - top)));
  }
  if (f < 1) a.style.setProperty('--sc', (sc * f).toFixed(3));
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
// v0.91 Erfolgs-Zubehör (nur der aktuelle Rekordhalter): 👑 Kuhhandel-Krone, 🐀 Rattenschwanz, 💸 Geldregen
function titleBits(pr) {
  const t = pr?.titles || []; if (!t.length) return '';
  return `<span class="titles" aria-label="Rekorde: ${t.map((x) => ({ krone: 'Kuhhandel-König', rattenschwanz: 'Ratten-Sammler', geldregen: 'Geldregen' })[x]).join(', ')}">${t.includes('krone') ? '<i class="tt-krone" title="Kuhhandel-König: die meisten gewonnenen Kuhhandel">👑</i>' : ''}${t.includes('rattenschwanz') ? '<i class="tt-ratte" title="Ratten-Sammler: am häufigsten die Ratte genommen"></i>' : ''}${t.includes('geldregen') ? '<i class="tt-geld" title="Geldregen: am häufigsten am Ende das meiste Geld"><b></b><b></b><b></b></i>' : ''}</span>`;
}
const tapState = { down: null, fired: null, H: {} }; // v0.88 sichere Tipps über Neuzeichnen hinweg
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
  // Spieler-IDs werden erst beim Zeichnen in „@me“ übersetzt – so stimmt die Richtung auch nach einem Sicht-Wechsel (Debug)
  const meNow = root.dataset ? root.dataset.me : null;
  if (meNow && pid === meNow) pid = '@me';
  if (meNow && pid === `@near:${meNow}`) pid = '@near:@me';
  // „@pot“: der Topf in der Mitte (Rattenrunde) – ist er schon weg, die Tischmitte
  if (pid === '@me') {
    const el = root.querySelector('.meplate .mefig');
    if (el) { const r = el.getBoundingClientRect(); return { x: (r.left + r.width / 2 - sr.left) / sc, y: (r.top + r.height * 0.3 - sr.top) / sc }; }
  }
  // „@card“: Mitte der Karte in der Mitte · „@esel“: Wurfhand des Muskel-Esels (über der Karte, rechts)
  if (pid === '@card' || pid === '@esel') {
    const el = root.querySelector('.tcenter .aucard') || root.querySelector('.tcenter .revealcard') || root.querySelector('.tcenter .bigcard') || root.querySelector('.tcenter');
    if (el) { const r = el.getBoundingClientRect(); const cx = (r.left + r.width / 2 - sr.left) / sc, cy = (r.top + r.height / 2 - sr.top) / sc, top = (r.top - sr.top) / sc;
      return pid === '@card' ? { x: cx, y: cy } : { x: cx + 60, y: top + 40 }; }
  }
  // v0.62 „Profilbild wird lebendig“: '@near:<pid>' = Stehplatz neben dem Profilbild Richtung Tischmitte,
  // '@myfan' = Mitte deines Geldes, '@cl'/'@cr' = links/rechts der Tischmitte (Polonaise)
  if (pid === '@cl' || pid === '@cr') return { x: sr.width / sc / 2 + (pid === '@cl' ? -150 : 150), y: sr.height / sc * 0.5 };
  // v0.75: '@fanslot:<wert>' = genau der Platz dieses Scheins in deinem Fächer (dort landet er)
  if (typeof pid === 'string' && pid.startsWith('@fanslot:')) {
    const el = root.querySelector(`.fan-wrap [data-v="${pid.slice(9)}"]`);
    if (el) { const r = el.getBoundingClientRect(); if (r.width) return { x: (r.left + r.width / 2 - sr.left) / sc, y: (r.top + r.height / 2 - sr.top) / sc }; }
    return seatPoint(root, '@myfan', sr, sc);
  }
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
  // v0.70 (Alp): Geld und Tiere gehen nie zum Avatar, sondern dorthin, wo sie liegen.
  // „@cash:<pid>“ = Geld (du: dein Fächer · Mitspieler: seine Kartenanzahl) · „@stall:<pid>:<tier>“ = Tierstapel
  // (du: dein Stapel in der Auslage · Mitspieler: sein Tier-Chip) · „@tpot“ = Topf in der Kuhhandel-Mitte
  if (typeof pid === 'string' && pid.startsWith('@cash:')) {
    const who = pid.slice(6);
    if (who === meNow || who === '@me') return seatPoint(root, '@myfan', sr, sc);
    const el = root.querySelector(`.prow[data-pid="${CSS.escape(who)}"] .mcnt`) || root.querySelector(`.prow[data-pid="${CSS.escape(who)}"] .tag-s`);
    if (el) { const r = el.getBoundingClientRect(); if (r.width) return { x: (r.left + r.width / 2 - sr.left) / sc, y: (r.top + r.height / 2 - sr.top) / sc }; }
    return seatPoint(root, who, sr, sc);
  }
  if (typeof pid === 'string' && pid.startsWith('@stall:')) {
    const [, who, an] = pid.split(':');
    const rc = (el) => { const r = el && el.getBoundingClientRect(); return r && r.width ? { x: (r.left + r.width / 2 - sr.left) / sc, y: (r.top + r.height / 2 - sr.top) / sc } : null; };
    if (who === meNow || who === '@me') {
      const p = rc(root.querySelector(`.auslage [data-animal="${an}"] .spile, .auslage [data-animal="${an}"] .scard, .auslage [data-animal="${an}"] .acard, .auslage [data-animal="${an}"]`)) || rc(root.querySelector('.auslage'));
      if (p) return p;
      return seatPoint(root, '@myfan', sr, sc);
    }
    const row = `.prow[data-pid="${CSS.escape(who)}"]`;
    return rc(root.querySelector(`${row} .chips [data-animal="${an}"]`)) || rc(root.querySelector(`${row} .chips .chip:last-child`)) || rc(root.querySelector(`${row} .chips`)) || seatPoint(root, who, sr, sc);
  }
  if (pid === '@tpot') {
    const el = root.querySelector('.tmid .tpot') || root.querySelector('.tmid');
    if (el) { const r = el.getBoundingClientRect(); if (r.width) return { x: (r.left + r.width / 2 - sr.left) / sc, y: (r.top + r.height / 2 - sr.top) / sc }; }
    return seatPoint(root, '@card', sr, sc);
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
      if (f.classList.contains('epay')) { // Betrag nie über den Rand hinaus (Plätze ganz links/oben)
        const w = f.offsetWidth, h = f.offsetHeight, W = stage.offsetWidth, Hh = stage.offsetHeight;
        f.style.left = `${Math.round(Math.max(w / 2 + 6, Math.min(W - w / 2 - 6, parseFloat(f.style.left))))}px`;
        f.style.top = `${Math.round(Math.max(h / 2 + 6, Math.min(Hh - h / 2 - 6, parseFloat(f.style.top))))}px`;
      }
    }
    const b = seatPoint(root, f.dataset.aimTo, sr, sc);
    // Bezugspunkt: Mitte des Elements (bei „center“ ist es schon per translate(-50%,-50%) mittig gesetzt)
    const cx = f.dataset.aimAnchor === 'center' ? f.offsetLeft : f.offsetLeft + f.offsetWidth / 2;
    const cy = f.dataset.aimAnchor === 'center' ? f.offsetTop : f.offsetTop + f.offsetHeight / 2;
    f.style.setProperty('--tx', `${Math.round(b.x - cx + (Number(f.dataset.aimTdx) || 0))}px`);
    f.style.setProperty('--ty', `${Math.round(b.y - cy)}px`);
    if (f.dataset.aimScale) f.style.setProperty('--fs', f.dataset.aimScale);
    if (f.dataset.aimTo.startsWith('@fanslot:')) { const slot = root.querySelector(`.fan-wrap [data-v="${f.dataset.aimTo.slice(9)}"]`);
      if (slot) { f.style.setProperty('--trot', getComputedStyle(slot).getPropertyValue('--rot') || '0deg'); f.style.setProperty('--ts', (slot.offsetWidth / (f.offsetWidth || 1)).toFixed(2)); } }
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
    if (pts.length > 1) f.classList.toggle('face-l', pts[1].x < pts[0].x - 4); // Tier schaut in Laufrichtung
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
// v0.63.1 (Alp): länger zum Anschauen – Kuhhandel 2 s, Spielstart 3 s; kurze Fassung ab dem 3. Duell desselben Paares
// v0.78 (Alp): VS-Auftritte länger – man soll lesen können, wer gegen wen um welches Tier; skaliert mit dem Tempo der Runde
export const INTRO_MS = 3200, INTRO_START_MS = 3200, INTRO_SHORT_MS = 2400;
// „Test 1 will die Kuh von Test 2“ – Artikel/Plural je Tier (Akkusativ)
const TIER_AKK = { hahn: ['den', 'deinen', 'Hahn', 'Hähne'], gans: ['die', 'deine', 'Gans', 'Gänse'], katze: ['die', 'deine', 'Katze', 'Katzen'], hund: ['den', 'deinen', 'Hund', 'Hunde'], schaf: ['das', 'dein', 'Schaf', 'Schafe'], ziege: ['die', 'deine', 'Ziege', 'Ziegen'], esel: ['den', 'deinen', 'Esel', 'Esel'], schwein: ['das', 'dein', 'Schwein', 'Schweine'], kuh: ['die', 'deine', 'Kuh', 'Kühe'], pferd: ['das', 'dein', 'Pferd', 'Pferde'], ratte: ['die', 'deine', 'Ratte', 'Ratten'] };
export function wantText(who, whom, animal, count, meIsWho, meIsWhom) {
  const a = TIER_AKK[animal] || ['das', 'dein', animal, animal];
  // v0.86 (Alp): beim Rattenhandel will man die Ratten nicht haben, sondern loswerden
  if (animal === 'ratte') { const r = count > 1 ? `die ${count} Ratten` : 'die Ratte'; return meIsWho ? `Du willst ${r} an ${whom} loswerden` : meIsWhom ? `${who} will ${r} an dich loswerden` : `${who} will ${r} an ${whom} loswerden`; }
  const obj = count > 1 ? (meIsWhom ? `deine ${count} ${a[3]}` : `${count} ${a[3]}`) : (meIsWhom ? `${a[1]} ${a[2]}` : `${a[0]} ${a[2]}`);
  return meIsWho ? `Du willst ${obj} von ${whom}` : meIsWhom ? `${who} will ${obj}` : `${who} will ${obj} von ${whom}`;
}
const INTRO_DIRS = { 2: ['lt', 'rb'], 3: ['l', 't', 'r'], 4: ['l', 't', 'b', 'r'] };
function encounterHtml({ parts, title, badge = '', center = '', vs = 'VS', sub = '', short = false, rival = false, dark = false, ms = 0 }) {
  const n = parts.length; const slant = n === 2 ? 11 : 6;
  const b = (k, top) => (k <= 0 ? 0 : k >= n ? 100 : (k / n) * 100 + (top ? slant : -slant));
  const dirs = INTRO_DIRS[n] || parts.map((_, i) => (i % 2 ? 'b' : 't'));
  const bands = parts.map((p, i) => {
    const poly = `polygon(${b(i, true)}% 0, ${b(i + 1, true)}% 0, ${b(i + 1, false)}% 100%, ${b(i, false)}% 100%)`;
    const cx = (b(i, true) + b(i + 1, true) + b(i, false) + b(i + 1, false)) / 4;
    return `<div class="eiband d-${dirs[i]}" style="--c:${p.color};clip-path:${poly};--k:${i}"><i class="eilines"></i></div>
      <div class="eiwho d-${dirs[i]}" style="left:${cx}%;--k:${i};--c:${p.color}"><div class="eifig">${p.fig}</div><b class="einame">${esc(p.name)}</b>${p.tag ? `<small class="eitag">„${esc(p.tag)}“</small>` : ''}</div>`;
  }).join('');
  return `<div class="eintro n${n} ${vs.length > 5 ? 'longvs' : ''} ${short ? 'short' : ''} ${dark ? 'dark' : ''} ${rival ? 'rival' : ''}" role="img" aria-label="${esc(title)}" style="--dur:${introDur({ short, ms })}ms">
    ${bands}<i class="eiflash"></i>
    <div class="eititle"><b>${esc(title)}</b>${badge ? `<span class="eibadge">${esc(badge)}</span>` : ''}</div>
    <div class="eivs">${rival ? '<i class="eiflame"></i>' : ''}<b>${esc(vs)}</b>${center}${sub ? `<small class="eisub">${esc(sub)}</small>` : ''}</div></div>`;
}

// v0.79 „Warte, warte, warte!“ – Knopf und Auftritt für alle
const WAITPOP_MS = 1900;
const waitBtn = (can, plus, act, cls = '') => (can ? `<button type="button" class="waitbtn ${cls}" data-a="${act}" aria-label="Warte, warte, warte – ${plus}"><b>✋ Warte, warte, warte!</b><small>${plus}</small></button>` : '');
let WAIT_NAME = (pid) => pid, WAIT_ME = null, WAIT_COLOR = () => '#FFD34E';
const waitPop = (pid, sec) => `<div class="waitpop" role="status" style="--c:${WAIT_COLOR(pid)}"><b>✋ WARTE, WARTE, WARTE!</b><small>${esc(pid === WAIT_ME ? 'Du' : WAIT_NAME(pid))} ${pid === WAIT_ME ? 'brauchst' : 'braucht'} Bedenkzeit · +${sec} s</small></div>`;
const introDur = (o) => (o.fixed ? o.ms : Math.round((o.short ? INTRO_SHORT_MS : o.ms || INTRO_MS) * INFO_F)); // fixed: Spezialkarten-Takt bleibt immer gleich

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
// v0.68 Starter-Figur (ohne Shop-Avatar): dein Profil-Tier als ganzer Charakter – großer Kopf, Pulli in Platzfarbe,
// Bauch in Tierfarbe. Ersetzt den „Kopf im Kreis auf Einheitskörper“.
function starterBody(animal, color, seat) {
  const K = '#2B2B2B', S = `stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const headSvg = art(animal).replace('<svg class="art" ', '<svg class="shd" x="6" y="0" width="108" height="108" ');
  return `<svg class="gbody starter" viewBox="0 0 120 200" aria-hidden="true">
    <path d="M47 160l-3 30h15l2-28M73 160l3 30H61l-2-28" fill="#3B3F4A" ${S}/><path d="M38 188h22v8H36zM61 188h22l2 8H61z" fill="${K}" ${S}/>
    <path class="garm l" d="M36 112c-10 6-16 18-16 30l9 3 8-18" fill="${seat}" ${S}/><circle cx="24" cy="146" r="7.5" fill="${color}" ${S}/>
    <path class="garm r" d="M84 112c10 6 16 18 16 30l-9 3-8-18" fill="${seat}" ${S}/><circle cx="96" cy="146" r="7.5" fill="${color}" ${S}/>
    <path d="M34 112c4-10 14-14 26-14s22 4 26 14l-3 52H37z" fill="${seat}" ${S}/>
    <ellipse cx="60" cy="140" rx="15" ry="17" fill="${color}" ${S}/>
    <path d="M46 104l14 10 14-10" fill="#fff" ${S}/>
    ${headSvg}
  </svg>`;
}
// Ganzkörper-Figur eines Spielers: Shop-Avatar (eigener Körper), sonst Starter-Figur aus dem Profil-Tier
// (wer gar kein Profilbild hat: Standard-Körper + Buchstabe als Kopf)
function aliveFig(p, i, shop) {
  const pr = avatarLookup(p.id);
  if (shop) return `<div class="afull">${shopAvatarFull(shop, '', pr?.outfit)}${titleBits(pr)}</div>`;
  if (pr?.animal) return `<div class="agen starter">${starterBody(pr.animal, pr.color || '#F2C9A0', SEAT_COLORS[i] || '#1D5FC2')}</div>`;
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
const NEWS_ICON = { rallye: '📈', crash: '📉', hype: '🚀', blase: '🫧', dividende: '💰', steuer: '🧾', panik: '🔀', hektik: '⚡', blind: '🙈' };
const KURS_UP = { rallye: true, hype: true, crash: false, blase: false };
function newsTitle(e) {
  if (e.kind === 'rallye') return `Kursrallye ${aname(e.animal)}`;
  if (e.kind === 'crash') return `Kurssturz ${aname(e.animal)}`;
  if (e.kind === 'hype') return 'Hype!'; // v0.72: Tier und Wert stehen darunter
  if (e.kind === 'blase') return 'Blase platzt!';
  return ({ dividende: 'Dividende', steuer: 'Steuerprüfung', panik: 'Marktpanik', hektik: 'Hektik', blind: 'Blindmarkt' })[e.kind] || 'Börsen-News';
}
function newsReveal(e, meId, nameOf) {
  let body = '';
  let mine = '';
  if (KURS_UP[e.kind] != null) { const up = KURS_UP[e.kind]; const cap = up && e.to === e.from; body = `<div class="nwkurs">${miniCard(e.animal)}<s>${e.from}</s><b class="${up ? 'up' : 'down'}">${e.to} ${up ? '▲' : '▼'}</b></div><small>${cap ? `schon am Höchstkurs (×${KURS_MAX_FACTOR})` : e.kind === 'hype' ? `${aname(e.animal)}: Wert verdoppelt` : e.kind === 'blase' ? `${aname(e.animal)}: Wert halbiert` : `${up ? '+' : '−'}${e.pct || KURS_STEP} %`} bis Spielende</small>`; }
  else if (e.kind === 'dividende') body = `<p>Alle bekommen <b>${e.amount ?? DIVIDENDE}</b> aus der Bank.</p>`;
  else if (e.kind === 'steuer') { body = '<p>Alle geben ihren <b>höchsten Schein</b> ab.</p>'; const l = e.lost && e.lost[meId]; mine = l != null ? `Du gibst <b>${l}</b> ab` : 'Du hattest keinen Schein'; }
  else if (e.kind === 'panik') { body = '<p>Jeder schiebt einen <b>zufälligen Schein</b> nach links.</p>'; const m = e.moved || {}; mine = `${m.gave != null ? `Du gibst <b>${m.gave}</b>` : 'Du gibst nichts'} · ${m.got != null ? `bekommst <b>${m.got}</b> von ${esc(nameOf(m.from))}` : 'bekommst nichts'}`; }
  else if (e.kind === 'blind') body = `<p>Die nächsten <b>${BLIND_COUNT}</b> Versteigerungen laufen <b>verdeckt</b> – Katze im Sack! Erst beim Zuschlag wird aufgedeckt.</p>`;
  else if (e.kind === 'hektik') body = `<p>Die nächsten <b>${HEKTIK_COUNT}</b> Versteigerungen laufen nur <b>${String(Math.round(hektikMs(CUR_STATE) / 100) / 10).replace('.', ',')} s</b> (halb so lang).</p>`;
  return `<div class="newsreveal k-${e.kind}" role="status" style="--nwd:${newsMs()}ms"><div class="nwcard"><span class="nwtag">Börsen-News</span><i class="nwicon">${NEWS_ICON[e.kind] || '📰'}</i><b class="nwtitle">${esc(newsTitle(e))}</b>${body}${mine ? `<span class="nwmine">${mine}</span>` : ''}</div></div>`;
}
function kursZettel(state) {
  if (!isBoerse(state) || !state.kurse) return '';
  const rows = ANIMALS.filter((a) => state.kurse[a.id]).map((a) => { const up = state.kurse[a.id] > 0; return `<span class="kz ${up ? 'up' : 'down'}" data-animal="${a.id}" style="--a:${ANIMAL_COLORS[a.id]}" title="${aname(a.id)}"><em>${art(a.id)}</em><b>${aval(a.id)}</b><i>${up ? '▲' : '▼'}</i></span>`; });
  return rows.length ? `<span class="kurszettel" aria-label="Kurse">${rows.join('')}</span>` : '';
}

export function renderGame(root, ctx) {
  setTempo(ctx.state);
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
  WAIT_NAME = nameOf; WAIT_ME = meId; WAIT_COLOR = (pid) => SEAT_COLORS[idxOf(pid)] || '#FFD34E';
  // v0.62 „Profilbild wird lebendig“: Figur springt aus dem Profilbild (Kopf = Profilbildgröße) und steht daneben
  const figOf = (pid) => { const i = idxOf(pid); const pr = avatarLookup(pid); return aliveFig(v.players[i], i, pr?.shop); };
  const MOTH = '<svg viewBox="0 0 40 24" aria-hidden="true"><path d="M20 12C14 2 4 0 2 6s6 10 16 8C10 18 6 24 12 24s8-6 8-10c0 4 2 10 8 10s2-6-6-10c10 2 18-2 16-8S26 2 20 12z" fill="#B9B1A3" stroke="#3a332c" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 8v10" stroke="#3a332c" stroke-width="2.4" stroke-linecap="round"/></svg>';
  // Profilbild ist „leer“, solange die Figur draußen ist (Platz bekommt Klasse .out)
  const outMark = (pid, from, until) => { local.out = local.out || {}; const o = local.out[pid]; local.out[pid] = { from: o && o.until > Date.now() ? Math.min(o.from, from) : from, until: Math.max(o && o.until > Date.now() ? o.until : 0, until) }; wakeLocal(from); wakeLocal(until + 20); };
  // v0.63.1 „Aua“: Getroffener hält sich kurz den Kopf (Profilbild bzw. deine Figur bekommt Klasse .ouch)
  const ouchMark = (pid, from, until) => { local.ouch = local.ouch || {}; const o = local.ouch[pid]; if (o && o.from === from) return; local.ouch[pid] = { from, until }; wakeLocal(from); wakeLocal(until + 20); };
  { const hk = `${state.phase}|${logNo(state)}|${state.turn}`; if (local.hintKey !== hk) { local.hintKey = hk; local.hintAt = Date.now(); } } // seit wann wartet der Zug
  // v0.68 Mimik über dem Kopf: kurz (💢 Wunschtier weg, 😍 Quartett) oder dauerhaft (💸 kein Geld, 💦 lange am Zug)
  const moodMark = (pid, kind, from, ms) => { local.mood = local.mood || {}; const m = local.mood[pid]; if (m && m.from === from && m.kind === kind) return; local.mood[pid] = { kind, from, until: from + ms }; wakeLocal(from); wakeLocal(from + ms + 20); }; // erst nach der Sitzplatz-Zeichnung aufrufen
  const MOOD = { sweat: '💦', angry: '💢', love: '😍', happy: '😄', sad: '😢' }; // v0.69: kein 💸 – wer kein Geld hat, muss man sich merken
  const moodOf = (pid) => {
    const now = Date.now(); const m = local.mood && local.mood[pid];
    if (m && m.from <= now && now < m.until) return m.kind;
    const pl = v.players[idxOf(pid)];
    if (state.phase === 'turn' && v.players[state.turn]?.id === pid && local.hintAt && now - local.hintAt > 12000) return 'sweat';
    return null;
  };
  const moodHtml = (pid) => { const k = moodOf(pid); return k ? `<i class="mood m-${k}" aria-hidden="true">${MOOD[k]}</i>` : ''; };
  const ouchOn = (pid) => { const o = local.ouch && local.ouch[pid]; return !!(o && o.from <= Date.now() && Date.now() < o.until); };
  const OUCH = '<i class="ouchh l" aria-hidden="true"></i><i class="ouchh r" aria-hidden="true"></i><i class="ouchs" aria-hidden="true">💫</i>';
  // aliveGag: el = schon vergangene Zeit, delay = Start später (ms), raw = ohne eigene Vorspul-Hülle (für keepFx)
  // v0.64: Gags laufen über das Figuren-Theater – die ganze Figur am Platz spielt die Szene (Platz ist so lange leer)
  const aliveGag = (pid, kind, el, dur, delay = 0, raw = false, amount = null) => {
    if (idxOf(pid) < 0) return '';
    const t0 = Date.now() - el;
    const sc = sceneScript({ kind, from: pid, delay, moth: MOTH, amount });
    if (!sc) return '';
    outMark(pid, t0, t0 + sc.ms);
    const html = sceneHtml({ kind, from: pid }, sc, figOf, meId);
    return raw ? html : `<div class="fxk" data-fxat="${t0}">${html}</div>`;
  };
  // v0.64 Szene zwischen Figuren (Prügeln, Auslachen, Schleimen, Baum-Runde …) – bei allen gleich, jeder aus seiner Sicht
  const sceneFx = (s) => {
    const sc = sceneScript({ ...s, order: v.players.map((p) => p.id), moth: MOTH });
    if (!sc) return null;
    sc.actors.forEach((a) => outMark(a.pid, s.at, s.at + sc.ms));
    (sc.ouch || []).forEach(([pid, a, b2]) => ouchMark(pid, s.at + a, s.at + b2));
    return { html: sceneHtml(s, sc, figOf, meId), ms: sc.ms };
  };
  // Tier-Figur (Kopf = Kartenbild) für Ratte, Polonaise, Kuhhandel-Koffer
  // v0.68: ganzes Tier (Körper + Kartenkopf) statt Kopf im Kreis
  const beast = (id, cls = '', inner = '') => `<div class="beast whole ${cls}" style="--a:${ANIMAL_COLORS[id] || '#888'}">${animalBody(id)}${inner}</div>`;
  // v0.70: Tier läuft von → nach (Stationen siehe seatPoint) und wird am Ziel zur Karte (toCard) oder verschwindet im Topf
  const homeWalk = (an, from, to, delay, { count = 0, star = false, koffer = false, ms = WALK_MS, toCard = true } = {}) =>
    `<div class="tripwalk home ${toCard ? 'tocard' : 'topot'}" data-route="${esc(from)};${esc(to)}" data-dur="${ms}" data-delay="${delay}" style="--start:${delay}ms;--land:${delay + ms}ms">${beast(an, 'walk', `${koffer ? '<i class="bkoffer"></i>' : ''}${count > 1 ? `<b class="bcount">${count}×</b>` : ''}${star ? `<i class="bstar">${STAR}</i>` : ''}`)}${toCard ? `<span class="bcard">${miniCard(an)}</span>` : ''}</div>`;
  // v0.61 Prügel-Animation (Comic, keine echte Gewalt): Laufen → Staubwolke mit POW/BAM → zurück
  const punchFx = (pu) => {
    const src = esc(pu.from); const dst = esc(pu.to); // '@me' wird erst in seatPoint aufgelöst
    const who = `${esc(pu.from === meId ? 'Du' : nameOf(pu.from))} ${pu.from === meId ? 'verprügelst' : 'verprügelt'} ${esc(pu.to === meId ? 'dich' : nameOf(pu.to))}!`;
    const sc = sceneFx({ kind: 'punch', from: pu.from, to: pu.to, at: pu.at });
    return `${sc ? sc.html : ''}
      <div class="pcloud ${pu.to !== meId && /^t/.test(seatOf(pu.to)) ? 'low' : ''}" data-aim-from="${dst}" data-aim-to="${dst}" style="--tx:0px;--ty:0px" role="status"><i class="pc c1"></i><i class="pc c2"></i><i class="pc c3"></i><i class="pc c4"></i>
        <b class="pw w1">POW!</b><b class="pw w2">BAM!</b><b class="pw w3">KLATSCH!</b><em class="ps s1">⭐</em><em class="ps s2">✨</em><em class="ps s3">⭐</em><span class="pf f1">👊</span><span class="pf f2">🦶</span><span class="plabel">${who}</span></div>`;
  };
  const cur = currentPlayer(v);
  const myTurn = cur.id === meId;

  // Auswahl zurücksetzen, sobald sich im Spiel etwas getan hat
  const key = `${state.phase}|${state.turn}|${logNo(state)}`;
  if (local.key !== key) {
    local.key = key;
    local.sel = [];
    local.ratSel = null;
    if (state.phase !== 'turn') local.tradeOpen = false;
    local.bidSel = []; // v0.87 Balatro-Bieten: Auswahl gilt nur bis sich etwas tut
    if (state.phase !== 'rat') local.autoZero = false; // v0.87: Auto-0 gilt nur für die laufende Rattenrunde
  }
  let selSum = local.sel.reduce((s, i) => s + (me.money[i] ?? 0), 0);

  // Animationen nur bei echten Neuigkeiten abspielen, nicht bei jedem Neuzeichnen
  const prev = local.prev || {};
  const fresh = prev.logLen !== undefined && logNo(state) !== prev.logLen;
  const entered = prev.phase !== state.phase;
  // Ist das letzte Ereignis wirklich neu? (Gebote, Herausforderungen usw. schreiben ins Protokoll, ändern es aber nicht)
  // Kennung aus Nummer und Art: zwei Ereignisse mit derselben Nummer (z. B. „umsonst“ und danach Geldschein) gelten trotzdem beide als neu
  const evN = v.lastEvent ? `${v.lastEvent.n}|${v.lastEvent.type}` : null;
  const evFresh = fresh && evN != null && local.seenEvN !== evN;
  // v0.82 Geheimauftrag: 🎯 oben links, am Anfang einmal von selbst offen (6 s), Antippen zeigt Auftrag und Stand
  const myMission = v.missions && v.missions[meId] ? missionStatus(v, meId) : null;
  if (myMission && local.missAuto === undefined) { local.missAuto = logNo(v) <= 4 ? Date.now() + 6500 : 0; if (local.missAuto) { local.missOpen = true; later.push(['bell', 600]); } }
  if (local.missAuto && Date.now() > local.missAuto && local.missOpen === true) { local.missOpen = false; local.missAuto = 0; }
  const myPartner = isTeams(state) ? partnerOf(state, meId) : null; // v0.83 Teams
  if (local.missOpen && !local.missOpenedAt) local.missOpenedAt = Date.now(); else if (!local.missOpen) local.missOpenedAt = 0;
  const missPop = myMission && local.missOpen ? `<div class="misspop" role="dialog" aria-label="Dein Geheimauftrag" style="animation-delay:-${Math.min(2000, Date.now() - local.missOpenedAt)}ms"><span class="mptag">🎯 Dein Geheimauftrag <small>nur du siehst ihn</small></span>
    <b>${esc(myMission.text)}</b>
    <div class="mpbar"><i style="width:${Math.round(Math.min(1, myMission.got / myMission.need) * 100)}%"></i></div>
    <span class="mpstate">${myMission.done ? '✓ Schon erfüllt' : myMission.need > 4 ? `Stand: ${myMission.got}` : `Stand: ${myMission.got} von ${myMission.need}`} · Bonus <b>+${myMission.bonus}</b> Punkte am Ende</span></div>` : '';
  // v0.81 Blindmarkt: beim Zuschlag dreht sich die verdeckte Karte für alle um
  { const br = v.blindReveal; const bsig = br ? `${br.n}|${br.animal}` : null;
    if (bsig && local.blindSig !== bsig) { const first = local.blindSig === undefined && !fresh; local.blindSig = bsig;
      if (!first && logNo(v) - br.n < 3) { local.blindQ = `<div class="blindrev" role="status" style="--bd:${Math.round(2600 * INFO_F)}ms"><span class="brtag">🙈 Aufgedeckt!</span><div class="brcard">${playCard(br.animal)}</div><b>${esc(aname(br.animal))}${aval(br.animal) != null ? ` · ${aval(br.animal)}` : ''}</b>${br.eselBonus ? `<small>${br.eselNr}. Esel – alle +${br.eselBonus}</small>` : ''}</div>`; later.push(['flip', 0]); if (br.eselBonus) later.push(['iah', 500]); } } }
  // v0.79 Rattenkönig: wer am Ende alle Ratten hat, wird vor allen zur Ratte gekrönt (Show, danach Mütze am Tisch und auf dem Treppchen)
  const king = ratKingOf(state);
  let kingExtra = 0;
  // v0.89 (Alp): nur EINMAL pro Partie (vorher beim Quartett-Wählen und am Ende nochmal)
  const kingKey = king ? `${king}|${state.createdAt ?? state.seed ?? ''}|${v.players.map((p) => p.id).join(',')}` : null;
  if (king && entered && fresh && (state.phase === 'block' || state.phase === 'ended') && local.kingShownKey !== kingKey) {
    local.kingShownKey = kingKey;
    const kd = v.lastEvent && EV_WAIT[v.lastEvent.type] ? calmFor(v.lastEvent, v.deck, state) : 600;
    const km = kingMs(INFO_F); const ki = idxOf(king);
    local.kingQ = { html: ratKingShow(esc(nameOf(king)), SEAT_COLORS[ki] || '#FFD34E', figOf(king), kd, king === meId, km, state.phase === 'block', v.players[ki]?.animals?.[RAT] || RAT_COUNT), dur: kd + km + 100 };
    local.kingAt = Date.now() + kd + Math.round(km * 0.55);
    showUntilAt = Math.max(showUntilAt, Date.now() + kd + km + 250);
    kingExtra = kd + km + 300;
    later.push(['quiek', kd + Math.round(km * 0.08)]); later.push(['quiek', kd + Math.round(km * 0.3)]); later.push(['puff', kd + Math.round(km * 0.48)]); later.push(['fanfare', kd + Math.round(km * 0.6)]);
  }
  const kingHat = (pid) => (king && pid === king && Date.now() >= (local.kingAt || 0) ? ratHat() : '');
  if (evN != null) local.seenEvN = evN;
  if (evFresh && v.lastEvent?.type === 'trade' && local.potLand && local.potLand > Date.now()) { TRADE_PRE.set(v.lastEvent.n, local.potLand - Date.now() + 200); if (TRADE_PRE.size > 20) TRADE_PRE.delete(TRADE_PRE.keys().next().value); }
  // Verschnaufpause: nach einem Ergebnis kurz nicht weiter aufdecken, damit alle sehen, was passiert ist
  const qExtra = evFresh && quartetOf(v.lastEvent, state) ? qExtraMs() : 0; // v0.77: Quartett-Show – das Spiel wartet, bis sie vorbei ist
  if (evFresh && state.phase === 'turn' && CALM_TYPES.includes(v.lastEvent?.type)) { local.calmDur = qExtra + (EV_WAIT[v.lastEvent.type] ? choreo(v.lastEvent, v.deck, undefined, v.lastEvent.type === 'rat_taken' ? local.ratLaid : null).calm : CALM_MS); local.calmUntil = Date.now() + local.calmDur; }
  const calmLeft = state.phase === 'turn' ? Math.max(0, (local.calmUntil || 0) - Date.now(), showUntilAt - Date.now()) : 0;
  if (calmLeft && local.tradeOpen) local.tradeOpen = false; // v0.77: während Ruhe/Quartett-Show kein offenes Kuhhandel-Fenster
  if (evFresh && state.phase === 'turn' && EV_WAIT[v.lastEvent?.type] && local.holder) local.turnHold = { id: local.holder, until: Date.now() + qExtra + choreo(v.lastEvent, v.deck, undefined, v.lastEvent.type === 'rat_taken' ? local.ratLaid : null).haloAt }; // Rahmen wandert erst nach Tier + Geld + Ruhe
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
      gainAt: inS.length ? t0 + Math.min(...inS.map((x) => x.at)) + MFLY_MS - 20 : le0.type === 'trade' ? t0 + ch0.W : t0,
    } : null;
  }
  // v0.77 Zu zweit: dein aufgeteilter Geldschein erscheint erst, wenn er gelandet ist
  if (evFresh && v.lastEvent?.type === 'divided') {
    [v.lastEvent.first, v.lastEvent.second].forEach((x, k) => { if (x && x.to === meId && /^geld-\d+$/.test(x.card)) local.handFx = { gain: [Number(x.card.slice(5))], lose: [], gainAt: Date.now() + 250 + k * 450 + 300 + MFLY_MS - 20, loseAt: Date.now() }; });
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
  local.prev = { logLen: logNo(state), phase: state.phase, highMe: state.phase === 'auction' && state.auction?.high?.player === meId, aucId: state.phase === 'auction' ? logNo(state) : null };

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
      if (p.id === auction.auctioneer) status = auction.forced ? 'gepfändet' : 'versteigert';
      else if (auction.passed.includes(p.id)) status = 'gepasst';
      else if (auction.caps[p.id] != null) status = `max. ${auction.caps[p.id]}`;
    }
    // v0.86 (Alp): in der Rattenrunde bleibt am Platz die Kartenzahl stehen – wie viel gelegt wurde, zeigt der Stapel daneben
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
    // v0.86: Sprechblase läuft beim Neuzeichnen zeitlich weiter statt neu zu starten (sonst „laggt“ sie, wenn im Hintergrund etwas passiert)
    const rbEl = said ? Math.max(0, Math.min(3200, 3200 - (said.until - Date.now()))) : 0;
    const bubble = said ? `<div class="rbubble ${isEmo ? 'emo' : ''} ${from ? 'to' : ''} ${isEhrlich ? 'ehrlich' : ''} ${isUnehrlich ? 'ehrlich unehrlich' : ''}" style="animation-delay:-${rbEl}ms;${fromIdx >= 0 ? `--c:${SEAT_COLORS[fromIdx]}` : ''}">${fromIdx >= 0 ? `<small>${esc(nameOf(from))} →</small>` : ''}${esc(said.text)}</div>` : '';
    let nudge = ctx.nudgeWho === p.id && !isMe ? `<button type="button" class="nudge" data-a="nudge" data-v="${esc(p.id)}" aria-label="${esc(p.name)} anstupsen">👉 Anstupsen</button>` : '';
    if (ctx.canTakeover && ctx.canTakeover(p.id)) nudge = `<button type="button" class="nudge takeover" data-a="takeover" data-v="${esc(p.id)}" aria-label="Test-Spieler übernimmt für ${esc(p.name)}">🤖 Für ${esc(p.name)} übernehmen</button>`;
    // du sitzt unten: kein eigener Platz – nur Sprechblasen erscheinen über deinem Geld
    if (isMe) return said ? `<div class="mebubble ${state.phase === 'payment' || state.phase === 'trade' || state.phase === 'rat' || local.tradeOpen ? 'up' : ''}">${bubble}</div>` : '';
    const laidN = state.phase === 'rat' ? (v.rat.laid[p.id] || 0) : 0;
    // v0.87 (Alp): wer nicht zahlen konnte, dessen Scheine bleiben bis zum Ende dieser Versteigerung für alle offen
    const om = state.phase === 'auction' && v.auction?.openMoney?.[p.id];
    const openMoney = om ? `<div class="openmoney" title="${esc(p.name)} hat offen gezeigt" aria-label="Offene Scheine: ${om.join(', ') || 'keine'}">${om.length ? om.map((m) => `<i style="--m:${MONEY_COLORS[m]}">${m}</i>`).join('') : '<em>keine Scheine</em>'}<b>= ${om.reduce((x, y) => x + y, 0)}</b></div>` : '';
    const ratPile = laidN ? `<div class="ratpile" aria-label="${laidN} gelegt">${Array.from({ length: Math.min(laidN, 6) }, () => '<i></i>').join('')}<b>${laidN}</b></div>` : '';
    return `<div class="prow seat-${seatOf(p.id)}${turnMark}${dim}${isLeader ? ' leader' : ''}${local.out && local.out[p.id] && local.out[p.id].from <= Date.now() && Date.now() < local.out[p.id].until ? ' out' : ''}${ouchOn(p.id) ? ' ouch' : ''}" data-pid="${esc(p.id)}" style="--c:${SEAT_COLORS[i]}${flashing ? `;--fl:-${flashEl}ms` : ''}">${coin}${ratPile}${openMoney}${(() => { const hn = Array.isArray(state.hands?.[p.id]) ? state.hands[p.id].length : 0; return hn ? `<span class="handchip" title="${hn} Börsen-Karte${hn > 1 ? 'n' : ''} auf der Hand" aria-label="${hn} Karte${hn > 1 ? 'n' : ''} auf der Hand"><i></i>${hn > 1 ? `×${hn}` : ''}</span>` : ''; })()}
      ${bubble}${nudge}${pickTargets.includes(p.id) ? `<button type="button" class="seatpick ${local.tradeTarget === p.id ? 'on' : ''}" data-a="tTarget" data-v="${esc(p.id)}" aria-label="Kuhhandel mit ${esc(p.name)}"><span>${local.tradeTarget === p.id ? '✓ gewählt' : 'antippen'}</span></button>` : ''}
      <div class="pid" data-a="reactTo" data-v="${esc(p.id)}" role="button" aria-label="${esc(isMe ? 'Reaktion senden' : `Reaktion an ${p.name}`)}">
        ${turnMark ? '<span class="turnhint" aria-label="ist dran">⏳</span>' : ''}<div class="avatar seatfig" style="--c:${SEAT_COLORS[i]};--bd:-${(i * 0.9).toFixed(1)}s" aria-hidden="true">${aliveFig(p, i, avatarLookup(p.id)?.shop)}${kingHat(p.id)}${moodHtml(p.id)}</div>${ouchOn(p.id) ? `<span class="ouchwrap">${OUCH}</span>` : ''}
        <div class="pname"><span class="ribbon-s" style="--c:${SEAT_COLORS[i]}">${myPartner === p.id ? '<b class="teamb" title="Dein Partner">🤝</b>' : ''}${esc(isMe ? 'Du' : p.name)}</span><span class="tag-s ${isLeader && fresh ? 'pop' : ''}">${status === karten(count) ? `<span class="mcnt" title="${karten(count)} Geld">${isMe ? '<i></i>' : `<span class="mfan" aria-hidden="true" style="--n:${Math.min(count, 8)}">${Array.from({ length: Math.min(count, 8) }, (_, k) => `<i style="--k:${k}"></i>`).join('')}</span>`}${count}${myPartner === p.id && Array.isArray(p.money) ? `<b class="psum">${p.money.reduce((a, b) => a + b, 0)}</b>` : ''}</span>` : status}</span></div>
      </div>
      <div class="chips ${(chips.match(/class="chip /g) || []).length > 8 ? 'manych' : ''}" data-a="setsOf" data-v="${esc(p.id)}" style="--nchip:${(chips.match(/class="chip /g) || []).length}" role="button" aria-label="Alle Sets von ${esc(p.name)} ansehen">${chips}</div>
    </div>`;
  }).join('');

  // ----- Versteigerung: findet direkt auf dem Tisch statt -----
  let wake = null; // wann neu zeichnen (Aufdecken, Buzzer-Countdown) – in Serverzeit
  const wakeLocal = (t) => { const w = t + (ctx.now() - Date.now()); if (!wake || wake > w) wake = w; }; // Gerätezeit → Serverzeit
  if (state.phase === 'turn' && local.hintAt && Date.now() - local.hintAt < 12000) wakeLocal(local.hintAt + 12010); // 💦 nach 12 s am Zug
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
    // v0.88 (Alp): keine Gebotssperre mehr (machte die Knöpfe träge). Schutz vor Fehlgeboten: jeder Knopf bietet einen festen Betrag –
    // war jemand schneller, wird dein Gebot abgelehnt („… war schneller“) statt höher zu bieten. Neue Beträge blinken kurz auf.
    { const hk = a.high ? `${a.opensAt}|${a.high.player}|${a.high.amount}` : `${a.opensAt}|-`;
      if (local.bidFlashKey !== undefined && local.bidFlashKey !== hk && a.high && a.high.player !== meId) local.bidFlashAt = Date.now();
      local.bidFlashKey = hk; }
    const bidFlash = local.bidFlashAt && Date.now() - local.bidFlashAt < 600;
    const canBid = (amt) => !held && (cap == null || amt <= cap);
    const revealing = a.opensAt != null && nowR < a.opensAt;
    if (revealing) wake = a.opensAt; // nach der Animation neu zeichnen
    // Kleiner, dezenter Infokasten – erscheint erst nach dem Aufdecken
    const infoKey = `${a.opensAt}|${a.animal}`;
    const infoFresh = !revealing && local.infoShown !== infoKey;
    if (!revealing) local.infoShown = infoKey;
    const holders = v.players.map((p, i) => [p, i]).filter(([p]) => p.animals[a.animal] > 0);
    const ainfo = `<div class="owners ${infoFresh ? 'fade' : ''}">
      ${!a.animal ? '<span class="onew blindinfo">🙈 Blindmarkt<br><small>Was es ist, siehst du erst nach dem Zuschlag</small></span>' : holders.length ? `<small>Haben schon</small><div class="olist">${holders.map(([p, i]) => `<span class="own ${p.id === meId ? 'me' : ''}">${avatar(p, i)}<b>${p.id === meId ? 'Du' : esc(p.name)} ×${p.animals[a.animal]}</b></span>`).join('')}</div>`
        : '<span class="onew">Neu im Spiel</span>'}
      ${a.animal === 'esel' && v.lastEvent?.type === 'donkey' ? `<span class="ebonus">Esel-Bonus: alle +${v.lastEvent.payout}</span>` : ''}
    </div>`;
    // Countdown: Ring um die Karte – bieten nur solange er läuft, Zuschlag erst danach
    const now = ctx.now();
    const running = a.endsAt != null && now < a.endsAt && !revealing; // läuft auch während der Pause nach „kann nicht zahlen“ (Uhr zeigt 15 … 11, Bieten gesperrt)
    const secs = running ? Math.ceil((a.endsAt - now) / 1000) : 0;
    const total = a.high ? auctionBidMs(state) : auctionStartMs(state);
    const pct = running ? Math.max(0, Math.min(100, ((a.endsAt - now) / total) * 100)) : 0;
    // v0.65 Zwangsversteigerung: Karte wird nicht umgedreht, sondern bekommt das Siegel „GEPFÄNDET“ (bleibt während der Versteigerung drauf)
    const seal = a.forced ? `<span class="aucseal" style="animation-delay:${revealing ? Math.max(0, 1150 - (pfaendShowMs(state) - (a.opensAt - nowR))) : -999}ms" aria-label="gepfändet"><b>⚖</b><small>GEPFÄNDET</small></span>` : '';
    // v0.85: Bei jedem neuen Zeichnen (Teams: viele Updates) startete die Dreh-Animation neu und die Karte „zappelte“ – jetzt läuft sie zeitlich weiter
    const revealDelay = revealing ? -Math.max(0, Math.min(revealMs(state), revealMs(state) - (a.opensAt - nowR))) : 0;
    const card = revealing
      ? (!a.animal ? `<div class="revealcard blindc" style="--rd:${revealDelay}ms">${blindCard()}</div>` : a.forced ? `<div class="revealcard forced">${playCard(a.animal)}${seal}</div>` : `<div class="revealcard ${aval(a.animal) >= 650 ? 'big' : ''}" style="--rd:${revealDelay}ms">${playCard(a.animal)}${aval(a.animal) >= 650 ? glitz(14, 'burst') : ''}</div>`)
      : `<div class="aucard center ringwrap ${infoFresh ? 'settle' : ''} ${running ? (secs <= 3 ? 'low' : '') : 'over'}" ${a.endsAt != null ? `data-ends="${a.endsAt}" data-total="${total}" data-fmt="n"` : ''}>
          ${a.animal ? playCard(a.animal) : blindCard()}${aval(a.animal) >= 650 ? glitz(7, 'calm') : ''}${seal}
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

    aucBanner = urge ? 'Alle warten auf dich!' : a.forced ? `⚖️ Zwangsversteigerung · ${iAmAuctioneer ? 'dein Tier' : `${esc(nameOf(a.auctioneer))}s Tier`}` : `${esc(nameOf(a.auctioneer))} ${iAmAuctioneer ? 'versteigerst' : 'versteigert'}`;
    // Nach Ablauf entscheidet der Auktionator: „Zuschlag“ sitzt beim Gebot des Höchstbietenden, „Selbst kaufen“ unten links – weit auseinander
    const decideHere = iAmAuctioneer && !revealing && !running && a.high;
    const sellBtn = decideHere ? `<button type="button" class="tbtn accept sidebtn ${urge ? 'urge' : 'hintme'}" data-a="sell"><small>ZUSCHLAG AN ${esc(nameOf(a.high.player)).toUpperCase()}</small><span class="amt in">+${high}</span><em>bekommst du</em></button>` : '';
    // v0.79 „Warte, warte, warte!“ sitzt unter dem Gebots-Schild – direkt bei Uhr und Preis
    const aWaitBtn = !iAmAuctioneer && running && !(a.waits || []).includes(meId) ? waitBtn(true, `+${Math.round(waitExtraMs(state, (a.waits || []).length) / 1000)} s`, 'aWait') : '';
    aucCenter = revealing ? `<div class="auc aucreveal">${card}</div>` : `<div class="auc aucmain"><div class="aucrow"><div class="aside l">${ainfo}</div>${card}<div class="aside r">${info}${sellBtn}${aWaitBtn}</div></div>${countdown}</div>`;

    if (iAmAuctioneer) {
      const myTotal = sum(me.money);
      if (revealing) {
        aucLeft = `<div class="ldecide">${a.forced ? '⚖️ Dein Tier wird gepfändet …' : 'Du deckst auf …'}</div>`;
      } else if (running) {
        aucLeft = ''; // „Du versteigerst“ steht schon oben im Schild
      } else if (a.high) {
        aucLeft = a.forced ? `<div class="ldecide">⚖️ Gepfändet – du musst verkaufen</div>` // Zwangsversteigerung: kein Vorkaufsrecht
          : `<button type="button" class="pill pill-white ${urge ? 'urge' : ''}" data-a="buy" ${myTotal >= high ? '' : 'disabled'}><small>${myTotal >= high ? 'SELBST KAUFEN' : 'ZU WENIG GELD'}</small><span class="amt out">−${high}</span></button>`;
      } else {
        aucLeft = `<button type="button" class="pill pill-red" data-a="sell"><small>NIEMAND HAT GEBOTEN</small>${a.forced ? 'Tier behalten' : 'Tier nehmen'}</button>`;
      }
    } else if (revealing) {
      aucLeft = `<div class="ldecide">${a.forced ? '⚖️ Der Gerichtsvollzieher kommt …' : 'Karte wird aufgedeckt …'}</div>`;
    } else if (running) {
      const passed = a.passed.includes(meId);
      const otherBidders = v.players.filter((p) => p.id !== a.auctioneer && p.id !== meId);
      const lastIn = !passed && !held && otherBidders.length > 0 && otherBidders.every((p) => a.passed.includes(p.id)) && !!(a.high && a.high.player === meId);
      // Ein Knopf pro Scheinwert, den es im Spiel gibt: aufs Höchstgebot draufbieten
      const steps = [10, 20, 50, 100]; // mehr bieten = mehrmals tippen (z. B. 100, dann 20)
      const mine = sum(me.money);
      aucLeft = `<div class="lhead">Bieten <small>${held ? 'gleich geht’s los …' : `mind. ${high + BID_STEP}`}</small></div>
        <div class="bidgrid" ${(local.bidSel || []).length ? 'hidden' : ''}>${steps.map((st) => {
          const amt = high + st;
          const over = amt > mine;
          return `<button type="button" class="bidbtn ${st === 10 ? 'main' : ''} ${over ? 'over' : ''} ${bidFlash ? 'newamt' : ''}" style="--bfl:-${bidFlash ? Date.now() - local.bidFlashAt : 0}ms" data-a="bid" data-v="${amt}" ${canBid(amt) ? '' : 'disabled'} aria-label="${amt} bieten${over ? ', mehr als du hast' : ''}"><b>${amt}</b><small>${over ? '⚠ zu viel' : `+${st}`}</small></button>`;
        }).join('')}</div>
        ${(() => { // v0.87 (Nico): wie bei Balatro – Scheine im Fächer antippen (sie springen hoch), dann zusammen als Gebot abschicken
          const bs = local.bidSel || []; const bsum = bs.reduce((x, y) => x + y, 0);
          return bs.length ? `<button type="button" class="pill pill-red bidsend" data-a="bidSel" ${canBid(bsum) ? '' : 'disabled'}><small>${bs.length} Schein${bs.length > 1 ? 'e' : ''} · ${canBid(bsum) ? 'als Gebot' : `mind. ${high + BID_STEP}`}</small>${bsum} bieten</button><button type="button" class="pill pill-white pill-small" data-a="bidClear">Auswahl weg</button>` : '';
        })()}
        <button type="button" class="pill pill-white pill-small passbtn ${lastIn ? 'endnow' : ''}" data-a="pass" ${passed ? 'disabled' : ''}>${passed ? 'Gepasst' : lastIn ? 'Beenden' : 'Passen'}</button>`;
      // v0.87 (Nico): Haben alle anderen Bieter gepasst, bekommt der letzte eine Anzeige und kann selbst beenden
      if (lastIn) aucLeft = `<div class="lastin" role="status">🙋 Alle anderen haben gepasst<small>Du führst mit ${a.high ? a.high.amount : 0} – nochmal erhöhen oder jetzt beenden</small></div>` + aucLeft;
      if (!passed && !held) pickMode = 'bid';
    } else {
      aucLeft = `<div class="ldecide">${esc(nameOf(a.auctioneer))} entscheidet …</div>`;
    }

    const tick = () => haptic('tap', ctx.vibe !== false);
  // v0.88: war jemand schneller, gibt es eine klare Meldung statt eines höheren Gebots
  // Führst du schon selbst (z. B. zweimal schnell „+10“), legt jeder weitere Tipp einfach seinen Schritt auf dein Gebot drauf
  const bidSafe = (s, amt, step = 0) => { const hi = s.auction?.high;
    if (hi && hi.player !== meId && hi.amount >= amt) throw new GameError(`${nameOf(hi.player)} war schneller (${hi.amount}) – tippe nochmal, wenn du mehr willst.`);
    if (hi && hi.player === meId && amt <= hi.amount && step > 0) amt = hi.amount + step;
    return bid(s, meId, amt, ctx.now()); };
  const bidStep0 = state.phase === 'auction' && state.auction?.high ? state.auction.high.amount : 0;
  H.bid = (amt) => { tick(); const a0 = Number(amt); ctx.act((s) => bidSafe(s, a0, a0 - bidStep0)); };
  // v0.87 Balatro-Bieten: Schein antippen = einer mehr hoch; sind alle dieses Werts oben, gehen sie wieder runter
  // v0.88: angehobenen Schein antippen = wieder runter, sonst einen dieses Werts hoch
  H.bidTog = (val) => { const [mv, off] = String(val).split(':'); const m = Number(mv); const bs = local.bidSel || (local.bidSel = []); const have = me.money.filter((x) => x === m).length; const n = bs.filter((x) => x === m).length;
    if (off === 'x') bs.splice(bs.indexOf(m), 1); else if (n < have) bs.push(m); tick(); ctx.rerender(); };
  H.bidClear = () => { local.bidSel = []; ctx.rerender(); };
  H.bidSel = () => { const amt = (local.bidSel || []).reduce((x, y) => x + y, 0); if (!amt) return; tick(); local.bidSel = []; ctx.act((s) => bidSafe(s, amt)); };
    H.pass = () => ctx.act((s) => passAuction(s, meId, ctx.now()));
    H.aWait = () => { haptic('tap', ctx.vibe !== false); ctx.act((s) => waitAuction(s, meId, ctx.now())); };
    const lw = a.lastWait; const wsig = lw ? `${lw.player}|${lw.at}` : null;
    if (wsig && local.aWaitSig !== wsig) { local.aWaitSig = wsig; if (ctx.now() - lw.at < 2500) { local.waitQ = waitPop(lw.player, Math.round(lw.ms / 1000)); later.push(['warte', 0]); } }
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
      <div class="aside r"><div class="potbox">${pot}<small>Gelegt: <b>${karten(potCount)}</b></small></div>${turnId === meId ? `<button type="button" class="tbtn counter sidebtn" data-a="ratTake"><small>RATTE NEHMEN</small><span class="amt in">+${karten(potCount)}</span></button>` : ''}</div>
    </div></div>`;
    if (turnId === meId) {
      const values = [...new Set(me.money)].sort((a, b) => a - b);
      if (local.ratSel != null && !values.includes(local.ratSel)) local.ratSel = null;
      // Dein niedrigster Schein ist vorgewählt – nur noch „Verdeckt legen“ drücken (oder einen anderen antippen)
      if (local.ratSel == null && values.length) local.ratSel = Math.min(...values);
      aucLeft = `${values.length ? `<button type="button" class="pill pill-white nocaps" data-a="ratGo" ${local.ratSel != null ? '' : 'disabled'}><small>VERDECKT LEGEN</small>${local.ratSel != null ? `${local.ratSel}er legen` : 'Schein antippen · 2× tippen legt'}</button>` : ''}`;
      if (values.length) pickMode = 'rat';
    } else {
      aucLeft = `<div class="ldecide">${esc(nameOf(turnId))} überlegt …</div>`;
    }
    // v0.87 (Nico): Knopf „Automatisch 0 legen“ – solange an, legt die App für dich reihum eine 0 (falls du eine hast)
    if (me.money.includes(0)) aucLeft += `<button type="button" class="pill pill-small ${local.autoZero ? 'pill-red' : 'pill-white'} autozero" data-a="autoZero" aria-pressed="${local.autoZero ? 'true' : 'false'}">${local.autoZero ? '🤖 Auto-0: an' : '🤖 Auto-0 legen'}</button>`;
    if (local.autoZero && turnId === meId && me.money.includes(0)) {
      const azKey = `${logNo(state)}`;
      if (local.azKey !== azKey) { local.azKey = azKey; setTimeout(() => { if (local.autoZero && local.azKey === azKey) H.ratLay(0); }, 700); }
    }
    H.autoZero = () => { local.autoZero = !local.autoZero; local.azKey = null; ctx.rerender(); };
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
    // v0.86: Ist ein Buzz schon per Live-Verbindung angekündigt, aber noch nicht gespeichert, gilt er für die Anzeige schon
    const hint = ctx.buzzHint ? ctx.buzzHint() : null;
    const hintOn = hint && stage === 'countdown' && hint.startsAt === sp.startsAt && !Object.keys(sp.buzzes).length;
    const top = Object.values(sp.buzzes).length ? Math.max(...Object.values(sp.buzzes)) : hintOn ? hint.n : null;
    const buzzed = hintOn ? [hint.seat] : Object.keys(sp.buzzes).filter((id) => sp.buzzes[id] === top);
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
    if (!big && stage !== 'wait' && stage !== 'countdown' && stage !== 'rps' && iRevealed && res) big = `<button type="button" class="tbtn accept sidebtn" data-a="spSell"><small>VERKAUFEN · ${esc(nameOf(res.player)).toUpperCase()} ZAHLT</small><span class="amt in">+${karten(res.count)}</span></button>`;
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
        aucLeft = `<button type="button" class="pill pill-white" data-a="spBuy" ${canBuy ? '' : 'disabled'}><small>${canBuy ? 'SELBST KAUFEN' : 'ZU WENIG KARTEN'}</small><span class="amt out">−${karten(res.count)}</span></button>`;
      }
    } else {
      aucLeft = `<div class="ldecide">${esc(nameOf(sp.revealer))} entscheidet …</div>`;
    }
    H.buzz = () => { const t = ctx.now(); haptic('buzz', ctx.vibe !== false); const n = specialNumber(v, t); if (n > 0 && !(top != null && n < top) && ctx.sendBuzz) ctx.sendBuzz(n); ctx.act((s) => buzz(s, meId, t)); };
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
        <button type="button" class="pill pill-red ${ready ? 'hintme' : ''}" data-a="pay" ${ready ? '' : 'disabled'}><small>BEZAHLEN</small>${isSp ? `<span class="amt out">−${karten(n)}</span>` : `${karten(n)} · <span class="amt out">−${selSum}</span>`}</button>`;
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
    const pw = local.potLand ? local.potLand - Date.now() : 0; // v0.70: Topf füllt sich erst, wenn die Tiere angekommen sind
    return `<div class="tmid tmpot"><div class="tpot ${pw > 0 ? 'pwait' : ''}" style="--pw:${Math.max(0, pw)}ms;--pn:${n};--sp:${Math.min(22, Math.round(54 / Math.max(1, n - 1)))}px">${Array.from({ length: n }, (_, k) => `<span class="tpc" style="--k:${k}">${miniCard(animal, 'fill')}</span>`).join('')}</div>
      <span class="tmidcnt">${count} gegen ${count}</span><small class="tpotl">${isRat ? `Verlierer bekommt alle ${n}` : `Gewinner bekommt alle ${n}`}</small><span class="tvs">VS</span>${extra}</div>`;
  };
  // (alt) Mitte zwischen den beiden Seiten: das umkämpfte Tier groß, darunter „um 2“
  const tmidOld = (animal, count, extra = '') => `<div class="tmid">${animal ? `<div class="tmidcard">${playCard(animal, animal === RAT ? 'rat' : undefined)}</div><span class="tmidcnt">um ${count}</span>` : '<div class="tmidcard empty">?</div><span class="tmidcnt">Tier wählen</span>'}<span class="tvs">VS</span>${extra}</div>`;
  const animalStrip = (animal, count, note) => `<div class="tanimal" style="--a:${ANIMAL_COLORS[animal]}">${miniCard(animal)}<span><b>${count}× ${aname(animal)}${aval(animal) != null ? ` · ${valHtml(animal)}` : ''}</b>${note ? `<small>${note}</small>` : ''}</span></div>`;
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
        ${(() => { // v0.87 (Alp/Nico): alle Tiere des gewählten Gegners auf einen Blick – auch solange der Stapel noch liegt
          const own = Object.entries(target.animals).filter(([, n]) => n > 0);
          const tot = own.reduce((x, [, n]) => x + n, 0);
          return own.length ? `<div class="tp-opset" style="--c:${SEAT_COLORS[idxOf(target.id)]}"><b>${tName(target.id)} hat ${tot} Tier${tot === 1 ? '' : 'e'}:</b>${own.map(([id, n]) => `<span class="tpo ${n === 4 ? 'q' : ''}" title="${n}× ${esc(aname(id))}">${miniCard(id)}<em>${n}×</em></span>`).join('')}</div>` : '';
        })()}
        <div class="tp-grid ${many}">${forTarget.map((t) => `<button type="button" class="tp-t" data-a="tAnimal" data-v="${t.animal}" style="--a:${ANIMAL_COLORS[t.animal]}" aria-label="${aname(t.animal)}: es geht um ${t.count}">
          <span class="tp-um">um ${t.count}</span>${miniCard(t.animal, 'fill')}${aval(t.animal) != null ? `<em class="tp-val">${valHtml(t.animal)}</em>` : ''}<span class="tp-nm">${esc(aname(t.animal))}</span>
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
    H.tradeGo = () => { if (showBusy() || calmLeft) return; ctx.act((s) => startTrade(s, meId, local.tradeTarget, local.tradeAnimal, local.sel)); }; // v0.77: nicht während Ruhe/Quartett-Show
  }

  if (state.phase === 'trade') {
    const t = v.trade;
    const TT = tradeTimerSec(state); // Turbo 12 s, sonst 20 s – v0.78: folgt dem Tempo (Denkzeit)
    let ttHtml = '';
    if (TT) {
      const tkey = `${logNo(state)}|${t.challenger}|${t.animal}`;
      if (local.ttKey !== tkey) { local.ttKey = tkey; local.ttAt = Date.now() + (local.ttDelay || 0); local.ttDelay = 0; local.ttBuzzed = false; }
      const left = Math.max(0, Math.ceil((local.ttAt + (TT + (t.extraSec || 0)) * 1000 - Date.now()) / 1000));
      if (t.waited && local.ttWaitSig !== tkey) { local.ttWaitSig = tkey; if (local.ttBuzzed && left > 0) local.ttBuzzed = false; if (!entered) { local.waitQ = waitPop(t.target, t.extraSec); later.push(['warte', 0]); } }
      ttHtml = `<span class="ttimer ${left <= 5 ? 'low' : ''} ${left === 0 ? 'out' : ''}">${left ? `⏱ ${left} s` : '⏰ Zeit um!'}</span>${t.target === meId && !t.waited ? waitBtn(true, `+${TT} s`, 'tWait', 'tt') : ''}`;
      H.tWait = () => { haptic('tap', ctx.vibe !== false); ctx.act((s) => tradeWait(s, meId)); };
      if (left > 0) wakeLocal(Date.now() + 1000 - ((Date.now() - local.ttAt) % 1000) + 20);
      else if (!local.ttBuzzed) { local.ttBuzzed = true; sounds.push('nudge'); if (t.target === meId) haptic('heavy', ctx.vibe !== false); }
    }
    const offerCount = Array.isArray(t.offer) ? t.offer.length : t.offer;
    const offerCards = Array.isArray(t.offer) ? t.offer.map((m) => moneyCard(m, { size: 'xs' })).join('') : Array.from({ length: offerCount }, () => '<div class="money xs back"></div>').join('');
    const isRat = t.animal === RAT;
    // v0.52.1: das Angebot fliegt nach dem „KUHHANDEL!“-Auftritt vom Platz in die Mitte – erst dann liegen die Scheine dort
    const okey = `${logNo(state)}|${t.challenger}|${t.target}|${t.animal}`;
    if (local.offerKey !== okey) { local.offerKey = okey; local.offerAt = entered ? Date.now() : 0; }
    const oel = local.offerAt ? Date.now() - local.offerAt : 1e9;
    const arr = oel < OFFER_LAND + 400 ? ` arr" style="--ad:${OFFER_LAND - oel}ms` : '';
    if (oel < OFFER_LAND + 400) wakeLocal(local.offerAt + OFFER_LAND + 450);
    aucBanner = `${isRat ? 'Rattenhandel' : 'Kuhhandel'}: ${esc(nameOf(t.challenger))} gegen ${esc(nameOf(t.target))}`;
    const challengerPanel = (extra = '') => `<div class="tpanel">
        ${who(t.challenger, t.challenger === meId ? 'Du' : null)}
        <div class="kslots${offerCount > 5 ? ' many' : ''}${arr}">${offerCards || '<span class="tnone">keine Karten</span>'}</div>
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
      const bpool = isTeams(state) ? teamPool(state, teamOf(state, meId)) : me; // v0.83: bei Teams ein Quartett des Teams
      const opts = ANIMALS.filter((a) => bpool.animals[a.id] === 4);
      aucCenter = `<div class="blockpanel ${entered ? 'pop' : ''}">
        <p>Welches Quartett fällt weg?</p>
        <div class="blockgrid">${opts.map((a) => `<button type="button" class="blockopt" data-a="block" data-v="${a.id}" style="--a:${ANIMAL_COLORS[a.id]}">
          ${miniCard(a.id, 'big')}<b>${a.name}${(bpool.specials || []).includes(a.id) ? ` ${STAR}` : ''}</b><small>${scoreFor(bpool, a.id, false, KURSE).score} Punkte</small></button>`).join('')}</div>
      </div>`;
      aucLeft = `<div class="ldecide">Quartett wählen …</div>`;
      H.block = (id) => { if (showBusy()) return; ctx.act((s) => chooseBlock(s, meId, id)); }; // v0.79: erst nach der Rattenkönig-Show
    } else {
      aucCenter = `<div class="auc">${ratCard('', 'compact')}<div class="aucinfo">${esc(bp.name)} wählt, welches Quartett nicht zählt …</div></div>`;
      aucLeft = `<div class="ldecide">Gleich ist das Spiel vorbei.</div>`;
    }
  }

  // ----- v0.77 Zu zweit: Aufteilen -----
  if (state.phase === 'divide' && v.divide) {
    const by = v.divide.by; const mine = by === meId; const other = v.players.find((p) => p.id !== by);
    const leftMs = v.divide.endsAt != null ? Math.max(0, v.divide.endsAt - ctx.now()) : DIVIDE_MS;
    const left = Math.ceil(leftMs / 1000);
    if (leftMs > 0) wakeLocal(Date.now() + (leftMs % 1000 || 1000) + 20);
    // Zeit um: der Aufteiler (oder nach 2,5 s der andere) behält automatisch
    const due = v.divide.endsAt != null ? v.divide.endsAt + (mine ? 0 : 2500) : null;
    if (due != null && ctx.now() >= due && local.divTO !== v.divide.endsAt) { local.divTO = v.divide.endsAt; ctx.act((s) => divideTimeout(s, ctx.now())); }
    else if (due != null) wakeLocal(Date.now() + Math.max(0, due - ctx.now()) + 30);
    const nxt = Array.isArray(state.deck) ? state.deck[1] : null;
    const nextTxt = nxt == null ? 'Danach: keine Karte mehr' : isMoneyCard(nxt) ? 'Danach: 💰 ein Geldschein' : 'Danach: 🐄 eine Tierkarte';
    const nextBack = nxt == null ? '' : `<span class="divnext ${isMoneyCard(nxt) ? 'money' : ''}" aria-hidden="true">${isMoneyCard(nxt) ? '💰' : `<span class="deckcow">${art('kuh')}</span>`}</span>`;
    const dsig = v.divide.waited ? `${by}|${v.divide.card ?? ''}|${logNo(state)}` : null;
    if (dsig && local.dWaitSig !== dsig) { local.dWaitSig = dsig; if (!entered) { local.waitQ = waitPop(by, Math.round(DIVIDE_MS * tempoFactor(state) / 1000)); later.push(['warte', 0]); } }
    const timer = `<span class="ttimer divtimer ${left <= 3 ? 'low' : ''}">⏱ ${left} s</span>`;
    aucBanner = mine ? 'Behalten oder abgeben?' : `${esc(nameOf(by))} teilt auf`;
    if (mine) {
      const c = v.divide.card;
      aucCenter = `<div class="divpanel ${entered ? 'pop' : ''}">
        <div class="divcard flip">${cardFace(c)}</div>
        <div class="divinfo"><b>${esc(cardLabel(c))}</b><small>Nur du siehst diese Karte.</small>
          <div class="divnextrow">${nextBack}<span>${nextTxt}</span></div><div class="divtrow">${timer}${!v.divide.waited && v.divide.endsAt != null ? waitBtn(true, `+${Math.round(DIVIDE_MS * tempoFactor(state) / 1000)} s`, 'dWait', 'tt') : ''}</div></div></div>`;
      aucLeft = `<button type="button" class="pill pill-red divbtn" data-a="divKeep"><small>BEHALTEN</small><span>${esc(nameOf(other.id))} bekommt die nächste</span></button>
        <button type="button" class="pill pill-white divbtn" data-a="divGive"><small>ABGEBEN</small><span>du bekommst die nächste</span></button>`;
      H.divKeep = () => ctx.act((s) => divideChoose(s, meId, true));
      H.dWait = () => { haptic('tap', ctx.vibe !== false); ctx.act((s) => divideWait(s, meId, ctx.now())); };
      H.divGive = () => ctx.act((s) => divideChoose(s, meId, false));
    } else {
      aucCenter = `<div class="divpanel other ${entered ? 'pop' : ''}">
        <div class="divcard wobble"><div class="deck">${`<span class="deckcow">${art('kuh')}</span>`}</div></div>
        <div class="divinfo"><b>${esc(nameOf(by))} schaut sich die Karte an …</b><small>Behält er sie, bekommst du die nächste.</small>
          <div class="divnextrow">${nextBack}<span>${nextTxt}</span></div>${timer}</div></div>`;
      aucLeft = `<div class="ldecide">${esc(nameOf(by))} entscheidet …</div>`;
    }
  }

  // ----- Tisch -----
  const canDraw = state.phase === 'turn' && myTurn && !local.tradeOpen && v.deck > 0 && !calmLeft;
  // v0.63.2 (Alp): Geldscheine im Stapel haben eine grüne Rückseite – man sieht vorher, ob ein Schein oder eine Tierkarte kommt
  const topMoney = v.deck > 0 && Array.isArray(state.deck) && isMoneyCard(state.deck[0]);
  // v0.69 (Alp): Börsen-News haben eine eigene Rückseite (schwarz-gold mit Kurve), Geld eine grüne mit 💰 – man sieht, was als Nächstes kommt
  const topNews = !topMoney && v.deck > 0 && Array.isArray(state.deck) && isNewsCard(state.deck[0]);
  const deckFace = topMoney ? '<span class="deckbag" aria-hidden="true">💰</span>'
    : topNews ? '<span class="decknews" aria-hidden="true"><svg viewBox="0 0 40 24"><path d="M2 20l9-8 7 5 9-11 11 6" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg><b>BÖRSE</b></span>'
    : `<span class="deckcow">${art('kuh')}</span>`;
  const topCls = topMoney ? 'moneytop' : topNews ? 'newstop' : '';
  const lastLog = v.log[v.log.length - 1] || '';
  // Infozeile: leuchtet kurz auf, wenn etwas Neues drinsteht (läuft beim Neuzeichnen weiter)
  if (fresh && state.phase === 'turn') local.stripAt = Date.now() + (evFresh && EV_WAIT[v.lastEvent?.type] ? evWait(v.lastEvent.type, v.deck, v.lastEvent) : 0);
  const stripNew = state.phase === 'turn' && local.stripAt && Date.now() - local.stripAt < 1400 ? 'flash' : '';
  // Letzte Aktion als kleine Bildzeile (wer → was), sonst Textzeile
  // Spieler mit Bild; du = „Du“ / nach „von“ „dir“ / nach „an“ „dich“
  const who2 = (id, du = 'Du') => { const i = idxOf(id); return i >= 0 ? `<span class="evp">${avatar(v.players[i], i)}<b>${id === meId ? du : esc(v.players[i].name)}</b></span>` : ''; };
  let evStrip = '';
  const le0 = v.lastEvent;
  if (le0 && state.phase === 'turn') {
    const hat = (id) => (id === meId ? 'hast' : 'hat');
    const ea = (t) => `<span class="eva">${t}</span>`;
    // v0.88 (Alp): beim Kuhhandel auch die Differenz der Gebote (sehen alle, die Beträge selbst bleiben verdeckt)
    const tdiff = (e) => (e.paid != null ? ea(`· effektiv <b>${e.paid}</b>${e.accepted ? ' (angenommen)' : ''}`) : e.diff != null ? ea(`· Differenz <b>${e.diff}</b>`) : '');
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
      evStrip = `${who2(loser)}${ea(hat(loser))}${ea(`<b>${le0.count}×</b> Ratte`)}${miniCard(RAT)}${ea('von')}${who2(le0.winner, 'dir')}${ea('bekommen')}${tdiff(le0)}`;
    } else if (le0.type === 'trade') {
      const loser = le0.winner === le0.challenger ? le0.target : le0.challenger;
      evStrip = `${who2(le0.winner)}${ea(hat(le0.winner))}${ea(`<b>${le0.count}×</b> ${aname(le0.animal)}`)}${miniCard(le0.animal)}${ea('von')}${who2(loser, 'dir')}${ea('ertauscht')}${tdiff(le0)}`;
    } else if (le0.type === 'money_drawn') evStrip = `${who2(le0.player)}${ea(`${hat(le0.player)} einen Geldschein gezogen`)}${moneyCard(le0.value)}`;

    else if (le0.type === 'hand') evStrip = `${who2(le0.player)}${ea(`${hat(le0.player)} eine Börsen-Karte auf die Hand genommen${le0.kind ? `: <b>${le0.kind === 'pfaendung' ? '⚖️ Zwangsversteigerung' : '🛡️ Einspruch'}</b>` : ''}`)}`;
    else if (le0.type === 'pfaendung') evStrip = `${who2(le0.by)}${ea(`${hat(le0.by)}`)}${who2(le0.target, 'dir')}${ea(aname(le0.animal))}${miniCard(le0.animal)}${ea('gepfändet ⚖️')}`;
    else if (le0.type === 'einspruch') evStrip = `${who2(le0.target)}${ea(`${hat(le0.target)} Einspruch eingelegt 🛡️ – keine Pfändung von`)}${ea(aname(le0.animal))}${miniCard(le0.animal)}`;
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
  // v0.85 (Alp): beim Kuhhandel bleiben deine Sets sichtbar – als Leiste über dem Geld (Tier, Anzahl, ✓ bei fertigem Quartett)
  const mySetsStrip = () => { const ids = [...ANIMALS.map((a) => a.id), RAT].filter((id) => (me.animals[id] || 0) > 0);
    // v0.89 (Alp): genau dieselben Kärtchen wie bei den Mitspielern (keine Kreise mehr)
    return `<div class="mysets" aria-label="Deine Sets"><small>Deine Sets</small>${ids.length || mySpecials.length ? `<div class="chips">${playerChips(me, new Set(), 99)}</div>` : '<em>noch keine Tiere</em>'}</div>`; };
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
  // v0.88 (Alp): Handgeld wieder vollständig – jeder Schein einzeln (sortiert), nicht mehr „×3“ gestapelt;
  // viele Scheine rücken enger zusammen (überlappen), damit alle in die Hand passen
  const SLOTS = Object.keys(MONEY_COLORS).map(Number).sort((x, y) => x - y);
  const handCards = [...handMoney].sort((x, y) => x - y);
  const nH = handCards.length;
  const fanOv = nH > 8 ? Math.min(36, Math.round((nH * 46 - 340) / Math.max(1, nH - 1))) : 0; // v0.89: viele Scheine bleiben zwischen Figur und Knöpfen (sonst lagen die linken unter der Figur)
  const mid = (nH - 1) / 2;
  const liftLeft = {}; // pro Wert: wie viele Scheine noch angehoben werden
  if (pickMode === 'rat' && local.ratSel != null) liftLeft[local.ratSel] = 1;
  if (pickMode === 'bid') (local.bidSel || []).forEach((x) => { liftLeft[x] = (liftLeft[x] || 0) + 1; });
  let glowLeft = [...glowVals];
  const fan = handCards.map((m, i) => {
    const off = i - mid;
    const style = `--m:${MONEY_COLORS[m]};--rot:${(off * (nH > 9 ? 1.6 : 2.5)).toFixed(1)}deg;--dy:${Math.round(Math.abs(off) * (nH > 9 ? 1.4 : 2.5))}px`;
    const lift = (liftLeft[m] || 0) > 0; if (lift) liftLeft[m] -= 1;
    const inner = `${mIn(m)}${lift && pickMode === 'bid' ? '<span class="msel">✓</span>' : ''}`;
    const gi = glowLeft.indexOf(m); const glow = gi >= 0; if (glow) glowLeft.splice(gi, 1);
    if (!pickMode) return `<div class="money fan ${glow ? 'newcard' : ''}" data-v="${m}" style="${style}">${inner}</div>`;
    const label = pickMode === 'rat' ? `${m} zum Legen wählen` : pickMode === 'bid' ? `${m} fürs Gebot wählen` : `${m} ins Feld legen`;
    return `<button type="button" class="money fan pick ${lift ? 'lift' : ''}" style="${style}" data-a="${pickMode === 'rat' ? 'ratPick' : pickMode === 'bid' ? 'bidTog' : 'addv'}" data-v="${pickMode === 'bid' && lift ? `${m}:x` : m}" aria-label="${label}"${lift ? ' aria-pressed="true"' : ''}>${inner}</button>`;
  }).join('');

  const trades = possibleTrades(state, meId);
  // v0.65 Handkarten (Börsen-Chaos): Zwangsversteigerung ausspielen statt aufzudecken
  const myHand = (state.hands && state.hands[meId]) || [];
  const pfTargets = state.phase === 'turn' && myTurn && myHand.includes('pfaendung') ? pfaendTargets(state, meId) : [];
  const pfaendBtn = myHand.includes('pfaendung') && state.phase === 'turn' && myTurn
    ? `<button type="button" class="pill pill-gold pfbtn" data-a="pfOpen" ${pfTargets.length && !v.mustDraw && !calmLeft ? '' : 'disabled'} title="${v.mustDraw ? 'Erst noch eine Karte aufdecken' : pfTargets.length ? '' : 'Gerade kann nichts gepfändet werden'}">⚖️ Pfänden</button>` : '';
  if (local.pfOpen && !pfTargets.length) local.pfOpen = false;
  H.pfOpen = () => { local.pfOpen = true; ctx.rerender(); };
  H.pfClose = () => { local.pfOpen = false; ctx.rerender(); };
  H.pfGo = (val) => { if (showBusy() || calmLeft) return; const [tid, an] = String(val).split('|'); local.pfOpen = false; ctx.act((s) => playPfaendung(s, meId, tid, an, ctx.now())); };
  let leftActionsHtml = aucLeft;
  // Nicht dran: unten links bleibt frei (wer dran ist, steht oben im Schild und an der Sanduhr)
  if (state.phase === 'turn' && myTurn && !local.tradeOpen) {
    leftActionsHtml = `
      <button type="button" class="pill pill-red ${calmLeft ? 'calm' : 'hintme'}" data-a="auction" ${v.deck > 0 && !calmLeft ? '' : 'disabled'} ${calmLeft ? `style="--el:-${(local.calmDur || CALM_MS) - calmLeft}ms;--calm:${local.calmDur || CALM_MS}ms"` : ''}>${isDuo(state) ? 'KARTE<br>ANSEHEN' : 'KARTE<br>AUFDECKEN'}</button>
      <button type="button" class="pill pill-white" data-a="tradeOpen" ${trades.length && !v.mustDraw && !calmLeft ? '' : 'disabled'}>Kuhhandel</button>${pfaendBtn}${isDuo(state) && v.deck === 0 ? `<button type="button" class="pill pill-white pill-small duopass" data-a="duoPass" ${calmLeft ? 'disabled' : ''} title="Verzichten beide nacheinander, ist das Spiel vorbei">Verzichten${state.duoPasses ? ' · dann Ende' : ''}</button>` : ''}`;
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
      ${canDraw ? `<button type="button" class="deck go ${topCls}" data-a="auction" aria-label="${isDuo(state) ? 'Karte ansehen' : topMoney ? 'Geldschein aufdecken' : topNews ? 'Börsen-News aufdecken' : 'Karte aufdecken'}">${deckFace}<span class="deckgo">Tippen</span></button>`
        : `<div class="deck ${v.deck === 0 ? 'empty' : ''} ${topCls}">${v.deck > 0 ? deckFace : ''}</div>`}
      <span class="deck-count ${v.deck > 0 && v.deck <= 5 ? 'low' : ''}">${v.deck > 0 ? `${v.deck} im Stapel${v.deck <= 5 ? ' – bald nur noch Kuhhandel' : ''}` : 'Stapel leer – nur Kuhhandel'}${isTurbo(state) ? '<b class="turbotag">⚡ Turbo</b>' : ''}${isBoerse(state) ? `<b class="turbotag boersetag">📈 Börse${state.hektik ? ` · ⚡ Hektik ${state.hektik}` : ''}${state.blind ? ` · 🙈 Blind ${state.blind}` : ''}</b>` : ''}${state.settings?.stake ? `<b class="turbotag staketag" title="Einsatz: Platz 1 bekommt den Topf">💶 Topf ${state.settings.stake * v.players.length} €</b>` : ''}${kursZettel(state)}</span>
    </div>`}</div>
    <div class="auslage shelf ${local.tradeOpen || state.phase === 'trade' ? 'hide' : ''}" style="--sc:${Math.min(SHELF_MAX * 1.22, 470 / Math.max(1, myItems.length * 44)).toFixed(3)};--sg:${myItems.length > 8 ? 5 : 12}px" aria-label="Deine Karten">${myAnimals}</div>
    ${state.phase === 'trade' || (local.tradeOpen && local.tradePicked) ? mySetsStrip() : ''}
    ${leftActionsHtml ? `<div class="dock">${leftActionsHtml}</div>` : ''}
    <div class="fan-wrap slots ${pickMode ? 'picking' : ''} ${iLead ? 'leading' : ''}" style="--ov:${fanOv}px" aria-label="Dein Geld: ${sum(me.money)} Taler">${fan}${handMoney.length ? `<span class="fansum" aria-hidden="true">${sum(handMoney)}<i class="taler"></i></span>` : pickMode === 'sel' && me.money.length ? '<span class="fanempty">Alles im Feld</span>' : ''}</div>
  </div>`;

  // ----- Menü oben links in der Tischecke -----
  const left = `<div class="gleft">
    <div class="lround">
      <button type="button" class="round" data-a="menu" aria-label="Menü">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
      </button>
      ${v.missions && v.missions[meId] ? `<button type="button" class="round rmiss ${local.missOpen ? 'on' : ''}" data-a="missOpen" aria-label="Dein Geheimauftrag">🎯</button>` : ''}
      <button type="button" class="round rinfo" data-a="modal" data-v="rules:${isDuo(state) ? 'duo' : isBoerse(state) ? 'boerse' : isTurbo(state) ? 'turbo' : 'classic'}" aria-label="Regeln dieser Spielart">i</button>${missPop}
    </div>
    ${local.menu ? `<div class="menu">
      <div class="menu-row"><button type="button" class="pill pill-white pill-small" data-a="sound">🔊 Ton: ${ctx.soundName || (ctx.sound ? 'an' : 'aus')}</button>
      <button type="button" class="pill pill-white pill-small" data-a="vibe">Vibration: ${ctx.vibe !== false ? 'an' : 'aus'}</button></div>
      <button type="button" class="pill pill-white pill-small" data-a="intros">⚔️ Duell-Intros: ${ctx.introsOff ? 'aus' : 'an'}</button>
      <div class="menu-row"><button type="button" class="pill pill-white pill-small" data-a="modal" data-v="mystats">📊 Statistik</button>
      <button type="button" class="pill pill-white pill-small" data-a="modal" data-v="stats">🏆 Bestenliste</button></div>
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
  const standingsHtml = false && local.standings && state.settings?.standings && state.phase !== 'ended' ? // v0.71 (Alp): kein Zwischenstand mehr – wer führt, muss man sich merken
    (() => {
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
  // v0.85 (Alp): Sets eines Mitspielers antippen → Fenster mit allen seinen Tieren (Anzahl, Wert, fertige Quartette, Spezialkarten)
  H.setsOf = (id) => { local.setsOf = local.setsOf === id ? null : id; local.menu = false; local.reactTo = null; ctx.rerender(); };
  // v0.86 (Alp): Schnell-Emojis rechts – nur wenn es drauf ankommt (Versteigerung, Kuhhandel, Spezialkarte, Ratte, Bezahlen, Aufteilen)
  const QUICK = ctx.quickEmoji || [];
  const quickOn = QUICK.length > 0 && !!ctx.react && v.players.some((p) => p.id === meId) && ['auction', 'trade', 'special', 'rat', 'payment', 'divide'].includes(state.phase) && !local.reactTo;
  const quickHtml = quickOn ? `<div class="qemo" role="group" aria-label="Schnell-Reaktion an alle">${QUICK.map((e, i) => `<button type="button" class="qe" data-a="qemo" data-v="${i}" aria-label="${e} an alle">${e}</button>`).join('')}</div>` : '';
  H.qemo = (i) => { const e = QUICK[Number(i)]; if (e) ctx.react(e, null); };
  // v0.90 (Alp): 20 s keine Aktion → „Schnick-Schnack-Schnuck?“ gegen einen Mitspieler (nur Spaß, ändert nichts am Spiel)
  const RPS_IC = { stein: '✊', schere: '✌️', papier: '✋' };
  const rpsHtml = (() => {
    if (!ctx.rps || state.phase === 'ended' || !v.players.some((p) => p.id === meId)) return '';
    const busyUi = local.tradeOpen || local.reactTo || local.menu || state.phase === 'trade' || state.phase === 'payment';
    const ik = `${state.phase}|${logNo(state)}|${state.turn}|${state.auction?.high?.amount ?? ''}`;
    if (local.idleKey !== ik) { local.idleKey = ik; local.idleAt = Date.now(); }
    const idle = Date.now() - local.idleAt >= 20000;
    if (!idle) wakeLocal(local.idleAt + 20010);
    const r = ctx.rps();
    if (r && r.done && Date.now() - r.doneAt > 4200) { ctx.rpsClose(); return ''; }
    if (r && !r.done && Date.now() - r.at > 25000) { ctx.rpsClose(); return ''; }
    if (r) {
      if (r.done) wakeLocal(r.doneAt + 4250); else wakeLocal(r.at + 25050);
      const nm = (id) => (id === meId ? 'Du' : esc(nameOf(id)));
      const inIt = r.from === meId || r.to === meId;
      if (r.done) {
        const a = r.picks[r.from], b = r.picks[r.to];
        const txt = r.declined ? `${nm(r.to)} ${r.to === meId ? 'willst' : 'will'} gerade nicht` : r.winner == null ? `${RPS_IC[a]} Unentschieden ${RPS_IC[b]}` : `${RPS_IC[r.picks[r.winner]]} ${nm(r.winner)} ${r.winner === meId ? 'gewinnst' : 'gewinnt'} gegen ${nm(r.winner === r.from ? r.to : r.from)} ${RPS_IC[r.picks[r.winner === r.from ? r.to : r.from]]}`;
        return `<div class="rpsbox done ${r.winner === meId ? 'win' : inIt && r.winner ? 'lose' : ''}" role="status">${txt}</div>`;
      }
      if (!inIt) return `<div class="rpsbox mini" role="status">✊✋✌️ ${nm(r.from)} gegen ${nm(r.to)} …</div>`;
      if (r.picks[meId]) return `<div class="rpsbox mini" role="status">${RPS_IC[r.picks[meId]]} gewählt – warte auf ${nm(r.from === meId ? r.to : r.from)} …</div>`;
      return `<div class="rpsbox" role="dialog" aria-label="Schnick-Schnack-Schnuck"><b>${r.from === meId ? `Schnick-Schnack-Schnuck gegen ${nm(r.to)}` : `${nm(r.from)} fordert dich heraus!`}</b>
        <div class="rpsch">${Object.entries(RPS_IC).map(([k, ic]) => `<button type="button" data-a="rpsPick" data-v="${k}" aria-label="${k}">${ic}</button>`).join('')}</div>
        ${r.to === meId ? '<button type="button" class="rpsno" data-a="rpsNo">Keine Lust</button>' : ''}</div>`;
    }
    if (!idle || busyUi) return '';
    if (local.rpsOpen) return `<div class="rpsbox" role="dialog" aria-label="Gegen wen?"><b>Gegen wen? ✊✋✌️</b><div class="rpswho">${v.players.filter((p) => p.id !== meId).map((p) => `<button type="button" data-a="rpsAsk" data-v="${esc(p.id)}">${avatar(p, idxOf(p.id))}<span>${esc(p.name)}</span></button>`).join('')}</div><button type="button" class="rpsno" data-a="rpsOpen">Abbrechen</button></div>`;
    return `<button type="button" class="rpsgo" data-a="rpsOpen" aria-label="Schnick-Schnack-Schnuck spielen">✊✋✌️ <span>Langweilig? Schnick-Schnack-Schnuck!</span></button>`;
  })();
  H.rpsOpen = () => { local.rpsOpen = !local.rpsOpen; ctx.rerender(); };
  H.rpsAsk = (id) => { local.rpsOpen = false; ctx.rpsAsk(id); };
  H.rpsPick = (k) => ctx.rpsPick(k);
  H.rpsNo = () => ctx.rpsNo();
  const setsPop = (() => {
    const pid = local.setsOf; const i = pid ? idxOf(pid) : -1; const p = i >= 0 ? v.players[i] : null;
    if (!p) return '';
    const ids = [...animalsOf(state).map((a) => a.id), RAT].filter((id) => (p.animals[id] || 0) > 0);
    const specials = specialsOf(p);
    const done = ids.filter((id) => id !== RAT && p.animals[id] === 4).length;
    const cnt = Array.isArray(p.money) ? p.money.length : p.money;
    return `<div class="setspop" data-a="setsOf" data-v="${esc(pid)}" role="dialog" aria-label="Sets von ${esc(p.name)}">
      <div class="spbox" style="--c:${SEAT_COLORS[i]}">
        <div class="sphd">${avatar(p, i)}<b>${esc(p.name)}</b><span>${done ? `${done} Quartett${done > 1 ? 'e' : ''} · ` : ''}${ids.filter((x) => x !== RAT).reduce((a, x) => a + p.animals[x], 0)} Tiere · ${cnt} Geldkarten</span><i class="spx" aria-hidden="true">✕</i></div>
        <div class="spgrid">${ids.length ? ids.map((id) => `<div class="spc ${p.animals[id] === 4 && id !== RAT ? 'done' : ''}">${miniCard(id, 'big')}<b>${p.animals[id]}×</b>${id !== RAT ? `<small>${valHtml(id)}</small>` : '<small>Ratte</small>'}${specials.includes(id) ? `<em>${STAR} Spezial</em>` : ''}</div>`).join('') : '<p class="spnone">Noch keine Tiere</p>'}</div>
        ${specials.filter((x) => !ids.includes(x)).length ? `<p class="spspec">${STAR} Spezialkarten: ${specials.filter((x) => !ids.includes(x)).map((x) => esc(aname(x))).join(', ')}</p>` : ''}
        <small class="sthint">Antippen schließt</small>
      </div></div>`;
  })();
  H.nudge = (id) => ctx.nudge && ctx.nudge(id);
  H.takeover = (id) => ctx.takeover && ctx.takeover(id);
  H.selfPlay = () => ctx.selfPlay && ctx.selfPlay(meId);
  H.reactClose = () => { local.reactTo = null; ctx.rerender(); };
  H.punch = (id) => { local.reactTo = null; if (ctx.punch) ctx.punch(id); ctx.rerender(); };
  H.scene = (val) => { const [kind, to] = String(val).split('|'); local.reactTo = null; if (ctx.scene) ctx.scene(kind, to || null); ctx.rerender(); };
  H.react = (i) => { const to = local.reactTo; local.reactTo = null; ctx.react(ctx.reactionList[Number(i)], to === meId ? null : to); };
  H.exit = () => ctx.onExit();
  H.sound = () => ctx.toggleSound();
  H.vibe = () => ctx.toggleVibe && ctx.toggleVibe();
  H.intros = () => ctx.toggleIntros && ctx.toggleIntros();
  H.push = () => ctx.togglePush && ctx.togglePush();
  H.modal = (kind) => ctx.openModal(kind);
  H.auction = () => (showBusy() || calmLeft) ? undefined : ctx.act((s) => (isDuo(s) ? divideLook(s, meId, ctx.now()) : drawForAuction(s, meId, ctx.now())));
  H.duoPass = () => ctx.act((s) => duoPass(s, meId));
  H.tradeOpen = () => { if (showBusy() || calmLeft) return; local.tradeOpen = true; local.tradePicked = false; local.sel = []; local.tradeTarget = null; local.tradeAnimal = null; ctx.rerender(); };
  H.tradeWith = (val) => { const [pid, animal] = String(val).split('|'); local.tradeOpen = true; local.tradePicked = true; local.sel = []; local.tradeTarget = pid; local.tradeAnimal = animal; ctx.rerender(); };

  // ----- Überlagerung je nach Phase -----
  let overlay = '';


  // Bezahlen läuft jetzt auf dem Tisch (siehe oben)

  // Kuhhandel und sein Ergebnis laufen jetzt auf dem Tisch (siehe oben)

  // Blockieren läuft jetzt auf dem Tisch (siehe oben)

  const iconsOf = (r) => `${r.mission && r.mission.done ? '<span class="ci mi" title="Geheimauftrag erfüllt">🎯</span>' : ''}${r.quartets.map((id) => `<span class="ci" style="--a:${ANIMAL_COLORS[id]}" title="${aname(id)}">${art(id)}</span>`).join('')}${r.blocked ? `<span class="ci blocked" style="--a:${ANIMAL_COLORS[r.blocked]}" title="${aname(r.blocked)} – blockiert">${art(r.blocked)}</span>` : ''}${(r.specials || []).map((id) => `<span class="ci sp" style="--a:${ANIMAL_COLORS[id]}" title="${aname(id)}-Spezialkarte">${art(id)}${STAR}</span>`).join('')}${r.rats ? `<span class="ci" style="--a:${ANIMAL_COLORS[RAT]}" title="${r.rats}× Ratte">${art(RAT)}</span>` : ''}${r.money ? `<span class="cimoney" title="übriges Geld zählt mit">+${r.money}</span>` : ''}`;
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
    const lastWait = v.lastEvent && EV_WAIT[v.lastEvent.type] ? evWait(v.lastEvent.type, v.deck, v.lastEvent) + 1200 : 700; // v0.89: schneller zur Abrechnung
    local.tallyAt = ctx.demoPodium ? Date.now() - 600000 : Date.now() + (fresh ? Math.max(lastWait, kingExtra) : 0); local.tallySkip = false; local.podiumShown = false;
  }
  const tallyTotal = TALLY_START + v.players.length * TALLY_STEP + 900;
  // v0.85 (Alp): Vor der Abrechnung werden die Highlights der Partie angeteasert (Kuhhandel-König, teuerster Kauf …) – erst danach erfährt man den Sieger
  const AW_ORDER = ['trade', 'buy', 'rat', 'special', 'bluff', 'pech', 'geiz', 'money', 'ratcards', 'tip', 'rich', 'poor'];
  const awList = state.phase === 'ended' ? reportList().filter((a) => a.who).sort((a, b) => (AW_ORDER.indexOf(a.key) + 99) % 99 - (AW_ORDER.indexOf(b.key) + 99) % 99).slice(0, 4) : [];
  const AW_INTRO = 1300; const AW_STEP = Math.round(2600 * INFO_F);
  const awMs = ctx.demoPodium || !awList.length ? 0 : AW_INTRO + awList.length * AW_STEP + 600;
  const endEl = local.tallyAt ? Date.now() - local.tallyAt : Infinity;
  const tallyEl = endEl - awMs;
  const endWait = state.phase === 'ended' && endEl < 0; // letzter Zug (und Rattenkönig-Show) läuft noch
  if (endWait) wakeLocal(local.tallyAt + 10);
  const awardsOn = state.phase === 'ended' && !endWait && !local.recap && endEl < awMs;
  if (awardsOn) { wakeLocal(local.tallyAt + awMs + 20); if (!local.awSound) { local.awSound = true; sounds.push('drum'); awList.forEach((a, k) => later.push(['bell', AW_INTRO + k * AW_STEP + 150 - endEl])); } }
  const tallyOn = state.phase === 'ended' && !endWait && !awardsOn && !local.recap && tallyEl < tallyTotal;
  if (tallyOn) wakeLocal(local.tallyAt + awMs + tallyTotal + 20);
  // v0.63 Finale „Und der Sieger ist …“ (Trommelwirbel, dann Rampenlicht) – zwischen Abrechnung und Treppchen
  const FINALE_MS = 3200;
  const finaleOn = state.phase === 'ended' && !endWait && !awardsOn && !local.recap && !tallyOn && tallyEl < tallyTotal + FINALE_MS && !ctx.demoPodium;
  if (finaleOn) wakeLocal(local.tallyAt + awMs + tallyTotal + FINALE_MS + 20);
  if (finaleOn && !local.finaleSound) { local.finaleSound = true; sounds.push('drum'); later.push(['fanfare', 1700]); }
  const podiumIn = state.phase === 'ended' && !endWait && !awardsOn && !tallyOn && !finaleOn && !local.recap && !local.podiumShown;
  if (podiumIn) { local.podiumShown = true; local.podAt = Date.now(); }
  if (state.phase === 'ended' && local.recap) {
    const list = reportList();
    const copied = local.shared && Date.now() - local.shared < 3000;
    if (copied) wakeLocal(local.shared + 3050);
    overlay = `<div class="overlay endtable"><div class="ending recap">
      <h2>📈 Börsenbericht</h2>
      <ul>${list.map((a) => { const i = idxOf(a.who); return `<li><span class="atitle"><i>${ICON[a.key] || '•'}</i>${esc(a.title)}</span>${i >= 0 ? avatar(v.players[i], i) : ''}<span class="awho">${esc(a.who === meId ? 'Du' : a.name)}</span><span class="atext">${esc(a.text)}</span></li>`; }).join('') || '<li>Keine besonderen Momente – ein ruhiges Spiel.</li>'}</ul>
      <div class="endbtns"><button type="button" class="pill pill-white" data-a="shareReport">${copied ? 'Kopiert ✓' : '📤 Teilen'}</button><button type="button" class="pill pill-red" data-a="recap">Zurück zur Wertung</button></div>
    </div></div>`;
  } else if (state.phase === 'ended' && awardsOn) {
    overlay = `<div class="overlay endtable"><div class="ending awards" style="--el:${endEl}ms">
      <h2>🏅 Die Highlights der Partie</h2><small class="awsub">… bevor wir den Sieger erfahren</small>
      <div class="awcards">${awList.map((a, k) => { const i = idxOf(a.who); return `<div class="awcard" style="--d:${AW_INTRO + k * AW_STEP - endEl}ms;--c:${i >= 0 ? SEAT_COLORS[i] : '#888'}">
        <i class="awicon">${ICON[a.key] || '🏅'}</i><b class="awtitle">${esc(a.title)}</b>${i >= 0 ? `<div class="awfig">${avatar(v.players[i], i)}</div>` : ''}<span class="awname">${esc(a.who === meId ? 'Du' : a.name)}</span><small>${esc(a.text)}</small></div>`; }).join('')}</div>
    </div></div>`;
  } else if (state.phase === 'ended' && tallyOn) {
    // Abrechnung: Punkte werden einzeln hochgezählt – vom letzten Platz bis zum Sieger, dann das Siegertreppchen
    const s = scores(state).sort((a, b) => b.score - a.score);
    const ranked = s.map((r) => ({ ...r, place: s.findIndex((x) => x.score === r.score) + 1 }));
    const n = ranked.length;
    const cnt = typeof CSS !== 'undefined' && CSS.registerProperty ? 'cnt' : '';
    overlay = `<div class="overlay endtable"><div class="ending tally ${cnt}">
      <h2>🧮 Abrechnung</h2>
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
    const s = scores(state).sort((a, b) => b.score - a.score || (a.team ?? 0) - (b.team ?? 0));
    // Platz nach Punkten (gleiche Punkte = gleicher Platz); v0.83 Teams: Platz des Teams (1 oder 2), Partner nebeneinander
    const teamsOn = isTeams(state);
    const ranked = s.map((r) => ({ ...r, place: teamsOn ? (r.score === s[0].score ? 1 : 2) : s.findIndex((x) => x.score === r.score) + 1 }));
    const top = teamsOn ? ranked : ranked.slice(0, 3);
    const order = teamsOn ? [ranked[2], ranked[0], ranked[1], ranked[3]] : top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
    const rest = teamsOn ? [] : ranked.slice(3);
    const winIdx = idxOf(s[0].id);
    // v0.71: Verlierer-Pose – wer allein ganz hinten liegt, lässt den Kopf hängen, über ihm regnet es
    const worst = Math.max(...ranked.map((x) => x.place));
    const lastPlace = (r) => worst > 1 && r.place === worst && ranked.filter((x) => x.place === worst).length === 1;
    // v0.87 (Alp): Podest wächst – Höhe nach Punkten, der Letzte zuerst, der Sieger zuletzt
    const maxScore = Math.max(1, ...ranked.map((x) => x.score));
    const growOrder = [...order].sort((a, b) => a.score - b.score);
    const step = (r) => {
      const i = idxOf(r.id);
      const sh = Math.max(0.12, Math.min(1, r.score / maxScore)).toFixed(3);
      return `<button type="button" class="pod p${Math.min(r.place, 3)} ${local.scoreOpen === r.id ? 'open' : ''}" data-a="scoreOpen" data-v="${esc(r.id)}" style="--c:${SEAT_COLORS[i]};--sh:${sh};--gd:${growOrder.indexOf(r) * 550}ms">
        ${r.place === 1 ? '<span class="crown">👑</span>' : ''}${lastPlace(r) ? '<span class="raincloud" aria-hidden="true">🌧️</span>' : ''}${kingHat(r.id) ? `<span class="podhat">${figure(v.players[i], i, `hop${r.place === 1 ? ' win' : lastPlace(r) ? ' lose' : ''}`)}${kingHat(r.id)}</span>` : figure(v.players[i], i, `hop${r.place === 1 ? ' win' : lastPlace(r) ? ' lose' : ''}`)}
        <span class="pname2">${esc(r.id === meId ? 'Du' : r.name)}</span>
        <span class="pblock"><b>${r.score}</b><span class="picons">${iconsOf(r)}</span><i>${r.place}.</i></span><span class="pplinth" aria-hidden="true"></span>
        ${r.place === 1 && ctx.rewards && !ctx.myRewards ? '<span class="pdub">+10 <i class="dub" aria-label="Dublonen"></i></span>' : ''}</button>`;
    };
    // Rechnung steht immer da: erst die des Gewinners, Antippen zeigt die eines anderen
    const openRow = ranked.find((r) => r.id === local.scoreOpen) || ranked[0];
    const cols = ['#FFD34E', '#D7263D', '#1D5FC2', '#B8285F', '#6D3FC0', '#7FA88A', '#fff'];
    const confetti = podiumIn ? `<div class="confetti" aria-hidden="true">${Array.from({ length: 40 }, (_, k) =>
      `<i style="left:${(k * 37) % 100}%;background:${cols[k % cols.length]};animation-delay:${(k % 10) * 90}ms;animation-duration:${1600 + (k % 7) * 180}ms;transform:rotate(${k * 29}deg)"></i>`).join('')}</div>` : '';
    overlay = `<div class="overlay endtable ${podiumIn ? 'enter' : ''}">${confetti}<div class="ending podium">
      <h2 style="--c:${SEAT_COLORS[winIdx]}">${teamsOn ? (v.winner?.includes(meId) ? 'Euer Team hat gewonnen!' : `Team ${esc(s[0].teamName)} gewinnt!`) : v.winner?.includes(meId) ? 'Du hast gewonnen!' : `${esc(s[0].name)} gewinnt!`}</h2>
      ${state.settings?.stake ? (() => { const pot = state.settings.stake * v.players.length; const w = (v.winner || []).length || 1; const share = pot / w; const nm = (v.winner || []).map((id) => (id === meId ? 'Du' : v.players[idxOf(id)]?.name)).join(' & '); return `<div class="podstake">💶 ${esc(nm)} ${w > 1 ? `bekommen je ${String(Math.round(share * 100) / 100).replace('.', ',')} €` : (v.winner || []).includes(meId) ? `bekommst ${pot} €` : `bekommt ${pot} €`} <small>(Topf ${pot} €, steht in der Kasse)</small></div>`; })() : ''}
      <div class="pods grow ${teamsOn ? 'teams' : ''}" ${local.podAt ? `data-fxat="${local.podAt}"` : ''}>${order.map(step).join('')}</div>
      ${rest.length ? `<div class="prest">${rest.map((r) => { const i = idxOf(r.id); return `<button type="button" class="prow4 ${local.scoreOpen === r.id ? 'open' : ''}" data-a="scoreOpen" data-v="${esc(r.id)}"><i>${r.place}.</i>${avatar(v.players[i], i)}<span>${esc(r.id === meId ? 'Du' : r.name)}${lastPlace(r) ? ' 🌧️' : ''}</span><span class="picons">${iconsOf(r)}</span><b>${r.score}</b></button>`; }).join('')}</div>` : ''}
      ${ctx.rewards && ctx.myRewards ? (() => {
        // v0.55: was du in dieser Partie verdient hast (vom Server berechnet)
        const lbl = { partie: 'Mitgespielt', quartett: 'Quartette', sieg: 'Sieg' };
        const tot = ctx.myRewards.reduce((t, x) => t + x.amount, 0);
        return ctx.myRewards.length ? `<div class="pdubs">${ctx.myRewards.map((x) => `<span>+${x.amount} ${lbl[x.kind] || ''}</span>`).join('')}<b>= +${tot} <i class="dub" aria-label="Dublonen"></i></b></div>`
          : '<div class="pdubs none" title="Zählt erst ab 3 Spielern, 6 Minuten und 25 Zügen; höchstens 60 am Tag">Keine Dublonen<small>Partie zu kurz/klein oder Tageslimit</small></div>';
      })() : ''}
      <div class="sform2">${openRow ? `${esc(teamsOn ? openRow.teamName : openRow.id === meId ? 'Du' : openRow.name)}: ${scoreFormula(teamsOn ? teamPool(state, openRow.team) : state.players[idxOf(openRow.id)], openRow.blocked, !!state.settings?.moneyCounts, openRow.mission)}${teamsOn ? ' (Team)' : ''}${openRow.blocked ? ` · ${esc(aname(openRow.blocked))} blockiert` : ''}${openRow.mission ? `<span class="sfmiss">🎯 ${esc(openRow.mission.text)} – ${openRow.mission.done ? `erfüllt, +${openRow.mission.bonus}` : `nicht geschafft${openRow.mission.need <= 4 ? ` (${openRow.mission.got}/${openRow.mission.need})` : ''}`}</span>` : ''}` : ''}</div>
      <div class="endbtns">
        <button type="button" class="pill pill-white" data-a="recap">📈 Börsenbericht</button>
        <button type="button" class="pill pill-red ${ctx.rematchId ? 'pulse' : ''}" data-a="rematch">${ctx.rematchId ? 'Revanche läuft – mitmachen' : 'Revanche'}</button>
        <button type="button" class="pill pill-white" data-a="exit">Zur Startseite</button>
      </div>
    </div></div>`;
  }

  H.rematch = () => ctx.onRematch();
  H.recap = () => { local.recap = !local.recap; ctx.rerender(); };
  H.missOpen = () => { local.missOpen = !local.missOpen; local.missAuto = 0; ctx.rerender(); };
  H.tallySkip = () => { local.tallySkip = true; ctx.rerender(); };
  H.scoreOpen = (id) => { local.scoreOpen = local.scoreOpen === id ? null : id; ctx.rerender(); };

  // ----- Effekte: Tier fliegt zum neuen Besitzer, Konfetti am Ende, Quartett-Moment -----
  let effects = '';
  // Einmal-Effekte merken (Startzeit), damit sie beim nächsten Neuzeichnen an der richtigen Stelle weiterlaufen
  local.fx = (local.fx || []).filter((f) => f.until > Date.now());
  const keepFx = (html, dur, tag = null) => { if (html) local.fx.push({ html, at: Date.now(), until: Date.now() + dur, tag }); if (local.fx.length > 14) local.fx.splice(0, local.fx.length - 14); };
  if (local.waitQ) { keepFx(local.waitQ, WAITPOP_MS, 'waitpop'); local.waitQ = null; }
  if (local.kingQ) { keepFx(local.kingQ.html, local.kingQ.dur, 'qshow'); local.kingQ = null; }
  if (local.missAuto && local.missOpen) wakeLocal(local.missAuto + 20); // v0.82 Geheimauftrag schließt sich am Anfang von selbst
  if (local.blindQ) { keepFx(local.blindQ, Math.round(2600 * INFO_F), 'blindrev'); local.blindQ = null; } // v0.79 „Warte, warte, warte!“
  const le = v.lastEvent;
  // Ergebnis-Fenster (ein Design für alles): Versteigerung, Spezialkarte, Kuhhandel.
  // Karte und Geld fliegen erst los, wenn das Fenster zugeht (Zeit um oder Antippen).
  const EV_DUR = EV_WAIT;
  const receiverOf = (e) => (e.type === 'rat_taken' ? e.player : e.type === 'trade' ? (e.animal === RAT ? (e.winner === e.challenger ? e.target : e.challenger) : e.winner) : e.buyer);
  const evSig = le && EV_DUR[le.type] ? `${le.type}|${le.n}` : null;
  let evNew = false;
  if (evSig && local.resSig !== evSig) { local.resSig = evSig; evNew = !!(evFresh || ctx.demoPop); }
  // v0.75 (Alp): schneller Kuhhandel – laufen die Einsätze noch in die Mitte, verschwinden sie jetzt dort (kein Hin und Her);
  // aus der Mitte laufen danach alle zum Gewinner
  // (v0.76: die Einsätze laufen fertig in die Mitte; das Ergebnis wartet so lange – siehe TRADE_PRE)
  const evDelay = evNew ? evWait(le.type, v.deck, le) : 0;
  const quartets = [];
  v.players.forEach((p) => Object.entries(p.animals).forEach(([id, n]) => { if (n === 4) quartets.push(`${p.id}|${id}`); }));
  if (local.prevQuartets) {
    const added = quartets.filter((q) => !local.prevQuartets.includes(q));
    const [qp, qa] = added.length ? added[0].split('|') : [];
    if (added.length) { local.qSound = true; if (qp === meId) local.qMine = true; }
    if (added.length && evNew && receiverOf(le) === qp && le.animal === qa) local.qBadge = `${evSig}`; // Quartett steht als Abzeichen im Ergebnis-Fenster
    // v0.77 (Alp): erst wenn die Tiere angekommen sind (Lauf startet evDelay − WALK_OVERLAP und dauert FLY_MS)
    // v0.77 (Alp): Quartett-Show für alle – nach Tier und Geld (Ende des Ablaufs), danach geht es weiter
    const qd = evNew ? choreo(le, v.deck).end + 200 : le && le.type === 'divided' ? 250 + 450 + FLY_MS + 200 : 500;
    if (added.length && qa !== RAT) { local.poloNext = { pid: qp, animal: qa, delay: qd }; if (qp) moodMark(qp, 'love', Date.now() + qd + qMs(), 2600); }
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
  // v0.70 (Alp): Wer ein Tier bekommt, zu dem LÄUFT das ganze Tier aus der Mitte – bis auf seinen Stapel – und wird dort zur Karte.
  // Kuhhandel: beide Einsätze laufen gemeinsam aus der Mitte zum Gewinner. Startet, wenn das Ergebnis-Fenster zugeht (evDelay).
  if (evFresh && (state.phase === 'turn' || state.phase === 'ended') && le && (le.type === 'auction_won' || le.type === 'trade' || le.type === 'special_won' || le.type === 'rat_taken')) {
    const to = le.type === 'trade' ? receiverOf(le) : le.type === 'rat_taken' ? le.player : le.buyer;
    const an = le.type === 'rat_taken' ? RAT : le.animal;
    const wd = Math.max(0, evDelay - WALK_OVERLAP); // v0.72: los, sobald das Fenster ausblendet
    if (idxOf(to) >= 0) {
      const walkers = le.type === 'trade' ? [0, 1].map((k) => homeWalk(an, '@card', `@stall:${to}:${an}`, wd + k * 220, { count: le.count || 1, koffer: true })) : [homeWalk(an, '@card', `@stall:${to}:${an}`, wd, { star: le.type === 'special_won' })];
      keepFx(walkers.join(''), wd + FLY_MS + 400, evDelay ? 'ev' : null);
      later.push(['trade', wd + 100]);
      later.push(['flipcard', wd + WALK_MS]);
    }
  }
  // Der Zug wandert sichtbar im Uhrzeigersinn: ein goldener Schein gleitet vom alten zum neuen Platz
  const holder = shownHolder;
  local.holder = holder;
  if (local.turnHold) wakeLocal(local.turnHold.until + 30);

  // Geld fliegt (verdeckt) vom Platz des Zahlers zum Platz des Empfängers (Start und Ziel werden gemessen)
  const moneyFly = (from, to, count, delay = 0, vals = null) => {
    if (!count || (!from.startsWith('@') && idxOf(from) < 0) || (!to.startsWith('@') && idxOf(to) < 0)) return '';
    const n = Math.min(count, 15);
    // deine eigenen Scheine fliegen offen: beim Bezahlen kurz hochgeschoben aus dem Fächer, beim Bekommen in den Fächer hinein
    const mine = (from === meId || to === meId) && vals && vals.length >= n ? (from === meId ? 'out' : 'in') : '';
    const cash = (pid) => (pid.startsWith('@') ? pid : `@cash:${pid}`); // v0.70: von Geld zu Geld, nie zum Avatar
    from = cash(from); to = cash(to);
    return Array.from({ length: n }, (_, k) => { const dx = Math.round((k - (n - 1) / 2) * Math.min(30, 200 / n));
      return mine ? `<div class="mfly mine ${mine}" data-aim-from="${esc(from)}" data-aim-to="${esc(mine === 'in' ? `@fanslot:${vals[k]}` : to)}" ${mine === 'out' ? `data-aim-fdx="${dx}"` : ''} style="--m:${MONEY_COLORS[vals[k]]};animation-delay:${delay + k * MSTEP}ms">${vals[k]}</div>`
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
      const inner = pr?.shop ? shopAvatarFull(pr.shop, '', pr.outfit) : `<span class="cheerhead">${avatar(v.players[ri], ri)}</span>`;
      keepFx(`<div class="cheerfx ${rid === meId ? 'me' : ''} ${pr?.shop ? 'full' : ''}" data-aim-to="${esc(rid)}" data-aim-anchor="center" style="animation-delay:${ch.payAt - 150}ms" aria-hidden="true">${inner}<i class="cheerstar">🎉</i></div>`, ch.payAt + 1700, tg);
    }
  }
  // v0.52.1: Rattenrunde – wer eine Karte legt, dessen Schein fliegt verdeckt in den Topf in der Mitte
  if (state.phase === 'rat' && local.ratLaid && !entered) {
    Object.entries(v.rat.laid).forEach(([pid, c]) => { const d = c - (local.ratLaid[pid] || 0);
      if (d > 0 && idxOf(pid) >= 0) keepFx(Array.from({ length: Math.min(d, 3) }, (_, k) => `<div class="mfly topot" data-aim-from="@cash:${esc(pid)}" data-aim-to="@pot" style="animation-delay:${k * MSTEP}ms"></div>`).join(''), 1000 + 3 * MSTEP); });
  }
  if (state.phase === 'rat') local.ratLaid = { ...v.rat.laid }; else if (state.phase !== 'turn') local.ratLaid = null;

  // Geräusche zu den Ereignissen
  if (entered && (state.phase === 'rat' || state.phase === 'special')) sounds.push('flip');
  // Ratte aufgedeckt: Quieken, eine kleine Ratte huscht über den Tisch
  if (entered && state.phase === 'rat') later.push(['quiek', 500]); // v0.78 (Alp): kein Rattenrudel mehr – nur die eine Ratte aus der Karte knabbert reihum am Geld
  if (fresh && state.phase === 'rat' && !entered) sounds.push('bid');
  // Geldschein aus dem Stapel: Karte groß für alle zeigen, dann fliegt sie zum Spieler
  const lem = v.lastEvent;
  const moneySig = lem?.type === 'money_drawn' ? `${lem.n}|${lem.player}|${lem.value}` : null;
  if (moneySig && evFresh && local.moneySig !== moneySig) {
    local.moneySig = moneySig;
    keepFx(`<div class="moneyreveal" data-aim-to="@cash:${esc(lem.player)}" data-aim-anchor="center" style="--ty:0px;--tx:0px">
      <div class="money big" style="--m:${MONEY_COLORS[lem.value] || '#eee'}">${mIn(lem.value)}${lem.value >= 100 ? glitz(lem.value >= 500 ? 14 : lem.value >= 200 ? 10 : 6, lem.value >= 500 ? 'gold' : '') : ''}</div>
      <span class="mrlabel">${esc(lem.player === meId ? 'Du' : nameOf(lem.player))} ${lem.player === meId ? 'ziehst' : 'zieht'} <b>${lem.value}</b></span></div>`, 2700);
  }
  // Börsen-News aufgedeckt: große Karte in der Mitte (3,4 s), mit deinem persönlichen Teil (Steuer/Marktpanik)
  const newsSig = lem?.type === 'news' ? `${lem.n}|${lem.kind}` : null;
  if (newsSig && evFresh && local.newsSig !== newsSig) {
    local.newsSig = newsSig;
    keepFx(newsReveal(lem, meId, nameOf), newsMs());
    sounds.push('flip'); later.push([lem.kind === 'crash' || lem.kind === 'blase' || lem.kind === 'steuer' ? 'boo' : lem.kind === 'hektik' ? 'tick' : 'coins', 600]);
    // v0.69 Kurssprung: alle Karten dieses Tiers (Auslagen, Mitspieler, Kurszettel) blinken ▲/▼, Börsenglocke
    if (KURS_UP[lem.kind] != null && lem.from !== lem.to) { local.kursFx = { animal: lem.animal, up: KURS_UP[lem.kind], at: Date.now() + newsMs() }; later.push(['bell', newsMs()]); }
    // v0.72 (Alp): jede Geldbewegung sichtbar – nach der News-Karte fliegen die Scheine
    //   Dividende: aus der Mitte (Bank) zu jedem Geld · Steuerprüfung: von jedem Geld in die Mitte · Marktpanik: verdeckt zum linken Nachbarn
    const NF = newsMs() + 50; const ids = v.players.map((p) => p.id);
    const mine = (pid, val) => (pid === meId && val != null ? val : null);
    let nfx = '';
    if (lem.kind === 'dividende') nfx = ids.map((pid, k) => moneyFly('@card', pid, 1, NF + k * 140, pid === meId ? [lem.amount ?? DIVIDENDE] : null)).join('');
    else if (lem.kind === 'steuer') nfx = (lem.payers || Object.keys(lem.lost || {})).map((pid, k) => moneyFly(pid, '@card', 1, NF + k * 140, mine(pid, lem.lost?.[pid]) != null ? [lem.lost[pid]] : null)).join('');
    else if (lem.kind === 'panik') {
      const movers = lem.movers || [];
      nfx = movers.map((pid, k) => { const i = idxOf(pid); const to = ids[(i + 1) % ids.length];
        const vals = pid === meId && lem.moved?.gave != null ? [lem.moved.gave] : to === meId && lem.moved?.got != null ? [lem.moved.got] : null;
        return moneyFly(pid, to, 1, NF + k * 120, vals); }).join('');
    }
    if (nfx) { keepFx(nfx, NF + ids.length * 140 + MFLY_MS + 200); later.push(['coins', NF + 200]); }
    // v0.75: dein Schein verschwindet erst aus dem Fächer, wenn er losfliegt – und erscheint erst, wenn er gelandet ist
    { const t0 = Date.now(); const k = Math.max(0, ids.indexOf(meId));
      const gain = lem.kind === 'dividende' ? [lem.amount ?? DIVIDENDE] : lem.kind === 'panik' && lem.moved?.got != null ? [lem.moved.got] : [];
      const lose = lem.kind === 'steuer' && lem.lost?.[meId] != null ? [lem.lost[meId]] : lem.kind === 'panik' && lem.moved?.gave != null ? [lem.moved.gave] : [];
      const mi = Math.max(0, (lem.movers || []).indexOf(meId)); const gi = lem.kind === 'panik' ? Math.max(0, (lem.movers || []).indexOf(lem.moved?.from)) : k;
      if (gain.length || lose.length) local.handFx = { gain, lose, gainAt: t0 + NF + gi * (lem.kind === 'panik' ? 120 : 140) + MFLY_MS - 20, loseAt: t0 + NF + (lem.kind === 'panik' ? mi * 120 : k * 140) }; }
  }
  // v0.77 Zu zweit: aufgeteilt – beide Karten laufen/fliegen aus der Mitte zu ihrem Platz (Tier zum Stapel, Geld ins Geld)
  if (evFresh && le && le.type === 'divided') {
    const parts = [le.first, le.second].filter(Boolean);
    // v0.85 (Alp): zu zweit sieht jeder, wer was bekommen hat – auch welchen Geldschein
    const got = (x) => (String(x.card).startsWith('geld-') ? `💰 ${x.card === 'geld-?' ? '?' : moneyValue(x.card)}` : isSpecialCard(x.card) ? `⭐ ${aname(specialAnimal(x.card))}` : aname(x.card));
    let fx = `<div class="divstrip" aria-live="polite"><b>${esc(nameOf(le.by))} ${le.by === meId ? (le.keep ? 'behältst' : 'gibst ab') : le.keep ? 'behält' : 'gibt ab'}${le.auto ? ' (Zeit um)' : ''}</b>${parts.map((x) => `<span class="dgot" style="--c:${SEAT_COLORS[idxOf(x.to)]}">${esc(nameOf(x.to))}: <em>${esc(got(x))}</em></span>`).join('')}${(le.esel || []).map((e) => `<span class="dgot esel">🫏 ${e.nr}. Esel – beide +${e.payout}</span>`).join('')}</div>`;
    parts.forEach((x, k) => {
      const d = 250 + k * 450;
      if (String(x.card).startsWith('geld-')) {
        const val = x.card === 'geld-?' ? null : moneyValue(x.card);
        fx += moneyFly('@card', x.to, 1, d + 300, x.to === meId && val != null ? [val] : null);
      } else {
        const an = isSpecialCard(x.card) ? specialAnimal(x.card) : x.card;
        fx += homeWalk(an, '@card', `@stall:${x.to}:${an}`, d, { star: isSpecialCard(x.card) });
      }
    });
    for (const e of le.esel || []) { const t = 250 + parts.length * 450 + 500; for (const p of v.players) fx += moneyFly('@card', p.id, 2, t); later.push(['iah', t - 200]); later.push(['coins', t + 600]); } // v0.85 Esel-Bonus zu zweit
    keepFx(fx, 250 + parts.length * 450 + FLY_MS + 400 + ((le.esel || []).length ? 1400 : 0));
    sounds.push('flip'); later.push(['trade', 300]);
  }
  if (entered && state.phase === 'divide') sounds.push('flip');
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
  // v0.64 Figuren-Theater: Szenen zwischen den Figuren (von irgendwem ausgelöst, bei allen gleich)
  const SCENE_SFX = {
    laugh: [['step', 150], ['haha', 1700], ['haha', 2600], ['step', 3800]],
    schleim: [['step', 150], ['heart', 1200], ['coins', 2700], ['heart', 3100], ['step', 3900]],
    verschwoerung: [['step', 150], ['puff', 1300], ['puff', 1900], ['nudge', 3050], ['step', 5200]],
    torte: [['step', 150], ['thud', 1300], ['haha', 1500], ['step', 2900]],
    baum: [['step', 120], ['flipcard', 1500], ['crumple', 2450], ['flipcard', 3500], ['lighter', 4500], ['puff', 5200], ['puff', 5900], ['puff', 6600], ['step', 7000]],
  };
  // v0.65 Neue Handkarte: beim ersten Mal (pro Gerät und Kartenart) kurz erklären
  { const leh = v.lastEvent;
    if (evFresh && leh && leh.type === 'hand' && leh.player === meId && leh.kind) {
      let seen = false; try { seen = localStorage.getItem(`kh_handtip_${leh.kind}`) === '1'; localStorage.setItem(`kh_handtip_${leh.kind}`, '1'); } catch { /* egal */ }
      if (!seen || DEMO_HANDTIP) keepFx(`<div class="handtip" role="status"><b>${leh.kind === 'pfaendung' ? '⚖️ Zwangsversteigerung' : '🛡️ Einspruch'}</b> ist jetzt auf deiner Hand (nur du siehst, welche Karte).<br>${leh.kind === 'pfaendung' ? 'Spiel sie später <u>statt</u> deines Zuges: Knopf „⚖️ Pfänden“ – ein Tier eines Mitspielers wird versteigert, er muss verkaufen.' : 'Will dich jemand pfänden, wehrt sie das automatisch ab.'}</div>`, 6500);
    }
  }
  // v0.65 Zwangsversteigerung / Einspruch: Auftritt des Gerichtsvollziehers (bei allen)
  { const lep = v.lastEvent;
    if (lep && (lep.type === 'pfaendung' || lep.type === 'einspruch') && local.pfSig !== `${lep.n}|${lep.type}`) {
      local.pfSig = `${lep.n}|${lep.type}`;
      if (evFresh && idxOf(lep.by) >= 0 && idxOf(lep.target) >= 0) {
        const r = sceneFx({ kind: lep.type === 'pfaendung' ? 'pfaend' : 'einspruch', from: lep.by, to: lep.target, at: Date.now(), seed: lep.n });
        if (r) keepFx(r.html, r.ms, 'scene');
        (lep.type === 'pfaendung' ? [['step', 100], ['gavel', 1120], ['thud', 1150], ['step', 2150]] : [['step', 100], ['buzz', 1050], ['boo', 1700], ['step', 2400]]).forEach((x) => later.push(x));
      }
    }
  }
  for (const s of ctx.scenes || []) {
    const sig = `${s.kind}|${s.from}|${s.to || ''}|${s.at}`;
    local.sceneSeen = local.sceneSeen || [];
    if (local.sceneSeen.includes(sig)) continue;
    local.sceneSeen.push(sig); if (local.sceneSeen.length > 20) local.sceneSeen.shift();
    if (Date.now() - s.at > 3000 || idxOf(s.from) < 0 || (s.to && idxOf(s.to) < 0) || (s.partner && idxOf(s.partner) < 0)) continue;
    const r = sceneFx(s);
    if (!r) continue;
    keepFx(r.html, r.ms, 'scene');
    (SCENE_SFX[s.kind] || []).forEach((x) => later.push(x));
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
    if (v.lastEvent?.type === 'donkey') { const sh = auction.opensAt != null ? Math.max(0, auction.opensAt - ctx.now()) : 0; later.push(['crumple', sh + ESEL_CLIMB_AT + 350]); v.players.forEach((_, pi) => later.push(['thud', sh + ESEL_THROW_AT + pi * ESEL_THROW_GAP + ESEL_FLIGHT - 20])); later.push(['coins', sh + ESEL_THROW_AT + v.players.length * ESEL_THROW_GAP + ESEL_FLIGHT]); }
    const VOICE = { kuh: 'muh', esel: 'iah', hahn: 'kikeriki' };
    if (auction.animal && aval(auction.animal) >= 650) { sounds.push('drum'); later.push(['glitz', 1050]); } // teure Karte: Trommelwirbel, nach dem Umdrehen Glitzern
    if (auction.animal && VOICE[auction.animal]) later.push([VOICE[auction.animal], 1350]);
  }
  else if (fresh && state.phase === 'auction' && auction.high) sounds.push('bid');
  // Überboten: du lagst vorne, jetzt jemand anderes
  if (state.phase === 'auction' && prev.phase === 'auction' && prev.highMe && auction.high && auction.high.player !== meId) {
    sounds.push('outbid'); feel('outbid');
    // v0.87 (Alp): größere Animation – roter Rand-Blitz und großes „ÜBERBOTEN!“ mit wer und wie viel (blockiert nichts)
    keepFx(`<div class="outbidfx" role="status" aria-live="assertive"><i class="obedge"></i><div class="obbox"><b>ÜBERBOTEN!</b><small>${esc(nameOf(auction.high.player))} bietet ${auction.high.amount}</small></div></div>`, 1500);
  }
  // v0.87 (Alp): nach „kann nicht zahlen“ gibt es nichts umsonst – Versteigerung beginnt von vorn
  if (evFresh && le && le.type === 'auction_restart' && state.phase === 'auction') {
    keepFx(`<div class="lastcard" role="status">🔁 Niemand bietet – ${esc(aname(le.animal))} gibt es nicht umsonst, nochmal von vorn!</div>`, 3200);
    sounds.push('bell');
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
    if (oc) keepFx(Array.from({ length: oc }, (_, k) => `<div class="mfly topot" data-aim-from="@cash:${esc(t.challenger)}" data-aim-to="@offer" style="animation-delay:${OFFER_FLY + k * MSTEP}ms"></div>`).join(''), OFFER_FLY + MFLY_MS + oc * MSTEP + 100);
  }
  // Große Auftritte – nur bei besonderen Ereignissen, höchstens einer pro Ergebnis (Rang: Gleichstand > Bluff > Geschenkt > Quartett)
  const boom = (title, sub, cls = '', delay = 0) => { keepFx(`<div class="khscrim" style="--d:${delay}ms" aria-hidden="true"></div><div class="khsplash boom ${cls}" style="--d:${delay}ms" aria-live="polite"><b>${title}</b><small>${sub}</small></div>`, delay + 1500); later.push(['wow', delay]); };
  const vb = (id, du, er) => (id === meId ? du : er);
  // Gewinnsumme eines Kuhhandels mit Tieren, wenn sie zwischen 10 und 50 liegt (lauter Nullen = Bluff, eigener Auftritt)
  const cheapWin = (e) => { if (!e || e.type !== 'trade' || e.animal === RAT) return 0; const c = e.accepted || e.winner === e.challenger ? e.offer : e.counter; if (!Array.isArray(c) || !c.length || c.some((m) => typeof m !== 'number')) return 0; const sum = c.reduce((x, y) => x + y, 0); return sum > 0 && sum <= 50 ? sum : 0; };
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
    // v0.86 (Alp): Kuhhandel für höchstens 50 gewonnen → „Sehr günstig!“ (nur die Beteiligten kennen die Beträge)
    else if (iAmIn && cheapWin(le)) boom('SEHR GÜNSTIG!', `${nmB(le.winner)} ${vb(le.winner, 'holst', 'holt')} ${thing} für nur ${cheapWin(le)}`, 'cheap', le.accepted ? 300 : afterFlip);
    else if (le.type === 'special_won' && !le.count) boom('GESCHENKT!', `Niemand buzzert – ${nmB(le.buyer)} ${vb(le.buyer, 'bekommst', 'bekommt')} die Spezialkarte umsonst`, 'gift', 0);
    else if (local.qBadge === evSig) { const qp = receiverOf(le); boom('QUARTETT!', `${nmB(qp)} ${vb(qp, 'hast', 'hat')} alle 4× ${esc(aname(le.animal))}`, 'quartet', le.type === 'trade' && !le.accepted ? afterFlip : 300); }
  }
  // Alle Ratten bei einem: er muss ein Quartett blockieren
  if (entered && state.phase === 'block' && v.block && !king) boom('RATTENKÖNIG!', `${nmB(v.block.player)} ${vb(v.block.player, 'hast', 'hat')} alle Ratten – ein Quartett zählt nicht`, 'rat', 0);
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
    const pre = tradePre(le);
    local.res = { ev: JSON.parse(JSON.stringify(le)), at: Date.now() + pre, dur: evWait(le.type, v.deck, le) - pre, quartet: local.qBadge === evSig };
    // „Tippen zum Schließen“: nur bei den ersten Ergebnis-Fenstern auf diesem Gerät
    let seen = 0; try { seen = Number(localStorage.getItem('kh_evseen')) || 0; localStorage.setItem('kh_evseen', String(seen + 1)); } catch { /* egal */ }
    local.res.hint = seen < 8;
  }
  // v0.69 (Alp): keine Spitzenreiter-Krone mehr – wer führt, muss man sich merken.

  // ---------- v0.63 Encounter-Intros ----------
  local.duels = local.duels || {}; local.duelWins = local.duelWins || {};
  const pairKey = (a, b2) => [a, b2].sort().join('|');
  const partOf = (pid) => { const i = idxOf(pid); return { fig: figOf(pid), name: pid === meId ? 'Du' : (v.players[i]?.name || '?'), color: SEAT_COLORS[i] || '#1D5FC2', tag: ctx.taglineOf ? ctx.taglineOf(pid) : '' }; };
  const playIntro = (key, opts, sfx = true) => {
    if (local.introKey === key) return 0;
    local.introKey = key;
    if (ctx.introsOff) return 0;
    const dur = introDur(opts);
    keepFx(encounterHtml(opts), dur, 'intro');
    if (sfx) { sounds.push('flip'); later.push(['flip', 140]); later.push(['gavel', opts.short ? 320 : 700]); if (!opts.short) feel('heavy'); }
    return dur;
  };
  H.introSkip = () => {}; // v0.76 (Alp): VS-Auftritte lassen sich nicht mehr wegtippen
  // Kuhhandel/Rattenhandel startet
  if (state.phase === 'trade' && v.trade && entered) {
    const t = v.trade; const pk = pairKey(t.challenger, t.target);
    const key = `trade|${logNo(state)}|${t.challenger}|${t.target}`;
    if (local.introKey !== key) {
      local.duels[pk] = (local.duels[pk] || 0) + 1;
      const nth = local.duels[pk]; const w = local.duelWins[pk] || {};
      const maxPair = Math.max(...Object.values(local.duels));
      const rat = t.animal === RAT;
      const dur = playIntro(key, {
        parts: [partOf(t.challenger), partOf(t.target)],
        title: rat ? 'RATTENHANDEL!' : 'KUHHANDEL!', dark: rat,
        center: `<span class="eicard" style="--a:${ANIMAL_COLORS[t.animal] || '#888'}">${art(t.animal)}</span><span class="eium">${esc(wantText(v.players[idxOf(t.challenger)]?.name || '?', v.players[idxOf(t.target)]?.name || '?', t.animal, t.count, t.challenger === meId, t.target === meId))}</span>`,
        sub: nth > 1 ? `${nth}. Duell heute · ${w[t.challenger] || 0}:${w[t.target] || 0}` : '',
        short: nth >= 3, rival: nth >= 3 && nth === maxPair,
      });
      if (dur) local.ttDelay = dur; // Kuhhandel-Zeit startet erst nach dem Intro
      // v0.70 (Alp): nach dem VS laufen die Einsätze beider Seiten von ihren Stapeln in die Mitte; der Topf erscheint, wenn sie ankommen
      if (t.animal && t.count) {
        const d0 = (dur || 0) + 150;
        keepFx([t.challenger, t.target].map((pid, k) => homeWalk(t.animal, `@stall:${pid}:${t.animal}`, '@tpot', d0 + k * 160, { count: t.count, ms: POT_WALK_MS, toCard: false })).join(''), d0 + POT_WALK_MS + 400, 'potin');
        local.potLand = Date.now() + d0 + POT_WALK_MS + 160;
        later.push(['trade', d0 + 60]);
      }
    }
  }
  if (evFresh && le?.type === 'trade' && le.winner) { const pk = pairKey(le.challenger, le.target); local.duelWins[pk] = local.duelWins[pk] || {}; local.duelWins[pk][le.winner] = (local.duelWins[pk][le.winner] || 0) + 1; }
  // Schnick-Schnack-Schnuck beginnt (2–4 mit gleicher Zahl)
  if (state.phase === 'special' && v.special && specialStage(v, Date.now()) === 'rps') {
    const vals = Object.values(v.special.buzzes || {}); const mx = vals.length ? Math.max(...vals) : 0;
    const who = Object.keys(v.special.buzzes || {}).filter((id) => v.special.buzzes[id] === mx);
    if (who.length > 1) playIntro(`rps|${v.special.revealer}|${v.special.startsAt}|${who.join(',')}`, { parts: who.map(partOf), title: 'GLEICHSTAND!', vs: 'SCHNICK! SCHNACK! SCHNUCK!', ms: 1500, fixed: true, center: `<span class="eium">bei ${mx}</span>` });
  }
  // Spielstart: alle Spieler, „Die Börse ist eröffnet!“
  if (state.phase === 'turn' && !v.lastEvent && logNo(state) <= 2 && v.players.length >= 2) {
    playIntro(`start|${v.players.map((p) => p.id).join(',')}|${state.log[0] || ''}`, {
      parts: v.players.map((p) => partOf(p.id)), title: isDuo(state) ? 'DUELL ZU ZWEIT!' : 'DIE BÖRSE IST ERÖFFNET!', vs: isDuo(state) ? 'VS' : 'LOS!', ms: INTRO_START_MS,
      badge: isTurbo(state) ? '⚡ Turbo' : isBoerse(state) ? '📈 Börsen-Chaos' : '',
    });
  }

  // ---------- v0.62 Gags ----------
  if (evNew && le) {
    // Versteigerung gewonnen: Gewinner springt aus dem Profilbild und jubelt (nach dem Ergebnis-Fenster)
    if (le.type === 'auction_won' && idxOf(le.buyer) >= 0) keepFx(aliveGag(le.buyer, 'cheer', 0, 2300, evDelay + 700, true), evDelay + 3100);
    // v0.68 „Ka-ching!“: wer Geld bekommt (Verkäufer der Versteigerung, Geldschein, Rattentopf, Spezialkarte, Kuhhandel-Verlierer)
    if (le.type === 'auction_won' && le.animal) v.players.forEach((p) => { if (p.id !== le.buyer && (p.animals?.[le.animal] || 0) > 0) moodMark(p.id, 'angry', Date.now() + evDelay + 600, 2600); });
    if (le.type === 'trade') {
      const win = receiverOf(le); const lose = win === le.challenger ? le.target : le.challenger;
      // v0.86: sehr günstig gewonnen → Gewinner jubelt (springt aus dem Bild), Verlierer ist traurig – nur bei den Beteiligten
      if ((le.challenger === meId || le.target === meId) && cheapWin(le)) { keepFx(aliveGag(win, 'cheer', 0, 2300, evDelay + 900, true), evDelay + 3300); moodMark(win, 'happy', Date.now() + evDelay + 900, 4200); moodMark(lose, 'sad', Date.now() + evDelay + 900, 4200); }
      else moodMark(lose, 'angry', Date.now() + evDelay + 2200, 2400);
    }
    const kach = (pid, amount, extra = 0) => { if (idxOf(pid) >= 0) { keepFx(aliveGag(pid, 'kaching', 0, 2600, evDelay + 700 + extra, true, amount), evDelay + 3400 + extra); later.push(['kaching', evDelay + 1300 + extra]); } };
    if (le.type === 'auction_won' && le.payee && le.amount > 0 && le.payee !== le.buyer) kach(le.payee, `+${le.amount}`);
    if (le.type === 'special_won' && le.payee && le.count > 0 && le.payee !== le.buyer) kach(le.payee, `+${le.count} Karte${le.count === 1 ? '' : 'n'}`);
    if (le.type === 'money_drawn' && le.value > 0) kach(le.player, `+${le.value}`, -500);
    if (le.type === 'rat_taken' && le.count > 0) kach(le.player, `+${le.count} Karte${le.count === 1 ? '' : 'n'}`, -300);
    if (le.type === 'trade') { const win = receiverOf(le); const lose = win === le.challenger ? le.target : le.challenger; if (!((le.challenger === meId || le.target === meId) && cheapWin(le))) kach(lose, '💰', 600); }
  }
  // Ratte aufgedeckt: die Ratte klettert aus der Karte, flitzt zu jedem Geldstapel, schnüffelt, und zurück
  if (le?.type === 'rat_drawn' && evFresh && local.ratRunSig !== le.n) {
    local.ratRunSig = le.n;
    const stops = v.players.map((p) => `@cash:${p.id}`); // v0.70: schnüffelt am Geld, nicht am Avatar
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
    const pt = `@stall:${pid}:${animal}`; // v0.70: vom eigenen Stapel los und wieder zurück
    // v0.77 (Alp): eigene Szene je Tier für alle (Hähne krähen, Kühe springen über den Mond …) – nicht wegtippbar
    void pt;
    const qi = idxOf(pid);
    keepFx(quartetShow(animal, esc(pid === meId ? 'Du' : nameOf(pid)), qi >= 0 ? SEAT_COLORS[qi] : '#FFD34E', delay, pid === meId, qMs()), delay + qMs() + 100, 'qshow');
    showUntilAt = Math.max(showUntilAt, Date.now() + delay + qMs() + 250);
    local.calmUntil = Math.max(local.calmUntil || 0, showUntilAt); // deine Knöpfe warten auch
    later.push([quartetSound(animal), delay + 1100]); later.push(['fanfare', delay + 150]);
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
  if (local.res && Date.now() < local.res.at) wakeLocal(local.res.at); // v0.76: Ergebnis kommt erst, wenn die Tiere in der Mitte stehen
  if (local.res && Date.now() >= local.res.at) {
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
          const known = e.offerSum != null || e.paid != null; if (e.offerSum == null && e.paid != null) e.offerSum = e.paid; // v0.89: effektiv bezahlt sehen alle
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
          const diffBox = `<span class="du-diff ecr-after ${e.diff === 0 ? 'tie' : ''}"><small>effektiv bezahlt</small><b>${e.diff}</b></span>`; // v0.89 (Alp): effektiv bezahlt = Differenz, sehen alle
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
        title = `${nm(e.challenger)} ${verb(e.challenger, 'ertauschst', 'ertauscht')} ${e.count}× ${esc(aname(e.animal))} für ${e.offerSum != null ? `${e.offerSum} ${TALER}` : e.paid != null ? `${e.paid} ${TALER}` : karten(n)}`;
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
    if (el < cantpayMs(state)) {
      const e = local.cp.ev;
      const mine = e.player === meId;
      const bills = [...e.revealed].sort((x, y) => x - y);
      const sum = bills.reduce((t, m) => t + m, 0);
      const need = e.special ? `${e.count} Karte${e.count === 1 ? '' : 'n'}` : `${e.amount} Taler`;
      const after = e.special ? `→ darf erst ab ${bills.length} buzzern` : `→ darf jetzt höchstens ${e.amount - BID_STEP} bieten`;
      const w = Math.max(30, Math.min(58, Math.floor(400 / Math.max(1, bills.length)) - 6));
      // v0.62 „Pleite!“: die Figur springt aus ihrem Profilbild, stülpt die leeren Hosentaschen raus, Motten flattern
      if (el < 3400) effects += aliveGag(e.player, 'pleite', el, 3400);
      effects += `<div class="cantpop" data-a="cpClose" role="button" aria-live="polite" style="--el:-${el}ms;--dur:${cantpayMs(state)}ms;--bw:${w}px">
        <small>Kann nicht zahlen</small>
        <b>${esc(mine ? 'Du' : nameOf(e.player))} ${mine ? 'kannst' : 'kann'} ${need} nicht zahlen</b>
        <div class="cpbills">${bills.map((m) => moneyCard(m)).join('') || '<span class="cpnone">keine Scheine</span>'}</div>
        <p><b>${bills.length}</b> Schein${bills.length === 1 ? '' : 'e'} · zusammen <b>${sum}</b> Taler</p>
        <em>${after}</em>
        <i class="rtimer"></i></div>`;
      wakeLocal(local.cp.at + cantpayMs(state) + 50);
    } else local.cp = null;
  }
  H.cpClose = () => { local.cp = null; ctx.rerender(); };

  // Esel aufgedeckt: eine große Einblendung, Scheine fliegen zu allen
  // (läuft über Neuzeichnen hinweg weiter: Startzeit merken, Animation an der richtigen Stelle fortsetzen)
  if (state.phase === 'auction' && v.lastEvent?.type === 'donkey') {
    const dSig = `${v.lastEvent.n}|${v.lastEvent.number}`;
    // Startpunkt = Karte liegt offen (nach dem Umdrehen), nicht das Aufdecken selbst
    if (local.donkeySig !== dSig) { local.donkeySig = dSig; local.donkeyAt = entered ? Date.now() + (state.auction?.opensAt != null ? Math.max(0, state.auction.opensAt - ctx.now()) : 0) : 0; }
    const el = Date.now() - (local.donkeyAt || 0);
    const DONKEY_END = ESEL_THROW_AT + v.players.length * ESEL_THROW_GAP + ESEL_FLIGHT + OUCH_MS + 300;
    if (local.donkeyAt && el < 0) wakeLocal(local.donkeyAt);
    if (local.donkeyAt && el >= 0 && el < DONKEY_END) {
      // v0.60.1 Esel-Bonus (Alps Idee): Der Esel schnappt sich die Scheine, knüllt sie zusammen
      // und pfeffert jedem einzeln einen Papierball an den Kopf – BAM, BAM, BAM.
      // v0.63.1: statt „BAM!“ steht beim Treffer der Betrag (+50/+100/+200/+500), danach hält sich der Getroffene den Kopf
      const pay = v.lastEvent.payout;
      if (el < ESEL_CLIMB_AT + 2900) effects += `<div class="eclimb" data-aim-from="@card" data-aim-to="@card" style="--ty:0px;--tx:0px" aria-hidden="true"><div class="efig" style="animation-delay:${ESEL_CLIMB_AT - el}ms">${muscleDonkey(ESEL_THROW_AT - 180 - el, v.players.length)}</div></div>`;
      effects += v.players.map((p, pi) => {
        const t = ESEL_THROW_AT + pi * ESEL_THROW_GAP;
        const to = p.id === meId ? '@me' : esc(p.id);
        ouchMark(p.id, local.donkeyAt + t + ESEL_FLIGHT, local.donkeyAt + t + ESEL_FLIGHT + OUCH_MS);
        return `<div class="eball" data-aim-from="@esel" data-aim-to="${to}" style="animation-delay:${t - el}ms;--ty:0px;--tx:0px" aria-hidden="true"></div>`
          + `<div class="ebam epay" data-aim-from="${to}" data-aim-to="${to}" style="animation-delay:${t + ESEL_FLIGHT - el}ms;--ty:0px;--tx:0px;--rot:${pi % 2 ? 9 : -8}deg" aria-hidden="true">+${pay}</div>`
          + `<div class="mfly" data-aim-from="${to}" data-aim-to="@cash:${esc(p.id)}" style="animation-delay:${t + ESEL_FLIGHT + 700 - el}ms" aria-hidden="true"></div>`; // v0.70: der Schein landet danach im Geld
      }).join('');
      wakeLocal(local.donkeyAt + DONKEY_END + 20); // danach einmal aufräumen
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
  // v0.67 Emote-Bereich: Aktionen als Kacheln – gekaufte bunt, nicht gekaufte gesperrt mit Preis (Shop → Emotes)
  function emoteTiles(to, self) {
    if (!ctx.scene) return '';
    const ok = ctx.sceneOk || [];
    const tile = (kind, act, val, owned) => { const it = SHOP_EMOTES.find((x) => (kind === 'punch' ? x.id === 'emote-pruegel' : x.scene === kind)); if (!it) return '';
      return owned ? `<button type="button" class="rp-tile" data-a="${act}" data-v="${esc(val)}"><i>${it.icon}</i><b>${esc(it.name)}</b></button>`
        : `<button type="button" class="rp-tile locked" disabled title="Im Shop unter „Emotes“"><i>${it.icon}</i><b>${esc(it.name)}</b><small>🔒 ${it.price}</small></button>`; };
    if (self) return `<div class="rp-lbl">Für alle</div><div class="rp-tiles">${tile('baum', 'scene', 'baum|', ok.includes('baum'))}</div><p class="rp-tip">Tipp: Tippe einen Mitspieler an für Aktionen gegen ihn.</p>`;
    const kinds = ['punch', 'laugh', 'schleim', 'torte', ...(v.players.length >= 3 ? ['verschwoerung'] : [])];
    return `<div class="rp-lbl">Aktion mit ${esc(nameOf(to))}</div><div class="rp-tiles">${kinds.map((k) => k === 'punch' ? tile('punch', 'punch', to, !!ctx.canPunch) : tile(k, 'scene', `${k}|${to}`, ok.includes(k))).join('')}</div>${kinds.some((k) => k === 'punch' ? !ctx.canPunch : !ok.includes(k)) ? '<p class="rp-tip">🔒 Gesperrte Aktionen gibt’s im Shop unter „Emotes“.</p>' : ''}`;
  }
  // v0.88 (Alp): 💬-Fenster neu – Reiter statt langer Liste: Emojis (ein Tipp = weg), Sprüche, Aktionen, Karten
  function reactPicker() {
    const list = ctx.reactionList, nE = ctx.reactionEmoji || 0, base = ctx.reactionBase ?? list.length;
    const to = local.reactTo, self = to === meId;
    const EMO = ctx.emojiList || [];
    const tabs = [['emo', '😀', 'Emojis'], ['say', '💬', 'Sprüche'], ...(ctx.scene ? [['act', '🎭', 'Aktionen']] : []), ['cards', '🃏', 'Karten']];
    const tab = tabs.some((t) => t[0] === local.rpTab) ? local.rpTab : 'emo';
    const btn = (r, i, cls = '') => `<button type="button" class="${cls}${r.length > 18 ? ' long' : ''}" data-a="react" data-v="${i}">${esc(r)}</button>`;
    const std = list.slice(nE, base).map((r, k) => btn(r, nE + k, 'rp-say')).join('');
    const own = list.slice(base).map((r, k) => btn(r, base + k, 'rp-say bought')).join('');
    const body = tab === 'emo' ? `<div class="rp-emogrid">${EMO.map((e, i) => `<button type="button" class="rp-e" data-a="emoji" data-v="${i}" aria-label="${e} senden">${e}</button>`).join('')}</div>`
      : tab === 'say' ? `${own ? `<div class="rp-says own">${own}</div>` : ''}<div class="rp-says">${std}</div>`
      : tab === 'act' ? emoteTiles(to, self)
      : playerDetail(v.players[idxOf(to)], self);
    return `<div class="reactpick v3 ${self ? 'self' : ''}" role="dialog" aria-label="${self ? 'Reaktion an alle' : `Reaktion an ${esc(nameOf(to))}`}">
      <div class="rphead"><span>${self ? '💬 An alle' : `💬 An ${esc(nameOf(to))}`}</span><button type="button" data-a="reactClose" aria-label="Schließen">✕</button></div>
      <div class="rp-tabs" role="tablist">${tabs.map(([k, ic, nm]) => `<button type="button" role="tab" class="rp-tab ${k === tab ? 'on' : ''}" aria-selected="${k === tab}" data-a="rpTab" data-v="${k}"><i>${ic}</i>${nm}</button>`).join('')}</div>
      <div class="rp-body">${body}</div>
    </div>`;
  }
  H.rpTab = (k) => { local.rpTab = k; ctx.rerender(); };
  H.emoji = (i) => { const e = (ctx.emojiList || [])[Number(i)]; const to = local.reactTo; local.reactTo = null; if (e) ctx.react(e, to === meId ? null : to); else ctx.rerender(); };
  // v0.68: Scroll-Stand offener Fenster (💬-Menü, Menü, Pfänden-Auswahl, Abrechnung) beim Neuzeichnen behalten
  const KEEP_SCROLL = ['.reactpick', '.menu', '.pfpick', '.ending.recap ul'];
  const keptScroll = KEEP_SCROLL.map((sel) => { const el = root.querySelector(sel); return el ? el.scrollTop : 0; });
  // v0.77 (Alp): das 💬-Fenster bleibt beim Neuzeichnen dasselbe Element (sonst bricht Wischen/Scrollen auf dem Handy ab) –
  // nur geänderte Abschnitte darin werden ausgetauscht
  const stageHtml = `<div class="stage-wrap"><div class="stage p${v.players.length}" id="stage">
    ${left}
    ${table}
    ${(() => { // v0.56: dein Platz unten rechts – deine Figur (Shop-Avatar ganz, sonst dein Bild), 💬 als Sprechblase über dem Kopf
      const pr = avatarLookup(meId); const now = Date.now(); const jub = DEMO_JUB || (local.meJubAt && now >= local.meJubAt && now < local.meJubAt + 1700);
      if (local.meJubAt && now < local.meJubAt + 1700) wakeLocal(now < local.meJubAt ? local.meJubAt : local.meJubAt + 1710);
      const meOut = local.out && local.out[meId] && local.out[meId].from <= now && now < local.out[meId].until;
      return `<div class="meplate full ${pr?.shop ? '' : 'gen'} ${meOut ? 'out' : ''} ${jub ? 'jub' : ''} ${ouchOn(meId) ? 'ouch' : ''} ${DEMO_JUB ? 'demo' : ''}" style="--c:${SEAT_COLORS[meIdx]}">${myHand.length ? `<span class="myhand" aria-label="Deine Handkarten">${myHand.map((k) => `<i class="hcard ${k}" title="${k === 'pfaendung' ? 'Zwangsversteigerung: statt eines Zuges ein Tier pfänden' : 'Einspruch: wehrt eine Pfändung gegen dich ab'}">${k === 'pfaendung' ? '⚖️' : '🛡️'}</i>`).join('')}</span>` : ''}
        <span class="mefig ${jub ? 'swing' : ''}" ${ctx.reactionList ? `data-a="reactTo" data-v="${esc(meId)}" role="button" aria-label="Reaktion an alle (💬)"` : ''}>${pr?.shop ? shopAvatarFull(pr.shop, '', pr.outfit) : aliveFig(me, meIdx, null)}${kingHat(meId)}${ouchOn(meId) ? OUCH : ''}${moodHtml(meId)}${titleBits(pr)}</span><span class="mename">Du</span>${jub ? '<i class="mejubstar" aria-hidden="true">🎉</i>' : ''}</div>`;
    })()}
    <div class="gright">${playersCol}</div>
    ${overlay}
    ${standingsHtml}${setsPop}${quickHtml}${rpsHtml}${evStrip && state.phase === 'turn' && !local.tradeOpen && !local.reactTo ? `<div class="lastround" role="status"><small>Letzte Runde</small><div class="evstrip">${evStrip}</div></div>` : ''}
    ${effects}
    ${wake ? `<i hidden data-wake="${wake}"></i>` : ''}
    ${(ctx.autoplay || []).includes(meId) && state.phase !== 'ended' ? `<div class="botbar" role="alert"><span>🤖 Ein Test-Spieler spielt gerade für dich.</span><button type="button" data-a="selfPlay">Selbst weiterspielen</button></div>` : ''}
    ${local.reactTo && ctx.reactionList && idxOf(local.reactTo) >= 0 ? '<div class="rpback" data-a="reactClose" aria-hidden="true"></div>' : ''}
    ${local.reactTo && ctx.reactionList && idxOf(local.reactTo) >= 0 ? reactPicker() : ''}
    ${local.pfOpen ? `<div class="rpback" data-a="pfClose" aria-hidden="true"></div><div class="pfpick" role="dialog" aria-label="Zwangsversteigerung">
      <div class="rphead"><span>⚖️ Zwangsversteigerung – welches Tier wird gepfändet?</span><button type="button" data-a="pfClose" aria-label="Schließen">✕</button></div>
      <p class="pfhint">Der Besitzer muss verkaufen und bekommt das Geld. Geschützt: fertige Quartette, Ratten, Spieler ohne Geld.</p>
      ${v.players.filter((p) => pfTargets.some((x) => x.target === p.id)).map((p) => `<div class="pfrow"><span class="pfwho">${avatar(p, idxOf(p.id))}<b>${esc(p.name)}</b></span><div class="pfcards">${pfTargets.filter((x) => x.target === p.id).map((x) => `<button type="button" class="pfcard" data-a="pfGo" data-v="${esc(p.id)}|${x.animal}" aria-label="${esc(p.name)}: ${esc(ANIMAL_BY_ID[x.animal].name)} pfänden">${playCard(x.animal)}<small>${p.animals[x.animal]}×</small></button>`).join('')}</div></div>`).join('')}
    </div>` : ''}
    ${ctx.toastMsg ? `<div class="toast" role="alert">${esc(ctx.toastMsg)}</div>` : ''}
  </div></div>`;
  // v0.88 (Alp) gegen Flackern und verschluckte Tipps: Hat sich am Bild nichts geändert (nur Zeitangaben für Animationen),
  // bleibt der Tisch einfach stehen – laufende Animationen und Fenster werden nicht neu aufgebaut.
  const wakeAttr = /data-wake="([^"]*)"/.exec(stageHtml);
  const normHtml = stageHtml.replace(/(--[a-z]+|animation-delay)\s*:\s*-?\d+(?:\.\d+)?m?s/g, '$1').replace(/<i hidden data-wake="[^"]*"><\/i>/, '');
  const unchanged = local.lastNorm === normHtml && root.dataset.me === meId && !!root.querySelector('#stage');
  let oldPick = null;
  if (!unchanged) {
    local.lastNorm = normHtml;
    oldPick = root.querySelector('.reactpick');
    if (oldPick) oldPick.remove();
    root.dataset.me = meId;
    root.innerHTML = stageHtml;
  } else {
    const st = root.querySelector('#stage'); let w = st.querySelector(':scope > [data-wake]');
    if (wakeAttr) { if (!w) { w = document.createElement('i'); w.hidden = true; st.appendChild(w); } w.dataset.wake = wakeAttr[1]; } else if (w) w.remove();
  }

  // v0.88 (Alp): Knöpfe reagieren schon beim Loslassen des Fingers – auch wenn der Tisch genau in dem Moment neu gezeichnet wurde
  // (vorher ging der Klick dann verloren und man musste mehrmals tippen). Der danach kommende „click“ wird ignoriert.
  root.onpointerdown = (e) => {
    const b = e.target.closest('[data-a]');
    tapState.down = b && !b.disabled && e.isPrimary ? { a: b.dataset.a, v: b.dataset.v, x: e.clientX, y: e.clientY, t: Date.now(), el: b } : null;
  };
  root.onpointerup = (e) => {
    const d = tapState.down; tapState.down = null;
    if (!d || !e.isPrimary || Date.now() - d.t > 900 || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 14) return;
    const b = e.target.closest('[data-a]');
    const same = b && b.dataset.a === d.a && b.dataset.v === d.v;
    if (!same || b.disabled) return; // Finger woanders losgelassen / Knopf inzwischen aus
    if (b === d.el) return; // nichts neu gezeichnet: der normale Klick reicht
    tapState.fired = { a: d.a, v: d.v, t: Date.now() };
    const fn = tapState.H[d.a];
    if (fn) fn(d.v);
  };
  tapState.H = H;
  root.onclick = (e) => {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const f = tapState.fired;
    if (f && f.a === b.dataset.a && f.v === b.dataset.v && Date.now() - f.t < 700) { tapState.fired = null; return; }
    const fn = H[b.dataset.a];
    if (fn) fn(b.dataset.v);
  };
  if (unchanged) {
    local.justAdded = null;
    fitStage();
    if (ctx.playSound) { [...new Set(sounds)].forEach((k, i) => setTimeout(() => ctx.playSound(k), i * 180)); later.forEach(([k, ms]) => setTimeout(() => ctx.playSound(k), ms)); }
    return;
  }
  local.justAdded = null;
  fitStage();
  fitTop(root);
  fitAuslage(root);
  aimFly(root);
  aimFx(root);
  routeFx(root);
  { const np = root.querySelector('.reactpick');
    if (np && oldPick && np.className === oldPick.className && np.children.length === oldPick.children.length) {
      [...np.children].forEach((c, i) => { const o = oldPick.children[i]; if (o.outerHTML !== c.outerHTML) o.replaceWith(c.cloneNode(true)); });
      np.replaceWith(oldPick);
    } else if (np && oldPick && np.className === oldPick.className) { np.replaceWith(oldPick); oldPick.innerHTML = np.innerHTML; } }
  KEEP_SCROLL.forEach((sel, i) => { const el = root.querySelector(sel); if (el && keptScroll[i]) el.scrollTop = keptScroll[i]; });
  // v0.69 Kurssprung-Blinken (nach der News-Karte, 2,4 s; negative Verzögerung, damit Neuzeichnen es nicht neu startet)
  { const kf = local.kursFx; const el = kf ? Date.now() - kf.at : -1;
    if (kf && el > -3400 && el < 2400) root.querySelectorAll(`[data-animal="${kf.animal}"]`).forEach((n) => { n.classList.add('kursjump', kf.up ? 'kup' : 'kdown'); if (getComputedStyle(n).position === 'static') n.style.position = 'relative'; n.style.setProperty('--kd', `${-Math.max(0, el)}ms`); n.style.setProperty('--kw', `${Math.max(0, -el)}ms`); }); }
  theaterFx(root);
  // v0.66 Knöpfe: der eine „erwartete“ Knopf leuchtet nach 3 s sanft (Zeit läuft ab Phasenwechsel, nicht ab jedem Neuzeichnen)
  { root.querySelectorAll('.hintme').forEach((b) => b.style.setProperty('--hd', `${3000 - (Date.now() - local.hintAt)}ms`)); }
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
