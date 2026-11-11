/**
 * Dexterity brand + contact details – the ONE place to edit them.
 *
 * Client decisions (review of draft v1):
 *   - Name on screen: "Dexterity Educational Consult" (matches the voice-over). Study-abroad branding only – keep the tour brand separate.
 *   - Website: dexterityeduconsult.com – PROVISIONAL, to be confirmed before publishing (websiteConfirmed = false).
 *   - Phones: from the earlier study-abroad videos (feature/dexterity-skit*, feature/dexterity-motion-budapest*: src/config/brand.ts).
 *     Both of those projects carry the same two numbers; no newer approved asset contradicts them. Re-confirm before publishing.
 */
export const BRAND = {
  name: "Dexterity Educational Consult",
  navy: "#283C8D",
  navyDeep: "#17235A",
  orange: "#F37A20",
  yellow: "#FDC418", // from the character reference sheet
  cream: "#FBF3E6",
  ink: "#0D1330",
  phones: ["024 448 9721", "030 398 4034"], // 0244489721, 0303984034 – which one carries WhatsApp is not documented
  website: "dexterityeduconsult.com", // PROVISIONAL
  websiteConfirmed: false,
} as const;

/**
 * PROVISIONAL – NOT VERIFIED. Tuition as supplied in the brief; the client notes these differ from the universities' publicly
 * listed fees. Edit the four figures here (nothing else needs touching) and get final client confirmation before publishing.
 * `city` is left generic for Wittenborg on purpose: it has several locations (Apeldoorn, Amsterdam, …) – confirm which to show.
 */
export const TUITION_CONFIRMED = false;
export const SCHOOLS = {
  srh: { name: "SRH Haarlem", sub: "University of Applied Sciences", city: "Haarlem", bachelor: "€9,950", master: "€12,500", color: "#E8500E" },
  witt: { name: "Wittenborg", sub: "University of Applied Sciences", city: "Netherlands", bachelor: "€9,250", master: "€12,250", color: "#1C3F94" },
} as const;

export const FONT = { display: "'Baloo 2', 'Trebuchet MS', sans-serif", body: "Montserrat, 'Helvetica Neue', Arial, sans-serif" };
export const W = 1080, H = 1920;
/** platform-safe area for 9:16 (TikTok / Reels / Shorts UI) */
export const SAFE = { top: 250, bottom: 1440, left: 60, right: 1000 };
