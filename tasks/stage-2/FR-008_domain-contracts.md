---
name: "[Contract] FR-008: 도메인 계약 6종"
about: Stage 2 · 개정 3.0 FR-008 (개정 2.0 FR-023~035 흡수)
title: "[Contract] FR-008: 도메인 계약 6종 — Server Action 20종의 입력 스키마·반환 타입·실패 분기"
labels: "type:contract, epic:E5, complexity:M, milestone:B0"
assignees: ''
---

<!--
Stage 2 · 5건 중 3번. Stage 2 내부 선행: FR-006(골격) — 골격이 정한 형식 위에 도메인별 내용을 채운다.
흡수: 개정 2.0의 FR-023 · FR-024 · FR-025 · FR-026 · FR-027 · FR-028 (6건)
-->

## 🎯 Summary

- **기능명:** SRS §6.1.1의 **Server Action 20종**을 6개 도메인으로 묶어, 각각의 **zod 입력 스키마 · 반환 타입 · 실패 분기 · 무효화 태그**를 확정한다.
- **목적:** 방법론이 말한 *"계약이 먼저다 — 이것이 있어야 백엔드와 프론트엔드가 병렬로 움직인다"* 의 실물이다. 계약이 없으면 **각 Command 착수 시점에 즉흥 결정**되고, 프론트가 참조할 것이 생기지 않는다.
- **왜 한 이슈인가:** 6개 도메인 계약은 **같은 골격(FR-006)을 공유하고 같은 날 확정되는 편이 낫다.** 하나씩 확정하면 나중 도메인이 앞 도메인의 형태를 따라가며 흔들린다.
- **⚠️ 공개 REST API가 없다** — 계약의 산출물은 **DTO·HTTP 에러 코드가 아니라** zod 스키마 + 반환 타입 + 실패 분기다. HTTP 상태 코드 규약은 **Route Handler에만**(FR-019 · FR-023 · FR-028) 적용한다.

## 🔗 References (Spec & Context)

> 💡 **작업 시작 전 아래를 반드시 먼저 Read/Evaluate 할 것.**

