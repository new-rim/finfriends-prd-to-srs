---
name: github-issue-project
description: 이 저장소의 GitHub 이슈 46건(#1~#46)·라벨 59종·마일스톤 4종·Project(v2) 필드/뷰를 관리한다. 태스크 파일을 고친 뒤 이슈 본문 갱신, 일정 변경 후 Project 재기입, 라벨·마일스톤 편성에 사용한다.
argument-hint: "[이슈 번호 · 태스크 ID · 또는 목적]"
allowed-tools: Bash, Read, Grep, Glob, Edit
---

# GitHub 이슈 · Project 관리

대상: **$ARGUMENTS** · 저장소 `new-rim/finfriends-prd-to-srs` · Project `users/new-rim/projects/1`

## 이미 만들어져 있는 것 — 다시 만들지 않는다

| 대상 | 상태 |
| --- | --- |
| 이슈 | **46건 `#1`~`#46`** — 본문 머리에 착수·완료·여유·선행·후속·착수 차단 |
| 라벨 | 59종 — `type:*` `epic:*` `lane:{P,D,X}` `complexity:{H,M}` `build:B0~B6` `blocked:*` `gate:regulatory` `critical-path` `slack-tight` `slack-flex` |
| 마일스톤 | 4종 — M1 기반(~10-06) · M2 기능(~10-20) · M3 전달·운영(~11-04) · M4 검증·릴리스(~11-23) |
| Project 필드 | 12종 (일정·기간·여유·D+착수·파급·레인·임계도·복잡도·유형·마일스톤 단계·착수 차단·선행) |
| Project 뷰 | 6종 (로드맵·임계 경로·착수 차단·M1 칸반·UI/UX·M4 검증) |

**원장은 `scripts/github/manifest.json`이다.** 일정·의존·라벨의 단일 출처다.

## A. 태스크 파일을 고친 뒤 — 이슈 본문 갱신

**한 파일 = 한 이슈**이고 **파일 전문이 이슈 본문**이다. 파일만 고치고 이슈를 두면 둘이 갈라진다.

```bash
# 매핑 확인
grep -n "FR-003" tasks/_index.md

# 본문 갱신 (프런트매터를 제외한 본문만)
gh issue edit 4 -R new-rim/finfriends-prd-to-srs \
  --body-file <(awk 'f{print} /^---$/{c++; if(c==2) f=1}' tasks/stage-1/FR-003_data-access-layer.md)
```

- 제목·라벨을 바꿀 때는 **프런트매터의 `title`·`labels`를 그대로** 쓴다.
- `gh` 커맨드를 **직접 실행**한다. 일회성 셸 스크립트를 만들지 않는다.
- 여러 건이면 순차 실행하고 **건별 성공/실패를 남긴다.** API 호출 사이에 `sleep 1`을 둔다.

## B. 일정·의존이 바뀐 뒤 — Project 재기입

```bash
# 1. manifest.json 갱신 (start·target·dur·slack·es·downstream·deps·blocked·critical)
# 2. 재실행 — 멱등하다. 이미 있는 필드·아이템·뷰는 건너뛰고 값만 덮어쓴다
python3 scripts/github/project_setup.py
python3 scripts/github/project_views.py
```

기준일이 바뀌면 `FASTTRACK_finfriends-nextjs-v1_0.md` §6의 `D+n`을 새 기준일에 다시 사상한 뒤 재실행한다.

**검증** — 재실행 후 manifest와 실제 값을 대조한다.

```bash
gh issue list -R new-rim/finfriends-prd-to-srs -L 100 --json number,milestone \
  -q '[.[]|.milestone.title//"(없음)"]|group_by(.)|map({m:.[0],n:length})'
gh issue list -R new-rim/finfriends-prd-to-srs -l critical-path --json number -q length   # 9
gh issue list -R new-rim/finfriends-prd-to-srs -l lane:X       --json number -q length   # 9
```

## C. 자주 쓰는 조회

```bash
R=new-rim/finfriends-prd-to-srs
gh issue list -R $R -l critical-path                       # 임계 경로 9건 — 하루도 못 민다
gh issue list -R $R --json number,labels \
  -q '[.[]|select(any(.labels[].name; startswith("blocked:")))|.number]'   # 착수 차단 15건
gh issue list -R $R -l gate:regulatory                     # 규제 게이트
gh issue view <n> -R $R --json title,body,labels,milestone
```

## D. 주의

- **Project(v2)는 정수 ID가 아니라 Node ID**(`PVT_*` · `PVTI_*` · `PVTF_*`)를 쓴다. `scripts/github/project.json`에 캐시되어 있다.
- **ROADMAP 레이아웃 뷰는 `visibleFieldIds`를 받지 않는다.** Start/Target date를 이름으로 자동 인식한다.
- 마일스톤 옵션명은 `M1 기반` 형태이고 이슈 마일스톤 제목은 `M1 기반 — …` 형태다 — `project_setup.py`의 `MSMAP`이 사상한다.
- 이슈를 **새로 만들 필요는 거의 없다.** 46건이 태스크 전건이다. 새 태스크가 생기면 먼저 `TASKS_finfriends-nextjs-v3_0.md`와 `manifest.json`에 반영한다.
