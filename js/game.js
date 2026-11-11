// Kuhhandel – Spieltisch im Querformat (alle Spielphasen)
import {
  ANIMALS, ANIMAL_BY_ID, DONKEY_PAYOUTS, BID_STEP, AUCTION_START_MS, AUCTION_BID_MS,
  viewFor, possibleTrades, scores, currentPlayer,
  drawForAuction, bid, passAuction, closeAuction, pay,
  startTrade, acceptTrade, counterTrade, bestPay,
  RAT, RAT_COUNT, SPECIAL_VALUE, awards, SPECIAL_TICK_MS, SPECIAL_FROM, scoreFor,
  ratCurrent, ratLay, ratTake, buzz, rpsPick, specialDecide, specialStage, specialNumber, specialResult, specialDecideAt, chooseBlock,
} from '../src/engine.js';
import { art, STAR } from './animals.js';

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
const aval = (id) => (id === RAT ? null : ANIMAL_BY_ID[id].value);
const specialsOf = (p) => p.specials || [];
const ratsOf = (p) => p.animals[RAT] || 0;
const karten = (n) => (n === 1 ? '1 Karte' : `${n} Karten`);
const initial = (n) => esc((n || '?').trim().charAt(0).toUpperCase());

// ---------- kleine Bausteine ----------

// Innenleben eines Geldscheins: große Zahl in der Mitte, kleine Zahlen oben links und unten rechts
const mIn = (v) => `<span class="mv">${v}</span>`;

function moneyCard(v, { idx = null, selected = false, size = '' } = {}) {
  const cls = `money ${size} ${selected ? 'sel' : ''}`;
  const style = `--m:${MONEY_COLORS[v] || '#eee'}`;
  if (idx === null) return `<div class="${cls}" style="${style}">${mIn(v)}</div>`;
  return `<button type="button" class="${cls}" style="${style}" data-a="toggle" data-v="${idx}" aria-pressed="${selected}" aria-label="Geldkarte ${v}">${mIn(v)}</button>`;
}

// Geld als Stapel nach Scheinwert: Tippen legt einen Schein ins Angebot
function moneyPiles(money, sel) {
  const values = [...new Set(money)].sort((a, b) => a - b);
  if (!values.length) return '<em class="nomoney">Keine Geldkarten</em>';
  return `<div class="piles">${values.map((v) => {
    const total = money.filter((m) => m === v).length;
    const used = sel.filter((i) => money[i] === v).length;
    const left = total - used;
    return `<button type="button" class="pile" style="--m:${MONEY_COLORS[v] || '#eee'}" data-a="addv" data-v="${v}" ${left ? '' : 'disabled'} aria-label="${v}er hinzufügen, ${left} übrig">
      <span class="pv">${v}</span><span class="pcnt">×${left}</span></button>`;
  }).join('')}</div>`;
}

