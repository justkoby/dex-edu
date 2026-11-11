// Character style exploration for the Netherlands 2027 video: ONE character (same face, hair, outfit, proportions)
// drawn in three 2D treatments. Run: node character-options/build.mjs  ->  character-options/character-style-options.png
// Everything is hand-built SVG, so the chosen option converts directly into the animatable rig.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const SKIN = { base: "#9A5733", shade: "#7B4024", light: "#B56E42", line: "#4A2212", palm: "#C4835A" };
const HAIR = "#1A1311", FADE = "#4A342B";
const SHIRT = { base: "#F37A20", shade: "#CF5F10", light: "#FF9642" };
const TEE = { base: "#F7EEE0", shade: "#E2D2BC" };
const PANTS = { base: "#283C8D", shade: "#1B2B6B" };
const INK = "#1D1730";

const STYLES = {
  A: { key: "A", outline: 0, shading: 2, eye: "almond", headScale: 1.1, bg: ["#3F3A8C", "#2E2A6E"], label: "#fff" },
  B: { key: "B", outline: 5, shading: 1, eye: "big", headScale: 1.2, bg: ["#EEF0FF", "#D5DAFB"], label: INK },
  C: { key: "C", outline: 0, shading: 0, eye: "dot", headScale: 1.12, bg: ["#FFD60A", "#FFC400"], label: INK },
};

const EXPR = {
  confident: { browL: [0, -4], browR: [-3, 6], eye: 0.9, look: [0.2, 0], mouth: "smile", tilt: -3 },
  frustrated: { browL: [5, 16], browR: [4, 14], eye: 0.72, look: [0, 0.1], mouth: "grumble", tilt: 4 },
  skeptical: { browL: [6, 12], browR: [-10, -8], eye: 0.7, look: [0.8, 0], mouth: "side", tilt: 6 },
  surprised: { browL: [-13, -8], browR: [-13, -6], eye: 1.35, look: [0, 0], mouth: "o", tilt: 0 },
  excited: { browL: [-9, -6], browR: [-9, -4], eye: 1.05, look: [0, 0], mouth: "grin", tilt: -4 },
  thinking: { browL: [-8, -10], browR: [2, 8], eye: 0.9, look: [0.9, -0.8], mouth: "purse", tilt: -7 },
};

const r = (n) => Math.round(n * 10) / 10;

