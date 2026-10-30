#!/bin/bash
# Objective post-render checks. usage: qa.sh file.mp4
f="${1:-out/dexterity_dec_heritage_tour_draft_v1.mp4}"
echo "== format"; ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,color_space,sample_rate,channels,bit_rate:format=duration -of default=nw=1 "$f"
echo "== black frames (pic_th 0.98, >=0.04s)"; ffmpeg -hide_banner -nostats -i "$f" -vf blackdetect=d=0.04:pic_th=0.98 -an -f null - 2>&1 | grep -c black_start
echo "== frozen video >1.5s (freezedetect)"; ffmpeg -hide_banner -nostats -i "$f" -vf freezedetect=n=-60dB:d=1.5 -an -f null - 2>&1 | grep -E "freeze_(start|end)" | tr '\n' ' '; echo
echo "== unintended silence (< -50 dB for >=0.5 s)"; ffmpeg -hide_banner -nostats -i "$f" -vn -af silencedetect=n=-50dB:d=0.5 -f null - 2>&1 | grep -E "silence_(start|end)" | tr '\n' ' '; echo
echo "== loudness / true peak"; ffmpeg -hide_banner -nostats -i "$f" -vn -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary | grep -E "I:|LRA:|Peak:"
echo "== clipping (samples at full scale)"; ffmpeg -hide_banner -nostats -i "$f" -vn -af astats=metadata=0 -f null - 2>&1 | grep -E "Number of samples|Peak level dB" | tail -2
