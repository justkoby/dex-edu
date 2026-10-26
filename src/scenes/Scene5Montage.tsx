import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { CoverVideo, Scrim } from "../components/Media";
import { LowerThird } from "../components/LowerThird";
import { Reveal, RevealKind } from "../components/Reveal";
import { BRAND } from "../config/brand";

type Shot = { src: string; start: number; len: number; kind: RevealKind; origin?: [number, number]; from: number; title?: [string, string]; step?: [string, string] };
const OVERLAP = 16;

const SHOTS: Shot[] = [
  { src: "media/budapest_parliament.mp4", start: 0, len: 62, kind: "circle", origin: [50, 50], from: 0, title: ["City · Budapest", "Budapest, Hungary"] },
  { src: "media/ibs_students_a.mp4", start: 62, len: 58, kind: "wipe", from: 90, title: ["Study option", "International Business School (IBS), Budapest"] },
  { src: "media/bmu_campus.mp4", start: 120, len: 58, kind: "bars", from: 150, title: ["Study option", "Budapest Metropolitan University"] },
  { src: "media/ibs_group.mp4", start: 178, len: 48, kind: "circle", origin: [80, 30], from: 210, step: ["01", "Explore your options"] },
  { src: "media/budapest_statue.mp4", start: 226, len: 44, kind: "wipe", from: 60, step: ["02", "Application guidance"] },
];

const Step: React.FC<{ n: string; text: string }> = ({ n, text }) => {
  const f = useCurrentFrame();
  const p = Easing.bezier(0.16, 1, 0.3, 1)(interpolate(f, [4, 20], [0, 1], { extrapolateRight: "clamp" }));
  return (
    <div style={{ position: "absolute", left: 60, top: 1050, display: "flex", alignItems: "center", gap: 20, fontFamily: BRAND.font, opacity: p, transform: `translateX(${(1 - p) * -80}px)` }}>
      <div style={{ background: BRAND.orange, color: "#fff", fontWeight: 900, fontSize: 44, width: 84, height: 84, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
      <div style={{ background: "rgba(23,35,90,.94)", color: "#fff", fontWeight: 800, fontSize: 44, padding: "18px 32px", borderRadius: 22 }}>{text}</div>
    </div>
  );
};

/** Real footage montage: Budapest city + IBS + BMU, with masked reveals and slow zoom per shot. */
export const Scene5Montage: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.navyDeep }}>
    {SHOTS.map((s, i) => {
      const dur = s.len + (i < SHOTS.length - 1 ? OVERLAP : 0);
      return (
        <Sequence key={i} from={s.start} durationInFrames={dur}>
          <Reveal kind={i === 0 ? "none" : s.kind} origin={s.origin} dur={OVERLAP}>
            <ShotBody shot={s} dur={dur} />
          </Reveal>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

const ShotBody: React.FC<{ shot: Shot; dur: number }> = ({ shot, dur }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], [1.0, 1.14]);
  return (
    <AbsoluteFill>
      <CoverVideo src={shot.src} startFrom={shot.from} scale={z} />
      <Scrim top={0.3} bottom={0.55} />
      {shot.title && <LowerThird label={shot.title[0]} title={shot.title[1]} top={1010} dur={dur} />}
      {shot.step && <Step n={shot.step[0]} text={shot.step[1]} />}
    </AbsoluteFill>
  );
};
