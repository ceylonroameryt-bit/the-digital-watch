// Draws the flat SVG illustrations used on the hub pages (hero, one scene per
// series, one per investigation) into assets/illustrations/.
// Run: node scripts/generate-illustrations.mjs
import { mkdir, writeFile } from 'node:fs/promises';

const out = new URL('../assets/illustrations/', import.meta.url);
await mkdir(out, { recursive: true });

const NAVY = '#0B2D5B', BLUE = '#2563EB', SKY = '#93C5FD';
const FONT = "font-family=\"Inter, 'Segoe UI', system-ui, sans-serif\"";

/* Light scene: pastel gradient, dot grid, soft circles. */
const light = (tint, accent, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-hidden="true">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tint[0]}"/><stop offset="1" stop-color="${tint[1]}"/></linearGradient>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="${accent}" opacity=".28"/></pattern>
</defs>
<rect width="640" height="400" fill="url(#bg)"/><rect width="640" height="400" fill="url(#dots)"/>
<circle cx="320" cy="205" r="152" fill="#fff" opacity=".6"/><circle cx="320" cy="205" r="104" fill="${accent}" opacity=".13"/>
${inner}
</svg>
`;

/* Dark scene for investigations and the hero. */
const dark = (accent, inner, w = 640, h = 400) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-hidden="true">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#143A73"/><stop offset="1" stop-color="#06162F"/></linearGradient>
<pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#fff" stroke-opacity=".07"/></pattern>
<radialGradient id="glow"><stop offset="0" stop-color="${accent}" stop-opacity=".55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/><rect width="${w}" height="${h}" fill="url(#grid)"/>
<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${h * 0.62}" fill="url(#glow)"/>
${inner}
</svg>
`;

const card = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#fff" stroke="${NAVY}" stroke-opacity=".14" ${extra}/>`;
const lines = (x, y, widths, color = NAVY) => widths.map((w, i) => `<rect x="${x}" y="${y + i * 14}" width="${w}" height="6" rx="3" fill="${color}" opacity="${i ? .25 : .55}"/>`).join('');
const hex = (cx, cy, r, fill, op = 1) => `<polygon points="${[0, 1, 2, 3, 4, 5].map(i => `${(cx + r * Math.cos(Math.PI / 3 * i + Math.PI / 6)).toFixed(1)},${(cy + r * Math.sin(Math.PI / 3 * i + Math.PI / 6)).toFixed(1)}`).join(' ')}" fill="${fill}" opacity="${op}"/>`;
const check = (x, y, s = 1, color = '#fff', w = 5) => `<path d="M${x} ${y} l${9 * s} ${9 * s} l${17 * s} -${19 * s}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const cross = (cx, cy, r, color, w = 6) => `<path d="M${cx - r} ${cy - r} L${cx + r} ${cy + r} M${cx + r} ${cy - r} L${cx - r} ${cy + r}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

const files = {};

/* ── Series ── */
files['series-cybersecurity-for-everyone'] = light(['#E8F1FF', '#C9DDFB'], BLUE, `
<path d="M320 78 L414 114 V208 C414 272 374 318 320 340 C266 318 226 272 226 208 V114 Z" fill="#fff" stroke="${NAVY}" stroke-width="7" stroke-linejoin="round"/>
<path d="M320 78 L414 114 V208 C414 272 374 318 320 340 Z" fill="${BLUE}" opacity=".14"/>
<path d="M274 206 l33 33 l60 -68" fill="none" stroke="${BLUE}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
${[0, 1, 2, 3, 4].map(i => `<rect x="${96 + i * 17}" y="${200 - [10, 24, 38, 24, 10][i]}" width="9" height="${[20, 48, 76, 48, 20][i]}" rx="4.5" fill="${BLUE}" opacity="${[.3, .5, .8, .5, .3][i]}"/>`).join('')}
${card(448, 116, 120, 70)}${lines(464, 134, [64, 88, 52])}<circle cx="548" cy="132" r="9" fill="#22C55E"/>${check(543, 132, .45, '#fff', 3)}
${hex(520, 262, 26, SKY, .7)}${hex(556, 300, 16, BLUE, .35)}${hex(482, 304, 12, SKY, .6)}`);

