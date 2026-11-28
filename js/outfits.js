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
  // v1.4 Stufe „bunt“: nicht in der Kiste – nur aus 2× demselben legendären Gegenstand in der Schmiede
  mythisch: { name: 'Mythisch', color: '#FF4FD8', glow: 'rgba(255,79,216,.85)', chance: 0, refund: 100 },
};
export const BOX_PRICE = 40;
export const PITY_LEGEND = 25; // spätestens jede 25. Kiste legendär
export const PITY_EPIC = 8; // spätestens jede 8. mindestens episch

const INK = '#2A2420';
const S = `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;

// Schwert in der rechten Hand: Griff an der Hand (90/128), Klinge schräg nach oben
const sword = (blade, edge, grip, extra = '') => `<g ${S}><path d="M89 134l5-12" stroke="${grip}" stroke-width="6"/><path d="M86 120l16 6" stroke="#C9A227" stroke-width="5"/><path d="M92 122L115 50l6 3-1 5-19 64z" fill="${blade}"/><path d="M96 122L117 56" stroke="${edge}" stroke-width="1.5" fill="none"/>${extra}</g>`;
// Gegenstände: in der rechten Hand (Figur 120×200, Hand bei 90/128)
const DING_ART = {
  // v1.4 neue Gegenstände (Alp 28.11.)
  fliegenklatsche: `<g ${S}><path d="M90 130L106 84" stroke="#3FA34D" stroke-width="4" fill="none"/><rect x="98" y="58" width="22" height="26" rx="4" fill="#5BC06B" transform="rotate(18 109 71)"/><path d="M104 64l12 4M102 70l12 4M100 76l12 4" stroke="#2E7D3A" stroke-width="1.5"/></g>`,
  kochloeffel: `<g ${S}><path d="M90 130L104 84" stroke="#C99B5A" stroke-width="5" fill="none"/><ellipse cx="107" cy="74" rx="8" ry="12" fill="#D9AE6E" transform="rotate(18 107 74)"/></g>`,
  regenschirm: `<g ${S}><path d="M92 134L104 70" stroke="#2A2420" stroke-width="3" fill="none"/><path d="M92 134q-2 6-7 3" fill="none" stroke-width="3"/><path d="M82 72q22-26 44 4q-6-4-11 0q-5-5-11 0q-6-5-11 0q-6-4-11-4z" fill="#E2643A"/><path d="M104 50v-4" stroke-width="3"/></g>`,
  baguette: `<g ${S}><path d="M86 136L118 70q4-4 6 2L94 140q-6 2-8-4z" fill="#E0A85A"/><path d="M98 120l6-2M104 108l6-2M110 96l6-2M114 84l6-2" stroke="#A8702A" stroke-width="2"/></g>`,
  trompete: `<g ${S}><path d="M88 128l24-40" stroke="#E0B23C" stroke-width="6" fill="none"/><path d="M106 80l14-12 6 8-14 10z" fill="#F5C542"/><ellipse cx="124" cy="70" rx="6" ry="10" fill="#FFE27A" transform="rotate(40 124 70)"/><circle cx="98" cy="108" r="3" fill="#C99B2A"/><circle cx="102" cy="101" r="3" fill="#C99B2A"/></g>`,
  zauberstab: `<g ${S}><path d="M90 130L112 70" stroke="#2A2420" stroke-width="5" fill="none"/><path d="M110 74l4-10" stroke="#FFFDF5" stroke-width="5"/><path class="spark" d="M118 56l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFE98A"/><circle class="spark" cx="104" cy="58" r="2" fill="#BFE6FF"/></g>`,
  steinschleuder: `<g ${S}><path d="M90 132l8-26" stroke="#8A5A2B" stroke-width="5" fill="none"/><path d="M98 106l-6-20M98 106l12-16" stroke="#8A5A2B" stroke-width="4" fill="none"/><path d="M92 86q8 10 18 4" fill="none" stroke="#C8443A" stroke-width="2.5"/><circle cx="101" cy="90" r="4" fill="#9AA3AA"/></g>`,
  fernrohr: `<g ${S}><path d="M88 132l10-6" stroke-width="3"/><path d="M92 128l30-36" stroke="#8A5A2B" stroke-width="9" fill="none"/><path d="M106 112l14-17" stroke="#E0B23C" stroke-width="11" fill="none"/><circle cx="123" cy="90" r="5" fill="#BFE6FF"/></g>`,
  dreizack: `<g ${S}><path d="M90 136L112 56" stroke="#E0B23C" stroke-width="5" fill="none"/><path d="M100 64q10-6 22 4M104 60l-2-16M112 62l4-14M120 68l8-10" fill="none" stroke="#F5C542" stroke-width="4"/></g>`,
  egitarre: `<g ${S}><path d="M98 112L118 56" stroke="#2A2420" stroke-width="5" fill="none"/><rect x="113" y="46" width="10" height="12" rx="2" fill="#2A2420" transform="rotate(20 118 52)"/><path d="M80 126q-6-14 8-18q4-12 14-4q10 0 6 14q8 10-6 14q-8 10-16 2q-8 2-6-8z" fill="#D02A3A"/><circle cx="96" cy="118" r="3" fill="#2A2420"/></g>`,
  lasersaebel: `<g ${S}><path d="M88 134l7-16" stroke="#5B6670" stroke-width="7"/><path d="M95 118L120 52" stroke="#7CF0FF" stroke-width="7" stroke-linecap="round" fill="none" class="flick"/><path d="M95 118L120 52" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" fill="none"/></g>`,
  bumerang: `<g ${S}><path d="M90 128q4-30 28-44l6 6q-20 14-24 40z" fill="#C99B5A"/><path d="M100 120q4-20 18-30" fill="none" stroke="#E2643A" stroke-width="2" stroke-dasharray="4 3"/></g>`,
  koenigszepter: `<g ${S}><path d="M90 136L110 64" stroke="#E0B23C" stroke-width="6" fill="none"/><circle cx="112" cy="58" r="9" fill="#C8243A"/><path d="M104 52l4-8 4 6 4-6 4 8z" fill="#F5C542"/><circle cx="96" cy="114" r="4" fill="#3B82F6"/></g>`,
  drachenaxt: `<g ${S}><path d="M88 136L108 66" stroke="#3A2A3A" stroke-width="6" fill="none"/><path d="M104 74q24-18 22 12q-8-8-20-2z" fill="#9AA3AA"/><path d="M104 74q-16-16-20 6q6-4 16-2z" fill="#9AA3AA"/><path d="M106 62l6-10 2 10z" fill="#3FA34D"/><path class="flick" d="M120 70q8-4 6-12" fill="none" stroke="#FF6A1C" stroke-width="3"/></g>`,
  sternenbogen: `<g ${S}><path d="M100 140q34-40 4-96" fill="none" stroke="#5B4A7A" stroke-width="5"/><path d="M100 140L104 44" stroke="#FFE98A" stroke-width="1.5"/><path class="spark" d="M112 66l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM116 118l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#FFE98A"/></g>`,
  sense: `<g ${S}><path d="M90 140L112 48" stroke="#5B3A2E" stroke-width="5" fill="none"/><path d="M112 50q-30-10-46 14q20-8 44-6z" fill="#E9EEF2"/><path d="M110 52q-24-6-38 8" fill="none" stroke="#F5C542" stroke-width="2"/></g>`,
  // Mythisch (bunt): Regenbogen-Glanz
  karotte: ['🥕', '🐰', '🥕'], auktionshammer: ['🔨', '💰', '🔨'], kuhglocke: ['🔔', '🎵', '🐄'], lasso: ['🤠', '💨', '🤠'], goldhammer: ['🔨', '🪙', '✨'],
  geldkoffer: ['💰', '💸', '💵'], gurkensaebel: ['🥒', '⚔️', '🥒'], kristallglocke: ['🔔', '💎', '✨'], holzschwert: ['🪵', '⚔️', '💨'], eisenschwert: ['⚔️', '✨', '⚔️'],
  lanze: ['🏇', '💨', '✨'], katana: ['🗡️', '🌸', '💨'],
  regenbogenklinge: `<g ${S}><defs><linearGradient id="rbw" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF4F4F"/><stop offset=".2" stop-color="#FFB02E"/><stop offset=".4" stop-color="#F5E642"/><stop offset=".6" stop-color="#4FD86A"/><stop offset=".8" stop-color="#4FA8FF"/><stop offset="1" stop-color="#B84FFF"/></linearGradient></defs><path d="M89 134l5-12" stroke="#2A2420" stroke-width="6"/><path d="M84 120l20 7" stroke="#F5C542" stroke-width="6"/><path d="M92 122L116 44l6 3-1 6-22 74z" fill="url(#rbw)"/><path class="spark" d="M124 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFFFFF"/></g>`,
  kosmoshammer: `<g ${S}><path d="M90 136L106 76" stroke="#2A2440" stroke-width="6" fill="none"/><rect x="92" y="52" width="34" height="22" rx="5" fill="#2A1B5C" transform="rotate(16 109 63)"/><circle cx="104" cy="60" r="2" fill="#FFFFFF"/><circle cx="114" cy="66" r="1.5" fill="#FFE98A"/><circle cx="120" cy="58" r="1.8" fill="#BFE6FF"/><path d="M96 56q14-8 30 6" fill="none" stroke="#B84FFF" stroke-width="2"/></g>`,
  einhornlanze: `<g ${S}><path d="M84 150L112 40" stroke="#FFFDF5" stroke-width="6" fill="none"/><path d="M112 40l3-18 4 20z" fill="#FFE98A"/><path d="M98 96l10 3M102 82l10 3M106 68l10 3" stroke="#FF9AD5" stroke-width="3"/><path d="M110 52q-10 6-16 0q8-2 12-8" fill="#B84FFF"/></g>`,
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
  // v0.92 Waffen-Stufen: Holz → Eisen → Kristall → Flammen (+ Katana, Lanze)
  holzschwert: sword('#C99B5A', '#8A5A2B', '#6B4A2E', '<path d="M100 100l3-6M106 84l2-5" stroke="#8A5A2B" stroke-width="1.5" fill="none"/>'),
  eisenschwert: sword('#D8DEE4', '#8A949C', '#3B332E', '<path d="M98 112L112 66" stroke="#FFFFFF" stroke-width="1.5" opacity=".8"/><path class="gleam" d="M99 110L115 58" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" pathLength="100" stroke-dasharray="14 200" fill="none"/>'),
  kristallschwert: sword('#BFE6FF', '#6AA8D8', '#5B4A7A', '<path d="M98 112L112 66" stroke="#FFFFFF" stroke-width="2" opacity=".9"/><path class="spark" d="M118 58l3-3M122 66l5 1M110 50l-1-5" stroke="#FFFFFF" stroke-width="2"/>'),
  flammenschwert: sword('#FFB02E', '#B74A27', '#2A2420', '<g class="flick"><path d="M106 104q10-12 4-24q10 8 6 22M112 86q8-10 2-22q10 8 6 20M116 70q6-8 0-16q8 6 4 16" fill="#FF6A1C" stroke="#B74A27" stroke-width="1.5"/><path d="M100 98q4-8 2-14q6 6 2 14" fill="#FFE27A" stroke="none"/></g>'),
  katana: `<g ${S}><path d="M90 132l5-12" stroke="#2A2420" stroke-width="5"/><path d="M90 128l5-12" stroke="#C8443A" stroke-width="2" stroke-dasharray="2 3"/><ellipse cx="96" cy="117" rx="7" ry="3" fill="#C9A227" transform="rotate(-62 96 117)"/><path d="M97 114q8-30 26-56q-2 8-6 14q-10 18-16 44z" fill="#E9EEF2"/><path d="M100 110q8-28 22-50" stroke="#9AA3AA" stroke-width="1.2" fill="none"/></g>`,
  lanze: `<g ${S}><path d="M84 150L112 40" stroke="#8A5A2B" stroke-width="5" fill="none"/><path d="M110 46l6-26 4 28z" fill="#D8DEE4"/><path d="M104 60l12 4" stroke="#C9A227" stroke-width="4"/><path d="M112 48q-14 4-20 14q12-2 18-8z" fill="#C8443A" stroke-width="1.5"/></g>`,
  kristallglocke: `<g ${S}><path d="M90 128v-8" stroke="#6AA8D8" stroke-width="4"/><path d="M78 120q0-20 12-20t12 20l4 12H74z" fill="#BFE6FF" opacity=".95"/><path d="M84 106l6 22M96 106l-6 22" stroke="#FFFFFF" stroke-width="1.5" fill="none"/><circle cx="90" cy="135" r="3.5" fill="#6AA8D8"/><path class="spark" d="M104 96l3 3M106 92l5-1M74 98l-4-2" stroke="#FFFFFF" stroke-width="2"/></g>`,
};

