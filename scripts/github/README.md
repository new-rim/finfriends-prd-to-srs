# GitHub 등록·프로젝트 세팅 스크립트

`FASTTRACK_finfriends-nextjs-v1_0.md` §6 압축 편성을 GitHub에 그대로 옮기는 도구다. **재실행해도 안전하다**(이미 있는 필드·뷰·아이템은 건너뛴다).

| 파일 | 하는 일 |
| --- | --- |
| `manifest.json` | 46개 이슈의 일정·의존·라벨 원장. 아래 두 스크립트의 입력 |
| `project_setup.py` | Project(v2)에 **커스텀 필드 12종** 생성 → 이슈 46건 추가 → 필드 값 기입 |
| `project_views.py` | **뷰 6종**(로드맵·임계 경로·착수 차단·M1 칸반·UI/UX·M4 검증) 생성 + 프로젝트 README 반영 |
| `project_readme.md` | 프로젝트 홈에 붙는 요약 — 임계 경로 9건·착수 차단 기한표 |

## 실행

```bash
gh auth refresh -s project        # 최초 1회 — Projects 쓰기 권한
python3 scripts/github/project_setup.py
python3 scripts/github/project_views.py
```

## 이미 만들어져 있는 것

- **이슈 46건** `#1`~`#46` — 본문 머리에 착수·완료·여유·선행·후속·착수 차단이 붙어 있다
- **라벨 59종** — `type:*` `epic:*` `lane:{P|D|X}` `complexity:{H|M}` `build:B0~B6` `blocked:*` `gate:regulatory` `critical-path`/`slack-tight`/`slack-flex`
- **마일스톤 4종** — M1 기반(~10-06) · M2 기능(~10-20) · M3 전달·운영(~11-04) · M4 검증·릴리스(~11-23)

## 기준일을 바꾸려면

`manifest.json`의 `start`·`target`은 **2026-09-07(월) 착수 · 주말 제외**로 계산돼 있다. 다른 날로 옮기려면 `FASTTRACK` §6의 `D+n`을 새 기준일에 다시 사상한 뒤 `project_setup.py`를 재실행하면 된다 — 필드 값만 덮어쓴다.
