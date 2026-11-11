import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Captions } from "./components/Captions";
import { Wipe } from "./components/Stage";
import { loadFonts } from "./components/fonts";
import { BRAND } from "./config/brand";
import { TL } from "./data/tl";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Reveal } from "./scenes/Scene2Reveal";
import { Scene3Universities } from "./scenes/Scene3Universities";
import { Scene4Daydream } from "./scenes/Scene4Daydream";
import { Scene5Cta } from "./scenes/Scene5Cta";

loadFonts();
const { s1, s2, s3, s4, s5 } = TL.scenes;

/** "Chale, Have You Heard About This?" – Netherlands 2027. Scene order + audio tracks; all timing comes from timeline.json. */
export const Film: React.FC<{ captions?: boolean; audio?: boolean }> = ({ captions = true, audio = true }) => {
  const t = useCurrentFrame() / TL.fps;
  return (
    <AbsoluteFill style={{ background: BRAND.cream }}>
      {t < s2[0] && <Scene1Hook t={t} />}
      {t >= s2[0] && t < s3[0] && <Scene2Reveal t={t} />}
      {t >= s3[0] && t < s4[0] && <Scene3Universities t={t} />}
      {t >= s4[0] && t < s5[0] && <Scene4Daydream t={t} />}
      {t >= s5[0] && <Scene5Cta t={t} />}
      {/* scene changes: each one is motivated by an action (swat / map rush / cards drop / shake-off) and covered by a wipe */}
      <Wipe t={t} at={s2[0]} dir={-1} colors={[BRAND.orange, "#CFEBFF"]} />
      <Wipe t={t} at={s3[0]} dir={1} colors={[BRAND.navy, BRAND.yellow]} d={0.5} />
      <Wipe t={t} at={s4[0]} dir={-1} colors={[BRAND.yellow, "#fff"]} d={0.5} />
      <Wipe t={t} at={s5[0]} dir={1} colors={["#fff", BRAND.orange]} d={0.5} />
      {audio && (
        <>
          {/* three separate, editable tracks (see audio/ + docs/AUDIO.md). Music is ducked under the voice by TL.duck. */}
          <Audio src={staticFile("audio/stems/narration.wav")} />
          <Audio src={staticFile("audio/stems/music.wav")} volume={(f) => TL.duck?.[f] ?? 0.5} />
          <Audio src={staticFile("audio/stems/sfx.wav")} />
        </>
      )}
      {captions && <Captions t={t} />}
    </AbsoluteFill>
  );
};
