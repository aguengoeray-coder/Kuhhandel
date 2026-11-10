// Kuhhandel – Spieltisch im Querformat (alle Spielphasen)
import {
  ANIMALS, ANIMAL_BY_ID, DONKEY_PAYOUTS, BID_STEP, AUCTION_START_MS, AUCTION_BID_MS,
  viewFor, possibleTrades, scores, currentPlayer,
  drawForAuction, bid, passAuction, closeAuction, pay,
  startTrade, acceptTrade, counterTrade, bestPay,
  RAT, RAT_COUNT, SPECIAL_VALUE, SPECIAL_TICK_MS, SPECIAL_FROM, scoreFor,
  ratCurrent, ratLay, ratTake, buzz, rpsPick, specialDecide, specialStage, specialNumber, specialResult, specialDecideAt, chooseBlock,
} from '../src/engine.js';
import { art, STAR } from './animals.js';

export const SEAT_COLORS = ['#C2570C', '#1D5FC2', '#B8285F', '#6D3FC0'];
const ANIMAL_COLORS = {
  hahn: '#E8B04B', gans: '#C9C2AE', katze: '#C98A5B', hund: '#A7744A', schaf: '#D9CFB3',
  ziege: '#B9B08F', esel: '#9AA6AD', schwein: '#E7A1A0', kuh: '#7FA88A', pferd: '#8C6A4F',
  ratte: '#9B95A0',
};
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

function moneyCard(v, { idx = null, selected = false, size = '' } = {}) {
  const cls = `money ${size} ${selected ? 'sel' : ''}`;
  const style = `--m:${MONEY_COLORS[v] || '#eee'}`;
  if (idx === null) return `<div class="${cls}" style="${style}">${v}</div>`;
  return `<button type="button" class="${cls}" style="${style}" data-a="toggle" data-v="${idx}" aria-pressed="${selected}" aria-label="Geldkarte ${v}">${v}</button>`;
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
      <span class="pv">${v}</span><span class="pc">×${left}</span></button>`;
  }).join('')}</div>`;
}

