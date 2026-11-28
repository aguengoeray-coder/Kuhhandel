import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, drawForAuction, bid, closeAuction, pay, startTrade, acceptTrade, counterTrade,
  possibleTrades, scores, viewFor, currentPlayer, GameError, ANIMALS, passAuction,
  AUCTION_START_MS, AUCTION_BID_MS, REVEAL_MS, bestPay,
  RAT, ratLay, ratTake, ratCurrent, buzz, rpsPick, specialDecide, specialStage, specialNumber, showBatzen, batzenStage, BATZEN_WAIT_MS, BATZEN_SHOW_MS,
  chooseBlock, scoreFor, SPECIAL_DELAY_MS, CANTPAY_HOLD_MS, moneyDeckFrom, awards,
} from '../src/engine.js';

const P = [
  { id: 'a', name: 'Alp' },
  { id: 'b', name: 'Nico' },
  { id: 'c', name: 'Lea' },
  { id: 'd', name: 'Mo' },
];
const total = (cards) => cards.reduce((x, y) => x + y, 0);

// Spiel mit festgelegtem Stapel (oberste Karte zuerst)
function gameWithDeck(deck) {
  const g = createGame({ players: P, seed: 1 });
  g.deck = deck;
  return g;
}

test('Start: 4 Spieler, je 100 Taler in 7 Karten (2×0, 3×10, 1×20, 1×50), 54 Karten (40 Tiere, 10 Spezial, 4 Ratten)', () => {
  const g = createGame({ players: P, seed: 42 });
  assert.equal(g.deck.length, 54);
  assert.equal(g.deck.filter((c) => c === RAT).length, 4);
  assert.equal(g.deck.filter((c) => c.startsWith('sp-')).length, 10);
  for (const p of g.players) {
    assert.equal(p.money.length, 7);
    assert.equal(total(p.money), 100);
    assert.deepEqual(p.money, [0, 0, 10, 10, 10, 20, 50]);
  }
  assert.throws(() => createGame({ players: [...P, { id: 'e', name: 'X' }] }), GameError);
  assert.throws(() => createGame({ players: P.slice(0, 2) }), GameError);
});

test('Esel: alle bekommen Geld (50, 100, 200, 500)', () => {
  let g = gameWithDeck(['esel', 'esel', 'esel', 'esel', 'hahn']);
  const expected = [50, 100, 200, 500];
  let before = g.players.map((p) => total(p.money));
  for (let i = 0; i < 4; i++) {
    const who = currentPlayer(g).id;
    g = drawForAuction(g, who);
    g.players.forEach((p, k) => assert.equal(total(p.money), before[k] + expected[i]));
    g = closeAuction(g, who, 'sell'); // niemand bietet → Auktionator bekommt den Esel
    before = g.players.map((p) => total(p.money));
  }
});

test('Zuschlag: Höchstbietender zahlt den Auktionator, kein Wechselgeld', () => {
  let g = gameWithDeck(['kuh', 'hahn']);
  g = drawForAuction(g, 'a');
  g = bid(g, 'b', 20);
  g = bid(g, 'c', 30);
  assert.throws(() => bid(g, 'd', 30), GameError); // muss höher sein
  assert.throws(() => bid(g, 'd', 35), GameError); // nur 10er-Schritte
  g = closeAuction(g, 'a', 'sell');
  assert.equal(g.phase, 'payment');
  const lea = g.players[2];
  const idx50 = lea.money.indexOf(50);
  assert.throws(() => pay(g, 'c', [lea.money.indexOf(10)]), GameError); // 10 reicht nicht
  const aBefore = total(g.players[0].money);
  g = pay(g, 'c', [idx50]); // zahlt 50 für 30 → 20 sind weg
  assert.equal(total(g.players[2].money), 50);
  assert.equal(total(g.players[0].money), aBefore + 50);
  assert.equal(g.players[2].animals.kuh, 1);
  assert.equal(currentPlayer(g).id, 'b');
});

test('Countdown: Zuschlag erst nach Ablauf, jedes Gebot verlängert, alle passen = sofort vorbei', () => {
  let g = gameWithDeck(['kuh', 'hahn']);
  const t0 = 1_000_000;
  g = drawForAuction(g, 'a', t0);
  assert.equal(g.auction.endsAt, t0 + REVEAL_MS + AUCTION_START_MS);
  assert.throws(() => closeAuction(g, 'a', 'sell', t0 + 1000), GameError); // läuft noch
  g = bid(g, 'b', 20, t0 + 9000);
  assert.equal(g.auction.endsAt, t0 + 9000 + AUCTION_BID_MS);
  assert.throws(() => closeAuction(g, 'a', 'buy', t0 + 12000), GameError);
  assert.throws(() => bid(g, 'c', 30, t0 + 9000 + AUCTION_BID_MS + 2000), GameError); // zu spät
  g = passAuction(g, 'c', t0 + 10000);
  g = passAuction(g, 'd', t0 + 11000); // alle außer Höchstbietendem gepasst – v0.89: läuft weiter, er darf sich selbst überbieten
  assert.equal(g.auction.endsAt, t0 + 9000 + AUCTION_BID_MS);
  g = bid(g, 'b', 30, t0 + 11500); // selbst überboten
  g = passAuction(g, 'b', t0 + 12000); // „Beenden“
  assert.equal(g.auction.endsAt, t0 + 12000);
  g.auction.high.amount = 20; // für den Rest des Tests wie bisher
  g = closeAuction(g, 'a', 'buy', t0 + 12000); // Auktionator kauft zum Höchstgebot
  assert.equal(g.phase, 'payment');
  assert.equal(g.payment.payer, 'a');
  assert.equal(g.payment.amount, 20);
});

test('Vorkaufsrecht: Auktionator kauft selbst und zahlt den Höchstbietenden', () => {
  let g = gameWithDeck(['pferd', 'hahn']);
  g = drawForAuction(g, 'a');
  g = bid(g, 'b', 40);
  g = closeAuction(g, 'a', 'buy');
  const alp = g.players[0];
  g = pay(g, 'a', [alp.money.indexOf(50)]);
  assert.equal(g.players[0].animals.pferd, 1);
  assert.equal(total(g.players[1].money), 150);
});

test('Zahlungsunfähig: Karten offen, Neustart, höchstens altes Gebot minus 10', () => {
  let g = gameWithDeck(['schwein', 'hahn']);
  g = drawForAuction(g, 'a');
  g = bid(g, 'b', 200); // hat nur 100
  g = closeAuction(g, 'a', 'sell');
  assert.equal(g.phase, 'auction');
  assert.equal(g.lastEvent.type, 'cant_pay');
  assert.deepEqual(g.lastEvent.revealed, [0, 0, 10, 10, 10, 20, 50]);
  assert.equal(g.auction.high, null);
  assert.throws(() => bid(g, 'b', 200), GameError);
  g = bid(g, 'c', 150);
  g = bid(g, 'b', 190); // erlaubt (Bluff bleibt möglich)
  g = bid(g, 'c', 195 + 5);
  assert.throws(() => bid(g, 'b', 210), GameError); // über der Obergrenze von 190
});

test('Zahlungsunfähig: alle schauen erst die Scheine an – 5 s bietet niemand, dann 10 s Versteigerung', () => {
  let g = gameWithDeck(['schwein', 'hahn']);
  g = drawForAuction(g, 'a', 0);
  g = bid(g, 'b', 200, 3000);
  const t = 20000;
  g = closeAuction(g, 'a', 'sell', t);
  assert.equal(g.lastEvent.type, 'cant_pay');
  assert.equal(g.auction.holdUntil, t + CANTPAY_HOLD_MS);
  assert.equal(g.auction.endsAt, t + CANTPAY_HOLD_MS + AUCTION_START_MS);
  assert.throws(() => bid(g, 'c', 50, t + 1000), GameError); // noch gesperrt – auch wer das Fenster wegtippt
  g = bid(g, 'c', 50, t + CANTPAY_HOLD_MS + 100);
  assert.equal(g.auction.high.player, 'c');
});

test('Ereignis-Nummer: Gebote nach „kann nicht zahlen“ ändern das Ereignis nicht (Fenster kommt nur einmal)', () => {
  let g = gameWithDeck(['schwein', 'hahn']);
  g = drawForAuction(g, 'a', 0);
  g = bid(g, 'b', 200, 3000);
  g = closeAuction(g, 'a', 'sell', 20000);
  const n = g.lastEvent.n;
  g = bid(g, 'c', 50, 26000);
  g = bid(g, 'b', 60, 27000);
  assert.equal(g.lastEvent.type, 'cant_pay');
  assert.equal(g.lastEvent.n, n);
});

test('Vorkaufsrecht wird im Ereignis markiert (für den Text „selbst gekauft“)', () => {
  let g = gameWithDeck(['pferd', 'hahn']);
  g = drawForAuction(g, 'a');
  g = bid(g, 'b', 40);
  g = closeAuction(g, 'a', 'buy');
  assert.equal(g.payment.self, true);
  g = pay(g, 'a', [g.players[0].money.indexOf(50)]);
  assert.equal(g.lastEvent.self, true);
  assert.equal(g.lastEvent.buyer, 'a');
  assert.equal(g.lastEvent.payee, 'b');
  let h = gameWithDeck(['pferd', 'hahn']);
  h = drawForAuction(h, 'a');
  h = bid(h, 'b', 40);
  h = closeAuction(h, 'a', 'sell');
  h = pay(h, 'b', [h.players[1].money.indexOf(50)]);
  assert.equal(h.lastEvent.self, false);
});

test('Kuhhandel angenommen: Herausgeforderter bekommt das Geld, gibt das Tier ab', () => {
  let g = gameWithDeck(['hahn']);
  g.players[0].animals.kuh = 1;
  g.players[1].animals.kuh = 2;
  g = startTrade(g, 'a', 'b', 'kuh', [6]); // die 50
  assert.equal(g.trade.count, 1);
  g = acceptTrade(g, 'b');
  assert.equal(g.players[0].animals.kuh, 2);
  assert.equal(g.players[1].animals.kuh, 1);
  assert.equal(total(g.players[1].money), 150);
});

test('Kuhhandel 2 gegen 2: es geht um 2 Tiere; höheres Gebot gewinnt, Geld wird getauscht', () => {
  let g = gameWithDeck(['hahn']);
  g.players[0].animals.schaf = 2;
  g.players[1].animals.schaf = 2;
  g = startTrade(g, 'a', 'b', 'schaf', [2, 3]); // 20
  assert.equal(g.trade.count, 2);
  g = counterTrade(g, 'b', [6]); // 50
  assert.equal(g.players[1].animals.schaf, 4);
  assert.equal(g.players[0].animals.schaf, 0);
  assert.equal(total(g.players[0].money), 100 - 20 + 50);
  assert.equal(total(g.players[1].money), 100 - 50 + 20);
});