function head(st, ex) {
  const o = st.outline, ol = o ? `stroke="${INK}" stroke-width="${o}" stroke-linejoin="round"` : "";
  const FACE = "M232,192 C229,132 262,104 306,104 C351,104 380,134 380,188 C380,216 376,240 365,260 C352,285 331,302 309,302 C285,302 259,284 245,256 C236,238 233,216 232,192 Z";
  let s = "";
  // ear (near side)
  s += `<ellipse cx="233" cy="214" rx="14" ry="23" fill="${SKIN.base}" ${ol}/>`;
  if (st.shading) s += `<path d="M236,202 Q228,214 236,226" stroke="${SKIN.shade}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  // face
  s += `<path d="${FACE}" fill="${SKIN.base}" ${ol}/>`;
  if (st.shading >= 1) {
    s += `<clipPath id="face${st.key}"><path d="${FACE}"/></clipPath><g clip-path="url(#face${st.key})">`;
    // side plane + jaw shadow (light from the right)
    s += `<path d="M225,110 L282,104 C260,136 254,176 257,214 C260,252 280,288 312,304 L240,310 Z" fill="${SKIN.shade}" opacity="${st.shading === 2 ? 0.6 : 0.42}"/>`;
    s += `<path d="M240,140 Q306,118 378,146 L384,100 L226,100 Z" fill="${SKIN.shade}" opacity="0.45"/>`; // under the hairline
    if (st.shading === 2) {
      s += `<ellipse cx="350" cy="236" rx="22" ry="30" fill="${SKIN.light}" opacity="0.5"/>`;
      s += `<path d="M300,288 Q312,296 330,286 L330,306 L296,306 Z" fill="${SKIN.light}" opacity="0.35"/>`;
    } else s += `<ellipse cx="352" cy="244" rx="17" ry="11" fill="#D9774F" opacity="0.5"/><ellipse cx="270" cy="246" rx="13" ry="9" fill="#D9774F" opacity="0.35"/>`;
    s += `</g>`;
  }
  // hair: sharp line-up, low fade on the sides
  const TOP = "M229,186 C222,118 258,80 311,80 C360,80 392,114 384,178 C381,158 375,146 366,139 C338,128 282,129 252,141 C241,151 235,166 233,190 Z";
  s += `<path d="M231,196 C229,170 236,150 252,141 L262,137 C250,152 246,172 246,196 Z" fill="${FADE}" opacity="0.85"/>`;
  s += `<path d="${TOP}" fill="${HAIR}" ${ol}/>`;
  if (st.shading === 2) s += `<path d="M262,112 C284,92 330,88 356,106 C330,98 290,100 262,112 Z" fill="#3B2B26"/><path d="M366,139 C375,146 381,158 384,178 C388,150 384,128 372,112 C374,124 372,132 366,139 Z" fill="#000" opacity="0.4"/>`;
  if (st.key === "B") s += `<path d="M268,108 C290,92 326,90 346,102" stroke="#4B3A34" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M286,120 C302,112 322,112 336,118" stroke="#4B3A34" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  // brows
  const brow = (x, y, [dy, ang], flip, w) => `<g transform="translate(${x} ${y + dy}) rotate(${flip * ang}) scale(${flip * w} 1)"><path d="M-25,5 Q-6,-11 25,-3 L26,5 Q-4,-2 -22,11 Z" fill="${HAIR}"/></g>`;
  s += brow(277, 180, ex.browL, -1, st.key === "B" ? 1.08 : 1) + brow(340, 180, ex.browR, 1, st.key === "B" ? 0.98 : 0.9);
  // eyes
  const eye = (x, w, id) => {
    const op = ex.eye, [lx, ly] = ex.look;
    if (st.eye === "dot") {
      return `<ellipse cx="${x + lx * 3}" cy="${207 + ly * 3}" rx="${8 * w}" ry="${r(Math.min(14, 11.5 * op))}" fill="${INK}"/><circle cx="${x + lx * 3 + 2}" cy="${203 + ly * 3}" r="2.8" fill="#fff"/>` +
        (op < 0.8 ? `<path d="M${x - 11 * w},${r(207 - 9 * op)} L${x + 11 * w},${r(207 - 9 * op - 1)}" stroke="${SKIN.line}" stroke-width="3.5" stroke-linecap="round"/>` : "");
    }
    const big = st.eye === "big" ? 1.28 : 1, ew = 18 * w * big, up = 13 * op * big, dn = 8 * op * big, ir = 7.6 * big;
    const shape = `M${r(x - ew)},207 Q${x},${r(207 - up * 1.55)} ${r(x + ew)},206 Q${x},${r(207 + dn * 1.6)} ${r(x - ew)},207 Z`;
    return `<clipPath id="${id}"><path d="${shape}"/></clipPath><path d="${shape}" fill="#FCF8F1"/>` +
      `<g clip-path="url(#${id})"><circle cx="${r(x + lx * 6 * big)}" cy="${r(206 + ly * 4 * big)}" r="${ir}" fill="#3A1D10"/><circle cx="${r(x + lx * 6 * big)}" cy="${r(206 + ly * 4 * big)}" r="${ir * 0.5}" fill="#120806"/>` +
      `<circle cx="${r(x + lx * 6 * big + 3)}" cy="${r(203 + ly * 4 * big)}" r="${st.eye === "big" ? 3.2 : 2.2}" fill="#fff"/></g>` +
      `<path d="M${r(x - ew - 2)},208 Q${x},${r(207 - up * 1.6)} ${r(x + ew + 2)},206" stroke="${INK}" stroke-width="${st.eye === "big" ? 5 : 4}" fill="none" stroke-linecap="round"/>` +
      (st.eye === "big" ? `<path d="M${r(x - ew + 4)},${r(210 + dn)} Q${x},${r(209 + dn * 1.5)} ${r(x + ew - 4)},${r(209 + dn)}" stroke="${SKIN.line}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/>` : "");
  };
  s += eye(278, 1, `eL${st.key}${ex.mouth}`) + eye(340, 0.9, `eR${st.key}${ex.mouth}`);
  // nose (three-quarter)
  if (st.key === "C") s += `<path d="M314,212 L322,240 Q314,246 304,242" stroke="${SKIN.line}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  else {
    if (st.shading === 2) s += `<path d="M312,200 C318,220 330,236 328,246 L306,248 C304,232 306,214 312,200 Z" fill="${SKIN.shade}" opacity="0.45"/>`;
    s += `<path d="M300,243 C296,236 302,231 306,236 M306,247 C314,253 326,251 331,244 C335,238 329,232 325,224" stroke="${SKIN.line}" stroke-width="${st.key === "B" ? 4 : 3.4}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  // mouth
  const mx = 314, my = 272, lw = st.key === "B" ? 4.5 : 4;
  const inner = (d, teeth = true, tongue = true) => `<clipPath id="m${st.key}${ex.mouth}"><path d="${d}"/></clipPath><path d="${d}" fill="#3B1213" ${st.key === "B" ? `stroke="${INK}" stroke-width="4" stroke-linejoin="round"` : ""}/><g clip-path="url(#m${st.key}${ex.mouth})">${tongue ? `<ellipse cx="2" cy="20" rx="15" ry="9" fill="#D4626B"/>` : ""}${teeth ? `<rect x="-34" y="-14" width="68" height="17" fill="#FFFDF7"/>` : ""}</g>`;
  let m = "";
  if (ex.mouth === "smile") m = `<path d="M-23,-2 Q2,15 27,-7" stroke="${SKIN.line}" stroke-width="${lw + 0.5}" fill="none" stroke-linecap="round"/><path d="M27,-7 q4,-1 5,-5" stroke="${SKIN.line}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if (ex.mouth === "grin") m = inner("M-28,-5 Q0,3 30,-9 Q27,22 2,24 Q-22,23 -28,-5 Z");
  if (ex.mouth === "o") m = inner("M-11,-8 Q1,-16 13,-8 Q18,6 12,17 Q1,24 -10,17 Q-16,5 -11,-8 Z", false, true);
  if (ex.mouth === "grumble") m = inner("M-22,2 Q0,-9 24,-1 Q22,13 2,14 Q-18,14 -22,2 Z", true, false).replace('y="-14"', 'y="-12"') + `<path d="M-27,6 q-3,-3 -1,-8 M28,3 q4,-2 3,-8" stroke="${SKIN.line}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if (ex.mouth === "side") m = `<path d="M-20,4 Q2,5 24,-8" stroke="${SKIN.line}" stroke-width="${lw + 0.5}" fill="none" stroke-linecap="round"/><path d="M24,-8 q5,-1 5,-7" stroke="${SKIN.line}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if (ex.mouth === "purse") m = `<path d="M-8,0 Q4,-6 16,0 Q4,7 -8,0 Z" fill="${SKIN.line}"/>`;
  s += `<g transform="translate(${mx} ${my})">${m}</g>`;
  if (st.shading && ex.mouth !== "o") s += `<path d="M302,${my + 22} Q314,${my + 27} 328,${my + 21}" stroke="${SKIN.shade}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.8"/>`;
  return `<g transform="rotate(${ex.tilt} 306 300) translate(306 300) scale(${st.headScale}) translate(-306 -300)">${s}</g>`;
}

