#!/usr/bin/env bash
# compose_ch01.sh —— 第一章成片：HTML 视觉层 + 口播窗口（同一份裁切视频）+ 名牌 + 原口播声音
#   bash tools/compose_ch01.sh            # 渲染视觉层并合成 demo-ch01/preview.mp4
#   SKIP_RENDER=1 bash tools/compose_ch01.sh   # 分段视觉层已渲染过，只拼接 + 合成
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/demo-ch01"
TMP="${TMPDIR:-/tmp}/skill-ch01"; mkdir -p "$TMP"
VIS="$TMP/visual.mp4"

# 1) 视觉层（capture 模式：口播窗口只画外框和投影，内部由第 2 步叠视频）
#    分段渲染（每段 640 帧，约 2 分钟），避免单条命令过长；分段编码参数一致，concat 无损拼接
SEG="$TMP/seg"; mkdir -p "$SEG"
if [ -z "${SKIP_RENDER:-}" ]; then
  rm -f "$SEG"/seg*.mp4
  for i in 0 1 2 3; do
    ( cd "$ROOT" && OUT=demo-ch01 F0=$((i*640)) F1=$(((i+1)*640)) VIDEO_OUT="$SEG/seg$i.mp4" node tools/render.mjs video 30 )
  done
fi
printf "file '%s'\n" "$SEG"/seg0.mp4 "$SEG"/seg1.mp4 "$SEG"/seg2.mp4 "$SEG"/seg3.mp4 > "$SEG/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$SEG/list.txt" -c copy "$VIS"
# 2) 窗口形状与名牌：从同一份 HTML 透明截图（保证圆角、位置与网页一致）
( cd "$ROOT" && OUT=demo-ch01 node tools/render.mjs overlay )

# 3) 合成：presenter.mp4 已按 540×960@(282,14) 裁好，这里缩到 280×498，用圆角遮罩叠到 (96,528)
#    名牌在 7.60s 起 0.45s 淡出（与网页里的 cue 一致）；声音直接取口播原声（0–83.50s，末尾已淡出并补静音）
ffmpeg -v error -y \
  -i "$VIS" \
  -i "$OUT/media/presenter.mp4" \
  -loop 1 -framerate 30 -i "$OUT/media/slot-mask.png" \
  -loop 1 -framerate 30 -i "$OUT/media/slot-name.png" \
  -filter_complex "\
    [1:v]fps=30,scale=280:498:flags=lanczos,setsar=1,format=rgba[p];\
    [2:v]crop=280:498:96:528,alphaextract[m];\
    [p][m]alphamerge[pm];\
    [0:v][pm]overlay=96:528:shortest=1[v1];\
    [3:v]format=rgba,fade=t=out:st=7.60:d=0.45:alpha=1[n];\
    [v1][n]overlay=0:0:shortest=1,format=yuv420p[v]" \
  -map "[v]" -map 1:a -t 84.2 \
  -c:v libx264 -crf 18 -preset medium -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart \
  "$OUT/preview.mp4"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact "$OUT/preview.mp4"
