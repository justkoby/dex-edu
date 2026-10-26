import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate } from "remotion";
import { staticFile } from "remotion";
import { BRAND } from "./config/brand";
import { CAPTIONS } from "./config/captions";
import { SCENES, SFX, TOTAL_FRAMES, VOICE, sec } from "./config/timeline";
import { Captions } from "./components/Captions";
import { Reveal } from "./components/Reveal";
import { EndCard } from "./components/EndCard";
import { useBrandFonts } from "./components/fonts";
import { Scene1Call } from "./scenes/Scene1Call";
import { Scene2Ama } from "./scenes/Scene2Ama";
import { Scene3React } from "./scenes/Scene3React";
import { Scene4Reveal } from "./scenes/Scene4Reveal";
import { Scene5Montage } from "./scenes/Scene5Montage";

const TAIL = 18; // each scene keeps rendering under the next scene's masked reveal

const scenes: { key: keyof typeof SCENES; node: React.ReactNode; reveal: React.ComponentProps<typeof Reveal> | null }[] = [
  { key: "s1", node: <Scene1Call />, reveal: null },
  { key: "s2", node: <Scene2Ama />, reveal: null }, // Scene2 owns its circle reveal
  { key: "s3", node: <Scene3React />, reveal: { kind: "none", dur: 1, children: null } },
  { key: "s4", node: <Scene4Reveal />, reveal: { kind: "bars", dur: 14, children: null } },
  { key: "s5", node: <Scene5Montage />, reveal: { kind: "circle", dur: 18, origin: [50, 45], children: null } },
  { key: "s6", node: <EndCard />, reveal: { kind: "wipe", dur: 18, children: null } },
];

const Voice: React.FC<{ k: keyof typeof VOICE }> = ({ k }) => (
  <Sequence from={sec(VOICE[k].start)} durationInFrames={sec(VOICE[k].dur) + 4}>
    <Audio src={staticFile(VOICE[k].file)} volume={(n) => interpolate(n, [0, 2, sec(VOICE[k].dur) - 1, sec(VOICE[k].dur) + 3], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
  </Sequence>
);

const Sfx: React.FC<{ file: string; at: number; volume?: number }> = ({ file, at, volume = 0.7 }) => (
  <Sequence from={sec(at)}>
    <Audio src={staticFile(file)} volume={volume} />
  </Sequence>
);

export const Skit: React.FC = () => {
  useBrandFonts();
  return (
    <AbsoluteFill style={{ background: BRAND.navyDeep, fontFamily: BRAND.font }}>
      {scenes.map(({ key, node, reveal }, i) => {
        const from = sec(SCENES[key].from);
        const to = i === scenes.length - 1 ? TOTAL_FRAMES : sec(SCENES[key].to) + TAIL;
        return (
          <Sequence key={key} from={from} durationInFrames={to - from}>
            {reveal ? <Reveal kind={reveal.kind} dur={reveal.dur} origin={reveal.origin}>{node}</Reveal> : node}
          </Sequence>
        );
      })}

      {/* Subtitles (absolute frames) */}
      <Captions chunks={CAPTIONS.s1} />
      <Captions chunks={CAPTIONS.s2} />
      <Captions chunks={CAPTIONS.s3} />
      <Captions chunks={CAPTIONS.s4} />
      <Captions chunks={CAPTIONS.s5} />
      <Captions chunks={CAPTIONS.s6} />

      {/* Music bed (ducking + scratch gap are baked into the file) */}
      <Audio src={staticFile("audio/music.mp3")} volume={(n) => 0.9 * interpolate(n, [TOTAL_FRAMES - 40, TOTAL_FRAMES], [1, 0], { extrapolateLeft: "clamp" })} />
      {(Object.keys(VOICE) as (keyof typeof VOICE)[]).map((k) => (
        <Voice key={k} k={k} />
      ))}
      <Sfx file={SFX.ring.file} at={SFX.ring.at} volume={0.35} />
      <Sfx file={SFX.connect.file} at={SFX.connect.at} />
      <Sfx file={SFX.pickup.file} at={SFX.pickup.at} />
      <Sfx file={SFX.scratch.file} at={SFX.scratch.at} volume={0.9} />
      <Sfx file={SFX.impactReact.file} at={SFX.impactReact.at} volume={0.8} />
      <Sfx file={SFX.impactReveal.file} at={SFX.impactReveal.at} volume={0.8} />
      {SFX.whooshes.map((t) => (
        <Sfx key={t} file="audio/sfx_whoosh.mp3" at={t - 0.1} volume={0.45} />
      ))}
      {SFX.pops.map((t) => (
        <Sfx key={t} file="audio/sfx_pop.mp3" at={t} volume={0.4} />
      ))}
    </AbsoluteFill>
  );
};
