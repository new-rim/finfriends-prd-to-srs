---
name: "[Infra] FR-001: 플랫폼 셋업·환경 스코프·로컬·스타일"
about: Stage 1 · 개정 3.0 FR-001 (개정 2.0 FR-001~007 흡수)
title: "[Infra] FR-001: 플랫폼 셋업 — 배포 단위 1개 · 리전 고정 · 환경 스코프 분리"
labels: "type:infra, epic:E1, complexity:H, milestone:B0, blocked:D-TEC-3, blocked:D-TEC-4"
assignees: ''
---

<!--
Stage 1 · 4건 중 1번 — 유일한 진입점(선행 없음)이다. 이 이슈가 열려야 나머지 45건이 시작된다.
흡수: 개정 2.0의 FR-001 · FR-002 · FR-003 · FR-004 · FR-005 · FR-006 · FR-007 (7건)
-->

## 🎯 Summary

- **기능명:** 배포 단위 1개(Next.js on Vercel + Supabase)를 세우고, **리전을 고정**하며, **Preview가 운영 데이터에 닿지 못하게** 환경 스코프를 분리한다.
- **목적:** 이후 45개 이슈가 서 있을 바닥을 만든다. 특히 **두 번째 Git Push가 나가기 전에** 환경 스코프가 분리되어 있어야 한다 — Push마다 Preview 배포가 생기므로(C-TEC-007), 그 순간 검토되지 않은 브랜치 코드가 운영 아동 데이터에 접근할 수 있다.
- **왜 한 이슈인가:** 7개 작업이 **담당자·검증 방식·완료 판정이 모두 같은 설정 작업**이다. 다만 환경 스코프 분리(구 FR-004)만 성격이 다르며, 이는 §남은 위험에 적어 둔다.

## 🔗 References (Spec & Context)

> 💡 **작업 시작 전 아래를 반드시 먼저 Read/Evaluate 할 것.**

