import { SLOTS, RARITIES, BOX_ITEMS, BOX_PRICE, PITY_LEGEND, PITY_EPIC, itemInfo, ownedParts, fullOutfit, setOf, SET_FX, partName, BOX_SETS, boxSetOf, boxSetProgress, dingArt } from './outfits.js';
import { SHOP_AVATARS, SHOP_AVATAR_CSS, SHOP_AVATAR_FULL_CSS, shopAvatarFull } from './shopavatars.js';

export const SHOP_SAYINGS = [
  { id:'spruch-daumen', text:'👍👍', price:10 },
  { id:'spruch-passt-schon', text:'Passt schon, passt schon!', price:10 },
  { id:'spruch-blablabla', text:'BLABLABLABLA!!', price:10 },
  { id:'spruch-nico', text:'Nico, schrei nicht!', price:10 },
  { id:'spruch-gute-idee', text:'Das ist eine gute Idee!', price:10 },
  { id:'spruch-ihh', text:'IHH, du Ekliger!', price:10 },
  { id:'spruch-bastard', text:'Bastard', price:10 },
  { id:'spruch-gute-ideen', text:'Ich habe nur gute Ideen', price:20 },
  { id:'spruch-dickes-huhn', text:'Ich bin das dicke Huhn und gehe heute schwimmen', price:10 },
  { id:'spruch-dumme-kuh', text:'Hey, du bist eine dumme Kuh!', price:10 },
  { id:'spruch-hunger', text:'Ich habe Hunger', price:10 },
  { id:'spruch-bau-mal', text:'Bau mal einen', price:10 },
  { id:'spruch-kurzer', text:'Lass uns auf einen Kurzen zu den ukrainischen Nachbarn', price:10 },
  { id:'spruch-schmatz', text:'Schmatz nicht!!', price:10 },
  { id:'spruch-how-old', text:'Can I ask you by any chance how old you are? 📱', price:10 }
];
// v0.63 Eigener Spruch: Text selbst wählen (1–40 Zeichen), jederzeit kostenlos änderbar
export const SHOP_CUSTOM = { id:'spruch-eigener', name:'Eigener Spruch', price:50, max:40 };
// v0.61 Emotes: Fähigkeiten für deine Figur (Admins haben sie immer)
export const SHOP_EMOTES = [
  { id:'emote-pruegel', name:'Verprügeln', icon:'🥊', price:100, text:'Deine Figur läuft zu einem Mitspieler und verprügelt ihn – Comic-Staubwolke mit POW! BAM! KLATSCH!' },
  // v0.67 Figuren-Theater als Emotes (Alp: alle im Shop, interaktive teurer als Sprüche)
  { id:'emote-auslachen', scene:'laugh', name:'Auslachen', icon:'😂', price:60, text:'Deine Figur watschelt hin, zeigt auf ihn und kugelt sich vor Lachen am Boden – HA! HA! HA!' },
  { id:'emote-schleimen', scene:'schleim', name:'Schleimen', icon:'🍯', price:60, text:'Hinwatscheln, Schulter klopfen, Herzchen – und ein Schein wird zugesteckt (nur Show).' },
  { id:'emote-torte', scene:'torte', name:'Torte ins Gesicht', icon:'🥧', price:80, text:'Mit einer Sahnetorte hinlaufen, ausholen – mitten ins Gesicht. Die Sahne klebt noch eine Weile.' },
  { id:'emote-verschwoerung', scene:'verschwoerung', name:'Verschwörung', icon:'🤫', price:100, text:'Du und ein zufälliger Komplize trefft euch in der Mitte, tuschelt, zeigt auf ihn – und pfeift unschuldig.' },
  { id:'emote-baum', scene:'baum', name:'Baum-Runde', icon:'🌿', price:120, text:'Alle setzen sich um den Stapel: Schale, Gras, drehen – und der Joint geht reihum. Für den ganzen Tisch.' }
];
// Szene → Shop-Artikel (für die Freischaltung im Spiel)
export const SCENE_ITEM = Object.fromEntries(SHOP_EMOTES.filter((x) => x.scene).map((x) => [x.scene, x.id]));
const AVATARS = SHOP_AVATARS.map(({id,name,tier,price,animal}) => ({id,name,tier,price,animal}));
const TIERS = [
  { id:'selten', label:'Selten', items:AVATARS.filter(x=>x.tier==='selten') },
  { id:'episch', label:'Episch', items:AVATARS.filter(x=>x.tier==='episch') },
  { id:'legendaer', label:'Legendär', items:AVATARS.filter(x=>x.tier==='legendaer') },
  { id:'kult', label:'Kult', items:AVATARS.filter(x=>x.tier==='kult') }
];
// Goldene Dublone als eigenes Zeichen (statt „D“) – sieht auf allen Geräten gleich aus
export const DUB = '<i class="dub" role="img" aria-label="Dublonen"></i>';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tierName = (t) => t === 'legendaer' ? 'Legendär' : t[0].toUpperCase()+t.slice(1);

