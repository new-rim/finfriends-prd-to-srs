---
name: server-action-contract
description: Server Action을 SRS §6.4 골격대로 작성하거나 기존 액션이 계약을 지키는지 점검한다. zod 검증 · idempotencyKey · withGuardian · 동의 재확인 · 원자 기입 · 같은 트랜잭션 이벤트 · 태그 단위 재검증. 쓰기 경로를 만들거나 고칠 때 사용한다.
argument-hint: "[액션 이름 또는 파일 경로]"
allowed-tools: Read, Edit, Write, Grep, Glob, Bash
---

# Server Action 계약 점검·작성

대상: **$ARGUMENTS**

## 0. 먼저 확인

- 만들려는 액션이 **SRS §6.1.1 전수 목록에 있는가.** 없으면 **목록에 추가하는 것부터** 논의한다.
- 이 액션이 무효화해야 할 **태그**가 §6.1.1 표에 적혀 있다.

## 1. 골격 — 5단계를 벗어나지 않는다

```ts
"use server";

const Input = z.object({
  idempotencyKey: z.string().uuid(),   // REQ-TEC-003 — 클라이언트가 만든 UUIDv7
  /* … 나머지 인자 */
});

export async function <동사명>(raw: unknown) {
  const input = Input.parse(raw);                       // ① 입력 검증
  return withGuardian(async (tx) => {                   //   보호자 id는 세션에서만
    await assertConsentCompleted(tx);                   // ② 동의 재확인 (캐시 금지)
    const result = await <원자 기입>(tx, {               // ③ 단일 트랜잭션 · 왕복 없음
      idempotencyKey: input.idempotencyKey, /* … */
    });
    await recordEvent(tx, "<이벤트명>", …);              // ④ 계측 — 같은 트랜잭션
    return result;
  }).then((r) => {
    revalidateTag(`<태그>:${r.<id>}`);                  // ⑤ 자기가 바꾼 태그만
    return r;
  });
}
```

## 2. 체크리스트 — 하나라도 아니면 계약 위반

- [ ] `"use server"`가 파일 최상단에 있고, 파일이 `src/actions/**` 아래에 있다
- [ ] **zod 스키마로 전 인자를 검증**한다 (Server Action은 공개 엔드포인트다)
- [ ] **`idempotencyKey`가 필수 인자**다. 서버에서 생성하지 않는다
- [ ] 동일 키 재호출 시 **부작용 1회 · 반환값 동일**
- [ ] 모든 DB 접근이 **`withGuardian()` 트랜잭션 안**에 있다
- [ ] 보호자 id를 **인자로 받지 않는다** (세션에서만)
- [ ] **동의 재확인이 트랜잭션 안**에 있고 캐시하지 않는다
- [ ] 잔액·카운터를 **애플리케이션에서 계산해 넣지 않는다** (단일 SQL 원자 기입)
- [ ] 이벤트 적재가 **같은 트랜잭션** 안에 있다
- [ ] `revalidateTag`로 **자기가 바꾼 태그만** 무효화한다. `revalidatePath("/")` 없음
- [ ] `src/db/batch.ts`를 import하지 않는다
- [ ] 외부 호출(제휴사·본인인증)이 있으면 **실패 시 입력값 보존 규칙**을 지킨다
- [ ] 일괄 처리라면 **원자성이 건 단위**이고 부분 실패를 허용한다

## 3. 테스트

| 시나리오 | 기대 |
| --- | --- |
| 동일 `idempotencyKey` 2회 호출 | 부작용 1회 · 반환값 동일 |
| 동의 미완 상태에서 호출 | **쓰기 거부 + 감사 로그** |
| 타 보호자 자원 id로 호출 | **0행 → 실패** (RLS) |
| 동시 100요청 (같은 아동) | `balance_after` **단조 증가** · 불일치 0건 |
| zod 스키마 위반 입력 | 검증 단계에서 거부 |

## 4. 마지막

게이트 **G4**가 이 계약을 정적으로 검사한다. 로컬에서 `npm run prebuild`를 돌려 **통과를 확인**한 뒤 커밋한다.
