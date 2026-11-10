// Beispiel-Spielstände für Screenshots (?demo=turn, auction, …). Im echten Spiel nicht benutzt.
import {
  createGame, drawForAuction, bid, closeAuction, startTrade, ANIMALS,
} from '../src/engine.js';

const PLAYERS = [
  { id: 'u1', name: 'Alp' },
  { id: 'u2', name: 'Nico' },
  { id: 'u3', name: 'Lea' },
  { id: 'u4', name: 'Mo' },
];

function base() {
  const g = createGame({ players: PLAYERS, seed: 7 });
  const set = (i, obj) => Object.assign(g.players[i].animals, obj);
  set(0, { hund: 2, kuh: 1, ziege: 1, katze: 2 });
  set(1, { kuh: 1, pferd: 2, katze: 1, hund: 1 });
  set(2, { schaf: 3, kuh: 2 });
  set(3, { gans: 2, schwein: 1, ziege: 2, hahn: 4 });
  g.deck = g.deck.slice(0, 23);
  g.donkeysDrawn = 1;
  g.players[0].money = [0, 0, 10, 10, 10, 50, 50];
  g.log.push('Mo ersteigert Gans für 30.', 'Lea nimmt den Kuhhandel an. Nico bekommt 1× Hund.');
  return g;
}

export function buildDemoState(kind, local) {
  let g;
  switch (kind) {
    case 'turn':
      return base();
    case 'auction': {
      const t = Date.now() - 2500;
      g = base(); g.turn = 1; g.deck[0] = 'esel';
      g = drawForAuction(g, 'u2', t);
      g = bid(g, 'u4', 60, t); g = bid(g, 'u1', 100, t); g = bid(g, 'u3', 120, t);
      return g;
    }
    case 'auctionrun': {
      const t = Date.now() - 2000;
      g = base(); g.deck[0] = 'pferd';
      g = drawForAuction(g, 'u1', t);
      g = bid(g, 'u3', 90, t); g = bid(g, 'u2', 130, t);
      return g;
    }
    case 'auctioneer': {
      const t = Date.now() - 30000;
      g = base(); g.deck[0] = 'pferd';
      g = drawForAuction(g, 'u1', t);
      g = bid(g, 'u3', 90, t + 1000); g = bid(g, 'u2', 130, t + 2000);
      return g;
    }
    case 'bidderover': {
      const t = Date.now() - 30000;
      g = base(); g.turn = 1; g.deck[0] = 'kuh';
      g = drawForAuction(g, 'u2', t);
      g = bid(g, 'u1', 100, t + 1000); g = bid(g, 'u3', 120, t + 2000);
      return g;
    }
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
      g = drawForAuction(g, 'u2', t);
      g = bid(g, 'u4', 200, t + 1000);
      g = closeAuction(g, 'u2', 'sell', t + 20500);
      return g;
    }
    case 'tradesetup':
      g = base();
      local.key = `${g.phase}|${g.turn}|${g.log.length}`;
      local.tradeOpen = true; local.tradeTarget = 'u3'; local.tradeAnimal = 'kuh'; local.sel = [2, 3, 5];
      return g;
    case 'traderespond':
      g = base(); g.turn = 1;
      g = startTrade(g, 'u2', 'u1', 'hund', [0, 2, 6]);
      local.key = `${g.phase}|${g.turn}|${g.log.length}`; local.sel = [5];
      return g;
    case 'ended': {
      g = createGame({ players: PLAYERS, seed: 7 });
      const owner = { hahn: 3, gans: 3, katze: 0, hund: 0, schaf: 2, ziege: 3, esel: 1, schwein: 3, kuh: 2, pferd: 1 };
      for (const a of ANIMALS) g.players[owner[a.id]].animals[a.id] = 4;
      g.deck = [];
      g.phase = 'ended';
      g.winner = ['u4'];
      return g;
    }
    default:
      return null;
  }
}