files['series-security-in-5-minutes'] = light(['#E4EEFF', '#BFD6FA'], BLUE, `
<path d="M282 196 V156 a44 44 0 0 1 88 0 V196" fill="none" stroke="${NAVY}" stroke-width="18" stroke-linecap="round"/>
<rect x="246" y="192" width="160" height="128" rx="22" fill="${NAVY}"/><rect x="246" y="192" width="160" height="40" rx="22" fill="#fff" opacity=".08"/>
<circle cx="326" cy="250" r="15" fill="#fff"/><rect x="320" y="258" width="12" height="30" rx="6" fill="#fff"/>
<circle cx="458" cy="150" r="62" fill="#fff" stroke="${NAVY}" stroke-width="8"/><rect x="446" y="76" width="24" height="12" rx="4" fill="${NAVY}"/>
<path d="M458 150 L458 104 A46 46 0 0 1 498 128 Z" fill="${BLUE}" opacity=".85"/><path d="M458 150 L458 112" stroke="${NAVY}" stroke-width="6" stroke-linecap="round"/><circle cx="458" cy="150" r="6" fill="${NAVY}"/>
<text x="458" y="196" text-anchor="middle" ${FONT} font-weight="800" font-size="22" fill="${NAVY}">5:00</text>
<g fill="#F59E0B"><circle cx="146" cy="120" r="9"/><circle cx="196" cy="86" r="5"/></g><g stroke="${BLUE}" stroke-width="4" stroke-linecap="round" opacity=".5"><path d="M122 250h52M122 270h34"/></g>`);

files['series-threat-of-the-week'] = light(['#FFEDED', '#FBC9C9'], '#EF4444', `
<g fill="none" stroke="#EF4444" stroke-width="3" opacity=".5"><circle cx="320" cy="200" r="44"/><circle cx="320" cy="200" r="88"/><circle cx="320" cy="200" r="132"/><path d="M320 62V338M182 200H458"/></g>
<path d="M320 200 L387.500 83 A135 135 0 0 1 447 154 Z" fill="#EF4444" opacity=".35"/><path d="M320 200 L387.500 83" stroke="#EF4444" stroke-width="5" stroke-linecap="round"/>
<circle cx="320" cy="200" r="9" fill="${NAVY}"/>
<g fill="#EF4444"><circle cx="414" cy="128" r="10"/><circle cx="262" cy="268" r="8"/><circle cx="384" cy="262" r="7"/></g>
<g fill="none" stroke="#EF4444" stroke-width="3"><circle cx="414" cy="128" r="22" opacity=".5"/><circle cx="262" cy="268" r="19" opacity=".4"/></g>
${card(78, 82, 126, 84)}<path d="M141 100 l22 38 h-44 Z" fill="#EF4444"/><rect x="139" y="113" width="4" height="13" rx="2" fill="#fff"/><circle cx="141" cy="131" r="2.600" fill="#fff"/>${lines(96, 148, [88])}
${card(470, 262, 100, 62)}${lines(486, 278, [60, 40, 52])}`);

