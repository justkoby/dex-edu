#!/usr/bin/env python3
"""V2 edit decisions (single source of truth) -> src/v2/timeline.v2.json. 120 BPM: 1 beat = 0.5 s = 15 frames, 1 bar = 2 s.
Shot fields: clip (tools/plan.py registry), src (source in-point), ramp [(source_seconds, speed), ...] segments played in order,
t0/t1 (timeline), tin (transition into this shot)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from plan import CLIPS
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BPM = 120; BEAT = 60 / BPM; TOTAL = 39.0
# --- shots -------------------------------------------------------------------------------------------
# ramp: list of (source_duration_s, speed). output duration = sum(src/speed). must cover t1-t0 (+ small tail for overlaps)
SHOTS = [
 # HOOK: speed-ramped terminal wheels (fast -> real time) cut on the beat to the arrival hero
 dict(id='h1_wheels',  clip='terminal',  src=1.2, ramp=[(1.25, 2.5), (0.55, 1.6), (0.9, 1.0)], t0=0.0,  t1=1.5,  tin='cut'),
 dict(id='h2_arrival', clip='suitcase',  src=0.6, ramp=[(4.8, 1.0)],                         t0=1.5,  t1=6.0,  tin='cut'),
 # JOURNEY: window gaze -> whip-pan (direction of her gaze) into the coastal aerial (eyeline / POV match)
 dict(id='j1_window',  clip='suv',       src=0.2, ramp=[(2.6, 1.0), (0.5, 1.7), (0.7, 3.0)], t0=6.0,  t1=9.0,  tin='flash'),
 dict(id='j2_coast',   clip='aerial_a',  src=0.4, ramp=[(3.4, 1.0)],                         t0=9.0,  t1=12.0, tin='whip'),
 # HERITAGE: aerial zoom-through into the fort, white-wall graphic match into the guided tour
 dict(id='g1_fort',    clip='aerial_b',  src=0.6, ramp=[(2.9, 1.0)],                         t0=12.0, t1=14.5, tin='zoom'),
 dict(id='g2_guide',   clip='guide',     src=0.0, ramp=[(5.97, 1.0)],                        t0=14.5, t1=20.0, tin='match'),
 # RELAXATION: warm light sweep (heritage -> leisure), eyeline cut from her sea gaze to the beach
 dict(id='r1_table',   clip='restaurant',src=0.0, ramp=[(4.9, 1.0)],                         t0=20.0, t1=24.5, tin='sweep'),
 dict(id='r2_beach',   clip='palms',     src=0.3, ramp=[(3.9, 1.0)],                         t0=24.5, t1=28.0, tin='cut'),
 # MONTAGE (music only): beat cuts with 'photo' flashes
 dict(id='m1_dance',   clip='dance_a',   src=0.4, ramp=[(1.2, 1.0)],                         t0=28.0, t1=29.0, tin='flash'),
 dict(id='m2_spin',    clip='dancer',    src=3.4, ramp=[(0.8, 1.4)],                         t0=29.0, t1=29.5, tin='cut'),
 dict(id='m3_smile',   clip='restaurant',src=5.3, ramp=[(1.2, 1.0)],                         t0=29.5, t1=30.5, tin='cut'),
 dict(id='m4_friends', clip='dance_b',   src=0.4, ramp=[(0.8, 1.4)],                         t0=30.5, t1=31.0, tin='flash'),
 dict(id='m5_fort',    clip='aerial_b',  src=4.4, ramp=[(1.2, 1.0)],                         t0=31.0, t1=32.0, tin='cut'),
 dict(id='m6_joy',     clip='dance_b',   src=5.6, ramp=[(1.4, 1.0)],                         t0=32.0, t1=33.0, tin='cut'),
 # CTA plate background (duotoned under the end card)
 dict(id='c1_plate',   clip='palms',     src=4.5, ramp=[(4.0, 0.62)],                        t0=33.0, t1=TOTAL, tin='iris'),
]
# --- narration placement (seconds on the timeline; phrase files from tools/v2_extract_vo.py) --------------
VO = [dict(id='p1_december', at=0.35), dict(id='p2_roots', at=6.30), dict(id='p3_history', at=12.40),
      dict(id='p4_coast', at=20.45), dict(id='p5_message', at=32.70)]
SECTIONS = [dict(id='hook', t0=0, t1=6), dict(id='journey', t0=6, t1=12), dict(id='heritage', t0=12, t1=20),
            dict(id='relax', t0=20, t1=28), dict(id='montage', t0=28, t1=33), dict(id='cta', t0=33, t1=TOTAL)]
if __name__ == '__main__':
    phr = {p['id']: p for p in json.load(open(f'{root}/work/v2/vo_phrases.json'))}
    for v in VO: v.update(dur=phr[v['id']]['dur'], text=phr[v['id']]['script'], end=round(v['at'] + phr[v['id']]['dur'], 3))
    for s in SHOTS:
        s['flag'] = CLIPS[s['clip']]['flag']
        s['out_dur'] = round(sum(d / sp for d, sp in s['ramp']), 3)
        need = s['t1'] - s['t0'] + 0.25
        assert s['out_dur'] >= need - 0.26, (s['id'], s['out_dur'], need)
    for a, b in zip(VO, VO[1:]): assert a['end'] < b['at'], (a['id'], b['id'])
    out = dict(fps=30, bpm=BPM, total=TOTAL, totalFrames=round(TOTAL * 30), shots=SHOTS, vo=VO, sections=SECTIONS)
    json.dump(out, open(f'{root}/src/v2/timeline.v2.json', 'w'), indent=1)
    for v in VO: print(f"VO {v['id']:12s} {v['at']:5.2f}-{v['end']:5.2f}  {v['text']}")
    for s in SHOTS: print(f"{s['id']:11s} {s['clip']:10s} {s['t0']:5.2f}-{s['t1']:5.2f}  src {s['src']}+  ramp {s['ramp']}  -> {s['out_dur']}s  in:{s['tin']}")
