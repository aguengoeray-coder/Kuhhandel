// Vierzehn eigenständige Shop-Avatare (11 + 3 Kult) im Comic-Stil der Tier Börse.
// Reine SVG-Illustrationen; keine fremden Figuren, Logos oder Bilddateien.

const INK = '#2A2420';
const eye = (x, y, r = 5) => `<g><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r + 1}" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="${x + 1}" cy="${y + 1}" r="${r * .48}" fill="${INK}"/><circle cx="${x + 2}" cy="${y - 1}" r="1.4" fill="#fff"/></g>`;
const shell = (body, extra = '') => `<svg class="shop-avatar-art" viewBox="0 0 120 120" role="img" aria-hidden="true" focusable="false"><defs><linearGradient id="gold-glow" x2="0" y2="1"><stop stop-color="#FFE98A"/><stop offset="1" stop-color="#D99519"/></linearGradient></defs><g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${body}</g>${extra}</svg>`;
const face = (color, ears = '') => `<path d="M31 48Q20 27 28 14Q43 17 47 36Q60 29 73 36Q80 17 94 14Q101 31 88 51Q94 79 76 96Q60 111 44 96Q25 80 31 48Z" fill="${color}" stroke="${INK}" stroke-width="3"/>${ears}<path d="M43 77Q60 87 77 77" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
const baseEyes = (y = 59) => eye(47, y, 5) + eye(73, y, 5);

const AVATARS = [
  { id:'noergler', name:'Der Nörgler', tier:'selten', price:30, animal:'Uhu', motion:'sigh', art: () => shell(`
    <path d="M25 49Q14 29 30 20Q42 21 45 42M95 49Q106 29 90 20Q78 21 75 42" fill="#A98B65"/>
    <ellipse cx="60" cy="66" rx="38" ry="43" fill="#B99B75"/>
    <ellipse cx="45" cy="57" rx="17" ry="19" fill="#F8E9C9"/><ellipse cx="75" cy="57" rx="17" ry="19" fill="#F8E9C9"/>
    ${eye(46,57,6)}<path d="M69 57q7-6 13 0" fill="none" stroke="#2A2420" stroke-width="3"/>
    <path d="M60 68l-8 9h16z" fill="#E8A13C"/><path d="M47 88q13-9 26 0" fill="none"/>
    <path d="M17 92h25l-4 8H21z" fill="#D5D0C5"/><path d="M25 88v-8h9v8" fill="#B9C7CC"/>
    <path d="M17 76q-9-8-3-16M103 76q9-8 3-16" fill="none" stroke="#B8B8B8" stroke-width="4"/>
  `, '<g class="sa-steam" fill="none" stroke="#D5E0E0" stroke-width="3" stroke-linecap="round"><path d="M16 58q-8-8 0-15q8-7 0-14M104 58q8-8 0-15q-8-7 0-14"/></g>') },
  { id:'opa-ratte', name:'Opa Ratte', tier:'selten', price:30, animal:'Ratte', motion:'rock', art: () => shell(`
    <path d="M29 52Q4 29 12 16Q32 9 43 43M91 52Q116 29 108 16Q88 9 77 43" fill="#E7A6B4"/>
    <ellipse cx="60" cy="67" rx="34" ry="40" fill="#9D98A8"/>
    <path d="M38 56q10-9 19 0M65 56q10-9 19 0" fill="none" stroke="#2A2420" stroke-width="4"/>
    <ellipse cx="60" cy="73" rx="7" ry="5" fill="#E77E91"/><path d="M48 87q12 8 24 0" fill="none"/>
    <path d="M36 43q24-17 48 0l-4 8H40z" fill="#F4F0E8"/><path d="M34 42h52" stroke="#554C48" stroke-width="4"/>
    <path d="M83 65l19 4v16l-19-4z" fill="#E7C84C"/><path d="M88 70l8 2M88 75l8 2" stroke="#554C48" stroke-width="1.5"/>
    <g class="sa-low"><path d="M24 105l5-29 6 1-1 28M29 104h9" fill="none" stroke="#805B3D" stroke-width="5"/></g>
  `, '<g class="sa-hearing" fill="none" stroke="#F3D36A" stroke-width="2"><path d="M99 52q9-6 13 2M101 57q6-3 9 2"/></g>') },
  { id:'business-huhn', name:'Gestresstes Business-Huhn', tier:'selten', price:30, animal:'Huhn', motion:'shake', art: () => shell(`
    <path d="M42 30q-9-19 3-22q7 0 9 14q8-17 17-10q7 7-3 20" fill="#E64B3B"/>
    <ellipse cx="60" cy="65" rx="34" ry="39" fill="#FFF1D5"/>
    <path d="M39 56l17 4M81 56l-17 4" stroke="#2A2420" stroke-width="4"/>
    ${eye(47,64,5)}${eye(73,64,5)}
    <path d="M53 75l7-5 7 5-7 8z" fill="#F0A52E"/><path d="M47 91q13-9 26 0" fill="none"/>
    <path d="M24 91l13-8 23 13 23-13 13 8-36 22z" fill="#4D688B"/>
    <path d="M57 97l7 7-5 7-5-7z" fill="#D9E4F0"/>
    <path d="M83 26q9-12 14 0q-8 2-8 10" fill="none" stroke="#73B9D9" stroke-width="3"/>
    <path d="M16 20l8 5M19 13l7 1M100 18l-5 7" stroke="#E6A13C" stroke-width="3"/>
  `, '<g class="sa-sweat" fill="#79C9E8"><path d="M99 39q-7 10 0 12q7-2 0-12z"/></g>') },
  { id:'spar-schwein', name:'Spar-Schwein', tier:'selten', price:30, animal:'Schwein', motion:'coin', art: () => shell(`
    <path d="M31 40L24 17 46 29M89 40l7-23-22 12" fill="#F4A7B8"/>
    <ellipse cx="60" cy="67" rx="38" ry="39" fill="#F6B7C5"/>
    <path d="M34 55h52" stroke="#2A2420" stroke-width="4"/>
    <rect x="35" y="48" width="20" height="13" rx="5" fill="#292B31"/><rect x="65" y="48" width="20" height="13" rx="5" fill="#292B31"/>
    <path d="M55 54h10" stroke="#292B31" stroke-width="4"/>
    <ellipse cx="60" cy="75" rx="17" ry="11" fill="#E887A0"/><ellipse cx="54" cy="75" rx="3" ry="4" fill="#963B54"/><ellipse cx="66" cy="75" rx="3" ry="4" fill="#963B54"/>
    <path d="M49 91q11 7 22 0" fill="none"/>
    <path d="M47 31h26" stroke="#2A2420" stroke-width="4"/>
    <path d="M60 23v-7" stroke="#D99B24" stroke-width="4"/>
  `, '<g class="sa-coins" fill="#F7C84B" stroke="#8C5A13" stroke-width="2"><circle cx="96" cy="23" r="8"/><path d="M93 23h6M96 20v6" stroke="#8C5A13"/></g>') },
  { id:'boersen-gauner', name:'Börsen-Gauner', tier:'episch', price:40, animal:'Fuchs', motion:'grin', art: () => shell(`
    <path d="M28 46L18 13 47 31M92 46l10-33-29 18" fill="#C8793C"/>
    <path d="M30 46q30-29 60 0v34q-30 37-60 0z" fill="#D98A49"/>
    <path d="M39 59q8-10 16 0M65 59q8-10 16 0" fill="none" stroke="#2A2420" stroke-width="3"/>
    <path d="M36 76q24 27 48 0q-24 8-48 0z" fill="#FFF8E8"/>
    <path d="M54 70l6-6 6 6-6 5z" fill="#F3E5D1"/>
    <path d="M46 89q14 6 28 0" fill="none"/>
    <path d="M68 72l7 1-4 5-7-1z" fill="url(#gold-glow)"/>
    <rect x="5" y="80" width="27" height="30" rx="4" fill="#70462D"/><path d="M10 88h17M10 95h17" stroke="#E9C15D" stroke-width="3"/>
    <path d="M15 74l-7-9M103 74l7-9" stroke="#5FA86B" stroke-width="3"/>
  `, '<g class="sa-notes" fill="#76B96E" stroke="#326A3C" stroke-width="1.5"><path d="M7 29l15-5 4 13-15 5zM91 15l16 3-2 13-16-3z"/></g>') },
  { id:'disco-kuh', name:'Disco-Kuh', tier:'episch', price:40, animal:'Kuh', motion:'dance', art: () => shell(`
    <path d="M30 45q-16-18-8-27q15-5 28 17M90 45q16-18 8-27q-15-5-28 17" fill="#FFFDF5"/>
    <path d="M30 47q30-26 60 0v37q-30 32-60 0z" fill="#FFFDF5"/>
    <path d="M35 49q-4-18 14-16q11 10-1 20zM76 66q17-8 14 11q-12 14-20 2z" fill="#302D2C"/>
    ${baseEyes(61)}
    <ellipse cx="60" cy="81" rx="21" ry="13" fill="#F1A9B8"/><circle cx="53" cy="80" r="3" fill="#A74760"/><circle cx="67" cy="80" r="3" fill="#A74760"/>
    <path d="M30 26q30-24 60 0q-9 17-30 17T30 26z" fill="#4A2C73"/>
    <circle cx="60" cy="20" r="17" fill="#5C3D84"/><path d="M45 15q15-12 30 0M45 23q15 12 30 0" fill="none" stroke="#DFA7FF" stroke-width="3"/>
    <path d="M18 38l-8-7M102 38l8-7" stroke="#F5D75B" stroke-width="3"/>
  `, '<g class="sa-lights"><path d="M18 13l5 9M101 12l-5 10M10 70l10-2M110 70l-10-2" stroke="#F4D34E" stroke-width="3" stroke-linecap="round"/></g>') },
  { id:'raketen-esel', name:'Raketen-Esel', tier:'episch', price:40, animal:'Esel', motion:'rocket', art: () => shell(`
    <path d="M36 43L24 5Q18 0 15 10L27 54M84 43L96 5Q102 0 105 10L93 54" fill="#9AA3AD"/>
    <path d="M31 48q29-26 58 0v36q-29 32-58 0z" fill="#AEB7C0"/>
    <path d="M35 18q25-22 50 0l-5 32H40z" fill="#80B8D8" fill-opacity=".35" stroke="#DCEBF4" stroke-width="5"/>
    ${baseEyes(61)}
    <ellipse cx="60" cy="81" rx="20" ry="12" fill="#E6E2DA"/><path d="M52 80h16" stroke="#514B4A" stroke-width="3"/>
    <path d="M31 37l-8-10M89 37l8-10" stroke="#E2E5E8" stroke-width="4"/>
    <path d="M38 94l-8 16 16-5M82 94l8 16-16-5" fill="#E65D32"/>
    <path d="M60 4v-5M12 56l-7-4M108 56l7-4" stroke="#F6D35C" stroke-width="3"/>
  `, '<g class="sa-flame"><path d="M44 106q-5 10 1 13q5-5 4-13M72 106q5 10-1 13q-5-5-4-13" fill="#F18A2D" stroke="#B74A27" stroke-width="2"/></g>') },
  { id:'piraten-papagei', name:'Piraten-Papagei', tier:'episch', price:40, animal:'Papagei', motion:'sway', art: () => shell(`
    <path d="M30 43Q15 18 36 10Q52 9 52 39M90 43Q105 18 84 10Q68 9 68 39" fill="#2E9B69"/>
    <path d="M30 43q30-25 60 0v41q-30 31-60 0z" fill="#35A978"/>
    <path d="M35 49q25-23 50 0" fill="none" stroke="#F4D44F" stroke-width="8"/>
    <circle cx="45" cy="61" r="9" fill="#FFF"/><circle cx="45" cy="61" r="4" fill="#2A2420"/>
    <path d="M67 54q19-12 21 5q-7 9-20 7" fill="#292B31" stroke="#2A2420" stroke-width="2"/>
    <path d="M55 70q25-2 18 20q-16 9-24-4z" fill="#E8A52F"/>
    <path d="M57 74l12 7-13 4" fill="#F7C34D"/>
    <path d="M32 29q28-19 56 0l-8 10H40z" fill="#69442B"/>
    <path d="M37 28q23-12 46 0" stroke="#E9C65A" stroke-width="4" fill="none"/>
    <path d="M20 96q40 20 80 0" fill="none" stroke="#7A5131" stroke-width="5"/>
  `, '<g class="sa-doubloon"><circle cx="96" cy="22" r="10" fill="#F5C84B" stroke="#8A5A12" stroke-width="2"/><path d="M93 17v10m-3-7h9" stroke="#8A5A12" stroke-width="2"/></g>') },
  { id:'daemonenritter', name:'Dämonenritter', tier:'legendaer', price:60, animal:'Fabelwesen', motion:'flame', art: () => shell(`
    <path d="M33 42Q7 20 23 3Q41 8 48 33M87 42Q113 20 97 3Q79 8 72 33" fill="#642D39"/>
    <path d="M30 47q30-25 60 0v41q-30 29-60 0z" fill="#4A3B49"/>
    <path d="M34 48l-8-13 17 5M86 48l8-13-17 5" fill="#A83B3B"/>
    <path d="M38 59l17 4M82 59l-17 4" stroke="#FF5A43" stroke-width="5"/>
    <path d="M48 77l12-8 12 8-12 14z" fill="#29232B"/>
    <path d="M42 91l18-8 18 8-18 18z" fill="#7B3438"/>
    <path d="M48 32l12-8 12 8-12 6z" fill="#D9B45A"/>
    <path d="M60 27v-9M48 31l-9-10M72 31l9-10" stroke="#D9B45A" stroke-width="4"/>
    <path d="M17 70l10-9M103 70l-10-9" stroke="#B84536" stroke-width="4"/>
  `, '<g class="sa-embers" fill="#FF9A3C"><circle cx="17" cy="38" r="3"/><circle cx="103" cy="45" r="4"/><circle cx="22" cy="88" r="2.5"/><circle cx="98" cy="91" r="2.5"/></g>') },
  { id:'cyborg-hahn', name:'Cyborg-Hahn', tier:'legendaer', price:60, animal:'Hahn', motion:'spark', art: () => shell(`
    <path d="M40 33q-10-25 3-28q10 3 9 20q12-24 22-14q6 9-8 25" fill="#D9443C"/>
    <path d="M30 47q30-23 60 0v42q-30 29-60 0z" fill="#D9E0E6"/>
    <path d="M31 52l25 8-19 18zM89 52l-25 8 19 18z" fill="#687A8C"/>
    <path d="M39 57h16v9H39zM65 57h16v9H65z" fill="#182D43" stroke="#34E8EF" stroke-width="2"/>
    <path d="M42 61h10M68 61h10" stroke="#E9FFFF" stroke-width="2"/>
    <path d="M56 72l4-5 4 5-4 6z" fill="#F1A82E"/>
    <path d="M47 90h26" stroke="#344B5F" stroke-width="4"/>
    <path d="M25 46l-7-8M95 46l7-8M24 80l-8 7M96 80l8 7" stroke="#42DCE8" stroke-width="3"/>
    <path d="M60 18v-9" stroke="#34E8EF" stroke-width="3"/>
  `, '<g class="sa-electric" stroke="#57F5F1" stroke-width="2.5" fill="none"><path d="M14 28l8 5-4 7M106 61l-8 5 5 6M14 91l7-5"/></g>') },
  { id:'kuh-kaiser', name:'Kuh-Kaiser', tier:'legendaer', price:60, animal:'Kuh', motion:'royal', art: () => shell(`
    <path d="M30 45q-15-20-8-29q16-3 27 23M90 45q15-20 8-29q-16-3-27 23" fill="#FFFDF5"/>
    <path d="M30 48q30-25 60 0v38q-30 32-60 0z" fill="#FFFDF5"/>
    <path d="M34 50q-5-14 11-15q12 7 2 19zM79 68q15-9 15 8q-10 13-20 3z" fill="#302D2C"/>
    ${baseEyes(61)}
    <ellipse cx="60" cy="81" rx="21" ry="13" fill="#F0A9B8"/><circle cx="53" cy="80" r="3" fill="#A74760"/><circle cx="67" cy="80" r="3" fill="#A74760"/>
    <path d="M25 36l10-22 12 13 13-22 13 22 12-13 10 22z" fill="url(#gold-glow)" stroke="#8B5B12" stroke-width="3"/>
    <circle cx="60" cy="12" r="5" fill="#E64D4D"/><circle cx="36" cy="27" r="4" fill="#4CA5D8"/><circle cx="84" cy="27" r="4" fill="#4CA5D8"/>
    <path d="M18 105h84" stroke="#C58B25" stroke-width="5"/>
  `, '<g class="sa-crown-glint" fill="#FFF5B5"><path d="M17 16l3-8 3 8-3 8zM101 48l3-8 3 8-3 8zM13 78l3-6 3 6-3 6z"/></g>') },
  // Kult: unsere eigenen Leute (eigene Comic-Tiere)
  { id:'bennet-verletzt', name:'Der verletzte Bennet', tier:'kult', price:50, animal:'Esel', motion:'limp', art: () => shell(`
    <path d="M38 44L26 8Q40 6 48 38M82 44l12-36q-14-2-22 30" fill="#A9A6B0"/><path d="M33 16l9 24M87 16l-9 24" stroke="#E7A6B4" stroke-width="5"/>
    <ellipse cx="60" cy="66" rx="33" ry="40" fill="#B7B4BE"/>
    <path d="M40 54q7-5 14 0M66 54q7-5 14 0" fill="none" stroke-width="3.5"/>
    <path d="M45 61l-3 7M77 61l3 7" stroke="#6FB6E8" stroke-width="3"/>
    <ellipse cx="60" cy="84" rx="20" ry="14" fill="#DCD8E0"/><ellipse cx="53" cy="83" rx="3" ry="4" fill="#5B5761"/><ellipse cx="67" cy="83" rx="3" ry="4" fill="#5B5761"/>
    <path d="M51 94q9-5 18 0" fill="none"/>
    <path d="M70 33l14 6-4 7-14-6z" fill="#F3E2C2"/><path d="M75 36l2 5M79 37l-3 4" stroke="#C9A06A" stroke-width="2"/>
    <g class="sa-low"><path d="M96 114l6-62" stroke="#8A6340" stroke-width="5"/><path d="M94 56h14" stroke="#8A6340" stroke-width="6"/>
    <path d="M12 116l8-22 12 0 6 22" fill="#B7B4BE"/><rect x="15" y="98" width="22" height="9" rx="3" fill="#FFFFFF"/><path d="M18 100l16 5M18 105l16-5" stroke="#E46A6A" stroke-width="2"/></g>
  `, '<g class="sa-ouch" fill="#FFD34E" stroke="#8A5A00" stroke-width="1.5"><path d="M30 86l3-6 3 6-3 6zM8 82l2-4 2 4-2 4z"/></g>') },
  { id:'nico-schreit', name:'Der schreiende Nico', tier:'kult', price:50, animal:'Schwein', motion:'shout', art: () => shell(`
    <path d="M31 42L22 17 46 30M89 42l9-25-24 13" fill="#F09AAE"/>
    <ellipse cx="60" cy="64" rx="38" ry="40" fill="#F5A3B6"/>
    <path d="M36 44l15 7M84 44l-15 7" stroke-width="4.5"/>
    ${eye(45,57,5)}${eye(75,57,5)}
    <ellipse cx="60" cy="70" rx="13" ry="8" fill="#E57E98"/><ellipse cx="55" cy="70" rx="2.5" ry="3.5" fill="#8E3550"/><ellipse cx="65" cy="70" rx="2.5" ry="3.5" fill="#8E3550"/>
    <path d="M42 82q18-6 36 0q-2 22-18 22q-16 0-18-22z" fill="#7A1F33"/><path d="M47 98q13 7 26 0" fill="#F27C94" stroke="none"/>
    <path d="M45 83h30" stroke="#FFFFFF" stroke-width="4"/>
  `, '<g class="sa-shout" fill="none" stroke="#FF5A5A" stroke-width="4" stroke-linecap="round"><path d="M100 70q8 10 0 22M108 64q12 16 0 34M20 70q-8 10 0 22M12 64q-12 16 0 34"/></g>') },
  { id:'alp-quasselt', name:'Der quasselnde Alp', tier:'kult', price:50, animal:'Pferd', motion:'chatter', art: () => shell(`
    <path d="M40 40L34 14 52 32M80 40l6-26-18 18" fill="#8E5A34"/>
    <path d="M44 18q16-10 32 0q-8 10-16 8q-8 2-16-8z" fill="#3B2A22"/>
    <path d="M36 50q24-26 48 0v30q-2 26-24 26q-22 0-24-26z" fill="#A86D42"/>
    ${eye(47,56,5)}${eye(73,56,5)}
    <path d="M42 46q5-3 10 0M68 46q5-3 10 0" fill="none" stroke-width="3"/>
    <ellipse cx="60" cy="86" rx="20" ry="16" fill="#C99470"/><circle cx="52" cy="80" r="2.5" fill="#5A3520"/><circle cx="68" cy="80" r="2.5" fill="#5A3520"/>
    <ellipse cx="60" cy="94" rx="11" ry="8" fill="#7A2A2A"/><path d="M52 98q8-5 16 0q-8 5-16 0z" fill="#E87A8C" stroke="none"/><path d="M50 89h20" stroke="#FFFFFF" stroke-width="3"/>
  `, '<g class="sa-chatter"><path d="M86 18h28v16h-18l-6 6v-6h-4z" fill="#FFFFFF" stroke="#2A2420" stroke-width="2"/><text x="100" y="30" font-size="9" font-weight="800" text-anchor="middle" fill="#2A2420" font-family="sans-serif">bla</text><path d="M4 30h26v14h-6v6l-6-6H4z" fill="#FFFFFF" stroke="#2A2420" stroke-width="2"/><text x="17" y="41" font-size="8" font-weight="800" text-anchor="middle" fill="#2A2420" font-family="sans-serif">bla</text></g>') },
];

export const SHOP_AVATARS = AVATARS.map(({ art, ...meta }) => ({ ...meta, render: art }));
export const SHOP_AVATAR_CSS = `
.shop-avatar-art{display:block;width:100%;height:100%;overflow:visible}
.shop-avatar{--ring:#9B8A72;position:relative;display:grid;place-items:center;isolation:isolate;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 25%,#fff8e8,#d8c7a5 72%,#8d7655);border:3px solid var(--ring);box-shadow:0 5px 0 #0002,inset 0 2px 7px #fff9;overflow:visible}
.shop-avatar::before{content:"";position:absolute;inset:-7px;border:2px solid #fff7;border-radius:50%;pointer-events:none}
.shop-avatar[data-tier="episch"]{--ring:#A66AD2;background:radial-gradient(circle at 35% 25%,#fff2ff,#c9a6e6 72%,#70439b)}
.shop-avatar[data-tier="legendaer"]{--ring:#E8B83F;background:radial-gradient(circle at 35% 25%,#fff9ce,#e8c45e 72%,#9d6b19);box-shadow:0 0 0 3px #f9e7a0,0 0 18px #f3cb56aa,inset 0 2px 7px #fff}
.shop-avatar[data-tier="legendaer"]::before{border-color:#fff2b8;box-shadow:0 0 12px #ffdc64}
.shop-avatar[data-tier="selten"]{--ring:#71A98A}
.shop-avatar[data-tier="kult"]{--ring:#E2557A;background:radial-gradient(circle at 35% 25%,#fff0f4,#f5a9bf 72%,#a3284f);box-shadow:0 0 0 3px #ffc2d3,0 0 16px #ff6f9a88,inset 0 2px 7px #fff}
.shop-avatar[data-motion="limp"] .shop-avatar-art{animation:shop-limp 2.6s ease-in-out infinite}
.shop-avatar[data-motion="shout"] .sa-shout{animation:shop-pulse .5s ease-in-out infinite}
.shop-avatar[data-motion="shout"] .shop-avatar-art{animation:shop-shake 1.2s ease-in-out infinite}
.shop-avatar[data-motion="chatter"] .sa-chatter{animation:shop-pulse 1.4s ease-in-out infinite}
@keyframes shop-limp{0%,100%{transform:rotate(0)}30%{transform:rotate(-4deg) translateY(2px)}60%{transform:rotate(1deg)}}
.shop-avatar .shop-avatar-art{width:100%;height:100%;animation:shop-breathe 3.8s ease-in-out infinite;transform-origin:50% 72%}
.shop-avatar .sa-steam,.shop-avatar .sa-sweat,.shop-avatar .sa-coins,.shop-avatar .sa-notes,.shop-avatar .sa-lights,.shop-avatar .sa-flame,.shop-avatar .sa-doubloon,.shop-avatar .sa-embers,.shop-avatar .sa-electric,.shop-avatar .sa-crown-glint{transform-box:fill-box;transform-origin:center;animation:shop-float 2.5s ease-in-out infinite}
.shop-avatar .sa-hearing{animation:shop-pulse 1.1s ease-in-out infinite}
.shop-avatar[data-motion="sigh"] .shop-avatar-art{animation:shop-sigh 4s ease-in-out infinite}
.shop-avatar[data-motion="rock"] .shop-avatar-art{animation:shop-rock 3.5s ease-in-out infinite}
.shop-avatar[data-motion="shake"] .shop-avatar-art{animation:shop-shake 2.8s ease-in-out infinite}
.shop-avatar[data-motion="coin"] .sa-coins{animation:shop-drop 2.6s ease-in-out infinite}
.shop-avatar[data-motion="grin"] .shop-avatar-art{animation:shop-grin 3.6s ease-in-out infinite}
.shop-avatar[data-motion="dance"] .shop-avatar-art{animation:shop-dance 2.4s ease-in-out infinite}
.shop-avatar[data-motion="rocket"] .shop-avatar-art{animation:shop-rocket 2.2s ease-in-out infinite}
.shop-avatar[data-motion="sway"] .shop-avatar-art{animation:shop-rock 2.8s ease-in-out infinite}
.shop-avatar[data-motion="flame"] .sa-embers{animation:shop-fire .9s ease-in-out infinite alternate}
.shop-avatar[data-motion="spark"] .sa-electric{animation:shop-spark .8s steps(2,end) infinite}
.shop-avatar[data-motion="royal"] .sa-crown-glint{animation:shop-twinkle 1.7s ease-in-out infinite}
@keyframes shop-breathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-2px) scale(1.015)}}
@keyframes shop-float{0%,100%{opacity:.65;transform:translateY(0) rotate(-3deg)}50%{opacity:1;transform:translateY(-4px) rotate(3deg)}}
@keyframes shop-pulse{50%{opacity:.25}}
@keyframes shop-sigh{0%,80%,100%{transform:translateY(0)}88%{transform:translateY(2px) scaleY(.97)}}
@keyframes shop-rock{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes shop-shake{0%,90%,100%{transform:rotate(0)}92%{transform:rotate(-2deg)}96%{transform:rotate(2deg)}}
@keyframes shop-drop{0%,100%{transform:translateY(-2px)}55%{transform:translateY(6px)}}
@keyframes shop-grin{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
@keyframes shop-dance{0%,100%{transform:rotate(-3deg) translateY(0)}50%{transform:rotate(3deg) translateY(-3px)}}
@keyframes shop-rocket{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes shop-fire{from{opacity:.45;transform:scale(.8)}to{opacity:1;transform:scale(1.15)}}
@keyframes shop-spark{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes shop-twinkle{0%,100%{opacity:.35}50%{opacity:1}}
@media(prefers-reduced-motion:reduce){.shop-avatar *{animation:none!important}}
`;

export function shopAvatar(id, className = '') {
  const item = AVATARS.find((a) => a.id === id);
  if (!item) return '';
  return `<span class="shop-avatar ${className}" data-avatar="${item.id}" data-tier="${item.tier}" data-motion="${item.motion}" aria-label="${item.name}">${item.art()}</span>`;
}

export function shopAvatarCard(id) {
  const item = AVATARS.find((a) => a.id === id);
  if (!item) return '';
  return `<article class="shop-avatar-card"><div class="shop-avatar-stage" data-tier="${item.tier}">${shopAvatar(id)}</div><div class="shop-avatar-meta"><strong>${item.name}</strong><span>${item.tier === 'legendaer' ? 'Legendär' : item.tier[0].toUpperCase() + item.tier.slice(1)} · ${item.price} Dublonen</span><small>${item.animal}</small></div></article>`;
}

export function shopAvatarGallery() {
  return `<div class="shop-avatar-gallery">${AVATARS.map((a) => shopAvatarCard(a.id)).join('')}</div>`;
}

// ---------- Ganzkörper (v0.52): Kopf wie oben + Körper mit Kleidung und Requisite ----------
// Nur für große Ansichten (Shop, Startseite). Am Tisch bleibt der runde Kopf.
const limb = (d, color, w = 11) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 5}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
const ARM = {
  down: ['M36 96Q26 116 25 136', 'M84 96Q94 116 95 136', [25, 138], [95, 138]],
  hip: ['M36 96Q20 112 32 128', 'M84 96Q100 112 88 128', [33, 129], [87, 129]],
  up: ['M36 96Q20 84 18 62', 'M84 96Q100 84 102 62', [18, 60], [102, 60]],
  hold: ['M36 96Q24 112 30 126', 'M84 96Q96 112 90 126', [30, 128], [90, 128]],
};
function figureBody(b) {
  const [aL, , hL] = [ARM[b.armL || 'down'][0], 0, ARM[b.armL || 'down'][2]];
  const aR = ARM[b.armR || 'down'][1], hR = ARM[b.armR || 'down'][3];
  const sleeve = b.sleeve || b.top;
  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${b.hand || b.fur}" stroke="${INK}" stroke-width="2.5"/>`;
  return `${b.back || ''}
    ${limb(b.legL || 'M48 150V188', b.pants, 13)}${limb(b.legR || 'M72 150V188', b.pants, 13)}
    <path d="M33 194q1-9 15-9t14 9z" fill="${b.shoes}" stroke="${INK}" stroke-width="2.5"/><path d="M58 194q0-9 14-9t15 9z" fill="${b.shoes}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M36 90Q60 80 84 90L90 152Q60 162 30 152Z" fill="${b.top}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    ${b.chest || ''}
    ${limb(aL, sleeve)}${limb(aR, sleeve)}${hand(...hL)}${hand(...hR)}
    ${b.front || ''}`;
}
const BODIES = {
  noergler: { fur: '#B99B75', top: '#7B6A57', pants: '#5A5047', shoes: '#3B332E', armL: 'hold', armR: 'hip',
    chest: '<path d="M60 88v62" stroke="#2A2420" stroke-width="2"/><circle cx="64" cy="104" r="2.5" fill="#E8D8B5"/><circle cx="64" cy="118" r="2.5" fill="#E8D8B5"/><circle cx="64" cy="132" r="2.5" fill="#E8D8B5"/><path d="M44 96l16 14 16-14" fill="none" stroke="#5A4A3A" stroke-width="2"/>' },
  'opa-ratte': { fur: '#9D98A8', hand: '#E7A6B4', top: '#6E8B5E', sleeve: '#D9D3C4', pants: '#8A7A66', shoes: '#5B4A3C', armL: 'hold',
    chest: '<path d="M44 98h32M42 112h36M41 126h38M40 140h40" stroke="#5B744D" stroke-width="2.5" stroke-dasharray="3 3"/>',
    front: '<path d="M30 130v62" stroke="#805B3D" stroke-width="5"/>' },
  'business-huhn': { fur: '#FFF1D5', top: '#4D688B', pants: '#3E5573', shoes: '#22252B', armR: 'hold',
    chest: '<path d="M50 88l10 30 10-30z" fill="#E9EEF4"/><path d="M57 92l3 30 3-30z" fill="#C8443A"/>',
    front: '<rect x="80" y="128" width="26" height="20" rx="3" fill="#6B4A2E" stroke="#2A2420" stroke-width="2.5"/><path d="M88 128v-4h10v4" fill="none" stroke="#2A2420" stroke-width="2.5"/>' },
  'spar-schwein': { fur: '#F6B7C5', top: '#E7C84C', pants: '#4E6FA3', shoes: '#C1443A', armL: 'hold', armR: 'hold',
    chest: '<path d="M44 112h32" stroke="#B9982F" stroke-width="3"/>',
    front: '<ellipse cx="60" cy="130" rx="22" ry="15" fill="#F6B7C5" stroke="#2A2420" stroke-width="2.5"/><path d="M52 118h16" stroke="#2A2420" stroke-width="3"/><circle cx="74" cy="128" r="2" fill="#2A2420"/>' },
  'boersen-gauner': { fur: '#D98A49', top: '#3A3550', pants: '#2E2A40', shoes: '#151319', armL: 'hold', armR: 'up',
    chest: '<path d="M44 96v52M52 92v60M68 92v60M76 96v52" stroke="#55507A" stroke-width="1.5"/><path d="M50 90l10 26 10-26" fill="#FFF8E8"/><path d="M46 104q14 14 28 0" fill="none" stroke="#E9C15D" stroke-width="3"/>',
    front: '<rect x="94" y="44" width="22" height="13" rx="2" fill="#7FBF6E" stroke="#2A2420" stroke-width="2" transform="rotate(-12 105 50)"/><text x="105" y="54" font-size="9" font-weight="800" text-anchor="middle" fill="#2A5A30" font-family="sans-serif" transform="rotate(-12 105 50)">$</text>' },
  'disco-kuh': { fur: '#FFFDF5', top: '#8E4FC2', pants: '#8E4FC2', shoes: '#F5D75B', armL: 'up', armR: 'hip',
    legL: 'M48 150Q44 172 40 188', legR: 'M72 150Q76 172 80 188',
    chest: '<g fill="#F5D75B"><circle cx="48" cy="104" r="2.5"/><circle cx="66" cy="112" r="2.5"/><circle cx="54" cy="128" r="2.5"/><circle cx="74" cy="136" r="2.5"/><circle cx="44" cy="142" r="2.5"/></g><path d="M44 92l16 22 16-22" fill="none" stroke="#F5D75B" stroke-width="3"/>' },
  'raketen-esel': { fur: '#AEB7C0', hand: '#DCE3EA', top: '#E9EEF2', pants: '#E9EEF2', shoes: '#5B6670', armL: 'hip', armR: 'up',
    back: '<rect x="28" y="96" width="64" height="44" rx="10" fill="#E2643A" stroke="#2A2420" stroke-width="3"/><path d="M34 140q-4 14 4 20q6-8 2-20M86 140q4 14-4 20q-6-8-2-20" fill="#F6B13A" stroke="#B74A27" stroke-width="2"/>',
    chest: '<rect x="48" y="104" width="24" height="16" rx="3" fill="#5B6670" stroke="#2A2420" stroke-width="2"/><circle cx="54" cy="112" r="2.5" fill="#E2643A"/><circle cx="62" cy="112" r="2.5" fill="#F5D75B"/><circle cx="70" cy="112" r="2.5" fill="#57F5F1"/><path d="M32 150h56" stroke="#E2643A" stroke-width="4"/>' },
  'piraten-papagei': { fur: '#35A978', hand: '#E8A52F', top: '#A2352E', pants: '#3B2A22', shoes: '#22201E', armL: 'hold', armR: 'up',
    chest: '<path d="M60 90v60" stroke="#2A2420" stroke-width="2"/><g fill="#F4D44F" stroke="#8A5A12" stroke-width="1.5"><circle cx="53" cy="104" r="2.5"/><circle cx="67" cy="104" r="2.5"/><circle cx="53" cy="120" r="2.5"/><circle cx="67" cy="120" r="2.5"/></g><rect x="31" y="132" width="58" height="8" fill="#3B2A22"/><rect x="54" y="130" width="12" height="12" rx="2" fill="#F4D44F" stroke="#8A5A12" stroke-width="2"/>',
    front: '<path d="M102 60L112 22" stroke="#C9D3DB" stroke-width="5"/><path d="M96 60h12" stroke="#8A5A12" stroke-width="5"/>' },
  daemonenritter: { fur: '#4A3B49', hand: '#5A4E5C', top: '#5A4E5C', pants: '#4A4150', shoes: '#2A232B', armL: 'down', armR: 'hold',
    back: '<path d="M34 92Q16 150 22 192H98Q104 150 86 92Z" fill="#7B3438" stroke="#2A2420" stroke-width="3"/>',
    chest: '<path d="M38 100h44M36 120h48M34 140h52" stroke="#3A3040" stroke-width="2.5"/><path d="M52 104l8 18 8-18z" fill="#FF5A43"/>',
    front: '<path d="M90 132V76" stroke="#C9D3DB" stroke-width="6"/><path d="M80 134h20" stroke="#D9B45A" stroke-width="5"/><path d="M90 76l-4 6h8z" fill="#C9D3DB"/>' },
  'cyborg-hahn': { fur: '#D9E0E6', hand: '#8796A6', top: '#8796A6', pants: '#687A8C', shoes: '#344B5F', armL: 'up', armR: 'hip',
    chest: '<rect x="46" y="100" width="28" height="22" rx="4" fill="#182D43" stroke="#34E8EF" stroke-width="2"/><path d="M50 112h6l3-6 4 12 3-6h4" fill="none" stroke="#57F5F1" stroke-width="2"/><path d="M40 136h40" stroke="#34E8EF" stroke-width="2.5" stroke-dasharray="5 4"/>' },
  'kuh-kaiser': { fur: '#FFFDF5', top: '#B3242E', pants: '#7A1820', shoes: '#C58B25', armL: 'hold', armR: 'down',
    back: '<path d="M34 92Q14 150 18 194H102Q106 150 86 92Z" fill="#8E1C26" stroke="#2A2420" stroke-width="3"/>',
    chest: '<path d="M36 90Q60 106 84 90L84 100Q60 116 36 100Z" fill="#FFFDF5" stroke="#2A2420" stroke-width="2"/><g fill="#2A2420"><circle cx="46" cy="99" r="1.6"/><circle cx="60" cy="104" r="1.6"/><circle cx="74" cy="99" r="1.6"/></g><path d="M60 110v40" stroke="#E8B83F" stroke-width="3"/>',
    front: '<path d="M30 128V70" stroke="#C58B25" stroke-width="5"/><circle cx="30" cy="66" r="7" fill="url(#gold-glow)" stroke="#8B5B12" stroke-width="2"/><circle cx="30" cy="66" r="2.5" fill="#E64D4D"/>' },
  'bennet-verletzt': { fur: '#B7B4BE', top: '#5E86B8', pants: '#3E4E6A', shoes: '#2A2A30', armL: 'hold', armR: 'hold',
    legL: 'M48 150Q50 168 44 184',
    chest: '<path d="M38 96Q60 130 84 96" fill="none" stroke="#FFFFFF" stroke-width="7"/><path d="M38 96Q60 130 84 96" fill="none" stroke="#E46A6A" stroke-width="2" stroke-dasharray="4 4"/>',
    front: '<rect x="62" y="160" width="20" height="30" rx="6" fill="#FFFFFF" stroke="#2A2420" stroke-width="2.5"/><path d="M66 168l12 4M66 176l12 4" stroke="#E46A6A" stroke-width="2"/><path d="M96 196L100 108" stroke="#8A6340" stroke-width="5"/><path d="M90 112h18" stroke="#8A6340" stroke-width="6"/>' },
  'nico-schreit': { fur: '#F5A3B6', top: '#3A6FB0', pants: '#2E3B52', shoes: '#F2F2F2', armL: 'up', armR: 'up',
    chest: '<path d="M46 92q14 14 28 0" fill="none" stroke="#2A4F80" stroke-width="3"/><rect x="44" y="124" width="32" height="14" rx="5" fill="#2F5C95" stroke="#2A2420" stroke-width="2"/><path d="M54 96v12M66 96v12" stroke="#F2F2F2" stroke-width="2"/>' },
  'alp-quasselt': { fur: '#A86D42', top: '#F2F2F2', pants: '#2F3A4A', shoes: '#6B4A2E', armL: 'up', armR: 'hip',
    chest: '<path d="M50 90l10 14 10-14" fill="none" stroke="#2A2420" stroke-width="2"/><path d="M60 104v46" stroke="#D0D4DA" stroke-width="2"/><circle cx="60" cy="116" r="1.8" fill="#9AA3AD"/><circle cx="60" cy="130" r="1.8" fill="#9AA3AD"/>',
    front: '<rect x="8" y="42" width="14" height="22" rx="3" fill="#2A2420"/><rect x="10" y="45" width="10" height="15" rx="1" fill="#7FD3F0"/>' },
};

// Bewegungen der Ganzkörper-Figur: dieselben wie beim Kopf, nur am ganzen Körper (Drehpunkt an den Füßen)
export const SHOP_AVATAR_FULL_CSS = SHOP_AVATAR_CSS.split('\n')
  .filter((l) => /^\.shop-avatar(\[data-motion="[a-z]+"\])? \.(shop-avatar-art|sa-)/.test(l))
  .map((l) => l.replace(/^\.shop-avatar/, '.shop-avatar-full').replace(/,\.shop-avatar \./g, ',.shop-avatar-full .'))
  .join('\n') + `
.shop-avatar-full{display:block;position:relative;aspect-ratio:120/200;isolation:isolate}
.shop-avatar-full .shop-avatar-art{display:block;width:100%;height:100%;overflow:visible;transform-origin:50% 96%}
.shop-avatar-full .sa-low{display:none}
@media(prefers-reduced-motion:reduce){.shop-avatar-full *{animation:none!important}}`;

export function shopAvatarFull(id, className = '') {
  const item = AVATARS.find((a) => a.id === id);
  if (!item) return '';
  const head = item.art().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const b = BODIES[item.id];
  const svg = `<svg class="shop-avatar-art" viewBox="0 0 120 200" role="img" aria-hidden="true" focusable="false"><g class="sa-body" stroke-linejoin="round" stroke-linecap="round">${b ? figureBody(b) : ''}</g><g class="sa-head" transform="translate(12 0) scale(.8)">${head}</g></svg>`;
  return `<span class="shop-avatar-full ${className}" data-avatar="${item.id}" data-tier="${item.tier}" data-motion="${item.motion}" aria-label="${item.name}">${svg}</span>`;
}
