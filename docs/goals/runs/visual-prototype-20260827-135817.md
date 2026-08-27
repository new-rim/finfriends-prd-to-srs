<!--
실행 런 파일 — `docs/goals/visual-prototype.md`의 프롬프트 본문만 분리한 것.
실행 시각: 2026-08-27 13:58:17 (KST)
원본: docs/goals/visual-prototype.md
이 파일은 이 런의 스냅샷이다. 원본이 이후 바뀌어도 이 런의 기준은 여기 적힌 내용이다.
-->

# 시각 프로토타입 실행 런 — 2026-08-27 13:58:17

## 1) 작업 핵심 목표 및 범위

- **목표:** `docs/prototype-visual-plan.md`가 확정한 값 그대로 **시각 확인용 화면 3개**를 만들고, `aztks-agent`(MODE: EVALUATE)가 **`VERDICT: GO` + `SCORECARD` 5축 전부 `P`**를 낼 때까지 보완한다. 완료 판정은 그 스코어카드가 대화에 surface된 것이다.
- **시작 지점:** `feat/uxui-integration-stage` 위에서 새 브랜치 `feat/visual-prototype`. *(해당 브랜치가 없거나 사용자가 `master`를 지정하면 §6 참조)*
- **작업 대상 — 화면 3개:**
  | # | 화면 | 경로 | 근거 절 |
  | :-: | --- | --- | :-: |
  | ① | 성장 나무 + 정체 원인 | `app/(guardian)/tree/page.tsx` | §3 · §5 |
  | ② | 학습·퀴즈 | `app/(child)/learn/spend/page.tsx` | §10 · §11 |
  | ③ | 두 갈래 회고 | `app/(child)/retro/page.tsx` | §7 · §8 · §9 |
- **함께 만드는 기반:** 라우트 그룹 4종 스캐폴딩 · `app/globals.css` 토큰 3축(**색값 포함** · 계획 §6.1) · shadcn **5종**(Card · Badge · RadioGroup · Progress · Alert — 🔴 Accordion·Dialog 없음) · `src/contracts/**` · 🔴 `src/fixtures/scenario.ts`(단일 시나리오 · 계획 §14.1) · `app/page.tsx`(진입점 · 계획 §14.2) · `scripts/gates/check-style.mjs` · `scripts/proto/verify_prototype.sh` · `scripts/proto/snapshot.sh`
- **작업 자율성:** 사용자 확인을 위한 중단 없이, 종료 조건에 도달할 때까지 자율적으로 진행한다. **`git push` · PR · GitHub 쓰기 · Vercel/Supabase 프로젝트 생성은 하지 않는다.**

## 2) 작업 세부 규칙

**착수 전에 두 문서를 읽고 그대로 적용한다.**

1. `docs/prototype-visual-plan.md` — **화면에 들어갈 값의 단일 출처.** §0.5의 읽는 순서를 따른다. 레이아웃·문장·수치·토큰이 전부 여기 적혀 있다.
2. `.agents/rules/008-visual-prototype.md` — **어길 수 없는 규칙 14조.**

🔴 **두 문서에 적힌 문장·수치·표기를 즉흥으로 바꾸지 않는다.** 바꿔야 한다고 판단되면 코드를 고치지 말고 `docs/grill/GRILL_LEDGER.md`에 `CORE` 토픽으로 올리고 멈춘다.

**첫 턴에 만드는 것 3가지 — 화면보다 먼저**

1. `scripts/gates/check-style.mjs` — `globals.css` 외 CSS 파일 · CSS-in-JS · 인라인 `style={{…}}` · 임의 색상 리터럴을 **각 0건**으로 검사하고 위반 시 non-zero 종료. `package.json`의 `check:style`·`prebuild`에 결선한다. *(정식 게이트 G5는 `FR-005`에서 온다)*
2. `scripts/proto/verify_prototype.sh` — **L1~L6**의 실측값을 stdout에 출력하고 위반 시 non-zero 종료. `--screen <ID>`로 화면 1건만 검사할 수 있게 한다.
   | # | 검사 |
   | :-: | --- |
   | **L1** | `.env` 없이 · 네트워크 차단 상태에서 `npm run dev` 하나로 3화면이 렌더된다 |
   | **L2** | `npm run build` exit 0 · 3화면이 각자의 라우트 그룹 경로에 있다 |
   | **L3** | `check:style` 위반 0건 |
   | **L4** | 아동 화면 2개(②③) 터치 타깃 ≥ 44px · 대비 ≥ 4.5:1 |
   | **L5** | 빈 상태 3종이 렌더되고, **4영역 표기가 `src/contracts/areas.ts`·①·② 세 곳에서 동일** |
   | **L6** | 🔴 **시나리오 불변식** — ③에서 별 받은 건수 ＝ ①의 「잘 써요 실천 N회」. 단위 테스트 1건으로 검사한다(계획 §14.1) |
