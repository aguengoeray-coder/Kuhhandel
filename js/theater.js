// v0.64 Figuren-Theater (Alps Wunsch): Die Figuren verlassen ihren Platz, laufen (wackelnd wie Pappfiguren,
// links-rechts) zu einem Ort, spielen eine kleine Szene und gehen zurück.
// Reine Anzeige – keine Spiellogik. Eine Szene besteht aus
//   • Spuren je Figur: [[ms, Ort, Pose], …]  – ändert sich der Ort, wird dazwischen gelaufen
//   • Requisiten: an der Figur (bewegen sich mit) oder frei an einem Ort (Sprechblasen, Schale, Joint …)
// Orte: 'seat' = eigener Platz (in Platzgröße) · 'near:<pid>' = neben dem Platz von pid (in dessen Größe)
//       'mid:<k>/<n>' = Platz k im Kreis in der Tischmitte (alle gleich groß) · 'midx:<dx>,<dy>' = Punkt in der Mitte
//       'seat:<pid>' = Platz von pid · 'head:<Ort>' = Kopfhöhe über dem Ort
// Alle Geräte spielen dieselbe Szene, jedes aus der eigenen Sitzposition (Orte werden erst beim Zeichnen gemessen).

export const MID_SCALE = 0.82;
export const FIG_W = 72, FIG_H = 120;
// Szenen, die jeder auslösen darf (Auswahl beim Antippen) – Prügeln läuft über das gekaufte Emote
export const FREE_SCENES = ['laugh', 'schleim', 'verschwoerung', 'torte', 'baum'];
export const SCENE_KINDS = ['punch', 'laugh', 'schleim', 'verschwoerung', 'torte', 'baum', 'cheer', 'pleite'];
export const SCENE_LABEL = { laugh: '😂 Auslachen', schleim: '🍯 Schleimen', verschwoerung: '🤫 Verschwörung', torte: '🥧 Torte ins Gesicht', baum: '🌿 Baum-Runde' };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = (arr, seed, k = 0) => arr[Math.abs((seed | 0) + k * 7) % arr.length];

// Requisit an der Figur: erscheint ab t0 für d ms (eigene Animation über die Klasse)
const tp = (cls, t0, d, inner = '', style = '') => `<i class="tp ${cls}" style="--t0:${t0}ms;--d:${d}ms;${style}">${inner}</i>`;
// freies Requisit an einem Ort; path = mehrere Orte (bewegt sich), tt = Zeitpunkte dazu
const free = (cls, pos, t0, d, inner = '', extra = {}) => {
  const a = [`data-tpos="${esc(pos)}"`];
  if (extra.path) a.push(`data-tpath="${esc(extra.path.join('>'))}" data-tt="${extra.tt.join(',')}"`);
  if (extra.dx || extra.dy) a.push(`data-tdx="${extra.dx || 0}" data-tdy="${extra.dy || 0}"`);
  return `<div class="tprop ${cls}" ${a.join(' ')} style="--t0:${t0}ms;--d:${d}ms;${extra.style || ''}">${inner ? `<span class="tin">${inner}</span>` : ''}</div>`;
};
const bubble = (pos, t0, d, text, cls = '') => free(`tbub ${cls}`, `head:${pos}`, t0, d, `<span>${esc(text)}</span>`);

