import React from 'react';
import { Composition, Folder } from 'remotion';
import timeline from './timeline.json';
import timelineV2 from './v2/timeline.v2.json';
import { Main } from './Main';
import { HeritageTourV2 } from './v2/HeritageTourV2';
import timelineV3 from './v3/timeline.v3.json';
import { HeritageTourV3 } from './v3/HeritageTourV3';
import timelineV4 from './v4/timeline.v4.json';
import { GroupChatV4 } from './v4/GroupChatV4';

export const Root: React.FC = () => (
  <>
    {/* Version 1 (85 s internal draft) – preserved unchanged */}
    <Composition id="HeritageTour" component={Main} width={1080} height={1920} fps={timeline.fps} durationInFrames={timeline.totalFrames} defaultProps={{ reviewFlags: true, musicAndMix: true }} />
    <Folder name="V2">
      <Composition id="HeritageTourV2" component={HeritageTourV2} width={1080} height={1920} fps={timelineV2.fps} durationInFrames={timelineV2.totalFrames} defaultProps={{ reviewFlags: true, withAudio: true }} />
    </Folder>
    <Folder name="V3">
      {/* subtitles on/off: --props='{"subtitles":false}' */}
      <Composition id="HeritageTourV3" component={HeritageTourV3} width={1080} height={1920} fps={timelineV3.fps} durationInFrames={timelineV3.totalFrames} defaultProps={{ subtitles: true, reviewFlags: false, withAudio: true }} />
    </Folder>
    <Folder name="V4">
      <Composition id="GroupChatV4" component={GroupChatV4} width={1080} height={1920} fps={timelineV4.fps} durationInFrames={timelineV4.totalFrames} defaultProps={{ withAudio: true }} />
    </Folder>
  </>
);
