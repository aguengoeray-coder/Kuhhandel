// Kuhhandel – Spiellogik (ohne Oberfläche, ohne Netzwerk)
// Jede Aktion nimmt den aktuellen Spielstand und gibt einen NEUEN Spielstand zurück.
// Ungültige Aktionen werfen einen Fehler (GameError) mit deutscher Meldung.

export const ANIMALS = [
  { id: 'hahn', name: 'Hahn', value: 10 },
  { id: 'gans', name: 'Gans', value: 40 },
  { id: 'katze', name: 'Katze', value: 90 },
  { id: 'hund', name: 'Hund', value: 160 },
  { id: 'schaf', name: 'Schaf', value: 250 },
  { id: 'ziege', name: 'Ziege', value: 350 },
  { id: 'esel', name: 'Esel', value: 500 },
  { id: 'schwein', name: 'Schwein', value: 650 },
  { id: 'kuh', name: 'Kuh', value: 800 },
  { id: 'pferd', name: 'Pferd', value: 1000 },
];
export const ANIMAL_BY_ID = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));

export const START_MONEY = [0, 0, 10, 10, 10, 20, 50]; // = 100 Taler
export const DONKEY_PAYOUTS = [50, 100, 200, 500]; // 1. bis 4. Esel: jeder Spieler bekommt so viel von der Bank
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 4;
export const BID_STEP = 10;
export const AUCTION_START_MS = 20000; // so lange läuft eine Versteigerung ohne Gebot
export const AUCTION_BID_MS = 15000;   // nach jedem Gebot startet der Countdown neu
const GRACE_MS = 800;                  // kleine Toleranz für Handys mit leicht abweichender Uhr

export class GameError extends Error {}

const fail = (msg) => { throw new GameError(msg); };
const clone = (x) => JSON.parse(JSON.stringify(x));
const sum = (cards) => cards.reduce((a, b) => a + b, 0);
const animalName = (id) => ANIMAL_BY_ID[id].name;

// Kleiner Zufallsgenerator mit Startwert, damit Spiele nachvollziehbar sind
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, seed) {
  const rand = rng(seed);
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Bank-Geldkarten für einen Betrag (größte Scheine zuerst)
function bankCards(amount) {
  const notes = [500, 200, 100, 50, 20, 10];
  const out = [];
  let rest = amount;
  for (const n of notes) while (rest >= n) { out.push(n); rest -= n; }
  return out;
}

function player(state, id) {
  return state.players.find((p) => p.id === id) || fail('Unbekannter Spieler.');
}

function log(state, text) {
  state.log.push(text);
  if (state.log.length > 200) state.log.shift();
}

// Karten per Index aus der Hand nehmen; prüft, dass jeder Index gültig und einmalig ist
function takeCards(p, indices) {
  const set = new Set(indices);
  if (set.size !== indices.length) fail('Eine Karte wurde doppelt gewählt.');
  for (const i of indices) {
    if (!Number.isInteger(i) || i < 0 || i >= p.money.length) fail('Diese Geldkarte gibt es nicht.');
  }
  const taken = indices.map((i) => p.money[i]);
  p.money = p.money.filter((_, i) => !set.has(i));
  return taken;
}

function giveCards(p, cards) {
  p.money.push(...cards);
  p.money.sort((a, b) => a - b);
}

function moveAnimals(from, to, animal, count) {
  from.animals[animal] -= count;
  to.animals[animal] = (to.animals[animal] || 0) + count;
}

// ---------- Spielstart ----------

export function createGame({ players, seed = Date.now() }) {
  if (!Array.isArray(players) || players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
    fail(`Es braucht ${MIN_PLAYERS} bis ${MAX_PLAYERS} Spieler.`);
  }
  const ids = new Set(players.map((p) => p.id));
  if (ids.size !== players.length) fail('Spieler-IDs müssen eindeutig sein.');
  const deck = shuffle(ANIMALS.flatMap((a) => [a.id, a.id, a.id, a.id]), seed);
  const state = {
    phase: 'turn',
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      money: START_MONEY.slice(),
      animals: Object.fromEntries(ANIMALS.map((a) => [a.id, 0])),
    })),
    deck,
    donkeysDrawn: 0,
    turn: 0,
    auction: null,
    payment: null,
    trade: null,
    lastEvent: null,
    log: [],
    winner: null,
  };
  log(state, 'Das Spiel beginnt.');
  return state;
}

export function currentPlayer(state) {
  return state.players[state.turn];
}

// ---------- Hilfsabfragen ----------

// Ist eine Tierart komplett bei einem Spieler (Quartett)?
export function isQuartetComplete(state, animal) {
  return state.players.some((p) => p.animals[animal] === 4);
}

