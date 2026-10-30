// Dexterity brand system shared by every campaign composition.
export const COLOR = {
  orange: '#F37A20', navy: '#283C8D', navyDeep: '#141E4D', ink: '#0B1030', cream: '#FBF3E6', white: '#FFFFFF',
};
export const TYPE = {
  sans: "'DexJakarta', 'Plus Jakarta Sans', Helvetica, Arial, sans-serif", // OFL-1.1 (@fontsource/plus-jakarta-sans)
  serif: "'DexInstrument', 'Instrument Serif', Georgia, serif",            // OFL-1.1 (@fontsource/instrument-serif)
  display: "'DexBricolage', 'Bricolage Grotesque', sans-serif",          // OFL-1.1 Google Fonts build (@fontsource/bricolage-grotesque) – V3+
};
// 1080x1920 platform-safe area (TikTok / Reels / Shorts UI): keep text inside.
export const SAFE = { top: 240, bottom: 1490, left: 84, right: 996 };
/**
 * Contact details: VERIFIED SOURCE = the earlier Dexterity promotional video in this repository
 * (branch feature/dexterity-skit*, src/config/brand.ts, first added in commit d2ad658, reused in the
 * dexterity-motion-budapest compositions). Re-confirm with Dexterity before any paid placement.
 */
export const CONTACT = {
  phones: ['0244489721', '0303984034'],   // [0] mobile = primary CTA line; which number carries WhatsApp is NOT documented
  primaryLabel: 'Call or message',
  website: 'dexterityedutravel.com',
  source: 'feature/dexterity-skit · src/config/brand.ts (d2ad658)',
};
export const formatGhPhone = (p: string) => p.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3');
export const BRAND_NAME = 'Dexterity Education & Travel and Tour';
