#!/usr/bin/env bash
# Render review stills at the given times (seconds) and tile them into one contact sheet.
# usage: scripts/stills.sh out/sheet.jpg 0.4 2.0 7.9 ...
set -e
cd "$(dirname "$0")/.."
: "${REMOTION_BROWSER_EXECUTABLE:=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)}"
export REMOTION_BROWSER_EXECUTABLE
out="$1"; shift; tmp=out/.stills; rm -rf "$tmp"; mkdir -p "$tmp"
npx remotion bundle src/index.ts --out-dir out/.bundle >/dev/null 2>&1
i=0; pids=()
for t in "$@"; do
  f=$(python3 -c "print(round($t*30))"); n=$(printf "%03d" $i)
  npx remotion still out/.bundle Netherlands2027 "$tmp/$n.jpg" --frame="$f" --scale=0.4 --image-format=jpeg --log=error >/dev/null 2>&1 &
  pids+=($!); i=$((i+1)); if (( i % 4 == 0 )); then wait "${pids[@]}"; pids=(); fi
done
wait
cols=${COLS:-6}; rows=$(( (i + cols - 1) / cols ))
ffmpeg -v error -y -pattern_type glob -i "$tmp/*.jpg" -vf "tile=${cols}x${rows}:padding=6:color=white" -frames:v 1 -q:v 3 "$out"
echo "$out"