function addAvatarCss() {
  if (document.getElementById('shop-avatar-runtime-css')) return;
  const style = document.createElement('style');
  style.id = 'shop-avatar-runtime-css';
  style.textContent = SHOP_AVATAR_CSS + SHOP_AVATAR_FULL_CSS;
  document.head.append(style);
}

/** ctx = { me:{id,name}, balance, owned:Set<itemId>, activeAvatar,
 * buy(itemId):Promise, setAvatar(id):Promise, close() } */
export function renderShop(root, ctx) {
  if (!root || !ctx || typeof ctx.buy !== 'function' ||
      typeof ctx.setAvatar !== 'function' || typeof ctx.close !== 'function') {
    throw new TypeError('renderShop benötigt root und einen vollständigen Shop-Kontext.');
  }
  addAvatarCss();
  let balance = Math.max(0, Number(ctx.balance) || 0);
  const owned = new Set(ctx.owned || []);
  let activeAvatar = ctx.activeAvatar || null;
  let freeLeft = Math.max(0, Number(ctx.freeLeft) || 0); // v0.58: zwei Sprüche gratis
  let customText = ctx.customText || ''; // v0.63
  let busy = false;
  let notice = '';
  let noticeKind = 'info';

  let tab = ctx.tab || 'kiste';
  // v0.91 Kuh-Kiste + Garderobe
  let inventory = new Set(ctx.inventory || []);
  let outfit = { ...(ctx.outfit || {}) };
  let draft = { ...outfit };
  let slot = 'kopf';
  let tryOn = null; // v0.92 Anprobieren: Avatar-Vorschau links, gekauft wird erst mit dem Knopf
  let box = { st: 'idle', res: null }; // idle | shake | open
  let boxState = ctx.boxState || { since_legend: 0, since_epic: 0 };
  const avName = (id) => (AVATARS.find((a) => a.id === id) || {}).name || id;
  const partsOwned = () => ownedParts(AVATARS.filter((a) => owned.has(a.id)).map((a) => a.id), [...inventory]);
  const rarOf = (id) => { const it = itemInfo(id); if (it) return it.rarity; const av = String(id).split(':')[1]; const t = (AVATARS.find((a) => a.id === av) || {}).tier; return t === 'kult' ? 'episch' : t || 'gewoehnlich'; };
  const rarTag = (r) => '<span class="rar r-' + r + '">' + RARITIES[r].name + '</span>';
  const previewFor = (o) => shopAvatarFull(activeAvatar || (String(o.kopf || '').split(':')[1]) || 'noergler', 'wardrobe-fig', o);
  const itemThumb = (id, full) => {
    const it = itemInfo(id);
    if (it && it.slot === 'design') return '<span class="it-design" data-design="' + esc(id) + '">🎨</span>';
    if (it && it.slot === 'ding' && !full) return '<span class="shop-avatar-full thumb-fig slot-ding"><svg class="shop-avatar-art" viewBox="62 16 68 146" aria-hidden="true"><defs><linearGradient id="gold-glow" x2="0" y2="1"><stop stop-color="#FFE98A"/><stop offset="1" stop-color="#D99519"/></linearGradient></defs><g class="sa-ding">' + dingArt(id) + '</g></svg></span>'; // v0.93: Gegenstand allein
    const sl = it ? it.slot : String(id).split(':')[0];
    const o = { kopf: null, brust: null, beine: null, ding: null };
    o[sl] = id;
    return shopAvatarFull(activeAvatar || 'noergler', full ? 'reveal-fig' : 'thumb-fig slot-' + sl, o);
  };
  // v0.93: zu welchem Sammel-Set gehört ein Teil? „🛡️ Ritter-Set · Teil 2 von 3“ / „Set komplett!“
  const setLine = (id) => { const st = boxSetOf(id); if (!st) return ''; const pr = boxSetProgress(st, inventory); const full = pr.have.length === 3;
    return '<span class="br-set">' + BOX_SETS[st].icon + ' ' + esc(BOX_SETS[st].name) + '-Set · ' + (full ? 'komplett! ✨ ' + esc(SET_FX[st].name) : pr.have.length + ' von 3') + '</span>'; };
  const kisteTab = () => {
    const r = box.res; const info = r ? itemInfo(r.item) : null;
    const left = PITY_LEGEND - (boxState.since_legend || 0);
    const stage = box.st === 'open' && r
      ? '<div class="box-reveal r-' + r.rarity + '" style="--rc:' + RARITIES[r.rarity].color + ';--rg:' + RARITIES[r.rarity].glow + '">' +
          '<div class="br-rays" aria-hidden="true"></div><div class="br-item">' + itemThumb(r.item, true) + '</div>' +
          '<div class="br-text">' + rarTag(r.rarity) + '<b>' + esc(info ? info.name : r.item) + '</b>' + setLine(r.item) +
          (r.dupe ? '<small>Doppelt – +' + r.refund + ' ' + DUB + ' zurück</small>' : '<small>✨ Neu in deiner Sammlung!</small>') + '</div>' +
          '<div class="br-actions">' + (!r.dupe && info && info.slot !== 'design' ? '<button class="shop-action shop-select" data-wear="' + esc(r.item) + '">Gleich anziehen</button>' : '') +
          (info && info.slot === 'design' ? '<button class="shop-action shop-select" data-usedesign="' + esc(r.item) + '">Spielfeld benutzen</button>' : '') +
          '<button class="shop-action shop-buy" data-openbox ' + (balance < BOX_PRICE || busy ? 'disabled' : '') + '>Nochmal · ' + BOX_PRICE + ' ' + DUB + '</button></div></div>'
      : '<div class="box-stage ' + (box.st === 'shake' ? 'shake' : '') + '"><div class="kuhkiste" aria-hidden="true"><i class="kk-lid"></i><i class="kk-body"></i><i class="kk-spots"></i><i class="kk-lock">?</i></div>' +
          '<button class="shop-action shop-buy big" data-openbox ' + (balance < BOX_PRICE || busy ? 'disabled' : '') + '>📦 Kuh-Kiste öffnen · ' + BOX_PRICE + ' ' + DUB + '</button></div>';
    const odds = Object.entries(RARITIES).map(([k, v]) => '<li class="r-' + k + '"><i style="background:' + v.color + '"></i>' + v.name + '<b>' + v.chance + ' %</b></li>').join('');
    const pool = Object.entries(BOX_ITEMS).filter(([, it]) => it.slot !== 'design' || true);
    const got = pool.filter(([id]) => inventory.has(id)).length;
    return '<div class="kiste-wrap"><div class="kiste-main">' + stage + '</div>' +
      '<aside class="kiste-side"><h3>Was drin sein kann</h3><ul class="odds">' + odds + '</ul>' +
      '<p class="pity">🍀 Spätestens in <b>' + left + '</b> Kiste' + (left === 1 ? '' : 'n') + ' garantiert <span class="r-legendaer">Legendär</span>, jede ' + PITY_EPIC + '. mindestens <span class="r-episch">Episch</span>.</p>' +
      '<p class="pity">Sammlung: <b>' + got + '/' + pool.length + '</b> · Doppelte geben Dublonen zurück.</p>' +
      '<div class="kiste-show">' + pool.filter(([, it]) => it.rarity === 'legendaer').map(([id, it]) => '<span class="ks-item ' + (inventory.has(id) ? 'have' : '') + '" title="' + esc(it.name) + '">' + itemThumb(id) + '</span>').join('') + '</div>' +
      '</aside></div>';
  };
  const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
  // v0.93 Set-Fortschritt: welche Kisten-Sets hast du angefangen, was fehlt noch?
  const setsHtml = () => { const rows = Object.keys(BOX_SETS).map((st) => ({ st, ...boxSetProgress(st, inventory) })).filter((x) => x.have.length > 0);
    if (!rows.length) return '';
    return '<ul class="wd-sets">' + rows.map((x) => { const full = x.have.length === 3; const miss = x.parts.filter((p) => !x.have.includes(p)).map((p) => SLOTS.find((k) => k.id === p.split(':')[0]).name);
      return '<li class="' + (full ? 'full' : '') + '" title="' + esc(full ? 'Alle 3 Teile anziehen → ' + SET_FX[x.st].name : 'Fehlt: ' + miss.join(' + ')) + '">' + BOX_SETS[x.st].icon + ' ' + esc(BOX_SETS[x.st].name) + '<span class="pips">' + x.parts.map((p) => '<i class="' + (x.have.includes(p) ? 'on' : '') + '"></i>').join('') + '</span><b>' + (full ? '✨ komplett' : 'fehlt: ' + miss.join(', ')) + '</b></li>'; }).join('') + '</ul>'; };
  const garderobeTab = () => {
    const mine = partsOwned();
    const set = setOf(fullOutfit(activeAvatar, draft));
    const fo = fullOutfit(activeAvatar, draft);
    const missing = (() => { const a = String(fo.kopf || '').split(':')[1]; if (!SET_FX[a]) return ''; const need = ['brust', 'beine'].filter((k) => fo[k] !== k + ':' + a); return need.length ? 'Für den Set-Effekt „' + SET_FX[a].name + '“ fehlt noch: ' + need.map((k) => SLOTS.find((x) => x.id === k).name).join(' + ') + ' von ' + esc(avName(a)) : ''; })();
    const list = [...mine].filter((id) => String(id).startsWith(slot + ':'));
    const locked = Object.entries(BOX_ITEMS).filter(([id, it]) => it.slot === slot && !inventory.has(id)).map(([id]) => id);
    const cur = fo[slot];
    const cell = (id, lock) => '<button class="wd-cell r-' + rarOf(id) + (cur === id ? ' on' : '') + (lock ? ' locked' : '') + '" ' + (lock ? 'disabled' : 'data-part="' + esc(id) + '"') + ' title="' + esc(partName(id, avName)) + '">' + itemThumb(id) + '<small>' + esc(itemInfo(id) ? itemInfo(id).name : avName(String(id).split(':')[1])) + '</small>' + (boxSetOf(id) ? '<i class="setbadge" title="' + esc(BOX_SETS[boxSetOf(id)].name) + '-Set">' + BOX_SETS[boxSetOf(id)].icon + '</i>' : '') + (lock ? '<em class="lk">' + (itemInfo(id) && itemInfo(id).month ? '📦 ' + MONTHS[itemInfo(id).month - 1] : '📦') + '</em>' : '') + '</button>';
    return '<div class="wd-wrap"><div class="wd-left"><div class="wd-fig">' + previewFor(draft) + '</div>' +
      (set ? '<p class="wd-set">✨ Set komplett: <b>' + esc(SET_FX[set].name) + '</b></p>' : missing ? '<p class="wd-miss">' + missing + '</p>' : '') +
      '<button class="shop-action shop-select" data-saveoutfit ' + (busy || JSON.stringify(draft) === JSON.stringify(outfit) ? 'disabled' : '') + '>Anziehen</button>' + setsHtml() + '</div>' +
      '<div class="wd-right"><nav class="wd-slots">' + SLOTS.map((x) => '<button class="' + (slot === x.id ? 'on' : '') + '" data-slot="' + x.id + '">' + x.icon + ' ' + x.name + '</button>').join('') + '</nav>' +
      '<div class="wd-grid">' + (slot === 'ding' || draft[slot] ? '<button class="wd-cell none' + (!draft[slot] ? ' on' : '') + '" data-part="">' + (slot === 'ding' ? '✋ Nichts' : '↺ Vom Avatar') + '</button>' : '') +
      list.map((id) => cell(id, false)).join('') + locked.map((id) => cell(id, true)).join('') + '</div>' +
      (locked.length ? '<p class="shop-hint">📦 = nur in der Kuh-Kiste</p>' : '') + '</div></div>';
  };
  const tierLabel = { selten: 'Selten', episch: 'Episch', legendaer: 'Legendär', kult: 'Kult' };
  // v0.92 Bühne links: deine Figur (oder die Anprobe) groß im Spot
  const stageHtml = () => {
    const id = tryOn || activeAvatar || 'noergler';
    const it = AVATARS.find((a) => a.id === id);
    const has = owned.has(id);
    const fig = shopAvatarFull(id, 'stage-fig', tryOn ? {} : outfit);
    const fx = SET_FX[id];
    return '<div class="stage-spot"></div><div class="stage-figwrap">' + fig + '</div>' +
      '<div class="stage-info"><b>' + esc(it ? it.name : '') + '</b>' + (tryOn ? '<small>' + (has ? 'gehört dir' : 'Anprobe') + (fx ? ' · Set-Effekt: ' + esc(fx.name) : '') + '</small>' : '<small>So sehen dich die anderen</small>') + '</div>' +
      (tryOn && !has ? '<button class="shop-action shop-buy" data-buy="' + esc(id) + '" ' + (balance < (it ? it.price : 0) || busy ? 'disabled' : '') + '>Kaufen · ' + (it ? it.price : '') + ' ' + DUB + '</button>'
        : tryOn && has && activeAvatar !== id ? '<button class="shop-action shop-select" data-select="' + esc(id) + '" ' + (busy ? 'disabled' : '') + '>Auswählen</button>'
        : tryOn ? '<button class="shop-action shop-plain" data-try="">Zurück zu mir</button>' : '');
  };

  const avatarCard = (item) => {
    const has = owned.has(item.id);
    const active = activeAvatar === item.id;
    const action = active
      ? '<span class="shop-active">✓ Aktiv</span>'
      : has
        ? '<button class="shop-action shop-select" data-select="' + esc(item.id) + '" ' + (busy?'disabled':'') + '>Auswählen</button>'
        : '<button class="shop-action shop-buy" data-buy="' + esc(item.id) + '" ' + (balance<item.price||busy?'disabled':'') + '>Kaufen · ' + item.price + ' ' + DUB + '</button>';
    // v0.92: Kachel antippen = links anprobieren; kein Dauer-Schimmer, Seltenheit nur über Rahmen
    return '<article class="shop-item shop-avatar-item v2 shop-tier-' + esc(item.tier) + (active ? ' is-active' : '') + (has ? ' is-owned' : '') + (tryOn === item.id ? ' is-trying' : '') + '">' +
      '<button class="shop-try" data-try="' + esc(item.id) + '" aria-label="' + esc(item.name) + ' anprobieren">' +
      '<span class="shop-tier-tag">' + tierLabel[item.tier] + '</span>' +
      '<span class="shop-art full" data-tier="' + esc(item.tier) + '">' + shopAvatarFull(item.id, 'still') + '</span>' +
      '<strong class="shop-item-name">' + esc(item.name) + '</strong>' + (has ? '<i class="shop-check" aria-label="hast du">✓</i>' : '') + '</button>' +
      action + '</article>';
  };

  const sayingCard = (item) => {
    const has = owned.has(item.id);
    return '<article class="shop-item shop-saying-item' + (has ? ' is-owned' : '') + '"><div class="shop-bubble">' + esc(item.text) + '</div>' +
      (has ? '<span class="shop-owned">✓ hast du</span>'
        : freeLeft > 0 && typeof ctx.claimFree === 'function' ? '<button class="shop-action shop-free" data-free="' + esc(item.id) + '" ' + (busy?'disabled':'') + '>🎁 Gratis nehmen</button>'
        : '<button class="shop-action shop-buy" data-buy="' + esc(item.id) + '" ' + (balance<item.price||busy?'disabled':'') + '>Kaufen · ' + item.price + ' ' + DUB + '</button>') +
      '</article>';
  };

  const customCard = () => {
    const has = owned.has(SHOP_CUSTOM.id);
    return '<article class="shop-item shop-custom-item' + (has ? ' is-owned' : '') + '"><div class="shop-custom-head">✍️ <strong>Eigener Spruch</strong></div>' +
      (has
        ? '<div class="shop-bubble">' + (customText ? esc(customText) : '<i>noch leer – schreib was!</i>') + '</div>' +
          '<form class="shop-custom-form" data-customform><input type="text" maxlength="' + SHOP_CUSTOM.max + '" placeholder="Dein Spruch (max. ' + SHOP_CUSTOM.max + ' Zeichen)" value="' + esc(customText) + '" aria-label="Eigener Spruch" ' + (busy?'disabled':'') + '>' +
          '<button class="shop-action shop-select" type="submit" ' + (busy?'disabled':'') + '>Speichern</button></form>'
        : '<p class="shop-emote-text">Schreib deinen ganz eigenen Spruch – nur du hast ihn, jederzeit änderbar.</p>' +
          '<button class="shop-action shop-buy" data-buy="' + SHOP_CUSTOM.id + '" ' + (balance<SHOP_CUSTOM.price||busy?'disabled':'') + '>Kaufen · ' + SHOP_CUSTOM.price + ' ' + DUB + '</button>') +
      '</article>';
  };

  const emoteCard = (item) => {
    const has = owned.has(item.id);
    return '<article class="shop-item shop-emote-item' + (has ? ' is-owned' : '') + '"><div class="shop-emote-icon">' + item.icon + '</div>' +
      '<strong class="shop-item-name">' + esc(item.name) + '</strong><p class="shop-emote-text">' + esc(item.text) + '</p>' +
      (has ? '<span class="shop-owned">✓ hast du</span>'
        : '<button class="shop-action shop-buy" data-buy="' + esc(item.id) + '" ' + (balance<item.price||busy?'disabled':'') + '>Kaufen · ' + item.price + ' ' + DUB + '</button>') +
      '</article>';
  };

  function render() {
    const nAv = AVATARS.filter((x) => owned.has(x.id)).length, nSp = SHOP_SAYINGS.filter((x) => owned.has(x.id)).length + (owned.has(SHOP_CUSTOM.id) ? 1 : 0);
    root.innerHTML =
      '<section class="shop-shell" aria-label="Shop">' +
        '<header class="shop-header"><h1>🛒 Shop</h1>' +
        '<nav class="shop-tabs" role="tablist">' +
          '<button role="tab" data-tab="kiste" class="kiste-tab ' + (tab === 'kiste' ? 'on' : '') + '">📦 Kuh-Kiste</button>' +
          '<button role="tab" data-tab="garderobe" class="' + (tab === 'garderobe' ? 'on' : '') + '">👕 Garderobe</button>' +
          '<button role="tab" data-tab="avatare" class="' + (tab === 'avatare' ? 'on' : '') + '">Avatare <small>' + nAv + '/' + AVATARS.length + '</small></button>' +
          '<button role="tab" data-tab="sprueche" class="' + (tab === 'sprueche' ? 'on' : '') + '">Sprüche <small>' + nSp + '/' + (SHOP_SAYINGS.length + 1) + '</small></button>' +
          '<button role="tab" data-tab="emotes" class="' + (tab === 'emotes' ? 'on' : '') + '">Emotes <small>' + SHOP_EMOTES.filter((x) => owned.has(x.id)).length + '/' + SHOP_EMOTES.length + '</small></button>' +
        '</nav>' +
        '<div class="shop-balance" title="Dein Guthaben">' + DUB + '<strong>' + new Intl.NumberFormat('de-DE').format(balance) + '</strong></div>' +
        '<button class="shop-close" data-close aria-label="Shop schließen">×</button></header>' +
        (notice?'<div class="shop-notice shop-notice-' + noticeKind + '" role="status">' + esc(notice) + '</div>':'') +
        '<div class="shop-content">' +
          (tab === 'kiste' ? kisteTab() : tab === 'garderobe' ? garderobeTab() : tab === 'emotes'
            ? '<div class="shop-grid shop-emote-grid">' + SHOP_EMOTES.map(emoteCard).join('') + '</div>' +
              '<p class="shop-hint">Im Spiel: auf deine Figur tippen → 💬 → Emote auswählen.</p>'
            : tab === 'avatare'
            ? '<div class="shop-split"><aside class="shop-stage">' + stageHtml() + '</aside><div class="shop-rows">' +
              TIERS.map((t) => '<h3 class="shop-row-h t-' + t.id + '">' + esc(t.label) + ' <small>' + t.items.filter((x) => owned.has(x.id)).length + '/' + t.items.length + '</small></h3><div class="shop-grid shop-avatar-grid">' + t.items.map(avatarCard).join('') + '</div>').join('') +
              '<p class="shop-hint">Antippen = anprobieren. Ein Avatar bringt Kopf, Brust und Beine für die Garderobe mit.</p></div></div>'
            : (freeLeft > 0 && typeof ctx.claimFree === 'function' ? '<p class="shop-gift">🎁 Such dir <b>' + freeLeft + (freeLeft > 1 ? ' Sprüche' : ' Spruch') + '</b> gratis aus!</p>' : '') +
              '<div class="shop-grid shop-saying-grid">' + customCard() + SHOP_SAYINGS.map(sayingCard).join('') + '</div>' +
              '<p class="shop-hint">Gekaufte Sprüche findest du im Spiel unter 💬.</p>') +
        '</div><footer class="shop-footer">Jeder Sieg = 10 ' + DUB + ' · Einmal gekauft, dauerhaft deins.</footer></section>';

    root.querySelector('[data-close]')?.addEventListener('click', () => ctx.close());
    // v0.93: Gegenstands-Kacheln auf das Teil zuschneiden (jeder Gegenstand ist anders groß)
    root.querySelectorAll('.thumb-fig.slot-ding svg').forEach((svg) => { try { const g = svg.querySelector('.sa-ding'); const b = g && g.getBBox(); if (!b || !b.width) return; const m = Math.max(b.width, b.height) * 0.12 + 3; const w = Math.max(b.width, b.height * 0.75) + 2 * m; const h = Math.max(b.height, b.width / 1.1) + 2 * m; svg.setAttribute('viewBox', [b.x + b.width / 2 - w / 2, b.y + b.height / 2 - h / 2, w, h].map((x) => x.toFixed(1)).join(' ')); } catch { /* ohne Layout (Test) egal */ } });
    root.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; notice = ''; render(); }));
    root.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => buy(b.dataset.buy)));
    root.querySelectorAll('[data-free]').forEach(b => b.addEventListener('click', () => claim(b.dataset.free)));
    root.querySelectorAll('[data-select]').forEach(b => b.addEventListener('click', () => select(b.dataset.select)));
    root.querySelectorAll('[data-openbox]').forEach((b) => b.addEventListener('click', openBox));
    root.querySelectorAll('[data-try]').forEach((b) => b.addEventListener('click', () => { tryOn = b.dataset.try || null; render(); }));
    root.querySelectorAll('[data-slot]').forEach((b) => b.addEventListener('click', () => { slot = b.dataset.slot; render(); }));
    root.querySelectorAll('[data-part]').forEach((b) => b.addEventListener('click', () => { draft = { ...draft, [slot]: b.dataset.part || null }; if (!draft[slot]) delete draft[slot]; render(); }));
    root.querySelector('[data-saveoutfit]')?.addEventListener('click', saveOutfit);
    root.querySelectorAll('[data-wear]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.wear; const sl = itemInfo(id).slot; draft = { ...outfit, [sl]: id }; slot = sl; tab = 'garderobe'; box = { st: 'idle', res: null }; saveOutfit(); }));
    root.querySelectorAll('[data-usedesign]').forEach((b) => b.addEventListener('click', () => { if (typeof ctx.useDesign === 'function') ctx.useDesign(b.dataset.usedesign.replace(/^design-/, '')); notice = 'Spielfeld gewechselt.'; noticeKind = 'success'; render(); }));
    root.querySelector('[data-customform]')?.addEventListener('submit', (e) => { e.preventDefault(); saveCustom(e.target.querySelector('input').value); });
  }

  async function buy(id) {
    if (busy || owned.has(id)) return;
    const item = [...AVATARS,...SHOP_SAYINGS,...SHOP_EMOTES,SHOP_CUSTOM].find(x => x.id === id);
    if (!item) return;
    if (balance < item.price) { notice='Dafür reichen deine Dublonen noch nicht.'; noticeKind='error'; render(); return; }
    busy=true; notice=''; render();
    try {
      const result = await ctx.buy(id);
      owned.add(id);
      balance = Number.isFinite(Number(result?.balance)) ? Number(result.balance) : balance-item.price;
      notice = 'Gekauft! 🎉'; noticeKind='success';
    } catch (e) { notice=e?.message || 'Der Kauf konnte nicht abgeschlossen werden.'; noticeKind='error'; }
    finally { busy=false; render(); }
  }

  async function openBox() {
    if (busy || typeof ctx.openBox !== 'function') return;
    if (balance < BOX_PRICE) { notice = 'Dafür reichen deine Dublonen noch nicht.'; noticeKind = 'error'; render(); return; }
    busy = true; notice = ''; box = { st: 'shake', res: null }; render();
    const t0 = Date.now();
    try {
      const r = await ctx.openBox();
      await new Promise((ok) => setTimeout(ok, Math.max(0, 1400 - (Date.now() - t0))));
      inventory.add(r.item); balance = Number(r.balance);
      boxState = { since_legend: r.rarity === 'legendaer' ? 0 : (boxState.since_legend || 0) + 1, since_epic: ['episch', 'legendaer'].includes(r.rarity) ? 0 : (boxState.since_epic || 0) + 1 };
      box = { st: 'open', res: r };
      if (typeof ctx.onBox === 'function') ctx.onBox(r);
    } catch (e) { box = { st: 'idle', res: null }; notice = e?.message || 'Die Kiste klemmt – nochmal versuchen.'; noticeKind = 'error'; }
    finally { busy = false; render(); }
  }

  async function saveOutfit() {
    if (busy || typeof ctx.setOutfit !== 'function') return;
    busy = true; notice = ''; render();
    try { outfit = { ...(await ctx.setOutfit(draft)) }; draft = { ...outfit }; notice = 'Angezogen! Alle sehen es am Tisch.'; noticeKind = 'success'; }
    catch (e) { notice = e?.message || 'Das hat nicht geklappt.'; noticeKind = 'error'; }
    finally { busy = false; render(); }
  }

  async function claim(id) {
    if (busy || owned.has(id) || freeLeft <= 0) return;
    busy=true; notice=''; render();
    try {
      const r = await ctx.claimFree(id);
      owned.add(id); freeLeft = Number.isFinite(Number(r?.freeLeft)) ? Number(r.freeLeft) : freeLeft-1;
      notice = 'Geschenkt! 🎁'; noticeKind='success';
    } catch (e) { notice=e?.message || 'Das hat nicht geklappt.'; noticeKind='error'; }
    finally { busy=false; render(); }
  }

  async function saveCustom(text) {
    if (busy || typeof ctx.saveCustom !== 'function') return;
    const t = String(text || '').replace(/\s+/g, ' ').trim();
    if (!t) { notice = 'Bitte einen Spruch eingeben.'; noticeKind = 'error'; render(); return; }
    if (t.length > SHOP_CUSTOM.max) { notice = 'Höchstens ' + SHOP_CUSTOM.max + ' Zeichen.'; noticeKind = 'error'; render(); return; }
    busy = true; notice = ''; render();
    try { customText = (await ctx.saveCustom(t)) || t; notice = 'Gespeichert – im Spiel unter 💬.'; noticeKind = 'success'; }
    catch (e) { notice = e?.message || 'Das hat nicht geklappt.'; noticeKind = 'error'; }
    finally { busy = false; render(); }
  }

  async function select(id) {
    if (busy || !owned.has(id)) return;
    busy=true; notice=''; render();
    try {
      await ctx.setAvatar(id); activeAvatar=id;
      notice='Avatar ist jetzt aktiv.'; noticeKind='success';
    } catch (e) { notice=e?.message || 'Der Avatar konnte nicht ausgewählt werden.'; noticeKind='error'; }
    finally { busy=false; render(); }
  }

  render();
  return {
    refresh(next={}) {
      if (Number.isFinite(Number(next.balance))) balance=Number(next.balance);
      if (next.owned) { owned.clear(); next.owned.forEach(id=>owned.add(id)); }
      if ('activeAvatar' in next) activeAvatar=next.activeAvatar;
      render();
    },
    destroy() { root.replaceChildren(); }
  };
}
