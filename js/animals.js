// Eigene, einfache Tierbilder (SVG) – flach, mit dunkler Kontur
const S = 'stroke="#2A2420" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
const eye = (x, y, r = 3.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2A2420"/><circle cx="${x + 1.2}" cy="${y - 1.2}" r="1.1" fill="#fff"/>`;

const ART = {
  hahn: `
    <path d="M36 33c-3-11 7-17 11-9 2-10 13-10 12 0 6-6 14 0 9 9" fill="#E23B2E" ${S}/>
    <circle cx="50" cy="56" r="25" fill="#FFFDF5" ${S}/>
    <path d="M72 52l17 6-17 7z" fill="#F5B731" ${S}/>
    <path d="M69 67c5 8 1 17-6 15-5-2-4-10 0-15" fill="#E23B2E" ${S}/>
    ${eye(59, 49)}`,
  gans: `
    <path d="M28 98c0-30 6-50 15-62 7-10 27-9 30 5 2 9-5 14-13 14-6 0-8 6-8 14v29z" fill="#FFFDF5" ${S}/>
    <path d="M72 38l18 4-17 7z" fill="#F28C28" ${S}/>
    ${eye(60, 36)}`,
  katze: `
    <path d="M22 44L26 12L46 30Z" fill="#F2A65A" ${S}/>
    <path d="M78 44L74 12L54 30Z" fill="#F2A65A" ${S}/>
    <path d="M29 30l1-10 8 8z" fill="#F7B9C4"/>
    <path d="M71 30l-1-10-8 8z" fill="#F7B9C4"/>
    <circle cx="50" cy="56" r="30" fill="#F2A65A" ${S}/>
    <path d="M38 34c4 5 8 5 12 0M50 34c4 5 8 5 12 0" fill="none" stroke="#D9863C" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="39" cy="54" rx="4" ry="5.5" fill="#2A2420"/><ellipse cx="61" cy="54" rx="4" ry="5.5" fill="#2A2420"/>
    <path d="M46 64h8l-4 5z" fill="#E7718A" ${S}/>
    <path d="M50 69c0 5-6 6-8 3M50 69c0 5 6 6 8 3" fill="none" ${S}/>
    <path d="M20 62l14 2M20 70l14-1M80 62l-14 2M80 70l-14-1" ${S}/>`,
  hund: `
    <ellipse cx="22" cy="54" rx="10" ry="21" transform="rotate(14 22 54)" fill="#7A4E2D" ${S}/>
    <ellipse cx="78" cy="54" rx="10" ry="21" transform="rotate(-14 78 54)" fill="#7A4E2D" ${S}/>
    <ellipse cx="50" cy="52" rx="27" ry="29" fill="#C98A4E" ${S}/>
    <ellipse cx="50" cy="69" rx="15" ry="12" fill="#F2DCC0" ${S}/>
    <ellipse cx="50" cy="62" rx="6.5" ry="4.5" fill="#2A2420"/>
    <path d="M50 67v5M44 74c3 3 9 3 12 0" fill="none" ${S}/>
    ${eye(39, 47)}${eye(61, 47)}`,
  schaf: `
    <g fill="#FFFFFF" ${S}>
      <circle cx="30" cy="34" r="13"/><circle cx="50" cy="26" r="14"/><circle cx="70" cy="34" r="13"/>
      <circle cx="24" cy="54" r="12"/><circle cx="76" cy="54" r="12"/><circle cx="32" cy="72" r="12"/><circle cx="68" cy="72" r="12"/><circle cx="50" cy="78" r="12"/>
    </g>
    <ellipse cx="22" cy="50" rx="10" ry="5" transform="rotate(20 22 50)" fill="#3A3330" ${S}/>
    <ellipse cx="78" cy="50" rx="10" ry="5" transform="rotate(-20 78 50)" fill="#3A3330" ${S}/>
    <ellipse cx="50" cy="56" rx="16" ry="21" fill="#3A3330" ${S}/>
    <circle cx="43" cy="52" r="3.4" fill="#fff"/><circle cx="57" cy="52" r="3.4" fill="#fff"/>
    <circle cx="43.6" cy="52.6" r="1.6" fill="#2A2420"/><circle cx="57.6" cy="52.6" r="1.6" fill="#2A2420"/>
    <path d="M45 67c3 2 7 2 10 0" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`,
  ziege: `
    <path d="M38 26C30 12 18 12 14 20" fill="none" stroke="#2A2420" stroke-width="9" stroke-linecap="round"/>
    <path d="M38 26C30 12 18 12 14 20" fill="none" stroke="#9C8A70" stroke-width="5" stroke-linecap="round"/>
    <path d="M62 26C70 12 82 12 86 20" fill="none" stroke="#2A2420" stroke-width="9" stroke-linecap="round"/>
    <path d="M62 26C70 12 82 12 86 20" fill="none" stroke="#9C8A70" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="22" cy="42" rx="12" ry="5" transform="rotate(18 22 42)" fill="#E4D6BC" ${S}/>
    <ellipse cx="78" cy="42" rx="12" ry="5" transform="rotate(-18 78 42)" fill="#E4D6BC" ${S}/>
    <path d="M44 80l6 16 6-16z" fill="#BFAE8F" ${S}/>
    <ellipse cx="50" cy="54" rx="19" ry="29" fill="#E4D6BC" ${S}/>
    <ellipse cx="50" cy="74" rx="12" ry="8" fill="#D2C2A3" ${S}/>
    <circle cx="46" cy="73" r="1.8" fill="#2A2420"/><circle cx="54" cy="73" r="1.8" fill="#2A2420"/>
    ${eye(42, 46)}${eye(58, 46)}`,
  esel: `
    <ellipse cx="37" cy="22" rx="7" ry="20" transform="rotate(-12 37 22)" fill="#9AA3A8" ${S}/>
    <ellipse cx="63" cy="22" rx="7" ry="20" transform="rotate(12 63 22)" fill="#9AA3A8" ${S}/>
    <ellipse cx="37" cy="23" rx="3" ry="13" transform="rotate(-12 37 23)" fill="#E3C9D1"/>
    <ellipse cx="63" cy="23" rx="3" ry="13" transform="rotate(12 63 23)" fill="#E3C9D1"/>
    <ellipse cx="50" cy="56" rx="21" ry="30" fill="#A7B0B5" ${S}/>
    <path d="M44 28c2-6 10-6 12 0" fill="#4A4F55" ${S}/>
    <ellipse cx="50" cy="76" rx="16" ry="12" fill="#E8E2DA" ${S}/>
    <ellipse cx="44" cy="75" rx="2" ry="3" fill="#2A2420"/><ellipse cx="56" cy="75" rx="2" ry="3" fill="#2A2420"/>
    ${eye(41, 50)}${eye(59, 50)}`,
  schwein: `
    <path d="M24 36L22 14L42 26Z" fill="#F6A8B6" ${S}/>
    <path d="M76 36L78 14L58 26Z" fill="#F6A8B6" ${S}/>
    <circle cx="50" cy="56" r="30" fill="#F6A8B6" ${S}/>
    <ellipse cx="50" cy="64" rx="14" ry="10" fill="#EE8DA0" ${S}/>
    <ellipse cx="45" cy="64" rx="2.6" ry="4" fill="#B5455E"/><ellipse cx="55" cy="64" rx="2.6" ry="4" fill="#B5455E"/>
    <circle cx="30" cy="62" r="5" fill="#F48FA4" opacity=".6"/><circle cx="70" cy="62" r="5" fill="#F48FA4" opacity=".6"/>
    ${eye(39, 47)}${eye(61, 47)}`,
  kuh: `
    <path d="M30 24c-6-6-6-14 0-16M70 24c6-6 6-14 0-16" fill="none" stroke="#2A2420" stroke-width="8" stroke-linecap="round"/>
    <path d="M30 24c-6-6-6-14 0-16M70 24c6-6 6-14 0-16" fill="none" stroke="#F3E6C8" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="18" cy="40" rx="12" ry="6" transform="rotate(15 18 40)" fill="#FFFFFF" ${S}/>
    <ellipse cx="82" cy="40" rx="12" ry="6" transform="rotate(-15 82 40)" fill="#FFFFFF" ${S}/>
    <ellipse cx="50" cy="50" rx="25" ry="29" fill="#FFFFFF" ${S}/>
    <path d="M27 40c6-12 18-14 22-6 3 7-5 15-14 15-6 0-9-3-8-9z" fill="#2A2420"/>
    <path d="M64 24c8 0 12 6 10 12-5 2-10-2-10-12z" fill="#2A2420"/>
    <ellipse cx="50" cy="72" rx="20" ry="13" fill="#F4B8C2" ${S}/>
    <ellipse cx="43" cy="72" rx="2.6" ry="3.6" fill="#B5455E"/><ellipse cx="57" cy="72" rx="2.6" ry="3.6" fill="#B5455E"/>
    <circle cx="39" cy="46" r="3.6" fill="#fff"/><circle cx="39" cy="46" r="2.4" fill="#2A2420"/>
    ${eye(61, 46)}`,
  pferd: `
    <path d="M36 26L34 6L48 20Z" fill="#9A6A45" ${S}/>
    <path d="M64 26L66 6L52 20Z" fill="#9A6A45" ${S}/>
    <ellipse cx="50" cy="54" rx="20" ry="33" fill="#9A6A45" ${S}/>
    <path d="M38 24c6-6 18-6 24 0-3 1-5 4-6 9-2-3-4-4-6-4-1 4-4 7-8 8 1-5 0-9-4-13z" fill="#4A2F1F" ${S}/>
    <ellipse cx="50" cy="56" rx="3.5" ry="10" fill="#FFF7EA"/>
    <ellipse cx="50" cy="78" rx="15" ry="11" fill="#C99A72" ${S}/>
    <ellipse cx="44" cy="78" rx="2.2" ry="3.4" fill="#2A2420"/><ellipse cx="56" cy="78" rx="2.2" ry="3.4" fill="#2A2420"/>
    ${eye(40, 46)}${eye(60, 46)}`,
  ratte: `
    <path d="M78 74c10 2 16 8 12 16" fill="none" stroke="#C98B95" stroke-width="4" stroke-linecap="round"/>
    <circle cx="28" cy="30" r="13" fill="#8D8790" ${S}/><circle cx="28" cy="30" r="6.5" fill="#E9A6B2"/>
    <circle cx="72" cy="30" r="13" fill="#8D8790" ${S}/><circle cx="72" cy="30" r="6.5" fill="#E9A6B2"/>
    <path d="M50 30c18 0 28 14 26 30-2 14-14 24-26 30-12-6-24-16-26-30-2-16 8-30 26-30z" fill="#9B95A0" ${S}/>
    <path d="M50 80l-5 5h10z" fill="#2A2420"/>
    <path d="M44 86c-8 0-16-1-24-4M44 84c-8-3-14-6-20-11M56 86c8 0 16-1 24-4M56 84c8-3 14-6 20-11" fill="none" stroke="#2A2420" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M45 89h10v4h-10z" fill="#FFFDF5" ${S}/>
    ${eye(40, 54)}${eye(60, 54)}`,
};

// Stern für Spezialkarten
export const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill="#FFD34E" stroke="#8A5A00" stroke-width="1.4" stroke-linejoin="round"/></svg>';

export function art(id) {
  return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${ART[id] || ''}</svg>`;
}
