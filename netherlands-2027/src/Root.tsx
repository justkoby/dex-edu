import React from "react";
import { Composition } from "remotion";
import { Film } from "./Film";
import { TL } from "./data/tl";
import { RigSheet } from "./rig/RigSheet";

export const Root: React.FC = () => (
  <>
    <Composition id="Netherlands2027" component={Film} width={1080} height={1920} fps={TL.fps} durationInFrames={TL.frames} defaultProps={{ captions: true, audio: true }} />
    <Composition id="RigSheet" component={RigSheet} width={2400} height={2000} fps={30} durationInFrames={1} />
  </>
);
