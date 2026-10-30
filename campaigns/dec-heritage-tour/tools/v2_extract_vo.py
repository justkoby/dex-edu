#!/usr/bin/env python3
"""V2 shortened narration: cut whole phrases from the takes at envelope minima (no time-stretching), verified by
re-transcribing each extracted segment. Then the same restoration chain as V1 + per-phrase loudness match.
Output: work/v2/vo_<id>.wav + work/v2/vo_phrases.json"""
import sys, os, json, re, subprocess, numpy as np, sherpa_onnx
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'audio'))
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); m = sys.argv[1]
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{m}/small.en-encoder.onnx', decoder=f'{m}/small.en-decoder.onnx',
        tokens=f'{m}/small.en-tokens.txt', language='en', task='transcribe', num_threads=4, tail_paddings=800)
SR = 48000
# id, take, expected text, start search window, end search window (seconds in the take)
PHRASES = [
 ('p1_december', 7, 'This December, make your return to Ghana more than just a visit.', (0.6, 1.6), (5.95, 6.5)),
 ('p2_roots',    7, 'Make it a journey back to your roots.',                           (5.6, 6.6), (8.4, 9.5)),
 ('p3_history',  5, 'Reconnect with our rich history, discover the stories that shaped our heritage', (0.4, 1.5), (6.8, 7.8)),
 ('p4_coast',    4, 'Soak in the beauty of our coastline, unwind by the ocean',          (0.3, 1.3), (5.0, 6.0)),
 ('p5_message',  1, 'Send Dexterity Education and Travel and Tour a message today',      (0.6, 1.6), (6.45, 7.1)),
]
def load(i):
    r = subprocess.run(['ffmpeg','-v','error','-i',f'{root}/work/vo_raw/take{i}.wav','-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True)
    return np.frombuffer(r.stdout, np.float32).copy()
def asr(x):
    y = x[::3]  # 48k -> 16k (speech band is far below 8 kHz; fine for verification)
    s = rec.create_stream(); s.accept_waveform(16000, y.astype(np.float32)); rec.decode_stream(s); return s.result.text.strip()
def words(t): return re.sub(r"[^a-z ]", "", t.lower()).split()
def envdb(x):
    h = 240; n = len(x)//h; return 20*np.log10(np.sqrt((x[:n*h].reshape(n,h)**2).mean(1))+1e-9), h
out = []
for pid, take, text, sw, ew in PHRASES:
    x = load(take); db, h = envdb(x); W = words(text)
    def snap(t, rad=0.06):
        a, b = int((t-rad)*SR/h), int((t+rad)*SR/h); k = a + int(np.argmin(db[a:b])); return k*h/SR
    # end: earliest candidate (local minimum) after which the last expected word is present
    end = None
    for t in np.arange(ew[0], ew[1], 0.05):
        tt = snap(t); tx = words(asr(x[int(sw[0]*SR):int(tt*SR)]))
        if tx and tx[-1] == W[-1]: end = tt; break
    end = end or ew[1]
    # start: latest candidate before which the first expected word is still intact
    start = sw[0]
    for t in np.arange(sw[1], sw[0], -0.05):
        tt = snap(t); tx = words(asr(x[int(tt*SR):int(end*SR)]))
        if tx and tx[0] == W[0] and len(tx) >= len(W) - 2: start = tt; break
    # onsets checked by hand on the 10 ms envelope: last quiet frame before the first consonant (ASR tolerates clipped onsets)
    FIX_START = {'p1_december': 1.22, 'p2_roots': 6.34, 'p3_history': 0.74, 'p4_coast': 0.42, 'p5_message': 0.80}
    start = FIX_START.get(pid, max(0, start - 0.03)); end = end + 0.06
    seg = x[int(start*SR):int(end*SR)].copy()
    f = int(0.012*SR); seg[:f] *= np.linspace(0,1,f)**2; seg[-f:] *= np.linspace(1,0,f)**2
    raw = f'{root}/work/v2/{pid}_raw.wav'
    import wave
    with wave.open(raw,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(seg,-1,1)*32767).astype(np.int16).tobytes())
    heard = asr(seg)
    out.append(dict(id=pid, take=take, src_start=round(start,3), src_end=round(end,3), dur=round(len(seg)/SR,3), script=text, heard=heard))
    print(f'{pid:12s} take{take} {start:5.2f}-{end:5.2f} ({len(seg)/SR:4.2f}s) | {heard}')
json.dump(out, open(f'{root}/work/v2/vo_phrases.json','w'), indent=1)