// Sehr seltene Teile aus der Kiste (gleiche Bausteine wie die Avatar-Körper)
const PARTS = {
  'brust:ringelshirt': { top: '#E9EEF2', sleeve: '#E9EEF2', chest: '<path d="M37 104h46M38 118h44M39 132h42M40 146h40" stroke="#C8443A" stroke-width="5"/>' },
  'beine:jogginghose': { pants: '#7A8290', shoes: '#F2F2F2', feet: 'sneaker', legL: 'M48 150Q46 170 46 188', legR: 'M72 150Q74 170 74 188', legExtra: '<path d="M42 152v26M78 152v26" stroke="#FFFFFF" stroke-width="2.5"/><path d="M39 180h14M67 180h14" stroke="#5B6270" stroke-width="4" stroke-linecap="round"/>' },
  'brust:holzfaeller': { top: '#B8352E', sleeve: '#B8352E', chest: '<path d="M44 90v62M60 88v64M76 90v62M36 112h48M34 134h52" stroke="#3B2A22" stroke-width="2.5" opacity=".7"/>' },
  'beine:latzhose': { pants: '#4E6FA3', shoes: '#6B4A2E', front: '<rect x="44" y="118" width="32" height="30" rx="4" fill="#4E6FA3" stroke="#2A2420" stroke-width="2.5"/><circle cx="48" cy="122" r="2.5" fill="#E8C14D"/><circle cx="72" cy="122" r="2.5" fill="#E8C14D"/><rect x="52" y="128" width="16" height="11" rx="2" fill="#3D5A8A" stroke="#2A2420" stroke-width="2"/><path d="M55 128v-4M65 128v-4" stroke="#E8C14D" stroke-width="2"/>' },
  'brust:smoking': { top: '#1E1E24', sleeve: '#1E1E24', chest: '<path d="M48 88l12 34 12-34z" fill="#FFFFFF" stroke="#2A2420" stroke-width="2"/><path d="M54 92l6 4 6-4-6 4z" fill="#C8443A" stroke="#2A2420" stroke-width="1.5"/><circle cx="60" cy="110" r="1.8" fill="#2A2420"/>' },
  'beine:kuhfleck': { pants: '#FFFDF5', shoes: '#2A2420', legExtra: '<g fill="#2A2420"><ellipse cx="46" cy="162" rx="5" ry="7"/><ellipse cx="74" cy="172" rx="4" ry="6"/><ellipse cx="50" cy="180" rx="3" ry="4"/></g>' },
  'brust:astronaut': { top: '#E9EEF2', sleeve: '#E9EEF2', chest: '<rect x="46" y="102" width="28" height="18" rx="3" fill="#5B6670" stroke="#2A2420" stroke-width="2"/><circle cx="53" cy="111" r="2.5" fill="#E2643A"/><circle cx="60" cy="111" r="2.5" fill="#F5D75B"/><circle cx="67" cy="111" r="2.5" fill="#4FB0E0"/><path d="M40 140h40" stroke="#E2643A" stroke-width="4"/>' },
  'beine:astronaut': { pants: '#E9EEF2', shoes: '#5B6670', legExtra: '<path d="M42 168h12M66 168h12" stroke="#E2643A" stroke-width="4"/>' },
  'brust:goldruestung': { top: 'url(#gold-glow)', sleeve: '#D9A72B', chest: '<path d="M40 100q20 12 40 0M42 122q18 10 36 0" fill="none" stroke="#8A5A12" stroke-width="2.5"/><circle cx="60" cy="112" r="6" fill="#C8443A" stroke="#8A5A12" stroke-width="2"/>', back: '<path d="M34 92Q14 146 22 190H98Q106 146 86 92Z" fill="#B8352E" stroke="#2A2420" stroke-width="3"/>' },
  'beine:skateboard': { ride: 'skateboard' },
  'beine:rollschuhe': { ride: 'rollschuhe' },
  'beine:stelzen': { ride: 'stelzen' },
  'beine:traktor': { ride: 'traktor' },
  'beine:wolke': { ride: 'wolke' },
  // v0.92 Rüstungs-Sets (Kopf = Helm über dem eigenen Kopf, Brust, Beine) – alle 3 an → Set-Effekt
  // v1.7 neue Köpfe (über dem eigenen Kopf, wie Helme)
  'kopf:cowboyhut': { helm: '<g stroke="#2A2420" stroke-width="2.5" stroke-linejoin="round"><path d="M10 26q50 14 100 0q-4 8-16 10H26q-12-2-16-10z" fill="#A86A33"/><path d="M34 24q0-22 26-22t26 22z" fill="#C2843F"/><path d="M34 20h52" stroke="#5B3A1E" stroke-width="5"/></g>' },
  'kopf:kochmuetze': { helm: '<g stroke="#2A2420" stroke-width="2.5" stroke-linejoin="round"><path d="M34 24q-14-4-10-18q8-10 18-4q6-10 18-8q12-2 18 8q10-6 18 4q4 14-10 18z" fill="#FFFFFF"/><rect x="34" y="20" width="52" height="10" rx="2" fill="#F3F1EA"/></g>' },
  'kopf:taucherbrille': { helm: '<g stroke="#2A2420" stroke-width="2.5"><path d="M18 36h84" stroke="#FFB02E" stroke-width="6"/><rect x="28" y="24" width="64" height="24" rx="10" fill="#7FD3F0" fill-opacity=".55"/><path d="M60 26v20" stroke-width="3"/><path d="M96 40q10 0 10-14v-18" fill="none" stroke="#FFB02E" stroke-width="5"/><circle cx="106" cy="6" r="4" fill="#FFB02E"/></g>' },
  'kopf:partyhut': { helm: '<g stroke="#2A2420" stroke-width="2.5" stroke-linejoin="round"><path d="M44 24L62 -14L80 24z" fill="#FF5C8A"/><path d="M50 12l20 0M54 2l14 0" stroke="#F5E642" stroke-width="4"/><circle cx="62" cy="-15" r="5" fill="#7CF0FF"/><path d="M44 24q18 6 36 0" fill="none"/></g>' },
  'kopf:wikinger': { helm: '<g stroke="#2A2420" stroke-width="2.5" stroke-linejoin="round"><path d="M28 30Q22 6 6 4q4 18 22 30z" fill="#FFFDF5"/><path d="M92 30Q98 6 114 4q-4 18-22 30z" fill="#FFFDF5"/><path d="M28 34Q28 6 60 6Q92 6 92 34z" fill="#9AA3AA"/><path d="M28 32h64" stroke="#C9A227" stroke-width="5"/><path d="M60 6v26" stroke="#C9A227" stroke-width="4"/></g>' },
  'kopf:krone': { helm: '<g stroke="#2A2420" stroke-width="2.5" stroke-linejoin="round"><path d="M32 30l-4-24 16 12 16-18 16 18 16-12-4 24z" fill="#F5C542"/><circle cx="60" cy="14" r="4" fill="#C8243A"/><circle cx="44" cy="22" r="3" fill="#3B82F6"/><circle cx="76" cy="22" r="3" fill="#3FA34D"/></g>' },
  'kopf:heiligenschein': { helm: '<g class="halo"><ellipse cx="60" cy="0" rx="30" ry="8" fill="none" stroke="#FFE98A" stroke-width="6"/><ellipse cx="60" cy="0" rx="30" ry="8" fill="none" stroke="#FFFFFF" stroke-width="2"/></g>' },
  'kopf:hoerner': { helm: '<g stroke="#2A2420" stroke-width="2.5" stroke-linejoin="round"><path d="M34 22Q20 4 28 -12q4 14 16 26z" fill="#C8243A"/><path d="M86 22Q100 4 92 -12q-4 14-16 26z" fill="#C8243A"/><path class="flick" d="M28 -12q2-8 6-10q-1 6 2 8z" fill="#FF6A1C" stroke="none"/><path class="flick" d="M92 -12q-2-8-6-10q1 6-2 8z" fill="#FF6A1C" stroke="none"/></g>' },
  'kopf:ritter': { helm: '<g stroke="#2A2420" stroke-width="2.5" stroke-linejoin="round"><path d="M60 8q6-12 18-10q-8 4-12 12z" fill="#C8443A"/><path d="M26 40Q26 6 60 6Q94 6 94 40z" fill="#C9D3DB"/><path d="M26 34h68v8H26z" fill="#8E98A2"/><path d="M56 40h8v14h-8z" fill="#8E98A2"/><path d="M40 14q8-4 14-4" fill="none" stroke="#FFFFFF" stroke-width="2.5"/></g>' },
  'brust:ritter': { top: '#AEB7C0', sleeve: '#8E98A2', chest: '<path d="M44 92h32v50l-16 8-16-8z" fill="#E9EEF2" stroke="#2A2420" stroke-width="2.5"/><path d="M60 98v40M48 112h24" stroke="#C8443A" stroke-width="6"/>' },
  'beine:ritter': { pants: '#8E98A2', shoes: '#5B6670', legExtra: '<g fill="#C9D3DB" stroke="#2A2420" stroke-width="2"><path d="M40 152h16l-1 34H41z"/><path d="M64 152h16l-1 34H65z"/><path d="M41 166q7-6 14 0q-7 6-14 0zM65 166q7-6 14 0q-7 6-14 0z" fill="#E9EEF2"/></g><path class="gleam" d="M44 156v26M68 156v26" stroke="#FFFFFF" stroke-width="2.5" pathLength="100" stroke-dasharray="14 200" fill="none"/>' },
  'kopf:samurai': { helm: '<g stroke="#2A2420" stroke-width="2.5" stroke-linejoin="round"><path d="M22 52q2-14 8-18h60q6 4 8 18l-12-6H34z" fill="#3A2A3A"/><path d="M28 38Q28 8 60 8Q92 8 92 38z" fill="#8E2A2A"/><path d="M28 34h64" stroke="#C9A227" stroke-width="3"/><path d="M60 30Q42 14 34 -4Q48 6 60 20Q72 6 86 -4Q78 14 60 30z" fill="#E0B23C"/><circle cx="60" cy="26" r="5" fill="#C9A227"/></g>' },
  'brust:samurai': { top: '#8E2A2A', sleeve: '#3A2A3A', chest: '<g stroke="#C9A227" stroke-width="2.5" fill="none"><path d="M38 104h44M38 116h44M39 128h42M40 140h40"/></g><path d="M52 96v50M68 96v50" stroke="#2A2420" stroke-width="1.5" stroke-dasharray="3 4"/>' },
  'beine:samurai': { pants: '#3A2E4A', shoes: '#2A2420', legL: 'M46 150Q42 170 44 188', legR: 'M74 150Q78 170 76 188', legExtra: '<g fill="#8E2A2A" stroke="#2A2420" stroke-width="2"><rect x="39" y="164" width="12" height="16" rx="2"/><rect x="69" y="164" width="12" height="16" rx="2"/></g>' },
  'kopf:astronaut': { helm: '<g><circle cx="60" cy="46" r="42" fill="#BFE6FF" opacity=".28" stroke="#E9EEF2" stroke-width="4"/><path d="M30 30q10-18 30-22" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity=".85"/><path d="M26 82q34 14 68 0" fill="none" stroke="#5B6670" stroke-width="6" stroke-linecap="round"/><circle cx="96" cy="20" r="3" fill="#E2643A" stroke="#2A2420" stroke-width="1.5"/></g>' },
  'kopf:weihnachtsmann': { helm: '<g stroke="#2A2420" stroke-width="2.5" stroke-linejoin="round"><path d="M30 30Q44 -6 80 2Q100 8 104 26q-10-8-20-8Q90 28 90 30z" fill="#D02A3A"/><ellipse cx="60" cy="31" rx="34" ry="7" fill="#FFFDF5"/><circle cx="104" cy="28" r="7" fill="#FFFDF5"/></g>' },
  'brust:weihnachtsmann': { top: '#D02A3A', sleeve: '#D02A3A', chest: '<path d="M56 90h8v60h-8z" fill="#FFFDF5" stroke="#2A2420" stroke-width="2"/><path d="M36 128h48v9H36z" fill="#1E1E24" stroke="#2A2420" stroke-width="2"/><rect x="53" y="126" width="14" height="13" rx="2" fill="none" stroke="#E0B23C" stroke-width="3"/>' },
  'beine:weihnachtsmann': { pants: '#D02A3A', shoes: '#1E1E24', legExtra: '<g fill="#FFFDF5" stroke="#2A2420" stroke-width="2"><rect x="38" y="174" width="18" height="7" rx="3"/><rect x="64" y="174" width="18" height="7" rx="3"/></g>' },
  // v1.0.1 Goldene Hufe (Set Goldene Kuh) + Pharao-Set
  'beine:goldhufe': { pants: '#E0B23C', shoes: '#D99519', feet: 'kuhhuf', legExtra: '<g fill="none" stroke="#FFF3B0" stroke-width="2"><path d="M44 158v14M76 158v14"/></g><path d="M38 150h44" stroke="#FFE98A" stroke-width="3"/><g class="goldspark" fill="#FFF3B0"><path class="g1" d="M36 198l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z"/><path class="g2" d="M84 196l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z"/></g>' },
  'kopf:pharao': { helm: '<g stroke="#2A2420" stroke-width="2.5" stroke-linejoin="round"><path d="M26 34Q26 4 60 4Q94 4 94 34L100 86H84L88 40H32L36 86H20z" fill="#F5C542"/><path d="M24 44h12M22 56h13M21 68h14M84 44h12M85 56h13M85 68h14M34 14q26-10 52 0M30 24q30-10 60 0" stroke="#1F4FA8" stroke-width="4" fill="none"/><path d="M28 34h64" stroke="#1F4FA8" stroke-width="5"/><path d="M56 22q4-10 8 0l-2 6h-4z" fill="#1F4FA8"/></g>' },
  'brust:pharao': { top: '#FFFDF5', sleeve: '#C8A27A', chest: '<path d="M36 92q24 22 48 0v10q-24 22-48 0z" fill="#F5C542" stroke="#2A2420" stroke-width="2"/><path d="M38 98q22 18 44 0" stroke="#1F4FA8" stroke-width="3" fill="none"/><path d="M40 104q20 14 40 0" stroke="#C8443A" stroke-width="2.5" fill="none"/>' },
  'beine:pharao': { pants: '#FFFDF5', shoes: '#C99B5A', legExtra: '<path d="M38 150h44l-4 16H42z" fill="#FFFDF5" stroke="#2A2420" stroke-width="2"/><path d="M56 150v16M64 150v16" stroke="#F5C542" stroke-width="3"/>' },
  // v1.6 neue Beine
  'beine:gummistiefel': { pants: '#4E6FA3', shoes: '#F5C542', feet: 'gummi' },
  'beine:cowboy': { pants: '#3D5A8A', shoes: '#8A5A2B', feet: 'cowboy', legExtra: '<path d="M38 150h44" stroke="#8A5A2B" stroke-width="5"/><rect x="54" y="146" width="12" height="9" rx="2" fill="#E0B23C" stroke="#2A2420" stroke-width="2"/>' },
  'beine:hoverboard': { ride: 'hoverboard' },
  'beine:moonboots': { pants: '#E9EEF2', shoes: '#E9EEF2', feet: 'moon' },
  'beine:jetpack': { pants: '#5B6670', shoes: '#2A2420', legExtra: '<path d="M36 146h48" stroke="#2A2420" stroke-width="4"/><g stroke="#2A2420" stroke-width="2.5"><rect x="14" y="112" width="15" height="36" rx="6" fill="#C9D3DB"/><rect x="91" y="112" width="15" height="36" rx="6" fill="#C9D3DB"/><path d="M29 140h8M83 140h8" stroke-width="4"/></g><path d="M16 120h11M93 120h11" stroke="#C8443A" stroke-width="3"/><g class="rkfire jet" transform="translate(21.5 148)"><path class="f1" d="M-7 0q7 28 14 0z" fill="#FF6A1C"/><path class="f2" d="M-4 0q4 17 8 0z" fill="#FFF8D8"/></g><g class="rkfire jet" transform="translate(98.5 148)"><path class="f1" d="M-7 0q7 28 14 0z" fill="#FF6A1C"/><path class="f2" d="M-4 0q4 17 8 0z" fill="#FFF8D8"/></g>' },
  'beine:lavastiefel': { pants: '#3A2A2A', shoes: '#2A2420', feet: 'lava', legExtra: '<path d="M44 156l4 8-3 6 4 8M74 158l-3 7 4 7-3 8" fill="none" stroke="#FF6A1C" stroke-width="2" class="lavaglow"/>' },
  'beine:raketenstiefel': { feet: 'duese', pants: '#5B6670', shoes: '#E2643A', legExtra: '<g class="flame"><path d="M40 196q0 8-4 12q8-2 8-10M80 196q0 8 4 12q-8-2-8-10" fill="#F6B13A" stroke="#B74A27" stroke-width="2"/></g>' },
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
  // v0.92 Untergründe (Fach Beine): die Figur steht/fährt auf etwas
  'beine:rollschuhe': { slot: 'beine', name: 'Rollschuhe', rarity: 'gewoehnlich' },
  'beine:stelzen': { slot: 'beine', name: 'Sprungstelzen', rarity: 'gewoehnlich' },
  'beine:skateboard': { slot: 'beine', name: 'Skateboard', rarity: 'selten' },
  'beine:traktor': { slot: 'beine', name: 'Mini-Traktor', rarity: 'episch' },
  'beine:wolke': { slot: 'beine', name: 'Wolke 7', rarity: 'legendaer' },
  // v1.4 neue Gegenstände
  'ding:fliegenklatsche': { slot: 'ding', name: 'Fliegenklatsche', rarity: 'gewoehnlich' },
  'ding:kochloeffel': { slot: 'ding', name: 'Kochlöffel', rarity: 'gewoehnlich' },
  'ding:regenschirm': { slot: 'ding', name: 'Regenschirm', rarity: 'gewoehnlich' },
  'ding:baguette': { slot: 'ding', name: 'Baguette', rarity: 'gewoehnlich' },
  'ding:trompete': { slot: 'ding', name: 'Trompete', rarity: 'selten' },
  'ding:zauberstab': { slot: 'ding', name: 'Zauberstab', rarity: 'selten' },
  'ding:steinschleuder': { slot: 'ding', name: 'Steinschleuder', rarity: 'selten' },
  'ding:fernrohr': { slot: 'ding', name: 'Fernrohr', rarity: 'selten' },
  'ding:dreizack': { slot: 'ding', name: 'Dreizack', rarity: 'episch' },
  'ding:egitarre': { slot: 'ding', name: 'E-Gitarre', rarity: 'episch' },
  'ding:lasersaebel': { slot: 'ding', name: 'Laser-Säbel', rarity: 'episch' },
  'ding:bumerang': { slot: 'ding', name: 'Bumerang', rarity: 'episch' },
  'ding:koenigszepter': { slot: 'ding', name: 'Königszepter', rarity: 'legendaer' },
  'ding:drachenaxt': { slot: 'ding', name: 'Drachenaxt', rarity: 'legendaer' },
  'ding:sternenbogen': { slot: 'ding', name: 'Sternenbogen', rarity: 'legendaer' },
  'ding:sense': { slot: 'ding', name: 'Goldene Sense', rarity: 'legendaer' },
  // Mythisch – nur aus der Schmiede (2× derselbe legendäre Gegenstand), nicht in der Kiste
  'ding:regenbogenklinge': { slot: 'ding', name: 'Regenbogen-Klinge', rarity: 'mythisch', forge: true },
  'ding:kosmoshammer': { slot: 'ding', name: 'Kosmos-Hammer', rarity: 'mythisch', forge: true },
  'ding:einhornlanze': { slot: 'ding', name: 'Einhorn-Lanze', rarity: 'mythisch', forge: true },
  // v0.92 Waffen-Stufen
  'ding:holzschwert': { slot: 'ding', name: 'Holzschwert', rarity: 'gewoehnlich' },
  'ding:eisenschwert': { slot: 'ding', name: 'Eisenschwert', rarity: 'selten' },
  'ding:lanze': { slot: 'ding', name: 'Turnierlanze', rarity: 'selten' },
  'ding:kristallschwert': { slot: 'ding', name: 'Kristallschwert', rarity: 'episch' },
  'ding:katana': { slot: 'ding', name: 'Katana', rarity: 'episch' },
  'ding:flammenschwert': { slot: 'ding', name: 'Flammenschwert', rarity: 'legendaer' },
  // v0.92 Rüstungs-Sets (Kopf + Brust + Beine desselben Sets → Set-Effekt); month = nur in diesem Monat in der Kiste
  'kopf:cowboyhut': { slot: 'kopf', name: 'Cowboyhut', rarity: 'gewoehnlich' },
  'kopf:kochmuetze': { slot: 'kopf', name: 'Kochmütze', rarity: 'gewoehnlich' },
  'kopf:taucherbrille': { slot: 'kopf', name: 'Taucherbrille', rarity: 'selten' },
  'kopf:partyhut': { slot: 'kopf', name: 'Partyhut', rarity: 'selten' },
  'kopf:wikinger': { slot: 'kopf', name: 'Wikingerhelm', rarity: 'episch' },
  'kopf:krone': { slot: 'kopf', name: 'Krone', rarity: 'episch' },
  'kopf:heiligenschein': { slot: 'kopf', name: 'Heiligenschein', rarity: 'legendaer' },
  'kopf:hoerner': { slot: 'kopf', name: 'Teufelshörner', rarity: 'legendaer' },
  'kopf:ritter': { slot: 'kopf', name: 'Ritterhelm', rarity: 'selten' },
  'brust:ritter': { slot: 'brust', name: 'Ritter-Wappenrock', rarity: 'selten' },
  'beine:ritter': { slot: 'beine', name: 'Ritter-Beinschienen', rarity: 'selten' },
  'kopf:samurai': { slot: 'kopf', name: 'Samurai-Helm', rarity: 'episch' },
  'brust:samurai': { slot: 'brust', name: 'Samurai-Rüstung', rarity: 'episch' },
  'beine:samurai': { slot: 'beine', name: 'Samurai-Hakama', rarity: 'episch' },
  'kopf:astronaut': { slot: 'kopf', name: 'Raumhelm', rarity: 'legendaer' },
  'beine:goldhufe': { slot: 'beine', name: 'Goldene Hufe', rarity: 'legendaer' },
  'beine:gummistiefel': { slot: 'beine', name: 'Gummistiefel', rarity: 'gewoehnlich' },
  'beine:cowboy': { slot: 'beine', name: 'Cowboystiefel', rarity: 'selten' },
  'beine:hoverboard': { slot: 'beine', name: 'Hoverboard', rarity: 'episch' },
  'beine:moonboots': { slot: 'beine', name: 'Moonboots', rarity: 'episch' },
  'beine:jetpack': { slot: 'beine', name: 'Jetpack-Hose', rarity: 'legendaer' },
  'beine:lavastiefel': { slot: 'beine', name: 'Lava-Stiefel', rarity: 'legendaer' },
  'kopf:pharao': { slot: 'kopf', name: 'Pharaonen-Haube', rarity: 'legendaer' },
  'brust:pharao': { slot: 'brust', name: 'Pharaonen-Kragen', rarity: 'legendaer' },
  'beine:pharao': { slot: 'beine', name: 'Pharaonen-Schurz', rarity: 'legendaer' },
  'kopf:weihnachtsmann': { slot: 'kopf', name: 'Weihnachtsmütze', rarity: 'episch', month: 12 },
  'brust:weihnachtsmann': { slot: 'brust', name: 'Weihnachtsmantel', rarity: 'episch', month: 12 },
  'beine:weihnachtsmann': { slot: 'beine', name: 'Weihnachtsstiefel', rarity: 'episch', month: 12 },
  'design-winter': { slot: 'design', name: 'Spielfeld „Winter“', rarity: 'legendaer' },
};

