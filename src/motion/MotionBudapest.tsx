import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, DROP, FPS, MUSIC_FILE_DROP, SC, TOTAL, clamp, sec } from "./tokens";
import { useArchivo } from "./fonts";
import { Hook, SlamClip, SlamOutline, WINDOW_END, WINDOW_START } from "./Hook";
import { R, Route } from "./Route";
import { BmuCinematic, IbsGrid } from "./Campus";
import { Message } from "./Message";
import { Cta } from "./Cta";

const ROUTE_LEAD = sec(0.9); // route scene starts 0.9 s early so it is already alive inside the BUDAPEST? letters
const len = (k: keyof typeof SC) => sec(SC[k].to - SC[k].from);

/**
 * Sound design — sparse on purpose. Every cue is on the 0.6 s beat grid (beat n = 3.0 + 0.6 n s) or on the visual it supports.
 * Levels are set relative to the music so no effect jumps out; the master is normalised to -16 LUFS afterwards.
 */
const SFX: { f: string; at: number; v: number }[] = [
  // hook: three beats of type, riser, impact on the drop, whoosh as the letters open
  { f: "sfx_hit", at: 0.6, v: 0.4 }, { f: "sfx_hit", at: 1.2, v: 0.45 }, { f: "sfx_hit", at: 2.4, v: 0.5 },
  { f: "sfx_riser", at: 1.8, v: 0.45 },
  { f: "sfx_impact", at: DROP, v: 0.85 },
  { f: "sfx_whoosh", at: WINDOW_START - 0.1, v: 0.4 },
  // route: origin ping, aircraft shimmer, destination ping, marker-opens whoosh
  { f: "sfx_ping", at: SC.route.from + R.pingA, v: 0.28 },
  { f: "sfx_route", at: SC.route.from + R.fly0, v: 0.4 },
  { f: "sfx_ping", at: SC.route.from + R.arrive, v: 0.5 },
  { f: "sfx_whoosh", at: SC.route.from + R.open0 - 0.05, v: 0.4 },
  // IBS: footage contracts into the grid, title swish
  { f: "sfx_whoosh", at: SC.ibs.from + 0.1, v: 0.35 },
  { f: "sfx_title", at: SC.ibs.from + 1.15, v: 0.32 },
  // BMU: panel expands, slanted wipe, title swish, bars close
  { f: "sfx_whoosh", at: SC.bmu.from - 0.8, v: 0.3 },
  { f: "sfx_whoosh", at: SC.bmu.from + 0.2, v: 0.42 },
  { f: "sfx_title", at: SC.bmu.from + 0.95, v: 0.32 },
  { f: "sfx_swell", at: SC.bmu.from + 3.7, v: 0.4 },
  // message: one hit per word, whoosh just ahead of each wipe, heavier hit on the campaign line
  { f: "sfx_hit", at: SC.msg.from + 0.1, v: 0.5 },
  { f: "sfx_whoosh", at: SC.msg.from + 1.0, v: 0.3 }, { f: "sfx_hit", at: SC.msg.from + 1.3, v: 0.55 },
  { f: "sfx_whoosh", at: SC.msg.from + 2.2, v: 0.3 }, { f: "sfx_hit", at: SC.msg.from + 2.5, v: 0.6 },
  { f: "sfx_whoosh", at: SC.msg.from + 3.4, v: 0.3 }, { f: "sfx_hit", at: SC.msg.from + 3.7, v: 0.7 },
  // end card: swell into the brand environment, logo chime, button pop, sign-off stinger
  { f: "sfx_swell", at: SC.cta.from - 0.4, v: 0.4 },
  { f: "sfx_whoosh", at: SC.cta.from - 0.05, v: 0.35 },
  { f: "sfx_chime", at: SC.cta.from + 0.55, v: 0.42 },
  { f: "sfx_pop", at: SC.cta.from + 3.5, v: 0.4 },
  { f: "sfx_brand", at: SC.cta.from + 4.4, v: 0.5 },
];

/** Music starts 3 s before the file's groove drop so the drop lands on the BUDAPEST? slam; it eases down for the end hold. */
const musicGain = (frame: number) => {
  const t = frame / FPS;
  const end = TOTAL / FPS;
  return 0.9 * interpolate(t, [0, 0.8], [0, 1], clamp) * (0.55 + 0.45 * interpolate(t, [2.2, DROP], [0, 1], clamp)) * interpolate(t, [SC.cta.from + 1, SC.cta.from + 3], [1, 0.78], clamp) * interpolate(t, [end - 1.5, end], [1, 0], clamp);
};

export const MotionBudapest: React.FC = () => {
  useArchivo();
  const routeFrom = sec(SC.route.from) - ROUTE_LEAD;
  // frames the dome footage has already been playing when the route scene hands over to the IBS grid (see Route.tsx)
  const domeElapsed = sec(SC.ibs.from) - (sec(SC.route.from) + sec(R.open0) + 1);
  const ibsElapsed = len("ibs");
  return (
    <AbsoluteFill style={{ background: C.navyDeep }}>
      <Sequence from={0} durationInFrames={sec(SC.hook.to) + 20}><Hook /></Sequence>
      {/* letters-as-window: clip path (BUDA / PEST?) at absolute frame 0 so it matches the visible slam */}
      <Sequence from={0} durationInFrames={sec(SC.route.from) + 6}><SlamClip /></Sequence>
      <Sequence from={routeFrom} durationInFrames={len("route") + ROUTE_LEAD + 4}>
        <RouteWindow offset={routeFrom} />
      </Sequence>
      <Sequence from={0} durationInFrames={sec(WINDOW_END) + 2}><SlamOutline /></Sequence>
      <Sequence from={sec(SC.ibs.from)} durationInFrames={len("ibs")}><IbsGrid duration={len("ibs")} domeElapsed={domeElapsed} /></Sequence>
      <Sequence from={sec(SC.bmu.from)} durationInFrames={len("bmu")}><BmuCinematic duration={len("bmu")} ibsElapsed={ibsElapsed} /></Sequence>
      <Sequence from={sec(SC.msg.from)} durationInFrames={len("msg") + 18}><Message /></Sequence>
      <Sequence from={sec(SC.cta.from)} durationInFrames={TOTAL - sec(SC.cta.from)}><Cta /></Sequence>

      <Audio src={staticFile("media/music_bed.m4a")} startFrom={sec(MUSIC_FILE_DROP - DROP)} volume={musicGain} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={sec(s.at)}>
          <Audio src={staticFile(`audio/${s.f}.mp3`)} volume={s.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Route layer, clipped to the BUDAPEST? letters while they zoom open; unclipped once the letters fill the frame. */
const RouteWindow: React.FC<{ offset: number }> = ({ offset }) => {
  const abs = useCurrentFrame() + offset;
  const clipped = abs < sec(WINDOW_END) + 2;
  return (
    <AbsoluteFill style={{ clipPath: clipped ? "url(#slamClip)" : undefined }}>
      <Route lead={ROUTE_LEAD} />
    </AbsoluteFill>
  );
};
