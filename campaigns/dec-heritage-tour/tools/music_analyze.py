#!/usr/bin/env python3
"""Music analysis for edit planning: tempo, beat grid, downbeats, bars, energy sections, repeated (hook) phrases.

usage: music_analyze.py <audio file> <out.json> [--png out.png] [--bpm-prior 105]

Method (all measured from the audio, nothing assumed):
  * onset strength = positive spectral flux of log-magnitude STFT (22.05 kHz, hop 512 ≈ 23 ms)
  * tempo = autocorrelation of the onset curve over 70–180 BPM with a mild log-normal prior; octave errors resolved by the
    prior; refined to 0.05 BPM by maximising beat-aligned onset energy
  * beats = dynamic-programming beat tracker (Ellis 2007) on the onset curve with that tempo
  * downbeats = the beat phase (0–3) whose beats carry the most low-frequency (kick/bass, 30–160 Hz) onset energy
  * bars → per-bar loudness, low-end energy, brightness, and a timbre/chroma feature; phrase boundaries from a
    checkerboard novelty curve on the bar self-similarity matrix
  * hook candidates = 8-bar windows starting on downbeats, scored by loudness, low-end drive and how often the same
    material repeats elsewhere in the song (choruses repeat; intros/bridges usually don't)
"""
import argparse, json, subprocess
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('out'); ap.add_argument('--png'); ap.add_argument('--bpm-prior', type=float, default=105)
a = ap.parse_args()
SR, N, HOP = 22050, 2048, 512
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', a.src, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32)
dur = len(x) / SR
win = np.hanning(N); nfr = 1 + (len(x) - N) // HOP
S = np.abs(np.stack([np.fft.rfft(x[i * HOP:i * HOP + N] * win) for i in range(nfr)]))     # frames x bins
freqs = np.fft.rfftfreq(N, 1 / SR); fps = SR / HOP
L = np.log1p(100 * S)
# band-weighted flux: kick/bass and snare/body dominate, hats/shakers count less (they sit on off-beats in Afro grooves)
wgt = np.where(freqs < 200, 2.0, np.where(freqs < 2500, 1.0, 0.3))
flux = (np.maximum(0, np.diff(L, axis=0)) * wgt).sum(1); flux = np.concatenate([[0], flux])
onset = flux - np.convolve(flux, np.ones(16) / 16, 'same'); onset = np.maximum(onset, 0); onset /= onset.std() + 1e-9
low = (freqs >= 30) & (freqs <= 160)
lowflux = np.concatenate([[0], np.maximum(0, np.diff(L[:, low], axis=0)).sum(1)])

# ---- tempo
def ac_score(bpm):
    lag = 60 * fps / bpm; i = int(lag); f = lag - i
    ac = lambda k: float(np.dot(onset[:-k], onset[k:])) if k > 0 else 0.0
    return (1 - f) * ac(i) + f * ac(i + 1)
cands = np.arange(70, 180.01, 0.5)
raw = np.array([ac_score(b) for b in cands])
prior = np.exp(-0.5 * (np.log2(cands / a.bpm_prior) / 0.6) ** 2)
bpm0 = float(cands[np.argmax(raw * prior)])
def grid_energy(bpm):
    per = 60 * fps / bpm; best = 0
    for ph in np.linspace(0, per, 24, endpoint=False):
        idx = np.round(np.arange(ph, len(onset) - 1, per)).astype(int); best = max(best, onset[idx].mean())
    return best
fine = np.arange(bpm0 - 1.5, bpm0 + 1.5001, 0.05)
bpm = float(fine[np.argmax([grid_energy(b) for b in fine])])

# ---- beat tracking (dynamic programming)
per = 60 * fps / bpm; alpha = 100.0
score = onset.copy(); back = -np.ones(len(onset), int)
for t in range(len(onset)):
    lo, hi = int(t - 2 * per), int(t - per / 2)
    if hi <= 0: continue
    lo = max(lo, 0); prev = np.arange(lo, hi)
    pen = -alpha * np.log((t - prev) / per) ** 2
    k = np.argmax(score[prev] + pen); score[t] = onset[t] + score[prev][k] + pen[k]; back[t] = prev[k]
