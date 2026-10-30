#!/usr/bin/env python3
"""Spectral-flux onset curve of the music bed -> work/flux.npy (used by build_timeline.py to nudge cuts onto onsets).
Usage: analyse_music.py [music file]"""
import subprocess, sys, os
import numpy as np
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
src = sys.argv[1] if len(sys.argv) > 1 else root + '/../../audio/(Audio) Upbeat Background Music For Videos (No Copyright).m4a'
r = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '22050', '-f', 's16le', '-'], capture_output=True)
x = np.frombuffer(r.stdout, np.int16) / 32768.
n, hop = 2048, 512; win = np.hanning(n)
fr = np.array([np.abs(np.fft.rfft(x[i:i+n]*win)) for i in range(0, len(x)-n, hop)])
flux = np.maximum(0, np.diff(np.log1p(fr*50), axis=0)).sum(1)
flux = np.maximum(flux - np.convolve(flux, np.ones(20)/20, 'same'), 0)
os.makedirs(root + '/work', exist_ok=True); np.save(root + '/work/flux.npy', flux); print('onset curve', flux.shape)
