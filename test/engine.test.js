import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, drawForAuction, bid, closeAuction, pay, startTrade, acceptTrade, counterTrade,
  possibleTrades, scores, viewFor, currentPlayer, GameError, ANIMALS, passAuction,
  AUCTION_START_MS, AUCTION_BID_MS, bestPay,
  RAT, ratLay, ratTake, ratCurrent, buzz, rpsPick, specialDecide, specialStage, specialNumber,
  chooseBlock, scoreFor, SPECIAL_DELAY_MS, moneyDeckFrom, awards,
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
  assert.equal(g.auction.endsAt, t0 + AUCTION_START_MS);
  assert.throws(() => closeAuction(g, 'a', 'sell', t0 + 1000), GameError); // läuft noch
  g = bid(g, 'b', 20, t0 + 9000);
  assert.equal(g.auction.endsAt, t0 + 9000 + AUCTION_BID_MS);
  assert.throws(() => closeAuction(g, 'a', 'buy', t0 + 12000), GameError);
  assert.throws(() => bid(g, 'c', 30, t0 + 9000 + AUCTION_BID_MS + 2000), GameError); // zu spät
  g = passAuction(g, 'c', t0 + 10000);
  g = passAuction(g, 'd', t0 + 11000); // alle außer Höchstbietendem gepasst
  assert.equal(g.auction.endsAt, t0 + 11000);
  g = closeAuction(g, 'a', 'buy', t0 + 11000); // Auktionator kauft zum Höchstgebot
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
    return chooseBlock(g, p.id, ANIMALS.find((a) => p.animals[a.id] === 4).id);
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
const at = (n) => SPECIAL_DELAY_MS + (10 - n) * 1000 + 100; // Zeitpunkt, an dem der Countdown n zeigt

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
  const at2 = (n) => t + SPECIAL_DELAY_MS + (10 - n) * 1000 + 100;
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
  assert.deepEqual(g.lastEvent, { type: 'money_drawn', player: 'a', value: 200 });
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
