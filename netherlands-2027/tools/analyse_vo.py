# Review helper used to measure the narration (transcript, levels, speech segments / keyword times).
# Needs: pip install sherpa-onnx soundfile scipy pyloudnorm + the sherpa-onnx whisper small.en model (GitHub release "asr-models").
# Expects the clips decoded to raw/NN.wav (48 kHz mono). Results were copied by hand into audio/process_vo.py (phrases / marks).
import sherpa_onnx, soundfile as sf, numpy as np, glob, pyloudnorm as pyln
from scipy.signal import resample_poly
d='asr/sherpa-onnx-whisper-small.en/'
r=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=d+'small.en-encoder.int8.onnx',decoder=d+'small.en-decoder.int8.onnx',tokens=d+'small.en-tokens.txt',num_threads=4)
for f in sorted(glob.glob('raw/*.wav')):
    x,sr=sf.read(f); x16=resample_poly(x,1,3)
    s=r.create_stream(); s.accept_waveform(16000,x16.astype(np.float32)); r.decode_stream(s)
    # frame rms 10ms
    n=sr//100; fr=x[:len(x)//n*n].reshape(-1,n); rms=20*np.log10(np.sqrt((fr**2).mean(1))+1e-9)
    floor=np.percentile(rms,5); thr=max(floor+12,-45)
    act=rms>thr
    # speech segments merge gaps<0.15
    segs=[];st=None
    for k,a in enumerate(act):
        if a and st is None: st=k
        if not a and st is not None: segs.append([st,k]); st=None
    if st is not None: segs.append([st,len(act)])
    m=[]
    for a,b in segs:
        if m and a-m[-1][1]<15: m[-1][1]=b
        elif b-a>=4: m.append([a,b])
    lufs=pyln.Meter(sr).integrated_loudness(x) if len(x)>sr*0.5 else float('nan')
    print(f"{f} dur={len(x)/sr:.2f} peak={20*np.log10(abs(x).max()):.1f}dB lufs={lufs:.1f} floor={floor:.1f}dB p95={np.percentile(rms,95):.1f}")
    print("  TEXT:",s.result.text)
    print("  segs:"," ".join(f"{a/100:.2f}-{b/100:.2f}({rms[a:b].max():.0f})" for a,b in m))
