---
name: rls-and-migration
description: RLS 정책을 추가·변경하거나 Prisma 마이그레이션을 작성한다. ENABLE+FORCE · SECURITY DEFINER 헬퍼 · pii 권한 회수 · expand-contract 3단계 분할 · 파괴적 DDL 금지. 스키마나 정책을 건드리는 모든 작업에 사용한다.
argument-hint: "[테이블 · 정책 · 마이그레이션 목적]"
allowed-tools: Read, Edit, Write, Grep, Glob, Bash
---

# RLS 정책 · 마이그레이션 절차

대상: **$ARGUMENTS**

> **RLS는 마지막에 켤 수 없다.** 나중에 넣으면 모든 쿼리를 다시 검토해야 한다. 테이블을 만드는 커밋과 정책을 켜는 커밋을 나누지 않는다.

## A. 새 사용자 데이터 테이블을 만들 때

1. `schema.prisma`에 테이블 추가 — **스키마는 `app`**. 개인 식별정보는 `pii`로 분리한다.
2. 🔴 **금지 필드 확인** — 좌표(`lat`·`lng`·`geo`) · 얼굴(`face`·`photo`) · 아동 자격증명 · 별↔현금 전환. 게이트 G1·G2가 막지만, **막히기 전에 만들지 않는다.**
3. `prisma/sql/rls.sql`에 정책을 **같은 PR에서** 추가한다.

```sql
ALTER TABLE app.<table> ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.<table> FORCE  ROW LEVEL SECURITY;   -- 소유자에게도 적용 — 빠뜨리지 않는다

-- 보호자 직속 테이블
CREATE POLICY <table>_own ON app.<table>
  USING (guardian_id = current_setting('app.guardian_id', true)::uuid);

-- 아동 종속 테이블 — 직접 조건을 쓰면 재귀 RLS에 걸린다
CREATE POLICY <table>_own ON app.<table> USING (app.is_own_child(child_id));
```

4. 필요한 인덱스를 정책의 조건 칼럼에 맞춰 만든다 — 정책은 모든 쿼리에 붙는 `WHERE`다.
5. `app_events`류 대량 테이블이면 **주차 파티셔닝** + `pg_cron` 선행 파티션 생성.

## B. 마이그레이션 — expand-contract 3단계

**한 배포에 파괴적 DDL을 넣지 않는다** (게이트 G7).

| 단계 | 하는 일 | 배포 |
| --- | --- | --- |
| **expand** | 칼럼 추가(**nullable**) · 새 인덱스 · 이중 기입 시작 | 1 |
| **transition** | 읽기를 새 칼럼으로 전환 · 백필 완료 확인 | 2 |
| **contract** | 구 칼럼 제거 · 제약 강화 | 3 (앞 배포 안착 후) |

- **금지** — `DROP COLUMN` · `RENAME` · 기존 칼럼에 `NOT NULL` 추가를 앞 단계와 같은 배포에 넣는 것.
- 무중단 배포 중에는 **구·신 버전이 같은 DB를 동시에** 쓴다. **「코드를 되돌려도 DB가 앞서 있어도 동작하는 상태」**를 유지한다.
- 롤백은 **코드만** 되돌린다. 마이그레이션은 함께 되돌아가지 않는다.
- 백필은 **배치로 나눠** 돌린다 — 한 트랜잭션에서 전체를 갱신하면 락이 잡힌다.
- 마이그레이션 구간의 오류율 상승은 **≤ 0.5%p**.

```bash
npx prisma migrate dev --create-only   # SQL을 먼저 만들어 검토한다
# ↳ 생성된 SQL을 열어 파괴적 DDL이 섞이지 않았는지 직접 확인
npx prisma migrate deploy              # 적용
npm run prebuild                       # 게이트 G7 통과 확인
```

**`prisma db push`를 쓰지 않는다** — 정책·권한 SQL을 우회하고 마이그레이션 이력을 남기지 않는다.

## C. 검증 — 「막히는 것」을 테스트한다

| 시나리오 | 기대 |
| --- | --- |
| 보호자 A 세션 · 보호자 B의 `child_id` 조회 | **예외가 아니라 0행** |
| `app` ↔ `pii` 조인 (`app_request` 롤) | **권한 오류로 실패** |
| `pg_policies` 스캔 | 정책 없는 사용자 데이터 테이블 **0건** |
| 트랜잭션 밖 요청용 쿼리 | **존재 0건** |
| 동시 200요청 부하 10분 | 커넥션 고갈 **0건** |

로컬도 **RLS를 켠 채 · 풀러 모드로** 검증한다. **운영 데이터를 로컬로 내리지 않는다** — 합성 시드만.

## D. 승인

RLS 정책 변경과 마이그레이션은 **스키마 소유자 승인 사항**이다. PR 본문에 **expand-contract 몇 단계인지**와 **어느 요구사항을 강제하는지**를 적는다.