// Mögliche Kuhhandel-Ziele für einen Spieler: [{ target, animal, count }]
export function possibleTrades(state, playerId) {
  const me = player(state, playerId);
  const out = [];
  for (const other of state.players) {
    if (other.id === me.id) continue;
    for (const a of ANIMALS) {
      const mine = me.animals[a.id];
      const theirs = other.animals[a.id];
      if (mine > 0 && theirs > 0) {
        out.push({ target: other.id, animal: a.id, count: mine === 2 && theirs === 2 ? 2 : 1 });
      }
    }
  }
  return out;
}

function allQuartetsComplete(state) {
  return ANIMALS.every((a) => isQuartetComplete(state, a.id));
}

export function scores(state) {
  return state.players.map((p) => {
    const quartets = ANIMALS.filter((a) => p.animals[a.id] === 4);
    const base = quartets.reduce((s, a) => s + a.value, 0);
    return { id: p.id, name: p.name, quartets: quartets.map((a) => a.id), score: base * quartets.length };
  });
}

// Nächster Zug. Ist der Stapel leer und kann ein Spieler nicht handeln, wird er übersprungen.
function nextTurn(state) {
  state.auction = null;
  state.payment = null;
  state.trade = null;
  if (state.deck.length === 0 && allQuartetsComplete(state)) {
    state.phase = 'ended';
    const s = scores(state);
    const best = Math.max(...s.map((x) => x.score));
    state.winner = s.filter((x) => x.score === best).map((x) => x.id);
    log(state, 'Alle Quartette sind vollständig – das Spiel ist vorbei.');
    return;
  }
  for (let step = 0; step < state.players.length; step++) {
    state.turn = (state.turn + 1) % state.players.length;
    const p = currentPlayer(state);
    if (state.deck.length > 0 || possibleTrades(state, p.id).length > 0) {
      state.phase = 'turn';
      return;
    }
    log(state, `${p.name} kann nicht handeln und setzt aus.`);
  }
  // Niemand kann handeln, obwohl nicht alles fertig ist – kann bei korrekten Regeln nicht passieren
  state.phase = 'ended';
  state.winner = [];
}

function requireTurn(state, playerId) {
  if (state.phase !== 'turn') fail('Gerade ist keine neue Aktion möglich.');
  if (currentPlayer(state).id !== playerId) fail('Du bist nicht am Zug.');
}

// ---------- Versteigerung ----------

export function drawForAuction(prev, playerId, now) {
  const state = clone(prev);
  requireTurn(state, playerId);
  if (state.deck.length === 0) fail('Der Stapel ist leer – nur noch Kuhhandel ist möglich.');
  const animal = state.deck.shift();
  const me = player(state, playerId);
  log(state, `${me.name} versteigert: ${animalName(animal)}.`);
  if (animal === 'esel') {
    const payout = DONKEY_PAYOUTS[state.donkeysDrawn];
    state.donkeysDrawn += 1;
    for (const p of state.players) giveCards(p, bankCards(payout));
    log(state, `${state.donkeysDrawn}. Esel – alle bekommen ${payout} Taler von der Bank.`);
    state.lastEvent = { type: 'donkey', number: state.donkeysDrawn, payout };
  } else {
    state.lastEvent = { type: 'draw', animal };
  }
  state.auction = { animal, auctioneer: playerId, high: null, caps: {}, passed: [], endsAt: now != null ? now + AUCTION_START_MS : null };
  state.phase = 'auction';
  return state;
}

export function bid(prev, playerId, amount, now) {
  const state = clone(prev);
  if (state.phase !== 'auction') fail('Gerade läuft keine Versteigerung.');
  const a = state.auction;
  if (playerId === a.auctioneer) fail('Der Auktionator bietet nicht mit.');
  const me = player(state, playerId);
  if (!Number.isInteger(amount) || amount <= 0 || amount % BID_STEP !== 0) fail('Gebote gehen nur in 10er-Schritten.');
  if (a.high && amount <= a.high.amount) fail(`Du musst mehr als ${a.high.amount} bieten.`);
  if (a.caps[playerId] != null && amount > a.caps[playerId]) {
    fail(`Du darfst höchstens ${a.caps[playerId]} bieten.`);
  }
  if (a.endsAt != null && now != null && now > a.endsAt + GRACE_MS) fail('Die Versteigerung ist schon vorbei.');
  a.high = { player: playerId, amount };
  a.passed = a.passed.filter((id) => id !== playerId);
  if (a.endsAt != null && now != null) a.endsAt = Math.max(a.endsAt, now + AUCTION_BID_MS);
  log(state, `${me.name} bietet ${amount}.`);
  return state;
}

