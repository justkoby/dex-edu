import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CoverVideo, KenBurns, Scrim } from "../components/Media";
import { NameChip } from "../components/Chips";
import { Reveal } from "../components/Reveal";
import { LowerThird } from "../components/LowerThird";
import { TitleBurst } from "../components/TitleBurst";
import { wordSpan } from "../config/captions";
import { SCENES, sec } from "../config/timeline";

const base = sec(SCENES.s4.from);

/** FALLBACK Ama (still + Ken Burns) with real IBS / BMU footage cut in on the spoken names. */
export const Scene4Reveal: React.FC = () => {
  const ibsFrom = wordSpan("s4", "International").from - base - 2;
  const bmuFrom = wordSpan("s4", "Budapest").from - base - 2;
  const bmuTo = wordSpan("s4", "University").to - base + 8;
  const ibsDur = bmuFrom - ibsFrom + 12;
  const bmuDur = bmuTo - bmuFrom;
  return (
    <AbsoluteFill>
      <KenBurns src="media/ama_wave.jpg" duration={sec(10)} from={1.12} to={1.26} origin="50% 30%" panX={-30} />
      <Scrim />
      <NameChip name="Ama" place="Budapest, Hungary" delay={30} />
      <Sequence from={ibsFrom} durationInFrames={ibsDur}>
        <Reveal kind="circle" origin={[15, 70]} dur={16}>
          <CoverVideo src="media/ibs_students_a.mp4" startFrom={sec(1.5)} scale={1.25} origin="45% 60%" />
          <Scrim top={0.35} bottom={0.6} />
          <LowerThird label="Campus · Budapest" title="International Business School (IBS), Budapest" top={1040} dur={ibsDur} />
        </Reveal>
      </Sequence>
      <Sequence from={bmuFrom} durationInFrames={bmuDur}>
        <Reveal kind="wipe" dur={14}>
          <CoverVideo src="media/bmu_campus.mp4" startFrom={sec(1)} scale={1.3} origin="50% 55%" />
          <Scrim top={0.35} bottom={0.6} />
          <LowerThird label="Campus · Budapest" title="Budapest Metropolitan University" top={1040} dur={bmuDur} />
        </Reveal>
      </Sequence>
      <Sequence from={0} durationInFrames={50}>
        <TitleBurst dur={46} />
      </Sequence>
    </AbsoluteFill>
  );
};
