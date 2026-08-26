---
name: "[Sec] FR-010: 인증·미들웨어·프로필 선택"
about: Stage 3 · 개정 3.0 FR-010 (개정 2.0 FR-031·040·043 흡수)
title: "[Sec] FR-010: 보호자 전용 인증 — Supabase Auth · middleware · 아동 프로필 서명 쿠키"
labels: "type:sec, type:feature/command, epic:E6, complexity:M, milestone:B1, gate:regulatory"
assignees: ''
---

<!--
Stage 3 · 5건 중 2번. Stage 3 내부 선행 없음 — FR-005와 병렬 착수 가능. FR-011을 막는다.
흡수: 개정 2.0의 FR-031(Auth 연결) · FR-032(middleware) · UX-008(selectChildProfile) — 3건
-->

## 🎯 Summary

- **기능명:** **보호자만** Auth 사용자로 존재하게 하고, 아동은 **보호자 세션에 서명된 쿠키**로만 표현한다. 미들웨어가 라우트 그룹별로 분기한다.
- **목적:** CON-DEV-03 · REQ-TEC-007 — **아동이 독립적으로 로그인할 수 있는 경로를 애초에 만들지 않는다.** 아동 자격증명이 존재하지 않으면 유출될 것도 없다.
- **왜 한 이슈인가:** Auth 연결 · 미들웨어 · 프로필 선택 셋은 **같은 세션 모델을 공유**한다. 하나만 바꾸면 나머지 둘이 어긋난다.

## 🔗 References (Spec & Context)

> 💡 **작업 시작 전 아래를 반드시 먼저 Read/Evaluate 할 것.**

- 동의 게이트 4겹: [`SRS_finfriends-nextjs-v1_0.md` §3.3](#) — **판정 지점 표**의 첫 행(`middleware.ts`)이 이 이슈다
- 런타임 경계: [§3.1 경계 ②](#) — 미들웨어는 Edge에서 돌고 **DB에 접근하지 않는다**
- 라우트 그룹: [§3.2](#) — `(public)` `(guardian)` `(child)` `(ops)` 분기
- 요구사항: [§4.2 REQ-TEC-007](#) — 아동 자격증명 저장 필드 **0건** · Auth 사용자는 **보호자만** · 아동 독립 로그인 시도 **0건**
- 액션 계약: [§6.1.1 `selectChildProfile`](#) — **DB 쓰기 없음 · 멱등 키 없음**(서명 쿠키 갱신만) — FR-008의 C-01 계약
- 환경 변수: [§10.2](#) — `NEXT_PUBLIC_SUPABASE_URL` · `..._ANON_KEY`(전체 스코프 · 공개 전제)
- 수용 기준: [§9.2 AC-T7.1](#)

## ✅ Task Breakdown (실행 계획)

**(구 FR-031) Supabase Auth 보호자 연결**
- [ ] 보호자 가입·로그인 경로 — Supabase Auth 사용자와 `GuardianAccount.authUserId` 연결
- [ ] 🔴 **아동 자격증명 필드를 만들지 않는다** — 비밀번호·소셜·매직링크 어느 것도 아동에게 부여하지 않는다
- [ ] 세션 쿠키 발급·갱신 규약

**(구 FR-032) `middleware.ts`**
- [ ] 세션 쿠키 **서명·만료 검증** — Edge에서 돌므로 **DB 접근 없이** 쿠키만 본다
- [ ] 라우트 그룹 분기 — `(public)`은 통과 · `(guardian)`·`(child)`는 세션 필수 · `(ops)`는 역할 검사(실제 검사는 FR-034)
- [ ] 실패 시 `(public)/login`으로 **302 리다이렉트**
- [ ] ⚠️ **미들웨어는 동의를 판정하지 않는다** — 쿠키는 낡을 수 있다. 동의 확정 판정은 FR-011의 `(child)/layout.tsx`가 한다

**(구 UX-008) `selectChildProfile`**
- [ ] 보호자 세션 아래에서 **아동 프로필을 고르는 서명 쿠키** 발급
- [ ] 🔴 쿠키는 **서명**되어야 한다 — 서명이 없으면 보호자가 남의 `child_id`를 넣을 수 있다
- [ ] FR-008 C-01 계약대로 — **DB 쓰기 없음 · 멱등 키 없음**(골격의 명시된 예외)
- [ ] 선택된 `child_id`가 **실제로 그 보호자의 아동인지** 확인 (RLS가 최종 방어선이지만 여기서도 본다)

## 🧪 Acceptance Criteria (BDD/GWT)

**Scenario 1: 아동 자격증명 부재 (AC-T7.1)**
- **Given:** 운영 중 인증 로그 1일치와 스키마
- **When:** 감사한다
- **Then:** 아동 자격증명 저장 필드 **0건** · 아동 독립 로그인 시도 **0건**.

**Scenario 2: 세션 없는 접근**
- **Given:** 세션 쿠키가 없거나 만료된 브라우저
- **When:** `/learn`에 접근한다
- **Then:** 미들웨어가 **`(public)/login`으로 302** — 아동 레이아웃이 렌더되지 않는다.

**Scenario 3: 프로필 쿠키 위조 차단**
- **Given:** 보호자 A의 세션
- **When:** 서명을 조작해 보호자 B의 `child_id`를 담은 쿠키를 보낸다
- **Then:** **서명 검증에 실패**해 거부된다.

## ⚙️ Technical & Non-Functional Constraints

- 🔴 **규제:** 아동 자격증명 저장 필드 **0건** (REQ-TEC-007 · CON-DEV-03)
- **경계:** 미들웨어는 **Edge 런타임** — DB·Prisma를 import할 수 없다. import하면 게이트 G3(FR-005)가 잡는다
- **한계:** 미들웨어는 **빠르지만 틀릴 수 있다**(쿠키는 낡는다). 그래서 동의는 4겹으로 본다 — 이 이슈는 **1겹째**다
- **계약:** `selectChildProfile`은 골격의 **명시된 멱등 예외**다 (FR-008 C-01)

## 🏁 Definition of Done (DoD)

- [ ] AC-T7.1 통과 — 아동 자격증명 필드 **0건** · 아동 독립 로그인 경로 **0건**인가?
- [ ] 미들웨어가 **DB에 접근하지 않는가**? (Edge에서 Prisma import 0건)
- [ ] 세션 없는 `(guardian)`·`(child)` 접근이 **302 리다이렉트**되는가?
- [ ] 아동 프로필 쿠키가 **서명**되고 위조가 거부되는가?
- [ ] `selectChildProfile`이 **DB 쓰기 없이** 동작하는가?
- [ ] 선택된 `child_id`가 그 보호자의 아동인지 **확인**하는가?
- [ ] 미들웨어가 **동의를 판정하지 않음**을 확인했는가? (판정 지점은 하나뿐이어야 한다 — FR-011)

## 🚧 Dependencies & Blockers

- **Depends on:** FR-001(플랫폼 · Auth 환경 변수) · FR-002(스키마 `GuardianAccount`·`ChildAccount`) · FR-008(C-01 계약)
- **Blocks (직접 3건):** FR-011(동의 게이트) · UX-002(온보딩·공개 화면) · FR-034(AI 경계 — `(ops)` 역할 검사)
- **간접 6건**
- **차단 항목:** 없음

## ⚠️ 유형이 섞인 이슈

주 유형 `[Sec]` · 부 유형 `[Feature/Command]`(`selectChildProfile`). GitHub 라벨에 **둘 다** 붙인다. 개정 3.0 §9가 기록한 혼재 10건 중 하나다.
