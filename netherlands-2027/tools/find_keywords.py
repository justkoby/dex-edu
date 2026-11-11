# Review helper used to measure the narration (transcript, levels, speech segments / keyword times).
# Needs: pip install sherpa-onnx soundfile scipy pyloudnorm + the sherpa-onnx whisper small.en model (GitHub release "asr-models").
# Expects the clips decoded to raw/NN.wav (48 kHz mono). Results were copied by hand into audio/process_vo.py (phrases / marks).
import sherpa_onnx, soundfile as sf, numpy as np, json, re, sys
from scipy.signal import resample_poly
d='asr/sherpa-onnx-whisper-small.en/'
r=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=d+'small.en-encoder.int8.onnx',decoder=d+'small.en-decoder.int8.onnx',tokens=d+'small.en-tokens.txt',num_threads=4)
def dec(x):
    s=r.create_stream(); s.accept_waveform(16000,x.astype(np.float32)); r.decode_stream(s); return re.sub(r'[^a-z0-9 ]','',s.result.text.lower())
KW={'01':['abroad','thing','mind','money'],'03':['told','planning','netherlands','2027'],'04':['yep'],'05':['like','srh','and','university'],'06':['see'],
    '08':['although','warned','cold'],'09':['anyway','netherlands','list','2027','dexterity','consult','help'],'10':['for','next','here','charlie']}
out={}
for c,kws in KW.items():
    x,sr=sf.read(f'raw/{c}.wav'); x=resample_poly(x,1,3); L=len(x)/16000; out[c]={}
    lo0=0.2
    for kw in kws:
        lo,hi=lo0,L
        if kw not in dec(x): print(c,kw,'NOT FOUND',flush=True); continue
        while hi-lo>0.07:
            m=(lo+hi)/2
            if kw in dec(x[:int(m*16000)]): hi=m
            else: lo=m
        out[c][kw]=round(hi,2); lo0=hi; print(c,kw,round(hi,2),flush=True)
json.dump(out,open('kw.json','w'),indent=1)
