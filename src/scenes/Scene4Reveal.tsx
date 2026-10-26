import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile } from "remotion";
import { CoverVideo, KenBurns, Scrim } from "../components/Media";
import { CallCard, Pip } from "../components/CallCard";
import { NameChip } from "../components/Chips";
import { Reveal } from "../components/Reveal";
import { LowerThird } from "../components/LowerThird";
import { TitleBurst } from "../components/TitleBurst";
import { wordSpan } from "../config/captions";
import { SCENES, T, sec } from "../config/timeline";

const base = sec(SCENES.s4.from);

/** Budapest reveal over real footage, then IBS / BMU cutaways on the spoken names; Ama's still returns for her closing lines. */
export const Scene4Reveal: React.FC = () => {
  const ibsFrom = wordSpan("s4_schools", "International").from - base - 3;
  const ibsTo = wordSpan("s4_schools", "and").from - base + 2;
  const bmuFrom = ibsTo - 4;
  const bmuTo = wordSpan("s4_schools", "University").to - base + 14;
  const len = sec(SCENES.s4.to - SCENES.s4.from);
  return (
    <AbsoluteFill>
      {/* Ama (fallback still) */}
      <KenBurns src="media/ama_wave.jpg" duration={len} from={1.1} to={1.24} origin="50% 30%" panX={-26} />
      <Scrim />
      {/* Budapest reveal: Parliament dome, camera pulls back into the title burst */}
      <Sequence from={0} durationInFrames={ibsFrom + 12}>
        <Reveal kind="none">
          <CoverVideo src="media/budapest_parliament.mp4" startFrom={sec(1)} scale={1.12} origin="50% 60%" />
          <Scrim top={0.4} bottom={0.5} />
        </Reveal>
        <TitleBurst dur={Math.min(40, ibsFrom + 6)} />
      </Sequence>
      <Sequence from={ibsFrom} durationInFrames={ibsTo - ibsFrom + 14}>
        <Reveal kind="circle" origin={[16, 34]} dur={14}>
          <CoverVideo src="media/ibs_students_a.mp4" startFrom={sec(1.5)} scale={1.25} origin="45% 60%" />
          <Scrim top={0.35} bottom={0.6} />
          <LowerThird label="Campus · Budapest" title="International Business School (IBS), Budapest" top={1010} dur={ibsTo - ibsFrom + 14} />
        </Reveal>
      </Sequence>
      <Sequence from={bmuFrom} durationInFrames={bmuTo - bmuFrom}>
        <Reveal kind="wipe" dur={14}>
          <CoverVideo src="media/bmu_campus.mp4" startFrom={sec(1)} scale={1.3} origin="50% 55%" />
          <Scrim top={0.35} bottom={0.6} />
          <LowerThird label="Campus · Budapest" title="Budapest Metropolitan University" top={1010} dur={bmuTo - bmuFrom} />
        </Reveal>
      </Sequence>
      <NameChip name="Ama" place="Budapest, Hungary" delay={ibsFrom + 20} />
      <CallCard name="Ama" avatar="media/ama_wave.jpg" base={base} compact endAt={T.E4 - 0.75} />
      {/* Ama stays on screen as a call window while the footage plays */}
      <Sequence from={ibsFrom + 4} durationInFrames={bmuTo - ibsFrom - 4}>
        <Pip top={500} fromFrame={0}>
          <Img src={staticFile("media/ama_wave.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
        </Pip>
      </Sequence>
    </AbsoluteFill>
  );
};
