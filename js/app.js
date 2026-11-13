// Kuhhandel – Startseite, Lobby und Warteraum
import { SUPABASE_URL, SUPABASE_KEY, PUSH_PUBLIC_KEY } from './config.js';
import { createGame, MIN_PLAYERS, MAX_PLAYERS, GameError, DONKEY_PAYOUTS, debugEnd, animalsOf } from '../src/engine.js';
import { renderGame, SEAT_COLORS, fitStage, miniCard, CALM_TYPES, calmFor } from './game.js';
import { buildDemoState } from './demo.js';
import { botStep, whoMustAct } from './bots.js';
import { debugChips, debugPanel } from './debug.js';
import { audio, playSound, setVolume } from './sounds.js';
import { art } from './animals.js';
import { haptic } from './haptics.js';
import { renderShop, SHOP_SAYINGS } from './shop.js';
import { WHATS_NEW } from './whatsnew.js';
import { shopAvatar, shopAvatarFull, SHOP_AVATARS, SHOP_AVATAR_CSS, SHOP_AVATAR_FULL_CSS } from './shopavatars.js';
import { loadTheme, saveTheme, applyTheme, themeModal, PRESETS, DEFAULT_THEME } from './theme.js';
import { scores, ANIMALS, ANIMAL_BY_ID, RAT, isSpecialCard, specialAnimal, ratCurrent, specialStage, isMoneyCard, moneyValue, MONEY_VALUES, MAX_MONEY_CARDS } from '../src/engine.js';

export const APP_VERSION = '0.58.0';
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
let theme = loadTheme(store);
applyTheme(theme);
const dbg = { panel: false, viewAs: null, autoView: true, bots: false, fast: false, errors: [], lastSync: null, reportText: '' };
const logError = (msg) => {
  dbg.errors.push(`${new Date().toISOString()} ${msg}`);
  if (dbg.errors.length > 30) dbg.errors.shift();
  if (!/^Regel:/.test(msg)) reportError(msg); // echte Fehler automatisch melden (Regel-Hinweise nicht)
};
// Fehler in Supabase speichern (Tabelle error_reports), höchstens 5 pro Sitzung, keine Doppelten
const reported = new Set();
function reportError(msg) {
  try {
    if (DEMO || !sb || !me.id || reported.size >= 5 || reported.has(msg)) return;
    reported.add(msg);
    const s = ui.game?.state;
    sb.from('error_reports').insert({
      version: APP_VERSION,
      message: String(msg).slice(0, 500),
      context: { screen: ui.screen, game: ui.game?.local ? 'testspiel' : ui.game?.id || null, phase: s?.phase || null, ua: navigator.userAgent.slice(0, 200) },
    }).then(() => {}, () => {});
  } catch { /* nie das Spiel stören */ }
}
window.addEventListener('error', (e) => logError(`Fehler: ${e.message} (${e.filename}:${e.lineno})`));
window.addEventListener('unhandledrejection', (e) => logError(`Fehler: ${e.reason?.message || e.reason}`));

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initial = (name) => esc((name || '?').trim().charAt(0).toUpperCase());

let sb = null;
let me = { id: null, name: store.get('kh_name') || '' };
let ui = { screen: 'start', editingName: !store.get('kh_name'), games: [], game: null, error: '' };
let lobbyChannel = null;
let auth = { mode: 'login', error: '', busy: false }; // Anmelde-Bildschirm
const profiles = new Map(); // Anmelde-ID → { name, animal, color }
// v0.48 Shop: eigener Kontostand/Käufe + gekaufte Avatare aller Mitspieler (Anmelde-ID → Avatar-ID)
const shopAvatars = new Map();
const shopMe = { state: 'idle', balance: 0, owned: new Set(), active: null, freeLeft: 0 }; // state: idle | loading | ok | off (SQL noch nicht eingerichtet)
const SAYING_TEXTS = SHOP_SAYINGS.map((x) => x.text);
try { if (!document.getElementById('shop-avatar-runtime-css')) { const st = document.createElement('style'); st.id = 'shop-avatar-runtime-css'; st.textContent = SHOP_AVATAR_CSS + SHOP_AVATAR_FULL_CSS; document.head.append(st); } } catch {}
const reactions = new Map(); // angezeigt bei Platz → { text, from, until }
let lastReactAt = 0;
const PROFILE_COLORS = ['#C2570C', '#1D5FC2', '#B8285F', '#6D3FC0', '#0B7A68', '#B58A00', '#5B6770', '#8C3B2E'];
// EHRLICH: euer Insider – kommt als großer Spruch mit eigenem Ton
const EHRLICH = 'Ehrliches, männliches Angebot! 💪';
const UNEHRLICH = 'Unehrliches, unmännliches Angebot! 👎';
const REACT_EMOJI = ['😂', '👍', '👎', '😱', '🤑', '🙄', '🔥', '🐮'];
const REACTIONS = [EHRLICH, UNEHRLICH, 'Komm schon, da geht noch mehr!', 'Bluff!', 'Niemals!', 'Gut gespielt!', 'Zu teuer!'];
let roomChannel = null;
let versions = {}; // Platz → App-Version (aus der Live-Verbindung)

// Mein Platz im Spiel: nach einem Gerätewechsel ist meine Anmelde-ID neu, der Platz bleibt gleich
const seatIn = (g) => g?.players?.find((p) => p.id === me.id)?.seat || me.id;
const isStandalone = () => window.matchMedia?.('(display-mode: fullscreen)').matches || window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; });
// Als App gestartet: Querformat festhalten (geht nur auf Android)
document.addEventListener('pointerdown', () => { if (isStandalone()) screen.orientation?.lock?.('landscape').catch(() => {}); }, { once: true });

// ---------- Neue Version? ----------
// Vergleicht Versionsnummern wie 0.12.0 (true, wenn a älter als b ist)
const olderThan = (a, b) => {
  const x = String(a).split('.').map(Number); const y = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0); }
  return false;
};
let newVersion = null; // auf dem Server liegt eine neuere Version
async function checkVersion() {
  if (DEMO) return;
  try {
    const r = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
    const { version } = await r.json();
    if (version && olderThan(APP_VERSION, version) && newVersion !== version) { newVersion = version; render(); }
  } catch { /* offline – egal */ }
}
setInterval(checkVersion, 3 * 60 * 1000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkVersion(); });
setTimeout(checkVersion, 4000);
// Spiel braucht eine neuere Version als dieses Handy hat?
const tooOld = () => !!(ui.game?.state?.minVersion && olderThan(APP_VERSION, ui.game.state.minVersion));
function renderVersionBar() {
  let bar = document.getElementById('verbar');
  const mustReload = ui.screen === 'playing' && tooOld();
  const show = (newVersion && !DEMO) || mustReload || params.get('verbar');
  if (!show) { bar?.remove(); return; }
  if (!bar) { bar = document.createElement('div'); bar.id = 'verbar'; document.body.appendChild(bar); }
  bar.className = mustReload ? 'block' : '';
  bar.innerHTML = mustReload
    ? '<div><b>Neue Version nötig</b><span>Dieses Spiel läuft mit einer neueren Version. Bitte neu laden.</span><button type="button" id="reloadNow">Jetzt neu laden</button></div>'
    : '<div><b>Neue Version da</b><span>Bitte neu laden, damit alle mit denselben Regeln spielen.</span><button type="button" id="reloadNow">Neu laden</button></div>';
  bar.querySelector('#reloadNow').onclick = () => location.reload();
}

// ---------- Bildschirm anlassen (während Warteraum und Spiel) ----------
let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && !wakeLock && navigator.wakeLock && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch { wakeLock = null; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepAwake(ui.screen === 'playing' || ui.screen === 'room'); });

// ---------- Darstellung ----------

function render() {
  renderModal();
  let ver = document.getElementById('appver');
  if (!ver) { ver = document.createElement('div'); ver.id = 'appver'; document.body.appendChild(ver); }
  ver.textContent = `v${APP_VERSION}`;
  renderVersionBar();
  if (!DEMO) keepAwake(ui.screen === 'playing' || ui.screen === 'room');
  app.classList.toggle('playing', ui.screen === 'playing');
  if (ui.screen !== 'playing') app.onclick = null;
  if (ui.screen === 'login') renderLogin();
  else if (ui.screen === 'room' && ui.game) renderRoom();
  else if (ui.screen === 'playing' && ui.game) renderPlaying();
  else renderStart();
  if (ui.screen !== 'playing' && document.getAnimations) document.getAnimations().forEach((a) => { try { if (a.effect && a.effect.getTiming().iterations === Infinity && a.startTime !== 0) a.startTime = 0; } catch { /* egal */ } });
}

// Kleines Spielerbild (Tier auf Farbe); ohne Profil: Anfangsbuchstabe
function avatarHtml(id, name, cls = '') {
  const sa = shopAvatars.get(id);
  if (sa) return `<div class="avatar pic shopav ${cls}" aria-hidden="true">${shopAvatar(sa)}</div>`;
  const pr = profiles.get(id);
  if (pr) return `<div class="avatar pic ${cls}" style="--bg:${esc(pr.color)}" aria-hidden="true">${art(pr.animal)}</div>`;
  return `<div class="avatar ${cls}" aria-hidden="true">${initial(name)}</div>`;
}

// Startseite: „Team Rockets Tier Börse“ – Kurstafel mit Tierpreisen, Logo: die Kuh
export const GAME_NAME = 'Team Rockets Tier Börse';
const TICK_MOVES = [12, -4, 7, 3, -9, 15, 5, -2, 8, 21];
// Kurstafel mit echten Zahlen: Siege, Rekorde, letzter Sieg, teuerster Kauf (aus den gespeicherten Spielen)
let tickerData = null; let tickerLoading = false;
async function loadTicker() {
  if (tickerLoading || tickerData) return;
  tickerLoading = true;
  try {
    let rows;
    if (DEMO) rows = DEMO_TICKER;
    else {
      let res = await sb.from('game_results').select('player_id, name, score, won, created_at, extras').order('created_at', { ascending: false }).limit(1000);
      if (res.error) res = await sb.from('game_results').select('player_id, name, score, won, created_at').order('created_at', { ascending: false }).limit(1000);
      if (res.error) throw res.error;
      rows = res.data || [];
    }
    tickerData = tickerItems(rows);
  } catch { tickerData = []; }
  tickerLoading = false;
  if (ui.screen === 'start' || ui.screen === 'room' || ui.screen === 'login') render();
}
function tickerItems(rows) {
  const by = new Map();
  rows.forEach((r) => { // neueste zuerst
    const st = by.get(r.player_id) || { name: r.name, games: 0, wins: 0, best: 0, last: null };
    st.games += 1; st.wins += r.won ? 1 : 0; st.best = Math.max(st.best, r.score || 0); if (st.last === null) st.last = !!r.won;
    by.set(r.player_id, st);
  });
  const items = [];
  const lastWin = rows.find((r) => r.won);
  if (lastWin) items.push({ label: 'LETZTER SIEG', val: esc(lastWin.name), note: `🏆 ${lastWin.score}`, up: true });
  [...by.values()].sort((a, b) => b.wins - a.wins || b.best - a.best).slice(0, 8).forEach((st) => {
    items.push({ label: esc(st.name.toUpperCase()), val: `${st.wins} ${st.wins === 1 ? 'Sieg' : 'Siege'}`, note: st.last ? '▲ zuletzt gewonnen' : `▼ ${st.games} Spiele`, up: st.last });
  });
  const rec = [...by.values()].sort((a, b) => b.best - a.best)[0];
  if (rec && rec.best) items.push({ label: 'REKORD', val: `${rec.best}`, note: `👑 ${esc(rec.name)}`, up: true });
  let buy = null;
  rows.forEach((r) => { const m = r.extras?.maxBuy; if (m && m.amount && (!buy || m.amount > buy.amount)) buy = { ...m, name: r.name }; });
  if (buy && ANIMAL_BY_ID[buy.animal]) items.push({ animal: buy.animal, label: 'TEUERSTER KAUF', val: `${ANIMAL_BY_ID[buy.animal].name} ${buy.amount}`, note: `💸 ${esc(buy.name)}`, up: false });
  return items;
}
const DEMO_TICKER = [
  { player_id: 'u2', name: 'Nico', score: 4870, won: true, extras: { maxBuy: { animal: 'pferd', amount: 620 } } }, { player_id: 'u1', name: 'Alp', score: 3750, won: false },
  { player_id: 'u1', name: 'Alp', score: 7150, won: true }, { player_id: 'u2', name: 'Nico', score: 2100, won: false }, { player_id: 'u3', name: 'Bennet', score: 4200, won: true },
];
function tickerHtml() {
  if (!tickerData && !tickerLoading && (me.id || DEMO)) loadTicker();
  const prices = ANIMALS.map((a, i) => { const d = TICK_MOVES[i % TICK_MOVES.length];
    return `<span class="tk"><i>${art(a.id)}</i>${esc(a.name.toUpperCase())} <b>${a.value}</b><em class="${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d)} %</em></span>`; }).join('');
  const real = (tickerData || []).map((x) => `<span class="tk real">${x.animal ? `<i>${art(x.animal)}</i>` : ''}${x.label} <b>${x.val}</b><em class="${x.up ? 'up' : 'dn'}">${x.note}</em></span>`).join('');
  const all = real + prices + `<span class="tk"><i>${art(RAT)}</i>RATTE <b>0</b><em class="dn">☠ Ramsch</em></span>`;
  return `<div class="ticker" aria-label="Kurse der Tier Börse"><div class="tkrun" style="animation-duration:${(ANIMALS.length + 1 + (tickerData || []).length) * 3.6}s">${all}${all}</div></div>`;
}
function brandHtml() {
  const tick = ANIMALS.map((a, i) => { const d = TICK_MOVES[i % TICK_MOVES.length];
    return `<span class="tk"><i>${art(a.id)}</i>${esc(a.name.toUpperCase())} <b>${a.value}</b><em class="${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d)} %</em></span>`; }).join('')
    + `<span class="tk"><i>${art(RAT)}</i>RATTE <b>0</b><em class="dn">☠ Ramsch</em></span><span class="tk">ESEL-BONUS <b>+50</b><em class="up">🎉 Dividende</em></span>`;
  const logo = `<span class="logocow" aria-hidden="true">${art('kuh')}</span>`;
  void tick;
  return `${tickerHtml()}
    <div class="logorow tb">${logo}<div class="tbname"><span class="tbteam">🚀 Team Rockets</span><h1 class="logo tbtitle">Tier<br><span class="tbb">Börse</span></h1></div></div>
    <p class="claim">Kaufen. Bluffen. Kuhhandeln. <small>Das Kartenspiel – online mit Freunden</small></p>`;
}