// Ausgewählte Scheine: Tippen nimmt sie wieder zurück
function chosenCards(money, sel, empty = 4) {
  const cards = sel.map((i) => `<button type="button" class="money xs" style="--m:${MONEY_COLORS[money[i]]}" data-a="remove" data-v="${i}" aria-label="${money[i]} zurücknehmen">${money[i]}</button>`).join('');
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

// Spezialkarte (klein): Tierbild mit Stern, Wert 250
function specialMini(id) {
  return `<div class="amini special" title="${aname(id)}-Spezialkarte">
    <div class="acard sp" style="--a:${ANIMAL_COLORS[id]}"><i></i><b>${art(id)}</b>${STAR}<em class="cv">${SPECIAL_VALUE}</em></div>
    <span>${aname(id)} ★</span>
  </div>`;
}

// Kleine Symbole in der Spielerspalte: „2× [Tier]“, Ratten, Spezialkarten
function playerChips(p) {
  const out = [];
  for (const a of ANIMALS) {
    const n = p.animals[a.id] || 0;
    if (n > 0) out.push(`<span class="chip ${n === 4 ? 'done' : ''}" title="${n}× ${a.name}"><em>${n}×</em><span class="ci" style="--a:${ANIMAL_COLORS[a.id]}">${art(a.id)}</span></span>`);
  }
  const r = ratsOf(p);
  if (r > 0) out.push(`<span class="chip rat" title="${r}× Ratte"><em>${r}×</em><span class="ci" style="--a:${ANIMAL_COLORS[RAT]}">${art(RAT)}</span></span>`);
  for (const id of specialsOf(p)) out.push(`<span class="chip sp" title="${aname(id)}-Spezialkarte"><span class="ci" style="--a:${ANIMAL_COLORS[id]}">${art(id)}</span>${STAR}</span>`);
  return out.join('');
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

function specialCard(id, extraRows = '', cls = '') {
  return `<div class="bigcard spcard ${cls}">
    <div class="bigcard-in">
      <div class="bigcard-head" style="--a:${ANIMAL_COLORS[id]}"><span class="mono">${art(id)}</span><span>SPEZIAL</span>${STAR}</div>
      <div class="row hl"><span>Spezialkarte · nicht handelbar</span><strong>${SPECIAL_VALUE}</strong></div>
      ${extraRows}
    </div>
  </div>`;
}

function ratCard(extraRows = '', cls = '') {
  return `<div class="bigcard ratcard ${cls}">
    <div class="bigcard-in">
      <div class="bigcard-head" style="--a:${ANIMAL_COLORS[RAT]}"><span class="mono">${art(RAT)}</span><span>RATTE</span></div>
      <div class="row hl"><span>Wer am Ende alle 4 hat</span><strong>−1 Quartett</strong></div>
      ${extraRows}
    </div>
  </div>`;
}

function bigAnimalCard(id, extraRows = '', cls = '') {
  const a = ANIMAL_BY_ID[id];
  return `<div class="bigcard ${cls}">
    <div class="bigcard-in">
      <div class="bigcard-head" style="--a:${ANIMAL_COLORS[id]}"><span class="mono">${art(id)}</span><span>${esc(a.name.toUpperCase())}</span></div>
      <div class="row hl"><span>Quartettwert</span><strong>${a.value}</strong></div>
      ${extraRows}
    </div>
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
  local.prev = { logLen: state.log.length, phase: state.phase };

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
      else if (sp.caps[p.id] != null) status = `erst ab ${sp.caps[p.id]}`;
    }
    const chips = playerChips(p);
    const leader = state.phase === 'auction' && auction.high && auction.high.player === p.id
      ? `<div class="hightag ${fresh ? 'pop' : ''}"><span>Höchstgebot</span><b>${auction.high.amount}</b></div>` : '';
    const turnMark = (state.phase === 'rat' ? ratCurrent(v) === p.id : cur.id === p.id) && state.phase !== 'ended' ? ' turn' : '';
    const offline = ctx.online && !isMe && !ctx.online.has(p.id);
    if (offline) status = 'offline';
    const dim = (state.phase === 'auction' && auction.passed.includes(p.id)) || offline ? ' dim' : '';
    const coin = entered && state.phase === 'auction' && v.lastEvent?.type === 'donkey' ? `<span class="coinpop">+${v.lastEvent.payout}</span>` : '';
    const said = ctx.reactions?.[p.id];
    const from = said?.from && said.from !== p.id ? said.from : null;
    const fromIdx = from ? idxOf(from) : -1;
    const bubble = said ? `<div class="rbubble ${from ? 'to' : ''}" ${fromIdx >= 0 ? `style="--c:${SEAT_COLORS[fromIdx]}"` : ''}>${fromIdx >= 0 ? `<small>${esc(nameOf(from))} →</small>` : ''}${esc(said.text)}</div>` : '';
    const nudge = ctx.nudgeWho === p.id && !isMe ? `<button type="button" class="nudge" data-a="nudge" data-v="${esc(p.id)}" aria-label="${esc(p.name)} anstupsen">👉 Anstupsen</button>` : '';
    return `<div class="prow${turnMark}${dim}" data-a="reactTo" data-v="${esc(p.id)}" role="button" aria-label="${esc(isMe ? 'Reaktion senden' : `Reaktion an ${p.name}`)}">${coin}
      ${bubble}${nudge}
      ${leader}
      <div class="chips">${chips}</div>
      <div class="pid">
        ${avatar(p, i)}
        <div class="pname"><span class="ribbon-s" style="--c:${SEAT_COLORS[i]}">${esc(isMe ? 'Du' : p.name)}</span><span class="tag-s">${status}</span></div>
      </div>
    </div>`;
  }).join('');

  // ----- Versteigerung: findet direkt auf dem Tisch statt -----
  let aucCenter = '';
  let aucLeft = '';
  let aucBanner = '';
  if (state.phase === 'auction') {
    const a = auction;
    const iAmAuctioneer = a.auctioneer === meId;
    const high = a.high ? a.high.amount : 0;
    const cap = a.caps[meId];
    const canBid = (amt) => cap == null || amt <= cap;
    const owners = v.players.filter((p) => p.animals[a.animal] > 0).map((p) => `${esc(p.id === meId ? 'Du' : p.name)} ${p.animals[a.animal]}`).join(', ') || 'noch niemand';
    let bonusRow = '';
    if (a.animal === 'esel' && v.lastEvent?.type === 'donkey') bonusRow = `<div class="row"><span>Esel-Bonus</span><strong>alle +${v.lastEvent.payout}</strong></div>`;
    const card = bigAnimalCard(a.animal, `${bonusRow}<div class="row"><span>Schon bei</span><span>${owners}</span></div><div class="row line"><span>Du hast</span><span>${me.animals[a.animal]}</span></div>`, `compact ${entered ? 'deal' : ''}`);

    // Countdown: Bieten nur solange die Zeit läuft, Zuschlag erst danach
    const now = ctx.now();
    const running = a.endsAt != null && now < a.endsAt;
    const secs = running ? Math.ceil((a.endsAt - now) / 1000) : 0;
    const total = a.high ? AUCTION_BID_MS : AUCTION_START_MS;
    const pct = running ? Math.max(0, Math.min(100, ((a.endsAt - now) / total) * 100)) : 0;
    const countdown = a.endsAt != null
      ? `<div class="countdown ${running ? '' : 'over'}" data-ends="${a.endsAt}" data-total="${total}">
          <i style="width:${pct}%"></i><span>${running ? `noch ${secs} s` : 'Zeit abgelaufen'}</span></div>`
      : '';

    const ev = v.lastEvent;
    const info = ev?.type === 'cant_pay' && !a.high
      ? `<div class="reveal-row ${fresh ? 'shake' : ''}"><strong>${esc(nameOf(ev.player))} ${ev.player === meId ? 'kannst' : 'kann'} ${ev.amount} nicht zahlen:</strong>
          <span class="reveal-cards">${ev.revealed.map((m) => moneyCard(m, { size: 'xs' })).join('') || 'keine Karten'}</span>
          <span>→ max. ${ev.amount - BID_STEP}</span></div>`
      : `<div class="aucinfo ${fresh ? 'pop' : ''}">${a.high ? `Höchstgebot <b>${high}</b> · ${esc(nameOf(a.high.player))}` : 'Noch kein Gebot'}</div>`;

    aucBanner = `${esc(nameOf(a.auctioneer))} ${iAmAuctioneer ? 'versteigerst' : 'versteigert'}`;
    aucCenter = `<div class="auc">${card}${countdown}${info}</div>`;

    if (iAmAuctioneer) {
      const myTotal = sum(me.money);
      if (running) {
        aucLeft = `<div class="ldecide">Du versteigerst.<br>Wenn die Zeit um ist, entscheidest du: Zuschlag oder selbst kaufen.</div>`;
      } else if (a.high) {
        aucLeft = `<button type="button" class="pill pill-red" data-a="sell"><small>ZUSCHLAG AN</small>${esc(nameOf(a.high.player))}</button>
          <button type="button" class="pill pill-white" data-a="buy" ${myTotal >= high ? '' : 'disabled'}><small>SELBST KAUFEN</small>${high}</button>`;
      } else {
        aucLeft = `<button type="button" class="pill pill-red" data-a="sell"><small>NIEMAND HAT GEBOTEN</small>Tier nehmen</button>`;
      }
    } else if (running) {
      const passed = a.passed.includes(meId);
      // Ein Knopf pro Scheinwert, den es im Spiel gibt: aufs Höchstgebot draufbieten
      const steps = [10, 20, 50, 100, 200, 500];
      aucLeft = `<div class="lhead">Bieten</div>
        <div class="bidgrid">${steps.map((st) => {
          const amt = high + st;
          return `<button type="button" class="bidbtn" style="--m:${MONEY_COLORS[st]}" data-a="bid" data-v="${amt}" ${canBid(amt) ? '' : 'disabled'} aria-label="${amt} bieten"><b>+${st}</b><small>= ${amt}</small></button>`;
        }).join('')}</div>
        <button type="button" class="pill pill-white pill-small" data-a="pass" ${passed ? 'disabled' : ''}>${passed ? 'Gepasst' : 'Passen'}</button>`;
    } else {
      aucLeft = `<div class="ldecide">Zeit abgelaufen –<br>${esc(nameOf(a.auctioneer))} entscheidet …</div>`;
    }

    H.bid = (amt) => ctx.act((s) => bid(s, meId, Number(amt), ctx.now()));
    H.pass = () => ctx.act((s) => passAuction(s, meId, ctx.now()));
    H.sell = () => ctx.act((s) => closeAuction(s, meId, 'sell', ctx.now()));
    H.buy = () => ctx.act((s) => closeAuction(s, meId, 'buy', ctx.now()));
  }

  // ----- Rattenrunde: reihum Karte legen oder Ratte nehmen -----
  let wake = null; // wann neu zeichnen (Buzzer-Countdown)
  if (state.phase === 'rat') {
    const r = v.rat;
    const turnId = ratCurrent(v);
    const potCount = r.pot;
    const pot = `<div class="pot">${Array.from({ length: Math.min(potCount, 14) }, (_, k) => `<div class="money xs back" style="--r:${(k * 37) % 21 - 10}deg"></div>`).join('') || '<span>noch leer</span>'}</div>`;
    aucBanner = 'Rattenrunde';
    aucCenter = `<div class="auc">${ratCard(`<div class="row"><span>In der Mitte</span><strong>${karten(potCount)}</strong></div><div class="row line"><span>Am Zug</span><span>${esc(nameOf(turnId))}</span></div>`, `compact ${entered ? 'deal' : ''}`)}${pot}</div>`;
    if (turnId === meId) {
      const values = [...new Set(me.money)].sort((a, b) => a - b);
      aucLeft = `<div class="lhead">Karte verdeckt legen</div>
        ${values.length ? `<div class="bidgrid">${values.map((val) => `<button type="button" class="bidbtn" style="--m:${MONEY_COLORS[val]}" data-a="ratLay" data-v="${val}" aria-label="${val} verdeckt legen"><b>${val}</b><small>×${me.money.filter((m) => m === val).length}</small></button>`).join('')}</div>` : '<div class="ldecide">Du hast keine Karten mehr – du musst die Ratte nehmen.</div>'}
        <button type="button" class="pill pill-red" data-a="ratTake"><small>RATTE NEHMEN</small>+ ${karten(potCount)}</button>`;
    } else {
      aucLeft = `<div class="ldecide">${esc(nameOf(turnId))} ist dran:<br>Karte legen oder die Ratte nehmen.</div>`;
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
    } else {
      info = '<div class="aucinfo">Wer zuerst drückt, zahlt so viele Karten</div>';
    }
    aucBanner = `${esc(nameOf(sp.revealer))} ${iRevealed ? 'hast' : 'hat'} eine Spezialkarte`;
    aucCenter = `<div class="auc spauc">${specialCard(sp.animal, `<div class="row"><span>Passt zu</span><span>${esc(aname(sp.animal))}-Quartett</span></div>`, `compact ${entered ? 'deal' : ''}`)}${big}${info}</div>`;

    if (stage === 'wait' || stage === 'countdown') {
      if (iRevealed) {
        aucLeft = '<div class="ldecide">Du hast aufgedeckt.<br>Die anderen buzzern – danach entscheidest du: kaufen oder verkaufen.</div>';
      } else {
        const cap = sp.caps[meId];
        const mine = sp.buzzes[meId];
        const blocked = stage === 'wait' || mine != null || (top != null && num < top) || (cap != null && num > cap);
        const label = mine != null ? `Gebuzzert bei ${mine}` : stage === 'wait' ? 'Gleich …' : cap != null && num > cap ? `Erst ab ${cap}` : `bei ${num} = ${karten(num)}`;
        aucLeft = `<div class="lhead">Spezialkarte</div>
          <button type="button" class="buzzer" data-a="buzz" ${blocked ? 'disabled' : ''}><b>BUZZ!</b><small>${label}</small></button>
          <div class="lnote">Drück, sobald die Zahl passt: so viele verdeckte Karten würdest du zahlen.</div>`;
      }
    } else if (stage === 'rps') {
      const r = sp.rps;
      const players = r ? r.players : buzzed;
      const inIt = players.includes(meId);
      const picked = r?.picks?.[meId];
      const last = r?.last;
      const lastRow = last ? `<div class="rpslast">${Object.entries(last.picks).map(([id, c]) => `${esc(nameOf(id))} ${RPS_ICON[c]}`).join(' · ')}${last.winners ? '' : ' → nochmal!'}</div>` : '';
      aucCenter = `<div class="auc spauc">${specialCard(sp.animal, '', 'compact')}<div class="aucinfo">Gleichstand bei <b>${top}</b>: ${players.map((id) => esc(nameOf(id))).join(' gegen ')}</div>${lastRow}</div>`;
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
      aucLeft = `<div class="ldecide">${esc(nameOf(sp.revealer))} entscheidet:<br>kaufen oder verkaufen …</div>`;
    }
    H.buzz = () => { const t = ctx.now(); ctx.act((s) => buzz(s, meId, t)); };
    H.rps = (c) => ctx.act((s) => rpsPick(s, meId, c, ctx.now()));
    H.spSell = () => ctx.act((s) => specialDecide(s, meId, 'sell', ctx.now()));
    H.spBuy = () => ctx.act((s) => specialDecide(s, meId, 'buy', ctx.now()));
  }

  // ----- Tisch -----
  const nextDonkey = v.donkeysDrawn < 4 ? DONKEY_PAYOUTS[v.donkeysDrawn] : null;
  const lastLog = v.log[v.log.length - 1] || '';
  const myItems = [
    ...ANIMALS.filter((a) => me.animals[a.id] > 0).map((a) => animalMini(a.id, me.animals[a.id])),
    ...(ratsOf(me) ? [animalMini(RAT, ratsOf(me))] : []),
    ...specialsOf(me).map(specialMini),
  ];
  const myAnimals = myItems.join('') || '<span class="noanimals">Noch keine Tiere</span>';
  const mid = (me.money.length - 1) / 2;
  const fan = me.money.map((m, i) => {
    const off = i - mid;
    const rot = me.money.length > 1 ? off * Math.min(7, 40 / me.money.length) : 0;
    return `<div class="money fan" style="--m:${MONEY_COLORS[m]};transform:rotate(${rot}deg) translateY(${Math.abs(off) * 3}px)">${m}</div>`;
  }).join('');

  const banner = aucBanner || (state.phase === 'ended' || state.phase === 'block' ? 'Spielende' : myTurn ? 'Du bist dran' : `${esc(cur.name)} ist dran`);
  const table = `<div class="gtable">
    <div class="tbanner ${fresh && myTurn && state.phase === 'turn' ? 'pulse' : ''}">${banner}</div>
    ${aucCenter || `<div class="tlog">${esc(lastLog)}</div>
    <div class="deck-wrap">
      <div class="deck ${v.deck === 0 ? 'empty' : ''}">${v.deck > 0 ? 'KH' : ''}</div>
      <span class="deck-count">${v.deck > 0 ? `${v.deck} im Stapel` : 'Stapel leer – nur Kuhhandel'}</span>
      ${v.mustDraw ? '<span class="deck-count must">Nach der Ratte: nochmal aufdecken!</span>' : ''}
    </div>
    <div class="myanimals ${myItems.length > 8 ? 'many' : ''}">${myAnimals}</div>`}
    <div class="fan-wrap" aria-label="Dein Geld: ${sum(me.money)} Taler">${fan}</div>
  </div>`;

  // ----- linke Spalte -----
  const trades = possibleTrades(state, meId);
  let leftActions = aucLeft;
  if (state.phase === 'turn' && myTurn) {
    leftActions = `
      <button type="button" class="pill pill-red" data-a="auction" ${v.deck > 0 ? '' : 'disabled'}>KARTE<br>AUFDECKEN</button>
      <button type="button" class="pill pill-white" data-a="tradeOpen" ${trades.length && !v.mustDraw ? '' : 'disabled'}>Kuhhandel</button>`;
  }
  const left = `<div class="gleft">
    <div class="lround">
      <button type="button" class="round" data-a="menu" aria-label="Menü">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
      </button>
    </div>
    ${local.menu ? `<div class="menu">
      <button type="button" class="pill pill-white pill-small" data-a="sound">Ton &amp; Vibration: ${ctx.sound ? 'an' : 'aus'}</button>
      <button type="button" class="pill pill-white pill-small" data-a="modal" data-v="rules">Spielregeln</button>
      <button type="button" class="pill pill-white pill-small" data-a="modal" data-v="pin">Wiedereinstieg-Code</button>
      ${ctx.standalone ? '' : '<button type="button" class="pill pill-white pill-small" data-a="modal" data-v="install">Als App aufs Handy</button>'}
      <button type="button" class="pill pill-white pill-small" data-a="exit">Spiel verlassen</button>
      <span>Über die Startseite kommst du jederzeit zurück ins Spiel.</span></div>` : ''}
    <div class="infochips">
      <span class="ichip">Geld: <b>${sum(me.money)}</b></span>
      <span class="ichip">Punkte jetzt: <b>${scoreFor(me).score}</b></span>
      ${nextDonkey ? `<span class="ichip">Nächster Esel: <b>+${nextDonkey}</b></span>` : '<span class="ichip">Alle Esel sind raus</span>'}
    </div>
    <div class="lactions ${['auction', 'rat', 'special'].includes(state.phase) ? 'auction' : ''}">${leftActions}</div>
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
  H.reactClose = () => { local.reactTo = null; ctx.rerender(); };
  H.react = (i) => { const to = local.reactTo; local.reactTo = null; ctx.react(ctx.reactionList[Number(i)], to === meId ? null : to); };
  H.exit = () => ctx.onExit();
  H.sound = () => ctx.toggleSound();
  H.modal = (kind) => ctx.openModal(kind);
  H.auction = () => ctx.act((s) => drawForAuction(s, meId, ctx.now()));
  H.tradeOpen = () => { local.tradeOpen = true; local.sel = []; local.tradeTarget = null; local.tradeAnimal = null; ctx.rerender(); };

  // ----- Überlagerung je nach Phase -----
  let overlay = '';


  if (state.phase === 'payment' && v.payment.special) {
    const pm = v.payment;
    const card = specialCard(pm.special);
    if (pm.payer === meId) {
      const n = local.sel.length;
      const status = n < pm.count ? `Noch ${karten(pm.count - n)} wählen` : n === pm.count ? 'Passt' : `${karten(n - pm.count)} zu viel`;
      overlay = `<div class="overlay light ${entered ? 'enter' : ''}">
        <div class="pay">
          <h2>Zahle ${karten(pm.count)} an ${esc(nameOf(pm.payee))}</h2>
          <p>Für die ${esc(aname(pm.special))}-Spezialkarte. Es zählt nur die Anzahl – du suchst selbst aus, welche.</p>
          <div class="chosen"><small>Ausgewählt (antippen zum Zurücknehmen):</small><div class="slots wide">${chosenCards(me.money, local.sel, pm.count)}</div></div>
          ${moneyPiles(me.money, local.sel)}
          <div class="payrow"><div class="paystatus ${n === pm.count ? 'ok' : 'bad'}">${status}</div>
            <button type="button" class="pill pill-white pill-small" data-a="autocount">Kleinste wählen</button></div>
        </div>
        <div class="bottom-bar"><button type="button" class="pill pill-red big" data-a="pay" ${n === pm.count ? '' : 'disabled'}><small>BEZAHLEN</small>${karten(n)}</button></div>
      </div>`;
      H.pay = () => ctx.act((s) => pay(s, meId, local.sel));
      H.autocount = () => { local.sel = me.money.map((m, i) => [m, i]).sort((a, b) => a[0] - b[0]).slice(0, pm.count).map(([, i]) => i); ctx.rerender(); };
    } else {
      overlay = `<div class="overlay light ${entered ? 'enter' : ''}"><div class="wait">
        ${card}
        <p><strong>${esc(nameOf(pm.payer))}</strong> ${pm.payer === meId ? 'zahlst' : 'zahlt'} ${karten(pm.count)} an <strong>${esc(nameOf(pm.payee))}</strong> …</p>
      </div></div>`;
    }
  } else if (state.phase === 'payment') {
    const pm = v.payment;
    if (pm.payer === meId) {
      const diff = selSum - pm.amount;
      const status = diff < 0 ? `Es fehlen noch ${-diff}` : diff === 0 ? 'Passt genau' : `Du überzahlst um ${diff} – kein Wechselgeld`;
      overlay = `<div class="overlay light ${entered ? 'enter' : ''}">
        <div class="pay">
          <h2>Zahle ${pm.amount} an ${esc(nameOf(pm.payee))}</h2>
          <p>Für: ${aname(pm.animal)}. Wähle Karten, die zusammen mindestens ${pm.amount} ergeben.</p>
          <div class="chosen"><small>Ausgewählt (antippen zum Zurücknehmen):</small><div class="slots wide">${chosenCards(me.money, local.sel, 3)}</div></div>
          ${moneyPiles(me.money, local.sel)}
          <div class="payrow"><div class="paystatus ${diff < 0 ? 'bad' : diff === 0 ? 'ok' : 'warn'}">${status}</div>
            <button type="button" class="pill pill-white pill-small" data-a="autopay">Passend auswählen</button></div>
        </div>
        <div class="bottom-bar"><button type="button" class="pill pill-red big" data-a="pay" ${diff < 0 ? 'disabled' : ''}><small>BEZAHLEN</small>${karten(local.sel.length)} · ${selSum}</button></div>
      </div>`;
      H.pay = () => ctx.act((s) => pay(s, meId, local.sel));
      H.autopay = () => { local.sel = bestPay(me.money, pm.amount); ctx.rerender(); };
    } else {
      overlay = `<div class="overlay light ${entered ? 'enter' : ''}"><div class="wait">
        ${bigAnimalCard(pm.animal)}
        <p><strong>${esc(nameOf(pm.payer))}</strong> bezahlt ${pm.amount} an <strong>${esc(nameOf(pm.payee))}</strong> …</p>
      </div></div>`;
    }
  }

  if (state.phase === 'turn' && myTurn && local.tradeOpen) {
    const targets = [...new Set(trades.map((t) => t.target))];
    if (!targets.includes(local.tradeTarget)) local.tradeTarget = targets[0];
    const forTarget = trades.filter((t) => t.target === local.tradeTarget);
    if (!forTarget.some((t) => t.animal === local.tradeAnimal)) local.tradeAnimal = forTarget[0]?.animal || null;
    const chosen = forTarget.find((t) => t.animal === local.tradeAnimal);
    const tIdx = idxOf(local.tradeTarget);
    const target = v.players[tIdx];
    const slots = chosenCards(me.money, local.sel);
    const canOffer = chosen && (local.sel.length > 0 || me.money.length === 0);
    overlay = `<div class="overlay green ${entered ? 'enter' : ''}">
      <div class="trade">
        <div class="tside">
          <div class="who">${avatar(me, meIdx)}<span class="ribbon-s" style="--c:${SEAT_COLORS[meIdx]}">Du</span></div>
          <span class="countpill">${karten(local.sel.length)}</span>
          <small>= ${selSum} · sieht nur du</small>
          <div class="slots">${slots}</div>
          <hr>
          ${chosen ? `<div class="strip" style="--a:${ANIMAL_COLORS[chosen.animal]}"><i>${art(chosen.animal)}</i><span><b>${chosen.count}× ${aname(chosen.animal)}${aval(chosen.animal) != null ? ` · ${aval(chosen.animal)}` : ''}</b><small>${chosen.animal === RAT ? 'willst du loswerden' : 'im Einsatz'}</small></span></div>` : ''}
        </div>
        <div class="tside">
          <div class="who">${avatar(target, tIdx)}<span class="ribbon-s" style="--c:${SEAT_COLORS[tIdx]}">${esc(target.name)}</span></div>
          ${targets.length > 1 ? `<div class="tabs">${targets.map((id) => `<button type="button" class="tab ${id === local.tradeTarget ? 'on' : ''}" data-a="tTarget" data-v="${esc(id)}">${esc(nameOf(id))}</button>`).join('')}</div>` : '<span class="countpill">? Karten</span>'}
          <small>Um welches Tier?</small>
          <div class="atiles">${forTarget.map((t) => `<button type="button" class="atile ${t.animal === local.tradeAnimal ? 'on' : ''}" style="--a:${ANIMAL_COLORS[t.animal]}" data-a="tAnimal" data-v="${t.animal}" aria-label="${aname(t.animal)}, ${esc(target.name)} hat ${target.animals[t.animal]}">${art(t.animal)}${aval(t.animal) != null ? `<em class="cv">${aval(t.animal)}</em>` : ''}<span>×${target.animals[t.animal]}</span></button>`).join('')}</div>
          ${chosen ? `<small class="about">${chosen.animal === RAT ? `Ratte: wer mehr bietet, wird ${chosen.count === 2 ? 'beide' : 'sie'} los` : `${aname(chosen.animal)}: es geht um ${chosen.count}`}</small>` : ''}
        </div>
      </div>
      <div class="hand-pick"><small>Deine Scheine – antippen, um einen ins Angebot zu legen</small>${moneyPiles(me.money, local.sel)}</div>
      <div class="bottom-bar">
        <button type="button" class="pill pill-white pill-small" data-a="tradeClose">Abbrechen</button>
        <button type="button" class="pill pill-red big" data-a="tradeGo" ${canOffer ? '' : 'disabled'}><small>ANGEBOT</small>MACHEN</button>
      </div>
    </div>`;
    H.tTarget = (id) => { local.tradeTarget = id; local.tradeAnimal = null; ctx.rerender(); };
    H.tAnimal = (id) => { local.tradeAnimal = id; ctx.rerender(); };
    H.tradeClose = () => { local.tradeOpen = false; local.sel = []; ctx.rerender(); };
    H.tradeGo = () => ctx.act((s) => startTrade(s, meId, local.tradeTarget, local.tradeAnimal, local.sel));
  }

  if (state.phase === 'trade') {
    const t = v.trade;
    const chIdx = idxOf(t.challenger);
    const tgIdx = idxOf(t.target);
    const offerCount = Array.isArray(t.offer) ? t.offer.length : t.offer;
    const offerCards = Array.isArray(t.offer) ? t.offer.map((m) => moneyCard(m, { size: 'xs' })).join('') : Array.from({ length: offerCount }, () => '<div class="money xs back"></div>').join('');
    if (t.target === meId) {
      const canCounter = local.sel.length > 0 || me.money.length === 0;
      overlay = `<div class="overlay green ${entered ? 'enter' : ''}">
        <div class="trade">
          <div class="tside">
            <div class="who">${avatar(v.players[chIdx], chIdx)}<span class="ribbon-s" style="--c:${SEAT_COLORS[chIdx]}">${esc(nameOf(t.challenger))}</span></div>
            <span class="countpill">${karten(offerCount)}</span>
            <small>verdecktes Angebot</small>
            <div class="slots">${offerCards}</div>
            <hr>
            <div class="strip" style="--a:${ANIMAL_COLORS[t.animal]}"><i>${art(t.animal)}</i><span><b>${t.count}× ${aname(t.animal)}${aval(t.animal) != null ? ` · ${aval(t.animal)}` : ''}</b><small>${t.animal === RAT ? 'will dir die Ratte geben' : 'will dein Tier'}</small></span></div>
          </div>
          <div class="tside">
            <div class="who">${avatar(me, meIdx)}<span class="ribbon-s" style="--c:${SEAT_COLORS[meIdx]}">Du</span></div>
            <span class="countpill">${karten(local.sel.length)}</span>
            <small>= ${selSum} · Gegenangebot</small>
            <div class="slots">${chosenCards(me.money, local.sel)}</div>
            <hr>
            <small class="rule">${t.animal === RAT ? 'Wer mehr bietet, wird die Ratte los.' : 'Höheres Gebot gewinnt.'} Gleichstand: ${esc(nameOf(t.challenger))} gewinnt. Das Geld wird immer getauscht.</small>
          </div>
        </div>
        <div class="hand-pick"><small>Deine Scheine – antippen für ein Gegenangebot</small>${moneyPiles(me.money, local.sel)}</div>
        <div class="bottom-bar">
          <button type="button" class="pill pill-white big" data-a="accept"><small>ANNEHMEN</small>${t.animal === RAT ? 'Geld + Ratte nehmen' : 'Geld nehmen'}</button>
          <button type="button" class="pill pill-red big" data-a="counter" ${canCounter ? '' : 'disabled'}><small>GEGENANGEBOT</small>${karten(local.sel.length)}</button>
        </div>
      </div>`;
      H.accept = () => ctx.act((s) => acceptTrade(s, meId));
      H.counter = () => ctx.act((s) => counterTrade(s, meId, local.sel));
    } else {
      overlay = `<div class="overlay green ${entered ? 'enter' : ''}"><div class="wait light-text">
        <div class="duel">
          <div class="who">${avatar(v.players[chIdx], chIdx)}<span class="ribbon-s" style="--c:${SEAT_COLORS[chIdx]}">${esc(nameOf(t.challenger))}</span></div>
          <div class="vs"><div class="slots">${offerCards}</div><b>${t.count}× ${aname(t.animal)}</b></div>
          <div class="who">${avatar(v.players[tgIdx], tgIdx)}<span class="ribbon-s" style="--c:${SEAT_COLORS[tgIdx]}">${esc(nameOf(t.target))}</span></div>
        </div>
        <p>${t.challenger === meId ? `Warte auf die Antwort von ${esc(nameOf(t.target))} …` : `${esc(nameOf(t.challenger))} fordert ${esc(nameOf(t.target))} zum ${t.animal === RAT ? 'Rattenhandel' : 'Kuhhandel'} heraus …`}</p>
      </div></div>`;
    }
  }

  // Ergebnis des letzten Kuhhandels für die Beteiligten (mit Beträgen)
  const ev = v.lastEvent;
  if (state.phase === 'turn' && !local.tradeOpen && ev?.type === 'trade' && local.seenEvent !== state.log.length && (ev.challenger === meId || ev.target === meId)) {
    const won = ev.winner === meId;
    const detail = ev.accepted
      ? `${esc(nameOf(ev.target))} hat angenommen${ev.offerSum != null ? ` (${ev.offerSum} Taler)` : ''}.`
      : `${esc(nameOf(ev.challenger))}: ${ev.offerSum} · ${esc(nameOf(ev.target))}: ${ev.counterSum}${ev.offerSum === ev.counterSum ? ' – Gleichstand, Herausforderer gewinnt' : ''}`;
    const isRat = ev.animal === RAT;
    const ratWhere = won ? `bist du los – ${esc(nameOf(ev.winner === ev.challenger ? ev.target : ev.challenger))} hat sie` : 'gehören jetzt dir';
    overlay = `<div class="overlay green ${entered ? 'enter' : ''}"><div class="wait light-text result">
      <h2>${won ? 'Gewonnen!' : 'Verloren'}</h2>
      <div class="strip big" style="--a:${ANIMAL_COLORS[ev.animal]}"><i>${art(ev.animal)}</i><span><b>${ev.count}× ${aname(ev.animal)}</b><small>${isRat ? ratWhere : won ? 'gehören jetzt dir' : `gehen an ${esc(nameOf(ev.winner))}`}</small></span></div>
      <p>${detail}</p>
      <button type="button" class="pill pill-red" data-a="seen">Weiter</button>
    </div></div>`;
    H.seen = () => { local.seenEvent = state.log.length; ctx.rerender(); };
  }

  if (state.phase === 'block') {
    const bp = v.players[idxOf(v.block.player)];
    if (bp.id === meId) {
      const opts = ANIMALS.filter((a) => me.animals[a.id] === 4);
      overlay = `<div class="overlay light ${entered ? 'enter' : ''}"><div class="pay block">
        <h2>Du hast alle ${RAT_COUNT} Ratten!</h2>
        <p>Wähle ein Quartett, das nicht zählt. Deine Punkte danach:</p>
        <div class="blockgrid">${opts.map((a) => `<button type="button" class="blockopt" data-a="block" data-v="${a.id}" style="--a:${ANIMAL_COLORS[a.id]}">
          <span class="ci">${art(a.id)}</span><b>${a.name}${specialsOf(me).includes(a.id) ? ` ${STAR}` : ''}</b><small>${scoreFor(me, a.id).score} Punkte</small></button>`).join('')}</div>
      </div></div>`;
      H.block = (id) => ctx.act((s) => chooseBlock(s, meId, id));
    } else {
      overlay = `<div class="overlay light ${entered ? 'enter' : ''}"><div class="wait">
        ${ratCard()}
        <p><strong>${esc(nameOf(bp.id))}</strong> hat alle Ratten und wählt, welches Quartett nicht zählt …</p>
      </div></div>`;
    }
  }

  if (state.phase === 'ended') {
    const s = scores(state).sort((a, b) => b.score - a.score);
    overlay = `<div class="overlay light ${entered ? 'enter' : ''}"><div class="ending">
      <h2>${v.winner?.includes(meId) ? 'Du hast gewonnen!' : `${esc(s[0].name)} gewinnt!`}</h2>
      <ol>${s.map((r) => `<li class="${v.winner?.includes(r.id) ? 'win' : ''} ${local.scoreOpen === r.id ? 'open' : ''}" data-a="scoreOpen" data-v="${esc(r.id)}">
        <span class="sname">${esc(r.id === meId ? 'Du' : r.name)}</span>
        <span class="squart">${r.quartets.map((id) => `<span class="ci" style="--a:${ANIMAL_COLORS[id]}" title="${aname(id)}">${art(id)}</span>`).join('')}${r.blocked ? `<span class="ci blocked" style="--a:${ANIMAL_COLORS[r.blocked]}" title="${aname(r.blocked)} – blockiert">${art(r.blocked)}</span>` : ''}${(r.specials || []).map((id) => `<span class="ci sp" style="--a:${ANIMAL_COLORS[id]}" title="${aname(id)}-Spezialkarte">${art(id)}${STAR}</span>`).join('')}${r.rats ? `<span class="ci" style="--a:${ANIMAL_COLORS[RAT]}" title="${r.rats}× Ratte">${art(RAT)}</span>` : ''}</span>
        <span class="sval">${r.score}</span>
        ${local.scoreOpen === r.id ? `<span class="sform">${scoreFormula(v.players[idxOf(r.id)], r.blocked)}${r.blocked ? ` · ${esc(aname(r.blocked))} blockiert` : ''}</span>` : ''}</li>`).join('')}</ol>
      <small>Spieler antippen für die Rechnung · ★ = Spezialkarte</small>
      <div class="endbtns">
        <button type="button" class="pill pill-red" data-a="rematch">${ctx.rematchId ? 'Zur Revanche' : 'Revanche'}</button>
        <button type="button" class="pill pill-white" data-a="exit">Zur Startseite</button>
      </div>
    </div></div>`;
  }

  H.rematch = () => ctx.onRematch();
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
      effects += `<div class="qpop" aria-live="polite"><div class="qart" style="--a:${ANIMAL_COLORS[animal]}">${art(animal)}</div>
        <b>Quartett!</b><span>${who} alle 4× ${aname(animal)}</span></div>`;
    }
  }
  local.prevQuartets = quartets;
  const le = v.lastEvent;
  if (fresh && (state.phase === 'turn' || state.phase === 'ended') && le && (le.type === 'auction_won' || le.type === 'trade' || le.type === 'special_won' || le.type === 'rat_taken')) {
    let to = le.type === 'trade' ? le.winner : le.type === 'rat_taken' ? le.player : le.buyer;
    if (le.type === 'trade' && le.animal === RAT) to = le.winner === le.challenger ? le.target : le.challenger;
    const flyAnimal = le.type === 'rat_taken' ? RAT : le.animal;
    const i = idxOf(to);
    const slot = 374 / v.players.length;
    const ty = Math.round(8 + slot * (i + 0.5) - 195);
    const n = le.type === 'trade' ? le.count : 1;
    effects += Array.from({ length: n }, (_, k) => `<div class="fly" style="--tx:${704 - 376}px;--ty:${ty}px;animation-delay:${k * 120}ms">
      <div class="bigcard-head" style="--a:${ANIMAL_COLORS[flyAnimal]}"><span class="mono">${art(flyAnimal)}</span>${le.type === 'special_won' ? STAR : ''}</div></div>`).join('');
  }
  // Geld fliegt (verdeckt) vom Zahler zum Empfänger
  const rowY = (id) => 8 + (374 / v.players.length) * (idxOf(id) + 0.5);
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
      effects += `<div class="rpsshow" aria-live="polite">
        <div class="rpswords"><span>Schnick</span><span>Schnack</span><span>Schnuck!</span></div>
        <div class="rpshands">${names.map((id) => `<div class="rh"><div class="hand"><b class="shake">✊</b><b class="real">${RPS_ICON[le2.picks[id]]}</b></div><small>${esc(nameOf(id))}</small></div>`).join('')}</div>
        <div class="rpsresult">${result}</div></div>`;
    }
  } else {
    local.prevBuzz = undefined;
  }
  if (entered && state.phase === 'auction') { sounds.push('flip'); if (v.lastEvent?.type === 'donkey') sounds.push('coins'); }
  else if (fresh && state.phase === 'auction' && auction.high) sounds.push('bid');
  if (fresh && le && (state.phase === 'turn' || state.phase === 'ended')) {
    if (le.type === 'auction_won') { sounds.push('gavel'); if (le.amount > 0) sounds.push('coins'); }
    if (le.type === 'special_won') { sounds.push('gavel'); if (le.count > 0) sounds.push('coins'); }
    if (le.type === 'rat_taken' && le.count > 0) sounds.push('coins');
    if (le.type === 'trade') sounds.push('trade');
  }
  if (effects.includes('class="qpop"') || (entered && state.phase === 'ended')) sounds.push('quartet');

  // Erste-Runde-Hilfe: jeder Hinweis erscheint nur einmal
  let tip = '';
  if (ctx.tips && state.phase !== 'ended') {
    const a = auction;
    const running = a && a.endsAt != null && ctx.now() < a.endsAt;
    let t = null;
    if (local.tradeOpen) t = ['tradesetup', 'top', 'Wähle oben Gegner und Tier und tippe unten Scheine an. Bluffen ist erlaubt – auch ein 0er zählt als Karte.'];
    else if (state.phase === 'turn' && myTurn) t = ['turn', 'left', 'Du bist dran! Versteigere ein Tier vom Stapel – oder fordere mit „Kuhhandel“ jemanden heraus, der dasselbe Tier hat.'];
    else if (state.phase === 'auction' && a.auctioneer === meId) t = ['auctioneer', 'left', 'Du versteigerst. Ist die Zeit um, entscheidest du: Zuschlag an den Höchstbietenden – oder selbst zum Höchstgebot kaufen.'];
    else if (state.phase === 'auction' && running) t = ['bid', 'left', 'Tippe auf einen Schein, um so viel mehr zu bieten. Nach jedem Gebot startet die Uhr neu.'];
    else if (state.phase === 'payment' && v.payment.payer === meId) t = ['pay', 'top', 'Kein Wechselgeld! Tippe Scheine an – oder nimm „Passend auswählen“.'];
    else if (state.phase === 'trade' && v.trade.target === meId && v.trade.animal !== RAT) t = ['trade', 'top', 'Du wirst herausgefordert: Nimm das Geld und gib das Tier ab – oder biete verdeckt dagegen.'];
    else if (state.phase === 'rat' && ratCurrent(v) === meId) t = ['rat', 'left', 'Ratte! Lege eine Karte verdeckt in die Mitte (auch ein 0er) – oder nimm die Ratte und bekommst alle Karten. Wer am Ende alle Ratten hat, verliert ein Quartett.'];
    else if (state.phase === 'special' && v.special.revealer !== meId && ['wait', 'countdown'].includes(specialStage(v, ctx.now()))) t = ['buzz', 'left', 'Spezialkarte! Die Zahl zählt runter. Drück BUZZ, sobald du bereit bist, so viele Karten zu zahlen. Der Aufdecker entscheidet dann: kaufen oder verkaufen.'];
    if (t && !ctx.tips.seen.has(t[0])) {
      tip = `<div class="tip tip-${t[1]}" role="note"><b>Tipp</b><span>${t[2]}</span><button type="button" data-a="tipok" data-v="${t[0]}">Verstanden</button></div>`;
    }
  }
  H.tipok = (id) => ctx.tips.mark(id);

  if (entered && state.phase === 'ended') {
    const cols = ['#FFD34E', '#D7263D', '#1D5FC2', '#B8285F', '#6D3FC0', '#7FA88A', '#fff'];
    effects += `<div class="confetti" aria-hidden="true">${Array.from({ length: 40 }, (_, k) =>
      `<i style="left:${(k * 37) % 100}%;background:${cols[k % cols.length]};animation-delay:${(k % 10) * 90}ms;animation-duration:${1600 + (k % 7) * 180}ms;transform:rotate(${k * 29}deg)"></i>`).join('')}</div>`;
  }

  root.innerHTML = `<div class="stage-wrap"><div class="stage" id="stage">
    ${left}
    ${table}
    <div class="gright">${playersCol}</div>
    ${overlay}
    ${effects}
    ${tip}
    ${wake ? `<i hidden data-wake="${wake}"></i>` : ''}
    ${local.reactTo && ctx.reactionList && idxOf(local.reactTo) >= 0 ? `<div class="reactpick" style="top:${Math.round(Math.min(250, Math.max(8, 8 + (374 / v.players.length) * (idxOf(local.reactTo) + 0.5) - 60)))}px">
      <div class="rphead">${local.reactTo === meId ? 'An alle' : `An ${esc(nameOf(local.reactTo))}`}<button type="button" data-a="reactClose" aria-label="Schließen">✕</button></div>
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
  const s = Math.min(window.innerWidth / 844, window.innerHeight / 390);
  st.style.transform = `scale(${s})`;
  st.parentElement.style.width = `${844 * s}px`;
  st.parentElement.style.height = `${390 * s}px`;
}
window.addEventListener('resize', fitStage);
