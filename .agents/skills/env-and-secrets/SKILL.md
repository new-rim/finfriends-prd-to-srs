---
name: env-and-secrets
description: Vercel·Supabase 환경 변수 스코프와 시크릿을 점검한다. Preview 스코프에 운영 시크릿이 없는지 · Preview가 별도 Supabase 프로젝트를 가리키는지 · 리전이 고정됐는지 · 배포 보호가 켜졌는지. 환경 설정·배포 준비·시크릿 추가 시 사용한다.
argument-hint: "[production | preview | local]"
allowed-tools: Read, Edit, Write, Grep, Glob, Bash
---

# 환경 변수 · 시크릿 점검

대상 환경: **$ARGUMENTS** (미지정 시 전체)

> **Git Push가 곧 배포이므로(`C-TEC-007`) 설정이 곧 릴리스 통제 수단이다.** 사람이 누르는 승인 단계가 없다 — 아래 항목 하나하나가 릴리스 게이트와 같은 무게를 갖는다.

## 1. 🔴 가장 위험한 실수를 먼저 본다

**Preview 스코프에 운영 시크릿이 있으면 안 된다.** Git Push마다 Preview 배포가 생기므로, 그 순간 **검토되지 않은 브랜치 코드가 운영 아동 데이터에 접근**한다 (`REQ-TEC-014`).

```bash
vercel env ls                       # 스코프별 목록
vercel env ls preview               # Preview에 무엇이 있는지 — 여기가 핵심
```

확인 항목:
- [ ] `SUPABASE_SERVICE_ROLE_KEY` · `PARTNER_API_KEY` · `PARTNER_WEBHOOK_SECRET` · `VAPID_PRIVATE_KEY` · `SMS_API_KEY` · `GOOGLE_GENERATIVE_AI_API_KEY` · `CRON_SECRET` · `INTERNAL_NOTIFY_SECRET` → **Production만**. Preview에 **0건**
- [ ] Preview의 `DATABASE_URL`·`DIRECT_URL`이 **별도 Supabase 프로젝트**를 가리킨다
- [ ] **배포 보호(인증 필수)** 활성 — Preview URL 비인증 접근 0건 (플랜 의존 · `D-TEC-3`)

## 2. 접속 문자열

| 변수 | 포트 | 필수 파라미터 |
| --- | --- | --- |
| `DATABASE_URL` (요청용) | **6543** | `pgbouncer=true` · `connection_limit=1` |
| `DIRECT_URL` (마이그레이션·대량 배치) | 5432 | — |

- [ ] 요청용이 **5432를 가리키지 않는다** — 부팅 시 assert가 이것을 잡는지 확인
- [ ] `connection_limit=1`이 빠지지 않았다 (서버리스에서 커넥션 고갈)

## 3. 리전 고정 (`REQ-TEC-013`)

- [ ] Supabase 프로젝트 **`ap-northeast-2`**
- [ ] Vercel 함수 **`icn1`** (`vercel.json` 또는 프로젝트 설정)
- [ ] 리전 변경은 **정책·법령 승인 없이 수행할 수 없다** — `X-8` · `D-TEC-1`과 직결

## 4. AI 스위치

- [ ] `AI_ENABLED` 기본 **`false`** (전체 스코프)
- [ ] `AI_MODEL_ID`가 환경 변수로 존재하고, **코드에 모델 식별자 하드코딩 0건** (`REQ-AI-002`)
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY`는 **Production만** · 서버 전용 (`NEXT_PUBLIC_` 접두사 금지)

## 5. 로컬

- [ ] `.env.local`이 `.gitignore`에 있다. **`.env.example`만 커밋**한다
- [ ] `.env.example`에 **모든 키가 값 없이** 나열되어 있다 (누락된 키는 배포 후에 발견된다)
- [ ] 로컬 DB도 **풀러 모드 · RLS 켠 상태**
- [ ] 시드는 **익명 합성 데이터**. 🔴 **운영 데이터 복제 금지**

## 6. `NEXT_PUBLIC_` 감사

```bash
grep -rn "NEXT_PUBLIC_" --include="*.ts" --include="*.tsx" src app | sort -u
```

- [ ] `NEXT_PUBLIC_`이 붙은 변수는 **브라우저에 노출된다.** 목록이 `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` 둘뿐인지 확인

## 7. 산출물

누락·불일치를 표로 보고한다 — **변수 · 있어야 할 스코프 · 실제 · 위험도 · 조치**. 시크릿 **값을 출력하거나 로그에 남기지 않는다.** 조치가 저장소 밖(Vercel·Supabase 콘솔)이면 **배포 소유자가 할 일**로 분리해 보고한다.