function renderLogin() {
  const create = auth.mode === 'create';
  app.innerHTML = `
    <section class="start">
      <div class="brand">
        ${brandHtml()}
        <div class="start-links"><button type="button" class="linklike light" data-modal="rules">Spielregeln</button></div>
      </div>
      <div class="card games login">
        <div class="tabs-login">
          <button type="button" class="${create ? '' : 'on'}" data-auth="login">Anmelden</button>
          <button type="button" class="${create ? 'on' : ''}" data-auth="create">Neu hier? Konto erstellen</button>
        </div>
        <form id="auth-form" class="auth-form">
          <label>Name<input name="name" maxlength="16" autocomplete="username" required value="${esc(me.name)}"></label>
          <label>Passwort<input name="pw" type="password" minlength="6" autocomplete="${create ? 'new-password' : 'current-password'}" required></label>
          ${create ? '<small>Mindestens 6 Zeichen. Damit meldest du dich auf jedem Handy wieder an.</small>' : '<small>Du bleibst auf diesem Gerät angemeldet.</small>'}
          ${auth.error ? `<div class="error" role="alert">${esc(auth.error)}</div>` : ''}
          <button type="submit" class="pill pill-red" ${auth.busy ? 'disabled' : ''}>${create ? 'Konto erstellen' : 'Anmelden'}</button>
        </form>
      </div>
    </section>`;
  app.querySelectorAll('[data-auth]').forEach((b) => b.addEventListener('click', () => { auth.mode = b.dataset.auth; auth.error = ''; render(); }));
  app.querySelectorAll('[data-modal]').forEach((b) => b.addEventListener('click', () => openModal(b.dataset.modal)));
  document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    doAuth(String(f.get('name')).trim(), String(f.get('pw')));
  });
}

const moneyNote = (g) => {
  const m = g.state?.settings?.money;
  const n = m ? Object.values(m).reduce((a, b) => a + b, 0) : 0;
  return n ? ` · mit ${n} Geldschein${n === 1 ? '' : 'en'}` : '';
};

// Startseite „B: Tisch“ (v0.47): Ticker oben über die ganze Breite, das Spiel liegt groß auf dem Filz, unten eine App-Leiste.
// Alles, was früher als Knopfreihe da stand, ist jetzt in der Leiste bzw. hinter ⚙️ Einstellungen.
function homeItems() {
  const items = [];
  (ui.myGames || []).forEach((g) => items.push({ kind: 'resume', g }));
  ui.games.forEach((g) => items.push({ kind: 'open', g }));
  if (DEBUG) items.push({ kind: 'test' }); // Testspiel zuletzt – echte Spiele gehen vor
  return items;
}
// v0.52: dein aktiver Shop-Avatar steht groß neben dem Tisch (Tippen öffnet den Shop)
function heroHtml() {
  const a = SHOP_AVATARS.find((x) => x.id === shopMe.active);
  return a ? `<button type="button" class="hb-hero" data-dock="shop" data-tier="${a.tier}" aria-label="Dein Avatar: ${esc(a.name)} – Shop öffnen">${shopAvatarFull(a.id)}<small>${esc(a.name)}</small></button>`
    : `<button type="button" class="hb-hero empty" data-dock="shop" aria-label="Avatar im Shop holen"><span class="hb-ghost" aria-hidden="true">?</span><small>Avatar holen</small></button>`;
}

function renderStart() {
  if (shopMe.state === 'idle') loadShop();
  // nach einem Update einmal „Was ist neu?“ zeigen (nicht beim allerersten Start)
  try {
    const seen = localStorage.getItem('kh_seen_version');
    if ((seen !== APP_VERSION && !DEMO) || (DEMO && params.get('news') && !ui.newsShown)) {
      localStorage.setItem('kh_seen_version', APP_VERSION); ui.newsShown = true;
      if ((seen || DEMO) && WHATS_NEW[0]?.v === APP_VERSION && !modal) setTimeout(() => openModal('news'), 600);
    }
  } catch {}
  const items = homeItems();
  // Was liegt auf dem Tisch? Dein laufendes Spiel zuerst, sonst das erste offene; mit ‹ › blättern
  if (!items.length) ui.homeIdx = 0;
  else ui.homeIdx = Math.min(Math.max(0, ui.homeIdx || 0), items.length - 1);
  const it = items[ui.homeIdx];
  const seatRow = (players) => `<div class="hb-seats">${Array.from({ length: MAX_PLAYERS }, (_, k) => {
    const p = players[k];
    return p ? `<div class="hb-seat">${avatarHtml(p.id, p.name)}<span>${esc(p.id === me.id ? 'Du' : p.name)}</span></div>`
      : '<div class="hb-seat free"><div class="avatar hb-free">+</div><span>frei</span></div>';
  }).join('')}</div>`;
  let felt = '';
  if (!it) {
    felt = `<b class="hb-title">Gerade ist kein Spiel offen</b><small class="hb-sub">Erstelle eins und lade deine Freunde ein.</small>
      ${seatRow(me.name ? [{ id: me.id, name: me.name }] : [])}
      <button class="pill pill-red hb-cta" type="button" id="create" ${me.name ? '' : 'disabled'}>＋ Neues Spiel</button>`;
  } else if (it.kind === 'test') {
    const on = !!store.get('kh_dbg_money');
    felt = `<b class="hb-title">Testspiel <span class="hb-tag">Debug</span></b><small class="hb-sub">Nur auf diesem Gerät, mit Test-Spielern</small>
      <div class="hb-row">
        <button class="pill pill-white pill-small toggle-pill ${on ? 'on' : ''}" type="button" id="dbgMoney" aria-pressed="${on}">Geld im Stapel: ${on ? 'an' : 'aus'}</button>
        <button class="pill pill-white pill-small" type="button" data-test="3">3 Spieler</button>
        <button class="pill pill-red pill-small" type="button" data-test="4">4 Spieler</button>
      </div>`;
  } else if (it.kind === 'resume') {
    const g = it.g;
    let who = null;
    try { who = g.state ? whoMustAct(g.state, Date.now()) : null; } catch { who = null; }
    const mine = who === me.id || (Array.isArray(who) && who.includes(me.id));
    felt = `<b class="hb-title">${mine ? '<span class="hb-turn">Du bist dran!</span>' : 'Dein laufendes Spiel'}</b>
      ${seatRow(g.players)}
      <button class="pill pill-red hb-cta" type="button" data-resume="${esc(g.id)}">Weiter spielen</button>`;
  } else {
    const g = it.g;
    const host = (g.players.find((p) => p.id === g.host) || g.players[0])?.name || 'Unbekannt';
    const n = g.players.length; const full = n >= MAX_PLAYERS;
    felt = `<b class="hb-title">Spiel von ${esc(host)} <span class="hb-subin">· ${n} von ${MAX_PLAYERS} Plätzen</span></b>
      <small class="hb-sub">Code ${esc(g.code)}${moneyNote(g)}</small>
      ${seatRow(g.players)}
      <button class="pill pill-red hb-cta" type="button" data-join="${esc(g.id)}" ${full || !me.name ? 'disabled' : ''}>${full ? 'Voll' : 'Platz nehmen'}</button>`;
  }
  const nav = items.length > 1 ? `<button type="button" class="hb-nav l" data-hb="prev" aria-label="Vorheriges Spiel" ${ui.homeIdx ? '' : 'disabled'}>‹</button>
    <button type="button" class="hb-nav r" data-hb="next" aria-label="Nächstes Spiel" ${ui.homeIdx < items.length - 1 ? '' : 'disabled'}>›</button>
    <span class="hb-count">${ui.homeIdx + 1} / ${items.length}</span>` : '';
  const dock = [['play', '▶️', 'Spielen'], ['shop', '🛒', 'Shop'], ['stats', '🏆', 'Bestenliste'], ['mystats', '📊', 'Statistik'], ['rules', '📖', 'Regeln'], ['settings', '⚙️', 'Einstellungen']]
    .map(([k, i, l]) => `<button type="button" class="hb-dk ${k === 'play' ? 'on' : ''}" data-dock="${k}"><i>${i}</i>${l}</button>`).join('');
  app.innerHTML = `
    <section class="home">
      ${tickerHtml()}
      <div class="hb-top">
        <div class="logorow tb hb-logo"><span class="logocow" aria-hidden="true">${art('kuh')}</span><div class="tbname"><span class="tbteam">🚀 Team Rockets</span><h1 class="logo tbtitle">Tier <span class="tbb">Börse</span></h1></div></div>
        <button type="button" class="hb-me" data-modal="profile" aria-label="Profilbild ändern">${avatarHtml(me.id, me.name)}<b>${esc(me.name)}</b>${shopMe.state === 'ok' ? `<span class="hb-dub" title="Dublonen"><i class="dub" aria-hidden="true"></i> ${shopMe.balance}</span>` : ''}</button>
      </div>
      <div class="hb-stage">
        <div class="hb-felt">${nav}${felt}
          ${ui.error ? `<div class="error hb-err" role="alert">${esc(ui.error)}</div>` : ui.homeNote ? `<div class="hb-note" role="status">${esc(ui.homeNote)}</div>` : ''}
        </div>
        ${shopMe.state === 'ok' ? heroHtml() : ''}
        <div class="hb-side">
          ${it ? `<button class="pill pill-white pill-small" type="button" id="create" ${me.name ? '' : 'disabled'}>＋ Neues Spiel</button>` : ''}
          <button class="pill pill-white pill-small" type="button" data-modal="rejoin">🔑 Mit Code</button>
        </div>
      </div>
      <nav class="hb-dock" aria-label="Bereiche">${dock}</nav>
    </section>`;

  document.getElementById('create')?.addEventListener('click', onCreate);
  app.querySelectorAll('[data-join]').forEach((b) => b.addEventListener('click', () => onJoin(b.dataset.join)));
  app.querySelectorAll('[data-modal]').forEach((b) => b.addEventListener('click', () => openModal(b.dataset.modal)));
  app.querySelectorAll('[data-test]').forEach((b) => b.addEventListener('click', () => startLocalGame(Number(b.dataset.test))));
  app.querySelectorAll('[data-hb]').forEach((b) => b.addEventListener('click', () => { ui.homeIdx = (ui.homeIdx || 0) + (b.dataset.hb === 'next' ? 1 : -1); render(); }));
  app.querySelectorAll('[data-dock]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.dock;
    if (k === 'play') return;
    if (k === 'shop') { openShop(); return; }
    openModal(k);
  }));
  document.getElementById('dbgMoney')?.addEventListener('click', () => { if (store.get('kh_dbg_money')) store.del('kh_dbg_money'); else store.set('kh_dbg_money', '1'); render(); });
  app.querySelectorAll('[data-resume]').forEach((b) => b.addEventListener('click', async () => {
    const { data } = await sb.from('games').select('*').eq('id', b.dataset.resume).maybeSingle();
    if (data) enterRoom(data); else { await loadGames(); render(); }
  }));
}

