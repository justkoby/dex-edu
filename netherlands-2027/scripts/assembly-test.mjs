// Quick static check of src/character2/layout.json: draws the assembled parts beside the supplied reference.
// usage: NODE_PATH=$(npm root -g) node scripts/assembly-test.mjs out/assembly.png
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const L = JSON.parse(readFileSync(join(root, "src/character2/layout.json"), "utf8"));
const P = JSON.parse(readFileSync(join(root, "src/character2/parts.json"), "utf8"));
const order = (process.env.ORDER || "torso,head,polo,armPalm,armPoint,hair,eyeL,eyeR,irisL,irisR,browL,browR,mouth").split(",");
const img = (n) => `<img src="file://${root}/public/character2/${n}.svg" style="position:absolute;left:${L[n].x}px;top:${L[n].y}px;width:${P[n].w * L[n].s}px;height:${P[n].h * L[n].s}px">`;
const k = 0.6;
const html = `<body style="margin:0;background:#EEF0FF;display:flex">
<div style="width:${1250 * k}px;height:${1900 * k}px;position:relative;overflow:hidden"><div style="position:absolute;left:${300 * k}px;top:${110 * k}px;transform:scale(${k});transform-origin:0 0">${order.map(img).join("")}</div></div>
<img src="file://${root}/public/character2/reference.svg" style="height:${1900 * k}px;background:#fff"></body>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: Math.round(1900 * k) } });
writeFileSync(join(root, "out/assembly.html"), html); await p.goto("file://" + join(root, "out/assembly.html")); await p.waitForTimeout(400); await p.screenshot({ path: process.argv[2] || "out/assembly.png" }); await b.close();
