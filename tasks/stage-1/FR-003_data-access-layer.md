---
name: "[Sec] FR-003: 데이터 접근 계층 전체"
about: Stage 1 · 개정 3.0 FR-003 (개정 2.0 FR-009~014 · UI-002 · FR-015 흡수)
title: "[DB] FR-003: 데이터 접근 계층 — 2클라이언트 · RLS 2계층 · pii 권한 회수"
labels: "type:db, type:sec, epic:E2, complexity:H, milestone:B0, gate:regulatory, blocked:T-3"
assignees: ''
---

<!--
Stage 1 · 4건 중 3번. 주 유형 [DB] · 부 유형 [Sec].
흡수: 개정 2.0의 FR-009 · FR-010 · FR-011 · FR-012 · UI-001 · FR-013 · UI-002 · FR-015 (8건)
-->

## 🎯 Summary

- **기능명:** **애플리케이션이 실수해도 DB가 남의 아동 데이터를 주지 않는 상태**를 만든다. 2클라이언트 분리 · RLS 2계층 · `pii` 권한 회수 · 이벤트 파티셔닝 · 마이그레이션 절차.
- **목적:** SRS §13.1이 *"RLS는 마지막에 켤 수 없다"* 고 못 박은 이유가 이것이다. **나중에 넣으면 모든 쿼리를 다시 검토**해야 한다.
- **왜 한 이슈인가:** 8개 작업이 **같은 완료 판정(AC-T5.1 · T5.2)** 을 공유한다. 롤만 나누고 RLS를 안 켠 중간 상태, 정책은 있는데 래퍼가 없는 상태는 **부분 성공이 아니라 실패**다.

## 🔗 References (Spec & Context)

> 💡 **작업 시작 전 아래를 반드시 먼저 Read/Evaluate 할 것.**

