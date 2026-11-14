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
// Turbo-Spielart: ohne die drei günstigsten Tierarten (Hahn, Gans, Katze) → 7 Arten, kürzere Partie
export const TURBO_DROP = ['hahn', 'gans', 'katze'];
export const TURBO_AUCTION_MS = 6000;
export function isTurbo(stateOrSettings) { const st = stateOrSettings && (stateOrSettings.settings !== undefined ? stateOrSettings.settings : stateOrSettings); return !!(st && st.turbo); }
// Tierarten dieser Partie
export function animalsOf(stateOrSettings) { return isTurbo(stateOrSettings) ? ANIMALS.filter((a) => !TURBO_DROP.includes(a.id)) : ANIMALS; }
export function auctionStartMs(state) { if (state && state.auction && state.auction.fast) return HEKTIK_MS; return isTurbo(state) ? TURBO_AUCTION_MS : AUCTION_START_MS; }
export function auctionBidMs(state) { if (state && state.auction && state.auction.fast) return HEKTIK_MS; return isTurbo(state) ? TURBO_AUCTION_MS : AUCTION_BID_MS; }

// ---------- Börsen-Chaos (eigene Spielart, nie zusammen mit Turbo) ----------
// 8 Börsen-News im Stapel: 2× Kursrallye, 2× Kurssturz (je ein Tier, beim Mischen ausgelost), Dividende, Steuerprüfung, Marktpanik, Hektik.
// Aufgedeckt → Wirkung sofort, danach deckt der Aufdecker nochmal auf (wie bei der Ratte).
export const NEWS_PREFIX = 'news-';
export const HEKTIK_MS = 5000;          // Hektik: Versteigerungen nur 5 s
export const HEKTIK_COUNT = 3;          // … die nächsten 3
export const KURS_STEP = 50;            // Kurssturz −50 % (stapelbar, nie unter 0); alte Rallye-Karten ohne Zahl = +50 %
export const RALLYE_MIN = 30, RALLYE_MAX = 100; // v0.63: Kursrallye zufällig +30 … +100 % (10er-Schritte, beim Mischen ausgelost)
export const DIVIDENDE = 50;
export const isNewsCard = (card) => typeof card === 'string' && card.startsWith(NEWS_PREFIX);
export function isBoerse(stateOrSettings) { const st = stateOrSettings && (stateOrSettings.settings !== undefined ? stateOrSettings.settings : stateOrSettings); return !!(st && st.boerse && !st.turbo); }
// 'news-rallye-kuh-70' → { kind: 'rallye', animal: 'kuh', pct: 70 } · 'news-steuer' → { kind: 'steuer' }
export function newsOf(card) {
  const [kind, animal, num] = card.slice(NEWS_PREFIX.length).split('-');
  if (!animal) return { kind };
  const pct = kind === 'rallye' || kind === 'crash' ? (Number(num) > 0 ? Number(num) : KURS_STEP) : undefined;
  return pct ? { kind, animal, pct } : { kind, animal };
}
// aktueller Wert eines Tiers (Börsen-Chaos: Kurs in Prozentpunkten, z. B. +50 → 150 %)
export function kursValue(animal, kurse) {
  const base = ANIMAL_BY_ID[animal].value;
  const k = kurse && kurse[animal] ? kurse[animal] : 0;
  return Math.max(0, Math.round(base * (100 + k) / 100));
}
function newsCards(seed) {
  const r = rng(seed ^ 0x5eed);
  const pick = () => ANIMALS[Math.floor(r() * ANIMALS.length)].id;
  const up = () => RALLYE_MIN + 10 * Math.floor(r() * ((RALLYE_MAX - RALLYE_MIN) / 10 + 1));
  return [`rallye-${pick()}-${up()}`, `rallye-${pick()}-${up()}`, `crash-${pick()}`, `crash-${pick()}`, 'dividende', 'steuer', 'panik', 'hektik'].map((x) => NEWS_PREFIX + x);
}

export const START_MONEY = [0, 0, 10, 10, 10, 20, 50]; // = 100 Taler
export const DONKEY_PAYOUTS = [50, 100, 200, 500]; // 1. bis 4. Esel: jeder Spieler bekommt so viel von der Bank
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 4;
export const BID_STEP = 10;
export const AUCTION_START_MS = 10000; // so lange läuft eine Versteigerung ohne Gebot
export const REVEAL_MS = 1500;          // Aufdeck-Animation: erst danach läuft die Zeit und man kann bieten
export const AUCTION_BID_MS = 10000;   // nach jedem Gebot startet der Countdown neu
const GRACE_MS = 800;                  // kleine Toleranz für Handys mit leicht abweichender Uhr

// Ratten und Spezialkarten (feste Hausregel)
export const RAT = 'ratte';
export const RAT_COUNT = 4;
export const SPECIAL_VALUE = 250;
export const SPECIAL_PREFIX = 'sp-';          // Spezialkarte im Stapel: 'sp-kuh' usw.
export const SPECIAL_DELAY_MS = 2000;         // „Achtung“ vor dem Buzzer-Countdown
export const SPECIAL_TICK_MS = 1000;          // eine Sekunde pro Zahl
export const SPECIAL_FROM = 10;               // Countdown 10 … 1
export const BATZEN_WAIT_MS = 3000;           // „Zeig Batzen!“: so lange kann jeder drücken
export const BATZEN_SHOW_MS = 3000;           // so lange liegen die Stapel auf dem Tisch
export const CANTPAY_HOLD_MS = 5000;          // „Kann nicht zahlen“: so lange sehen alle die Scheine, erst danach geht es weiter
export const RPS = ['stein', 'schere', 'papier'];
const BEATS = { stein: 'schere', schere: 'papier', papier: 'stein' };

