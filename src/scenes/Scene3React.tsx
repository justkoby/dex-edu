import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CoverVideo, Scrim } from "../components/Media";
import { NameChip } from "../components/Chips";
import { shake } from "../components/Reveal";
import { BRAND } from "../config/brand";
import { SCENES, VOICE, sec } from "../config/timeline";

/** FALLBACK: no dedicated "surprised" clip — reuses the Kofi call clip (later segment) with a dramatic punch-in. */
export const Scene3React: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = spring({ frame: f, fps, config: { damping: 8, stiffness: 300, mass: 0.6 } });
  const line = f - sec(VOICE.s3.start - SCENES.s3.from); // second, harder punch when he shouts
  const punch2 = line >= 0 ? spring({ frame: line, fps, config: { damping: 10, stiffness: 260, mass: 0.6 } }) : 0;
  const scale = 1 + 0.38 * punch + 0.22 * punch2 + f * 0.0012;
  const s1 = shake(f, 22, 7);
  const s2 = line >= 0 ? shake(line, 30, 9) : { x: 0, y: 0 };
  const stamp = spring({ frame: line - 4, fps, config: { damping: 7, stiffness: 220, mass: 0.5 } });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <CoverVideo src="media/kofi_call.mp4" startFrom={sec(6.5)} scale={scale} x={s1.x + s2.x} y={s1.y + s2.y} origin="50% 33%" />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 38%, rgba(0,0,0,0) 38%, rgba(10,16,48,.75) 100%)" }} />
      <Scrim top={0.5} bottom={0.55} />
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 5], [0.85, 0], { extrapolateRight: "clamp" }) }} />
      <NameChip name="Kofi" place="Accra, Ghana" delay={4} />
      {line >= 0 && (
        <div
          style={{
            position: "absolute", right: 150, top: 420, fontFamily: BRAND.font, fontWeight: 900, fontSize: 210, color: BRAND.orange,
            WebkitTextStroke: `14px ${BRAND.navyDeep}`, paintOrder: "stroke fill", transform: `rotate(${12 - 10 * (1 - stamp)}deg) scale(${stamp})`, opacity: Math.min(1, stamp * 2),
          }}
        >
          ?!
        </div>
      )}
    </AbsoluteFill>
  );
};
