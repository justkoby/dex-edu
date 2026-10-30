import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Blur, clamp, expoIn, expoInOut, expoOut, lerp, prog, quintInOut, velBlur } from '../kit';
import type { ShotV2T } from './types';

/** How far each incoming transition reaches back before the cut (s). */
export const PRE: Record<string, number> = { whip: 0.2, zoom: 0.25, match: 0.2, sweep: 0.3, iris: 0.5, cut: 0, flash: 0 };

/** Camera language per shot: slow dolly (s0->s1), drift (x/y in %), origin. Montage shots also get a beat "punch". */
export type Cam = { s0: number; s1: number; x0?: number; x1?: number; y0?: number; y1?: number; ox?: number; oy?: number; punch?: boolean; duotone?: boolean };

const Layer: React.FC<{ shot: ShotV2T; next?: ShotV2T; cam: Cam; start: number; dir: string }> = ({ shot, next, cam, start, dir }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = start + frame / fps;                         // global time
  const { t0, t1 } = shot;
  // --- camera
  const c = clamp((t - t0) / (t1 - t0));
  let scale = lerp(cam.s0, cam.s1, quintInOut(c) * 0.35 + c * 0.65);
  let tx = lerp(cam.x0 ?? 0, cam.x1 ?? 0, c); const ty = lerp(cam.y0 ?? 0, cam.y1 ?? 0, c);
  if (cam.punch) scale *= 1 + 0.07 * (1 - expoOut(prog(t, t0, t0 + 0.28)));
  let opacity = 1; let blurX = 0; let blurAll = 0; let clip: string | undefined;
  // --- incoming transition
  switch (shot.tin) {
    case 'whip': { const p = prog(t, t0 - 0.2, t0 + 0.08); tx += (1 - expoOut(p)) * 100; blurX = velBlur(expoOut, p, 1080, 0.28 * fps, 0.35); break; }
    case 'zoom': { opacity = prog(t, t0 - 0.16, t0 + 0.02); scale *= lerp(1.35, 1, expoOut(prog(t, t0 - 0.16, t0 + 0.6))); blurAll = (1 - prog(t, t0 - 0.16, t0 + 0.12)) * 10; break; }
    case 'match': { opacity = quintInOut(prog(t, t0 - 0.2, t0 + 0.04)); scale *= lerp(1.035, 1, expoOut(prog(t, t0 - 0.2, t0 + 0.6))); break; }
    case 'sweep': { opacity = expoInOut(prog(t, t0 - 0.3, t0 + 0.06)); break; }
    case 'iris': {
      const p = expoInOut(prog(t, t0 - 0.05, t0 + 0.45)); const x = lerp(-40, 140, p);
      clip = `polygon(0% 0%, ${x}% 0%, ${x - 40}% 100%, 0% 100%)`; break;
    }
  }
  // --- outgoing transition (driven by the next shot)
  if (next?.tin === 'whip') { const p = prog(t, t1 - 0.2, t1 + 0.08); tx -= expoOut(p) * 55; blurX = Math.max(blurX, velBlur(expoOut, p, 600, 0.28 * fps, 0.35)); }
  if (next?.tin === 'zoom') { const p = prog(t, t1 - 0.25, t1 + 0.02); scale *= lerp(1, 2.1, expoIn(p)); blurAll = Math.max(blurAll, expoIn(p) * 12); }
  const filt = [cam.duotone ? 'grayscale(1) contrast(1.08) brightness(0.92)' : '', blurAll > 0.2 ? `blur(${blurAll.toFixed(1)}px)` : ''].join(' ').trim();
  return (
    <AbsoluteFill style={{ opacity, clipPath: clip, overflow: 'hidden' }}>
      <Blur x={blurX} style={{ position: 'absolute', inset: 0 }}>
        <AbsoluteFill style={{ transform: `translate(${tx}%, ${ty}%) scale(${scale})`, transformOrigin: `${cam.ox ?? 50}% ${cam.oy ?? 45}%`, filter: filt || undefined }}>
          <OffthreadVideo src={staticFile(`${dir}/${shot.id}.mp4`)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* shot.signMask is baked into the clip by tools/v2_prep.py (FFmpeg) – no live backdrop blur (too slow to render) */}
        </AbsoluteFill>
      </Blur>
    </AbsoluteFill>
  );
};

export const ShotsV2: React.FC<{ shots: ShotV2T[]; cams: Record<string, Cam>; dir?: string }> = ({ shots, cams, dir = 'v2' }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#05060f' }}>
      {shots.map((s, i) => {
        const next = shots[i + 1]; const start = s.t0 - (PRE[s.tin] ?? 0); const end = s.t1 + (next ? PRE[next.tin] ?? 0 : 0);
        const from = Math.round(start * fps);
        return (
          <Sequence key={s.id} from={from} durationInFrames={Math.round(end * fps) - from} layout="none">
            <Layer shot={s} next={next} cam={cams[s.id] ?? { s0: 1, s1: 1.04 }} start={from / fps} dir={dir} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
