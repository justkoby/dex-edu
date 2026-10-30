#!/usr/bin/env python3
"""Offline transcript of the 7 narration takes (sherpa-onnx + Whisper small.en, fp32) with token timestamps.
Model: github.com/k2-fsa/sherpa-onnx/releases (asr-models) -> pass its folder as argv[1]. Output: work/transcript.json"""
import sys, os, json, numpy as np, soundfile as sf, sherpa_onnx
m = sys.argv[1]; root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{m}/small.en-encoder.onnx', decoder=f'{m}/small.en-decoder.onnx',
        tokens=f'{m}/small.en-tokens.txt', language='en', task='transcribe', num_threads=4, tail_paddings=800)
out = []
for i in range(1, 8):
    x, sr = sf.read(f'{root}/work/vo_raw/take{i}.wav', dtype='float32')
    import subprocess
    r = subprocess.run(['ffmpeg','-v','error','-i',f'{root}/work/vo_raw/take{i}.wav','-ar','16000','-ac','1','-f','f32le','-'],capture_output=True)
    x = np.frombuffer(r.stdout, np.float32)
    s = rec.create_stream(); s.accept_waveform(16000, x); rec.decode_stream(s)
    res = s.result
    out.append(dict(take=i, text=res.text.strip(), tokens=list(res.tokens), timestamps=list(res.timestamps)))
    print(i, '|', res.text.strip())
json.dump(out, open(f'{root}/work/transcript.json', 'w'), indent=1)