- 접근 규칙 전문: [`SRS_finfriends-nextjs-v1_0.md` §6.3](#) — 3계층 방어 다이어그램 · `withGuardian` 코드 · `rls.sql` 발췌 · **규칙 4가지**
- 접속 구성: [§6.2 `datasource`](#) · REQ-TEC-004 · C-TEC-011 — Supavisor transaction 모드
- 이벤트 파티셔닝: [§6.2 `app_events`](#) · REQ-TEC-020 · CON-ARC-07
- 마이그레이션: [§10.4](#) · REQ-TEC-015 · CON-TEC-01 — expand-contract 최소 2배포 분할
- 수용 기준: [§9.2 AC-T4.1 · AC-T5.1 · AC-T5.2](#) · [§9.3 RG-T2](#)

## ✅ Task Breakdown (실행 계획)

**접속 · 클라이언트**
- [ ] **(구 FR-009)** Supavisor **transaction 모드** 접속 구성 — `DATABASE_URL`에 `6543` · `pgbouncer=true` · `connection_limit=1`
- [ ] **(구 FR-009)** **부팅 시 접속 문자열 assert** — 요청용이 5432를 가리키면 즉시 실패시킨다 (조용한 오설정 방지)
- [ ] **(구 FR-010)** Prisma **2클라이언트 분리** — `src/db/request.ts`(롤 `app_request`) · `src/db/batch.ts`(서비스 롤)

**권한 · 정책**
- [ ] **(구 FR-011)** DB 롤 생성·분리 — `app_request`(BYPASSRLS **없음**) · `app_batch`
- [ ] **(구 FR-011)** 🔴 `REVOKE ALL ON SCHEMA pii FROM app_request` — **조인이 파싱 단계에서 실패**하게 만든다
- [ ] **(구 FR-012)** RLS **정책 전수 작성** — 사용자 데이터 테이블 전건에 `ENABLE` + `FORCE ROW LEVEL SECURITY`
- [ ] **(구 FR-012)** `app.is_own_child(uuid)` **SECURITY DEFINER 헬퍼** — 아동 종속 테이블의 재귀 RLS 회피
- [ ] **(구 FR-013)** `pii` 접근 함수 3종 — `upsert_identity` · `get_identity_ref` · `verify_owner` · 각각에만 `GRANT EXECUTE TO app_request`

**실행 규약**
- [ ] **(구 UI-001)** `withGuardian()` 트랜잭션 래퍼 — **보호자 id를 세션에서만 취득**하고 인자로 받지 않는다
- [ ] **(구 UI-001)** 래퍼 안에서 `set_config('app.guardian_id', …, true)` — `SET LOCAL`이 트랜잭션 밖으로 새지 않음을 풀러 모드에서 확인

**계측 · 마이그레이션**
- [ ] **(구 UI-002)** `app_events` **주차 파티셔닝** · 적재 유틸 · 필수 필드 `NOT NULL`
- [ ] **(구 FR-015)** **expand-contract 마이그레이션 절차 수립** — 최소 2배포 분할 · 파괴적 DDL 금지 · 「코드를 되돌려도 DB가 앞서 있어도 동작」 상태 유지

## 🧪 Acceptance Criteria (BDD/GWT)

**Scenario 1: 타 보호자 데이터 차단 (AC-T5.1)**
- **Given:** 보호자 A의 세션
- **When:** 보호자 B의 `child_id`를 직접 지정해 조회한다
- **Then:** **0행**을 반환한다 — **예외가 아니라 빈 결과**로 처리된다.

**Scenario 2: app ↔ pii 결합 조회 차단 (AC-T5.2)**
- **Given:** `app` 테이블과 `pii` 테이블을 조인하는 쿼리
- **When:** 요청용 롤(`app_request`)로 실행한다
- **Then:** **권한 오류로 실패**한다 — 데이터가 반환되지 않는다.

**Scenario 3: 커넥션 고갈 부재 (AC-T4.1 · RG-T2)**
- **Given:** 동시 사용자 200명 시나리오
- **When:** 10분간 부하를 준다
- **Then:** 커넥션 고갈 오류 **0건** · p95가 §8 예산 이내.

**Scenario 4: 트랜잭션 밖 쿼리 부재 (§6.3 규칙 1)**
- **Given:** 요청용 클라이언트로 도는 임의의 쿼리
- **When:** 실행 경로를 감사한다
- **Then:** **전부 트랜잭션 안**에 있다 — 트랜잭션 밖 쿼리는 정책이 꺼진 채 도는 쿼리다.

## ⚙️ Technical & Non-Functional Constraints

- **규제:** `pii` 스키마 `USAGE` 권한 회수 — REQ-NF-009. **조인이 필요하다는 요구가 오면 그 요구를 되돌린다**(§6.3 규칙 4)
- **규제:** RLS 정책이 없는 사용자 데이터 테이블은 **존재할 수 없다**(§6.3 규칙 3) — 이후 BAT-4a가 `pg_policies`를 스캔해 0건을 확인한다
- **경계:** 배치용 클라이언트는 Server Action·RSC에서 **import 불가** — 이후 게이트 G3(FR-005)가 강제한다
- **동시성:** transaction 모드 풀러에서 커넥션이 다음 요청으로 넘어가므로, `SET LOCAL`은 **트랜잭션 안에서만** 유효하다 (C-TEC-011)
- **배포:** 파괴적 DDL 금지 — 롤백이 **코드만 되돌리고 마이그레이션은 되돌리지 않기** 때문이다(§10.4)

## 🏁 Definition of Done (DoD)

- [ ] AC-T5.1 통과 — 타 보호자 조회가 **0행**(예외 아님)인가?
- [ ] AC-T5.2 통과 — `app`↔`pii` 조인이 **권한 오류로** 실패하는가?
- [ ] AC-T4.1 통과 — 동시 200명 10분에 커넥션 고갈 **0건**인가? *(정식 부하 검증은 FR-036가 지지만, 이 이슈에서 1차 확인한다)*
- [ ] 사용자 데이터 테이블 중 **RLS 정책이 없는 것이 0건**인가?
- [ ] `app_request` 롤에 `BYPASSRLS` 권한이 **없음**을 확인했는가?
- [ ] `withGuardian()`이 보호자 id를 **인자로 받지 않는가**? (받는 시그니처가 하나라도 있으면 1차 방어선이 무너진다)
- [ ] 요청용 클라이언트의 쿼리가 **전부 트랜잭션 안**인가?
- [ ] `app_events` 파티션이 생성되고 필수 필드가 `NOT NULL`인가?
- [ ] expand-contract 절차 문서가 있고, **다음 마이그레이션부터 적용**된다고 명시했는가?
- [ ] 로컬에서도 **RLS가 켜진 채** 동작하는가? (§10.5 — 로컬에서 끄면 정책 결함이 배포 후에 발견된다)

## 🚧 Dependencies & Blockers

- **Depends on:** FR-002 (Prisma 스키마 — 테이블이 있어야 정책을 건다)
- **Blocks (직접 8건):** FR-005(게이트 G3) · FR-006(Action 골격) · FR-009(Mock 시드) · FR-011(동의 게이트) · FR-024 · FR-026 · FR-033 · FR-036
- **간접 33건** — 요청 경로 전체가 이 아래에 있다
- **차단 항목:**
  - **T-3** 🔴 — Prisma 다중 스키마 미지원 시 `pii` 분리를 **별도 DB 또는 뷰+권한**으로 교체. 그 경우 위 「권한·정책」 항목 전체를 다시 설계한다

## ⚠️ 이 이슈의 무게

**흡수 8건 · 복잡도 H · AC 3건**으로 Stage 1에서 가장 크다. 나눌 수 없는 이유는 §Summary에 적었지만, **착수 시 두 사람 이상이 붙는다면** 「접속·클라이언트」와 「권한·정책」을 **같은 이슈 안의 병렬 작업**으로 나누는 것이 좋다 — 완료 판정은 함께 내린다.
