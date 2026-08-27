/** ⑤ 미션 목록 계약 — 계획 §15.2 */
export type MissionStatus = "AVAILABLE" | "WAITING" | "REJECTED" | "COMPLETED";

export type MissionItem = {
  id: string;
  title: string;
  rewardStars: number;
  status: MissionStatus;
  category: "EARN" | "SPEND" | "SAVE";
  rejectionReason?: string;
};
