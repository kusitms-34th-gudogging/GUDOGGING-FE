#!/bin/sh
# E2E 실행: 플로우마다 목서버를 처음 상태로 되돌린 뒤 maestro test
# 사용: sh scripts/e2e.sh [플로우.yml ...]  (없으면 .maestro/ 루트의 플로우 전부)
# 먼저 다른 터미널에서 `E2E=1 pnpm mock` (package.json scripts에 넣으면 네이티브 지문이 바뀌어 EAS 빌드가 돌아서 여기 둠)
set -e

MOCK=${MOCK_URL:-http://localhost:9090}
[ "$#" -eq 0 ] && set -- .maestro/*.yml

for flow in "$@"; do
  curl -sf -o /dev/null -X POST "$MOCK/e2e/reset" ||
    { echo "목서버 초기화 실패: E2E=1 pnpm mock 으로 띄웠는지 확인 ($MOCK)"; exit 1; }
  maestro test "$flow"
done
