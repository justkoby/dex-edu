#!/bin/bash
# Mux the Remotion picture (copied, not re-encoded) with the mastered audio as AAC-LC 320k; faststart for social upload.
cd "$(dirname "$0")/.."
ffmpeg -y -v error -i out/draft_v1_video.mp4 -i work/mix_master.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart out/dexterity_dec_heritage_tour_draft_v1.mp4 && ls -la out/dexterity_dec_heritage_tour_draft_v1.mp4
