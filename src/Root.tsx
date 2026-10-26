import React from "react";
import { Composition } from "remotion";
import { Skit } from "./Skit";
import { FPS, H, TOTAL_FRAMES, W } from "./config/timeline";
import { MotionBudapest } from "./motion/MotionBudapest";
import { TOTAL as MOTION_FRAMES } from "./motion/tokens";

export const Root: React.FC = () => (
  <>
    <Composition id="Dexterity-Skit" component={Skit} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Dexterity-Motion-Budapest" component={MotionBudapest} durationInFrames={MOTION_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
