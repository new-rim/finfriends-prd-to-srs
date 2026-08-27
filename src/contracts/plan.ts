/** ⑦ 계획 카드 계약 — 계획 §15.4 */
export type PlanSummary = {
  monthlyBudget: number;
  usedAmount: number;
  hasPlan: boolean;
  categoryName: string; // "잘 써요"
  guidanceText: string;
};
