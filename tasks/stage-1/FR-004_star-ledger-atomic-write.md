---
name: "[DB] FR-004: 별 원장 원자 기입 SQL"
about: Stage 1 · 개정 3.0 FR-004 (개정 2.0 FR-015 흡수)
title: "[DB] FR-004: 별 원장 원자 기입 — advisory lock + 단일 INSERT + UNIQUE(idempotency_key)"
labels: "type:db, epic:E2, complexity:H, milestone:B0, gate:regulatory"
assignees: ''
---

<!--
Stage 1 · 4건 중 4번. 임계 경로 위의 H 태스크이므로 절대 병합하지 않는다.
흡수: 개정 2.0의 FR-015 (1건 · 통합 없음)
-->

## 🎯 Summary

- **기능명:** 같은 아동에 대한 **동시 지급**이 두 서버리스 인스턴스에서 처리돼도 `balance_after`가 어긋나지 않게 하는 SQL을 만든다.
- **목적:** REQ-NF-006(**별 원장 불일치 0% — 협상 불가**)의 물리적 근거다. 읽고-더하고-쓰는 왕복이 있으면 그 순간 요구사항이 깨진다.
- **왜 단독 이슈인가:** **별이 걸린 전 기능**(FR-014 지급 · FR-017 미션 · FR-020 보상 · FR-027 회고)이 이 위에 선다. 합치면 밀렸을 때 무엇이 밀렸는지 알 수 없다.

## 🔗 References (Spec & Context)

> 💡 **작업 시작 전 아래를 반드시 먼저 Read/Evaluate 할 것.**

