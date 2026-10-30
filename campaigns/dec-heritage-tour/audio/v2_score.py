#!/usr/bin/env python3
"""Original Afro-cinematic score for V2, synthesised in code (no samples, no third-party material -> owned outright).
120 BPM, A minor. Arranged to src/v2/timeline.v2.json: sections, cut points and hit points come from the edit.
Instruments: kick, amapiano-style log drum, shaker, bell (Ghanaian-style timeline pattern), congas, clap, open hat,
kalimba, pad (additive detuned saws with brightness automation), sub; plus SFX (impacts, riser, whooshes, shutter,
arrival chime, sea wash, shimmer). Writes stems to work/v2/stems/ so a composer can rebalance or replace any layer.
"""
import json, os, wave
import numpy as np

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
VER = os.environ.get('DEX_VER', 'v2'); OUT = f'{root}/work/{VER}'
T = json.load(open(f'{root}/src/{VER}/timeline.{VER}.json'))
SR = 48000; BPM = T['bpm']; BEAT = 60 / BPM; S16 = BEAT / 4; BAR = BEAT * 4
TOTAL = T['total'] + 0.6                      # ring-out beyond the picture is trimmed by the mix
N = int(TOTAL * SR)
rng = np.random.default_rng(7)
STEMS = {k: np.zeros((2, N), np.float32) for k in ('drums', 'perc', 'bass', 'keys', 'pads', 'fx')}

def t_(d): return np.arange(int(d * SR)) / SR
def add(stem, x, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= N or i + x.shape[-1] <= 0: return
    if x.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        x = np.stack([x * l * 1.414, x * r * 1.414])
    j = min(N, i + x.shape[1]); STEMS[stem][:, i:j] += (x[:, :j - i] * gain).astype(np.float32)
def note(name):
    names = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
    n, o = name[:-1], int(name[-1]); return 440.0 * 2 ** ((names[n] + 12 * (o - 4)) / 12)
def fnoise(d, lo, hi):
    """band-limited noise via FFT masking"""
    n = int(d * SR); X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)
def env(d, a, dec):
    t = t_(d); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * dec); return e

# ---------------------------------------------------------------- instruments
def kick(g=1.0):
    t = t_(0.5); f = 46 + 95 * np.exp(-t * 32); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * 6.5); y[:120] += fnoise(0.0025, 1500, 8000)[:120] * 0.25
    return np.tanh(1.6 * y) * g
def logdrum(freq, d=0.42):
    t = t_(d); f = freq * (1 + 0.55 * np.exp(-t * 55)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    return np.tanh(2.2 * y * env(d, 0.004, 7.5)) * 0.55
def shaker(acc=1.0):
    y = fnoise(0.09, 5500, 14000) * env(0.09, 0.006, 55); return y * 0.16 * acc
def bell(freq):
    t = t_(0.35); idx = 2.4 * np.exp(-t * 18)
    y = np.sin(2 * np.pi * freq * t + idx * np.sin(2 * np.pi * freq * 3.5 * t)) * env(0.35, 0.001, 13)
    return y * 0.16
def conga(freq, slap=False):
    t = t_(0.25); f = freq * (1 + 0.08 * np.exp(-t * 40)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * env(0.25, 0.002, 16 if not slap else 26)
    y += fnoise(0.25, 800, 5000) * env(0.25, 0.001, 90) * (0.6 if slap else 0.25)
    return y * 0.3
def clap():
    y = np.zeros(int(0.22 * SR))
    for k, dl in enumerate((0, 0.009, 0.019)):
        b = fnoise(0.2, 900, 6000) * env(0.2, 0.001, 30 if k == 2 else 160); i = int(dl * SR); y[i:i + len(b)] += b[:len(y) - i]
    return y * 0.16
def ohat():
    return fnoise(0.22, 7000, 16000) * env(0.22, 0.003, 14) * 0.07
def kalimba(freq, d=1.4, g=1.0):
    t = t_(d)
    y = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 2.6) + 0.25 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t * 9)
         + 0.12 * np.sin(2 * np.pi * freq * 5.43 * t) * np.exp(-t * 22))
    y[:240] += fnoise(0.005, 2000, 9000)[:240] * 0.05
    return y * np.minimum(1, t / 0.002) * 0.22 * g
def pad(freqs, d, bright, a=0.5, r=0.8):
    """additive detuned saws; `bright` = lowpass corner (Hz) applied to the harmonic series"""
    t = t_(d + r); out = np.zeros((2, len(t)))
    e = np.minimum(1, t / a) * np.where(t > d, np.exp(-(t - d) * 4 / r), 1.0)
    for fi, f0 in enumerate(freqs):
        for v, det in enumerate((-0.006, 0.0, 0.0065)):
            f = f0 * (1 + det); y = np.zeros(len(t))
            for k in range(1, 28):
                if f * k > 9000: break
                y += np.sin(2 * np.pi * f * k * t + rng.uniform(0, 6.28)) / k / (1 + (f * k / bright) ** 4)
            pan = (v - 1) * 0.6
            out[0] += y * np.cos((pan + 1) * np.pi / 4); out[1] += y * np.sin((pan + 1) * np.pi / 4)
    return out * e * 0.035
