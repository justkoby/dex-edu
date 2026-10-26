import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CoverVideo, Scrim } from "../components/Media";
import { CallCard, Pip } from "../components/CallCard";
import { NameChip } from "../components/Chips";
import { SCENES, T, sec } from "../config/timeline";

/** Kofi (real clip: Man_making_video_call) dials Ama; the call connects and Ama's window appears. */
export const Scene1Call: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, sec(SCENES.s1.to)], [1.02, 1.1], { easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill>
      <CoverVideo src="media/kofi_call.mp4" scale={push * 1.18} origin="50% 0%" />
      <Scrim />
      <NameChip name="Kofi" place="Accra, Ghana" delay={6} />
      <CallCard name="Ama" avatar="media/ama_wave.jpg" base={0} />
      <Pip fromFrame={sec(T.connectAt) + 14} top={500}>
        <Img src={staticFile("media/ama_wave.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
      </Pip>
    </AbsoluteFill>
  );
};