- 라우트 그룹 구조: [`SRS_finfriends-nextjs-v1_0.md` §3.2](#) — `app/` · `src/` · `prisma/` · `scripts/gates/` 전체 트리
- 버전 고정: [§10.1](#) — Next.js 마이너 자동 상향 **금지** · Prisma `multiSchema` 지원 확인 · Node LTS
- 환경 변수: [§10.2](#) — 13개 변수의 스코프(Production / Preview 분리 / 전체)와 유출 시 영향
- 플랫폼 요금제 전제: [§10.3](#) — **리전 고정은 「대체 수단 없음」**
- 배포 절차: [§10.4](#) — 사람이 누르는 단계가 없다는 뜻
- 로컬 개발 환경: [§10.5](#) — 운영과 같은 Postgres·같은 RLS·같은 확장
- UI 규약: [§6.8](#) · C-TEC-004 · C-TEC-018 — `globals.css` 단일 진입점
- 수용 기준: [§9.2 AC-T13.1 · AC-T14.1](#) · [§9.3 RG-T3](#)

## ✅ Task Breakdown (실행 계획)

- [ ] **(구 FR-001)** Next.js App Router 프로젝트 초기화 · §3.2 트리대로 **라우트 그룹 스캐폴딩** — `(public)` `(guardian)` `(child)` `(ops)` `api/`
- [ ] **(구 FR-001)** `src/` 하위 디렉터리 생성 — `actions/` `db/` `domain/` `components/ui/` `lib/` · `prisma/` · `scripts/gates/`
- [ ] **(구 FR-002)** Supabase 프로젝트 생성 · 리전 **`ap-northeast-2` 고정** · `pg_cron`·`pg_net` 확장 활성화 (D-TEC-7 확인 결과 반영)
- [ ] **(구 FR-003)** Vercel 프로젝트 연결 · 함수 리전 **`icn1` 고정** · Git Push 배포 구성 · `runtime = "nodejs"` 명시
- [ ] **(구 FR-004)** 🔴 **환경 변수 스코프 분리** — §10.2 표대로 13개 변수를 Production / Preview / 전체로 배치
- [ ] **(구 FR-004)** 🔴 **Preview 전용 Supabase 프로젝트** 생성 후 Preview 스코프의 `DATABASE_URL`·`DIRECT_URL`을 그쪽으로 연결
- [ ] **(구 FR-004)** 🔴 **배포 보호** 활성화 — Preview URL에 인증 없이 접근 불가 (D-TEC-3 플랜 확인 필요)
- [ ] **(구 FR-005)** 의존성 버전 고정 — 착수 시점의 실제 버전을 `package.json`과 **SRS §10.1 표에 동시에** 기입 (표의 `[검증 대기]`를 해소한다)
- [ ] **(구 FR-006)** 로컬 Supabase(Docker) 구성 · **풀러 모드로 검증** (직접 연결만 쓰면 로컬에서만 통과하는 prepared statement 코드가 생긴다)
- [ ] **(구 FR-006)** 로컬에도 `pg_cron`·`pg_net` 활성 · **RLS 운영과 동일 적용** · `AI_ENABLED=false` 기본
- [ ] **(구 FR-006)** **익명 합성 시드** 스크립트 — 운영 데이터 복제 경로를 만들지 않는다 (CON-REG 계층)
- [ ] **(구 FR-007)** Tailwind · shadcn/ui 초기화 · `app/layout.tsx`에서 **`globals.css` 단일 진입점** 연결 · 폰트 설정

## 🧪 Acceptance Criteria (BDD/GWT)

**Scenario 1: Preview 격리 (AC-T14.1 · RG-T3)**
- **Given:** Preview 배포 URL이 발급된 상태
- **When:** 인증 없이 그 URL에 접근한다
- **Then:** **접근 불가**이고, Preview가 가리키는 DB가 **운영 프로젝트가 아니다.**

**Scenario 2: 리전 일치 (AC-T13.1 — §8 배분은 FR-036 · 여기서는 1차 확인)**
- **Given:** 배포가 완료된 상태
- **When:** 함수 리전과 DB 리전을 확인한다
- **Then:** `icn1` · `ap-northeast-2`로 **일치**한다.

**Scenario 3: 로컬 ↔ 운영 접속 모드 동등성 (§10.5)**
- **Given:** 로컬 Supabase가 기동된 상태
- **When:** 로컬에서 **풀러 모드**로 애플리케이션을 띄운다
- **Then:** 운영과 같은 transaction 모드로 동작하며, 로컬에서만 통과하는 prepared statement 경로가 **생기지 않는다.**

## ⚙️ Technical & Non-Functional Constraints

- **리전:** `icn1`(함수) · `ap-northeast-2`(DB) — REQ-TEC-013. **대체 수단이 없다**(§10.3), 플랜으로 해결할 문제다
- **환경 변수:** `SUPABASE_SERVICE_ROLE_KEY`·`PARTNER_*`·`CRON_SECRET`·`VAPID_*`·`SMS_API_KEY`·`GOOGLE_GENERATIVE_AI_API_KEY`는 **Production 스코프만** (REQ-TEC-014)
- **버전:** Next.js **마이너 자동 상향 금지** — 캐시·재검증 동작이 마이너에서 바뀐 전례가 있고 §8 예산에 직결된다
- **스타일:** CSS 진입점은 `globals.css` **하나뿐**이다 (C-TEC-018) — 게이트 G5가 이후 이를 강제한다
- **로컬:** 운영 데이터를 로컬로 내리지 않는다. 재현은 **합성 시드 + 익명화 이벤트**로만 한다

## 🏁 Definition of Done (DoD)

- [ ] AC-T14.1 통과 — Preview 비인증 접근 불가 · Preview DB가 운영이 아님이 **설정 감사로 확인**되는가?
- [ ] AC-T13.1 **1차 확인** — 배포 후 함수·DB 리전이 일치하는가? *(정식 판정은 FR-036 배포 환경 감사)*
- [ ] §3.2의 디렉터리 트리가 **전부 생성**되었는가? (빈 디렉터리라도 자리는 있어야 이후 이슈가 게이트를 통과한다)
- [ ] §10.2의 13개 환경 변수가 **표대로** 스코프에 배치되었는가? Production 전용 변수가 Preview에 하나도 없는가?
- [ ] `package.json`의 버전이 SRS §10.1 표와 **동시에** 갱신되었는가?
- [ ] 로컬에서 `pg_cron`·`pg_net`이 활성이고 **RLS가 켜진 채** 애플리케이션이 뜨는가?
- [ ] `globals.css` 외의 CSS 진입점이 **0개**인가?

## 🚧 Dependencies & Blockers

> 💡 이슈 생성 전에는 `FR-###`로 적고, 생성 후 `tasks/_index.md`의 매핑으로 `#번호`를 일괄 치환한다.

- **Depends on:** 없음 — **이 프로젝트의 유일한 진입점이다.**
- **Blocks (직접 16건):** FR-002(스키마) · FR-005(게이트) · FR-006(Action 골격) · FR-010(인증) · UX-002 · UX-005 · UX-006 · FR-019 · UX-006 · FR-023 · FR-028 · UX-004 · FR-031 · FR-032 · FR-034 · FR-036
- **간접 29건** — 사실상 나머지 전건이다. 이 이슈가 유일한 진입점이므로 45건 전부가 결국 여기에 매달린다
- **UX 선행:** `UX-001` 디자인 시스템 — 토큰·테마·컴포넌트 목록이 없으면 `globals.css`의 내용이 비어 있다. **이 이슈보다 먼저 끝나야 한다.**
- **차단 항목:**
  - **D-TEC-3** — 플랜이 **배포 보호**를 제공하는가. 미제공 시 Preview를 **끄고** 브랜치 배포를 만들지 않는다(§10.3)
  - **D-TEC-4** — Supabase 플랜의 백업/PITR 보존 기간. 미충족이면 **복구 요건 미충족 상태를 명시**하고 진행
  - **D-TEC-7** — `pg_cron`·`pg_net` 활성화 가능 여부. 불가 시 X-5(배치 분담) 전면 재설계

## ⚠️ 이 이슈의 남은 위험

> `ANALYSIS_task-consolidation.md` §7과 `TASKS_finfriends-nextjs-v3_0.md` §10.1이 지목한 사항이다.

- **환경 스코프 분리(구 FR-004)를 흡수한 것은 통합 정책상의 타협이다.** AC-T14.1은 릴리스 게이트 **RG-T3의 단독 근거**인데, 6개의 다른 설정 작업과 한 이슈에 있으면 **부분 통과를 표현할 수 없다.**
- **대응:** 이 이슈의 DoD에서 **AC-T14.1 항목만 별도 체크박스로 분리**해 두었다. RG-T3 판정 시 그 한 줄만 본다. 분리가 필요하다고 판단되면 **+1건**으로 떼어낼 수 있다.