let roomSeen = null; let roomJoin = null; // wer zuletzt eingestiegen ist (kurze Einblendung)
function renderRoom() {
  const g = ui.game;
  const isHost = g.host === me.id;
  const ids = g.players.map((p) => p.id);
  if (roomSeen && roomSeen.code === g.code) {
    const neu = g.players.find((p) => !roomSeen.ids.includes(p.id) && p.id !== me.id);
    if (neu) { roomJoin = { id: neu.id, name: neu.name, at: Date.now() }; setTimeout(() => { if (ui.screen === 'room') render(); }, 3200); }
  }
  roomSeen = { code: g.code, ids };
  const joinEl = roomJoin && Date.now() - roomJoin.at < 3000 ? roomJoin : null;
  const seats = Array.from({ length: MAX_PLAYERS }, (_, i) => {
    const p = g.players[i];
    if (!p) {
      return `<div class="seat empty-seat"><div class="avatar" aria-hidden="true">+</div><div class="ribbon">Frei</div></div>`;
    }
    const you = p.id === me.id ? ' (du)' : '';
    const kick = isHost && p.id !== me.id ? `<button type="button" class="kick" data-kick="${esc(p.id)}" aria-label="${esc(p.name)} entfernen">✕</button>` : '';
    return `<div class="seat ${joinEl && joinEl.id === p.id ? 'joined' : ''}" style="--c:${SEAT_COLORS[i]}${joinEl && joinEl.id === p.id ? `;--el:-${Date.now() - joinEl.at}ms` : ''}">
      ${kick}${avatarHtml(p.id, p.name)}
      <div class="ribbon">${esc(p.name)}${you}</div>
      ${p.id === g.host ? '<span class="host-badge">Gastgeber</span>' : ''}
    </div>`;
  }).join('');
  const enough = g.players.length >= MIN_PLAYERS;
  const outdated = g.players.filter((p) => { const v = versions[p.seat || p.id]; return v && v !== APP_VERSION && olderThan(v, APP_VERSION); });
  const money = g.state?.settings?.money || null;
  const moneyCount = money ? Object.values(money).reduce((a, b) => a + b, 0) : 0;
  const moneySum = money ? Object.entries(money).reduce((a, [v, n]) => a + Number(v) * n, 0) : 0;
  const steppers = money ? MONEY_VALUES.map((v) => {
    const n = money[v] || 0;
    return `<div class="mstep ${n ? 'on' : ''}">
      <div class="mval" style="--m:${MONEY_CARD_COLORS[v]}">${v}</div>
      ${isHost ? `<div class="mctl"><button type="button" data-money="${v}" data-d="-1" ${n ? '' : 'disabled'} aria-label="${v}er weniger">−</button><b>${n}</b><button type="button" data-money="${v}" data-d="1" ${moneyCount < MAX_MONEY_CARDS ? '' : 'disabled'} aria-label="${v}er mehr">+</button></div>` : `<div class="mctl"><b>${n}×</b></div>`}
    </div>`;
  }).join('') : '';
  const settingsBox = `<div class="room-settings">
    <div class="rs-head">
      ${isHost ? `<button type="button" class="toggle ${money ? 'on' : ''}" id="moneyToggle" aria-pressed="${!!money}"><i></i></button>` : ''}
      <span><b>Geldscheine im Stapel</b><small>${money ? `${moneyCount} von max. ${MAX_MONEY_CARDS} Scheinen · ${moneySum} Taler` : isHost ? 'aus – antippen zum Einschalten' : 'aus'}</small></span>
      <div class="rs-extra">
      ${[['turbo', '⚡ Turbo (7 Tiere, 6 s)'], ['tradeTimer', `⏱ Kuhhandel-Zeit ${g.state?.settings?.turbo ? 12 : 20} s`], ['standings', '📊 Zwischenstand'], ['moneyCounts', '💰 Geld zählt am Ende']].map(([k, label]) => { const on = !!g.state?.settings?.[k];
        return isHost ? `<button type="button" class="rs-chip ${on ? 'on' : ''}" data-setting="${k}" aria-pressed="${on}">${on ? '✓ ' : ''}${label}</button>` : (on ? `<span class="rs-chip on">✓ ${label}</span>` : ''); }).join('')}
    </div>
    </div>
    ${money ? `<div class="msteps">${steppers}</div>` : ''}
  </div>`;
  const hint = outdated.length
    ? `${outdated.map((p) => esc(p.name)).join(', ')} ${outdated.length > 1 ? 'haben' : 'hat'} eine alte Version – bitte App neu laden.`
    : isHost
    ? (enough ? 'Alle da? Dann los!' : `Warte auf Mitspieler – mindestens ${MIN_PLAYERS} nötig.`)
    : `Warte, bis ${esc((g.players.find((p) => p.id === g.host) || g.players[0])?.name || 'der Gastgeber')} das Spiel startet.`;

  app.innerHTML = `
    <section class="room">
      <div class="room-top">
        <h1 class="room-title">Warteraum</h1>
        ${tickerHtml()}
        <span class="code-chip">Spiel-Code <b>${esc(g.code)}</b></span>
      </div>
      <div class="table ${money ? 'short' : ''}" aria-label="Plätze am Tisch">${seats}${joinEl ? `<div class="joinpop" role="status" style="--el:-${Date.now() - joinEl.at}ms">📈 ${esc(joinEl.name)} ist an der Börse eingestiegen</div>` : ''}</div>
      ${settingsBox}
      ${ui.error ? `<div class="error" role="alert">${esc(ui.error)}</div>` : ''}
      <div class="room-actions">
        <button class="pill pill-white pill-small" type="button" id="leave">Verlassen</button>
        <button class="pill pill-white pill-small" type="button" id="invite">Freunde einladen</button>
        ${isHost ? `<button class="pill pill-red" type="button" id="start" ${enough && !outdated.length ? '' : 'disabled'}>SPIEL STARTEN</button>` : ''}
        <span class="room-hint">${hint}</span>
      </div>
    </section>`;
  document.getElementById('leave').addEventListener('click', onLeave);
  document.getElementById('invite').addEventListener('click', onInvite);
  app.querySelectorAll('[data-kick]').forEach((b) => b.addEventListener('click', async () => {
    const { error } = await sb.rpc('kick_player', { p_game: g.id, p_player: b.dataset.kick });
    if (error) { ui.error = 'Entfernen hat nicht geklappt.'; render(); }
  }));
  document.getElementById('start')?.addEventListener('click', onStart);
  document.getElementById('moneyToggle')?.addEventListener('click', () => saveSettings({ money: money ? null : { ...DEFAULT_MONEY } }));
  app.querySelectorAll('[data-setting]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.setting; const cur = !!ui.game.state?.settings?.[k]; saveSettings({ [k]: cur ? null : (k === 'tradeTimer' ? 20 : true) }); }));
  app.querySelectorAll('[data-money]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.money;
    const next = { ...money, [v]: Math.max(0, (money[v] || 0) + Number(b.dataset.d)) };
    if (!next[v]) delete next[v];
    saveSettings({ money: next });
  }));
}

const MONEY_CARD_COLORS = { 0: '#ECE7DB', 10: '#F6D98B', 20: '#F2B880', 50: '#A8D5B5', 100: '#9FC9E8', 200: '#C9B6E4', 500: '#E7A1A0' };
const DEFAULT_MONEY = { 0: 3, 10: 2, 50: 2, 100: 1, 200: 1, 500: 1 };

// Einstellungen im Warteraum speichern (nur Gastgeber). Liegen bis zum Start in games.state.settings.
async function saveSettings(patch) {
  const g = ui.game;
  const settings = { ...(g.state?.settings || {}), ...patch };
  const count = settings.money ? Object.values(settings.money).reduce((a, b) => a + b, 0) : 0;
  if (count > MAX_MONEY_CARDS) return;
  ui.game = { ...g, state: { ...(g.state || {}), settings } };
  render();
  if (DEMO) return;
  for (let tries = 0; tries < 3; tries++) {
    const cur = ui.game;
    const { data, error } = await sb.from('games')
      .update({ state: { settings }, version: cur.version + 1, updated_at: new Date().toISOString() })
      .eq('id', cur.id).eq('version', cur.version).eq('status', 'lobby').select();
    if (error) { ui.error = 'Einstellung konnte nicht gespeichert werden.'; return render(); }
    if (data && data.length) { ui.game = data[0]; return render(); }
    const fresh = await sb.from('games').select('*').eq('id', cur.id).single();
    if (!fresh.data || fresh.data.status !== 'lobby') return;
    ui.game = { ...fresh.data, state: { ...(fresh.data.state || {}), settings } };
  }
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

// ---------- Push-Benachrichtigungen („Du bist dran“, auch wenn die App zu ist) ----------
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const pushOn = () => store.get('kh_push') === 'on' && typeof Notification !== 'undefined' && Notification.permission === 'granted';
if (!DEMO && 'serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
function keyBytes(b64) {
  const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}
async function togglePush() {
  if (!PUSH_PUBLIC_KEY || DEMO) return;
  if (!pushSupported()) {
    return toast(isIOS ? 'Auf dem iPhone geht das nur, wenn die Tier Börse als App auf dem Homescreen liegt (Teilen → „Zum Home-Bildschirm“). Dann dort nochmal tippen.' : 'Dieses Gerät kann leider keine Benachrichtigungen.');
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    if (pushOn()) {
      const sub = await reg.pushManager.getSubscription();
      if (sub) { await sb.rpc('delete_push', { p_endpoint: sub.endpoint }); await sub.unsubscribe(); }
      store.set('kh_push', 'off'); toast('Benachrichtigungen aus.'); return render();
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return toast('Benachrichtigungen wurden nicht erlaubt (in den Handy-Einstellungen änderbar).');
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(PUSH_PUBLIC_KEY) });
    const { error } = await sb.rpc('save_push', { p_sub: sub.toJSON() });
    if (error) { logError(`Push: ${error.message}`); return toast('Konnte nicht gespeichert werden – bitte später nochmal.'); }
    store.set('kh_push', 'on'); toast('Benachrichtigungen an – du bekommst Bescheid, wenn du dran bist.'); render();
  } catch (e) {
    logError(`Push: ${e.message}`); toast('Benachrichtigungen gehen hier gerade nicht.');
  }
}

function toast(msg) {
  toastMsg = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMsg = ''; render(); }, 3500);
  render();
}

// Anstupsen: auf wen wird seit über 20 Sekunden gewartet?
const NUDGE_AFTER_MS = 20000;
// Versteigerung vorbei, Auktionator entscheidet nicht: schon nach 12 s anstupsen
const nudgeAfter = (s) => (s.phase === 'auction' ? 12000 : NUDGE_AFTER_MS);
let waitKey = '';
let waitSince = 0;
let lastNudgeAt = 0;
function waitingFor() {
  const s = ui.game.state;
  if (!s || s.phase === 'ended') return null;
  let who = whoMustAct(s, now());
  if ((s.autoplay || []).includes(who)) who = null; // dafür ist der Test-Spieler da
  const key = `${who}|${ui.game.version}|${s.phase}`;
  if (key !== waitKey) {
    waitKey = key;
    waitSince = Date.now();
    if (who) setTimeout(() => { if (waitKey === key) render(); }, nudgeAfter(s) + 100);
  }
  if (DEMO && params.get('nudge')) return params.get('nudge');
  return who && Date.now() - waitSince >= nudgeAfter(s) ? who : null;
}
function sendNudge(to) {
  if (Date.now() - lastNudgeAt < 15000) return toast('Gerade erst angestupst – kurz warten.');
  lastNudgeAt = Date.now();
  const seat = ui.game.local ? dbg.viewAs : seatIn(ui.game);
  const name = ui.game.state.players.find((p) => p.id === to)?.name || '';
  if (!ui.game.local && roomChannel) roomChannel.send({ type: 'broadcast', event: 'nudge', payload: { from: seat, to } });
  toast(`${name} wurde angestupst.`);
}
function gotNudge(payload) {
  if (!payload || payload.to !== seatIn(ui.game)) return;
  const name = ui.game?.state?.players.find((p) => p.id === payload.from)?.name || 'Jemand';
  beep();
  if (soundOn()) playSound('nudge');
  toast(`${name} stupst dich an – du bist dran!`);
}

function renderPlaying() {
  const local = !!ui.game.local;
  maybeRecordResults();
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
    meId: local ? dbg.viewAs : seatIn(ui.game),
    local: gameLocal,
    toastMsg,
    rerender: render,
    act,
    now,
    sound: soundOn(),
    soundName: SOUND_NAMES[soundLevel()],
    toggleSound: () => { const order = ['off', 'low', 'on', 'high']; const next = order[(order.indexOf(soundLevel()) + 1) % order.length]; store.set('kh_sound', next); setVolume(SOUND_LEVELS[next]); if (next !== 'off') playSound('bid'); render(); },
    vibe: vibeOn(),
    toggleVibe: () => { store.set('kh_vibe', vibeOn() ? 'off' : 'on'); render(); },
    push: PUSH_PUBLIC_KEY ? pushOn() : null,
    togglePush,
    online: local ? null : onlineForDisplay(),
    standalone: isStandalone(),
    openModal,
    onRematch,
    rematchId: ui.game.state?.rematchId || null,
    avatarFor: (seat) => {
      const pl = ui.game.players?.find((x) => (x.seat || x.id) === seat);
      // Testspiel: dein Platz heißt intern „me“ → dein echtes Konto (Profilbild + Shop-Avatar); Test-Spieler haben kein Konto
      const uid = local && seat === 'me' ? me.id : pl ? pl.id : seat;
      // Testspiel: Test-Spieler bekommen zufällige Shop-Avatare (pro Testspiel fest)
      if (local && seat !== 'me' && ui.game.botAvatars?.[seat]) return { shop: ui.game.botAvatars[seat] };
      const pr = profiles.get(uid) || null; const sa = shopAvatars.get(uid);
      return sa ? { ...(pr || {}), shop: sa } : pr;
    },
    playSound: (kind) => { if (soundOn() && !DEMO) playSound(kind); },
    reactions: activeReactions(),
    reactionList: myReactions(),
    reactionEmoji: 0,
    reactionBase: REACTIONS.length, // ab hier: gekaufte Shop-Sprüche
    demoPop: DEMO && params.get('pop') === '1', // Screenshots: Ergebnis-Fenster sofort zeigen
    seatTip: !DEMO || params.get('tip') === '1', // einmaliger Hinweis zur Sitzordnung (in Demo-Bildern nur mit &tip=1)
    react: sendReaction,
    nudgeWho: waitingFor(),
    nudge: sendNudge,
    autoplay: ui.game.state?.autoplay || [],
    canTakeover: local ? () => false : (seat) => canTakeover(seat),
    takeover: (seat) => act((s) => withAutoplay(s, seat, true)),
    selfPlay: (seat) => act((s) => withAutoplay(s, seat, false)),
    rewards: !ui.game?.local, // Dublonen gibt es nur in echten Partien (nicht im Testspiel)
    myRewards: DEMO && params.get('rw') ? (params.get('rw') === '0' ? [] : [{ kind: 'partie', amount: 2 }, { kind: 'quartett', amount: 10 }, { kind: 'sieg', amount: 10 }]) : myRewards && myRewards.game === ui.game?.id ? myRewards.list : null,
    onExit: () => { if (!ui.game?.local) store.del('kh_game'); gameLocal.menu = false; if (roomChannel && sb) { sb.removeChannel(roomChannel); roomChannel = null; } openStart(); },
  });
  if (DEBUG) injectDebug();
}

// Spielzug ausführen: Regeln lokal prüfen, dann neuen Stand speichern (nur wenn niemand schneller war).
// War jemand schneller, wird der Zug automatisch auf dem neuen Stand nochmal geprüft und gespeichert.
async function act(fn, { silent = false } = {}) {
  if (busy) return;
  if (tooOld()) return toast('Bitte zuerst neu laden – dieses Spiel braucht die neue Version.');
  const attempt = () => {
    try {
      const next = fn(ui.game.state);
      return next ? { next } : null; // nichts zu tun
    } catch (e) {
      if (e instanceof GameError) { logError(`Regel: ${e.message}`); if (!silent) toast(e.message); return null; }
      logError(`Absturz: ${e.message}`);
      throw e;
    }
  };
  let r = attempt();
  if (!r) return;
  if (DEMO || ui.game.local) return applyLocal(r.next);
  busy = true;
  try {
    for (let tries = 0; tries < 3; tries++) {
      const g = ui.game;
      const { data, error } = await sb.from('games')
        .update({ state: r.next, status: r.next.phase === 'ended' ? 'ended' : 'playing', version: g.version + 1, updated_at: new Date().toISOString() })
        .eq('id', g.id).eq('version', g.version)
        .select();
      if (error) { logError(`Speichern: ${error.message}`); return toast('Verbindung hakt – bitte nochmal versuchen.'); }
      if (data && data.length) { ui.game = data[0]; return render(); }
      // Jemand war schneller: neuen Stand holen und den Zug darauf nochmal versuchen
      const fresh = await sb.from('games').select('*').eq('id', g.id).single();
      if (!fresh.data) return toast('Verbindung hakt – bitte nochmal versuchen.');
      ui.game = fresh.data;
      render();
      r = attempt(); // z. B. Gebot ist inzwischen zu niedrig → Hinweis statt Speichern
      if (!r) return;
    }
    toast('Gerade ist viel los – bitte nochmal tippen.');
  } finally {
    busy = false;
  }
}

// ---------- Test-Spieler übernimmt für jemanden, der weg ist ----------

