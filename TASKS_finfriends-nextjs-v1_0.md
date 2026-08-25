# [태스크 리스트] FinFriends — Next.js 기술 제약 반영판

**문서 ID:** TASKS-FINFRIENDS-NEXTJS-001
**개정 버전:** 2.0 — `METHODOLOGY_task-extraction.md` 4단계 대조 결과 반영
**기준 문서:** `SRS_finfriends-nextjs-v1_0.md` (SRS-FINFRIENDS-NEXTJS-001 · 개정 1.0)
**상위 문서:** `SRS_finfriends-v1_0.md` (SRS-FINFRIENDS-MVP-001)
**방법론:** `METHODOLOGY_task-extraction.md` · **개정 근거:** `REPORT_task-extraction-review.md` §2 수정 여지 8건
**짝 문서:** `.github/ISSUE_TEMPLATE/feature-task.md`

> **개정 2.0에서 달라진 것 — 8건**
> ① §8 **AC ↔ 태스크 배분표 84행 신설**(미배분 0건) ② `[Contract]` 6건 신설(E5) ③ `[Mock]` 3건 신설(E5)
> ④ 전 표에 **유형 칸** 추가 — 이슈 접두사·`type:` 라벨과 동일 값 ⑤ 조회/화면 **3건 분할**(FR-059·076·101)
> ⑥ E21 검증을 **횡단 `[Infra]`·`[Sec]` 5건 + 기능 귀속 `[Test]` 5건**으로 성격 재정의 ⑦ `[Infra]` 계측 2건 신설(FR-113·114)
> ⑧ §6 배치표에서 새어 나가던 계측 태스크를 **B6 별도 행**으로 집계
>
> 기존 116건은 **내용 변경 없이 번호만 이동**했다 — 대응은 §9. 규모 139 → **153건**.

---

## 0. 이 문서의 작성 규칙

| 항목 | 규칙 |
| --- | --- |
| **도출 원칙** | SRS에 **명시된 것만** 태스크화한다. 문서에 없는 기능은 추가하지 않았다 |
| **관점 분리** | **UI/UX 디자인(`UX-*`)** 과 **개발·인프라(`FR-*`)** 를 별도 표로 분리한다 (§2 · §3) |
| **ID 체계** | `UX-###` 디자인 산출물 · `FR-###` 개발 태스크. 번호는 **빌드 순서(§13)를 따르며, 선행 태스크는 항상 자기보다 작은 번호**를 가리킨다 (§7에서 기계 검증) |
| **유형** | 방법론 §5 접두사 체계. **이슈 제목의 접두사 · GitHub 라벨 `type:` 과 같은 값을 쓴다** — 이것이 있어야 Project에서 유형 필터가 성립한다. 9종: `[DB]` `[Contract]` `[Mock]` `[Feature/Query]` `[Feature/Command]` `[UI]` `[Test]` `[Infra]` `[Sec]` |
| **AC 귀속** | 두 SRS의 수용 기준 **84건 전건**을 §8 배분표에서 태스크에 못 박는다. **미배분 0건** — 어느 AC도 이슈 밖에 남지 않는다 |
| **복잡도** | **H** = 아키텍처 결정·동시성·규제 강제·외부 연동 / **M** = 표준 구현 + 검증 / **L** = 설정·스크립트 |
| **관련 SRS 섹션** | 본 문서(NEXTJS-001) 기준. 승계 요구사항은 `REQ-FUNC-*` · `REQ-NF-*`, 신설은 `REQ-TEC-*` · `REQ-AI-*`로 병기 |

### 요약

| 구분 | 건수 | 복잡도 H / M / L |
| --- | :-: | :-: |
| **UI/UX 디자인** (`UX-*`) — 13개 도메인 | **23** | 5 / 18 / 0 |
| **개발·인프라** (`FR-*`) — Epic 21구획 | **130** | 33 / 94 / 3 |
| **합계** | **153** | 38 / 112 / 3 |

**유형별 분포** (개발 태스크 130건)

| `[Feature/Command]` | `[Infra]` | `[UI]` | `[Sec]` | `[Contract]` | `[DB]` | `[Test]` | `[Feature/Query]` | `[Mock]` |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| 38 | 31 | 15 | 14 | 13 | 7 | 5 | 4 | 3 |

### 범위 제외 — 태스크화하지 않은 것 (SRS의 배분 결정에 따름)

