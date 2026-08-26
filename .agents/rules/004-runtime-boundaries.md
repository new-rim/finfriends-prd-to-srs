---
description: 런타임 경계 4종 · 라우트 그룹 · Server Action 계약 · Route Handler 규약 · 캐시/재검증 — 이 저장소의 백엔드 아키텍처 규칙
globs: ["app/**", "src/actions/**", "src/domain/**", "middleware.ts"]
alwaysApply: true
---
# 004. 런타임 경계 — 백엔드 아키텍처

> 이 저장소에는 3층(Controller-Service-Repository)이 없다. 단일 프레임워크에서 층을 나누는 축은 **「어디에서 실행되는가」**이며, 그것이 곧 보안 경계다.

## 1. 경계 4종 — 무엇을 어디에 두는가

```
① Client Component  브라우저   상호작용 · 낙관적 UI · IndexedDB 큐 · SW/푸시 수신
                                🚫 @/db/** import 금지
② Middleware        Edge      세션 쿠키 서명·만료 검증 · 라우트 그룹 분기
                                🚫 DB 접근 금지
③ RSC               Node      화면 데이터 조회 — 읽기 전용
                                🚫 INSERT/UPDATE/DELETE 금지
④ Server Action     Node      쓰기 전수 — src/actions/** · "use server"
⑤ Route Handler     Node      외부 진입(웹훅) · 배치 진입 — app/api/**/route.ts
   src/domain/**              판정 로직 — 순수 함수 · DB·React 비의존
```

**판정 규칙** — 새 코드를 어디에 둘지 모르겠으면 이 순서로 묻는다.
1. 외부 시스템이 우리를 호출하는가 → **Route Handler**
2. 상태를 바꾸는가 → **Server Action**
3. 화면에 보여줄 값을 읽는가 → **RSC**
4. 브라우저 이벤트에만 반응하는가 → **Client Component**
5. 위 어디에서도 같은 답을 내야 하는 계산인가 → **`src/domain/`**

## 2. 라우트 그룹 — 분리를 폴더로 강제한다

```
app/
├─ layout.tsx          전역 셸 · globals.css(Tailwind 진입) · 폰트
├─ (public)/           랜딩 · 로그인 · 동의 안내 — 세션 불필요
├─ (guardian)/         보호자 세션 필수 — onboarding · tree · forest · approvals · spending
├─ (child)/
│  ├─ layout.tsx       🔴 동의 게이트 확정 판정 — 유일한 판정 지점
│  └─ learn · avatar · plan · retro · wishlist
├─ (ops)/              운영자 전용 — 아동·보호자 계정으로 진입 불가
└─ api/                Route Handler
```

**아동 화면은 예외 없이 `(child)` 아래에 둔다.** 그룹 밖 아동 화면은 게이트를 우회하는 것이 아니라 **애초에 그 레이아웃 아래에 들어가지 못한다**(`REQ-TEC-001` · `X-1`). 그룹을 새로 만들지 않는다.

## 3. 동의 게이트 — 네 겹으로 둔다

| 지점 | 무엇을 보는가 | 캐시 | 실패 시 |
| --- | --- | --- | --- |
| `middleware.ts` (Edge) | 세션 쿠키 서명·만료 · 아동 프로필 선택 여부 | — | `(public)/login` 리다이렉트 |
| **`app/(child)/layout.tsx`** (RSC) | **`consent_state = COMPLETED` DB 조회** | 🔴 **금지 — `noStore()`** | 차단 화면 + `consent_gate_blocked` 적재 → **즉시 규제 알림** |
| Server Action 공통 래퍼 | 같은 조회를 **트랜잭션 안에서** 재확인 | 금지 | 쓰기 거부 · 감사 로그 |
| DB (RLS) | `app.is_consented(guardian_id)` | — | **0행 반환** |

> **한 겹으로 줄이지 않는다.** 미들웨어는 빠르지만 틀릴 수 있고(쿠키는 낡는다), 레이아웃은 정확하지만 **읽기 경로만** 막는다. 쓰기는 Server Action으로 직접 들어올 수 있다. `REQ-NF-008`의 「100% 차단」은 한 겹으로 증명할 수 없다. **판정 지점을 줄이는 리팩터링 제안은 거절한다.**

## 4. Server Action 계약 — 골격을 벗어나지 않는다

```ts
// src/actions/approveMission.ts
"use server";

const Input = z.object({
  idempotencyKey: z.string().uuid(),   // ① REQ-TEC-003 — 클라이언트 생성 UUIDv7
  approvalId:     z.string().uuid(),
});

export async function approveMission(raw: unknown) {
  const input = Input.parse(raw);                         // ① 입력 검증
  return withGuardian(async (tx) => {                     //   보호자 id는 세션에서만
    await assertConsentCompleted(tx);                     // ② 동의 재확인 (캐시 금지)
    const result = await grantStarAtomically(tx, {        // ③ 원자 기입 — 왕복 없음
      idempotencyKey: input.idempotencyKey, /* … */
    });
    await recordEvent(tx, "approval_state_changed", …);   // ④ 계측 — 같은 트랜잭션
    return result;
  }).then((r) => {
    revalidateTag(`stars:${r.childId}`);                  // ⑤ 자기가 바꾼 태그만
    revalidateTag(`tree:${r.childId}`);
    return r;
  });
}
```

