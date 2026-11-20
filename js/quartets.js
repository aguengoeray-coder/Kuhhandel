// v0.77 Quartett-Show (Alp): Ist ein Quartett voll, sehen ALLE eine eigene, lustige Szene passend zum Tier – danach geht das Spiel weiter.
// Aufbau je Szene: Hintergrund, Requisiten (fallen/fliegen), die 4 Tiere mit einer eigenen Bewegung, ein großer Ruf und der Titel.
import { animalBody } from './beasts.js';
import { art } from './animals.js';

export const QSHOW_MS = 5500; // v0.78 (Alp): länger (3,8 → 5,5 s), Tiere und Requisiten spielen ihre Szene zweimal
export const qshowMs = (f = 1) => Math.round(QSHOW_MS * f); // Info-Fenster: folgt dem Tempo leicht

// Szene je Tier: bg = Hintergrund, move = Bewegung der Tiere, shout = Ruf, props = Requisiten (Emoji), fx = Art der Requisiten, extra = Bühnenbild
const SCENES = {
  hahn: { bg: 'linear-gradient(180deg,#2B4C8C 0%,#F28C28 62%,#FFD34E 100%)', move: 'crow', shout: 'KIKERIKI!', props: ['🎵', '🎶', '☀️'], fx: 'float', sound: 'kikeriki',
    extra: '<i class="qs-sun"></i><i class="qs-fence"></i>', line: 'weckt den ganzen Hof' },
  gans: { bg: 'linear-gradient(180deg,#7EC8F2 0%,#BFE6FF 100%)', move: 'fly', shout: 'SCHNATTER!', props: ['🪶', '🪶', '☁️'], fx: 'fall', sound: 'react',
    extra: '<i class="qs-cloud c1"></i><i class="qs-cloud c2"></i>', line: 'fliegt in Formation' },
  katze: { bg: 'radial-gradient(circle at 70% 25%,#6B4FA8 0%,#2A1E4A 70%)', move: 'pounce', shout: 'MIAU!', props: ['🧶', '🐾', '🐟'], fx: 'roll', sound: 'react',
    extra: '<i class="qs-moon"></i>', line: 'hat neun Leben – mal vier' },
  hund: { bg: 'linear-gradient(180deg,#8FD3FF 0%,#7BC96F 64%,#4E9A44 100%)', move: 'spin', shout: 'WUFF WUFF!', props: ['🦴', '🦴', '🎾'], fx: 'fall', sound: 'react',
    extra: '', line: 'jagt den eigenen Schwanz' },
  schaf: { bg: 'radial-gradient(circle at 50% 30%,#2C3E7A 0%,#101836 75%)', move: 'fence', shout: '1 … 2 … 3 … 4 … zzZ', props: ['⭐', '✨', '💤'], fx: 'float', sound: 'tick',
    extra: '<i class="qs-moon"></i><i class="qs-fence mid"></i>', line: 'zählt sich selbst in den Schlaf' },
  ziege: { bg: 'linear-gradient(180deg,#9AD0F5 0%,#E9F4FB 55%,#8C9AA8 56%,#5D6B78 100%)', move: 'climb', shout: 'MÄÄÄH!', props: ['🏔️', '🚩', '🌼'], fx: 'float', sound: 'react',
    extra: '<i class="qs-peak"></i>', line: 'steht ganz oben auf dem Gipfel' },
  esel: { bg: 'linear-gradient(180deg,#FFE8A3 0%,#F2B84B 100%)', move: 'kick', shout: 'I-AAAH!', props: ['💰', '🪙', '💵'], fx: 'fall', sound: 'iah',
    extra: '', line: 'tritt den Geldsack auf' },
  schwein: { bg: 'linear-gradient(180deg,#F7C6D0 0%,#F7C6D0 55%,#7A4B2A 56%,#5A3519 100%)', move: 'dive', shout: 'OINK OINK!', props: ['💦', '🟤', '💦'], fx: 'splash', sound: 'quiek',
    extra: '<i class="qs-mud"></i>', line: 'springt in die Suhle' },
  kuh: { bg: 'radial-gradient(circle at 50% 35%,#24356E 0%,#0C1330 75%)', move: 'moon', shout: 'MUUUH!', props: ['⭐', '🥛', '✨'], fx: 'float', sound: 'muh',
    extra: '<i class="qs-moon big"></i>', line: 'springt über den Mond' },
  pferd: { bg: 'linear-gradient(180deg,#9BD7FF 0%,#D7F0FF 50%,#7CC46A 51%,#3F8E3A 100%)', move: 'gallop', shout: 'WIEHER!', props: ['🏆', '💨', '🥇'], fx: 'float', sound: 'fanfare',
    extra: '<i class="qs-track"></i>', line: 'gewinnt das Derby' },
};
export const quartetSound = (animal) => (SCENES[animal] || {}).sound || 'quartet';

const NAMES = { hahn: 'Hähne', gans: 'Gänse', katze: 'Katzen', hund: 'Hunde', schaf: 'Schafe', ziege: 'Ziegen', esel: 'Esel', schwein: 'Schweine', kuh: 'Kühe', pferd: 'Pferde' };

