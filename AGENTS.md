# FinFriends — 에이전트 공통 규칙

> **이 파일은 항상 로드된다.** Claude Code(`CLAUDE.md`가 임포트) · Cursor · Antigravity · Gemini CLI · Copilot이 공통으로 읽는다.
> 상세 규칙은 `.agents/rules/`에, 절차는 `.agents/skills/`에 있다. 여기에는 **어길 수 없는 것만** 적는다.

---

## 0. 이 저장소가 무엇인가

**아동 금융교육 서비스 FinFriends**를 기획 문서로부터 구현하는 저장소다. 2026-08 현재 **애플리케이션 코드는 아직 없고**, 기획·설계·태스크가 확정되어 있다. 착수 기준일은 **2026-09-07**이다.

| 문서 | 지위 |
| --- | --- |
| `tech-design-docs/[SRS]SRS_finfriends-nextjs-v1_0.md` | 🔴 **구현의 최종 근거.** 절 번호로 인용한다 |
| `tech-design-docs/[Diagrams]DESIGN_finfriends-v1_0.md` | 유스케이스·시퀀스·클래스·배치 설계 |
| `tech-design-docs/[PRD]finfriends-prd-v1_0.md` | 제품 요구 원본 |
| `tasks/stage-N/{FR,UX}-###_*.md` | **한 파일 = GitHub 이슈 1건.** 46건이 `#1`~`#46`으로 등록되어 있다 |
| `FASTTRACK_finfriends-nextjs-v1_0.md` | 일정·의존·임계 경로 (압축 편성 56 영업일) |

**코드를 쓰기 전에 반드시** 해당 태스크 파일의 `References` 절에 적힌 SRS 절을 읽는다. 태스크 파일은 요약이고, 판단 근거는 SRS에 있다.

---

## 1. 어길 수 없는 것 — 12조

### ① 스택은 설계 변수가 아니다
`C-TEC-001`~`007`은 **발주 제약**이다. Next.js(App Router) 단일 풀스택 · Vercel 단일 배포 · Supabase 단일 DB · Prisma · Tailwind + shadcn/ui · Vercel AI SDK(Gemini) · Git Push 배포. **대안을 제안하기 전에 SRS §1.5를 읽고, 제안한다면 §1.6 충돌 표에 추가할 것을 함께 제시한다.**

### ② 런타임 경계를 넘지 않는다
| 하는 일 | 있어야 할 곳 |
| --- | --- |
| **읽기** | RSC (`app/**/page.tsx`, `layout.tsx`) |
| **쓰기** | Server Action (`src/actions/**`, `"use server"`) |
| **외부 진입·배치** | Route Handler (`app/api/**/route.ts`) |
| **상호작용·낙관적 UI** | Client Component |
| **판정 로직** | `src/domain/**` — 순수 함수. DB·React 비의존 |

**Client Component는 `@/db/**`를 import하지 않는다. RSC는 쓰기를 하지 않는다.** 게이트 G3가 빌드에서 막는다.

### ③ 화면 분리는 폴더로 강제한다
`app/(public)/` · `app/(guardian)/` · `app/(child)/` · `app/(ops)/`. **아동 화면은 예외 없이 `(child)` 아래**에 둔다 — `app/(child)/layout.tsx`가 동의 게이트의 **유일한 확정 판정 지점**이다(`REQ-TEC-001` · `X-1`).

### ④ 모든 Server Action은 같은 골격을 통과한다
`zod 검증` → `withGuardian()` → `동의 재확인` → `원자 기입` → `같은 트랜잭션에 이벤트 적재` → `자기가 바꾼 태그만 revalidate`. **`idempotencyKey`(클라이언트 생성 UUIDv7)는 필수 인자**다(`REQ-TEC-003`). 골격 밖의 쓰기는 게이트 G4가 빌드 실패로 처리한다. 상세: `.agents/rules/004-runtime-boundaries.md`

### ⑤ DB 접근은 요청용/배치용을 섞지 않는다
`src/db/request.ts`(롤 `app_request` · RLS 적용) · `src/db/batch.ts`(서비스 롤 · RLS 우회). **배치용 클라이언트를 Server Action·RSC에서 import하면 안 된다**(게이트 G3). 요청용의 모든 쿼리는 `withGuardian()` 트랜잭션 **안에** 있다 — 밖의 쿼리는 정책이 꺼진 쿼리다. 상세: `.agents/rules/005-data-access-rls.md`

### ⑥ `pii` 스키마는 조인하지 않는다
`app_request` 롤은 `pii`에 `USAGE` 권한이 없다 — 조인이 **파싱 단계에서 실패**하는 것이 정상이다. 접근은 `upsert_identity` · `get_identity_ref` · `verify_owner` **함수 3개로만** 한다. 조인이 필요하면 **그 요구를 되돌린다.**

### ⑦ 스타일 경로는 하나다
`app/globals.css` 1개 + Tailwind 유틸리티 + `src/components/ui/**`(shadcn/ui). **별도 CSS 파일 · CSS-in-JS · 인라인 `style={{…}}` · 임의 색상 리터럴 금지**(게이트 G5 · `C-TEC-018`). 새 컴포넌트를 만들기 전에 SRS §6.8 대응표에서 먼저 찾는다.

