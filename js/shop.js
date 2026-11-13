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
  let busy = false;
  let notice = '';
  let noticeKind = 'info';

  let tab = 'avatare';
  const tierLabel = { selten: 'Selten', episch: 'Episch', legendaer: 'Legendär', kult: 'Kult' };

  const avatarCard = (item) => {
    const has = owned.has(item.id);
    const active = activeAvatar === item.id;
    const action = active
      ? '<span class="shop-active">✓ Aktiv</span>'
      : has
        ? '<button class="shop-action shop-select" data-select="' + esc(item.id) + '" ' + (busy?'disabled':'') + '>Auswählen</button>'
        : '<button class="shop-action shop-buy" data-buy="' + esc(item.id) + '" ' + (balance<item.price||busy?'disabled':'') + '>Kaufen · ' + item.price + ' ' + DUB + '</button>';
    return '<article class="shop-item shop-avatar-item shop-tier-' + esc(item.tier) + (active ? ' is-active' : '') + (has ? ' is-owned' : '') + '">' +
      '<span class="shop-tier-tag">' + tierLabel[item.tier] + '</span>' +
      '<div class="shop-art full" data-tier="' + esc(item.tier) + '">' + shopAvatarFull(item.id) + '</div>' +
      '<strong class="shop-item-name">' + esc(item.name) + '</strong>' +
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

  function render() {
    const nAv = AVATARS.filter((x) => owned.has(x.id)).length, nSp = SHOP_SAYINGS.filter((x) => owned.has(x.id)).length;
    root.innerHTML =
      '<section class="shop-shell" aria-label="Shop">' +
        '<header class="shop-header"><h1>🛒 Shop</h1>' +
        '<nav class="shop-tabs" role="tablist">' +
          '<button role="tab" data-tab="avatare" class="' + (tab === 'avatare' ? 'on' : '') + '">Avatare <small>' + nAv + '/' + AVATARS.length + '</small></button>' +
          '<button role="tab" data-tab="sprueche" class="' + (tab === 'sprueche' ? 'on' : '') + '">Sprüche <small>' + nSp + '/' + SHOP_SAYINGS.length + '</small></button>' +
        '</nav>' +
        '<div class="shop-balance" title="Dein Guthaben">' + DUB + '<strong>' + new Intl.NumberFormat('de-DE').format(balance) + '</strong></div>' +
        '<button class="shop-close" data-close aria-label="Shop schließen">×</button></header>' +
        (notice?'<div class="shop-notice shop-notice-' + noticeKind + '" role="status">' + esc(notice) + '</div>':'') +
        '<div class="shop-content">' +
          (tab === 'avatare'
            ? '<div class="shop-grid shop-avatar-grid">' + TIERS.flatMap((t) => t.items).map(avatarCard).join('') + '</div>' +
              '<p class="shop-hint">Dein aktiver Avatar ersetzt dein Profilbild – für alle am Tisch sichtbar.</p>'
            : (freeLeft > 0 && typeof ctx.claimFree === 'function' ? '<p class="shop-gift">🎁 Such dir <b>' + freeLeft + (freeLeft > 1 ? ' Sprüche' : ' Spruch') + '</b> gratis aus!</p>' : '') +
              '<div class="shop-grid shop-saying-grid">' + SHOP_SAYINGS.map(sayingCard).join('') + '</div>' +
              '<p class="shop-hint">Gekaufte Sprüche findest du im Spiel unter 💬.</p>') +
        '</div><footer class="shop-footer">Jeder Sieg = 10 ' + DUB + ' · Einmal gekauft, dauerhaft deins.</footer></section>';

    root.querySelector('[data-close]')?.addEventListener('click', () => ctx.close());
    root.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; notice = ''; render(); }));
    root.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => buy(b.dataset.buy)));
    root.querySelectorAll('[data-free]').forEach(b => b.addEventListener('click', () => claim(b.dataset.free)));
    root.querySelectorAll('[data-select]').forEach(b => b.addEventListener('click', () => select(b.dataset.select)));
  }

  async function buy(id) {
    if (busy || owned.has(id)) return;
    const item = [...AVATARS,...SHOP_SAYINGS].find(x => x.id === id);
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
