import { continueRender, delayRender, staticFile } from 'remotion';
const FACES: [string, string, string, string][] = [
  ['DexJakarta', 'fonts/plus-jakarta-sans-latin-500-normal.woff2', '500', 'normal'],
  ['DexJakarta', 'fonts/plus-jakarta-sans-latin-600-normal.woff2', '600', 'normal'],
  ['DexJakarta', 'fonts/plus-jakarta-sans-latin-700-normal.woff2', '700', 'normal'],
  ['DexJakarta', 'fonts/plus-jakarta-sans-latin-800-normal.woff2', '800', 'normal'],
  ['DexInstrument', 'fonts/instrument-serif-latin-400-normal.woff2', '400', 'normal'],
  ['DexInstrument', 'fonts/instrument-serif-latin-400-italic.woff2', '400', 'italic'],
];
let started = false;
export const loadKitFonts = () => {
  if (started) return; started = true;
  const h = delayRender('kit-fonts');
  Promise.all(FACES.map(([fam, file, weight, style]) => new FontFace(fam, `url(${staticFile(file)})`, { weight, style }).load().then((f) => document.fonts.add(f))))
    .then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};
