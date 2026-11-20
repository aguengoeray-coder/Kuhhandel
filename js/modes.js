// v0.73 Startbildschirm (Alp): große Spielmodus-Kacheln mit eigenem Bild – erst nach dem Antippen kommen die Einstellungen der Runde.
// Eigene Illustrationen aus den Tierbildern (keine fremden Grafiken).
import { art } from './animals.js';

export const MODES = [
  { id: 'classic', name: 'Klassisch', tag: 'Das Original', players: '3–4 Spieler', facts: ['10 Tierarten', 'Versteigerung 10 s', 'Kuhhandel', 'Ratten & Spezialkarten'], desc: 'Versteigern, Kuhhandeln, Quartette sammeln – die Hausregeln, wie ihr sie kennt.', settings: {} },
  { id: 'turbo', name: 'Turbo', tag: 'Schnelle Runde', players: '3–4 Spieler', facts: ['7 Tierarten', 'Versteigerung 6 s', 'Kuhhandel 12 s', 'Für zwischendurch'], desc: 'Nur 7 Tierarten, Versteigerung 6 s, Kuhhandel 12 s – perfekt für zwischendurch.', settings: { turbo: true } },
  { id: 'boerse', name: 'Börsen-Chaos', tag: 'Mit 14 Börsen-News', players: '3–4 Spieler', facts: ['14 Börsen-News', 'Kurse sofort auf den Karten', 'Blindmarkt', 'Zwangsversteigerung'], desc: 'Kursrallye, Hype, Blase, Steuerprüfung, Zwangsversteigerung … die Werte tanzen.', settings: { boerse: true } },
  { id: 'join', name: 'Beitreten', tag: 'Mit Spiel-Code', desc: 'Ein Freund hat schon einen Raum? Code eingeben und Platz nehmen.' },
];

// eingebettetes Tierbild als Karte (rx = runde Ecken)
const card = (id, x, y, w, rot, bg) => `<g transform="rotate(${rot} ${x + w / 2} ${y + w * 0.7})">
  <rect x="${x}" y="${y}" width="${w}" height="${w * 1.4}" rx="${w * 0.12}" fill="${bg}" stroke="#2B2B2B" stroke-width="3"/>
  ${art(id).replace('<svg class="art" ', `<svg x="${x + w * 0.08}" y="${y + w * 0.3}" width="${w * 0.84}" height="${w * 0.84}" `)}</g>`;
const head = (id, x, y, s) => art(id).replace('<svg class="art" ', `<svg x="${x}" y="${y}" width="${s}" height="${s}" `);

const ART = {
  classic: () => `<svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><radialGradient id="mfC" cx="50%" cy="60%" r="70%"><stop offset="0" stop-color="#3FA65C"/><stop offset="1" stop-color="#1F6B3A"/></radialGradient></defs>
    <rect width="200" height="140" fill="url(#mfC)"/>
    <path d="M0 140 Q100 96 200 140Z" fill="#000" opacity=".12"/>
    ${card('esel', 30, 30, 50, -16, '#E9E2D2')}${card('pferd', 120, 30, 50, 16, '#F4D9B0')}${card('kuh', 72, 18, 56, 0, '#FFFFFF')}
    <g transform="translate(150 98) rotate(-30)"><rect x="-4" y="0" width="8" height="34" rx="3" fill="#8A5A2B" stroke="#2B2B2B" stroke-width="2.5"/><rect x="-16" y="-10" width="32" height="14" rx="4" fill="#B07A45" stroke="#2B2B2B" stroke-width="2.5"/></g>
  </svg>`,
  turbo: () => `<svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="mfT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB13B"/><stop offset="1" stop-color="#E2452D"/></linearGradient></defs>
    <rect width="200" height="140" fill="url(#mfT)"/>
    ${[18, 38, 58, 78, 98, 118].map((y, i) => `<rect x="${-20 + (i % 3) * 14}" y="${y}" width="${70 + (i % 2) * 30}" height="5" rx="2.5" fill="#fff" opacity=".45"/>`).join('')}
    ${head('pferd', 70, 14, 112)}
    <path d="M44 22l-14 30h14l-8 26 26-36H48l10-20z" fill="#FFE14A" stroke="#2B2B2B" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
  boerse: () => `<svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="200" height="140" fill="#14202F"/>
    ${[20, 45, 70, 95, 120].map((y) => `<path d="M0 ${y}H200" stroke="#F2C230" stroke-opacity=".12"/>`).join('')}
    ${[[22, 70, 30, 1], [40, 60, 26, 0], [58, 54, 34, 1], [76, 40, 24, 1], [94, 50, 30, 0], [112, 30, 28, 1]].map(([x, y, h, up]) => `<rect x="${x}" y="${y}" width="10" height="${h}" fill="${up ? '#3BD16F' : '#FF5A5A'}"/><path d="M${x + 5} ${y - 8}V${y + h + 8}" stroke="${up ? '#3BD16F' : '#FF5A5A'}" stroke-width="2"/>`).join('')}
    <path d="M10 112L50 92 74 100 104 64 132 74 186 18" fill="none" stroke="#3BD16F" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M172 16l16-2-4 16" fill="none" stroke="#3BD16F" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    ${head('kuh', 112, 60, 84)}
    <text x="14" y="30" font-family="system-ui,sans-serif" font-weight="900" font-size="15" fill="#F2C230">×2</text>
  </svg>`,
  join: () => `<svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="mfJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7B5BD6"/><stop offset="1" stop-color="#4A2F9E"/></linearGradient></defs>
    <rect width="200" height="140" fill="url(#mfJ)"/>
    ${['M', 'U', 'H', 'X'].map((c, i) => `<g transform="translate(${26 + i * 38} 46)"><rect width="32" height="42" rx="7" fill="#fff" stroke="#2B2B2B" stroke-width="3"/><text x="16" y="31" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="24" fill="#2B2B2B">${c}</text></g>`).join('')}
    <g transform="translate(150 104) rotate(-35)"><circle r="12" fill="#F2C230" stroke="#2B2B2B" stroke-width="3"/><circle r="4" fill="#4A2F9E"/><path d="M12 -3h28v6h-6v6h-6v-6H12z" fill="#F2C230" stroke="#2B2B2B" stroke-width="3" stroke-linejoin="round"/></g>
  </svg>`,
};
export const modeArt = (id, fit = 'slice') => (ART[id] || ART.classic)().replace('preserveAspectRatio="xMidYMid slice"', `preserveAspectRatio="xMidYMid ${fit}"`);
