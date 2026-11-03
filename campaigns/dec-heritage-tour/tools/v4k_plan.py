#!/usr/bin/env python3
"""V4K (client revision: Kakum + new brand) based on V4 'The Group Chat' – footage beats only (chat, map and CTA are native Remotion). 120 BPM grid. -> src/v4/timeline.v4.json
t0/t1 = when the footage is the main picture; pre/post = extra seconds the clip must exist for shared-element transitions."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from plan import CLIPS
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TOTAL = 34.5
SHOTS = [  # id, clip, src, t0, t1, pre, post, crop
 dict(id='a1_arrival', clip='suitcase',  src=0.6, t0=6.3,  t1=8.6,  pre=0.5, post=0.0, crop=(170, 480, 810, 1440)),
 dict(id='a2_wheels',  clip='terminal',  src=1.0, t0=8.6,  t1=10.4, pre=0.0, post=0.6, crop=(215, 560, 765, 1360)),
 dict(id='g1_guide',   clip='guide',     src=0.0, t0=17.4, t1=19.3, pre=0.6, post=0.7),                               # revealed from the Cape Coast pin, shrinks back onto it
 dict(id='k1_canopy',  clip='kakum_wide',src=1.6, t0=21.7, t1=23.3, pre=0.7, post=0.0),                               # revealed from the Kakum pin
 dict(id='k2_walk',    clip='kakum_walk',src=2.0, t0=23.3, t1=24.6, pre=0.0, post=0.35),
 dict(id='r1_table',   clip='restaurant',src=0.0, t0=24.6, t1=26.0, pre=0.3, post=0.35),
 dict(id='r2_beach',   clip='palms',     src=0.5, t0=26.0, t1=27.1, pre=0.3, post=0.35),
 dict(id='c1_dance',   clip='dance_a',   src=0.4, t0=27.1, t1=28.0, pre=0.3, post=0.35),
 dict(id='r3_friends', clip='dance_b',   src=3.6, t0=28.0, t1=29.0, pre=0.0, post=5.6),
]
CHAT = [  # (time the bubble lands, side 'out' = Friend A / 'in' = Friend B, text, typing-indicator lead)
 (0.55, 'out', 'Girl, December plans?', 0.0), (1.75, 'in', "I'm thinking Ghana!", 0.55), (2.85, 'out', 'Wait, Ghana Ghana?', 0.0),
 (4.05, 'in', 'Heritage + beach vibes!', 0.6), (5.0, 'in', '@location', 0.45),
 (29.2, 'in', '@photo', 0.0), (30.0, 'out', "So we're going?", 0.0), (31.05, 'in', 'Already booking with Dexterity!', 0.55),
]
if __name__ == '__main__':
    for s in SHOTS:
        s['flag'] = CLIPS[s['clip']]['flag']; d = s['t1'] - s['t0'] + s['pre'] + s['post']
        s['ramp'] = [(round(d + 0.1, 3), 1.0)]; s['out_dur'] = round(d + 0.1, 3); s['src'] = max(0.0, s['src'] - s['pre'] if s['src'] >= s['pre'] else s['src'])
    os.makedirs(f'{root}/src/v4k', exist_ok=True)
    json.dump(dict(fps=30, bpm=120, total=TOTAL, totalFrames=round(TOTAL * 30), shots=SHOTS, chat=[dict(at=a, side=b, text=c, typing=d) for a, b, c, d in CHAT]),
              open(f'{root}/src/v4k/timeline.v4k.json', 'w'), indent=1)
    for s in SHOTS: print(f"{s['id']:11s} {s['clip']:10s} {s['t0']:5.2f}-{s['t1']:5.2f} file {s['out_dur']}s from src {s['src']}")
