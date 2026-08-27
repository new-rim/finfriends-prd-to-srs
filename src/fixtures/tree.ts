/** ① 나무 화면 픽스처 — 🔴 scenario.ts에서 파생된다. 값을 여기서 지어내지 않는다 */

import type { AreaState } from "@/contracts/tree";
import { AREA_STATES, PENDING_APPROVALS } from "./scenario";

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
