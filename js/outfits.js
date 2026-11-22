// v0.91 Outfits & Kuh-Kiste (Alps Go 22.11.): 4 Fächer – Kopf, Brust, Beine, Gegenstand.
// Ein gekaufter Avatar bringt Kopf + Brust + Beine mit. Gegenstände und sehr seltene Teile gibt es nur in der Kuh-Kiste.
// Vollständiges 3er-Set eines Avatars → passender Effekt (Stinkwolke, Flammen, Glitzer …).
// Gezogen wird auf dem Server (shop_open_box) – die Liste hier muss zu supabase/v0.91-kuhkiste.sql passen (Test prüft das).

export const SLOTS = [
  { id: 'kopf', name: 'Kopf', icon: '🧢' },
  { id: 'brust', name: 'Brust', icon: '👕' },
  { id: 'beine', name: 'Beine', icon: '👖' },
  { id: 'ding', name: 'Gegenstand', icon: '⚔️' },
];

export const RARITIES = {
  gewoehnlich: { name: 'Gewöhnlich', color: '#9CA3AF', glow: 'rgba(156,163,175,.6)', chance: 60, refund: 5 },
  selten: { name: 'Selten', color: '#3B82F6', glow: 'rgba(59,130,246,.65)', chance: 27, refund: 10 },
  episch: { name: 'Episch', color: '#A855F7', glow: 'rgba(168,85,247,.7)', chance: 10, refund: 20 },
  legendaer: { name: 'Legendär', color: '#F59E0B', glow: 'rgba(245,158,11,.8)', chance: 3, refund: 50 },
};
export const BOX_PRICE = 40;
export const PITY_LEGEND = 25; // spätestens jede 25. Kiste legendär
export const PITY_EPIC = 8; // spätestens jede 8. mindestens episch