| 단계 | 규칙 | 어기면 |
| --- | --- | --- |
| ① 입력 검증 | **zod 스키마 필수 · `idempotencyKey` 필수** | Server Action은 **공개 엔드포인트**다. 검증 없는 인자는 그대로 외부 입력이다 |
| ② 동의 재확인 | 트랜잭션 안에서 조회 · **캐시 금지** | `REQ-NF-008`이 읽기 경로에서만 성립한다 |
| ③ 원자 기입 | **단일 트랜잭션 · 읽고-쓰는 왕복 없음** | `REQ-NF-006`(정합성 0%) |
| ④ 계측 동시 적재 | 이벤트를 **같은 트랜잭션**에 넣는다 | 지급은 됐는데 이벤트가 없어 WPA가 실제보다 낮게 나온다 |
| ⑤ 선택적 재검증 | **자기가 바꾼 태그만** 무효화 | `revalidatePath("/")` 한 줄이 800ms 예산을 날린다 |

**원자성의 범위** — `approveMission`은 한 트랜잭션에서 **승인 · ⭐ 기입 · 실천 인정 · 이벤트 4건**을 처리한다. 서버리스에서는 인스턴스가 임의 시점에 종료되므로 **「나중에 마저 하기」가 성립하지 않는다.** 나누면 중간 상태가 정합성 오류로 관측된다.

**일괄 처리** — `bulkApproveMissions`처럼 일괄이어도 **원자성은 건 단위**다. 건별 트랜잭션 N회로 처리하고 부분 실패를 허용한다.

**멱등 키는 클라이언트가 만든다.** 서버가 생성하면 재시도 시 중복을 막을 수 없다(`C-TEC-010`).

## 5. Route Handler 규약 — 외부 진입만

| 경로 | 호출자 | 인증 |
| --- | --- | --- |
| `/api/partner/webhook/payment` · `/card-state` | 제휴사 | **HMAC 서명 + 타임스탬프 허용창 5분** |
| `/api/cron/inactivity` · `/probe` · `/cost` · `/webhook-dlq` | Vercel Cron | `CRON_SECRET` 헤더 |
| `/api/internal/notify` | **`pg_net`** (DB 내부) | 공유 시크릿 + 출처 제한 |
| `/api/ops/ai/retro-draft` | 운영자 | 운영자 세션 + 역할 검사 |
| `/api/health` | 프로브 | 없음 (상태만) |

- **웹훅은 처리 실패에도 200을 반환**하고 실패를 `partner_webhook_dlq`에 남긴다. 서버리스에서 5xx를 주면 제휴사 재전송이 함수 동시 실행을 밀어올려 **커넥션을 고갈시킨다.** 재처리는 **우리 배치가** 한다 — 상대의 재시도에 기대지 않는다.
- **서명 검증 실패는 401이고, 적재 0건**이다. 동일 거래 재전송은 제휴사 거래 ID 유니크로 막는다 (`REQ-TEC-018`).
- Route Handler를 **화면용 데이터 API로 쓰지 않는다.** 읽기는 RSC다. 이 목록에 없는 Route Handler를 만들기 전에 SRS §6.1.2를 갱신한다.
- 새 Server Action·Route Handler를 만들면 **SRS §6.1의 전수 목록에 추가**한다. **목록에 없는 서버 실행 경로는 존재하지 않아야 한다.**

## 6. 캐시·재검증 규약 (`REQ-TEC-016`)

| 데이터 | 캐시 |
| --- | --- |
| 동의 상태 · 별 잔액 · 승인 대기 건수 | 🔴 **금지 (`noStore`)** |
| 나무 단계·조건 | 태그 `tree:{childId}` — 쓰기 액션이 무효화 |
| 월간 숲 · 소비 집계 | 태그 `forest:{childId}` — **배치가** 무효화 |
| 학습 원고 · 문장 풀 | 태그 `content` — 운영자 승인 시 무효화 |

## 7. AI 경계 (`REQ-AI-001`~`005`)

- AI SDK import는 **`app/api/ops/**` 아래에서만.** `(child)`·`(guardian)` 렌더 경로와 그들이 호출하는 Server Action에서 **0건**(게이트 G6).
- **아동·보호자 요청이 AI 응답을 기다리는 경로 0건.** AI 장애가 어떤 화면도 저하시키지 않는다.
- 프롬프트 허용 입력은 **갈래 코드 · 톤 지침 · 금지어 목록 · 길이 제약**뿐. 아동 식별자·금액·가맹점명·자유 입력 원문 **금지** (`C-TEC-017`).
- 모델 식별자 **하드코딩 금지** — `AI_MODEL_ID` 환경 변수만으로 교체되어야 하고 코드 변경은 **0줄** (`REQ-AI-002`).
- 출력은 `generateObject` 스키마 검증을 통과해야 적재되고, `review_state=DRAFT`로만 들어간다. **콘텐츠 담당 승인 전에는 어떤 아동 화면에도 배정되지 않는다** (`REQ-AI-004`).

## 8. PWA · 오프라인 · 푸시 — 플랫폼 능력의 경계

| 능력 | Android | iOS | 처리 |
| --- | --- | --- | --- |
| Web Push | ✅ | ⚠️ **설치된 PWA에서만** | 미설치 시 **인앱 배너 + SMS 폴백** |
| Background Sync | ✅ | ❌ | **포그라운드 진입 시 flush** |
| IndexedDB 큐 | ✅ | ✅ | **양쪽 공통 — 여기가 무조건 성립하는 부분** |

**무조건 성립시켜야 하는 것** — ⭐ 중복 **0건** · `client_ts` 주차 귀속 · 기록 손실 **0건**. 반영 시점(지원 플랫폼 ≤ 60초 / iOS 다음 포그라운드 ≤ 5초)은 **체감**의 문제이고, 기록이 사라지는 것은 **신뢰**의 문제다. 둘을 같은 칸에 두지 않는다.

## See also
- [005-data-access-rls.md](005-data-access-rls.md) · [006-prebuild-gates.md](006-prebuild-gates.md)
- 근거: SRS §3.1 · §3.2 · §3.3 · §3.4 · §6.1 · §6.4 · §6.7 · §4.3
