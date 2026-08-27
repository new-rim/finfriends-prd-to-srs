# AZTKS 평가 — 라운드 2 (구현물)

**일시:** 2026-08-27
**대상:** `docs/prototype-visual-plan/render-snapshot/*.txt` · `app/**` · `src/**`
**통과선:** 🔴 `VERDICT: GO` **且** `SCORECARD` 5축 전부 `P` (기본 규칙보다 높다 — CONCERN 0건)

## 반환 원문

```
VERDICT: NO-GO *(디스패치 상향 통과선 — C 3건)*
SCORECARD: A:P Z:C T:C K:C S:P

TOP_FIX: ②의 학습·퀴즈를 ①의 나무 조건과 **한 값**으로 잇는다 — `LEARN_PROGRESS`를
`AREA_STATES.SPEND.progress`에서 파생시키고, 4칸 카드에 남은 학습·퀴즈 조건을 함께
렌더한 뒤(계획 §5.3) 불변식 테스트를 1건 추가한다(현재 L6는 별↔실천만 잡는다).

EVIDENCE:
- `src/fixtures/scenario.ts:43` SPEND `{learn:2,quiz:4,practice:3}` ↔ `:146`
  `LEARN_PROGRESS={topicsDone:1,quizCorrect:1}` → `app/(child)/learn/spend/page.tsx:31-34`이
  같은 아이·같은 영역을 **「배우기 1/3」**으로 렌더. 단일 시나리오(계획 §14.1·규칙 §15)가
  여기서 갈라졌고 `src/fixtures/scenario.test.ts:12`는 이를 통과시킨다.
- `app/(guardian)/tree/page.tsx:71-75` — practice>0이면 「실천 N회」만, 0이면 남은 조건
  **1개**만. 계획 §5.3(`docs/prototype-visual-plan.md:287` "4칸 격자 안에는 조건으로
  표시되지만")·규칙 §12("⭐1과 **나무 진행도 갱신**이 같은 화면")와 어긋난다.
  `quiz.tsx:42-43`은 「퀴즈 1개를 맞혔어요」로 끝나 나무로 이어지지 않는다.
- `src/fixtures/scenario.ts:78-140` 회고 6건(넘김 3) ↔ 계획 §14.1(`:632` "카드 4장 ·
  별 없음 1") — 확정 출처와 구현이 어긋난 채 문서 미갱신.

NOTES:
- **T** — ③→①(별 3 = 실천 3 = 새싹)은 화면으로 읽히나, ②→①은 끊긴다. PRD가 "선언①의
  「학습」 마디는 설계 근거로만 서 있다"(PRD:256)고 경고한 바로 그 마디가 3화면에서
  성장으로 집계되는 장면이 없다. §13.0/§13.1이 신고한 부재와 별개 건이다.
- **K** — `src/fixtures/scenario.ts:28` `CHILD`는 전 코드에서 미참조(죽은 상수)이고, 그
  `cycleLabel:"이번 달"`은 `src/contracts/narrative.ts:43,54,62`에 리터럴로 중복돼 있다.
  `retro-sentences.ts:40-41`의 「적은 대로/적은 만큼」 두 제목은 계획에 근거가 없다.
- **Z(정상)** — `check-style.mjs` 0건 · `npm test` 3/3 · `tsc --noEmit` 무오류 확인.
```

## 이 라운드에 반영한 것 — TOP_FIX 1건

| 부분 | 조치 |
| --- | --- |
| `LEARN_PROGRESS` 파생 | `AREA_STATES`의 `SPEND.progress`에서 뽑는다. 값을 따로 적지 않는다 |
| 4칸 카드 | 남은 조건을 **전부** 렌더(가장 적게 남은 것부터) — 학습·퀴즈가 보여야 ②가 ①로 이어진다 |
| 퀴즈 결과 | *"잘 써요 나무의 퀴즈 조건이 하나 채워졌어요"* — 🔴 「실천」이라는 낱말은 여전히 쓰지 않는다 |
| 불변식 테스트 | `LEARN_PROGRESS` ↔ `SPEND.progress` 일치 1건 추가 (L6가 별↔실천만 잡던 구멍) |

**EVIDENCE 3번(회고 6건 ↔ 계획 4장)은 코드를 문서에 맞췄다** — 런 파일 §6이 *"계획 문서의
값과 화면이 어긋나면 문서를 고치지 말고 화면을 고친다"* 고 정했다. 회고를 4건으로 되돌리고
구성 검사 테스트를 1건 더 걸었다.

**NOTES의 K CONCERN(죽은 상수 `CHILD` · `cycleLabel` 중복 · 제목 2종 근거)은 이번에 손대지
않았다** — 런 파일 §5가 *"`TOP_FIX` 한 건만 반영하고 다음 라운드로 간다"* 고 정했다.
3라운드에서 다시 판정받는다.