test('Kuhhandel Gleichstand: Herausforderer gewinnt, Geld wird trotzdem getauscht', () => {
  let g = gameWithDeck(['hahn']);
  g.players[0].animals.hund = 1;
  g.players[2].animals.hund = 3;
  g = startTrade(g, 'a', 'c', 'hund', [2, 3]); // 10+10
  g = counterTrade(g, 'c', [0, 2, 3]); // 0+10+10 = 20, drei Karten
  assert.equal(g.players[0].animals.hund, 2);
  assert.equal(g.players[2].animals.hund, 2);
  assert.equal(g.players[0].money.length, 7 - 2 + 3);
  assert.equal(g.players[2].money.length, 7 - 3 + 2);
});

test('Kuhhandel nur, wenn beide das Tier haben', () => {
  const g = gameWithDeck(['hahn']);
  g.players[0].animals.kuh = 1;
  assert.throws(() => startTrade(g, 'a', 'b', 'kuh', [0]), GameError);
  assert.deepEqual(possibleTrades(g, 'a'), []);
});

test('Verdeckte Infos: fremdes Geld und fremdes Angebot nur als Anzahl', () => {
  let g = gameWithDeck(['hahn']);
  g.players[0].animals.kuh = 1;
  g.players[1].animals.kuh = 1;
  g = startTrade(g, 'a', 'b', 'kuh', [6]);
  const vb = viewFor(g, 'b');
  assert.equal(vb.trade.offer, 1);
  assert.equal(vb.players[0].money, 6);
  assert.ok(Array.isArray(vb.players[1].money));
  assert.equal(typeof vb.deck, 'number');
  const va = viewFor(g, 'a');
  assert.deepEqual(va.trade.offer, [50]);
});

test('Wertung: Summe der Quartettwerte × Anzahl der Quartette', () => {
  const g = createGame({ players: P, seed: 3 });
  g.players[0].animals.pferd = 4;
  g.players[0].animals.hahn = 4;
  g.players[1].animals.kuh = 4;
  const s = scores(g);
  assert.equal(s[0].score, (1000 + 10) * 2);
  assert.equal(s[1].score, 800);
});

// Zufällige Komplettspiele mit einfachen Bots: Spiel muss immer sauber zu Ende gehen
let clock = 0;
function botStep(g, rand) {
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  clock += 400;
  if (g.phase === 'turn') {
    const me = currentPlayer(g);
    const trades = possibleTrades(g, me.id);
    if (g.deck.length > 0 && (g.mustDraw || trades.length === 0 || rand() < 0.7)) return drawForAuction(g, me.id, clock);
    const t = pick(trades);
    const n = Math.min(me.money.length, 1 + Math.floor(rand() * 3));
    return startTrade(g, me.id, t.target, t.animal, [...Array(n).keys()]);
  }
  if (g.phase === 'auction') {
    const a = g.auction;
    const bidders = g.players.filter((p) => p.id !== a.auctioneer);
    if (rand() < 0.6) {
      const p = pick(bidders);
      const amount = (a.high ? a.high.amount : 0) + 10 * (1 + Math.floor(rand() * 5));
      const cap = a.caps[p.id];
      if (cap == null || amount <= cap) {
        try { return bid(g, p.id, amount); } catch (e) { if (!(e instanceof GameError)) throw e; }
      }
    }
    const me = g.players.find((p) => p.id === a.auctioneer);
    const canBuy = a.high && total(me.money) >= a.high.amount;
    return closeAuction(g, a.auctioneer, canBuy && rand() < 0.3 ? 'buy' : 'sell');
  }
  if (g.phase === 'rat') {
    const me = g.players.find((p) => p.id === ratCurrent(g));
    if (me.money.length === 0 || rand() < 0.25) return ratTake(g, me.id);
    return ratLay(g, me.id, Math.floor(rand() * me.money.length));
  }
  if (g.phase === 'special') {
    const st = specialStage(g, clock);
    if (st === 'wait' || st === 'countdown') {
      if (st === 'countdown' && rand() < 0.3) {
        const others = g.players.filter((p) => p.id !== g.special.revealer && g.special.buzzes[p.id] == null);
        if (others.length) { try { return buzz(g, pick(others).id, clock); } catch (e) { if (!(e instanceof GameError)) throw e; } }
      }
      return g; // Zeit vergeht
    }
    if (st === 'rps') {
      const r = g.special.rps;
      const ids = r ? r.players.filter((id) => !r.picks[id]) : Object.keys(g.special.buzzes).filter((id) => g.special.buzzes[id] === Math.max(...Object.values(g.special.buzzes)));
      return rpsPick(g, ids[0], pick(['stein', 'schere', 'papier']), clock);
    }
    try { return specialDecide(g, g.special.revealer, rand() < 0.5 ? 'buy' : 'sell', clock); }
    catch (e) { if (!(e instanceof GameError)) throw e; return specialDecide(g, g.special.revealer, 'sell', clock); }
  }
  if (g.phase === 'block') {
    const p = g.players.find((x) => x.id === g.block.player);
    const pool = g.settings && g.settings.teams ? { animals: g.players.filter((x, i) => i % 2 === g.players.indexOf(p) % 2).reduce((o, x) => { for (const [k, n] of Object.entries(x.animals)) o[k] = (o[k] || 0) + n; return o; }, {}) } : p;
    return chooseBlock(g, p.id, ANIMALS.find((a) => pool.animals[a.id] === 4).id);
  }
  if (g.phase === 'payment' && g.payment.special) {
    const p = g.players.find((x) => x.id === g.payment.payer);
    return pay(g, p.id, [...Array(g.payment.count).keys()]);
  }
  if (g.phase === 'payment') {
    const p = g.players.find((x) => x.id === g.payment.payer);
    const order = p.money.map((v, i) => [v, i]).sort((x, y) => y[0] - x[0]);
    const idx = [];
    let s = 0;
    for (const [v, i] of order) { if (s >= g.payment.amount) break; idx.push(i); s += v; }
    return pay(g, p.id, idx);
  }
  if (g.phase === 'trade') {
    const tg = g.players.find((x) => x.id === g.trade.target);
    if (rand() < 0.4 || tg.money.length === 0) return acceptTrade(g, tg.id);
    const n = Math.min(tg.money.length, 1 + Math.floor(rand() * 3));
    return counterTrade(g, tg.id, [...Array(n).keys()].map((k) => tg.money.length - 1 - k));
  }
  throw new Error('Unerwartete Phase ' + g.phase);
}

test('200 zufällige Komplettspiele enden mit allen Quartetten, allen Ratten bei einem und allen Spezialkarten verteilt', () => {
  for (let seed = 1; seed <= 200; seed++) {
    let g = createGame({ players: P.slice(0, 3 + (seed % 2)), seed, settings: seed % 3 === 0 ? { money: { 0: 3, 50: 2, 200: 4, 500: 1 } } : null });
    let r = seed * 7919;
    const rand = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    let steps = 0;
    while (g.phase !== 'ended') {
      g = botStep(g, rand);
      if (++steps > 60000) throw new Error('Spiel endet nicht (Seed ' + seed + ')');
    }
    assert.equal(g.players.filter((p) => p.animals[RAT] === 4).length, 1, `Ratten nicht bei einem (Seed ${seed})`);
    assert.equal(g.players.reduce((n, p) => n + p.specials.length, 0), 10);
    const totalMoney = g.players.reduce((n, p) => n + p.money.length, 0);
    assert.ok(totalMoney >= g.players.length * 7);
    for (const a of ANIMALS) {
      const owners = g.players.filter((p) => p.animals[a.id] > 0);
      assert.equal(owners.length, 1, `${a.id} nicht vollständig (Seed ${seed})`);
      assert.equal(owners[0].animals[a.id], 4);
    }
    assert.ok(g.winner.length >= 1);
  }
});

test('Passend auswählen: am wenigsten überzahlen, sonst möglichst wenige Scheine', () => {
  const pick = (money, amt) => bestPay(money, amt).map((i) => money[i]).sort((a, b) => a - b);
  assert.deepEqual(pick([0, 0, 10, 10, 10, 20, 50], 70), [20, 50]);
  assert.deepEqual(pick([0, 10, 50, 100, 100], 70), [100]);         // 100 statt 10+50+... (60 reicht nicht)
  assert.deepEqual(pick([10, 10, 10, 50, 500], 30), [10, 10, 10]);  // genau 30
  assert.deepEqual(pick([0, 10], 50), []);                          // reicht nicht
});

// ---------- Ratten ----------

test('Ratte: reihum ab links vom Aufdecker legen, wer nimmt bekommt alles; danach muss der Aufdecker nochmal aufdecken', () => {
  let g = gameWithDeck([RAT, 'hahn']);
  g = drawForAuction(g, 'a');
  assert.equal(g.phase, 'rat');
  assert.equal(ratCurrent(g), 'b');                 // links vom Aufdecker beginnt
  assert.throws(() => ratLay(g, 'c', 0), GameError); // nicht dran
  g = ratLay(g, 'b', g.players[1].money.indexOf(50));
  g = ratLay(g, 'c', 0);                             // 0er = Bluff
  g = ratLay(g, 'd', g.players[3].money.indexOf(20));
  assert.equal(ratCurrent(g), 'a');                  // Aufdecker macht mit
  g = ratLay(g, 'a', 0);
  assert.equal(ratCurrent(g), 'b');                  // geht reihum weiter
  g = ratTake(g, 'b');
  assert.equal(g.players[1].animals[RAT], 1);
  assert.equal(g.players[1].money.length, 6 + 4);    // eigene 6 + 4 gelegte
  assert.equal(g.phase, 'turn');
  assert.equal(currentPlayer(g).id, 'a');            // Aufdecker ist nochmal dran
  assert.ok(g.mustDraw);
  g.players[0].animals.kuh = 1; g.players[1].animals.kuh = 1;
  assert.throws(() => startTrade(g, 'a', 'b', 'kuh', [0]), GameError); // muss aufdecken
  g = drawForAuction(g, 'a');
  assert.equal(g.phase, 'auction');
});

test('Ratte: wer keine Karten hat, muss nehmen; ist der Stapel leer, muss der Aufdecker kuhhandeln', () => {
  let g = gameWithDeck([RAT]);
  g.players[1].money = [];
  g.players[0].animals.kuh = 1; g.players[2].animals.kuh = 1;
  g = drawForAuction(g, 'a');
  assert.throws(() => ratLay(g, 'b', 0), GameError);
  g = ratTake(g, 'b');
  assert.equal(g.phase, 'turn');
  assert.equal(currentPlayer(g).id, 'a');
  assert.ok(!g.mustDraw);
  assert.throws(() => drawForAuction(g, 'a'), GameError);
});

