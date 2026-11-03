#!/bin/bash
# V4K (Kakum revision): mux picture + master mix, then the review encode. Never overwrites earlier exports.
cd "$(dirname "$0")/.."
ffmpeg -y -v error -i out/v4k_video.mp4 -i public/v4k/mix_v4k.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart out/Dexterity_HeritageTour_V4K_GroupChat_Kakum_INTERNAL-REVIEW_master.mp4
ffmpeg -y -v error -i out/Dexterity_HeritageTour_V4K_GroupChat_Kakum_INTERNAL-REVIEW_master.mp4 -c:v libx264 -preset slow -crf 19 -maxrate 12M -bufsize 24M -pix_fmt yuv420p -c:a copy -movflags +faststart out/Dexterity_HeritageTour_V4K_GroupChat_Kakum_INTERNAL-REVIEW.mp4
ls -la out/Dexterity_HeritageTour_V4K_*.mp4
