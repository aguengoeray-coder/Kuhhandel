// v0.99: Jedes Scroll-Fenster behält beim Neuzeichnen seine Position (vorher sprang es nach jedem Tipp nach oben).
// Merkt sich alle gescrollten Elemente über ihren Pfad (Tag + Klassen) und setzt sie nach dem Neuzeichnen wieder.
const sig = (el, root) => { const p = []; for (let n = el; n && n !== root; n = n.parentElement) p.push(n.tagName + '.' + String(n.className && n.className.baseVal !== undefined ? n.className.baseVal : n.className).split(/\s+/).filter((c) => !/^(on|sel|is-|has|active)/.test(c)).sort().join('.')); return p.join('<'); };
export function snapScroll(root) {
  const out = []; if (!root) return out;
  for (const el of root.querySelectorAll('*')) if (el.scrollTop > 0 || el.scrollLeft > 0) out.push([sig(el, root), el.scrollTop, el.scrollLeft]);
  return out;
}
export function restoreScroll(root, snap) {
  if (!root || !snap || !snap.length) return;
  const want = new Map(snap.map(([s, t, l]) => [s, [t, l]]));
  for (const el of root.querySelectorAll('*')) { const v = want.get(sig(el, root)); if (v) { el.scrollTop = v[0]; el.scrollLeft = v[1]; want.delete(sig(el, root)); if (!want.size) break; } }
}
