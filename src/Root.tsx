import React from "react";
import { Composition } from "remotion";
import { Skit } from "./Skit";
import { FPS, H, TOTAL_FRAMES, W } from "./config/timeline";

export const Root: React.FC = () => (
  <Composition id="Dexterity-Skit" component={Skit} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
);