/** stroked limb with optional outline + shading; pts = [[x,y],...] */
function limb(st, pts, w, col, shade, light) {
  const d = "M" + pts.map((p) => p.join(",")).join(" L");
  let s = "";
  if (st.outline) s += `<path d="${d}" stroke="${INK}" stroke-width="${w + st.outline * 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (st.shading) {
    const off = "M" + pts.map(([x, y]) => [x - w * 0.22, y + w * 0.1].join(",")).join(" L");
    s += `<path d="${off}" stroke="${shade}" stroke-width="${w * 0.42}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${st.shading === 2 ? 0.9 : 0.7}"/>`;
    if (st.shading === 2 && light) { const hi = "M" + pts.map(([x, y]) => [x + w * 0.24, y - w * 0.08].join(",")).join(" L"); s += `<path d="${hi}" stroke="${light}" stroke-width="${w * 0.16}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>`; }
  }
  return s;
}

function openHand(st, x, y, rot) {
  const o = st.outline, f = (ang, len, w, x0) => { const a = (ang * Math.PI) / 180; return [[x0, -30], [r(x0 + Math.sin(a) * len), r(-30 - Math.cos(a) * len)], w]; };
  const fingers = [f(-17, 36, 14, -17), f(-5, 46, 14.5, -6), f(6, 43, 14, 6), f(18, 32, 13, 17)], thumb = [[-22, -4], [-42, -26], 15];
  let s = "";
  const all = [...fingers, thumb];
  if (o) { for (const [a, b, w] of all) s += `<path d="M${a} L${b}" stroke="${INK}" stroke-width="${w + o * 2}" stroke-linecap="round"/>`; s += `<rect x="${-27 - o}" y="${-40 - o}" width="${54 + o * 2}" height="${56 + o * 2}" rx="${20 + o}" fill="${INK}"/>`; }
  for (const [a, b, w] of all) s += `<path d="M${a} L${b}" stroke="${SKIN.base}" stroke-width="${w}" stroke-linecap="round"/>`;
  s += `<rect x="-27" y="-40" width="54" height="56" rx="20" fill="${SKIN.base}"/>`;
  s += `<ellipse cx="1" cy="-13" rx="17" ry="19" fill="${SKIN.palm}" opacity="${st.shading ? 0.75 : 0.55}"/>`;
  if (st.shading) s += `<path d="M-12,-20 Q0,-8 14,-18 M-10,-4 Q2,2 14,-6" stroke="${SKIN.shade}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot})">${s}</g>`;
}
function fist(st, x, y, rot) {
  const ol = st.outline ? `stroke="${INK}" stroke-width="${st.outline}"` : "";
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-22" y="-8" width="44" height="50" rx="19" fill="${SKIN.base}" ${ol}/>` +
    (st.shading ? `<path d="M-22,10 Q-22,42 0,42 L-6,42 Q-22,40 -22,10 Z" fill="${SKIN.shade}"/><rect x="-22" y="-8" width="16" height="50" rx="8" fill="${SKIN.shade}" opacity="0.5"/>` : "") +
    `<path d="M-8,22 v14 M3,24 v14 M13,22 v13" stroke="${SKIN.line}" stroke-width="2.6" stroke-linecap="round" opacity="0.6"/><ellipse cx="18" cy="6" rx="9" ry="14" fill="${SKIN.base}" ${ol}/></g>`;
}

