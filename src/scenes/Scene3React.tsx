import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CoverVideo, Scrim } from "../components/Media";
import { NameChip } from "../components/Chips";
import { shake } from "../components/Reveal";
import { T, sec } from "../config/timeline";

/** FALLBACK: no dedicated "surprised" clip — Kofi's call clip (later segment) with a controlled punch-in. */
export const Scene3React: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = spring({ frame: f, fps, config: { damping: 12, stiffness: 220, mass: 0.7 } });
  const line = f - sec(T.V3 - T.C3); // second, smaller push when he speaks
  const punch2 = line >= 0 ? spring({ frame: line, fps, config: { damping: 14, stiffness: 200, mass: 0.7 } }) : 0;
  const scale = 1 + 0.3 * punch + 0.12 * punch2 + f * 0.0009;
  const s1 = shake(f, 14, 6);
  const s2 = line >= 0 ? shake(line, 10, 7) : { x: 0, y: 0 };
  // soft exposure kick instead of a white flash
  const kick = interpolate(f, [0, 6], [1.18, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: `brightness(${kick})` }}>
        <CoverVideo src="media/kofi_call.mp4" startFrom={sec(6.5)} scale={scale} x={s1.x + s2.x} y={s1.y + s2.y} origin="50% 33%" />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 38%, rgba(0,0,0,0) 40%, rgba(10,16,48,.7) 100%)" }} />
      <Scrim top={0.5} bottom={0.55} />
      <NameChip name="Kofi" place="Accra, Ghana" delay={4} />
    </AbsoluteFill>
  );
};
