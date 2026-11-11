// Builds public/img + public/brand + public/fonts from the ORIGINAL assets (which are never modified).
// Run: npm run prep   (needs ffmpeg on PATH for the avif/webp conversions)
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const NL = join(root, "..", "NETHERLANDS");
const pub = (p) => join(root, "public", p);
for (const d of ["img", "brand", "fonts"]) mkdirSync(pub(d), { recursive: true });

const ff = (src, dst, vf) => execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, ...(vf ? ["-vf", vf] : []), "-q:v", "3", dst]);

// scenery / campus photography (see docs/ASSETS.md for what each one is)
ff(join(NL, "1653453937phpBFbQY7.jpeg"), pub("img/haarlem-canal.jpg"));
ff(join(NL, "csm_Cover_Print_2x_gradient_print_edited__1___1__3d5e7c03c6.webp"), pub("img/haarlem-square-students.jpg"));
ff(join(NL, "HaarlemCampus2.jpg"), pub("img/srh-haarlem-campus.jpg"), "scale=1400:-2");
ff(join(NL, "ssh.jpg"), pub("img/srh-haarlem-atrium.jpg"));
ff(join(NL, "brive-new-wittenborg-university-of-applied-sciences-top-banner.jpg"), pub("img/wittenborg-building.jpg"));
ff(join(NL, "wittenborg.jpg"), pub("img/wittenborg-students.jpg"));
ff(join(NL, "73 Wittenborg University of Business and Management.jpg.webp"), pub("img/wittenborg-entrance.jpg"));
// logos
ff(join(NL, "1712850135_srh_logo_srgb_orange_150dpi-2.v1.avif"), pub("brand/srh-logo.png"));
copyFileSync(join(NL, "wittenborg.svg"), pub("brand/wittenborg-logo.svg"));
copyFileSync(join(root, "..", "Logo.svg"), pub("brand/dexterity-logo.svg"));
// character reference (used by the docs / Studio reference overlay only – the animated character is the vector rig)
copyFileSync(join(NL, "Ghanaian Character Expressions and Poses.png"), pub("img/character-reference.png"));
// fonts (OFL-1.1, via @fontsource)
for (const w of [500, 600, 700, 800]) copyFileSync(join(root, `node_modules/@fontsource/baloo-2/files/baloo-2-latin-${w}-normal.woff2`), pub(`fonts/baloo-2-${w}.woff2`));
for (const w of [500, 600, 700, 800]) copyFileSync(join(root, `node_modules/@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff2`), pub(`fonts/montserrat-${w}.woff2`));
console.log("media prepared");
