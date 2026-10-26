"""Generate each dialogue line separately with Kokoro-82M (open-source neural TTS, ONNX).
Usage: python scripts/gen_voices.py <kokoro-v1.0.onnx> <voices-v1.0.bin> <out_dir>
Voices are generic American-English Kokoro voices -- NOT verified Ghanaian accents."""
import sys, json, soundfile as sf
from kokoro_onnx import Kokoro

model, voices, out = sys.argv[1:4]
k = Kokoro(model, voices)
LINES = [
 ("s1_kofi","am_puck",1.05,"Chale Ama! Where you dey? We dey plan link up for East Legon this weekend."),
 ("s2_ama","af_nicole",1.05,"Kofi, East Legon keh? Chale, I dey Budapest oo!"),
 ("s3_kofi","am_puck",1.12,"BUDAPEST?! As in Hungary? Ei! Since when?!"),
 ("s4_ama","af_nicole",1.05,"Yes oo! There are schools here like International Business School and Budapest Metropolitan University. You should check them out!"),
 ("s5_narr","am_michael",1.0,"Thinking of studying abroad? Dexterity Educational Consult can help you explore your options and guide you through the application process."),
 ("s6_narr","am_michael",1.0,"Your next chapter could start in Hungary. WhatsApp Dexterity today!"),
]
meta={}
for name,voice,speed,text in LINES:
    s,sr = k.create(text, voice=voice, speed=speed, lang="en-us")
    sf.write(f"{out}/{name}.wav", s, sr)
    meta[name]={"voice":voice,"seconds":round(len(s)/sr,3),"text":text}
    print(name, voice, meta[name]["seconds"])
json.dump(meta, open(f"{out}/voices.json","w"), indent=1)
