// Layout-Prüfungen, die im Browser laufen (page.evaluate(pageChecks)).
// Jede Meldung: { art, stufe: 'fehler' | 'hinweis', ziel, text }
//   fehler  → Test wird rot (außer er steht in known-issues.json)
//   hinweis → steht nur im Bericht (z. B. kleine Schrift)
// Geprüft wird nur, was gerade sichtbar ist. Effekt-Ebenen (.fxk, .evout) und der Ticker zählen nicht.

export function pageChecks() {
  const out = [];
  const W = innerWidth, H = innerHeight;
  const IGNORE = '.fxk, .evout, .ticker, .tkrun, [aria-hidden="true"], .dbg-panel, .dpanel';
  const name = (e) => {
    const c = String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className || '').trim().split(/\s+/)[0];
    const a = e.dataset && (e.dataset.a || e.dataset.dock || e.dataset.hb || e.dataset.m);
    const t = (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24);
    return `${e.tagName.toLowerCase()}${c ? '.' + c : ''}${a ? `[${a}]` : ''}${t ? ` „${t}“` : ''}`;
  };
  const vis = (e) => {
    if (e.closest(IGNORE)) return false;
    if (e.checkVisibility && !e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
    const r = e.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  };
  // Läuft gerade eine Animation (Einblenden/Fliegen)? Dann Position noch nicht endgültig → überspringen.
  const moving = (e) => { for (let x = e; x && x !== document.body; x = x.parentElement) { if (x.getAnimations && x.getAnimations().some((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations !== Infinity)) return true; } return false; };
  const add = (art, stufe, e, text) => out.push({ art, stufe, ziel: e ? name(e) : '', text });

  // 1) Waagerechtes Scrollen
  const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  if (sw > W + 1) add('scroll-x', 'fehler', null, `Seite ist ${sw}px breit, Bildschirm ${W}px`);

  // Container, die ihren Inhalt abschneiden (overflow hidden/clip) oder scrollbar sind
  const FAN = '.fan-wrap, .money.fan';
  // Ebene, zu der ein Element gehört: nächster Vorfahr mit position:fixed oder z-index ≥ 5
  const overlay = (e) => { for (let x = e; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.position === 'fixed' || (cs.position !== 'static' && +cs.zIndex >= 5)) return x; } return null; };
  // Abschneidender Rahmen (overflow hidden/clip) – nur bis zum ersten scrollbaren Rahmen (dahinter darf gescrollt werden)
  const innerClip = (e, anc, r) => { for (const a of anc) { const [x, ox, oy] = a; if (/auto|scroll/.test(ox + oy)) return null; const b = x.getBoundingClientRect(); if (r.top < b.top - 2 || r.bottom > b.bottom + 2 || r.left < b.left - 2 || r.right > b.right + 2) return a; } return null; };
  const clipAnc = (e) => { const res = []; for (let x = e.parentElement; x && x !== document.documentElement; x = x.parentElement) { const cs = getComputedStyle(x); const ox = cs.overflowX, oy = cs.overflowY; if (ox !== 'visible' || oy !== 'visible') res.push([x, ox, oy]); } return res; };

  // 2) Bedienelemente: im Bild, nicht verdeckt, groß genug
  const ctrls = [...document.querySelectorAll('button, a[href], input, select, textarea, [data-a], [role="button"]')].filter(vis);
  for (const e of ctrls) {
    if (moving(e)) continue;
    const r = e.getBoundingClientRect();
    // in einem scrollbaren Bereich? dann ist „nicht sichtbar“ okay (man kann hinscrollen)
    const anc = clipAnc(e);
    const scroller = anc.find(([, ox, oy]) => /auto|scroll/.test(ox + oy));
    // Mitte außerhalb → nicht antippbar (Fehler). Nur ein Rand ragt hinaus (z. B. Geld-Fächer) → Hinweis.
    const cxo = r.left + r.width / 2, cyo = r.top + r.height / 2;
    if (cxo < 0 || cyo < 0 || cxo > W || cyo > H) { if (!scroller) add('ausserhalb', 'fehler', e, 'Bedienelement liegt außerhalb des Bildschirms'); continue; }
    if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) { if (!scroller && !e.closest(FAN)) add('ausserhalb', 'hinweis', e, `ragt etwas aus dem Bildschirm (${Math.round(r.left)},${Math.round(r.top)} – ${Math.round(r.right)},${Math.round(r.bottom)})`); }
    // abgeschnitten durch einen Container mit overflow:hidden
    if (e.closest(FAN)) { // Fächer-Scheine dürfen unten abgeschnitten sein, ein Stück muss aber zum Antippen sichtbar bleiben
      const st = (e.closest('.stage') || document.body).getBoundingClientRect();
      const visH = Math.min(r.bottom, st.bottom, H) - Math.max(r.top, st.top, 0);
      if (visH < 18) add('abgeschnitten', 'fehler', e, `vom Geldschein sind nur ${Math.round(visH)}px sichtbar`);
    }
    const hid = e.closest(FAN) ? null : innerClip(e, anc, r);
    if (hid) { add('abgeschnitten', 'fehler', e, `vom Rahmen ${name(hid[0])} abgeschnitten`); continue; }
    if (scroller) { const a = scroller[0].getBoundingClientRect(); if (r.bottom <= a.top || r.top >= a.bottom || r.right <= a.left || r.left >= a.right) continue; }
    // verdeckt? Mitte antippen → trifft es das Element?
    const cx = Math.min(W - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(H - 1, Math.max(0, r.top + r.height / 2));
    const hit = document.elementFromPoint(cx, cy);
    if (hit && hit !== e && !e.contains(hit) && !hit.contains(e) && !hit.closest(IGNORE)) {
      // Absichtlich darüber: Fenster/Ebenen (fixed oder hoher z-index), z. B. Einstellungen, Ergebnis-Fenster, Kuhhandel-Auswahl.
      // Gemeldet wird nur, wenn ein „normales“ Element ein Bedienelement verdeckt.
      if (!overlay(hit) || overlay(hit) === overlay(e)) add('verdeckt', 'fehler', e, `in der Mitte liegt ${name(hit)} darüber`);
    }
    const min = Math.min(r.width, r.height);
    if (min < 24 && !e.matches('input[type="checkbox"], input[type="radio"]')) add('klein', 'hinweis', e, `Tippfläche nur ${Math.round(r.width)}×${Math.round(r.height)}px`);
  }

  // 2b) Karten/Kästen, die sich gegenseitig überdecken (Geschwister im selben Container, z. B. Shop-Sprüche).
  //     Nur Elemente mit eigenem Hintergrund oder Rahmen; absolut positionierte (Abzeichen, Ebenen) zählen nicht.
  //     Der Spieltisch (.stage) hat eine eigene Prüfung (tableOverlaps).
  const boxy = (e) => {
    if (!vis(e) || e.closest('.stage') || moving(e)) return false;
    const cs = getComputedStyle(e);
    if (cs.position === 'absolute' || cs.position === 'fixed' || cs.display === 'contents') return false;
    const bg = cs.backgroundColor, bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    return (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) || cs.backgroundImage !== 'none' || bw > 0;
  };
  const parents = new Set([...document.querySelectorAll('body *')].filter((e) => e.childElementCount > 1).filter((e) => !e.closest('svg')));
  for (const par of parents) {
    const kids = [...par.children].filter(boxy);
    if (kids.length < 2) continue;
    const rs = kids.map((k) => k.getBoundingClientRect());
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      const a = rs[i], b = rs[j];
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 2 && oy > 2) add('ueberlappung', 'fehler', kids[i], `überdeckt ${name(kids[j])} (${Math.round(ox)}×${Math.round(oy)}px)`);
    }
  }

  // 3) Abgeschnittene Texte
  const texts = [...document.querySelectorAll('body *')].filter((e) => {
    if (!vis(e) || e.closest('svg')) return false;
    for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return true;
    return false;
  });
  const seen = new Set();
  for (const e of texts) {
    if (moving(e)) continue;
    const cs = getComputedStyle(e);
    // a) Text passt nicht in sein eigenes Feld (… oder unten weg)
    if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible' || cs.textOverflow === 'ellipsis') {
      if (!/auto|scroll/.test(cs.overflowX + cs.overflowY)) {
        if (e.scrollWidth > e.clientWidth + 1) add('text-abgeschnitten', cs.textOverflow === 'ellipsis' ? 'hinweis' : 'fehler', e, `Text breiter als Feld (${e.scrollWidth} > ${e.clientWidth}px)${cs.textOverflow === 'ellipsis' ? ' – mit …' : ''}`);
        else if (e.scrollHeight > e.clientHeight + 2) add('text-abgeschnitten', 'fehler', e, `Text höher als Feld (${e.scrollHeight} > ${e.clientHeight}px)`);
      }
    }
    // b) Text ragt aus einem Rahmen mit overflow:hidden heraus (z. B. Name oben abgeschnitten)
    const r = e.getBoundingClientRect();
    const ancT = clipAnc(e);
    const hid = e.closest(FAN) ? null : innerClip(e, ancT, r);
    if (hid && !seen.has(hid[0])) { seen.add(hid[0]); add('text-abgeschnitten', 'fehler', e, `ragt aus ${name(hid[0])} heraus und wird abgeschnitten`); }
    // c) Text außerhalb des Bildschirms (Fächer-Scheine ragen absichtlich unten hinaus)
    if ((r.right > W + 1 || r.bottom > H + 1 || r.left < -1 || r.top < -1) && !e.closest(FAN)) { const sc = ancT.find(([, ox, oy]) => /auto|scroll/.test(ox + oy)); if (!sc) { const c = r.left + r.width / 2 > 0 && r.left + r.width / 2 < W && r.top + r.height / 2 > 0 && r.top + r.height / 2 < H; add('ausserhalb', c ? 'hinweis' : 'fehler', e, c ? 'Text ragt etwas aus dem Bildschirm' : 'Text liegt außerhalb des Bildschirms'); } }
    // d) sehr kleine Schrift
    const fs = parseFloat(cs.fontSize);
    if (fs < 10) add('schrift-klein', 'hinweis', e, `Schrift ${fs}px`);
  }
  return out;
}

