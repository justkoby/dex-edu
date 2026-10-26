import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../config/brand";
import type { Chunk } from "../config/captions";

/**
 * Bold word-synced subtitles (absolute-frame driven). The block's bottom edge sits at `bottom`
 * px from the TOP of the 1920 frame -> default 1410, i.e. above the TikTok/IG UI zone (last 480 px).
 */
export const Captions: React.FC<{ chunks: Chunk[]; bottom?: number; tone?: "light" | "dark" }> = ({ chunks, bottom = 1410 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = chunks.findIndex((c, i) => frame >= c.from && frame < (chunks[i + 1]?.from ?? c.to + 6));
  if (idx < 0) return null;
  const c = chunks[idx];
  if (frame > c.to + 8) return null;
  const local = frame - c.from;
  const pop = spring({ frame: local, fps, config: { damping: 11, stiffness: 220, mass: 0.5 } });
  const chars = c.words.map((w) => w.text).join(" ").length;
  const size = Math.min(76, Math.floor(860 / Math.max(8, chars * 0.74)));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 1920 - bottom, pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 880, textAlign: "center", fontFamily: BRAND.font, fontWeight: 900, fontSize: size,
          lineHeight: 1.08, textTransform: "uppercase", letterSpacing: -1,
          transform: `scale(${interpolate(pop, [0, 1], [0.7, 1])}) rotate(${interpolate(pop, [0, 1], [-2, 0])}deg)`,
          opacity: interpolate(local, [0, 2], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {c.words.map((w, i) => {
          const active = frame >= w.from && frame < w.to + 1;
          const spoken = frame >= w.from;
          return (
            <span
              key={i}
              style={{
                display: "inline-block", marginRight: "0.4em",
                color: active ? BRAND.orange : BRAND.white,
                opacity: spoken ? 1 : 0.55,
                transform: active ? "scale(1.08)" : "scale(1)",
                WebkitTextStroke: `${Math.round(size * 0.16)}px ${BRAND.navyDeep}`,
                paintOrder: "stroke fill",
                textShadow: `0 ${Math.round(size * 0.07)}px 0 ${BRAND.navyDeep}, 0 8px 28px rgba(0,0,0,.45)`,
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