const TAKEOVER_AFTER_MS = 2 * 60 * 1000;
const nameOfSeat = (s, seat) => s.players.find((p) => p.id === seat)?.name || '?';
function withAutoplay(prev, seat, on) {
  const s = JSON.parse(JSON.stringify(prev));
  const list = new Set(s.autoplay || []);
  if (on === list.has(seat)) return null;
  if (on) list.add(seat); else list.delete(seat);
  s.autoplay = [...list];
  s.log.push(on ? `Ein Test-Spieler spielt jetzt für ${nameOfSeat(s, seat)}.` : `${nameOfSeat(s, seat)} spielt wieder selbst.`);
  return s;
}
function canTakeover(seat) {
  const s = ui.game?.state;
  if (!s || s.phase === 'ended' || (s.autoplay || []).includes(seat) || seat === seatIn(ui.game)) return false;
  if (DEMO && params.get('takeover')) return seat === params.get('takeover');
  return !!(online && offlineSince[seat] && Date.now() - offlineSince[seat] >= TAKEOVER_AFTER_MS);
}
// Test-Spieler halten die Verschnaufpause nach einem Ergebnis ein (wie echte Spieler)
let calmLog = -1;
let calmAt = 0;
function botCalm(s) {
  if (s.log.length !== calmLog) { calmLog = s.log.length; calmAt = Date.now(); }
  return s.phase === 'turn' && CALM_TYPES.includes(s.lastEvent?.type) && Date.now() - calmAt < calmFor(s.lastEvent, s.deck.length) + 300;
}
// Wer lässt die Test-Spieler laufen? Der erste Spieler am Tisch, der online ist und selbst spielt.
function botRunner() {
  const s = ui.game.state;
  const shown = onlineForDisplay();
  return s.players.map((p) => p.id).find((id) => !(s.autoplay || []).includes(id) && (!shown || shown.has(id))) || null;
}
setInterval(() => {
  if (DEMO || ui.screen !== 'playing' || !ui.game || ui.game.local || busy) return;
  const s = ui.game.state;
  if (!s?.autoplay?.length || s.phase === 'ended' || tooOld()) return;
  if (botRunner() !== seatIn(ui.game) || botCalm(s)) return;
  act((st) => botStep(st, st.autoplay || [], now()), { silent: true }).catch((e) => logError(`Test-Spieler: ${e.message}`));
}, 1500);

// ---------- Signal, wenn man gefragt ist (Ton + Vibration) ----------

const soundOn = () => store.get('kh_sound') !== 'off';
// Lautstärke: aus / leise / mittel / laut (alte Einstellung „on“ = mittel)
const SOUND_LEVELS = { off: 0, low: 0.35, on: 1, high: 1.8 };
const SOUND_NAMES = { off: 'aus', low: 'leise', on: 'mittel', high: 'laut' };
const soundLevel = () => (SOUND_LEVELS[store.get('kh_sound')] != null ? store.get('kh_sound') : 'on');
setVolume(SOUND_LEVELS[soundLevel()]);
const vibeOn = () => store.get('kh_vibe') !== 'off';
let lastNeed = '';
const baseTitle = document.title;

function beep() {
  haptic('turn', vibeOn());
  if (!soundOn()) return;
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  [[660, 0], [880, 0.14]].forEach(([f, d]) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.value = f;
    o.type = 'triangle';
    g.gain.setValueAtTime(0.0001, t + d);
    g.gain.exponentialRampToValueAtTime(0.25, t + d + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.18);
    o.connect(g).connect(ac.destination);
    o.start(t + d);
    o.stop(t + d + 0.2);
  });
}

// Prüft bei jedem Neuzeichnen, ob man neu gefragt ist: dran, herausgefordert oder muss zahlen
function checkSignal() {
  const s = ui.game?.state;
  if (!s || DEMO) return;
  let need = '';
  const seat = seatIn(ui.game);
  if (s.phase === 'turn' && s.players[s.turn]?.id === seat) need = 'turn';
  else if (s.phase === 'payment' && s.payment?.payer === seat) need = 'pay';
  else if (s.phase === 'trade' && s.trade?.target === seat) need = 'trade';
  else if (s.phase === 'rat' && ratCurrent(s) === seat) need = 'rat';
  else if (s.phase === 'block' && s.block?.player === seat) need = 'block';
  else if (s.phase === 'special') {
    const st = specialStage(s, now());
    if (st === 'decide' && s.special.revealer === seat) need = 'special';
    else if (st === 'rps' && (s.special.rps ? s.special.rps.players.includes(seat) : s.special.buzzes[seat] != null)) need = `rps${s.special.rps?.round || 1}`;
    else if (st === 'wait' && s.special.revealer !== seat) need = 'buzz';
  }
  const key = need ? `${need}|${s.log.length}` : '';
  if (key && key !== lastNeed) beep();
  lastNeed = key;
  document.title = need ? '● Du bist dran – Tier Börse' : baseTitle;
}

// ---------- Countdown der Versteigerung ticken lassen ----------
let lastAucTick = '';

setInterval(() => {
  if (ui.screen !== 'playing') return;
  const w = app.querySelector('[data-wake]');
  if (w && now() >= Number(w.dataset.wake)) { render(); return; } // Buzzer-Countdown: nächste Zahl
  const el = app.querySelector('[data-ends]');
  if (!el) return;
  const t = now();
  const ends = Number(el.dataset.ends);
  const left = ends - t;
  if (left <= 0) {
    if (!el.classList.contains('over')) render(); // Zeit gerade abgelaufen: Knöpfe umschalten
    return;
  }
  const pct = Math.min(100, (left / Number(el.dataset.total)) * 100);
  const secs = Math.ceil(left / 1000);
  if (el.dataset.fmt === 'n') { // Ring um die Karte
    const ring = el.querySelector('.ringp');
    if (ring) ring.style.strokeDashoffset = String(100 - pct);
    const sec = el.querySelector('.ringsec');
    if (sec) sec.textContent = String(secs);
    el.classList.toggle('low', secs <= 3);
    // letzte 3 Sekunden: Tick-Ton, damit Last-Second-Gebote spannend werden
    const tk = `${ends}|${secs}`;
    if (secs <= 3 && lastAucTick !== tk) { lastAucTick = tk; if (soundOn()) playSound('tick'); }
    return;
  }
  const bar = el.querySelector('i');
  const txt = el.querySelector('span');
  if (bar) bar.style.width = `${pct}%`;
  if (txt) txt.textContent = `noch ${secs} s`;
}, 100);

// ---------- Debug-Modus ----------

function startLocalGame(n) {
  const players = [{ id: 'me', name: me.name || 'Ich' }, ...Array.from({ length: n - 1 }, (_, i) => ({ id: `t${i + 1}`, name: `Test ${i + 1}` }))];
  let state = createGame({ players, seed: Math.floor(Math.random() * 2 ** 31), settings: store.get('kh_dbg_money') ? { money: { ...DEFAULT_MONEY } } : null });
  // Debug „?spaet=1“: Test-Spieler spielen bis kurz vor Schluss vor (viele Tiere, viel Geld) – zum Prüfen voller Plätze
  if (new URLSearchParams(location.search).has('spaet')) {
    let t = now(), k = 0;
    const ids = players.map((p) => p.id);
    while ((state.deck.length > 14 || state.phase !== 'turn') && state.phase !== 'ended' && k++ < 6000) { try { const n = botStep(state, ids, t); if (n) state = n; } catch { /* weiter */ } t += 700; }
  }
  Object.keys(gameLocal).forEach((k) => delete gameLocal[k]);
  dbg.viewAs = 'me';
  // Test-Spieler: zufällige, verschiedene Shop-Avatare (nicht deiner)
  const pool = SHOP_AVATARS.map((a) => a.id).filter((id) => id !== shopMe.active).sort(() => Math.random() - 0.5);
  const botAvatars = Object.fromEntries(players.slice(1).map((p, i) => [p.id, pool[i]]));
  ui.game = { id: 'local', local: true, version: 0, status: 'playing', players, state, botAvatars };
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
  if (s.phase === 'ended' || botCalm(s)) return;
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
      const lucky = s.players[Math.floor(Math.random() * s.players.length)];
      if (isMoneyCard(card)) { lucky.money.push(moneyValue(card)); lucky.money.sort((a, b) => a - b); }
      else if (isSpecialCard(card)) (lucky.specials = lucky.specials || []).push(specialAnimal(card));
      else lucky.animals[card] = (lucky.animals[card] || 0) + 1;
    }
    s.log.push('Debug: vorgespult.');
  } else if (kind === 'donkey') {
    const i = s.deck.indexOf('esel');
    if (i < 0) return toast('Kein Esel mehr im Stapel.');
    s.deck.splice(i, 1);
    s.deck.unshift('esel');
    s.log.push('Debug: Esel liegt oben.');
  } else if (kind === 'rat' || kind === 'special') {
    const i = s.deck.findIndex((c) => (kind === 'rat' ? c === RAT : isSpecialCard(c)));
    if (i < 0) return toast(kind === 'rat' ? 'Keine Ratte mehr im Stapel.' : 'Keine Spezialkarte mehr im Stapel.');
    s.deck.unshift(...s.deck.splice(i, 1));
    s.log.push(kind === 'rat' ? 'Debug: Ratte liegt oben.' : 'Debug: Spezialkarte liegt oben.');
  } else if (kind === 'broke') {
    s.players.find((p) => p.id === dbg.viewAs).money = [0, 10];
    s.log.push('Debug: Geld geleert.');
  } else if (['quartets', 'end', 'trade22', 'rich', 'zoo'].includes(kind)) {
    if (s.phase !== 'turn') return toast('Das geht nur, wenn gerade niemand versteigert oder handelt.');
    const meP = s.players.find((p) => p.id === dbg.viewAs) || s.players[0];
    const others = s.players.filter((p) => p !== meP);
    // n Karten eines Tiers zu „to“ holen: erst aus dem Stapel, dann von den anderen
    const take = (id, n, to) => {
      let got = 0;
      while (got < n) {
        const i = s.deck.indexOf(id);
        if (i >= 0) { s.deck.splice(i, 1); got++; continue; }
        const from = s.players.find((p) => p !== to && (p.animals[id] || 0) > 0);
        if (!from) break;
        from.animals[id]--; if (!from.animals[id]) delete from.animals[id]; got++;
      }
      to.animals[id] = (to.animals[id] || 0) + got;
    };
    const kinds = animalsOf(s).map((a) => a.id);
    if (kind === 'quartets' || kind === 'end') {
      // jede Tierart komplett an einen Spieler (reihum, du zuerst), alle Ratten an den Nächsten
      const order = [meP, ...others];
      kinds.forEach((id, k) => take(id, 4, order[k % order.length]));
      const ratTotal = s.players.reduce((t, p) => t + (p.animals[RAT] || 0), 0) + s.deck.filter((c) => c === RAT).length;
      if (ratTotal) take(RAT, ratTotal, order[1] || meP);
      s.log.push('Debug: Quartette verteilt.');
      if (kind === 'end') {
        s.deck = s.deck.filter((c) => !kinds.includes(c) && c !== RAT);
        try { return applyLocal(debugEnd(s)); } catch (err) { return toast(err.message); }
      }
    } else if (kind === 'trade22') {
      // du und der Nächste haben je 2× dieselbe Tierart → Kuhhandel um 2 testen
      const id = kinds.find((a) => !s.players.some((p) => p.animals[a] === 4)) || kinds[0];
      take(id, 2, meP); take(id, 2, others[0]);
      s.log.push(`Debug: ${id} 2 gegen 2.`);
    } else if (kind === 'rich') {
      meP.money = [0, 0, 10, 10, 10, 20, 20, 50, 50, 100, 100, 200, 500];
      s.log.push('Debug: viel Geld.');
    } else if (kind === 'zoo') {
      kinds.forEach((id, k) => take(id, 1 + (k % 3), meP));
      s.log.push('Debug: viele Tiere.');
    }
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
  else if (['forward', 'donkey', 'rat', 'special', 'broke', 'quartets', 'end', 'trade22', 'rich', 'zoo'].includes(k)) { dbg.panel = false; return debugShortcut(k); }
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
  const { data: { session } } = await sb.auth.getSession();
  await syncClock();
  setInterval(syncClock, 60000);
  if (session && !session.user.is_anonymous) {
    setMe(session.user);
    return true;
  }
  return false; // Anmeldung nötig
}

// ---------- Konten: Name + Passwort ----------

// Aus dem Namen wird intern eine E-Mail-Adresse (wird nirgends benutzt, nur für die Anmeldung)
const emailFor = (name) => {
  const slug = name.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug ? `${slug}@kuhhandel.app` : null;
};

function setMe(user) {
  me.id = user.id;
  me.name = user.user_metadata?.name || store.get('kh_name') || 'Spieler';
  store.set('kh_name', me.name);
}

function authMessage(err) {
  const m = (err?.message || '').toLowerCase();
  if (m.includes('invalid login')) return 'Name oder Passwort stimmt nicht.';
  if (m.includes('already') || m.includes('registered')) return 'Den Namen gibt es schon – bitte anmelden.';
  if (m.includes('password')) return 'Das Passwort muss mindestens 6 Zeichen haben.';
  if (m.includes('confirm')) return 'Konto noch nicht freigeschaltet – in Supabase muss „Confirm email“ ausgeschaltet sein.';
  return 'Das hat nicht geklappt – bitte nochmal versuchen.';
}

async function doAuth(name, pw) {
  const email = emailFor(name);
  if (!email) { auth.error = 'Bitte einen Namen mit Buchstaben oder Zahlen.'; return render(); }
  auth.busy = true; auth.error = ''; render();
  let user = null;
  let err = null;
  if (auth.mode === 'create') {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user?.is_anonymous) {
      // Bisheriges Gerät übernehmen: laufende Spiele bleiben erhalten
      const r = await sb.auth.updateUser({ email, password: pw, data: { name } });
      if (!r.error && r.data?.user?.email) user = r.data.user;
    }
    if (!user) {
      const r = await sb.auth.signUp({ email, password: pw, options: { data: { name } } });
      err = r.error;
      user = r.data?.session ? r.data.user : null;
      if (!err && !user) err = { message: 'confirm' };
    }
  } else {
    const r = await sb.auth.signInWithPassword({ email, password: pw });
    err = r.error;
    user = r.data?.user || null;
  }
  auth.busy = false;
  if (err || !user) { auth.error = authMessage(err); logError(`Anmeldung: ${err?.message}`); return render(); }
  setMe(user);
  if (!user.user_metadata?.name) await sb.auth.updateUser({ data: { name } });
  await saveProfile({});
  afterLogin();
}