// Geldscheine im Stapel (Einstellung im Warteraum)
export const MONEY_PREFIX = 'geld-';
export const MONEY_VALUES = [0, 10, 20, 50, 100, 200, 500];
export const MAX_MONEY_CARDS = 20;
export const isMoneyCard = (card) => typeof card === 'string' && card.startsWith(MONEY_PREFIX);
export const moneyValue = (card) => Number(card.slice(MONEY_PREFIX.length));

// Einstellung { "200": 4, "0": 5 } → Liste der Scheine; prüft Werte und Obergrenze
export function moneyDeckFrom(counts) {
  if (!counts) return [];
  const out = [];
  for (const [k, n] of Object.entries(counts)) {
    const v = Number(k);
    if (!MONEY_VALUES.includes(v)) fail(`Ungültiger Geldschein: ${k}`);
    if (!Number.isInteger(n) || n < 0) fail('Ungültige Anzahl.');
    for (let i = 0; i < n; i++) out.push(v);
  }
  if (out.length > MAX_MONEY_CARDS) fail(`Höchstens ${MAX_MONEY_CARDS} Geldscheine im Stapel.`);
  return out.sort((a, b) => a - b);
}

export const isSpecialCard = (card) => typeof card === 'string' && card.startsWith(SPECIAL_PREFIX);
export const specialAnimal = (card) => card.slice(SPECIAL_PREFIX.length);
export function cardName(card) {
  if (card === RAT) return 'Ratte';
  if (isSpecialCard(card)) return `${animalName(specialAnimal(card))}-Spezialkarte`;
  if (isNewsCard(card)) return 'Börsen-News';
  return animalName(card);
}

export class GameError extends Error {}

const fail = (msg) => { throw new GameError(msg); };
const clone = (x) => JSON.parse(JSON.stringify(x));
const sum = (cards) => cards.reduce((a, b) => a + b, 0);
const animalName = (id) => (id === RAT ? 'Ratte' : ANIMAL_BY_ID[id].name);

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

// Rückblick am Spielende: kleine Zähler pro Spieler (alte Spielstände ohne Zähler: wird angelegt)
function stat(state, id) {
  if (!state.stats) state.stats = {};
  if (!state.stats[id]) state.stats[id] = { buys: 0, maxBuy: null, tradesWon: 0, tradesLost: 0, ratsTaken: 0, ratCards: 0, moneyDrawn: 0, specialsWon: 0, buzzes: 0 };
  return state.stats[id];
}

// Nullen im eigenen, gewonnenen Kuhhandel-Gebot (für die Auszeichnung „Bluffer“)
function bluff(state, id, cards) {
  const z = cards.filter((c) => c === 0).length;
  if (z) { const st = stat(state, id); st.bluffZeros = (st.bluffZeros || 0) + z; }
}

function moveAnimals(from, to, animal, count) {
  from.animals[animal] -= count;
  to.animals[animal] = (to.animals[animal] || 0) + count;
}

// ---------- Spielstart ----------

export function createGame({ players, seed = Date.now(), settings = null }) {
  if (!Array.isArray(players) || players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
    fail(`Es braucht ${MIN_PLAYERS} bis ${MAX_PLAYERS} Spieler.`);
  }
  const ids = new Set(players.map((p) => p.id));
  if (ids.size !== players.length) fail('Spieler-IDs müssen eindeutig sein.');
  const kinds = animalsOf(settings);
  const cards = [
    ...kinds.flatMap((a) => [a.id, a.id, a.id, a.id]),
    ...kinds.map((a) => SPECIAL_PREFIX + a.id),
    ...Array(RAT_COUNT).fill(RAT),
    ...moneyDeckFrom(settings && settings.money).map((v) => MONEY_PREFIX + v),
    ...(isBoerse(settings) ? newsCards(seed) : []),
  ];
  const deck = shuffle(cards, seed);
  const state = {
    phase: 'turn',
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      money: START_MONEY.slice(),
      animals: { ...Object.fromEntries(kinds.map((a) => [a.id, 0])), [RAT]: 0 },
      specials: [],
    })),
    deck,
    donkeysDrawn: 0,
    turn: 0,
    auction: null,
    payment: null,
    trade: null,
    rat: null,
    special: null,
    mustDraw: false,
    block: null,
    blocked: null,
    lastEvent: null,
    log: [],
    winner: null,
    settings: settings || null,
    stats: {},
    ...(isBoerse(settings) ? { kurse: {}, hektik: 0 } : {}),
  };
  for (const p of players) stat(state, p.id);
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
    for (const id of [...ANIMALS.map((a) => a.id), RAT]) {
      const mine = me.animals[id] || 0;
      const theirs = other.animals[id] || 0;
      if (mine > 0 && theirs > 0) {
        out.push({ target: other.id, animal: id, count: mine === 2 && theirs === 2 ? 2 : 1 });
      }
    }
  }
  return out;
}

function allQuartetsComplete(state) {
  // Ratten müssen alle bei einem liegen (alte Spielstände ohne Ratten: entfällt)
  const rats = state.players.reduce((n, p) => n + (p.animals[RAT] || 0), 0) + state.deck.filter((c) => c === RAT).length;
  return animalsOf(state).every((a) => isQuartetComplete(state, a.id))
    && (rats === 0 || state.players.some((p) => (p.animals[RAT] || 0) === rats));
}

