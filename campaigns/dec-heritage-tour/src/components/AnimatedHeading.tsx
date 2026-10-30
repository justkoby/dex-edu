import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND, FONT, SAFE, clamp01, easeOut } from '../theme';

export type HeadingCue = { lines: string[]; kicker?: string; sub?: string; start: number; dur: number; accentLine?: number; size?: number; y?: number };

/** Editorial heading: kicker + growing rule, masked line reveals (serif italic), optional sub line. Fades out at the end. */
const Heading: React.FC<{ cue: HeadingCue }> = ({ cue }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps;
  const out = 1 - clamp01((t - (cue.dur - 0.5)) / 0.5);
  const size = cue.size ?? 132;
  const rule = easeOut(clamp01((t - 0.05) / 0.7));
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {/* soft scrim for legibility */}
      <AbsoluteFill style={{ background: 'linear-gradient(to top, rgba(8,10,25,0.68) 0%, rgba(8,10,25,0.0) 58%)', opacity: clamp01(t / 0.5) * out }} />
      <div style={{ position: 'absolute', left: SAFE.left, right: 40, top: cue.y ?? 1110 }}>
        {cue.kicker && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 26, opacity: easeOut(clamp01(t / 0.5)), transform: `translateY(${(1 - easeOut(clamp01(t / 0.5))) * 14}px)` }}>
            <div style={{ height: 4, width: 90 * rule, background: BRAND.orange }} />
            <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 28, letterSpacing: '0.34em', color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,0.45)' }}>{cue.kicker}</div>
          </div>
        )}
        {cue.lines.map((line, i) => {
          const d = 0.18 + i * 0.14; const e = easeOut(clamp01((t - d) / 0.75));
          const accent = i === (cue.accentLine ?? cue.lines.length - 1);
          return (
            <div key={i} style={{ clipPath: 'inset(0 -400px 0 -60px)', paddingBottom: 14, marginBottom: -14, lineHeight: 1.0 }}>
              <div style={{ transform: `translateY(${(1 - e) * 112}%)`, opacity: clamp01(e * 1.4), fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 700, fontSize: size, color: accent && cue.lines.length > 1 ? BRAND.orange : BRAND.cream, textShadow: '0 4px 30px rgba(0,0,0,0.35)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                {cue.lines.length === 1 ? (<>{line.split(' ').slice(0, -1).join(' ')} <span style={{ color: BRAND.orange }}>{line.split(' ').slice(-1)}</span></>) : line}
              </div>
            </div>
          );
        })}
        {cue.sub && (
          <div style={{ marginTop: 34, fontFamily: FONT.sans, fontWeight: 600, fontSize: 32, letterSpacing: '0.30em', color: '#fff', opacity: easeOut(clamp01((t - 0.7) / 0.6)), transform: `translateY(${(1 - easeOut(clamp01((t - 0.7) / 0.6))) * 16}px)`, textShadow: '0 2px 14px rgba(0,0,0,0.5)' }}>{cue.sub}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const Headings: React.FC<{ cues: HeadingCue[] }> = ({ cues }) => {
  const { fps } = useVideoConfig();
  return (<>{cues.map((c, i) => (<Sequence key={i} from={Math.round(c.start * fps)} durationInFrames={Math.round(c.dur * fps)} layout="none"><Heading cue={c} /></Sequence>))}</>);
};
