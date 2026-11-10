// Kuhhandel – Spieltisch im Querformat (alle Spielphasen)
import {
  ANIMAL_BY_ID, DONKEY_PAYOUTS, BID_STEP,
  viewFor, possibleTrades, scores, currentPlayer,
  drawForAuction, bid, passAuction, closeAuction, pay,
  startTrade, acceptTrade, counterTrade,
} from '../src/engine.js';
import { art } from './animals.js';

export const SEAT_COLORS = ['#C2570C', '#1D5FC2', '#B8285F', '#6D3FC0'];
const ANIMAL_COLORS = {
  hahn: '#E8B04B', gans: '#C9C2AE', katze: '#C98A5B', hund: '#A7744A', schaf: '#D9CFB3',
  ziege: '#B9B08F', esel: '#9AA6AD', schwein: '#E7A1A0', kuh: '#7FA88A', pferd: '#8C6A4F',
};
const ANIMAL_ABBR = {
  hahn: 'Ha', gans: 'Ga', katze: 'Ka', hund: 'Hu', schaf: 'Sf',
  ziege: 'Zi', esel: 'Es', schwein: 'Sw', kuh: 'Ku', pferd: 'Pf',
};
const MONEY_COLORS = { 0: '#ECE7DB', 10: '#F6D98B', 20: '#F2B880', 50: '#A8D5B5', 100: '#9FC9E8', 200: '#C9B6E4', 500: '#E7A1A0' };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sum = (a) => a.reduce((x, y) => x + y, 0);
const aname = (id) => ANIMAL_BY_ID[id].name;
const karten = (n) => (n === 1 ? '1 Karte' : `${n} Karten`);
const initial = (n) => esc((n || '?').trim().charAt(0).toUpperCase());

// ---------- kleine Bausteine ----------

function moneyCard(v, { idx = null, selected = false, size = '' } = {}) {
  const cls = `money ${size} ${selected ? 'sel' : ''}`;
  const style = `--m:${MONEY_COLORS[v] || '#eee'}`;
  if (idx === null) return `<div class="${cls}" style="${style}">${v}</div>`;
  return `<button type="button" class="${cls}" style="${style}" data-a="toggle" data-v="${idx}" aria-pressed="${selected}" aria-label="Geldkarte ${v}">${v}</button>`;
}