function body(st, ex) {
  const o = st.outline, ol = o ? `stroke="${INK}" stroke-width="${o}" stroke-linejoin="round"` : "";
  let s = "";
  // trousers
  s += `<path d="M176,650 L434,650 L450,910 L320,910 L306,770 L288,910 L158,910 Z" fill="${PANTS.base}" ${ol}/>`;
  if (st.shading) s += `<path d="M306,770 L320,910 L352,910 L322,700 Z" fill="${PANTS.shade}"/><path d="M176,650 L206,650 L196,910 L158,910 Z" fill="${PANTS.shade}" opacity="0.8"/>`;
  s += `<path d="M360,668 Q398,676 420,664" stroke="${PANTS.shade}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  // back arm (screen-left, relaxed)
  s += limb(st, [[160, 376], [130, 516], [140, 640]], 66, SHIRT.base, SHIRT.shade, null);
  s += fist(st, 142, 668, 6);
  s += `<path d="M110,628 L172,636" stroke="${SHIRT.shade}" stroke-width="7" stroke-linecap="round"/>`;
  // neck
  s += `<path d="M272,268 L270,330 Q305,362 342,330 L340,268 Z" fill="${SKIN.base}" ${ol}/>`;
  if (st.shading) s += `<path d="M272,290 Q306,318 340,292 L340,268 L272,268 Z" fill="${SKIN.shade}" opacity="0.75"/>`;
  else s += `<path d="M274,296 Q306,316 338,296 L338,280 L274,280 Z" fill="${SKIN.shade}" opacity="0.55"/>`;
  // tee
  s += `<path d="M236,326 L270,322 Q305,358 342,322 L378,326 L392,676 L222,676 Z" fill="${TEE.base}" ${ol}/>`;
  if (st.shading) s += `<path d="M236,326 L270,322 Q288,342 300,346 L284,676 L222,676 Z" fill="${TEE.shade}" opacity="0.8"/>`;
  s += `<path d="M270,322 Q305,358 342,322" stroke="${TEE.shade}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  // overshirt panels
  const LP = "M270,314 L176,338 C150,346 138,366 138,398 L146,688 L262,688 L274,480 Z", RP = "M342,314 L428,338 C456,346 466,366 466,398 L456,688 L358,688 L344,480 Z";
  s += `<path d="${LP}" fill="${SHIRT.base}" ${ol}/><path d="${RP}" fill="${SHIRT.base}" ${ol}/>`;
  if (st.shading) {
    s += `<path d="M138,398 L146,688 L196,688 L180,420 C178,380 190,352 220,330 L176,338 C150,346 138,366 138,398 Z" fill="${SHIRT.shade}"/>`;
    s += `<path d="M344,480 L358,688 L386,688 L372,470 L360,400 Z" fill="${SHIRT.shade}" opacity="0.85"/>`;
    if (st.shading === 2) s += `<path d="M428,338 C456,346 466,366 466,398 L462,520 C452,440 440,380 404,334 Z" fill="${SHIRT.light}" opacity="0.7"/>`;
  }
  // collar, pocket, buttons
  s += `<path d="M266,306 L296,350 L262,402 L232,330 Z" fill="${SHIRT.base}" ${ol}/><path d="M344,306 L318,350 L352,402 L380,330 Z" fill="${SHIRT.base}" ${ol}/>`;
  if (st.shading) s += `<path d="M266,306 L296,350 L262,402 L252,372 L276,346 Z" fill="${SHIRT.shade}" opacity="0.7"/>`;
  s += `<rect x="382" y="430" width="56" height="62" rx="7" fill="none" stroke="${SHIRT.shade}" stroke-width="4.5"/><path d="M382,446 H438" stroke="${SHIRT.shade}" stroke-width="4.5"/>`;
  for (const y of [520, 580, 640]) s += `<circle cx="352" cy="${y}" r="5.5" fill="${TEE.base}" stroke="${SHIRT.shade}" stroke-width="2"/>`;
  // front arm (screen-right, raised open hand: "so tell me…")
  s += limb(st, [[444, 380], [474, 522], [528, 480]], 64, SHIRT.base, SHIRT.shade, null);
  s += `<path d="M516,452 L546,504" stroke="${SHIRT.shade}" stroke-width="7" stroke-linecap="round"/>`;
  s += openHand(st, 550, 464, 58);
  s += head(st, ex);
  return s;
}

