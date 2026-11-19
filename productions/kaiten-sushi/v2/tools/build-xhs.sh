#!/usr/bin/env bash
# 生成小红书小工具上传 ZIP（minitool-zip-builder 1.11.1 规范）
#   bash tools/build-xhs.sh
# 1) 只复制运行所需的 index.html + src/**（不含测试、文档、截图、PNG 参考图、旧 ZIP）
# 2) 静态核验（ES2017 解析、脚本顺序、白名单、禁用能力扫描）
# 3) 进入产物目录压缩“目录内容”，index.html 位于 ZIP 根；固定时间戳 + 排序，产物可复现
# 4) 官方 audit_artifact.py / audit_artifact.mjs 分别审计目录与 ZIP
set -euo pipefail
cd "$(dirname "$0")/.."
V2="$(pwd)"
STAGE="$V2/build/xhs"
OUT_ZIP="$V2/release/kaiten-sushi-v2-xhs-minitool.zip"
rm -rf "$STAGE" && mkdir -p "$STAGE" "$V2/release"
cp index.html "$STAGE/"
cp -r src "$STAGE/src"
find "$STAGE" \( -name '.DS_Store' -o -name '*.map' -o -name '*.md' \) -delete
node tests/static-validate.js "$STAGE"
python3 -I - "$STAGE" "$OUT_ZIP" <<'PY'
import os, sys, zipfile
stage, out = sys.argv[1], sys.argv[2]
files = []
for d, _, fs in os.walk(stage):
    for f in fs:
        files.append(os.path.relpath(os.path.join(d, f), stage).replace(os.sep, '/'))
files.sort(key=lambda p: (p != 'index.html', p))
if os.path.exists(out): os.remove(out)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for rel in files:
        info = zipfile.ZipInfo(rel, date_time=(2026, 11, 19, 12, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        with open(os.path.join(stage, rel), 'rb') as fh:
            z.writestr(info, fh.read())
with zipfile.ZipFile(out) as z:
    names = z.namelist()
    assert names[0] == 'index.html', names[:3]
    assert all(not n.startswith(('/', '../')) and '/../' not in n for n in names)
    assert not any(n.endswith(('.md', '.png', '.zip', '.map', '.txt')) or 'tests/' in n or 'node_modules' in n for n in names)
    assert z.testzip() is None
print('ZIP 条目 %d 个，根入口 %s' % (len(names), names[0]))
PY
echo "--- audit_artifact.py (目录)";  python3 tools/xhs-audit/audit_artifact.py "$STAGE"
echo "--- audit_artifact.py (ZIP)";   python3 tools/xhs-audit/audit_artifact.py "$OUT_ZIP"
echo "--- audit_artifact.mjs (目录)"; node tools/xhs-audit/audit_artifact.mjs "$STAGE"
echo "--- audit_artifact.mjs (ZIP)";  node tools/xhs-audit/audit_artifact.mjs "$OUT_ZIP"
ls -l "$OUT_ZIP"
sha256sum "$OUT_ZIP"