// ---------- Die Szenen ----------
// s = { kind, from, to, seed, order (alle Spieler-IDs im Uhrzeigersinn) }; liefert { ms, actors, props }
export function sceneScript(s) {
  const { from, to, seed = 0 } = s;
  if (s.kind === 'punch') {
    return {
      ms: 3600,
      actors: [{ pid: from, track: [[0, 'seat', 'stand'], [120, 'seat', 'walk'], [1000, `near:${to}`, 'punch'], [2600, `near:${to}`, 'walk'], [3480, 'seat', 'stand']] }],
      props: '', ouch: [[to, 1100, 2700]],
    };
  }
  if (s.kind === 'laugh') {
    const line = pick(['HAHAHA!', 'Muhahaha!', 'Hihihi, Loser!', 'Pffff – HAHA!'], seed);
    return {
      ms: 4800,
      actors: [{ pid: from, track: [[0, 'seat', 'stand'], [120, 'seat', 'walk'], [1000, `near:${to}`, 'point'], [1700, `near:${to}`, 'laugh'], [2500, `near:${to}`, 'roll'], [3500, `near:${to}`, 'laugh'], [3800, `near:${to}`, 'walk'], [4680, 'seat', 'stand']] }],
      props: bubble(`near:${to}`, 1000, 1500, line)
        + [0, 1, 2, 3, 4].map((k) => free('tha', `head:near:${to}`, 1700 + k * 330, 1100, 'HA', { dx: (k % 2 ? 18 : -14), style: `--hx:${k % 2 ? 26 : -24}px` })).join('')
        + free('tfinger', `head:seat:${to}`, 1000, 1500, '👇')
        + free('tangry', `head:seat:${to}`, 2300, 1900, '💢')
        + bubble(`seat:${to}`, 3000, 1300, pick(['Hey!', 'Sehr witzig…', 'Na warte!', 'Pfff.'], seed, 1), 'small'),
    };
  }
  if (s.kind === 'schleim') {
    const line = pick(['Du bist der Beste! 😍', 'Wahnsinn, wie du handelst!', 'Mein Lieblingsspieler!', 'So ein kluger Kopf!'], seed);
    return {
      ms: 5000,
      actors: [{ pid: from, track: [[0, 'seat', 'stand'], [120, 'seat', 'walk'], [1000, `near:${to}`, 'pat'], [3800, `near:${to}`, 'walk'], [4880, 'seat', 'stand']] }],
      props: bubble(`near:${to}`, 1050, 1600, line)
        + [0, 1, 2, 3, 4, 5].map((k) => free('theart', `head:near:${to}`, 1150 + k * 380, 1300, '❤', { dx: (k % 3 - 1) * 16, style: `--hx:${(k % 2 ? 1 : -1) * (10 + k * 3)}px` })).join('')
        + free('tbill', `near:${to}`, 2600, 900, '<b>10</b>', { path: [`near:${to}`, `seat:${to}`], tt: [2650, 3200], dy: -40 })
        + bubble(`seat:${to}`, 3200, 1300, pick(['Hmm… danke?', 'Was willst du?', 'Aww 🥰', 'Schleimer!'], seed, 1), 'small'),
    };
  }
  if (s.kind === 'verschwoerung') {
    // Anstifter + Komplize treffen sich in der Mitte, tuscheln, zeigen auf das Opfer, tun unschuldig
    const p2 = s.partner;
    if (!p2 || !to) return null;
    const A = 'midx:-38,0', B = 'midx:38,0';
    return {
      ms: 6400,
      actors: [
        { pid: from, track: [[0, 'seat', 'stand'], [120, 'seat', 'walk'], [1100, A, 'lean-r'], [3000, A, 'point'], [4300, A, 'whistle'], [5200, A, 'walk'], [6200, 'seat', 'stand']] },
        { pid: p2, track: [[0, 'seat', 'stand'], [220, 'seat', 'walk'], [1150, B, 'lean-l'], [3000, B, 'point'], [4300, B, 'whistle'], [5250, B, 'walk'], [6280, 'seat', 'stand']] },
      ],
      props: bubble(A, 1200, 800, 'Psst…', 'small') + bubble(B, 1750, 800, 'Tuschel tuschel…', 'small') + bubble(A, 2300, 700, pick(['Der hat zu viel Geld.', 'Den nehmen wir uns vor.', 'Hast du den gesehen?'], seed), 'small')
        + free('tfinger', `head:seat:${to}`, 3000, 1400, '👇')
        + bubble(A, 3050, 1100, pick(['DER da!', 'Der war’s!', 'Genau der!'], seed, 1))
        + free('tsweat', `head:seat:${to}`, 3300, 1500, '😰')
        + bubble(`seat:${to}`, 3800, 1200, pick(['Was guckt ihr so?', 'Hä?!', 'Ich hab euch gehört!'], seed, 2), 'small')
        + [0, 1, 2].map((k) => free('tnote', `head:${k % 2 ? B : A}`, 4350 + k * 260, 900, '♪', { dx: k % 2 ? 8 : -8, style: `--hx:${k % 2 ? 18 : -18}px` })).join('')
        + bubble(B, 4400, 800, 'Wir? Nichts!', 'small'),
    };
  }
  if (s.kind === 'torte') {
    // mit Torte hinlaufen, ins Gesicht werfen, Sahne bleibt kurz kleben, vor Lachen kringeln, zurück
    return {
      ms: 4800,
      actors: [{ pid: from, track: [[0, 'seat', 'stand'], [120, 'seat', 'walk'], [1000, `near:${to}`, 'windup'], [1250, `near:${to}`, 'laugh'], [2900, `near:${to}`, 'walk'], [3800, 'seat', 'stand']],
        inner: tp('apie', 0, 1080, '<i></i>') }],
      props: free('tpie', `hand:near:${to}`, 1050, 300, '<i></i>', { path: [`hand:near:${to}`, `face:seat:${to}`], tt: [1050, 1300] })
        + free('tsplat', `face:seat:${to}`, 1280, 3300, '<i></i>')
        + [0, 1, 2, 3, 4].map((k) => free('tdrop', `face:seat:${to}`, 1300 + k * 40, 700, '', { style: `--hx:${(k - 2) * 14}px` })).join('')
        + bubble(`near:${to}`, 1400, 1200, pick(['Volltreffer!', 'Guten Appetit!', 'Lecker, oder?'], seed))
        + bubble(`seat:${to}`, 2700, 1400, pick(['Bäh!', 'Mmh… Sahne.', 'Das gibt Rache!'], seed, 1), 'small'),
      ouch: [[to, 1300, 2600]],
    };
  }
  if (s.kind === 'pfaend') {
    // v0.65 Zwangsversteigerung: mit Gerichtsvollzieher-Hut hin, Kuckuck-Siegel aufs Tier, Hammer, zurück (≈ 3 s, dann wird geboten)
    return {
      ms: 3200,
      actors: [{ pid: from, track: [[0, 'seat', 'stand'], [80, 'seat', 'walk'], [900, `near:${to}`, 'windup'], [1150, `near:${to}`, 'stand'], [2150, `near:${to}`, 'walk'], [3050, 'seat', 'stand']], inner: tp('ahat', 0, 3200, '<i></i>') }],
      props: free('tseal', `face:seat:${to}`, 1100, 2100, '<b>⚖</b><small>GEPFÄNDET</small>')
        + free('tbang', `head:near:${to}`, 1120, 600, 'KLONK!')
        + bubble(`near:${to}`, 1300, 900, pick(['Im Namen des Gesetzes!', 'Das wird versteigert!', 'Pfändung!'], seed)),
      ouch: [[to, 1150, 2200]],
    };
  }
  if (s.kind === 'einspruch') {
    // v0.65 Einspruch: Gerichtsvollzieher kommt, Opfer hält das Schild hoch, Vollzieher zieht beleidigt ab
    return {
      ms: 3600,
      actors: [{ pid: from, track: [[0, 'seat', 'stand'], [80, 'seat', 'walk'], [900, `near:${to}`, 'stand'], [1500, `near:${to}`, 'sad'], [2400, `near:${to}`, 'walk'], [3400, 'seat', 'stand']], inner: tp('ahat', 0, 3600, '<i></i>') }],
      props: free('tshield', `face:seat:${to}`, 1000, 1800, '🛡️')
        + bubble(`seat:${to}`, 1050, 1300, 'EINSPRUCH!')
        + bubble(`near:${to}`, 1700, 800, pick(['Na gut…', 'Mist!', 'Formfehler…'], seed), 'small'),
    };
  }
  if (s.kind === 'baum') {
    // alle in die Mitte, hinsetzen; Mischschale, Gras, Drehen, Anzünden, reihum weitergeben, zurück
    const ord = s.order && s.order.length ? s.order : [from];
    const i0 = Math.max(0, ord.indexOf(from));
    const ring = ord.map((_, k) => ord[(i0 + k) % ord.length]); // Starter zuerst
    const n = ring.length;
    const spot = (k) => `mid:${k}/${n}`;
    const roller = 0, bowlK = 1 % n, weedK = 2 % n;
    const SIT = 1250, LIGHT = 4700, PASS0 = 5000, HOLD = Math.round(1700 / n), BACK = 7000;
    const actors = ring.map((pid, k) => ({
      pid,
      track: [[0, 'seat', 'stand'], [80 + k * 110, 'seat', 'walk'], [SIT - 150 + k * 40, spot(k), 'sit'], [SIT + 200, spot(k), 'relax'], [BACK - 200, spot(k), 'stand'], [BACK + k * 60, spot(k), 'walk'], [BACK + 1000 + k * 60, 'seat', 'stand']],
    }));
    const passPath = []; const passT = [];
    for (let j = 0; j <= n; j++) { passPath.push(`hand:${spot((roller + j) % n)}`); passT.push(PASS0 + j * (HOLD + 160)); passPath.push(`hand:${spot((roller + j) % n)}`); passT.push(PASS0 + j * (HOLD + 160) + HOLD); }
    const smoke = ring.map((_, j) => [0, 1].map((m) => free('tsmoke', `head:${spot((roller + j) % n)}`, PASS0 + j * (HOLD + 160) + 200 + m * 260, 1500, '', { dx: 6 + m * 6, dy: 8 })).join('')).join('');
    const props = free('tbowl', 'midx:0,6', 1500, 3300, '<i></i>', { path: [`hand:${spot(bowlK)}`, 'midx:0,6', 'midx:0,6'], tt: [1500, 1900, 4600] })
      + free('tbag', `hand:${spot(weedK)}`, 2000, 1400, '🌿', { path: [`hand:${spot(weedK)}`, 'midx:0,-14', 'midx:0,-14', `hand:${spot(weedK)}`], tt: [2000, 2400, 3050, 3400] })
      + [0, 1, 2, 3, 4, 5, 6].map((k) => free('tcrumb', 'midx:0,-6', 2450 + k * 80, 500, '', { dx: (k % 3 - 1) * 5 })).join('')
      + free('tpaper', `hand:${spot(roller)}`, 3300, 1400, '<i></i>')
      + [0, 1, 2, 3].map((k) => free('tcrumb fly', 'midx:0,6', 3400 + k * 90, 450, '', { path: ['midx:0,6', `hand:${spot(roller)}`], tt: [3400 + k * 90, 3800 + k * 90] })).join('')
      + free('tjoint', `hand:${spot(roller)}`, 4300, BACK - 4300 - 150, '<i class="jtip"></i>', { path: passPath, tt: passT })
      + free('tflame', `hand:${spot(roller)}`, LIGHT - 200, 650, '🔥', { dx: 10, dy: -6 })
      + smoke
      + bubble(spot(roller), 3600, 1000, pick(['Ich dreh einen.', 'Schale her!', 'Ich bau.'], seed))
      + bubble(spot(weedK), 1950, 1000, pick(['Hab was dabei 🌿', 'Gras ist da!'], seed, 1))
      + bubble(spot(bowlK), 1450, 900, 'Schale!')
      + bubble(spot((roller + 1) % n), 6500, 900, pick(['Läuft bei uns.', 'Puuuh… 😌', 'Entspannt.'], seed, 2), 'small');
    return { ms: BACK + 1200 + n * 60, actors, props };
  }
  const D = s.delay || 0; // Jubel/Pleite: Start später (z. B. nach dem Ergebnis-Fenster)
  if (s.kind === 'cheer') {
    return {
      ms: D + 2400, cls: 'k-cheer',
      actors: [{ pid: from, track: [[0, 'seat', 'stand'], [D, 'seat', 'hop'], [D + 2300, 'seat', 'stand']], inner: `<b class="ameins" style="animation-delay:${D + 150}ms">Meins!</b>${[0, 1, 2, 3, 4, 5].map((k) => `<i class="aconf c${k}" style="animation-delay:${D + 100 + k * 40}ms"></i>`).join('')}` }],
      props: '',
    };
  }
  if (s.kind === 'pleite') {
    return {
      ms: D + 3300, cls: 'k-pleite',
      actors: [{ pid: from, track: [[0, 'seat', 'stand'], [D, 'seat', 'sad'], [D + 3200, 'seat', 'stand']], inner: `<i class="ptasche l" style="animation-delay:${D}ms"></i><i class="ptasche r" style="animation-delay:${D}ms"></i><i class="pstaub" style="animation-delay:${D}ms"></i>${[0, 1, 2].map((k) => `<i class="pmotte m${k}" style="animation-delay:${D + 700 + k * 260}ms">${s.moth || ''}</i>`).join('')}<b class="pstempel" style="animation-delay:${D + 500}ms">PLEITE!</b>` }],
      props: '',
    };
  }
  return null;
}

