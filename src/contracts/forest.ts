/** ⑥ 월간 숲 계약 — 계획 §15.3 */
export type ForestMonthData = {
  month: string; // "2026-06", "2026-07", "2026-08"
  treeCount: number;
  sproutCount: number;
  seedCount: number;
};

export type ForestDeltaHighlight = {
  id: string;
  title: string;
  description: string;
};

export type ForestSummary = {
  currentMonth: string;
  monthsData: ForestMonthData[];
  highlights: ForestDeltaHighlight[];
  isFirstMonth: boolean;
};
