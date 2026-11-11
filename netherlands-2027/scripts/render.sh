#!/usr/bin/env bash
# usage: scripts/render.sh draft|full      (uses a locally installed Chromium headless shell when one is present)
set -e
cd "$(dirname "$0")/.."
: "${REMOTION_BROWSER_EXECUTABLE:=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)}"
export REMOTION_BROWSER_EXECUTABLE
if [ "$1" = "full" ]; then
  npx remotion render src/index.ts Netherlands2027 out/.raw-full.mp4 --crf=18 --log=error
  bash scripts/master.sh out/.raw-full.mp4 out/netherlands-2027-draft-v1.mp4
else
  npx remotion render src/index.ts Netherlands2027 out/.raw-draft.mp4 --scale=0.5 --crf=24 --log=error
  bash scripts/master.sh out/.raw-draft.mp4 out/netherlands-2027-draft-v1-540p.mp4
fi
