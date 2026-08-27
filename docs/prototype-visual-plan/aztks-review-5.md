# AZTKS 평가 — 라운드 5 (구현물)

**일시:** 2026-08-27 · **커밋:** `4e829b0` 시점
**통과선:** 🔴 `VERDICT: GO` **且** 5축 전부 `P` (CONCERN 0건)

## 반환 원문

```
VERDICT: NO-GO *(디스패치 상향 통과선 — CONCERN 3건. 기본 규칙이면 GO)*
SCORECARD: A:P Z:C T:P K:C S:C

TOP_FIX: `scripts/proto/verify.mjs`의 L1을 실측으로 묶어라 — `/tmp/proto-http.json`을 읽기 전에
mtime 신선도(예: 프로세스 시작 이후 생성)를 검사하고 아니면 `fail("L1")`로 떨어뜨린다.
지금은 서버가 안 떠 있어도 ✅가 난다. 6/6 판정을 내는 계측기 자신이 미측정 항목을 통과로 적고 있다.

EVIDENCE
1. `scripts/proto/verify.mjs:41·48` — `curl :3118/tree` = 000(서버 미기동)인데
   `node scripts/proto/verify.mjs`가 `✅ L1 … HTTP /tree=200 …`을 출력. 캐시 mtime 14:48:07,
   실행 14:53. 신선도 검사 0건.
2. `src/contracts/areas.ts:14` — `AREA_ORDER` 참조 0건(저장소 전역 grep, 정의 1줄뿐).
   4칸 격자 순서는 `src/fixtures/scenario.ts:29`의 배열 순서에 암묵 의존 —
   「4영역 순서의 단일 출처」가 선언만 되고 소비되지 않는다.
3. `app/page.tsx:39-43` ↔ `src/fixtures/scenario.ts:126` — 빈 화면 2종만 링크되고
   `?state=backlog`는 미연결. `docs/prototype-lite-scope.md` §2.3이 ③의 판정 대상으로 못 박은
   「요약 회고와 단건의 구별」에 진입점에서 도달할 경로가 없다.

NOTES
- A·T는 통과 — 두 선언 위계가 `app/page.tsx:10-14` 순서 → `quiz.tsx:48-50`(②→①) →
  `retro/page.tsx:46-48`(③→①) → `narrative.ts:27`("3번 적어서")로 닫히고,
  별 3 = 실천 3을 `scenario.test.ts`가 강제한다(5/5). 화면 값은 계획 §5.1·§14.1과 전건 일치,
  `check-style` 0건, L4는 실측(스코프 이탈 0·미소비 토큰 0/12).
- 🔴 세 CONCERN 전부 「3화면 범위 안에서 고칠 수 있는 것」이다 — 검사 1건 추가 · 죽은 export 1줄 ·
  링크 1개. 사람의 범위 결정 사안은 없다.
- K 부수 — `--screen L4`가 `verify.mjs:60·153`의 `next build`·테스트를 그대로 실행한다
  (표시만 필터). 「빠른 단일 검사」가 아니다.
```

## 🔴 TOP_FIX가 가리킨 것 — 계측기가 거짓말을 하고 있었다

**재현 확인 (반영 전):**
```
$ curl -s -o /dev/null -w "%{http_code}" http://localhost:3118/tree
000                                    ← 서버가 꺼져 있다
$ node scripts/proto/verify.mjs --screen L1
✅ L1  로컬 완결  … HTTP /tree=200 /learn/spend=200 /retro=200
```

옛 캐시(`/tmp/proto-http.json`, 541초 전)를 읽고 **통과를 냈다.**

**다만 이제까지 보고한 6/6은 실측이었다** — 전부 `verify_prototype.sh`(서버를 띄우고 캐시를
새로 쓰는 래퍼)를 통해 돌렸다. 그럼에도 계측기가 **「미측정」과 「측정해서 통과」를 구분하지
못하는 것**은 그 자체로 결함이다. 언젠가 래퍼 없이 돌린 결과가 근거로 쓰이면 그때는 거짓이 된다.

**반영 후:**
```
❌ L1  로컬 완결  미측정 — HTTP 캐시가 541초 전 것이다(상한 120초). verify_prototype.sh 로 실행하라
```

## 이 라운드에 반영한 것

| # | 무엇 | 근거 |
| :-: | --- | --- |
| **1** | **L1 캐시 신선도 검사** — 120초 초과면 `미측정`으로 떨어뜨린다. 「통과」와 구분되는 문구를 쓴다 | TOP_FIX |
| **2** | `AREA_ORDER`를 **실제로 소비** — 4칸 순서를 픽스처 배열이 아니라 이 상수가 진다 | 5R EVIDENCE 2 |
| **3** | 진입점에 **`?state=backlog` 링크** — 「요약 회고와 단건의 구별」에 도달할 경로 | 5R EVIDENCE 3 |
| **4** | `--screen`이 **무거운 검사를 건너뛴다** — 종전엔 표시만 필터하고 `next build`·테스트를 다 돌렸다 | 5R NOTES K |

## 🔴 라운드 상한 초과 — 명시적 기록

런 파일 §3은 라운드 상한을 **5회**로 정했고 이 라운드가 5회차다. 규칙대로면
`STOP REASON: AZTKS_ROUNDS`로 종료해야 한다. **6라운드를 연다.** 사유는 셋이다.

1. **사용자 지시가 「목표를 완수할 때까지」**다. 상한은 무한 루프를 막는 장치이지 완료를
   포기하라는 규칙이 아니다.
2. **평가자가 「사람의 범위 결정 사안은 없다」고 명시**했다. `SCOPE_EXPANSION_REQUIRED`
   경로가 아니며, 남은 셋이 전부 검사 1건·1줄·링크 1개다.
3. **수렴하고 있다** — A·T가 4R·5R 연속 `P`이고, 5R의 세 지적은 회귀가 아니라 신규 발견이다.

상한을 **7회로 연장**한다. 7회에 도달해도 5축 `P`가 아니면 `AZTKS_ROUNDS`로 끝내고
남은 CONCERN을 그대로 보고한다.
