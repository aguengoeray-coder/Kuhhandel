// Kuhhandel – Startseite, Lobby und Warteraum
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { createGame, MIN_PLAYERS, MAX_PLAYERS, GameError, DONKEY_PAYOUTS } from '../src/engine.js';
import { renderGame, SEAT_COLORS, fitStage } from './game.js';
import { buildDemoState } from './demo.js';
import { botStep, whoMustAct } from './bots.js';
import { debugChips, debugPanel } from './debug.js';

export const APP_VERSION = '0.6.1';
const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
const DEMO = params.get('demo'); // nur für Screenshots: ?demo=start oder ?demo=room

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* egal */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* egal */ } },
};

// Debug-Modus: ?debug=1 schaltet ihn auf diesem Gerät ein, ?debug=0 wieder aus
if (params.get('debug') === '1') store.set('kh_debug', '1');
if (params.get('debug') === '0') store.del('kh_debug');
const DEBUG = store.get('kh_debug') === '1';
const dbg = { panel: false, viewAs: null, autoView: true, bots: false, fast: false, errors: [], lastSync: null, reportText: '' };
const logError = (msg) => { dbg.errors.push(`${new Date().toISOString()} ${msg}`); if (dbg.errors.length > 30) dbg.errors.shift(); };
window.addEventListener('error', (e) => logError(`Fehler: ${e.message} (${e.filename}:${e.lineno})`));
window.addEventListener('unhandledrejection', (e) => logError(`Fehler: ${e.reason?.message || e.reason}`));

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initial = (name) => esc((name || '?').trim().charAt(0).toUpperCase());

let sb = null;
let me = { id: null, name: store.get('kh_name') || '' };
let ui = { screen: 'start', editingName: !store.get('kh_name'), games: [], game: null, error: '' };
let lobbyChannel = null;
let roomChannel = null;

// ---------- Darstellung ----------

function render() {
  app.classList.toggle('playing', ui.screen === 'playing');
  if (ui.screen !== 'playing') app.onclick = null;
  if (ui.screen === 'room' && ui.game) return renderRoom();
  if (ui.screen === 'playing' && ui.game) return renderPlaying();
  renderStart();
}

function renderStart() {
  const nameBlock = ui.editingName
    ? `<form class="name-row" id="name-form">
         <input id="name-input" name="name" maxlength="16" autocomplete="nickname" placeholder="z. B. Alp" value="${esc(me.name)}" required>
         <button class="pill pill-red pill-small" type="submit">Los</button>
       </form>`
    : `<div class="me-line"><strong>${esc(me.name)}</strong><button class="linklike" type="button" id="edit-name">Name ändern</button></div>`;

  const resume = (ui.myGames || []).map((g) => `<li class="game-row resume">
      <div class="host">Laufendes Spiel<small>${g.players.map((p) => esc(p.name)).join(' · ')}</small></div>
      <button class="pill pill-red pill-small" type="button" data-resume="${esc(g.id)}">Weiter spielen</button>
    </li>`).join('');

  const testRow = DEBUG ? `<li class="game-row test">
      <div class="host">Testspiel<small>Nur auf diesem Gerät · Debug-Modus</small></div>
      <button class="pill pill-white pill-small" type="button" data-test="3">3 Spieler</button>
      <button class="pill pill-red pill-small" type="button" data-test="4">4 Spieler</button>
    </li>` : '';

  const list = ui.games.length
    ? ui.games.map((g) => {
        const host = g.players[0]?.name || 'Unbekannt';
        const n = g.players.length;
        const dots = Array.from({ length: MAX_PLAYERS }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
        const full = n >= MAX_PLAYERS;
        return `<li class="game-row">
          <div class="host">Spiel von ${esc(host)}<small>${n} von ${MAX_PLAYERS} Spielern · Code ${esc(g.code)}</small></div>
          <div class="seats-mini" aria-hidden="true">${dots}</div>
          <button class="pill pill-red pill-small" type="button" data-join="${esc(g.id)}" ${full || !me.name ? 'disabled' : ''}>${full ? 'Voll' : 'Beitreten'}</button>
        </li>`;
      }).join('')
    : `<li class="empty">Gerade ist kein Spiel offen.<br>Erstelle eins und lade deine Freunde ein.</li>`;

  app.innerHTML = `
    <section class="start">
      <div class="brand">
        <h1 class="logo">Kuh<br>handel<span>.</span></h1>
        <p class="claim">Das Kartenspiel – online mit Freunden</p>
        <div class="card name-box">
          <label for="name-input">${ui.editingName ? 'Wie heißt du?' : 'Du spielst als'}</label>
          ${nameBlock}
        </div>
      </div>
      <div class="card games">
        <div class="games-head">
          <h2>Offene Spiele</h2>
          <button class="pill pill-red pill-small" type="button" id="create" ${me.name ? '' : 'disabled'}>Spiel erstellen</button>
        </div>
        ${ui.error ? `<div class="error" role="alert">${esc(ui.error)}</div>` : ''}
        <ul class="games-list">${testRow}${resume}${list}</ul>
      </div>
    </section>`;

  const form = document.getElementById('name-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = document.getElementById('name-input').value.trim().slice(0, 16);
      if (!v) return;
      me.name = v;
      store.set('kh_name', v);
      ui.editingName = false;
      render();
    });
  }
  document.getElementById('edit-name')?.addEventListener('click', () => { ui.editingName = true; render(); document.getElementById('name-input')?.focus(); });
  document.getElementById('create')?.addEventListener('click', onCreate);
  app.querySelectorAll('[data-join]').forEach((b) => b.addEventListener('click', () => onJoin(b.dataset.join)));
  app.querySelectorAll('[data-test]').forEach((b) => b.addEventListener('click', () => startLocalGame(Number(b.dataset.test))));
  app.querySelectorAll('[data-resume]').forEach((b) => b.addEventListener('click', async () => {
    const { data } = await sb.from('games').select('*').eq('id', b.dataset.resume).maybeSingle();
    if (data) enterRoom(data); else { await loadGames(); render(); }
  }));
}