t = int(np.argmax(score[-int(per * 2):]) + len(score) - int(per * 2)); beats = []
while t >= 0: beats.append(t); t = back[t]
beats = np.array(beats[::-1]); bt_raw = beats / fps + (N / 2) / SR    # frame index -> window centre (seconds)
# produced music sits on a fixed click: fit a straight line through the tracked beats (robust: iterate, dropping outliers)
k = np.arange(len(bt_raw)); keep = np.ones(len(k), bool)
for _ in range(3):
    sl, c0 = np.polyfit(k[keep], bt_raw[keep], 1); res = bt_raw - (sl * k + c0); keep = np.abs(res) < max(0.035, 2.5 * res[keep].std())
grid_rms_ms = float(np.sqrt((res[keep] ** 2).mean()) * 1000); steady = grid_rms_ms < 30 and keep.mean() > 0.8
bpm_fit = 60 / sl
if steady:                                          # constant tempo -> clean grid extended over the whole file
    k0 = int(np.floor(-c0 / sl)) + 1; bt = sl * np.arange(k0, int((dur - c0) / sl) + 1) + c0; bt = bt[(bt >= 0) & (bt < dur)]; bpm = float(bpm_fit)
else:
    bt = bt_raw
beats = np.round((bt - (N / 2) / SR) * fps).astype(int).clip(0, len(onset) - 1)

# ---- downbeats
# downbeat phase: low-end hits + harmonic change (chords usually change on the 1)
band = (freqs > 55) & (freqs < 5000); pcs = np.round(12 * np.log2(freqs[band] / 440)) % 12
def chroma_at(i0, i1):
    m = S[max(0, i0):max(i0 + 1, i1)][:, band]; c = np.array([m[:, pcs == q].sum() for q in range(12)]); return c / (np.linalg.norm(c) + 1e-9)
bchroma = [chroma_at(beats[i], beats[i + 1]) for i in range(len(beats) - 1)] + [chroma_at(beats[-1], beats[-1] + int(per))]
chg = np.array([0] + [1 - bchroma[i] @ bchroma[i - 1] for i in range(1, len(beats))])
zz = lambda v: (v - v.mean()) / (v.std() + 1e-9)
lowz, chgz = zz(lowflux[beats]), zz(chg)
lowsum = [float(lowz[p::4].mean() + chgz[p::4].mean()) for p in range(4)]
phase = int(np.argmax(lowsum)); down = bt[phase::4]
# ---- bars & features
bars = list(zip(down[:-1], down[1:]))
def seg_feat(t0, t1):
    i0, i1 = int(t0 * fps), max(int(t0 * fps) + 1, int(t1 * fps))
    m = S[i0:i1]; seg = x[int(t0 * SR):int(t1 * SR)]
    rms = 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9)
    lowdb = 20 * np.log10(m[:, low].mean() + 1e-9)
    cent = float((m.mean(0) * freqs).sum() / (m.mean(0).sum() + 1e-9))
    # chroma (12 pitch classes, 55 Hz–5 kHz) + coarse log-band timbre
    band = (freqs > 55) & (freqs < 5000); pc = np.round(12 * np.log2(freqs[band] / 440)) % 12
    chroma = np.array([m[:, band][:, pc == k].sum() for k in range(12)]); chroma /= chroma.sum() + 1e-9
    edges = np.geomspace(40, 10000, 13); tim = np.array([np.log1p(m[:, (freqs >= edges[k]) & (freqs < edges[k + 1])].mean()) for k in range(12)])
    tim = (tim - tim.mean()) / (tim.std() + 1e-9)
    return rms, lowdb, cent, np.concatenate([chroma * 3, tim * 0.5])
