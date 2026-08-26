---
name: prebuild-gate-authoring
description: prebuild 게이트(G1~G7)를 작성·수정하고 위반 코드 주입 테스트를 붙인다. 별도 CI가 없어 빌드가 유일한 강제 지점이므로 scripts/gates/** 를 건드릴 때 사용한다.
argument-hint: "[G1~G7 또는 게이트 목적]"
allowed-tools: Read, Edit, Write, Grep, Glob, Bash
---

# 게이트 작성 절차

대상: **$ARGUMENTS**

## 1. 이 게이트가 무엇을 강제하는지 먼저 적는다

게이트 파일 머리에 **요구사항 ID와 규제 계층**을 주석으로 남긴다. 근거가 없는 게이트는 나중에 「불편하다」는 이유로 지워진다.

```js
// scripts/gates/g3-runtime-boundary.mjs
// REQ-TEC-002 · 005 — Client Component에서 DB 접근 금지 · 요청 경로에서 배치 클라이언트 금지
// 규제 계층 3(구조) — gate-ignore 허용
```

## 2. 정적 검사만 한다

- DB·네트워크에 접근하지 않는다. 빌드 시간에 들어가는 비용이다.
- 파일 스캔은 `prisma/`·`src/`·`app/`으로 범위를 좁힌다. `node_modules`·`.next`를 제외한다.
- import 그래프가 필요하면 AST를 쓴다 — 정규식으로 import를 판별하면 오탐이 난다.

## 3. `gate-ignore` 정책을 명확히 한다

| 게이트 | `// gate-ignore` |
| --- | --- |
| **G1**(별↔현금) · **G2**(금지 필드) · **G6**(AI 경계) | 🔴 **불인정** — 규제 계층 1·2. **파서가 지시자를 아예 읽지 않게** 만든다 |
| G3 · G4 · G5 · G7 | 허용. 단 **이유를 같은 줄에** 적게 강제한다 |

## 4. 위반 메시지 — 우회를 부르지 않게 쓴다

```
✗ G3 런타임 경계 위반
  src/components/StarBadge.tsx:4  import { prismaRequest } from "@/db/request"

  Client Component는 DB에 직접 접근하지 않는다 (REQ-TEC-002).
  → 읽기는 RSC(page.tsx/layout.tsx)에서 하고 props로 내린다.
  → 근거: .agents/rules/004-runtime-boundaries.md §1
```

**무엇이 · 어디서 · 왜 막혔는지 · 무엇을 대신 하라는지** 네 가지를 다 적는다.

## 5. 화이트리스트

- 게이트별 화이트리스트를 **파일 하나에 모아** 둔다 — 변경이 diff로 드러나야 한다.
- 항목마다 **왜 정적으로 판별할 수 없는지**를 주석으로 남긴다.
- **게이트 소유자 승인 사항.** PR 본문에 명시한다.

## 6. 위반 주입 테스트 — 이것이 없으면 게이트가 아니다

게이트마다 **위반 코드를 주입하면 빌드가 실패하는 것**을 확인하는 테스트를 만든다 (`REQ-TEC-011`).

```
scripts/gates/__fixtures__/g3-violation/…    위반 샘플
scripts/gates/__tests__/g3.test.mjs          러너가 exit code ≠ 0 을 내는지
```

## 7. 러너 등록 — 조용히 건너뛰어지지 않게

```json
"prebuild": "node scripts/gates/run-all.mjs",
"build":    "node scripts/gates/run-all.mjs && next build"
```

- **양쪽에서 호출**한다 — 패키지 매니저에 따라 `pre*`를 실행하지 않는 경우가 있다.
- 러너는 **자기 실행 사실을 빌드 로그에 남긴다**(게이트 이름·소요 시간·통과 여부). 배포 로그에 그 줄이 없으면 배포 소유자가 롤백한다.
- 게이트 하나가 실패하면 **나머지도 전부 돌린 뒤** 한 번에 보고한다 — 첫 실패에서 멈추면 수정-빌드 왕복이 늘어난다.

## 8. 마지막

```bash
npm run prebuild        # 전체 통과 확인
node scripts/gates/__tests__/run.mjs   # 주입 테스트 7종
```

보고 — 게이트별 **검사 대상 · 실행 시간 · 주입 테스트 위치 · 화이트리스트 변경 여부**.