test('Rattenhandel: nur wenn beide Ratten haben; wer mehr bietet wird sie los, Gleichstand → Herausforderer', () => {
  let g = gameWithDeck(['hahn']);
  g.players[0].animals[RAT] = 1;
  assert.throws(() => startTrade(g, 'a', 'b', RAT, [6]), GameError);
  g.players[1].animals[RAT] = 1;
  assert.ok(possibleTrades(g, 'a').some((t) => t.animal === RAT));
  // a bietet 50, b nur 20 → a wird die Ratte los
  let h = startTrade(g, 'a', 'b', RAT, [6]);
  h = counterTrade(h, 'b', [5]);
  assert.equal(h.players[0].animals[RAT], 0);
  assert.equal(h.players[1].animals[RAT], 2);
  // Gleichstand → Herausforderer wird sie los
  h = startTrade(g, 'a', 'b', RAT, [2]);
  h = counterTrade(h, 'b', [3]);
  assert.equal(h.players[0].animals[RAT], 0);
  // b bietet mehr → a behält sie und bekommt die von b dazu
  h = startTrade(g, 'a', 'b', RAT, [2]);
  h = counterTrade(h, 'b', [6]);
  assert.equal(h.players[0].animals[RAT], 2);
  // Annehmen: Geld nehmen und Ratte bekommen
  h = startTrade(g, 'a', 'b', RAT, [6]);
  h = acceptTrade(h, 'b');
  assert.equal(h.players[1].animals[RAT], 2);
  assert.equal(total(h.players[1].money), 150);
  // 2 gegen 2 → es geht um beide
  g.players[0].animals[RAT] = 2; g.players[1].animals[RAT] = 2;
  h = startTrade(g, 'a', 'b', RAT, [6]);
  h = counterTrade(h, 'b', [0]);
  assert.equal(h.players[1].animals[RAT], 4);
});

// ---------- Spezialkarten ----------

function specialGame() {
  let g = gameWithDeck(['sp-kuh', 'hahn']);
  g = drawForAuction(g, 'a', 0);
  assert.equal(g.phase, 'special');
  return g;
}
const at = (n) => BATZEN_WAIT_MS + SPECIAL_DELAY_MS + (10 - n) * 1000 + 100; // Zeitpunkt, an dem der Countdown n zeigt (ohne „Zeig Batzen!“)

test('Spezialkarte: Countdown 10 → 1, wer zuerst buzzert bietet so viele Karten', () => {
  let g = specialGame();
  assert.equal(specialStage(g, 1000), 'wait');
  assert.equal(specialNumber(g, at(10)), 10);
  assert.equal(specialNumber(g, at(3)), 3);
  assert.throws(() => buzz(g, 'a', at(5)), GameError);     // Aufdecker buzzert nicht
  assert.throws(() => buzz(g, 'b', 1000), GameError);      // noch nicht gestartet
  g = buzz(g, 'b', at(4));
  assert.throws(() => buzz(g, 'c', at(3)), GameError);     // zu spät
  assert.equal(specialStage(g, at(4)), 'countdown');
  assert.throws(() => specialDecide(g, 'a', 'sell', at(4)), GameError);
  assert.equal(specialStage(g, at(2)), 'decide');
  // Verkaufen: b zahlt 4 Karten (selbst gewählt, z. B. die 0er) und bekommt die Spezialkarte
  let h = specialDecide(g, 'a', 'sell', at(2));
  assert.equal(h.phase, 'payment');
  assert.throws(() => pay(h, 'b', [0, 1, 2]), GameError);  // genau 4
  h = pay(h, 'b', [0, 1, 2, 3]);
  assert.deepEqual(h.players[1].specials, ['kuh']);
  assert.equal(h.players[1].money.length, 3);
  assert.equal(h.players[0].money.length, 11);
  // Kaufen: a zahlt b 4 Karten und behält sie
  h = specialDecide(g, 'a', 'buy', at(2));
  h = pay(h, 'a', [0, 1, 2, 3]);
  assert.deepEqual(h.players[0].specials, ['kuh']);
  assert.equal(h.players[1].money.length, 11);
});

test('Spezialkarte: niemand buzzert → Aufdecker bekommt sie umsonst; kein Esel-Bonus', () => {
  let g = gameWithDeck(['sp-esel', 'hahn']);
  g = drawForAuction(g, 'a', 0);
  assert.equal(total(g.players[1].money), 100);
  g = specialDecide(g, 'a', 'sell', at(0) + 2000);
  assert.deepEqual(g.players[0].specials, ['esel']);
  assert.equal(g.phase, 'turn');
});

test('Spezialkarte zahlungsunfähig: Karten offen, Countdown neu, darf erst bei eigener Kartenanzahl drücken', () => {
  let g = specialGame();
  g.players[1].money = [0, 10, 50];
  g = buzz(g, 'b', at(8));
  assert.throws(() => specialDecide(g, 'a', 'buy', at(5)), GameError); // a hat nur 7 Karten → kaufen geht nicht
  const t = at(5);
  g = specialDecide(g, 'a', 'sell', t);
  assert.equal(g.phase, 'special');
  assert.equal(g.lastEvent.type, 'cant_pay');
  assert.deepEqual(g.lastEvent.revealed, [0, 10, 50]);
  const at2 = (n) => t + CANTPAY_HOLD_MS + SPECIAL_DELAY_MS + (10 - n) * 1000 + 100; // erst 5 s Scheine anschauen
  assert.throws(() => buzz(g, 'b', at2(5)), GameError);
  g = buzz(g, 'b', at2(3));
  assert.equal(g.special.buzzes.b, 3);
});

test('Spezialkarte Gleichstand: Schnick-Schnack-Schnuck entscheidet', () => {
  let g = specialGame();
  g = buzz(g, 'b', at(6));
  g = buzz(g, 'c', at(6) + 300);
  assert.equal(specialStage(g, at(4)), 'rps');
  assert.throws(() => rpsPick(g, 'd', 'stein', at(4)), GameError);
  g = rpsPick(g, 'b', 'stein', at(4));
  g = rpsPick(g, 'c', 'stein', at(4));                    // unentschieden → nochmal
  assert.equal(specialStage(g, at(4)), 'rps');
  g = rpsPick(g, 'b', 'stein', at(4));
  g = rpsPick(g, 'c', 'papier', at(4));
  assert.equal(specialStage(g, at(4)), 'decide');
  assert.equal(g.special.winner, 'c');
  g = specialDecide(g, 'a', 'sell', at(4));
  assert.equal(g.payment.payer, 'c');
  assert.equal(g.payment.count, 6);
});

// ---------- Wertung mit Spezialkarten und Ratten ----------

test('Wertung: Spezialkarte zum Quartett zählt vor dem Malnehmen, sonst +250 danach', () => {
  const p = { animals: { kuh: 4, pferd: 4 }, specials: ['kuh', 'esel'] };
  assert.equal(scoreFor(p).score, (800 + 250 + 1000) * 2 + 250);
  // Blockiertes Kuh-Quartett zählt nicht, die Kuh-Spezialkarte bringt dann +250
  assert.equal(scoreFor(p, 'kuh').score, 1000 * 1 + 250 + 250);
  // Nur Spezialkarten, kein Quartett
  assert.equal(scoreFor({ animals: {}, specials: ['hahn'] }).score, 250);
});

test('Spielende: wer alle Ratten hat, blockiert ein eigenes Quartett seiner Wahl', () => {
  let g = createGame({ players: P.slice(0, 3), seed: 5 });
  g.deck = [];
  const ids = ANIMALS.map((a) => a.id);
  ids.forEach((id, i) => { g.players[i % 3].animals[id] = 4; });
  g.players[0].animals[RAT] = 4;
  g.players[0].specials = ['hahn'];
  g.phase = 'payment';
  g.payment = { payer: 'b', payee: 'a', amount: 0, animal: 'hahn', buyer: 'b' };
  g.players[1].animals.hahn = 3; g.players[0].animals.hahn = 0; // b bekommt den letzten Hahn
  g = pay(g, 'b', []);
  // a hat Quartette (hund, esel, kuh … je nach Verteilung) → muss blockieren
  assert.equal(g.phase, 'block');
  assert.throws(() => chooseBlock(g, 'b', 'gans'), GameError);
  const mine = ANIMALS.filter((x) => g.players[0].animals[x.id] === 4);
  g = chooseBlock(g, 'a', mine[0].id);
  assert.equal(g.phase, 'ended');
  const s = scores(g);
  assert.equal(s[0].blocked, mine[0].id);
  assert.equal(s[0].score, scoreFor(g.players[0], mine[0].id).score);
});

test('Alter Spielstand ohne Ratten und Spezialkarten endet weiterhin normal', () => {
  let g = createGame({ players: P.slice(0, 3), seed: 9 });
  for (const p of g.players) { delete p.specials; delete p.animals[RAT]; }
  g.deck = ['hahn'];
  ANIMALS.forEach((a, i) => { if (a.id !== 'hahn') g.players[i % 3].animals[a.id] = 4; });
  g.players[1].animals.hahn = 3;
  g = drawForAuction(g, 'a');
  g = bid(g, 'b', 10);
  g = closeAuction(g, 'a', 'sell');
  g = pay(g, 'b', [g.players[1].money.indexOf(10)]);
  assert.equal(g.phase, 'ended');
  assert.ok(scores(g).every((x) => Number.isFinite(x.score)));
});

// ---------- Geldscheine im Stapel ----------

test('Geld im Stapel: Einstellung landet im Stapel, Obergrenze 20, nur echte Scheine', () => {
  const g = createGame({ players: P, seed: 4, settings: { money: { 200: 4, 0: 5 } } });
  assert.equal(g.deck.length, 54 + 9);
  assert.equal(g.deck.filter((c) => c === 'geld-200').length, 4);
  assert.equal(g.deck.filter((c) => c === 'geld-0').length, 5);
  assert.throws(() => moneyDeckFrom({ 100: 21 }), GameError);
  assert.throws(() => moneyDeckFrom({ 30: 1 }), GameError);
  assert.equal(createGame({ players: P, seed: 4 }).deck.length, 54);
});

test('Geldschein aufgedeckt: Aufdecker bekommt ihn, Betrag für alle sichtbar, Zug vorbei', () => {
  let g = gameWithDeck(['geld-200', 'hahn']);
  g = drawForAuction(g, 'a');
  assert.equal(g.phase, 'turn');
  assert.equal(currentPlayer(g).id, 'b');
  assert.equal(total(g.players[0].money), 300);
  assert.deepEqual({ ...g.lastEvent, n: undefined }, { type: 'money_drawn', player: 'a', value: 200, n: undefined });
  assert.ok(Number.isInteger(g.lastEvent.n)); // eindeutige Nummer: Oberfläche zeigt jedes Ereignis nur einmal
  assert.deepEqual(viewFor(g, 'c').lastEvent.value, 200);
});

