// v0.68 Ganze Tiere (Alp): beim Kuhhandel, bei der Ratte und der Quartett-Polonaise läuft das Tier als ganzes Tier
// (Kuh als ganze Kuh, Huhn als ganzes Huhn …) – Körper hier gezeichnet, der Kopf ist das bekannte Kartenbild.
// Blickrichtung rechts; läuft das Tier nach links, wird es gespiegelt (Klasse face-l am Läufer).
import { art } from './animals.js';

const K = '#2B2B2B';
const S = `stroke="${K}" stroke-width="3" stroke-linejoin="round"`;

// Kopf als eingebettetes Kartenbild
const head = (id, x, y, s) => art(id).replace('<svg class="art" ', `<svg class="bhd" x="${x}" y="${y}" width="${s}" height="${s}" `);

// Bein: Gruppe mit Drehpunkt an der Hüfte (Lauf-Animation per CSS), a/b = gegenläufig
const leg = (x, y, h, w, color, hoof, ab) => `<g class="lg ${ab}" style="transform-origin:${x + w / 2}px ${y}px"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${color}" ${S}/>${hoof ? `<rect x="${x - 1}" y="${y + h - 6}" width="${w + 2}" height="7" rx="3" fill="${hoof}" ${S}/>` : ''}</g>`;
// Hals: verbindet Körper und Kopf (Umriss + Füllung)
const neck = (x1, y1, x2, y2, c, w) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${K}" stroke-width="${w}" stroke-linecap="round"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${c}" stroke-width="${w - 6}" stroke-linecap="round"/>`;
const legs4 = (y, h, w, color, hoof, xs = [34, 46, 74, 86]) => xs.map((x, i) => leg(x, y, h, w, color, hoof, i % 2 ? 'b' : 'a')).join('');

// Vierbeiner: Körper (Ellipse), Beine, Schwanz, Kopf vorne oben – Variationen je Art
function quad(id, o) {
  const back = legs4(o.ly, o.lh, o.lw || 9, o.legc || o.body, o.hoof, o.lx).replace(/class="lg (a|b)"/g, 'class="lg $1 bk"');
  return `<svg class="bbody" viewBox="0 0 130 100" aria-hidden="true">
    <g class="tail" style="transform-origin:${o.tx}px ${o.ty}px">${o.tail}</g>
    ${back}
    ${neck(80, o.by - 6, o.hx + o.hs * 0.42, o.hy + o.hs * 0.74, o.neckc || o.body, o.nw || 14)}
    <ellipse cx="62" cy="${o.by}" rx="${o.rx}" ry="${o.ry}" fill="${o.body}" ${S}/>
    <path d="M${80} ${o.by - 6}L${o.hx + o.hs * 0.42} ${o.hy + o.hs * 0.74}" stroke="${o.neckc || o.body}" stroke-width="${(o.nw || 14) - 6}" stroke-linecap="round"/>
    ${o.deco || ''}
    ${head(id, o.hx, o.hy, o.hs)}
  </svg>`;
}
function bird(id, o) {
  return `<svg class="bbody" viewBox="0 0 130 100" aria-hidden="true">
    ${leg(52, 66, 24, 5, '#F28C28', null, 'a')}${leg(66, 66, 24, 5, '#F28C28', null, 'b')}
    <g class="tail" style="transform-origin:34px 52px">${o.tail}</g>
    <ellipse cx="58" cy="56" rx="${o.rx}" ry="${o.ry}" fill="${o.body}" ${S}/>
    <path class="wing" d="M40 50c10-8 26-6 32 4-4 2-8 3-12 2 2 3 0 6-4 6-6 0-12-5-16-12z" fill="${o.wing}" ${S} style="transform-origin:66px 52px"/>
    ${head(id, o.hx, o.hy, o.hs)}
  </svg>`;
}

const BODIES = {
  kuh: () => quad('kuh', { body: '#FFFFFF', by: 54, rx: 36, ry: 21, ly: 62, lh: 30, hoof: '#3B3F4A', hx: 76, hy: 2, hs: 54, tx: 26, ty: 46,
    tail: `<path d="M27 46c-10 6-12 18-8 28" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"/><circle cx="19" cy="76" r="5" fill="${K}"/>`,
    deco: `<path d="M44 40c6-6 16-4 16 4s-10 10-16 6-4-6 0-10zM70 58c6-4 14 0 12 6s-12 6-14 2 0-6 2-8z" fill="${K}"/><ellipse cx="56" cy="74" rx="8" ry="5" fill="#F7B9C4" ${S}/>` }),
  pferd: () => quad('pferd', { body: '#B07A45', by: 52, rx: 38, ry: 19, ly: 60, lh: 34, hoof: '#3B3F4A', hx: 78, hy: 0, hs: 54, tx: 25, ty: 44,
    tail: `<path d="M27 44c-14 4-16 22-10 34 2-10 6-18 12-24" fill="#5A3A1E" ${S}/>`,
    deco: `<path d="M86 30c-6 4-10 10-12 18l10 2c2-8 6-14 10-16z" fill="#5A3A1E" ${S}/>` }),
  esel: () => quad('esel', { body: '#9AA0AA', by: 54, rx: 34, ry: 19, ly: 62, lh: 28, hoof: '#3B3F4A', hx: 76, hy: 0, hs: 56, tx: 28, ty: 48,
    tail: `<path d="M29 48c-8 6-10 16-8 24" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"/><path d="M17 70l4 10 6-8z" fill="${K}"/>`,
    deco: `<ellipse cx="62" cy="64" rx="22" ry="7" fill="#C9CDD4"/>` }),
  schwein: () => quad('schwein', { body: '#F7A8B8', by: 58, rx: 36, ry: 22, ly: 70, lh: 20, lw: 10, hoof: '#C76B80', hx: 74, hy: 8, hs: 54, tx: 26, ty: 52,
    tail: `<path d="M27 52c-8-2-10 6-4 8s4-8-2-6" fill="none" stroke="${K}" stroke-width="3.5" stroke-linecap="round"/>` }),
  schaf: () => quad('schaf', { body: '#FFFDF5', by: 54, rx: 34, ry: 22, ly: 64, lh: 26, lw: 7, legc: '#3B3F4A', hoof: null, hx: 76, hy: 4, hs: 52, tx: 28, ty: 50,
    tail: `<circle cx="26" cy="50" r="7" fill="#FFFDF5" ${S}/>`,
    deco: [[36, 40], [50, 34], [66, 34], [80, 42], [40, 66], [58, 72], [76, 66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#FFFDF5" ${S}/>`).join('') + '<ellipse cx="60" cy="54" rx="28" ry="16" fill="#FFFDF5"/>' }),
  ziege: () => quad('ziege', { body: '#E9DDC7', by: 54, rx: 32, ry: 18, ly: 62, lh: 30, lw: 8, hoof: '#3B3F4A', hx: 76, hy: 0, hs: 54, tx: 30, ty: 44,
    tail: `<path d="M31 44l-10-10 4 14z" fill="#E9DDC7" ${S}/>` }),
  hund: () => quad('hund', { body: '#C98A4B', by: 56, rx: 32, ry: 17, ly: 64, lh: 24, lw: 9, hoof: null, hx: 76, hy: 6, hs: 52, tx: 30, ty: 50,
    tail: `<path d="M31 50c-10-6-14-16-10-24" fill="none" stroke="${K}" stroke-width="8" stroke-linecap="round"/><path d="M31 50c-10-6-14-16-10-24" fill="none" stroke="#C98A4B" stroke-width="4" stroke-linecap="round"/>`,
    deco: `<ellipse cx="46" cy="50" rx="9" ry="7" fill="#8A5A2B"/>` }),
  katze: () => quad('katze', { body: '#F2A65A', by: 58, rx: 30, ry: 15, ly: 64, lh: 22, lw: 8, hoof: null, hx: 74, hy: 10, hs: 50, tx: 32, ty: 54,
    tail: `<path d="M33 54c-14-4-18-20-8-30" fill="none" stroke="${K}" stroke-width="8" stroke-linecap="round"/><path d="M33 54c-14-4-18-20-8-30" fill="none" stroke="#F2A65A" stroke-width="4" stroke-linecap="round"/>`,
    deco: `<path d="M48 46v10M58 45v11M68 46v10" stroke="#C9772E" stroke-width="3" stroke-linecap="round"/>` }),
  ratte: () => quad('ratte', { body: '#8E8E99', by: 64, rx: 28, ry: 13, ly: 70, lh: 14, lw: 6, legc: '#E8A3B0', hoof: null, hx: 74, hy: 22, hs: 44, tx: 34, ty: 64,
    tail: `<path d="M35 64c-14 2-24-6-30 4" fill="none" stroke="#E8A3B0" stroke-width="4" stroke-linecap="round"/>` }),
  gans: () => bird('gans', { body: '#FFFDF5', wing: '#F1EBDD', rx: 26, ry: 18, hx: 60, hy: -2, hs: 56,
    tail: `<path d="M34 52l-14-8 4 14z" fill="#FFFDF5" ${S}/>` }),
  hahn: () => bird('hahn', { body: '#C2452D', wing: '#8E2A1B', rx: 24, ry: 18, hx: 60, hy: -2, hs: 56,
    tail: `<path d="M36 50c-10-14-8-26 2-30M36 50c-14-6-20-18-14-28M36 52c-14 0-22-10-20-20" fill="none" stroke="#2E7D4F" stroke-width="6" stroke-linecap="round"/><path d="M36 50c-10-14-8-26 2-30" fill="none" stroke="#1D5FC2" stroke-width="3" stroke-linecap="round"/>` }),
};

export const RAT_ID = 'ratte';
// ganzes Tier als SVG (Fallback: nur Kopf)
export function animalBody(id) { return (BODIES[id] || (() => `<svg class="bbody" viewBox="0 0 130 100">${head(id, 38, 10, 60)}</svg>`))(); }
