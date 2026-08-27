/**
 * 나무 성장 단계·승급 조건 — 계획 §3.1
 *
 * 🔴 이 수치는 잠정이다. PRD §7-3의 미결(나무 성장 단계 수·조건 수치·
 *    매달 조건 상승 여부)은 여전히 팀 결정 대기다. 「확정」으로 서술하지 않는다.
 *    PRD 부록 B를 옮기고 비어 있던 한 칸(씨앗→새싹 실천 N)을 N=1로 채운 값이다.
 */

import type { AreaCode } from "./areas";

export type Stage = "SEED" | "SPROUT" | "TREE";

export const STAGE_LABEL: Record<Stage, string> = {
  SEED: "씨앗",
  SPROUT: "새싹",
  TREE: "나무",
};

/** 조건 3종 — 학습 · 퀴즈 · 실천 */
export type Conditions = { learn: number; quiz: number; practice: number };

/** 다음 단계로 가기 위한 조건 — 계획 §3.1 */
export const PROMOTION: Record<"SEED" | "SPROUT", Conditions> = {
  SEED: { learn: 1, quiz: 1, practice: 1 },   // 씨앗 → 새싹 (실천 N=1로 채움)
  SPROUT: { learn: 3, quiz: 5, practice: 1 }, // 새싹 → 나무 (PRD 부록 B 그대로)
};

/** 정체 판정 — PRD US-3 AC1. 🔴 이것만은 잠정이 아니라 확정값이다 */
export const STALL_DAYS = 14;

export type AreaState = {
  area: AreaCode;
  stage: Stage;
  /** 이번 주기에 채운 양 */
  progress: Conditions;
  /** 실천 경로가 MVP에서 닫혀 있는가 — GROW만 true(F15 Could) */
  locked: boolean;
  /** 마지막 승급 이후 경과 일수. STALL_DAYS 이상이면 정체 */
  daysSinceChange: number;
  /** 이번 달에 승급했는가 — 변화 문장(§5.2)의 입력 */
  promotedThisCycle: boolean;
};

/** 남은 조건 — 가장 적게 남은 것이 먼저 온다(ACE-3.1) */
export function remainingConditions(
  s: AreaState,
): { label: string; remaining: number }[] {
  if (s.stage === "TREE") return [];
  const need = PROMOTION[s.stage];
  return (
    [
      { label: "실천", remaining: need.practice - s.progress.practice, unit: "회" },
      { label: "학습", remaining: need.learn - s.progress.learn, unit: "회" },
      { label: "퀴즈", remaining: need.quiz - s.progress.quiz, unit: "개" },
    ] as const
  )
    .filter((c) => c.remaining > 0)
    .map((c) => ({ label: `${c.label} ${c.remaining}${c.unit} 남음`, remaining: c.remaining }))
    .sort((a, b) => a.remaining - b.remaining);
}

export function isStalled(s: AreaState): boolean {
  return !s.locked && s.stage !== "TREE" && s.daysSinceChange >= STALL_DAYS;
}
