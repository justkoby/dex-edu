import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import timeline from './timeline.v2.json';
import type { TimelineV2 } from './types';
import { Cam, ShotsV2 } from './ShotV2';
import { CTA_START, TypeV2, WipeBand } from './TypeV2';
import { Flash, LightSweep, ReviewFlags, Vignette, loadKitFonts, useTime } from '../kit';

const T = timeline as unknown as TimelineV2;
/** Camera language: slow dollies on emotional shots, forward drift on aerials, beat punches in the montage. */
const CAMS: Record<string, Cam> = {
  h1_wheels: { s0: 1.08, s1: 1.0, oy: 70 },
  h2_arrival: { s0: 1.0, s1: 1.09, ox: 50, oy: 32 },
  j1_window: { s0: 1.04, s1: 1.0, x0: 0, x1: -1.5, ox: 35, oy: 38 },
  j2_coast: { s0: 1.0, s1: 1.12, ox: 55, oy: 55 },
  g1_fort: { s0: 1.0, s1: 1.06, ox: 45, oy: 55 },
  g2_guide: { s0: 1.0, s1: 1.05, ox: 45, oy: 38 },
  r1_table: { s0: 1.0, s1: 1.07, ox: 48, oy: 40 },
  r2_beach: { s0: 1.06, s1: 1.0, x0: 1.5, x1: -1.5 },
  m1_dance: { s0: 1.0, s1: 1.03, punch: true }, m2_spin: { s0: 1.02, s1: 1.0, punch: true }, m3_smile: { s0: 1.0, s1: 1.03, punch: true, oy: 40 },
  m4_friends: { s0: 1.02, s1: 1.0, punch: true }, m5_fort: { s0: 1.0, s1: 1.04, punch: true }, m6_joy: { s0: 1.0, s1: 1.04, punch: true },
  c1_plate: { s0: 1.12, s1: 1.02, duotone: true },
};
const FLASH_AT = T.shots.filter((s) => s.tin === 'flash').map((s) => s.t0);
const SWEEP_AT = T.shots.filter((s) => s.tin === 'sweep').map((s) => s.t0);

export const HeritageTourV2: React.FC<{ reviewFlags?: boolean; withAudio?: boolean }> = ({ reviewFlags = true, withAudio = true }) => {
  loadKitFonts();
  const { t } = useTime();
  const cur = T.shots.find((s) => t >= s.t0 && t < s.t1);
  return (
    <AbsoluteFill style={{ backgroundColor: '#05060f' }}>
      <ShotsV2 shots={T.shots} cams={CAMS} />
      <Vignette amount={t >= CTA_START ? 0.5 : 0.3} />
      {FLASH_AT.map((a) => <Flash key={a} t={t} at={a} />)}
      {SWEEP_AT.map((a) => <LightSweep key={a} t={t} at={a} />)}
      <WipeBand t={t} />
      <TypeV2 t={t} />
      {reviewFlags && (
        <ReviewFlags lines={['INTERNAL REVIEW DRAFT v2 · NOT FOR PUBLICATION', 'ORIGINAL SCORE (DRAFT) · FOOTAGE LICENCES UNVERIFIED']}
          shotFlag={cur && /UNVERIFIED/i.test(cur.flag) ? cur.flag.toUpperCase() : undefined} />
      )}
      {/* Narration + original score, pre-mixed by audio/v2_mix.py (swap music: --music <file>) */}
      {withAudio && <Audio src={staticFile('v2/mix_v2.wav')} />}
    </AbsoluteFill>
  );
};
