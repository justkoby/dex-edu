import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../config/brand";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Dexterity end card (local frames). Stack stays above y≈1250 so the narrator's subtitles (bottom 1410) never collide:
 * logo -> headline -> supporting line -> WhatsApp action -> contacts.
 */
export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f - 4, fps, config: { damping: 14, stiffness: 110, mass: 0.9 } });
  const wipe = ease(interpolate(f, [6, 30], [0, 1], clamp));
  const shine = interpolate(f, [26, 52], [-0.3, 1.3], clamp);
  const head = ease(interpolate(f, [18, 40], [0, 1], clamp));
  const sub = ease(interpolate(f, [34, 56], [0, 1], clamp));
  const btn = spring({ frame: f - 88, fps, config: { damping: 10, stiffness: 150 } });
  const pulse = f > 112 ? 1 + Math.max(0, Math.sin((f - 112) / 7)) * 0.03 : 1;
  const info = ease(interpolate(f, [104, 128], [0, 1], clamp));
  const bg = interpolate(f, [0, 36], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(165deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`, fontFamily: BRAND.font, color: BRAND.white }}>
      <div style={{ position: "absolute", right: -280, top: 80, width: 760, height: 760, borderRadius: "50%", border: `70px solid ${BRAND.orange}`, opacity: 0.15 * bg, transform: `scale(${0.8 + 0.2 * bg}) rotate(${f * 0.12}deg)` }} />
      <div style={{ position: "absolute", left: -220, bottom: 480, width: 520, height: 520, borderRadius: "50%", border: `50px solid ${BRAND.white}`, opacity: 0.05 * bg }} />
      {/* logo card: spring in, left-to-right wipe, one light sweep */}
      <div style={{ position: "absolute", top: 270, left: 170, width: 740, height: 400, borderRadius: 48, background: BRAND.white, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,.4)", transform: `scale(${interpolate(logo, [0, 1], [0.7, 1])}) translateY(${interpolate(logo, [0, 1], [40, 0])}px)`, opacity: Math.min(1, logo * 2) }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
          <Img src={staticFile("logo.svg")} style={{ width: 520, height: "auto" }} />
        </div>
        <div style={{ position: "absolute", top: -40, bottom: -40, width: 120, left: `${shine * 100}%`, transform: "skewX(-18deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(243,122,32,.22), rgba(255,255,255,0))" }} />
      </div>
      <div style={{ position: "absolute", top: 715, left: 60, right: 60, textAlign: "center", opacity: head, transform: `translateY(${(1 - head) * 36}px)` }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 5, color: BRAND.orange }}>DEXTERITY EDUCATIONAL CONSULT</div>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.04, marginTop: 14, letterSpacing: -1 }}>YOUR NEXT CHAPTER STARTS HERE</div>
      </div>
      <div style={{ position: "absolute", top: 975, left: 60, right: 60, textAlign: "center", fontSize: 38, fontWeight: 500, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>
        Explore Study Opportunities in Hungary
      </div>
      <div style={{ position: "absolute", top: 1050, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${interpolate(btn, [0, 1], [0.6, 1]) * pulse})`, opacity: Math.min(1, btn * 1.6) }}>
        <div style={{ background: BRAND.orange, color: BRAND.white, fontWeight: 900, fontSize: 46, padding: "24px 54px", borderRadius: 999, boxShadow: "0 18px 40px rgba(243,122,32,.45)", letterSpacing: 1 }}>ENQUIRE ON WHATSAPP</div>
      </div>
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, textAlign: "center", opacity: info, transform: `translateY(${(1 - info) * 20}px)` }}>
        <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: 1 }}>{BRAND.phones[0]} <span style={{ color: BRAND.orange }}>·</span> {BRAND.phones[1]}</div>
        <div style={{ fontSize: 32, fontWeight: 500, marginTop: 6, opacity: 0.9 }}>{BRAND.websiteLabel}</div>
      </div>
    </AbsoluteFill>
  );
};
