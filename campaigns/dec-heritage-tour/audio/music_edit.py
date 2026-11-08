#!/usr/bin/env python3
"""Reusable song-excerpt editor + mixer (one config per video, same source track).

usage: music_edit.py <config.json> [--source <audio file>] [--out <wav>]

Config (see audio/music_edits/*.json):
  source_env / source       env var holding the local path of the licensed/local-only track, or a path (never committed)
  analysis                  JSON from tools/music_analyze.py for that track (beats/downbeats used for snapping + reporting)
  timeline                  the video's timeline JSON (for total length + narration placement), e.g. src/v3k/timeline.v3k.json
  segments                  [{src_in, src_out, at}] pieces of the song placed on the video timeline (seconds). With
                            "snap": "downbeat"|"beat", src_in/src_out are moved to the nearest analysed downbeat/beat.
                            Consecutive pieces are joined with an equal-power crossfade of `xfade_ms` centred on the join.
  fade_in / fade_out        seconds, at the start of the first piece / end of the video
  gain                      [[t, dB], ...] volume automation on the video timeline (linear interpolation in dB)
  music_lufs                loudness the music bed is normalised to before automation/ducking (default -16)
  duck                      {depth_db, attack, release, threshold_db} narration ducking (needs processed VO phrases)
  vo_dir                    folder with <phrase>_proc.wav (restored narration); omit for music-only videos
  fx                        optional wav of transition/UI/ambience sound design on the same timeline, with fx_db
  target_lufs / true_peak   master loudness (default -14 LUFS / -1.2 dBTP, linear gain + limiter safety)
Writes the master wav and <out>.report.json (actual song timestamps used, joins, loudness)."""
import argparse, json, os, subprocess
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument('config'); ap.add_argument('--source'); ap.add_argument('--out')
a = ap.parse_args()
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
C = json.load(open(a.config)); SR = 48000
src = a.source or os.environ.get(C.get('source_env', ''), '') or C.get('source', '')
src = src if os.path.isabs(src) else os.path.join(root, src)
assert os.path.exists(src), f'music source not found: {src} (set ${C.get("source_env")} or pass --source)'
T = json.load(open(os.path.join(root, C['timeline']))); TOTAL = T['total']; N = int(round(TOTAL * SR))
AN = json.load(open(os.path.join(root, C['analysis']))) if C.get('analysis') else None

