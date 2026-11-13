// Kleine Geräusche, direkt im Browser erzeugt (keine Dateien nötig)
let ctx = null;

// Browser erlauben Ton erst nach einer Berührung – beim ersten Tippen freischalten
document.addEventListener('pointerdown', () => {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch { /* kein Ton möglich */ }
}, { passive: true });

export const audio = () => ctx;

// Lautstärke: 0 = aus, sonst Faktor für alle Geräusche
let level = 1;
export function setVolume(v) { level = v; }

function tone(freq, start, dur, { type = 'triangle', vol = 0.2, slide = 0 } = {}) {
  const t = ctx.currentTime + start;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * level), t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(start, dur, { vol = 0.25, freq = 1800, q = 0.8 } = {}) {
  const t = ctx.currentTime + start;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.value = vol * level;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t);
}

const SOUNDS = {
  flip: () => { noise(0, 0.12, { freq: 3000, vol: 0.35 }); noise(0.08, 0.08, { freq: 2200, vol: 0.2 }); },
  bid: () => tone(880, 0, 0.09, { vol: 0.12 }),
  fanfare: () => { [[523, 0, .14], [659, .14, .14], [784, .28, .14], [1047, .42, .5]].forEach(([f, d, l]) => tone(f, d, l, { vol: 0.16, type: 'square' })); },
  boo: () => { tone(220, 0, 0.5, { vol: 0.16, type: 'sawtooth', slide: -80 }); tone(196, 0.45, 0.7, { vol: 0.14, type: 'sawtooth', slide: -90 }); },
  ehrlich: () => { [[196, 0, .16], [262, .16, .16], [330, .32, .16], [392, .48, .45]].forEach(([f, d, l]) => tone(f, d, l, { vol: 0.2, type: 'sawtooth' })); },
  batzen: () => { noise(0, 0.08, { freq: 2600, vol: 0.3 }); [0.05, 0.12, 0.19, 0.26, 0.33].forEach((d) => noise(d, 0.06, { freq: 2000 + d * 2000, vol: 0.22 })); },
  outbid: () => { tone(520, 0, 0.12, { vol: 0.14, type: 'square' }); tone(390, 0.12, 0.18, { vol: 0.14, type: 'square' }); },
  gavel: () => { tone(160, 0, 0.18, { type: 'square', vol: 0.18, slide: -60 }); noise(0, 0.06, { freq: 900, vol: 0.4 }); },
  coins: () => [0, 0.07, 0.14, 0.2].forEach((d, i) => tone(1500 + i * 220, d, 0.12, { type: 'sine', vol: 0.12 })),
  trade: () => { noise(0, 0.25, { freq: 1200, vol: 0.2, q: 0.4 }); tone(400, 0.05, 0.2, { vol: 0.08, slide: 300 }); },
  quartet: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.28, { vol: 0.16 })),
  react: () => tone(660, 0, 0.08, { type: 'sine', vol: 0.12, slide: 200 }),
  tick: () => tone(1250, 0, 0.05, { type: 'square', vol: 0.07 }),
  buzz: () => { tone(110, 0, 0.45, { type: 'sawtooth', vol: 0.22 }); tone(116, 0, 0.45, { type: 'square', vol: 0.12 }); },
  rps: () => [0, 0.4, 0.8].forEach((d) => noise(d, 0.09, { freq: 600, vol: 0.4 })),
  nudge: () => [0, 0.16, 0.32].forEach((d) => tone(990, d, 0.1, { type: 'square', vol: 0.12 })),
  // Tiergeräusche (Platzhalter – eigene Aufnahmen kommen in js/voices.js)
  muh: () => { tone(150, 0, 0.75, { type: 'sawtooth', vol: 0.16, slide: -45 }); tone(152, 0.05, 0.7, { type: 'triangle', vol: 0.12, slide: -40 }); },
  iah: () => { tone(620, 0, 0.32, { type: 'sawtooth', vol: 0.12, slide: 180 }); tone(260, 0.34, 0.45, { type: 'sawtooth', vol: 0.15, slide: -60 }); tone(640, 0.82, 0.28, { type: 'sawtooth', vol: 0.11, slide: 160 }); },
  quiek: () => [0, 0.11, 0.2].forEach((d, i) => tone(2100 + i * 250, d, 0.07, { type: 'square', vol: 0.06, slide: 500 })),
  kikeriki: () => [[700, 0, .12], [900, .13, .12], [1100, .26, .14], [880, .42, .36]].forEach(([f, d, l]) => tone(f, d, l, { type: 'sawtooth', vol: 0.08, slide: 120 })),
  // Trommelwirbel vor teuren Karten
  drum: () => { for (let i = 0; i < 14; i++) noise(i * 0.06, 0.05, { freq: 260 + (i % 2) * 40, vol: 0.18 + i * 0.012, q: 1.2 }); noise(0.86, 0.22, { freq: 180, vol: 0.45, q: 0.7 }); },
  wow: () => { tone(330, 0, 0.18, { type: 'triangle', vol: 0.16, slide: 260 }); tone(660, 0.16, 0.32, { type: 'triangle', vol: 0.14, slide: -120 }); },
  last: () => [[784, 0, .12], [988, .12, .12], [1175, .24, .3]].forEach(([f, d, l]) => tone(f, d, l, { type: 'square', vol: 0.1 })),
  flipcard: () => noise(0, 0.05, { freq: 3800, vol: 0.18 }),
  glitz: () => [2093, 2637, 3136, 2637, 3520].forEach((f, i) => tone(f, i * 0.07, 0.16, { type: 'sine', vol: 0.06 })), // Glitzern: helles Funkeln
  // Esel knüllt Scheine zusammen / Papierball trifft
  crumple: () => { for (let i = 0; i < 7; i++) noise(i * 0.045, 0.05, { freq: 2400 + (i % 3) * 700, vol: 0.22, q: 0.6 }); },
  thud: () => { tone(120, 0, 0.16, { type: 'square', vol: 0.2, slide: -50 }); noise(0, 0.07, { freq: 700, vol: 0.45 }); },
  rain: () => { for (let i = 0; i < 9; i++) tone(1400 + ((i * 337) % 900), i * 0.06, 0.1, { type: 'sine', vol: 0.09 }); },
};

// Eigene Aufnahmen (z. B. „Muh“ von Nico) haben Vorrang vor den erzeugten Tönen
import { VOICES } from './voices.js';
const voiceCache = {};
function playVoice(kind) {
  const url = VOICES[kind];
  if (!url || !level) return false;
  try { const a = voiceCache[kind] || (voiceCache[kind] = new Audio(url)); a.currentTime = 0; a.volume = Math.min(1, level); a.play().catch(() => {}); return true; } catch { return false; }
}

export function playSound(kind) {
  if (playVoice(kind)) return;
  if (!ctx || !SOUNDS[kind]) return;
  try { SOUNDS[kind](); } catch { /* egal */ }
}