async function doLogout() {
  if (roomChannel) { sb.removeChannel(roomChannel); roomChannel = null; }
  await sb.auth.signOut();
  store.del('kh_game');
  me = { id: null, name: me.name };
  auth = { mode: 'login', error: '', busy: false };
  ui.screen = 'login';
  render();
}

// ---------- Profile (Spielerbild) ----------

async function loadProfiles(ids) {
  if (!sb || DEMO) return;
  const missing = [...new Set(ids)].filter((id) => id && !profiles.has(id));
  if (!missing.length) return;
  const { data } = await sb.from('profiles').select('id, name, animal, color').in('id', missing);
  (data || []).forEach((p) => profiles.set(p.id, p));
  // gekaufte Shop-Avatare der Mitspieler (öffentlich lesbar über eine eigene Funktion; fehlt sie noch, bleibt es beim Profilbild)
  const sa = await sb.rpc('shop_public_avatars', { p_ids: missing }).then((r) => r, () => ({ data: null }));
  (sa?.data || []).forEach((r) => { if (r.active_avatar) shopAvatars.set(r.user_id, r.active_avatar); });
  if (data?.length || sa?.data?.length) render();
}

// ---------- Shop (v0.48): Dublonen, Avatare, Sprüche ----------

function myReactions() {
  if (DEMO && shopMe.state === 'idle') loadShop();
  return [...REACTIONS, ...SHOP_SAYINGS.filter((x) => shopMe.owned.has(x.id)).map((x) => x.text)]; // v0.58: nur Sprüche (Emojis entfernt, Wunsch Alp)
}

async function loadShop(force = false) {
  if (!me?.id || (!force && shopMe.state !== 'idle')) return;
  shopMe.state = 'loading';
  if (DEMO) {
    const av = params.get('myav') || 'noergler';
    Object.assign(shopMe, { state: 'ok', balance: 105, active: av, owned: new Set([av, 'noergler', 'boersen-gauner', 'spruch-nico', 'spruch-gute-ideen']), freeLeft: params.get('free') === '0' ? 0 : 2 });
    shopAvatars.set(me.id, av);
    return;
  }
  try {
    const w = await sb.from('shop_wallets').select('balance, active_avatar').eq('user_id', me.id).maybeSingle();
    if (w.error) throw w.error;
    const p = await sb.from('shop_purchases').select('item_id, price').eq('user_id', me.id);
    if (p.error) throw p.error;
    // v0.58: zwei Sprüche gratis (Preis 0) – ob die Gratis-Funktion schon in der Datenbank ist, zeigt der Shop beim Tippen
    const freeUsed = (p.data || []).filter((x) => Number(x.price) === 0).length;
    Object.assign(shopMe, { state: 'ok', balance: w.data?.balance || 0, active: w.data?.active_avatar || null, owned: new Set((p.data || []).map((x) => x.item_id)), freeLeft: Math.max(0, 2 - freeUsed) });
    if (shopMe.active) shopAvatars.set(me.id, shopMe.active); else shopAvatars.delete(me.id);
  } catch { shopMe.state = 'off'; }
  render();
}

async function openShop() {
  if (shopMe.state !== 'ok') await loadShop(true);
  if (shopMe.state !== 'ok') { ui.homeNote = 'Der Shop wird gerade eingerichtet – gleich geht’s los 🛒'; render(); setTimeout(() => { ui.homeNote = ''; render(); }, 3500); return; }
  const root = document.createElement('div');
  root.className = 'shop-overlay';
  document.body.append(root);
  const err = (e, fb) => new Error(String(e?.message || fb).replace(/^.*?:\s*/, '') || fb);
  renderShop(root, {
    me: { id: me.id, name: me.name },
    balance: shopMe.balance, owned: shopMe.owned, activeAvatar: shopMe.active, freeLeft: shopMe.freeLeft,
    async claimFree(id) {
      if (!DEMO) { const { error } = await sb.rpc('shop_claim_free', { p_item_id: id }); if (error) throw err(error, 'Der Gratis-Spruch hat nicht geklappt.'); }
      shopMe.owned.add(id); shopMe.freeLeft = Math.max(0, shopMe.freeLeft - 1);
      return { freeLeft: shopMe.freeLeft };
    },
    async buy(id) {
      if (DEMO) { const it = [...SHOP_SAYINGS].find((x) => x.id === id); shopMe.balance -= it ? it.price : 30; shopMe.owned.add(id); return { balance: shopMe.balance }; }
      const { data, error } = await sb.rpc('shop_buy', { p_item_id: id });
      if (error) throw err(error, 'Der Kauf hat nicht geklappt.');
      const row = Array.isArray(data) ? data[0] : data;
      shopMe.balance = Number(row?.new_balance ?? shopMe.balance); shopMe.owned.add(id);
      return { balance: shopMe.balance };
    },
    async setAvatar(id) {
      if (!DEMO) { const { error } = await sb.rpc('shop_set_avatar', { p_avatar_id: id }); if (error) throw err(error, 'Der Avatar konnte nicht ausgewählt werden.'); }
      shopMe.active = id; shopAvatars.set(me.id, id);
    },
    close() { root.remove(); render(); },
  });
}

async function saveProfile(change) {
  if (!profiles.has(me.id) && sb && !DEMO) {
    const { data } = await sb.from('profiles').select('id, name, animal, color').eq('id', me.id).maybeSingle();
    if (data) profiles.set(me.id, data);
  }
  const cur = profiles.get(me.id) || { animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)].id, color: PROFILE_COLORS[Math.floor(Math.random() * PROFILE_COLORS.length)] };
  const next = { ...cur, ...change, id: me.id, name: me.name };
  profiles.set(me.id, next);
  if (DEMO) return render();
  const { error } = await sb.from('profiles').upsert({ ...next, updated_at: new Date().toISOString() });
  if (error) logError(`Profil: ${error.message}`);
  render();
}

// ---------- Einladung per Link ----------

async function onInvite() {
  const url = `${location.origin}${location.pathname}?join=${encodeURIComponent(ui.game.code)}`;
  const text = `Komm zur ${GAME_NAME}! Spiel-Code ${ui.game.code}`;
  try {
    if (navigator.share) { await navigator.share({ title: GAME_NAME, text, url }); return; }
    await navigator.clipboard.writeText(`${text}: ${url}`);
    toastRoom('Link kopiert – jetzt in WhatsApp einfügen.');
  } catch { /* abgebrochen */ }
}
function toastRoom(msg) { ui.error = msg; render(); setTimeout(() => { if (ui.error === msg) { ui.error = ''; render(); } }, 3000); }

async function joinByCode(code) {
  history.replaceState(null, '', location.pathname);
  const { data } = await sb.from('games').select('id, status').eq('code', code.toUpperCase()).eq('status', 'lobby')
    .order('created_at', { ascending: false }).limit(1);
  if (data?.length) return onJoin(data[0].id);
  ui.error = `Kein offener Warteraum mit Code ${code} gefunden.`;
  return openStart();
}

// ---------- Reaktionen ----------

function activeReactions() {
  const t = Date.now();
  const out = {};
  for (const [seat, r] of reactions) if (r.until > t) out[seat] = { text: r.text, from: r.from, until: r.until };
  return out;
}
// Reaktion erscheint beim Empfänger (to) – mit Absender – oder beim Absender selbst (an alle)
function showReaction(seat, text, to = null) {
  const at = to || seat;
  reactions.set(at, { text, from: to ? seat : null, until: Date.now() + 3200 });
  if (soundOn() && !DEMO) playSound(text === EHRLICH ? 'ehrlich' : text === UNEHRLICH ? 'boo' : 'react');
  render();
  setTimeout(render, 3300);
}
function sendReaction(text, to = null) {
  if (Date.now() - lastReactAt < 2500) return toast('Kurz warten – nicht so schnell hintereinander.');
  lastReactAt = Date.now();
  const seat = ui.game.local ? dbg.viewAs : seatIn(ui.game);
  showReaction(seat, text, to);
  if (!ui.game.local && roomChannel) roomChannel.send({ type: 'broadcast', event: 'react', payload: { seat, text, to } });
}

// ---------- Erste-Runde-Hilfe ----------


// ---------- Ergebnisse für die Bestenliste ----------

const recorded = new Set();
let myRewards = null; // { game, list: [{ kind, amount }] } – Dublonen dieser Partie (v0.55)
function maybeRecordResults() {
  const g = ui.game;
  if (!g || g.local || DEMO || g.state?.phase !== 'ended' || recorded.has(g.id)) return;
  recorded.add(g.id);
  const rows = scores(g.state).map((r) => {
    const pl = g.players.find((x) => (x.seat || x.id) === r.id);
    const st = g.state.stats?.[r.id] || {};
    const extras = { animals: r.quartets, maxBuy: st.maxBuy || null, tradesWon: st.tradesWon || 0, tradesLost: st.tradesLost || 0, ratsTaken: st.ratsTaken || 0, specialsWon: st.specialsWon || 0 };
    return pl ? { player_id: pl.id, name: r.name, score: r.score, quartets: r.quartets.length, won: (g.state.winner || []).includes(r.id), extras } : null;
  }).filter(Boolean);
  sb.rpc('record_results', { p_game: g.id, p_rows: rows }).then(async ({ error }) => {
    if (error) { logError(`Ergebnisse: ${error.message}`); return; }
    // v0.55: eigene Gutschriften dieser Partie fürs Siegertreppchen (fehlt die Funktion noch → altes „+10 am Sieger“)
    const rw = await sb.rpc('shop_my_rewards', { p_game: g.id }).then((r) => r, () => ({ error: true }));
    if (!rw.error) { myRewards = { game: g.id, list: rw.data || [] }; loadShop(true); render(); }
  });
}

const DEMO_STATS = [
  { id: 'u2', name: 'Nico', games: 9, wins: 4, best: 6400, quartets: 23 },
  { id: 'u1', name: 'Alp', games: 9, wins: 3, best: 7150, quartets: 25 },
  { id: 'u3', name: 'Bennet', games: 7, wins: 2, best: 4200, quartets: 14 },
  { id: 'u4', name: 'Mo', games: 4, wins: 0, best: 1300, quartets: 6 },
];

async function loadStats() {
  if (DEMO) { modal.stats = DEMO_STATS; return render(); }
  const { data, error } = await sb.from('game_results').select('player_id, name, score, quartets, won, created_at').order('created_at', { ascending: false }).limit(2000);
  if (error) { modal.error = 'Bestenliste konnte nicht geladen werden.'; return render(); }
  const by = new Map();
  for (const r of data) {
    const st = by.get(r.player_id) || { id: r.player_id, name: r.name, games: 0, wins: 0, best: 0, quartets: 0 };
    st.games += 1; st.wins += r.won ? 1 : 0; st.best = Math.max(st.best, r.score); st.quartets += r.quartets;
    by.set(r.player_id, st);
  }
  modal.stats = [...by.values()].sort((a, b) => b.wins - a.wins || b.wins / b.games - a.wins / a.games || b.best - a.best);
  loadProfiles(modal.stats.map((x) => x.id));
  render();
}

// Eigene Statistik (Startseite → „Meine Statistik“)
const DEMO_MYSTATS = Array.from({ length: 12 }, (_, k) => ({ score: [1500, 4870, 3200, 900, 7150, 2600, 3900, 1200, 5400, 2100, 3300, 4100][k], quartets: [3, 5, 4, 2, 6, 3, 4, 2, 5, 3, 4, 4][k], won: [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1][k] === 1,
  extras: k < 8 ? { animals: [['kuh', 'hund', 'katze'], ['kuh', 'pferd', 'esel', 'gans', 'hahn'], ['kuh', 'schaf', 'hund', 'ziege']][k % 3], maxBuy: { animal: ['pferd', 'kuh', 'schwein'][k % 3], amount: [620, 410, 380][k % 3] }, tradesWon: k % 3 + 1, tradesLost: k % 2 } : null }));
async function loadMyStats() {
  if (DEMO) { modal.mine = DEMO_MYSTATS; return render(); }
  let res = await sb.from('game_results').select('score, quartets, won, created_at, extras').eq('player_id', me.id).order('created_at', { ascending: false }).limit(500);
  if (res.error) res = await sb.from('game_results').select('score, quartets, won, created_at').eq('player_id', me.id).order('created_at', { ascending: false }).limit(500);
  if (res.error) { modal.error = 'Statistik konnte nicht geladen werden.'; return render(); }
  modal.mine = res.data || [];
  render();
}
function myStatsBody(rows) {
  if (!rows) return '<p class="mtext">Lädt …</p>';
  if (!rows.length) return '<p class="mtext">Noch keine fertigen Spiele. Nach deinem ersten Spielende steht hier deine Statistik.</p>';
  const n = rows.length; const wins = rows.filter((r) => r.won).length;
  const avg = (k) => Math.round(rows.reduce((a, r) => a + r[k], 0) / n * (k === 'quartets' ? 10 : 1)) / (k === 'quartets' ? 10 : 1);
  const best = Math.max(...rows.map((r) => r.score));
  const ex = rows.map((r) => r.extras).filter(Boolean);
  const count = {};
  ex.forEach((e) => (e.animals || []).forEach((a) => { count[a] = (count[a] || 0) + 1; }));
  const fav = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
  const buy = ex.map((e) => e.maxBuy).filter(Boolean).sort((a, b) => b.amount - a.amount)[0];
  const tw = ex.reduce((a, e) => a + (e.tradesWon || 0), 0); const tl = ex.reduce((a, e) => a + (e.tradesLost || 0), 0);
  const aname = (id) => ANIMALS.find((a) => a.id === id)?.name || id;
  const last = rows.slice(0, 12).reverse();
  return `<div class="mys">
    <div class="mysnums">
      <div><b>${n}</b><small>Spiele</small></div><div><b>${wins}</b><small>Siege</small></div><div><b>${Math.round((wins / n) * 100)} %</b><small>Quote</small></div>
      <div><b>${best}</b><small>Rekord</small></div><div><b>${avg('score')}</b><small>Ø Punkte</small></div><div><b>${String(avg('quartets')).replace('.', ',')}</b><small>Ø Quartette</small></div>
    </div>
    <h3>Letzte Spiele</h3>
    <div class="myslast">${last.map((r) => `<span class="${r.won ? 'w' : ''}" title="${r.score} Punkte"><i style="height:${Math.max(8, Math.round((r.score / best) * 46))}px"></i><small>${r.won ? '🏆' : ''}</small></span>`).join('')}</div>
    <div class="mysfacts">
      ${fav ? `<div>${miniCard(fav[0])}<span><small>Lieblingstier</small><b>${esc(aname(fav[0]))}</b><em>${fav[1]}× als Quartett</em></span></div>` : ''}
      ${buy ? `<div>${miniCard(buy.animal)}<span><small>Teuerster Kauf</small><b>${esc(aname(buy.animal))} für ${buy.amount}</b></span></div>` : ''}
      ${ex.length ? `<div><span class="mysvs">⇄</span><span><small>Kuhhandel</small><b>${tw} gewonnen · ${tl} verloren</b></span></div>` : ''}
    </div>
    ${ex.length < n ? `<p class="tnote">Lieblingstier, teuerster Kauf und Kuhhandel werden seit v0.28 gezählt.</p>` : ''}
  </div>`;
}