files['series-playbook-monday'] = light(['#E6F8EC', '#BFE9CE'], '#22C55E', `
<rect x="236" y="78" width="168" height="252" rx="18" fill="#fff" stroke="${NAVY}" stroke-width="6"/><rect x="284" y="62" width="72" height="30" rx="10" fill="${NAVY}"/>
${[0, 1, 2, 3].map(i => `<rect x="258" y="${120 + i * 50}" width="28" height="28" rx="8" fill="${i < 3 ? '#22C55E' : '#fff'}" stroke="${i < 3 ? '#22C55E' : NAVY}" stroke-width="3"/>${i < 3 ? check(264, 134 + i * 50, .55, '#fff', 4) : ''}<rect x="298" y="${124 + i * 50}" width="82" height="7" rx="3.500" fill="${NAVY}" opacity=".55"/><rect x="298" y="${137 + i * 50}" width="56" height="6" rx="3" fill="${NAVY}" opacity=".22"/>`).join('')}
<g fill="#fff" stroke="${NAVY}" stroke-width="4"><rect x="82" y="112" width="86" height="42" rx="12"/><rect x="82" y="238" width="86" height="42" rx="12"/><rect x="470" y="170" width="92" height="42" rx="12" fill="#22C55E" stroke="#16A34A"/></g>
<g stroke="${NAVY}" stroke-width="4" stroke-dasharray="7 8" fill="none" opacity=".55"><path d="M125 154 V238"/><path d="M168 133 H236"/><path d="M404 191 H470"/></g>
<path d="M500 191 l10 10 l20 -22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);

files['series-myth-vs-reality'] = light(['#FFF3DB', '#FBDDA0'], '#F59E0B', `
<g transform="rotate(-8 214 210)"><rect x="124" y="106" width="176" height="212" rx="18" fill="#fff" stroke="${NAVY}" stroke-width="5"/><rect x="124" y="106" width="176" height="46" rx="18" fill="#EF4444"/><rect x="124" y="130" width="176" height="22" fill="#EF4444"/>
<text x="212" y="138" text-anchor="middle" ${FONT} font-weight="800" font-size="20" fill="#fff" letter-spacing="2">MYTH</text>${cross(212, 224, 26, '#EF4444', 11)}${lines(152, 276, [120, 84])}</g>
<g transform="rotate(7 428 210)"><rect x="340" y="96" width="176" height="212" rx="18" fill="#fff" stroke="${NAVY}" stroke-width="5"/><rect x="340" y="96" width="176" height="46" rx="18" fill="#22C55E"/><rect x="340" y="120" width="176" height="22" fill="#22C55E"/>
<text x="428" y="128" text-anchor="middle" ${FONT} font-weight="800" font-size="20" fill="#fff" letter-spacing="2">FACT</text><path d="M398 220 l22 22 l44 -50" fill="none" stroke="#22C55E" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>${lines(368, 266, [120, 84])}</g>
<circle cx="320" cy="206" r="26" fill="${NAVY}"/><text x="320" y="214" text-anchor="middle" ${FONT} font-weight="800" font-size="20" fill="#fff">vs</text>`);

files['series-tool-spotlight'] = light(['#EEE8FF', '#D5C8FA'], '#8B5CF6', `
<rect x="130" y="92" width="330" height="210" rx="18" fill="${NAVY}"/><rect x="130" y="92" width="330" height="36" rx="18" fill="#fff" opacity=".1"/>
<g><circle cx="156" cy="110" r="6" fill="#EF4444"/><circle cx="176" cy="110" r="6" fill="#F59E0B"/><circle cx="196" cy="110" r="6" fill="#22C55E"/></g>
<path d="M156 158 l18 14 l-18 14" fill="none" stroke="#22C55E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><rect x="188" y="168" width="96" height="8" rx="4" fill="#fff" opacity=".85"/>
<rect x="156" y="206" width="210" height="7" rx="3.500" fill="${SKY}" opacity=".7"/><rect x="156" y="226" width="160" height="7" rx="3.500" fill="${SKY}" opacity=".45"/><rect x="156" y="246" width="248" height="7" rx="3.500" fill="${SKY}" opacity=".45"/><rect x="156" y="266" width="120" height="7" rx="3.500" fill="#8B5CF6"/>
<circle cx="452" cy="268" r="56" fill="#fff" fill-opacity=".55" stroke="${NAVY}" stroke-width="10"/><path d="M492 308 L544 360" stroke="${NAVY}" stroke-width="18" stroke-linecap="round"/>
<path d="M430 258 q22 -26 44 0" fill="none" stroke="#8B5CF6" stroke-width="6" stroke-linecap="round"/><circle cx="452" cy="276" r="8" fill="#8B5CF6"/>`);

/* ── Investigations ── */
files['case-mag'] = dark('#38BDF8', `
<path d="M70 318 Q320 24 580 250" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round"/>
<g transform="translate(446 118) rotate(24)"><polygon points="-52,14 52,-24 18,30 8,8" fill="#fff"/><polygon points="8,8 52,-24 -6,2" fill="#38BDF8"/></g>
<rect x="92" y="236" width="196" height="92" rx="14" fill="#fff" fill-opacity=".1" stroke="#fff" stroke-opacity=".3"/>
<text x="112" y="286" ${FONT} font-weight="800" font-size="44" fill="#fff">8.8M</text><text x="112" y="312" ${FONT} font-weight="600" font-size="15" fill="#BFE3FF">customers exposed</text>
<g fill="#FBBF24"><circle cx="520" cy="304" r="12"/><rect x="530" y="299" width="44" height="10" rx="3"/><rect x="552" y="309" width="8" height="12"/><rect x="566" y="309" width="8" height="9"/></g>
<g fill="#fff" opacity=".55"><circle cx="110" cy="110" r="4"/><circle cx="170" cy="76" r="3"/><circle cx="560" cy="90" r="4"/></g>`);

files['case-asos'] = dark('#F472B6', `
<path d="M150 150 h140 l14 170 h-168 Z" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><path d="M190 150 v-18 a30 30 0 0 1 60 0 v18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
<circle cx="220" cy="236" r="26" fill="#F472B6"/><path d="M208 236 l9 9 l16 -18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
<g transform="translate(402 150)"><circle cx="50" cy="50" r="44" fill="none" stroke="#FBBF24" stroke-width="16"/><rect x="88" y="42" width="110" height="16" rx="4" fill="#FBBF24"/><rect x="152" y="58" width="16" height="30" rx="4" fill="#FBBF24"/><rect x="180" y="58" width="16" height="22" rx="4" fill="#FBBF24"/></g>
<rect x="352" y="72" width="214" height="58" rx="12" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-opacity=".3"/><circle cx="378" cy="101" r="10" fill="#F472B6"/><rect x="398" y="92" width="120" height="8" rx="4" fill="#fff" opacity=".8"/><rect x="398" y="108" width="82" height="7" rx="3.500" fill="#fff" opacity=".4"/>
<g fill="#fff" opacity=".5"><circle cx="86" cy="96" r="4"/><circle cx="596" cy="300" r="4"/><circle cx="330" cy="340" r="3"/></g>`);

files['case-php'] = dark('#A78BFA', `
<rect x="96" y="70" width="448" height="262" rx="18" fill="#06162F" stroke="#fff" stroke-opacity=".28" stroke-width="2"/><rect x="96" y="70" width="448" height="38" rx="18" fill="#fff" fill-opacity=".1"/>
<circle cx="124" cy="89" r="6" fill="#EF4444"/><circle cx="144" cy="89" r="6" fill="#F59E0B"/><circle cx="164" cy="89" r="6" fill="#22C55E"/>
<text x="124" y="146" ${FONT} font-weight="700" font-size="20" fill="#A78BFA">&lt;?php</text>
<rect x="124" y="166" width="150" height="9" rx="4.500" fill="#fff" opacity=".7"/><rect x="148" y="188" width="196" height="9" rx="4.500" fill="#38BDF8" opacity=".8"/><rect x="148" y="210" width="120" height="9" rx="4.500" fill="#fff" opacity=".4"/>
<rect x="148" y="232" width="248" height="9" rx="4.500" fill="#EF4444"/><rect x="124" y="254" width="90" height="9" rx="4.500" fill="#fff" opacity=".55"/><rect x="124" y="276" width="170" height="9" rx="4.500" fill="#fff" opacity=".3"/>
<g transform="translate(470 238)"><circle r="46" fill="#EF4444"/><text y="-2" text-anchor="middle" ${FONT} font-weight="800" font-size="26" fill="#fff">9.2</text><text y="20" text-anchor="middle" ${FONT} font-weight="700" font-size="12" fill="#fff" letter-spacing="1">CVSS</text></g>
<path d="M544 150 l-40 44" stroke="#EF4444" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 10"/>`);

files['case-ai'] = dark('#2DD4BF', `
<g stroke="#2DD4BF" stroke-width="5" stroke-linecap="round" opacity=".8">${[0, 1, 2, 3].map(i => `<path d="M${262 + i * 40} 112V84M${262 + i * 40} 288V316"/>`).join('')}${[0, 1, 2, 3].map(i => `<path d="M236 ${138 + i * 40}H208M404 ${138 + i * 40}H432"/>`).join('')}</g>
<rect x="236" y="112" width="168" height="176" rx="24" fill="#06162F" stroke="#fff" stroke-width="6"/><rect x="262" y="138" width="116" height="124" rx="14" fill="#2DD4BF" fill-opacity=".14" stroke="#2DD4BF" stroke-width="3"/>
<text x="320" y="224" text-anchor="middle" ${FONT} font-weight="800" font-size="56" fill="#fff">AI</text>
<g stroke="#fff" stroke-opacity=".5" stroke-width="3"><path d="M432 178 L506 130"/><path d="M432 258 L520 280"/><path d="M208 178 L132 130"/><path d="M208 258 L120 288"/></g>
<g fill="#2DD4BF"><circle cx="506" cy="130" r="12"/><circle cx="132" cy="130" r="12"/><circle cx="120" cy="288" r="10"/></g><circle cx="520" cy="280" r="14" fill="#EF4444"/><path d="M514 274 l12 12 M526 274 l-12 12" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`);

/* ── Home hero: laptop with a lock on a dark, gridded scene ── */
files['hero'] = dark('#3B82F6', `
<g transform="translate(110 120)">
<rect x="0" y="0" width="340" height="216" rx="18" fill="#06162F" stroke="#fff" stroke-width="7"/>
<rect x="18" y="18" width="304" height="180" rx="8" fill="#0F2E66"/>
<rect x="-40" y="226" width="420" height="22" rx="11" fill="#fff" opacity=".9"/><rect x="130" y="226" width="80" height="8" rx="4" fill="#0B2D5B" opacity=".4"/>
<path d="M170 64 l54 20 v50 c0 34 -22 56 -54 70 c-32 -14 -54 -36 -54 -70 v-50 Z" fill="#fff"/><path d="M170 64 l54 20 v50 c0 34 -22 56 -54 70 Z" fill="${BLUE}" opacity=".22"/>
<rect x="148" y="116" width="44" height="36" rx="8" fill="${NAVY}"/><path d="M155 116 v-10 a15 15 0 0 1 30 0 v10" fill="none" stroke="${NAVY}" stroke-width="6" stroke-linecap="round"/><rect x="167" y="127" width="6" height="14" rx="3" fill="#fff"/>
</g>
<g fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round"><path d="M450 170 Q520 120 590 160"/><path d="M110 230 Q60 280 90 350"/></g>
<g fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".4"><rect x="478" y="96" width="120" height="54" rx="12"/><rect x="34" y="318" width="104" height="48" rx="12"/></g>
<rect x="494" y="112" width="70" height="7" rx="3.500" fill="#fff" opacity=".8"/><rect x="494" y="128" width="46" height="6" rx="3" fill="#fff" opacity=".4"/><circle cx="582" cy="123" r="6" fill="#22C55E"/>
<rect x="50" y="334" width="60" height="7" rx="3.500" fill="#fff" opacity=".7"/><rect x="50" y="348" width="36" height="6" rx="3" fill="#fff" opacity=".35"/>
<g fill="#93C5FD"><circle cx="560" cy="270" r="5"/><circle cx="600" cy="230" r="4"/><circle cx="40" cy="160" r="5"/><circle cx="76" cy="110" r="3"/></g>`, 720, 480);

for (const [name, svg] of Object.entries(files)) await writeFile(new URL(`${name}.svg`, out), svg);
console.log(`Wrote ${Object.keys(files).length} illustrations`);