3. 🔴 `scripts/proto/snapshot.sh` — **평가자가 화면을 볼 수 있게 하는 유일한 수단.** `npm run dev`를 띄우고 3경로를 `curl`로 받아 **HTML 태그를 제거한 텍스트**와 **DOM 구조 개요**를 `docs/prototype-visual-plan/render-snapshot/{tree,learn,retro}.txt`에 저장한다. 각 화면의 **주요 상태 변형도 함께** 뜬다 — ① 승급 있음 / 실천 0건 / 정체, ③ 별 받음 / 별 없음 / 업종 다름 / 큐 빔. 끝나면 dev 서버를 내린다.
   > `aztks-agent`는 `Read · Grep · Glob · Bash`만 갖고 **브라우저가 없다.** 이 스냅샷이 없으면 시각 흐름을 판정할 근거가 없다.

**작업 순서 — 화면 1건씩 마감**

기반(라우트 그룹 · 토큰 · 컴포넌트 · 픽스처) → **① 나무 → ② 학습·퀴즈 → ③ 회고** 순. 각 화면마다: ① 근거 절 읽기 → ② 구현 → ③ `verify_prototype.sh --screen <ID>` 통과 → ④ 원자 커밋 → ⑤ 다음. **3화면을 한꺼번에 열지 않는다.**

**구조 규칙**

- 🔴 **문자열을 화면에 직접 쓰지 않는다.** 4영역 표기·한 줄 설명·빈 화면 문구는 `src/contracts/areas.ts`, 회고 문장은 `src/fixtures/retro-sentences.ts`, 나무 수치는 `src/contracts/tree.ts`. **상수 한 곳이 단일 출처다**(계획 §0.4).
- 🔴 아동 화면은 예외 없이 `app/(child)/` 아래. `app/(child)/layout.tsx`는 **`data-theme="child"`만** 걸고 **동의 판정을 구현하지 않는다**(`FR-011` 범위).
- 🔴 **컴포넌트 복제 0건** — `ChildCard`/`GuardianCard` 같은 쌍을 만들지 않는다. 테마는 라우트 그룹 레이아웃의 `data-theme`에서 한 번만 건다.
- 🔴 **Server Action(`"use server"`)·`@/db/**`·AI SDK를 만들지 않는다.** 프로토타입에 쓰기 경로가 없다.

**결정 기록** — `docs/grill/GRILL_LEDGER.md`에 이어 적는다. `CORE`(값·구조·판정 기준 변경) / `MINOR`(파일명·서식)로 분류하고 `CORE: N` · `MINOR: M` 카운터를 각 별도 줄에 유지한다.

**커밋** — `feat(proto): <화면/기반> — 요약` 한 목적 1건 · 한국어 · 본문에 **왜**.

## 3) 종료 조건 및 종료 방법

- **종료 조건** (아래 중 하나라도 충족되는 순간 루프를 즉시 멈춘다):
  - 🎯 `aztks-agent` 평가가 **`VERDICT: GO` 이면서 `SCORECARD`가 `A:P Z:P T:P K:P S:P`** (CONCERN·FAIL **0건**) → **STOP REASON: AZTKS_ALL_PASS**
  - 평가 라운드가 누적 **5회**에 도달했는데 5축 전부 `P`를 못 받음 → **STOP REASON: AZTKS_ROUNDS**
  - 같은 축이 **연속 3회** `F` 또는 `C`로 남고 `TOP_FIX`를 반영해도 바뀌지 않음 → **STOP REASON: AZTKS_BLOCKED**
  - 🔴 `TOP_FIX`가 **3화면 범위 밖의 화면 추가**를 요구함 → **STOP REASON: SCOPE_EXPANSION_REQUIRED** *(§4 참조 — 화면을 늘리지 않는다)*
  - `CORE` 카운터가 3에 도달 → **STOP REASON: CORE_BUDGET**
  - 같은 위반으로 `verify_prototype.sh`가 3회 연속 실패 → **STOP REASON: VERIFY_BLOCKED**
  - 평가-진행 라운드(turn = `/goal` 평가자가 진행 상태를 한 번 점검하는 메인 에이전트 응답 사이클)가 누적 **40회** 도달 → **STOP REASON: TURN_CAP** (= or stop after 40 turns)
