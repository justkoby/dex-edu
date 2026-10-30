import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';
const FACES: [string, string, string, string][] = [
  ['DexJakarta', 'fonts/plus-jakarta-sans-latin-500-normal.woff2', '500', 'normal'],
  ['DexJakarta', 'fonts/plus-jakarta-sans-latin-600-normal.woff2', '600', 'normal'],
  ['DexJakarta', 'fonts/plus-jakarta-sans-latin-700-normal.woff2', '700', 'normal'],
  ['DexJakarta', 'fonts/plus-jakarta-sans-latin-800-normal.woff2', '800', 'normal'],
  ['DexInstrument', 'fonts/instrument-serif-latin-400-normal.woff2', '400', 'normal'],
  ['DexInstrument', 'fonts/instrument-serif-latin-400-italic.woff2', '400', 'italic'],
  // Bricolage Grotesque (Google Fonts build via @fontsource, OFL-1.1) – V3 campaign typeface
  ['DexBricolage', 'fonts/bricolage-grotesque-latin-500-normal.woff2', '500', 'normal'],
  ['DexBricolage', 'fonts/bricolage-grotesque-latin-600-normal.woff2', '600', 'normal'],
  ['DexBricolage', 'fonts/bricolage-grotesque-latin-700-normal.woff2', '700', 'normal'],
  ['DexBricolage', 'fonts/bricolage-grotesque-latin-800-normal.woff2', '800', 'normal'],
];
let started = false;
export const loadKitFonts = () => {
  if (started) return; started = true;
  const h = delayRender('kit-fonts');
  Promise.all(FACES.map(([fam, file, weight, style]) => new FontFace(fam, `url(${staticFile(file)})`, { weight, style }).load().then((f) => document.fonts.add(f))))
    .then(() => {
      // fail the render loudly rather than silently falling back to a system font
      for (const w of ['500', '600', '700', '800']) if (!document.fonts.check(`${w} 64px DexBricolage`)) throw new Error(`Bricolage ${w} not loaded`);
      continueRender(h);
    }).catch((e) => cancelRender(e));
};
