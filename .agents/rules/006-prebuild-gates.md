---
description: prebuild 게이트 7종 — 별도 CI가 없으므로 빌드가 유일한 강제 지점이다
globs: ["scripts/gates/**", "package.json"]
alwaysApply: true
---
# 006. `prebuild` 게이트 7종

> `C-TEC-007`이 *"CI/CD 설정 없이 Git Push만으로"* 를 요구하므로, **빌드가 유일한 강제 지점**이다(`C-TEC-014` · `X-2`). 게이트가 조용히 건너뛰어지면 **빌드는 성공하고 규제 통제만 사라진다** — 실패보다 나쁜 상태다.

## 등록

```json
{
  "packageManager": "npm@10",
  "scripts": {
    "prebuild": "node scripts/gates/run-all.mjs",
    "build":    "node scripts/gates/run-all.mjs && next build"
  }
}
```

**`build`에서 한 번 더 부르는 것은 중복이 아니다** — 패키지 매니저에 따라 `pre*` 스크립트를 실행하지 않는 경우가 있다. 게이트 러너는 **자기 실행 사실을 빌드 로그에 남기고**, 로그에 그 줄이 없으면 배포 소유자가 롤백한다.

## 게이트 목록

| # | 게이트 | 검사 대상 | 강제하는 것 | `gate-ignore` |
| --- | --- | --- | --- | :-: |
| **G1** | 별↔저금통 전환 경로 | 전환 함수·API 심볼 · `star`↔`cash` 변환 패턴 | `REQ-NF-010` · `CON-REG-05` | 🔴 **불인정** |
| **G2** | 금지 필드 | `schema.prisma` + 마이그레이션의 좌표(`lat`·`lng`·`geo`) · 얼굴(`face`·`photo`) | `REQ-NF-009` · `CON-REG-03`·`06` | 🔴 **불인정** |
| **G3** | 런타임 경계 | import 그래프 — Client Component → `@/db/**`, RSC → 쓰기 API, 요청 경로 → `db/batch` | `REQ-TEC-002`·`005` | 허용 |
| **G4** | Server Action 계약 | `"use server"` 파일의 export 시그니처에 `idempotencyKey` · zod 스키마 존재 | `REQ-TEC-003` | 허용 |
| **G5** | 스타일 단일 경로 | `globals.css` 외 CSS 파일 · CSS-in-JS 의존성 · 인라인 `style={{…}}` | `REQ-TEC-012` · `C-TEC-018` | 허용 |
| **G6** | AI 경계 | AI SDK import 경로가 `app/api/ops/**` 밖 · 프롬프트 변수 보간 화이트리스트 | `REQ-AI-001`·`003` · `C-TEC-017` | 🔴 **불인정** |
| **G7** | 마이그레이션 안전성 | 신규 마이그레이션의 파괴적 DDL(`DROP COLUMN`·`RENAME`·`SET NOT NULL`) | `REQ-TEC-015` · `REQ-NF-004` | 허용 |

## 작성·수정 규약

1. **게이트는 예외를 허용하지 않는 대신 「승인된 화이트리스트」를 가진다.** 화이트리스트 변경은 **게이트 소유자 승인**이 필요하고, 변경 자체가 커밋에 남는다.
2. **G1·G2·G6은 주석 지시자(`// gate-ignore`)를 인정하지 않는다** — 규제 계층 1·2다.
3. **게이트를 끄는 커밋은 0건**이어야 한다 (`REQ-TEC-011`).
4. **새 게이트를 만들면 위반 코드 주입 테스트를 함께 만든다.** 「막힌다」를 증명하지 않은 게이트는 게이트가 아니다.
5. 게이트는 **빠르게 실패**한다 — 정적 검사만 하고 DB·네트워크에 접근하지 않는다. 빌드 시간에 들어가는 비용이므로.
6. 위반 메시지에 **어느 요구사항이 왜 막았는지**를 적는다. 「G3 violation」만 나오면 우회 시도가 뒤따른다.

## 게이트가 막지 못하는 것 — 사람이 봐야 하는 자리

| 항목 | 왜 정적 검사로 안 되나 | 누가 |
| --- | --- | --- |
| 컴포넌트 재사용 (`src/components/ui/**` 우선) | 「비슷한 컴포넌트」 판단이 필요 | 코드 리뷰 |
| 아동 화면 접근성 (터치 ≥ 44px · 대비 4.5:1) | 렌더 결과를 봐야 한다 | 화면 검수 |
| 환경 변수 스코프 (Preview에 운영 시크릿) | 저장소 밖(Vercel 설정)이다 | 배포 소유자 · `env-and-secrets` 스킬 |
| 리전 고정 (`ap-northeast-2` · `icn1`) | 플랫폼 설정이다 | 배포 소유자 |

## See also
- [004-runtime-boundaries.md](004-runtime-boundaries.md) · [005-data-access-rls.md](005-data-access-rls.md)
- 스킬: `prebuild-gate-authoring`
- 근거: SRS §6.6 · §4.2 `REQ-TEC-011` · §9.3
