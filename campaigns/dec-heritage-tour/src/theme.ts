// Dexterity brand tokens (from Logo.svg) + typography
export const BRAND = { orange: '#f37a20', navy: '#283c8d', cream: '#fbf4e8', ink: '#0d1330' };
export const FONT = { serif: "'DexPlayfair', 'Playfair Display', Georgia, serif", sans: "'DexMontserrat', 'Montserrat', Helvetica, Arial, sans-serif" };
// Mobile safe area for 1080x1920 (platform UI overlays top ~220px and bottom ~420px, right rail ~140px)
export const SAFE = { left: 90, right: 150, top: 230, bottom: 430 };
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
