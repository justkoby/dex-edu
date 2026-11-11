import { continueRender, delayRender, staticFile } from "remotion";

// Baloo 2 + Montserrat (both OFL-1.1, copied from @fontsource by `npm run prep`)
const faces: [string, number, string][] = [
  ...[500, 600, 700, 800].map((w) => ["Baloo 2", w, `fonts/baloo-2-${w}.woff2`] as [string, number, string]),
  ...[500, 600, 700, 800].map((w) => ["Montserrat", w, `fonts/montserrat-${w}.woff2`] as [string, number, string]),
];
let started = false;
export const loadFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("fonts");
  Promise.all(faces.map(([family, weight, file]) => {
    const f = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, { weight: String(weight) });
    return f.load().then((l) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(l));
  })).then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); });
};
