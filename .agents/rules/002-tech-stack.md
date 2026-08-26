---
description: 확정 기술 스택 · 버전 고정 방침 · 환경 변수 스코프 — 설계 변수가 아니다
globs: ["**/*"]
alwaysApply: true
---
# 002. 기술 스택

> **`C-TEC-001`~`007`은 발주 제약이며 설계 변수가 아니다.** 대안을 제안하려면 SRS §1.5를 읽고, §1.6 충돌 표에 무엇이 추가되는지를 함께 제시한다.

## 스택 — 하나의 배포 단위

| 층 | 확정 |
| --- | --- |
| **프레임워크** | **Next.js (App Router)** 단일 풀스택. 프론트/백엔드를 분리하지 않는다 (`C-TEC-001`) |
| **서버 로직** | **Server Actions**(쓰기) · **Route Handlers**(외부 진입·배치). 별도 백엔드 서버 없음 (`C-TEC-002`) |
| **DB** | **Supabase PostgreSQL** — 운영 `ap-northeast-2`. 로컬은 **로컬 Supabase(Docker)** (`C-TEC-003` · `C-TEC-016`) |
| **ORM** | **Prisma** — `multiSchema`(`app` / `pii` 분리)에 의존한다 (`T-3` 확인 대상) |
| **커넥션** | **Supavisor transaction 모드 `6543`** · `pgbouncer=true` · `connection_limit=1`. prepared statement 사용 금지 (`C-TEC-011`) |
| **UI** | **Tailwind CSS + shadcn/ui** 만 (`C-TEC-004` · `C-TEC-018`) |
| **클라이언트 형태** | **설치형 PWA 단일**. 네이티브 앱 없음 (`C-TEC-008`) |
| **배포** | **Vercel 프로젝트 1개** · 함수 리전 `icn1` · **Git Push만으로 배포** (`C-TEC-007`) |
| **배치** | DB 내부 집계는 **`pg_cron`**, 외부 호출이 필요한 것만 **Vercel Cron** (`C-TEC-013`) |
| **AI** | **Vercel AI SDK + Google Gemini** — 운영자 전용. 기본 `AI_ENABLED=false` (`C-TEC-005`·`006`) |
| **런타임** | Node (`runtime = "nodejs"`). Middleware만 Edge — **DB 접근 금지** |
| **테스트** | 단위·도메인은 Vitest · 시나리오(AC)는 Playwright |
| **강제 수단** | **`prebuild` 게이트 7종.** 별도 CI/CD 파이프라인을 만들지 않는다 (`C-TEC-014`) |

## 버전 고정 방침

| 대상 | 방침 | 이유 |
| --- | --- | --- |
| Next.js | **마이너 자동 상향 금지** | 캐시·재검증 동작이 마이너에서 바뀐 전례가 있다 — 성능 예산에 직접 영향 |
| Prisma | 메이저 고정 · **`multiSchema` 지원 확인 필수** | 미지원 버전이면 `pii` 분리 수단을 바꿔야 한다 (`T-3`) |
| Tailwind · shadcn/ui | 메이저 고정. shadcn 컴포넌트는 **복사본**이므로 일괄 갱신 대상이 아니다 | `C-TEC-004` |
| Vercel AI SDK · `@ai-sdk/google` | 메이저 고정 | `REQ-AI-002`의 표준 인터페이스 근거 |
| Node | Vercel 지원 LTS 고정 | — |

> 정확한 버전 번호는 **착수 시점에 확정해 `package.json`과 SRS §10.1 표에 동시에 적는다.** 지금 문서에 박아 두면 착수 시점에 이미 틀린 값이 된다.

## 환경 변수 — 스코프가 곧 보안 경계

| 변수 | 스코프 | 유출 시 |
| --- | --- | --- |
| `DATABASE_URL` (6543 · 요청용) | Production / Preview **분리** | 🔴 아동 데이터 |
| `DIRECT_URL` (5432 · 마이그레이션·대량 배치) | Production / Preview 분리 | 🔴 |
| `SUPABASE_SERVICE_ROLE_KEY` | **Production만** | 🔴 전체 (RLS 우회) |
| `NEXT_PUBLIC_SUPABASE_URL` · `..._ANON_KEY` | 전체 | 낮음 (공개 전제) |
| `PARTNER_API_BASE` · `PARTNER_API_KEY` | **Production만** | 🔴 금융 |
| `PARTNER_WEBHOOK_SECRET` | **Production만** | 🔴 위조 결제 |
| `CRON_SECRET` · `INTERNAL_NOTIFY_SECRET` | **Production만** | 배치·알림 위조 |
| `VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `VAPID_SUBJECT` | **Production만** | 푸시 위조 |
| `SMS_API_KEY` · `GOOGLE_GENERATIVE_AI_API_KEY` | **Production만** | 비용·스팸 |
| `AI_MODEL_ID` | 전체 | — (모델 교체 지점) |
| `AI_ENABLED` | 전체 · 기본 **`false`** | — |

> 🔴 **가장 위험한 설정 실수는 「Preview 스코프에 운영 시크릿을 넣는 것」이다.** Git Push마다 Preview 배포가 생기므로, 그 순간 **검토되지 않은 브랜치 코드가 운영 아동 데이터에 접근**한다. Preview는 **별도 Supabase 프로젝트만** 가리킨다 (`REQ-TEC-014`).

## 로컬 개발 — 운영과 같은 Postgres

| 항목 | 규칙 | 어기면 |
| --- | --- | --- |
| 접속 | **로컬도 풀러 모드로 검증** | 로컬에서만 통과하는 prepared statement 코드가 생긴다 |
| RLS | **운영과 동일하게 켠 채** 개발 | 정책 결함이 배포 후에 발견된다 |
| `pg_cron` · `pg_net` | 로컬에서도 활성 | 배치를 검증할 수 없게 된다 |
| 시드 | **익명 합성 데이터만.** 운영 데이터 복제 금지 | 규제 계층 위반 |
| AI | `AI_ENABLED=false` | 비용·유출 |

## 미결 — 스택에 걸려 있는 것

| ID | 확인 | 답이 「아니오」면 |
| --- | --- | --- |
| `T-1` / `D-TEC-2` | 제휴사가 **IP 허용목록**을 요구하는가 | Vercel은 고정 출구 IP가 없다 — 프록시 경로를 계약 전에 정해야 한다 |
| `T-2` / `D-TEC-3` | 플랜이 **5분 Cron · 배포 보호 · 로그 보존**을 주는가 | 판정 주기·Preview 보호를 다른 수단으로 세워야 한다 |
| `T-3` | Prisma가 **다중 스키마**를 지원하는가 | `pii` 분리 수단이 바뀐다 |
| `T-4` / `D-TEC-7` | **`pg_cron`·`pg_net`** 을 활성화할 수 있는가 | 🔴 배치 분담이 무너진다 — **아동 수가 늘어난 뒤에 실패한다** |

## See also
- [004-runtime-boundaries.md](004-runtime-boundaries.md) · [005-data-access-rls.md](005-data-access-rls.md) · [006-prebuild-gates.md](006-prebuild-gates.md)
- 근거: SRS §1.5 · §10 · §13.3 · §14
