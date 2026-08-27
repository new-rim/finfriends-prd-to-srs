#!/usr/bin/env bash
# 프로토타입 완료 판정 L1~L6 — 런 파일 §2
set -uo pipefail
cd "$(dirname "$0")/../.."
PORT="${PORT:-3118}"

npm run dev -- --port "$PORT" >/tmp/proto-dev-verify.log 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null || true' EXIT

for i in $(seq 1 60); do
  curl -sf "http://localhost:$PORT/" >/dev/null 2>&1 && break
  sleep 1
done

{
  printf '{'
  first=1
  for p in /tree /learn/spend /retro; do
    code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$p")
    [ $first -eq 0 ] && printf ','
    printf '"%s":%s' "$p" "$code"
    first=0
  done
  printf '}'
} > /tmp/proto-http.json

node scripts/proto/verify.mjs "$@"
