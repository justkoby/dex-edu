import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, expo, type } from "./tokens";
import { FitText, MaskLine } from "./ui";

const FW = 940;

/** Simple chat-bubble-with-handset glyph (generic; not the WhatsApp trademark). */
const ChatIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 3.5a12.5 12.5 0 0 0-10.7 19L3.8 28.2l5.9-1.5A12.5 12.5 0 1 0 16 3.5z" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M11.6 10.4c.4-.5 1.1-.4 1.4.1l1 1.9c.2.4.1.8-.2 1.1l-.7.7c.9 1.7 2.2 3 3.9 3.9l.7-.7c.3-.3.7-.4 1.1-.2l1.9 1c.5.3.6 1 .1 1.4-.9 1-2.2 1.4-3.5 1-4-1.2-7-4.2-8.2-8.2-.4-1.3 0-2.6 1-3.5z" fill="#fff" />
  </svg>
);

/** Scene 5 — Dexterity end card. Everything sits between y=250 and y=1440 (platform safe area). */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = expo(interpolate(f, [0, 22], [0, 1], clamp));
  const plate = spring({ frame: f - 8, fps, config: { damping: 14, stiffness: 110, mass: 0.9 } });
  const wipe = expo(interpolate(f, [16, 40], [0, 1], clamp));
  const shine = interpolate(f, [30, 62], [-0.3, 1.3], clamp);
  const border = expo(interpolate(f, [22, 60], [0, 1], clamp));
  const btn = spring({ frame: f - 84, fps, config: { damping: 9, stiffness: 150 } });
  const pulse = f > 108 ? 1 + Math.max(0, Math.sin((f - 108) / 8)) * 0.025 : 1;
  const arrow = f > 100 ? (Math.sin((f - 100) / 7) + 1) * 8 : 0;
  const info = expo(interpolate(f, [104, 128], [0, 1], clamp));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${C.navy} 0%, ${C.navyDeep} 100%)`, overflow: "hidden" }}>
      {/* circles borrowed from the logo's rounded D */}
      <div style={{ position: "absolute", right: -300, top: 40, width: 800, height: 800, borderRadius: "50%", border: `72px solid ${C.orange}`, opacity: 0.16 * bg, transform: `scale(${0.7 + 0.3 * bg}) rotate(${f * 0.1}deg)` }} />
      <div style={{ position: "absolute", left: -240, bottom: 380, width: 560, height: 560, borderRadius: "50%", border: `52px solid ${C.white}`, opacity: 0.05 * bg }} />

      {/* logo plate */}
      <div
        style={{
          position: "absolute", left: 190, top: 270, width: 700, height: 380, background: C.offWhite, overflow: "hidden", boxShadow: "0 36px 80px rgba(0,0,0,.4)",
          transform: `scale(${interpolate(plate, [0, 1], [0.72, 1])}) translateY(${interpolate(plate, [0, 1], [50, 0])}px)`, opacity: Math.min(1, plate * 2),
        }}
      >
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
          <Img src={staticFile("logo.svg")} style={{ width: 470, height: "auto" }} />
        </div>
        <div style={{ position: "absolute", top: -40, bottom: -40, width: 110, left: `${shine * 100}%`, transform: "skewX(-18deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(243,122,32,.2), rgba(255,255,255,0))" }} />
        <svg width="700" height="380" style={{ position: "absolute", inset: 0 }}>
          <rect x="9" y="9" width="682" height="362" fill="none" stroke={C.orange} strokeWidth="5" strokeDasharray="2088" strokeDashoffset={2088 * (1 - border)} />
        </svg>
      </div>

      <div style={{ position: "absolute", left: 64, top: 680, width: FW }}>
        <MaskLine at={30} dur={14}><div style={{ ...type(30, 100, 800), color: C.orange, letterSpacing: 6 }}>STUDY OPPORTUNITIES IN HUNGARY</div></MaskLine>
        <div style={{ marginTop: 26 }}>
          <MaskLine at={38} dur={16}><FitText text="Let’s get you" width={FW} size={205} fill={C.white} /></MaskLine>
          <MaskLine at={46} dur={16} style={{ marginTop: 14 }}><FitText text="Started" width={FW} size={290} fill={C.white} /></MaskLine>
        </div>
      </div>

      {/* primary action */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center", transform: `scale(${interpolate(btn, [0, 1], [0.6, 1]) * pulse})`, opacity: Math.min(1, btn * 1.6) }}>
        <div style={{ background: C.orange, color: C.white, display: "flex", alignItems: "center", gap: 24, padding: "30px 54px", borderRadius: 999, boxShadow: "0 22px 50px rgba(243,122,32,.5)", ...type(54, 100, 800), letterSpacing: 1.5, lineHeight: 1 }}>
          <ChatIcon size={64} />
          ENQUIRE ON WHATSAPP
          <span style={{ display: "inline-block", transform: `translateX(${arrow}px)` }}>→</span>
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 1296, textAlign: "center", color: C.white, opacity: info, transform: `translateY(${(1 - info) * 20}px)` }}>
        <div style={{ ...type(50, 100, 800), letterSpacing: 1, lineHeight: 1.1 }}>0244489721 <span style={{ color: C.orange }}>·</span> 0303984034</div>
        <div style={{ ...type(34, 100, 600), letterSpacing: 1, textTransform: "none", marginTop: 8, opacity: 0.9 }}>dexterityedutravel.com</div>
      </div>
    </AbsoluteFill>
  );
};