def sub(freq, d, g=1.0):
    t = t_(d); return np.sin(2 * np.pi * freq * t) * env(d, 0.01, 2.2) * 0.5 * g

# ---------------------------------------------------------------- fx
def impact(g=1.0):
    t = t_(2.2); f = 38 + 60 * np.exp(-t * 9); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    y += fnoise(2.2, 60, 2500) * np.exp(-t * 7) * 0.35
    return np.tanh(1.4 * y) * 0.6 * g
def riser(d):
    t = t_(d); x = t / d; out = np.zeros(len(t)); seg = int(0.05 * SR)
    for i in range(0, len(t), seg):             # rising band-pass noise, built in 50 ms slices
        c = 400 + 7000 * x[i] ** 2; out[i:i + seg] = fnoise(seg / SR, c * 0.6, c * 1.6)[:len(out[i:i + seg])]
    tone = np.sin(2 * np.pi * np.cumsum(110 * 2 ** (2 * x)) / SR) * 0.25
    return (out * 0.5 + tone) * x ** 2.2 * 0.35
def whoosh(d=0.6, lo=300, hi=6000):
    t = t_(d); e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2.5; return fnoise(d, lo, hi) * e * 0.3
def shutter():
    y = np.zeros(int(0.12 * SR)); a = fnoise(0.004, 2000, 12000) * np.hanning(int(0.004 * SR)); b = fnoise(0.01, 1500, 9000) * np.hanning(int(0.01 * SR))
    y[:len(a)] += a; i = int(0.055 * SR); y[i:i + len(b)] += b * 0.7; return y * 0.5
def chime():
    out = np.zeros(int(1.9 * SR))
    for k, (n, at) in enumerate((('E5', 0.0), ('C5', 0.42))):
        t = t_(1.4); f = note(n); y = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(1.4, 0.004, 3.2)
        i = int(at * SR); out[i:i + len(y)] += y
    return out * 0.12
def sea(d):
    t = t_(d); lfo = 0.55 + 0.45 * np.sin(2 * np.pi * 0.11 * t) * np.sin(2 * np.pi * 0.047 * t + 1)
    return fnoise(d, 150, 3200) * lfo * 0.06

# ---------------------------------------------------------------- arrangement
sec = {s['id']: s for s in T['sections']}
CHORDS = [  # (start s, root, chord tones) – A minor: i–VI–III–VII, heritage darkens (iv, V), resolve to i at the end
    (0, 'A', ['A3', 'C4', 'E4', 'B4']), (2, 'F', ['F3', 'A3', 'C4', 'E4']), (4, 'C', ['C4', 'E4', 'G4', 'D5']),
    (6, 'G', ['G3', 'B3', 'D4', 'A4']), (8, 'A', ['A3', 'C4', 'E4', 'G4']), (10, 'F', ['F3', 'A3', 'C4', 'G4']),
    (12, 'D', ['D3', 'F3', 'A3', 'C4']), (14, 'A', ['A3', 'C4', 'E4']), (16, 'F', ['F3', 'A3', 'C4', 'E4']), (18, 'E', ['E3', 'G#3', 'B3', 'D4']),
    (20, 'F', ['F3', 'A3', 'C4', 'E4']), (22, 'C', ['C4', 'E4', 'G4', 'D5']), (24, 'G', ['G3', 'B3', 'D4', 'A4']), (26, 'A', ['A3', 'C4', 'E4', 'B4']),
    (28, 'F', ['F3', 'A3', 'C4', 'E4']), (30, 'G', ['G3', 'B3', 'D4', 'A4']), (32, 'A', ['A3', 'C4', 'E4', 'G4']),
    (33, 'F', ['F3', 'A3', 'C4', 'E4', 'G4']), (35, 'G', ['G3', 'B3', 'D4', 'A4']), (37, 'A', ['A3', 'C4', 'E4', 'B4', 'E5']),
]
BRIGHT = [(0, 700), (5.5, 900), (6, 1500), (11.5, 2200), (12, 800), (19.5, 1000), (20, 2400), (27.5, 2800), (28, 3600), (33, 1800), (39.6, 1500)]
def bright_at(t): return float(np.interp(t, [b[0] for b in BRIGHT], [b[1] for b in BRIGHT]))
for k, (t0, rt, tones) in enumerate(CHORDS):
    t1 = CHORDS[k + 1][0] if k + 1 < len(CHORDS) else TOTAL - 0.2
    g = 0.7 if t0 < 6 else 1.0
    add('pads', pad([note(n) for n in tones], t1 - t0 + 0.15, bright_at(t0 + 0.5), a=0.35 if t0 else 0.9), t0, g)

