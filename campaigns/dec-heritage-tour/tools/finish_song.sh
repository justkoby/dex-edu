#!/bin/bash
# Mux a rendered picture with a song-soundtrack master (local-only music) + review encode.
# usage: finish_song.sh <picture.mp4> <mix.wav> <out_basename>      (writes out/<name>_master.mp4 and out/<name>.mp4)
set -e; cd "$(dirname "$0")/.."
ffmpeg -y -v error -i "$1" -i "$2" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "out/$3_master.mp4"
ffmpeg -y -v error -i "out/$3_master.mp4" -c:v libx264 -preset slow -crf 19 -maxrate 12M -bufsize 24M -pix_fmt yuv420p -c:a copy -movflags +faststart "out/$3.mp4"
ls -la "out/$3.mp4" "out/$3_master.mp4"
