---
name: "[DB] FR-002: Prisma 스키마 정의"
about: Stage 1 · 개정 3.0 FR-002 (개정 2.0 FR-008 흡수)
title: "[DB] FR-002: Prisma 스키마 — app·pii 다중 스키마 · 모델 전수"
labels: "type:db, epic:E2, complexity:H, milestone:B0, blocked:T-3"
assignees: ''
---

<!--
Stage 1 · 4건 중 2번. 임계 경로 위에 있다 — 이 이슈가 밀리면 이후 전 태스크가 밀린다.
흡수: 개정 2.0의 FR-008 (1건 · 통합 없음)
-->

## 🎯 Summary

- **기능명:** 기준 SRS의 **11개 테이블 개요**와 설계 문서의 **24개 엔터티**를 Prisma 스키마로 확정한다. `app`·`pii` **다중 스키마**로 나눈다.
- **목적:** 이후 45개 이슈의 `References`와 `DoD`가 **여기서 정한 테이블·칼럼 이름을 가리킨다.** 이름이 흔들리면 전건이 흔들린다.
- **왜 단독 이슈인가:** 임계 경로의 첫 실질 지점이다. 다른 작업과 묶으면 **밀렸을 때 무엇이 밀렸는지** 알 수 없다.

## 🔗 References (Spec & Context)

> 💡 **작업 시작 전 아래를 반드시 먼저 Read/Evaluate 할 것.**

