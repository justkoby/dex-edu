"""Shared synth instruments + FX (extracted from v2_score.py so new arrangements can reuse them).
Importing loads src/<DEX_VER>/timeline.<DEX_VER>.json for BPM/length and creates empty STEMS."""
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


# ---------------------------------------------------------------- reverb (send) and render
def reverb(x, secs=1.9, mix=0.22):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = np.stack([fnoise(secs, 200, 9000), fnoise(secs, 200, 9000)]) * np.exp(-t * 3.4)
    out = np.zeros_like(x); L = x.shape[1] + n
    for c in range(2):
        out[c] = np.fft.irfft(np.fft.rfft(x[c], L) * np.fft.rfft(ir[c], L), L)[:x.shape[1]]
    out *= mix * np.sqrt((x ** 2).mean() / ((out ** 2).mean() + 1e-12)); return x + out

def render(gain=None):
    """Apply reverb sends, balance stems, write work/<ver>/score_music.wav, score_fx.wav and stems/."""
    global GAIN
    for k, mix in (('keys', 0.35), ('pads', 0.25), ('perc', 0.12), ('fx', 0.2)):
        STEMS[k] = reverb(STEMS[k], mix=mix).astype(np.float32)
    GAIN = gain or dict(drums=0.87, perc=1.6, bass=0.9, keys=1.27, pads=1.27, fx=1.0)
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

