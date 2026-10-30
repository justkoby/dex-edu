import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp01, easeInOut } from '../theme';
import type { Shot } from '../types';

/** One graded clip with its incoming transition (dissolve / light-leak / push), outgoing push parallax and a slow push-in. */
const ShotLayer: React.FC<{ shot: Shot; next?: Shot; index: number }> = ({ shot, next, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const total = shot.head + shot.dur + shot.tail;
  // incoming
  const p = shot.trans.dur > 0 ? clamp01(t / shot.trans.dur) : 1;
  const opacity = shot.trans.type === 'cut' ? 1 : shot.trans.type === 'push' ? 1 : easeInOut(p);
  let ty = shot.trans.type === 'push' ? (1 - easeInOut(p)) * 100 : 0;
  // outgoing parallax when the next shot pushes in over this one
  if (next && next.trans.type === 'push') {
    const q = clamp01((t - (shot.head + shot.dur - shot.tail)) / (2 * shot.tail));
    ty = -16 * easeInOut(q);
  }
  // slow push-in / pull-out, alternating per shot (subtle; footage is already upscaled)
  const prog = clamp01(t / total);
  const zoomIn = index % 2 === 0;
  const scale = 1 + 0.055 * (zoomIn ? prog : 1 - prog);
  const ox = [50, 42, 58, 50][index % 4];
  return (
    <AbsoluteFill style={{ opacity, transform: `translateY(${ty}%)`, overflow: 'hidden', backgroundColor: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: `${ox}% 45%` }}>
        <OffthreadVideo src={staticFile(`clips/${shot.id}.mp4`)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const VideoSequence: React.FC<{ shots: Shot[] }> = ({ shots }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {shots.map((s, i) => {
        const from = Math.round((s.start - s.head) * fps);
        const dur = Math.round((s.head + s.dur + s.tail) * fps);
        return (
          <Sequence key={s.id} from={from} durationInFrames={dur} layout="none">
            <ShotLayer shot={s} next={shots[i + 1]} index={i} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