test('Versionsnummer in js/app.js und version.json stimmen überein', async () => {
  const { readFileSync } = await import('node:fs');
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const v = app.match(/APP_VERSION = '([^']+)'/)[1];
  const json = JSON.parse(readFileSync(new URL('../version.json', import.meta.url), 'utf8'));
  assert.equal(json.version, v);
});

test('Rückblick: teuerster Kauf, Kuhhandel-König, Rattenfänger', () => {
  let g = gameWithDeck(['pferd', RAT, 'hahn']);
  g = drawForAuction(g, 'a');
  g = bid(g, 'b', 70);
  g = closeAuction(g, 'a', 'sell');
  g = pay(g, 'b', [g.players[1].money.indexOf(50), g.players[1].money.indexOf(20)]);
  g = drawForAuction(g, 'b');
  g = ratTake(g, 'c');
  g.players[0].animals.kuh = 1; g.players[3].animals.kuh = 1;
  g.turn = 0; g.phase = 'turn'; g.mustDraw = false;
  g = startTrade(g, 'a', 'd', 'kuh', [6]);
  g = acceptTrade(g, 'd');
  const a = Object.fromEntries(awards(g).map((x) => [x.key, x]));
  assert.equal(a.buy.who, 'b');
  assert.equal(a.buy.text, 'Pferd für 70');
  assert.equal(a.trade.who, 'a');
  assert.equal(a.rat.who, 'c');
  assert.ok(a.rich);
  // alter Spielstand ohne Zähler
  const old = createGame({ players: P, seed: 2 }); delete old.stats;
  assert.ok(Array.isArray(awards(old)));
});

test('Aufdecken: Countdown startet erst nach der Animation, vorher kein Gebot', () => {
  let g = gameWithDeck(['kuh']);
  g = drawForAuction(g, 'a', 0);
  assert.equal(g.auction.endsAt, REVEAL_MS + AUCTION_START_MS);
  assert.throws(() => bid(g, 'b', 10, 100), GameError);
  g = bid(g, 'b', 10, REVEAL_MS);
  assert.equal(g.auction.high.amount, 10);
});

test('Zeig Batzen: jeder darf drücken, Stapel werden gezeigt, danach Achtung und Countdown', () => {
  let g = specialGame();
  assert.equal(batzenStage(g, 1000), 'ask');
  g = showBatzen(g, 'c', 2000);                         // auch wer nicht aufgedeckt hat
  assert.equal(batzenStage(g, 2500), 'show');
  assert.equal(g.special.batzen.counts.b, g.players[1].money.length);
  assert.throws(() => showBatzen(g, 'b', 2600), GameError); // nur einmal
  assert.equal(specialStage(g, 2000 + BATZEN_SHOW_MS + 100), 'wait'); // Achtung
  assert.equal(specialNumber(g, 2000 + BATZEN_SHOW_MS + SPECIAL_DELAY_MS + 100), 10);
});

test('Zeig Batzen: drückt keiner, geht es nach 5 s von selbst weiter', () => {
  const g = specialGame();
  assert.equal(batzenStage(g, BATZEN_WAIT_MS + 1), null);
  assert.throws(() => showBatzen(g, 'b', BATZEN_WAIT_MS + 1), GameError);
  assert.equal(specialNumber(g, BATZEN_WAIT_MS + SPECIAL_DELAY_MS + 100), 10);
});

test('Kuhhandel-Ergebnis: alle sehen den Unterschied, die Beträge bleiben verdeckt', () => {
  let g = createGame({ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }], seed: 3 });
  g.players[0].animals.kuh = 1; g.players[1].animals.kuh = 1;
  g.players[0].money = [50, 10]; g.players[1].money = [20, 0];
  g.turn = 0; g.phase = 'turn';
  g = startTrade(g, 'a', 'b', 'kuh', [0]);
  g = counterTrade(g, 'b', [0]);
  assert.equal(g.lastEvent.diff, 30);
  const v = viewFor(g, 'c');
  assert.equal(v.lastEvent.diff, 30);
  assert.equal(v.lastEvent.offerSum, undefined);
});

test('Ereignis-Nummer zeigt auf die eigene Protokoll-Zeile (auch bei „umsonst“) – danach gezogener Geldschein ist ein neues Ereignis', () => {
  let g = gameWithDeck(['hahn', 'geld-500', 'gans']);
  g = drawForAuction(g, 'a');
  g = closeAuction(g, 'a', 'sell'); // niemand bietet → umsonst
  assert.match(g.log[g.lastEvent.n], /umsonst/);
  const free = g.lastEvent.n;
  g = drawForAuction(g, 'b');
  assert.equal(g.lastEvent.type, 'money_drawn');
  assert.notEqual(g.lastEvent.n, free);
  assert.match(g.log[g.lastEvent.n], /Geldschein: 500/);
});

test('Auszeichnungen: Bluffer (Nullen im gewonnenen Gebot), Pechvogel (knapp verloren), Trinkgeld-König (überzahlt)', () => {
  // Startgeld: [0, 0, 10, 10, 10, 20, 50]
  let g = gameWithDeck(['hahn', 'gans']);
  g.players[0].animals.kuh = 1; g.players[1].animals.kuh = 1;
  g = startTrade(g, 'a', 'b', 'kuh', [0, 1, 2]); // 0 + 0 + 10 = 10, zwei Nullen
  g = counterTrade(g, 'b', [2]); // 10 → Gleichstand, Herausforderer gewinnt, Nico verliert knapp
  assert.equal(g.stats.a.bluffZeros, 2);
  assert.equal(g.stats.b.closeLosses, 1);
  g.players[0].animals.schaf = 1; g.players[1].animals.schaf = 1;
  g = startTrade(g, 'b', 'a', 'schaf', [0, 1]); // Nico bietet zwei Nullen, Alp nimmt an → Nico blufft erfolgreich
  g = acceptTrade(g, 'a');
  assert.equal(g.stats.b.bluffZeros, 2);
  // Versteigerung mit 50 bezahlen, obwohl 20 geboten: 30 zu viel
  g = drawForAuction(g, currentPlayer(g).id);
  const bidder = P.find((p) => p.id !== g.auction.auctioneer).id;
  g = bid(g, bidder, 20);
  g = closeAuction(g, g.auction.auctioneer, 'sell');
  const pl = g.players.find((p) => p.id === bidder);
  g = pay(g, bidder, [pl.money.indexOf(50)]);
  assert.equal(g.stats[bidder].overpaid, 30);
  const keys = awards(g).map((a) => a.key);
  assert.ok(keys.includes('bluff') && keys.includes('pech') && keys.includes('tip'));
});

test('Einstellung „Geld zählt am Ende“: übriges Geld wird addiert (nicht multipliziert), ohne Einstellung zählt es nicht', () => {
  const mk = (settings) => { const g = createGame({ players: P, seed: 3, settings }); g.players[0].animals.pferd = 4; g.players[0].animals.kuh = 4; g.players[0].money = [100, 200, 0]; g.players[1].money = [50]; return g; };
  const off = scores(mk(null)); const on = scores(mk({ moneyCounts: true }));
  assert.equal(off[0].score, (1000 + 800) * 2);
  assert.equal(on[0].score, (1000 + 800) * 2 + 300);
  assert.equal(on[1].score, 50);
  assert.equal(off[1].score, 0);
});

// ---------- v0.51 Turbo-Spielart ----------
test('Turbo: 7 Tierarten ohne Hahn, Gans, Katze – 39 Karten (28 Tiere, 7 Spezial, 4 Ratten), Versteigerung 6 s', async () => {
  const { animalsOf, TURBO_AUCTION_MS } = await import('../src/engine.js');
  const g = createGame({ players: P.slice(0, 3), seed: 5, settings: { turbo: true } });
  assert.equal(g.deck.length, 39);
  assert.deepEqual(animalsOf(g).map((a) => a.id).includes('hahn'), false);
  assert.equal(animalsOf(g).length, 7);
  for (const id of ['hahn', 'gans', 'katze']) assert.ok(!g.deck.some((c) => c.includes(id)), `${id} im Stapel`);
  assert.equal(g.players[0].animals.hahn, undefined);
  // erste Tierkarte nach vorne holen und versteigern
  const i = g.deck.findIndex((c) => animalsOf(g).some((a) => a.id === c));
  g.deck.unshift(...g.deck.splice(i, 1));
  const h = drawForAuction(g, currentPlayer(g).id, 0);
  if (h.phase === 'auction') assert.equal(h.auction.endsAt - h.auction.opensAt, TURBO_AUCTION_MS);
});

test('Turbo: 100 zufällige Komplettspiele enden sauber mit 7 Quartetten', async () => {
  const { animalsOf } = await import('../src/engine.js');
  for (let seed = 1; seed <= 100; seed++) {
    let g = createGame({ players: P.slice(0, 3 + (seed % 2)), seed, settings: { turbo: true } });
    let r = seed * 104729;
    const rand = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    let steps = 0;
    while (g.phase !== 'ended') { g = botStep(g, rand); if (++steps > 60000) throw new Error('Turbo-Spiel endet nicht (Seed ' + seed + ')'); }
    assert.equal(g.players.reduce((n, p) => n + p.specials.length, 0), 7);
    for (const a of animalsOf(g)) assert.equal(g.players.filter((p) => p.animals[a.id] === 4).length, 1, `${a.id} (Seed ${seed})`);
    assert.ok(g.winner.length >= 1);
  }
});

test('Debug: Spiel sofort beenden – nur wenn alle Quartette verteilt, dann regulär (Block oder Abrechnung)', async () => {
  const { debugEnd } = await import('../src/engine.js');
  const g = createGame({ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }], seed: 3 });
  assert.throws(() => debugEnd(g));
  const s = JSON.parse(JSON.stringify(g));
  const kinds = [...new Set(s.deck.filter((c) => typeof c === 'string' && !c.includes(':') && c !== 'ratte'))];
  s.players.forEach((p) => { p.animals = {}; });
  s.deck = s.deck.filter((c) => !kinds.includes(c) && c !== 'ratte');
  kinds.forEach((id, k) => { s.players[k % 3].animals[id] = 4; });
  s.players[1].animals.ratte = 4;
  const e = debugEnd(s);
  assert.ok(['block', 'ended'].includes(e.phase));
});