- **종료 방법:**
  1. `docs/grill/GRILL_LEDGER.md` 마지막 줄에 `STOP REASON: <코드>` 한 줄을 덧붙인다.
  2. `npm run build` 를 실행해 **exit 0**과 생성된 라우트 목록 출력을 대화에 남긴다.
  3. `bash scripts/proto/verify_prototype.sh` 를 실행해 **exit 0**과 **L1~L6 실측값** 출력을 대화에 남긴다.
  4. `node scripts/gates/check-style.mjs` 를 실행해 위반 **0건** 출력을 대화에 남긴다.
  5. `grep -rn "벌기\|잘 쓰기\|모으기\|불리기" app/ src/` 를 실행해 **0 matches**를 대화에 남긴다 *(PRD 문서 명칭이 화면에 새지 않았음 — 계획 §4.3)*.
  6. 🎯 `grep -n "VERDICT:\|SCORECARD:" docs/prototype-visual-plan/aztks-review-*.md` 를 실행해 **라운드별 판정 전체**를 대화에 남긴다. 마지막 줄이 `VERDICT: GO` · `SCORECARD: A:P Z:P T:P K:P S:P` 인지 그 출력으로 확인한다.
  7. `grep -n 'CORE:\|MINOR:\|STOP REASON:' docs/grill/GRILL_LEDGER.md` 와 `git log --oneline feat/uxui-integration-stage..HEAD` · `git status --short` 를 실행해 출력을 대화에 남긴다.

## 4) 기타 제약조건

- 🔴 **화면을 3개보다 늘리지 않는다.** `aztks-agent`가 *"흐름이 끊기니 계획 카드/월간 숲/미션 목록 화면이 필요하다"* 는 취지의 `TOP_FIX`를 내면, **그 화면을 만들지 말고** `STOP REASON: SCOPE_EXPANSION_REQUIRED`로 종료하고 **어느 축이 왜 그것을 요구했는지**를 보고한다. 범위 확대는 사람의 결정이다(`docs/prototype-lite-scope.md` §8).
- **범위 밖 화면 목록** — 월간 숲 · 소비 내역 · 계획 카드 · 보호자 온보딩 · `(public)` 화면 · 카드 잠금 · `(ops)` · 학습 목록 · 미션 목록. `app/(public)/`·`app/(ops)/`는 **빈 디렉터리**로만 둔다.
- **근거 문서 수정 금지** — `tech-design-docs/` 전체 · `tasks/**` · `FASTTRACK_*` · `TASKS_*` · `EXECUTION_*` · `docs/prototype-suggestion.md` · `docs/prototype-lite-scope.md` · `docs/prototype-visual-plan.md`. 바뀌어야 한다면 `GRILL_LEDGER.md`에 `CORE`로 기록하고 멈춘다.
- 🔴 **어떤 AC도 「통과」로 적지 않는다** — α·β 인터뷰를 실시하지 않는다. 커밋 메시지·보고서에 **PASS·달성·검증**을 쓰지 않는다. 적을 수 있는 것은 「판정 가능한 화면이 존재한다」뿐이다(계획 §1 · 규칙 §2). **`aztks-agent`의 `GO`는 AZTKS 5축 판정이지 PRD AC 판정이 아니다** — 둘을 섞어 쓰지 않는다.
- 🔴 **미결을 닫힌 것처럼 쓰지 않는다** — 나무 수치는 **잠정**이며 PRD §7-3 미결은 열려 있다(규칙 §4). `D-TEC-1`~`8` · `T-1`~`4`도 동일.
- 🔴 **경고색·부정 아이콘·차감 표기 금지** — 회고 어느 갈래에도(규칙 §9).
- **`git push` · PR · merge · `master` 직접 커밋 금지.** `gh` · `scripts/github/**` 실행 금지.
- `.agents/skills/` 하위 채택 스킬 수정 금지.
- 활성 범위 밖 파일을 수정하지 않는다. 예외 — `docs/grill/GRILL_LEDGER.md` · `docs/prototype-visual-plan/**` · `scripts/proto/**` · `scripts/gates/check-style.mjs` · `.gitignore`.

