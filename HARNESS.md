# AI 에이전트 하네스 — 구성과 근거

이 저장소의 에이전트 하네스는 **[`wild-mental/AI-multivender-harness-sample`](https://github.com/wild-mental/AI-multivender-harness-sample)** 의 구조를 가져와 **FinFriends의 실제 스택(Next.js · Vercel · Supabase)에 맞게 재작성**한 것이다. 아래는 **무엇을 가져오고 · 무엇을 고치고 · 무엇을 버렸고 · 무엇을 새로 채택했는가**의 기록이다.

---

## 1. 구조

```
AGENTS.md                    ← 항상 로드되는 공통 규칙 (Claude·Cursor·Antigravity·Gemini·Copilot 공용)
CLAUDE.md                    ← @AGENTS.md 임포트 + Claude 전용 라우팅 (중복 없음)
HARNESS.md                   ← 이 문서

.agents/                     ← 단일 출처 (Single Source of Truth)
├─ rules/      001~006       상시 적용 규칙
├─ skills/     21종          절차 — 저장소 작성 8 + 마켓플레이스 채택 13
└─ workflows/  task-to-pr    종단 워크플로우

.claude/
├─ settings.json             권한 (allow 42 · ask 10 · deny 11)
├─ agents/     4종           서브에이전트
└─ skills/     → 심볼릭 링크  ../../.agents/skills/*

skills-lock.json             채택 스킬 버전 고정 (해시)
```

**스킬은 `.agents/skills/`에만 실체가 있고 `.claude/skills/`는 상대 심볼릭 링크다.** 샘플 하네스 `README-common-harness.md` §3의 「Symlink 적극 활용」 전략을 그대로 따랐다 — 실체가 하나이므로 도구를 추가해도 중복 유지보수가 없다.

**Cursor·Gemini용 디렉터리를 따로 만들지 않았다.** 두 도구 모두 `AGENTS.md`와 `.agents/`를 읽는다. 필요해지면 한 줄로 붙인다.

```bash
ln -s ../.agents/skills .cursor/skills
ln -s ../.agents/rules  .cursor/rules      # Cursor 네이티브 룰이 필요할 때만
```

---

## 2. 룰 — 샘플에서 무엇이 바뀌었는가

| 샘플 | 이 저장소 | 처리 |
| --- | --- | --- |
| `AGENTS.md` (템플릿 · Spring/FastAPI 예시) | `AGENTS.md` — **어길 수 없는 것 12조** + 성능 예산 | 🔧 **전면 재작성.** 템플릿 문구를 실제 제약(`C-TEC-*`)으로 교체 |
| `CLAUDE.md` (스택·서브에이전트 표 중복 기재) | `CLAUDE.md` — `@AGENTS.md` 임포트 + 라우팅만 | 🔧 **중복 제거.** 항상 로드되는 파일을 41줄로 축소 |
| `001-project-overview.md` (플레이스홀더) | `001` — 가치 선언 2개 · 범위 · **명시적 제외** · 승인 주체 | 🔧 재작성 |
| `002-tech-stack.md` (Java 21 · Spring Boot 4 · MySQL · FastAPI) | `002` — Next.js · Vercel · Supabase · Prisma · **환경 변수 스코프 표** | 🔧 **스택 전면 교체** |
| `003-development-guidelines.md` (Vite+React SPA · 마이크로서비스) | `003` — **규제 계층 3단** · 성능 예산 · Git 규약 · 검증 | 🔧 재작성 |
| — | **`004-runtime-boundaries.md`** (신설) | ➕ 이 저장소의 **백엔드 아키텍처 규칙** |
| — | **`005-data-access-rls.md`** (신설) | ➕ 2클라이언트 · RLS 2계층 · expand-contract |
| — | **`006-prebuild-gates.md`** (신설) | ➕ 게이트 G1~G7 |

### 백엔드 규칙을 어떻게 옮겼는가

샘플의 백엔드 규칙은 **Spring Boot 3층(Controller-Service-Repository)** 전제다. 이 저장소에는 그 층이 없다 — 단일 프레임워크에서 층을 나누는 축은 **「어디에서 실행되는가」**이고, 그것이 곧 보안 경계다. 그래서 아래처럼 사상했다.

| 샘플 규칙 | 이 저장소의 대응 | 왜 |
| --- | --- | --- |
| `306-three-tier-architecture-rules` (425줄 · Controller/Service/Repository) | `004` **런타임 경계 4종** + `src/domain/` 순수 함수 | 층이 아니라 **실행 위치**가 경계다. Client는 DB를 못 보고, RSC는 쓰지 못한다 |
| `304-api-rest-design-rules` (REST 리소스 네이밍 · 응답 엔벌로프) | `004` §4 **Server Action 계약** · §5 Route Handler 규약 | SRS §6.1이 *"공개 REST API를 제공하지 않는다"* 고 확정했다. 쓰기는 함수 호출이고, Route Handler는 **웹훅·배치 진입 전용**이다 |
| `305-api-swagger-testing-rules` (Swagger UI에서 Try-it-out) | `003` §4 **검증** — `domain` 단위 · Action 통합 · Playwright 시나리오 · **게이트 위반 주입** | 공개 API가 없으므로 Swagger 산출물이 없다. 검증 단위는 **서버 경계 전수 목록**(Action 20 · Handler 9) |
| `303-database-mysql-jpa-rules` (MySQL InnoDB · JPA 연관관계) | `005` — Prisma · **RLS 2계층** · `pii` 권한 회수 · 원장 동시성 | RLS·advisory lock·`pg_cron`은 MySQL/JPA 규칙으로 표현할 수 없다 |
| `100-error-fixing-process` (7단계) | `fix-error` 스킬 — **7단계 유지** + 이 저장소 단골 원인 10종 | 골격은 그대로 좋다. 「RLS 정상 동작 중인데 빈 결과」 같은 것을 먼저 대조하게 했다 |
| `200-git-commit-push-pr` · `102-gitflow-agent` | `gitflow-commit` 스킬 — 한국어 커밋 · **승인자 명시** PR 템플릿 | 이 저장소는 커밋 메시지가 한국어이고, 마이그레이션·게이트 변경에 **승인 주체**가 있다 |
| `101-build-and-env-setup` | `env-and-secrets` 스킬 — **Preview 스코프 감사** 우선 | Git Push가 곧 배포이므로 최대 위험은 빌드가 아니라 **Preview에 운영 시크릿** |
| `202-github-issue-handling` | `github-issue-project` 스킬 — 이 저장소 46이슈·manifest·Project(v2) 실측 반영 | 이슈·라벨·마일스톤·필드·뷰가 **이미 만들어져 있다.** 「다시 만들지 않는다」를 규칙으로 |
| `201-code-commenting` ("항상 주석") | `003` §3 — **WHY만 · 요구사항 ID 주석** | "Always include meaningful comments"는 WHAT 주석을 양산한다 |

### 버린 것 — 이 프로젝트에 해당이 없다

`300-java-spring-cursor-rules` · `301-gradle-groovy-rules` · `302-jpa-querydsl-dynamic-query-rules` · `302-python-fastapi-rules` · `303-spring-redis-lettuce-redisson-rules` · `304-kafka-data-pipeline-rules` · `305-kafka-msa-saga-pattern-rules` · `307-flutter-riverpod-supabase-ai-rules` · `.claude/agents/{java-spring,gradle,jpa-querydsl,spring-redis,kafka-pipeline,kafka-saga,flutter-app}.md`

→ **Java/Spring · Gradle · JPA/QueryDSL · Redis · Kafka · FastAPI · Flutter는 `C-TEC-001`~`007`이 배제한다.** 남겨두면 에이전트가 없는 스택을 제안한다.

`306-react-vite-tailwind-rules` · `.claude/agents/react-frontend.md`
→ **Vite SPA 전제라 App Router와 충돌한다.** `vercel-react-best-practices`(마켓플레이스)로 대체.

`generate-tasks-from-srs` (workflow · skill) · `generate-cursor-rule`
→ 태스크 46건이 **이미 추출·검토·등록 완료**다. 이 저장소의 추출 방법론은 `METHODOLOGY_task-extraction.md`·`REPORT_task-extraction-review.md`에 더 자세히 있다.

`.cursor/agents/document-updater.md` · `.gemini/agents/readme-architect.md`
→ 도구 종속 중복. `AGENTS.md` 하나로 커버.

---

## 3. 스킬 — 21종

### 이 저장소가 작성한 것 (8)

| 스킬 | 무엇을 하나 |
| --- | --- |
| `task-kickoff` | 태스크 1건 착수 — 선행·**착수 차단 판정** · SRS 근거 열람 · 브랜치 · AC 테스트화 |
| `server-action-contract` | Server Action을 SRS §6.4 골격대로 작성·점검 (**체크리스트 13항**) |
| `rls-and-migration` | RLS 정책 · expand-contract 3단계 · 「막히는 것」 테스트 |
| `prebuild-gate-authoring` | 게이트 작성 + **위반 주입 테스트** · 화이트리스트 규약 |
| `env-and-secrets` | Preview 스코프 감사 · 접속 문자열 · 리전 고정 · `NEXT_PUBLIC_` 감사 |
| `gitflow-commit` | 이슈 브랜치 · 한국어 원자 커밋 · 승인자 명시 draft PR |
| `fix-error` | 7단계 진단 + 이 저장소 단골 원인 10종 대조 |
| `github-issue-project` | 이슈 본문 갱신 · manifest → Project 재기입 · 검증 쿼리 |

### 마켓플레이스에서 채택한 것 (13)

[skills.sh](https://www.skills.sh/)에서 확인해 **개발 목표에 직접 대응하는 것만** 골랐다. 설치는 `npx skills add`이며 `skills-lock.json`에 해시가 고정된다.

| 스킬 | 출처 | 왜 이것인가 |
| --- | --- | --- |
| `supabase` | `supabase/agent-skills` | Auth(보호자 전용) · RLS · CLI · 로컬 Supabase · `pg_cron`/`pg_net` — `C-TEC-003` 전면 |
| `supabase-postgres-best-practices` | `supabase/agent-skills` | 스키마·인덱스·RLS 테스트·파티셔닝·EXPLAIN·커넥션 고갈 — `005`가 요구하는 실무 근거 |
| `prisma-client-api` | `prisma/skills` | `$transaction` · 쿼리 작성 — `withGuardian()` 래퍼의 기반 |
| `prisma-cli` | `prisma/skills` | `migrate dev --create-only` 중심 마이그레이션 흐름 |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | RSC·데이터 페칭·번들 — §8 런타임 예산(1,250ms · 800ms)에 직결 |
| `vercel-composition-patterns` | `vercel-labs/agent-skills` | 컴포넌트 API 설계 — UI/UX 9건이 shadcn 위에 도메인 컴포넌트를 쌓는다 |
| `shadcn` | `shadcn-ui/ui` | `C-TEC-004`가 shadcn/ui를 **강제**한다. 컴포넌트 추가·구성의 공식 절차 |
| `playwright-cli` | `microsoft/playwright-cli` | AC 시나리오(BDD/GWT) 46건분을 E2E로 옮기는 수단 |
| `tdd` | `mattpocock/skills` | 태스크마다 AC가 먼저 있다 — 테스트 우선이 이 저장소의 기본 흐름 |

**작업 방식 4종** — `wild-mental` 계열. 이 저장소의 상태(미결 12건 · PR 단위 실행 · 장기 실행 목표)에 직접 대응한다.

| 스킬 | 출처 | 왜 이것인가 |
| --- | --- | --- |
| `grill-it` | `wild-mental/grill-it-skill` | 🔴 **미결 12건**(`D-TEC-1`~`8` · `T-1`~`4`)이 착수를 막고 있다. 범위를 정해 미해소 결정 토픽을 추출·의존 순서로 해소하고 **결정을 SRS·태스크·하네스에 즉시 반영**한다 — `task-kickoff`가 「멈추고 보고」한 지점을 여는 도구 |
| `goal-setting` | `wild-mental/goal-setting-skill` | 태스크 46건을 장기 실행 에이전트에 넘길 때 **종료 조건**이 필요하다. 실행 가능성·증명 가능성·범위 한정 3원칙으로 `/goal` 프롬프트를 설계한다 (실행은 하지 않는다) |
| `review-merge` | `wild-mental/review-merge-skill` | **REVIEW → MERGE.** PR마다 검증 게이트를 통과해야 머지 — 규제 게이트가 걸린 태스크(`gate:regulatory`)와 임계 경로 9건의 기본 모드 |
| `merge-review` | `wild-mental/merge-review-skill` | **MERGE → REVIEW.** 앞 PR이 뒤 PR 없이는 dead code인 응집 묶음(예: `FR-002`→`FR-003`→`FR-004` 데이터 계층)을 bottom-up 머지 후 통합 검토. `review-merge`의 **역 모드이며 중복이 아니다** — 각 스킬 §1·§2가 어느 쪽인지 판정한다 |

### 검토했지만 채택하지 않은 것

| 스킬 | 이유 |
| --- | --- |
| `deploy-to-vercel` · `vercel-cli-with-tokens` | 🔴 **`C-TEC-007`과 충돌** — 배포는 **Git Push만**이다. CLI 배포 경로를 여는 것은 릴리스 통제를 우회하는 것 |
| `frontend-design` · `web-design-guidelines` | `C-TEC-018`·게이트 G5가 스타일 경로를 `globals.css` + Tailwind + shadcn으로 **좁혀 놓았다.** 일반적 디자인 지침이 이 제약과 충돌할 소지가 크고, 디자인 시스템은 `UX-001`이 확정한다 |
| `code-review` · `improve-codebase-architecture` | Claude Code 내장 `/code-review`·`/security-review`와 중복 |
| `webapp-testing` | `playwright-cli`와 중복 |
| `vercel-optimize` | 배포 후 비용·성능 최적화용. 착수 전 단계에서 이르다 — R1 이후 재검토 |
| `prisma-postgres` · `prisma-database-setup` | Prisma Postgres(자체 호스팅 서비스)·다중 DB 프로바이더용. DB는 **Supabase로 확정**되어 있다 |
| `vercel-react-native-skills` · `migrate-radix-to-base` | 해당 없음 (`C-TEC-008` PWA 단일 · shadcn 기본 구성 유지) |

---

## 4. 서브에이전트 (4)

| 에이전트 | 규범 | 주입 스킬 |
| --- | --- | --- |
| `nextjs-server-boundary` | `.agents/rules/004` | `vercel-react-best-practices` · `vercel-composition-patterns` |
| `supabase-postgres` | `.agents/rules/005` | `supabase-postgres-best-practices` · `supabase` · `prisma-client-api` · `prisma-cli` |
| `prebuild-gates` | `.agents/rules/006` | — |
| `pwa-offline-push` | `.agents/rules/004` §8 | `playwright-cli` |

샘플의 8개 에이전트(Java/Gradle/JPA/Redis/Kafka×2/React/Flutter)를 **전부 교체**했다. 이름만 바꾼 것이 아니라 **각 에이전트의 「반드시 지키는 것」이 요구사항 ID로 근거를 갖는다.**

---

## 5. 유지보수

```bash
npx skills ls                  # 설치된 스킬 목록
npx skills update -p -y        # 채택 스킬 갱신 (skills-lock.json 해시 갱신)
npx skills find <query>        # 새 스킬 탐색
```

- **채택 스킬을 직접 수정하지 않는다.** 갱신 시 덮어써진다. 이 저장소의 판단을 넣어야 하면 `.agents/rules/`에 적고 스킬은 참조만 한다.
- **새 스킬을 채택할 때** — §3의 「검토했지만 채택하지 않은 것」 기준을 먼저 적용한다. `C-TEC-*`와 충돌하거나 내장 기능과 중복되면 넣지 않는다.
- **룰을 추가할 때** — 항상 적용은 `AGENTS.md`, 도메인 지식은 `.agents/rules/`, 절차는 `.agents/skills/`. `AGENTS.md`는 **항상 로드되므로 짧게** 유지한다.
- 스킬을 추가하면 `.claude/skills/`에 심볼릭 링크가 걸렸는지 확인한다.

```bash
ln -sfn ../../.agents/skills/<name> .claude/skills/<name>
```

## 6. 자율성 수준별 대응 (샘플 README의 5단계)

| 수준 | 이 저장소 |
| :-: | --- |
| **L1 Rules** | `AGENTS.md` · `.agents/rules/001~006` |
| **L2 Skills** | `.agents/skills/` 17종 |
| **L3 Hooks/권한** | `.claude/settings.json` — 파괴적 명령 `deny` · 상태 변경 `ask` |
| **L4 Subagents** | `.claude/agents/` 4종 |
| **L5 Workflows** | `.agents/workflows/task-to-pr.md` — 8단계 · 멈춰야 하는 신호 5종 |
