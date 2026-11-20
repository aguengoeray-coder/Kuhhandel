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