// Wann ist eine Figur nicht auf ihrem Platz? (Platz zeigt dann nichts – die Figur steht auf der Bühne)
export function sceneHtml(s, sc, figOf, meId) {
  // Bühne: Tisch wird kurz abgedunkelt, damit die Figuren gut zu sehen sind (nur bei Szenen mit Laufwegen)
  return sc.actors.map((a) => `<div class="actor ${sc.cls || ''} ${a.pid === meId ? 'mine' : ''}" data-actor="${esc(a.pid)}" data-track="${esc(JSON.stringify(a.track))}" data-ms="${sc.ms}" aria-hidden="true">
    <div class="abody">${figOf(a.pid)}${a.inner || ''}</div></div>`).join('') + sc.props;
}

// ---------- Posen (innere Bewegung, Füße bleiben am Boden) ----------
function poseFrames(pose, t0, t1) {
  const f = []; const step = (ms, a, b) => { let k = 0; for (let t = t0; t < t1; t += ms, k++) f.push([t, k % 2 ? b : a]); f.push([t1, 'none']); };
  switch (pose) {
    case 'walk': step(120, 'rotate(-9deg) translateY(0)', 'rotate(9deg) translateY(-5px)'); break; // wackeln wie eine Pappfigur
    case 'punch': step(85, 'translateX(-7px) rotate(-12deg)', 'translateX(7px) translateY(-6px) rotate(12deg)'); break;
    case 'laugh': step(105, 'rotate(-12deg) translateY(1px) scaleY(.96)', 'rotate(10deg) translateY(-4px) scaleY(1.03)'); break;
    case 'roll': step(140, 'translateY(-6px) rotate(84deg)', 'translateY(-10px) rotate(74deg)'); break; // vor Lachen am Boden
    case 'point': step(260, 'rotate(-6deg) translateY(-4px)', 'rotate(-2deg) translateY(0)'); break;
    case 'lean-l': step(300, 'rotate(-11deg) translateX(-3px)', 'rotate(-8deg) translateX(-2px) translateY(-2px)'); break; // zum Nachbarn rüberbeugen (tuscheln)
    case 'lean-r': step(300, 'rotate(11deg) translateX(3px)', 'rotate(8deg) translateX(2px) translateY(-2px)'); break;
    case 'whistle': step(380, 'rotate(-4deg)', 'rotate(4deg) translateY(-2px)'); break; // unschuldig pfeifen
    case 'windup': f.push([t0, 'rotate(-14deg) translateX(-4px)'], [t1, 'rotate(10deg) translateX(6px)']); break; // ausholen
    case 'hop': step(230, 'translateY(-16px) scaleY(1.05)', 'translateY(0) scaleY(.94)'); break;
    case 'pat': step(220, 'rotate(7deg) translateY(-4px)', 'rotate(2deg) translateY(0)'); break;
    case 'sit': f.push([t0, 'translateY(10px) scaleY(.84)'], [t1, 'translateY(12px) scaleY(.82)']); break;
    case 'relax': step(650, 'translateY(12px) scaleY(.82) rotate(-4deg)', 'translateY(12px) scaleY(.82) rotate(4deg)'); f.pop(); f.push([t1, 'translateY(12px) scaleY(.82)']); break;
    case 'sad': f.push([t0, 'rotate(-5deg) translateY(4px) scaleY(.93)'], [t1, 'rotate(-5deg) translateY(4px) scaleY(.93)']); break;
    default: f.push([t0, 'none'], [t1, 'none']);
  }
  return f;
}

