import React from 'react';
import { Composition } from 'remotion';
import timeline from './timeline.json';
import { Main } from './Main';

export const Root: React.FC = () => (
  <Composition id="HeritageTour" component={Main} width={1080} height={1920} fps={timeline.fps} durationInFrames={timeline.totalFrames} defaultProps={{ reviewFlags: true, musicAndMix: true }} />
);
