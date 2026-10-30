#!/usr/bin/env python3
"""V4 'The Group Chat' – music-led original score + UI sound design, arranged to src/v4/timeline.v4.json (120 BPM).
No narration. Everything is synthesised (audio/synth_kit.py) – no samples, no third-party audio.
Structure: chat (light groove, message sounds) -> card tap + drop into the airport -> driving map section with riser and
pin -> reveal hit into the tour -> culture cuts -> bright relaxation -> breakdown back to the chat -> CTA resolve.
Writes work/v4/score_music.wav, work/v4/score_fx.wav and stems."""
import os, sys
os.environ['DEX_VER'] = 'v4'
sys.path.insert(0, os.path.dirname(__file__))
from synth_kit import *          # noqa: F401,F403  (instruments, fx, add(), STEMS, T, SR, BEAT, S16, note, ...)

chat = T['chat']; shots = {s['id']: s for s in T['shots']}
# ---------------------------------------------------------------- harmony: bright i–VI–III–VII in A minor, resolving to C at the CTA
CHORDS = [(0, ['A3', 'C4', 'E4', 'B4']), (2, ['F3', 'A3', 'C4', 'E4']), (4, ['C4', 'E4', 'G4', 'D5']), (6, ['G3', 'B3', 'D4', 'A4']),
          (8, ['A3', 'C4', 'E4', 'G4']), (10, ['F3', 'A3', 'C4', 'E4']), (12, ['C4', 'E4', 'G4', 'B4']), (14, ['G3', 'B3', 'D4', 'A4']),
          (16, ['F3', 'A3', 'C4', 'E4']), (18, ['G3', 'B3', 'D4', 'A4']), (20, ['A3', 'C4', 'E4', 'B4']), (22, ['F3', 'A3', 'C4', 'E4']),
          (24, ['C4', 'E4', 'G4', 'D5']), (26, ['G3', 'B3', 'D4', 'A4']), (28, ['F3', 'A3', 'C4', 'E4']), (30, ['G3', 'B3', 'D4', 'A4']),
          (31.5, ['C4', 'E4', 'G4', 'B4', 'E5']), (33.5, ['F3', 'A3', 'C4', 'E4', 'G4'])]
BRIGHT = [(0, 900), (6.2, 900), (6.3, 2600), (10.4, 2000), (17.3, 2000), (17.4, 3200), (25, 3600), (28.8, 3600), (29.2, 900), (31.5, 1200), (31.6, 3000), (35, 2000)]
def bright_at(x): return float(np.interp(x, [b[0] for b in BRIGHT], [b[1] for b in BRIGHT]))
for k, (t0, tones) in enumerate(CHORDS):
    t1 = CHORDS[k + 1][0] if k + 1 < len(CHORDS) else TOTAL - 0.1
    add('pads', pad([note(n) for n in tones], t1 - t0 + 0.12, bright_at(t0 + 0.3), a=0.25), t0, 0.75 if t0 < 6 or 29 <= t0 < 31.5 else 1.0)

def steps(a, b):
    k0 = int(np.ceil(a / S16 - 1e-6)); k1 = int(np.ceil(b / S16 - 1e-6))
    for k in range(k0, k1): yield k * S16, k % 16
def sw(t, i): return t + (0.018 if i % 2 else 0)
def on(t, *ranges): return any(a <= t < b for a, b in ranges)
FULL = ((6.3, 10.4), (17.4, 28.9), (31.6, 34.2)); MAP = ((10.4, 17.4),); LIGHT = ((2.0, 6.0), (29.2, 31.5))
for t, i in steps(0, 34.3):
    if on(t, *FULL, *MAP) and i % 4 == 0: add('drums', kick(1.0 if i in (0, 8) else 0.85), t)
    elif on(t, *LIGHT) and i in (0, 8): add('drums', kick(0.55), t)
    if on(t, *FULL) and i in (4, 12): add('drums', clap(), t, pan=0.05)
    if on(t, *MAP) and i in (4, 12): add('drums', clap(), t, 0.55, pan=0.05)
    if on(t, *FULL) and i in (2, 6, 10, 14): add('drums', ohat(), t, pan=0.3)
    if on(t, (0.5, 34.2)) and not on(t, (29.2, 30.0)):
        acc = 1.0 if i % 4 == 2 else 0.55; g = 0.55 if on(t, (0, 6.3), (29.2, 31.6)) else 1.0
        add('perc', shaker(acc * g), sw(t, i), pan=0.35)
BELL = {0: 'E6', 2: 'E6', 5: 'B5', 7: 'E6', 9: 'E6', 11: 'B5', 13: 'E6'}
for t, i in steps(6.3, 34.2):
    if i in BELL and not on(t, (29.2, 31.6)): add('perc', bell(note(BELL[i])), sw(t, i), 0.7, pan=-0.4)
