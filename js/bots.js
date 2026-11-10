// Test-Spieler für den Debug-Modus: spielen zufällig, aber halbwegs sinnvoll
import {
  ANIMAL_BY_ID, possibleTrades, drawForAuction, bid, passAuction, closeAuction,
  pay, startTrade, acceptTrade, counterTrade,
} from '../src/engine.js';

const sum = (a) => a.reduce((x, y) => x + y, 0);
const pick = (arr, rand) => arr[Math.floor(rand() * arr.length)];
const randomCards = (money, n, rand) => {
  const idx = money.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx.slice(0, Math.min(n, money.length));
};

// Gibt den nächsten Spielzug eines Test-Spielers zurück – oder null, wenn gerade kein Test-Spieler dran ist
export function botStep(s, bots, now, rand = Math.random) {
  const isBot = (id) => bots.includes(id);
  const P = (id) => s.players.find((p) => p.id === id);

  if (s.phase === 'turn') {
    const cur = s.players[s.turn];
    if (!isBot(cur.id)) return null;
    const trades = possibleTrades(s, cur.id);
    if (s.deck.length > 0 && (trades.length === 0 || rand() < 0.75)) return drawForAuction(s, cur.id, now);
    if (!trades.length) return null;
    const t = pick(trades, rand);
    return startTrade(s, cur.id, t.target, t.animal, randomCards(cur.money, 1 + Math.floor(rand() * 3), rand));
  }

  if (s.phase === 'auction') {
    const a = s.auction;
    const running = a.endsAt != null && now < a.endsAt;
    if (running) {
      const high = a.high ? a.high.amount : 0;
      const candidates = s.players.filter((p) => isBot(p.id) && p.id !== a.auctioneer && !a.passed.includes(p.id) && (!a.high || a.high.player !== p.id));
      if (!candidates.length || rand() > 0.45) return null; // nicht jede Runde reagieren
      const p = pick(candidates, rand);
      const worth = ANIMAL_BY_ID[a.animal].value * 0.5 + 40;
      const limit = Math.min(worth, sum(p.money) + (rand() < 0.15 ? 60 : 0)); // ab und zu bluffen
      const amt = high + pick([10, 10, 20, 50], rand);
      const cap = a.caps[p.id];
      if (amt <= limit && (cap == null || amt <= cap)) return bid(s, p.id, amt, now);
      return passAuction(s, p.id, now);
    }
    if (!isBot(a.auctioneer)) return null;
    const me = P(a.auctioneer);
    const canBuy = a.high && sum(me.money) >= a.high.amount;
    return closeAuction(s, a.auctioneer, canBuy && rand() < 0.3 ? 'buy' : 'sell', now);
  }

  if (s.phase === 'payment') {
    const pm = s.payment;
    if (!isBot(pm.payer)) return null;
    const p = P(pm.payer);
    const order = p.money.map((v, i) => [v, i]).sort((x, y) => y[0] - x[0]);
    const idx = [];
    let total = 0;
    for (const [v, i] of order) { if (total >= pm.amount) break; idx.push(i); total += v; }
    return pay(s, p.id, idx);
  }

  if (s.phase === 'trade') {
    const t = s.trade;
    if (!isBot(t.target)) return null;
    const p = P(t.target);
    if (rand() < 0.35 || p.money.length === 0) return acceptTrade(s, p.id);
    return counterTrade(s, p.id, randomCards(p.money, 1 + Math.floor(rand() * 3), rand));
  }
  return null;
}

// Wer muss gerade etwas tun? (für den automatischen Sichtwechsel)
export function whoMustAct(s, now) {
  if (s.phase === 'turn') return s.players[s.turn].id;
  if (s.phase === 'payment') return s.payment.payer;
  if (s.phase === 'trade') return s.trade.target;
  if (s.phase === 'auction') {
    const running = s.auction.endsAt != null && now < s.auction.endsAt;
    return running ? null : s.auction.auctioneer;
  }
  return null;
}
