#!/usr/bin/env bash
# compose_chapter.sh —— 通用章节合成（第二章起使用；第一章保留 compose_ch01.sh 原样）
#   bash tools/compose_chapter.sh 02                # 分段渲染视觉层 + 叠口播窗口 + 混入口播原声 → demo-ch02/preview.mp4
#   SKIP_RENDER=1 bash tools/compose_chapter.sh 02  # 分段已渲染过，只拼接 + 合成
#   NAME_FADE=7.60 …                                 # 有名牌的章节才需要（只有第一章）
# 依赖：demo-chNN/index.html（build.py 产物）、demo-chNN/media/presenter.mp4（已裁成 540×960、含本章声音与 0.7s 片尾）
set -euo pipefail
CH="${1:?用法：compose_chapter.sh <章号，如 02>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/demo-ch$CH"
TMP="${TMPDIR:-/tmp}/skill-ch$CH"; SEG="$TMP/seg"; mkdir -p "$SEG"
VIS="$TMP/visual.mp4"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/media/presenter.mp4")
FRAMES=$(python3 -c "print(round($DUR*30)+1)")
NSEG=$(( (FRAMES + 639) / 640 ))

# 1) 视觉层：每段 640 帧（约 2 分钟），编码参数一致，concat 无损拼接
if [ -z "${SKIP_RENDER:-}" ]; then
  rm -f "$SEG"/seg*.mp4
  for ((i=0; i<NSEG; i++)); do
    ( cd "$ROOT" && OUT="demo-ch$CH" F0=$((i*640)) F1=$(((i+1)*640)) VIDEO_OUT="$SEG/seg$i.mp4" node tools/render.mjs video 30 )
  done
fi
: > "$SEG/list.txt"; for ((i=0; i<NSEG; i++)); do echo "file '$SEG/seg$i.mp4'" >> "$SEG/list.txt"; done
ffmpeg -v error -y -f concat -safe 0 -i "$SEG/list.txt" -c copy "$VIS"

# 2) 窗口遮罩 / 名牌：从同一份 HTML 透明截图
( cd "$ROOT" && OUT="demo-ch$CH" node tools/render.mjs overlay )

# 3) 合成
NAMEF=""; [ -n "${NAME_FADE:-}" ] && NAMEF=",fade=t=out:st=${NAME_FADE}:d=0.45:alpha=1"
ffmpeg -v error -y \
  -i "$VIS" -i "$OUT/media/presenter.mp4" \
  -loop 1 -framerate 30 -i "$OUT/media/slot-mask.png" \
  -loop 1 -framerate 30 -i "$OUT/media/slot-name.png" \
  -filter_complex "\
    [1:v]fps=30,scale=280:498:flags=lanczos,setsar=1,format=rgba[p];\
    [2:v]crop=280:498:96:528,alphaextract[m];\
    [p][m]alphamerge[pm];\
    [0:v][pm]overlay=96:528:shortest=1[v1];\
    [3:v]format=rgba${NAMEF}[n];\
    [v1][n]overlay=0:0:shortest=1,format=yuv420p[v]" \
  -map "[v]" -map 1:a -t "$DUR" \
  -c:v libx264 -crf 18 -preset medium -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart \
  "$OUT/preview.mp4"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact "$OUT/preview.mp4"
