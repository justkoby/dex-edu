import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, DROP, FPS, MUSIC_FILE_DROP, SC, TOTAL, clamp, sec } from "./tokens";
import { useArchivo } from "./fonts";
import { Hook, SlamClip, SlamOutline, WINDOW_END, WINDOW_START } from "./Hook";
import { Route } from "./Route";
import { BMU, IBS, UniSpotlight } from "./Universities";
import { Message } from "./Message";
import { Cta } from "./Cta";
import { Sweep } from "./ui";

const OVERLAP = 20; // each scene keeps playing under the next one's cut
const ROUTE_LEAD = sec(0.9); // route scene starts 0.9 s before its beat so it is already alive inside the BUDAPEST? letters

/** Sound design. All times are on the beat grid (beat(n) = 3.0 + 0.6 n s). */
const SFX: { f: string; at: number; v: number }[] = [
  { f: "sfx_hit", at: 0.6, v: 0.5 },
  { f: "sfx_hit", at: 1.2, v: 0.55 },
  { f: "sfx_hit", at: 2.1, v: 0.6 },
  { f: "sfx_riser", at: 1.8, v: 0.55 },
  { f: "sfx_impact", at: DROP, v: 0.95 }, // BUDAPEST? slam
  { f: "sfx_whoosh", at: WINDOW_START - 0.1, v: 0.5 }, // letters open onto the map
  { f: "sfx_route", at: SC.route.from + 0.5, v: 0.55 }, // plane in flight
  { f: "sfx_ping", at: SC.route.from + 0.1, v: 0.35 }, // Accra
  { f: "sfx_ping", at: SC.route.from + 2.7, v: 0.6 }, // Budapest arrival
  { f: "sfx_whoosh", at: SC.route.from + 3.25, v: 0.5 }, // footage opens
  { f: "sfx_whoosh", at: SC.uni1.from - 0.05, v: 0.55 },
  { f: "sfx_hit", at: SC.uni1.from + 0.55, v: 0.4 },
  { f: "sfx_title", at: SC.uni1.from + 0.5, v: 0.4 },
  { f: "sfx_whoosh", at: SC.uni2.from - 0.05, v: 0.55 },
  { f: "sfx_hit", at: SC.uni2.from + 0.55, v: 0.4 },
  { f: "sfx_title", at: SC.uni2.from + 0.5, v: 0.4 },
  { f: "sfx_hit", at: SC.msg.from + 0.1, v: 0.7 }, // EXPLORE.
  { f: "sfx_whoosh", at: SC.msg.from + 1.1, v: 0.4 },
  { f: "sfx_hit", at: SC.msg.from + 1.25, v: 0.75 }, // APPLY.
  { f: "sfx_whoosh", at: SC.msg.from + 2.3, v: 0.4 },
  { f: "sfx_hit", at: SC.msg.from + 2.45, v: 0.8 }, // GO FURTHER.
  { f: "sfx_whoosh", at: SC.msg.from + 3.5, v: 0.45 },
  { f: "sfx_hit", at: SC.msg.from + 3.7, v: 0.85 }, // campaign line
  { f: "sfx_swell", at: SC.cta.from - 0.5, v: 0.55 }, // into the brand environment
  { f: "sfx_whoosh", at: SC.cta.from - 0.1, v: 0.45 },
  { f: "sfx_chime", at: SC.cta.from + 0.9, v: 0.5 }, // logo reveal
  { f: "sfx_pop", at: SC.cta.from + 2.8, v: 0.5 }, // WhatsApp button
  { f: "sfx_brand", at: SC.cta.from + 4.1, v: 0.6 }, // branded sign-off
];

/** Music: starts 3 s before the file's groove drop so the drop lands on the BUDAPEST? slam. Dips for the final hold. */
const musicGain = (frame: number) => {
  const t = frame / FPS;
  return 0.9 * interpolate(t, [0, 0.8], [0, 1], clamp) * interpolate(t, [28.6, 30], [1, 0.0], clamp) * (0.55 + 0.45 * interpolate(t, [2.2, DROP], [0, 1], clamp));
};

export const MotionBudapest: React.FC = () => {
  useArchivo();
  const routeFrom = sec(SC.route.from) - ROUTE_LEAD;
  const scene = (k: keyof typeof SC, node: React.ReactNode) => (
    <Sequence from={sec(SC[k].from)} durationInFrames={sec(SC[k].to - SC[k].from) + OVERLAP}>{node}</Sequence>
  );
  return (
    <AbsoluteFill style={{ background: C.navyDeep }}>
      {scene("hook", <Hook />)}
      {/* letters-as-window: the clip path (BUDA / PEST?) is defined at absolute frame 0 so it matches the visible slam */}
      <Sequence from={0} durationInFrames={sec(SC.route.from) + 6}><SlamClip /></Sequence>
      <Sequence from={routeFrom} durationInFrames={sec(SC.route.to - SC.route.from) + ROUTE_LEAD + OVERLAP}>
        <RouteWindow offset={routeFrom} />
      </Sequence>
      <Sequence from={0} durationInFrames={sec(WINDOW_END) + 2}><SlamOutline /></Sequence>
      {scene("uni1", <UniSpotlight uni={IBS} duration={sec(SC.uni1.to - SC.uni1.from)} />)}
      {scene("uni2", <UniSpotlight uni={BMU} duration={sec(SC.uni2.to - SC.uni2.from)} />)}
      {scene("msg", <Message />)}
      <Sequence from={sec(SC.cta.from)} durationInFrames={TOTAL - sec(SC.cta.from)}>
        <CtaScene />
      </Sequence>

      {/* audio */}
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

/** Dexterity end card opens from the centre as a circle (echoing the logo's rounded D). */
const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = interpolate(f, [0, 22], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${reveal * 1500}px at 50% 50%)` }}>
      <Cta />
    </AbsoluteFill>
  );
};
