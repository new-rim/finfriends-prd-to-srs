---
description: 개발 표준 — 규제 계층 · 성능 예산 · Git 규약 · 검증 · 코드 스타일
globs: ["**/*"]
alwaysApply: true
---
# 003. 개발 지침

## 1. 규제 계층 — 무엇을 절대 타협하지 않는가

| 계층 | 허용 오차 | 어디에 두는가 | 예 |
| --- | --- | --- | --- |
| **계층 1 — 규제** | **0** | 스키마 구조 · DB 제약 · 빌드 게이트 | 법정대리인 동의 · 위치·얼굴 데이터 부재 · 별↔현금 전환 부재 |
| **계층 2 — 정합성** | **0** | 단일 SQL 원자 기입 · 유니크 제약 | 별 원장 잔액 · 멱등 키 중복 |
| **계층 3 — 성능·체감** | 예산 범위 | 애플리케이션 코드 | p95 응답 · 반영 지연 |

> 🔴 **계층 1·2를 애플리케이션 코드에 두지 않는다.** 코드를 전부 다시 써도 남는 자리(스키마·DB 제약·게이트)에 둔다. 코드 리뷰로 지키는 규칙은 계층 3까지다.

## 2. 성능 예산 — 편의를 위해 넘기지 않는다

| 지표 | 상한 | 흔한 위반 |
| --- | --- | --- |
| 성장 나무 조회 | p95 ≤ **1,250ms** | 판정 로직을 쿼리 안에 섞어 N+1 유발 |
| ⭐ 지급 → 화면 반영 | p95 ≤ **800ms** | `revalidatePath("/")` — **한 줄로 예산 전체가 날아간다** |
| 월 가용성 | ≥ **99.0%** | 직렬 의존을 늘리는 외부 호출 |
| 별 원장 불일치 | **0%** | 읽고-계산하고-쓰는 왕복 |
| 동의 미완 진입 차단 | **100%** | 판정 지점을 하나로 줄이는 「리팩터링」 |

**예산 초과 시 처리 순서** — ① 캐시 태그 범위 축소 ② 쿼리·인덱스 ③ 판정 로직을 `domain/`으로 분리해 재사용 ④ 배치로 선계산. **요구사항을 낮추는 것은 마지막에도 아니다.**

## 3. 코드 구조·스타일

```
app/         라우트 그룹 · RSC · Route Handler        → 004
src/actions/ "use server" 쓰기 경로 전수              → 004
src/domain/  판정 로직 — 순수 함수 · DB·React 비의존
src/db/      request.ts · batch.ts · withGuardian.ts  → 005
src/components/ui/     shadcn/ui (복사본)
src/components/domain/ 도메인 조합 컴포넌트
src/lib/     ai · push · partner · events · idempotency
prisma/      schema.prisma · migrations/ · sql/       → 005
scripts/gates/  prebuild 게이트 7종                    → 006
```

- **`src/domain/**`은 DB와 React 양쪽에서 떼어 놓는다.** 나무 승급·정체 판정·계획 대조·WPA 카운트는 **RSC에서도, Server Action에서도, `pg_cron` 배치의 대조 테스트에서도 같은 답**을 내야 한다. 판정이 컴포넌트나 쿼리 안에 섞이면 배치가 만든 값과 화면이 만든 값이 갈라지고, 그 순간 정합성을 검증할 기준이 사라진다.
- 네이밍 — 파일·디렉터리 `kebab-case`, 컴포넌트 `PascalCase`, 함수·변수 `camelCase`, 상수 `UPPER_SNAKE`. Server Action은 **동사로 시작**한다(`approveMission`).
- **주석은 WHY만.** 무엇을 하는지는 코드가 말한다. 규제 근거가 있는 코드에는 **요구사항 ID를 주석으로 남긴다**(`// REQ-TEC-003 — 멱등 키는 클라이언트가 생성한다`). 낡은 주석은 즉시 지운다.
- 새 컴포넌트를 만들기 전에 **SRS §6.8 화면↔컴포넌트 대응표**에서 먼저 찾는다.

## 4. 검증 — 무엇이 「완료」인가

1. **태스크 파일의 Acceptance Criteria(BDD/GWT)가 곧 테스트다.** 시나리오를 테스트로 먼저 옮긴다 (`tdd` 스킬).
2. 계층으로 나눈다 — `domain/` **단위 테스트**(DB 없음) · Server Action **통합 테스트**(트랜잭션·멱등·RLS) · 화면 **Playwright 시나리오**.
3. **게이트 위반을 주입해 빌드가 실패하는 것까지 확인한다.** 게이트 7종 각각에 대해 확인하지 않으면 게이트가 있다는 증거가 없다 (`REQ-TEC-011`).
4. **RLS는 「막히는 것」을 테스트한다** — 타 보호자 `child_id`로 조회 시 **예외가 아니라 0행**. `app`↔`pii` 조인은 **권한 오류로 실패**.
5. 이 저장소에 **공개 REST API는 없다**(SRS §6.1). Swagger/OpenAPI 산출물을 만들지 않는다 — 검증 단위는 **서버 경계 전수 목록**(Server Action 20건 · Route Handler 9건)이다.

## 5. Git 규약

| 항목 | 규칙 |
| --- | --- |
| 브랜치 | **이슈 1건 = 브랜치 1개.** `feat/12-partner-webhook-contract` · `fix/…` · `docs/…` · `refactor/…` |
| 금지 | `master` 직접 커밋·푸시 · force push · `reset --hard` (사용자 확인 없이) |
| 커밋 | **한 목적 1건.** `type(scope): 한국어 요약` — 본문에 **왜**를 적는다 |
| 타입 | `feat` `fix` `docs` `refactor` `test` `chore` `perf` |
| 이슈 연결 | 푸터에 `Refs #12` / 완료 시 `Closes #12` |
| PR | 첫 푸시 직후 **draft PR**. 본문에 **diff의 의미**를 요약하고 파일 나열은 하지 않는다 |
| 마이그레이션 PR | **스키마 소유자 승인 필수** — expand-contract 분할이 지켜졌는지 본문에 명시 |
| 게이트 PR | 화이트리스트 추가·게이트 수정은 **게이트 소유자 승인 필수** |

병합이 **유일한 사람 게이트**다(빌드·배포·전환은 자동). 리뷰 없이 병합하지 않는다.

## 6. 문서를 고칠 때

- **SRS · DESIGN · PRD는 근거 문서다.** 구현 편의로 고치지 않는다. 고쳐야 한다면 **어느 요구사항이 왜 바뀌는지**를 먼저 적는다.
- `tasks/**`를 고치면 **GitHub 이슈 본문도 함께 갱신**한다 — 파일 전문이 이슈 본문이다 (`github-issue-project` 스킬).
- 일정·의존이 바뀌면 `scripts/github/manifest.json`을 갱신하고 `project_setup.py`를 **재실행**한다(멱등).
- **미결(`D-TEC-*` · `T-*`)을 해소된 것처럼 쓰지 않는다.**

## See also
- [004-runtime-boundaries.md](004-runtime-boundaries.md) · [005-data-access-rls.md](005-data-access-rls.md) · [006-prebuild-gates.md](006-prebuild-gates.md)
- 근거: SRS §6.4 · §8 · §9 · §10.4