function renderRoom() {
  const g = ui.game;
  const isHost = g.host === me.id;
  const seats = Array.from({ length: MAX_PLAYERS }, (_, i) => {
    const p = g.players[i];
    if (!p) {
      return `<div class="seat empty-seat"><div class="avatar" aria-hidden="true">+</div><div class="ribbon">Frei</div></div>`;
    }
    const you = p.id === me.id ? ' (du)' : '';
    return `<div class="seat" style="--c:${SEAT_COLORS[i]}">
      <div class="avatar" aria-hidden="true">${initial(p.name)}</div>
      <div class="ribbon">${esc(p.name)}${you}</div>
      ${i === 0 ? '<span class="host-badge">Gastgeber</span>' : ''}
    </div>`;
  }).join('');
  const enough = g.players.length >= MIN_PLAYERS;
  const hint = isHost
    ? (enough ? 'Alle da? Dann los!' : `Warte auf Mitspieler – mindestens ${MIN_PLAYERS} nötig.`)
    : `Warte, bis ${esc(g.players[0]?.name || 'der Gastgeber')} das Spiel startet.`;

  app.innerHTML = `
    <section class="room">
      <div class="room-top">
        <h1 class="room-title">Warteraum</h1>
        <span class="code-chip">Spiel-Code <b>${esc(g.code)}</b></span>
      </div>
      <div class="table" aria-label="Plätze am Tisch">${seats}</div>
      ${ui.error ? `<div class="error" role="alert">${esc(ui.error)}</div>` : ''}
      <div class="room-actions">
        <button class="pill pill-white pill-small" type="button" id="leave">Verlassen</button>
        ${isHost ? `<button class="pill pill-red" type="button" id="start" ${enough ? '' : 'disabled'}>SPIEL STARTEN</button>` : ''}
        <span class="room-hint">${hint}</span>
      </div>
    </section>`;
  document.getElementById('leave').addEventListener('click', onLeave);
  document.getElementById('start')?.addEventListener('click', onStart);
}

// ---------- Spieltisch ----------