- **인터페이스 전수:** [`SRS_finfriends-nextjs-v1_0.md` §6.1.1](#) — 액션 20종 · 귀속 요구사항 · 멱등 키 여부 · **트랜잭션 안에서 함께 하는 일** · 무효화 태그
- 실행 골격: [§6.4](#) — 이 계약이 올라탈 5단계 (FR-006에서 만든 것)
- 멱등 계약: [§4.2 REQ-TEC-003](#) — `idempotencyKey` 필수 · 반환값 동일
- 원자 기입: [§6.5](#) — `grantStar` 내부 경로 시그니처의 근거
- 갈래 판정: [`SRS_finfriends-v1_0.md` §9.2 AC-5.3 · 5.4](#) · [§9.3 ACE-4.2](#) — `plan_met` · `category_met`
- 오프라인: [§4.2 REQ-TEC-008](#) — `flushOfflineQueue`의 **배열 멱등 · 부분 실패 허용**

## ✅ Task Breakdown (실행 계획)

각 계약은 **입력 zod 스키마 · 반환 타입 · 실패 분기 · 무효화 태그** 4가지를 산출한다.

- [ ] **(구 FR-023) C-01 Onboarding·Consent·Card — 액션 5종**
      `saveOnboardingStep` · `submitConsent` · `requestPartnerCard` · `selectChildProfile` · `terminatePartnerCard`
      *실패 분기:* 외부 API 실패 시 **입력값 24h 보존**(ACE-8.1) · 해지 시 **전액 환불** 확인
      *특이:* `selectChildProfile`은 **DB 쓰기가 없고 멱등 키도 없다**(서명 쿠키 갱신만) — 골격의 예외로 명시
- [ ] **(구 FR-024) C-02 Mission — 액션 5종**
      `createMission` · `reportMissionDone` · `approveMission` · `rejectMission` · `bulkApproveMissions`
      *반환:* `approveMission`은 **승인·⭐기입·실천 인정·이벤트 4건이 한 트랜잭션**에서 확정된 결과를 반환
      *특이:* `bulkApproveMissions`는 **멱등이 건별**이고 **원자성도 건 단위**다 — 일괄이지만 전부-아니면-전무가 아니다
- [ ] **(구 FR-025) C-03 Learning — 액션 2종**
      `completeLearningTopic` · `submitQuizAnswer` · 무효화 태그 `tree:{childId}` · `stars:{childId}`
- [ ] **(구 FR-026) C-04 Reward — 액션 2종 + 내부 경로**
      `redeemAvatarItem` · `updateWishlistSaving` + **`grantStar` 내부 경로 시그니처**
      *실패 분기:* 잔액 부족 시 **전체 롤백** · `SPEC_PENDING` 품목은 쿼리에서 제외
      *특이:* **차감도 지급과 같은 원장 경로**를 탄다 — 별도 경로를 만들면 게이트 G1이 못 잡는 전환 경로가 생긴다
- [ ] **(구 FR-027) C-05 Plan·Retro — 액션 3종**
      `createPlanCard` · `submitRetrospective` · `approveRetroSentenceDraft`(ops)
      *반환:* **갈래 판정 결과**를 `plan_met` · `category_met` **두 값으로 분리**해 반환(AC-5.3 · 5.4 · ACE-4.2)
- [ ] **(구 FR-028) C-06 Notification·Offline — 액션 3종**
      `registerPushSubscription` · `updateNotifyWindow` · `flushOfflineQueue`
      *특이:* `flushOfflineQueue`는 **배열 멱등** — 항목마다 각자의 키로 순차 처리하고 **부분 실패를 허용**한다
- [ ] 6개 계약 전체를 **한 곳에서 export**해 프론트가 타입만 import하면 되게 한다
- [ ] §6.1.1 표의 **20종이 전부 덮였는지** 대조표를 이슈에 남긴다

## 🧪 Acceptance Criteria (BDD/GWT)

**Scenario 1: 경계 전수 대응**
- **Given:** SRS §6.1.1의 Server Action 20종 목록
- **When:** 6개 계약이 덮는 액션을 합친다
- **Then:** **20 / 20**이고 중복 배정이 **0건**이다.

**Scenario 2: 멱등 키 필수 (예외 1건 명시)**
- **Given:** 6개 계약의 입력 스키마 전부
- **When:** `idempotencyKey` 필드를 검사한다
- **Then:** **`selectChildProfile`을 제외한 19종에 필수**로 존재하고, 그 예외가 계약 문서에 **명시**되어 있다.

**Scenario 3: 갈래 판정이 두 값으로 분리됨 (ACE-4.2)**
- **Given:** 금액은 계획 이내인데 업종이 다른 결제
- **When:** `submitRetrospective`의 반환 타입을 본다
- **Then:** `plan_met=true` · `category_met=false`가 **각각의 필드**로 표현된다 — 하나의 boolean으로 뭉개지지 않는다.

**Scenario 4: 부분 실패 표현 (REQ-TEC-008)**
- **Given:** 오프라인 큐 3건 중 1건이 실패하는 상황
- **When:** `flushOfflineQueue`의 반환 타입을 본다
- **Then:** **항목별 성공/실패**가 표현된다 — 전체 실패로 뭉개지지 않는다.

## ⚙️ Technical & Non-Functional Constraints

- **형태:** 공개 REST API가 없으므로 **DTO·HTTP 에러 코드를 만들지 않는다.** zod 스키마 + 반환 타입 + 실패 분기가 산출물이다
- **멱등:** `idempotencyKey`(UUIDv7) 필수 — 예외는 `selectChildProfile` 1건뿐이고 **명시**한다 (REQ-TEC-003)
- **태그:** 무효화 태그는 FR-006의 **상수 모듈에서만** 가져온다 — 계약이 문자열을 새로 만들지 않는다
- **규제:** 별↔저금통 전환 경로 부재 — 차감을 별도 경로로 만들지 않는다 (REQ-NF-010 · CON-REG-05)
- **범위:** 이 이슈는 **계약만** 만든다. 구현은 Stage 4~5의 Command 이슈가 한다

## 🏁 Definition of Done (DoD)

- [ ] §6.1.1의 액션 **20종이 전부** 6개 계약 중 하나에 배정되었는가? (중복 0 · 누락 0)
- [ ] 각 계약이 **입력 스키마 · 반환 타입 · 실패 분기 · 무효화 태그** 4가지를 모두 갖췄는가?
- [ ] `idempotencyKey`가 19종에 필수이고 **예외 1건이 명시**되었는가?
- [ ] `plan_met` · `category_met`이 **분리된 필드**인가?
- [ ] `flushOfflineQueue`가 **항목별 성공/실패**를 반환하는가?
- [ ] `bulkApproveMissions`의 **건 단위 원자성**이 반환 타입에 드러나는가?
- [ ] 무효화 태그가 FR-006의 상수만 쓰는가? (새 문자열 0건)
- [ ] 프론트가 **타입만 import**해서 화면을 시작할 수 있는가?

## 🚧 Dependencies & Blockers

- **Depends on:** FR-002(스키마 — 반환 타입이 모델을 가리킨다) · FR-006(골격 — 계약이 올라탈 형식)
- **Blocks (직접 12건):** FR-010 · FR-012 · FR-013 · FR-014 · FR-015 · FR-017 · FR-018 · FR-020 · FR-021 · FR-027 · FR-031 · FR-034
- **간접 19건**
- **차단 항목:** 없음

## ⚠️ 이 이슈가 늦으면

**Stage 4~5의 Command 12건이 전부 대기한다.** 반대로 이 이슈가 끝나면 **프론트(Stage 7)가 타입만 보고 착수**할 수 있다 — 방법론이 계약을 Step 1에 둔 이유가 이것이다.
