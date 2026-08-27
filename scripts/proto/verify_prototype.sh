#!/usr/bin/env bash
# 프로토타입 완료 판정 L1~L6 — 런 파일 §2
set -uo pipefail
cd "$(dirname "$0")/../.."
PORT="${PORT:-3118}"

# 🔴 dev 서버가 아니라 production 서버로 띄운다.
# next dev는 온디맨드 컴파일이라 워밍업 직후 요청이 500을 내는 일이 있고
# (.next 매니페스트를 읽다 SyntaxError), 그러면 스냅샷이 조용히 빈다.
npx next build >/tmp/proto-dev-verify.log 2>&1 || { echo "빌드 실패 — /tmp/proto-dev-verify.log 확인"; exit 1; }
npx next start --port "$PORT" >>/tmp/proto-dev-verify.log 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null || true' EXIT

for i in $(seq 1 60); do
  curl -sf "http://localhost:$PORT/" >/dev/null 2>&1 && break
  sleep 1
done

{
  printf '{'
  first=1
  for p in /tree /learn/spend /retro /wishlist /missions /forest /plan /history /avatar /guardian/missions; do
    code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$p")
    [ $first -eq 0 ] && printf ','
    printf '"%s":%s' "$p" "$code"
    first=0
  done
  printf '}'
} > /tmp/proto-http.json

node scripts/proto/verify.mjs "$@"
