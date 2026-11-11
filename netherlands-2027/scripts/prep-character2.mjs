// Prepares the supplied Scene-1 character parts (../NETHERLANDS/SCENE-01-MONEY/*.svg – never modified) for animation.
// Each part is cropped to its own artwork bounds (no scaling, colours untouched), its CSS class names are namespaced so
// parts can sit in one page, and the eyes/brows are split into independently movable pieces.
// Output: public/character2/*.svg + src/character2/parts.json (natural size of every part).
// Run: NODE_PATH=$(npm root -g) node scripts/prep-character2.mjs   (needs Playwright's Chromium)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "..", "NETHERLANDS", "SCENE-01-MONEY");
const OUT = join(root, "public", "character2");
mkdirSync(OUT, { recursive: true }); mkdirSync(join(root, "src", "character2"), { recursive: true });

// name -> [source file, optional filter on the flat list of drawable elements (index, bbox) => keep?]
const cx = (b) => b.x + b.width / 2;
const IRIS_R = new Set([11, 13, 19, 20, 22, 23, 24]), IRIS_L = new Set([33, 38, 39, 40, 41, 43, 44]);
const PARTS = {
  head: ["blank_faced_cartoon_portrait_base.svg"],
  browL: ["bold_curved_cartoon_eyebrows.svg", (i, b) => cx(b) < 325],
  browR: ["bold_curved_cartoon_eyebrows.svg", (i, b) => cx(b) >= 325],
  eyeL: ["friendly_cartoon_eyes_on_transparent_background.svg", (i, b) => cx(b) < 473 && !IRIS_L.has(i)],
  eyeR: ["friendly_cartoon_eyes_on_transparent_background.svg", (i, b) => cx(b) >= 473 && !IRIS_R.has(i)],
  irisL: ["friendly_cartoon_eyes_on_transparent_background.svg", (i) => IRIS_L.has(i)],
  irisR: ["friendly_cartoon_eyes_on_transparent_background.svg", (i) => IRIS_R.has(i)],
  mouth: ["smiling_brown_cartoon_mouth.svg"],
  hair: ["curly_afro_fade_hair_cutout.svg"],
  torso: ["clean_vector_male_torso_base.svg"],
  polo: ["cream_and_navy_striped_polo_overlay.svg"],
  armPoint: ["pointing_arm_with_smartwatch.svg"],
  armPalm: ["open_palm_with_navy_smartwatch.svg"],
  reference: ["charcater-1.svg"],
};

const b = await chromium.launch(); const page = await b.newPage();
const meta = {};
for (const [name, [file, keep]] of Object.entries(PARTS)) {
  const svg = readFileSync(join(SRC, file), "utf8").replace(/<\?xml[^>]*\?>/, "").replace(/cls-(\d+)/g, `${name}-$1`).replace(/linear-gradient/g, `${name}-lg`);
  await page.setContent(`<body>${svg}</body>`);
  const res = await page.evaluate((keepSrc) => {
    const s = document.querySelector("svg"); const keep = keepSrc ? eval(keepSrc) : null;
    const IRIS_R = new Set([11, 13, 19, 20, 22, 23, 24]), IRIS_L = new Set([33, 38, 39, 40, 41, 43, 44]); const cx = (b) => b.x + b.width / 2;
    const els = [...s.querySelectorAll("path, circle, rect, polygon, ellipse")];
    if (keepSrc) { const f = eval(`(${keepSrc})`); els.forEach((e, i) => { if (!f(i, e.getBBox())) e.remove(); }); }
    const bb = s.getBBox(); const pad = 2;
    s.setAttribute("viewBox", [bb.x - pad, bb.y - pad, bb.width + pad * 2, bb.height + pad * 2].join(" "));
    s.setAttribute("width", bb.width + pad * 2); s.setAttribute("height", bb.height + pad * 2);
    return { svg: s.outerHTML, x: bb.x - pad, y: bb.y - pad, w: bb.width + pad * 2, h: bb.height + pad * 2, n: s.querySelectorAll("path, circle, rect").length };
  }, keep ? keep.toString() : null);
  writeFileSync(join(OUT, name + ".svg"), res.svg);
  meta[name] = { file, x: +res.x.toFixed(1), y: +res.y.toFixed(1), w: +res.w.toFixed(1), h: +res.h.toFixed(1), shapes: res.n };
  console.log(name.padEnd(10), file.padEnd(52), `${meta[name].w}×${meta[name].h} @ ${meta[name].x},${meta[name].y}`, `(${res.n} shapes)`);
}
await b.close();
writeFileSync(join(root, "src", "character2", "parts.json"), JSON.stringify(meta, null, 1));