const INK = '#2A2420';
const S = `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;

// Gegenstände: in der rechten Hand (Figur 120×200, Hand bei 90/128)
const DING_ART = {
  gummihuhn: `<g ${S}><path d="M92 128L104 92" stroke-width="5" fill="none"/><ellipse cx="106" cy="84" rx="9" ry="12" fill="#F8D24B" transform="rotate(18 106 84)"/><path d="M112 76l6-3-2 6z" fill="#E8862F"/><path d="M103 72q2-6 6-4" fill="none" stroke="#D43C3C" stroke-width="3"/><circle cx="109" cy="80" r="1.6" fill="${INK}"/></g>`,
  heugabel: `<g ${S}><path d="M90 132L104 60" stroke="#8A5A2B" stroke-width="5" fill="none"/><path d="M96 62q8-4 16 3M100 58l-2-14M106 60l2-14M111 64l5-12" fill="none" stroke="#9AA3AA" stroke-width="3"/></g>`,
  melkeimer: `<g ${S}><path d="M80 132h26l-4 26H84z" fill="#C9D3DB"/><path d="M80 132q13-16 26 0" fill="none"/><path d="M83 140h20" stroke="#9AA3AA"/><path d="M86 136q7-3 14 0" fill="#FFFDF5" stroke-width="1.5"/></g>`,
  karotte: `<g ${S}><path d="M92 126l20-30 4 3-18 32z" fill="#F08A24"/><path d="M112 96l4-10M114 98l8-6M110 95l-2-10" stroke="#3FA34D" stroke-width="3" fill="none"/><path d="M100 116l4 2M106 108l3 2" fill="none" stroke="#C86A12" stroke-width="1.5"/></g>`,
  auktionshammer: `<g ${S}><path d="M90 130L106 82" stroke="#8A5A2B" stroke-width="5" fill="none"/><rect x="96" y="66" width="24" height="14" rx="3" fill="#A86B34" transform="rotate(18 108 73)"/></g>`,
  kuhglocke: `<g ${S}><path d="M90 128v-8" stroke="#8A5A2B" stroke-width="4"/><path d="M80 120q0-18 10-18t10 18l4 12H76z" fill="#E0B23C"/><circle cx="90" cy="134" r="3.5" fill="#8A6A1E"/><path d="M84 112q6-4 12 0" fill="none" stroke="#FFF2B5" stroke-width="2"/></g>`,
  lasso: `<g ${S}><ellipse cx="104" cy="96" rx="14" ry="20" fill="none" stroke="#C99B5A" stroke-width="4"/><path d="M92 128q8-10 4-14" fill="none" stroke="#C99B5A" stroke-width="4"/></g>`,
  goldhammer: `<g ${S}><path d="M90 130L106 80" stroke="#7A4A1E" stroke-width="5" fill="none"/><rect x="94" y="62" width="28" height="16" rx="4" fill="url(#gold-glow)" transform="rotate(18 108 70)"/><path d="M114 58l3-6M120 64l6-2M108 54l-1-6" stroke="#FFE98A" stroke-width="2"/></g>`,
  geldkoffer: `<g ${S}><rect x="78" y="128" width="32" height="22" rx="3" fill="#3C3C46"/><path d="M88 128v-5h12v5" fill="none"/><path d="M80 134h28" stroke="#C9A227" stroke-width="2"/><rect x="83" y="120" width="10" height="8" fill="#7FBF6E" stroke-width="1.5" transform="rotate(-14 88 124)"/><rect x="95" y="119" width="10" height="8" fill="#7FBF6E" stroke-width="1.5" transform="rotate(10 100 123)"/></g>`,
  gurkensaebel: `<g ${S}><path d="M90 130l4-6" stroke="#5B3A1E" stroke-width="6"/><path d="M86 122h16" stroke="#C9A227" stroke-width="4"/><path d="M94 120q10-30 22-58q4 6-2 16q-8 22-16 42z" fill="#5FAE47"/><circle cx="104" cy="96" r="1.5" fill="#2F6B22" stroke="none"/><circle cx="110" cy="80" r="1.5" fill="#2F6B22" stroke="none"/></g>`,
  donnerhammer: `<g ${S}><path d="M90 130L104 78" stroke="#5B6670" stroke-width="6" fill="none"/><rect x="88" y="54" width="34" height="22" rx="4" fill="#AEB7C0" transform="rotate(16 105 65)"/><path d="M96 62h20" stroke="#7D8790" stroke-width="2"/><path class="zap" d="M112 40l-8 12h7l-6 12" fill="none" stroke="#FFE04A" stroke-width="3.5"/><path class="zap z2" d="M84 52l-6 8h5l-4 8" fill="none" stroke="#FFE04A" stroke-width="3"/></g>`,
  kristallglocke: `<g ${S}><path d="M90 128v-8" stroke="#6AA8D8" stroke-width="4"/><path d="M78 120q0-20 12-20t12 20l4 12H74z" fill="#BFE6FF" opacity=".95"/><path d="M84 106l6 22M96 106l-6 22" stroke="#FFFFFF" stroke-width="1.5" fill="none"/><circle cx="90" cy="135" r="3.5" fill="#6AA8D8"/><path class="spark" d="M104 96l3 3M106 92l5-1M74 98l-4-2" stroke="#FFFFFF" stroke-width="2"/></g>`,
};

// Sehr seltene Teile aus der Kiste (gleiche Bausteine wie die Avatar-Körper)
const PARTS = {
  'brust:ringelshirt': { top: '#E9EEF2', sleeve: '#E9EEF2', chest: '<path d="M37 104h46M38 118h44M39 132h42M40 146h40" stroke="#C8443A" stroke-width="5"/>' },
  'beine:jogginghose': { pants: '#7A8290', shoes: '#F2F2F2', legL: 'M48 150Q46 170 46 188', legR: 'M72 150Q74 170 74 188' },
  'brust:holzfaeller': { top: '#B8352E', sleeve: '#B8352E', chest: '<path d="M44 90v62M60 88v64M76 90v62M36 112h48M34 134h52" stroke="#3B2A22" stroke-width="2.5" opacity=".7"/>' },
  'beine:latzhose': { pants: '#4E6FA3', shoes: '#6B4A2E', front: '<rect x="44" y="118" width="32" height="30" rx="4" fill="#4E6FA3" stroke="#2A2420" stroke-width="2.5"/><circle cx="48" cy="122" r="2.5" fill="#E8C14D"/><circle cx="72" cy="122" r="2.5" fill="#E8C14D"/>' },
  'brust:smoking': { top: '#1E1E24', sleeve: '#1E1E24', chest: '<path d="M48 88l12 34 12-34z" fill="#FFFFFF" stroke="#2A2420" stroke-width="2"/><path d="M54 92l6 4 6-4-6 4z" fill="#C8443A" stroke="#2A2420" stroke-width="1.5"/><circle cx="60" cy="110" r="1.8" fill="#2A2420"/>' },
  'beine:kuhfleck': { pants: '#FFFDF5', shoes: '#2A2420', legExtra: '<g fill="#2A2420"><ellipse cx="46" cy="162" rx="5" ry="7"/><ellipse cx="74" cy="172" rx="4" ry="6"/><ellipse cx="50" cy="180" rx="3" ry="4"/></g>' },
  'brust:astronaut': { top: '#E9EEF2', sleeve: '#E9EEF2', chest: '<rect x="46" y="102" width="28" height="18" rx="3" fill="#5B6670" stroke="#2A2420" stroke-width="2"/><circle cx="53" cy="111" r="2.5" fill="#E2643A"/><circle cx="60" cy="111" r="2.5" fill="#F5D75B"/><circle cx="67" cy="111" r="2.5" fill="#4FB0E0"/><path d="M40 140h40" stroke="#E2643A" stroke-width="4"/>' },
  'beine:astronaut': { pants: '#E9EEF2', shoes: '#5B6670', legExtra: '<path d="M42 168h12M66 168h12" stroke="#E2643A" stroke-width="4"/>' },
  'brust:goldruestung': { top: 'url(#gold-glow)', sleeve: '#D9A72B', chest: '<path d="M40 100q20 12 40 0M42 122q18 10 36 0" fill="none" stroke="#8A5A12" stroke-width="2.5"/><circle cx="60" cy="112" r="6" fill="#C8443A" stroke="#8A5A12" stroke-width="2"/>', back: '<path d="M34 92Q14 146 22 190H98Q106 146 86 92Z" fill="#B8352E" stroke="#2A2420" stroke-width="3"/>' },
  'beine:raketenstiefel': { pants: '#5B6670', shoes: '#E2643A', legExtra: '<g class="flame"><path d="M40 196q0 8-4 12q8-2 8-10M80 196q0 8 4 12q-8-2-8-10" fill="#F6B13A" stroke="#B74A27" stroke-width="2"/></g>' },
};

// Kiste-Inhalt: id → { slot, name, rarity }
export const BOX_ITEMS = {
  // Gewöhnlich
  'ding:gummihuhn': { slot: 'ding', name: 'Gummihuhn-Keule', rarity: 'gewoehnlich' },
  'ding:heugabel': { slot: 'ding', name: 'Heugabel', rarity: 'gewoehnlich' },
  'ding:melkeimer': { slot: 'ding', name: 'Melkeimer', rarity: 'gewoehnlich' },
  'ding:karotte': { slot: 'ding', name: 'Riesen-Karotte', rarity: 'gewoehnlich' },
  'brust:ringelshirt': { slot: 'brust', name: 'Ringelshirt', rarity: 'gewoehnlich' },
  'beine:jogginghose': { slot: 'beine', name: 'Jogginghose', rarity: 'gewoehnlich' },
  // Selten
  'ding:auktionshammer': { slot: 'ding', name: 'Auktionshammer', rarity: 'selten' },
  'ding:kuhglocke': { slot: 'ding', name: 'Kuhglocke', rarity: 'selten' },
  'ding:lasso': { slot: 'ding', name: 'Lasso', rarity: 'selten' },
  'brust:holzfaeller': { slot: 'brust', name: 'Holzfäller-Hemd', rarity: 'selten' },
  'beine:latzhose': { slot: 'beine', name: 'Latzhose', rarity: 'selten' },
  'design-casino': { slot: 'design', name: 'Spielfeld „Casino“', rarity: 'selten' },
  'design-bauernhof': { slot: 'design', name: 'Spielfeld „Bauernhof“', rarity: 'selten' },
  // Episch
  'ding:goldhammer': { slot: 'ding', name: 'Goldener Auktionshammer', rarity: 'episch' },
  'ding:geldkoffer': { slot: 'ding', name: 'Geldkoffer', rarity: 'episch' },
  'ding:gurkensaebel': { slot: 'ding', name: 'Gurken-Säbel', rarity: 'episch' },
  'brust:smoking': { slot: 'brust', name: 'Smoking', rarity: 'episch' },
  'beine:kuhfleck': { slot: 'beine', name: 'Kuhfleck-Hose', rarity: 'episch' },
  'brust:astronaut': { slot: 'brust', name: 'Raumanzug', rarity: 'episch' },
  'beine:astronaut': { slot: 'beine', name: 'Raumanzug-Hose', rarity: 'episch' },
  'design-ozean': { slot: 'design', name: 'Spielfeld „Ozean“', rarity: 'episch' },
  'design-strand': { slot: 'design', name: 'Spielfeld „Strand“', rarity: 'episch' },
  // Legendär
  'ding:donnerhammer': { slot: 'ding', name: 'Donnerhammer des Viehhändlers', rarity: 'legendaer' },
  'ding:kristallglocke': { slot: 'ding', name: 'Kristall-Kuhglocke', rarity: 'legendaer' },
  'brust:goldruestung': { slot: 'brust', name: 'Goldrüstung', rarity: 'legendaer' },
  'beine:raketenstiefel': { slot: 'beine', name: 'Raketenstiefel', rarity: 'legendaer' },
  'kopf:goldkuh': { slot: 'kopf', name: 'Goldene Kuh', rarity: 'legendaer', head: 'kuh-kaiser', tint: 'gold' },
  'design-winter': { slot: 'design', name: 'Spielfeld „Winter“', rarity: 'legendaer' },
};

// Set-Effekt je Avatar (alle 3 Teile desselben Avatars an)
export const SET_FX = {
  noergler: { fx: 'stink', name: 'Stinkwolke' },
  'opa-ratte': { fx: 'stink', name: 'Käse-Mief' },
  'business-huhn': { fx: 'schweiss', name: 'Stress-Schweiß' },
  'spar-schwein': { fx: 'muenzen', name: 'Münzregen' },
  'boersen-gauner': { fx: 'scheine', name: 'Geldscheine' },
  'disco-kuh': { fx: 'glitzer', name: 'Disco-Glitzer' },
  'raketen-esel': { fx: 'rauch', name: 'Raketenrauch' },
  'piraten-papagei': { fx: 'blasen', name: 'Meeresgischt' },
  daemonenritter: { fx: 'feuer', name: 'Höllenfeuer' },
  'cyborg-hahn': { fx: 'blitz', name: 'Stromschlag' },
  'kuh-kaiser': { fx: 'krone', name: 'Kaiserlicher Glanz' },
  'bennet-verletzt': { fx: 'sterne', name: 'Sternchen' },
  'nico-schreit': { fx: 'schall', name: 'Schallwellen' },
  'alp-quasselt': { fx: 'blabla', name: 'Bla-Bla-Wolke' },
  'mr-passt-schon': { fx: 'daumen', name: 'Passt-schon-Aura' },
  'mama-sports': { fx: 'schweiss', name: 'Sport-Schweiß' },
  'dumme-kuh': { fx: 'herzen', name: 'Dumme Herzchen' },
  'dickes-huhn': { fx: 'blasen', name: 'Planschwasser' },
  'bontje-lebkuchen': { fx: 'glitzer', name: 'Zuckerglitzer' },
  'schmatz-zwillinge': { fx: 'kruemel', name: 'Krümel' },
  'nacht-gohan': { fx: 'aura', name: 'Kampfaura' },
  'mogli-schielt': { fx: 'sterne', name: 'Schwindel' },
  'dicker-gojo': { fx: 'aura', name: 'Blaue Aura' },
};

export function partArt(id) { return PARTS[id] || null; }
export function dingArt(id) { return DING_ART[String(id || '').replace(/^ding:/, '')] || ''; }
export function itemInfo(id) { return BOX_ITEMS[id] || null; }
export function boxPool(rarity) { return Object.entries(BOX_ITEMS).filter(([, it]) => it.rarity === rarity).map(([id]) => id); }

// Welche Teile hat jemand? Avatar gekauft → kopf:/brust:/beine:<avatar>; Kiste → Inventar
export function ownedParts(purchased = [], inventory = []) {
  const out = new Set(inventory);
  for (const av of purchased) for (const s of ['kopf', 'brust', 'beine']) out.add(`${s}:${av}`);
  return out;
}
// Outfit ausgehend vom aktiven Avatar ergänzen (leere Fächer = Teil des aktiven Avatars)
export function fullOutfit(active, outfit = {}) {
  const o = outfit || {};
  return { kopf: o.kopf || (active ? `kopf:${active}` : null), brust: o.brust || (active ? `brust:${active}` : null), beine: o.beine || (active ? `beine:${active}` : null), ding: o.ding || null };
}
// Set komplett? → Avatar-ID des Sets
export function setOf(o) {
  const av = (k) => (String(o?.[k] || '').startsWith(`${k}:`) ? String(o[k]).slice(k.length + 1) : null);
  const a = av('kopf'); return a && a === av('brust') && a === av('beine') && SET_FX[a] ? a : null;
}
// Kurzname eines Teils für Listen
export function partName(id, avatarName) {
  if (BOX_ITEMS[id]) return BOX_ITEMS[id].name;
  const [slot, av] = String(id).split(':');
  const s = SLOTS.find((x) => x.id === slot);
  return `${s ? s.name : slot}: ${avatarName ? avatarName(av) : av}`;
}
