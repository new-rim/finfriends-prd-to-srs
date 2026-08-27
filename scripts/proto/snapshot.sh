#!/usr/bin/env bash
# 화면 렌더 스냅샷 — 계획 §14 · 런 파일 §2
#
# 🔴 aztks-agent는 Read·Grep·Glob·Bash만 갖고 브라우저가 없다.
#    이 스냅샷이 없으면 시각 흐름을 판정할 근거가 없다.
set -uo pipefail
cd "$(dirname "$0")/../.."

OUT="docs/prototype-visual-plan/render-snapshot"
PORT="${PORT:-3117}"
mkdir -p "$OUT"

echo "dev 서버 기동 (port $PORT)..."
# 🔴 dev 서버가 아니라 production 서버로 띄운다.
# next dev는 온디맨드 컴파일이라 워밍업 직후 요청이 500을 내는 일이 있고
# (.next 매니페스트를 읽다 SyntaxError), 그러면 스냅샷이 조용히 빈다.
npx next build >/tmp/proto-dev.log 2>&1 || { echo "빌드 실패 — /tmp/proto-dev.log 확인"; exit 1; }
npx next start --port "$PORT" >>/tmp/proto-dev.log 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null || true' EXIT

for i in $(seq 1 60); do
  curl -sf "http://localhost:$PORT/" >/dev/null 2>&1 && break
  sleep 1
done

grab() { # grab <파일> <제목> <경로...>
  local file="$OUT/$1.txt"; shift
  local title="$1"; shift
  { echo "# $title"; echo "생성: $(date '+%Y-%m-%d %H:%M:%S')"; } > "$file"
  # 워밍업 — dev 서버는 첫 요청에 컴파일한다. 그 응답을 뜨면 빈 화면이 잡힌다.
  for path in "$@"; do curl -s "http://localhost:$PORT$path" >/dev/null; done
  for path in "$@"; do
    { echo; echo "════════════════════════════════════════"; echo "URL: $path"; echo "════════════════════════════════════════"; } >> "$file"
    local body
    body=$(curl -s "http://localhost:$PORT$path" | node scripts/proto/html-to-text.mjs)
    if [ "$(printf '%s' "$body" | grep -c '^## 렌더 텍스트$')" -eq 1 ] &&
       [ -z "$(printf '%s' "$body" | sed -n '/^## 렌더 텍스트$/,$p' | tail -n +2 | tr -d '[:space:]')" ]; then
      echo "  ❌ $path — 렌더 텍스트가 비었다 (컴파일 실패 또는 오류 페이지)" >&2
      FAILED=1
    fi
    printf '%s\n' "$body" >> "$file"
  done
  echo "  $file"
}
FAILED=0

grab home  "진입점 — ②→③→① 순서"                 "/"
grab tree  "① 성장 나무 + 정체 원인 (보호자)"      "/tree" "/tree?state=grown" "/tree?state=empty"
grab learn "② 학습·퀴즈 (아동)"                   "/learn/spend" "/learn/spend?picked=b"
grab retro "③ 두 갈래 회고 (아동)"                "/retro" "/retro?state=backlog" "/retro?state=empty"

if [ "$FAILED" -ne 0 ]; then echo "스냅샷 실패 — 빈 렌더가 있다"; exit 1; fi
echo "스냅샷 완료"
