import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { getBoundingBox } from "@remotion/paths";
import { LOGO_PATHS, LOGO_VIEWBOX } from "./logoData";
import { C, clamp, expo } from "./tokens";

/**
 * The original Logo.svg paths (not redrawn) on a transparent canvas, animated piece by piece:
 * the orange mark rises glyph by glyph (left to right), the wordmark follows letter by letter.
 * On dark backgrounds the navy wordmark is shown in white (standard one-colour reversal); the orange stays #F37A20.
 * `reverse={false}` renders the true two-colour logo for light backgrounds.
 */
export const DexterityLogo: React.FC<{ width: number; at: number; reverse?: boolean }> = ({ width, at, reverse = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [, , vw, vh] = LOGO_VIEWBOX;
  const items = useMemo(() => {
    const withBox = LOGO_PATHS.map((p, i) => {
      const b = getBoundingBox(p.d);
      return { ...p, i, cx: (b.x1 + b.x2) / 2, cy: (b.y1 + b.y2) / 2, bottom: b.y2, line: b.y1 > 440 ? 2 : 1 };
    });
    const mark = withBox.filter((p) => p.fill === "orange").sort((a, b) => a.cx - b.cx).map((p, k) => ({ ...p, k }));
    const word = withBox.filter((p) => p.fill === "navy").sort((a, b) => a.line - b.line || a.cx - b.cx).map((p, k) => ({ ...p, k }));
    return { mark, word };
  }, []);
  const height = (width * vh) / vw;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${vw} ${vh}`} style={{ overflow: "visible", display: "block" }}>
      {items.mark.map((p) => {
        const s = spring({ frame: f - at - p.k * 3, fps, config: { damping: 16, stiffness: 120, mass: 0.9 } });
        return (
          <g key={p.i} opacity={Math.min(1, s * 2.2)} transform={`translate(${p.cx} ${p.bottom}) scale(1 ${0.55 + 0.45 * s}) translate(${-p.cx} ${-p.bottom}) translate(0 ${(1 - s) * 26})`}>
            <path d={p.d} fill={C.orange} />
          </g>
        );
      })}
      {items.word.map((p) => {
        const e = expo(interpolate(f, [at + 30 + p.k * 0.9, at + 44 + p.k * 0.9], [0, 1], clamp));
        return (
          <path key={p.i} d={p.d} fill={reverse ? C.white : C.navy} opacity={e} transform={`translate(${(1 - e) * -14} 0)`} />
        );
      })}
    </svg>
  );
};