// Spieltisch: Bereiche, die sich nie überdecken dürfen (aus den Komplettspiel-Prüfungen übernommen)
export function tableOverlaps() {
  const vis = (e) => { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05) return false; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
  const G = {
    seat: '.gright > .prow, .ratpile',
    menu: '.lround, .chat-br',
    // Überschrift oben ist eine eigene Gruppe: Stapel/Karten dürfen nicht hineinragen (v0.54.1, Fund von Alp: 3 Spieler)
    head: '.gtable > .tbanner, .evstrip',
    center: '.tlog, .deck-wrap .deck, .deck-count, .aucard, .aside > *, .reveal-row, .pot, .potbox, .ratnow, .bigcard, .tsteps, .tduel, .tpanel, .tpick, .seatpick span, .tbox, .tradebox, .sptimer, .spstage, .batzen, .bstacks, .spinfo, .tstriprow, .evcard',
    mine: '.auslage > *, .money.fan, .fansum, .hand-row, .dock > *, .meplate .mefig',
  };
  if (!document.querySelector('.stage')) return [];
  const items = [];
  for (const [g, sel] of Object.entries(G)) for (const e of document.querySelectorAll(sel)) if (vis(e) && !e.closest('.evout') && !e.closest('.fxk')) items.push([g, e, e.getBoundingClientRect()]);
  const res = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const [ga, ea, a] = items[i]; const [gb, eb, bb] = items[j];
    if (ga === gb || ea.contains(eb) || eb.contains(ea)) continue;
    if (ga === 'center' && gb === 'mine' && eb.classList.contains('dock')) continue;
    if (ea.classList.contains('evcard') || eb.classList.contains('evcard')) continue; // Ergebnis-Fenster liegt bewusst obenauf
    const ox = Math.min(a.right, bb.right) - Math.max(a.left, bb.left), oy = Math.min(a.bottom, bb.bottom) - Math.max(a.top, bb.top);
    if (ox > 3 && oy > 3) res.push({ art: 'ueberlappung', stufe: 'fehler', ziel: `${ga}:${String(ea.className).split(' ')[0]} × ${gb}:${String(eb.className).split(' ')[0]}`, text: `${Math.round(ox)}×${Math.round(oy)}px überdeckt` });
  }
  return res;
}