// Punkte eines Spielers. blockedAnimal = Quartett, das durch die Ratten nicht zählt.
// Spezialkarte zum (nicht blockierten) Quartett: zählt vor dem Malnehmen mit.
// Spezialkarte ohne zählendes Quartett: +250 nach dem Malnehmen.
// withMoney (Einstellung „Geld zählt am Ende“): übriges Geld wird am Schluss dazugezählt (nicht multipliziert)
export function scoreFor(p, blockedAnimal = null, withMoney = false, kurse = null) {
  const specials = p.specials || [];
  const quartets = ANIMALS.filter((a) => p.animals[a.id] === 4 && a.id !== blockedAnimal);
  const base = quartets.reduce((s, a) => s + kursValue(a.id, kurse) + (specials.includes(a.id) ? SPECIAL_VALUE : 0), 0);
  const loose = specials.filter((id) => !quartets.some((a) => a.id === id)).length;
  const money = withMoney && Array.isArray(p.money) ? sum(p.money) : 0;
  return { quartets: quartets.map((a) => a.id), score: base * quartets.length + loose * SPECIAL_VALUE + money, money };
}

export function scores(state) {
  return state.players.map((p) => {
    const blocked = state.blocked && state.blocked.player === p.id ? state.blocked.animal : null;
    const r = scoreFor(p, blocked, !!(state.settings && state.settings.moneyCounts), state.kurse || null);
    return { id: p.id, name: p.name, quartets: r.quartets, score: r.score, money: r.money, specials: (p.specials || []).slice(), rats: p.animals[RAT] || 0, blocked };
  });
}

function finishGame(state) {
  state.phase = 'ended';
  const s = scores(state);
  const best = Math.max(...s.map((x) => x.score));
  state.winner = s.filter((x) => x.score === best).map((x) => x.id);
}

// Alles verteilt: Wer alle Ratten hat, blockiert ein eigenes Quartett (falls er eins hat)
function endGame(state) {
  state.phase = 'block';
  const ratOwner = state.players.find((p) => (p.animals[RAT] || 0) > 0);
  log(state, 'Alle Quartette sind vollständig – das Spiel ist vorbei.');
  if (ratOwner && ANIMALS.some((a) => ratOwner.animals[a.id] === 4)) {
    state.block = { player: ratOwner.id };
    log(state, `${ratOwner.name} hat alle Ratten und muss ein Quartett blockieren.`);
    return;
  }
  finishGame(state);
}

// Nur für den Debug-Modus: alle Quartette sind verteilt → regulär beenden (Ratten-Block bzw. Abrechnung wie im echten Spiel)
export function debugEnd(prev) {
  const state = clone(prev);
  if (!allQuartetsComplete(state)) fail('Erst alle Quartette verteilen.');
  state.deck = [];
  endGame(state);
  return state;
}

export function chooseBlock(prev, playerId, animal) {
  const state = clone(prev);
  if (state.phase !== 'block') fail('Gerade muss nichts blockiert werden.');
  if (state.block.player !== playerId) fail('Nur wer die Ratten hat, blockiert.');
  const p = player(state, playerId);
  if (!ANIMAL_BY_ID[animal] || p.animals[animal] !== 4) fail('Du kannst nur ein eigenes Quartett blockieren.');
  state.blocked = { player: playerId, animal };
  state.block = null;
  log(state, `${p.name} blockiert das ${animalName(animal)}-Quartett.`);
  finishGame(state);
  return state;
}

