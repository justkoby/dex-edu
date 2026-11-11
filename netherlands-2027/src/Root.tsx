import React from "react";
import { Composition } from "remotion";
import { Film } from "./Film";
import { TL } from "./data/tl";
import { RigSheet } from "./rig/RigSheet";
import { AssemblySheet } from "./character2/AssemblySheet";
import { S1_TEST_END, Scene1Test } from "./character2/Scene1Test";

export const Root: React.FC = () => (
  <>
    <Composition id="Netherlands2027" component={Film} width={1080} height={1920} fps={TL.fps} durationInFrames={TL.frames} defaultProps={{ captions: true, audio: true }} />
    <Composition id="Scene1Test" component={Scene1Test} width={1080} height={1920} fps={TL.fps} durationInFrames={Math.round(S1_TEST_END * TL.fps)} />
    <Composition id="Character2Assembly" component={AssemblySheet} width={2440} height={1470} fps={30} durationInFrames={1} />
    <Composition id="RigSheet" component={RigSheet} width={2400} height={2000} fps={30} durationInFrames={1} />
  </>
);
