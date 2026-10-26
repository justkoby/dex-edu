#!/usr/bin/env bash
# QA for the preview render: contact sheet, blank-frame scan, audio levels. Usage: scripts/qa.sh [video] [outdir]
set -euo pipefail
V=${1:-out/dexterity-skit-preview.mp4}; O=${2:-out/qa}; mkdir -p "$O"
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,duration -of compact "$V"
ffmpeg -v error -y -i "$V" -vf "fps=1,scale=270:-2,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,tile=9x5:padding=4:color=black" -frames:v 1 "$O/contact-sheet.png"
echo "-- blackdetect (none expected):"; ffmpeg -hide_banner -i "$V" -vf blackdetect=d=0.1:pic_th=0.98 -an -f null - 2>&1 | grep -E "black_start" || echo none
echo "-- freezedetect >1.5s (info):"; ffmpeg -hide_banner -i "$V" -vf freezedetect=n=0.003:d=1.5 -an -f null - 2>&1 | grep -E "freeze_start" || echo none
echo "-- audio:"; ffmpeg -hide_banner -i "$V" -af "volumedetect,ebur128=peak=true:framelog=quiet" -vn -f null - 2>&1 | grep -E "max_volume|mean_volume|^ +I:|Peak:"
echo "-- audio silences >0.3s (info):"; ffmpeg -hide_banner -i "$V" -af silencedetect=n=-50dB:d=0.3 -vn -f null - 2>&1 | grep silence_ || echo none
