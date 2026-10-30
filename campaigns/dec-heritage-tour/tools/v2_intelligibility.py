#!/usr/bin/env python3
"""Intelligibility check: transcribe each narration window from the FINAL mix (music + fx included) and compare
with the transcript of the isolated phrase. usage: v2_intelligibility.py <whisper_model_dir> [mix.wav]"""
import sys, os, json, re, subprocess, numpy as np, sherpa_onnx
m = sys.argv[1]; root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
mix = sys.argv[2] if len(sys.argv) > 2 else f'{root}/public/v2/mix_v2.wav'
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{m}/small.en-encoder.onnx', decoder=f'{m}/small.en-decoder.onnx',
        tokens=f'{m}/small.en-tokens.txt', language='en', task='transcribe', num_threads=4, tail_paddings=800)
T = json.load(open(f'{root}/src/v2/timeline.v2.json')); ph = {p['id']: p for p in json.load(open(f'{root}/work/v2/vo_phrases.json'))}
x = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',mix,'-f','f32le','-ac','1','-ar','16000','-'],capture_output=True).stdout, np.float32)
w = lambda t: re.sub(r"[^a-z ]", "", t.lower()).split()
def wer(ref, hyp):
    d = np.zeros((len(ref)+1, len(hyp)+1)); d[:, 0] = range(len(ref)+1); d[0, :] = range(len(hyp)+1)
    for i in range(1, len(ref)+1):
        for j in range(1, len(hyp)+1): d[i, j] = min(d[i-1, j]+1, d[i, j-1]+1, d[i-1, j-1] + (ref[i-1] != hyp[j-1]))
    return d[-1, -1] / max(1, len(ref))
res = []
for v in T['vo']:
    seg = x[int((v['at']-0.1)*16000):int((v['end']+0.05)*16000)]
    s = rec.create_stream(); s.accept_waveform(16000, seg); rec.decode_stream(s); hyp = s.result.text.strip()
    ref = ph[v['id']]['heard']; e = wer(w(ref), w(hyp)); res.append(e)
    print(f"{v['id']:12s} WER vs isolated {e*100:5.1f}% | mix: {hyp}")
print(f'mean WER {np.mean(res)*100:.1f}%')
