#!/usr/bin/env python3
"""V4C = V4K re-timed to "Comfort" (excerpt A: song 85.81 s -> 120.31 s = pickup hit + chorus 2 + breakdown/return, 99 BPM).
Every key event is snapped to the nearest song beat (from work/music/comfort_analysis.json). -> src/v4c/timeline.v4c.json
The composition and the sound-design script both read `keys` from that file, so picture and audio stay locked."""
import json, os, sys
import numpy as np
here = os.path.dirname(__file__); sys.path.insert(0, here)
from plan import CLIPS
root = os.path.abspath(os.path.join(here, '..'))
SONG_IN = 85.81; TOTAL = 34.5
an = json.load(open(f'{root}/work/music/comfort_analysis.json'))
BEATS = np.array(an['beats']) - SONG_IN; DOWN = np.array(an['downbeats']) - SONG_IN
snap = lambda t: round(float(BEATS[np.argmin(np.abs(BEATS - t))]), 3)
# desired musical positions (seconds) -> snapped to the beat grid
KEYS = {k: snap(v) for k, v in dict(
    tap=6.06, expand=6.06, expandEnd=6.67, wheels=8.48, shrinkA=9.70, shrinkAEnd=10.91, depart=11.51, arrive=15.15, pin=15.76,
    dive=16.36, diveEnd=16.97, gShrink=18.78, gShrinkEnd=19.39, connect=19.39, kpin=20.0, kglide=20.0, kdive=20.61, kdiveEnd=21.82,
    k2=23.03, r1=24.24, r2=25.45, c1=26.66, r3=27.88, photo=28.48, photoEnd=29.09, morph=31.51, morphEnd=32.12).items()}
CHAT = [(0.61, 'out', 'Girl, December plans?', 0.0), (1.82, 'in', "I'm thinking Ghana!", 0.61), (3.03, 'out', 'Wait, Ghana Ghana?', 0.0),
        (4.24, 'in', 'Heritage + beach vibes!', 0.61), (4.85, 'in', '@location', 0.3),
        (KEYS['photoEnd'], 'in', '@photo', 0.0), (29.70, 'out', "So we're going?", 0.0), (30.91, 'in', 'Already booking with Dexterity!', 0.61)]
CHAT = [(snap(a), b, c, d) for a, b, c, d in CHAT]
K = KEYS
SHOTS = [  # footage beats (chat, map and CTA are native Remotion)
 dict(id='a1_arrival', clip='suitcase',  src=0.6, t0=K['expand'], t1=K['wheels'], pre=0.1, post=0.0, crop=(170, 480, 810, 1440)),
 dict(id='a2_wheels',  clip='terminal',  src=1.0, t0=K['wheels'], t1=K['shrinkA'], pre=0.0, post=1.3, crop=(215, 560, 765, 1360)),
 dict(id='g1_guide',   clip='guide',     src=0.0, t0=K['diveEnd'], t1=K['gShrink'], pre=0.65, post=0.7),
 dict(id='k1_canopy',  clip='kakum_wide',src=1.6, t0=K['kdiveEnd'], t1=K['k2'], pre=1.25, post=0.0),
 dict(id='k2_walk',    clip='kakum_walk',src=2.0, t0=K['k2'], t1=K['r1'], pre=0.0, post=0.35),
 dict(id='r1_table',   clip='restaurant',src=0.0, t0=K['r1'], t1=K['r2'], pre=0.3, post=0.35),
 dict(id='r2_beach',   clip='palms',     src=0.5, t0=K['r2'], t1=K['c1'], pre=0.3, post=0.35),
 dict(id='c1_dance',   clip='dance_a',   src=0.4, t0=K['c1'], t1=K['r3'], pre=0.3, post=0.35),
 dict(id='r3_friends', clip='dance_b',   src=3.6, t0=K['r3'], t1=K['photo'], pre=0.0, post=6.1),
]
if __name__ == '__main__':
    for s in SHOTS:
        s['flag'] = CLIPS[s['clip']]['flag']; d = s['t1'] - s['t0'] + s['pre'] + s['post']
        s['ramp'] = [(round(d + 0.1, 3), 1.0)]; s['out_dur'] = round(d + 0.1, 3); s['src'] = max(0.0, s['src'] - s['pre'] if s['src'] >= s['pre'] else s['src'])
    os.makedirs(f'{root}/src/v4c', exist_ok=True)
    json.dump(dict(fps=30, bpm=99.0, song_in=SONG_IN, total=TOTAL, totalFrames=round(TOTAL * 30), keys=KEYS, shots=SHOTS,
                   downbeats=[round(float(d), 3) for d in DOWN if 0 <= d <= TOTAL], chat=[dict(at=a, side=b, text=c, typing=d) for a, b, c, d in CHAT]),
              open(f'{root}/src/v4c/timeline.v4c.json', 'w'), indent=1)
    print('keys', KEYS); print('chat', [c[0] for c in CHAT]); print('downbeats', [round(float(d), 2) for d in DOWN if 0 <= d <= TOTAL])
    for s in SHOTS: print(f"{s['id']:11s} {s['t0']:6.2f}-{s['t1']:6.2f} file {s['out_dur']}s")