const gameLocal = {}; // Auswahl auf dem eigenen Gerät (Karten, Kuhhandel-Entwurf …)
let toastMsg = '';
let online = null;      // wer gerade verbunden ist (Set von Spieler-IDs)
let offlineSince = {};  // Spieler-ID → seit wann nicht mehr verbunden
let clockOffset = 0;    // Abstand der eigenen Uhr zur Server-Uhr in ms
const now = () => Date.now() + clockOffset + (DEMO ? demoClock : 0);
let demoClock = 0;      // nur Demo: Uhr vor-/zurückstellen
let toastTimer = null;
let busy = false;

function toast(msg) {
  toastMsg = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMsg = ''; render(); }, 3500);
  render();
}

function renderPlaying() {
  const local = !!ui.game.local;
  if (local) {
    // Testspiel: automatisch zu dem wechseln, der gerade handeln muss
    if (dbg.autoView && !dbg.bots) {
      const who = whoMustAct(ui.game.state, now());
      if (who && who !== dbg.viewAs) { dbg.viewAs = who; gameLocal.sel = []; gameLocal.tradeOpen = false; }
    }
  } else {
    checkSignal();
  }
  renderGame(app, {
    state: ui.game.state,
    meId: local ? dbg.viewAs : me.id,
    local: gameLocal,
    toastMsg,
    rerender: render,
    act,
    now,
    sound: soundOn(),
    toggleSound: () => { store.set('kh_sound', soundOn() ? 'off' : 'on'); render(); },
    online: local ? null : onlineForDisplay(),
    onExit: () => { if (!ui.game?.local) store.del('kh_game'); gameLocal.menu = false; if (roomChannel && sb) { sb.removeChannel(roomChannel); roomChannel = null; } openStart(); },
  });
  if (DEBUG) injectDebug();
}

// Spielzug ausführen: Regeln lokal prüfen, dann neuen Stand speichern (nur wenn niemand schneller war)
async function act(fn) {
  if (busy) return;
  let next;
  try {
    next = fn(ui.game.state);
  } catch (e) {
    if (e instanceof GameError) { logError(`Regel: ${e.message}`); return toast(e.message); }
    logError(`Absturz: ${e.message}`);
    throw e;
  }
  if (DEMO || ui.game.local) return applyLocal(next);
  busy = true;
  const g = ui.game;
  const { data, error } = await sb.from('games')
    .update({ state: next, status: next.phase === 'ended' ? 'ended' : 'playing', version: g.version + 1, updated_at: new Date().toISOString() })
    .eq('id', g.id).eq('version', g.version)
    .select();
  busy = false;
  if (error) { logError(`Speichern: ${error.message}`); return toast('Verbindung hakt – bitte nochmal versuchen.'); }
  if (!data || data.length === 0) {
    const fresh = await sb.from('games').select('*').eq('id', g.id).single();
    if (fresh.data) ui.game = fresh.data;
    return toast('Jemand war schneller – schau nochmal hin.');
  }
  ui.game = data[0];
  render();
}

// ---------- Signal, wenn man gefragt ist (Ton + Vibration) ----------

const soundOn = () => store.get('kh_sound') !== 'off';
let audioCtx = null;
let lastNeed = '';
const baseTitle = document.title;

// Browser erlauben Ton erst nach einer Berührung – beim ersten Tippen freischalten
document.addEventListener('pointerdown', () => {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch { /* kein Ton möglich */ }
}, { passive: true });

function beep() {
  if (!soundOn()) return;
  try { navigator.vibrate?.([120, 70, 120]); } catch { /* egal */ }
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  [[660, 0], [880, 0.14]].forEach(([f, d]) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = f;
    o.type = 'triangle';
    g.gain.setValueAtTime(0.0001, t + d);
    g.gain.exponentialRampToValueAtTime(0.25, t + d + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.18);
    o.connect(g).connect(audioCtx.destination);
    o.start(t + d);
    o.stop(t + d + 0.2);
  });
}

// Prüft bei jedem Neuzeichnen, ob man neu gefragt ist: dran, herausgefordert oder muss zahlen
function checkSignal() {
  const s = ui.game?.state;
  if (!s || DEMO) return;
  let need = '';
  if (s.phase === 'turn' && s.players[s.turn]?.id === me.id) need = 'turn';
  else if (s.phase === 'payment' && s.payment?.payer === me.id) need = 'pay';
  else if (s.phase === 'trade' && s.trade?.target === me.id) need = 'trade';
  const key = need ? `${need}|${s.log.length}` : '';
  if (key && key !== lastNeed) beep();
  lastNeed = key;
  document.title = need ? '● Du bist dran – Kuhhandel' : baseTitle;
}

