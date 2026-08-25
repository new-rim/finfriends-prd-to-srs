# [태스크 리스트] FinFriends — Next.js 기술 제약 반영판

**문서 ID:** TASKS-FINFRIENDS-NEXTJS-001
**개정 버전:** 1.0
**기준 문서:** `SRS_finfriends-nextjs-v1_0.md` (SRS-FINFRIENDS-NEXTJS-001 · 개정 1.0)
**상위 문서:** `SRS_finfriends-v1_0.md` (SRS-FINFRIENDS-MVP-001)

---

## 0. 이 문서의 작성 규칙

| 항목 | 규칙 |
| --- | --- |
| **도출 원칙** | SRS에 **명시된 것만** 태스크화한다. 문서에 없는 기능은 추가하지 않았다 |
| **관점 분리** | **UI/UX 디자인(`UX-*`)** 과 **개발·인프라(`FR-*`)** 를 별도 표로 분리한다 (§3 · §4) |
| **ID 체계** | `UX-###` 디자인 산출물 · `FR-###` 개발 태스크. 번호는 **빌드 순서(§13)를 따르며, 선행 태스크는 항상 자기보다 작은 번호**를 가리킨다 |
| **복잡도** | **H** = 아키텍처 결정·동시성·규제 강제·외부 연동 / **M** = 표준 구현 + 검증 / **L** = 설정·스크립트 |
| **관련 SRS 섹션** | 본 문서(NEXTJS-001) 기준. 승계 요구사항은 `REQ-FUNC-*` · `REQ-NF-*`, 신설은 `REQ-TEC-*` · `REQ-AI-*`로 병기 |

### 요약

| 구분 | 건수 | 복잡도 H / M / L |
| --- | :-: | :-: |
| **UI/UX 디자인** (`UX-*`) — 13개 도메인 | **23** | 5 / 18 / 0 |
| **개발·인프라** (`FR-*`) — Epic 20구획 · 33개 도메인 | **116** | 32 / 81 / 3 |
| **합계** | **139** | 37 / 99 / 3 |

### 범위 제외 — 태스크화하지 않은 것 (SRS의 배분 결정에 따름)

