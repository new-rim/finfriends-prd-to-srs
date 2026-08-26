/goal

## 1) 작업 핵심 목표 및 범위

- **목표:** `UX-002`~`UX-009` 8건에 합쳐져 있는 **디자인 명세**를 **화면 구현**에서 분리해, FR 선행이 없는 신설 Stage(`tasks/stage-0/`)로 편성하고 편성 원장 5종·하네스 룰에 반영한다. 완료 판정은 `python3 scripts/tasks/validate_plan.py`가 **exit 0**이다.
- **시작 지점:** `master` (커밋 `2a9c4e2` 이후) — 새 브랜치 `feat/uxui-integration-stage`에서 작업한다.
- **작업 대상:**
  - 분리 대상 8건 — `UX-002`(#27) · `UX-003`(#33) · `UX-004`(#45) · `UX-005`(#42) · `UX-006`(#44) · `UX-007`(#28) · `UX-008`(#43) · `UX-009`(#37)
  - `UX-001`(#2 · 디자인 시스템 · 이미 D+0)은 **분리하지 않는다** — 그 자체가 디자인 명세다
  - 수정할 편성 원장 5종 — `scripts/github/manifest.json` · `tasks/_index.md` · `tasks/_summary.md` · `TASKS_finfriends-nextjs-v3_0.md` · `FASTTRACK_finfriends-nextjs-v1_0.md` §6
  - 신설 — `tasks/stage-0/UX-0NNd_*.md` 8건 · `.agents/rules/007-uxui-integration-stage.md` · `scripts/tasks/validate_plan.py`
- **작업 자율성:** 로컬 파일 수정·커밋은 사용자 확인 없이 진행한다. **GitHub 쓰기(이슈 본문·Project·라벨·마일스톤)와 `git push`는 하지 않는다** — §4 참조.

## 2) 작업 세부 규칙

**분리 기준 — 문서에 이미 있는 이음선을 따라 자른다 (임의 재분해 금지)**

`TASKS_finfriends-nextjs-v3_0.md`(개정 3.1)는 이미 이렇게 적어 두었다.

> ⚠️ 한 이슈에 디자인 완료와 구현 완료가 함께 들어가므로, **DoD를 두 묶음으로 나눠** 진행 상태를 구별한다.

이 **두 DoD 묶음의 경계를 그대로 두 태스크로 승격**한다. 새 분해를 발명하지 않는다.

- 각 `UX-00N`을 두 건으로 나눈다.
  - **디자인 명세** `UX-00Nd` → `tasks/stage-0/` — 와이어프레임·상태 정의·문구·접근성 기준·컴포넌트 대응(SRS §6.8 표)·빈 상태/오류 문구. **화면 코드·서버 경계에 의존하지 않는 것만.**
  - **화면 구현** `UX-00N` → 기존 Stage 유지 — 데이터 바인딩·Server Action 호출·라우트 배치·E2E.
- 각 태스크 파일의 `Acceptance Criteria`도 두 묶음 기준으로 **분배**한다. AC를 새로 만들거나 버리지 않는다 — 원본 AC 총 개수가 보존되어야 한다.
- 파일 형식은 기존 태스크 파일 규약(프런트매터 `name`·`title`·`labels` + `Summary`/`References`/`Task Breakdown`/`Acceptance Criteria`)을 그대로 따른다.

**의존·일정 재계산 규칙**

- `UX-00Nd`의 `deps`에 **`FR-`로 시작하는 항목을 두지 않는다.** 허용 선행은 `UX-001`뿐이다.
- `UX-00N`(구현)은 기존 `FR-*` 선행을 **유지하고**, 여기에 대응 `UX-00Nd`를 선행으로 **추가**한다.
- 일정은 `es`(최早 착수) 기준 forward pass로 재계산한다 — `es = max(선행들의 ef)`, `ef = es + dur`. `start`·`target`은 **2026-09-07 기준 · 주말 제외**로 사상한다.
- **전체 완료 시점 `max(ef)`가 56을 넘지 않아야 한다** (현재 압축 편성 56 영업일). 넘으면 분리 입도를 줄이고 다시 계산한다.
- `slack`·`critical`·`downstream`은 재계산 결과로 갱신한다. 손으로 찍지 않는다.

**결정 기록**

- `docs/uxui-integration-stage/DECISION_LOG.md`에 SRS·TASKS·FASTTRACK에 근거가 없는 **모든 추가 결정**을 기록한다.
- 각 항목을 `CORE`(Stage 번호 체계·분리 입도·일정 기준일 변경·요구사항 귀속 이동) 또는 `MINOR`(파일명·슬러그·라벨 문구·표 서식)로 분류한다.
- grep 가능한 카운터를 각각 별도 줄에 `CORE: N` · `MINOR: M`으로 유지한다.

**고정 결정 (budget 소모 대상 아님 — 이미 확정)**

- 신설 Stage는 `tasks/stage-0/`이다. 기존 Stage 1~9를 **재번호하지 않는다.**
- 디자인 명세 태스크 ID는 원본 ID + `d` 접미(`UX-002d`). 이슈 번호는 부여하지 않는다(GitHub 미반영).
- 라벨은 원본을 승계하고 `type:ui-ux`·`lane:X`를 유지한다.

**작업 순서 (한 건씩 · 건별로 마감)**

`UX-00N` 하나를 고를 때마다: ① 원본 파일 읽기 → ② 두 파일로 분리 작성 → ③ `manifest.json` 2건 반영 → ④ `validate_plan.py` 실행해 통과 확인 → ⑤ 원자 커밋(`refactor(tasks): UX-00N 디자인 명세 분리`) → ⑥ 다음 건. **8건을 한꺼번에 고치지 않는다.**

**검증 스크립트 (먼저 만든다)**

`scripts/tasks/validate_plan.py`를 **첫 턴에** 만들고, 아래 7항목을 검사해 위반 시 non-zero로 종료하게 한다. 각 항목의 실측값을 stdout에 출력한다.

1. `manifest.json` 항목 수 == `tasks/stage-*/*.md` 파일 수 == `tasks/_index.md` 매핑 표 행 수 == `tasks/_summary.md` 행 수
2. `manifest.json`의 `file` 경로가 전건 실존
3. `deps` 그래프에 **순환 0건**
4. 모든 태스크가 `es == max(선행 ef)` (선행 없으면 0) — 위반 0건
5. `stage-0`의 디자인 명세 태스크 전건이 `FR-*` 선행 **0건**
6. 디자인 명세 8건의 `max(es) <= 10`
7. 전체 `max(ef) <= 56`

## 3) 종료 조건 및 종료 방법

- **종료 조건** (아래 중 하나라도 충족되는 순간 루프를 즉시 멈춘다):
  - `UX-002`~`UX-009` 8건 전건 분리 완료 **且** `validate_plan.py` exit 0 → **STOP REASON: SPLIT_COMPLETE**
  - `CORE` 카운터가 3에 도달 → **STOP REASON: CORE_BUDGET**
  - `MINOR` 카운터가 10에 도달 → **STOP REASON: MINOR_BUDGET**
  - 같은 위반으로 `validate_plan.py`가 3회 연속 실패 → **STOP REASON: VALIDATION_BLOCKED**
  - `max(ef) <= 56`을 만족시키는 편성을 찾지 못함 → **STOP REASON: SCHEDULE_INFEASIBLE**
  - 평가-진행 라운드(turn = `/goal` 평가자가 진행 상태를 한 번 점검하는 메인 에이전트 응답 사이클)가 누적 25회 도달 → **STOP REASON: TURN_CAP** (= or stop after 25 turns)
- **종료 방법:**
  1. `docs/uxui-integration-stage/DECISION_LOG.md` 마지막 줄에 `STOP REASON: <코드>` 한 줄을 덧붙인다.
  2. `python3 scripts/tasks/validate_plan.py` 를 실행해 **exit 0**과 7항목 실측값 출력을 대화에 남긴다.
  3. `python3 -c "import json;M=json.load(open('scripts/github/manifest.json'));d=[o for o in M if o['id'].endswith('d')];print('설계 %d건 · max es D+%d · FR선행 %d건 · 전체 %d건 · max ef D+%d'%(len(d),max(o['es'] for o in d),sum(1 for o in d for x in o['deps'] if x.startswith('FR')),len(M),max(o['ef'] for o in M)))"` 를 실행해 출력을 대화에 남긴다.
  4. `grep -n 'CORE:\|MINOR:\|STOP REASON:' docs/uxui-integration-stage/DECISION_LOG.md` 를 실행해 카운터 줄과 종료 사유 줄이 보이는 출력을 대화에 남긴다.
  5. `git log --oneline master..HEAD` 와 `git status --short` 를 실행해 커밋 목록과 **작업 트리가 비어 있음**을 대화에 남긴다.

## 4) 기타 제약조건

- **GitHub을 쓰지 않는다** — `gh issue edit` · `gh issue create` · `gh label` · `gh project` · `scripts/github/project_setup.py` · `project_views.py` **실행 금지**. 원격 반영은 사람이 검토 후 별도로 한다.
- **`git push` · `git merge` · master 직접 커밋 금지.** 작업은 `feat/uxui-integration-stage` 브랜치 안에서만 한다. PR도 만들지 않는다.
- **근거 문서 수정 금지** — `tech-design-docs/` 전체(`[SRS]`·`[PRD]`·`[Diagrams]`). 요구사항이 바뀌어야 한다고 판단되면 수정하지 말고 `DECISION_LOG.md`에 `CORE`로 기록하고 멈춘다.
- **요구사항을 늘리거나 줄이지 않는다.** AC 총 개수·요구사항 ID 귀속이 분리 전후로 보존되어야 한다.
- 활성 범위 밖 파일을 수정하지 않는다. 단 아래는 예외로 허용한다 — `docs/uxui-integration-stage/**` · `scripts/tasks/**` · `.agents/rules/007-uxui-integration-stage.md` · `AGENTS.md` §4 참조 표 1행 · `CLAUDE.md` 스킬/룰 목록 1행.
- `.agents/skills/` 하위의 채택 스킬(`supabase`·`prisma-*`·`vercel-*`·`shadcn`·`playwright-cli`·`tdd`·`grill-it`·`goal-setting`·`review-merge`·`merge-review`)은 **수정 금지** — `npx skills update` 시 덮어써진다.
- 애플리케이션 코드(`app/`·`src/`·`prisma/`·`package.json`)를 만들지 않는다. **이 목표는 편성과 명세까지이며 구현은 범위 밖이다.**

## 5) 실패 시 회복 절차

- `validate_plan.py`가 실패하면 **원인 항목 번호와 실측값을 대화에 남긴 뒤** 직전 커밋 단위로만 되돌린다(`git restore` 범위 최소화). `git reset --hard` 사용 금지.
- 일정 재계산이 `max(ef) <= 56`을 못 맞추면, 분리 입도를 낮추는 순서로 시도한다 — ① 디자인 명세의 `dur` 축소 ② 디자인 명세 2~3건 병합 ③ 그래도 안 되면 `SCHEDULE_INFEASIBLE`로 종료하고 **어느 건이 임계 경로를 늘렸는지** 보고한다.
- 분리 중 원본 AC를 어느 쪽에 넣을지 판단이 서지 않으면 **구현 쪽에 남긴다**(보수적 기본값). 이 판단은 `MINOR`로 기록한다.