// Set-Effekt je Avatar (alle 3 Teile desselben Avatars an) – v0.92: große gezeichnete Effekte hinter/vor der Figur
// Typen: feuer (Flammenwand), stink (Wolke + Fliegen), disco (Kugel + Lichtkegel), blitz (Bögen), geld (Regen + Haufen), glanz (Strahlen + Funkeln),
// sakura (Blütenblätter), sterne (Sternenhimmel), schnee (Flocken)
export const SET_FX = {
  noergler: { fx: 'stink', c: '#8DBF3C', name: 'Stinkwolke' },
  'opa-ratte': { fx: 'stink', c: '#E0C04A', name: 'Käse-Mief' },
  'business-huhn': { fx: 'geld', c: '#7FBF6E', name: 'Bonus-Regen' },
  'spar-schwein': { fx: 'geld', c: '#F2C94C', name: 'Münzregen' },
  'boersen-gauner': { fx: 'geld', c: '#7FBF6E', name: 'Geldscheine' },
  'disco-kuh': { fx: 'disco', c: '#C86BFF', name: 'Disco-Fieber' },
  'raketen-esel': { fx: 'feuer', c: '#FF9A2E', name: 'Raketenglut' },
  'piraten-papagei': { fx: 'glanz', c: '#4FB0E0', name: 'Meeresgischt' },
  daemonenritter: { fx: 'feuer', c: '#FF4A1C', name: 'Höllenfeuer' },
  'cyborg-hahn': { fx: 'blitz', c: '#57F5F1', name: 'Stromschlag' },
  'kuh-kaiser': { fx: 'glanz', c: '#FFD34E', name: 'Kaiserlicher Glanz' },
  'bennet-verletzt': { fx: 'glanz', c: '#FFE98A', name: 'Sternchen' },
  'nico-schreit': { fx: 'blitz', c: '#FF7AA8', name: 'Schallwellen' },
  'alp-quasselt': { fx: 'stink', c: '#9AA9C4', name: 'Bla-Bla-Wolke' },
  'mr-passt-schon': { fx: 'glanz', c: '#7FD3F0', name: 'Passt-schon-Aura' },
  'mama-sports': { fx: 'blitz', c: '#FF5C8A', name: 'Power' },
  'dumme-kuh': { fx: 'disco', c: '#FF8AC2', name: 'Dumme Herzchen' },
  'dickes-huhn': { fx: 'glanz', c: '#7FD3F0', name: 'Planschwasser' },
  'bontje-lebkuchen': { fx: 'disco', c: '#FF7A5C', name: 'Zuckerglitzer' },
  'schmatz-zwillinge': { fx: 'geld', c: '#F7C34D', name: 'Krümelregen' },
  'nacht-gohan': { fx: 'feuer', c: '#FFD34E', name: 'Kampfaura' },
  'mogli-schielt': { fx: 'glanz', c: '#B8A6FF', name: 'Schwindel' },
  'dicker-gojo': { fx: 'blitz', c: '#5C8CFF', name: 'Blaue Aura' },
  // Rüstungs-Sets
  ritter: { fx: 'glanz', c: '#E9EEF2', name: 'Ritterglanz' },
  samurai: { fx: 'sakura', c: '#FFB7D0', name: 'Kirschblüten' },
  astronaut: { fx: 'sterne', c: '#B8A6FF', name: 'Sternenstaub' },
  weihnachtsmann: { fx: 'schnee', c: '#FFFFFF', name: 'Schneegestöber' },
  goldkuh: { fx: 'geld', c: '#F5C542', name: 'Goldregen' },
  pharao: { fx: 'glanz', c: '#FFD86B', name: 'Sonnenkönig' },
};
const fxc = (set) => (SET_FX[set] || {}).c || '#FFD34E';
// Hinter der Figur (viewBox 0 0 120 200, Überstand erlaubt)
export function fxBack(fx, set) {
  if (!fx) return '';
  const c = fxc(set);
  switch (fx) {
    case 'feuer': return `<g class="fxb fx-fire" style="--fc:${c}"><ellipse cx="60" cy="196" rx="62" ry="9" fill="${c}" opacity=".6"/>
      <path class="fl f1" d="M-14 198C-22 150 -2 128 -8 84c18 20 16 38 24 44C12 92 22 60 14 20c24 30 28 60 26 84 6-30 18-52 14-96 28 34 30 72 24 100 8-22 20-36 18-70 26 36 26 70 18 96 8-10 14-24 20-40 14 34 8 74-6 104z" fill="${c}"/>
      <path class="fl f2" d="M-2 198c-6-36 8-52 4-80 14 16 14 30 18 34 0-28 10-48 6-78 18 26 20 52 18 74 6-20 14-34 12-62 20 28 20 56 14 78 6-10 12-20 14-34 12 26 8 52-2 68z" fill="#FFB02E"/>
      <path class="fl f3" d="M20 198c-4-24 6-34 4-52 10 10 10 20 12 22 0-18 6-30 4-50 12 18 14 34 12 48 4-12 8-20 8-38 12 20 12 38 6 52 4-6 8-14 10-22 8 18 4 32-2 42z" fill="#FFE27A"/>
      <g class="sparks" fill="#FFE27A"><circle cx="0" cy="60" r="2.4"/><circle cx="118" cy="40" r="2.8"/><circle cx="60" cy="0" r="2"/><circle cx="106" cy="100" r="1.8"/></g></g>`;
    case 'stink': return `<g class="fxb fx-stink" style="--fc:${c}"><g class="cl" fill="${c}" opacity=".5"><circle cx="20" cy="150" r="22"/><circle cx="100" cy="140" r="20"/><circle cx="14" cy="110" r="16"/><circle cx="108" cy="104" r="15"/><circle cx="60" cy="186" r="26"/></g>
      <g class="cl c2" fill="${c}" opacity=".35"><circle cx="30" cy="70" r="14"/><circle cx="94" cy="66" r="12"/></g>
      <path class="wave" d="M18 92q6-10 0-20t0-20M102 90q6-10 0-20t0-20M60 26q6-10 0-20" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity=".8"/></g>`;
    case 'disco': return `<g class="fxb fx-disco"><g class="beams" opacity=".55"><path d="M60 -8L-20 200H20z" fill="#FF5C8A"/><path d="M60 -8L40 200H80z" fill="#F5D75B"/><path d="M60 -8L100 200H140z" fill="#5BC0EB"/><path d="M60 -8L10 200H-10z" fill="${c}"/></g>
      <ellipse cx="60" cy="196" rx="54" ry="8" fill="${c}" opacity=".5" class="floor"/></g>`;
    case 'blitz': return `<g class="fxb fx-bolt" style="--fc:${c}"><circle cx="60" cy="110" r="64" fill="${c}" opacity=".18" class="halo"/><ellipse cx="60" cy="196" rx="50" ry="7" fill="${c}" opacity=".45"/></g>`;
    case 'geld': return `<g class="fxb fx-money"><g class="pile"><ellipse cx="22" cy="196" rx="18" ry="6" fill="#C9A227" stroke="#2A2420" stroke-width="2"/><ellipse cx="22" cy="191" rx="14" ry="5" fill="#F2C94C" stroke="#2A2420" stroke-width="2"/><ellipse cx="98" cy="196" rx="16" ry="6" fill="#C9A227" stroke="#2A2420" stroke-width="2"/><rect x="88" y="186" width="18" height="9" rx="1.5" fill="${c}" stroke="#2A2420" stroke-width="1.5" transform="rotate(-8 97 190)"/></g></g>`;
    case 'sakura': return `<g class="fxb fx-sakura"><ellipse cx="60" cy="100" rx="56" ry="80" fill="${c}" opacity=".22"/><path d="M-6 40q30-10 50 6M126 60q-30-12-46 4" stroke="#5B3A2E" stroke-width="4" fill="none" stroke-linecap="round"/>${[[4, 38], [22, 42], [36, 44], [118, 58], [100, 56], [86, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}" stroke="#E07AA0" stroke-width="1.2"/>`).join('')}</g>`;
    case 'sterne': return `<g class="fxb fx-stars"><circle cx="60" cy="100" r="70" fill="#1B1640" opacity=".55"/><circle cx="60" cy="100" r="70" fill="${c}" opacity=".18"/>${[[14, 70], [100, 50], [28, 150], [106, 140], [60, 30], [84, 176], [20, 110]].map(([x, y], k) => `<circle class="st s${k % 3}" cx="${x}" cy="${y}" r="${1.4 + (k % 3) * .6}" fill="#FFFFFF"/>`).join('')}<path d="M92 22a10 10 0 1 0 8 14a8 8 0 1 1-8-14z" fill="#FFE98A"/></g>`;
    case 'schnee': return `<g class="fxb fx-snow"><ellipse cx="60" cy="100" rx="58" ry="84" fill="#BFE6FF" opacity=".22"/><path d="M-4 200q20-12 40-4t44-2t44 6v4H-4z" fill="#FFFFFF" stroke="#BFD3E0" stroke-width="2"/></g>`;
    case 'glanz': return `<g class="fxb fx-shine" style="--fc:${c}"><g class="rays" opacity=".38">${Array.from({ length: 12 }, (_, k) => `<path d="M60 100L${(60 + 86 * Math.cos(k * Math.PI / 6 - 0.11)).toFixed(1)} ${(100 + 96 * Math.sin(k * Math.PI / 6 - 0.11)).toFixed(1)}L${(60 + 86 * Math.cos(k * Math.PI / 6 + 0.11)).toFixed(1)} ${(100 + 96 * Math.sin(k * Math.PI / 6 + 0.11)).toFixed(1)}z" fill="${c}"/>`).join('')}</g><ellipse cx="60" cy="100" rx="52" ry="70" fill="${c}" opacity=".22"/></g>`;
    default: return '';
  }
}
// Vor der Figur (kleine Teile, die drumherum fliegen)
export function fxFront(fx, set) {
  if (!fx) return '';
  const c = fxc(set);
  switch (fx) {
    case 'feuer': return `<g class="fxf fx-fire"><g class="embers" fill="#FFE27A"><circle cx="30" cy="150" r="2"/><circle cx="92" cy="140" r="2.2"/><circle cx="50" cy="170" r="1.6"/><circle cx="76" cy="160" r="1.8"/></g></g>`;
    case 'stink': return `<g class="fxf fx-stink"><g class="flies" fill="#2A2420">${[[20, 60], [100, 74], [16, 128]].map(([x, y], k) => `<g class="fly fl${k}" transform="translate(${x} ${y})"><ellipse rx="3" ry="2.2"/><ellipse cx="-2" cy="-3" rx="2.4" ry="1.4" fill="#FFFFFF" opacity=".8"/><ellipse cx="2" cy="-3" rx="2.4" ry="1.4" fill="#FFFFFF" opacity=".8"/></g>`).join('')}</g></g>`;
    case 'disco': return `<g class="fxf fx-disco"><path d="M60 -26v10" stroke="#9AA3AA" stroke-width="2"/><g class="ball"><circle cx="60" cy="-6" r="12" fill="#D8DEE4" stroke="#2A2420" stroke-width="2"/><path d="M48 -6h24M60 -18v24M51 -14q9 8 18 0M51 2q9-8 18 0" stroke="#8A949C" stroke-width="1.2" fill="none"/><circle cx="55" cy="-10" r="2.5" fill="#FFFFFF"/></g>
      <g class="sparkle" fill="${c}"><path d="M18 40l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M102 70l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#F5D75B"/><path d="M14 140l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#5BC0EB"/></g></g>`;
    case 'blitz': return `<g class="fxf fx-bolt" fill="none" stroke="${c}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path class="b1" d="M10 60l12 14-8 4 14 18"/><path class="b2" d="M110 80l-12 12 8 4-14 20"/><path class="b3" d="M24 150l10 10-6 4 10 14"/><path class="b4" d="M96 150l-10 10 6 4-10 14"/></g>`;
    case 'geld': return `<g class="fxf fx-money">${[[18, 0], [46, 1], [78, 2], [102, 3], [32, 4], [90, 5]].map(([x, k]) => k % 2 ? `<g class="drop d${k}" transform="translate(${x} 0)"><rect x="-8" y="-5" width="16" height="10" rx="1.5" fill="${c}" stroke="#2A2420" stroke-width="1.5"/><circle r="2.5" fill="none" stroke="#2F6B22" stroke-width="1"/></g>` : `<g class="drop d${k}" transform="translate(${x} 0)"><circle r="6" fill="#F2C94C" stroke="#8A6A1E" stroke-width="2"/><path d="M-2 -2h4" stroke="#8A6A1E" stroke-width="1.5"/></g>`).join('')}</g>`;
    case 'sakura': return `<g class="fxf fx-sakura">${[[14, 0], [40, 1], [70, 2], [98, 3], [26, 4], [86, 5]].map(([x, k]) => `<g class="drop d${k}" transform="translate(${x} 0)"><path d="M0 -5q5 2 4 6q-2 4-4 4q-2 0-4-4q-1-4 4-6z" fill="${c}" stroke="#E07AA0" stroke-width="1"/></g>`).join('')}</g>`;
    case 'sterne': return `<g class="fxf fx-stars" fill="#FFE98A">${[[18, 40], [104, 90], [16, 176]].map(([x, y], k) => `<path class="tw t${k}" d="M${x} ${y - 6}l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z"/>`).join('')}</g>`;
    case 'schnee': return `<g class="fxf fx-snow">${[[10, 0], [34, 1], [58, 2], [84, 3], [108, 4], [22, 5], [96, 6]].map(([x, k]) => `<g class="drop d${k}" transform="translate(${x} 0)"><path d="M-4 0h8M0 -4v8M-3 -3l6 6M3 -3l-6 6" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/></g>`).join('')}</g>`;
    case 'glanz': return `<g class="fxf fx-shine" fill="#FFFFFF">${[[16, 50], [104, 40], [22, 150], [100, 160], [60, -8]].map(([x, y], k) => `<path class="tw t${k}" d="M${x} ${y - 7}l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="${k % 2 ? c : '#FFFFFF'}"/>`).join('')}</g>`;
    default: return '';
  }
}
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
  return { kopf: o.kopf || (active ? `kopf:${active}` : null), brust: o.brust || (active ? `brust:${active}` : null), beine: o.beine || (active ? `beine:${active}` : null), ding: o.ding || null, ...(o.fx ? { fx: o.fx } : {}) };
}
// Set komplett? → Avatar-ID des Sets
export function setOf(o) {
  const av = (k) => (String(o?.[k] || '').startsWith(`${k}:`) ? String(o[k]).slice(k.length + 1) : null);
  const a = av('kopf'); if (a && a === av('brust') && a === av('beine') && SET_FX[a]) return a;
  for (const s of Object.keys(BOX_SETS)) if (BOX_SETS[s].parts && BOX_SETS[s].parts.every((p, i) => o?.[['kopf', 'brust', 'beine'][i]] === p)) return s; // v1.0.1
  return null;
}
// v0.93 Sammel-Sets aus der Kiste (Kopf + Brust + Beine) → Fortschritt in der Garderobe, Hinweis beim Ziehen
export const BOX_SETS = { ritter: { name: 'Ritter', icon: '🛡️' }, samurai: { name: 'Samurai', icon: '⛩️' }, astronaut: { name: 'Astronaut', icon: '🚀' }, weihnachtsmann: { name: 'Weihnachtsmann', icon: '🎅' },
  // v1.0.1: Sets mit Teilen anderer Namen (Goldene Kuh = vorhandener Kopf + Goldrüstung + neue Hufe)
  goldkuh: { name: 'Goldene Kuh', icon: '👑', parts: ['kopf:goldkuh', 'brust:goldruestung', 'beine:goldhufe'] },
  pharao: { name: 'Pharao', icon: '🏺' } };