// Ausgewählte Scheine: Tippen nimmt sie wieder zurück
function chosenCards(money, sel, empty = 4) {
  const cards = sel.map((i) => `<button type="button" class="money xs" style="--m:${MONEY_COLORS[money[i]]}" data-a="remove" data-v="${i}" aria-label="${money[i]} zurücknehmen">${mIn(money[i])}</button>`).join('');
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
function stackHtml(id, n, { special = false, bump = false } = {}) {
  const v = aval(id);
  const done = n === 4 && id !== RAT;
  const cards = Array.from({ length: n }, (_, k) => `<div class="scard ${DARK_ANIMALS.has(id) ? 'dark' : ''}" style="--k:${n - 1 - k};--a:${ANIMAL_COLORS[id]}">${k === n - 1 ? `${v != null ? `<em>${v}</em>` : ''}<b>${art(id)}</b>` : ''}</div>`).join('');
  const near = n === 3 && id !== RAT;
  const label = id === RAT ? `${n}× Ratte` : done ? 'Quartett' : `noch ${4 - n}`;
  return `<div class="stack ${done ? 'done' : ''} ${near ? 'near' : ''} ${id === RAT ? 'rat' : ''} ${bump ? 'bump' : ''}" style="--n:${n}" title="${n}× ${aname(id)}${special ? ' + Spezialkarte' : ''}">
    <div class="spile">${cards}${special ? `<span class="sstar">${STAR}</span>` : ''}${done ? '<span class="scheck">✓</span>' : ''}</div>
    <span class="slabel">${label}</span>
  </div>`;
}

// Spezialkarte (klein): Tierbild mit Stern, Wert 250
function specialMini(id) {
  return `<div class="amini special" title="${aname(id)}-Spezialkarte">
    <div class="acard sp" style="--a:${ANIMAL_COLORS[id]}"><i></i><b>${art(id)}</b>${STAR}<em class="cv">${SPECIAL_VALUE}</em></div>
    <span>${aname(id)} ★</span>
  </div>`;
}

// Kleine Symbole in der Spielerspalte: „2× [Tier]“, Ratten, Spezialkarten
// Höchstens eine Reihe: Quartette zuerst, dann Ratten, Spezialkarten, dann nach Anzahl und Wert; Rest als „+N“
const CHIP_MAX = 4;
function playerChips(p, tradeable = new Set()) {
  const items = [];
  const chip = (id, cls, inner, title) => (tradeable.has(id)
    ? `<button type="button" class="chip ${cls} tradechip" data-a="tradeWith" data-v="${esc(p.id)}|${id}" aria-label="Kuhhandel mit ${esc(p.name)} um ${aname(id)}">${inner}</button>`
    : `<span class="chip ${cls}" title="${title}">${inner}</span>`);
  for (const a of ANIMALS) {
    const n = p.animals[a.id] || 0;
    if (n > 0) items.push({ rank: n === 4 ? 0 : tradeable.has(a.id) ? 1 : 3, n, val: a.value, html: chip(a.id, n === 4 ? 'done' : '', `<em>${n}×</em><span class="ci" style="--a:${ANIMAL_COLORS[a.id]}">${art(a.id)}</span>`, `${n}× ${a.name}`) });
  }
  const r = ratsOf(p);
  if (r > 0) items.push({ rank: tradeable.has(RAT) ? 1 : 2, n: r, val: 0, html: chip(RAT, 'rat', `<em>${r}×</em><span class="ci" style="--a:${ANIMAL_COLORS[RAT]}">${art(RAT)}</span>`, `${r}× Ratte`) });
  for (const id of specialsOf(p)) items.push({ rank: 4, n: 1, val: SPECIAL_VALUE, html: `<span class="chip sp" title="${aname(id)}-Spezialkarte"><span class="ci" style="--a:${ANIMAL_COLORS[id]}">${art(id)}</span>${STAR}</span>` });
  items.sort((x, y) => x.rank - y.rank || y.n - x.n || y.val - x.val);
  if (items.length <= CHIP_MAX) return items.map((x) => x.html).join('');
  return items.slice(0, CHIP_MAX - 1).map((x) => x.html).join('') + `<span class="chip more">+${items.length - CHIP_MAX + 1}</span>`;
}

// Rechnung für die Wertung, z. B. „(800 + 250★ + 1000) × 2 + 250★ = 4350“
export function scoreFormula(p, blocked = null) {
  const specials = p.specials || [];
  const quartets = ANIMALS.filter((a) => p.animals[a.id] === 4 && a.id !== blocked);
  const parts = [];
  for (const a of quartets) parts.push(specials.includes(a.id) ? `${a.value}+${SPECIAL_VALUE}★` : `${a.value}`);
  const loose = specials.filter((id) => !quartets.some((a) => a.id === id)).length;
  const total = scoreFor(p, blocked).score;
  let text = quartets.length ? `(${parts.join(' + ')}) × ${quartets.length}` : '';
  if (loose) text += `${text ? ' + ' : ''}${loose > 1 ? `${loose} × ` : ''}${SPECIAL_VALUE}★`;
  return `${text || 'keine Quartette'} = ${total}`;
}

// Großansicht eines Mitspielers (im Emoji-Fenster): Tiere, Ratten, Spezialkarten, Kartenanzahl
function playerDetail(p, withScore = false) {
  const items = [];
  for (const a of ANIMALS) {
    const n = p.animals[a.id] || 0;
    if (n) items.push(`<span class="pd ${n === 4 ? 'done' : ''}"><span class="ci" style="--a:${ANIMAL_COLORS[a.id]}">${art(a.id)}</span><b>${n}×</b><small>${a.value}</small></span>`);
  }
  const r = ratsOf(p);
  if (r) items.push(`<span class="pd"><span class="ci" style="--a:${ANIMAL_COLORS[RAT]}">${art(RAT)}</span><b>${r}×</b><small>Ratte</small></span>`);
  for (const id of specialsOf(p)) items.push(`<span class="pd sp"><span class="ci" style="--a:${ANIMAL_COLORS[id]}">${art(id)}${STAR}</span><b>★</b><small>${SPECIAL_VALUE}</small></span>`);
  const count = Array.isArray(p.money) ? p.money.length : p.money;
  const pts = withScore ? `<div class="pdscore"><span>Punkte</span><b>${scoreFor(p).score}</b><small>${scoreFormula(p)}</small></div>` : '';
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
  if (pr) return `<div class="avatar pic" style="--c:${SEAT_COLORS[idx]};--bg:${pr.color}" aria-hidden="true">${art(pr.animal)}</div>${extra}`;
  return `<div class="avatar" style="--c:${SEAT_COLORS[idx]}" aria-hidden="true">${initial(p.name)}</div>${extra}`;
}

// ---------- Hauptfunktion ----------

export function renderGame(root, ctx) {
  const { state, meId, local } = ctx;
  avatarLookup = ctx.avatarFor || (() => null);
  const sounds = [];
  const v = viewFor(state, meId);
  const meIdx = v.players.findIndex((p) => p.id === meId);
  const me = v.players[meIdx];
  const idxOf = (id) => v.players.findIndex((p) => p.id === id);
  const nameOf = (id) => (id === meId ? 'Du' : v.players[idxOf(id)]?.name || '?');
  const cur = currentPlayer(v);
  const myTurn = cur.id === meId;

  // Auswahl zurücksetzen, sobald sich im Spiel etwas getan hat
  const key = `${state.phase}|${state.turn}|${state.log.length}`;
  if (local.key !== key) {
    local.key = key;
    local.sel = [];
    if (state.phase !== 'turn') local.tradeOpen = false;
  }
  const selSum = local.sel.reduce((s, i) => s + (me.money[i] ?? 0), 0);

  // Animationen nur bei echten Neuigkeiten abspielen, nicht bei jedem Neuzeichnen
  const prev = local.prev || {};
  const fresh = prev.logLen !== undefined && state.log.length !== prev.logLen;
  const entered = prev.phase !== state.phase;
  local.prev = { logLen: state.log.length, phase: state.phase, highMe: state.phase === 'auction' && state.auction?.high?.player === meId, aucId: state.phase === 'auction' ? state.log.length : null };

  const H = {}; // Klick-Aktionen dieser Darstellung
  H.addv = (val) => {
    const v = Number(val);
    const i = me.money.findIndex((m, k) => m === v && !local.sel.includes(k));
    if (i >= 0) { local.sel = [...local.sel, i]; ctx.rerender(); }
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
  // Position jedes Spielers auf der Bühne (Gegner rechts, du unten rechts im Tisch)
  const colOrder = [...others, me];
  const posY = (id) => 8 + (374 / colOrder.length) * (colOrder.findIndex((p) => p.id === id) + 0.5);
  const tradeMap = {};
  if (state.phase === 'turn' && myTurn && !v.mustDraw) possibleTrades(state, meId).forEach((t) => { (tradeMap[t.target] ||= new Set()).add(t.animal); });
  const playersCol = v.players.map((p, i) => {
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
      else if (sp.buzzes[p.id] != null) status = `Buzz bei ${sp.buzzes[p.id]}`;
      else if (sp.caps[p.id] != null) status = sp.caps[p.id] === 0 ? 'darf nicht buzzern' : `erst ab ${sp.caps[p.id]}`;
    }
    const chips = playerChips(p, tradeMap[p.id]);
    const isLeader = state.phase === 'auction' && auction.high && auction.high.player === p.id;
    if (isLeader) status = `🔨 ${auction.high.amount}`;
    const turnMark = (state.phase === 'rat' ? ratCurrent(v) === p.id : cur.id === p.id) && state.phase !== 'ended' ? ' turn' : '';
    const offline = ctx.online && !isMe && !ctx.online.has(p.id);
    if (offline) status = 'offline';
    const bot = (ctx.autoplay || []).includes(p.id);
    if (bot) status = '🤖 automatisch';
    const dim = (state.phase === 'auction' && auction.passed.includes(p.id)) || offline ? ' dim' : '';
    let coin = '';
    if (fresh && v.lastEvent?.type === 'money_drawn' && v.lastEvent.player === p.id) coin = `<span class="coinpop big">+${v.lastEvent.value}</span>`;
    if (fresh && isLeader && state.log[state.log.length - 1]?.includes('bietet')) coin = `<span class="coinpop bidpop" style="--c:${SEAT_COLORS[i]}">${auction.high.amount}!</span>`;
    const said = ctx.reactions?.[p.id];
    const from = said?.from && said.from !== p.id ? said.from : null;
    const fromIdx = from ? idxOf(from) : -1;
    const bubble = said ? `<div class="rbubble ${from ? 'to' : ''}" ${fromIdx >= 0 ? `style="--c:${SEAT_COLORS[fromIdx]}"` : ''}>${fromIdx >= 0 ? `<small>${esc(nameOf(from))} →</small>` : ''}${esc(said.text)}</div>` : '';
    let nudge = ctx.nudgeWho === p.id && !isMe ? `<button type="button" class="nudge" data-a="nudge" data-v="${esc(p.id)}" aria-label="${esc(p.name)} anstupsen">👉 Anstupsen</button>` : '';
    if (ctx.canTakeover && ctx.canTakeover(p.id)) nudge = `<button type="button" class="nudge takeover" data-a="takeover" data-v="${esc(p.id)}" aria-label="Test-Spieler übernimmt für ${esc(p.name)}">🤖 Für ${esc(p.name)} übernehmen</button>`;
    return `<div class="prow${isMe ? ' me' : ''}${turnMark}${dim}${isLeader ? ' leader' : ''}" style="order:${isMe ? 9 : 0};--c:${SEAT_COLORS[i]}">${coin}
      ${bubble}${nudge}
      <div class="pid" data-a="reactTo" data-v="${esc(p.id)}" role="button" aria-label="${esc(isMe ? 'Reaktion senden' : `Reaktion an ${p.name}`)}">
        ${turnMark ? '<span class="turnhint" aria-label="ist dran">⏳</span>' : ''}${avatar(p, i)}
        <div class="pname"><span class="ribbon-s" style="--c:${SEAT_COLORS[i]}">${esc(isMe ? 'Du' : p.name)}</span><span class="tag-s ${isLeader && fresh ? 'pop' : ''}">${status === karten(count) ? `<span class="mcnt" title="${karten(count)} Geld"><i></i>${count}</span>` : status}</span></div>
      </div>
      <div class="chips" data-a="reactTo" data-v="${esc(p.id)}">${chips}</div>
    </div>`;
  }).join('');

  // ----- Versteigerung: findet direkt auf dem Tisch statt -----
  let wake = null; // wann neu zeichnen (Aufdecken, Buzzer-Countdown)
  let handPick = null; // ersetzt den Geldfächer, solange man Scheine auswählt
  let aucCenter = '';
  let aucLeft = '';
  let aucBanner = '';
  if (state.phase === 'auction') {
    const a = auction;
    const iAmAuctioneer = a.auctioneer === meId;
    const high = a.high ? a.high.amount : 0;
    const cap = a.caps[meId];
    const canBid = (amt) => cap == null || amt <= cap;
    const nowR = ctx.now();
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
    const running = a.endsAt != null && now < a.endsAt && !revealing;
    const secs = running ? Math.ceil((a.endsAt - now) / 1000) : 0;
    const total = a.high ? AUCTION_BID_MS : AUCTION_START_MS;
    const pct = running ? Math.max(0, Math.min(100, ((a.endsAt - now) / total) * 100)) : 0;
    const card = revealing
      ? `<div class="revealcard">${playCard(a.animal)}</div>`
      : `<div class="aucard center ringwrap ${infoFresh ? 'settle' : ''} ${running ? (secs <= 3 ? 'low' : '') : 'over'}" ${a.endsAt != null ? `data-ends="${a.endsAt}" data-total="${total}" data-fmt="n"` : ''}>
          ${playCard(a.animal)}
          <svg class="ring" viewBox="0 0 112 152" aria-hidden="true"><rect class="ringbg" x="4" y="4" width="104" height="144" rx="16" pathLength="100"></rect><rect class="ringp" x="4" y="4" width="104" height="144" rx="16" pathLength="100" style="stroke-dashoffset:${100 - pct}"></rect></svg>
          <span class="ringsec">${running ? secs : '✓'}</span></div>`;
    const countdown = !revealing && !running && a.endsAt != null ? '<div class="timeup">Zeit abgelaufen</div>' : '';

    const ev = v.lastEvent;
    const info = ev?.type === 'cant_pay' && !a.high
      ? `<div class="reveal-row ${fresh ? 'shake' : ''}"><strong>${esc(nameOf(ev.player))} ${ev.player === meId ? 'kannst' : 'kann'} ${ev.amount} nicht zahlen:</strong>
          <span class="reveal-cards">${ev.revealed.map((m) => moneyCard(m, { size: 'xs' })).join('') || 'keine Karten'}</span>
          <span>→ max. ${ev.amount - BID_STEP}</span></div>`
      : (() => {
        // Gebots-Schild: wer bietet wie viel – groß, mit Spielerfarbe, springt bei jedem neuen Gebot auf
        if (!a.high) return '<div class="bidbox empty"><span>Noch kein Gebot</span></div>';
        const bi = idxOf(a.high.player);
        const key = `${a.opensAt}|${a.high.player}|${a.high.amount}`;
        const isNew = local.bidKey !== key;
        local.bidKey = key;
        return `<div class="bidbox ${isNew ? 'pop' : ''}" style="--c:${SEAT_COLORS[bi]}">
          ${avatar(v.players[bi], bi)}<span class="bwho">${esc(a.high.player === meId ? 'Du' : nameOf(a.high.player))}<small>${a.high.player === meId ? 'bietest' : 'bietet'}</small></span><b>${high}</b></div>`;
      })();

    aucBanner = `${esc(nameOf(a.auctioneer))} ${iAmAuctioneer ? 'versteigerst' : 'versteigert'}`;
    aucCenter = revealing ? `<div class="auc aucreveal">${card}</div>` : `<div class="auc aucmain"><div class="aucrow"><div class="aside l">${ainfo}</div>${card}<div class="aside r">${info}</div></div>${countdown}</div>`;

    if (iAmAuctioneer) {
      const myTotal = sum(me.money);
      if (revealing) {
        aucLeft = `<div class="ldecide">Du deckst auf …</div>`;
      } else if (running) {
        aucLeft = `<div class="ldecide">Du versteigerst …</div>`;
      } else if (a.high) {
        aucLeft = `<button type="button" class="pill pill-red" data-a="sell"><small>ZUSCHLAG AN</small>${esc(nameOf(a.high.player))}</button>
          <button type="button" class="pill pill-white" data-a="buy" ${myTotal >= high ? '' : 'disabled'}><small>SELBST KAUFEN</small>${high}</button>`;
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
      aucLeft = `<div class="lhead">Bieten <small>mind. ${high + BID_STEP}</small></div>
        <div class="bidgrid">${steps.map((st) => {
          const amt = high + st;
          const over = amt > mine;
          return `<button type="button" class="bidbtn ${over ? 'over' : ''}" data-a="bid" data-v="${amt}" ${canBid(amt) ? '' : 'disabled'} aria-label="${amt} bieten${over ? ', mehr als du hast' : ''}"><b>${amt}</b><small>${over ? '⚠ zu viel' : `+${st}`}</small></button>`;
        }).join('')}</div>
        <button type="button" class="pill pill-white pill-small" data-a="pass" ${passed ? 'disabled' : ''}>${passed ? 'Gepasst' : 'Passen'}</button>`;
    } else {
      aucLeft = `<div class="ldecide">${esc(nameOf(a.auctioneer))} entscheidet …</div>`;
    }

    const tick = () => { if (ctx.vibe !== false) { try { navigator.vibrate?.(15); } catch { /* egal */ } } };
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
      <div class="aside r"><div class="potbox">${pot}<small>Gelegt: <b>${karten(potCount)}</b></small></div></div>
    </div></div>`;
    if (turnId === meId) {
      const values = [...new Set(me.money)].sort((a, b) => a - b);
      aucLeft = `<button type="button" class="pill pill-red" data-a="ratTake"><small>RATTE NEHMEN</small>+ ${karten(potCount)}</button>`;
      if (values.length) {
        handPick = `<div class="hand-row ratlay"><span class="hrlabel">Karte verdeckt legen:</span><div class="piles">${values.map((val) => `<button type="button" class="pile" style="--m:${MONEY_COLORS[val] || '#eee'}" data-a="ratLay" data-v="${val}" aria-label="${val} verdeckt legen"><span class="pv">${val}</span><span class="pcnt">×${me.money.filter((m) => m === val).length}</span></button>`).join('')}</div></div>`;
      }
    } else {
      aucLeft = `<div class="ldecide">${esc(nameOf(turnId))} überlegt …</div>`;
    }
    H.ratLay = (val) => { const i = me.money.indexOf(Number(val)); if (i >= 0) ctx.act((s) => ratLay(s, meId, i)); };
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
    if (stage === 'wait') wake = sp.startsAt;
    else if (stage === 'countdown') wake = Math.min(sp.startsAt + Math.floor((now - sp.startsAt) / SPECIAL_TICK_MS + 1) * SPECIAL_TICK_MS, specialDecideAt(v));

    let big = '';
    if (stage === 'wait') big = `<div class="bignum wait"><small>Achtung …</small>${SPECIAL_FROM}</div>`;
    else if (stage === 'countdown') big = `<div class="bignum ${num <= 3 ? 'low' : ''}" ${fresh ? '' : ''}><small>Karten</small>${num}</div>`;
    const ev = v.lastEvent;
    let info = '';
    if (ev?.type === 'cant_pay' && ev.special && !Object.keys(sp.buzzes).length) {
      info = `<div class="reveal-row ${fresh ? 'shake' : ''}"><strong>${esc(nameOf(ev.player))} ${ev.player === meId ? 'hast' : 'hat'} keine ${ev.count} Karten:</strong>
        <span class="reveal-cards">${ev.revealed.map((m) => moneyCard(m, { size: 'xs' })).join('') || 'keine Karten'}</span><span>→ erst ab ${ev.revealed.length}</span></div>`;
    } else if (top != null) {
      info = `<div class="aucinfo pop">${buzzed.map((id) => esc(nameOf(id))).join(' & ')} ${buzzed.length > 1 ? 'buzzern' : buzzed[0] === meId ? 'buzzerst' : 'buzzert'} bei <b>${top}</b></div>`;
    } else if (stage === 'decide') {
      info = '<div class="aucinfo">Niemand hat gebuzzert</div>';
    }
    aucBanner = `${esc(nameOf(sp.revealer))} ${iRevealed ? 'hast' : 'hat'} eine Spezialkarte`;
    aucCenter = `<div class="auc aucmain"><div class="aucrow">
      <div class="aside l">${(() => { const hs = v.players.map((p, i) => [p, i]).filter(([p]) => p.animals[sp.animal] > 0); return `<div class="owners">${hs.length ? `<small>${esc(aname(sp.animal))} haben</small><div class="olist">${hs.map(([p, i]) => `<span class="own ${p.id === meId ? 'me' : ''}">${avatar(p, i)}<b>${p.id === meId ? 'Du' : esc(p.name)} ×${p.animals[sp.animal]}</b></span>`).join('')}</div>` : `<span class="onew">Noch keiner hat ${esc(aname(sp.animal))}</span>`}</div>`; })()}</div>
      <div class="bigcard compact ${entered ? 'deal' : ''}">${playCard(sp.animal, 'special')}</div>
      <div class="aside r">${big || ''}</div>
    </div>${info}</div>`;

    if (stage === 'wait' || stage === 'countdown') {
      if (iRevealed) {
        aucLeft = '<div class="ldecide">Die anderen buzzern …</div>';
      } else {
        const cap = sp.caps[meId];
        const mine = sp.buzzes[meId];
        const blocked = stage === 'wait' || mine != null || (top != null && num < top) || (cap != null && num > cap);
        const label = mine != null ? `Gebuzzert bei ${mine}` : cap === 0 ? 'Keine Karten – kein Buzz' : stage === 'wait' ? 'Gleich …' : cap != null && num > cap ? `Erst ab ${cap}` : `bei ${num} = ${karten(num)}`;
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
        aucLeft = `<div class="lhead">${esc(nameOf(res.player))} · ${karten(res.count)}</div>
          <button type="button" class="pill pill-red" data-a="spSell"><small>VERKAUFEN</small>${esc(nameOf(res.player))} zahlt dir ${res.count}</button>
          <button type="button" class="pill pill-white" data-a="spBuy" ${canBuy ? '' : 'disabled'}><small>${canBuy ? 'SELBST KAUFEN' : 'ZU WENIG KARTEN'}</small>Du zahlst ${res.count}</button>`;
      }
    } else {
      aucLeft = `<div class="ldecide">${esc(nameOf(sp.revealer))} entscheidet …</div>`;
    }
    H.buzz = () => { const t = ctx.now(); if (ctx.vibe !== false) { try { navigator.vibrate?.(70); } catch { /* egal */ } } ctx.act((s) => buzz(s, meId, t)); };
    H.rps = (c) => ctx.act((s) => rpsPick(s, meId, c, ctx.now()));
    H.spSell = () => ctx.act((s) => specialDecide(s, meId, 'sell', ctx.now()));
    H.spBuy = () => ctx.act((s) => specialDecide(s, meId, 'buy', ctx.now()));
  }

  // ----- Bezahlen: auf dem Tisch statt in einem eigenen Fenster -----
  if (state.phase === 'payment') {
    const pm = v.payment;
    const isSp = !!pm.special;
    const card = `<div class="aucard paycard">${isSp ? playCard(pm.special, 'special') : playCard(pm.animal)}</div>`;
    if (pm.payer === meId) {
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
      aucCenter = `<div class="auc paytable">${card}
        <div class="kasse ${entered ? 'pop' : ''}">
          <div class="kslots">${chosenCards(me.money, local.sel, isSp ? Math.max(pm.count, 1) : 3)}</div>
          <div class="kline"><span>${isSp ? `${karten(n)} von ${pm.count}` : `${karten(n)} · ${selSum}`}</span><b class="paystatus ${cls}">${status}</b></div>
        </div></div>`;
      aucLeft = `<div class="lhead">${isSp ? `${esc(aname(pm.special))}-Spezialkarte` : `Für: ${esc(aname(pm.animal))}`}</div>
        <button type="button" class="pill pill-white pill-small" data-a="${isSp ? 'autocount' : 'autopay'}">${isSp ? 'Kleinste wählen' : 'Passend wählen'}</button>
        <button type="button" class="pill pill-red" data-a="pay" ${ready ? '' : 'disabled'}><small>BEZAHLEN</small>${isSp ? karten(n) : `${karten(n)} · ${selSum}`}</button>`;
      handPick = `<div class="hand-row">${moneyPiles(me.money, local.sel)}</div>`;
      H.pay = () => ctx.act((s) => pay(s, meId, local.sel));
      H.autopay = () => { local.sel = bestPay(me.money, pm.amount); ctx.rerender(); };
      H.autocount = () => { local.sel = me.money.map((m, i) => [m, i]).sort((a, b) => a[0] - b[0]).slice(0, pm.count).map(([, i]) => i); ctx.rerender(); };
    } else {
      aucBanner = `${esc(nameOf(pm.payer))} ${pm.payer === meId ? 'zahlst' : 'zahlt'}`;
      aucCenter = `<div class="auc paytable">${card}
        <div class="kasse waiting"><div class="kslots">${Array.from({ length: Math.min(isSp ? pm.count : 3, 8) }, () => '<div class="money xs back"></div>').join('')}</div>
          <div class="kline"><span>${esc(nameOf(pm.payer))} → ${esc(nameOf(pm.payee))}</span><b>${isSp ? karten(pm.count) : `${pm.amount} Taler`}</b></div></div></div>`;
      aucLeft = `<div class="ldecide">${esc(nameOf(pm.payer))} sucht ${isSp ? 'die Karten' : 'die Scheine'} aus …</div>`;
    }
  }

  // ----- Kuhhandel: auf dem Tisch statt in einem eigenen Fenster -----
  const who = (id, label) => { const i = idxOf(id); return `<div class="twho">${avatar(v.players[i], i)}<span class="ribbon-s" style="--c:${SEAT_COLORS[i]}">${esc(label || nameOf(id))}</span></div>`; };
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
    aucCenter = `<div class="tduel ${entered ? 'pop' : ''}">
      <div class="tpanel">
        ${who(meId, 'Du')}
        <div class="kslots">${chosenCards(me.money, local.sel, 3)}</div>
        <div class="tline"><b>${karten(local.sel.length)} · ${selSum}</b></div>
      </div>
      <div class="tvs">VS</div>
      <div class="tpanel">
        ${who(target.id)}
        ${targets.length > 1 ? `<div class="tabs">${targets.map((id) => `<button type="button" class="tab ${id === local.tradeTarget ? 'on' : ''}" data-a="tTarget" data-v="${esc(id)}">${esc(nameOf(id))}</button>`).join('')}</div>` : ''}
        <div class="atiles">${forTarget.map((t) => `<button type="button" class="atile ${t.animal === local.tradeAnimal ? 'on' : ''}" style="--a:${ANIMAL_COLORS[t.animal]}" data-a="tAnimal" data-v="${t.animal}" aria-label="${aname(t.animal)}, ${esc(target.name)} hat ${target.animals[t.animal]}">${miniCard(t.animal, 'fill')}${aval(t.animal) != null ? `<em class="cv">${aval(t.animal)}</em>` : ''}<span>×${target.animals[t.animal]}</span></button>`).join('')}</div>
        ${chosen ? animalStrip(chosen.animal, chosen.count, chosen.animal === RAT ? `wer mehr bietet, wird ${chosen.count === 2 ? 'beide' : 'sie'} los` : 'darum geht es') : ''}
      </div>
    </div>`;
    const step = (n, label, val, state0) => `<div class="tstep ${state0}"><i>${state0 === 'done' ? '✓' : n}</i><span>${label}</span><b>${val}</b></div>`;
    const moneyDone = local.sel.length > 0;
    const steps = `<div class="tsteps">
        ${step(1, 'Gegner', esc(target.name), 'done')}
        ${step(2, 'Tier', chosen ? esc(aname(chosen.animal)) : '–', chosen ? 'done' : 'now')}
        ${step(3, 'Geld', moneyDone ? karten(local.sel.length) : 'unten antippen', moneyDone ? 'done' : chosen ? 'now' : '')}
      </div>`;
    aucCenter = steps + aucCenter;
    aucLeft = `
      <button type="button" class="pill pill-white pill-small" data-a="tradeClose">Abbrechen</button>
      <button type="button" class="pill pill-red" data-a="tradeGo" ${canOffer ? '' : 'disabled'}><small>ANGEBOT MACHEN</small>${karten(local.sel.length)}</button>`;
    handPick = `<div class="hand-row">${moneyPiles(me.money, local.sel)}</div>`;
    H.tTarget = (id) => { local.tradeTarget = id; local.tradeAnimal = null; ctx.rerender(); };
    H.tAnimal = (id) => { local.tradeAnimal = id; ctx.rerender(); };
    H.tradeClose = () => { local.tradeOpen = false; local.sel = []; ctx.rerender(); };
    H.tradeGo = () => ctx.act((s) => startTrade(s, meId, local.tradeTarget, local.tradeAnimal, local.sel));
  }

  if (state.phase === 'trade') {
    const t = v.trade;
    const offerCount = Array.isArray(t.offer) ? t.offer.length : t.offer;
    const offerCards = Array.isArray(t.offer) ? t.offer.map((m) => moneyCard(m, { size: 'xs' })).join('') : Array.from({ length: offerCount }, () => '<div class="money xs back"></div>').join('');
    const isRat = t.animal === RAT;
    aucBanner = `${isRat ? 'Rattenhandel' : 'Kuhhandel'}: ${esc(nameOf(t.challenger))} gegen ${esc(nameOf(t.target))}`;
    const challengerPanel = `<div class="tpanel">
        ${who(t.challenger, t.challenger === meId ? 'Du' : null)}
        <div class="kslots">${offerCards || '<span class="tnone">keine Karten</span>'}</div>
        <div class="tline"><b>${karten(offerCount)}</b></div>
      </div>`;
    if (t.target === meId) {
      const canCounter = local.sel.length > 0 || me.money.length === 0;
      aucCenter = `<div class="tduel ${entered ? 'pop' : ''}">${challengerPanel}
        <div class="tvs">VS</div>
        <div class="tpanel">
          ${who(meId, 'Du')}
          <div class="kslots">${chosenCards(me.money, local.sel, 3)}</div>
          <div class="tline"><b>${karten(local.sel.length)} · ${selSum}</b></div>
        </div>
      </div>
      ${animalStrip(t.animal, t.count, '')}`;
      aucLeft = `<button type="button" class="pill pill-white" data-a="accept"><small>ANNEHMEN</small>${isRat ? 'Geld + Ratte' : 'Geld nehmen'}</button>
        <button type="button" class="pill pill-red" data-a="counter" ${canCounter ? '' : 'disabled'}><small>GEGENANGEBOT</small>${karten(local.sel.length)}</button>`;
      handPick = `<div class="hand-row">${moneyPiles(me.money, local.sel)}</div>`;
      H.accept = () => ctx.act((s) => acceptTrade(s, meId));
      H.counter = () => ctx.act((s) => counterTrade(s, meId, local.sel));
    } else {
      aucCenter = `<div class="tduel">${challengerPanel}
        <div class="tvs">VS</div>
        <div class="tpanel">
          ${who(t.target)}
          <div class="kslots"><div class="slot q">?</div></div>
          <div class="tline"><b>überlegt …</b></div>
        </div>
      </div>
      ${animalStrip(t.animal, t.count, '')}`;
      aucLeft = `<div class="ldecide">${t.challenger === meId ? `Warte auf die Antwort von ${esc(nameOf(t.target))} …` : `${esc(nameOf(t.target))} überlegt …`}</div>`;
    }
  }

  // Ergebnis des letzten Kuhhandels für die Beteiligten (mit Beträgen) – als Kasten auf dem Tisch
  const tev = v.lastEvent;
  if (state.phase === 'turn' && !local.tradeOpen && tev?.type === 'trade' && local.seenEvent !== state.log.length && (tev.challenger === meId || tev.target === meId)) {
    const won = tev.winner === meId;
    const detail = tev.accepted
      ? `${esc(nameOf(tev.target))} hat angenommen${tev.offerSum != null ? ` (${tev.offerSum} Taler)` : ''}.`
      : `${esc(nameOf(tev.challenger))}: ${tev.offerSum} · ${esc(nameOf(tev.target))}: ${tev.counterSum}${tev.offerSum === tev.counterSum ? ' – Gleichstand, Herausforderer gewinnt' : ''}`;
    const isRat = tev.animal === RAT;
    const ratWhere = won ? `bist du los – ${esc(nameOf(tev.winner === tev.challenger ? tev.target : tev.challenger))} hat sie` : 'gehören jetzt dir';
    aucBanner = isRat ? 'Rattenhandel' : 'Kuhhandel';
    aucCenter = `<div class="tresult ${won ? 'won' : 'lost'} ${fresh ? 'pop' : ''}">
      <div class="trcard">${isRat ? playCard(RAT, 'rat') : playCard(tev.animal)}<span class="trcount">×${tev.count}</span></div>
      <div class="trtext">
        <h3>${won ? 'Gewonnen!' : 'Verloren'}</h3>
        <b>${tev.count}× ${esc(aname(tev.animal))} ${isRat ? ratWhere : won ? 'gehören jetzt dir' : `gehen an ${esc(nameOf(tev.winner))}`}</b>
        <p>${detail}</p>
        <button type="button" class="pill pill-red pill-small" data-a="seen">Weiter</button>
      </div>
    </div>`;
    H.seen = () => { local.seenEvent = state.log.length; ctx.rerender(); };
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
          ${miniCard(a.id, 'big')}<b>${a.name}${specialsOf(me).includes(a.id) ? ` ${STAR}` : ''}</b><small>${scoreFor(me, a.id).score} Punkte</small></button>`).join('')}</div>
      </div>`;
      aucLeft = `<div class="ldecide">Quartett wählen …</div>`;
      H.block = (id) => ctx.act((s) => chooseBlock(s, meId, id));
    } else {
      aucCenter = `<div class="auc">${ratCard('', 'compact')}<div class="aucinfo">${esc(bp.name)} wählt, welches Quartett nicht zählt …</div></div>`;
      aucLeft = `<div class="ldecide">Gleich ist das Spiel vorbei.</div>`;
    }
  }

  // ----- Tisch -----
  const canDraw = state.phase === 'turn' && myTurn && !local.tradeOpen && v.deck > 0;
  const lastLog = v.log[v.log.length - 1] || '';
  // Letzte Aktion als kleine Bildzeile (wer → was), sonst Textzeile
  const who2 = (id) => { const i = idxOf(id); return i >= 0 ? `<span class="evp">${avatar(v.players[i], i)}<b>${id === meId ? 'Du' : esc(v.players[i].name)}</b></span>` : ''; };
  let evStrip = '';
  const le0 = v.lastEvent;
  if (le0 && state.phase === 'turn') {
    if (le0.type === 'auction_won') evStrip = `${who2(le0.buyer)}<span class="eva">${le0.amount ? `kauft für <b>${le0.amount}</b>` : 'bekommt'}</span>${miniCard(le0.animal)}${le0.amount && le0.payee && le0.payee !== le0.buyer ? `<span class="eva">von</span>${who2(le0.payee)}` : ''}`;
    else if (le0.type === 'special_won') evStrip = `${who2(le0.buyer)}<span class="eva">${le0.count ? `bekommt für <b>${le0.count}</b> Karten` : 'bekommt umsonst'}</span>${miniCard(le0.animal)}<span class="evstar">${STAR}</span>`;
    else if (le0.type === 'trade' && le0.animal === RAT) { const loser = le0.winner === le0.challenger ? le0.target : le0.challenger; evStrip = `${who2(loser)}<span class="eva">bekommt</span>${le0.count > 1 ? `<span class="eva"><b>${le0.count}×</b></span>` : ''}${miniCard(RAT)}<span class="eva">von</span>${who2(le0.winner)}`; }
    else if (le0.type === 'trade') { const loser = le0.winner === le0.challenger ? le0.target : le0.challenger; evStrip = `${who2(le0.winner)}<span class="eva">gewinnt</span>${le0.count > 1 ? `<span class="eva"><b>${le0.count}×</b></span>` : ''}${miniCard(le0.animal)}<span class="eva">gegen</span>${who2(loser)}`; }
    else if (le0.type === 'rat_taken') evStrip = `${who2(le0.player)}<span class="eva">nimmt die Ratte</span>${miniCard(RAT)}<span class="eva">+<b>${le0.count}</b> Karten</span>`;
  }
  // Auslage: immer sichtbar über dem Geld. Spezialkarte steckt im Stapel ihres Tiers.
  const lev = v.lastEvent;
  let bumpId = null;
  if (fresh && lev) {
    if ((lev.type === 'auction_won' || lev.type === 'special_won') && lev.buyer === meId) bumpId = lev.animal;
    if (lev.type === 'trade' && lev.animal !== RAT && lev.winner === meId) bumpId = lev.animal;
    if (lev.type === 'rat_taken' && lev.player === meId) bumpId = RAT;
  }
  const mySpecials = specialsOf(me);
  const myItems = [
    ...ANIMALS.filter((a) => me.animals[a.id] > 0).map((a) => stackHtml(a.id, me.animals[a.id], { special: mySpecials.includes(a.id), bump: bumpId === a.id })),
    ...mySpecials.filter((id) => !(me.animals[id] > 0)).map((id) => specialMini(id)),
    ...(ratsOf(me) ? [stackHtml(RAT, ratsOf(me), { bump: bumpId === RAT })] : []),
  ];
  const myAnimals = myItems.join('') || '<span class="noanimals">Noch keine Tiere</span>';
  // Viele Scheine: gleiche Werte zu einem Stapel mit „×N“ zusammenfassen, damit jeder Wert lesbar bleibt
  const grouped = me.money.length > 11;
  const fanCards = grouped ? [...new Set(me.money)].sort((x, y) => x - y).map((val) => [val, me.money.filter((m) => m === val).length]) : me.money.map((m) => [m, 1]);
  const nM = fanCards.length;
  const mid = (nM - 1) / 2;
  const step = nM > 1 ? Math.min(grouped ? 50 : 34, 290 / (nM - 1)) : 34; // Abstand zwischen zwei Scheinen
  const fan = fanCards.map(([m, cnt], i) => {
    const off = i - mid;
    const rot = nM > 1 ? off * Math.min(6, 36 / nM) : 0;
    return `<div class="money fan ${cnt > 1 ? 'multi' : ''}" style="--m:${MONEY_COLORS[m]};margin-left:${i ? Math.round(step - 46) : 0}px;transform:rotate(${rot}deg) translateY(${Math.min(14, Math.abs(off) * 2.5)}px)">${mIn(m)}${cnt > 1 ? `<span class="mcount">×${cnt}</span>` : ''}</div>`;
  }).join('');

  const trades = possibleTrades(state, meId);
  let leftActionsHtml = aucLeft;
  if (state.phase === 'turn' && !myTurn) leftActionsHtml = `<div class="ldecide">${esc(cur.name)} ist dran …</div>`;
  if (state.phase === 'turn' && myTurn && !local.tradeOpen) {
    leftActionsHtml = `
      <button type="button" class="pill pill-red" data-a="auction" ${v.deck > 0 ? '' : 'disabled'}>KARTE<br>AUFDECKEN</button>
      <button type="button" class="pill pill-white" data-a="tradeOpen" ${trades.length && !v.mustDraw ? '' : 'disabled'}>Kuhhandel</button>`;
  }
  const askMe = (state.phase === 'turn' && myTurn && !local.tradeOpen) || (state.phase === 'payment' && v.payment.payer === meId)
    || (state.phase === 'trade' && v.trade.target === meId) || (state.phase === 'rat' && ratCurrent(v) === meId) || (state.phase === 'block' && v.block.player === meId);
  const banner = aucBanner || (state.phase === 'ended' || state.phase === 'block' ? 'Spielende' : myTurn ? (v.mustDraw ? 'Nochmal aufdecken!' : 'Du bist dran') : `${esc(cur.name)} ist dran`);
  const table = `<div class="gtable">
    <div class="tbanner ${askMe ? 'mine' : ''} ${fresh && myTurn && state.phase === 'turn' ? 'pulse' : ''}" ${askMe ? `style="--c:${SEAT_COLORS[meIdx]}"` : ''}>${banner}</div>
    <div class="tcenter">${aucCenter || `${evStrip ? `<div class="evstrip" title="${esc(lastLog)}">${evStrip}</div>` : `<div class="tlog">${esc(lastLog)}</div>`}
    <div class="deck-wrap">
      ${canDraw ? `<button type="button" class="deck go" data-a="auction" aria-label="Karte aufdecken"><span class="deckcow">${art('kuh')}</span><span class="deckgo">Tippen</span></button>`
        : `<div class="deck ${v.deck === 0 ? 'empty' : ''}">${v.deck > 0 ? `<span class="deckcow">${art('kuh')}</span>` : ''}</div>`}
      <span class="deck-count ${v.deck > 0 && v.deck <= 5 ? 'low' : ''}">${v.deck > 0 ? `${v.deck} im Stapel${v.deck <= 5 ? ' – bald nur noch Kuhhandel' : ''}` : 'Stapel leer – nur Kuhhandel'}</span>
    </div>`}</div>
    <div class="auslage ${myItems.length > 6 ? 'many' : ''} ${handPick ? 'up' : ''} ${local.tradeOpen || state.phase === 'trade' ? 'hide' : ''}" style="--sc:${Math.min(1, 410 / Math.max(1, myItems.length * (myItems.length > 6 ? 46 : 54))).toFixed(3)}" aria-label="Deine Karten">${myAnimals}</div>
    ${leftActionsHtml ? `<div class="dock">${leftActionsHtml}</div>` : ''}
    ${handPick || `<div class="fan-wrap" aria-label="Dein Geld: ${sum(me.money)} Taler">${fan}${me.money.length ? `<span class="fansum">${sum(me.money)}</span>` : ''}</div>`}
  </div>`;

  // ----- Menü oben links in der Tischecke -----
  const left = `<div class="gleft">
    <div class="lround">
      <button type="button" class="round" data-a="menu" aria-label="Menü">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
      </button>
    </div>
    ${local.menu ? `<div class="menu">
      <div class="menu-row"><button type="button" class="pill pill-white pill-small" data-a="sound">Ton: ${ctx.sound ? 'an' : 'aus'}</button>
      <button type="button" class="pill pill-white pill-small" data-a="vibe">Vibration: ${ctx.vibe !== false ? 'an' : 'aus'}</button></div>
      <button type="button" class="pill pill-white pill-small" data-a="modal" data-v="rules">Spielregeln</button>
      <button type="button" class="pill pill-white pill-small" data-a="modal" data-v="design">🎨 Aussehen</button>
      <button type="button" class="pill pill-white pill-small" data-a="modal" data-v="pin">Wiedereinstieg-Code</button>
      ${ctx.standalone ? '' : '<button type="button" class="pill pill-white pill-small" data-a="modal" data-v="install">Als App aufs Handy</button>'}
      <button type="button" class="pill pill-white pill-small" data-a="exit">Spiel verlassen</button></div>` : ''}
  </div>`;

  H.menu = () => { local.menu = !local.menu; local.reactOpen = false; ctx.rerender(); };
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
  H.react = (i) => { const to = local.reactTo; local.reactTo = null; ctx.react(ctx.reactionList[Number(i)], to === meId ? null : to); };
  H.exit = () => ctx.onExit();
  H.sound = () => ctx.toggleSound();
  H.vibe = () => ctx.toggleVibe && ctx.toggleVibe();
  H.modal = (kind) => ctx.openModal(kind);
  H.auction = () => ctx.act((s) => drawForAuction(s, meId, ctx.now()));
  H.tradeOpen = () => { local.tradeOpen = true; local.sel = []; local.tradeTarget = null; local.tradeAnimal = null; ctx.rerender(); };
  H.tradeWith = (val) => { const [pid, animal] = String(val).split('|'); local.tradeOpen = true; local.sel = []; local.tradeTarget = pid; local.tradeAnimal = animal; ctx.rerender(); };

  // ----- Überlagerung je nach Phase -----
  let overlay = '';


  // Bezahlen läuft jetzt auf dem Tisch (siehe oben)

  // Kuhhandel und sein Ergebnis laufen jetzt auf dem Tisch (siehe oben)

  // Blockieren läuft jetzt auf dem Tisch (siehe oben)

  const iconsOf = (r) => `${r.quartets.map((id) => `<span class="ci" style="--a:${ANIMAL_COLORS[id]}" title="${aname(id)}">${art(id)}</span>`).join('')}${r.blocked ? `<span class="ci blocked" style="--a:${ANIMAL_COLORS[r.blocked]}" title="${aname(r.blocked)} – blockiert">${art(r.blocked)}</span>` : ''}${(r.specials || []).map((id) => `<span class="ci sp" style="--a:${ANIMAL_COLORS[id]}" title="${aname(id)}-Spezialkarte">${art(id)}${STAR}</span>`).join('')}${r.rats ? `<span class="ci" style="--a:${ANIMAL_COLORS[RAT]}" title="${r.rats}× Ratte">${art(RAT)}</span>` : ''}`;
  if (state.phase === 'ended' && local.recap) {
    const list = awards(state);
    overlay = `<div class="overlay endtable"><div class="ending recap">
      <h2>Rückblick</h2>
      <ul>${list.map((a) => { const i = idxOf(a.who); return `<li><span class="atitle">${esc(a.title)}</span>${i >= 0 ? avatar(v.players[i], i) : ''}<span class="awho">${esc(a.who === meId ? 'Du' : a.name)}</span><span class="atext">${esc(a.text)}</span></li>`; }).join('') || '<li>Keine besonderen Momente – ein ruhiges Spiel.</li>'}</ul>
      <div class="endbtns"><button type="button" class="pill pill-red" data-a="recap">Zurück zur Wertung</button></div>
    </div></div>`;
  } else if (state.phase === 'ended') {
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
        ${r.place === 1 ? '<span class="crown">👑</span>' : ''}${avatar(v.players[i], i)}
        <span class="pname2">${esc(r.id === meId ? 'Du' : r.name)}</span>
        <span class="pblock"><b>${r.score}</b><span class="picons">${iconsOf(r)}</span><i>${r.place}.</i></span></button>`;
    };
    const openRow = local.scoreOpen ? ranked.find((r) => r.id === local.scoreOpen) : null;
    const cols = ['#FFD34E', '#D7263D', '#1D5FC2', '#B8285F', '#6D3FC0', '#7FA88A', '#fff'];
    const confetti = entered ? `<div class="confetti" aria-hidden="true">${Array.from({ length: 40 }, (_, k) =>
      `<i style="left:${(k * 37) % 100}%;background:${cols[k % cols.length]};animation-delay:${(k % 10) * 90}ms;animation-duration:${1600 + (k % 7) * 180}ms;transform:rotate(${k * 29}deg)"></i>`).join('')}</div>` : '';
    overlay = `<div class="overlay endtable ${entered ? 'enter' : ''}">${confetti}<div class="ending podium">
      <h2 style="--c:${SEAT_COLORS[winIdx]}">${v.winner?.includes(meId) ? 'Du hast gewonnen!' : `${esc(s[0].name)} gewinnt!`}</h2>
      <div class="pods">${order.map(step).join('')}</div>
      ${rest.length ? `<div class="prest">${rest.map((r) => { const i = idxOf(r.id); return `<button type="button" class="prow4 ${local.scoreOpen === r.id ? 'open' : ''}" data-a="scoreOpen" data-v="${esc(r.id)}"><i>${r.place}.</i>${avatar(v.players[i], i)}<span>${esc(r.id === meId ? 'Du' : r.name)}</span><span class="picons">${iconsOf(r)}</span><b>${r.score}</b></button>`; }).join('')}</div>` : ''}
      <div class="sform2">${openRow ? `${esc(openRow.id === meId ? 'Du' : openRow.name)}: ${scoreFormula(v.players[idxOf(openRow.id)], openRow.blocked)}${openRow.blocked ? ` · ${esc(aname(openRow.blocked))} blockiert` : ''}` : ''}</div>
      <div class="endbtns">
        <button type="button" class="pill pill-white" data-a="recap">Rückblick</button>
        <button type="button" class="pill pill-red ${ctx.rematchId ? 'pulse' : ''}" data-a="rematch">${ctx.rematchId ? 'Revanche läuft – mitmachen' : 'Revanche'}</button>
        <button type="button" class="pill pill-white" data-a="exit">Zur Startseite</button>
      </div>
    </div></div>`;
  }

  H.rematch = () => ctx.onRematch();
  H.recap = () => { local.recap = !local.recap; ctx.rerender(); };
  H.scoreOpen = (id) => { local.scoreOpen = local.scoreOpen === id ? null : id; ctx.rerender(); };

  // ----- Effekte: Tier fliegt zum neuen Besitzer, Konfetti am Ende, Quartett-Moment -----
  let effects = '';
  const quartets = [];
  v.players.forEach((p) => Object.entries(p.animals).forEach(([id, n]) => { if (n === 4) quartets.push(`${p.id}|${id}`); }));
  if (local.prevQuartets) {
    const added = quartets.filter((q) => !local.prevQuartets.includes(q));
    if (added.length) {
      const [pid, animal] = added[0].split('|');
      const who = pid === meId ? 'Du hast' : `${esc(nameOf(pid))} hat`;
      effects += `<div class="qpop" aria-live="polite"><div class="qcards">${[0, 1, 2, 3].map((k) => `<div class="qc" style="--k:${k};--a:${ANIMAL_COLORS[animal]}">${art(animal)}</div>`).join('')}</div>
        <b>Quartett!</b><span>${who} alle 4× ${aname(animal)}</span></div>`;
    }
  }
  local.prevQuartets = quartets;
  const le = v.lastEvent;
  // Zuschlag: kurzes Schild mit Hammer in der Tischmitte
  let gavel = null;
  if (entered && state.phase === 'payment' && prev.phase === 'auction' && !v.payment.special) {
    gavel = v.payment.buyer === v.payment.payee
      ? `${esc(nameOf(v.payment.buyer))} ${v.payment.buyer === meId ? 'kaufst' : 'kauft'} selbst für ${v.payment.amount}!`
      : `Verkauft an ${esc(v.payment.buyer === meId ? 'dich' : nameOf(v.payment.buyer))} für ${v.payment.amount}!`;
  }
  if (fresh && le?.type === 'auction_won' && le.amount === 0 && prev.phase === 'auction') gavel = `Niemand bietet – ${esc(le.buyer === meId ? 'du bekommst' : `${nameOf(le.buyer)} bekommt`)} es umsonst`;
  if (gavel) { effects += `<div class="soldsign" aria-live="polite"><span class="ghammer">🔨</span><b>${gavel}</b></div>`; if (!sounds.includes('gavel')) sounds.push('gavel'); }
  if (fresh && (state.phase === 'turn' || state.phase === 'ended') && le && (le.type === 'auction_won' || le.type === 'trade' || le.type === 'special_won' || le.type === 'rat_taken')) {
    let to = le.type === 'trade' ? le.winner : le.type === 'rat_taken' ? le.player : le.buyer;
    if (le.type === 'trade' && le.animal === RAT) to = le.winner === le.challenger ? le.target : le.challenger;
    const flyAnimal = le.type === 'rat_taken' ? RAT : le.animal;
    const mine = to === meId;
    const ty = mine ? 125 : Math.round(posY(to) - 195);
    const tx = mine ? 30 : 716 - 319;
    const n = le.type === 'trade' ? le.count : 1;
    effects += Array.from({ length: n }, (_, k) => `<div class="fly" style="--tx:${tx}px;--ty:${ty}px;animation-delay:${k * 120}ms">
      <div class="bigcard-head" style="--a:${ANIMAL_COLORS[flyAnimal]}"><span class="mono">${art(flyAnimal)}</span>${le.type === 'special_won' ? STAR : ''}</div></div>`).join('');
  }
  // Geld fliegt (verdeckt) vom Zahler zum Empfänger
  const rowY = (id) => posY(id);
  const moneyFly = (from, to, count, delay = 0) => {
    if (!count || idxOf(from) < 0 || idxOf(to) < 0) return '';
    const y0 = rowY(from);
    const dy = Math.round(rowY(to) - y0);
    return Array.from({ length: Math.min(count, 5) }, (_, k) => `<div class="mfly" style="top:${Math.round(y0 - 16)}px;--dy:${dy}px;animation-delay:${delay + k * 90}ms"></div>`).join('');
  };
  if (fresh && le && (state.phase === 'turn' || state.phase === 'ended')) {
    if (le.type === 'auction_won' && le.amount > 0 && le.payer && le.payee) effects += moneyFly(le.payer, le.payee, le.cardCount || 1, 250);
    if (le.type === 'special_won' && le.count > 0 && le.payer && le.payee) effects += moneyFly(le.payer, le.payee, le.count, 250);
    if (le.type === 'trade') {
      const cnt = (x) => (Array.isArray(x) ? x.length : x || 0);
      effects += moneyFly(le.challenger, le.target, cnt(le.offer));
      if (!le.accepted) effects += moneyFly(le.target, le.challenger, cnt(le.counter), 150);
    }
  }

  // Geräusche zu den Ereignissen
  if (entered && (state.phase === 'rat' || state.phase === 'special')) sounds.push('flip');
  if (fresh && state.phase === 'rat' && !entered) sounds.push('bid');
  // Geldschein aus dem Stapel: Karte groß für alle zeigen, dann fliegt sie zum Spieler
  const lem = v.lastEvent;
  const moneySig = lem?.type === 'money_drawn' ? `${state.log.length}|${lem.player}|${lem.value}` : null;
  if (moneySig && fresh && local.moneySig !== moneySig) { local.moneySig = moneySig; local.moneyUntil = Date.now() + 2600; }
  if (moneySig && local.moneySig === moneySig && Date.now() < (local.moneyUntil || 0)) {
    const mineM = lem.player === meId;
    const ty = mineM ? 150 : Math.round(posY(lem.player)) - 170;
    effects += `<div class="moneyreveal" style="--ty:${ty}px;--tx:${mineM ? 40 : 397}px">
      <div class="money big" style="--m:${MONEY_COLORS[lem.value] || '#eee'}">${mIn(lem.value)}</div>
      <span class="mrlabel">${esc(lem.player === meId ? 'Du' : nameOf(lem.player))} ${lem.player === meId ? 'ziehst' : 'zieht'} <b>${lem.value}</b></span></div>`;
  }
  if (state.phase === 'special') {
    const sp = v.special;
    const t = ctx.now();
    const st = specialStage(v, t);
    const n = st === 'countdown' ? specialNumber(v, t) : null;
    if (n != null && n <= 3 && n > 0 && local.lastTick !== `${sp.startsAt}|${n}`) { local.lastTick = `${sp.startsAt}|${n}`; sounds.push('tick'); }
    const nb = Object.keys(sp.buzzes).length;
    if ((local.prevBuzz ?? nb) < nb) sounds.push('buzz');
    local.prevBuzz = nb;
    // Schnick-Schnack-Schnuck: Hände schütteln, dann aufdecken
    const le2 = v.lastEvent;
    const sig = le2?.type === 'rps' ? JSON.stringify(le2) : null;
    if (sig && local.rpsSig !== sig) { local.rpsSig = sig; local.rpsUntil = Date.now() + 2800; sounds.push('rps'); }
    if (sig && Date.now() < (local.rpsUntil || 0)) {
      const names = Object.keys(le2.picks);
      const result = le2.winners ? (le2.winners.length === 1 ? `${esc(nameOf(le2.winners[0]))} ${le2.winners[0] === meId ? 'gewinnst' : 'gewinnt'}!` : 'Weiter geht’s!') : 'Unentschieden – nochmal!';
      effects += `<div class="rpsshow v2" aria-live="polite">
        <div class="rpswords"><span>Schnick</span><span>Schnack</span><span>Schnuck!</span></div>
        <div class="rpshands">${names.map((id) => `<div class="rh"><div class="hand"><b class="shake">✊</b><b class="real">${RPS_ICON[le2.picks[id]]}</b></div><small>${esc(nameOf(id))}</small></div>`).join('')}</div>
        <div class="rpsresult">${result}</div></div>`;
    }
  } else {
    local.prevBuzz = undefined;
  }
  if (entered && state.phase === 'ended') {
    const sc = scores(state).sort((a, b) => b.score - a.score);
    const last = sc.length > 1 && sc[sc.length - 1].id === meId && sc[sc.length - 1].score < sc[0].score;
    sounds.push(last ? 'boo' : 'fanfare');
  }
  if (entered && state.phase === 'auction') { sounds.push('flip'); if (v.lastEvent?.type === 'donkey') sounds.push('coins'); }
  else if (fresh && state.phase === 'auction' && auction.high) sounds.push('bid');
  // Überboten: du lagst vorne, jetzt jemand anderes
  if (state.phase === 'auction' && prev.phase === 'auction' && prev.highMe && auction.high && auction.high.player !== meId) {
    sounds.push('outbid');
    effects += `<div class="outbid" aria-live="polite">Überboten!</div>`;
  }
  if (fresh && le && (state.phase === 'turn' || state.phase === 'ended')) {
    if (le.type === 'auction_won') { sounds.push('gavel'); if (le.amount > 0) sounds.push('coins'); }
    if (le.type === 'special_won') { sounds.push('gavel'); if (le.count > 0) sounds.push('coins'); }
    if (le.type === 'rat_taken' && le.count > 0) sounds.push('coins');
    if (le.type === 'money_drawn') { sounds.push('flip'); sounds.push('coins'); }
    if (le.type === 'trade') sounds.push('trade');
  }
  if (effects.includes('class="qpop"') || (entered && state.phase === 'ended')) sounds.push('quartet');




  // Was ist passiert: kurz groß in der Tischmitte, danach klein oben
  const ownEffect = /class="(qpop|soldsign|moneyreveal)"/.test(effects) || (aucCenter && state.phase === 'turn');
  if (fresh && state.phase === 'turn' && lastLog && !ownEffect && !(le?.type === 'money_drawn')) {
    effects += `<div class="logpop" aria-live="polite">${esc(lastLog)}</div>`;
  }

  // Esel aufgedeckt: eine große Einblendung, Scheine fliegen zu allen
  // (läuft über Neuzeichnen hinweg weiter: Startzeit merken, Animation an der richtigen Stelle fortsetzen)
  if (state.phase === 'auction' && v.lastEvent?.type === 'donkey') {
    const dSig = `${state.log.length}|${v.lastEvent.number}`;
    if (local.donkeySig !== dSig) { local.donkeySig = dSig; local.donkeyAt = entered ? Date.now() : 0; }
    const el = Date.now() - (local.donkeyAt || 0);
    if (local.donkeyAt && el < 4200) {
      effects += `<div class="donkeypop" aria-live="polite" style="animation-delay:${1500 - el}ms"><b>Esel!</b><span>Alle bekommen +${v.lastEvent.payout}</span></div>`;
      if (el < 3400) effects += v.players.map((p) => `<div class="mflyc" style="animation-delay:${2400 - el}ms;--dy:${Math.round(p.id === meId ? 60 : rowY(p.id) - 275)}px;--tx:${p.id === meId ? 40 : 397}px"></div>`).join('');
      if (!wake || wake > Date.now() + 4300 - el) wake = Date.now() + 4300 - el; // danach einmal aufräumen
    }
  }

  root.innerHTML = `<div class="stage-wrap"><div class="stage" id="stage">
    ${left}
    ${table}
    <div class="gright">${playersCol}</div>
    ${overlay}
    ${effects}
    ${wake ? `<i hidden data-wake="${wake}"></i>` : ''}
    ${(ctx.autoplay || []).includes(meId) && state.phase !== 'ended' ? `<div class="botbar" role="alert"><span>🤖 Ein Test-Spieler spielt gerade für dich.</span><button type="button" data-a="selfPlay">Selbst weiterspielen</button></div>` : ''}
    ${local.reactTo && ctx.reactionList && idxOf(local.reactTo) >= 0 ? `<div class="reactpick withdetail ${local.reactTo === meId ? 'self' : ''}" style="top:6px">
      <div class="rphead">${local.reactTo === meId ? 'Du · Reaktion an alle' : `An ${esc(nameOf(local.reactTo))}`}<button type="button" data-a="reactClose" aria-label="Schließen">✕</button></div>
      ${playerDetail(v.players[idxOf(local.reactTo)], local.reactTo === meId)}
      ${ctx.reactionList.map((r, i) => `<button type="button" data-a="react" data-v="${i}">${esc(r)}</button>`).join('')}</div>` : ''}
    ${ctx.toastMsg ? `<div class="toast" role="alert">${esc(ctx.toastMsg)}</div>` : ''}
  </div></div>`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const fn = H[b.dataset.a];
    if (fn) fn(b.dataset.v);
  };
  fitStage();
  if (ctx.playSound) [...new Set(sounds)].forEach((k, i) => setTimeout(() => ctx.playSound(k), i * 180));
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
  const s = Math.min((window.innerWidth - padX) / 844, (window.innerHeight - padY) / 390);
  st.style.transform = `scale(${s})`;
  st.classList.toggle('small', s < 0.9 || new URLSearchParams(location.search).has('small'));
  st.parentElement.style.width = `${844 * s}px`;
  st.parentElement.style.height = `${390 * s}px`;
}
window.addEventListener('resize', fitStage);
