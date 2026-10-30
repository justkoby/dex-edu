#!/usr/bin/env python3
"""Builds src/timeline.json: global shot timing from VO scene windows, internal cuts nudged onto music onsets."""
import json, sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from plan import SCENES, CLIPS, LEAD, TAIL
FPS = 30
root = os.path.join(os.path.dirname(__file__), '..')
vo = json.load(open(f'{root}/work/timeline_vo.json'))
tl = vo['timeline']
# scene windows (global seconds): boundaries at the centre of the pause between VO scenes
bounds = [0.0]
starts = [LEAD + t['start'] for t in tl]; ends = [LEAD + t['end'] for t in tl]
scene_vo_end = [ends[0], ends[1], ends[2], ends[3], ends[4], ends[6]]
scene_vo_start = [starts[0], starts[1], starts[2], starts[3], starts[4], starts[5]]
for i in range(5): bounds.append(round((scene_vo_end[i] + scene_vo_start[i+1]) / 2, 3))
total = round(ends[6] + TAIL, 3)
bounds.append(total)
# music onsets for snapping
flux = np.load(f'{root}/work/flux.npy'); fps_f = 22050/512
thr = np.percentile(flux, 82)
pk = [i for i in range(2, len(flux)-2) if flux[i] > thr and flux[i] == flux[i-2:i+3].max()]
onsets = np.array([p / fps_f for p in pk])
def snap(t, tol=0.28):
    d = np.abs(onsets - t); j = d.argmin()
    return float(onsets[j]) if d[j] <= tol else t
frame = lambda t: round(t * FPS) / FPS
shots = []
for si, sc in enumerate(SCENES):
    a, b = bounds[si], bounds[si+1]
    raw = sc['shots']; n = len(raw)
    # nominal cut times proportional to plan durations, scaled to the window
    plan_d = np.array([s[2] for s in raw]); cum = np.cumsum(plan_d) / plan_d.sum() * (b - a)
    cuts = [a]
    for k in range(n-1):
        t = a + cum[k]
        t = snap(t) if si != 5 or k < n-2 else t     # keep the final (end-card) hold cut where planned
        cuts.append(frame(min(max(t, cuts[-1] + 1.6), b - 1.6)))
    cuts.append(b)
    if si == 5:                                       # palms hand-over to the end card at a fixed point
        cuts[-2] = frame(scene_vo_end[5] - 8.7 if False else cuts[-2])
    for k, (clip, sin, d, tt, td) in enumerate(raw):
        shots.append(dict(id=f'{sc["id"]}_{k}', scene=sc['id'], clip=clip, start=frame(cuts[k]), end=frame(cuts[k+1]),
                          srcIn=sin, trans=dict(type=tt, dur=td) if k > 0 or si > 0 else dict(type='cut', dur=0),
                          flag=CLIPS[clip]['flag']))
for i, s in enumerate(shots):
    s['dur'] = round(s['end'] - s['start'], 3)
    s['head'] = round(s['trans']['dur']/2, 3)
    s['tail'] = round(shots[i+1]['trans']['dur']/2, 3) if i+1 < len(shots) else 0.0
out = dict(fps=FPS, total=total, totalFrames=round(total*FPS), lead=LEAD, voStart=LEAD, voEnd=ends[6],
           scenes=[dict(id=SCENES[i]['id'], start=bounds[i], end=bounds[i+1]) for i in range(6)],
           vo=[dict(scene=tl[i]['scene'], start=round(starts[i],3), end=round(ends[i],3)) for i in range(7)],
           shots=shots)
json.dump(out, open(f'{root}/src/timeline.json', 'w'), indent=1)
for s in shots: print(f"{s['id']:16s} {s['clip']:10s} {s['start']:7.2f}-{s['end']:7.2f} ({s['dur']:5.2f}) {s['trans']['type']}")
print('total', total, 'frames', out['totalFrames'])