// ---------- Börsen-Chaos ----------
test('Börsen-Chaos: 68 Karten (54 + 14 News inkl. Hype, Blase, Blindmarkt, 2× Zwangsversteigerung + Einspruch), nie zusammen mit Turbo', async () => {
  const { isNewsCard, newsOf, isBoerse } = await import('../src/engine.js');
  const g = createGame({ players: P, seed: 9, settings: { boerse: true } });
  assert.equal(g.deck.length, 68);
  const news = g.deck.filter(isNewsCard).map((c) => newsOf(c).kind).sort();
  assert.deepEqual(news, ['blase', 'blind', 'crash', 'crash', 'dividende', 'einspruch', 'hektik', 'hype', 'panik', 'pfaendung', 'pfaendung', 'rallye', 'rallye', 'steuer']);
  assert.deepEqual(g.kurse, {});
  const t = createGame({ players: P.slice(0, 3), seed: 9, settings: { boerse: true, turbo: true } });
  assert.equal(t.deck.filter(isNewsCard).length, 0);
  assert.equal(isBoerse(t), false);
  assert.equal(createGame({ players: P, seed: 9 }).deck.filter(isNewsCard).length, 0);
});

function boerseWithTop(card) {
  const g = createGame({ players: P, seed: 1, settings: { boerse: true, startHand: { pfaendung: 0, einspruch: 0 } } });
  g.deck = [card, 'kuh', 'hahn', 'esel', 'pferd', 'schaf'];
  return g;
}

test('Börsen-News: Kursrallye/-sturz ändern den Wert (±50 %, multiplikativ stapelbar, nie unter 0) – Aufdecker deckt nochmal auf', async () => {
  const { kursValue } = await import('../src/engine.js');
  let g = drawForAuction(boerseWithTop('news-rallye-kuh'), 'a', 0);
  assert.equal(g.kurse.kuh, 50);
  assert.equal(kursValue('kuh', g.kurse), 1200);
  assert.equal(g.phase, 'turn'); assert.equal(g.mustDraw, true); assert.equal(currentPlayer(g).id, 'a');
  assert.equal(g.lastEvent.type, 'news'); assert.equal(g.lastEvent.from, 800); assert.equal(g.lastEvent.to, 1200);
  g.deck.unshift('news-rallye-kuh'); g = drawForAuction(g, 'a', 0);
  assert.equal(kursValue('kuh', g.kurse), 1800); // v0.69 multiplikativ: 800 × 1,5 × 1,5
  g.deck.unshift('news-crash-pferd', 'news-crash-pferd', 'news-crash-pferd');
  g = drawForAuction(drawForAuction(drawForAuction(g, 'a', 0), 'a', 0), 'a', 0);
  assert.equal(kursValue('pferd', g.kurse), 125); // 1000 × 0,5³
  g.deck.unshift('news-crash-pferd-100'); g = drawForAuction(g, 'a', 0);
  assert.equal(kursValue('pferd', g.kurse), 0);
  // Wertung rechnet mit dem Kurs
  g.players[1].animals.kuh = 4;
  assert.equal(scores(g)[1].score, 1800);
  assert.equal(scoreFor(g.players[1]).score, 800); // ohne Kurse: Grundwert
});

test('Börsen-News: Dividende +50 für alle; Steuerprüfung nimmt jedem den höchsten Schein (nur eigener sichtbar)', () => {
  let g = drawForAuction(boerseWithTop('news-dividende'), 'a', 0);
  for (const p of g.players) assert.equal(total(p.money), 150);
  g.players[2].money = [0, 10, 500];
  g.deck.unshift('news-steuer');
  g = drawForAuction(g, 'a', 0);
  assert.deepEqual(g.players[2].money, [0, 10]);
  assert.equal(total(g.players[0].money), 100); // 100 + 50 − 50
  const v = viewFor(g, 'c');
  assert.deepEqual(v.lastEvent.lost, { c: 500 });
  assert.deepEqual(viewFor(g, 'a').lastEvent.lost, { a: 50 });
});

test('Börsen-News: Marktpanik – jeder schiebt eine zufällige Karte nach links (Summe bleibt), jeder sieht nur Gegeben/Bekommen', () => {
  const g0 = boerseWithTop('news-panik');
  g0.players.forEach((p, i) => { p.money = [10 * (i + 1)]; });
  const g = drawForAuction(g0, 'a', 0);
  assert.deepEqual(g.players.map((p) => p.money), [[40], [10], [20], [30]]);
  const v = viewFor(g, 'b');
  assert.deepEqual(v.lastEvent.moved, { gave: 20, got: 10, from: 'a' });
});

test('Börsen-News: Hektik – die nächsten 3 Versteigerungen laufen 5 s (auch nach Geboten), dann wieder 10 s', async () => {
  const { HEKTIK_MS } = await import('../src/engine.js');
  let g = drawForAuction(boerseWithTop('news-hektik'), 'a', 0);
  assert.equal(g.hektik, 3);
  g = drawForAuction(g, 'a', 1000);
  assert.equal(g.auction.endsAt - g.auction.opensAt, HEKTIK_MS);
  const t = g.auction.opensAt + 100;
  g = bid(g, 'b', 10, t);
  assert.equal(g.auction.endsAt - t, HEKTIK_MS);
  assert.equal(g.hektik, 2);
});

test('Börsen-Chaos: 100 zufällige Komplettspiele enden sauber, Kurse nie negativ', async () => {
  const { kursValue } = await import('../src/engine.js');
  for (let seed = 1; seed <= 100; seed++) {
    let g = createGame({ players: P.slice(0, 3 + (seed % 2)), seed, settings: { boerse: true } });
    let r = seed * 7919;
    const rand = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    let steps = 0;
    while (g.phase !== 'ended') { g = botStep(g, rand); if (++steps > 80000) throw new Error('Börsen-Spiel endet nicht (Seed ' + seed + ')'); }
    for (const a of ANIMALS) { assert.equal(g.players.filter((p) => p.animals[a.id] === 4).length, 1, `${a.id} (Seed ${seed})`); assert.ok(kursValue(a.id, g.kurse) >= 0); }
    assert.ok(g.winner.length >= 1);
  }
});

test('v0.63 Kursrallye/Kurssturz: zufällig 30 … 100 % (10er), Sturz im Schnitt stärker; alte Karten ohne Zahl = 50 %', async () => {
  const { newsOf, kursValue } = await import('../src/engine.js');
  assert.deepEqual(newsOf('news-rallye-kuh'), { kind: 'rallye', animal: 'kuh', pct: 50 });
  assert.deepEqual(newsOf('news-crash-kuh-90'), { kind: 'crash', animal: 'kuh', pct: 90 });
  const seen = { rallye: new Set(), crash: new Set() }, sum = { rallye: 0, crash: 0 }, cnt = { rallye: 0, crash: 0 };
  for (let seed = 1; seed <= 500; seed++) {
    const g = createGame({ players: P, seed, settings: { boerse: true } });
    for (const c of g.deck.filter((x) => /^news-(rallye|crash)-/.test(x))) {
      const n = newsOf(c); seen[n.kind].add(n.pct); sum[n.kind] += n.pct; cnt[n.kind]++;
      assert.ok(n.pct >= 30 && n.pct <= 100 && n.pct % 10 === 0, c);
    }
    assert.equal(g.deck.filter((x) => x.startsWith('news-rallye-')).length, 2);
    assert.equal(g.deck.filter((x) => x.startsWith('news-crash-')).length, 2);
  }
  for (const k of ['rallye', 'crash']) assert.equal(seen[k].size, 8, k);
  const avgR = sum.rallye / cnt.rallye, avgC = sum.crash / cnt.crash;
  assert.ok(avgR < 58 && avgC > 62 && avgC - avgR > 10, `Ø Rallye ${avgR}, Ø Sturz ${avgC}`);
  const g = drawForAuction(boerseWithTop('news-rallye-kuh-30'), 'a', 0);
  assert.equal(kursValue('kuh', g.kurse), 1040); assert.equal(g.lastEvent.pct, 30);
  assert.ok(JSON.stringify(g.log).includes('+30 %'));
  const h = drawForAuction(boerseWithTop('news-crash-kuh-80'), 'a', 0);
  assert.equal(kursValue('kuh', h.kurse), 160); assert.ok(JSON.stringify(h.log).includes('−80 %'));
});

test('v0.65 Zwangsversteigerung: auf die Hand + nochmal aufdecken; ausspielen statt Zug; Besitzer muss verkaufen und bekommt das Geld', async () => {
  const { playPfaendung, canPfaend, viewFor: vf } = await import('../src/engine.js');
  let g = drawForAuction(boerseWithTop('news-pfaendung'), 'a', 0);
  assert.deepEqual(g.hands.a, ['pfaendung']);
  assert.equal(g.phase, 'turn'); assert.equal(g.mustDraw, true); assert.equal(currentPlayer(g).id, 'a');
  assert.equal(g.lastEvent.type, 'hand');
  assert.equal(vf(g, 'b').hands.a, 1); assert.equal(vf(g, 'b').lastEvent.kind, undefined); // Bluff: nur Anzahl
  assert.throws(() => playPfaendung(g, 'a', 'b', 'kuh', 0), /aufdecken/); // erst nochmal aufdecken
  g = drawForAuction(g, 'a', 0); // Kuh-Versteigerung
  g.phase = 'turn'; g.auction = null; g.mustDraw = false; g.turn = 0;
  g.players[1].animals.kuh = 2; g.players[1].animals.pferd = 4; g.players[1].animals.ratte = 1;
  assert.equal(canPfaend(g, 'a', 'b', 'pferd'), false); // fertiges Quartett geschützt
  assert.equal(canPfaend(g, 'a', 'b', 'ratte'), false); // Ratten nicht
  assert.equal(canPfaend(g, 'a', 'a', 'kuh'), false); // nicht bei sich selbst
  const broke = JSON.parse(JSON.stringify(g)); broke.players[1].money = [0, 0];
  assert.equal(canPfaend(broke, 'a', 'b', 'kuh'), false); // ohne Geld geschützt
  g = playPfaendung(g, 'a', 'b', 'kuh', 1000);
  assert.equal(g.phase, 'auction'); assert.equal(g.auction.auctioneer, 'b'); assert.equal(g.auction.forced.by, 'a');
  assert.equal(g.players[1].animals.kuh, 1); assert.deepEqual(g.hands.a, []);
  assert.equal(g.lastEvent.type, 'pfaendung');
  assert.throws(() => bid(g, 'b', 10, 1000 + 4000), /Auktionator/);
  g = bid(g, 'a', 100, 1000 + 4000);
  const end = g.auction.endsAt + 1;
  assert.throws(() => closeAuction(g, 'b', 'buy', end), /verkaufen/); // kein Vorkaufsrecht
  g = closeAuction(g, 'b', 'sell', end);
  assert.equal(g.payment.payer, 'a'); assert.equal(g.payment.payee, 'b');
  const bBefore = total(g.players[1].money);
  g = pay(g, 'a', bestPay(g.players[0].money, 100));
  assert.ok(total(g.players[1].money) >= bBefore + 100);
  assert.equal(g.players[0].animals.kuh, 1); assert.equal(g.lastEvent.forced, true);
  assert.equal(currentPlayer(g).id, 'b'); // Pfändung war der Zug von a
  // wer schon gepfändet wurde, kann nochmal gepfändet werden
  g.turn = 0; g.phase = 'turn'; g.hands.a = ['pfaendung']; g.players[1].animals.schaf = 2;
  assert.equal(canPfaend(g, 'a', 'b', 'schaf'), true);
});