function panel(st, title, sub) {
  const W = 620, H = 1250, exprs = st.key === "A" ? ["frustrated", "surprised", "excited"] : st.key === "B" ? ["skeptical", "surprised", "excited"] : ["frustrated", "thinking", "excited"];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  s += `<defs><linearGradient id="bg${st.key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${st.bg[0]}"/><stop offset="1" stop-color="${st.bg[1]}"/></linearGradient>`;
  s += `<filter id="grain${st.key}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.35 0"/><feComposite in2="SourceGraphic" operator="in"/><feBlend in2="SourceGraphic" mode="multiply"/></filter>`;
  s += `<clipPath id="card${st.key}"><rect width="${W}" height="${H}" rx="36"/></clipPath></defs>`;
  s += `<g clip-path="url(#card${st.key})"><rect width="${W}" height="${H}" fill="url(#bg${st.key})"/>`;
  if (st.key === "A") s += `<circle cx="470" cy="330" r="250" fill="#5A54B8" opacity="0.55"/>`;
  if (st.key === "B") s += `<path d="M-20,620 Q160,360 420,430 T680,300 L680,900 L-20,900 Z" fill="#fff" opacity="0.6"/>`;
  if (st.key === "C") s += `<rect x="60" y="250" width="150" height="560" fill="#F5B800"/><rect x="430" y="330" width="170" height="480" fill="#F5B800"/><rect x="250" y="200" width="130" height="610" fill="#F5B800" opacity="0.6"/>`;
  s += `<text x="40" y="74" font-family="'Baloo 2',sans-serif" font-weight="800" font-size="54" fill="${st.label}">${title}</text>`;
  s += `<text x="40" y="112" font-family="Montserrat,sans-serif" font-weight="600" font-size="20" fill="${st.label}" opacity="0.8">${sub}</text>`;
  s += `<g ${st.key === "A" ? `filter="url(#grain${st.key})"` : ""} transform="translate(-52 96) scale(1.02)">${body(st, EXPR.confident)}</g>`;
  s += `<rect y="878" width="${W}" height="${H - 878}" fill="${st.key === "A" ? "#25215C" : st.key === "B" ? "#fff" : "#fff"}"/>`;
  exprs.forEach((e, i) => {
    const cx = 110 + i * 200, cy = 1030;
    s += `<clipPath id="c${st.key}${i}"><circle cx="${cx}" cy="${cy}" r="92"/></clipPath><circle cx="${cx}" cy="${cy}" r="92" fill="${st.bg[0]}"/>`;
    s += `<g clip-path="url(#c${st.key}${i})"><g transform="translate(${cx - 306 * 0.74} ${cy - 205 * 0.74}) scale(0.74)">` +
      `<path d="M272,268 L270,340 L342,340 L340,268 Z" fill="${SKIN.base}"/><path d="M272,290 Q306,318 340,292 L340,268 L272,268 Z" fill="${SKIN.shade}" opacity="0.7"/>` +
      `<path d="M150,360 L270,322 Q305,358 342,322 L460,360 L460,460 L150,460 Z" fill="${TEE.base}"/><path d="M266,306 L296,350 L240,420 L150,460 L150,350 Z" fill="${SHIRT.base}"/><path d="M344,306 L318,350 L372,420 L460,460 L460,350 Z" fill="${SHIRT.base}"/>` +
      head(st, EXPR[e]) + `</g></g>`;
    s += `<text x="${cx}" y="${cy + 136}" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="700" font-size="22" fill="${st.key === "A" ? "#fff" : INK}">${e[0].toUpperCase() + e.slice(1)}</text>`;
  });
  s += `</g></svg>`;
  return s;
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Baloo 2';font-weight:800;src:url('file://${join(here, "..", "public/fonts/baloo-2-800.woff2")}')}
@font-face{font-family:Montserrat;font-weight:600;src:url('file://${join(here, "..", "public/fonts/montserrat-600.woff2")}')}
@font-face{font-family:Montserrat;font-weight:700;src:url('file://${join(here, "..", "public/fonts/montserrat-700.woff2")}')}
body{margin:0;background:#F4F1EC;padding:36px;display:flex;gap:30px;width:1920px}</style></head><body>
${panel(STYLES.A, "Option A", "Polished editorial · shaded planes · soft grain")}
${panel(STYLES.B, "Option B", "Playful cartoon hybrid · ink outline · cel shade")}
${panel(STYLES.C, "Option C", "Simple vector · flat shapes · minimal depth")}
</body></html>`;
writeFileSync(join(here, "options.html"), html);
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1992, height: 1322 }, deviceScaleFactor: 1 });
await p.goto("file://" + join(here, "options.html"));
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: join(here, "character-style-options.png"), fullPage: true });
await b.close();
console.log("written");
