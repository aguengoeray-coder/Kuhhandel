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

function tone(freq, start, dur, { type = 'triangle', vol = 0.2, slide = 0 } = {}) {
  const t = ctx.currentTime + start;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
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
  g.gain.value = vol;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t);
}

const SOUNDS = {
  flip: () => { noise(0, 0.12, { freq: 3000, vol: 0.35 }); noise(0.08, 0.08, { freq: 2200, vol: 0.2 }); },
  bid: () => tone(880, 0, 0.09, { vol: 0.12 }),
  gavel: () => { tone(160, 0, 0.18, { type: 'square', vol: 0.18, slide: -60 }); noise(0, 0.06, { freq: 900, vol: 0.4 }); },
  coins: () => [0, 0.07, 0.14, 0.2].forEach((d, i) => tone(1500 + i * 220, d, 0.12, { type: 'sine', vol: 0.12 })),
  trade: () => { noise(0, 0.25, { freq: 1200, vol: 0.2, q: 0.4 }); tone(400, 0.05, 0.2, { vol: 0.08, slide: 300 }); },
  quartet: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.28, { vol: 0.16 })),
  react: () => tone(660, 0, 0.08, { type: 'sine', vol: 0.12, slide: 200 }),
  tick: () => tone(1250, 0, 0.05, { type: 'square', vol: 0.07 }),
  buzz: () => { tone(110, 0, 0.45, { type: 'sawtooth', vol: 0.22 }); tone(116, 0, 0.45, { type: 'square', vol: 0.12 }); },
  rps: () => [0, 0.4, 0.8].forEach((d) => noise(d, 0.09, { freq: 600, vol: 0.4 })),
  nudge: () => [0, 0.16, 0.32].forEach((d) => tone(990, d, 0.1, { type: 'square', vol: 0.12 })),
};

export function playSound(kind) {
  if (!ctx || !SOUNDS[kind]) return;
  try { SOUNDS[kind](); } catch { /* egal */ }
}
