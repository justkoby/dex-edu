#!/usr/bin/env python3
"""V3C = V3K re-cut to the beat of "Comfort" (excerpt B: song 1.57 s -> 40.57 s, 99.00 BPM, one continuous piece).
Narration placement is unchanged; only cut points move to the nearest song beat/downbeat (see RETIME). -> src/v3c/timeline.v3c.json"""
import json, os, sys, importlib.util
here = os.path.dirname(__file__); root = os.path.abspath(os.path.join(here, '..'))
spec = importlib.util.spec_from_file_location('v3k', os.path.join(here, 'v3k_plan.py')); K = importlib.util.module_from_spec(spec); spec.loader.exec_module(K)
SONG_IN = 1.57                                   # song time at video 0 (downbeats then fall at video 1.81, 4.24, 6.66, 9.09 ...)
# old cut (V3K, 120 BPM grid) -> new cut (song beat/downbeat in video time)
RETIME = {1.5: 1.81, 6.0: 6.06, 9.0: 9.09, 12.0: 12.12, 14.5: 14.54, 20.0: 19.99, 21.9: 21.82, 23.5: 23.63, 25.5: 25.45, 28.0: 28.48,
          29.0: 29.69, 29.5: 30.30, 30.5: 31.51, 31.0: 32.12, 32.0: 32.72, 33.0: 33.33}
PRE = {'whip': 0.2, 'zoom': 0.25, 'match': 0.2, 'sweep': 0.3, 'iris': 0.5, 'cut': 0, 'flash': 0}
if __name__ == '__main__':
    phr = {p['id']: p for p in json.load(open(f'{root}/work/v2/vo_phrases.json'))}
    shots = [dict(s) for s in K.SHOTS]
    for s in shots:
        s['t0'] = RETIME.get(s['t0'], s['t0']); s['t1'] = RETIME.get(s['t1'], s['t1'])
    for i, s in enumerate(shots):
        nxt = shots[i + 1] if i + 1 < len(shots) else None
        need = (s['t1'] - s['t0']) + PRE[s['tin']] + (PRE[nxt['tin']] if nxt else 0) + 0.12
        have = sum(d / sp for d, sp in s['ramp'])
        if have < need:                          # extend the last ramp segment (source seconds) to cover the new length
            d, sp = s['ramp'][-1]; s['ramp'] = s['ramp'][:-1] + [(round(d + (need - have) * sp, 3), sp)]
        s['out_dur'] = round(sum(d / sp for d, sp in s['ramp']), 3); s['flag'] = K.CLIPS[s['clip']]['flag']
    vo = [dict(v) for v in K.VO]
    for v in vo: v.update(dur=phr[v['id']]['dur'], text=phr[v['id']]['script'], end=round(v['at'] + phr[v['id']]['dur'], 3))
    sfx = [dict(e) for e in K.SFX_EXTRA]
    for e in sfx:
        if e['type'] == 'tick' and abs(e['at'] - 9.45) < 0.01: e['at'] = 9.55      # coast pin lands 0.09 s later
        if e['type'] == 'tick' and abs(e['at'] - 20.51) < 0.01: e['at'] = 20.50
        if e['type'] == 'swish' and abs(e['at'] - 34.05) < 0.01: e['at'] = 34.38
    os.makedirs(f'{root}/src/v3c', exist_ok=True)
    json.dump(dict(fps=30, bpm=99.0, song_in=SONG_IN, total=K.TOTAL, totalFrames=round(K.TOTAL * 30), shots=shots, vo=vo, sections=K.SECTIONS,
                   grade_override=K.GRADE_OVERRIDE, sfx_extra=sfx), open(f'{root}/src/v3c/timeline.v3c.json', 'w'), indent=1)
    an = json.load(open(f'{root}/work/music/comfort_analysis.json')); import numpy as np
    beats = np.array(an['beats']) - SONG_IN; downs = set(np.round(np.array(an['downbeats']) - SONG_IN, 2))
    for s in shots:
        err = (beats[np.argmin(np.abs(beats - s['t0']))] - s['t0']) * 1000
        print(f"{s['id']:11s} {s['t0']:6.2f}-{s['t1']:6.2f}  out {s['out_dur']:5.2f}s  cut vs beat {err:+5.0f} ms{'  (downbeat)' if round(s['t0'], 2) in downs else ''}")
