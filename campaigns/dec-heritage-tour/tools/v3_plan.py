#!/usr/bin/env python3
"""V3 edit decisions -> src/v3/timeline.v3.json. Refines V2 (same 39 s, same narration placement, same 120 BPM grid).
Changes: airport shots re-framed to exclude the inaccurate AI signage; relaxation de-duplicated (restaurant once, beach once);
montage gets new human/cultural moments (coconut vendor detail, fishing beach) instead of repeats; CTA plate = fort/coast aerial.
`crop` on a shot overrides the clip registry crop (source pixels, 9:16)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from plan import CLIPS
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TOTAL = 39.0
SHOTS = [
 dict(id='h1_wheels',  clip='terminal',  src=1.2, ramp=[(1.25, 2.5), (0.55, 1.6), (0.9, 1.0)], t0=0.0,  t1=1.5,  tin='cut',  crop=(215, 560, 765, 1360)),   # below the AI overhead signs
 dict(id='h2_arrival', clip='suitcase',  src=0.6, ramp=[(4.8, 1.0)],                         t0=1.5,  t1=6.0,  tin='cut',  signMask=[[6, 5.0], [100, 15.5], [100, 25.8], [6, 16.8]]),  # full frame; inaccurate AI sign blurred out under the headline (polygon, % of frame)
 dict(id='j1_window',  clip='suv',       src=0.2, ramp=[(2.6, 1.0), (0.5, 1.7), (0.7, 3.0)], t0=6.0,  t1=9.0,  tin='flash'),
 dict(id='j2_coast',   clip='aerial_a',  src=0.4, ramp=[(3.4, 1.0)],                         t0=9.0,  t1=12.0, tin='whip'),
 dict(id='g1_fort',    clip='aerial_b',  src=0.6, ramp=[(2.9, 1.0)],                         t0=12.0, t1=14.5, tin='zoom'),
 dict(id='g2_guide',   clip='guide',     src=0.0, ramp=[(5.97, 1.0)],                        t0=14.5, t1=20.0, tin='match'),
 dict(id='r1_table',   clip='restaurant',src=0.0, ramp=[(3.9, 1.0)],                         t0=20.0, t1=23.5, tin='sweep'),
 dict(id='r2_beach',   clip='palms',     src=0.3, ramp=[(4.8, 1.0)],                         t0=23.5, t1=28.0, tin='cut'),
 dict(id='m1_dance',   clip='dance_a',   src=0.4, ramp=[(1.2, 1.0)],                         t0=28.0, t1=29.0, tin='flash'),
 dict(id='m2_spin',    clip='dancer',    src=3.4, ramp=[(0.8, 1.4)],                         t0=29.0, t1=29.5, tin='cut'),
 dict(id='m3_coconut', clip='coconut',   src=0.6, ramp=[(1.2, 1.0)],                         t0=29.5, t1=30.5, tin='cut',  crop=(1450, 880, 720, 1280)),  # hands + machete detail; no face, no sign
 dict(id='m4_friends', clip='dance_b',   src=0.4, ramp=[(0.8, 1.4)],                         t0=30.5, t1=31.0, tin='flash'),
 dict(id='m5_smile',   clip='dancer',    src=9.0, ramp=[(1.2, 1.0)],                         t0=31.0, t1=32.0, tin='cut'),   # fishing beach rejected again (muddy)
 dict(id='m6_joy',     clip='dance_b',   src=5.6, ramp=[(1.4, 1.0)],                         t0=32.0, t1=33.0, tin='cut'),
 dict(id='c1_plate',   clip='aerial_b',  src=3.1, ramp=[(6.5, 1.0)],                         t0=33.0, t1=TOTAL, tin='iris'),
]
GRADE_OVERRIDE = {  # V3 re-grade for clips that were rejected in V1 (milder: they must sit next to the AI core)
 'fishing': dict(bp=72, wp=226, gamma=1.02, sat=0.92, cb=dict(rm=0.02, bm=-0.03, rh=0.02), mood='coast'),
 'coconut': dict(bp=26, wp=222, gamma=1.08, sat=0.95, cb=dict(rm=0.02, bm=-0.02), mood=None),
}
SFX_EXTRA = [dict(type='tick', at=9.45), dict(type='swish', at=23.5, gain=0.45, pan=-0.3), dict(type='swish', at=23.72, gain=0.4, pan=0.3), dict(type='swish', at=34.05, gain=0.35)]
VO = [dict(id='p1_december', at=0.35), dict(id='p2_roots', at=6.30), dict(id='p3_history', at=12.40),
      dict(id='p4_coast', at=20.45), dict(id='p5_message', at=32.70)]
SECTIONS = [dict(id='hook', t0=0, t1=6), dict(id='journey', t0=6, t1=12), dict(id='heritage', t0=12, t1=20),
            dict(id='relax', t0=20, t1=28), dict(id='montage', t0=28, t1=33), dict(id='cta', t0=33, t1=TOTAL)]
if __name__ == '__main__':
    phr = {p['id']: p for p in json.load(open(f'{root}/work/v2/vo_phrases.json'))}
    for v in VO: v.update(dur=phr[v['id']]['dur'], text=phr[v['id']]['script'], end=round(v['at'] + phr[v['id']]['dur'], 3))
    for s in SHOTS:
        s['flag'] = CLIPS[s['clip']]['flag']; s['out_dur'] = round(sum(d / sp for d, sp in s['ramp']), 3)
        assert s['out_dur'] >= s['t1'] - s['t0'] + 0.0, s['id']
    os.makedirs(f'{root}/src/v3', exist_ok=True)
    json.dump(dict(fps=30, bpm=120, total=TOTAL, totalFrames=round(TOTAL * 30), shots=SHOTS, vo=VO, sections=SECTIONS, grade_override=GRADE_OVERRIDE, sfx_extra=SFX_EXTRA),
              open(f'{root}/src/v3/timeline.v3.json', 'w'), indent=1)
    for s in SHOTS: print(f"{s['id']:11s} {s['clip']:10s} {s['t0']:5.2f}-{s['t1']:5.2f} out {s['out_dur']}  {s.get('crop','')}")
