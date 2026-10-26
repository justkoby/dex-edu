import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, expo, inOut, type, wipeClip } from "./tokens";
import { DexterityLogo } from "./DexterityLogo";
import { FitText, MaskLine } from "./ui";

const FW = 952;

/** Generic chat-bubble-with-handset glyph (not the WhatsApp trademark). */
const ChatIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 3.5a12.5 12.5 0 0 0-10.7 19L3.8 28.2l5.9-1.5A12.5 12.5 0 1 0 16 3.5z" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M11.6 10.4c.4-.5 1.1-.4 1.4.1l1 1.9c.2.4.1.8-.2 1.1l-.7.7c.9 1.7 2.2 3 3.9 3.9l.7-.7c.3-.3.7-.4 1.1-.2l1.9 1c.5.3.6 1 .1 1.4-.9 1-2.2 1.4-3.5 1-4-1.2-7-4.2-8.2-8.2-.4-1.3 0-2.6 1-3.5z" fill="#fff" />
  </svg>
);

/**
 * Scene 5 — end card. Reading order: logo -> message -> WhatsApp action -> contacts. Everything sits between y=270 and
 * y=1400 (platform safe area); the stack is built so the last element lands ~4.3 s in and the card then holds.
 */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wipe = inOut(interpolate(f, [0, 16], [0, 1], clamp));
  const ring = expo(interpolate(f, [4, 50], [0, 1], clamp));
  const btn = spring({ frame: f - 100, fps, config: { damping: 10, stiffness: 150 } });
  const pulse = f > 130 ? 1 + Math.max(0, Math.sin((f - 130) / 9)) * 0.02 : 1;
  const arrow = f > 118 ? (Math.sin((f - 118) / 8) + 1) * 7 : 0;
  const info = expo(interpolate(f, [124, 148], [0, 1], clamp));
  const site = expo(interpolate(f, [134, 156], [0, 1], clamp));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${C.navy} 0%, ${C.navyDeep} 100%)`, clipPath: wipeClip(wipe, 10), overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -300, top: 60, width: 820, height: 820, borderRadius: "50%", border: `74px solid ${C.orange}`, opacity: 0.14 * ring, transform: `scale(${0.75 + 0.25 * ring}) rotate(${f * 0.08}deg)` }} />
      <div style={{ position: "absolute", left: -260, bottom: 320, width: 560, height: 560, borderRadius: "50%", border: `52px solid ${C.white}`, opacity: 0.045 * ring }} />

      {/* 1 — logo, directly on the navy field */}
      <div style={{ position: "absolute", left: (1080 - 600) / 2, top: 290 }}>
        <DexterityLogo width={600} at={10} />
      </div>

      {/* 2 — message */}
      <div style={{ position: "absolute", left: 64, top: 720, width: FW }}>
        <MaskLine at={62} dur={14}><div style={{ ...type(30, 100, 800), color: C.orange, letterSpacing: 6 }}>STUDY OPPORTUNITIES IN HUNGARY</div></MaskLine>
        <div style={{ marginTop: 28 }}>
          <MaskLine at={70} dur={16}><FitText text="Let’s get you" width={FW} size={170} fill={C.white} /></MaskLine>
          <MaskLine at={78} dur={16} style={{ marginTop: 12 }}><FitText text="Started" width={FW} size={250} fill={C.white} /></MaskLine>
        </div>
      </div>

      {/* 3 — primary action */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1112, display: "flex", justifyContent: "center", transform: `scale(${interpolate(btn, [0, 1], [0.6, 1]) * pulse})`, opacity: Math.min(1, btn * 1.6) }}>
        <div style={{ background: C.orange, color: C.white, display: "flex", alignItems: "center", gap: 22, padding: "30px 52px", borderRadius: 999, boxShadow: "0 22px 50px rgba(243,122,32,.45)", ...type(52, 100, 800), letterSpacing: 1.5, lineHeight: 1 }}>
          <ChatIcon size={62} />
          ENQUIRE ON WHATSAPP
          <span style={{ display: "inline-block", transform: `translateX(${arrow}px)` }}>→</span>
        </div>
      </div>

      {/* 4 — contacts */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1296, textAlign: "center", color: C.white }}>
        <div style={{ ...type(50, 100, 800), letterSpacing: 1, lineHeight: 1.1, opacity: info, transform: `translateY(${(1 - info) * 18}px)` }}>0244489721 <span style={{ color: C.orange }}>·</span> 0303984034</div>
        <div style={{ ...type(34, 100, 600), letterSpacing: 1, textTransform: "none", marginTop: 12, opacity: 0.92 * site, transform: `translateY(${(1 - site) * 14}px)` }}>dexterityedutravel.com</div>
      </div>
    </AbsoluteFill>
  );
};
