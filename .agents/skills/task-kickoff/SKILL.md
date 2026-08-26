---
name: task-kickoff
description: FinFriends 태스크(GitHub 이슈 #1~#46) 한 건을 착수한다. 태스크 파일과 SRS 근거 절을 읽고, 선행·착수 차단을 확인하고, 브랜치를 만들고, Acceptance Criteria를 테스트 골격으로 옮긴다. 「FR-0xx 시작」·「이슈 #n 작업」·「태스크 착수」 요청에 사용한다.
argument-hint: "[FR-### | UX-### | #이슈번호]"
allowed-tools: Read, Grep, Glob, Bash, Write, Edit
---

# 태스크 착수 절차

대상: **$ARGUMENTS**

## 1. 태스크 파일을 찾는다

```bash
ls tasks/stage-*/"$ARGUMENTS"_*.md             # 태스크 파일 (파일명이 태스크 ID로 시작한다)
grep -n "\`$ARGUMENTS\`" tasks/_index.md       # 이슈 번호 · 마일스톤 · 착수~완료 · 여유
python3 -c "import json;m={o['id']:o for o in json.load(open('scripts/github/manifest.json'))};print(json.dumps(m.get('$ARGUMENTS'),ensure_ascii=False,indent=1))"
grep -rln "$ARGUMENTS" tasks/stage-*/           # 이 태스크를 참조하는 다른 태스크 (후속 파급)
```

## 2. 착수 가능한지 확인한다 — 여기서 멈출 수 있다

| 확인 | 어디서 | 막히면 |
| --- | --- | --- |
| **선행(`deps`)이 닫혔는가** | manifest `deps` · 이슈 본문 「선행」 | 선행 이슈를 먼저 처리한다 |
| **착수 차단(`blocked`)이 있는가** | manifest `blocked` — `T-*` · `D-TEC-*` | 🔴 **답이 나와야 코드를 쓸 수 있다.** SRS §13.3 · §14를 읽고 **무엇을 누구에게 물어야 하는지** 보고하고 멈춘다 |
| **임계 경로인가** | `critical: true` · 라벨 `critical-path` | 여유 0 — 일정 영향을 먼저 보고한다 |

**착수 차단이 걸린 태스크를 「일단 가정하고」 진행하지 않는다.** 가정이 틀리면 재설계다.

## 3. 근거를 읽는다 — 건너뛰면 근거 없는 구현이 된다

태스크 파일의 `References` 절에 적힌 **SRS 절을 전부 읽는다.** 태스크 파일은 요약이고 판단 근거는 SRS에 있다.

읽은 뒤 스스로 답한다.
- 이 태스크가 강제하는 **요구사항 ID**는 무엇인가 (`REQ-*` · `AC-*` · `CON-*`)
- 규제 계층 **1·2에 걸리는 부분**이 있는가 — 있으면 그것을 애플리케이션 코드가 아니라 **스키마·DB 제약·게이트**에 둔다
- 어느 **런타임 경계**에 코드가 들어가는가 (`.agents/rules/004`)

## 4. 브랜치를 만든다

```bash
git switch -c feat/<이슈번호>-<슬러그>     # 예: feat/12-partner-webhook-contract
```

`master`에서 직접 작업하지 않는다. **브랜치 = 이슈 1건.**

## 5. Acceptance Criteria를 테스트로 먼저 옮긴다

태스크 파일의 `Acceptance Criteria (BDD/GWT)` 시나리오를 **하나도 빠뜨리지 않고** 테스트 골격으로 옮긴다. `tdd` 스킬의 절차를 따른다.

| 시나리오 성격 | 어디에 |
| --- | --- |
| 판정 로직 (나무 승급·갈래 판정·계획 대조) | `src/domain/**` 단위 테스트 — DB 없음 |
| 트랜잭션·멱등·RLS | Server Action 통합 테스트 |
| 화면 흐름·차단 화면 | Playwright 시나리오 |
| **게이트가 막는 것** | **위반 코드 주입 테스트** — 빌드가 실패하는 것까지 확인 |

## 6. 착수 보고

작업 시작 전에 아래를 **짧게** 보고한다.

- 태스크 ID · 이슈 번호 · 마일스톤 · 착수~완료 · 여유
- 선행·착수 차단 상태 (막힌 것이 있으면 **무엇을 누가 답해야 하나**)
- 읽은 SRS 절 목록
- 코드가 들어갈 런타임 경계와 파일 경로
- 옮긴 AC 시나리오 수 / 전체 수
