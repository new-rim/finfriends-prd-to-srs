# 📁 FinFriends 프로젝트 전체 문서 지도 (DOCS_INDEX.md)

> 본 문서는 **FinFriends** 저장소의 모든 문서와 파일들을 **카테고리별 디렉토리로 정리한 전체 문서 안내 지도**입니다.

---

## 📂 1. 기술 & 설계 규격 (Tech Design Docs) — [`tech-design-docs/`](./tech-design-docs/)
제품 요구사항, 시스템 요구사항 명세, 아키텍처 다이어그램 등 **구현의 기준이 되는 핵심 설계 문서** 모음입니다.

| 파일명 | 문서 지위 | 역할 및 주요 내용 |
|---|---|---|
| 🔴 [`[SRS]SRS_finfriends-nextjs-v1_0.md`](./tech-design-docs/%5BSRS%5DSRS_finfriends-nextjs-v1_0.md) | **최종 구현 근거** | Next.js 단일 풀스택 기반 시스템 요구사항 명세서. 절 번호로 인용 (`REQ-*`, `AC-*`, `C-TEC-*`). |
| 📐 [`[Diagrams]DESIGN_finfriends-v1_0.md`](./tech-design-docs/%5BDiagrams%5DDESIGN_finfriends-v1_0.md) | **설계 표준** | 유스케이스 30건, 다이어그램 51건(시퀀스, ERD, 시스템 배치도, 런타임 구조 등). |
| 📄 [`[PRD]finfriends-prd-v1_0.md`](./tech-design-docs/%5BPRD%5Dfinfriends-prd-v1_0.md) | **제품 요구 원본** | 아동 금융교육 서비스 FinFriends 기획 및 제품 요구사항(PRD) 원본 문서. |
| 📜 [`[SRS]SRS_finfriends-v0_1.md`](./tech-design-docs/%5BSRS%5DSRS_finfriends-v0_1.md) | 초안 보관 | 초기 수립했던 SRS v0.1 히스토리 보관 문서. |

---

## 🗓️ 2. 마스터 실행 계획 & 태스크 마스터 (Master Plans) — [`execution-plans/`](./execution-plans/)
전체 46개 태스크의 마스터 목록, 56영업일 압축 일정, 의존성 그래프 및 임계 경로(Critical Path)를 정의합니다.

| 파일명 | 주요 역할 |
|---|---|
| ⏱️ [`FASTTRACK_finfriends-nextjs-v1_0.md`](./execution-plans/FASTTRACK_finfriends-nextjs-v1_0.md) | **56영업일 압축 실행 일정** (2026-09-07 착수 기준), 태스크간 의존 관계(DAG), 마일스톤, 임계 경로 명세. |
| 🗺️ [`EXECUTION_finfriends-nextjs-v1_0.md`](./execution-plans/EXECUTION_finfriends-nextjs-v1_0.md) | SRS, Tasks, FastTrack을 통합한 90일 기준 전체 종합 실행 계획서. |
| 📋 [`TASKS_finfriends-nextjs-v1_0.md`](./execution-plans/TASKS_finfriends-nextjs-v1_0.md) | Next.js v1.0 기준 46개 태스크의 전체 마스터 목록 및 명세. |
| 📂 [`TASKS_finfriends-nextjs-v3_0.md`](./execution-plans/TASKS_finfriends-nextjs-v3_0.md) | 확장/비교 검토용 v3.0 태스크 마스터 목록. |

---

