# FinFriends — Claude Code 하네스

공통 규칙은 아래 파일을 그대로 따른다. **중복해서 적지 않는다.**

@AGENTS.md

---

## 서브에이전트 라우팅 (`.claude/agents/`)

| 에이전트 | 언제 위임하나 |
| --- | --- |
| `nextjs-server-boundary` | Server Action · Route Handler · RSC · 라우트 그룹 · 캐시/재검증 · `src/domain/**` 판정 로직 |
| `supabase-postgres` | Prisma 스키마 · 마이그레이션 · RLS 정책 · `pg_cron`/`pg_net` · 커넥션·쿼리 성능 |
| `prebuild-gates` | `scripts/gates/**` 작성·수정 · 게이트 위반 주입 테스트 · 화이트리스트 검토 |
| `pwa-offline-push` | Service Worker · IndexedDB 오프라인 큐 · Web Push/VAPID · SMS 폴백 · 플랫폼 분기 |

호출: `> use the nextjs-server-boundary subagent to …`

## 스킬 (`.claude/skills/` → `.agents/skills/` 심볼릭 링크)

**이 저장소가 작성한 절차** — `task-kickoff` · `server-action-contract` · `rls-and-migration` · `prebuild-gate-authoring` · `env-and-secrets` · `gitflow-commit` · `fix-error` · `github-issue-project`

**마켓플레이스 채택 — 스택** `supabase` · `supabase-postgres-best-practices` · `prisma-client-api` · `prisma-cli` · `vercel-react-best-practices` · `vercel-composition-patterns` · `shadcn` · `playwright-cli` · `tdd`

**마켓플레이스 채택 — 작업 방식** `grill-it`(착수 전 미결 해소) · `goal-setting`(`/goal` 프롬프트 설계) · `review-merge`(REVIEW→MERGE) · `merge-review`(MERGE→REVIEW)

출처·채택 근거·갱신 방법은 `HARNESS.md`에 있다.

## 이 저장소에서 자주 쓰는 것

```bash
python3 scripts/github/project_setup.py      # Project(v2) 필드·아이템·값 재기입 (멱등)
python3 scripts/github/project_views.py      # 뷰 6종 + 프로젝트 README
gh issue list -R new-rim/finfriends-prd-to-srs -l critical-path   # 임계 경로 9건
npx skills update -p -y                      # 채택 스킬 갱신
```

## 문서를 고칠 때

- **SRS·DESIGN·PRD는 근거 문서다.** 구현 편의로 고치지 않는다. 고쳐야 한다면 **어느 요구사항이 왜 바뀌는지**를 먼저 적는다.
- 태스크 파일(`tasks/**`)을 고치면 **GitHub 이슈 본문도 갱신**한다 — 파일 전문이 이슈 본문이다.
- 새 규칙을 추가할 때: **항상 적용은 `AGENTS.md`, 도메인 지식은 `.agents/rules/`, 절차는 `.agents/skills/`.**