### ⑧ AI는 아동·보호자 런타임에 없다
AI SDK import는 **`app/api/ops/**` 아래에서만** 허용된다(게이트 G6). 프롬프트에 **아동 식별자·금액·가맹점명·자유 입력 원문을 넣지 않는다**(`C-TEC-017`). 기본값은 `AI_ENABLED=false`이며, 이 값이 `false`여도 요구사항 35건은 전부 성립한다.

### ⑨ 게이트를 끄지 않는다
`prebuild` 게이트 **G1~G7**이 유일한 강제 지점이다(별도 CI가 없다 · `C-TEC-014`). **G1·G2·G6은 `// gate-ignore` 주석을 인정하지 않는다** — 규제 계층 1·2다. 게이트를 끄는 커밋·화이트리스트 추가는 게이트 소유자 승인 사항이다. 목록: `.agents/rules/006-prebuild-gates.md`

### ⑩ 마이그레이션은 expand-contract다
한 배포에 **파괴적 DDL(`DROP COLUMN` · `RENAME` · 기존 칼럼 `NOT NULL` 추가)을 넣지 않는다**(게이트 G7 · `REQ-TEC-015`). 롤백은 코드만 되돌린다 — **「코드를 되돌려도 DB가 앞서 있어도 동작하는 상태」**를 항상 유지한다.

### ⑪ 운영 데이터를 로컬로 내리지 않는다
재현이 필요하면 **합성 시드 + 익명화된 이벤트**만 쓴다. 편의 문제가 아니라 규제 계층이다. 로컬도 **RLS를 켠 채 · 풀러 모드로** 검증한다.

### ⑫ 미결을 해소된 것처럼 쓰지 않는다
`D-TEC-1`~`8`(SRS §14) · `T-1`~`4`(§13.3)은 **외부 답을 기다리는 항목**이다. 특히 `D-TEC-1`(국외이전 법률 검토)은 🔴 미해결이며 **일반 공개 가부가 여기에 걸려 있다.** 코드·문서·커밋 메시지에서 이들을 닫힌 것으로 서술하지 않는다.

---

## 2. 성능·정합성 예산 — 편의를 위해 넘기지 않는다

| 지표 | 상한 | 근거 |
| --- | --- | --- |
| 성장 나무 조회 | **p95 ≤ 1,250ms** | `REQ-NF-001` · §8.1 |
| ⭐ 지급 → 화면 반영 | **p95 ≤ 800ms** | `REQ-NF-002` · §8.2 |
| 월 가용성 | **≥ 99.0%** | `REQ-NF-004` · §8.3 |
| 별 원장 정합성 | **불일치 0% — 허용 오차 없음** | `REQ-NF-006` · §6.5 |
| 동의 미완 진입 차단 | **100%** | `REQ-NF-008` · §3.3 |
| 오프라인 기록 손실 · ⭐ 중복 | **각 0건** | `REQ-NF-003` · §6.7 |

`revalidatePath("/")` 한 줄이 800ms 예산을 통째로 날린다. **재검증은 태그 단위로만** 한다.

---

## 3. 작업 방식

1. **태스크 파일 → SRS 절 → 코드** 순서로 읽는다. 순서를 건너뛰면 근거 없는 구현이 된다.
2. **Acceptance Criteria가 곧 테스트다.** 태스크 파일의 BDD/GWT 시나리오를 테스트로 먼저 옮긴다(`tdd` 스킬).
3. **브랜치 = 이슈 1건.** `feat/<이슈번호>-<슬러그>`. `master`에 직접 커밋·푸시하지 않는다.
4. **커밋은 한 목적 1건.** `type(scope): 요약` — 본문에 **왜**를 적는다(diff가 무엇을 말한다). 이 저장소의 커밋 메시지는 **한국어**다.
5. **주석은 WHY만.** 무엇을 하는지는 코드가 말한다. 낡은 주석은 즉시 지운다.
6. **파괴적 명령은 확인 없이 실행하지 않는다** — force push, `reset --hard`, `DROP`, 운영 환경 변수 변경.

---

## 4. 상세 규칙·절차의 위치

| 알아야 할 것 | 어디에 |
| --- | --- |
| 제품 개요·가치 선언·지표 | `.agents/rules/001-project-overview.md` |
| 스택·버전 고정 방침·환경 변수 | `.agents/rules/002-tech-stack.md` |
| 개발 표준·Git·검증·규제 계층 | `.agents/rules/003-development-guidelines.md` |
| 런타임 경계·라우트 그룹·Server Action 계약 | `.agents/rules/004-runtime-boundaries.md` |
| 2클라이언트·RLS 2계층·`pii`·마이그레이션 | `.agents/rules/005-data-access-rls.md` |
| `prebuild` 게이트 G1~G7 | `.agents/rules/006-prebuild-gates.md` |
| 절차(스킬) 목록 | `.agents/skills/` — `HARNESS.md` §3 표 참고 |