- 동시성 해소 전문: [`SRS_finfriends-nextjs-v1_0.md` §6.5](#) — 시퀀스 다이어그램 · **SQL 전문** · 방어선 4종 표
- 데이터 모델: [§6.2 `StarLedger` · `PracticeCredit`](#) — `idempotency_key @unique` · `starLedgerId @unique`
- 멱등 계약: REQ-TEC-003 · C-TEC-010 — 클라이언트 생성 UUIDv7 · **반환값 동일**
- 예산: [§8.2](#) — ⭐ 지급~화면 반영 **p95 ≤ 800ms**
- 수용 기준: [§9.2 AC-T3.1 · AC-T19.1](#) · [§9.3 RG-T2](#) · [`SRS_finfriends-v1_0.md` §9.3 ACE-2.2](#)

## ✅ Task Breakdown (실행 계획)

- [ ] `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))` — **아동 단위** 잠금 (`$1` = `child_id`)
- [ ] **단일 `INSERT … SELECT`** — 직전 `balance_after`를 서브쿼리로 읽어 같은 문장 안에서 더한다. **애플리케이션 왕복 없음**
- [ ] 직전 행 선택 순서를 `ORDER BY server_ts DESC, id DESC LIMIT 1`로 고정 (동일 타임스탬프 시 결정적 정렬)
- [ ] 최초 지급 시 `COALESCE(…, 0)` — 원장이 비어 있어도 동작
- [ ] `ON CONFLICT (idempotency_key) DO NOTHING … RETURNING *`
- [ ] **0행 반환 시 기존 행을 조회해 같은 값을 반환** — 이것이 REQ-TEC-003의 *"반환값 동일"* 이다
- [ ] `practice_credits` 1:1 삽입 경로 — `starLedgerId @unique`가 실천 1 : 기입 1을 강제함을 확인
- [ ] SQL을 `prisma/sql/` 아래에 두고 **호출부에서 문자열 조립을 하지 않는** 형태로 노출
- [ ] 차감(아바타 교환)도 **같은 경로**를 타도록 `delta` 부호만 다르게 설계 — 별↔저금통 전환 경로를 만들지 않는다

## 🧪 Acceptance Criteria (BDD/GWT)

**Scenario 1: 동일 멱등 키 동시 재호출 (AC-T3.1)**
- **Given:** 동일한 `idempotency_key`로 지급을 **10회 동시 호출**
- **When:** 전부 완료된다
- **Then:** `star_ledger` 행은 **1건**이고 반환값 10개가 **모두 동일**하다.

**Scenario 2: 서로 다른 지급 100건 동시 (AC-T19.1 · RG-T2)**
- **Given:** 동일 아동에 대한 **서로 다른** 지급 100건 동시
- **When:** 전부 처리된다
- **Then:** `balance_after`가 **1..100의 단조 증가** · 누락·중복 **0건**.

**Scenario 3: 동일 미션 2회 승인 (ACE-2.2)**
- **Given:** 같은 미션에 승인 요청이 2회 이상 발생
- **When:** 각각 승인한다
- **Then:** ⭐는 **1회만 지급**되고 원장 불일치 **0건**.

**Scenario 4: 잠금 범위 (§8.2 예산)**
- **Given:** 서로 다른 아동 두 명에 대한 동시 지급
- **When:** 동시에 실행한다
- **Then:** **서로 대기하지 않는다** — 전역 락이 아니라 아동 단위 락이다.

## ⚙️ Technical & Non-Functional Constraints

- **정합성:** 별 원장 불일치 **0% — 협상 불가** (REQ-NF-006)
- **성능:** ⭐ 지급~화면 반영 **p95 ≤ 800ms** (§8.2) — **전역 락을 쓰면 이 예산을 못 지킨다.** 경합은 같은 아동에 대해서만 일어나므로 잠금 범위도 거기까지다
- **멱등:** `idempotency_key`는 **클라이언트가 생성한 UUIDv7** (REQ-TEC-003 · C-TEC-010). 서버가 만들면 재시도가 새 키가 된다
- **서버리스:** 인스턴스가 임의 시점에 종료될 수 있으므로 **「나중에 마저 하기」가 성립하지 않는다.** 지급과 실천 인정이 한 문장·한 트랜잭션에 있어야 한다
- **규제:** 별↔저금통 전환 경로 부재 (REQ-NF-010 · CON-REG-05) — 이후 게이트 G1(FR-005)이 강제한다

## 🏁 Definition of Done (DoD)

- [ ] AC-T3.1 통과 — 동일 키 10회 동시에 원장 **1건** · 반환값 **전부 동일**인가?
- [ ] AC-T19.1 통과 — 서로 다른 100건 동시에 `balance_after`가 **단조 증가**하는가?
- [ ] ACE-2.2 통과 — 동일 미션 2회 승인에 ⭐ **1회만** 지급되는가?
- [ ] 잔액 계산에 **애플리케이션 왕복이 0회**인가? (읽기와 쓰기가 같은 문장 안에 있는가)
- [ ] 서로 다른 아동의 동시 지급이 **서로 대기하지 않는가**?
- [ ] `DO NOTHING`으로 0행일 때 **기존 행을 조회해 반환**하는 경로가 있는가?
- [ ] 차감(아바타 교환)이 **같은 SQL 경로**를 타는가? (별도 경로를 만들면 게이트 G1이 잡지 못하는 전환 경로가 생긴다)
- [ ] 호출부에서 SQL **문자열 조립을 하지 않는가**?

## 🚧 Dependencies & Blockers

- **Depends on:** FR-002 (Prisma 스키마 — `StarLedger` · `PracticeCredit`과 유니크 제약이 있어야 한다)
- **Blocks (직접 4건):** FR-006(Action 골격) · FR-014(grantStar) · FR-031(정산 배치) · FR-045(동시성 부하 테스트)
- **간접 30건** — 별이 걸린 기능(FR-017 미션 · FR-020 보상 · FR-027 회고)은 **FR-014를 거쳐** 이 이슈에 매달린다
- **차단 항목:** 없음 — 외부 종속이 없는 순수 DB 작업이다

## ⚠️ 임계 경로 주의

**「별이 걸린 전 기능」이 이 이슈 위에 선다.** 개정 3.0 §7이 지목한 지점이며, 여기서 설계를 바꾸면 FR-014 · 017 · 020 · 027이 함께 다시 열린다. **부하 검증은 FR-045가 정식으로 지지만, 이 이슈에서 1차 확인을 마치고 넘긴다.**
