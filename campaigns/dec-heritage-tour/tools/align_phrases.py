#!/usr/bin/env python3
"""Phrase alignment without word timestamps: find envelope dips in each take, transcribe the audio up to each dip,
so every candidate cut point is labelled with the words before it. Output: work/phrase_cuts.json"""
import sys, os, json, subprocess, numpy as np, sherpa_onnx
m = sys.argv[1]; root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{m}/small.en-encoder.onnx', decoder=f'{m}/small.en-decoder.onnx',
        tokens=f'{m}/small.en-tokens.txt', language='en', task='transcribe', num_threads=4, tail_paddings=800)
def asr(x):
    s = rec.create_stream(); s.accept_waveform(16000, x); rec.decode_stream(s); return s.result.text.strip()
out = {}
for i in range(1, 8):
    r = subprocess.run(['ffmpeg','-v','error','-i',f'{root}/work/vo_raw/take{i}.wav','-ar','16000','-ac','1','-f','f32le','-'],capture_output=True)
    x = np.frombuffer(r.stdout, np.float32); sr = 16000; hop = 160
    n = len(x)//hop; db = 20*np.log10(np.sqrt((x[:n*hop].reshape(n,hop)**2).mean(1))+1e-9)
    sm = np.convolve(db, np.ones(5)/5, 'same')
    # dips: local minima at least 12 dB under the local (±0.4 s) max, spaced >= 0.35 s
    dips = []
    for k in range(20, n-20):
        w = sm[max(0,k-40):k+40]
        if sm[k] == sm[max(0,k-8):k+9].min() and w.max() - sm[k] > 12 and (not dips or k - dips[-1] > 35): dips.append(k)
    rows = []
    for k in dips:
        t = k*hop/sr; rows.append(dict(t=round(t,3), level_db=round(float(sm[k]),1), text_before=asr(x[:int(t*sr)])))
    out[i] = dict(dur=len(x)/sr, cuts=rows)
    print(f'--- take {i} ({len(x)/sr:.2f}s)')
    for rw in rows: print(f"  {rw['t']:6.2f}s {rw['level_db']:6.1f}dB | {rw['text_before'][-70:]}")
json.dump(out, open(f'{root}/work/phrase_cuts.json','w'), indent=1)