| 항목 | 근거 |
| --- | --- |
| REQ-FUNC-014 예적금 비교·선택 | 기준 SRS §13.2 — **R2 배분** · D2 법률 검토 통과 전 착수 불가 |
| REQ-FUNC-016 별의 옷장 외 목적지 | 기준 SRS §13.2 — **R2+ 배분** · 현금 분리선 재검토 전 착수 불가 |
| REQ-FUNC-017 기존 앱 기록 이전 | 기준 SRS §13.2 — **미배분(Won't)** · 부재를 문구로 처리 |
| 네이티브 앱 · 별도 백엔드 · 별도 CI/CD · 자체 AI 서버 | §1.2 범위 제외 (C-TEC-001 · 002 · 005 · 007) |
| 소비 순간 자동 개입 · 위치정보 수집 | 기준 SRS ADR-002 · CON-REG-03 — **영구 제외** |

---

## 1. UI/UX 디자인 태스크

> 근거 — §6.8 UI 규약 · 화면↔컴포넌트 대응표 · §3.2 라우트 그룹 구조.
> 이 표의 선행 관계는 **디자인 산출물 사이의 관계**이며, 개발 태스크와의 연결은 §3에 별도 표로 둔다.

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| UX-001 | Design System | 디자인 토큰 정의 — 색·간격·라운드·타이포 CSS 변수 | 6.8 UI 규약 · C-TEC-004 | None | M |
| UX-002 | Design System | 아동/보호자 테마 분기 — 변수로만 분기하는 규칙 | 6.8 UI 규약 | UX-001 | M |
| UX-003 | Design System | shadcn/ui 컴포넌트 목록 확정 및 커스터마이즈 규약 | 6.8 화면↔컴포넌트 대응 | UX-001 | M |
| UX-004 | Design System | 접근성 기준 — 아동 화면 터치 타깃 ≥ 44px · 대비 4.5:1 | 6.8 접근성 | UX-003 | M |
| UX-005 | Design System | 아동용 알기 쉬운 문구 체계 — 4영역 명칭 동일 + 한 줄 설명 | CON-REG-02 · REQ-NF-014 | None | M |
| UX-006 | Onboarding | 보호자 온보딩 5단계 플로우 · Stepper · 재개 상태 표기 | 6.8 · REQ-FUNC-007 | UX-003 | H |
| UX-007 | Onboarding | 외부 API 실패 사유 화면 — 사용자 언어 표기 | 3.4 · ACE-8.1 | UX-006 | M |
| UX-008 | Onboarding | PWA 설치 유도 배너 (온보딩 5단계) · 앱 아이콘 · 스플래시 | 6.7 · X-3 | UX-006 | M |
| UX-009 | Consent | 동의 게이트 차단 화면 | 3.3 동의 게이트 | UX-003 | M |
| UX-010 | Child Onboarding | 아동 온보딩 — 첫 보상 루프 5분 이내 구성 | REQ-FUNC-006 | UX-002, UX-005 | H |
| UX-011 | Learning | 아동 학습·퀴즈 화면 — Card · RadioGroup · Progress | 6.8 · REQ-FUNC-003 | UX-002, UX-005 | M |
| UX-012 | Growth Tree | 성장 나무 — Card · Progress · Accordion · Badge(승인 대기 N건) | 6.8 · REQ-FUNC-001 · 010 | UX-003 | H |
| UX-013 | Growth Tree | 정체 원인 표시 — 미충족 조건 전부 · 가장 적게 남은 조건 최상단 | REQ-FUNC-001 · ACE-3.1 | UX-012 | H |
| UX-014 | Growth Forest | 월간 숲 — Card · Tabs(월 선택) · Alert(전월 없음 대체 문구) | 6.8 · REQ-FUNC-009 · ACE-1.2 | UX-003 | M |
| UX-015 | Approvals | 승인 대기 — Table · Dialog(거절 사유) · Checkbox(일괄 승인) | 6.8 · REQ-FUNC-002 · ACE-6.3 | UX-003 | M |
| UX-016 | Approvals | 대기 / 거절 / 미실천 시각 구별 규칙 | ACE-6.1 · AC-6.3 | UX-015 | M |
| UX-017 | Plan & Retro | 계획 카드 — Form · Select(업종) · Input(금액) | 6.8 · REQ-FUNC-008 | UX-003 | M |
| UX-018 | Plan & Retro | 두 갈래 회고 — Alert 갈래별 색 분기 · 화면만으로 구별 가능 | 6.8 · AC-5.3 · 5.4 · 5.6 | UX-017 | H |
| UX-019 | Spending | 소비 내역 — 전월 대비 증감액 상단 배치 · 업종별 집계 | REQ-FUNC-013 | UX-003 | M |
| UX-020 | Reward | 아바타·옷장 화면 · 별 잔액 표기 | REQ-FUNC-005 | UX-002 | M |
| UX-021 | Reward | 위시리스트 — 30·70·100% 단계 보상 표기 | REQ-FUNC-012 | UX-002 | M |
| UX-022 | Empty State | 빈 상태 3종 — 실천 0건 · 전월 데이터 없음 · 「불리기 곧 열려요」 | ACE-1.1 · ACE-1.2 · AC-2.4 | UX-012, UX-014 | M |
| UX-023 | Ops Console | 운영자 도구 화면 — AI 초안 검토·승인 · 문장 풀 잔여율 | 3.2 (ops) · REQ-AI-004 | UX-003 | M |

---

## 2. 개발·인프라 태스크

### E1. Platform & Infra — 기반 설비 (B0)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-001 | Platform | Next.js App Router 프로젝트 초기화 · 라우트 그룹 스캐폴딩 | 3.2 라우트 그룹 · X-1 · REQ-TEC-001 | None | M |
| FR-002 | Platform | Supabase 프로젝트 생성 · 리전 `ap-northeast-2` 고정 · `pg_cron`·`pg_net` 활성화 | 10.3 · 11 · REQ-TEC-013 · D-TEC-7 | None | M |
| FR-003 | Platform | Vercel 프로젝트 연결 · 함수 리전 `icn1` 고정 · Git Push 배포 구성 | 10.4 배포 절차 · REQ-TEC-013 | FR-001 | M |
| FR-004 | Platform | 환경 변수 스코프 분리 · Preview 전용 Supabase 프로젝트 · 배포 보호 | 10.2 환경 변수 · REQ-TEC-014 | FR-002, FR-003 | H |
| FR-005 | Platform | 의존성 버전 고정 정책 반영 (`package.json` ↔ §10.1 표 동기) | 10.1 버전 고정 | FR-001 | L |
| FR-006 | Platform | 로컬 개발 환경 — 로컬 Supabase · 풀러 모드 검증 · 합성 시드 | 10.5 로컬 개발 환경 | FR-002 | M |
| FR-007 | Platform | Tailwind · shadcn/ui 초기화 · `globals.css` 단일 진입점 | 6.8 UI 규약 · C-TEC-004 · C-TEC-018 | FR-001 | M |

### E2. DB Schema & Data Access — 데이터 계층 (B0)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-008 | DB Schema | Prisma 스키마 정의 — `app`·`pii` 다중 스키마 · 모델 전수 | 6.2 데이터 모델 | FR-002 | H |
| FR-009 | DB Schema | Supavisor transaction 모드 접속 구성 · 부팅 시 접속 문자열 assert | 6.2 · REQ-TEC-004 · C-TEC-011 | FR-008 | M |
| FR-010 | DB Access | Prisma 2클라이언트 분리 — `db/request.ts` · `db/batch.ts` | 6.3 · REQ-TEC-005 · C-TEC-012 | FR-009 | M |
| FR-011 | DB Access | DB 롤 분리 (`app_request`·`app_batch`) · `pii` 스키마 권한 회수 | 6.3 규칙 4 · REQ-NF-009 | FR-008 | H |
| FR-012 | DB Access | RLS 정책 전수 작성 · `is_own_child` SECURITY DEFINER 헬퍼 | 6.3 RLS 2계층 · REQ-TEC-005 | FR-011 | H |
| FR-013 | DB Access | `withGuardian()` 트랜잭션 래퍼 — 보호자 id를 세션에서만 취득 | 6.3 · 6.4 | FR-010, FR-012 | M |
| FR-014 | DB Access | `pii` 접근 함수 3종 — `upsert_identity`·`get_identity_ref`·`verify_owner` | 6.3 규칙 4 | FR-011 | M |
| FR-015 | Star Ledger | 별 원장 원자 기입 SQL — advisory lock + 단일 INSERT + `UNIQUE(idempotency_key)` | 6.5 동시성 · X-6 · REQ-TEC-019 · REQ-NF-006 | FR-008 | H |
| FR-016 | Event | `app_events` 주차 파티셔닝 · 적재 유틸 · 필수 필드 `NOT NULL` | 6.2 · REQ-TEC-020 · CON-ARC-07 | FR-008 | H |
| FR-017 | DB Schema | expand-contract 마이그레이션 절차 수립 — 최소 2배포 분할 | 10.4 · REQ-TEC-015 · CON-TEC-01 | FR-008 | M |

### E3. Build Gate — `prebuild` 게이트 (B0)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-018 | Build Gate | 게이트 러너 — `prebuild`·`build` 이중 호출 · 실행 로그 출력 | 6.6 · REQ-TEC-011 · X-2 | FR-001 | M |
| FR-019 | Build Gate | G1 별↔저금통 전환 경로 검사 | 6.6 · 11 (BAT-5) · REQ-NF-010 · CON-REG-05 | FR-018 | M |
| FR-020 | Build Gate | G2 금지 필드 스캔 — 좌표·얼굴 필드 | 6.6 · 11 (BAT-4b) · REQ-NF-009 · CON-REG-03 · 06 | FR-018, FR-008 | M |
| FR-021 | Build Gate | G3 런타임 경계 import 그래프 검사 | 6.6 · REQ-TEC-002 · C-TEC-009 | FR-018, FR-010 | H |
| FR-022 | Build Gate | G4 Server Action 계약 검사 — `idempotencyKey` · zod 스키마 | 6.6 · REQ-TEC-003 | FR-018 | M |
| FR-023 | Build Gate | G5 스타일 단일 경로 검사 — CSS 파일·CSS-in-JS·인라인 style | 6.6 · REQ-TEC-012 | FR-018, FR-007 | L |
| FR-024 | Build Gate | G6 AI 경계 검사 — SDK import 경로 · 프롬프트 변수 화이트리스트 | 6.6 · REQ-AI-001 · 003 · C-TEC-017 | FR-018 | M |
| FR-025 | Build Gate | G7 마이그레이션 파괴적 DDL 검사 | 6.6 · REQ-TEC-015 | FR-018, FR-017 | M |

### E4. Server Runtime & Domain — 실행 규칙 (B0)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-026 | Server Runtime | Server Action 공통 골격 — 입력 검증·동의 재확인·원자 기입·계측·선택 재검증 | 6.4 서버 경계 실행 규칙 | FR-013, FR-015, FR-016 | H |
| FR-027 | Server Runtime | 멱등 키 발급·전달 클라이언트 유틸 (UUIDv7) | 6.4 · REQ-TEC-003 · C-TEC-010 | FR-001 | M |
| FR-028 | Server Runtime | 캐시·재검증 태그 상수 모듈 · `noStore` 규약 | 6.4 캐시 규약 · REQ-TEC-016 | FR-026 | M |
| FR-029 | Domain | `domain/` 순수 판정 함수 모듈 — 나무 승급·정체·계획 대조·WPA 카운트 | 3.2 (`domain/` 분리 근거) | FR-008 | H |

### E5. Auth & Consent — 인증과 동의 게이트 (B1)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-030 | Auth | Supabase Auth 보호자 연결 — 아동 자격증명 필드 부재 | 3.3 · REQ-TEC-007 · CON-DEV-03 | FR-002, FR-008 | M |
| FR-031 | Auth | `middleware.ts` — 세션 쿠키 서명·만료 검증 · 라우트 그룹 분기 | 3.1 경계 ② · 3.3 | FR-030 | M |
| FR-032 | Consent Gate | `(child)/layout.tsx` 확정 판정 — `noStore()` · `consent_gate_blocked` 적재 | 3.3 · REQ-TEC-006 · REQ-NF-008 | FR-031, FR-016 | H |
| FR-033 | Consent Gate | Server Action 래퍼 동의 재확인 (`assertConsentCompleted`) | 3.3 · 6.4 ② | FR-026, FR-032 | M |
| FR-034 | Auth | `selectChildProfile` — 아동 프로필 선택 서명 쿠키 | 6.1.1 · CON-DEV-03 | FR-030 | M |

### E6. Guardian Onboarding — 보호자 온보딩 (B1)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-035 | Onboarding | `saveOnboardingStep` — 매 단계 커밋 · `onboarding_drafts` 24h 보존 | 6.1.1 · REQ-FUNC-007 · AC-8.1 | FR-026 | M |
| FR-036 | Onboarding | `submitConsent` — 동의 기록(버전 포함) · 상태 전이 · 이벤트 | 6.1.1 · REQ-NF-008 | FR-035 | M |
| FR-037 | Onboarding | `requestPartnerCard` — 제휴사 호출 · 실패 시 입력값 24h 보존 | 3.4 · 6.1.1 · ACE-8.1 | FR-035 | H |
| FR-038 | Onboarding | `(guardian)/onboarding/[step]` 화면 · 재개 처리 | 3.2 · 5.1 | FR-035, FR-007 | M |
| FR-039 | Public | `(public)` 랜딩 · 로그인 · 동의 안내 화면 | 3.2 라우트 그룹 | FR-031, FR-007 | M |

### E7. Star Ledger & Learning — 별 지급과 학습 (B2)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-040 | Star Ledger | `grantStar` 내부 지급 경로 — 트리거 8종 · 학습/실천 경로 분리 | 5.1 · REQ-FUNC-004 | FR-015, FR-026 | H |
| FR-041 | Learning | 학습 원고 DB 적재 및 조회 (런타임 변경 가능) | 4.1 (FUNC-003) | FR-008 | M |
| FR-042 | Learning | `completeLearningTopic` — 이수 기록 · ⭐ 기입 · 나무 조건 갱신 | 6.1.1 · REQ-FUNC-003 · 006 | FR-040, FR-029 | M |
| FR-043 | Learning | `submitQuizAnswer` — 정답 수 갱신 · 조건 갱신 | 6.1.1 · REQ-FUNC-003 | FR-040, FR-029 | M |
| FR-044 | Learning | `(child)/learn/[topic]` 학습·퀴즈 화면 | 3.2 · 5.1 | FR-042, FR-043, FR-032 | M |
| FR-045 | Learning | `(child)/onboarding` 아동 온보딩 화면 | 5.1 · REQ-FUNC-006 | FR-044 | M |

### E8. Practice & Mission — 미션 루프 (B3)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-046 | Mission | `createMission` · `reportMissionDone` — `earned_at` 확정 | 6.1.1 · REQ-FUNC-002 | FR-026 | M |
| FR-047 | Mission | `approveMission` — 승인·⭐기입·실천 인정·주기 귀속·이벤트 4건 원자 | 6.1.1 · REQ-FUNC-002 · 010 | FR-040, FR-029, FR-046 | H |
| FR-048 | Mission | `rejectMission` — ⭐ 미지급 · 사유 저장 · 실천 미가산 | 6.1.1 · ACE-6.1 | FR-047 | M |
| FR-049 | Mission | `bulkApproveMissions` — 일괄 승인 · 원자성은 건 단위 | 6.1.1 · ACE-6.3 | FR-047 | M |
| FR-050 | Mission | `(guardian)/approvals` 승인 대기 화면 · 「승인 대기 N건」 | 3.2 · 5.1 · REQ-FUNC-010 | FR-047, FR-007 | M |

### E9. Wishlist & Avatar — 저축 목표와 보상 (B3)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-051 | Wishlist | `updateWishlistSaving` — 단계 도달 판정 · 부분 유니크 인덱스로 중복 차단 | 6.1.1 · 4.1 (FUNC-012) | FR-040, FR-008 | M |
| FR-052 | Wishlist | `(child)/wishlist` 화면 | 5.1 · REQ-FUNC-012 | FR-051 | M |
| FR-053 | Avatar | `redeemAvatarItem` — 차감 기입 · `SPEC_PENDING` 품목 쿼리 제외 | 6.1.1 · 4.1 (FUNC-005) · CON-RES-02 | FR-040 | M |
| FR-054 | Avatar | `(child)/avatar` 아바타·옷장 화면 | 5.1 · REQ-FUNC-005 | FR-053 | M |

### E10. Partner & Spending — 제휴사 연동과 소비 (B4)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-055 | Plan Card | `createPlanCard` — 어디서·업종·얼마까지 저장 · `plan_card_created` 이벤트 | 6.1.1 · REQ-FUNC-008 · AC-4.1 | FR-026 | M |
| FR-056 | Plan Card | `(child)/plan` 계획 카드 화면 + 보호자 기기 작성 경로 | 3.2 · 12 (CON-DEV-01) | FR-055, FR-007 | M |
| FR-057 | Partner Webhook | 웹훅 수신 공통 — HMAC 서명 검증 · 타임스탬프 허용창 5분 · 200 응답 규약 | 3.4 · 6.1.2 · REQ-TEC-018 | FR-008, FR-004 | H |
| FR-058 | Partner Webhook | `/api/partner/webhook/payment` — 거래 ID 유니크 · `spending_records` 적재 | 6.1.2 · REQ-TEC-018 | FR-057 | M |
| FR-059 | Spending | 결제↔계획 매칭 — 수신 트랜잭션 내 즉시 · `planMatch`/`categoryMatch` 칼럼 분리 | 4.1 (FUNC-008) · CON-ARC-04 | FR-055, FR-058, FR-029 | H |
| FR-060 | Partner Webhook | `partner_webhook_dlq` 적재 — 처리 실패를 200 + DLQ로 흡수 | 3.4 · 6.2 · REQ-TEC-018 | FR-057 | M |
| FR-061 | Partner Webhook | `/api/partner/webhook/card-state` + `PartnerPolicyAdapter`(한도·업종 읽어 반영) | 3.4 · 12 (CON-REG-08) · REQ-NF-015 | FR-057 | M |
| FR-062 | Partner Card | `terminatePartnerCard` — 해지 호출 · 전액 환불 · 부분 환불 분기 부재 | 6.1.1 · REQ-NF-013 · CON-REG-07 | FR-037 | M |
| FR-063 | Partner Card | 카드 없는 체험 잠금 분기 — `PARTNER_CARDS.state` 컴포넌트 단위 잠금 | 4.1 (FUNC-015) | FR-061 | M |

### E11. Retrospective — 두 갈래 회고 (B5)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-064 | Retro | 회고 문장 풀 적재 · 비복원 배정 로직 (`reviewState`·`source` 구분) | 6.2 (`RetroSentence`) · ACE-5.1 | FR-008 | M |
| FR-065 | Retro | `submitRetrospective` — 문장 배정 · 갈래 판정 · ⭐ 기입 분기 · 체류 기록 | 6.1.1 · AC-5.3 · 5.4 | FR-059, FR-040, FR-064 | H |
| FR-066 | Retro | `(child)/retro` 두 갈래 회고 화면 · 미완 회고 큐 · 요약 회고 병합 | 5.1 · 6.8 · ACE-5.2 | FR-065 | M |

### E12. Batch Infrastructure — 배치 기반 설비 (B0/B5 병행)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-067 | Batch Infra | `batch_heartbeats` 테이블 · 전 배치 성공 시각 기록 규약 | 6.2 · 11 분담 규칙 4 · REQ-TEC-017 | FR-008 | M |
| FR-068 | Batch Infra | `/api/internal/notify` — `pg_net` 진입점 · 공유 시크릿 · 출처 제한 | 6.1.2 · 11 | FR-004, FR-057 | M |
| FR-069 | Batch Infra | 배치 등록 목록 대조 검사 (`pg_cron`·`vercel.json` ↔ §11 표) | 5.2 · REQ-TEC-010 | FR-018 | M |

### E13. pg_cron 배치 — DB 내부 집계 (B5)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-070 | Batch (pg_cron) | `app_events` 파티션 선행 생성 배치 | 11 (신설) · REQ-TEC-020 | FR-016, FR-067 | M |
| FR-071 | Batch (pg_cron) | BAT-1 나무 승급·정체 판정 (`stall_days` 산출) | 11 · 4.1 (FUNC-001) | FR-029, FR-067 | H |
| FR-072 | Batch (pg_cron) | BAT-3 별 원장 정산 — 이중 기입 대조 · 불일치 즉시 알림 | 11 · REQ-NF-006 | FR-015, FR-067, FR-068 | H |
| FR-073 | Batch (pg_cron) | BAT-4a 스키마·권한 스캔 — `pg_policies` RLS 부재 0건 확인 | 11 · 6.3 규칙 3 · REQ-NF-009 | FR-012, FR-067 | M |
| FR-074 | Batch (pg_cron) | BAT-6 WPA 주간 집계 (북극성 지표) | 11 | FR-016, FR-029, FR-067 | H |
| FR-075 | Batch (pg_cron) | BAT-7 주간 지표 집계 (파티션 스캔) | 11 | FR-074 | M |
| FR-076 | Batch (pg_cron) | BAT-8 월간 숲 스냅샷 — 월초 전 아동 대상 대량 집계 | 11 · 4.1 (FUNC-009) | FR-029, FR-067 | H |
| FR-077 | Batch (pg_cron) | BAT-10 계측 건강성 — 이벤트↔원장 대조 · 유실률 산출 | 11 · REQ-TEC-020 | FR-016, FR-072 | H |
| FR-078 | Batch (pg_cron) | BAT-11 문장 풀 잔여율 판정 + `pg_net` 알림 위임 | 11 · ACE-5.1 | FR-064, FR-068 | M |
| FR-079 | Batch (pg_cron) | 월간 업종별 집계 (`monthly_category_agg`) | 4.1 (FUNC-013) · 5.1 · 8 예산 | FR-059, FR-067 | M |

### E14. Notification — 알림 채널 (B5)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-080 | Notification | `registerPushSubscription` · `updateNotifyWindow` — 엔드포인트 유니크 | 6.1.1 · REQ-FUNC-011 · AC-7.3 | FR-026 | M |
| FR-081 | Notification | Web Push 발송 (VAPID) · 404·410 수신 시 구독 즉시 폐기 | 3.4 · REQ-TEC-009 | FR-080 | H |
| FR-082 | Notification | 채널 폴백 라우터 — 푸시 → 인앱 배너 → SMS · `attemptedAt`/`deliveredAt` 분리 집계 | 6.7 · X-3 · ACE-7.1 · REQ-TEC-009 | FR-081 | H |
| FR-083 | Notification | SMS 게이트웨이 연동 · 재시도 3회 · 실패 집계 | 3.4 · D-TEC-8 | FR-082 | M |
| FR-084 | Notification | 앱 삭제 분기 — 「재설치 안내」 문구 · 다른 이벤트 코드 적재 | ACE-7.2 | FR-082 | M |

### E15. Vercel Cron 배치 — 외부 호출 (B5)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-085 | Batch (Vercel) | Vercel Cron 등록 · `CRON_SECRET` 진입 인증 공통 | 6.1.2 · 11 · REQ-TEC-010 | FR-004, FR-069 | M |
| FR-086 | Batch (Vercel) | BAT-2 미접속 알림 발송 (`/api/cron/inactivity`) · 오탐 0건 판정 | 11 · REQ-FUNC-011 · ACE-7.3 | FR-085, FR-082 | H |
| FR-087 | Batch (Vercel) | BAT-12 가용성·오류율 프로브 (`/api/cron/probe`) + `/api/health` | 11 · REQ-NF-004 · 005 · D-TEC-3 | FR-085 | M |
| FR-088 | Batch (Vercel) | BAT-9 원가 집계 (`/api/cron/cost`) — 청구 API 월 집계 | 11 · REQ-NF-016 · CON-RES-03 | FR-085 | M |
| FR-089 | Batch (Vercel) | 웹훅 DLQ 재처리 (`/api/cron/webhook-dlq`) | 11 (신설) · REQ-TEC-018 | FR-085, FR-060 | M |

### E16. Growth Delivery — 전달 화면 (B5)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-090 | Growth Tree | `(guardian)/tree` 성장 나무 화면 — 병렬 4쿼리 · 배치 산출값 읽기 전용 | 4.1 (FUNC-001) · 8.1 예산 | FR-071, FR-028 | H |
| FR-091 | Growth Tree | 정체 원인 조건 단위 표시 · 가장 적게 남은 조건 최상단 | REQ-FUNC-001 · ACE-3.1 | FR-090 | M |
| FR-092 | Growth Forest | `(guardian)/forest` 월간 숲 화면 — 스냅샷 읽기 · 전월 없음 대체 문구 | 5.1 · ACE-1.2 | FR-076, FR-028 | M |
| FR-093 | Spending | `(guardian)/spending` 소비 내역 화면 — 월간 집계 테이블 읽기 | 5.1 · 4.1 (FUNC-013) | FR-079, FR-028 | M |

### E17. PWA & Offline — 플랫폼 능력 (B3)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-094 | PWA | 매니페스트 · Service Worker 등록 · 홈 화면 설치성 확보 | 6.7 · REQ-TEC-008 · C-TEC-008 | FR-001 | M |
| FR-095 | Offline | IndexedDB 오프라인 큐 — 기록 손실 0건 · `client_ts` 보존 | 6.7 · REQ-NF-003 | FR-094, FR-027 | H |
| FR-096 | Offline | `flushOfflineQueue` Action — 항목별 멱등 키 순차 처리 · 부분 실패 허용 | 6.1.1 · REQ-TEC-008 | FR-095, FR-026 | H |
| FR-097 | Offline | iOS 포그라운드 진입 flush 분기 (Background Sync 부재 대응) | 6.7 · X-4 · 9.1 (ACE-2.1 재정의) | FR-096 | M |

### E18. Observability & Ops — 관측과 운영 (전 빌드 병행)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-098 | Observability | Vercel 로그 드레인 · 외부 보존소 연동 (감사 보존 기간 충족) | 10.3 · REQ-TEC-017 · D-TEC-3 | FR-003 | M |
| FR-099 | Observability | 규제·정합성·보안 이벤트 즉시 알림 라우팅 (30분 내 확인 SLA) | REQ-TEC-017 · REQ-NF-017 | FR-068, FR-032 | H |
| FR-100 | Observability | 배치 침묵 감지 — 주기 2배 초과 시 알림 | 11 분담 규칙 4 · REQ-TEC-010 | FR-067, FR-099 | M |

### E19. AI Ops Tool — 운영자 전용 AI (조건부 · `AI_ENABLED`)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-101 | Ops Console | `(ops)` 라우트 그룹 · 운영자 역할 검사 · 아동/보호자 계정 진입 차단 | 3.2 · X-7 · REQ-AI-001 | FR-031 | M |
| FR-102 | AI | Vercel AI SDK 프로바이더 레지스트리 — `AI_MODEL_ID`·`AI_ENABLED` 환경 변수 교체 | 4.3 · REQ-AI-002 · C-TEC-006 | FR-004 | M |
| FR-103 | AI | 프롬프트 빌더 화이트리스트 — 갈래 코드·톤 지침·금지어·길이 제약만 | 4.3 · REQ-AI-003 · C-TEC-017 | FR-102 | M |
| FR-104 | AI | `/api/ops/ai/retro-draft` — `generateObject` 스키마 검증 · 재시도 2회 · 월 호출 상한 | 6.1.2 · REQ-AI-005 | FR-103, FR-101 | H |
| FR-105 | AI | `reviewState` 상태 기계 · `approveRetroSentenceDraft` (승인자·시각 기록) | 6.1.1 · REQ-AI-004 | FR-064, FR-104 | M |
| FR-106 | Ops Console | `(ops)` AI 초안 검토 · 문장 풀 잔여율 화면 | 3.2 · ACE-5.1 | FR-105 | M |

### E20. Verification Harness — 검증 설비 (릴리스 게이트 근거)

> §9.2의 신설 수용 기준 35건과 §9.3 릴리스 게이트 RG-T1~T4를 **실행 가능한 검증 자산**으로 만드는 태스크다.

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 (Dependencies) | 복잡도 (H/M/L) |
|---|---|---|---|---|---|
| FR-107 | Verification | 게이트 7종 위반 주입 테스트 (7/7 빌드 실패 확인) | 9.2 AC-T11.1 · 9.3 RG-T1 | FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025 | H |
| FR-108 | Verification | RLS·권한 통합 테스트 — 타 보호자 0행 · `app`↔`pii` 조인 권한 실패 | 9.2 AC-T5.1 · T5.2 | FR-012, FR-014 | M |
| FR-109 | Verification | 동시성 부하 테스트 — 동일 키 10회 · 서로 다른 100건 · 동시 200 사용자 | 9.2 AC-T3.1 · T4.1 · T19.1 · 9.3 RG-T2 | FR-015, FR-026 | H |
| FR-110 | Verification | 동의 게이트 E2E — 미완 접근 차단 · 철회 후 새로고침 즉시 차단 | 9.2 AC-T6.1 · T6.2 | FR-032, FR-033 | M |
| FR-111 | Verification | 오프라인 E2E 2 OS — 3건 전부 반영 · ⭐ 중복 0건 · iOS 5초 이내 | 9.2 AC-T8.1 · T8.2 | FR-096, FR-097 | H |
| FR-112 | Verification | 웹훅 테스트 — 서명 위조 401 · 재전송 중복 0건 · 실패 시 200+DLQ 재처리 | 9.2 AC-T18.1 · T18.2 · T18.3 | FR-057, FR-060, FR-089 | M |
| FR-113 | Verification | 배치 테스트 — 하트비트 침묵 알림 · BAT-8 대량 데이터 완주 · 파티션 선행 생성 | 9.2 AC-T10.1 · T10.2 · T20.1 | FR-100, FR-076, FR-070 | M |
| FR-114 | Verification | 채널 폴백·구독 만료 테스트 · 전달 시도 100% 확인 | 9.2 AC-T9.1 · 9.1 (AC-7.1 재정의) | FR-082, FR-086 | M |
| FR-115 | Verification | AI 경계 테스트 — 페이로드 감사 · 승인 전 미배정 · 전면 장애 격리 | 9.2 AC-A1.2 · A3.2 · A4.1 · A5.1 | FR-104, FR-105 | M |
| FR-116 | Verification | 배포 환경 감사 — Preview 격리·비인증 차단 · 리전 일치 · 게이트 실행 로그 | 9.2 AC-T13.1 · T14.1 · T11.2 · 9.3 RG-T3 | FR-004, FR-018 | L |

---

## 3. 디자인 ↔ 개발 연계

> 두 관점을 분리해 추출했으므로 선행 관계도 각 표 안에서만 걸었다. 아래는 **화면 구현 태스크가 어느 디자인 산출물을 전제하는가**의 대응표이며, 착수 순서 조율에만 쓴다.

| 개발 태스크 | 전제 디자인 산출물 |
| --- | --- |
| FR-007 Tailwind·shadcn/ui 초기화 | UX-001 · UX-002 · UX-003 |
| FR-038 보호자 온보딩 화면 | UX-006 · UX-007 · UX-008 |
| FR-032 동의 게이트 차단 | UX-009 |
| FR-044 학습·퀴즈 화면 | UX-011 · UX-005 |
| FR-045 아동 온보딩 화면 | UX-010 |
| FR-050 승인 대기 화면 | UX-015 · UX-016 |
| FR-052 위시리스트 화면 | UX-021 |
| FR-054 아바타·옷장 화면 | UX-020 |
| FR-056 계획 카드 화면 | UX-017 |
| FR-066 두 갈래 회고 화면 | UX-018 |
| FR-090 · FR-091 성장 나무 | UX-012 · UX-013 |
| FR-092 월간 숲 | UX-014 · UX-022 |
| FR-093 소비 내역 | UX-019 |
| FR-094 PWA 셸 | UX-008 |
| FR-106 운영자 콘솔 | UX-023 |

---

## 4. 착수 차단 항목 — 태스크 이전에 답이 필요한 것

> §13.3 착수 전 확인 목록과 §14 미결 항목(D-TEC)에서 도출. **아래가 미해소인 상태로 착수하면 해당 태스크가 재작업 대상이 된다.**

| # | 확인 항목 | 차단되는 태스크 | 미해소 시 |
| --- | --- | --- | --- |
| **T-1** | 제휴사가 **고정 출구 IP**를 요구하는가 (C-TEC-015 · D-TEC-2) | FR-057 ~ FR-063 | B4 지연 — FR-055·FR-056(계획 카드)까지만 선행 |
| **T-2** | 플랜이 **5분 Cron · 배포 보호 · 로그 보존**을 제공하는가 (D-TEC-3) | FR-004 · FR-087 · FR-098 | 프로브 주기 상향 또는 외부 수단 대체 |
| **T-3** | Prisma 버전이 **다중 스키마**를 지원하는가 (§6.2) | FR-008 · FR-011 · FR-014 | `pii` 분리 수단을 별도 DB 또는 뷰+권한으로 교체 |
| **T-4** | **`pg_cron` · `pg_net`** 활성화 가능한가 (D-TEC-7) | FR-070 ~ FR-079 · FR-068 | X-5 재개 — 배치 분담 전면 재설계 |
| **D-TEC-1** 🔴 | 해외 클라우드 이용이 **아동 개인정보 국외이전**에 해당하는가 (X-8 · 유일한 미해결 충돌) | *(전체 · 일반 공개 가부)* | **RG-T4 미통과 — 일반 공개 불가.** α·β는 고지·동의 하에 진행 |
| **D-TEC-6** | Gemini API의 **데이터 처리 조건** | FR-102 ~ FR-106 | `AI_ENABLED=false` 유지 — **기능 손실 0건** |
| **D-TEC-8** | **SMS 게이트웨이** 사업자·단가 | FR-083 | 폴백 채널 1종 부재 — AC-7.1(전달 시도 100%) 미성립 |
| **D-TEC-4** | Supabase **플랜 · 백업/PITR 보존 기간** | FR-002 · FR-006 | 아동 데이터 복구 요건 미충족 상태를 **명시**하고 진행 |
| **D-TEC-5** | iOS 사용자의 **PWA 설치 전환율** *(차단 아님 · 관측 항목)* | FR-082 · FR-083 원가 | SMS 폴백 비중 증가 — 원가(CON-RES-03)로 이전 |

---

## 5. 빌드 구획별 태스크 배치

> §13.2의 기술 선행 관계에 따른 배치. **B0은 별도 sp로 세지 않는다**(§13.1) — 승계 비기능 요구사항의 완료 조건을 물리적으로 성립시키는 작업이기 때문이다.

| 빌드 | 포함 태스크 | 건수 |
| --- | --- | --- |
| **B0** 기반 설비 | FR-001 ~ FR-029 · FR-067 ~ FR-069 | 32 |
| **B1** 동의·계정 | FR-030 ~ FR-039 | 10 |
| **B2** 별·학습 | FR-040 ~ FR-045 | 6 |
| **B3** 실천·나무 | FR-046 ~ FR-054 · FR-094 ~ FR-097 | 13 |
| **B4** 소비 *(D1·D-TEC-2 종속)* | FR-055 ~ FR-063 | 9 |
| **B5** 대조·전달 | FR-064 ~ FR-066 · FR-070 ~ FR-093 | 27 |
| **B6** 계측 *(전 빌드 병행)* | FR-016 · FR-070 · FR-077 · FR-098 ~ FR-100 | *(각 빌드에 포함)* |
| **조건부** AI 도구 | FR-101 ~ FR-106 | 6 |
| **검증** *(릴리스 게이트 근거)* | FR-107 ~ FR-116 | 10 |

---

## 6. 임계 경로

```
FR-001 → FR-008 → FR-011 → FR-012 → FR-013 → FR-026 → FR-040 → FR-047 → FR-059 → FR-065
  프로젝트   스키마    롤 분리   RLS     래퍼   Action골격  별지급   미션승인   결제매칭   회고
```

| 지점 | 밀리면 함께 밀리는 것 |
| --- | --- |
| **FR-008 Prisma 스키마** | E2 이후 **전 태스크** |
| **FR-012 RLS 정책** | 요청 경로 전체 — *"RLS는 마지막에 켤 수 없다"*(§13.1) |
| **FR-015 원자 기입 SQL** | FR-040·047·051·053·065 — 별이 걸린 전 기능 |
| **FR-026 Action 공통 골격** | 모든 쓰기 태스크 — 첫 Action이 래퍼 없이 작성되면 나머지가 따라간다(§13.1) |
| **FR-018 게이트 러너** | 첫 커밋부터 켜져 있어야 위반이 쌓이지 않는다(§13.1) |
| **FR-057 웹훅 공통** *(외부 종속)* | E10 전체 + FR-065 회고 + FR-079·FR-093 소비 집계 |

---

*근거 문서: `SRS_finfriends-nextjs-v1_0.md` (SRS-FINFRIENDS-NEXTJS-001 · 개정 1.0 · 2026-08-24)*
