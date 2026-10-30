#!/bin/bash
# luma/chroma stats of graded shots (signalstats, 3 fps)
cd "$(dirname "$0")/../work/clips"
for f in *.mp4; do printf "%-24s" "$f"; ffmpeg -hide_banner -nostats -i "$f" -vf "fps=3,signalstats,metadata=print:file=-" -an -f null - 2>/dev/null | awk -F= '/YLOW=/{a+=$2}/YAVG=/{b+=$2}/YHIGH=/{c+=$2}/UAVG=/{u+=$2}/VAVG=/{v+=$2;n++}END{printf "Ylow %3.0f Yavg %3.0f Yhigh %3.0f  U %5.1f V %5.1f\n",a/n,b/n,c/n,u/n,v/n}'; done