export function passAuction(prev, playerId, now) {
  const state = clone(prev);
  if (state.phase !== 'auction') fail('Gerade läuft keine Versteigerung.');
  const a = state.auction;
  if (playerId === a.auctioneer) fail('Der Auktionator kann nicht passen.');
  if (!a.passed.includes(playerId)) a.passed.push(playerId);
  // Haben alle außer dem Höchstbietenden gepasst, ist die Versteigerung sofort vorbei
  const others = state.players.filter((p) => p.id !== a.auctioneer && (!a.high || p.id !== a.high.player));
  if (a.endsAt != null && now != null && others.every((p) => a.passed.includes(p.id))) a.endsAt = Math.min(a.endsAt, now);
  return state;
}

// Auktionator beendet die Versteigerung: 'sell' = Zuschlag an den Höchstbietenden,
// 'buy' = Vorkaufsrecht (Auktionator kauft selbst und zahlt an den Höchstbietenden)
export function closeAuction(prev, playerId, mode, now) {
  const state = clone(prev);
  if (state.phase !== 'auction') fail('Gerade läuft keine Versteigerung.');
  const a = state.auction;
  if (playerId !== a.auctioneer) fail('Nur der Auktionator kann die Versteigerung beenden.');
  if (a.endsAt != null && now != null && now < a.endsAt) fail('Die Versteigerung läuft noch.');
  const auctioneer = player(state, a.auctioneer);

  if (!a.high) {
    auctioneer.animals[a.animal] += 1;
    log(state, `Niemand bietet – ${auctioneer.name} bekommt ${animalName(a.animal)} umsonst.`);
    state.lastEvent = { type: 'auction_won', animal: a.animal, buyer: auctioneer.id, amount: 0 };
    nextTurn(state);
    return state;
  }

  const bidder = player(state, a.high.player);
  if (mode === 'buy') {
    if (sum(auctioneer.money) < a.high.amount) fail('Du hast nicht genug Geld für das Vorkaufsrecht.');
    state.payment = { payer: auctioneer.id, payee: bidder.id, amount: a.high.amount, animal: a.animal, buyer: auctioneer.id };
    log(state, `${auctioneer.name} nutzt das Vorkaufsrecht für ${a.high.amount}.`);
    state.phase = 'payment';
    return state;
  }
  if (mode !== 'sell') fail('Unbekannte Entscheidung.');

  // Kann der Höchstbietende überhaupt zahlen? Sonst: Karten offenlegen, Versteigerung neu
  if (sum(bidder.money) < a.high.amount) {
    const failed = a.high.amount;
    state.lastEvent = { type: 'cant_pay', player: bidder.id, amount: failed, revealed: bidder.money.slice() };
    a.caps[bidder.id] = failed - BID_STEP;
    a.high = null;
    a.passed = [];
    if (a.endsAt != null && now != null) a.endsAt = now + AUCTION_START_MS;
    log(state, `${bidder.name} kann ${failed} nicht zahlen und muss alle Karten zeigen: ${bidder.money.join(', ') || 'keine'}. Die Versteigerung beginnt neu.`);
    return state; // Phase bleibt 'auction'
  }
  state.payment = { payer: bidder.id, payee: auctioneer.id, amount: a.high.amount, animal: a.animal, buyer: bidder.id };
  log(state, `Zuschlag: ${bidder.name} für ${a.high.amount}.`);
  state.phase = 'payment';
  return state;
}

// Zahlen mit selbst gewählten Karten. Kein Wechselgeld: Überzahltes ist weg.
export function pay(prev, playerId, cardIndices) {
  const state = clone(prev);
  if (state.phase !== 'payment') fail('Gerade ist keine Zahlung offen.');
  const pm = state.payment;
  if (playerId !== pm.payer) fail('Du musst gerade nicht zahlen.');
  const payer = player(state, pm.payer);
  const chosen = cardIndices.map((i) => payer.money[i]);
  if (chosen.some((v) => v === undefined)) fail('Diese Geldkarte gibt es nicht.');
  if (sum(chosen) < pm.amount) fail(`Das reicht nicht – es fehlen noch ${pm.amount - sum(chosen)} Taler.`);
  const cards = takeCards(payer, cardIndices);
  giveCards(player(state, pm.payee), cards);
  const buyer = player(state, pm.buyer);
  buyer.animals[pm.animal] += 1;
  log(state, `${payer.name} zahlt mit ${cards.length} Karte(n). ${buyer.name} bekommt ${animalName(pm.animal)}.`);
  state.lastEvent = { type: 'auction_won', animal: pm.animal, buyer: buyer.id, amount: pm.amount, cardCount: cards.length };
  nextTurn(state);
  return state;
}

