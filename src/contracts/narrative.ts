/**
 * ① 나무 화면 최상단 두 문장 — 계획 §5.2(변화 문장 4분기) · §5.3(실천 근거)
 *
 * 🔴 화면에서 문장을 즉흥 작성하지 않는다. 분기는 여기 넷뿐이다.
 *    AC-1.1의 rubric 세 요소 — ① 비교 시점 ② 변화 방향 ③ 대상 — 를
 *    문장이 직접 만든다. 하나라도 빠지면 회상이 성립하지 않는다.
 */

import { AREAS, type AreaCode } from "./areas";
import { STAGE_LABEL, type AreaState } from "./tree";

/** 주기 표기 — 변화 문장 세 분기가 같은 낱말을 쓴다(rubric ① 비교 시점) */
const CYCLE = "이번 달";

export type Narrative = {
  /** 변화 문장 — §5.2 */
  change: string;
  /** 실천 근거 문장 — §5.3. 빈 상태·근거 없음이면 null */
  reason: string | null;
  /** 실천 0건이라 빈 상태로 가는가 — ACE-1.1 */
  isEmpty: boolean;
};

/** §5.3 — 영역별 실천 동사. 🔴 학습·퀴즈 횟수를 여기 넣지 않는다(AC-1.2) */
const PRACTICE_VERB: Record<AreaCode, ((n: number) => string) | null> = {
  EARN: (n) => `미션을 ${n}번 해내서 자란 거예요.`,
  SPEND: (n) => `쓰기 전에 ${n}번 적어서 자란 거예요.`,
  SAVE: (n) => `${n}번 모아서 자란 거예요.`,
  GROW: null, // MVP에서 실천 경로 닫힘 — 문장 없음
};

export function buildNarrative(states: AreaState[]): Narrative {
  const totalPractice = states.reduce((sum, s) => sum + s.progress.practice, 0);
  const promoted = states.filter((s) => s.promotedThisCycle);

  // 분기 4 — 실천 0건 (ACE-1.1). 빈 화면을 앱 결함으로 읽지 않게 한다
  if (totalPractice === 0) {
    return { change: "아직 기록이 없어요.", reason: null, isEmpty: true };
  }

  // 분기 1 — 이번 달 승급 1건
  if (promoted.length === 1) {
    const s = promoted[0];
    const verb = PRACTICE_VERB[s.area];
    return {
      change: `${CYCLE}, ${AREAS[s.area].label}가 ${STAGE_LABEL[s.stage]}이 됐어요.`,
      reason: verb ? verb(s.progress.practice) : null,
      isEmpty: false,
    };
  }

  // 분기 2 — 이번 달 승급 2건 이상
  if (promoted.length >= 2) {
    const names = promoted.map((s) => AREAS[s.area].label);
    const head = names.slice(0, -1).join(" · ");
    return {
      change: `${CYCLE}, ${head}와 ${names[names.length - 1]}가 자랐어요.`,
      reason: null,
      isEmpty: false,
    };
  }

  // 분기 3 — 승급 0건 · 실천 1건 이상
  return {
    change: `${CYCLE}, 실천을 ${totalPractice}번 했어요. 조금만 더 하면 자라요.`,
    reason: null,
    isEmpty: false,
  };
}