## 5) AZTKS 평가 라운드 — 완료 게이트

> 📌 **1라운드는 계획 단계에서 이미 돌았다** — 대상은 코드가 아니라 `docs/prototype-visual-plan.md`였고 결과는 `GO / A:C Z:C T:C K:C S:C`였다.
> 지적 7건 중 **결함 5건 + 진입점·시나리오는 계획에 반영 완료**, **⭐ 종점 부재는 사람이 「3화면 유지」로 결정하고 §13.0에 명시**했다.
> **따라서 이 목표의 평가는 2라운드부터 시작한다** — 파일명을 `aztks-review-2.md`부터 매긴다.

3화면이 §3 종료 방법 2~5의 검증 명령을 **전부 통과한 뒤에만** 평가를 연다. 검증이 깨진 상태로 평가를 요청하지 않는다.

**매 라운드 절차**

1. `bash scripts/proto/snapshot.sh` 를 실행해 `docs/prototype-visual-plan/render-snapshot/` 를 갱신한다.
2. **아래 디스패치 프롬프트를 그대로** `aztks-agent`에 보낸다. **라운드마다 문구를 바꾸지 않는다** — 바뀌면 라운드 간 판정을 비교할 수 없다.
3. 반환된 고정 출력 5줄(`VERDICT`/`SCORECARD`/`TOP_FIX`/`EVIDENCE`/`NOTES`)을 **원문 그대로** `docs/prototype-visual-plan/aztks-review-<라운드번호>.md` 에 저장하고 대화에도 남긴다.
4. 5축 전부 `P`가 아니면 **`TOP_FIX` 한 건만** 반영하고 다음 라운드로 간다. `NOTES`의 CONCERN을 한꺼번에 고치려 들지 않는다 — `TOP_FIX`가 최고 레버리지라는 것이 그 에이전트의 판정이다.
5. `TOP_FIX` 반영 후 §3 종료 방법 2~5를 다시 통과시킨 뒤 다음 라운드를 연다.

**🔴 통과 기준을 기본값보다 올린다**

`aztks-agent`의 기본 판정 규칙은 *"FAIL 없이 CONCERN만 있으면 **GO**"* 다. **이 목표는 그것으로 완료하지 않는다.** `CONCERN`이 하나라도 남으면 미완이며, **`A:P Z:P T:P K:P S:P` 전부 `P`** 여야 한다. 디스패치 프롬프트에 이 기준을 명시해 평가자가 알고 판정하게 한다.

**디스패치 프롬프트 (고정)**