- 데이터 모델 전문: [`SRS_finfriends-nextjs-v1_0.md` §6.2](#) — `generator` · `datasource` · 모델 전수. **굵게 표시된 제약은 요구사항을 직접 강제하며 편의를 위해 완화할 수 없다**
- 스키마 분리 근거: [§6.3](#) — `pii` 분리는 REQ-NF-009(결합 조회 차단)의 물리적 전제
- 접속 구성: [§6.2 `datasource`](#) — `url`(6543 풀러) · `directUrl`(5432 직접)
- 버전 전제: [§10.1](#) — **Prisma `multiSchema` 지원 여부 확인** (T-3)
- 상위 명세: [`SRS_finfriends-v1_0.md` §6.4 데이터베이스 스키마 개요](#) · [§6.2 데이터 모델 정의](#)

## ✅ Task Breakdown (실행 계획)

- [ ] `generator client` — `previewFeatures = ["multiSchema"]` (버전에 따라 GA · §10.1 표와 대조)
- [ ] `datasource db` — `url = env("DATABASE_URL")` · `directUrl = env("DIRECT_URL")` · `schemas = ["app", "pii"]`
- [ ] **계정·동의 계층** — `GuardianAccount`(`authUserId @unique`) · `ChildAccount` · `ConsentRecord` · `enum ConsentState { PENDING COMPLETED }`
- [ ] **아동 자격증명 필드를 두지 않는다** — REQ-TEC-007 · CON-DEV-03. 아동은 보호자 세션 아래에서만 존재한다
- [ ] **별 원장** — `StarLedger`(`idempotency_key @unique` · `balance_after` · `trigger_code` · `client_ts` · `server_ts`)
- [ ] **실천 인정** — `PracticeCredit`(`starLedgerId @unique` — 실천 1 : 기입 1을 스키마로 강제)
- [ ] **미션·승인** — `Mission` · `MissionApproval`(`earned_at` · 상태 전이)
- [ ] **학습·퀴즈** — 원고·이수·정답 수 모델
- [ ] **계획·회고** — `PlanCard` · `RetroSentence`(`reviewState` · `source`) · 회고 기록
- [ ] **소비·제휴** — `SpendingRecord`(거래 ID 유니크) · `PARTNER_CARDS` · `partner_webhook_dlq`
- [ ] **위시리스트·아바타** — 단계 도달 중복 차단용 **부분 유니크 인덱스**
- [ ] **알림** — 구독(엔드포인트 유니크) · `notifications`(`attemptedAt` / `deliveredAt` 분리)
- [ ] **계측** — `app_events`(주차 파티셔닝 대상 · 필수 필드 `NOT NULL`) · `batch_heartbeats`
- [ ] **`pii` 스키마** — 식별정보 모델. `app` 쪽에서는 **참조 키만** 들고 있는다
- [ ] **집계 산출물** — `monthly_category_agg` 등 배치가 쓰는 테이블
- [ ] 좌표·얼굴 등 **금지 필드가 하나도 없음**을 확인 (CON-REG-03 · 06 — 이후 게이트 G2가 강제)

## 🧪 Acceptance Criteria (BDD/GWT)

**Scenario 1: 다중 스키마 생성**
- **Given:** `schemas = ["app", "pii"]`가 선언된 스키마
- **When:** `prisma migrate`를 실행한다
- **Then:** `app`·`pii` **두 스키마가 생성**되고 모델이 각각의 스키마에 배치된다.

**Scenario 2: 정합성 제약이 스키마로 강제됨**
- **Given:** `PracticeCredit.starLedgerId`에 `@unique`가 걸린 상태
- **When:** 같은 `starLedgerId`로 두 번째 실천 인정을 삽입한다
- **Then:** **DB가 거부**한다 — 애플리케이션 검증에 기대지 않는다.

**Scenario 3: 아동 자격증명 부재 (AC-T7.1의 전제)**
- **Given:** 확정된 스키마 전문
- **When:** 아동 계정의 비밀번호·토큰 등 자격증명 저장 필드를 찾는다
- **Then:** **0건**이다.

## ⚙️ Technical & Non-Functional Constraints

- **정합성:** `StarLedger.idempotency_key @unique` — REQ-TEC-003의 물리적 근거. 없으면 ⭐ 중복 지급(ACE-2.2)을 막을 수단이 사라진다
- **정합성:** `PracticeCredit.starLedgerId @unique` — 실천 1 : 기입 1. 붕괴하면 BAT-3 정합성 대조의 **기준 자체가 없어진다**
- **규제:** `pii` 스키마 분리는 REQ-NF-009의 전제 — 여기서 나누지 않으면 FR-003의 권한 회수가 성립하지 않는다
- **규제:** 아동 자격증명 필드 부재 — REQ-TEC-007
- **마이그레이션:** 이 이슈가 만드는 **최초 마이그레이션은 expand-contract 대상이 아니다**(신규 생성). 이후 변경부터 FR-003의 절차를 따른다

## 🏁 Definition of Done (DoD)

- [ ] `app`·`pii` 두 스키마가 **실제로 생성**되는가? (T-3 미해소 시 대체 수단으로 전환했는가)
- [ ] SRS §6.2에 **굵게 표시된 제약이 전건** 스키마에 반영되었는가?
- [ ] `idempotency_key @unique` · `starLedgerId @unique` · 거래 ID 유니크 · 구독 엔드포인트 유니크 — **4개 유니크 제약이 전부** 있는가?
- [ ] 아동 자격증명 저장 필드가 **0건**인가?
- [ ] 좌표·얼굴 등 금지 필드가 **0건**인가?
- [ ] `app_events`의 필수 필드가 `NOT NULL`인가? (파티셔닝은 FR-003에서 붙인다)
- [ ] 로컬과 Preview 양쪽에서 마이그레이션이 **동일하게** 적용되는가?

## 🚧 Dependencies & Blockers

- **Depends on:** FR-001 (플랫폼 셋업 — Supabase 프로젝트와 `DATABASE_URL`·`DIRECT_URL`이 있어야 한다)
- **Blocks (직접 12건):** FR-003(접근 계층) · FR-004(원장 기입) · FR-005(게이트 G2) · FR-007(판정 함수) · FR-008(도메인 계약) · FR-009(Mock) · FR-010 · FR-014 · FR-017 · FR-019 · FR-021 · FR-023
- **간접 32건** — 합쳐서 **44 / 45건.** 사실상 이후 전건이다
- **차단 항목:**
  - **T-3** 🔴 — Prisma 버전이 **다중 스키마를 지원하는가**. 미지원이면 `pii` 분리 수단을 **별도 DB 또는 뷰+권한**으로 교체해야 하며, 그 경우 FR-003의 Task Breakdown도 함께 바뀐다

## ⚠️ 임계 경로 주의

**이 이슈는 임계 경로의 첫 실질 지점이다.** 실측 최장 경로는
`FR-001 → FR-002 → FR-003 → FR-006 → FR-008 → FR-012 → FR-020 → FR-021 → FR-022 → UX-006` (10단계)이며, 여기서 밀린 만큼 **종점(회고 화면)이 그대로 밀린다.**
