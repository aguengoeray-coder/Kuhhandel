import { SHOP_AVATARS, SHOP_AVATAR_CSS, shopAvatar } from './shopavatars.js';

export const SHOP_SAYINGS = [
  { id:'spruch-ehrlich', text:'Ehrliches, männliches Angebot! 💪', price:10 },
  { id:'spruch-unehrlich', text:'Unehrliches, unmännliches Angebot! 👎', price:10 },
  { id:'spruch-mehr', text:'Komm schon, da geht noch mehr!', price:10 },
  { id:'spruch-bluff', text:'Bluff!', price:10 },
  { id:'spruch-niemals', text:'Niemals!', price:10 },
  { id:'spruch-gutgespielt', text:'Gut gespielt!', price:10 },
  { id:'spruch-verteuert', text:'Zu teuer!', price:10 },
  { id:'spruch-gute-ideen', text:'Ich habe nur gute Ideen', price:20 }
];
const AVATARS = SHOP_AVATARS.map(({id,name,tier,price,animal}) => ({id,name,tier,price,animal}));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tierName = (t) => t === 'legendaer' ? 'Legendär' : t[0].toUpperCase()+t.slice(1);

function addAvatarCss() {
  if (document.getElementById('shop-avatar-runtime-css')) return;
  const style = document.createElement('style');
  style.id = 'shop-avatar-runtime-css';
  style.textContent = SHOP_AVATAR_CSS;
  document.head.append(style);
}

/**
 * ctx = { me:{id,name}, balance, owned:Set<itemId>, activeAvatar,
 *         buy(itemId):Promise, setAvatar(id):Promise, close() }
 * Das Modul verwaltet weder Auth noch Supabase und importiert nicht app.js.
 */
export function renderShop(root, ctx) {
  if (!root || !ctx || typeof ctx.buy !== 'function' ||
      typeof ctx.setAvatar !== 'function' || typeof ctx.close !== 'function') {
    throw new TypeError('renderShop benötigt root und einen vollständigen Shop-Kontext.');
  }
  addAvatarCss();
  let balance = Math.max(0, Number(ctx.balance) || 0);
  const owned = new Set(ctx.owned || []);
  let activeAvatar = ctx.activeAvatar || null;
  let busy = false;
  let notice = '';
  let noticeKind = 'info';

  const avatarCard = (item) => {
    const has = owned.has(item.id);
    const active = activeAvatar === item.id;
    const action = active
      ? '<span class="shop-active">Aktiv</span>'
      : has
        ? '<button class="shop-action shop-select" data-select="' + esc(item.id) + '" ' + (busy?'disabled':'') + '>Auswählen</button>'
        : '<button class="shop-action shop-buy" data-buy="' + esc(item.id) + '" ' + (balance<item.price||busy?'disabled':'') + '>Kaufen · ' + item.price + '</button>';
    return '<article class="shop-item shop-avatar-item shop-tier-' + esc(item.tier) + '">' +
      '<div class="shop-art">' + shopAvatar(item.id) + '</div>' +
      '<strong class="shop-item-name">' + esc(item.name) + '</strong>' +
      '<span class="shop-item-sub">' + tierName(item.tier) + ' · ' + item.price + ' D</span>' +
      (has?'<span class="shop-owned">✓ hast du</span>':'') + action + '</article>';
  };

  const sayingCard = (item) => {
    const has = owned.has(item.id);
    return '<article class="shop-item shop-saying-item"><span class="shop-quote-mark">„</span>' +
      '<strong class="shop-saying-text">' + esc(item.text) + '</strong>' +
      '<span class="shop-item-sub">' + item.price + ' Dublonen</span>' +
      (has?'<span class="shop-owned">✓ hast du</span>':'<button class="shop-action shop-buy" data-buy="' + item.id + '" ' + (balance<item.price||busy?'disabled':'') + '>Kaufen · ' + item.price + '</button>') +
      '</article>';
  };

  function render() {
    root.innerHTML =
      '<section class="shop-shell" aria-label="Shop">' +
        '<header class="shop-header"><div class="shop-heading"><span class="shop-kicker">TEAM ROCKETS TIER BÖRSE</span><h1>Shop</h1><span class="shop-greeting">' + esc(ctx.me?.name || 'Börsianer') + '</span></div>' +
        '<div class="shop-balance"><span>Dein Guthaben</span><strong>' + new Intl.NumberFormat('de-DE').format(balance) + ' <small>Dublonen</small></strong></div>' +
        '<button class="shop-close" data-close aria-label="Shop schließen">×</button></header>' +
        (notice?'<div class="shop-notice shop-notice-' + noticeKind + '" role="status">' + esc(notice) + '</div>':'') +
        '<div class="shop-content">' +
          '<section class="shop-section"><div class="shop-section-head"><div><h2>Deine Börsen-Avatare</h2><p>Sammelkarten für deinen Auftritt am Tisch</p></div><span>11 Charaktere</span></div>' +
          '<div class="shop-avatar-grid">' + AVATARS.map(avatarCard).join('') + '</div></section>' +
          '<section class="shop-section"><div class="shop-section-head"><div><h2>Sprüche</h2><p>Deine Lieblingssprüche für den Handel</p></div><span>8 Sammlerstücke</span></div>' +
          '<div class="shop-saying-grid">' + SHOP_SAYINGS.map(sayingCard).join('') + '</div></section>' +
        '</div><footer class="shop-footer"><span>Spiele gewinnen. Dublonen sammeln. Deinen Stil zeigen.</span><span>Einmal gekauft, dauerhaft deins.</span></footer></section>';

    root.querySelector('[data-close]')?.addEventListener('click', () => ctx.close());
    root.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => buy(b.dataset.buy)));
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
      notice = 'Artikel erfolgreich gekauft.'; noticeKind='success';
    } catch (e) { notice=e?.message || 'Der Kauf konnte nicht abgeschlossen werden.'; noticeKind='error'; }
    finally { busy=false; render(); }
  }

  async function select(id) {
    if (busy || !owned.has(id)) return;
    busy=true; notice=''; render();
    try {
      await ctx.setAvatar(id); activeAvatar=id;
      notice='Avatar wurde ausgewählt.'; noticeKind='success';
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