| 항목 | 근거 |
| --- | --- |
| REQ-FUNC-014 예적금 비교·선택 | 기준 SRS §13.2 — **R2 배분** · D2 법률 검토 통과 전 착수 불가 |
| REQ-FUNC-016 별의 옷장 외 목적지 | 기준 SRS §13.2 — **R2+ 배분** · 현금 분리선 재검토 전 착수 불가 |
| REQ-FUNC-017 기존 앱 기록 이전 | 기준 SRS §13.2 — **미배분(Won't)** · 부재를 문구로 처리 |
| 네이티브 앱 · 별도 백엔드 · 별도 CI/CD · 자체 AI 서버 | §1.2 범위 제외 (C-TEC-001 · 002 · 005 · 007) |
| 소비 순간 자동 개입 · 위치정보 수집 | 기준 SRS ADR-002 · CON-REG-03 — **영구 제외** |

---

## 1. Epic 목록

> 153건의 상세 표에 들어가기 전에 **어떤 Epic이 무엇을 책임지는가**를 먼저 본다. 개발 Epic의 번호(E1~E21)는 **§13 빌드 순서를 따르며**, 태스크 번호도 같은 순서로 매겨져 있다.

### 1.1 개발·인프라 Epic — 21구획 · 130건

| Epic | ID 범위 | 건수 | H/M/L | 빌드 | 무엇을 책임지는가 |
|---|---|:-:|:-:|:-:|---|
| **E1** Platform & Infra | `FR-001~FR-007` | 7 | 1/5/1 | B0 | 배포 단위 1개 · 리전 고정 · 환경 스코프 분리 · 스타일 진입점 확보 |
| **E2** DB Schema & Data Access | `FR-008~FR-017` | 10 | 5/5/0 | B0 | Prisma 스키마 · 롤 분리 · RLS 2계층 · 별 원장 원자 기입 · 이벤트 파티셔닝 |
| **E3** Build Gate | `FR-018~FR-025` | 8 | 1/6/1 | B0 | 별도 CI 없이 `prebuild` 게이트 7종이 규제·정합성을 강제 (X-2) |
| **E4** Server Runtime & Domain | `FR-026~FR-029` | 4 | 2/2/0 | B0 | Server Action 공통 골격 · 멱등 계약 · 캐시 규약 · 순수 판정 함수 분리 |
| **E5** Contract & Mock *(신설)* | `FR-030~FR-038` | 9 | 0/9/0 | B0 | 도메인 계약 6종이 **병렬 착수의 기준점**을 고정하고, Mock 3종이 외부·배치 종속을 끊는다 |
| **E6** Auth & Consent | `FR-039~FR-043` | 5 | 1/4/0 | B1 | 보호자 전용 인증 · 동의 게이트 4겹 판정 · 캐시 금지 |
| **E7** Guardian Onboarding | `FR-044~FR-048` | 5 | 1/4/0 | B1 | 5단계 세션 분할·재개 · 법정대리인 동의 · 카드 신청 실패 보존 |
| **E8** Star Ledger & Learning | `FR-049~FR-054` | 6 | 1/5/0 | B2 | 별 지급 엔진(트리거 8종·경로 분리) · 4영역 학습과 퀴즈 |
| **E9** Practice & Mission | `FR-055~FR-060` | 6 | 1/5/0 | B3 | 미션 루프 · 승인 4건 원자 트랜잭션 · 소급 귀속 · 일괄 승인 · **대기 조회 분리** |
| **E10** Wishlist & Avatar | `FR-061~FR-064` | 4 | 0/4/0 | B3 | 위시리스트 단계 보상 · 아바타 교환(차감도 같은 원장 경로) |
| **E11** Partner & Spending | `FR-065~FR-073` | 9 | 2/7/0 | B4 | 제휴사 웹훅 수신 규약 · 결제↔계획 매칭 · 카드 상태·해지 |
| **E12** Retrospective | `FR-074~FR-077` | 4 | 1/3/0 | B5 | 회고 문장 비복원 배정 · 두 갈래 판정 · **미완 큐·병합 조회 분리** |
| **E13** Batch Infrastructure | `FR-078~FR-080` | 3 | 0/3/0 | B0 | 배치 하트비트 · `pg_net` 진입점 · 등록 목록 대조 |
| **E14** pg_cron 배치 | `FR-081~FR-090` | 10 | 5/5/0 | B5 | DB 내부 집계 9종 + 파티션 선행 생성 — 실행 시간 제한 없음 (X-5) |
| **E15** Notification | `FR-091~FR-095` | 5 | 2/3/0 | B5 | Web Push → 인앱 배너 → SMS 폴백 · 시도/전달 분리 집계 (X-3) |
| **E16** Vercel Cron 배치 | `FR-096~FR-100` | 5 | 1/4/0 | B5 | 외부 호출이 필요한 배치 4종 — 알림 발송 · 프로브 · 원가 · DLQ |
| **E17** Growth Delivery | `FR-101~FR-105` | 5 | 2/3/0 | B5 | 성장 나무 · 월간 숲 · 소비 내역 — **조회와 렌더를 분리**해 예산을 각각 진다 |
| **E18** PWA & Offline | `FR-106~FR-109` | 4 | 2/2/0 | B3 | 설치성 확보 · IndexedDB 큐 · iOS 포그라운드 flush (X-4) |
| **E19** Observability & Ops | `FR-110~FR-114` | 5 | 1/4/0 | B6 병행 | 로그 드레인 · 규제 즉시 알림 30분 SLA · 배치 침묵 감지 · **구간 계측과 예산 초과 보고** |
| **E20** AI Ops Tool | `FR-115~FR-120` | 6 | 1/5/0 | 조건부 | 운영자 전용 AI — 아동·보호자 런타임에서 배제 (X-7) |
| **E21** Verification Harness | `FR-121~FR-130` | 10 | 3/6/1 | 검증 | 릴리스 게이트 RG-T1~T4의 근거가 되는 검증 설비 |

> **개정 2.0에서 달라진 것** — E5가 신설되어 계약·Mock 9건이 B0에 들어왔고, E9·E12·E17에 조회 태스크가 1건씩 갈라져 나왔으며, E19에 계측 2건이 붙었다. 기존 116건은 **내용 변경 없이 번호만 이동**했다(대응은 §9).

### 1.2 UI/UX 디자인 Epic — 13개 도메인 · 23건

| Epic (도메인) | ID | 건수 |
|---|---|:-:|
| **Design System** | `UX-001`, `UX-002`, `UX-003`, `UX-004`, `UX-005` | 5 |
| **Onboarding** | `UX-006`, `UX-007`, `UX-008` | 3 |
| **Consent** | `UX-009` | 1 |
| **Child Onboarding** | `UX-010` | 1 |
| **Learning** | `UX-011` | 1 |
| **Growth Tree** | `UX-012`, `UX-013` | 2 |
| **Growth Forest** | `UX-014` | 1 |
| **Approvals** | `UX-015`, `UX-016` | 2 |
| **Plan & Retro** | `UX-017`, `UX-018` | 2 |
| **Spending** | `UX-019` | 1 |
| **Reward** | `UX-020`, `UX-021` | 2 |
| **Empty State** | `UX-022` | 1 |
| **Ops Console** | `UX-023` | 1 |

> 디자인 Epic은 빌드 구획에 묶지 않는다 — 화면 구현 태스크보다 **선행**해야 하며, 대응 관계는 §4에 있다.

---

## 2. UI/UX 디자인 태스크

> 근거 — §6.8 UI 규약 · 화면↔컴포넌트 대응표 · §3.2 라우트 그룹 구조.
> 이 표의 선행 관계는 **디자인 산출물 사이의 관계**이며, 개발 태스크와의 연결은 §4에 별도 표로 둔다.

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| UX-001 | [UI] | Design System | 디자인 토큰 정의 — 색·간격·라운드·타이포 CSS 변수 | 6.8 UI 규약 · C-TEC-004 | None | M |
| UX-002 | [UI] | Design System | 아동/보호자 테마 분기 — 변수로만 분기하는 규칙 | 6.8 UI 규약 | UX-001 | M |
| UX-003 | [UI] | Design System | shadcn/ui 컴포넌트 목록 확정 및 커스터마이즈 규약 | 6.8 화면↔컴포넌트 대응 | UX-001 | M |
| UX-004 | [UI] | Design System | 접근성 기준 — 아동 화면 터치 타깃 ≥ 44px · 대비 4.5:1 | 6.8 접근성 | UX-003 | M |
| UX-005 | [UI] | Design System | 아동용 알기 쉬운 문구 체계 — 4영역 명칭 동일 + 한 줄 설명 | CON-REG-02 · REQ-NF-014 | None | M |
| UX-006 | [UI] | Onboarding | 보호자 온보딩 5단계 플로우 · Stepper · 재개 상태 표기 | 6.8 · REQ-FUNC-007 | UX-003 | H |
| UX-007 | [UI] | Onboarding | 외부 API 실패 사유 화면 — 사용자 언어 표기 | 3.4 · ACE-8.1 | UX-006 | M |
| UX-008 | [UI] | Onboarding | PWA 설치 유도 배너 (온보딩 5단계) · 앱 아이콘 · 스플래시 | 6.7 · X-3 | UX-006 | M |
| UX-009 | [UI] | Consent | 동의 게이트 차단 화면 | 3.3 동의 게이트 | UX-003 | M |
| UX-010 | [UI] | Child Onboarding | 아동 온보딩 — 첫 보상 루프 5분 이내 구성 | REQ-FUNC-006 | UX-002, UX-005 | H |
| UX-011 | [UI] | Learning | 아동 학습·퀴즈 화면 — Card · RadioGroup · Progress | 6.8 · REQ-FUNC-003 | UX-002, UX-005 | M |
| UX-012 | [UI] | Growth Tree | 성장 나무 — Card · Progress · Accordion · Badge(승인 대기 N건) | 6.8 · REQ-FUNC-001 · 010 | UX-003 | H |
| UX-013 | [UI] | Growth Tree | 정체 원인 표시 — 미충족 조건 전부 · 가장 적게 남은 조건 최상단 | REQ-FUNC-001 · ACE-3.1 | UX-012 | H |
| UX-014 | [UI] | Growth Forest | 월간 숲 — Card · Tabs(월 선택) · Alert(전월 없음 대체 문구) | 6.8 · REQ-FUNC-009 · ACE-1.2 | UX-003 | M |
| UX-015 | [UI] | Approvals | 승인 대기 — Table · Dialog(거절 사유) · Checkbox(일괄 승인) | 6.8 · REQ-FUNC-002 · ACE-6.3 | UX-003 | M |
| UX-016 | [UI] | Approvals | 대기 / 거절 / 미실천 시각 구별 규칙 | ACE-6.1 · AC-6.3 | UX-015 | M |
| UX-017 | [UI] | Plan & Retro | 계획 카드 — Form · Select(업종) · Input(금액) | 6.8 · REQ-FUNC-008 | UX-003 | M |
| UX-018 | [UI] | Plan & Retro | 두 갈래 회고 — Alert 갈래별 색 분기 · 화면만으로 구별 가능 | 6.8 · AC-5.3 · 5.4 · 5.6 | UX-017 | H |
| UX-019 | [UI] | Spending | 소비 내역 — 전월 대비 증감액 상단 배치 · 업종별 집계 | REQ-FUNC-013 | UX-003 | M |
| UX-020 | [UI] | Reward | 아바타·옷장 화면 · 별 잔액 표기 | REQ-FUNC-005 | UX-002 | M |
| UX-021 | [UI] | Reward | 위시리스트 — 30·70·100% 단계 보상 표기 | REQ-FUNC-012 | UX-002 | M |
| UX-022 | [UI] | Empty State | 빈 상태 3종 — 실천 0건 · 전월 데이터 없음 · 「불리기 곧 열려요」 | ACE-1.1 · ACE-1.2 · AC-2.4 | UX-012, UX-014 | M |
| UX-023 | [UI] | Ops Console | 운영자 도구 화면 — AI 초안 검토·승인 · 문장 풀 잔여율 | 3.2 (ops) · REQ-AI-004 | UX-003 | M |

---

## 3. 개발·인프라 태스크

### E1. Platform & Infra — 기반 설비 (B0)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-001 | [Infra] | Platform | Next.js App Router 프로젝트 초기화 · 라우트 그룹 스캐폴딩 | 3.2 라우트 그룹 · X-1 · REQ-TEC-001 | None | M |
| FR-002 | [Infra] | Platform | Supabase 프로젝트 생성 · 리전 `ap-northeast-2` 고정 · `pg_cron`·`pg_net` 활성화 | 10.3 · 11 · REQ-TEC-013 · D-TEC-7 | None | M |
| FR-003 | [Infra] | Platform | Vercel 프로젝트 연결 · 함수 리전 `icn1` 고정 · Git Push 배포 구성 | 10.4 배포 절차 · REQ-TEC-013 | FR-001 | M |
| FR-004 | [Infra] | Platform | 환경 변수 스코프 분리 · Preview 전용 Supabase 프로젝트 · 배포 보호 | 10.2 환경 변수 · REQ-TEC-014 | FR-002, FR-003 | H |
| FR-005 | [Infra] | Platform | 의존성 버전 고정 정책 반영 (`package.json` ↔ §10.1 표 동기) | 10.1 버전 고정 | FR-001 | L |
| FR-006 | [Infra] | Platform | 로컬 개발 환경 — 로컬 Supabase · 풀러 모드 검증 · 합성 시드 | 10.5 로컬 개발 환경 | FR-002 | M |
| FR-007 | [Infra] | Platform | Tailwind · shadcn/ui 초기화 · `globals.css` 단일 진입점 | 6.8 UI 규약 · C-TEC-004 · C-TEC-018 | FR-001 | M |

### E2. DB Schema & Data Access — 데이터 계층 (B0)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-008 | [DB] | DB Schema | Prisma 스키마 정의 — `app`·`pii` 다중 스키마 · 모델 전수 | 6.2 데이터 모델 | FR-002 | H |
| FR-009 | [DB] | DB Schema | Supavisor transaction 모드 접속 구성 · 부팅 시 접속 문자열 assert | 6.2 · REQ-TEC-004 · C-TEC-011 | FR-008 | M |
| FR-010 | [DB] | DB Access | Prisma 2클라이언트 분리 — `db/request.ts` · `db/batch.ts` | 6.3 · REQ-TEC-005 · C-TEC-012 | FR-009 | M |
| FR-011 | [Sec] | DB Access | DB 롤 분리 (`app_request`·`app_batch`) · `pii` 스키마 권한 회수 | 6.3 규칙 4 · REQ-NF-009 | FR-008 | H |
| FR-012 | [Sec] | DB Access | RLS 정책 전수 작성 · `is_own_child` SECURITY DEFINER 헬퍼 | 6.3 RLS 2계층 · REQ-TEC-005 | FR-011 | H |
| FR-013 | [DB] | DB Access | `withGuardian()` 트랜잭션 래퍼 — 보호자 id를 세션에서만 취득 | 6.3 · 6.4 | FR-010, FR-012 | M |
| FR-014 | [Sec] | DB Access | `pii` 접근 함수 3종 — `upsert_identity`·`get_identity_ref`·`verify_owner` | 6.3 규칙 4 | FR-011 | M |
| FR-015 | [DB] | Star Ledger | 별 원장 원자 기입 SQL — advisory lock + 단일 INSERT + `UNIQUE(idempotency_key)` | 6.5 동시성 · X-6 · REQ-TEC-019 · REQ-NF-006 | FR-008 | H |
| FR-016 | [DB] | Event | `app_events` 주차 파티셔닝 · 적재 유틸 · 필수 필드 `NOT NULL` | 6.2 · REQ-TEC-020 · CON-ARC-07 | FR-008 | H |
| FR-017 | [DB] | DB Schema | expand-contract 마이그레이션 절차 수립 — 최소 2배포 분할 | 10.4 · REQ-TEC-015 · CON-TEC-01 | FR-008 | M |

### E3. Build Gate — `prebuild` 게이트 (B0)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-018 | [Infra] | Build Gate | 게이트 러너 — `prebuild`·`build` 이중 호출 · 실행 로그 출력 | 6.6 · REQ-TEC-011 · X-2 | FR-001 | M |
| FR-019 | [Sec] | Build Gate | G1 별↔저금통 전환 경로 검사 | 6.6 · 11 (BAT-5) · REQ-NF-010 · CON-REG-05 | FR-018 | M |
| FR-020 | [Sec] | Build Gate | G2 금지 필드 스캔 — 좌표·얼굴 필드 | 6.6 · 11 (BAT-4b) · REQ-NF-009 · CON-REG-03 · 06 | FR-018, FR-008 | M |
| FR-021 | [Infra] | Build Gate | G3 런타임 경계 import 그래프 검사 | 6.6 · REQ-TEC-002 · C-TEC-009 | FR-018, FR-010 | H |
| FR-022 | [Infra] | Build Gate | G4 Server Action 계약 검사 — `idempotencyKey` · zod 스키마 | 6.6 · REQ-TEC-003 | FR-018 | M |
| FR-023 | [Infra] | Build Gate | G5 스타일 단일 경로 검사 — CSS 파일·CSS-in-JS·인라인 style | 6.6 · REQ-TEC-012 | FR-018, FR-007 | L |
| FR-024 | [Sec] | Build Gate | G6 AI 경계 검사 — SDK import 경로 · 프롬프트 변수 화이트리스트 | 6.6 · REQ-AI-001 · 003 · C-TEC-017 | FR-018 | M |
| FR-025 | [Infra] | Build Gate | G7 마이그레이션 파괴적 DDL 검사 | 6.6 · REQ-TEC-015 | FR-018, FR-017 | M |

### E4. Server Runtime & Domain — 실행 규칙 (B0)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-026 | [Contract] | Server Runtime | Server Action 공통 골격 — 입력 검증·동의 재확인·원자 기입·계측·선택 재검증 | 6.4 서버 경계 실행 규칙 | FR-013, FR-015, FR-016 | H |
| FR-027 | [Contract] | Server Runtime | 멱등 키 발급·전달 클라이언트 유틸 (UUIDv7) | 6.4 · REQ-TEC-003 · C-TEC-010 | FR-001 | M |
| FR-028 | [Contract] | Server Runtime | 캐시·재검증 태그 상수 모듈 · `noStore` 규약 | 6.4 캐시 규약 · REQ-TEC-016 | FR-026 | M |
| FR-029 | [Contract] | Domain | `domain/` 순수 판정 함수 모듈 — 나무 승급·정체·계획 대조·WPA 카운트 | 3.2 (`domain/` 분리 근거) | FR-008 | H |

### E5. Contract & Mock — 계약 기준점 (B0)

> **신설 Epic.** 방법론 Step 1의 *"병렬 착수의 기준점 확보"* 를 성립시킨다. E4가 실행 **형식**을 정한다면 이 Epic은 도메인별 **내용**(입력 스키마 · 반환 타입 · 실패 분기)을 못 박고, Mock 3종이 외부·배치 종속을 끊는다.
> 공개 REST API가 없으므로 계약의 산출물은 **DTO·HTTP 에러 코드가 아니라 zod 스키마 + 반환 타입 + 실패 분기**다 — HTTP 상태 코드 규약은 Route Handler 9경로(FR-067 · FR-079 · FR-096)에만 적용한다.

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-030 | [Contract] | Contract | Onboarding·Consent·Card 계약 — 액션 5종 (`saveOnboardingStep`·`submitConsent`·`requestPartnerCard`·`selectChildProfile`·`terminatePartnerCard`) | 6.1.1 · 6.4 · REQ-TEC-003 | FR-008, FR-026, FR-027 | M |
| FR-031 | [Contract] | Contract | Mission 계약 — 액션 5종 · 승인 4건 원자 처리의 반환 계약 포함 | 6.1.1 · 6.4 · 6.5 | FR-008, FR-026, FR-027 | M |
| FR-032 | [Contract] | Contract | Learning 계약 — 액션 2종 (`completeLearningTopic`·`submitQuizAnswer`) | 6.1.1 · REQ-FUNC-003 | FR-008, FR-026, FR-027 | M |
| FR-033 | [Contract] | Contract | Reward 계약 — 액션 2종 + `grantStar` 내부 경로 시그니처 · 잔액 부족 롤백 분기 | 6.1.1 · 6.5 · REQ-FUNC-005 · 012 | FR-008, FR-026, FR-027 | M |
| FR-034 | [Contract] | Contract | Plan·Retro 계약 — 액션 3종 · 갈래 판정 반환값(`plan_met`·`category_met`) | 6.1.1 · AC-5.3 · 5.4 · ACE-4.2 | FR-008, FR-026, FR-027 | M |
| FR-035 | [Contract] | Contract | Notification·Offline 계약 — 액션 3종 · 배열 멱등 · 부분 실패 반환 규약 | 6.1.1 · REQ-TEC-008 · 009 | FR-008, FR-026, FR-027 | M |
| FR-036 | [Mock] | Mock | 제휴사 웹훅 픽스처 + HMAC 서명 생성기 — 정상 / 서명 위조 / 재전송 3종 | 3.4 · 6.1.2 · REQ-TEC-018 | FR-008 | M |
| FR-037 | [Mock] | Mock | 화면 시드 데이터셋 — 별 잔액 · 나무 조건 · 승인 대기 N건 · 위시리스트 단계 고정 | 6.2 · 10.5 · 6.3 (RLS 통과) | FR-008, FR-012 | M |
| FR-038 | [Mock] | Mock | 배치 산출값 스텁 — `stall_days` · 월간 숲 스냅샷 · `monthly_category_agg` 고정값 | 11 · 4.1 (FUNC-001 · 009 · 013) | FR-008 | M |

### E6. Auth & Consent — 인증과 동의 게이트 (B1)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-039 | [Sec] | Auth | Supabase Auth 보호자 연결 — 아동 자격증명 필드 부재 | 3.3 · REQ-TEC-007 · CON-DEV-03 | FR-002, FR-008 | M |
| FR-040 | [Sec] | Auth | `middleware.ts` — 세션 쿠키 서명·만료 검증 · 라우트 그룹 분기 | 3.1 경계 ② · 3.3 | FR-039 | M |
| FR-041 | [Sec] | Consent Gate | `(child)/layout.tsx` 확정 판정 — `noStore()` · `consent_gate_blocked` 적재 | 3.3 · REQ-TEC-006 · REQ-NF-008 | FR-040, FR-016 | H |
| FR-042 | [Sec] | Consent Gate | Server Action 래퍼 동의 재확인 (`assertConsentCompleted`) | 3.3 · 6.4 ② | FR-026, FR-041 | M |
| FR-043 | [Feature/Command] | Auth | `selectChildProfile` — 아동 프로필 선택 서명 쿠키 | 6.1.1 · CON-DEV-03 | FR-039, FR-030 | M |

### E7. Guardian Onboarding — 보호자 온보딩 (B1)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-044 | [Feature/Command] | Onboarding | `saveOnboardingStep` — 매 단계 커밋 · `onboarding_drafts` 24h 보존 | 6.1.1 · REQ-FUNC-007 · AC-8.1 | FR-026, FR-030 | M |
| FR-045 | [Feature/Command] | Onboarding | `submitConsent` — 동의 기록(버전 포함) · 상태 전이 · 이벤트 | 6.1.1 · REQ-NF-008 | FR-044, FR-030 | M |
| FR-046 | [Feature/Command] | Onboarding | `requestPartnerCard` — 제휴사 호출 · 실패 시 입력값 24h 보존 | 3.4 · 6.1.1 · ACE-8.1 | FR-044, FR-030 | H |
| FR-047 | [UI] | Onboarding | `(guardian)/onboarding/[step]` 화면 · 재개 처리 | 3.2 · 5.1 | FR-044, FR-007 | M |
| FR-048 | [UI] | Public | `(public)` 랜딩 · 로그인 · 동의 안내 화면 | 3.2 라우트 그룹 | FR-040, FR-007 | M |

### E8. Star Ledger & Learning — 별 지급과 학습 (B2)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-049 | [Feature/Command] | Star Ledger | `grantStar` 내부 지급 경로 — 트리거 8종 · 학습/실천 경로 분리 | 5.1 · REQ-FUNC-004 | FR-015, FR-026, FR-033 | H |
| FR-050 | [Feature/Query] | Learning | 학습 원고 DB 적재 및 조회 (런타임 변경 가능) | 4.1 (FUNC-003) | FR-008 | M |
| FR-051 | [Feature/Command] | Learning | `completeLearningTopic` — 이수 기록 · ⭐ 기입 · 나무 조건 갱신 | 6.1.1 · REQ-FUNC-003 · 006 | FR-049, FR-029, FR-032 | M |
| FR-052 | [Feature/Command] | Learning | `submitQuizAnswer` — 정답 수 갱신 · 조건 갱신 | 6.1.1 · REQ-FUNC-003 | FR-049, FR-029, FR-032 | M |
| FR-053 | [UI] | Learning | `(child)/learn/[topic]` 학습·퀴즈 화면 | 3.2 · 5.1 | FR-051, FR-052, FR-041 | M |
| FR-054 | [UI] | Learning | `(child)/onboarding` 아동 온보딩 화면 | 5.1 · REQ-FUNC-006 | FR-053 | M |

### E9. Practice & Mission — 미션 루프 (B3)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-055 | [Feature/Command] | Mission | `createMission` · `reportMissionDone` — `earned_at` 확정 | 6.1.1 · REQ-FUNC-002 | FR-026, FR-031 | M |
| FR-056 | [Feature/Command] | Mission | `approveMission` — 승인·⭐기입·실천 인정·주기 귀속·이벤트 4건 원자 | 6.1.1 · REQ-FUNC-002 · 010 | FR-049, FR-029, FR-055, FR-031 | H |
| FR-057 | [Feature/Command] | Mission | `rejectMission` — ⭐ 미지급 · 사유 저장 · 실천 미가산 | 6.1.1 · ACE-6.1 | FR-056, FR-031 | M |
| FR-058 | [Feature/Command] | Mission | `bulkApproveMissions` — 일괄 승인 · 원자성은 건 단위 | 6.1.1 · ACE-6.3 | FR-056, FR-031 | M |
| FR-059 | [Feature/Query] | Mission | 승인 대기 조회 — 「승인 대기 N건」 집계 · 대기 / 거절 / 미실천 상태 구별 · 일괄 승인 후보 집합 | 6.1.1 · AC-6.2 · ACE-6.1 · 6.3 | FR-056, FR-029 | M |
| FR-060 | [UI] | Mission | `(guardian)/approvals` 승인 대기 화면 · 「승인 대기 N건」 | 3.2 · 5.1 · REQ-FUNC-010 | FR-059, FR-007 | M |

### E10. Wishlist & Avatar — 저축 목표와 보상 (B3)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-061 | [Feature/Command] | Wishlist | `updateWishlistSaving` — 단계 도달 판정 · 부분 유니크 인덱스로 중복 차단 | 6.1.1 · 4.1 (FUNC-012) | FR-049, FR-008, FR-033 | M |
| FR-062 | [UI] | Wishlist | `(child)/wishlist` 화면 | 5.1 · REQ-FUNC-012 | FR-061 | M |
| FR-063 | [Feature/Command] | Avatar | `redeemAvatarItem` — 차감 기입 · `SPEC_PENDING` 품목 쿼리 제외 | 6.1.1 · 4.1 (FUNC-005) · CON-RES-02 | FR-049, FR-033 | M |
| FR-064 | [UI] | Avatar | `(child)/avatar` 아바타·옷장 화면 | 5.1 · REQ-FUNC-005 | FR-063 | M |

### E11. Partner & Spending — 제휴사 연동과 소비 (B4)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-065 | [Feature/Command] | Plan Card | `createPlanCard` — 어디서·업종·얼마까지 저장 · `plan_card_created` 이벤트 | 6.1.1 · REQ-FUNC-008 · AC-4.1 | FR-026, FR-034 | M |
| FR-066 | [UI] | Plan Card | `(child)/plan` 계획 카드 화면 + 보호자 기기 작성 경로 | 3.2 · 12 (CON-DEV-01) | FR-065, FR-007 | M |
| FR-067 | [Contract] | Partner Webhook | 웹훅 수신 공통 — HMAC 서명 검증 · 타임스탬프 허용창 5분 · 200 응답 규약 | 3.4 · 6.1.2 · REQ-TEC-018 | FR-008, FR-004, FR-036 | H |
| FR-068 | [Feature/Command] | Partner Webhook | `/api/partner/webhook/payment` — 거래 ID 유니크 · `spending_records` 적재 | 6.1.2 · REQ-TEC-018 | FR-067 | M |
| FR-069 | [Feature/Command] | Spending | 결제↔계획 매칭 — 수신 트랜잭션 내 즉시 · `planMatch`/`categoryMatch` 칼럼 분리 | 4.1 (FUNC-008) · CON-ARC-04 | FR-065, FR-068, FR-029 | H |
| FR-070 | [Feature/Command] | Partner Webhook | `partner_webhook_dlq` 적재 — 처리 실패를 200 + DLQ로 흡수 | 3.4 · 6.2 · REQ-TEC-018 | FR-067 | M |
| FR-071 | [Feature/Command] | Partner Webhook | `/api/partner/webhook/card-state` + `PartnerPolicyAdapter`(한도·업종 읽어 반영) | 3.4 · 12 (CON-REG-08) · REQ-NF-015 | FR-067 | M |
| FR-072 | [Feature/Command] | Partner Card | `terminatePartnerCard` — 해지 호출 · 전액 환불 · 부분 환불 분기 부재 | 6.1.1 · REQ-NF-013 · CON-REG-07 | FR-046, FR-030 | M |
| FR-073 | [UI] | Partner Card | 카드 없는 체험 잠금 분기 — `PARTNER_CARDS.state` 컴포넌트 단위 잠금 | 4.1 (FUNC-015) | FR-071 | M |

### E12. Retrospective — 두 갈래 회고 (B5)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-074 | [Feature/Command] | Retro | 회고 문장 풀 적재 · 비복원 배정 로직 (`reviewState`·`source` 구분) | 6.2 (`RetroSentence`) · ACE-5.1 | FR-008 | M |
| FR-075 | [Feature/Command] | Retro | `submitRetrospective` — 문장 배정 · 갈래 판정 · ⭐ 기입 분기 · 체류 기록 | 6.1.1 · AC-5.3 · 5.4 | FR-069, FR-049, FR-074, FR-034 | H |
| FR-076 | [Feature/Query] | Retro | 미완 회고 큐 조회 · 큐 3건 초과 시 요약 회고 병합 규칙 | 6.1.1 · ACE-5.2 | FR-074, FR-075 | M |
| FR-077 | [UI] | Retro | `(child)/retro` 두 갈래 회고 화면 · 미완 회고 큐 · 요약 회고 병합 | 5.1 · 6.8 · ACE-5.2 | FR-076, FR-007 | M |

### E13. Batch Infrastructure — 배치 기반 설비 (B0/B5 병행)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-078 | [Infra] | Batch Infra | `batch_heartbeats` 테이블 · 전 배치 성공 시각 기록 규약 | 6.2 · 11 분담 규칙 4 · REQ-TEC-017 | FR-008 | M |
| FR-079 | [Contract] | Batch Infra | `/api/internal/notify` — `pg_net` 진입점 · 공유 시크릿 · 출처 제한 | 6.1.2 · 11 | FR-004, FR-067 | M |
| FR-080 | [Infra] | Batch Infra | 배치 등록 목록 대조 검사 (`pg_cron`·`vercel.json` ↔ §11 표) | 5.2 · REQ-TEC-010 | FR-018 | M |

### E14. pg_cron 배치 — DB 내부 집계 (B5)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-081 | [Infra] | Batch (pg_cron) | `app_events` 파티션 선행 생성 배치 | 11 (신설) · REQ-TEC-020 | FR-016, FR-078 | M |
| FR-082 | [Feature/Command] | Batch (pg_cron) | BAT-1 나무 승급·정체 판정 (`stall_days` 산출) | 11 · 4.1 (FUNC-001) | FR-029, FR-078 | H |
| FR-083 | [Infra] | Batch (pg_cron) | BAT-3 별 원장 정산 — 이중 기입 대조 · 불일치 즉시 알림 | 11 · REQ-NF-006 | FR-015, FR-078, FR-079 | H |
| FR-084 | [Sec] | Batch (pg_cron) | BAT-4a 스키마·권한 스캔 — `pg_policies` RLS 부재 0건 확인 | 11 · 6.3 규칙 3 · REQ-NF-009 | FR-012, FR-078 | M |
| FR-085 | [Feature/Command] | Batch (pg_cron) | BAT-6 WPA 주간 집계 (북극성 지표) | 11 | FR-016, FR-029, FR-078 | H |
| FR-086 | [Feature/Command] | Batch (pg_cron) | BAT-7 주간 지표 집계 (파티션 스캔) | 11 | FR-085 | M |
| FR-087 | [Feature/Command] | Batch (pg_cron) | BAT-8 월간 숲 스냅샷 — 월초 전 아동 대상 대량 집계 | 11 · 4.1 (FUNC-009) | FR-029, FR-078 | H |
| FR-088 | [Infra] | Batch (pg_cron) | BAT-10 계측 건강성 — 이벤트↔원장 대조 · 유실률 산출 | 11 · REQ-TEC-020 | FR-016, FR-083 | H |
| FR-089 | [Infra] | Batch (pg_cron) | BAT-11 문장 풀 잔여율 판정 + `pg_net` 알림 위임 | 11 · ACE-5.1 | FR-074, FR-079 | M |
| FR-090 | [Feature/Command] | Batch (pg_cron) | 월간 업종별 집계 (`monthly_category_agg`) | 4.1 (FUNC-013) · 5.1 · 8 예산 | FR-069, FR-078 | M |

### E15. Notification — 알림 채널 (B5)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-091 | [Feature/Command] | Notification | `registerPushSubscription` · `updateNotifyWindow` — 엔드포인트 유니크 | 6.1.1 · REQ-FUNC-011 · AC-7.3 | FR-026, FR-035 | M |
| FR-092 | [Feature/Command] | Notification | Web Push 발송 (VAPID) · 404·410 수신 시 구독 즉시 폐기 | 3.4 · REQ-TEC-009 | FR-091 | H |
| FR-093 | [Feature/Command] | Notification | 채널 폴백 라우터 — 푸시 → 인앱 배너 → SMS · `attemptedAt`/`deliveredAt` 분리 집계 | 6.7 · X-3 · ACE-7.1 · REQ-TEC-009 | FR-092 | H |
| FR-094 | [Feature/Command] | Notification | SMS 게이트웨이 연동 · 재시도 3회 · 실패 집계 | 3.4 · D-TEC-8 | FR-093 | M |
| FR-095 | [Feature/Command] | Notification | 앱 삭제 분기 — 「재설치 안내」 문구 · 다른 이벤트 코드 적재 | ACE-7.2 | FR-093 | M |

### E16. Vercel Cron 배치 — 외부 호출 (B5)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-096 | [Contract] | Batch (Vercel) | Vercel Cron 등록 · `CRON_SECRET` 진입 인증 공통 | 6.1.2 · 11 · REQ-TEC-010 | FR-004, FR-080 | M |
| FR-097 | [Feature/Command] | Batch (Vercel) | BAT-2 미접속 알림 발송 (`/api/cron/inactivity`) · 오탐 0건 판정 | 11 · REQ-FUNC-011 · ACE-7.3 | FR-096, FR-093 | H |
| FR-098 | [Infra] | Batch (Vercel) | BAT-12 가용성·오류율 프로브 (`/api/cron/probe`) + `/api/health` | 11 · REQ-NF-004 · 005 · D-TEC-3 | FR-096 | M |
| FR-099 | [Infra] | Batch (Vercel) | BAT-9 원가 집계 (`/api/cron/cost`) — 청구 API 월 집계 | 11 · REQ-NF-016 · CON-RES-03 | FR-096 | M |
| FR-100 | [Feature/Command] | Batch (Vercel) | 웹훅 DLQ 재처리 (`/api/cron/webhook-dlq`) | 11 (신설) · REQ-TEC-018 | FR-096, FR-070 | M |

### E17. Growth Delivery — 전달 화면 (B5)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-101 | [Feature/Query] | Growth Tree | 성장 나무 병렬 4쿼리 — 배치 산출값 읽기 전용 · p95 ≤ 1,250ms 구간 배분 | 8.1 예산 · 4.1 (FUNC-001) | FR-082, FR-028 | H |
| FR-102 | [UI] | Growth Tree | `(guardian)/tree` 성장 나무 화면 — 병렬 4쿼리 · 배치 산출값 읽기 전용 | 4.1 (FUNC-001) · 8.1 예산 | FR-101, FR-007 | H |
| FR-103 | [UI] | Growth Tree | 정체 원인 조건 단위 표시 · 가장 적게 남은 조건 최상단 | REQ-FUNC-001 · ACE-3.1 | FR-102 | M |
| FR-104 | [UI] | Growth Forest | `(guardian)/forest` 월간 숲 화면 — 스냅샷 읽기 · 전월 없음 대체 문구 | 5.1 · ACE-1.2 | FR-087, FR-028 | M |
| FR-105 | [UI] | Spending | `(guardian)/spending` 소비 내역 화면 — 월간 집계 테이블 읽기 | 5.1 · 4.1 (FUNC-013) | FR-090, FR-028 | M |

### E18. PWA & Offline — 플랫폼 능력 (B3)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-106 | [Infra] | PWA | 매니페스트 · Service Worker 등록 · 홈 화면 설치성 확보 | 6.7 · REQ-TEC-008 · C-TEC-008 | FR-001 | M |
| FR-107 | [Feature/Command] | Offline | IndexedDB 오프라인 큐 — 기록 손실 0건 · `client_ts` 보존 | 6.7 · REQ-NF-003 | FR-106, FR-027 | H |
| FR-108 | [Feature/Command] | Offline | `flushOfflineQueue` Action — 항목별 멱등 키 순차 처리 · 부분 실패 허용 | 6.1.1 · REQ-TEC-008 | FR-107, FR-026, FR-035 | H |
| FR-109 | [Feature/Command] | Offline | iOS 포그라운드 진입 flush 분기 (Background Sync 부재 대응) | 6.7 · X-4 · 9.1 (ACE-2.1 재정의) | FR-108 | M |

### E19. Observability & Ops — 관측과 운영 (전 빌드 병행)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-110 | [Infra] | Observability | Vercel 로그 드레인 · 외부 보존소 연동 (감사 보존 기간 충족) | 10.3 · REQ-TEC-017 · D-TEC-3 | FR-003 | M |
| FR-111 | [Infra] | Observability | 규제·정합성·보안 이벤트 즉시 알림 라우팅 (30분 내 확인 SLA) | REQ-TEC-017 · REQ-NF-017 | FR-079, FR-041 | H |
| FR-112 | [Infra] | Observability | 배치 침묵 감지 — 주기 2배 초과 시 알림 | 11 분담 규칙 4 · REQ-TEC-010 | FR-078, FR-111 | M |
| FR-113 | [Infra] | Observability | 구간 계측 — 서버 실행 / DB / 재검증 / 렌더로 나눈 타이밍 수집 · 초과 구간 특정 | 8.1 · 8.2 · 8.4 조치 1 | FR-026, FR-016 | M |
| FR-114 | [Infra] | Observability | 예산 초과 보고 경로 — 초과 구간과 **성립 불가한 수용 기준**을 함께 보고 | 8.4 조치 4 · REQ-NF-001 · 002 | FR-113, FR-111 | M |

### E20. AI Ops Tool — 운영자 전용 AI (조건부 · `AI_ENABLED`)

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-115 | [Sec] | Ops Console | `(ops)` 라우트 그룹 · 운영자 역할 검사 · 아동/보호자 계정 진입 차단 | 3.2 · X-7 · REQ-AI-001 | FR-040 | M |
| FR-116 | [Infra] | AI | Vercel AI SDK 프로바이더 레지스트리 — `AI_MODEL_ID`·`AI_ENABLED` 환경 변수 교체 | 4.3 · REQ-AI-002 · C-TEC-006 | FR-004 | M |
| FR-117 | [Sec] | AI | 프롬프트 빌더 화이트리스트 — 갈래 코드·톤 지침·금지어·길이 제약만 | 4.3 · REQ-AI-003 · C-TEC-017 | FR-116 | M |
| FR-118 | [Feature/Command] | AI | `/api/ops/ai/retro-draft` — `generateObject` 스키마 검증 · 재시도 2회 · 월 호출 상한 | 6.1.2 · REQ-AI-005 | FR-117, FR-115 | H |
| FR-119 | [Feature/Command] | AI | `reviewState` 상태 기계 · `approveRetroSentenceDraft` (승인자·시각 기록) | 6.1.1 · REQ-AI-004 | FR-074, FR-118, FR-034 | M |
| FR-120 | [UI] | Ops Console | `(ops)` AI 초안 검토 · 문장 풀 잔여율 화면 | 3.2 · ACE-5.1 | FR-119 | M |

### E21. Verification Harness — 검증 설비 (릴리스 게이트 근거)

> §9.2의 신설 수용 기준 35건과 §9.3 릴리스 게이트 RG-T1~T4를 **실행 가능한 검증 자산**으로 만드는 태스크다.
> **개정 2.0의 성격 재정의** — 방법론 §6 조정 지침 4(*"개별 기능에 귀속되지 않는 검증 설비만 Step 4로"*)에 따라 두 갈래로 나눈다.
> **횡단 설비 5건**(`[Infra]` 4 · `[Sec]` 1 — FR-121·122·123·127·130)은 어느 기능에도 귀속되지 않으므로 여기 남는다.
> **기능 귀속 5건**(`[Test]` — FR-124·125·126·128·129)은 **하네스는 여기서 만들되 완료 판정은 해당 Feature 이슈가 진다** — GWT가 §8 배분표를 통해 그 이슈의 DoD로 들어간다.

| Task ID | 유형 | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|---|
| FR-121 | [Infra] | Verification | 게이트 7종 위반 주입 테스트 (7/7 빌드 실패 확인) | 9.2 AC-T11.1 · 9.3 RG-T1 | FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025 | H |
| FR-122 | [Sec] | Verification | RLS·권한 통합 테스트 — 타 보호자 0행 · `app`↔`pii` 조인 권한 실패 | 9.2 AC-T5.1 · T5.2 | FR-012, FR-014 | M |
| FR-123 | [Infra] | Verification | 동시성 부하 테스트 — 동일 키 10회 · 서로 다른 100건 · 동시 200 사용자 | 9.2 AC-T3.1 · T4.1 · T19.1 · 9.3 RG-T2 | FR-015, FR-026 | H |
| FR-124 | [Test] | Verification | 동의 게이트 E2E — 미완 접근 차단 · 철회 후 새로고침 즉시 차단 | 9.2 AC-T6.1 · T6.2 | FR-041, FR-042 | M |
| FR-125 | [Test] | Verification | 오프라인 E2E 2 OS — 3건 전부 반영 · ⭐ 중복 0건 · iOS 5초 이내 | 9.2 AC-T8.1 · T8.2 | FR-108, FR-109 | H |
| FR-126 | [Test] | Verification | 웹훅 테스트 — 서명 위조 401 · 재전송 중복 0건 · 실패 시 200+DLQ 재처리 | 9.2 AC-T18.1 · T18.2 · T18.3 | FR-067, FR-070, FR-100, FR-036 | M |
| FR-127 | [Infra] | Verification | 배치 테스트 — 하트비트 침묵 알림 · BAT-8 대량 데이터 완주 · 파티션 선행 생성 | 9.2 AC-T10.1 · T10.2 · T20.1 | FR-112, FR-087, FR-081 | M |
| FR-128 | [Test] | Verification | 채널 폴백·구독 만료 테스트 · 전달 시도 100% 확인 | 9.2 AC-T9.1 · 9.1 (AC-7.1 재정의) | FR-093, FR-097 | M |
| FR-129 | [Test] | Verification | AI 경계 테스트 — 페이로드 감사 · 승인 전 미배정 · 전면 장애 격리 | 9.2 AC-A1.2 · A3.2 · A4.1 · A5.1 | FR-118, FR-119 | M |
| FR-130 | [Infra] | Verification | 배포 환경 감사 — Preview 격리·비인증 차단 · 리전 일치 · 게이트 실행 로그 | 9.2 AC-T13.1 · T14.1 · T11.2 · 9.3 RG-T3 | FR-004, FR-018 | L |

---

## 4. 디자인 ↔ 개발 연계

> 두 관점을 분리해 추출했으므로 선행 관계도 각 표 안에서만 걸었다. 아래는 **화면 구현 태스크가 어느 디자인 산출물을 전제하는가**의 대응표이며, 착수 순서 조율에만 쓴다.

| 개발 태스크 | 전제 디자인 산출물 |
| --- | --- |
| FR-007 Tailwind·shadcn/ui 초기화 | UX-001 · UX-002 · UX-003 |
| FR-047 보호자 온보딩 화면 | UX-006 · UX-007 · UX-008 |
| FR-041 동의 게이트 차단 | UX-009 |
| FR-053 학습·퀴즈 화면 | UX-011 · UX-005 |
| FR-054 아동 온보딩 화면 | UX-010 |
| FR-060 승인 대기 화면 | UX-015 · UX-016 |
| FR-062 위시리스트 화면 | UX-021 |
| FR-064 아바타·옷장 화면 | UX-020 |
| FR-066 계획 카드 화면 | UX-017 |
| FR-077 두 갈래 회고 화면 | UX-018 |
| FR-102 · FR-103 성장 나무 | UX-012 · UX-013 |
| FR-104 월간 숲 | UX-014 · UX-022 |
| FR-105 소비 내역 | UX-019 |
| FR-106 PWA 셸 | UX-008 |
| FR-120 운영자 콘솔 | UX-023 |

---

## 5. 착수 차단 항목 — 태스크 이전에 답이 필요한 것

> §13.3 착수 전 확인 목록과 §14 미결 항목(D-TEC)에서 도출. **아래가 미해소인 상태로 착수하면 해당 태스크가 재작업 대상이 된다.**

| # | 확인 항목 | 차단되는 태스크 | 미해소 시 |
| --- | --- | --- | --- |
| **T-1** | 제휴사가 **고정 출구 IP**를 요구하는가 (C-TEC-015 · D-TEC-2) | FR-067 ~ FR-073 | B4 **완료**는 지연되나 **착수는 가능** — FR-036 웹훅 픽스처로 FR-068·069·070·126을 미해소 상태에서 진행 |
| **T-2** | 플랜이 **5분 Cron · 배포 보호 · 로그 보존**을 제공하는가 (D-TEC-3) | FR-004 · FR-098 · FR-110 | 프로브 주기 상향 또는 외부 수단 대체 |
| **T-3** | Prisma 버전이 **다중 스키마**를 지원하는가 (§6.2) | FR-008 · FR-011 · FR-014 | `pii` 분리 수단을 별도 DB 또는 뷰+권한으로 교체 |
| **T-4** | **`pg_cron` · `pg_net`** 활성화 가능한가 (D-TEC-7) | FR-081 ~ FR-090 · FR-079 | X-5 재개 — 배치 분담 전면 재설계 |
| **D-TEC-1** 🔴 | 해외 클라우드 이용이 **아동 개인정보 국외이전**에 해당하는가 (X-8 · 유일한 미해결 충돌) | *(전체 · 일반 공개 가부)* | **RG-T4 미통과 — 일반 공개 불가.** α·β는 고지·동의 하에 진행 |
| **D-TEC-6** | Gemini API의 **데이터 처리 조건** | FR-116 ~ FR-120 | `AI_ENABLED=false` 유지 — **기능 손실 0건** |
| **D-TEC-8** | **SMS 게이트웨이** 사업자·단가 | FR-094 | 폴백 채널 1종 부재 — AC-7.1(전달 시도 100%) 미성립 |
| **D-TEC-4** | Supabase **플랜 · 백업/PITR 보존 기간** | FR-002 · FR-006 | 아동 데이터 복구 요건 미충족 상태를 **명시**하고 진행 |
| **D-TEC-5** | iOS 사용자의 **PWA 설치 전환율** *(차단 아님 · 관측 항목)* | FR-093 · FR-094 원가 | SMS 폴백 비중 증가 — 원가(CON-RES-03)로 이전 |

---

## 6. 빌드 구획별 태스크 배치

> §13.2의 기술 선행 관계에 따른 배치. **B0은 별도 sp로 세지 않는다**(§13.1) — 승계 비기능 요구사항의 완료 조건을 물리적으로 성립시키는 작업이기 때문이다.

| 빌드 | 포함 태스크 | 건수 |
| --- | --- | :-: |
| **B0** 기반 설비 | FR-001 ~ FR-038 · FR-078 ~ FR-080 | 41 |
| **B1** 동의·계정 | FR-039 ~ FR-048 | 10 |
| **B2** 별·학습 | FR-049 ~ FR-054 | 6 |
| **B3** 실천·나무 | FR-055 ~ FR-064 · FR-106 ~ FR-109 | 14 |
| **B4** 소비 *(D1·D-TEC-2 종속)* | FR-065 ~ FR-073 | 9 |
| **B5** 대조·전달 | FR-074 ~ FR-077 · FR-081 ~ FR-105 | 29 |
| **B6** 계측 *(전 빌드 병행 · B0 마일스톤에 등록)* | FR-110 ~ FR-114 | 5 |
| **조건부** AI 도구 | FR-115 ~ FR-120 | 6 |
| **검증** *(릴리스 게이트 근거)* | FR-121 ~ FR-130 | 10 |
| | **합계** | **130** |

> **B6을 별도 행으로 뺀 이유** — 개정 1.0은 B6을 *"각 빌드에 포함"* 으로 두어 건수를 세지 않았고, 그 결과 관측 3건이 배치표 합계에서 새어 나갔다(113/116). 계측은 **전 빌드에 병행**하되 **마일스톤은 B0에 등록**해 배정에서 빠지지 않게 한다.
> **Mock 3건의 위치** — FR-036은 FR-067·FR-126의 선행이지만, **FR-037·FR-038은 어떤 태스크의 선행도 아니다.** 이 둘은 완료 조건이 아니라 **착수 해제 수단**이기 때문이다 — 없어도 완료할 수 있고, 있으면 외부·배치를 기다리지 않고 시작할 수 있다.

---

## 7. 임계 경로

```
FR-001 → FR-008 → FR-011 → FR-012 → FR-013 → FR-026 → FR-033 → FR-049 → FR-056 → FR-069 → FR-075
  프로젝트   스키마    롤 분리   RLS      래퍼   Action골격  보상계약  별지급   미션승인   결제매칭   회고
```

| 지점 | 밀리면 함께 밀리는 것 |
| --- | --- |
| **FR-008 Prisma 스키마** | E2 이후 **전 태스크** |
| **FR-012 RLS 정책** | 요청 경로 전체 — *"RLS는 마지막에 켤 수 없다"*(§13.1) |
| **FR-015 원자 기입 SQL** | FR-049 · 056 · 061 · 063 · 075 — 별이 걸린 전 기능 |
| **FR-026 Action 공통 골격** | 모든 쓰기 태스크 — 첫 Action이 래퍼 없이 작성되면 나머지가 따라간다(§13.1) |
| **FR-018 게이트 러너** | 첫 커밋부터 켜져 있어야 위반이 쌓이지 않는다(§13.1) |
| **FR-067 웹훅 공통** *(외부 종속)* | E11 전체 + FR-075 회고 + FR-090 · FR-105 소비 집계. **FR-036 픽스처가 있으면 D-TEC-2 미해소 상태에서도 착수된다** |
| **FR-030 ~ FR-035 도메인 계약** | 소비 액션 19건 — 계약이 흔들리면 그 도메인의 Command·화면이 함께 흔들린다 |

---

## 8. AC ↔ 태스크 배분표 — 84건 전건

> **이 표가 있는 이유** — 방법론 Step 3의 완료 판정은 *"AC 전건이 ① 어느 Feature의 DoD에 들어갔거나 ② `[Test]` 이슈로 변환되었다. 어느 쪽에도 없는 AC가 0건"* 이다.
> 개정 1.0은 이 대응을 문서에 두지 않아 **84건 중 39건이 어느 태스크에도 인용되지 않은 상태**였다. 이 표가 없으면 이슈 본문 130건을 쓰는 동안 매번 두 SRS를 재탐색해야 하고, 탐색이 빠진 AC는 릴리스 게이트에서야 드러난다.

### 8.1 배분 유형 — 3종

방법론은 ①DoD ②`[Test]` 두 갈래를 제시하지만, 이 명세의 AC에는 **코드로 판정할 수 없는 것**이 섞여 있다. 인터뷰 rubric(n=8)과 운영 1개월 집계가 그것이다. 이를 억지로 테스트로 바꾸면 *"테스트가 있는데 통과 여부를 아무도 모르는"* 상태가 되므로 갈래를 하나 더 둔다.

| 유형 | 뜻 | 판정 시점 | 건수 |
| :-: | --- | --- | :-: |
| **D** | 해당 Feature·UI 이슈의 **DoD 체크리스트로 흡수** — 단위 테스트·화면 검수로 판정 | 이슈 완료 시 | **37** |
| **T** | **`[Test]`·`[Infra]` 검증 설비**로 변환 — 부하·위반 주입·E2E·감사 | 릴리스 게이트 | **35** |
| **M** | **계측만 확보**하고 판정은 운영·리서치 단계 — 인터뷰 rubric · 운영 집계 | α·β 이후 | **12** |
| | | **합계** | **84** |

> **M을 「미배분」과 혼동하지 않는다** — M도 귀속 태스크가 있다. 그 태스크의 DoD는 *"판정에 필요한 이벤트·화면이 존재하는가"* 이지 *"임계치를 넘었는가"* 가 아니다. 임계치 판정을 빌드 완료 조건으로 걸면 **통과할 수 없는 DoD**가 된다.

### 8.2 배분표

| AC | 대상 요구사항 | 판정 내용 | 유형 | 귀속 태스크 |
| --- | --- | --- | :-: | --- |
| `AC-1.1` | FUNC-001·009 | 나무 5초 노출 후 「행동이 어떻게 달라졌나」 회상 ≥ 6/8 | **M** | FR-102 · UX-012 |
| `AC-1.2` | FUNC-001 | 개입 0회로 「실천」 도달 ≥ 6/8 — 「퀴즈」만 나오면 실패 | **M** | FR-102 · UX-012 |
| `AC-1.3` | FUNC-009 | 월간 숲 60초 내 3개 지목 ≥ 6/8 · 확인 중위 ≤ 3분 | **M** | FR-104 · UX-014 |
| `AC-1.4` | FUNC-009 | 잔액 0이어도 「이번 달 획득 별」이 스크롤 없이 노출 | **D** | FR-104 · UX-014 |
| `AC-2.1` | FUNC-004 | 첫 실천 ⭐·진행도 동일 세션 반영 · 7일 내 인정률 ≥ 60% | **M** | FR-049 · FR-054 |
| `AC-2.2` | FUNC-001 | 학습 초과 충족해도 미승급 · 「실천 N회 남음」 명시 | **D** | FR-029 · FR-103 |
| `AC-2.3` | FUNC-001 | 4영역 중 2영역 이상 성장 ≥ 50% · 전 영역 정체 ≤ 15% | **M** | FR-086 |
| `AC-2.4` | FUNC-003 | 「불리기」 닫힘 → 「곧 열려요」 안내 · 결함 오인 방지 | **D** | FR-053 · UX-022 |
| `AC-3.1` | FUNC-001 | 14일 정체 시 원인 조건 단위 표시 · 열람률 ≥ 60% | **D** | FR-103 *(열람률 FR-086)* |
| `AC-3.2` | FUNC-001 | 오귀인 발화 ≤ 2/8 · 앱 불신 발화 ≤ 2/8 | **M** | FR-103 · UX-013 |
| `AC-3.3` | FUNC-001 | 정체 계정의 익주 재방문율 ≥ 50% | **M** | FR-086 |
| `AC-4.1` | FUNC-008 | 계획 카드 저장 · 업종이 카드 승인 업종 코드와 대조 가능 | **D** | FR-065 |
| `AC-4.2` | FUNC-008 | 결제 자동 매칭 정확도 ≥ 90% (표본 50건 수동 대조) | **T** | FR-069 · FR-126 |
| `AC-4.3` | FUNC-008 | 계획 카드 없는 결제 → 작성 유도 · ⭐ 미지급 | **D** | FR-069 · FR-066 |
| `AC-4.4` | FUNC-008 | *(생존 조건)* 카드 결제 대비 계획 카드 작성률 ≥ 50% | **M** | FR-086 |
| `AC-5.1` | FUNC-008 | 비복원 추출 — 동일 회고 문장 재노출률 ≤ 2/8 | **D** | FR-074 |
| `AC-5.2` | FUNC-008 | 회고 체류 중위 ≥ 3초 · 1초 미만 ≤ 20% | **M** | FR-075 |
| `AC-5.3` | FUNC-008 | *(갈래 A)* 결제 ≤ 계획 → ⭐1 · `plan_met=true` | **D** | FR-075 |
| `AC-5.4` | FUNC-008 | *(갈래 B)* 결제 > 계획 → ⭐ 미지급 · **보유 별 차감 없음** | **D** | FR-075 |
| `AC-5.5` | FUNC-008 | *(갈래 B 이탈 감시)* 회고 열람률이 준수 건 대비 ≥ 70% | **M** | FR-086 |
| `AC-5.6` | FUNC-008 | 갈래별 회고 문장 구별 — 화면만 보고 구분 ≥ 6/8 | **M** | FR-077 · UX-018 |
| `AC-6.1` | FUNC-010 | 미승인 48h 후 승인 → 완료 시점 소급 · 성공률 100% | **D** | FR-056 |
| `AC-6.2` | FUNC-010 | 「승인 대기 N건」 표시 — 「안 했구나」 반대 결론 차단 | **D** | FR-059 · FR-102 |
| `AC-6.3` | FUNC-010 | 「대기 중」이 「미실천」과 시각적으로 구별(색·문구) | **D** | FR-059 · UX-016 |
| `AC-7.1` | FUNC-011 | 72h 미접속 발송 — **본 문서 §9.1에서 「전달 시도 100%」로 재정의** | **T** | FR-093 · FR-128 |
| `AC-7.2` | FUNC-011 | 알림에 아동이 멈춘 지점(영역·조건)이 함께 표시 | **D** | FR-097 |
| `AC-7.3` | FUNC-011 | 발송 시간대 조정 가능 · 열람률 ≥ 50% | **D** | FR-091 |
| `AC-8.1` | FUNC-007 | 2단계까지 후 재진입 → 직전 단계 재개 · 재입력 0건 | **D** | FR-044 · FR-047 |
| `AC-8.2` | FUNC-007·015 | 카드 배송 대기 중에도 학습·퀴즈·별 획득 가능 | **D** | FR-073 |
| `AC-8.3` | FUNC-007 | 온보딩 총 소요 중위 ≤ 10분 · 3단계 이탈률 ≤ 30% | **M** | FR-086 |
| `ACE-1.1` | FUNC-001 | 실천 0건 → 「아직 기록이 없어요」 · 결함 인식 ≤ 2/8 | **D** | FR-102 · UX-022 |
| `ACE-1.2` | FUNC-009 | 전월 없음 → 대체 문구 · **델타 0으로 렌더 금지** | **D** | FR-104 · UX-022 |
| `ACE-2.1` | NF-003 | 오프라인 ⭐중복 0 · `client_ts` 귀속 — **§9.1에서 iOS ≤ 5초로 재정의** | **T** | FR-108 · FR-125 |
| `ACE-2.2` | FUNC-004 | 동일 미션 2회 승인 → ⭐ 1회 · 원장 불일치 0건 | **T** | FR-056 · FR-123 |
| `ACE-2.3` | FUNC-001 | 실천 충족·학습 미충족 → 미승급 · 남은 조건 각각 표시 | **D** | FR-029 · FR-103 |
| `ACE-3.1` | FUNC-001 | 미충족 조건 전부 표시 · 가장 적게 남은 조건 최상단 | **D** | FR-103 · UX-013 |
| `ACE-3.2` | FUNC-001 | 주기 초기화 직후는 「정체」로 표시하지 않음 · 오탐 0건 | **D** | FR-082 |
| `ACE-4.1` | FUNC-008 | 한 계획에 복수 결제 → **합계로 판정** · 업종별 내역 나열 | **D** | FR-069 |
| `ACE-4.2` | FUNC-008 | 다른 업종 결제(금액 이내) → ⭐1 · 「업종 다름」 갈래 분기 | **D** | FR-069 · FR-075 |
| `ACE-5.1` | FUNC-008 | 문장 풀 잔여 ≤ 20% → 운영 알림 · 재사용 전 풀 확장 요구 | **D** | FR-089 |
| `ACE-5.2` | FUNC-008 | 미완 회고 큐 순차 제시 · 3건 초과 시 「요약 회고」 병합 | **D** | FR-076 |
| `ACE-6.1` | FUNC-002 | 거절 → ⭐ 미지급 · 사유 표시 · 「미실천」과 구별 · 미가산 | **D** | FR-057 · FR-059 |
| `ACE-6.2` | FUNC-010 | 주기 종료 후 승인 → ⭐ 지급하되 **조건은 완료 시점 주기 귀속** | **D** | FR-056 · FR-087 |
| `ACE-6.3` | FUNC-010 | 5건 이상 누적 → 일괄 승인 · 건별 완료 시각 기준 개별 소급 | **D** | FR-058 · FR-059 |
| `ACE-7.1` | FUNC-011 | 푸시 차단 → 배너 + (동의 시)문자 · 차단 상태 별도 집계 | **D** | FR-093 |
| `ACE-7.2` | FUNC-011 | 앱 삭제 → 「재설치 안내」 분기 · **다른 이벤트 코드** 적재 | **D** | FR-095 |
| `ACE-7.3` | FUNC-011 | 71시간 시점 재접속 → 미발송 · **오탐 발송 0건** | **D** | FR-097 |
| `ACE-8.1` | FUNC-007 | 카드 신청 외부 API 실패 → 입력값 24h 보존 · 사유 사용자 언어 | **D** | FR-046 · UX-007 |
| `ACE-8.2` | NF-008 | 온보딩 세션 만료 → 직전 단계 재개 · **동의는 재확인**(캐시 금지) | **D** | FR-042 · FR-044 |
| `AC-T1.1` | TEC-001 | `(child)` 밖 아동 화면 → 게이트 G3 빌드 실패 | **T** | FR-021 · FR-121 |
| `AC-T2.1` | TEC-002 | Client에서 `@/db/request` import → 빌드 실패 · 위반 위치 출력 | **T** | FR-021 · FR-121 |
| `AC-T3.1` | TEC-003 | 동일 멱등 키 10회 동시 → `star_ledger` 1건 · 반환 동일 | **T** | FR-015 · FR-123 |
| `AC-T3.2` | TEC-003 | `idempotencyKey` 없는 Action 추가 → 게이트 G4 빌드 실패 | **T** | FR-022 · FR-121 |
| `AC-T4.1` | TEC-004 | 동시 200명 10분 → 커넥션 고갈 0건 · p95 예산 이내 | **T** | FR-009 · FR-123 |
| `AC-T5.1` | TEC-005 | 타 보호자 `child_id` 조회 → **0행**(예외 아님) | **T** | FR-012 · FR-122 |
| `AC-T5.2` | TEC-005 | `app`↔`pii` 조인을 요청 롤로 실행 → 권한 오류로 실패 | **T** | FR-011 · FR-014 · FR-122 |
| `AC-T6.1` | TEC-006 | 동의 미완 세션의 `/learn` 직접 접근 → 차단 + 적재 + 즉시 알림 | **T** | FR-041 · FR-124 |
| `AC-T6.2` | TEC-006 | 동의 철회 후 새로고침 → 즉시 차단 · 캐시 응답 반환 금지 | **T** | FR-041 · FR-124 |
| `AC-T7.1` | TEC-007 | 아동 자격증명 저장 필드 0건 · 아동 독립 로그인 시도 0건 | **D** | FR-039 · FR-084 |
| `AC-T8.1` | TEC-008 | 기내 모드 실천 3건 → 전부 반영 · ⭐ 중복 0 · `client_ts` 귀속 | **T** | FR-108 · FR-125 |
| `AC-T8.2` | TEC-008 | iOS 백그라운드 재연결 → 큐 유지 · 포그라운드 5초 이내 반영 | **T** | FR-109 · FR-125 |
| `AC-T9.1` | TEC-009 | 만료 구독 404·410 → 구독 폐기 후 폴백 · 시도 기록 | **T** | FR-092 · FR-128 |
| `AC-T10.1` | TEC-010 | 배치 1건 중단 → 주기 2배 시각에 알림 | **T** | FR-112 · FR-127 |
| `AC-T10.2` | TEC-010 | 아동 10,000명 BAT-8 → `pg_cron` 완주 · 함수 시간 초과 0건 | **T** | FR-087 · FR-127 |
| `AC-T11.1` | TEC-011 | 게이트 7종 위반 코드 → **7/7 빌드 실패** | **T** | FR-121 |
| `AC-T11.2` | TEC-011 | 모든 배포 로그에 게이트 실행 줄 존재 — 없으면 롤백 | **T** | FR-018 · FR-130 |
| `AC-T12.1` | TEC-012 | 새 CSS 파일·인라인 `style` 추가 → 빌드 실패 | **T** | FR-023 · FR-121 |
| `AC-T13.1` | TEC-013 | 배포 후 함수·DB 리전 `icn1` · `ap-northeast-2` 일치 | **T** | FR-130 |
| `AC-T14.1` | TEC-014 | Preview 비인증 접근 불가 · Preview가 운영 DB를 가리키지 않음 | **T** | FR-004 · FR-130 |
| `AC-T15.1` | TEC-015 | `DROP COLUMN` 포함 마이그레이션 → G7 빌드 실패 + 분할 지침 | **T** | FR-025 · FR-121 |
| `AC-T16.1` | TEC-016 | ⭐ 지급~화면 반영 p95 ≤ 800ms · 무효화 태그가 아동 범위 한정 | **D** | FR-028 · FR-113 |
| `AC-T17.1` | TEC-017 | 원장 불일치 주입 → BAT-3 즉시 알림 · 온콜 30분 내 확인 기록 | **D** | FR-083 · FR-111 |
| `AC-T18.1` | TEC-018 | 서명 위조 웹훅 → 적재 0건 · **401** 반환 | **T** | FR-067 · FR-126 |
| `AC-T18.2` | TEC-018 | 동일 거래 재전송 3회 → `spending_records` 1건 · 회고 큐 1건 | **T** | FR-068 · FR-126 |
| `AC-T18.3` | TEC-018 | 매칭 실패 웹훅 → **200 + DLQ** 적재 · 재처리 배치가 성공시킴 | **T** | FR-070 · FR-100 · FR-126 |
| `AC-T19.1` | TEC-019 | 서로 다른 지급 100건 동시 → `balance_after` 1..100 단조 증가 | **T** | FR-015 · FR-123 |
| `AC-T20.1` | TEC-020 | 주 경계 시 선행 생성된 파티션에 적재 · 유실 0건 | **T** | FR-081 · FR-127 |
| `AC-A1.1` | AI-001 | `(child)`에서 AI SDK import → 게이트 G6 빌드 실패 | **T** | FR-024 · FR-121 |
| `AC-A1.2` | AI-001 | 아동·보호자 요청 중 외부 AI 호출을 기다린 요청 **0건** | **T** | FR-115 · FR-129 |
| `AC-A2.1` | AI-002 | `AI_MODEL_ID` 교체 → **코드 변경 0줄**로 초안 생성 성공 | **D** | FR-116 |
| `AC-A3.1` | AI-003 | 프롬프트에 금지 변수 삽입 → 빌드 실패 + 허용 목록 출력 | **T** | FR-024 · FR-117 · FR-121 |
| `AC-A3.2` | AI-003 | 발신 페이로드에 아동 식별정보·금액·가맹점명 **0건** | **T** | FR-117 · FR-129 |
| `AC-A4.1` | AI-004 | 승인 전 초안은 아동 회고에 **배정되지 않음**(0건) | **T** | FR-119 · FR-129 |
| `AC-A5.1` | AI-005 | Gemini 전면 장애 → 어떤 화면도 저하 없음 · 가용성 지표 미반영 | **T** | FR-118 · FR-129 |

**미배분 0건** — 기준 SRS 49건(정상 30 · 예외 19) + 본 문서 신설 35건 = **84건 전건이 위 표에 있다.**

---

## 9. 개정 1.0 → 2.0 ID 대응

> 신설 14건이 **빌드 순서상 제자리**에 들어가야 *"선행 태스크는 항상 자기보다 작은 번호"* 가 유지되므로, 기존 116건의 번호를 뒤로 밀었다. **기존 태스크의 내용은 바뀌지 않았다** — 번호만 이동했다.
> 아직 GitHub 이슈를 생성하지 않은 시점이라 외부 참조는 없다. 이슈화 이후에는 이런 이동이 불가능하므로 **재번호는 지금이 마지막 기회**다.

| 개정 1.0 | 이동 | 개정 2.0 |
| --- | :-: | --- |
| `FR-001` ~ `FR-029` | +0 | `FR-001` ~ `FR-029` |
| `FR-030` ~ `FR-049` | +9 | `FR-039` ~ `FR-058` |
| `FR-050` ~ `FR-065` | +10 | `FR-060` ~ `FR-075` |
| `FR-066` ~ `FR-089` | +11 | `FR-077` ~ `FR-100` |
| `FR-090` ~ `FR-100` | +12 | `FR-102` ~ `FR-112` |
| `FR-101` ~ `FR-116` | +14 | `FR-115` ~ `FR-130` |

`UX-001` ~ `UX-023`은 **변경 없다.**

### 9.1 신설 14건

| 신 ID | 유형 | 무엇인가 | 근거 |
| --- | --- | --- | --- |
| `FR-030`~`FR-035` | `[Contract]` | 도메인 계약 6종 — Server Action 20종의 입력 스키마·반환 타입·실패 분기 | 방법론 Step 1 · 보고서 수정 여지 #2 |
| `FR-036`~`FR-038` | `[Mock]` | 웹훅 픽스처 · 화면 시드 · 배치 산출값 스텁 | 방법론 Step 1 완료 판정 · #3 |
| `FR-059` | `[Feature/Query]` | 승인 대기 조회 — FR-060 화면에서 분리 | 방법론 Step 2 · #5 |
| `FR-076` | `[Feature/Query]` | 미완 회고 큐·병합 조회 — FR-077 화면에서 분리 | 방법론 Step 2 · #5 |
| `FR-101` | `[Feature/Query]` | 성장 나무 병렬 4쿼리 — FR-102 화면에서 분리 | 방법론 Step 2 · #5 |
| `FR-113`~`FR-114` | `[Infra]` | 구간 계측 · 예산 초과 보고 경로 | SRS §8.4 조치 1·4 · #7 |

> **분할하지 않은 화면 14건** — 방법론 §6 조정 지침 3에 따라 *"조회가 있는가"* 가 아니라 *"담당자와 검증 방식이 다른가"* 로 판정했다. 월간 숲·소비 내역은 배치 산출물을 그대로 읽고, 나머지는 게이트·셸 성격이어서 나누면 태스크 수만 는다.

---

*근거 문서: `SRS_finfriends-nextjs-v1_0.md` (SRS-FINFRIENDS-NEXTJS-001 · 개정 1.0) · `SRS_finfriends-v1_0.md` (SRS-FINFRIENDS-MVP-001)*
*개정 근거: `REPORT_task-extraction-review.md` §4 Stage 0 — `METHODOLOGY_task-extraction.md` 4단계 대조 결과 반영*
