"""Tiny numpy synth kit shared by make_sfx.py and make_music.py (everything is generated – no third-party audio)."""
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def tt(d): return np.arange(int(d * SR)) / SR
def env_exp(d, k): return np.exp(-tt(d) * k)
def fade(x, a=0.004, r=0.02):
    n1, n2 = max(1, int(a * SR)), max(1, int(r * SR)); x = x.copy()
    x[:n1] *= np.linspace(0, 1, n1); x[-n2:] *= np.linspace(1, 0, n2); return x
def sine(f, d, ph=0.0): return np.sin(2 * np.pi * f * tt(d) + ph)
def sweep(f0, f1, d, curve=1.0):
    x = np.linspace(0, 1, int(d * SR)) ** curve
    return np.sin(2 * np.pi * np.cumsum(f0 + (f1 - f0) * x) / SR)
def noise(d): return rng.standard_normal(int(d * SR))
def onepole(x, fc, hp=False):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return x - y if hp else y
def lp(x, fc):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, fc, "low", fs=SR, output="sos"), x)
def hp(x, fc):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, fc, "high", fs=SR, output="sos"), x)
def bp(x, f1, f2):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, [f1, f2], "band", fs=SR, output="sos"), x)
def norm(x, peak=0.9): return x / (np.abs(x).max() + 1e-9) * peak
def place(buf, x, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf) or i < 0: return
    n = min(len(x), len(buf) - i); buf[i:i + n] += x[:n] * g
def pluck(f, d, bright=0.5, damp=0.996):
    """Karplus-Strong string: muted highlife-style guitar / kora-ish pluck."""
    n = int(SR / f); buf = rng.uniform(-1, 1, n); buf = lp(buf, 1500 + 7000 * bright)
    out = np.empty(int(d * SR)); 
    for i in range(len(out)):
        out[i] = buf[i % n]; buf[i % n] = damp * 0.5 * (buf[i % n] + buf[(i + 1) % n])
    return out
def marimba(f, d=0.5):
    t = tt(d); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 26) + 0.15 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 50))
def reverb(x, wet=0.2, tail=0.9):
    """cheap stereo-less diffuse tail via a decaying noise convolution"""
    from scipy.signal import fftconvolve
    ir = noise(tail) * np.exp(-tt(tail) * (5.5 / tail)); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    y = fftconvolve(x, ir)[: len(x) + len(ir)]
    out = np.zeros(len(y)); out[: len(x)] += x; return out + wet * y
