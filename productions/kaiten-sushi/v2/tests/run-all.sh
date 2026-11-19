#!/usr/bin/env bash
# 一键跑全部自动化测试并重新打包：bash tests/run-all.sh [--no-video]
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
status=0
run() { echo; echo "===== $1"; shift; "$@" || status=1; }
run "逻辑测试 sim.test.js"        bash -c 'node tests/sim.test.js > out/sim-report.txt 2>&1; s=$?; tail -1 out/sim-report.txt; exit $s'
run "平台适配 platform.test.js"   node tests/platform.test.js
run "存档 progress.test.js"       node tests/progress.test.js
run "静态核验 static-validate.js" node tests/static-validate.js
run "调参记录 tune.js"            bash -c 'RUNS=60 SEEDS=20 node tests/tune.js > /dev/null && echo "写入 out/tuning.md"'
run "打包+官方审计 build-xhs.sh"  bash tools/build-xhs.sh
run "ZIP 冒烟 zip-smoke.js"       node tests/zip-smoke.js
run "端到端 e2e.js"               bash -c "node tests/e2e.js ${1:-} 2>&1 | grep -E '✗|结果|录屏'"
echo; [ $status -eq 0 ] && echo "全部通过" || echo "存在失败，见上方输出"
exit $status
