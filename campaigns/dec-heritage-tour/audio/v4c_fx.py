#!/usr/bin/env python3
"""V4C sound design only (no score): UI + transition + ambience cues placed from the beat-snapped keys in
src/v4c/timeline.v4c.json, so effects land on the same beats as the picture. Writes work/v4c/score_fx.wav (and stems)."""
import os, sys
os.environ['DEX_VER'] = 'v4c'
sys.path.insert(0, os.path.dirname(__file__))
from synth_kit import *          # noqa: F401,F403
K = T['keys']; chat = T['chat']
def send_snd():
    t = t_(0.12); f = 600 + 900 * (t / 0.12); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * 0.22
def recv_snd():
    out = np.zeros(int(0.3 * SR))
    for k, f in enumerate((1318.5, 1760.0)):
        t = t_(0.22); y = np.sin(2 * np.pi * f * t) * np.exp(-t * 22); i = int(k * 0.075 * SR); out[i:i + len(y)] += y
    return out * 0.16
def blip(f=880): t = t_(0.15); return np.sin(2 * np.pi * f * t) * np.exp(-t * 28) * 0.18
def tap_snd(): return fnoise(0.02, 1500, 7000) * np.hanning(int(0.02 * SR)) * 0.5
for m in chat:
    if m['typing'] > 0: add('fx', blip(660) * 0.5, m['at'] - m['typing'], 0.7)
    add('fx', send_snd() if m['side'] == 'out' else recv_snd(), m['at'] - 0.02, 1.0, pan=0.25 if m['side'] == 'out' else -0.25)
add('fx', tap_snd(), K['tap'], 1.0)
add('fx', whoosh(0.5, 300, 9000), K['expand'] - 0.1, 0.8)
add('fx', impact(0.55), K['expandEnd'])                          # lands with the song (no double drop: the song already carries it)
add('fx', chime(), K['expandEnd'] + 0.15, 0.45)
add('fx', whoosh(0.7, 200, 6000), K['shrinkA'] - 0.1, 0.7, pan=-0.3)
add('fx', blip(990), K['shrinkAEnd'] - 0.05, 0.9)
add('fx', riser(1.0), K['pin'] - 1.0, 0.5)
add('fx', blip(1320), K['pin'] + 0.3, 1.0)
add('fx', whoosh(0.6, 400, 9000), K['dive'] + 0.1, 0.8)
add('fx', impact(0.6), K['diveEnd'])
add('fx', whoosh(0.6, 200, 6000), K['gShrink'], 0.7, pan=-0.2)
add('fx', blip(1100) * 0.6, K['connect'] + 0.05, 0.7)
add('fx', blip(1480), K['kpin'] + 0.3, 1.0)
add('fx', whoosh(0.6, 400, 9000), K['kdive'] + 0.3, 0.8)
add('fx', impact(0.6), K['kdiveEnd'])
bed = fnoise(2.4, 400, 7000) * np.sin(np.pi * np.clip(t_(2.4) / 2.4, 0, 1)) * 0.05
add('fx', np.stack([bed, np.roll(bed, 900)]), K['kdiveEnd'] - 0.1, 1.0)
for dt, f0, pn in ((0.2, 2900, -0.5), (0.8, 3400, 0.4), (1.5, 2600, -0.2)):
    tc = t_(0.16); fr = f0 * (1 + 0.25 * np.sin(2 * np.pi * 9 * tc)) * (1 + 0.3 * tc / 0.16)
    add('fx', np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * tc / 0.16) ** 2 * 0.045, K['kdiveEnd'] + dt, 1.0, pan=pn)
for c in (K['k2'], K['r1'], K['r2'], K['c1'], K['r3']): add('fx', whoosh(0.25, 2000, 12000), c - 0.12, 0.3)
add('fx', sea(2.4), K['r1'], 0.7)
add('fx', whoosh(0.7, 300, 7000), K['photo'] - 0.05, 0.7, pan=0.3)
add('fx', whoosh(0.5, 400, 9000), K['morph'] - 0.2, 0.8)
add('fx', impact(0.5), K['morph'] + 0.05)
render()
