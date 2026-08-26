---
description: 데이터 접근 — Prisma 2클라이언트 · RLS 2계층 · pii 권한 분리 · 원장 동시성 · expand-contract 마이그레이션
globs: ["prisma/**", "src/db/**", "src/actions/**"]
alwaysApply: true
---
# 005. 데이터 접근 — 애플리케이션이 실수해도 DB가 막는다

## 1. 3계층 방어 — 어느 하나도 다른 것을 대체하지 않는다

| 계층 | 무엇을 막는가 | 어디에 |
| --- | --- | --- |
| **1차 — 애플리케이션** | 잘못된 `where` 절 · 아동 id 위조 | `withGuardian()` — **보호자 id를 세션에서만** 읽는다. **인자로 받지 않는다** |
| **2차 — RLS** | 1차를 통과한 모든 쿼리 | `app_request` 롤에 걸린 정책. 이 롤에 `BYPASSRLS`가 **없다** |
| **3차 — 권한 분리** | `app` ↔ `pii` **결합 조회** | `pii` 스키마에 `USAGE`를 주지 않는다 → 조인이 **파싱 단계에서 실패** |

## 2. 클라이언트 2개 — 섞으면 2차 방어선이 사라진다

| 파일 | 롤 | RLS | 어디서 쓰나 |
| --- | --- | --- | --- |
| `src/db/request.ts` | `app_request` | **적용** | RSC · Server Action — **모든 요청 경로** |
| `src/db/batch.ts` | 서비스 롤 | **우회** | `pg_cron` 대조 · 집계 배치 **전용** |

🔴 **`src/db/batch.ts`를 Server Action·RSC에서 import하지 않는다.** 게이트 G3가 빌드에서 막는다.

```ts
// src/db/withGuardian.ts — 요청용 클라이언트의 유일한 입구
export async function withGuardian<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const guardianId = await requireGuardianSession();   // 쿠키·Auth에서만 — 인자로 받지 않는다
  return prismaRequest.$transaction(async (tx) => {
    // transaction 모드 풀러에서는 SET LOCAL이 트랜잭션 밖으로 새지 않는다 (C-TEC-011)
    await tx.$executeRaw`SELECT set_config('app.guardian_id', ${guardianId}::text, true)`;
    return fn(tx);
  });
}
```

## 3. 규칙 4가지 — 예외 없음

1. **요청용 클라이언트의 모든 쿼리는 트랜잭션 안에 있다.** `SET LOCAL`은 트랜잭션 밖에서 의미가 없고, transaction 모드 풀러에서는 커넥션이 다음 요청으로 넘어간다 — **트랜잭션 밖 쿼리는 정책이 꺼진 채 도는 쿼리**다.
2. **배치용 클라이언트는 요청 경로에 들어올 수 없다** (게이트 G3).
3. **RLS 정책이 없는 사용자 데이터 테이블은 존재할 수 없다.** 배치 `BAT-4a`가 `pg_policies`를 스캔해 0건을 확인한다.
4. **`pii` 접근은 함수 3개로만** — `upsert_identity` · `get_identity_ref` · `verify_owner`. **조인이 필요하면 그 요구를 되돌린다.**

## 4. RLS 작성 규약

```sql
ALTER TABLE app.child_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.child_accounts FORCE  ROW LEVEL SECURITY;   -- 소유자에게도 적용

CREATE POLICY child_own ON app.child_accounts
  USING (guardian_id = current_setting('app.guardian_id', true)::uuid);

-- 아동 종속 테이블은 재귀 RLS를 피하려고 SECURITY DEFINER 헬퍼를 쓴다
CREATE FUNCTION app.is_own_child(p_child uuid) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = app AS $$
    SELECT EXISTS (SELECT 1 FROM app.child_accounts c
                   WHERE c.id = p_child
                     AND c.guardian_id = current_setting('app.guardian_id', true)::uuid);
  $$;

CREATE POLICY ledger_own ON app.star_ledger USING (app.is_own_child(child_id));

REVOKE ALL ON SCHEMA pii FROM app_request;
GRANT EXECUTE ON FUNCTION pii.upsert_identity(uuid, text, text) TO app_request;
```

- `ENABLE` + **`FORCE`** 를 함께 건다. `FORCE`가 없으면 테이블 소유자에게 정책이 적용되지 않는다.
- 정책은 `prisma/sql/rls.sql`에 두고 마이그레이션과 함께 버전 관리한다. **`prisma db push`로 정책을 우회하지 않는다.**
- 아동 종속 테이블에 정책을 직접 쓰면 **재귀 RLS**에 걸린다 — `SECURITY DEFINER` 헬퍼를 쓴다.
- **RLS는 마지막에 켤 수 없다.** 나중에 넣으면 모든 쿼리를 다시 검토해야 한다.

