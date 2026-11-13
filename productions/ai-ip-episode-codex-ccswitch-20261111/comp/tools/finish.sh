#!/usr/bin/env bash
# 收尾：口播响度标准化 → 与画面合成 → 手机预览 / 拼图 / SRT / 关键静帧 → 质检。
# 用法: tools/finish.sh <版本目录名，如 v001>
set -euo pipefail
cd "$(dirname "$0")/.."
VER="${1:?用法: finish.sh v001}"
EP="$(cd .. && pwd)"; OUT="$EP/out/$VER"; BUILD="$EP/build"
NAME="阿泽_Codex三步换DeepSeek_${VER}"
mkdir -p "$OUT/stills"
[ -e "$OUT/$NAME.mp4" ] && { echo "已存在 $OUT/$NAME.mp4，换一个版本号，不覆盖旧版"; exit 1; }
# V2 口播：素材 G 剪掉 0.12s 口误后的音轨（tools/build_voice_human.py 生成），不变速；两遍 loudnorm 到 -14 LUFS
F="${VOICE:-$EP/audio/v2/G_vo_cut.wav}"
[ -f "$F" ] || { echo "缺少口播音轨 $F"; exit 1; }
M=$(ffmpeg -hide_banner -i "$F" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | python3 -I -c "import sys,json;s=sys.stdin.read();j=json.loads(s[s.rindex('{'):s.rindex('}')+1]);print(f\"measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}\")")
RAW="${RAW:-$BUILD/raw.mp4}"
ffmpeg -v error -y -i "$RAW" -i "$F" -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:$M:linear=true,aresample=48000" -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT/$NAME.mp4"
ffmpeg -v error -y -i "$OUT/$NAME.mp4" -vf scale=360:640:flags=lanczos -c:v libx264 -crf 23 -c:a aac -b:a 96k "$OUT/${NAME}_手机预览360.mp4"
ffmpeg -v error -y -i "$OUT/$NAME.mp4" -vf "fps=1,scale=216:384,drawtext=fontfile=/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc:text='%{pts\:hms}':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,tile=13x5" -frames:v 1 -q:v 3 "$OUT/${NAME}_每秒拼图.jpg"
ffmpeg -v error -y -t 3 -i "$OUT/$NAME.mp4" -vf "fps=5,scale=216:384,tile=15x1" -frames:v 1 -q:v 3 "$OUT/${NAME}_前3秒.jpg"
# 口误回验：成片 2.2–5.3s 重新识别
mkdir -p "$BUILD/qa_asr" && ffmpeg -v error -y -ss 2.2 -t 3.1 -i "$OUT/$NAME.mp4" -vn -ac 1 -ar 16000 "$BUILD/qa_asr/slip.wav"
whisper "$BUILD/qa_asr/slip.wav" --model small --language zh --condition_on_previous_text False --output_format txt --output_dir "$BUILD/qa_asr" >/dev/null 2>&1 || true
node tools/qa_text.mjs "$OUT/$NAME.srt"
python3 -I tools/qa.py "$OUT/$NAME.mp4" "$OUT/质检报告.json"
