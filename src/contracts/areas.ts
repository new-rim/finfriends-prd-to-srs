/**
 * 4영역 표기·설명의 단일 출처 — 계획 §4.1 · 규칙 §5
 *
 * 🔴 화면은 이 상수만 쓴다. 문자열 리터럴을 직접 쓰지 않는다.
 *    두 화면이 같은 것을 다르게 부르는 순간 CON-REG-02 · REQ-NF-014 ·
 *    UX-001 Scenario 4가 한꺼번에 깨진다.
 *
 * 🔴 PRD 문서 명칭(벌기·잘 쓰기·모으기·불리기)은 화면에 나오지 않는다.
 *    코드 식별자로만 남는다.
 */

export type AreaCode = "EARN" | "SPEND" | "SAVE" | "GROW";

export const AREA_ORDER: readonly AreaCode[] = ["EARN", "SPEND", "SAVE", "GROW"];

export const AREAS: Record<AreaCode, { label: string; description: string }> = {
  EARN: { label: "벌어요", description: "미션을 해내면 별을 받아요" },
  SPEND: { label: "잘 써요", description: "쓰기 전에 미리 적어두고, 지키면 별을 받아요" },
  SAVE: { label: "모아요", description: "갖고 싶은 걸 정하고 조금씩 모아요" },
  GROW: { label: "늘려요", description: "모아둔 돈이 시간이 지나면 스스로 늘어나요" },
};

/**
 * 빈 화면 문구 3종 — 계획 §12 · 규칙 §13
 * 🔴 언제나 두 줄이다: 「지금 상태」 + 「그럼 뭘 하면 되는지」.
 *    둘째 줄을 빼면 빈 화면이 앱 결함으로 읽힌다(PRD ACE-1.1).
 */
export const EMPTY_STATE = {
  /** ① 나무 · 이번 달 실천 0건 */
  noPractice: {
    title: "아직 기록이 없어요.",
    hint: "미션 하나만 해내도 나무가 자라기 시작해요.",
  },
  /** ① 나무 ·「늘려요」칸 — 🔴 제품 사양이다(PRD §4-4 · AC-2.4). 프로토타입 사정이 아니다 */
  growLocked: {
    title: "곧 열려요.",
    hint: "지금은 배우기만 할 수 있어요.",
  },
  /** ③ 회고 · 큐가 빔 */
  retroEmpty: {
    title: "지금은 돌아볼 게 없어요.",
    hint: "계획을 적고 쓰면 여기에 나타나요.",
  },
} as const;