def steps(t0, t1):
    """16th-note grid times in [t0, t1) with their index in the bar"""
    k0 = int(np.ceil(t0 / S16 - 1e-6)); k1 = int(np.ceil(t1 / S16 - 1e-6))
    for k in range(k0, k1): yield k * S16, k % 16
SWING = 0.018
def sw(t, i): return t + (SWING if i % 2 else 0)

def in_(t, a, b): return a <= t < b
# kick
for t, i in steps(0, 39.0):
    four = i % 4 == 0
    if in_(t, 4, 6) and i in (0, 8): add('drums', kick(0.7), t)
    elif (in_(t, 6, 12) or in_(t, 20, 32.75)) and four: add('drums', kick(1.0 if i in (0, 8) else 0.9), t)
    elif in_(t, 12, 20) and i in (0, 10): add('drums', kick(0.95), t)                 # half-time, syncopated
    elif in_(t, 33, 37) and i in (0, 8): add('drums', kick(0.6), t)
    if in_(t, 28, 32.75) and i in (14,): add('drums', kick(0.6), t)                    # pickup kick in the montage
# claps 2 & 4
for t, i in steps(20, 32.75):
    if i in (4, 12): add('drums', clap(), t, pan=0.05)
# open hats (montage) on the off-beats
for t, i in steps(28, 32.75):
    if i in (2, 6, 10, 14): add('drums', ohat(), t, pan=0.3)
# shaker 16ths (swung, accented off-beats)
for t, i in steps(1.5, 37.0):
    if in_(t, 12, 20) and i % 2: continue                                              # sparser in the heritage section
    acc = 1.0 if i % 4 == 2 else 0.55
    add('perc', shaker(acc * (0.6 if t < 6 else 1.0)), sw(t, i), pan=0.35)
# bell timeline (Ghanaian-style 7-stroke pattern mapped to 16ths)
BELL = {0: 'E6', 2: 'E6', 5: 'B5', 7: 'E6', 9: 'E6', 11: 'B5', 13: 'E6'}
for t, i in steps(2.0, 37.0):
    if i in BELL and not in_(t, 12, 14): add('perc', bell(note(BELL[i])), sw(t, i), 0.55 if in_(t, 12, 20) else 0.8, pan=-0.4)
# congas
CONGA = {3: ('D4', False), 6: ('A3', False), 7: ('D4', True), 11: ('A3', False), 14: ('D4', False), 15: ('G4', True)}
for t, i in steps(4.0, 33.0):
    if i in CONGA and (not in_(t, 12, 20) or i in (6, 14)):
        n, sl = CONGA[i]; add('perc', conga(note(n), sl), sw(t, i), 0.9, pan=0.45)
for t, i in steps(32.0, 33.0):                                                          # fill into the CTA
    if i % 2 == 0: add('perc', conga(note('D4') * (1 + i / 30), True), t, 0.8, pan=0.3)
# log drum bass
LOG = [0, 3, 6, 10, 12, 14]
def root_at(t):
    r = [c for c in CHORDS if c[0] <= t + 1e-6][-1][1]; return note(r + '1') if r not in ('A', 'G', 'G#') else note(r + '1')
for t, i in steps(6, 37.0):
    if in_(t, 12, 20) and i not in (0, 10): continue
    if i in LOG:
        f = root_at(t) * (2 if i in (10, 14) else 1)
        add('bass', logdrum(f), t, 0.9 if not in_(t, 33, 37) else 0.6)
# sub swells at section changes
for at, n, d in ((0.0, 'A1', 2.0), (12.0, 'D1', 2.0), (28.0, 'F1', 1.6), (37.0, 'A1', 2.2)):
    add('bass', sub(note(n), d, 0.9), at)
# kalimba
HOOK = [(0, 'E5'), (2, 'G5'), (4, 'A5'), (7, 'E5'), (9, 'D5'), (11, 'C5'), (14, 'A4')]       # 16th steps within a bar
def motif(bar_t, g=1.0, transpose=1.0):
    for s, n in HOOK: add('keys', kalimba(note(n) * transpose, g=g), bar_t + s * S16, pan=0.15 * (1 if s % 4 else -1))