export const boxSetParts = (set) => BOX_SETS[set]?.parts || ['kopf', 'brust', 'beine'].map((k) => `${k}:${set}`);
export function boxSetOf(id) { return Object.keys(BOX_SETS).find((s) => boxSetParts(s).includes(String(id || ''))) || null; }
export function boxSetProgress(set, inventory) { const inv = inventory instanceof Set ? inventory : new Set(inventory || []); const parts = boxSetParts(set); return { have: parts.filter((p) => inv.has(p)), parts }; }
// Kurzname eines Teils für Listen
export function partName(id, avatarName) {
  if (BOX_ITEMS[id]) return BOX_ITEMS[id].name;
  const [slot, av] = String(id).split(':');
  const s = SLOTS.find((x) => x.id === slot);
  return `${s ? s.name : slot}: ${avatarName ? avatarName(av) : av}`;
}

// v1.7 Gags je Gegenstand: wer ein Tier bekommt, dessen Gegenstand „macht was“ (statt nur 🎉)
const GAGS = {
  egitarre: ['🎸', '🎵', '🎶'], trompete: ['🎺', '🎵', '🎶'], zauberstab: ['✨', '⭐', '✨'], fliegenklatsche: ['💥', '🪰', '💥'], kochloeffel: ['🍲', '😋', '🥄'],
  baguette: ['🥖', '🇫🇷', '🥐'], regenschirm: ['☔', '💧', '💧'], steinschleuder: ['🎯', '💫', '🎯'], fernrohr: ['🔭', '👀', '⭐'], dreizack: ['🌊', '🔱', '💧'],
  lasersaebel: ['⚡', '✨', '⚡'], bumerang: ['🪃', '💨', '🪃'], koenigszepter: ['👑', '✨', '💎'], drachenaxt: ['🔥', '🐉', '🔥'], sternenbogen: ['🌟', '✨', '🌠'],
  sense: ['🌾', '✨', '🌾'], gummihuhn: ['🐔', '🎵', '🐔'], melkeimer: ['🥛', '🐄', '🥛'], donnerhammer: ['⚡', '💥', '⚡'], heugabel: ['🌾', '🌾', '💨'],
  karotte: ['🥕', '🐰', '🥕'], auktionshammer: ['🔨', '💰', '🔨'], kuhglocke: ['🔔', '🎵', '🐄'], lasso: ['🤠', '💨', '🤠'], goldhammer: ['🔨', '🪙', '✨'],
  geldkoffer: ['💰', '💸', '💵'], gurkensaebel: ['🥒', '⚔️', '🥒'], kristallglocke: ['🔔', '💎', '✨'], holzschwert: ['🪵', '⚔️', '💨'], eisenschwert: ['⚔️', '✨', '⚔️'],
  lanze: ['🏇', '💨', '✨'], katana: ['🗡️', '🌸', '💨'],
  regenbogenklinge: ['🌈', '✨', '🌈'], kosmoshammer: ['🪐', '🌠', '💫'], einhornlanze: ['🦄', '🌈', '✨'], flammenschwert: ['🔥', '🔥', '✨'], kristallschwert: ['💎', '✨', '💎'],
};
export function itemGag(dingId) { const k = String(dingId || '').split(':')[1]; return GAGS[k] || null; }
// höchste Seltenheit, die jemand trägt (für den Rahmen am Tisch)
const RANK = { gewoehnlich: 1, selten: 2, episch: 3, legendaer: 4, mythisch: 5 };
export function topRarity(o) { let best = null; for (const id of Object.values(o || {})) { const r = BOX_ITEMS[id]?.rarity; if (r && (!best || RANK[r] > RANK[best])) best = r; } return best && RANK[best] >= 3 ? best : null; }
