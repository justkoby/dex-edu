import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import timeline from './timeline.json';
import type { Timeline } from './types';
import { VideoSequence } from './components/VideoSequence';
import { LightLeaks } from './components/LightLeak';
import { Headings, HeadingCue } from './components/AnimatedHeading';
import { EndCard } from './components/EndCard';
import { ReviewOverlay } from './components/ReviewOverlay';
import { loadFonts } from './fonts';

const T = timeline as unknown as Timeline;
const scene = (id: string) => T.scenes.find((s) => s.id === id)!;
const endCardStart = T.voEnd - 4.0;       // lands with the closing sentence

// Typographic cues (global seconds). Short brand/theme lines only – no invented narration captions.
export const CUES: HeadingCue[] = [
  { kicker: 'DEXTERITY  ·  DECEMBER TOUR', lines: ['COMING HOME'], start: 0.5, dur: 4.2, size: 118, y: 1290 },
  { lines: ['A JOURNEY BACK', 'TO YOUR ROOTS'], start: 5.2, dur: 4.4, size: 92, accentLine: 1, y: 1180 },
  { lines: ['DISCOVER YOUR', 'HERITAGE'], start: scene('3-heritage').start + 0.9, dur: 3.8, size: 104, y: 1110 },
  { lines: ['UNWIND BY', 'THE COAST'], start: scene('4-relaxation').start + 1.0, dur: 3.8, size: 118, y: 1110 },
  { lines: ['MAKE MEMORIES', 'THAT LAST'], start: scene('5-memories').start + 0.9, dur: 3.8, size: 100, y: 1110 },
  { lines: ['JOIN US', 'THIS DECEMBER'], start: endCardStart - 4.3, dur: 4.0, size: 104, y: 1110 },
];

export const Main: React.FC<{ reviewFlags?: boolean; musicAndMix?: boolean }> = ({ reviewFlags = true, musicAndMix = true }) => {
  loadFonts();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <VideoSequence shots={T.shots} />
      <LightLeaks shots={T.shots} />
      <Headings cues={CUES} />
      <Sequence from={Math.round(endCardStart * fps)} layout="none"><EndCard /></Sequence>
      {reviewFlags && <ReviewOverlay shots={T.shots} />}
      {/* Pre-mixed master (VO + ducked music + ambience). Replace the music with audio/mix.py --music <file>. */}
      {musicAndMix && <Audio src={staticFile('audio/mix_master.wav')} />}
    </AbsoluteFill>
  );
};