motif(0.5, 0.55); motif(4.0, 0.45)
for b in (20, 22, 24, 26): motif(b, 0.9 if b in (20, 24) else 0.7)
ARP = ['A4', 'C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C5']
for t, i in steps(28, 32.75):
    if i % 2 == 0: add('keys', kalimba(note(ARP[(i // 2) % 8]), 0.6, 0.55), t, pan=0.25 if i % 4 else -0.25)
motif(33.5, 0.7)
for n, dt in (('A4', 0), ('E5', 0.0), ('A5', 0.02)):                                      # final button at the logo lock-up end
    add('keys', kalimba(note(n), 2.0, 1.0), 38.25 + dt)
# heritage: low kalimba "talking" phrase answers the narration
for at, n in ((14.25, 'A3'), (14.5, 'C4'), (16.25, 'E4'), (16.5, 'D4'), (18.25, 'C4'), (18.5, 'B3')):
    add('keys', kalimba(note(n), 1.2, 0.8), at)

# ---------------------------------------------------------------- sfx (cuts from the timeline)
shots = {s['id']: s for s in T['shots']}
add('fx', impact(1.0), 0.0)
add('fx', chime(), shots['h2_arrival']['t0'] + 0.05, 0.9, pan=0.1)                      # arrival PA chime on the Accra cut
add('fx', whoosh(0.5, 500, 9000), shots['j2_coast']['t0'] - 0.22, 0.75, pan=0.5)       # whip-pan (starts after the last spoken word)
add('fx', riser(1.9), shots['g1_fort']['t0'] - 1.9, 0.9)
add('fx', impact(0.9), shots['g1_fort']['t0'])
add('fx', whoosh(0.45, 200, 2500), shots['g2_guide']['t0'] - 0.25, 0.5)                 # soft air on the graphic match
add('fx', riser(0.9) * 0.6, shots['r1_table']['t0'] - 0.9, 0.7)                         # shimmer into the light sweep
add('fx', sea(8.6), shots['r1_table']['t0'] - 0.2, 1.0)
for sid in ('j1_window', 'm1_dance', 'm4_friends'): add('fx', shutter(), shots[sid]['t0'] - 0.01, 0.9, pan=0.2)
add('fx', impact(0.7), shots['m1_dance']['t0'])
add('fx', whoosh(0.7, 300, 8000), shots['c1_plate']['t0'] - 0.25, 0.9, pan=-0.4)       # brand wipe
add('fx', impact(0.45), shots['c1_plate']['t0'] + 0.15)

def tick():                                            # soft wooden 'pin drop' tick (V3 location graphic)
    t = t_(0.18); y = np.sin(2 * np.pi * 1850 * t) * np.exp(-t * 60) + 0.5 * np.sin(2 * np.pi * 920 * t) * np.exp(-t * 35)
    return y * 0.18
for e in T.get('sfx_extra', []):                       # understated cues placed by the edit (V3)
    if e['type'] == 'tick': add('fx', tick(), e['at'], e.get('gain', 1.0), pan=-0.2)
    if e['type'] == 'swish': add('fx', whoosh(e.get('dur', 0.4), 1500, 11000), e['at'] - e.get('dur', 0.4) * 0.6, e.get('gain', 0.5), pan=e.get('pan', 0.0))

# ---------------------------------------------------------------- reverb (send) and render
def reverb(x, secs=1.9, mix=0.22):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = np.stack([fnoise(secs, 200, 9000), fnoise(secs, 200, 9000)]) * np.exp(-t * 3.4)
    out = np.zeros_like(x); L = x.shape[1] + n
    for c in range(2):
        out[c] = np.fft.irfft(np.fft.rfft(x[c], L) * np.fft.rfft(ir[c], L), L)[:x.shape[1]]
    out *= mix * np.sqrt((x ** 2).mean() / ((out ** 2).mean() + 1e-12)); return x + out
for k, mix in (('keys', 0.35), ('pads', 0.25), ('perc', 0.12), ('fx', 0.2)):
    STEMS[k] = reverb(STEMS[k], mix=mix).astype(np.float32)
GAIN = dict(drums=0.87, perc=1.6, bass=0.9, keys=1.27, pads=1.27, fx=1.0)
os.makedirs(f'{OUT}/stems', exist_ok=True)
def write(p, x):
    with wave.open(p, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x.T, -1, 1) * 32767).astype(np.int16).tobytes())
mus = sum(STEMS[k] * GAIN[k] for k in STEMS if k != 'fx'); fx = STEMS['fx'] * GAIN['fx']
pk = max(np.abs(mus).max(), np.abs(fx).max()); sc = 0.7 / pk
for k in STEMS: write(f'{OUT}/stems/{k}.wav', STEMS[k] * GAIN[k] * sc)
write(f'{OUT}/score_music.wav', mus * sc); write(f'{OUT}/score_fx.wav', fx * sc)
print('score written', TOTAL, 's; stems:', ', '.join(STEMS))
