import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { KenBurns, Scrim, CoverVideo } from "../components/Media";
import { CallCard, Pip } from "../components/CallCard";
import { NameChip } from "../components/Chips";
import { Reveal } from "../components/Reveal";
import { SCENES, T, sec } from "../config/timeline";

/** FALLBACK: still image (Sunny Campus Video Call Wave.png) + Ken Burns — no Ama video clip exists. */
export const Scene2Ama: React.FC = () => {
  const f = useCurrentFrame();
  const len = sec(SCENES.s2.to - SCENES.s2.from);
  // after "oo!" the frame settles: a touch of desaturation + push (record-scratch beat), no flash
  const k = interpolate(f, [sec(T.E2 - T.C2 - 0.25), len], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Reveal kind="circle" origin={[16, 34]} dur={16} zoom={1.25}>
      <AbsoluteFill style={{ filter: `grayscale(${0.45 * k})` }}>
        <KenBurns src="media/ama_wave.jpg" duration={len} from={1.02} to={1.12} origin="50% 30%" extra={{ scale: 1 + 0.06 * k }} />
        <Scrim />
        <Pip top={500} fromFrame={4}>
          <CoverVideo src="media/kofi_call.mp4" startFrom={sec(2)} scale={1.4} origin="50% 40%" />
        </Pip>
      </AbsoluteFill>
      <NameChip name="Ama" place="Budapest, Hungary" delay={14} />
      <CallCard name="Kofi" avatar="media/kofi_avatar.jpg" base={sec(T.C2)} compact />
    </Reveal>
  );
};
