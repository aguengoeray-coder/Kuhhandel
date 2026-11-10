// Kuhhandel – Startseite, Lobby und Warteraum
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { createGame, MIN_PLAYERS, MAX_PLAYERS, GameError } from '../src/engine.js';
import { renderGame, SEAT_COLORS } from './game.js';
import { buildDemoState } from './demo.js';
const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
const DEMO = params.get('demo'); // nur für Screenshots: ?demo=start oder ?demo=room

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* egal */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* egal */ } },
};

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
        <ul class="games-list">${list}</ul>
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
let toastTimer = null;
let busy = false;

function toast(msg) {
  toastMsg = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMsg = ''; render(); }, 3500);
  render();
}

function renderPlaying() {
  renderGame(app, {
    state: ui.game.state,
    meId: me.id,
    local: gameLocal,
    toastMsg,
    rerender: render,
    act,
    onExit: () => { store.del('kh_game'); gameLocal.menu = false; if (roomChannel && sb) { sb.removeChannel(roomChannel); roomChannel = null; } openStart(); },
  });
}

// Spielzug ausführen: Regeln lokal prüfen, dann neuen Stand speichern (nur wenn niemand schneller war)
async function act(fn) {
  if (busy) return;
  let next;
  try {
    next = fn(ui.game.state);
  } catch (e) {
    if (e instanceof GameError) return toast(e.message);
    throw e;
  }
  if (DEMO) { ui.game = { ...ui.game, state: next }; return render(); }
  busy = true;
  const g = ui.game;
  const { data, error } = await sb.from('games')
    .update({ state: next, status: next.phase === 'ended' ? 'ended' : 'playing', version: g.version + 1, updated_at: new Date().toISOString() })
    .eq('id', g.id).eq('version', g.version)
    .select();
  busy = false;
  if (error) return toast('Verbindung hakt – bitte nochmal versuchen.');
  if (!data || data.length === 0) {
    const fresh = await sb.from('games').select('*').eq('id', g.id).single();
    if (fresh.data) ui.game = fresh.data;
    return toast('Jemand war schneller – schau nochmal hin.');
  }
  ui.game = data[0];
  render();
}

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
}

async function loadGames() {
  const since = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(); // nur Spiele der letzten 3 Stunden
  const { data, error } = await sb.from('games')
    .select('id, code, host, status, players, created_at')
    .eq('status', 'lobby').gte('created_at', since)
    .order('created_at', { ascending: false }).limit(30);
  if (error) { ui.error = 'Spiele konnten nicht geladen werden.'; return; }
  ui.games = data;
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
  roomChannel = sb.channel('game-' + id)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${id}` }, (payload) => {
      if (payload.eventType === 'DELETE') {
        store.del('kh_game');
        ui.error = 'Der Gastgeber hat das Spiel geschlossen.';
        openStart();
        return;
      }
      showGame(payload.new);
    })
    .subscribe();
}

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
    const { data } = await sb.from('games').select('*').eq('id', saved).maybeSingle();
    if (data && data.players.some((p) => p.id === me.id)) { watchRoom(data.id); return showGame(data); }
    store.del('kh_game');
  }
  openStart();
}

main();
