#!/bin/bash
# Decodes the seven voice notes (filename order = scene order 1,2,3,4,5,6A,6B) to 48 kHz mono WAV copies. Sources untouched.
cd "$(dirname "$0")/.." && mkdir -p work/vo_raw
i=1; for f in ../../audio\ files\ for\ tour/*.mp4; do ffmpeg -v error -y -i "$f" -ac 1 -ar 48000 -c:a pcm_s16le work/vo_raw/take$i.wav; i=$((i+1)); done; echo "$((i-1)) takes decoded"