// ---------- Messen + Abspielen (nach jedem Zeichnen) ----------
function stageOf(root) {
  const stage = root.querySelector('#stage');
  if (!stage) return null;
  const sr = stage.getBoundingClientRect(); const sc = sr.width / stage.offsetWidth || 1;
  return { stage, sr, sc, W: stage.offsetWidth, H: stage.offsetHeight };
}
function seatFeet(root, S, pid) {
  const me = root.dataset.me;
  let el = null;
  if (pid === me) el = root.querySelector('.meplate .mefig > :not(i):not(.ouchh):not(.ouchs)');
  else el = root.querySelector(`.prow[data-pid="${CSS.escape(pid)}"] .seatfig > div`);
  if (!el) return { x: S.W / 2, y: S.H - 20, s: 0.6 };
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2 - S.sr.left) / S.sc, y: (r.bottom - S.sr.top) / S.sc, s: Math.max(0.3, (r.height / S.sc) / FIG_H) };
}
function midCenter(root, S) {
  const c = root.querySelector('.tcenter');
  if (c) { const r = c.getBoundingClientRect(); return { x: S.W / 2, y: (r.top + r.height * 0.5 - S.sr.top) / S.sc + 70 }; }
  return { x: S.W / 2, y: S.H * 0.62 };
}
export function placePoint(root, S, place, actorPid) {
  if (place.startsWith('head:')) { const p = placePoint(root, S, place.slice(5), actorPid); return { ...p, y: p.y - FIG_H * p.s - 6 }; }
  if (place.startsWith('face:')) { const p = placePoint(root, S, place.slice(5), actorPid); return { ...p, y: p.y - FIG_H * p.s * 0.78 }; }
  if (place.startsWith('hand:')) { const p = placePoint(root, S, place.slice(5), actorPid); return { ...p, y: p.y - FIG_H * p.s * 0.42 }; }
  if (place === 'seat') return seatFeet(root, S, actorPid);
  if (place.startsWith('seat:')) return seatFeet(root, S, place.slice(5));
  if (place.startsWith('near:')) {
    const t = seatFeet(root, S, place.slice(5)); const c = midCenter(root, S);
    let dx = c.x - t.x, dy = (c.y - t.y) * 0.35; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const off = FIG_W * t.s * 1.05 + 14;
    let x = t.x + dx * off, y = t.y + dy * off + (t.y < S.H * 0.35 ? 34 * t.s : 0);
    x = Math.max(FIG_W * t.s / 2 + 4, Math.min(S.W - FIG_W * t.s / 2 - 4, x));
    return { x, y, s: t.s };
  }
  if (place.startsWith('mid:')) {
    // Sitzkreis um den Stapel wie um ein Lagerfeuer: links und rechts im Bogen, keiner steht mitten auf dem Stapel
    const [k, n] = place.slice(4).split('/').map(Number); const c = midCenter(root, S);
    const ARC = { 1: [[0, 0]], 2: [[-70, 0], [70, 0]], 3: [[-165, -2], [-85, 26], [125, 14]], 4: [[-180, -6], [-98, 24], [98, 24], [180, -6]] };
    const [dx, dy] = (ARC[n] || ARC[4])[k % (ARC[n] || ARC[4]).length];
    return { x: c.x + dx, y: c.y + dy, s: MID_SCALE };
  }
  if (place.startsWith('midx:')) { const [dx, dy] = place.slice(5).split(',').map(Number); const c = midCenter(root, S); return { x: c.x + dx, y: c.y + dy, s: MID_SCALE }; }
  return { x: S.W / 2, y: S.H / 2, s: MID_SCALE };
}

