/**
 * Dexterity brand + contact details – the ONE place to edit them.
 *
 * Source: earlier Dexterity Educational Consult videos in this repository
 * (branches feature/dexterity-skit*, feature/dexterity-motion-budapest*: src/config/brand.ts) and Logo.svg at the repo root.
 *
 * !! WEBSITE NEEDS CLIENT CONFIRMATION !!
 *   - Educational-Consult videos (Budapest skit / motion):      dexterityedutravel.com
 *   - Heritage-tour campaign (claude/lucid-gauss-jxelbv, Nov 2026 "client update"): dexterityedutour.com
 * The draft shows the Educational-Consult address because this is a study-abroad video. Do not publish until confirmed.
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
  website: "dexterityedutravel.com",
  websiteConfirmed: false,
} as const;

/** Tuition as supplied in the brief – NOT independently verified. Confirm with each university before publishing. */
export const SCHOOLS = {
  srh: { name: "SRH Haarlem", sub: "University of Applied Sciences", city: "Haarlem", bachelor: "€9,950", master: "€12,500", color: "#E8500E" },
  witt: { name: "Wittenborg", sub: "University of Applied Sciences", city: "Apeldoorn", bachelor: "€9,250", master: "€12,250", color: "#1C3F94" },
} as const;

export const FONT = { display: "'Baloo 2', 'Trebuchet MS', sans-serif", body: "Montserrat, 'Helvetica Neue', Arial, sans-serif" };
export const W = 1080, H = 1920;
/** platform-safe area for 9:16 (TikTok / Reels / Shorts UI) */
export const SAFE = { top: 250, bottom: 1440, left: 60, right: 1000 };
