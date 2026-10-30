#!/bin/bash
# Mux the V2 picture (stream copy) with the V2 master mix as AAC-LC 320k, plus a lighter review encode.
cd "$(dirname "$0")/.."
ffmpeg -y -v error -i out/v2_video.mp4 -i public/v2/mix_v2.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart out/dexterity_heritage_tour_v2_draft.mp4
ffmpeg -y -v error -i out/dexterity_heritage_tour_v2_draft.mp4 -c:v libx264 -preset slow -crf 19 -maxrate 12M -bufsize 24M -pix_fmt yuv420p -c:a copy -movflags +faststart out/dexterity_heritage_tour_v2_REVIEW.mp4
ls -la out/dexterity_heritage_tour_v2_*.mp4