// who = „Du“ oder Name, color = Platzfarbe des Spielers, delay = Start in ms (für die Taktung)
export function quartetShow(animal, who, color, delay = 0, isMe = false, ms = QSHOW_MS) {
  const s = SCENES[animal];
  if (!s) return '';
  const props = Array.from({ length: 14 }, (_, i) => `<i class="qs-p ${s.fx}" style="--i:${i};--x:${(i * 37) % 100}%;--r:${((i * 53) % 60) - 30}deg">${s.props[i % s.props.length]}</i>`).join('');
  const beasts = [0, 1, 2, 3].map((k) => `<div class="qs-a m-${s.move}" style="--k:${k}">${animalBody(animal)}</div>`).join('');
  return `<div class="qshow q-${animal}" role="status" aria-live="polite" style="--qbg:${s.bg};--qc:${color};--qd:${delay}ms;--qms:${ms}ms;--qrep:${ms > 4500 ? 2 : 1}">
    <div class="qs-bg"></div>${s.extra}
    <div class="qs-props">${props}</div>
    <div class="qs-stage">${beasts}</div>
    <b class="qs-shout">${s.shout}</b>
    <div class="qs-title"><span class="qs-badge">QUARTETT!</span><span class="qs-who"><i class="qs-icon">${art(animal)}</i>${who} ${isMe ? 'hast' : 'hat'} alle 4 ${NAMES[animal]}</span><small>… und ${s.line}</small></div>
  </div>`;
}

// ---------- v0.79 Rattenkönig (Alp): wer alle Ratten hat, wird vor allen zur Ratte gekrönt ----------
export const KING_MS = 6200;
export const kingMs = (f = 1) => Math.round(KING_MS * f);
// Rattenmütze (Ohren, Gesicht, Schnurrhaare, Schwanz) mit schiefer Krone – sitzt auf dem Kopf der Figur
export const RAT_HAT = `<svg class="rathat-svg" viewBox="0 0 120 92" aria-hidden="true">
  <path d="M100 66c14 2 18 14 10 20-6 4-12 0-10-5" fill="none" stroke="#E8A3B0" stroke-width="4" stroke-linecap="round"/>
  <circle cx="26" cy="34" r="17" fill="#8E8E99" stroke="#2B2B2B" stroke-width="3"/><circle cx="26" cy="34" r="10" fill="#F2B8C6"/>
  <circle cx="94" cy="34" r="17" fill="#8E8E99" stroke="#2B2B2B" stroke-width="3"/><circle cx="94" cy="34" r="10" fill="#F2B8C6"/>
  <path d="M18 78c0-28 18-44 42-44s42 16 42 44z" fill="#9C9CA8" stroke="#2B2B2B" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 74h88a4 4 0 0 1 0 8H16a4 4 0 0 1 0-8z" fill="#7C7C88" stroke="#2B2B2B" stroke-width="3"/>
  <circle cx="48" cy="56" r="4.5" fill="#2B2B2B"/><circle cx="72" cy="56" r="4.5" fill="#2B2B2B"/><circle cx="49.5" cy="54.5" r="1.4" fill="#fff"/><circle cx="73.5" cy="54.5" r="1.4" fill="#fff"/>
  <ellipse cx="60" cy="66" rx="6" ry="4.5" fill="#E86A8A" stroke="#2B2B2B" stroke-width="2"/>
  <path d="M52 66 34 62M52 69 34 71M68 66l18-4M68 69l18 2" stroke="#2B2B2B" stroke-width="1.6" stroke-linecap="round"/>
  <g class="rh-crown" transform="rotate(-12 60 22)"><path d="M44 30l-3-18 10 8 9-13 9 13 10-8-3 18z" fill="#FFD34E" stroke="#2B2B2B" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="18" r="2.6" fill="#E5484D"/></g>
</svg>`;
export const ratHat = (cls = '') => `<i class="rathat ${cls}" aria-hidden="true">${RAT_HAT}</i>`;

// who = „Du“ oder Name, fig = Ganzkörper-Figur (HTML), blocks = ob er danach ein Quartett opfert
export function ratKingShow(who, color, fig, delay = 0, isMe = false, ms = KING_MS, blocks = false, count = 4) {
  const rats = [0, 1, 2, 3].map((k) => `<div class="rk-rat" style="--k:${k}">${animalBody('ratte')}</div>`).join('');
  const holes = [0, 1, 2, 3].map((k) => `<i class="rk-hole" style="--k:${k}"></i>`).join('');
  const drips = Array.from({ length: 10 }, (_, i) => `<i class="rk-drip" style="--i:${i};--x:${(i * 41) % 100}%"></i>`).join('');
  const puffs = Array.from({ length: 9 }, (_, i) => `<i class="rk-puff" style="--i:${i}"></i>`).join('');
  return `<div class="qshow rking" role="status" aria-live="polite" style="--qc:${color};--qd:${delay}ms;--qms:${ms}ms;--kf:${(ms / KING_MS).toFixed(3)}">
    <div class="rk-bg"></div>${drips}${holes}
    <div class="rk-hero"><div class="rk-fig">${fig}${ratHat('rk-hat')}</div>${puffs}</div>
    <div class="rk-ring">${rats}</div>
    <b class="qs-shout rk-shout">PUFF!</b>
    <div class="qs-title"><span class="qs-badge rk-badge">👑 RATTENKÖNIG!</span><span class="qs-who"><i class="qs-icon">${art('ratte')}</i>${who} ${isMe ? 'hast' : 'hat'} alle ${count} Ratten</span><small>… ${blocks ? `und ${isMe ? 'opferst' : 'opfert'} jetzt ein Quartett` : 'das Spiel ist aus'}</small></div>
  </div>`;
}
