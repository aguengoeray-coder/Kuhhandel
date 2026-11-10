import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, drawForAuction, bid, closeAuction, pay, startTrade, acceptTrade, counterTrade,
  possibleTrades, scores, viewFor, currentPlayer, GameError, ANIMALS,
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

test('Start: 4 Spieler, je 90 Taler in 7 Karten, 40 Tierkarten', () => {
  const g = createGame({ players: P, seed: 42 });
  assert.equal(g.deck.length, 40);
  for (const p of g.players) {
    assert.equal(p.money.length, 7);
    assert.equal(total(p.money), 90);
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
  assert.equal(total(g.players[2].money), 40);
  assert.equal(total(g.players[0].money), aBefore + 50);
  assert.equal(g.players[2].animals.kuh, 1);
  assert.equal(currentPlayer(g).id, 'b');
});

test('Vorkaufsrecht: Auktionator kauft selbst und zahlt den Höchstbietenden', () => {
  let g = gameWithDeck(['pferd', 'hahn']);
  g = drawForAuction(g, 'a');
  g = bid(g, 'b', 40);
  g = closeAuction(g, 'a', 'buy');
  const alp = g.players[0];
  g = pay(g, 'a', [alp.money.indexOf(50)]);
  assert.equal(g.players[0].animals.pferd, 1);
  assert.equal(total(g.players[1].money), 140);
});

test('Zahlungsunfähig: Karten offen, Neustart, höchstens altes Gebot minus 10', () => {
  let g = gameWithDeck(['schwein', 'hahn']);
  g = drawForAuction(g, 'a');
  g = bid(g, 'b', 200); // hat nur 90
  g = closeAuction(g, 'a', 'sell');
  assert.equal(g.phase, 'auction');
  assert.equal(g.lastEvent.type, 'cant_pay');
  assert.deepEqual(g.lastEvent.revealed, [0, 0, 10, 10, 10, 10, 50]);
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
  assert.equal(total(g.players[1].money), 140);
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
  assert.equal(total(g.players[0].money), 90 - 20 + 50);
  assert.equal(total(g.players[1].money), 90 - 50 + 20);
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
function botStep(g, rand) {
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  if (g.phase === 'turn') {
    const me = currentPlayer(g);
    const trades = possibleTrades(g, me.id);
    if (g.deck.length > 0 && (trades.length === 0 || rand() < 0.7)) return drawForAuction(g, me.id);
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

test('200 zufällige Komplettspiele enden mit allen Quartetten und konstanter Kartenzahl', () => {
  for (let seed = 1; seed <= 200; seed++) {
    let g = createGame({ players: P.slice(0, 3 + (seed % 2)), seed });
    let r = seed * 7919;
    const rand = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    let steps = 0;
    while (g.phase !== 'ended') {
      g = botStep(g, rand);
      if (++steps > 20000) throw new Error('Spiel endet nicht (Seed ' + seed + ')');
    }
    for (const a of ANIMALS) {
      const owners = g.players.filter((p) => p.animals[a.id] > 0);
      assert.equal(owners.length, 1, `${a.id} nicht vollständig (Seed ${seed})`);
      assert.equal(owners[0].animals[a.id], 4);
    }
    assert.ok(g.winner.length >= 1);
  }
});
