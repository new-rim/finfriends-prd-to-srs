/** ⑧ 소비 내역 계약 — 계획 §15.5 */
export type HistoryItem = {
  id: string;
  merchantName: string;
  amount: number;
  date: string;
  hasPlanned: boolean;
  retroStatus: "PENDING" | "COMPLETED";
  retroId?: string;
};
