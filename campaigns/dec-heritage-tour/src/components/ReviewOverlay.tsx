import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { FONT } from '../theme';
import type { Shot } from '../types';

const Pill: React.FC<{ text: string; top?: number; bottom?: number; amber?: boolean }> = ({ text, top, bottom, amber }) => (
  <div style={{ position: 'absolute', left: 40, top, bottom, padding: '8px 16px', borderRadius: 10, background: amber ? 'rgba(200,120,0,0.82)' : 'rgba(0,0,0,0.55)', color: '#fff', fontFamily: FONT.sans, fontWeight: 600, fontSize: 19, letterSpacing: '0.08em', maxWidth: 900 }}>{text}</div>
);
/** Internal-review flags (turn off with the `reviewFlags` prop). Not part of a public cut. */
export const ReviewOverlay: React.FC<{ shots: Shot[] }> = ({ shots }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <Pill top={64} text="INTERNAL REVIEW DRAFT v1 · NOT FOR PUBLIC RELEASE" />
      <Pill top={116} text="MUSIC: UNLICENSED PLACEHOLDER" />
      {shots.filter((s) => /UNVERIFIED/i.test(s.flag)).map((s) => (
        <Sequence key={s.id} from={Math.round(s.start * fps)} durationInFrames={Math.round(s.dur * fps)} layout="none">
          <Pill bottom={80} amber text={'⚠ ' + s.flag.toUpperCase()} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
