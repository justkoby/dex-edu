import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { BRAND } from "./config/brand";
import { CAPTIONS } from "./config/captions";
import { CLIPS, ClipId, MUSIC_A, MUSIC_B, MUSIC_DROP, SCENES, SFX, T, TOTAL_FRAMES, VOICE, musicGainA, musicGainB, sec, FPS } from "./config/timeline";
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

type Scene = { key: keyof typeof SCENES; node: React.ReactNode; reveal: React.ComponentProps<typeof Reveal> | null };
const scenes: Scene[] = [
  { key: "s1", node: <Scene1Call />, reveal: null },
  { key: "s2", node: <Scene2Ama />, reveal: null }, // Scene2 owns its circle reveal out of Ama's call window
  { key: "s3", node: <Scene3React />, reveal: { kind: "none", dur: 1, children: null } }, // hard cut on the scratch + impact
  { key: "s4", node: <Scene4Reveal />, reveal: { kind: "circle", dur: 14, origin: [50, 33], zoom: 1.4, children: null } }, // iris out of Kofi's face into Budapest
  { key: "s5", node: <Scene5Montage />, reveal: { kind: "circle", dur: 16, origin: [50, 45], children: null } },
  { key: "s6", node: <EndCard />, reveal: { kind: "wipe", dur: 18, children: null } },
];

const clipIds = Object.keys(CLIPS) as ClipId[];

const Sfx: React.FC<{ file: string; at: number; volume?: number; len?: number }> = ({ file, at, volume = 0.7, len }) => (
  <Sequence from={sec(at)} durationInFrames={len ? sec(len) : undefined}>
    <Audio src={staticFile(file)} volume={len ? (n) => volume * interpolate(n, [sec(len) - 5, sec(len)], [1, 0], { extrapolateLeft: "clamp" }) : volume} />
  </Sequence>
);

export const Skit: React.FC = () => {
  useBrandFonts();
  const music = staticFile("media/music_bed.m4a");
  const dBy = (id: ClipId) => sec(CLIPS[id].duration);
  return (
    <AbsoluteFill style={{ background: BRAND.navyDeep, fontFamily: BRAND.font }}>
      {scenes.map(({ key, node, reveal }, i) => {
        const from = sec(SCENES[key].from);
        const to = i === scenes.length - 1 ? TOTAL_FRAMES : sec(SCENES[key].to) + TAIL;
        return (
          <Sequence key={key} from={from} durationInFrames={to - from}>
            {reveal ? <Reveal kind={reveal.kind} dur={reveal.dur} origin={reveal.origin} zoom={reveal.zoom}>{node}</Reveal> : node}
          </Sequence>
        );
      })}

      {/* Subtitles (absolute frames) */}
      {clipIds.map((id) => <Captions key={id} chunks={CAPTIONS[id]} />)}

      {/* Dialogue: real, processed recordings (public/audio/processed) */}
      {clipIds.map((id) => (
        <Sequence key={id} from={sec(VOICE[id].start)} durationInFrames={dBy(id) + 2}>
          <Audio src={staticFile(CLIPS[id].file)} volume={1} />
        </Sequence>
      ))}

      {/* Music: quiet bed until the "Budapest" cue, silence through the reaction, full groove drops on the reveal */}
      <Sequence from={sec(MUSIC_A.from)} durationInFrames={sec(MUSIC_A.to - MUSIC_A.from)}>
        <Audio src={music} startFrom={0} volume={(n) => musicGainA(n / FPS + MUSIC_A.from)} />
      </Sequence>
      <Sequence from={sec(MUSIC_B.from)} durationInFrames={TOTAL_FRAMES - sec(MUSIC_B.from)}>
        <Audio src={music} startFrom={sec(MUSIC_DROP)} volume={(n) => musicGainB(n / FPS + MUSIC_B.from)} />
      </Sequence>

      {/* Sound design */}
      <Sfx file={SFX.ring.file} at={SFX.ring.at} len={SFX.ring.len} volume={0.4} />
      <Sfx file={SFX.connect.file} at={SFX.connect.at} volume={0.6} />
      <Sfx file={SFX.pickup.file} at={SFX.pickup.at} volume={0.5} />
      <Sfx file={SFX.scratch.file} at={SFX.scratch.at} volume={0.8} />
      <Sfx file={SFX.impactReact.file} at={SFX.impactReact.at} volume={0.7} />
      <Sfx file={SFX.impactReveal.file} at={SFX.impactReveal.at} volume={0.85} />
      <Sfx file={SFX.disconnect.file} at={SFX.disconnect.at} volume={0.55} />
      <Sfx file={SFX.chime.file} at={SFX.chime.at} volume={0.55} />
      {SFX.whooshes.map((t) => <Sfx key={t} file="audio/sfx_whoosh.mp3" at={t} volume={0.4} />)}
      {/* university title reveals + montage cuts */}
      <Sfx file="audio/sfx_title.mp3" at={T.C4 + 0.95} volume={0.35} />
      <Sfx file="audio/sfx_title.mp3" at={T.C5 + 1.8 - 0.1} volume={0.35} />
      <Sfx file="audio/sfx_title.mp3" at={T.C5 + 3.6 - 0.1} volume={0.35} />
    </AbsoluteFill>
  );
};
