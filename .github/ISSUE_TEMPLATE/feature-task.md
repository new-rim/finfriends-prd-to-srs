---
name: "GitHub Project 용 TASK 템플릿"
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] FR-NNN: {기능 요약}"
labels: ''
assignees: ''
---

<!--
라벨 규약 — 프런트매터에 고정 라벨을 두지 않는다. 139건의 유형이 서로 다르기 때문이다.
  type:       design | frontend | backend | db | infra | batch | test
  epic:       E1 ~ E20 (개발) · design-system 등 (UI/UX)
  complexity: H | M | L
  특수:        gate:regulatory (규제 강제 태스크) · blocked:D-TEC-N (미결 항목에 막힌 태스크)
마일스톤 — B0 · B1 · B2 · B3 · B4 · B5 · 조건부 · 검증
-->

## 🎯 Summary
- 기능명: [FR-047] 미션 승인 — 승인·⭐기입·실천 인정·이벤트 4건 원자 처리
- 목적: 보호자의 승인 한 번으로 별 지급과 실천 인정이 끊김 없이 함께 확정되게 한다.

## 🔗 References (Spec & Context)
> 💡 AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`SRS_finfriends-nextjs-v1_0.md` §4.1 (FUNC-002 · 010)](#)
- 서버 경계: [`SRS_finfriends-nextjs-v1_0.md` §6.1.1 `approveMission`](#) · 실행 골격 §6.4
- 데이터 모델: [`SRS_finfriends-nextjs-v1_0.md` §6.2 `MissionApproval` · `StarLedger` · `PracticeCredit`](#)
- 동시성 규약: [`SRS_finfriends-nextjs-v1_0.md` §6.5 별 원장 원자 기입](#)
- 수용 기준: [`SRS_finfriends-v1_0.md` §9.2 AC-6.1](#) · [§9.3 ACE-6.2](#)

## ✅ Task Breakdown (실행 계획)
- [ ] zod 입력 스키마 정의 — `idempotencyKey`(클라이언트 생성 UUIDv7) 필수 (REQ-TEC-003)
- [ ] `withGuardian()` 트랜잭션 안에서 동의 완료 재확인 — 캐시 금지 (REQ-TEC-006)
- [ ] `grantStarAtomically()` 호출 — advisory lock + 단일 SQL 원자 삽입 (§6.5)
- [ ] `earned_at`(완료 시점) 기준 주기 귀속 판정 · 주기 종료 시 `BACKFILLED` 분기 (ACE-6.2)
- [ ] `approval_state_changed` 이벤트를 **같은 트랜잭션**에 적재 (§9.4.6 H1)
- [ ] `revalidateTag` — 자기가 바꾼 태그만 무효화 (REQ-TEC-016)

## 🧪 Acceptance Criteria (BDD/GWT)
Scenario 1: 완료 시점 주기 내 승인
- Given: 아동이 미션을 완료해 `PENDING` 상태인 승인 건이 존재함
- When: 보호자가 완료 시점 주기 안에서 승인함
- Then: `APPROVED` 전이 · ⭐1 기입 · 실천 인정 가산 · 이벤트 적재가 **한 트랜잭션에서** 확정된다.

Scenario 2: 완료 시점 주기가 종료된 뒤 승인 (소급)
- Given: 미션 완료 후 보호자 미승인 상태로 완료 시점 주기가 종료됨
- When: 다음 주기에 승인함
- Then: `BACKFILLED` 전이 · **⭐는 지급**하되 나무 조건은 **완료 시점 주기에 귀속**되고 다음 주기에 가산되지 않는다.

Scenario 3: 동일 멱등 키 재호출
- Given: 동일한 `idempotencyKey`로 이미 처리된 승인 요청
- When: 같은 키로 10회 동시 재호출함
- Then: `star_ledger` 행은 **1건**이며 반환값 10개가 **모두 동일**하다. (AC-T3.1)

## ⚙️ Technical & Non-Functional Constraints
- 성능: ⭐ 지급~화면 반영 **p95 ≤ 800ms** (REQ-NF-002 · §8.2 예산 — `revalidateTag` 구간이 39%)
- 정합성: 별 원장 불일치 **0% — 협상 불가** (REQ-NF-006) · 소급 지급 성공률 **100%** (REQ-NF-007)
- 규제: 동의 미완 상태의 쓰기 거부 (REQ-TEC-006) · 별↔저금통 전환 경로 부재 (REQ-NF-010 · 게이트 G1)
- 경계: 쓰기는 Server Action 밖에서 일어날 수 없다 (REQ-TEC-002 · 게이트 G3)

## 🏁 Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] `prebuild` 게이트 7종을 통과하는가? (해당 태스크에 걸리는 게이트를 명시할 것)
- [ ] RLS 통합 테스트 통과 — 타 보호자 데이터 조회 시 **0행** 반환하는가? (AC-T5.1)
- [ ] 동시성 부하 테스트 통과 — `balance_after` 단조 증가 · 원장 불일치 **0건** (AC-T19.1)
- [ ] 귀속 신설 요구사항의 수용 기준(`AC-T*` · `AC-A*`)이 테스트로 존재하는가?
- [ ] 이 태스크가 내는 인앱 이벤트가 **같은 스프린트에** 포함되었는가? (§13.2 B6 병행)

## 🚧 Dependencies & Blockers
> 💡 이슈 생성 전에는 `FR-###`로 적고, 생성 후 `tasks/_index.md`의 매핑으로 `#번호`를 일괄 치환한다.
- Depends on: FR-040 (별 지급 경로) · FR-046 (미션 생성·완료 보고) · FR-029 (판정 순수 함수)
- Blocks: FR-048 (거절) · FR-049 (일괄 승인) · FR-050 (승인 대기 화면)
