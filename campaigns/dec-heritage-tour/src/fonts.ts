import { continueRender, delayRender, staticFile } from 'remotion';
const faces: [string, string, string, string][] = [
  ['DexPlayfair', 'fonts/playfair-display-latin-700-italic.woff2', '700', 'italic'],
  ['DexPlayfair', 'fonts/playfair-display-latin-600-normal.woff2', '600', 'normal'],
  ['DexMontserrat', 'fonts/montserrat-latin-500-normal.woff2', '500', 'normal'],
  ['DexMontserrat', 'fonts/montserrat-latin-600-normal.woff2', '600', 'normal'],
  ['DexMontserrat', 'fonts/montserrat-latin-700-normal.woff2', '700', 'normal'],
];
let started = false;
export const loadFonts = () => {
  if (started) return; started = true;
  const h = delayRender('fonts');
  Promise.all(faces.map(([family, file, weight, style]) => new FontFace(family, `url(${staticFile(file)})`, { weight, style }).load().then((f) => document.fonts.add(f))))
    .then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};
