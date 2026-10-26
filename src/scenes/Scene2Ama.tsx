import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { KenBurns, Scrim, CoverVideo } from "../components/Media";
import { CallCard } from "../components/CallCard";
import { NameChip } from "../components/Chips";
import { Reveal } from "../components/Reveal";
import { SCENES, SFX, sec } from "../config/timeline";

/** FALLBACK: still image (Sunny Campus Video Call Wave.png) + Ken Burns — no Ama video clip exists. */
export const Scene2Ama: React.FC = () => {
  const f = useCurrentFrame();
  const freezeAt = sec(SFX.scratch.at - SCENES.s2.from);
  const frozen = f >= freezeAt;
  const k = interpolate(f, [freezeAt, freezeAt + 5], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Reveal kind="circle" origin={[85, 18]} dur={18}>
      <AbsoluteFill style={{ filter: frozen ? `grayscale(${0.7 * k}) contrast(${1 + 0.15 * k})` : undefined }}>
        <KenBurns src="media/ama_wave.jpg" duration={sec(5)} from={1.02} to={1.12} origin="50% 30%" extra={{ scale: 1 + 0.1 * k }} />
        <Scrim />
        {/* Kofi picture-in-picture (left, clear of Ama's face) */}
        <div style={{ position: "absolute", left: 60, top: 480, width: 230, height: 310, borderRadius: 28, overflow: "hidden", border: "4px solid #fff", boxShadow: "0 16px 40px rgba(0,0,0,.4)" }}>
          <CoverVideo src="media/kofi_call.mp4" startFrom={sec(2)} scale={1.4} origin="50% 40%" />
        </div>
      </AbsoluteFill>
      <NameChip name="Ama" place="Budapest, Hungary" delay={14} />
      <CallCard name="Kofi" avatar="media/kofi_avatar.jpg" connectAt={-sec(4.55)} />
    </Reveal>
  );
};