```
MODE: EVALUATE

## 목표 · 완료 기준
`docs/prototype-visual-plan.md`대로 구현된 3화면 프로토타입이, 이 서비스가 추구하는
① 서비스의 형태 ② 고객 경험 ③ 가치의 전달을 담아내는 사용자 경험의 흐름으로 충분한지 판정하라.
핵심 질문: "이 3화면을 본 사람이, 이 서비스가 무엇이고 무엇을 주는 서비스인지 흐름으로 이해하는가?"

🔴 이 디스패치의 통과선은 기본 규칙보다 높다 — CONCERN이 하나라도 있으면 미완이다.
   5축 전부 P일 때만 완료로 간주된다. CONCERN을 GO로 무마하지 말고 정확히 C로 표기하라.

## 대상
- `docs/prototype-visual-plan/render-snapshot/{tree,learn,retro}.txt` — 각 화면의 렌더 텍스트·DOM 개요·상태 변형
- `app/**` · `src/contracts/**` · `src/fixtures/**` — 구현 소스

## 근거 소스 (읽고 대조할 것)
1. `tech-design-docs/[PRD]finfriends-prd-v1_0.md`
   - §0-1 두 가치 선언 — 선언①(아이가 학습·실천하며 성장) / 선언②(그 성장이 「얼마나 배웠나」가 아니라
     「행동이 어떻게 달라졌나」로 보인다). 위계: ①이 일어나야 ②가 보여줄 것이 생긴다.
   - §0-2 J1(실천할 자리·아이) / J2(행동 변화 보여주기·부모) / J3(끊김 방지)
   - §0-3 선별 Pain — C1(성장 증거 부재) · C2(실천 공백→나무 정체) · C5(사전 개입 사각지대)
   - 부록 B 3층 구조(별/나무/숲) · 부록 D 소비 4단계 루프
2. `docs/prototype-visual-plan.md` — 화면에 들어갈 값의 확정 출처
3. `docs/prototype-lite-scope.md` §4 — 무엇을 왜 잘라냈는지
4. `.agents/rules/008-visual-prototype.md` — 하네스 규칙 14조

## 각 축에서 특히 볼 것
- A 알아서 — 두 가치 선언·J1·J2·J3·선별 Pain 3건이 구현된 화면에 실제로 반영됐는가.
- Z 잘 — 화면의 값(문장·수치·표기)이 계획 문서·PRD와 어긋나는 곳이 있는가. 검증 명령이 실제로 도는가.
- T 딱 — 🔴 가장 중요. 선언 ①→② 위계가 3화면의 흐름으로 이어지는가. 아이가 배우고(②)
  되돌아보고(③) 그 결과가 부모 화면(①)에 보이는 연결이 화면만으로 읽히는가, 끊겨 있는가.
- K 깔끔 — 죽은 코드·불필요한 복잡도·문자열 중복이 없는가. 상수 단일 출처가 지켜졌는가.
- S 센스 — 다음 소비자(본 개발 FR 이슈)가 이 코드를 재작업 없이 이어받을 형태인가.

## 제약
- 읽기 전용. 어떤 파일도 수정하지 마라.
- 범위 밖 화면의 부재 자체는 이미 문서화된 결정이다 — `docs/prototype-visual-plan.md`
  §13.1(월간 숲·계획 카드·미션 목록 등)과 🔴 §13.0(⭐ 잔액·위시리스트 = 아이 동기 종점).
  특히 §13.0은 1라운드 T축 지적을 받아 사람이 「3화면 유지」로 결정하고 명시한 것이다.
  이 둘을 다시 지적으로 올리지 마라. 부재를 근거로 판정하려면 §13이 신고한 것을 **넘어서는**
  구체적 이유를 파일:라인으로 지목하라.
- 1라운드(계획 단계) 지적은 이미 반영됐다 — 계획 §14(단일 시나리오·진입점) · §6.1(색 토큰) ·
  §5.1 검산 주석 · §11(AC-2.1 오인용 정정) · §0.3(컴포넌트 5종). 같은 건을 재지적하지 마라.
- 판정 근거는 파일:라인으로 지목하라. 근거 없는 단정 금지.
- 고정 출력 형식(VERDICT/SCORECARD/TOP_FIX/EVIDENCE/NOTES)을 지켜라.
```

## 6) 실패 시 회복 절차

- `verify_prototype.sh` 실패 시 **위반 조건 번호(L1~L6)와 실측값을 대화에 남긴 뒤** 직전 커밋 단위로만 되돌린다(`git restore` 범위 최소화). **`git reset --hard` 사용 금지.**
- 계획 문서의 값과 화면이 어긋나면 **문서를 고치지 말고 화면을 고친다.** 문서를 바꿔야만 한다면 `CORE`로 기록하고 멈춘다.
- 🔴 **`TOP_FIX`가 계획 문서의 확정값(문장·수치·표기)을 바꾸라고 하면 바꾸지 않는다.** `GRILL_LEDGER.md`에 `CORE`로 기록하고 `AZTKS_BLOCKED`로 종료한다 — 계획은 사람이 13개 토픽을 굽어 확정한 것이다.
- 화면 1건이 3회 연속 막히면 건너뛰고 사유를 남긴 뒤 다음으로 간다. 건너뛴 건은 **종료 보고에 반드시 열거**한다.
- **베이스 브랜치 확인** — 착수 시 `feat/uxui-integration-stage`가 없거나 사용자가 `master`를 지정하면 `master`에서 `feat/visual-prototype`을 딴다. 이 경우 §3 종료 방법 7의 비교 기준을 `master..HEAD`로 바꾼다.
- **`docs/` 미해결 상태 주의** — `docs/goals/uxui-integration-stage.md` · `docs/uxui-integration-stage/DECISION_LOG.md`가 인덱스에만 있고 작업 트리에 없을 수 있다(`git status`의 `AD`). **복원 여부는 사용자 결정 사항이며 이 목표에서 건드리지 않는다.**