CONGA = {3: ('D4', False), 6: ('A3', False), 7: ('D4', True), 11: ('A3', False), 14: ('D4', False), 15: ('G4', True)}
for t, i in steps(6.3, 31.5):
    if i in CONGA and on(t, *FULL, *MAP): n, sl = CONGA[i]; add('perc', conga(note(n), sl), sw(t, i), 0.85, pan=0.45)
ROOT = {0: 'A1', 2: 'F1', 4: 'C2', 6: 'G1', 8: 'A1', 10: 'F1', 12: 'C2', 14: 'G1', 16: 'F1', 18: 'G1', 20: 'A1', 22: 'F1', 24: 'C2', 26: 'G1', 28: 'F1', 30: 'G1', 31.5: 'C2', 33.5: 'F1'}
def root_at(t): return note([v for k, v in sorted(ROOT.items()) if k <= t + 1e-6][-1])
for t, i in steps(6.3, 34.2):
    if on(t, *FULL, *MAP) and i in (0, 3, 6, 10, 12, 14): add('bass', logdrum(root_at(t) * (2 if i in (10, 14) else 1)), t, 0.9)
for at, n, d in ((6.3, 'A1', 1.8), (17.4, 'A1', 1.8), (31.6, 'C2', 2.2)): add('bass', sub(note(n), d, 0.9), at)
# kalimba: one pluck per chat message (rising), travel arpeggio on the map, hook in the relaxation section, button at the end
PL = ['E5', 'G5', 'A5', 'C6', 'D6', 'E5', 'G5']
for k, m in enumerate(chat): add('keys', kalimba(note(PL[k % len(PL)]), 1.1, 0.55), m['at'], pan=0.3 if m['side'] == 'out' else -0.3)
ARP = ['A4', 'C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C5']
for t, i in steps(10.6, 17.2):
    if i % 2 == 0: add('keys', kalimba(note(ARP[(i // 2) % 8]), 0.6, 0.5), t, pan=0.25 if i % 4 else -0.25)
HOOK = [(0, 'E5'), (2, 'G5'), (4, 'A5'), (7, 'E5'), (9, 'D5'), (11, 'C5'), (14, 'A4')]
for b in (25.0, 27.0, 32.0):
    for s, n in HOOK: add('keys', kalimba(note(n), g=0.8), b + s * S16, pan=0.15)
for n in ('C5', 'G5', 'C6'): add('keys', kalimba(note(n), 2.0, 0.9), 34.0)

# ---------------------------------------------------------------- UI + transition sound design
def send_snd():
    t = t_(0.12); f = 600 + 900 * (t / 0.12); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * 0.22
def recv_snd():
    out = np.zeros(int(0.3 * SR))
    for k, f in enumerate((1318.5, 1760.0)):
        t = t_(0.22); y = np.sin(2 * np.pi * f * t) * np.exp(-t * 22); i = int(k * 0.075 * SR); out[i:i + len(y)] += y
    return out * 0.16
def tap_snd(): return fnoise(0.02, 1500, 7000) * np.hanning(int(0.02 * SR)) * 0.5
def blip(f=880): t = t_(0.15); return np.sin(2 * np.pi * f * t) * np.exp(-t * 28) * 0.18
for m in chat:
    if m['typing'] > 0: add('fx', blip(660) * 0.5, m['at'] - m['typing'], 0.7)          # typing indicator appears
    add('fx', send_snd() if m['side'] == 'out' else recv_snd(), m['at'] - 0.02, 1.0, pan=0.25 if m['side'] == 'out' else -0.25)
add('fx', tap_snd(), 6.0, 1.0)                                   # tap on the Ghana card
add('fx', whoosh(0.5, 300, 9000), 6.0, 0.9)                      # card expands
add('fx', impact(0.8), 6.3)                                      # drop into the airport
add('fx', chime(), 6.5, 0.6)
add('fx', whoosh(0.7, 200, 6000), 9.95, 0.8, pan=-0.3)          # footage shrinks into the Accra marker
add('fx', blip(990), 10.75, 1.0)                                 # marker lands
add('fx', riser(1.3), 15.6, 0.8)
add('fx', blip(1320), 16.3, 1.2)                                 # Cape Coast pin drop
add('fx', whoosh(0.6, 400, 9000), 16.8, 0.9)                     # zoom into the pin
add('fx', impact(0.9), 17.4)                                     # reveal: the tour
for c in (20.0, 21.0, 22.0, 23.0, 23.75, 25.0, 27.0, 28.0): add('fx', whoosh(0.25, 2000, 12000), c - 0.12, 0.35)
add('fx', sea(3.6), 25.0, 0.8)
add('fx', whoosh(0.7, 300, 7000), 28.55, 0.8, pan=0.3)          # footage shrinks into a photo message
add('fx', riser(0.9), 30.7, 0.7)
add('fx', whoosh(0.5, 400, 9000), 31.35, 0.9)                    # bubble -> CTA morph
add('fx', impact(0.7), 31.6)

render()
