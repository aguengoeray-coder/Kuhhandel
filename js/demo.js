// Beispiel-Spielstände für Screenshots (?demo=turn, auction, …). Im echten Spiel nicht benutzt.
import { pay,
  createGame, drawForAuction, bid, closeAuction, startTrade, counterTrade, acceptTrade, ANIMALS,
  RAT, ratLay, buzz, scores, specialDecide, rpsPick, SPECIAL_DELAY_MS, showBatzen, playPfaendung,
  divideLook, divideChoose, waitAuction,
} from '../src/engine.js';

const PLAYERS = [
  { id: 'u1', name: 'Alp' },
  { id: 'u2', name: 'Nico' },
  { id: 'u3', name: 'Lea' },
  { id: 'u4', name: 'Mo' },
];

// ?p=3: dieselben Beispiele mit 3 Spielern (ohne Mo) – für Screenshots/Tests der 3-Spieler-Ansicht
const P3 = typeof location !== 'undefined' && new URLSearchParams(location.search).get('p') === '3';
const TURBO = typeof location !== 'undefined' && new URLSearchParams(location.search).get('turbo') === '1';
function base() {
  const g = createGame({ players: P3 ? PLAYERS.slice(0, 3) : PLAYERS, seed: 7, settings: TURBO ? { turbo: true } : null });
  const set = (i, obj) => { if (g.players[i]) Object.assign(g.players[i].animals, obj); };
  set(0, { hund: 2, kuh: 1, ziege: 1, katze: 2 });
  set(1, { kuh: 1, pferd: 2, katze: 1, hund: 1 });
  set(2, { schaf: 3, kuh: 2 });
  set(3, { gans: 2, schwein: 1, ziege: 2, hahn: 4 });
  g.deck = g.deck.slice(0, 23);
  g.donkeysDrawn = 1;
  g.players[0].specials = ['hund'];
  g.players[1].animals[RAT] = 1;
  g.players[1].specials = ['pferd', 'hahn'];
  if (g.players[3]) g.players[3].animals[RAT] = 1;
  g.players[0].money = [0, 0, 10, 10, 10, 50, 50];
  g.log.push('Mo ersteigert Gans für 30.', 'Lea nimmt den Kuhhandel an. Nico bekommt 1× Hund.');
  return g;
}

