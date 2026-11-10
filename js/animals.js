// Eigene, lustige Tierköpfe (SVG) – Comic-Stil mit dicker Kontur, großen Augen und je einem Gag
const K = '#2A2420';
const S = `stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
// große Comic-Augen mit Glanzpunkt
const eye = (x, y, r = 6, look = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${S}/><circle cx="${x + look}" cy="${y + 0.5}" r="${r * 0.55}" fill="${K}"/><circle cx="${x + look + r * 0.22}" cy="${y - r * 0.2}" r="${r * 0.2}" fill="#fff"/>`;

const ART = {
  hahn: `
    <path d="M30 34c-4-10 2-16 8-12-1-9 8-13 12-6 3-8 13-7 13 2 6-4 13 1 9 9" fill="#E23B2E" ${S}/>
    <circle cx="48" cy="56" r="27" fill="#FFFDF5" ${S}/>
    <path d="M30 42l9 3M62 42l-9 3" stroke="${K}" stroke-width="3" stroke-linecap="round"/>
    ${eye(38, 51, 6, 1)}${eye(58, 51, 6, -1)}
    <path d="M60 60l30-6-24 12z" fill="#F5B731" ${S}/>
    <path d="M62 70l26 6-26 2z" fill="#F5B731" ${S}/>
    <path d="M64 66l20 2-20 4z" fill="#C2185B"/>
    <path d="M50 76c4 8 1 16-6 15-5-1-4-9 0-14" fill="#E23B2E" ${S}/>
    <path d="M86 50l7-4M88 58l8 0M86 66l7 4" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  gans: `
    <path d="M32 98c-2-22 2-40 8-52 5-14 6-26 16-30 12-5 24 4 22 18-1 9-10 13-18 14-4 1-6 4-6 9v41z" fill="#FFFDF5" ${S}/>
    <path d="M74 30l18 3c2 5-2 8-6 8l-13-2z" fill="#F28C28" ${S}/>
    <path d="M76 37c5 1 9 0 13-2" fill="none" stroke="${K}" stroke-width="2" stroke-linecap="round"/>
    ${eye(62, 29, 5.6, 1)}
    <path d="M55 20l12-3" stroke="${K}" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 70c10 5 22 5 30 0l2 10c-10 5-24 5-34 0z" fill="#E23B2E" ${S}/>
    <path d="M36 74l2 7M44 75l1 7M52 74l1 7" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M56 78l8 16-9 1-5-14z" fill="#E23B2E" ${S}/>`,
  katze: `
    <path d="M18 46L22 10L46 28Z" fill="#F2A65A" ${S}/>
    <path d="M82 46L78 10L54 28Z" fill="#F2A65A" ${S}/>
    <path d="M25 30l2-13 10 9z" fill="#F7B9C4"/><path d="M75 30l-2-13-10 9z" fill="#F7B9C4"/>
    <ellipse cx="50" cy="56" rx="34" ry="30" fill="#F2A65A" ${S}/>
    <path d="M38 30c2 6 0 10-3 12M50 27v12M62 30c-2 6 0 10 3 12" stroke="#C9772E" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    ${eye(37, 52, 6.4, 1.5)}
    <path d="M56 52c4-4 10-4 14 0" fill="none" stroke="${K}" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M46 62h8l-4 5z" fill="#E77F96" ${S}/>
    <path d="M36 70c6 6 14 4 14-3 0 7 10 9 16 1" fill="none" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M58 72c2 5 6 6 9 3" fill="#fff" stroke="${K}" stroke-width="1.6"/>
    <path d="M30 64l-18-3M30 68l-17 3M70 64l18-3M70 68l17 3" stroke="${K}" stroke-width="1.6" stroke-linecap="round"/>`,
  hund: `
    <path d="M26 26c-14 0-18 18-14 34 2 9 10 10 14 4l6-22z" fill="#8A5A33" ${S}/>
    <path d="M74 26c14 0 18 18 14 34-2 9-10 10-14 4l-6-22z" fill="#8A5A33" ${S}/>
    <path d="M50 18c18 0 26 14 26 30 0 20-11 34-26 34S24 68 24 48c0-16 8-30 26-30z" fill="#E7B67E" ${S}/>
    <path d="M56 22c8 2 14 9 15 18-7 1-14-6-15-18z" fill="#C98B52"/>
    ${eye(40, 44, 6.2, 1)}${eye(60, 44, 6.2, 1)}
    <ellipse cx="50" cy="64" rx="15" ry="11" fill="#FFF3DF" ${S}/>
    <ellipse cx="50" cy="58" rx="7" ry="5" fill="${K}"/><ellipse cx="48" cy="56.5" rx="2" ry="1.3" fill="#fff" opacity=".7"/>
    <path d="M40 68c5 4 15 4 20 0" fill="none" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M46 70h10v10c0 6-10 6-10 0z" fill="#F27C95" ${S}/><path d="M51 71v7" stroke="#C94A68" stroke-width="1.6"/>`,
  schaf: `
    <g fill="#FFFDF5" ${S}>
      <circle cx="26" cy="36" r="12"/><circle cx="40" cy="24" r="13"/><circle cx="60" cy="24" r="13"/><circle cx="74" cy="36" r="12"/>
      <circle cx="22" cy="54" r="11"/><circle cx="78" cy="54" r="11"/><circle cx="30" cy="72" r="11"/><circle cx="70" cy="72" r="11"/><circle cx="50" cy="80" r="12"/>
    </g>
    <ellipse cx="14" cy="50" rx="9" ry="5" transform="rotate(25 14 50)" fill="#4A4248" ${S}/>
    <ellipse cx="86" cy="50" rx="9" ry="5" transform="rotate(-25 86 50)" fill="#4A4248" ${S}/>
    <ellipse cx="50" cy="56" rx="22" ry="25" fill="#4A4248" ${S}/>
    ${eye(41, 54, 5.6, 0.8)}${eye(59, 54, 5.6, -0.8)}
    <g fill="#FFFDF5" ${S}><circle cx="38" cy="38" r="9"/><circle cx="50" cy="35" r="10"/><circle cx="62" cy="38" r="9"/><circle cx="44" cy="45" r="7"/><circle cx="57" cy="45" r="7"/></g>
    <path d="M45 68h10l-5 4z" fill="#F4B6C2"/>
    <path d="M43 75c4 3 10 3 14 0" fill="none" stroke="#FFFDF5" stroke-width="2.4" stroke-linecap="round"/>`,
  ziege: `
    <path d="M38 24c-6-10-16-12-22-6 6 0 12 4 15 12M62 24c6-10 16-12 22-6-6 0-12 4-15 12" fill="#C9B79A" ${S}/>
    <ellipse cx="18" cy="42" rx="12" ry="5.5" transform="rotate(18 18 42)" fill="#F1E6D0" ${S}/>
    <ellipse cx="82" cy="42" rx="12" ry="5.5" transform="rotate(-18 82 42)" fill="#F1E6D0" ${S}/>
    <path d="M50 22c16 0 24 11 24 25 0 14-8 26-24 30-16-4-24-16-24-30 0-14 8-25 24-25z" fill="#F1E6D0" ${S}/>
    ${eye(40, 45, 6, 1)}${eye(60, 45, 6, 1)}
    <path d="M33 42c3-3 9-3 13 0z" fill="#F1E6D0" stroke="${K}" stroke-width="2.6"/><path d="M54 42c3-3 9-3 13 0z" fill="#F1E6D0" stroke="${K}" stroke-width="2.6"/>
    <ellipse cx="44.5" cy="60" rx="2.4" ry="3" fill="${K}"/><ellipse cx="55.5" cy="60" rx="2.4" ry="3" fill="${K}"/>
    <path d="M42 68c5 3 11 3 16 0" fill="none" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M56 67l26-10" stroke="#E8C547" stroke-width="3.4" stroke-linecap="round"/><path d="M78 55l7 1M79 59l6-5" stroke="#E8C547" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M42 74c2 10 6 18 8 22 2-4 6-12 8-22-5 3-11 3-16 0z" fill="#C9B79A" ${S}/>`,
  esel: `
    <path d="M34 34C26 18 24 6 30 2c8 2 12 16 12 30z" fill="#9AA0A8" ${S}/><path d="M32 26c-3-8-3-15 0-18 3 3 5 10 5 18z" fill="#F4B6C2"/>
    <path d="M66 34C74 18 76 6 70 2c-8 2-12 16-12 30z" fill="#9AA0A8" ${S}/><path d="M68 26c3-8 3-15 0-18-3 3-5 10-5 18z" fill="#F4B6C2"/>
    <path d="M50 24c17 0 24 12 24 26 0 9-2 15-4 19H30c-2-4-4-10-4-19 0-14 7-26 24-26z" fill="#AEB4BC" ${S}/>
    <path d="M42 22c2-8 8-10 10-4 2-6 8-4 8 2" fill="#4A4248" ${S}/>
    <circle cx="40" cy="44" r="6.4" fill="#fff" ${S}/><circle cx="41" cy="46" r="3.2" fill="${K}"/>
    <circle cx="60" cy="44" r="6.4" fill="#fff" ${S}/><circle cx="61" cy="46" r="3.2" fill="${K}"/>
    <path d="M33 43c2-4 12-4 14 0zM53 43c2-4 12-4 14 0z" fill="#AEB4BC" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/>
    <ellipse cx="50" cy="72" rx="23" ry="15" fill="#E6E2DA" ${S}/>
    <ellipse cx="42" cy="68" rx="3" ry="4" fill="${K}"/><ellipse cx="58" cy="68" rx="3" ry="4" fill="${K}"/>
    <path d="M40 79h20" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/>`,
  pferd: `
    <path d="M60 8c-16-4-30 8-30 20 8-6 14-6 18-2-8 2-14 8-14 16 8-8 16-8 22-6z" fill="#3B2416" ${S}/>
    <path d="M38 30L33 12L48 22Z" fill="#9A6A45" ${S}/>
    <path d="M66 28L72 10L57 20Z" fill="#9A6A45" ${S}/>
    <path d="M50 20c15 0 22 11 22 24 0 9-2 15-4 22H32c-2-7-4-13-4-22 0-13 7-24 22-24z" fill="#B07A50" ${S}/>
    <path d="M44 22c6-8 18-8 22 0-8 2-14 2-22 0z" fill="#3B2416"/>
    ${eye(40, 44, 6, 1)}${eye(60, 44, 6, 1)}
    <path d="M62 34l4-4M66 38l5-1" stroke="#FFD34E" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="50" cy="72" rx="22" ry="15" fill="#D9A77B" ${S}/>
    <ellipse cx="42" cy="68" rx="3" ry="3.6" fill="${K}"/><ellipse cx="58" cy="68" rx="3" ry="3.6" fill="${K}"/>
    <path d="M38 76c6 7 18 7 24 0z" fill="#fff" ${S}/><path d="M44 77v4M50 77v5M56 77v4" stroke="${K}" stroke-width="1.6"/>`,

  kuh: `
    <path d="M27 26c-7-5-9-14-4-19M73 26c7-5 9-14 4-19" fill="none" stroke="${K}" stroke-width="8" stroke-linecap="round"/>
    <path d="M27 26c-7-5-9-14-4-19M73 26c7-5 9-14 4-19" fill="none" stroke="#FFF3D6" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="16" cy="40" rx="11" ry="6" transform="rotate(20 16 40)" fill="#fff" ${S}/>
    <ellipse cx="84" cy="40" rx="11" ry="6" transform="rotate(-20 84 40)" fill="#fff" ${S}/>
    <path d="M50 18c18 0 26 12 26 27 0 10-3 18-7 24H31c-4-6-7-14-7-24 0-15 8-27 26-27z" fill="#fff" ${S}/>
    <path d="M30 34c4-9 14-10 17-3 2 6-4 11-11 11-5 0-7-3-6-8z" fill="${K}"/>
    <path d="M62 21c9-1 14 6 12 13-7 1-12-4-12-13z" fill="${K}"/>
    <path d="M46 17c2-6 8-7 9-1-3 3-6 3-9 1z" fill="${K}"/>
    ${eye(40, 44, 6.5, 1)}${eye(60, 44, 6.5, -1)}
    <path d="M33 40l6-3M67 40l-6-3" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="50" cy="66" rx="21" ry="13" fill="#F6B3C2" ${S}/>
    <ellipse cx="42" cy="63" rx="3" ry="4" fill="#B5455E"/><ellipse cx="58" cy="63" rx="3" ry="4" fill="#B5455E"/>
    <path d="M44 72c4 3 9 3 13 0" fill="none" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="70" cy="74" r="10" fill="#FF8FC2" ${S}/><circle cx="67" cy="71" r="2.6" fill="#fff" opacity=".8"/>
    <path d="M38 84h24" stroke="#8A5A33" stroke-width="5" stroke-linecap="round"/>
    <path d="M44 85h12l3 11H41z" fill="#FFC93C" ${S}/><circle cx="50" cy="97" r="2.4" fill="${K}"/>`,
  schwein: `
    <path d="M26 30L18 10L40 20Z" fill="#F7A8B8" ${S}/>
    <path d="M74 30L82 10L60 20Z" fill="#F7A8B8" ${S}/>
    <path d="M24 18l5 7 6-3z" fill="#E77F96"/><path d="M76 18l-5 7-6-3z" fill="#E77F96"/>
    <circle cx="50" cy="52" r="34" fill="#F9B9C6" ${S}/>
    <path d="M22 40h56" stroke="${K}" stroke-width="4" stroke-linecap="round"/>
    <rect x="25" y="37" width="22" height="15" rx="6" fill="${K}"/>
    <rect x="53" y="37" width="22" height="15" rx="6" fill="${K}"/>
    <path d="M29 41l6 0M57 41l6 0" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>
    <ellipse cx="50" cy="62" rx="15" ry="10" fill="#F28AA2" ${S}/>
    <ellipse cx="44.5" cy="62" rx="3" ry="4.2" fill="#9E3550"/><ellipse cx="55.5" cy="62" rx="3" ry="4.2" fill="#9E3550"/>
    <path d="M33 74c8 10 26 10 34 0" fill="#7A1E33" ${S}/>
    <path d="M44 80c3-3 9-3 12 0-3 2-9 2-12 0z" fill="#FF7A8A"/>
    <circle cx="27" cy="64" r="5" fill="#FF8FA6" opacity=".7"/><circle cx="73" cy="64" r="5" fill="#FF8FA6" opacity=".7"/>`,
  ratte: `
    <path d="M72 82c14 4 22-2 20-12" fill="none" stroke="#E9A6B2" stroke-width="4" stroke-linecap="round"/>
    <circle cx="24" cy="26" r="15" fill="#9A94A2" ${S}/><circle cx="24" cy="26" r="8" fill="#F4B6C2"/>
    <circle cx="76" cy="26" r="15" fill="#9A94A2" ${S}/><circle cx="76" cy="26" r="8" fill="#F4B6C2"/>
    <path d="M50 24c20 0 29 15 27 31-2 15-14 26-27 34-13-8-25-19-27-34-2-16 7-31 27-31z" fill="#A9A3B1" ${S}/>
    <path d="M23 44c8-5 46-5 54 0l-2 12c-8 4-42 4-50 0z" fill="${K}"/>
    <path d="M20 46l-8-4M80 46l8-4" stroke="${K}" stroke-width="3" stroke-linecap="round"/>
    ${eye(39, 50, 5.5, 1.2)}${eye(61, 50, 5.5, 1.2)}
    <path d="M34 41l10 3M66 41l-10 3" stroke="#A9A3B1" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M45 74l5-5 5 5z" fill="#E77F96" ${S}/>
    <path d="M42 76c-8 0-18 1-27 4M42 74c-8-2-16-3-24-2M58 76c8 0 18 1 27 4M58 74c8-2 16-3 24-2" fill="none" stroke="${K}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M42 80c4 4 12 4 16 0" fill="none" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M46 81h8v6h-8z" fill="#FFFDF5" ${S}/><path d="M50 81v6" stroke="${K}" stroke-width="1.5"/>`,
};

// Stern für Spezialkarten
export const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill="#FFD34E" stroke="#8A5A00" stroke-width="1.4" stroke-linejoin="round"/></svg>';

export function art(id) {
  return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${ART[id] || ''}</svg>`;
}
