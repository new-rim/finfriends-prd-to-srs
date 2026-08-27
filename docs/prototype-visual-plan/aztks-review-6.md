# AZTKS 평가 — 라운드 6 (구현물)

**일시:** 2026-08-27 · **커밋:** `14e127b` 시점
**통과선:** 🔴 `VERDICT: GO` **且** 5축 전부 `P` (CONCERN 0건)

## 반환 원문

```
VERDICT: NO-GO *(상향 통과선 — CONCERN 2건. 기본 규칙이면 GO)*
SCORECARD: A:P Z:C T:P K:C S:P

TOP_FIX: 나무를 실제로 그려라 — `app/(guardian)/tree/page.tsx:71-73`이 단계를 「새싹」 글자로만 낸다.
계획 §5.4가 확정한 CSS/SVG 3단계 도형(씨앗·새싹·나무)을 4칸에 넣고,
`scripts/proto/html-to-text.mjs:14` DOM 개요 정규식에 `svg|figure`를 더해 스냅샷에 잡히게 한 뒤
L5에 「3단계 도형 존재」 검사 1건을 붙이고 재생성한다.

EVIDENCE
1. `docs/prototype-visual-plan.md:289-292`(§5.4 "CSS/SVG 3단계 도형(씨앗·새싹·나무)으로 그린다") ·
   `.agents/rules/008-visual-prototype.md:61` ↔ `app/(guardian)/tree/page.tsx:71-73`.
   `grep -rn "svg\|circle\|clip-path" app/ src/` = 0건. **시각 프로토타입의 간판 화면에 나무 그림이
   없고**, PRD 부록 B 「나무 층」이 낱말로만 선다. 런 파일 §6대로면 문서가 아니라 화면을 고칠 자리다.
2. 계측기가 원리적으로 못 본다 — `scripts/proto/html-to-text.mjs:14`의 태그 목록에 `svg`·`div`가
   없어 도형은 스냅샷에 잡히지 않는다. **2~5R이 이 결손을 놓친 이유**이고, L1~L6 어디에도
   도형 검사가 없다.
3. `src/fixtures/scenario.ts:71` 주석 "별 없음 3건(넘김)" ↔ 실제 1건(`scenario.test.ts:58`이
   `OVER===1`을 강제). 6건→4건 축소(2R) 때 남은 낡은 주석이며,
   **단일 출처 파일이 자기 구성을 틀리게 적고 있다**.

NOTES
- 실측 재확인 — `verify_prototype.sh` 6/6(L1 실측 0초 전 · L4 최소 대비 5.0 · L6 5건) ·
  `tsc --noEmit` 0 · `check-style` 0건.
- A·T 유지 — 위계가 `app/page.tsx:10-14`(②→③→①) → `quiz.tsx:48-50` → `retro/page.tsx:46-48` →
  `narrative.ts:27`("3번 적어서")로 닫힌다. 5R 지적 3건은 반영 확인.
- 🔴 CONCERN 2건 모두 3화면 범위 안에서 고칠 수 있다 — 도형 1개 + 주석 1줄.
  화면 추가 요구가 아니므로 `SCOPE_EXPANSION_REQUIRED` 아님.
```

## 🔴 이 라운드가 드러낸 것 — 계측기가 못 보는 것은 다섯 번을 돌아도 안 잡힌다

**시각 프로토타입인데 간판 화면에 나무 그림이 없었다.** 계획 §5.4가 *"CSS/SVG 3단계 도형으로
그린다"* 고 확정했는데 「새싹」이라는 **글자로만** 냈다. `grep svg app/ src/` = **0건**.

**2~5라운드가 이걸 못 잡은 이유가 EVIDENCE 2에 있다** — 렌더 스냅샷을 만드는
`html-to-text.mjs`가 태그 목록에 `svg`를 안 넣어, **도형이 있든 없든 스냅샷에 흔적이 남지 않았다.**
평가자는 브라우저가 없어 이 파일이 유일한 근거다. **계측기가 못 보는 것은 몇 번을 돌려도
안 잡힌다.**

## 이 라운드에 반영한 것

| # | 무엇 | 근거 |
| :-: | --- | --- |
| **1** | **TOP_FIX** — `src/components/tree-figure.tsx` 신설. 씨앗(알)·새싹(줄기+잎 2장)·나무(줄기+가지+수관) SVG. 색은 `currentColor`(리터럴 금지) · `data-stage` 남김 · `role="img"`+`aria-label` | 계획 §5.4 |
| **2** | `html-to-text.mjs`에 **`svg`·`figure`·`data-stage` 수집** — DOM 개요에 `<svg role=img stage=SPROUT>`로 잡힌다 | 6R EVIDENCE 2 |
| **3** | **L5에 도형 검사** — 3단계가 전부 그려졌는지 센다. 없으면 *"0건 — 계획 §5.4의 CSS/SVG 3단계 도형이 없다"* 로 떨어진다 | 재발 방지 |
| **4** | `?state=grown` 추가 — 기본 시나리오에 **「나무」 단계가 없어** 3단계 중 둘만 보였다. 검수용 변형으로 세 번째를 보인다 | 자체 발견 |
| **5** | `scenario.ts` 낡은 주석 정정 — 「별 없음 3건」 → 「카드 4장 = 별 받음 3 · 별 없음 1」 | 6R EVIDENCE 3 |

**4번은 평가자 지적이 아니라 도형을 넣고 나서 스스로 발견한 것**이다. 도형 검사를 붙이니
`SPROUT`·`SEED` 둘만 잡혔다 — 기본 시나리오에 승급 완료 칸이 없어 「나무」를 볼 자리가
없었다. 3단계 도형을 만들어놓고 하나를 못 보여주면 §5.4를 절반만 만족한 것이다.
기본 시나리오(§14.1)는 건드리지 않고 `?state=empty`·`?state=backlog`와 같은 방식으로 변형을 더했다.

## 도형 결과

```
씨앗 3 · 새싹 5 · 나무 1     ← 3단계 전부 렌더 확인
```