async function afterLogin() {
  ui.screen = 'start';
  sb.rpc('is_admin').then(({ data }) => { if (data === true) { ui.isAdmin = true; render(); } }, () => {});
  const autoTest = store.get('kh_dbg_autostart'); // Testspiel aus dem Admin-Bereich (nach dem Neuladen)
  if (autoTest && DEBUG) { store.del('kh_dbg_autostart'); return startLocalGame(Number(autoTest)); }
  watchLobby();
  loadProfiles([me.id]);
  const join = params.get('join');
  if (join) return joinByCode(join);
  const saved = store.get('kh_game');
  if (saved) {
    const { data, error } = await sb.from('games').select('*').eq('id', saved).maybeSingle();
    if (data && data.players.some((p) => p.id === me.id)) { showGame(data); return watchRoom(data.id); }
    if (!error) store.del('kh_game'); // nur vergessen, wenn das Spiel wirklich weg ist
  }
  openStart();
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
    .select('id, code, host, status, players, created_at, state')
    .eq('status', 'lobby').gte('created_at', since)
    .order('created_at', { ascending: false }).limit(30);
  if (error) { ui.error = 'Spiele konnten nicht geladen werden.'; return; }
  ui.games = data;
  // Laufende Spiele, in denen ich sitze (z. B. nach „Spiel verlassen“ oder Handywechsel)
  const recent = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const mine = await sb.from('games')
    .select('id, code, host, status, players, updated_at, state')
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
  roomChannel = sb.channel('game-' + id, { config: { presence: { key: seatIn(ui.game) } } })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${id}` }, (payload) => {
      if (payload.eventType === 'DELETE') {
        // Supabase meldet Löschungen ALLER Spiele – nur reagieren, wenn wirklich unser Spiel weg ist
        if (payload.old?.id !== id) return;
        store.del('kh_game');
        ui.error = 'Das Spiel wurde geschlossen.';
        openStart();
        return;
      }
      dbg.lastSync = Date.now();
      showGame(payload.new);
    })
    .on('broadcast', { event: 'nudge' }, ({ payload }) => gotNudge(payload))
    .on('broadcast', { event: 'react' }, ({ payload }) => {
      if (!payload?.seat || !(REACTIONS.includes(payload.text) || SAYING_TEXTS.includes(payload.text) || REACT_EMOJI.includes(payload.text))) return;
      const to = typeof payload.to === 'string' && ui.game?.state?.players?.some((p) => p.id === payload.to) ? payload.to : null;
      showReaction(payload.seat, payload.text, to);
    })
    .on('presence', { event: 'sync' }, () => {
      const ps = roomChannel.presenceState();
      online = new Set(Object.keys(ps));
      versions = Object.fromEntries(Object.entries(ps).map(([k, arr]) => [k, arr?.[0]?.v || '0.0.0']));
      const t = Date.now();
      for (const p of ui.game?.players || []) {
        const seat = p.seat || p.id;
        if (online.has(seat)) delete offlineSince[seat];
        else if (!offlineSince[seat]) offlineSince[seat] = t;
      }
      if (ui.screen === 'playing' || ui.screen === 'room') render();
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') roomChannel.track({ name: me.name, v: APP_VERSION });
      // Verbindung weg (z. B. Handy im Standby): Stand neu laden und neu verbinden
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') scheduleResync();
    });
}

// Erst nach 15 Sekunden ohne Verbindung als „offline“ anzeigen (kurze Aussetzer ignorieren)
function onlineForDisplay() {
  if (!online || !ui.game) return null;
  const t = Date.now();
  return new Set(ui.game.players.map((p) => p.seat || p.id).filter((id) => !(offlineSince[id] && t - offlineSince[id] > 15000)));
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
  if (g.status === 'lobby' && !g.local && !DEMO && !g.players.some((p) => p.id === me.id)) {
    store.del('kh_game');
    ui.error = 'Du wurdest aus dem Warteraum entfernt.';
    if (roomChannel) { sb.removeChannel(roomChannel); roomChannel = null; }
    return openStart();
  }
  loadProfiles(g.players.map((p) => p.id));
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
  if (error) { ui.error = 'Spiel konnte nicht erstellt werden.'; logError(`Erstellen: ${error.message}`); return render(); }
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
  ui.game = null;
  showGame(g);
  watchRoom(g.id);
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
  const state = createGame({ players: g.players.map((p) => ({ id: p.seat || p.id, name: p.name })), seed: Math.floor(Math.random() * 2 ** 31), settings: g.state?.settings || null });
  state.minVersion = APP_VERSION;
  const { data, error } = await sb.from('games')
    .update({ status: 'playing', state, version: g.version + 1, updated_at: new Date().toISOString() })
    .eq('id', g.id).eq('version', g.version)
    .select().single();
  if (error) { ui.error = 'Start hat nicht geklappt – bitte nochmal versuchen.'; return render(); }
  showGame(data);
}

async function openStart() {
  if (sb && !DEMO) sb.rpc('cleanup_old_games').then(() => {}, () => {}); // alte Spiele löschen (still)
  ui.screen = 'start';
  ui.game = null;
  await loadGames();
  render();
}

// ---------- Revanche ----------

// Revanche: wer im letzten Spiel die wenigsten Punkte hatte, fängt an
function loserStarts(state, old) {
  try {
    const sc = scores(old).sort((a, b) => a.score - b.score);
    const i = state.players.findIndex((p) => p.id === sc[0]?.id);
    if (i >= 0) state.turn = i;
  } catch { /* dann eben wie immer */ }
}
async function onRematch() {
  const g = ui.game;
  if (g.local) {
    const players = g.state.players.map((p) => ({ id: p.id, name: p.name }));
    const state = createGame({ players, seed: Math.floor(Math.random() * 2 ** 31), settings: g.state.settings || null });
    loserStarts(state, g.state);
    Object.keys(gameLocal).forEach((k) => delete gameLocal[k]);
    ui.game = { ...g, version: 0, status: 'playing', state };
    return render();
  }
  // Gibt es schon eine Revanche? Dann einfach beitreten
  const goTo = async (id) => {
    for (let i = 0; i < 5; i++) {
      const { data } = await sb.from('games').select('*').eq('id', id).maybeSingle();
      if (data) { gameLocal.menu = false; return enterRoom(data); }
      await new Promise((r) => setTimeout(r, 800));
    }
    toast('Revanche nicht gefunden – bitte nochmal tippen.');
  };
  if (g.state.rematchId) return goTo(g.state.rematchId);
  const newId = crypto.randomUUID();
  // Erst im alten Spiel eintragen (wer zuerst tippt, gewinnt) – dann neues Spiel anlegen
  const { data: claimed } = await sb.from('games')
    .update({ state: { ...g.state, rematchId: newId }, version: g.version + 1, updated_at: new Date().toISOString() })
    .eq('id', g.id).eq('version', g.version).select();
  if (!claimed || !claimed.length) {
    const fresh = await sb.from('games').select('*').eq('id', g.id).single();
    if (fresh.data?.state?.rematchId) return goTo(fresh.data.state.rematchId);
    return toast('Hat nicht geklappt – bitte nochmal tippen.');
  }
  const players = g.players.map((p) => ({ id: p.id, name: p.name }));
  const state = createGame({ players, seed: Math.floor(Math.random() * 2 ** 31), settings: g.state.settings || null });
  loserStarts(state, g.state);
  state.minVersion = APP_VERSION;
  // v0.55: Revanche über die Server-Funktion (prüft: nur nach Spielende, nur dieselben Spieler).
  // Solange das v0.55-SQL noch nicht eingespielt ist, gibt es die Funktion nicht → wie bisher direkt anlegen.
  let { data, error } = await sb.rpc('create_rematch', { p_from: g.id, p_id: newId, p_code: randomCode(), p_players: players, p_state: state });
  if (error && (error.code === 'PGRST202' || /create_rematch/.test(error.message || ''))) {
    ({ data, error } = await sb.from('games')
      .insert({ id: newId, code: randomCode(), host: me.id, status: 'playing', players, state, version: 1 })
      .select().single());
  }
  if (error) { logError(`Revanche: ${error.message}`); return toast('Revanche konnte nicht starten.'); }
  enterRoom(data);
}

// ---------- Fenster: Regeln, Installieren, Wiedereinstieg ----------

let modal = null; // { kind, pin, error }
function openModal(kind) {
  modal = { kind };
  gameLocal.menu = false;
  if (kind === 'pin') loadPin();
  if (kind === 'stats') loadStats();
  if (kind === 'mystats') loadMyStats();
  if (kind === 'admin') { modal.tab = 'users'; loadAdmin(); }
  render();
}
async function loadPin() {
  if (!ui.game || ui.game.local) { modal.pin = '—'; return render(); }
  const { data, error } = await sb.rpc('my_pin', { p_game: ui.game.id });
  modal.pin = error ? null : data;
  modal.error = error ? 'PIN konnte nicht geladen werden.' : '';
  render();
}

const RULES = `
  <h3>Ziel</h3><p>Sammle Quartette (alle 4 Karten einer Tierart). Am Ende zählt: (Summe deiner Quartettwerte + passende Spezialkarten) × Anzahl deiner Quartette. Spezialkarten ohne eigenes Quartett: +250 danach.</p>
  <h3>Karten</h3><div class="rcards">${ANIMALS.map((a) => `<span class="rcard">${miniCard(a.id)}<b>${a.value}</b><small>${a.name}</small></span>`).join('')}</div><p>Dazu 10 Spezialkarten (je 250) und 4 Ratten. 54 Karten.</p>
  <h3>Start</h3><p>Jeder hat 100 Taler: 2× 0, 3× 10, 1× 20, 1× 50. Wie viel die anderen haben, siehst du nicht – nur wie viele Scheine.</p>
  <h3>Dein Zug</h3><p><b>Versteigern:</b> Du deckst eine Karte auf. Bei einem Tier bieten die anderen. Nach jedem Gebot läuft die Uhr neu. Ist sie abgelaufen, entscheidest du: Zuschlag an den Höchstbietenden – oder du kaufst selbst zum Höchstgebot.<br>
  <b>Esel:</b> Wird ein Esel aufgedeckt, bekommen alle Geld von der Bank (50, 100, 200, 500).<br>
  <b>Kein Wechselgeld:</b> Wer zahlt, wählt seine Scheine selbst. Zu viel gezahlt ist weg.<br>
  <b>Kann nicht zahlen?</b> Dann alle Scheine offen zeigen, die Auktion startet neu – du darfst höchstens dein altes Gebot minus 10 bieten.</p>
  <p><b>Kuhhandel:</b> Fordere jemanden heraus, der dieselbe Tierart hat. Du bietest verdeckt. Er nimmt dein Geld und gibt das Tier ab – oder bietet verdeckt dagegen. Die Gebote werden immer getauscht, das höhere gewinnt die Tiere, bei Gleichstand der Herausforderer. Haben beide 2 Karten, geht es um 2.</p>
  <h3>Ratte</h3><p>Wird eine Ratte aufgedeckt, geht es reihum (links vom Aufdecker, er selbst macht mit): Jeder legt eine Karte verdeckt in die Mitte (auch ein 0er) – oder nimmt die Ratte und bekommt alle gelegten Karten. Wer keine Karten mehr hat, muss sie nehmen. Danach deckt der Aufdecker noch eine Karte auf (ist der Stapel leer: Kuhhandel).<br>
  <b>Rattenhandel:</b> Nur wenn beide eine Ratte haben. Wie Kuhhandel, aber umgekehrt: Wer mehr bietet, wird die Ratte los. Gleichstand: Herausforderer.<br>
  Am Ende hat einer alle 4 Ratten – er wählt eines seiner Quartette, das nicht zählt.</p>
  <h3>Spezialkarte</h3><p>Nicht handelbar, Wert 250. Alle außer dem Aufdecker sehen einen Countdown von 10 abwärts. Wer zuerst „Buzz“ drückt, bietet so viele verdeckte Karten, wie die Zahl zeigt. Gleichstand: Schnick-Schnack-Schnuck. Der Aufdecker entscheidet: selbst kaufen (er zahlt dem Buzzer so viele Karten) oder verkaufen (der Buzzer zahlt ihm). Der Zahler sucht die Karten selbst aus. Drückt niemand, bekommt der Aufdecker sie umsonst. Wer nicht genug Karten hat, zeigt alle offen und darf danach erst bei seiner Kartenanzahl drücken.</p>
  <h3>Geldscheine im Stapel</h3><p>Kann der Gastgeber im Warteraum einschalten (bis zu 20 Scheine, Werte frei wählbar). Wird ein Geldschein aufgedeckt, bekommt ihn der Aufdecker – alle sehen den Betrag – und sein Zug ist vorbei.</p>
  <h3>Ende</h3><p>Ist der Stapel leer, wird nur noch gehandelt – bis alle Quartette komplett sind und einer alle Ratten hat.</p>`;

function renderModal() {
  let el = document.getElementById('modal');
  if (!modal) { el?.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'modal'; document.body.appendChild(el); }
  let body = '';
  if (modal.kind === 'design') body = themeModal(theme);
  if (modal.kind === 'rules') body = `<h2>Spielregeln</h2><div class="rules">${RULES}</div>`;
  if (modal.kind === 'install') {
    body = `<h2>Als App aufs Handy</h2>
      ${installPrompt ? '<button type="button" class="pill pill-red pill-small" data-m="doInstall">Jetzt installieren</button>' : ''}
      <div class="rules">
        <h3>iPhone (Safari)</h3><p>Unten auf das Teilen-Symbol (Quadrat mit Pfeil) tippen → „Zum Home-Bildschirm“ → „Hinzufügen“.</p>
        <h3>Android (Chrome)</h3><p>Oben rechts auf ⋮ tippen → „App installieren“ oder „Zum Startbildschirm hinzufügen“.</p>
        <p>Danach startest du die Tier Börse über das Kuh-Symbol – im Vollbild, ohne Browserleisten.</p>
      </div>`;
  }
  if (modal.kind === 'pin') {
    body = `<h2>Wiedereinstieg</h2>
      <p class="mtext">Damit kommst du auf einem anderen Gerät zurück auf deinen Platz. Nicht weitergeben!</p>
      <div class="pinbox"><div><small>Spiel-Code</small><b>${esc(ui.game?.code || '—')}</b></div><div><small>Deine PIN</small><b>${modal.pin === undefined ? '…' : esc(modal.pin || '—')}</b></div></div>
      ${modal.error ? `<div class="error">${esc(modal.error)}</div>` : ''}`;
  }
  if (modal.kind === 'profile') {
    const pr = profiles.get(me.id) || {};
    body = `<h2>Dein Spielerbild</h2>
      <div class="prof-preview">${avatarHtml(me.id, me.name)}<strong>${esc(me.name)}</strong></div>
      <h3 class="ph">Tier</h3>
      <div class="pick-animals">${ANIMALS.map((a) => `<button type="button" class="pa ${pr.animal === a.id ? 'on' : ''}" data-m="animal" data-v="${a.id}" aria-label="${a.name}" style="--bg:${esc(pr.color || '#7FA88A')}">${art(a.id)}</button>`).join('')}</div>
      <h3 class="ph">Farbe</h3>
      <div class="pick-colors">${PROFILE_COLORS.map((c) => `<button type="button" class="pc ${pr.color === c ? 'on' : ''}" data-m="color" data-v="${c}" aria-label="Farbe" style="background:${c}"></button>`).join('')}</div>
      <h3 class="ph">Passwort ändern</h3>
      <form id="pw-form" class="pwform">
        <input name="pw" type="password" minlength="6" autocomplete="new-password" placeholder="Neues Passwort (mind. 6 Zeichen)" required>
        <button type="submit" class="pill pill-white pill-small">Speichern</button>
      </form>
      ${modal.pwMsg ? `<div class="${modal.pwOk ? 'okmsg' : 'error'}" role="status">${esc(modal.pwMsg)}</div>` : ''}`;
  }
  if (modal.kind === 'admin') body = adminBody();
  if (modal.kind === 'mystats') body = `<h2>Meine Statistik</h2>${myStatsBody(modal.mine)}`;
  if (modal.kind === 'stats') {
    const rows = modal.stats;
    body = `<h2>Bestenliste</h2>
      ${!rows ? '<p class="mtext">Lädt …</p>' : !rows.length ? '<p class="mtext">Noch keine fertigen Spiele. Nach dem ersten Spielende steht hier, wer vorne liegt.</p>' : `
      <table class="stats">
        <thead><tr><th></th><th>Spieler</th><th>Siege</th><th>Spiele</th><th>Quote</th><th>Rekord</th><th>Ø Quartette</th></tr></thead>
        <tbody>${rows.map((r, i) => `<tr class="${r.id === me.id ? 'me' : ''}"><td class="rank">${i + 1}</td>
          <td class="who">${avatarHtml(r.id, r.name, 'tiny')}${esc(profiles.get(r.id)?.name || r.name)}</td>
          <td><b>${r.wins}</b></td><td>${r.games}</td><td>${Math.round((r.wins / r.games) * 100)} %</td>
          <td>${r.best}</td><td>${(r.quartets / r.games).toFixed(1).replace('.', ',')}</td></tr>`).join('')}</tbody>
      </table>`}
      ${modal.error ? `<div class="error">${esc(modal.error)}</div>` : ''}`;
  }
  if (modal.kind === 'news') {
    body = `<h2>📰 Was ist neu?</h2><div class="news">${WHATS_NEW.map((n, i) => `<section class="${i === 0 ? 'cur' : ''}"><h3>v${n.v} <small>${n.date}</small>${n.v === APP_VERSION ? '<em>deine Version</em>' : ''}</h3><ul>${n.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>`).join('')}</div>`;
  }
  if (modal.kind === 'settings') {
    const row = (m, v, icon, label, right = '›', cls = '') => `<button type="button" class="srow ${cls}" data-m="${m}" ${v ? `data-v="${v}"` : ''}><i>${icon}</i><span>${label}</span><em>${right}</em></button>`;
    const pr = profiles.get(me.id);
    body = `<h2>⚙️ Einstellungen</h2><div class="srows">
      ${row('go', 'profile', '🖼️', 'Profilbild', pr ? esc(ANIMALS.find((a) => a.id === pr.animal)?.name || '') + ' ›' : '›')}
      ${row('go', 'design', '🎨', 'Aussehen')}
      ${PUSH_PUBLIC_KEY ? row('push', '', '🔔', 'Benachrichtigen', `<span class="stog ${pushOn() ? 'on' : ''}"></span>`) : ''}
      ${isStandalone() ? '' : row('go', 'install', '📲', 'Als App installieren')}
      ${row('go', 'mystats', '📊', 'Meine Statistik')}
      ${row('go', 'news', '📰', 'Was ist neu?', `v${APP_VERSION} ›`)}
      ${ui.isAdmin ? row('go', 'admin', '🛠️', 'Admin') : ''}
      ${row('logout', '', '🚪', 'Abmelden', '', 'out')}
    </div>`;
  }
  if (modal.kind === 'rejoin') {
    body = `<h2>Mit Code zurück ins Spiel</h2>
      <p class="mtext">Code und PIN findest du auf deinem alten Gerät im Spiel unter Menü → „Wiedereinstieg-Code“.</p>
      <form id="rejoin-form" class="rejoin">
        <label>Spiel-Code<input name="code" maxlength="4" autocomplete="off" autocapitalize="characters" required></label>
        <label>PIN<input name="pin" maxlength="4" inputmode="numeric" autocomplete="off" required></label>
        <button type="submit" class="pill pill-red pill-small">Einsteigen</button>
      </form>
      ${modal.error ? `<div class="error" role="alert">${esc(modal.error)}</div>` : ''}`;
  }
  const html = `<div class="mback" data-m="close"></div><div class="mbox" role="dialog" aria-modal="true">
    <button type="button" class="mclose" data-m="close" aria-label="Schließen">✕</button>${body}</div>`;
  if (el._html === html) return; // nichts geändert: Eingaben nicht wegwerfen
  el._html = html;
  // Scrollstand behalten (z. B. beim Durchprobieren im Fenster „Aussehen“)
  const keep = el.querySelector('.mbox')?.scrollTop || 0;
  const sameKind = el._kind === modal.kind;
  el._kind = modal.kind;
  el.innerHTML = html;
  if (sameKind && keep) { const box = el.querySelector('.mbox'); if (box) box.scrollTop = keep; }
  el.onclick = async (e) => {
    const b = e.target.closest('[data-m]');
    if (!b) return;
    if (b.dataset.m === 'close') { modal = null; return render(); }
    if (b.dataset.m === 'go') return openModal(b.dataset.v);
    if (b.dataset.m === 'push') { await togglePush(); return render(); }
    if (b.dataset.m === 'logout') { modal = null; render(); return doLogout(); }
    if (b.dataset.m === 'doInstall' && installPrompt) { installPrompt.prompt(); installPrompt = null; modal = null; return render(); }
    if (b.dataset.m === 'animal') return saveProfile({ animal: b.dataset.v });
    if (b.dataset.m === 'theme' || b.dataset.m === 'themePreset' || b.dataset.m === 'themeReset') {
      if (b.dataset.m === 'theme') theme = { ...theme, [b.dataset.k]: b.dataset.v };
      if (b.dataset.m === 'themePreset') theme = { ...PRESETS[b.dataset.v].v, bigText: theme.bigText };
      if (b.dataset.m === 'themeReset') theme = { ...DEFAULT_THEME, bigText: theme.bigText };
      saveTheme(store, theme); applyTheme(theme); return render();
    }
    if (modal.kind === 'admin') {
      const v = b.dataset.v;
      const nameOf = (id) => modal.adminData?.users?.find((u) => u.id === id)?.name || 'Spieler';
      if (b.dataset.m === 'dbgToggle') { if (DEBUG) store.del('kh_debug'); else store.set('kh_debug', '1'); if (!DEMO) location.reload(); return; }
      if (b.dataset.m === 'dbgMoney') { if (store.get('kh_dbg_money')) store.del('kh_dbg_money'); else store.set('kh_dbg_money', '1'); return render(); }
      if (b.dataset.m === 'dbgStart') {
        if (DEMO) return;
        if (!DEBUG) { store.set('kh_debug', '1'); store.set('kh_dbg_autostart', v); location.reload(); return; }
        modal = null; return startLocalGame(Number(v));
      }
      if (b.dataset.m === 'tab') { modal.tab = v; modal.confirm = null; modal.pwFor = null; modal.okMsg = ''; modal.error = ''; render(); return loadAdmin(); }
      if (b.dataset.m === 'ask') { modal.confirm = v; return render(); }
      if (b.dataset.m === 'pwOpen') { modal.pwFor = modal.pwFor === v ? null : v; return render(); }
      if (b.dataset.m === 'mkadmin') return adminAction('admin_set_admin', { p_user: v, p_on: true }, `${nameOf(v)} ist jetzt Admin.`);
      if (b.dataset.m === 'unadmin') return adminAction('admin_set_admin', { p_user: v, p_on: false }, `${nameOf(v)} ist kein Admin mehr.`);
      if (b.dataset.m === 'delUser') return adminAction('admin_delete_user', { p_user: v }, `${nameOf(v)} wurde gelöscht.`);
      if (b.dataset.m === 'delGame') return adminAction('admin_delete_game', { p_game: v }, 'Spiel gelöscht.');
      if (b.dataset.m === 'delResult') return adminAction('admin_delete_result', { p_game: v }, 'Ergebnis entfernt.');
      if (b.dataset.m === 'resetResults') return adminAction('admin_reset_results', {}, 'Bestenliste zurückgesetzt.');
      if (b.dataset.m === 'clearErrors') return adminAction('admin_clear_errors', {}, 'Fehlerberichte gelöscht.');
    }
    if (b.dataset.m === 'color') return saveProfile({ color: b.dataset.v });
  };
  el.querySelectorAll('form.apw').forEach((f) => { f.onsubmit = (e) => {
    e.preventDefault();
    const pw = String(new FormData(f).get('pw')).trim();
    const id = f.dataset.user;
    const name = modal.adminData?.users?.find((u) => u.id === id)?.name || 'Spieler';
    if (pw.length < 6) { modal.error = 'Mindestens 6 Zeichen.'; return render(); }
    adminAction('admin_set_password', { p_user: id, p_password: pw }, `Neues Passwort für ${name} gesetzt: ${pw}`);
  }; });
  const pwForm = el.querySelector('#pw-form');
  if (pwForm) pwForm.onsubmit = async (e) => {
    e.preventDefault();
    const pw = String(new FormData(pwForm).get('pw'));
    if (pw.length < 6) { modal.pwMsg = 'Mindestens 6 Zeichen.'; modal.pwOk = false; return render(); }
    if (DEMO) { modal.pwMsg = 'Passwort geändert.'; modal.pwOk = true; return render(); }
    const { error } = await sb.auth.updateUser({ password: pw });
    modal.pwOk = !error;
    modal.pwMsg = error ? 'Hat nicht geklappt – bitte nochmal versuchen.' : 'Passwort geändert. Ab jetzt mit dem neuen anmelden.';
    render();
  };
  const form = el.querySelector('#rejoin-form');
  if (form) form.onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const { data, error } = await sb.rpc('claim_seat', { p_code: String(f.get('code')), p_pin: String(f.get('pin')) });
    if (error || !data) { modal.error = 'Code oder PIN stimmt nicht.'; return render(); }
    modal = null;
    enterRoom(data);
  };
}

// ---------- Admin-Bereich (nur Alp und Nico, geprüft in Supabase) ----------

const ADMIN_DEMO = {
  users: [
    { id: 'u1', name: 'Alp', email: 'alp@kuhhandel.app', last_sign_in_at: new Date(Date.now() - 6e5).toISOString(), games: 9, wins: 3, is_admin: true },
    { id: 'u2', name: 'Nico', email: 'nico@kuhhandel.app', last_sign_in_at: new Date(Date.now() - 864e5).toISOString(), games: 9, wins: 4, is_admin: true },
    { id: 'u3', name: 'Bennet', email: 'bennet@kuhhandel.app', last_sign_in_at: new Date(Date.now() - 3 * 864e5).toISOString(), games: 7, wins: 2, is_admin: false },
    { id: 'u5', name: 'Test', email: 'test@kuhhandel.app', last_sign_in_at: null, games: 0, wins: 0, is_admin: false },
  ],
  games: [
    { id: 'g1', code: 'HOFX', status: 'playing', phase: 'special', players: [{ name: 'Alp' }, { name: 'Nico' }, { name: 'Bennet' }], updated_at: new Date(Date.now() - 2e5).toISOString() },
    { id: 'g2', code: 'MUHH', status: 'lobby', phase: null, players: [{ name: 'Nico' }], updated_at: new Date(Date.now() - 36e5).toISOString() },
  ],
  results: [
    { game_id: 'r1', created_at: new Date(Date.now() - 864e5).toISOString(), rows: [{ name: 'Nico', score: 4870, won: true }, { name: 'Alp', score: 3750, won: false }, { name: 'Bennet', score: 1500, won: false }] },
  ],
  errors: [
    { id: 1, created_at: new Date(Date.now() - 9e5).toISOString(), name: 'Bennet', version: '0.13.0', message: 'Fehler: Cannot read properties of undefined (reading \'money\')', context: { phase: 'rat', screen: 'playing' } },
  ],
};
const ADMIN_RPC = { users: 'admin_users', games: 'admin_games', results: 'admin_results', errors: 'admin_errors' };
async function loadAdmin() {
  const tab = modal.tab;
  if (tab === 'debug') return render(); // läuft nur auf diesem Gerät, nichts zu laden
  modal.adminData = modal.adminData || {};
  if (DEMO) { modal.adminData[tab] = ADMIN_DEMO[tab]; return render(); }
  const { data, error } = await sb.rpc(ADMIN_RPC[tab]);
  if (!modal || modal.kind !== 'admin') return;
  if (error) { modal.error = 'Laden hat nicht geklappt (Admin-SQL ausgeführt?).'; return render(); }
  modal.adminData[tab] = data || [];
  render();
}
async function adminAction(rpc, args, okMsg) {
  modal.error = ''; modal.okMsg = '';
  if (DEMO) { modal.okMsg = okMsg; modal.confirm = null; modal.pwFor = null; return render(); }
  const { error } = await sb.rpc(rpc, args);
  modal.confirm = null;
  if (error) { modal.error = `Hat nicht geklappt: ${error.message}`; return render(); }
  modal.okMsg = okMsg; modal.pwFor = null;
  loadAdmin();
}
const fmtTime = (iso) => {
  if (!iso) return 'nie';
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d) / 60000);
  if (mins < 60) return `vor ${Math.max(1, mins)} Min.`;
  if (mins < 24 * 60) return `vor ${Math.round(mins / 60)} Std.`;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
};
const PHASE_NAMES = { turn: 'Zug', auction: 'Versteigerung', payment: 'Bezahlen', trade: 'Kuhhandel', rat: 'Rattenrunde', special: 'Spezialkarte', block: 'Blockieren', ended: 'Ende' };
// Zweistufiges Bestätigen statt Browser-Dialog: erster Tipp → „Wirklich?“, zweiter Tipp → ausführen
const confirmBtn = (key, label, act, v) => modal.confirm === key
  ? `<button type="button" class="abtn danger" data-m="${act}" data-v="${esc(v)}">Wirklich ${label.toLowerCase()}?</button>`
  : `<button type="button" class="abtn" data-m="ask" data-v="${esc(key)}">${label}</button>`;

function adminBody() {
  const tab = modal.tab;
  const d = modal.adminData?.[tab];
  const tabs = [['users', 'Spieler'], ['games', 'Spiele'], ['results', 'Bestenliste'], ['errors', 'Fehler'], ['debug', 'Debug']]
    .map(([k, l]) => `<button type="button" class="atab ${tab === k ? 'on' : ''}" data-m="tab" data-v="${k}">${l}</button>`).join('');
  let list = '<p class="mtext">Lädt …</p>';
  if (tab === 'debug') {
    const money = !!store.get('kh_dbg_money');
    list = `<ul class="alist">
      <li><div class="arow"><b>Debug-Modus auf diesem Gerät</b><small>Zeigt im Spiel die DEBUG-Leiste (Sicht wechseln, Test-Spieler, Abkürzungen, Infofenster). Die Seite lädt dafür kurz neu.</small></div>
        <div class="aacts"><button type="button" class="toggle ${DEBUG ? 'on' : ''}" data-m="dbgToggle" aria-pressed="${DEBUG}" aria-label="Debug-Modus"><i></i></button></div></li>
      <li><div class="arow"><b>Testspiel</b><small>Läuft nur auf diesem Gerät mit Test-Spielern – ohne Datenbank, echte Spiele bleiben unberührt.${DEBUG ? '' : ' Schaltet den Debug-Modus dafür mit ein.'}</small></div>
        <div class="aacts"><button type="button" class="abtn" data-m="dbgMoney">Geld im Stapel: ${money ? 'an' : 'aus'}</button>
          <button type="button" class="abtn primary" data-m="dbgStart" data-v="3">3 Spieler</button>
          <button type="button" class="abtn primary" data-m="dbgStart" data-v="4">4 Spieler</button></div></li>
    </ul>`;
  }
  if (d && tab === 'users') {
    list = `<ul class="alist">${d.map((u) => `<li>
      <div class="arow">${avatarHtml(u.id, u.name, 'tiny')}<b>${esc(u.name)}</b>${u.is_admin ? '<span class="abadge">Admin</span>' : ''}
        <small>zuletzt ${fmtTime(u.last_sign_in_at)} · ${u.games} Spiele · ${u.wins} Siege</small></div>
      <div class="aacts">
        <button type="button" class="abtn" data-m="pwOpen" data-v="${esc(u.id)}">Passwort</button>
        ${u.id === me.id ? '' : u.is_admin ? confirmBtn(`unadmin:${u.id}`, 'Admin weg', 'unadmin', u.id) : `<button type="button" class="abtn" data-m="mkadmin" data-v="${esc(u.id)}">Zum Admin</button>`}
        ${u.id === me.id ? '' : confirmBtn(`del:${u.id}`, 'Löschen', 'delUser', u.id)}
      </div>
      ${modal.pwFor === u.id ? `<form class="apw" data-user="${esc(u.id)}"><input name="pw" type="text" minlength="6" placeholder="Neues Passwort für ${esc(u.name)}" autocomplete="off" required><button type="submit" class="abtn primary">Setzen</button></form>` : ''}
    </li>`).join('')}</ul>`;
  }
  if (d && tab === 'games') {
    list = d.length ? `<ul class="alist">${d.map((g) => `<li>
      <div class="arow"><b>${esc(g.code)}</b><span class="abadge ${g.status}">${g.status === 'lobby' ? 'Warteraum' : g.status === 'playing' ? 'läuft' : 'beendet'}</span>
        <small>${(g.players || []).map((p) => esc(p.name)).join(' · ')}${g.phase ? ` · ${PHASE_NAMES[g.phase] || esc(g.phase)}` : ''} · ${fmtTime(g.updated_at)}</small></div>
      <div class="aacts">${confirmBtn(`game:${g.id}`, 'Löschen', 'delGame', g.id)}</div>
    </li>`).join('')}</ul>` : '<p class="mtext">Gerade gibt es keine Spiele.</p>';
  }
  if (d && tab === 'results') {
    list = (d.length ? `<ul class="alist">${d.map((r) => `<li>
      <div class="arow"><b>${fmtTime(r.created_at)}</b><small>${(r.rows || []).map((x) => `${x.won ? '🏆 ' : ''}${esc(x.name)} ${x.score}`).join(' · ')}</small></div>
      <div class="aacts">${confirmBtn(`res:${r.game_id}`, 'Entfernen', 'delResult', r.game_id)}</div>
    </li>`).join('')}</ul>` : '<p class="mtext">Noch keine Ergebnisse.</p>')
      + (d.length ? `<div class="afoot">${confirmBtn('resall', 'Bestenliste zurücksetzen', 'resetResults', '')}</div>` : '');
  }
  if (d && tab === 'errors') {
    list = (d.length ? `<ul class="alist">${d.map((e) => `<li>
      <div class="arow"><b>${esc(e.name)}</b><span class="abadge">v${esc(e.version || '?')}</span><small>${fmtTime(e.created_at)}${e.context?.phase ? ` · ${PHASE_NAMES[e.context.phase] || esc(e.context.phase)}` : ''}</small></div>
      <code class="aerr">${esc(e.message)}</code>
    </li>`).join('')}</ul><div class="afoot">${confirmBtn('errall', 'Alle löschen', 'clearErrors', '')}</div>` : '<p class="mtext">Keine Fehler gemeldet. 🎉</p>');
  }
  return `<h2>Admin</h2><div class="atabs">${tabs}</div>
    ${modal.okMsg ? `<div class="okmsg">${esc(modal.okMsg)}</div>` : ''}${modal.error ? `<div class="error">${esc(modal.error)}</div>` : ''}${list}`;
}

// ---------- Demo für Screenshots ----------

function demo(kind) {
  if (params.get('shopav')) shopAvatars.set('u2', params.get('shopav'));
  if (params.get('allav')) [['u1', 'alp-quasselt'], ['u2', 'nico-schreit'], ['u3', 'bennet-verletzt'], ['u4', 'kuh-kaiser']].forEach(([id, av]) => shopAvatars.set(id, av));
  const demoProfiles = { u1: ['Alp', 'pferd', '#1D5FC2'], u2: ['Nico', 'schwein', '#B8285F'], u3: ['Bennet', 'esel', '#0B7A68'], u4: ['Mo', 'hahn', '#B58A00'] };
  Object.entries(demoProfiles).forEach(([id, [name, animal, color]]) => profiles.set(id, { id, name, animal, color }));
  if (kind === 'testspiel' || kind === 'testspiel3') { me = { id: 'u1', name: 'Alp' }; return startLocalGame(kind === 'testspiel3' ? 3 : 4); }
  me = { id: 'u1', name: 'Alp' };
  if (kind === 'login' || kind === 'create') { ui.screen = 'login'; auth.mode = kind === 'create' ? 'create' : 'login'; me.name = ''; return render(); }
  if (params.get('react')) reactions.set(params.get('react'), { text: params.get('rtext') === 'ehrlich' ? EHRLICH : params.get('rtext') === 'unehrlich' ? UNEHRLICH : params.get('rtext') === 'mehr' ? REACTIONS[2] : params.get('rtext') === 'lach' ? '😂' : params.get('rtext') === 'nico' ? 'Nico, schrei nicht!' : 'Bluff!', from: params.get('reactfrom') || null, until: Date.now() + 600000 });
  if (params.get('pick')) gameLocal.reactTo = params.get('pick');
  if (params.get('score')) gameLocal.scoreOpen = params.get('score');
  if (params.get('oldv')) versions = { u3: '0.11.0' };
  if (params.get('admin')) ui.isAdmin = true;
  if (params.get('recap')) gameLocal.recap = true;
  ui.editingName = kind === 'name';
  if (kind === 'name') me.name = '';
  ui.games = [
    { id: 'g1', code: 'KUHX', host: 'u2', players: [{ id: 'u2', name: 'Nico' }, { id: 'u3', name: 'Lea' }] },
    { id: 'g2', code: 'MUHH', host: 'u4', players: [{ id: 'u4', name: 'Jana' }] },
    { id: 'g3', code: 'ESEL', host: 'u5', players: [{ id: 'u5', name: 'Mo' }, { id: 'u6', name: 'Sally' }, { id: 'u7', name: 'Liam' }, { id: 'u8', name: 'Chris' }] },
  ];
  if (kind === 'room') {
    ui.screen = 'room';
    ui.game = { id: 'g0', code: 'HOFX', host: params.get('guest') ? 'u2' : 'u1', status: 'lobby', version: 2, players: [{ id: 'u1', name: 'Alp' }, { id: 'u2', name: 'Nico' }, { id: 'u3', name: 'Lea' }],
      state: params.get('money') ? { settings: { money: { 200: 4, 0: 5, 50: 2 } } } : params.get('turbo') ? { settings: { turbo: true, tradeTimer: 20 } } : null };    if (params.get('join')) setTimeout(() => { ui.game = { ...ui.game, players: [...ui.game.players, { id: 'u4', name: 'Mo' }] }; render(); }, 300); // Screenshots: jemand steigt ein
  }
  const demoState = buildDemoState(kind, gameLocal);
  if (kind === 'turn' || kind === 'menu') online = new Set(['u1', 'u2', 'u4']); // Lea offline zeigen
  if (kind === 'start') ui.myGames = [{ id: 'g9', players: [{ name: 'Alp' }, { name: 'Nico' }, { name: 'Lea' }], state: { phase: 'turn', turn: 0, players: [{ id: me.id }] } }];
  if (demoState && params.get('herd')) { const me0 = demoState.players[0]; ['hahn', 'gans', 'katze', 'hund', 'schaf', 'ziege', 'esel', 'schwein', 'kuh', 'pferd'].forEach((id, k) => { me0.animals[id] = 1 + (k % 3); }); me0.rats = 2; } // Screenshots: volle Auslage
  if (demoState && params.get('cash')) { const n = Number(params.get('cash')); const vals = [0, 10, 10, 20, 50, 100, 200, 500]; demoState.players[0].money = Array.from({ length: n }, (_, k) => vals[k % vals.length]).sort((x, y) => x - y); } // Screenshots: viele Geldkarten
  if (demoState && params.get('ev')) demoState.lastEvent = { n: 1, ...({ special: { type: 'special_won', buyer: 'u1', payer: 'u1', payee: 'u2', animal: 'pferd', count: 3 }, auction: { type: 'auction_won', buyer: 'u3', payee: 'u4', animal: 'schwein', amount: 130 }, self: { type: 'auction_won', buyer: 'u2', payee: 'u3', animal: 'kuh', amount: 90, self: true }, trade: { type: 'trade', accepted: true, offer: [10, 20], offerSum: 30, winner: 'u2', challenger: 'u2', target: 'u4', animal: 'ziege', count: 2 }, money: { type: 'money_drawn', player: 'u1', value: 50 }, rat: { type: 'rat_taken', player: 'u3', count: 3 }, ratgot: { type: 'rat_taken', player: 'u1', count: 3, cards: [50, 10, 0] }, gift: { type: 'special_won', buyer: 'u3', animal: 'kuh', count: 0 }, specialself: { type: 'special_won', buyer: 'u1', payer: 'u1', payee: 'u3', animal: 'kuh', count: 4, self: true } })[params.get('ev')] }; // Screenshots: Ereigniszeile
  if (demoState && params.get('bots')) demoState.autoplay = params.get('bots').split(',');
  if (params.get('takeover')) online = new Set(['u1', 'u2', 'u4']);
  if (demoState) {
    ui.screen = 'playing';
    ui.game = { id: 'g0', code: 'HOFX', host: 'u1', status: 'playing', version: 5, players: demoState.players, state: demoState };
  }
  if (params.get('modal')) { modal = { kind: params.get('modal'), pin: '4821', stats: params.get('modal') === 'stats' ? DEMO_STATS : undefined }; }
  if (params.get('modal') === 'mystats') modal.mine = DEMO_MYSTATS;
  if (params.get('modal') === 'admin') { modal.tab = params.get('tab') || 'users'; modal.adminData = { ...ADMIN_DEMO }; modal.pwFor = params.get('pwfor') || null; modal.confirm = params.get('confirm') || null; }
  render();
  if (demoState) return;
  // In der Demo nichts speichern oder senden
  if (!params.get('klick')) app.addEventListener('click', (e) => { if (ui.screen !== 'playing' && e.target.closest('button')) e.stopPropagation(); }, true); // ?klick=1: Startseite in der Demo durchklicken (Tests)
}

// ---------- Start ----------

async function main() {
  if (DEMO) return demo(DEMO);
  app.innerHTML = '<section class="center-msg"><h2>Team Rockets Tier Börse</h2><p>Verbinde …</p></section>';
  let loggedIn;
  try {
    loggedIn = await connect();
  } catch (e) {
    app.innerHTML = '<section class="center-msg"><h2>Keine Verbindung</h2><p>Bitte Internet prüfen und die Seite neu laden.</p></section>';
    return;
  }
  if (!loggedIn) { ui.screen = 'login'; return render(); }
  afterLogin();
}

main();