## 5. 별 원장 동시성 (`REQ-TEC-019` · `X-6`)

같은 아동에 대한 Server Action이 **동시에 여러 인스턴스에서** 돌 수 있다. 3중으로 막는다.

1. **아동별 advisory lock**
2. **단일 SQL 원자 삽입** — 읽고-계산하고-쓰는 왕복을 없앤다
3. **`UNIQUE(idempotency_key)`**

`balance_after`는 **단조 증가**해야 하고 원장 불일치는 **0건**이다. 잔액을 애플리케이션에서 계산해 넣는 코드는 그 자체로 결함이다.

## 6. 커넥션 (`REQ-TEC-004`)

| 용도 | 접속 |
| --- | --- |
| 요청 경로 | **`DATABASE_URL` — 6543 · `pgbouncer=true` · `connection_limit=1`** |
| 마이그레이션 · 대량 배치 | `DIRECT_URL` — 5432 |

- **prepared statement를 쓰지 않는다** (transaction 모드 풀러).
- **부팅 시 접속 문자열을 assert**한다 — 요청용이 5432를 가리키면 즉시 실패시킨다. 조용한 오설정이 부하 시점에 커넥션 고갈로 나타나는 것을 막는다.

## 7. 스키마 (`schema.prisma`)

- `app` / `pii` **다중 스키마** 분리에 의존한다 (`T-3` 미확인 시 착수 전 확인).
- 🔴 **좌표(`lat`·`lng`·`geo`) · 얼굴(`face`·`photo`) 필드를 만들지 않는다** (게이트 G2 · 규제 계층 1).
- 🔴 **아동 자격증명 필드를 만들지 않는다.** Supabase Auth 사용자는 **보호자만** 존재하고, 아동 프로필 선택은 **보호자 세션에 서명된 쿠키**로만 표현된다 (`REQ-TEC-007`).
- 🔴 **별↔현금 전환 경로를 만들지 않는다** (게이트 G1 · `CON-REG-05`).
- `app_events`는 **주차 파티셔닝**. 필수 필드 `idempotency_key`·`client_ts`·`server_ts`는 `NOT NULL`이고 결측 0건이다. 파티션은 **`pg_cron`이 선행 생성**한다 (`REQ-TEC-020`).

## 8. 마이그레이션 — expand-contract (`REQ-TEC-015`)

**한 배포에 파괴적 DDL을 넣지 않는다** — `DROP COLUMN` · `RENAME` · 기존 칼럼에 `NOT NULL` 추가 (게이트 G7).

```
배포 1 (expand)  : 칼럼 추가 (nullable) · 이중 기입 시작
배포 2 (transition): 읽기를 새 칼럼으로 전환
배포 3 (contract): 구 칼럼 제거 — 앞 배포가 운영에 안착한 뒤
```

- 무중단 배포 중에는 **구·신 버전이 같은 DB를 동시에** 쓴다. **「코드를 되돌려도 DB가 앞서 있어도 동작하는 상태」**를 항상 유지한다.
- 롤백은 **코드만** 되돌린다. 마이그레이션은 함께 되돌아가지 않는다.
- 마이그레이션 구간의 오류율 상승은 **≤ 0.5%p**.
- **스키마 소유자 승인 필수.**

## 9. 배치 분담 (`REQ-TEC-010` · `X-5`)

| 실행 주체 | 무엇을 | 기준 |
| --- | --- | --- |
| **`pg_cron` + SQL 함수** | DB 내부 집계·정산·파티션 생성 | 함수 실행 시간 제한이 **없다** |
| **Vercel Cron** | 외부 호출이 필요한 발송·통보·프로브 | 실행 시간이 함수 상한의 **60%를 넘지 않아야** 한다 |
| **`pg_net` → `/api/internal/notify`** | DB가 감지한 것을 알린다 | `pg_cron`은 푸시·SMS를 직접 보낼 수 없다 |

각 배치의 **최근 성공 시각**을 감시하고 **주기의 2배를 넘기면 알림**한다. 배치가 조용히 멈춘 상태는 실패처럼 보이지 않는다.

## See also
- [004-runtime-boundaries.md](004-runtime-boundaries.md) · [006-prebuild-gates.md](006-prebuild-gates.md)
- 스킬: `rls-and-migration` · `supabase-postgres-best-practices` · `prisma-client-api` · `prisma-cli`
- 근거: SRS §6.2 · §6.3 · §6.5 · §10.4 · §11
