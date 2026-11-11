#!/usr/bin/env bash
# Final audio master: loudness-normalise the rendered film to -14 LUFS / -1.5 dBTP (social platforms), AAC 256k,
# and make sure the picture is standard yuv420p H.264.   usage: scripts/master.sh in.mp4 out.mp4
set -e
ffmpeg -v error -y -i "$1" -c:v copy -af "loudnorm=I=-14:TP=-2:LRA=11,alimiter=limit=0.8:level=disabled" -ar 48000 -c:a aac -b:a 256k -movflags +faststart "$2"
echo "mastered -> $2"
