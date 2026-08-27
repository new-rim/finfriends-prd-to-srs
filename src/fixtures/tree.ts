/** ① 나무 화면 픽스처 — 🔴 scenario.ts에서 파생된다. 값을 여기서 지어내지 않는다 */

import type { AreaState } from "@/contracts/tree.ts";
import { AREA_STATES, PENDING_APPROVALS } from "./scenario.ts";

export type TreeView = { states: AreaState[]; pendingApprovals: number };

/** 기본 — 시나리오 그대로(잘 써요 승급 · 모아요 정체) */
export const treeDefault: TreeView = {
  states: AREA_STATES,
  pendingApprovals: PENDING_APPROVALS,
};

/** 빈 상태 변형 — 이번 달 실천 0건(ACE-1.1). 스냅샷 검수용 */
export const treeNoPractice: TreeView = {
  states: AREA_STATES.map((s) => ({
    ...s,
    stage: "SEED" as const,
    progress: { learn: 0, quiz: 0, practice: 0 },
    daysSinceChange: 0,
    promotedThisCycle: false,
  })),
  pendingApprovals: 0,
};

/**
 * 승급 완료 변형 — 「나무」 단계 도형 검수용.
 * 🔴 기본 시나리오(§14.1)를 바꾸지 않는다. 계획 §5.4가 3단계 도형을 확정했는데
 *    기본 상태에는 씨앗·새싹만 나와 세 번째 단계를 눈으로 확인할 자리가 없다.
 *    빈 상태를 ?state=empty로 뜬 것과 같은 방식이다.
 */
export const treeGrown: TreeView = {
  states: AREA_STATES.map((s) =>
    s.area === "SPEND"
      ? { ...s, stage: "TREE" as const, progress: { learn: 3, quiz: 5, practice: 3 }, promotedThisCycle: true }
      : s,
  ),
  pendingApprovals: PENDING_APPROVALS,
};