// ---------- Countdown der Versteigerung ticken lassen ----------

setInterval(() => {
  if (ui.screen !== 'playing') return;
  const el = app.querySelector('[data-ends]');
  if (!el) return;
  const t = now();
  const ends = Number(el.dataset.ends);
  const left = ends - t;
  if (left <= 0) {
    if (!el.classList.contains('over')) render(); // Zeit gerade abgelaufen: Knöpfe umschalten
    return;
  }
  const bar = el.querySelector('i');
  const txt = el.querySelector('span');
  if (bar) bar.style.width = `${Math.min(100, (left / Number(el.dataset.total)) * 100)}%`;
  if (txt) txt.textContent = `noch ${Math.ceil(left / 1000)} s`;
}, 200);

// ---------- Debug-Modus ----------

function startLocalGame(n) {
  const players = [{ id: 'me', name: me.name || 'Ich' }, ...Array.from({ length: n - 1 }, (_, i) => ({ id: `t${i + 1}`, name: `Test ${i + 1}` }))];
  const state = createGame({ players, seed: Math.floor(Math.random() * 2 ** 31) });
  Object.keys(gameLocal).forEach((k) => delete gameLocal[k]);
  dbg.viewAs = 'me';
  ui.game = { id: 'local', local: true, version: 0, status: 'playing', players, state };
  ui.screen = 'playing';
  render();
}

function applyLocal(next) {
  if (dbg.fast && next.phase === 'auction' && next.auction.endsAt != null) {
    next.auction.endsAt = Math.min(next.auction.endsAt, now() + 5000);
  }
  ui.game = { ...ui.game, state: next, version: (ui.game.version || 0) + 1, status: next.phase === 'ended' ? 'ended' : 'playing' };
  render();
}

// Test-Spieler spielen automatisch
setInterval(() => {
  if (!DEBUG || !dbg.bots || ui.screen !== 'playing' || !ui.game?.local) return;
  const s = ui.game.state;
  if (s.phase === 'ended') return;
  const bots = s.players.map((p) => p.id).filter((id) => id !== 'me');
  try {
    const next = botStep(s, bots, now());
    if (next) applyLocal(next);
  } catch (e) {
    logError(`Test-Spieler: ${e.message}`);
  }
}, 700);

function debugInfo() {
  const g = ui.game;
  const s = g?.state;
  const nameOf = (id) => s?.players.find((p) => p.id === id)?.name || '–';
  return {
    local: !!g?.local,
    version: APP_VERSION,
    gameId: g?.id,
    channel: g?.local ? '–' : (roomChannel ? roomChannel.state : 'keine'),
    lastSync: dbg.lastSync ? `vor ${Math.round((Date.now() - dbg.lastSync) / 1000)} s` : '–',
    clockOffset,
    gameVersion: g?.version ?? '–',
    phase: s?.phase || '–',
    turnName: s ? s.players[s.turn]?.name : '–',
    online: online ? [...online].map(nameOf).join(', ') || 'niemand' : '–',
    errors: dbg.errors,
    players: s?.players || [],
    viewAs: dbg.viewAs,
    viewName: nameOf(dbg.viewAs),
    autoView: dbg.autoView,
    bots: dbg.bots,
    fast: dbg.fast,
    reportText: dbg.reportText,
  };
}

function injectDebug() {
  const stage = document.getElementById('stage');
  if (!stage) return;
  const d = debugInfo();
  stage.insertAdjacentHTML('beforeend', debugChips(d) + (dbg.panel ? debugPanel(d) : ''));
}

function buildReport() {
  return JSON.stringify({
    version: APP_VERSION,
    zeit: new Date().toISOString(),
    geraet: navigator.userAgent,
    ich: { id: me.id, name: me.name },
    info: (({ players, reportText, ...rest }) => rest)(debugInfo()),
    spiel: ui.game ? { id: ui.game.id, version: ui.game.version, status: ui.game.status, state: ui.game.state } : null,
  }, null, 1);
}