test('v0.65 Einspruch wehrt Pfändung ab; ohne Gebot behält der Besitzer sein Tier', async () => {
  const { playPfaendung } = await import('../src/engine.js');
  const g0 = createGame({ players: P, seed: 3, settings: { boerse: true } });
  g0.hands = { a: ['pfaendung'], b: ['einspruch'] }; g0.players[1].animals.schaf = 2;
  let g = playPfaendung(g0, 'a', 'b', 'schaf', 0);
  assert.equal(g.lastEvent.type, 'einspruch'); assert.equal(g.players[1].animals.schaf, 2);
  assert.deepEqual(g.hands, { a: [], b: [] }); assert.equal(currentPlayer(g).id, 'b');
  const g1 = createGame({ players: P, seed: 3, settings: { boerse: true } });
  g1.hands = { a: ['pfaendung'] }; g1.players[2].animals.gans = 1;
  g = playPfaendung(g1, 'a', 'c', 'gans', 0);
  g = closeAuction(g, 'c', 'sell', g.auction.endsAt + 1);
  assert.equal(g.players[2].animals.gans, 1); assert.match(g.log.at(-1), /behält/);
});

test('v0.69 Hype ×2 und Blase platzt ÷2: multiplikativ, höchstens ×4, Rallye/Sturz heben sich nicht mehr einfach auf', async () => {
  const { kursValue, newsOf, KURS_MAX_FACTOR } = await import('../src/engine.js');
  assert.deepEqual(newsOf('news-hype-kuh'), { kind: 'hype', animal: 'kuh' });
  let g = drawForAuction(boerseWithTop('news-hype-kuh'), 'a', 0);
  assert.equal(kursValue('kuh', g.kurse), 1600);
  assert.equal(g.lastEvent.kind, 'hype'); assert.equal(g.lastEvent.from, 800); assert.equal(g.lastEvent.to, 1600);
  assert.equal(g.mustDraw, true);
  g.deck.unshift('news-hype-kuh', 'news-hype-kuh'); g = drawForAuction(drawForAuction(g, 'a', 0), 'a', 0);
  assert.equal(kursValue('kuh', g.kurse), 800 * KURS_MAX_FACTOR); // gedeckelt bei ×4
  g.deck.unshift('news-blase-kuh'); g = drawForAuction(g, 'a', 0);
  assert.equal(kursValue('kuh', g.kurse), 1600);
  assert.equal(g.lastEvent.kind, 'blase');
  // Rallye +50 und Sturz −50 ergeben ×0,75 (nicht mehr ±0)
  let h = drawForAuction(boerseWithTop('news-rallye-hund-50'), 'a', 0);
  h.deck.unshift('news-crash-hund-50'); h = drawForAuction(h, 'a', 0);
  assert.equal(kursValue('hund', h.kurse), 120);
  // laufende Partien: alter additiver Stand wird als Faktor weitergeführt (+50 → ×1,5 → Hype → ×3)
  const old = boerseWithTop('news-hype-esel'); old.kurse = { esel: 50 };
  assert.equal(kursValue('esel', drawForAuction(old, 'a', 0).kurse), 1500);
});

test('v0.72 Steuer/Marktpanik: wer abgibt, sehen alle (payers/movers) – die Werte bleiben verdeckt', async () => {
  const { viewFor } = await import('../src/engine.js');
  let g = drawForAuction(boerseWithTop('news-steuer'), 'a', 0);
  const ids = g.players.filter((p) => p.money.length >= 0).map((p) => p.id);
  assert.deepEqual([...g.lastEvent.payers].sort(), ids.sort());
  const other = g.players.find((p) => p.id !== 'a').id;
  const v = viewFor(g, other);
  assert.equal(v.lastEvent.payers.length, ids.length);
  assert.deepEqual(Object.keys(v.lastEvent.lost), [other]);
  let h = drawForAuction(boerseWithTop('news-panik'), 'a', 0);
  assert.equal(h.lastEvent.movers.length, h.players.length);
  assert.equal(typeof viewFor(h, other).lastEvent.moved.gave, 'number');
});

// ---------- v0.77 Zu zweit (Aufteilen) ----------
test('Zu zweit: genau 2 Spieler, Geld ohne 0er im Stapel, kein Turbo/Börse', async () => {
  const { isDuo } = await import('../src/engine.js');
  assert.throws(() => createGame({ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }] }), /3 bis 4/);
  assert.throws(() => createGame({ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }], settings: { duo: true } }), /genau 2/);
  const g = createGame({ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], seed: 5, settings: { duo: true, boerse: true, money: { 0: 3, 10: 2, 500: 1 } } });
  assert.ok(isDuo(g));
  assert.equal(g.settings.boerse, null);
  const money = g.deck.filter((c) => c.startsWith('geld-'));
  assert.deepEqual(money.sort(), ['geld-10', 'geld-10', 'geld-500']);
  assert.equal(g.deck.filter((c) => c.startsWith('news-')).length, 0);
  // ohne Geld-Einstellung: Standard-Satz ohne 0er
  const h = createGame({ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], seed: 5, settings: { duo: true } });
  assert.equal(h.deck.filter((c) => c === 'geld-0').length, 0);
  assert.ok(h.deck.filter((c) => c.startsWith('geld-')).length > 0);
});

test('Zu zweit: Aufteilen – behalten / abgeben, Sicht, Esel-Bonus, keine Versteigerung', async () => {
  const { divideLook, divideChoose, viewFor } = await import('../src/engine.js');
  let g = createGame({ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], seed: 9, settings: { duo: true } });
  g.deck = ['esel', 'geld-200', 'kuh', 'ratte', 'sp-kuh', 'hahn', ...g.deck.slice(6)];
  assert.throws(() => drawForAuction(g, 'a', 0), /aufgeteilt/);
  g = divideLook(g, 'a');
  assert.equal(g.phase, 'divide');
  assert.equal(viewFor(g, 'a').divide.card, 'esel');
  assert.equal(viewFor(g, 'b').divide.card, null);
  assert.throws(() => divideChoose(g, 'b', true), /teilst gerade nicht/);
  const moneyB = g.players[1].money.length; const sumA0 = g.players[0].money.reduce((x, y) => x + y, 0);
  g = divideChoose(g, 'a', true); // A behält den Esel, B bekommt den 200er
  assert.equal(g.players[0].animals.esel, 1);
  assert.ok(g.players[1].money.length > moneyB + 1); // 200er + Esel-Bonus
  assert.ok(g.players[1].money.includes(200));
  assert.equal(g.players[0].money.reduce((x, y) => x + y, 0), sumA0 + 50); // v0.85: Esel-Bonus auch zu zweit (50 für jeden)
  assert.equal(g.donkeysDrawn, 1);
  assert.deepEqual(g.lastEvent.esel, [{ payout: 50, nr: 1 }]);
  assert.equal(viewFor(g, 'a').lastEvent.second.card, 'geld-200'); // v0.85: beide sehen, wer welches Geld bekam
  assert.equal(viewFor(g, 'b').lastEvent.second.card, 'geld-200');
  assert.equal(g.turn, 1); assert.equal(g.phase, 'turn');
  g = divideChoose(divideLook(g, 'b'), 'b', false); // B gibt die Kuh ab, bekommt die Ratte
  assert.equal(g.players[0].animals.kuh, 1);
  assert.equal(g.players[1].animals.ratte, 1);
  g = divideChoose(divideLook(g, 'a'), 'a', true); // Spezialkarte + Hahn
  assert.deepEqual(g.players[0].specials, ['kuh']);
  assert.equal(g.players[1].animals.hahn, 1);
});

test('Zu zweit: komplette Partie endet (aufteilen, danach Kuhhandel)', async () => {
  const { divideLook, divideChoose, possibleTrades, startTrade, acceptTrade, counterTrade, chooseBlock } = await import('../src/engine.js');
  for (const seed of [1, 2, 3, 4, 5]) {
    let g = createGame({ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], seed, settings: { duo: true } });
    let r = seed * 7919; const rnd = () => ((r = (r * 1103515245 + 12345) % 2147483648) / 2147483648);
    let steps = 0;
    while (g.phase !== 'ended' && steps++ < 3000) {
      const cur = g.players[g.turn].id;
      if (g.phase === 'turn') {
        const trades = possibleTrades(g, cur);
        if (g.deck.length && (!trades.length || rnd() < 0.7)) { g = divideChoose(divideLook(g, cur), cur, rnd() < 0.5); continue; }
        if (!trades.length) break;
        const t = trades[Math.floor(rnd() * trades.length)];
        const me = g.players.find((p) => p.id === cur);
        g = startTrade(g, cur, t.target, t.animal, me.money.length ? [0] : []);
        const tg = g.players.find((p) => p.id === t.target);
        g = rnd() < 0.5 || !tg.money.length ? acceptTrade(g, t.target) : counterTrade(g, t.target, [0]);
      } else if (g.phase === 'block') {
        const p = g.players.find((x) => x.id === g.block.player);
        const a = Object.keys(p.animals).find((k) => p.animals[k] === 4 && k !== 'ratte');
        g = chooseBlock(g, p.id, a);
      } else break;
    }
    assert.equal(g.phase, 'ended', `Seed ${seed}: endet nicht (${g.phase}, Stapel ${g.deck.length})`);
  }
});

test('Zu zweit: Bedenzeit 10 s → automatisch behalten; beide verzichten → Spielende', async () => {
  const { divideLook, divideTimeout, duoPass, DIVIDE_MS } = await import('../src/engine.js');
  let g = createGame({ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], seed: 3, settings: { duo: true } });
  g.deck = ['kuh', 'hund', 'pferd'];
  g = divideLook(g, 'a', 1000);
  assert.throws(() => divideTimeout(g, 1000 + DIVIDE_MS - 1), /läuft noch/);
  g = divideTimeout(g, 1000 + DIVIDE_MS);
  assert.equal(g.players[0].animals.kuh, 1); assert.equal(g.players[1].animals.hund, 1); assert.equal(g.lastEvent.auto, true);
  assert.throws(() => duoPass(g, 'b'), /aufgeteilt/);
  g = divideTimeout(divideLook(g, 'b', 0), DIVIDE_MS); // letzte Karte (nur eine)
  assert.equal(g.players[1].animals.pferd, 1); assert.equal(g.deck.length, 0);
  // Stapel leer, keiner kann handeln → Spiel endet regulär (kein „ended ohne Sieger“)
  assert.equal(g.phase, 'ended'); assert.ok(Array.isArray(g.winner) && g.winner.length > 0);
  // mit möglichem Handel: beide verzichten → Ende
  let h = createGame({ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], seed: 3, settings: { duo: true } });
  h.deck = []; h.players[0].animals.kuh = 2; h.players[1].animals.kuh = 2;
  h = duoPass(h, 'a'); assert.equal(h.phase, 'turn'); assert.equal(h.turn, 1);
  h = duoPass(h, 'b'); assert.equal(h.phase, 'ended');
});

