#!/bin/bash
# Mux V3 picture (stream copy) + master mix (AAC 320k) and make the review encode. Never overwrites V1/V2 exports.
cd "$(dirname "$0")/.."
ffmpeg -y -v error -i out/v3_video.mp4 -i public/v3/mix_v3.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart out/Dexterity_HeritageTour_V3_INTERNAL-REVIEW_master.mp4
ffmpeg -y -v error -i out/Dexterity_HeritageTour_V3_INTERNAL-REVIEW_master.mp4 -c:v libx264 -preset slow -crf 19 -maxrate 12M -bufsize 24M -pix_fmt yuv420p -c:a copy -movflags +faststart out/Dexterity_HeritageTour_V3_INTERNAL-REVIEW.mp4
ls -la out/Dexterity_HeritageTour_V3_*.mp4