function debugShortcut(kind) {
  const s = JSON.parse(JSON.stringify(ui.game.state));
  if (kind === 'forward') {
    if (s.phase !== 'turn') return toast('Vorspulen geht nur, wenn gerade niemand versteigert oder handelt.');
    while (s.deck.length > 2) {
      const card = s.deck.shift();
      if (card === 'esel' && s.donkeysDrawn < 4) {
        const payout = DONKEY_PAYOUTS[s.donkeysDrawn++];
        s.players.forEach((p) => { p.money.push(payout); p.money.sort((a, b) => a - b); });
      }
      s.players[Math.floor(Math.random() * s.players.length)].animals[card] += 1;
    }
    s.log.push('Debug: vorgespult.');
  } else if (kind === 'donkey') {
    const i = s.deck.indexOf('esel');
    if (i < 0) return toast('Kein Esel mehr im Stapel.');
    s.deck.splice(i, 1);
    s.deck.unshift('esel');
    s.log.push('Debug: Esel liegt oben.');
  } else if (kind === 'broke') {
    s.players.find((p) => p.id === dbg.viewAs).money = [0, 10];
    s.log.push('Debug: Geld geleert.');
  }
  applyLocal(s);
}

app.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-dbg]');
  if (!b || !DEBUG) return;
  e.stopPropagation();
  const k = b.dataset.dbg;
  const players = ui.game?.state?.players || [];
  if (k === 'panel') { dbg.panel = !dbg.panel; dbg.reportText = ''; }
  else if (k === 'cycleView') { const i = players.findIndex((p) => p.id === dbg.viewAs); dbg.viewAs = players[(i + 1) % players.length].id; dbg.autoView = false; gameLocal.sel = []; gameLocal.tradeOpen = false; }
  else if (k === 'view') { dbg.viewAs = b.dataset.v; dbg.autoView = false; gameLocal.sel = []; gameLocal.tradeOpen = false; }
  else if (k === 'autoView') dbg.autoView = !dbg.autoView;
  else if (k === 'bots') { dbg.bots = !dbg.bots; if (dbg.bots) { dbg.viewAs = 'me'; dbg.autoView = false; } }
  else if (k === 'fast') dbg.fast = !dbg.fast;
  else if (k === 'reload') { await resync(); }
  else if (k === 'forward' || k === 'donkey' || k === 'broke') { dbg.panel = false; return debugShortcut(k); }
  else if (k === 'report') {
    const text = buildReport();
    try { await navigator.clipboard.writeText(text); dbg.reportText = ''; toast('Fehlerbericht kopiert – einfach an Claude schicken.'); return; }
    catch { dbg.reportText = text; }
  }
  render();
}, true);

// ---------- Supabase ----------

async function connect() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
  sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  let { data: { session } } = await sb.auth.getSession();
  if (!session) {
    const { data, error } = await sb.auth.signInAnonymously();
    if (error) throw error;
    session = data.session;
  }
  me.id = session.user.id;
  await syncClock();
  setInterval(syncClock, 60000);
}

// Gemeinsame Uhr: Abstand zur Server-Uhr messen, damit der Countdown auf allen Geräten gleich läuft
async function syncClock() {
  try {
    const t0 = Date.now();
    const { data, error } = await sb.rpc('server_now');
    const t1 = Date.now();
    if (error || !data) return; // Funktion fehlt: dann eigene Uhr benutzen
    clockOffset = Date.parse(data) + (t1 - t0) / 2 - t1;
  } catch { /* egal, eigene Uhr */ }
}

async function loadGames() {
  const since = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(); // nur Spiele der letzten 3 Stunden
  const { data, error } = await sb.from('games')
    .select('id, code, host, status, players, created_at')
    .eq('status', 'lobby').gte('created_at', since)
    .order('created_at', { ascending: false }).limit(30);
  if (error) { ui.error = 'Spiele konnten nicht geladen werden.'; return; }
  ui.games = data;
  // Laufende Spiele, in denen ich sitze (z. B. nach „Spiel verlassen“ oder Handywechsel)
  const recent = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const mine = await sb.from('games')
    .select('id, code, host, status, players, updated_at')
    .eq('status', 'playing').gte('updated_at', recent)
    .contains('players', [{ id: me.id }])
    .order('updated_at', { ascending: false }).limit(5);
  ui.myGames = mine.data || [];
}

