#!/bin/bash
# V3K (Kakum revision): mux picture + master mix, then the review encode. Never overwrites earlier exports.
cd "$(dirname "$0")/.."
ffmpeg -y -v error -i out/v3k_video.mp4 -i public/v3k/mix_v3k.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart out/Dexterity_HeritageTour_V3K_Kakum_INTERNAL-REVIEW_master.mp4
ffmpeg -y -v error -i out/Dexterity_HeritageTour_V3K_Kakum_INTERNAL-REVIEW_master.mp4 -c:v libx264 -preset slow -crf 19 -maxrate 12M -bufsize 24M -pix_fmt yuv420p -c:a copy -movflags +faststart out/Dexterity_HeritageTour_V3K_Kakum_INTERNAL-REVIEW.mp4
ls -la out/Dexterity_HeritageTour_V3K_*.mp4