// ---------- Kuhhandel ----------

export function startTrade(prev, playerId, targetId, animal, cardIndices) {
  const state = clone(prev);
  requireTurn(state, playerId);
  if (playerId === targetId) fail('Du kannst nicht mit dir selbst handeln.');
  const me = player(state, playerId);
  const target = player(state, targetId);
  if (!ANIMAL_BY_ID[animal]) fail('Unbekanntes Tier.');
  if (!(me.animals[animal] > 0 && target.animals[animal] > 0)) fail('Ihr müsst beide dieses Tier haben.');
  if (cardIndices.length === 0 && me.money.length > 0) fail('Lege mindestens eine Karte ins Angebot.');
  const count = me.animals[animal] === 2 && target.animals[animal] === 2 ? 2 : 1;
  const offer = takeCards(me, cardIndices);
  state.trade = { challenger: me.id, target: target.id, animal, count, offer };
  state.phase = 'trade';
  log(state, `${me.name} fordert ${target.name} zum Kuhhandel um ${count}× ${animalName(animal)} heraus (${offer.length} Karte(n)).`);
  return state;
}

// Herausgeforderter nimmt an: bekommt das Geld, gibt das Tier ab
export function acceptTrade(prev, playerId) {
  const state = clone(prev);
  if (state.phase !== 'trade') fail('Gerade läuft kein Kuhhandel.');
  const t = state.trade;
  if (playerId !== t.target) fail('Nur der Herausgeforderte kann antworten.');
  const ch = player(state, t.challenger);
  const tg = player(state, t.target);
  giveCards(tg, t.offer);
  moveAnimals(tg, ch, t.animal, t.count);
  log(state, `${tg.name} nimmt den Kuhhandel an. ${ch.name} bekommt ${t.count}× ${animalName(t.animal)}.`);
  state.lastEvent = { type: 'trade', ...t, accepted: true, winner: ch.id, offerSum: sum(t.offer) };
  nextTurn(state);
  return state;
}

// Herausgeforderter bietet verdeckt dagegen. Gebote werden IMMER getauscht.
// Höheres Gebot gewinnt die Tiere, bei Gleichstand gewinnt der Herausforderer.
export function counterTrade(prev, playerId, cardIndices) {
  const state = clone(prev);
  if (state.phase !== 'trade') fail('Gerade läuft kein Kuhhandel.');
  const t = state.trade;
  if (playerId !== t.target) fail('Nur der Herausgeforderte kann antworten.');
  const ch = player(state, t.challenger);
  const tg = player(state, t.target);
  if (cardIndices.length === 0 && tg.money.length > 0) fail('Lege mindestens eine Karte ins Gegenangebot.');
  const counter = takeCards(tg, cardIndices);
  const offerSum = sum(t.offer);
  const counterSum = sum(counter);
  giveCards(ch, counter);
  giveCards(tg, t.offer);
  const challengerWins = offerSum >= counterSum;
  if (challengerWins) moveAnimals(tg, ch, t.animal, t.count);
  else moveAnimals(ch, tg, t.animal, t.count);
  const winner = challengerWins ? ch : tg;
  // Im Protokoll (für alle sichtbar) keine Beträge – die sehen nur die beiden Beteiligten
  log(state, `Kuhhandel ${ch.name} (${t.offer.length} Karten) gegen ${tg.name} (${counter.length} Karten): ${winner.name} bekommt ${t.count}× ${animalName(t.animal)}.`);
  state.lastEvent = { type: 'trade', ...t, accepted: false, counter, offerSum, counterSum, winner: winner.id };
  nextTurn(state);
  return state;
}

// ---------- Sicht eines Spielers (verdeckte Infos ausblenden) ----------

export function viewFor(state, playerId) {
  const v = clone(state);
  v.deck = state.deck.length; // nur die Anzahl
  for (const p of v.players) {
    if (p.id !== playerId) p.money = p.money.length; // fremdes Geld: nur Kartenanzahl
  }
  if (v.trade && v.trade.challenger !== playerId) v.trade.offer = v.trade.offer.length;
  // Abgeschlossener Kuhhandel: Unbeteiligte sehen nur die Kartenanzahl, nicht die Werte.
  // Wurde angenommen, kennt nur der Herausgeforderte (und der Herausforderer) das Angebot.
  const e = v.lastEvent;
  if (e && e.type === 'trade' && e.challenger !== playerId && e.target !== playerId) {
    e.offer = e.offer.length;
    if (e.counter) e.counter = e.counter.length;
    delete e.offerSum;
    delete e.counterSum;
  }
  return v;
}