function animalMini(id, n) {
  const shadows = [];
  for (let i = 1; i < n; i++) shadows.push(`${i * 3}px ${-i * 3}px 0 -1px #D6CCB4`);
  return `<div class="amini ${n === 4 ? 'quartet' : ''}" title="${aname(id)}">
    <div class="acard" style="--a:${ANIMAL_COLORS[id]};box-shadow:${shadows.join(',') || 'none'}"><i></i><b>${art(id)}</b></div>
    <span>${n === 4 ? aname(id) + ' ✓' : aname(id) + ' ×' + n}</span>
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

function avatar(p, idx, extra = '') {
  return `<div class="avatar" style="--c:${SEAT_COLORS[idx]}" aria-hidden="true">${initial(p.name)}</div>${extra}`;
}

// ---------- Hauptfunktion ----------

export function renderGame(root, ctx) {
  const { state, meId, local } = ctx;
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
    const chips = Object.entries(p.animals).filter(([, n]) => n > 0)
      .map(([id, n]) => `<span class="chip ${n === 4 ? 'done' : ''}" title="${aname(id)}"><i style="background:${ANIMAL_COLORS[id]}"></i>${ANIMAL_ABBR[id]}${n}</span>`).join('');
    const leader = state.phase === 'auction' && auction.high && auction.high.player === p.id
      ? `<div class="hightag ${fresh ? 'pop' : ''}"><span>Höchstgebot</span><b>${auction.high.amount}</b></div>` : '';
    const turnMark = cur.id === p.id && state.phase !== 'ended' ? ' turn' : '';
    const dim = state.phase === 'auction' && auction.passed.includes(p.id) ? ' dim' : '';
    const coin = entered && state.phase === 'auction' && v.lastEvent?.type === 'donkey' ? `<span class="coinpop">+${v.lastEvent.payout}</span>` : '';
    return `<div class="prow${turnMark}${dim}">${coin}
      ${leader}
      <div class="chips">${chips}</div>
      <div class="pid">
        ${avatar(p, i)}
        <div class="pname"><span class="ribbon-s" style="--c:${SEAT_COLORS[i]}">${esc(isMe ? 'Du' : p.name)}</span><span class="tag-s">${status}</span></div>
      </div>
    </div>`;
  }).join('');

  // ----- Tisch -----
  const nextDonkey = v.donkeysDrawn < 4 ? DONKEY_PAYOUTS[v.donkeysDrawn] : null;
  const lastLog = v.log[v.log.length - 1] || '';
  const myAnimals = Object.entries(me.animals).filter(([, n]) => n > 0).map(([id, n]) => animalMini(id, n)).join('')
    || '<span class="noanimals">Noch keine Tiere</span>';
  const mid = (me.money.length - 1) / 2;
  const fan = me.money.map((m, i) => {
    const off = i - mid;
    const rot = me.money.length > 1 ? off * Math.min(7, 40 / me.money.length) : 0;
    return `<div class="money fan" style="--m:${MONEY_COLORS[m]};transform:rotate(${rot}deg) translateY(${Math.abs(off) * 3}px)">${m}</div>`;
  }).join('');

  const banner = state.phase === 'ended' ? 'Spielende' : myTurn ? 'Du bist dran' : `${esc(cur.name)} ist dran`;
  const table = `<div class="gtable">
    <div class="tbanner ${fresh && myTurn && state.phase === 'turn' ? 'pulse' : ''}">${banner}</div>
    <div class="tlog">${esc(lastLog)}</div>
    <div class="deck-wrap">
      <div class="deck ${v.deck === 0 ? 'empty' : ''}">${v.deck > 0 ? 'KH' : ''}</div>
      <span class="deck-count">${v.deck > 0 ? `${v.deck} im Stapel` : 'Stapel leer – nur Kuhhandel'}</span>
    </div>
    <div class="myanimals">${myAnimals}</div>
    <div class="fan-wrap" aria-label="Dein Geld: ${sum(me.money)} Taler">${fan}</div>
  </div>`;

  // ----- linke Spalte -----
  const trades = possibleTrades(state, meId);
  let leftActions = '';
  if (state.phase === 'turn' && myTurn) {
    leftActions = `
      <button type="button" class="pill pill-red" data-a="auction" ${v.deck > 0 ? '' : 'disabled'}>TIER<br>VERSTEIGERN</button>
      <button type="button" class="pill pill-white" data-a="tradeOpen" ${trades.length ? '' : 'disabled'}>Kuhhandel</button>`;
  }
  const left = `<div class="gleft">
    <button type="button" class="round" data-a="menu" aria-label="Menü">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
    </button>
    ${local.menu ? `<div class="menu"><button type="button" class="pill pill-white pill-small" data-a="exit">Spiel verlassen</button><span>Du kannst später über die Startseite zurückkehren.</span></div>` : ''}
    <div class="infochips">
      <span class="ichip">Geld: <b>${sum(me.money)}</b></span>
      ${nextDonkey ? `<span class="ichip">Nächster Esel: <b>+${nextDonkey}</b></span>` : '<span class="ichip">Alle Esel sind raus</span>'}
    </div>
    <div class="lactions">${leftActions}</div>
  </div>`;

  H.menu = () => { local.menu = !local.menu; ctx.rerender(); };
  H.exit = () => ctx.onExit();
  H.auction = () => ctx.act((s) => drawForAuction(s, meId));
  H.tradeOpen = () => { local.tradeOpen = true; local.sel = []; local.tradeTarget = null; local.tradeAnimal = null; ctx.rerender(); };

  // ----- Überlagerung je nach Phase -----
  let overlay = '';

  if (state.phase === 'auction') {
    const a = auction;
    const iAmAuctioneer = a.auctioneer === meId;
    const high = a.high ? a.high.amount : 0;
    const nextBid = high + BID_STEP;
    const bigBid = high + 5 * BID_STEP;
    const cap = a.caps[meId];
    const canBid = (amt) => cap == null || amt <= cap;
    const owners = v.players.filter((p) => p.animals[a.animal] > 0).map((p) => `${esc(p.id === meId ? 'Du' : p.name)} ${p.animals[a.animal]}`).join(', ') || 'noch niemand';
    let bonusRow = '';
    if (a.animal === 'esel' && v.lastEvent?.type === 'donkey') bonusRow = `<div class="row"><span>Esel-Bonus</span><strong>alle +${v.lastEvent.payout}</strong></div>`;
    const card = bigAnimalCard(a.animal, `${bonusRow}<div class="row"><span>Schon bei</span><span>${owners}</span></div><div class="row line"><span>Du hast</span><span>${me.animals[a.animal]}</span></div>`, entered ? 'deal' : '');

    const ev = v.lastEvent;
    const reveal = ev?.type === 'cant_pay' && !a.high
      ? `<div class="reveal ${fresh ? 'shake' : ''}"><strong>${esc(nameOf(ev.player))} ${ev.player === meId ? 'kannst' : 'kann'} ${ev.amount} nicht zahlen!</strong>
          <div class="reveal-cards">${ev.revealed.map((m) => moneyCard(m, { size: 'xs' })).join('') || 'keine Karten'}</div>
          <span>Neue Runde – höchstens ${ev.amount - BID_STEP} für ${esc(nameOf(ev.player))}.</span></div>`
      : '';

    let buttons;
    if (iAmAuctioneer) {
      const myTotal = sum(me.money);
      buttons = a.high
        ? `<button type="button" class="pill pill-red big" data-a="sell"><small>ZUSCHLAG AN</small>${esc(nameOf(a.high.player))}</button>
           <button type="button" class="pill pill-white big" data-a="buy" ${myTotal >= high ? '' : 'disabled'}><small>SELBST KAUFEN</small>${high}</button>`
        : `<button type="button" class="pill pill-red big" data-a="sell"><small>NIEMAND BIETET</small>Tier nehmen</button>`;
    } else {
      const passed = a.passed.includes(meId);
      buttons = `<button type="button" class="pill pill-red big" data-a="bid" data-v="${bigBid}" ${canBid(bigBid) ? '' : 'disabled'}><small>HOHES GEBOT</small>${bigBid}</button>
        <button type="button" class="pill pill-red big" data-a="bid" data-v="${nextBid}" ${canBid(nextBid) ? '' : 'disabled'}><small>BIETEN</small>${nextBid}</button>
        <button type="button" class="pill pill-white pill-small" data-a="pass" ${passed ? 'disabled' : ''}>${passed ? 'Gepasst' : 'Passen'}</button>`;
    }
    const bubble = iAmAuctioneer
      ? `<div class="bubble ${fresh ? 'pop' : ''}"><span>${a.high ? 'Höchstgebot' : 'Wer bietet?'}</span><b>${a.high ? high : '–'}</b></div>`
      : `<div class="bubble ${fresh ? 'pop' : ''}"><span>Wer bietet</span><b>${nextBid}</b></div>`;
    const auctioneerIdx = idxOf(a.auctioneer);
    overlay = `<div class="overlay light ${entered ? 'enter' : ''}">
      <div class="auctioneer">${bubble}
        <div class="gavel" style="--c:${SEAT_COLORS[auctioneerIdx]}">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 3.5l7.5 7.5"></path><path d="M10.5 6l7.5 7.5"></path><path d="M11.8 4.8l-4.5 4.5 7.4 7.4 4.5-4.5"></path><path d="M9.5 13.5L3.5 19.5"></path><path d="M3 21h9"></path></svg>
        </div>
        <span class="ribbon-s" style="--c:${SEAT_COLORS[auctioneerIdx]}">${esc(nameOf(a.auctioneer))} versteigert</span>
        ${iAmAuctioneer ? '<p class="hint">Warte auf Gebote. Du entscheidest, wann Schluss ist.</p>' : ''}
      </div>
      <div class="auction-card">${card}</div>
      ${reveal}
      <div class="bottom-bar">${buttons}</div>
    </div>`;

    H.bid = (amt) => ctx.act((s) => bid(s, meId, Number(amt)));
    H.pass = () => ctx.act((s) => passAuction(s, meId));
    H.sell = () => ctx.act((s) => closeAuction(s, meId, 'sell'));
    H.buy = () => ctx.act((s) => closeAuction(s, meId, 'buy'));
  }

  if (state.phase === 'payment') {
    const pm = v.payment;
    if (pm.payer === meId) {
      const diff = selSum - pm.amount;
      const status = diff < 0 ? `Es fehlen noch ${-diff}` : diff === 0 ? 'Passt genau' : `Du überzahlst um ${diff} – kein Wechselgeld`;
      overlay = `<div class="overlay light ${entered ? 'enter' : ''}">
        <div class="pay">
          <h2>Zahle ${pm.amount} an ${esc(nameOf(pm.payee))}</h2>
          <p>Für: ${aname(pm.animal)}. Wähle Karten, die zusammen mindestens ${pm.amount} ergeben.</p>
          <div class="pickrow">${me.money.map((m, i) => moneyCard(m, { idx: i, selected: local.sel.includes(i) })).join('')}</div>
          <div class="paystatus ${diff < 0 ? 'bad' : diff === 0 ? 'ok' : 'warn'}">${status}</div>
        </div>
        <div class="bottom-bar"><button type="button" class="pill pill-red big" data-a="pay" ${diff < 0 ? 'disabled' : ''}><small>BEZAHLEN</small>${karten(local.sel.length)} · ${selSum}</button></div>
      </div>`;
      H.pay = () => ctx.act((s) => pay(s, meId, local.sel));
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
    const slots = local.sel.map((i) => moneyCard(me.money[i], { size: 'xs' })).join('')
      + Array.from({ length: Math.max(0, 4 - local.sel.length) }, () => '<div class="slot"></div>').join('');
    const canOffer = chosen && (local.sel.length > 0 || me.money.length === 0);
    overlay = `<div class="overlay green ${entered ? 'enter' : ''}">
      <div class="trade">
        <div class="tside">
          <div class="who">${avatar(me, meIdx)}<span class="ribbon-s" style="--c:${SEAT_COLORS[meIdx]}">Du</span></div>
          <span class="countpill">${karten(local.sel.length)}</span>
          <small>= ${selSum} · sieht nur du</small>
          <div class="slots">${slots}</div>
          <hr>
          ${chosen ? `<div class="strip" style="--a:${ANIMAL_COLORS[chosen.animal]}"><i>${art(chosen.animal)}</i><span><b>${chosen.count}× ${aname(chosen.animal)}</b><small>im Einsatz</small></span></div>` : ''}
        </div>
        <div class="tside">
          <div class="who">${avatar(target, tIdx)}<span class="ribbon-s" style="--c:${SEAT_COLORS[tIdx]}">${esc(target.name)}</span></div>
          ${targets.length > 1 ? `<div class="tabs">${targets.map((id) => `<button type="button" class="tab ${id === local.tradeTarget ? 'on' : ''}" data-a="tTarget" data-v="${esc(id)}">${esc(nameOf(id))}</button>`).join('')}</div>` : '<span class="countpill">? Karten</span>'}
          <small>Um welches Tier?</small>
          <div class="strips">${forTarget.map((t) => `<button type="button" class="strip ${t.animal === local.tradeAnimal ? 'on' : ''}" style="--a:${ANIMAL_COLORS[t.animal]}" data-a="tAnimal" data-v="${t.animal}"><i>${art(t.animal)}</i><span><b>${aname(t.animal)} ×${target.animals[t.animal]}</b><small>es geht um ${t.count}</small></span></button>`).join('')}</div>
        </div>
      </div>
      <div class="hand-pick"><small>Deine Karten – antippen zum Bieten</small><div class="pickrow">${me.money.map((m, i) => moneyCard(m, { idx: i, selected: local.sel.includes(i), size: 's' })).join('')}</div></div>
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
            <div class="strip" style="--a:${ANIMAL_COLORS[t.animal]}"><i>${art(t.animal)}</i><span><b>${t.count}× ${aname(t.animal)}</b><small>will dein Tier</small></span></div>
          </div>
          <div class="tside">
            <div class="who">${avatar(me, meIdx)}<span class="ribbon-s" style="--c:${SEAT_COLORS[meIdx]}">Du</span></div>
            <span class="countpill">${karten(local.sel.length)}</span>
            <small>= ${selSum} · Gegenangebot</small>
            <div class="slots">${local.sel.map((i) => moneyCard(me.money[i], { size: 'xs' })).join('') || '<div class="slot"></div><div class="slot"></div>'}</div>
            <hr>
            <small class="rule">Höheres Gebot gewinnt. Gleichstand: ${esc(nameOf(t.challenger))} gewinnt. Das Geld wird immer getauscht.</small>
          </div>
        </div>
        <div class="hand-pick"><small>Deine Karten – antippen für ein Gegenangebot</small><div class="pickrow">${me.money.map((m, i) => moneyCard(m, { idx: i, selected: local.sel.includes(i), size: 's' })).join('')}</div></div>
        <div class="bottom-bar">
          <button type="button" class="pill pill-white big" data-a="accept"><small>ANNEHMEN</small>Geld nehmen</button>
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
        <p>${t.challenger === meId ? `Warte auf die Antwort von ${esc(nameOf(t.target))} …` : `${esc(nameOf(t.challenger))} fordert ${esc(nameOf(t.target))} zum Kuhhandel heraus …`}</p>
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
    overlay = `<div class="overlay green ${entered ? 'enter' : ''}"><div class="wait light-text result">
      <h2>${won ? 'Gewonnen!' : 'Verloren'}</h2>
      <div class="strip big" style="--a:${ANIMAL_COLORS[ev.animal]}"><i>${art(ev.animal)}</i><span><b>${ev.count}× ${aname(ev.animal)}</b><small>${won ? 'gehören jetzt dir' : `gehen an ${esc(nameOf(ev.winner))}`}</small></span></div>
      <p>${detail}</p>
      <button type="button" class="pill pill-red" data-a="seen">Weiter</button>
    </div></div>`;
    H.seen = () => { local.seenEvent = state.log.length; ctx.rerender(); };
  }

  if (state.phase === 'ended') {
    const s = scores(state).sort((a, b) => b.score - a.score);
    overlay = `<div class="overlay light ${entered ? 'enter' : ''}"><div class="ending">
      <h2>${v.winner?.includes(meId) ? 'Du hast gewonnen!' : `${esc(s[0].name)} gewinnt!`}</h2>
      <ol>${s.map((r) => `<li class="${v.winner?.includes(r.id) ? 'win' : ''}">
        <span class="sname">${esc(r.id === meId ? 'Du' : r.name)}</span>
        <span class="squart">${r.quartets.map((id) => `<i style="background:${ANIMAL_COLORS[id]}" title="${aname(id)}"></i>`).join('')}</span>
        <span class="sval">${r.score}</span></li>`).join('')}</ol>
      <small>Wertung: Summe der Quartettwerte × Anzahl der Quartette</small>
      <button type="button" class="pill pill-red" data-a="exit">Zur Startseite</button>
    </div></div>`;
  }

  // ----- Effekte: Tier fliegt zum neuen Besitzer, Konfetti am Ende -----
  let effects = '';
  const le = v.lastEvent;
  if (fresh && (state.phase === 'turn' || state.phase === 'ended') && le && (le.type === 'auction_won' || le.type === 'trade')) {
    const to = le.type === 'trade' ? le.winner : le.buyer;
    const i = idxOf(to);
    const slot = 374 / v.players.length;
    const ty = Math.round(8 + slot * (i + 0.5) - 195);
    const n = le.type === 'trade' ? le.count : 1;
    effects += Array.from({ length: n }, (_, k) => `<div class="fly" style="--tx:${704 - 376}px;--ty:${ty}px;animation-delay:${k * 120}ms">
      <div class="bigcard-head" style="--a:${ANIMAL_COLORS[le.animal]}"><span class="mono">${art(le.animal)}</span></div></div>`).join('');
  }
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
    ${ctx.toastMsg ? `<div class="toast" role="alert">${esc(ctx.toastMsg)}</div>` : ''}
  </div></div>`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const fn = H[b.dataset.a];
    if (fn) fn(b.dataset.v);
  };
  fitStage();
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
