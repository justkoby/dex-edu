import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../config/brand";
import type { Chunk } from "../config/captions";

/**
 * Word-synced subtitles in absolute frames. Calm by default: each phrase fades/slides up a few px; the spoken word
 * turns orange (key phrases stay orange). Only `hero` chunks (the BUDAPEST?! moment) get a large slam.
 * Block bottom = `bottom` px from the TOP of the 1920 frame (default 1410 -> clear of the TikTok/IG UI zone).
 */
export const Captions: React.FC<{ chunks: Chunk[]; bottom?: number }> = ({ chunks, bottom = 1410 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = chunks.find((x) => frame >= x.from && frame < x.to);
  if (!c) return null;
  const local = frame - c.from;
  const outP = interpolate(frame, [c.to - 3, c.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const text = c.words.map((w) => w.text).join(" ");
  const base = c.hero ? 150 : 70;
  const size = c.hero ? Math.min(150, Math.floor(900 / (text.length * 0.8))) : Math.min(base, Math.floor(880 / Math.max(8, text.length * 0.7)));
  const inP = Easing.out(Easing.cubic)(interpolate(local, [0, 5], [0, 1], { extrapolateRight: "clamp" }));
  const slam = c.hero ? spring({ frame: local, fps, config: { damping: 9, stiffness: 260, mass: 0.6 } }) : 1;
  const stroke = Math.round(size * 0.15);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 1920 - bottom, pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 900, textAlign: "center", fontFamily: BRAND.font, fontWeight: 900, fontSize: size, lineHeight: 1.08,
          textTransform: "uppercase", letterSpacing: -1, opacity: inP * outP,
          transform: c.hero ? `scale(${interpolate(slam, [0, 1], [1.7, 1])}) rotate(${interpolate(slam, [0, 1], [-3, 0])}deg)` : `translateY(${(1 - inP) * 14}px)`,
        }}
      >
        {c.words.map((w, i) => {
          const spoken = frame >= w.from;
          const active = spoken && frame < w.to;
          const hot = w.accent || active || c.hero;
          return (
            <span
              key={i}
              style={{
                display: "inline-block", marginRight: "0.36em", color: hot ? BRAND.orange : BRAND.white,
                opacity: spoken || w.accent ? 1 : 0.6,
                WebkitTextStroke: `${stroke}px ${BRAND.navyDeep}`, paintOrder: "stroke fill",
                textShadow: `0 ${Math.round(size * 0.06)}px 0 ${BRAND.navyDeep}, 0 8px 26px rgba(0,0,0,.4)`,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