test('v0.78 Tempo: Denkzeiten voll (×1,5/×0,7), Info-Fenster leicht (×1,3/×0,85), Kann-nicht-zahlen nie unter 5 s, Hektik = halbe Zeit', async () => {
  const E = await import('../src/engine.js');
  const S = (tempo, extra = {}) => ({ settings: { ...(tempo ? { tempo } : {}), ...extra } });
  assert.deepEqual(['gemuetlich', null, 'schnell'].map((t) => E.auctionStartMs(S(t))), [15000, 10000, 7000]);
  assert.deepEqual(['gemuetlich', null, 'schnell'].map((t) => E.revealMs(S(t))), [3900, 3000, 2550]);
  assert.deepEqual(['gemuetlich', null, 'schnell'].map((t) => E.cantpayMs(S(t))), [6500, 5000, 5000]);
  assert.deepEqual(['gemuetlich', null, 'schnell'].map((t) => E.hektikMs(S(t))), [7500, 5000, 3500]);
  assert.deepEqual(['gemuetlich', null, 'schnell'].map((t) => E.tradeTimerSec(S(t, { tradeTimer: 20 }))), [30, 20, 14]);
  assert.equal(E.tradeTimerSec(S(null)), 0);
  assert.equal(E.hektikMs(S(null)), E.HEKTIK_MS);
  // Hektik in gemütlicher Runde: 7,5 s statt fest 5 s
  let g = drawForAuction(boerseWithTop('news-hektik'), 'a', 0);
  g.settings.tempo = 'gemuetlich';
  g = drawForAuction(g, 'a', 1000);
  assert.equal(g.auction.endsAt - g.auction.opensAt, 7500);
  assert.equal(g.auction.opensAt - 1000, 3900);
});

test('v0.79 „Warte, warte, warte!“: Versteigerung +volle Zeit (ab dem zweiten halb), je Spieler einmal; Kuhhandel und Aufteilen je einmal', async () => {
  const E = await import('../src/engine.js');
  let g = E.drawForAuction(gameWithDeck(['kuh', 'hahn']), 'a', 0);
  const open = g.auction.opensAt, end0 = g.auction.endsAt;
  assert.throws(() => E.waitAuction(g, 'a', open + 100), /Auktionator/);
  g = E.waitAuction(g, 'b', open + 1000);
  assert.equal(g.auction.endsAt, end0 + 10000);
  assert.throws(() => E.waitAuction(g, 'b', open + 2000), /schon/);
  g = E.waitAuction(g, 'c', open + 2000);
  assert.equal(g.auction.endsAt, end0 + 15000);
  assert.deepEqual(g.auction.lastWait, { player: 'c', at: open + 2000, ms: 5000 });
  // Gebot danach: Uhr wird nicht verkürzt
  g = E.bid(g, 'd', 10, open + 3000);
  assert.equal(g.auction.endsAt, end0 + 15000);
  // Gemütlich: +15 s
  let h = gameWithDeck(['kuh']); h.settings = { ...(h.settings || {}), tempo: 'gemuetlich' }; h = E.drawForAuction(h, 'a', 0);
  const e1 = h.auction.endsAt; h = E.waitAuction(h, 'b', h.auction.opensAt + 10);
  assert.equal(h.auction.endsAt, e1 + 15000);
  // Kuhhandel: nur mit Uhr, nur der Herausgeforderte, einmal
  let t = gameWithDeck(['hahn']); t.players[0].animals.kuh = 1; t.players[1].animals.kuh = 1;
  t = startTrade(t, 'a', 'b', 'kuh', [6]);
  assert.throws(() => E.tradeWait(t, 'b'), /ohne Uhr/);
  t.settings = { ...(t.settings || {}), tradeTimer: 20 };
  assert.throws(() => E.tradeWait(t, 'a'), /herausgefordert/);
  const logLen = t.log.length;
  t = E.tradeWait(t, 'b');
  assert.equal(t.trade.extraSec, 20); assert.equal(t.log.length, logLen);
  assert.throws(() => E.tradeWait(t, 'b'), /schon/);
  // Aufteilen
  let d = createGame({ players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], seed: 9, settings: { duo: true } });
  d = E.divideLook(d, 'a', 1000);
  const de = d.divide.endsAt;
  assert.throws(() => E.divideWait(d, 'b', 2000), /ansieht/);
  d = E.divideWait(d, 'a', 2000);
  assert.equal(d.divide.endsAt, de + 10000);
  assert.throws(() => E.divideWait(d, 'a', 3000), /schon/);
});

test('v0.81 Blindmarkt: nächste 3 Versteigerungen verdeckt (auch für den Auktionator), Aufdecken beim Zuschlag, Esel-Bonus erst dann', async () => {
  const E = await import('../src/engine.js');
  let g = E.drawForAuction(boerseWithTop('news-blind'), 'a', 0);
  assert.equal(g.blind, 3);
  g.deck.unshift('esel');
  g = E.drawForAuction(g, 'a', 1000);
  assert.equal(g.blind, 2);
  assert.equal(g.auction.blind, true);
  assert.equal(g.lastEvent.type, 'draw'); assert.equal(g.lastEvent.animal, undefined);
  const before = g.players.map((p) => p.money.length);
  assert.deepEqual(g.players.map((p) => p.money.length), before); // noch kein Esel-Bonus
  for (const pid of ['a', 'b']) assert.equal(E.viewFor(g, pid).auction.animal, null);
  assert.ok(!/Esel/.test(g.log.at(-1)));
  g = E.closeAuction(g, 'a', 'sell', g.auction.endsAt + 1);
  assert.equal(g.blindReveal.animal, 'esel');
  assert.equal(g.blindReveal.eselBonus, 50);
  assert.equal(g.players[0].animals.esel, 1);
  assert.ok(g.players.every((p, i) => p.money.length === before[i] + 1));
});

test('v0.82 Geheimaufträge: jeder bekommt einen eigenen Auftrag, nur der eigene ist sichtbar, erfüllt → Bonus in der Wertung', async () => {
  const E = await import('../src/engine.js');
  const g = createGame({ players: P, seed: 5, settings: { missions: true } });
  assert.equal(Object.keys(g.missions).length, P.length);
  for (const p of P) assert.ok(E.MISSIONS[g.missions[p.id].id]);
  const v = E.viewFor(g, P[0].id);
  assert.deepEqual(Object.keys(v.missions), [P[0].id]);
  // Zu zweit: keine Versteigerungs-Aufträge
  for (let seed = 1; seed < 40; seed++) {
    const d = createGame({ players: P.slice(0, 2), seed, settings: { duo: true, missions: true } });
    for (const m of Object.values(d.missions)) assert.ok(!E.MISSIONS[m.id].auction, m.id);
  }
  // Auftrag „geizhals“ erfüllt
  const h = createGame({ players: P, seed: 5, settings: { missions: true } });
  h.missions[P[1].id] = { id: 'geizhals' };
  h.players[1].money = [100, 100, 100];
  const before = E.scoreFor(h.players[1]).score;
  const sc = E.scores(h).find((r) => r.id === P[1].id);
  assert.equal(sc.mission.done, true);
  assert.equal(sc.score, before + 400);
  h.phase = 'ended';
  assert.equal(Object.keys(E.viewFor(h, P[0].id).missions).length, P.length); // am Ende sehen alle alles
});

test('v0.83 Teams 2 gegen 2: Partner gegenüber, kein Kuhhandel im Team, Tiere zählen zusammen, Team gewinnt gemeinsam', async () => {
  const E = await import('../src/engine.js');
  const g = createGame({ players: P, seed: 3, settings: { teams: true } });
  assert.equal(E.partnerOf(g, P[0].id), P[2].id);
  assert.equal(E.partnerOf(g, P[1].id), P[3].id);
  assert.equal(createGame({ players: P.slice(0, 3), seed: 3, settings: { teams: true } }).settings.teams, null);
  // Partnergeld sichtbar, fremdes nicht
  const v = E.viewFor(g, P[0].id);
  assert.ok(Array.isArray(v.players[2].money)); assert.equal(typeof v.players[1].money, 'number');
  // kein Kuhhandel mit dem Partner
  g.players[0].animals.kuh = 1; g.players[2].animals.kuh = 1; g.players[1].animals.kuh = 1;
  assert.ok(E.possibleTrades(g, P[0].id).every((t) => t.target !== P[2].id));
  assert.ok(E.possibleTrades(g, P[0].id).some((t) => t.target === P[1].id));
  assert.throws(() => E.startTrade(g, P[0].id, P[2].id, 'kuh', [2]), /Partner/);
  // Wertung: 2 + 2 Pferde beim Team = Quartett, beide Partner gleiche Punkte und beide gewinnen
  const h = createGame({ players: P, seed: 3, settings: { teams: true } });
  h.players[0].animals.pferd = 2; h.players[2].animals.pferd = 2;
  h.players[1].animals.hahn = 4;
  assert.ok(E.isQuartetComplete(h, 'pferd'));
  const sc = E.scores(h);
  assert.equal(sc[0].score, 1000); assert.equal(sc[2].score, 1000); assert.equal(sc[1].score, 10);
  assert.equal(sc[0].teamName, `${P[0].name} & ${P[2].name}`);
});

test('v0.83 Teams: 60 zufällige Komplettspiele (auch Börsen-Chaos + Geheimaufträge) enden sauber, Team gewinnt gemeinsam', async () => {
  const E = await import('../src/engine.js');
  for (let seed = 1; seed <= 60; seed++) {
    let g = createGame({ players: P, seed, settings: { teams: true, missions: seed % 3 === 0, boerse: seed % 2 === 0 } });
    let r = seed * 4421;
    const rand = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    let steps = 0;
    while (g.phase !== 'ended') { g = botStep(g, rand); if (++steps > 80000) throw new Error('Team-Spiel endet nicht (Seed ' + seed + ')'); }
    for (const a of ANIMALS) assert.ok(E.isQuartetComplete(g, a.id), `${a.id} (Seed ${seed})`);
    const sc = E.scores(g);
    assert.equal(sc[0].score, sc[2].score); assert.equal(sc[1].score, sc[3].score);
    assert.ok(g.winner.length === 2 || g.winner.length === 4, `Seed ${seed}: ${g.winner}`);
  }
});