// v0.77 Zu zweit: ?demo=duo (du bist dran) · divide (du schaust die Karte an; &other=1: Nico schaut) · divided (gerade aufgeteilt, &pop=1)
function duoBase() {
  const g = createGame({ players: PLAYERS.slice(0, 2), seed: 11, settings: { duo: true } });
  Object.assign(g.players[0].animals, { hund: 2, kuh: 1, ziege: 1, katze: 1 });
  Object.assign(g.players[1].animals, { kuh: 2, pferd: 1, katze: 1, schaf: 2 });
  g.players[1].specials = ['pferd'];
  g.players[0].money = [0, 0, 10, 10, 10, 20, 50, 100];
  g.deck = ['kuh', 'geld-200', 'hund', 'esel', ...g.deck.filter((c) => !['kuh', 'hund', 'esel'].includes(c)).slice(0, 26)];
  return g;
}
export function buildDemoState(kind, local) {
  let g;
  const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
  if (kind === 'duo') return duoBase();
  if (kind === 'duotrade') { g = duoBase(); g.turn = 1; if (qs.get('rat')) { g.players[0].animals.ratte = 1; g.players[1].animals.ratte = 1; } g.players[0].money = [0, 0, 10, 10, 10, 20, 50, 100, 100, 200, 500]; g.players[1].money = [0, 0, 10, 10, 10, 20, 50, 100, 10, 10, 50, 200]; return startTrade(g, 'u2', 'u1', qs.get('rat') ? 'ratte' : 'kuh', qs.get('many') ? Array.from({ length: Number(qs.get('many')) }, (_, i) => i) : [0, 1]); } // v0.77: Kuhhandel zu zweit (du antwortest)
  if (kind === 'divide') { g = duoBase(); if (qs.get('other')) g.turn = 1; return divideLook(g, g.players[g.turn].id, Date.now()); }
  if (kind === 'divided') {
    g = divideChoose(divideLook(duoBase(), 'u1', Date.now()), 'u1', qs.get('give') ? false : true);
    if (qs.get('pop') === '1') local.prev = { logLen: g.log.length - 1, phase: 'divide' };
    return g;
  }
  switch (kind) {
    case 'turn': { // &geldtop=1: oberste Stapelkarte ist ein Geldschein (grüne Rückseite)
      g = base();
      if (new URLSearchParams(location.search).get('geldtop')) g.deck[0] = 'geld-50';
      return g;
    }
    case 'auction3': { // 3 Spieler, volle Plätze (wie im echten Spiel spät in der Partie)
      const t = Date.now() - 4100;
      g = createGame({ players: PLAYERS.slice(0, 3).map((p, i) => (i ? { ...p, name: `Test ${i}` } : p)), seed: 7 });
      Object.assign(g.players[0].animals, { hahn: 2, gans: 2, katze: 1, hund: 1, schaf: 1, esel: 2, schwein: 3, kuh: 1, pferd: 2 });
      Object.assign(g.players[1].animals, { hund: 3, ziege: 2, schaf: 2, pferd: 1, kuh: 1, katze: 1, gans: 1, hahn: 1, [RAT]: 2 });
      Object.assign(g.players[2].animals, { kuh: 2, ziege: 2, katze: 2, hahn: 2, pferd: 1, hund: 1, gans: 1, [RAT]: 1 });
      g.players[0].animals[RAT] = 1; g.players[0].specials = ['ziege'];
      g.players[0].money = [0, 0, 10, 10, 10, 10, 20, 50, 50, 100, 100, 200, 200, 500];
      g.donkeysDrawn = 3; g.turn = 1; g.deck = g.deck.filter((c) => c !== 'esel'); g.deck.unshift('esel');
      g = drawForAuction(g, 'u2', t); g = bid(g, 'u3', 10, t + 3200);
      return g;
    }
    case 'revealbig': { // teure Karte wird gerade aufgedeckt (Glitzer)
      g = base(); g.turn = 1; g.deck[0] = new URLSearchParams(location.search).get('a') || 'pferd';
      g = drawForAuction(g, 'u2', Date.now());
      local.prev = { logLen: g.log.length - 1, phase: 'turn' };
      return g;
    }
    case 'auctionlead': { // du führst
      const t = Date.now() - 4100;
      g = base(); g.turn = 1; g.deck[0] = 'kuh';
      g = drawForAuction(g, 'u2', t); g = bid(g, 'u3', 120, t + 3200); g = bid(g, 'u1', 200, t + 3300);
      return g;
    }
    case 'auction': { // &fresh=1: Karte wird gerade erst aufgedeckt (Esel-Bonus von Anfang an)
      const t = Date.now() - (new URLSearchParams(location.search).get('fresh') ? 0 : 4100);
      g = base(); g.turn = 1; g.deck[0] = 'esel';
      g = drawForAuction(g, 'u2', t); if (g.special) { g.special.batzen = null; g.special.startsAt = t + SPECIAL_DELAY_MS; }
      g = bid(g, 'u4', 60, t + 3200); g = bid(g, 'u1', 100, t + 3200); g = bid(g, 'u3', 120, t + 3200);
      if (new URLSearchParams(location.search).get('wpop')) g = waitAuction(g, 'u3', Date.now() - 200); // v0.79: „Warte, warte, warte!“ von Lea
      return g;
    }
    case 'auctionrun': {
      const t = Date.now() - 3600;
      g = base(); g.deck[0] = 'pferd';
      g = drawForAuction(g, 'u1', t); if (g.special) { g.special.batzen = null; g.special.startsAt = t + SPECIAL_DELAY_MS; }
      g = bid(g, 'u3', 90, t + 3200); g = bid(g, 'u2', 130, t + 3200);
      return g;
    }
    case 'auctioneer': {
      const t = Date.now() - 30000;
      g = base(); g.deck[0] = 'pferd';
      g = drawForAuction(g, 'u1', t); if (g.special) { g.special.batzen = null; g.special.startsAt = t + SPECIAL_DELAY_MS; }
      g = bid(g, 'u3', 90, t + 2600); g = bid(g, 'u2', 130, t + 3600);
      return g;
    }
    case 'bidderover': {
      const t = Date.now() - 30000;
      g = base(); g.turn = 1; g.deck[0] = 'kuh';
      g = drawForAuction(g, 'u2', t); if (g.special) { g.special.batzen = null; g.special.startsAt = t + SPECIAL_DELAY_MS; }
      g = bid(g, 'u1', 100, t + 2600); g = bid(g, 'u3', 120, t + 3600);
      return g;
    }
    case 'tradebig': {
      g = base();
      g.players[0].money = [0, 0, 10, 10, 10, 10, 50, 50, 100, 200, 500, 500];
      Object.assign(g.players[0].animals, { hahn: 1, gans: 1, katze: 1, hund: 1, schaf: 1, ziege: 1, esel: 1, schwein: 2, kuh: 1, pferd: 1 });
      Object.assign(g.players[2].animals, { hahn: 2, gans: 2, katze: 1, hund: 1, schaf: 1, ziege: 2, esel: 1, schwein: 2, kuh: 2, pferd: 1 });
      local.key = `${g.phase}|${g.turn}|${g.log.length}`;
      local.tradeOpen = true; local.tradeTarget = 'u3'; local.tradeAnimal = 'schwein'; local.sel = [6, 8, 10];
      return g;
    }
    case 'paybig': {
      const t = Date.now() - 60000;
      g = base(); g.turn = 1; g.deck[0] = 'schwein';
      g.players[0].money = [0, 0, 10, 10, 10, 10, 50, 50, 100, 200, 500, 500];
      g = drawForAuction(g, 'u2', t); if (g.special) { g.special.batzen = null; g.special.startsAt = t + SPECIAL_DELAY_MS; }
      g = bid(g, 'u1', 270, t + 2600);
      g = closeAuction(g, 'u2', 'sell', t + 30000);
      local.key = `${g.phase}|${g.turn}|${g.log.length}`; local.sel = [9, 6, 2];
      return g;
    }
    case 'quartet':
      g = base();
      local.prevQuartets = []; // Mos Hahn-Quartett gilt als neu
      { const qa = qs.get('qa'); if (qa) { g.players[3].animals.hahn = 3; g.players.forEach((p) => { p.animals[qa] = 0; }); g.players[qs.get('me') ? 0 : 3].animals[qa] = 4; } } // v0.77: ?demo=quartet&qa=kuh(&me=1)
      return g;
    case 'menu':
      g = base();
      local.menu = true;
      return g;
    case 'payment':
      g = base(); g.turn = 1; g.deck[0] = 'schwein';
      g = drawForAuction(g, 'u2');
      g = bid(g, 'u1', 70);
      g = closeAuction(g, 'u2', 'sell');
      local.sel = []; local.key = `${g.phase}|${g.turn}|${g.log.length}`; local.sel = [5, 6];
      return g;
    case 'cantpay': {
      const t = Date.now() - 25000;
      g = base(); g.turn = 1; g.deck[0] = 'kuh';
      g = drawForAuction(g, 'u2', t); if (g.special) { g.special.batzen = null; g.special.startsAt = t + SPECIAL_DELAY_MS; }
      g = bid(g, 'u4', 200, t + 2600);
      g = closeAuction(g, 'u2', 'sell', Date.now() - 800); // gerade eben: Pause zum Anschauen läuft noch
      return g;
    }
    case 'cantpaymany': { // „Kann nicht zahlen“ mit sehr vielen Scheinen (spät im Spiel): Zeile fasst zusammen
      const t = Date.now() - 25000;
      g = base(); g.turn = 1; g.deck[0] = 'kuh';
      g.players[3].money = [0, 0, 0, 0, 0, 0, 10, 10, 10, 10, 10, 10, 10, 10, 20, 20, 20, 50, 50];
      g = drawForAuction(g, 'u2', t); if (g.special) { g.special.batzen = null; g.special.startsAt = t + SPECIAL_DELAY_MS; }
      g = bid(g, 'u4', 400, t + 2600);
      g = closeAuction(g, 'u2', 'sell', Date.now() - 800);
      return g;
    }
    case 'tradesetup':
      g = base();
      local.key = `${g.phase}|${g.turn}|${g.log.length}`;
      local.tradeOpen = true; local.tradePicked = true; local.tradeTarget = 'u3'; local.tradeAnimal = 'kuh'; local.sel = [2, 3, 5];
      return g;
    case 'tradeum2': { // Kuhhandel um 2 (beide haben 2 Gänse): Gewinner bekommt alle 4 → Quartett
      g = base();
      g.players[0].animals.gans = 2; g.players[2].animals.gans = 2;
      local.key = `${g.phase}|${g.turn}|${g.log.length}`;
      local.tradeOpen = true; local.tradePicked = true; local.tradeTarget = 'u3'; local.tradeAnimal = 'gans'; local.sel = [2, 5];
      return g;
    }
    case 'tradepick': { // Kuhhandel Schritt 1, spät im Spiel: viele gemeinsame Tiere (Gegner + Tier wählen)
      g = base();
      Object.assign(g.players[0].animals, { hahn: 2, gans: 2, katze: 1, hund: 1, schaf: 3, ziege: 1, esel: 2, schwein: 3, kuh: 1, pferd: 2 });
      Object.assign(g.players[1].animals, { hahn: 1, katze: 2, hund: 3, schaf: 1, kuh: 1, pferd: 1 });
      Object.assign(g.players[2].animals, { hahn: 1, gans: 2, katze: 2, hund: 1, schaf: 1, ziege: 2, esel: 1, schwein: 1, kuh: 2, pferd: 1 });
      local.key = `${g.phase}|${g.turn}|${g.log.length}`;
      local.tradeOpen = true; local.tradePicked = false; local.tradeTarget = 'u3'; local.sel = [];
      return g;
    }
    case 'traderespond':
      g = base(); g.turn = 1;
      if (new URLSearchParams(location.search).get('tt')) g.settings = { ...(g.settings || {}), tradeTimer: 20 }; // v0.79: mit Kuhhandel-Zeit (Warte-Knopf)
      g = startTrade(g, 'u2', 'u1', 'hund', [0, 2, 6]);
      local.key = `${g.phase}|${g.turn}|${g.log.length}`; local.sel = [5];
      if (new URLSearchParams(location.search).get('pop') === '1') local.prev = { logLen: g.log.length - 1, phase: 'turn' }; // v0.70: VS + Tiere laufen in die Mitte
      return g;
    case 'tradewait': {
      g = base(); g.turn = 1;
      g = startTrade(g, 'u2', 'u3', 'kuh', [0, 2, 6]);
      return g;
    }
    case 'tradeaccept': {
      g = base(); g.turn = 1;
      g = startTrade(g, 'u2', 'u1', 'hund', [0, 2, 6]);
      g = acceptTrade(g, 'u1');
      return g;
    }
    case 'traderesult': {
      g = base(); g.turn = 1;
      g = startTrade(g, 'u2', 'u1', 'hund', [0, 2, 6]);
      g = counterTrade(g, 'u1', [5, 6]);
      if (new URLSearchParams(location.search).get('pop') === '1') local.prev = { logLen: g.log.length - 1, phase: 'trade' }; // v0.70: Tiere laufen aus der Mitte zu dir
      if (new URLSearchParams(location.search).get('fast')) local.potLand = Date.now() + 1500; // v0.76: schneller Kuhhandel – Einsätze laufen noch in die Mitte
      return g;
    }
    case 'tradeseen': { // Kuhhandel zwischen zwei anderen: Zuschauer sehen nur Rückseiten
      g = base(); g.turn = 1;
      g = startTrade(g, 'u2', 'u3', 'kuh', [0, 2, 6]);
      g = counterTrade(g, 'u3', [1, 5]);
      return g;
    }
    case 'tradetie': { // Gleichstand: Herausforderer (du) gewinnt
      g = base();
      g = startTrade(g, 'u1', 'u2', 'kuh', [3, 4]);
      g = counterTrade(g, 'u2', [3, 4]);
      return g;
    }
    case 'traderatresult': {
      g = base(); g.turn = 1;
      g.players[0].animals[RAT] = 1;
      g = startTrade(g, 'u2', 'u1', RAT, [0, 2, 6]);
      g = counterTrade(g, 'u1', [5, 6]);
      return g;
    }
    case 'rat': {
      g = base(); g.turn = 1; g.deck[0] = RAT;
      g = drawForAuction(g, 'u2');
      g = ratLay(g, 'u3', 0); g = ratLay(g, 'u4', 2);
      return g;
    }
    case 'ratme': {
      g = base(); g.turn = 2; g.deck[0] = RAT;
      g = drawForAuction(g, 'u3');
      g = ratLay(g, 'u4', 1); // dann ist Alp (u1) dran
      g.rat.pot.push(10, 0); g.rat.laid.u4 = 1; g.rat.laid.u3 = 1; g.rat.laid.u2 = 1;
      return g;
    }
    case 'special': { // Countdown läuft, Alp kann buzzern
      const t = Date.now() - SPECIAL_DELAY_MS - 3200;
      g = base(); g.turn = 1; g.deck[0] = 'sp-kuh';
      g = drawForAuction(g, 'u2', t); if (g.special) { g.special.batzen = null; g.special.startsAt = t + SPECIAL_DELAY_MS; }
      g.special.startsAt = Date.now() - 3200;
      return g;
    }
    case 'batzen': { // „Zeig Batzen!“ – Knopf
      g = base(); g.turn = 1; g.deck[0] = 'sp-kuh';
      g = drawForAuction(g, 'u2', Date.now() - 1200);
      return g;
    }
    case 'batzenshow': { // Stapel liegen auf dem Tisch
      g = base(); g.turn = 1; g.deck[0] = 'sp-kuh';
      g.players[2].money = [0, 10, 10, 20, 50]; g.players[3].money = [0, 0, 10, 10, 10, 20, 50, 50, 100, 200];
      g = drawForAuction(g, 'u2', Date.now() - 1500);
      g = showBatzen(g, 'u4', Date.now() - 400);
      return g;
    }
    case 'specialhit': { // Lea hat bei 8 gebuzzert, die kurze Gleichzieh-Zeit läuft noch: Zahl bleibt stehen
      g = base(); g.turn = 1; g.deck[0] = 'sp-kuh';
      const t0 = Date.now() - 2900;
      g = drawForAuction(g, 'u2', t0 - SPECIAL_DELAY_MS); if (g.special) { g.special.batzen = null; g.special.startsAt = t0; }
      g = buzz(g, 'u3', t0 + 2100);
      return g;
    }
    case 'paynew': { // Bezahlen ohne Auswahl: passende Scheine werden vorgewählt
      g = base(); g.turn = 1; g.deck[0] = 'schwein';
      g = drawForAuction(g, 'u2');
      g = bid(g, 'u1', 70);
      g = closeAuction(g, 'u2', 'sell');
      return g;
    }
    case 'specialbuzzed': {
      const t0 = Date.now() - SPECIAL_DELAY_MS - 4500;
      g = base(); g.turn = 1; g.deck[0] = 'sp-kuh';
      g = drawForAuction(g, 'u2', t0); if (g.special) { g.special.batzen = null; g.special.startsAt = t0 + SPECIAL_DELAY_MS; }
      g = buzz(g, 'u3', t0 + SPECIAL_DELAY_MS + 4100);
      return g;
    }
    case 'specialdecide': {
      const t0 = Date.now() - 60000;
      g = base(); g.deck[0] = 'sp-schwein';
      g = drawForAuction(g, 'u1', t0); if (g.special) { g.special.batzen = null; g.special.startsAt = t0 + SPECIAL_DELAY_MS; }
      g = buzz(g, 'u2', t0 + SPECIAL_DELAY_MS + 3500);
      return g;
    }
    case 'sppay10': { // Spezialkarte: du musst 10 Karten zahlen (Feld bleibt eine Reihe, kleinste sind vorgewählt)
      const t0 = Date.now() - 60000;
      g = base(); g.turn = 1; g.deck[0] = 'sp-schwein';
      g.players[0].money = [0, 0, 0, 0, 10, 10, 10, 10, 10, 10, 10, 20, 20, 50, 50, 100];
      g = drawForAuction(g, 'u2', t0); if (g.special) { g.special.batzen = null; g.special.startsAt = t0 + SPECIAL_DELAY_MS; }
      g = buzz(g, 'u1', t0 + SPECIAL_DELAY_MS + 0);
      g = specialDecide(g, 'u2', 'sell', t0 + 30000);
      return g;
    }
    case 'rps': {
      const t0 = Date.now() - 60000;
      g = base(); g.turn = 3; g.deck[0] = 'sp-ziege';
      g = drawForAuction(g, 'u4', t0); if (g.special) { g.special.batzen = null; g.special.startsAt = t0 + SPECIAL_DELAY_MS; }
      g = buzz(g, 'u1', t0 + SPECIAL_DELAY_MS + 5100);
      g = buzz(g, 'u3', t0 + SPECIAL_DELAY_MS + 5600);
      g = rpsPick(g, 'u1', 'stein', t0 + 30000); g = rpsPick(g, 'u3', 'stein', t0 + 30000);
      return g;
    }
    case 'rpsshow': {
      const t0 = Date.now() - 60000;
      g = base(); g.turn = 3; g.deck[0] = 'sp-ziege';
      g = drawForAuction(g, 'u4', t0); if (g.special) { g.special.batzen = null; g.special.startsAt = t0 + SPECIAL_DELAY_MS; }
      g = buzz(g, 'u1', t0 + SPECIAL_DELAY_MS + 5100);
      g = buzz(g, 'u3', t0 + SPECIAL_DELAY_MS + 5600);
      g = rpsPick(g, 'u1', 'papier', t0 + 30000); g = rpsPick(g, 'u3', 'stein', t0 + 30000);
      return g;
    }
    case 'spcantpay': {
      const t0 = Date.now() - 30000;
      g = base(); g.turn = 1; g.deck[0] = 'sp-kuh';
      g.players[2].money = [0, 10, 20];
      g = drawForAuction(g, 'u2', t0); if (g.special) { g.special.batzen = null; g.special.startsAt = t0 + SPECIAL_DELAY_MS; }
      g = buzz(g, 'u3', t0 + SPECIAL_DELAY_MS + 1500);
      g = specialDecide(g, 'u2', 'sell', Date.now() - SPECIAL_DELAY_MS - 1200);
      return g;
    }
    case 'spay': {
      const t0 = Date.now() - 60000;
      g = base(); g.turn = 1; g.deck[0] = 'sp-kuh';
      g = drawForAuction(g, 'u2', t0); if (g.special) { g.special.batzen = null; g.special.startsAt = t0 + SPECIAL_DELAY_MS; }
      g = buzz(g, 'u1', t0 + SPECIAL_DELAY_MS + 5500);
      g = specialDecide(g, 'u2', 'sell', t0 + 30000);
      local.key = `${g.phase}|${g.turn}|${g.log.length}`; local.sel = [0, 1];
      return g;
    }
    case 'traderat': {
      g = base();
      g.players[0].animals[RAT] = 2; g.players[1].animals[RAT] = 2;
      local.key = `${g.phase}|${g.turn}|${g.log.length}`;
      local.tradeOpen = true; local.tradeTarget = 'u2'; local.tradeAnimal = RAT; local.sel = [5, 6];
      return g;
    }
    case 'traderatrespond': {
      g = base(); g.turn = 1;
      g.players[0].animals[RAT] = 1;
      g = startTrade(g, 'u2', 'u1', RAT, [0, 2, 6]);
      local.key = `${g.phase}|${g.turn}|${g.log.length}`; local.sel = [5];
      return g;
    }
    case 'news': { // ?demo=news&k=rallye-kuh|crash-pferd|hype-kuh|blase-schaf|dividende|steuer|panik|hektik – Börsen-Chaos
      const k = new URLSearchParams(location.search).get('k') || 'rallye-kuh';
      g = createGame({ players: P3 ? PLAYERS.slice(0, 3) : PLAYERS, seed: 7, settings: { boerse: true } });
      const b = base(); g.players = b.players; g.donkeysDrawn = 1;
      g.kurse = { pferd: -50, schaf: 50 };
      g.turn = 1; g.deck = [`news-${k}`, ...b.deck];
      g = drawForAuction(g, 'u2');
      local.prev = { logLen: g.log.length - 1, phase: 'turn' };
      return g;
    }
    case 'boerse': { // Börsen-Chaos: Tisch mit Kurszettel und Hektik
      g = createGame({ players: P3 ? PLAYERS.slice(0, 3) : PLAYERS, seed: 7, settings: { boerse: true } });
      const b = base(); g.players = b.players; g.deck = b.deck; g.donkeysDrawn = 1;
      g.kurse = { kuh: 50, pferd: -50, schaf: 100 }; g.hektik = 2;
      { const top = new URLSearchParams(location.search).get('top'); if (top === 'news') g.deck.unshift('news-hype-kuh'); if (top === 'money') g.deck.unshift('geld-100'); }
      return g;
    }
    case 'pfaend': { // v0.65: du hast „Zwangsversteigerung“ + „Einspruch“ auf der Hand, Mitspieler je eine verdeckte Karte
      g = createGame({ players: P3 ? PLAYERS.slice(0, 3) : PLAYERS, seed: 7, settings: { boerse: true } });
      const b = base(); g.players = b.players; g.deck = b.deck; g.turn = b.turn;
      g.hands = { [g.players[g.turn].id]: ['pfaendung', 'einspruch'], [g.players[(g.turn + 1) % g.players.length].id]: ['einspruch'], [g.players[(g.turn + 2) % g.players.length].id]: ['pfaendung'] };
      return g;
    }
    case 'pfauction': { // v0.65: Zwangsversteigerung läuft (&ziel=me: dein Tier wird gepfändet)
      g = createGame({ players: P3 ? PLAYERS.slice(0, 3) : PLAYERS, seed: 7, settings: { boerse: true } });
      const b = base(); g.players = b.players; g.deck = b.deck;
      const meI = b.turn; const tgtMe = new URLSearchParams(location.search).get('ziel') === 'me';
      const byI = tgtMe ? (meI + 1) % g.players.length : meI; const tI = tgtMe ? meI : (meI + 1) % g.players.length;
      g.turn = byI;
      const tp = g.players[tI]; const an = Object.keys(tp.animals).find((k) => k !== RAT && tp.animals[k] > 0 && tp.animals[k] < 4) || 'kuh';
      tp.animals[an] = Math.max(tp.animals[an], 1);
      tp.money = tp.money.length ? tp.money : [10, 50];
      g.hands = { [g.players[byI].id]: ['pfaendung'] };
      const show = new URLSearchParams(location.search).has('show'); // &show=1: Auftritt des Gerichtsvollziehers von vorn
      if (new URLSearchParams(location.search).has('einspruch')) g.hands[tp.id] = ['einspruch'];
      g = playPfaendung(g, g.players[byI].id, tp.id, an, Date.now() - (show ? 0 : 3500));
      if (show) local.prev = { logLen: g.log.length - 1, phase: 'turn' };
      return g;
    }
    case 'ratrun': { // v0.62: Ratte gerade aufgedeckt → Ratte flitzt zu jedem Geldstapel
      g = base(); g.turn = 1; g.deck[0] = RAT;
      g = drawForAuction(g, 'u2');
      local.prev = { logLen: g.log.length - 1, phase: 'turn' };
      return g;
    }
    case 'won': { // v0.62: Versteigerung gerade gewonnen (mit ?pop=1) → Gewinner jubelt
      const wb = new URLSearchParams(location.search).get('who') || 'u4';
      g = base(); g.turn = 1; g.deck[0] = 'schwein';
      if (qs.get('q4')) g.players.find((x) => x.id === wb).animals.schwein = 3; // v0.77: ?demo=won&pop=1&q4=1 → Quartett-Show
      g = drawForAuction(g, 'u2');
      g = bid(g, wb, 50);
      g = closeAuction(g, 'u2', 'sell');
      const pl = g.players.find((x) => x.id === wb); const idx = []; let sum = 0;
      [...pl.money.keys()].sort((a, b) => pl.money[b] - pl.money[a]).forEach((i) => { if (sum < 50) { idx.push(i); sum += pl.money[i]; } });
      g = pay(g, wb, idx);
      local.prev = { logLen: g.log.length - 1, phase: 'auction' };
      if (qs.get('q4')) { local.prevQuartets = []; g.players.forEach((p) => Object.entries(p.animals).forEach(([id, n]) => { if (n === 4 && !(p.id === wb && id === 'schwein')) local.prevQuartets.push(`${p.id}|${id}`); })); }
      return g;
    }
    case 'moneydrawn': {
      g = base(); g.turn = 1; g.deck[0] = `geld-${new URLSearchParams(location.search).get('v') || 200}`;
      g = drawForAuction(g, 'u2');
      local.prev = { logLen: g.log.length - 1, phase: 'turn' };
      return g;
    }
    case 'mustdraw': {
      g = base(); g.mustDraw = true;
      g.players[0].animals[RAT] = 1;
      g.log.push('Alp nimmt die Ratte und bekommt 4 Karte(n).');
      return g;
    }
    case 'block': {
      g = createGame({ players: PLAYERS, seed: 7 });
      const owner = { hahn: 0, gans: 3, katze: 0, hund: 1, schaf: 2, ziege: 3, esel: 0, schwein: 3, kuh: 2, pferd: 1 };
      for (const a of ANIMALS) g.players[owner[a.id]].animals[a.id] = 4;
      g.players[0].animals[RAT] = 4;
      g.players[0].specials = ['hahn', 'kuh'];
      g.players[1].specials = ['pferd', 'hund'];
      g.deck = [];
      g.phase = 'block'; g.block = { player: 'u1' };
      { const q = new URLSearchParams(location.search); // v0.79: &pop=1 Rattenkönig-Show, &other=1 Nico ist König
        if (q.get('other')) { g.players[0].animals[RAT] = 0; g.players[1].animals[RAT] = 4; g.block = { player: 'u2' }; }
        if (q.get('pop') === '1') local.prev = { logLen: g.log.length - 1, phase: 'trade' }; }
      return g;
    }
    case 'ended': {
      g = createGame({ players: PLAYERS, seed: 7 });
      const owner = { hahn: 3, gans: 3, katze: 0, hund: 0, schaf: 2, ziege: 3, esel: 1, schwein: 3, kuh: 2, pferd: 1 };
      for (const a of ANIMALS) g.players[owner[a.id]].animals[a.id] = 4;
      g.players[3].specials = ['schwein', 'ziege', 'katze'];
      g.players[2].specials = ['kuh'];
      g.players[1].specials = ['hund', 'pferd'];
      g.players[0].specials = ['esel', 'hahn', 'gans', 'schaf'];
      g.players[3].animals[RAT] = 4;
      g.blocked = { player: 'u4', animal: 'hahn' };
      Object.assign(g.stats.u2, { buys: 5, maxBuy: { amount: 620, animal: 'pferd' }, tradesWon: 2 });
      Object.assign(g.stats.u1, { tradesWon: 4, ratsTaken: 2, ratCards: 6 });
      Object.assign(g.stats.u3, { bluffZeros: 3, overpaid: 80 }); Object.assign(g.stats.u4, { closeLosses: 2, bids: 6, maxBid: 50 });
      Object.assign(g.stats.u4, { ratsTaken: 3, ratCards: 11, specialsWon: 3 });
      Object.assign(g.stats.u3, { moneyDrawn: 700 });
      g.players.forEach((p, i) => { p.money = [[0, 10, 50, 200], [0, 0, 10], [500, 100, 20], [10, 10]][i]; });
      g.deck = [];
      g.phase = 'ended';
      const sc = scores(g); const best = Math.max(...sc.map((x) => x.score));
      g.winner = sc.filter((x) => x.score === best).map((x) => x.id);
      return g;
    }
    default:
      return null;
  }
}
