---
name: gitflow-commit
description: 이 저장소 규약대로 커밋·푸시·draft PR을 만든다. 이슈 1건=브랜치 1개 · 한 목적 1커밋 · 한국어 커밋 메시지 · master 직접 푸시 금지 · 마이그레이션/게이트 변경 시 승인자 명시.
argument-hint: "[선택: 커밋 목적 요약]"
allowed-tools: Bash, Read, Grep, Glob
---

# 커밋 · PR 절차

목적: **$ARGUMENTS**

**파괴적 명령(force push · `reset --hard` · `master` 푸시)은 사용자 확인 없이 실행하지 않는다.**

## 1. 변경 검토

```bash
git status
git diff
git branch --show-current
```

- 변경을 목적별로 분류한다 — `feat` `fix` `docs` `refactor` `test` `chore` `perf`.
- **서로 다른 목적이 섞여 있으면 분리 커밋을 계획한다.**
- 컴파일 불가능한 중간 상태를 커밋하지 않는다.

## 2. 브랜치 정렬

- **이슈 1건 = 브랜치 1개.** `feat/<이슈번호>-<슬러그>` (예: `feat/12-partner-webhook-contract`)
- `master`에 직접 커밋하지 않는다. 잘못된 브랜치에 있으면 새로 만든다.

```bash
git switch -c feat/<이슈번호>-<슬러그>
```

## 3. 원자적 스테이징

```bash
git add -p
```

관련 없는 변경이 섞이지 않도록 hunk 단위로 고른다.

## 4. 커밋 메시지 — 한국어

```
type(scope): 한 줄 요약

왜 이렇게 했는지. 무엇을 했는지는 diff가 말한다.
규제·요구사항 근거가 있으면 ID를 적는다 (REQ-TEC-003 · AC-T5.1).

Refs #12
```

- 제목은 명령형 · 마침표 없음.
- **한 목적 = 한 커밋.**
- 이슈를 닫을 때만 `Closes #12`.

## 5. 커밋 전 확인

```bash
npm run prebuild        # 게이트 7종 — 코드가 있는 단계라면 필수
npm test                # 해당 범위 테스트
```

게이트 실패를 남긴 채 커밋하지 않는다. **`--no-verify`는 사용자가 명시적으로 요청한 경우에만.**

## 6. 푸시 · draft PR

```bash
git push -u origin <branch>
gh pr create --draft --base master \
  --title "type(scope): 요약" \
  --body "$(cat <<'BODY'
## 무엇이 바뀌었나
- diff의 **의미**를 요약한다. 파일을 나열하지 않는다.

## 근거
- 태스크: #<이슈번호>
- SRS: §<절 번호> · 요구사항 ID

## 검증
- [ ] `npm run prebuild` 통과
- [ ] AC 시나리오 n/n
- [ ] (해당 시) 게이트 위반 주입 테스트

## 승인 필요
- [ ] 스키마 소유자 — 마이그레이션·RLS 변경이 있으면 expand-contract 단계 명시
- [ ] 게이트 소유자 — 게이트·화이트리스트 변경이 있으면
- [ ] 배포 소유자 — 환경 변수·리전 변경이 있으면
BODY
)"
```

## 7. 주의

- **병합이 유일한 사람 게이트**다(빌드·배포·전환은 자동). 리뷰 없이 병합하지 않는다.
- 이미 푸시된 커밋은 amend 대신 **새 커밋**을 만든다.
- 미결(`D-TEC-*` · `T-*`)을 해소된 것처럼 쓰지 않는다.
