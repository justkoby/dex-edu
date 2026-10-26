#!/usr/bin/env bash
# Final stereo master: two-pass linear loudness to -16 LUFS, -1 dBTP true-peak ceiling; video re-encoded to standard yuv420p/TV-range H.264 (Remotion emits full-range yuvj420p).
# Usage: scripts/master-audio.sh in.mp4 out.mp4
set -euo pipefail
IN=$1; OUT=$2
J=$(ffmpeg -hide_banner -nostats -i "$IN" -vn -af "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/[^0-9.\-]//g'; }
ffmpeg -v error -y -i "$IN" -map 0:v -map 0:a -vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 17 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,alimiter=limit=0.891:level=disabled,aformat=channel_layouts=stereo:sample_rates=48000" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
echo "mastered -> $OUT"
