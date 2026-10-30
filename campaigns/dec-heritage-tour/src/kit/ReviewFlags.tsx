import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TYPE } from './brand';
/** Internal-review markings for unapproved drafts. Placed in the platform-UI zones so they never cover creative. */
export const ReviewFlags: React.FC<{ lines: string[]; shotFlag?: string }> = ({ lines, shotFlag }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {lines.map((l, i) => (
      <div key={i} style={{ position: 'absolute', left: 36, top: 56 + i * 44, padding: '6px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontFamily: TYPE.sans, fontWeight: 700, fontSize: 18, letterSpacing: '0.08em' }}>{l}</div>
    ))}
    {shotFlag && <div style={{ position: 'absolute', left: 36, bottom: 70, maxWidth: 1000, padding: '6px 14px', borderRadius: 8, background: 'rgba(196,112,0,0.88)', color: '#fff', fontFamily: TYPE.sans, fontWeight: 700, fontSize: 18, letterSpacing: '0.06em' }}>⚠ {shotFlag}</div>}
  </AbsoluteFill>
);
