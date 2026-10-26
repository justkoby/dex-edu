import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../config/brand";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Dexterity end card. Content stays above y=1250 until the narration (and its subtitles) end. */
export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f - 8, fps, config: { damping: 11, stiffness: 120, mass: 0.8 } });
  const head = ease(interpolate(f, [26, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const btn = spring({ frame: f - 74, fps, config: { damping: 9, stiffness: 160 } });
  const pulse = 1 + Math.max(0, Math.sin((f - 90) / 6)) * 0.035 * (f > 90 ? 1 : 0);
  const info = ease(interpolate(f, [96, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const note = interpolate(f, [150, 162], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bg = interpolate(f, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(165deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`, fontFamily: BRAND.font, color: BRAND.white }}>
      {/* geometric accents echoing the logo's rounded D */}
      <div style={{ position: "absolute", right: -260, top: 120, width: 760, height: 760, borderRadius: "50%", border: `70px solid ${BRAND.orange}`, opacity: 0.16 * bg, transform: `scale(${0.8 + 0.2 * bg}) rotate(${f * 0.15}deg)` }} />
      <div style={{ position: "absolute", left: -200, bottom: 520, width: 520, height: 520, borderRadius: "50%", border: `50px solid ${BRAND.white}`, opacity: 0.06 * bg }} />
      <div
        style={{
          position: "absolute", top: 290, left: 150, width: 780, height: 460, borderRadius: 48, background: BRAND.white,
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 40px 90px rgba(0,0,0,.4)",
          transform: `scale(${interpolate(logo, [0, 1], [0.6, 1])}) rotate(${interpolate(logo, [0, 1], [-6, 0])}deg)`, opacity: Math.min(1, logo * 1.5),
        }}
      >
        <Img src={staticFile("logo.svg")} style={{ width: 560, height: "auto" }} />
      </div>
      <div style={{ position: "absolute", top: 800, left: 60, right: 60, textAlign: "center", opacity: head, transform: `translateY(${(1 - head) * 40}px)` }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 5, color: BRAND.orange }}>DEXTERITY EDUCATIONAL CONSULT</div>
        <div style={{ fontSize: 66, fontWeight: 900, lineHeight: 1.08, marginTop: 14 }}>Your next chapter could start in Hungary.</div>
      </div>
      <div style={{ position: "absolute", top: 1085, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${interpolate(btn, [0, 1], [0.5, 1]) * pulse})`, opacity: Math.min(1, btn * 1.6) }}>
        <div style={{ background: BRAND.orange, color: BRAND.white, fontWeight: 900, fontSize: 48, padding: "26px 56px", borderRadius: 999, boxShadow: "0 18px 40px rgba(243,122,32,.45)" }}>WhatsApp Dexterity today!</div>
      </div>
      <div style={{ position: "absolute", top: 1215, left: 0, right: 0, textAlign: "center", opacity: info, transform: `translateY(${(1 - info) * 24}px)` }}>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: 1 }}>{BRAND.phones[0]} <span style={{ color: BRAND.orange }}>·</span> {BRAND.phones[1]}</div>
        <div style={{ fontSize: 34, fontWeight: 500, marginTop: 8, opacity: 0.9 }}>{BRAND.websiteLabel}</div>
      </div>
      <div style={{ position: "absolute", top: 1380, left: 80, right: 80, textAlign: "center", fontSize: 24, fontWeight: 500, opacity: 0.7 * note, letterSpacing: 0.5 }}>
        Illustrative skit — Kofi and Ama are fictional characters.
      </div>
    </AbsoluteFill>
  );
};
