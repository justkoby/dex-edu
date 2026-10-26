import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { CoverVideo, Scrim } from "../components/Media";
import { CallCard } from "../components/CallCard";
import { NameChip } from "../components/Chips";
import { SFX, sec } from "../config/timeline";

/** Kofi (real clip: Man_making_video_call) dials Ama; call connects, then Kofi speaks. */
export const Scene1Call: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, sec(7)], [1.02, 1.1], { easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill>
      <CoverVideo src="media/kofi_call.mp4" scale={push * 1.18} origin="50% 0%" />
      <Scrim />
      <NameChip name="Kofi" place="Accra, Ghana" delay={6} />
      <CallCard name="Ama" avatar="media/ama_wave.jpg" connectAt={sec(SFX.connect.at)} />
    </AbsoluteFill>
  );
};
