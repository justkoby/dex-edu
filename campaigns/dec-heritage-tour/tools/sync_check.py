#!/usr/bin/env python3
"""Measure audio/picture sync on an EXPORTED file: detect hard cuts (scene change) in the video and report the distance of
each cut to the nearest song beat of the excerpt used. usage: sync_check.py <video.mp4> <analysis.json> <song_in_seconds> [scene_thr]"""
import sys, json, re, subprocess
import numpy as np
v, an, song_in = sys.argv[1], sys.argv[2], float(sys.argv[3]); thr = float(sys.argv[4]) if len(sys.argv) > 4 else 0.32
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', v, '-vf', f"select='gt(scene,{thr})',showinfo", '-an', '-f', 'null', '-'], capture_output=True, text=True).stderr
cuts = [float(m) for m in re.findall(r'pts_time:([0-9.]+)', r)]
A = json.load(open(an)); beats = np.array(A['beats']) - song_in; downs = np.array(A['downbeats']) - song_in; per = A['beat_period']
rows = []
for c in cuts:
    d = (beats[np.argmin(np.abs(beats - c))] - c) * 1000; isdown = np.min(np.abs(downs - c)) < 0.04
    rows.append((c, d, isdown))
    print(f'cut {c:7.3f}s   nearest beat {d:+6.0f} ms{"   (downbeat)" if isdown else ""}')
e = np.abs([r_[1] for r_ in rows]); fr = 1000 / 30
print(f'{len(rows)} cuts: median |offset| {np.median(e):.0f} ms, within one frame (±{fr:.0f} ms): {np.mean(e <= fr) * 100:.0f}%, on downbeats: {sum(r_[2] for r_ in rows)}')