export function theaterFx(root) {
  const S = stageOf(root);
  if (!S) return;
  root.querySelectorAll('.actor[data-track]').forEach((el) => {
    let track; try { track = JSON.parse(el.dataset.track); } catch { return; }
    const ms = Number(el.dataset.ms) || track[track.length - 1][0] || 1000;
    const pid = el.dataset.actor;
    const pts = track.map(([t, place]) => ({ t, ...placePoint(root, S, place, pid) }));
    el.style.left = '0px'; el.style.top = '0px';
    const tf = (p) => `translate(${Math.round(p.x - FIG_W / 2)}px, ${Math.round(p.y - FIG_H)}px) scale(${p.s.toFixed(3)})`;
    const kf = pts.map((p) => ({ transform: tf(p), offset: Math.min(1, p.t / ms) }));
    if (kf[0].offset > 0) kf.unshift({ transform: kf[0].transform, offset: 0 });
    if (kf[kf.length - 1].offset < 1) kf.push({ transform: kf[kf.length - 1].transform, offset: 1 });
    // Tiefe: wer weiter unten steht, ist vorn
    el.style.zIndex = String(40 + Math.round(Math.max(...pts.map((p) => p.y)) / 10));
    // innere Bewegung: laufen, wenn sich der Ort ändert, sonst die Pose
    const inner = [];
    for (let i = 0; i < track.length; i++) {
      const t0 = track[i][0], t1 = i + 1 < track.length ? track[i + 1][0] : ms;
      if (t1 <= t0) continue;
      const moving = i + 1 < track.length && track[i + 1][1] !== track[i][1];
      inner.push(...poseFrames(moving ? 'walk' : track[i][2], t0, t1));
    }
    const ikf = []; let last = -1;
    for (const [t, transform] of inner) { const off = Math.min(1, Math.max(0, t / ms)); if (off < last) continue; ikf.push({ transform, offset: off }); last = off; }
    if (!ikf.length || ikf[0].offset > 0) ikf.unshift({ transform: 'none', offset: 0 });
    if (ikf[ikf.length - 1].offset < 1) ikf.push({ transform: 'none', offset: 1 });
    try {
      el.animate(kf, { duration: ms, fill: 'both', easing: 'linear' });
      const body = el.querySelector('.abody'); if (body) body.animate(ikf, { duration: ms, fill: 'both', easing: 'linear' });
    } catch { /* ältere Browser: Figur steht einfach */ }
  });
  root.querySelectorAll('.tprop[data-tpos]').forEach((el) => {
    const dx = Number(el.dataset.tdx) || 0, dy = Number(el.dataset.tdy) || 0;
    const p = placePoint(root, S, el.dataset.tpos, '');
    el.style.left = `${Math.round(p.x + dx)}px`; el.style.top = `${Math.round(p.y + dy)}px`;
    // nie über den Rand hinaus (Sprechblasen über Plätzen ganz oben/links/rechts)
    const tin = el.querySelector('.tin');
    if (tin && !el.dataset.tpath) {
      const r = tin.getBoundingClientRect(); const L = (r.left - S.sr.left) / S.sc, T = (r.top - S.sr.top) / S.sc, Rr = (r.right - S.sr.left) / S.sc;
      let mx = 0, my = 0;
      if (L < 4) mx = 4 - L; else if (Rr > S.W - 4) mx = S.W - 4 - Rr;
      if (T < 14) my = 14 - T;
      if (mx || my) { el.style.left = `${Math.round(p.x + dx + mx)}px`; el.style.top = `${Math.round(p.y + dy + my)}px`; }
    }
    if (el.dataset.tpath && el.animate) {
      const path = el.dataset.tpath.split('>').map((pl) => placePoint(root, S, pl, ''));
      const tt = el.dataset.tt.split(',').map(Number);
      const t0 = tt[0], dur = Math.max(1, tt[tt.length - 1] - t0);
      const kf = path.map((q, i) => ({ translate: `${Math.round(q.x - p.x)}px ${Math.round(q.y - p.y)}px`, offset: Math.min(1, Math.max(0, (tt[i] - t0) / dur)) }));
      for (let i = 1; i < kf.length; i++) if (kf[i].offset < kf[i - 1].offset) kf[i].offset = kf[i - 1].offset;
      try { el.animate(kf, { duration: dur, delay: t0, fill: 'both', easing: 'ease-in-out' }); } catch { /* egal */ }
    }
  });
}

// Wie lange ist pid in dieser Szene unterwegs (Platz leer)?
export function sceneOut(sc) { return sc.actors.map((a) => ({ pid: a.pid, from: 0, until: sc.ms })); }