F = [seg_feat(b0, b1) for b0, b1 in bars]
rms = np.array([f[0] for f in F]); lowdb = np.array([f[1] for f in F]); cent = np.array([f[2] for f in F]); V = np.array([f[3] for f in F])
Vn = V / (np.linalg.norm(V, axis=1, keepdims=True) + 1e-9); SSM = Vn @ Vn.T
# novelty (checkerboard kernel, 4 bars each side) -> phrase/section boundaries
K = 4; ker = np.kron(np.array([[1, -1], [-1, 1]]), np.ones((K, K)))
nov = np.zeros(len(bars))
for i in range(K, len(bars) - K): nov[i] = (SSM[i - K:i + K, i - K:i + K] * ker).sum()
bounds = [i for i in range(1, len(bars) - 1) if nov[i] == nov[max(0, i - 3):i + 4].max() and nov[i] > np.percentile(nov, 70)]
# ---- hook candidates (8-bar windows on downbeats)
W = 8; cand = []
z = lambda v: (v - v.mean()) / (v.std() + 1e-9)
zr, zl = z(rms), z(lowdb)
for i in range(0, len(bars) - W + 1):
    blk = Vn[i:i + W]; reps = 0
    for j in range(0, len(bars) - W + 1):
        if abs(j - i) >= W and np.mean([blk[k] @ Vn[j + k] for k in range(W)]) > 0.92: reps += 1
    s = zr[i:i + W].mean() * 1.0 + zl[i:i + W].mean() * 0.6 + min(reps, 3) * 0.35 + (0.25 if i in bounds or i == 0 else 0)
    cand.append(dict(bar=i, start=round(float(bars[i][0]), 3), end=round(float(bars[i + W - 1][1]), 3), score=round(float(s), 3),
                     mean_db=round(float(rms[i:i + W].mean()), 1), low_db=round(float(lowdb[i:i + W].mean()), 1), repeats=int(reps)))
cand.sort(key=lambda c: -c['score']); top = []
for c in cand:                                     # keep 3 non-overlapping candidates
    if all(abs(c['bar'] - o['bar']) >= W for o in top): top.append(c)
    if len(top) == 3: break
out = dict(source=a.src, duration=round(dur, 3), bpm=round(bpm, 2), bpm_coarse=bpm0, steady_tempo=bool(steady), grid_rms_ms=round(grid_rms_ms, 1), downbeat_phase_scores=[round(v, 2) for v in lowsum], beat_period=round(60 / bpm, 4), downbeat_phase=phase,
           beats=[round(float(b), 3) for b in bt], downbeats=[round(float(d), 3) for d in down],
           bars=[dict(i=i, start=round(float(b0), 3), end=round(float(b1), 3), rms_db=round(float(rms[i]), 1), low_db=round(float(lowdb[i]), 1), centroid=round(float(cent[i])))
                 for i, (b0, b1) in enumerate(bars)],
           section_bounds_bar=bounds, section_bounds_s=[round(float(bars[i][0]), 3) for i in bounds], hook_candidates=top)
json.dump(out, open(a.out, 'w'), indent=1)
print(f"duration {dur:.2f}s  tempo {bpm:.2f} BPM (coarse {bpm0}; steady={steady}, fit rms {grid_rms_ms:.1f} ms)  beats {len(bt)}  bars {len(bars)}  downbeat phase {phase} {[round(v,2) for v in lowsum]}")
print('section boundaries (s):', out['section_bounds_s'])
for k, c in enumerate(top, 1): print(f"candidate {k}: {c['start']:.2f}–{c['end']:.2f}s (bar {c['bar']}, 8 bars)  score {c['score']}  loud {c['mean_db']} dB  repeats {c['repeats']}")
if a.png:
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    fig, ax = plt.subplots(3, 1, figsize=(16, 7), sharex=True)
    tt = np.arange(len(onset)) / fps; ax[0].plot(tt, onset, lw=0.4); [ax[0].axvline(b, color='r', lw=0.3, alpha=0.4) for b in bt]; ax[0].set_ylabel('onset/beats')
    bc = [b0 for b0, _ in bars]; ax[1].step(bc, rms, where='post'); ax[1].step(bc, lowdb - lowdb.max() + rms.max(), where='post', alpha=0.6); ax[1].set_ylabel('bar dB / low')
    for c, col in zip(top, ('g', 'orange', 'purple')): ax[1].axvspan(c['start'], c['end'], color=col, alpha=0.2)
    ax[2].plot(bc, nov); [ax[2].axvline(bars[i][0], color='k', lw=0.8) for i in bounds]; ax[2].set_ylabel('novelty'); ax[2].set_xlabel('seconds')
    plt.tight_layout(); plt.savefig(a.png, dpi=80)