## 📑 3. 깃허브 이슈 & 단계별 태스크 명세 (Stage Tasks) — [`tasks/`](./tasks/)
실제 작업 단위로 1개 파일이 깃허브 이슈 1건(#1~#46)과 1:1 매핑되어 있는 상세 태스크 명세입니다.

| 폴더 / 파일 | 내용 설명 |
|---|---|
| 📌 [`tasks/_index.md`](./tasks/_index.md) | 46개 이슈의 마스터 인덱스 (이슈 번호, 라벨, 담당, SRS 참조 링크) |
| 📊 [`tasks/_summary.md`](./tasks/_summary.md) | 전체 태스크의 스테이지별 진행 상태 및 AC 요약 표 |
| 🚩 `tasks/stage-0/` ~ `stage-9/` | Stage 0(인프라) ~ Stage 9(검증/출고)까지 단계별 태스크 상세 명세파일들 (총 46건) |

---

## 🔬 4. 태스크 방법론 & 검토 보고서 (Analysis & Reports) — [`analysis-reports/`](./analysis-reports/)
PRD/SRS로부터 태스크를 추출하고 통합/검증한 방법론 및 분석 보고서 모음입니다.

| 파일명 | 주요 역할 |
|---|---|
| 📐 [`METHODOLOGY_task-extraction.md`](./analysis-reports/METHODOLOGY_task-extraction.md) | PRD 및 SRS 문리적 분석을 통해 4단계 대조법으로 태스크를 도출하는 방법론. |
| 🔍 [`ANALYSIS_task-consolidation.md`](./analysis-reports/ANALYSIS_task-consolidation.md) | 파편화된 요구사항을 55건 내외의 적정 크기 태스크로 정제/통합한 근거 보고서. |
| 📝 [`REPORT_task-extraction-review.md`](./analysis-reports/REPORT_task-extraction-review.md) | 태스크 추출 및 통합 결과에 대한 교차 검증 및 정합성 검토 보고서. |

---

## 🤖 5. 개발 규칙 & 에이전트 하네스 (Agent & Rules) — 최상위 & [`.agents/`](./.agents/)
AI 및 개발자가 지켜야 할 어길 수 없는 12조 규칙, 테스트/게이트 검증 체계입니다.

| 파일명 / 경로 | 주요 내용 |
|---|---|
| 🛑 [`AGENTS.md`](./AGENTS.md) | **[필수]** 전체 AI 에이전트 및 개발자 공통 어길 수 없는 12조 강제 지침. |
| 🤖 [`CLAUDE.md`](./CLAUDE.md) | Claude Code 가이드라인 및 규칙 연동 설정. |
| ⚙️ [`HARNESS.md`](./HARNESS.md) | 개발 하네스, prebuild 게이트(G1~G7), TDD 및 빌드 검증 가이드. |
| 📁 [`.agents/rules/`](./.agents/rules/) | 런타임 경계, RLS, 스택 고정, 게이트 명세 등 세부 규칙 (001~008). |
| 📁 [`.agents/skills/`](./.agents/skills/) | TDD, RLS/마이그레이션, Server Action 계약 등 구체적 절차(스킬) 모음. |

---

## 🎨 6. 시각 프로토타입 & 기획 문서 (Design & Prototypes) — [`docs/`](./docs/)
프로토타입 구현 범위, 시각적 디자인 구성안, 의사결정 기록 문서 모음입니다.

| 파일명 / 경로 | 주요 내용 |
|---|---|
| 🖼️ [`docs/prototype-visual-plan.md`](./docs/prototype-visual-plan.md) | Visual Prototype(시각 프로토타입) 4단계 실행 및 검수 계획. |
| 💡 [`docs/prototype-suggestion.md`](./docs/prototype-suggestion.md) | 시각 프로토타입 개발 범위 제안 및 마일스톤 설계. |
| 🎯 [`docs/prototype-lite-scope.md`](./docs/prototype-lite-scope.md) | 경량 프로토타입 구현 범위. |
| 📂 [`docs/goals/`](./docs/goals/), [`docs/grill/`](./docs/grill/) | 에이전트 목표 설정 및 의사결정 노드 정리 문서. |

---

## 🎓 7. 학습 및 참고 자료 (Study Guides) — [`study/`](./study/)
PM과 엔지니어의 빠른 이해를 돕기 위한 요약본 및 HTML 로드맵 자료 모음입니다.

| 파일명 | 주요 내용 |
|---|---|
| 📖 [`study/GLOSSARY_finfriends-nextjs.html`](./study/GLOSSARY_finfriends-nextjs.html) | FinFriends 용어 및 표준 개념 정리 HTML 가이드. |
| 💼 [`study/STUDY_SRS-for-PM_finfriends.html`](./study/STUDY_SRS-for-PM_finfriends.html) | PM을 위한 핵심 SRS 요약 핸드북. |
| 📊 [`study/STUDY_TASKS-for-PM_finfriends.html`](./study/STUDY_TASKS-for-PM_finfriends.html) | PM을 위한 46개 태스크 요약 및 가시화. |
| 🗺️ [`study/STUDY_ENG-ROADMAP_finfriends.html`](./study/STUDY_ENG-ROADMAP_finfriends.html) | 엔지니어를 위한 개발 로드맵 및 단계별 가이드. |

---

## 💡 문서 읽는 추천 순서 (Recommended Reading Order)

1. **전체 개요 파악**: [`README.md`](./README.md) & [`AGENTS.md`](./AGENTS.md) (12조 불변 규칙 확인)
2. **구현 요구사항 및 설계 확인**: [`tech-design-docs/[SRS]SRS_finfriends-nextjs-v1_0.md`](./tech-design-docs/%5BSRS%5DSRS_finfriends-nextjs-v1_0.md) & [`[Diagrams]DESIGN_finfriends-v1_0.md`](./tech-design-docs/%5BDiagrams%5DDESIGN_finfriends-v1_0.md)
3. **일정 및 실행 계획 파악**: [`execution-plans/FASTTRACK_finfriends-nextjs-v1_0.md`](./execution-plans/FASTTRACK_finfriends-nextjs-v1_0.md)
4. **개별 태스크 착수**: [`tasks/_index.md`](./tasks/_index.md)에서 해당 태스크 명세 파일 확인 (`tasks/stage-N/...`)
