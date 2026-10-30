import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp01 } from '../theme';
import type { Shot } from '../types';

/** Warm light sweep centred on a cut (screen blend). Rendered only around 'leak' transitions. */
const Leak: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = clamp01(frame / fps / dur);
  const bell = Math.pow(Math.sin(Math.PI * p), 1.6);
  const x = 15 + 70 * p;
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 0.9 * bell, pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 50% at ${x}% 38%, rgba(255,205,140,0.95) 0%, rgba(255,150,70,0.55) 38%, rgba(255,120,40,0) 72%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(105deg, rgba(255,255,255,0) ${x - 30}%, rgba(255,236,200,0.55) ${x}%, rgba(255,255,255,0) ${x + 30}%)` }} />
    </AbsoluteFill>
  );
};
export const LightLeaks: React.FC<{ shots: Shot[] }> = ({ shots }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {shots.filter((s) => s.trans.type === 'leak').map((s) => {
        const win = s.trans.dur + 0.3;
        const from = Math.round((s.start - win / 2) * fps);
        return (
          <React.Fragment key={s.id}>
            {/* sequences imported lazily to keep this file small */}
            <SeqWrap from={from} frames={Math.round(win * fps)}><Leak dur={win} /></SeqWrap>
          </React.Fragment>
        );
      })}
    </>
  );
};
import { Sequence } from 'remotion';
const SeqWrap: React.FC<{ from: number; frames: number; children: React.ReactNode }> = ({ from, frames, children }) => (
  <Sequence from={Math.max(0, from)} durationInFrames={frames} layout="none">{children}</Sequence>
);