function watchLobby() {
  if (lobbyChannel) return;
  lobbyChannel = sb.channel('lobby')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, async () => {
      if (ui.screen !== 'start') return;
      await loadGames();
      render();
    })
    .subscribe();
}

function watchRoom(id) {
  if (roomChannel) sb.removeChannel(roomChannel);
  roomChannel = sb.channel('game-' + id, { config: { presence: { key: me.id } } })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${id}` }, (payload) => {
      if (payload.eventType === 'DELETE') {
        // Supabase meldet Löschungen ALLER Spiele – nur reagieren, wenn wirklich unser Spiel weg ist
        if (payload.old?.id !== id) return;
        store.del('kh_game');
        ui.error = 'Der Gastgeber hat das Spiel geschlossen.';
        openStart();
        return;
      }
      dbg.lastSync = Date.now();
      showGame(payload.new);
    })
    .on('presence', { event: 'sync' }, () => {
      online = new Set(Object.keys(roomChannel.presenceState()));
      const t = Date.now();
      for (const p of ui.game?.players || []) {
        if (online.has(p.id)) delete offlineSince[p.id];
        else if (!offlineSince[p.id]) offlineSince[p.id] = t;
      }
      if (ui.screen === 'playing' || ui.screen === 'room') render();
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') roomChannel.track({ name: me.name });
      // Verbindung weg (z. B. Handy im Standby): Stand neu laden und neu verbinden
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') scheduleResync();
    });
}

// Erst nach 15 Sekunden ohne Verbindung als „offline“ anzeigen (kurze Aussetzer ignorieren)
function onlineForDisplay() {
  if (!online || !ui.game) return null;
  const t = Date.now();
  return new Set(ui.game.players.map((p) => p.id).filter((id) => !(offlineSince[id] && t - offlineSince[id] > 15000)));
}

// ---------- Verbindung: nach Standby / Netzwechsel neu abgleichen ----------

let resyncTimer = null;
function scheduleResync() {
  clearTimeout(resyncTimer);
  resyncTimer = setTimeout(resync, 1500);
}

async function resync() {
  if (!sb || DEMO || ui.game?.local) return;
  const id = ui.game?.id || store.get('kh_game');
  if (ui.screen === 'start' || !id) { await loadGames(); return render(); }
  const { data, error } = await sb.from('games').select('*').eq('id', id).maybeSingle();
  if (error) { logError(`Abgleich: ${error.message}`); return scheduleResync(); } // keine Verbindung: später nochmal versuchen, NICHT rauswerfen
  if (!data) { store.del('kh_game'); return openStart(); }
  dbg.lastSync = Date.now();
  const changed = !ui.game || ui.game.id !== data.id || ui.game.version !== data.version || ui.game.status !== data.status;
  if (changed && !busy) { ui.game = null; showGame(data); } else if (ui.screen === 'playing') render(); // Offline-Anzeige aktualisieren
  if (!roomChannel || roomChannel.state === 'closed' || roomChannel.state === 'errored') watchRoom(id);
}

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') resync(); });
window.addEventListener('online', resync);
// Sicherheitsnetz: im Warteraum und im Spiel alle 3 Sekunden abgleichen, auch wenn die Live-Verbindung hakt
setInterval(() => { if ((ui.screen === 'playing' || ui.screen === 'room') && document.visibilityState === 'visible') resync(); }, 3000);

function showGame(g) {
  if (ui.game && ui.game.id === g.id && g.version < ui.game.version) return; // veraltete Meldung
  ui.game = g;
  ui.screen = g.status === 'lobby' ? 'room' : 'playing';
  render();
}

const randomCode = () => Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('');

async function onCreate() {
  ui.error = '';
  const { data, error } = await sb.from('games')
    .insert({ code: randomCode(), host: me.id, players: [{ id: me.id, name: me.name }] })
    .select().single();
  if (error) { ui.error = 'Spiel konnte nicht erstellt werden.'; return render(); }
  enterRoom(data);
}

async function onJoin(id) {
  ui.error = '';
  const { data, error } = await sb.rpc('join_game', { p_game: id, p_name: me.name });
  if (error) { ui.error = error.message || 'Beitreten hat nicht geklappt.'; await loadGames(); return render(); }
  enterRoom(data);
}

function enterRoom(g) {
  store.set('kh_game', g.id);
  watchRoom(g.id);
  showGame(g);
}

async function onLeave() {
  const id = ui.game.id;
  store.del('kh_game');
  if (roomChannel) { sb.removeChannel(roomChannel); roomChannel = null; }
  await sb.rpc('leave_game', { p_game: id });
  openStart();
}

async function onStart() {
  const g = ui.game;
  ui.error = '';
  const state = createGame({ players: g.players.map((p) => ({ id: p.id, name: p.name })), seed: Math.floor(Math.random() * 2 ** 31) });
  const { data, error } = await sb.from('games')
    .update({ status: 'playing', state, version: g.version + 1, updated_at: new Date().toISOString() })
    .eq('id', g.id).eq('version', g.version)
    .select().single();
  if (error) { ui.error = 'Start hat nicht geklappt – bitte nochmal versuchen.'; return render(); }
  showGame(data);
}

async function openStart() {
  ui.screen = 'start';
  ui.game = null;
  await loadGames();
  render();
}

// ---------- Demo für Screenshots ----------

function demo(kind) {
  if (kind === 'testspiel') { me = { id: 'u1', name: 'Alp' }; return startLocalGame(4); }
  me = { id: 'u1', name: 'Alp' };
  ui.editingName = kind === 'name';
  if (kind === 'name') me.name = '';
  ui.games = [
    { id: 'g1', code: 'KUHX', host: 'u2', players: [{ id: 'u2', name: 'Nico' }, { id: 'u3', name: 'Lea' }] },
    { id: 'g2', code: 'MUHH', host: 'u4', players: [{ id: 'u4', name: 'Jana' }] },
    { id: 'g3', code: 'ESEL', host: 'u5', players: [{ id: 'u5', name: 'Mo' }, { id: 'u6', name: 'Sally' }, { id: 'u7', name: 'Liam' }, { id: 'u8', name: 'Chris' }] },
  ];
  if (kind === 'room') {
    ui.screen = 'room';
    ui.game = { id: 'g0', code: 'HOFX', host: 'u1', status: 'lobby', version: 2, players: [{ id: 'u1', name: 'Alp' }, { id: 'u2', name: 'Nico' }, { id: 'u3', name: 'Lea' }] };
  }
  const demoState = buildDemoState(kind, gameLocal);
  if (kind === 'turn' || kind === 'menu') online = new Set(['u1', 'u2', 'u4']); // Lea offline zeigen
  if (kind === 'start') ui.myGames = [{ id: 'g9', players: [{ name: 'Alp' }, { name: 'Nico' }, { name: 'Lea' }] }];
  if (demoState) {
    ui.screen = 'playing';
    ui.game = { id: 'g0', code: 'HOFX', host: 'u1', status: 'playing', version: 5, players: demoState.players, state: demoState };
    render();
    return;
  }
  render();
  // In der Demo nichts speichern oder senden
  app.addEventListener('click', (e) => { if (ui.screen !== 'playing' && e.target.closest('button')) e.stopPropagation(); }, true);
}

// ---------- Start ----------

async function main() {
  if (DEMO) return demo(DEMO);
  app.innerHTML = '<section class="center-msg"><h2>Kuhhandel</h2><p>Verbinde …</p></section>';
  try {
    await connect();
  } catch (e) {
    app.innerHTML = '<section class="center-msg"><h2>Keine Verbindung</h2><p>Bitte Internet prüfen und die Seite neu laden.</p></section>';
    return;
  }
  watchLobby();
  const saved = store.get('kh_game');
  if (saved) {
    const { data, error } = await sb.from('games').select('*').eq('id', saved).maybeSingle();
    if (data && data.players.some((p) => p.id === me.id)) { watchRoom(data.id); return showGame(data); }
    if (!error) store.del('kh_game'); // nur vergessen, wenn das Spiel wirklich weg ist
  }
  openStart();
}

main();