// Nächster Zug. Ist der Stapel leer und kann ein Spieler nicht handeln, wird er übersprungen.
function nextTurn(state) {
  state.auction = null;
  state.payment = null;
  state.trade = null;
  state.rat = null;
  state.special = null;
  state.mustDraw = false;
  if (state.deck.length === 0 && allQuartetsComplete(state)) {
    endGame(state);
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

// Nach der Ratte: Der Aufdecker muss noch eine Karte aufdecken – oder, wenn der Stapel leer ist, kuhhandeln
function afterRat(state) {
  state.rat = null;
  if (state.deck.length > 0) {
    state.phase = 'turn';
    state.mustDraw = true;
    return;
  }
  if (allQuartetsComplete(state)) { endGame(state); return; }
  if (possibleTrades(state, currentPlayer(state).id).length > 0) {
    state.phase = 'turn';
    state.mustDraw = false;
    return;
  }
  // Kann nicht handeln → der Nächste ist dran (nextTurn geht vom Aufdecker aus weiter)
  nextTurn(state);
}

// ---------- Börsen-News ----------
const NEWS_TEXT = {
  rallye: (a, p) => `Kursrallye: ${animalName(a)} +${p || KURS_STEP} %`,
  crash: (a, p) => `Kurssturz: ${animalName(a)} −${p || KURS_STEP} %`,
  dividende: () => `Dividende: alle bekommen ${DIVIDENDE}`,
  steuer: () => 'Steuerprüfung: alle geben ihren höchsten Schein ab',
  panik: () => 'Marktpanik: alle schieben einen zufälligen Schein nach links',
  hektik: () => `Hektik: die nächsten ${HEKTIK_COUNT} Versteigerungen nur ${HEKTIK_MS / 1000} s`,
};
function applyNews(state, me, card) {
  const n = newsOf(card);
  if (!state.kurse) state.kurse = {};
  const ev = { n: state.log.length, type: 'news', kind: n.kind, player: me.id };
  if (n.kind === 'rallye' || n.kind === 'crash') {
    const before = kursValue(n.animal, state.kurse);
    state.kurse[n.animal] = (state.kurse[n.animal] || 0) + (n.kind === 'rallye' ? n.pct : -n.pct);
    Object.assign(ev, { pct: n.pct, animal: n.animal, from: before, to: kursValue(n.animal, state.kurse) });
  } else if (n.kind === 'dividende') {
    for (const p of state.players) giveCards(p, bankCards(DIVIDENDE));
    ev.amount = DIVIDENDE;
  } else if (n.kind === 'steuer') {
    // jeder gibt seinen höchsten Schein an die Bank – verdeckt: jeder sieht nur seinen eigenen (viewFor)
    ev.lost = {};
    for (const p of state.players) {
      if (!p.money.length) continue;
      const i = p.money.indexOf(Math.max(...p.money));
      ev.lost[p.id] = p.money.splice(i, 1)[0];
    }
  } else if (n.kind === 'panik') {
    // gleichzeitig: jeder schiebt eine zufällige Karte an seinen linken Nachbarn (nächster in Spielrichtung)
    const r = rng(state.deck.length * 7919 + state.log.length * 104729 + 17);
    const moves = state.players.map((p) => (p.money.length ? p.money.splice(Math.floor(r() * p.money.length), 1)[0] : null));
    ev.moved = {};
    state.players.forEach((p, i) => {
      const toP = state.players[(i + 1) % state.players.length];
      if (moves[i] != null) { giveCards(toP, [moves[i]]); ev.moved[p.id] = moves[i]; }
    });
  } else if (n.kind === 'hektik') {
    state.hektik = (state.hektik || 0) + HEKTIK_COUNT;
  } else fail('Unbekannte Börsen-News.');
  log(state, `${me.name} deckt Börsen-News auf – ${NEWS_TEXT[n.kind](n.animal, n.pct)}.`);
  state.lastEvent = ev;
}

// ---------- Versteigerung ----------

export function drawForAuction(prev, playerId, now) {
  const state = clone(prev);
  requireTurn(state, playerId);
  if (state.deck.length === 0) fail('Der Stapel ist leer – nur noch Kuhhandel ist möglich.');
  const animal = state.deck.shift();
  const me = player(state, playerId);
  state.mustDraw = false;
  if (animal === RAT) {
    // Rattenrunde: reihum ab links vom Aufdecker (Aufdecker macht mit) Karte legen oder Ratte nehmen
    const n = state.players.length;
    const order = Array.from({ length: n }, (_, k) => state.players[(state.turn + 1 + k) % n].id);
    state.rat = { revealer: playerId, order, idx: 0, pot: [], laid: {} };
    state.phase = 'rat';
    state.lastEvent = { n: state.log.length, type: 'rat_drawn', player: playerId };
    log(state, `${me.name} deckt eine Ratte auf.`);
    return state;
  }
  if (isNewsCard(animal)) {
    applyNews(state, me, animal);
    afterRat(state); // wie nach der Ratte: nochmal aufdecken (Stapel leer → Kuhhandel)
    return state;
  }
  if (isMoneyCard(animal)) {
    // Geldschein: der Aufdecker bekommt ihn, alle sehen den Betrag, der Zug ist vorbei
    const value = moneyValue(animal);
    giveCards(me, [value]);
    stat(state, playerId).moneyDrawn += value;
    state.lastEvent = { n: state.log.length, type: 'money_drawn', player: playerId, value };
    log(state, `${me.name} zieht einen Geldschein: ${value}.`);
    nextTurn(state);
    return state;
  }
  if (isSpecialCard(animal)) {
    const sp = specialAnimal(animal);
    const t = now != null ? now : 0;
    // Erst „Zeig Batzen!“ (5 s, jeder darf drücken), dann „Achtung“, dann Countdown
    state.special = { animal: sp, revealer: playerId, startsAt: t + BATZEN_WAIT_MS + SPECIAL_DELAY_MS, buzzes: {}, caps: {}, rps: null, winner: null,
      batzen: { until: t + BATZEN_WAIT_MS, by: null, at: null, counts: null } };
    state.phase = 'special';
    state.lastEvent = { n: state.log.length, type: 'special_drawn', animal: sp, player: playerId };
    log(state, `${me.name} deckt die ${animalName(sp)}-Spezialkarte auf.`);
    return state;
  }
  log(state, `${me.name} versteigert: ${animalName(animal)}.`);
  if (animal === 'esel') {
    const payout = DONKEY_PAYOUTS[state.donkeysDrawn];
    state.donkeysDrawn += 1;
    for (const p of state.players) giveCards(p, bankCards(payout));
    log(state, `${state.donkeysDrawn}. Esel – alle bekommen ${payout} Taler von der Bank.`);
    state.lastEvent = { n: state.log.length, type: 'donkey', number: state.donkeysDrawn, payout };
  } else {
    state.lastEvent = { n: state.log.length, type: 'draw', animal };
  }
  const fast = (state.hektik || 0) > 0; // Börsen-Chaos „Hektik“: diese Versteigerung nur 5 s
  if (fast) state.hektik -= 1;
  state.auction = { animal, auctioneer: playerId, high: null, caps: {}, passed: [], opensAt: now != null ? now + REVEAL_MS : null, endsAt: now != null ? now + REVEAL_MS + (fast ? HEKTIK_MS : auctionStartMs(state)) : null, ...(fast ? { fast: true } : {}) };
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
  if (a.opensAt != null && now != null && now < a.opensAt - GRACE_MS) fail('Die Karte wird gerade aufgedeckt – gleich geht es los.');
  if (a.holdUntil != null && now != null && now < a.holdUntil - GRACE_MS) fail('Erst schauen alle die Scheine an – gleich geht es weiter.');
  a.high = { player: playerId, amount };
  a.passed = a.passed.filter((id) => id !== playerId);
  const bs = stat(state, playerId); bs.bids = (bs.bids || 0) + 1; bs.maxBid = Math.max(bs.maxBid || 0, amount);
  if (a.endsAt != null && now != null) a.endsAt = Math.max(a.endsAt, now + auctionBidMs(state));
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
    state.lastEvent = { n: state.log.length, type: 'auction_won', animal: a.animal, buyer: auctioneer.id, amount: 0 };
    log(state, `Niemand bietet – ${auctioneer.name} bekommt ${animalName(a.animal)} umsonst.`);
    nextTurn(state);
    return state;
  }

  const bidder = player(state, a.high.player);
  if (mode === 'buy') {
    if (sum(auctioneer.money) < a.high.amount) fail('Du hast nicht genug Geld für das Vorkaufsrecht.');
    state.payment = { payer: auctioneer.id, payee: bidder.id, amount: a.high.amount, animal: a.animal, buyer: auctioneer.id, self: true }; // Vorkaufsrecht
    log(state, `${auctioneer.name} nutzt das Vorkaufsrecht für ${a.high.amount}.`);
    state.phase = 'payment';
    return state;
  }
  if (mode !== 'sell') fail('Unbekannte Entscheidung.');

  // Kann der Höchstbietende überhaupt zahlen? Sonst: Karten offenlegen, Versteigerung neu
  if (sum(bidder.money) < a.high.amount) {
    const failed = a.high.amount;
    state.lastEvent = { n: state.log.length, type: 'cant_pay', player: bidder.id, amount: failed, revealed: bidder.money.slice() };
    a.caps[bidder.id] = failed - BID_STEP;
    a.high = null;
    a.passed = [];
    if (a.endsAt != null && now != null) {
      a.holdUntil = now + CANTPAY_HOLD_MS; // alle schauen erst die Scheine an – vorher bietet niemand
      a.endsAt = a.holdUntil + auctionStartMs(state);
    }
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
  if (pm.special) {
    if (cardIndices.length !== pm.count) fail(`Wähle genau ${pm.count} Karte(n).`);
    const cards = takeCards(payer, cardIndices);
    giveCards(player(state, pm.payee), cards);
    const buyer = player(state, pm.buyer);
    buyer.specials.push(pm.special);
    stat(state, buyer.id).specialsWon += 1;
    log(state, `${payer.name} zahlt ${cards.length} Karte(n). ${buyer.name} bekommt die ${animalName(pm.special)}-Spezialkarte.`);
    state.lastEvent = { n: state.log.length, type: 'special_won', animal: pm.special, buyer: buyer.id, count: cards.length, cardCount: cards.length, payer: pm.payer, payee: pm.payee, self: !!pm.self };
    nextTurn(state);
    return state;
  }
  if (sum(chosen) < pm.amount) fail(`Das reicht nicht – es fehlen noch ${pm.amount - sum(chosen)} Taler.`);
  { const ps = stat(state, payer.id); ps.overpaid = (ps.overpaid || 0) + sum(chosen) - pm.amount; } // kein Wechselgeld
  const cards = takeCards(payer, cardIndices);
  giveCards(player(state, pm.payee), cards);
  const buyer = player(state, pm.buyer);
  buyer.animals[pm.animal] += 1;
  const st = stat(state, buyer.id);
  st.buys += 1;
  if (!st.maxBuy || pm.amount > st.maxBuy.amount) st.maxBuy = { amount: pm.amount, animal: pm.animal };
  log(state, `${payer.name} zahlt mit ${cards.length} Karte(n). ${buyer.name} bekommt ${animalName(pm.animal)}.`);
  state.lastEvent = { n: state.log.length, type: 'auction_won', animal: pm.animal, buyer: buyer.id, amount: pm.amount, cardCount: cards.length, payer: pm.payer, payee: pm.payee, self: !!pm.self };
  nextTurn(state);
  return state;
}

// ---------- Kuhhandel ----------

export function startTrade(prev, playerId, targetId, animal, cardIndices) {
  const state = clone(prev);
  requireTurn(state, playerId);
  if (state.mustDraw) fail('Nach der Ratte musst du noch eine Karte aufdecken.');
  if (playerId === targetId) fail('Du kannst nicht mit dir selbst handeln.');
  const me = player(state, playerId);
  const target = player(state, targetId);
  if (!ANIMAL_BY_ID[animal] && animal !== RAT) fail('Unbekanntes Tier.');
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
  if (t.animal === RAT) {
    // Rattenhandel: Annehmen heißt Geld nehmen und die Ratte(n) bekommen
    moveAnimals(ch, tg, t.animal, t.count);
    log(state, `${tg.name} nimmt das Geld und bekommt ${t.count}× Ratte von ${ch.name}.`);
  } else {
    moveAnimals(tg, ch, t.animal, t.count);
    log(state, `${tg.name} nimmt den Kuhhandel an. ${ch.name} bekommt ${t.count}× ${animalName(t.animal)}.`);
  }
  stat(state, ch.id).tradesWon += 1;
  stat(state, tg.id).tradesLost += 1;
  bluff(state, ch.id, t.offer);
  state.lastEvent = { n: state.log.length, type: 'trade', ...t, accepted: true, winner: ch.id, offerSum: sum(t.offer) };
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
  const winner = challengerWins ? ch : tg;
  const loser = challengerWins ? tg : ch;
  if (t.animal === RAT) {
    // Umgekehrt: Wer mehr bietet, wird die Ratte(n) los
    moveAnimals(winner, loser, t.animal, t.count);
    log(state, `Rattenhandel ${ch.name} gegen ${tg.name}: ${winner.name} wird ${t.count}× Ratte los.`);
  } else {
    moveAnimals(loser, winner, t.animal, t.count);
    // Im Protokoll (für alle sichtbar) keine Beträge – die sehen nur die beiden Beteiligten
    log(state, `Kuhhandel ${ch.name} (${t.offer.length} Karten) gegen ${tg.name} (${counter.length} Karten): ${winner.name} bekommt ${t.count}× ${animalName(t.animal)}.`);
  }
  stat(state, winner.id).tradesWon += 1;
  stat(state, loser.id).tradesLost += 1;
  bluff(state, winner.id, challengerWins ? t.offer : counter);
  if (Math.abs(offerSum - counterSum) <= 10) { const ls = stat(state, loser.id); ls.closeLosses = (ls.closeLosses || 0) + 1; }
  state.lastEvent = { n: state.log.length, type: 'trade', ...t, accepted: false, counter, offerSum, counterSum, diff: Math.abs(offerSum - counterSum), winner: winner.id }; // diff: sehen alle (Beträge bleiben verdeckt)
  nextTurn(state);
  return state;
}

// ---------- Ratte ----------

// Wer muss in der Rattenrunde gerade legen oder nehmen?
export function ratCurrent(state) {
  const r = state.rat;
  return r ? r.order[r.idx % r.order.length] : null;
}

// Eine verdeckte Geldkarte in die Mitte legen (dann ist der Nächste dran)
export function ratLay(prev, playerId, cardIndex) {
  const state = clone(prev);
  if (state.phase !== 'rat') fail('Gerade ist keine Rattenrunde.');
  if (ratCurrent(state) !== playerId) fail('Du bist gerade nicht dran.');
  const me = player(state, playerId);
  if (me.money.length === 0) fail('Du hast keine Karten mehr und musst die Ratte nehmen.');
  const [card] = takeCards(me, [cardIndex]);
  state.rat.pot.push(card);
  state.rat.laid[playerId] = (state.rat.laid[playerId] || 0) + 1;
  state.rat.idx += 1;
  return state;
}

// Ratte nehmen: bekommt alle gelegten Karten
export function ratTake(prev, playerId) {
  const state = clone(prev);
  if (state.phase !== 'rat') fail('Gerade ist keine Rattenrunde.');
  if (ratCurrent(state) !== playerId) fail('Du bist gerade nicht dran.');
  const me = player(state, playerId);
  const pot = state.rat.pot;
  giveCards(me, pot);
  me.animals[RAT] = (me.animals[RAT] || 0) + 1;
  stat(state, playerId).ratsTaken += 1;
  stat(state, playerId).ratCards += pot.length;
  log(state, `${me.name} nimmt die Ratte und bekommt ${pot.length} Karte(n).`);
  state.lastEvent = { n: state.log.length, type: 'rat_taken', player: playerId, count: pot.length, cards: pot.slice(), laid: { ...state.rat.laid } };
  afterRat(state);
  return state;
}

// ---------- Spezialkarte (Buzzer) ----------

// Welche Zahl zeigt der Countdown gerade? null = noch nicht gestartet, 0 = abgelaufen
export function specialNumber(state, now) {
  const sp = state.special;
  if (!sp) return null;
  if (now < sp.startsAt) return null;
  const n = SPECIAL_FROM - Math.floor((now - sp.startsAt) / SPECIAL_TICK_MS);
  return Math.max(0, n);
}

function topBuzz(sp) {
  const vals = Object.values(sp.buzzes);
  if (!vals.length) return null;
  const max = Math.max(...vals);
  return { number: max, players: Object.keys(sp.buzzes).filter((id) => sp.buzzes[id] === max) };
}

// Ab wann steht fest, wer gebuzzert hat (Zahl ist vorbei + kleine Toleranz)
export function specialDecideAt(state) {
  const sp = state.special;
  const top = topBuzz(sp);
  if (!top) return sp.startsAt + SPECIAL_FROM * SPECIAL_TICK_MS;
  return sp.startsAt + (SPECIAL_FROM - top.number + 1) * SPECIAL_TICK_MS + GRACE_MS;
}

// „Zeig Batzen!“: 'ask' (Knopf), 'show' (Stapel liegen auf dem Tisch) oder null
export function batzenStage(state, now) {
  const b = state.special?.batzen;
  if (!b) return null;
  if (!b.by) return now < b.until ? 'ask' : null;
  return now < b.at + BATZEN_SHOW_MS ? 'show' : null;
}

// Jemand ruft „Zeig Batzen!“: alle Geldstapel (Anzahl) werden kurz gezeigt, danach „Achtung“ und Countdown
export function showBatzen(prev, playerId, now) {
  const state = clone(prev);
  if (state.phase !== 'special') fail('Gerade läuft keine Spezialkarte.');
  player(state, playerId);
  const sp = state.special;
  if (batzenStage(state, now) !== 'ask') fail('Zu spät – es geht schon los.');
  const counts = {};
  for (const p of state.players) counts[p.id] = p.money.length;
  sp.batzen = { ...sp.batzen, by: playerId, at: now, counts };
  sp.startsAt = now + BATZEN_SHOW_MS + SPECIAL_DELAY_MS;
  state.lastEvent = { n: state.log.length, type: 'batzen', player: playerId };
  log(state, `${player(state, playerId).name}: „Zeig Batzen!“`);
  return state;
}

// Stand der Spezialkarte: 'wait' (Achtung), 'countdown', 'rps' (Schnick-Schnack-Schnuck), 'decide'
export function specialStage(state, now) {
  const sp = state.special;
  if (!sp) return null;
  if (now < sp.startsAt) return 'wait';
  if (now < specialDecideAt(state)) return 'countdown';
  const top = topBuzz(sp);
  if (top && top.players.length > 1 && !sp.winner) return 'rps';
  return 'decide';
}

// Wer hat den Buzzer gewonnen (und für wie viele Karten)?
export function specialResult(state) {
  const sp = state.special;
  const top = topBuzz(sp);
  if (!top) return null;
  const winner = top.players.length === 1 ? top.players[0] : sp.winner;
  return winner ? { player: winner, count: top.number } : null;
}

export function buzz(prev, playerId, now) {
  const state = clone(prev);
  if (state.phase !== 'special') fail('Gerade läuft keine Spezialkarte.');
  const sp = state.special;
  if (playerId === sp.revealer) fail('Wer die Karte aufgedeckt hat, buzzert nicht.');
  player(state, playerId);
  if (sp.buzzes[playerId] != null) fail('Du hast schon gebuzzert.');
  const n = specialNumber(state, now);
  if (n == null) fail('Der Countdown hat noch nicht begonnen.');
  if (n <= 0) fail('Der Countdown ist schon vorbei.');
  const top = topBuzz(sp);
  if (top && n < top.number) fail('Zu spät – jemand war schneller.');
  if (sp.caps[playerId] != null && n > sp.caps[playerId]) fail(`Du darfst erst bei ${sp.caps[playerId]} drücken.`);
  sp.buzzes[playerId] = n;
  stat(state, playerId).buzzes += 1;
  log(state, `${player(state, playerId).name} buzzert bei ${n}.`);
  return state;
}

// Schnick-Schnack-Schnuck bei Gleichstand: jeder wählt verdeckt, aufgedeckt wird, wenn alle gewählt haben
export function rpsPick(prev, playerId, choice, now) {
  const state = clone(prev);
  if (state.phase !== 'special' || specialStage(state, now) !== 'rps') fail('Gerade gibt es kein Schnick-Schnack-Schnuck.');
  if (!RPS.includes(choice)) fail('Stein, Schere oder Papier?');
  const sp = state.special;
  if (!sp.rps) sp.rps = { players: topBuzz(sp).players, picks: {}, round: 1, last: null };
  const r = sp.rps;
  if (!r.players.includes(playerId)) fail('Du spielst nicht mit.');
  if (r.picks[playerId]) fail('Du hast schon gewählt.');
  r.picks[playerId] = choice;
  if (r.players.some((id) => !r.picks[id])) return state;
  const used = [...new Set(r.players.map((id) => r.picks[id]))];
  r.last = { picks: { ...r.picks }, round: r.round };
  if (used.length !== 2) {
    r.round += 1; // alle gleich oder alle verschieden → nochmal
  } else {
    const win = BEATS[used[0]] === used[1] ? used[0] : used[1];
    const winners = r.players.filter((id) => r.picks[id] === win);
    r.last.winners = winners;
    if (winners.length === 1) sp.winner = winners[0];
    else { r.players = winners; r.round += 1; }
  }
  r.picks = {};
  state.lastEvent = { n: state.log.length, type: 'rps', ...r.last };
  return state;
}

// Aufdecker entscheidet: 'buy' = er zahlt dem Buzzer-Gewinner die Karten und behält die Spezialkarte,
// 'sell' = der Buzzer-Gewinner zahlt ihm die Karten und bekommt die Spezialkarte.
export function specialDecide(prev, playerId, mode, now) {
  const state = clone(prev);
  if (state.phase !== 'special') fail('Gerade läuft keine Spezialkarte.');
  const sp = state.special;
  if (playerId !== sp.revealer) fail('Nur wer die Karte aufgedeckt hat, entscheidet.');
  if (now != null && specialStage(state, now) !== 'decide') fail('Der Countdown läuft noch.');
  const rev = player(state, sp.revealer);
  const res = specialResult(state);
  if (!res) {
    rev.specials.push(sp.animal);
    stat(state, rev.id).specialsWon += 1;
    state.lastEvent = { n: state.log.length, type: 'special_won', animal: sp.animal, buyer: rev.id, count: 0 };
    log(state, `Niemand buzzert – ${rev.name} bekommt die ${animalName(sp.animal)}-Spezialkarte umsonst.`);
    nextTurn(state);
    return state;
  }
  const other = player(state, res.player);
  if (mode === 'buy') {
    if (rev.money.length < res.count) fail(`Du hast keine ${res.count} Karten – du musst verkaufen.`);
    state.payment = { payer: rev.id, payee: other.id, count: res.count, amount: 0, special: sp.animal, buyer: rev.id, self: true }; // Aufdecker behält sie
    log(state, `${rev.name} kauft die Spezialkarte für ${res.count} Karte(n).`);
    state.phase = 'payment';
    return state;
  }
  if (mode !== 'sell') fail('Unbekannte Entscheidung.');
  if (other.money.length < res.count) {
    // Zahlungsunfähig: Karten offen, Countdown neu, darf höchstens bei seiner Kartenanzahl drücken
    state.lastEvent = { n: state.log.length, type: 'cant_pay', player: other.id, count: res.count, revealed: other.money.slice(), special: true };
    sp.caps[other.id] = other.money.length;
    sp.buzzes = {};
    sp.rps = null;
    sp.winner = null;
    sp.startsAt = (now != null ? now : 0) + CANTPAY_HOLD_MS + SPECIAL_DELAY_MS; // erst Scheine anschauen, dann „Achtung“
    log(state, `${other.name} hat keine ${res.count} Karten und muss alle zeigen: ${other.money.join(', ') || 'keine'}. Der Countdown beginnt neu.`);
    return state;
  }
  state.payment = { payer: other.id, payee: rev.id, count: res.count, amount: 0, special: sp.animal, buyer: other.id };
  log(state, `${rev.name} verkauft die Spezialkarte an ${other.name} für ${res.count} Karte(n).`);
  state.phase = 'payment';
  return state;
}

// ---------- Rückblick am Spielende ----------

// Kleine Auszeichnungen aus den Zählern (nur was wirklich vorkam)
export function awards(state) {
  const st = state.stats || {};
  const name = (id) => state.players.find((p) => p.id === id)?.name || '?';
  const best = (key, min = 1) => {
    let top = null;
    for (const p of state.players) {
      const v = st[p.id]?.[key] || 0;
      if (v >= min && (!top || v > top.v)) top = { id: p.id, v };
    }
    return top;
  };
  const out = [];
  let buy = null;
  for (const p of state.players) {
    const m = st[p.id]?.maxBuy;
    if (m && (!buy || m.amount > buy.amount)) buy = { id: p.id, ...m };
  }
  if (buy && buy.amount > 0) out.push({ key: 'buy', title: 'Teuerster Kauf', who: buy.id, name: name(buy.id), text: `${animalName(buy.animal)} für ${buy.amount}` });
  const tr = best('tradesWon');
  if (tr) out.push({ key: 'trade', title: 'Kuhhandel-König', who: tr.id, name: name(tr.id), text: `${tr.v} Kuhhandel gewonnen` });
  const rt = best('ratsTaken');
  if (rt) out.push({ key: 'rat', title: 'Rattenfänger', who: rt.id, name: name(rt.id), text: `${rt.v}× die Ratte genommen` });
  const rc = best('ratCards');
  if (rc && (!rt || rc.id !== rt.id)) out.push({ key: 'ratcards', title: 'Ratten-Kasse', who: rc.id, name: name(rc.id), text: `${rc.v} Karten mit Ratten kassiert` });
  const sw = best('specialsWon');
  if (sw) out.push({ key: 'special', title: 'Sternsammler', who: sw.id, name: name(sw.id), text: `${sw.v} Spezialkarte${sw.v === 1 ? '' : 'n'}` });
  const md = best('moneyDrawn', 10);
  if (md) out.push({ key: 'money', title: 'Glückspilz', who: md.id, name: name(md.id), text: `${md.v} Taler gezogen` });
  let rich = null;
  for (const p of state.players) { const v = sum(p.money); if (!rich || v > rich.v) rich = { id: p.id, v }; }
  if (rich) out.push({ key: 'rich', title: 'Sparfuchs', who: rich.id, name: name(rich.id), text: `${rich.v} Taler übrig` });
  // Momente zum Lachen
  const bl = best('bluffZeros', 2);
  if (bl) out.push({ key: 'bluff', title: 'Bluffer', who: bl.id, name: name(bl.id), text: `${bl.v} Nullen untergejubelt` });
  const pv = best('closeLosses');
  if (pv) out.push({ key: 'pech', title: 'Pechvogel', who: pv.id, name: name(pv.id), text: `${pv.v}× knapp verloren` });
  const tg = best('overpaid', 30);
  if (tg) out.push({ key: 'tip', title: 'Trinkgeld-König', who: tg.id, name: name(tg.id), text: `${tg.v} zu viel bezahlt` });
  // Geizhals: wer am meisten mitgeboten hat, aber nie hoch – nur wenn es eindeutig ist
  const bidders = state.players.map((p) => ({ id: p.id, b: st[p.id]?.bids || 0, m: st[p.id]?.maxBid || 0 })).filter((x) => x.b >= 3 && x.m <= 60);
  if (bidders.length) { const g = bidders.sort((x, y) => x.m - y.m || y.b - x.b)[0]; out.push({ key: 'geiz', title: 'Geizhals', who: g.id, name: name(g.id), text: `${g.b} Gebote, nie über ${g.m}` }); }
  return out;
}

// Scheine finden, mit denen man am wenigsten überzahlt (bei Gleichstand: möglichst wenige Scheine)
export function bestPay(money, amount) {
  let best = new Map([[0, []]]); // Summe → Indizes
  money.forEach((v, i) => {
    if (v === 0) return;
    const next = new Map(best);
    for (const [sum, idx] of best) {
      const s = sum + v;
      const cur = next.get(s);
      if (!cur || cur.length > idx.length + 1) next.set(s, [...idx, i]);
    }
    best = next;
  });
  let pick = null;
  for (const [sum, idx] of best) {
    if (sum < amount) continue;
    if (!pick || sum < pick.sum || (sum === pick.sum && idx.length < pick.idx.length)) pick = { sum, idx };
  }
  return pick ? pick.idx : [];
}

// ---------- Sicht eines Spielers (verdeckte Infos ausblenden) ----------

export function viewFor(state, playerId) {
  const v = clone(state);
  v.deck = state.deck.length; // nur die Anzahl
  for (const p of v.players) {
    if (p.id !== playerId) p.money = p.money.length; // fremdes Geld: nur Kartenanzahl
  }
  if (v.trade && v.trade.challenger !== playerId) v.trade.offer = v.trade.offer.length;
  if (v.rat) v.rat.pot = v.rat.pot.length; // gelegte Karten liegen verdeckt
  if (v.lastEvent && v.lastEvent.type === 'rat_taken' && v.lastEvent.player !== playerId) delete v.lastEvent.cards;
  // Börsen-News: Steuer/Marktpanik – jeder sieht nur seine eigenen Scheine (gegeben bzw. bekommen)
  if (v.lastEvent && v.lastEvent.type === 'news') {
    const e0 = v.lastEvent;
    if (e0.lost) e0.lost = e0.lost[playerId] != null ? { [playerId]: e0.lost[playerId] } : {};
    if (e0.moved) {
      const i = state.players.findIndex((p) => p.id === playerId);
      const fromId = state.players[(i - 1 + state.players.length) % state.players.length].id;
      e0.moved = { gave: e0.moved[playerId] ?? null, got: e0.moved[fromId] ?? null, from: fromId };
    }
  }
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