test('v0.83 Team-Wahl: teamPick ordnet die Plätze so, dass Partner gegenüber sitzen', async () => {
  const E = await import('../src/engine.js');
  const g = createGame({ players: P, seed: 3, settings: { teams: true, teamPick: { [P[0].id]: 0, [P[1].id]: 0, [P[2].id]: 1, [P[3].id]: 1 } } });
  assert.equal(E.partnerOf(g, P[0].id), P[1].id);
  assert.equal(E.partnerOf(g, P[2].id), P[3].id);
  const u = createGame({ players: P, seed: 3, settings: { teams: true, teamPick: { [P[0].id]: 0, [P[1].id]: 0, [P[2].id]: 0 } } }); // ungleich → Reihenfolge bleibt
  assert.equal(E.partnerOf(u, P[0].id), P[2].id);
});

test('v0.86: logNo zählt weiter, auch wenn das Protokoll bei 200 abgeschnitten wird (sonst fehlen später alle Ergebnis-Fenster)', async () => {
  const E = await import('../src/engine.js');
  let g = createGame({ players: P.slice(0, 4), seed: 7 });
  let r = 7 * 7919; const rand = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
  let lastN = -1, lastSig = null, newEvents = 0, steps = 0;
  while (g.phase !== 'ended' && steps++ < 60000) {
    const before = E.logNo(g);
    g = botStep(g, rand);
    assert.ok(E.logNo(g) >= before, 'logNo darf nie kleiner werden');
    const e = g.lastEvent; const sig = e ? `${e.n}|${e.type}` : null;
    if (sig && sig !== lastSig) { assert.ok(e.n >= lastN, 'Ereignis-Nummern steigen'); lastN = e.n; lastSig = sig; newEvents += 1; }
  }
  assert.ok(g.log.length <= 200, 'Protokoll bleibt begrenzt');
  assert.ok(E.logNo(g) > 200, `lange Partie (logNo ${E.logNo(g)})`);
  assert.ok(lastN > 200, 'Ereignisse nach Eintrag 200 haben weiter neue Nummern');
});

test('v0.87: nach „kann nicht zahlen“ gibt es das Tier nicht umsonst – Versteigerung neu (höchstens 2×), Scheine bleiben offen', () => {
  let g = gameWithDeck(['schwein', 'hahn']);
  g = drawForAuction(g, 'a');
  g = bid(g, 'b', 200);
  g = closeAuction(g, 'a', 'sell');
  assert.deepEqual(g.auction.openMoney.b, [0, 0, 10, 10, 10, 20, 50]);
  g = closeAuction(g, 'a', 'sell'); // niemand bietet
  assert.equal(g.phase, 'auction');
  assert.equal(g.lastEvent.type, 'auction_restart');
  assert.equal(g.players[0].animals.schwein, 0);
  assert.ok(g.auction.openMoney.b, 'Scheine bleiben offen');
  g = closeAuction(g, 'a', 'sell');
  assert.equal(g.phase, 'auction');
  g = closeAuction(g, 'a', 'sell'); // dritter leerer Durchgang: damit nichts hängt, bekommt der Auktionator es doch
  assert.equal(g.phase, 'turn');
  assert.equal(g.players[0].animals.schwein, 1);
  // ohne „kann nicht zahlen“ bleibt alles wie bisher
  let h = gameWithDeck(['schwein', 'hahn']);
  h = drawForAuction(h, 'a');
  h = closeAuction(h, 'a', 'sell');
  assert.equal(h.phase, 'turn');
});

test('v0.90: Börsen-Chaos – jeder startet mit 1 Pfändung + 1 Einspruch (einstellbar 0–3)', () => {
  const g = createGame({ players: P, seed: 3, settings: { boerse: true } });
  for (const p of g.players) assert.deepEqual(g.hands[p.id], ['pfaendung', 'einspruch']);
  const h = createGame({ players: P, seed: 3, settings: { boerse: true, startHand: { pfaendung: 3, einspruch: 0 } } });
  assert.deepEqual(h.hands[P[0].id], ['pfaendung', 'pfaendung', 'pfaendung']);
  const k = createGame({ players: P, seed: 3, settings: { boerse: true, startHand: { pfaendung: 9, einspruch: -2 } } });
  assert.deepEqual(k.hands[P[0].id], ['pfaendung', 'pfaendung', 'pfaendung']);
  assert.equal(createGame({ players: P, seed: 3 }).hands, undefined);
});

test('v0.91: Kuh-Kiste – Katalog in der App passt zur Datenbank-Liste, Chancen 100 %, Set-Erkennung', async () => {
  const fs = await import('node:fs');
  const O = await import('../js/outfits.js');
  const sql = fs.readdirSync(new URL('../supabase/', import.meta.url)).filter((f) => /^v0\.9\d-kiste|^v0\.91-kuhkiste|^v1\.[\d.]+-kiste/.test(f)).sort().map((f) => fs.readFileSync(new URL(`../supabase/${f}`, import.meta.url), 'utf8')).join('\n');
  const inSql = [...new Set([...sql.matchAll(/\('([a-z:-]+)', '(gewoehnlich|selten|episch|legendaer)'\)/g)].map((m) => `${m[1]}=${m[2]}`))].sort();
  const inApp = Object.entries(O.BOX_ITEMS).filter(([, it]) => !it.forge).map(([id, it]) => `${id}=${it.rarity}`).sort(); // v1.4: Mythisch nur aus der Schmiede
  assert.deepEqual(inSql, inApp);
  assert.equal(Object.values(O.RARITIES).reduce((a, r) => a + r.chance, 0), 100);
  for (const r of Object.keys(O.RARITIES)) assert.ok(O.boxPool(r).length >= 3, `genug ${r}`);
  assert.equal(O.setOf(O.fullOutfit('noergler', {})), 'noergler');
  assert.equal(O.setOf(O.fullOutfit('noergler', { brust: 'brust:disco-kuh' })), null);
  assert.equal(O.setOf(O.fullOutfit('noergler', { ding: 'ding:lasso' })), 'noergler');
  for (const [id, it] of Object.entries(O.BOX_ITEMS)) if (it.slot === 'ding') assert.ok(O.dingArt(id), `Bild für ${id}`);
  for (const [id, it] of Object.entries(O.BOX_ITEMS)) if (it.slot === 'brust' || it.slot === 'beine') assert.ok(O.partArt(id), `Teil ${id}`);
  // v0.92 Saison-Teile: nur_monat in der Datenbank = month in der App
  for (const [id, it] of Object.entries(O.BOX_ITEMS)) if (it.month) assert.match(sql, new RegExp(`set nur_monat = ${it.month} where item_id in \\([^)]*'${id}'`), `Monat für ${id}`);
  for (const [id, it] of Object.entries(O.BOX_ITEMS)) if (it.slot === 'kopf' && !it.head) assert.ok(O.partArt(id)?.helm, `Helm ${id}`);
  for (const s of ['ritter', 'samurai', 'astronaut', 'weihnachtsmann']) assert.equal(O.setOf({ kopf: `kopf:${s}`, brust: `brust:${s}`, beine: `beine:${s}` }), s);
  // v0.93 Sammel-Sets: jedes Set hat Kopf, Brust und Beine in der Kiste
  for (const st of Object.keys(O.BOX_SETS)) { const ps = O.boxSetParts(st); assert.equal(ps.length, 3); for (const p of ps) { assert.equal(O.boxSetOf(p), st); assert.ok(O.BOX_ITEMS[p], `${p} in der Kiste`); } assert.equal(O.setOf({ kopf: ps[0], brust: ps[1], beine: ps[2] }), st); }
  assert.equal(O.boxSetOf('ding:katana'), null); assert.equal(O.boxSetOf('kopf:noergler'), null);
  assert.deepEqual(O.boxSetProgress('ritter', ['kopf:ritter', 'beine:ritter', 'ding:lanze']).have, ['kopf:ritter', 'beine:ritter']);
  { const fs2 = await import('node:fs'); const sm = fs2.readFileSync(new URL('../supabase/v1.0-schmiede.sql', import.meta.url), 'utf8');
    assert.match(sm, /revoke all on function public\.shop_combine\(text, text\) from public, anon/); assert.match(sm, /'gewoehnlich' then 'selten' when 'selten' then 'episch' when 'episch' then 'legendaer'/); }
  { const fs3 = await import('node:fs'); const sq = fs3.readFileSync(new URL('../supabase/v1.1-geschenke-setjackpot.sql', import.meta.url), 'utf8');
    const rows = [...sq.matchAll(/\('([a-z]+)', array\[([^\]]+)\], (null|\d+)\)/g)].map((m) => [m[1], m[2].replace(/'/g, '').split(',')]);
    assert.deepEqual(Object.fromEntries(rows), Object.fromEntries(Object.keys(O.BOX_SETS).map((k) => [k, O.boxSetParts(k)])), 'shop_box_sets = BOX_SETS');
    assert.match(sq, /revoke all on function public\.admin_gift\(uuid, int, int\) from public, anon/); assert.match(sq, /perform public\.require_admin\(\)/); }
  { const fs4 = await import('node:fs'); const sm = fs4.readFileSync(new URL('../supabase/v1.4-kiste-gegenstaende.sql', import.meta.url), 'utf8');
    const myth = (sm.match(/v_mythic text\[\] := array\[([^\]]+)\]/) || [])[1].replace(/'/g, '').split(',').sort();
    assert.deepEqual(myth, Object.entries(O.BOX_ITEMS).filter(([, it]) => it.forge).map(([id]) => id).sort(), 'Mythisch: SQL = App');
    for (const id of myth) { assert.equal(O.BOX_ITEMS[id].rarity, 'mythisch'); assert.ok(O.dingArt(id).length > 50, 'Bild für ' + id); }
    for (const [id, it] of Object.entries(O.BOX_ITEMS)) if (it.slot === 'ding') assert.ok(O.dingArt(id).length > 50, 'Bild für ' + id); }
  assert.ok(sql.includes('since_legend + 1 >= 25') && sql.includes('since_epic + 1 >= 8'), 'Pech-Schutz wie in der App');
});

test('v1.2 Goldrausch: Strähne steigt mit gewonnenen Kuhhandeln, fällt bei Niederlagen, nur Optik', async () => {
  const E = await import('../src/engine.js');
  const st = { players: [{ id: 'a' }, { id: 'b' }], streak: {}, lastEvent: { type: 'x' } };
  assert.equal(E.streakLevel(st, 'a'), 0);
  st.streak.a = 3; assert.equal(E.streakLevel(st, 'a'), 1);
  st.streak.a = 6; assert.equal(E.streakLevel(st, 'a'), 2);
  st.streak.b = 4; assert.equal(E.streakLevel(st, 'b'), 0, 'nur einer gleichzeitig');
  st.streak.b = 7; assert.equal(E.streakLevel(st, 'b'), 2); assert.equal(E.streakLevel(st, 'a'), 0);
  assert.ok(E.STREAK_LV1 < E.STREAK_LV2 && E.STREAK_LV2 <= E.STREAK_MAX);
});
