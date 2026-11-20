#!/usr/bin/env bash
# compose_chapter.sh —— 通用章节合成（第二章起使用；第一章保留 compose_ch01.sh 原样）
#   bash tools/compose_chapter.sh 02                # 分段渲染视觉层 + 叠口播窗口 + 混入口播原声 → demo-ch02/preview.mp4
#   SKIP_RENDER=1 bash tools/compose_chapter.sh 02  # 分段已渲染过，只拼接 + 合成
#   PAR=3 SHOT=jpeg bash tools/compose_chapter.sh 03  # 3 路并行 + JPEG 截图（第三章起推荐）
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

# 1) 视觉层：每段 640 帧，编码参数一致，concat 无损拼接
#    PAR=3     同时开 3 个 Chrome 并行渲染（默认 1）
#    SHOT=jpeg 用 JPEG 截图（约快 1.6 倍，与 PNG 版 PSNR≈53dB）；同一章所有分段要用同一种
#    已存在且帧数正确的分段会跳过 → 命令被打断后可以直接重跑续上
#    SKIP_COMPOSE=1 只渲染不合成（把长任务拆成多条前台命令）
PAR="${PAR:-1}"
seg_ok() {  # 分段文件存在且帧数正确
  local i=$1 want=$(( (i+1)*640 < FRAMES ? 640 : FRAMES - i*640 ))
  [ -s "$SEG/seg$i.mp4" ] && [ "$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 "$SEG/seg$i.mp4" 2>/dev/null | tr -dc 0-9)" = "$want" ]
}
if [ -z "${SKIP_RENDER:-}" ]; then
  [ -n "${FRESH:-}" ] && rm -f "$SEG"/seg*.mp4
  running=0
  for ((i=0; i<NSEG; i++)); do
    if seg_ok $i; then echo "  seg$i 已存在，跳过"; continue; fi
    ( cd "$ROOT" && OUT="demo-ch$CH" F0=$((i*640)) F1=$(((i+1)*640)) VIDEO_OUT="$SEG/seg$i.mp4" node tools/render.mjs video 30 >/dev/null && echo "  seg$i 完成" ) &
    running=$((running+1))
    if [ "$running" -ge "$PAR" ]; then wait -n; running=$((running-1)); fi
  done
  wait
fi
for ((i=0; i<NSEG; i++)); do seg_ok $i || { echo "✗ seg$i 不完整，重跑本命令即可续上"; exit 1; }; done
[ -n "${SKIP_COMPOSE:-}" ] && { echo "分段已齐（SKIP_COMPOSE=1，未合成）"; exit 0; }
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