def dec(p, ch=2):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, ch).T.copy()
song = dec(src)
# ---- loudness-normalise the source once (linear gain, measured), so excerpts sit at a known level
def lufs(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return json.loads(r[r.rfind('{'):r.rfind('}') + 1])
src_l = lufs(src); song *= 10 ** ((C.get('music_lufs', -16) - float(src_l['input_i'])) / 20)

def snap(tsec, mode):
    if not AN or not mode: return tsec
    grid = np.array(AN['downbeats'] if mode == 'downbeat' else AN['beats']); return float(grid[np.argmin(np.abs(grid - tsec))])
bed = np.zeros((2, N), np.float32); report = dict(source=os.path.basename(src), source_lufs=float(src_l['input_i']), source_true_peak=float(src_l['input_tp']), pieces=[])
xf = C.get('xfade_ms', 40) / 1000
segs = C['segments']
for k, s in enumerate(segs):
    i0, i1 = snap(s['src_in'], C.get('snap')), snap(s['src_out'], C.get('snap'))
    at = s['at']; piece = song[:, int(i0 * SR):int(i1 * SR)].copy(); n = piece.shape[1]
    h = int(xf / 2 * SR)
    # equal-power crossfade at joins: extend each piece by half the crossfade on both sides and fade those halves
    pre = song[:, max(0, int(i0 * SR) - h):int(i0 * SR)] if k > 0 else np.zeros((2, 0), np.float32)
    post = song[:, int(i1 * SR):int(i1 * SR) + h] if k < len(segs) - 1 else np.zeros((2, 0), np.float32)
    p = np.concatenate([pre, piece, post], axis=1); start = int(round(at * SR)) - pre.shape[1]
    env = np.ones(p.shape[1])
    if pre.shape[1]: env[:2 * pre.shape[1]] = np.sin(np.linspace(0, np.pi / 2, 2 * pre.shape[1])) ** 1
    if post.shape[1]: env[-2 * post.shape[1]:] = np.cos(np.linspace(0, np.pi / 2, 2 * post.shape[1]))
    if k == 0 and C.get('fade_in', 0) > 0: fi = int(C['fade_in'] * SR); env[pre.shape[1]:pre.shape[1] + fi] *= np.linspace(0, 1, fi) ** 2
    j0, j1 = max(0, start), min(N, start + p.shape[1])
    if j1 > j0: bed[:, j0:j1] += (p * env)[:, j0 - start:j1 - start]
    report['pieces'].append(dict(src_in=round(i0, 3), src_out=round(i1, 3), at=at, length=round(n / SR, 3),
                                 src_in_requested=s['src_in'], src_out_requested=s['src_out']))
fo = int(C.get('fade_out', 1.0) * SR); bed[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
# ---- volume automation
if C.get('gain'):
    tt = np.arange(N) / SR; g = np.interp(tt, [p[0] for p in C['gain']], [p[1] for p in C['gain']]); bed *= 10 ** (g / 20)
# ---- narration + ducking
vo = np.zeros((1, N), np.float32)
if C.get('vo_dir') and T.get('vo'):
    for v in T['vo']:
        x = dec(os.path.join(root, C['vo_dir'], f"{v['id']}_proc.wav"), 1); i = int(v['at'] * SR); j = min(N, i + x.shape[1]); vo[:, i:j] += x[:, :j - i]
    D = C.get('duck', {}); sm = lambda s_, n_: np.convolve(s_, np.ones(n_) / n_, 'same')
    rms = np.sqrt(sm(vo[0] ** 2, int(0.04 * SR)) + 1e-12); act = (20 * np.log10(rms) > D.get('threshold_db', -45)).astype(float)
    act = np.maximum.reduce([np.roll(act, k) for k in range(0, int(D.get('hold', 0.15) * SR), 480)])
    duck = 10 ** (D.get('depth_db', -10) * sm(act, int(D.get('release', 0.25) * SR)) / 20)
    bed *= duck
    report['duck_depth_db'] = D.get('depth_db', -10)
fx = np.zeros((2, N), np.float32)
if C.get('fx'):
    f = dec(os.path.join(root, C['fx'])); f = np.pad(f, ((0, 0), (0, max(0, N - f.shape[1]))))[:, :N]; fx = f * 10 ** (C.get('fx_db', 0) / 20)
mix = bed + fx + np.repeat(vo, 2, 0)
out = a.out or os.path.join(root, C['out'])
os.makedirs(os.path.dirname(out), exist_ok=True); tmp = out + '.premix.f32'; mix.T.astype('<f4').tofile(tmp)
inp = ['-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', tmp]
tl, tp = C.get('target_lufs', -14), C.get('true_peak', -1.2)
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', *inp, '-af', f'loudnorm=I={tl}:TP={tp}:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(r[r.rfind('{'):r.rfind('}') + 1])
ln = (f"loudnorm=I={tl}:TP={tp}:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit={10 ** ((tp - 0.1) / 20):.3f}:attack=3:release=60:level=false")
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inp, '-af', ln, '-ar', str(SR), '-c:a', 'pcm_s24le', out], check=True); os.remove(tmp)
fin = lufs(out); report.update(master_lufs=float(fin['input_i']), master_true_peak=float(fin['input_tp']), out=os.path.relpath(out, root))
json.dump(report, open(out + '.report.json', 'w'), indent=1)
print(json.dumps({k: report[k] for k in ('source', 'pieces', 'master_lufs', 'master_true_peak')}, indent=1))
