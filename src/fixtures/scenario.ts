/**
 * 🔴 단일 시나리오 — 세 화면 픽스처의 유일한 출처. 계획 §14.1 · 규칙 §15
 *
 * 아이 1명 · 주기 1개. tree.ts · learn.ts · retro-sentences.ts 가 여기서 파생된다.
 * 화면마다 값을 따로 지어내면 「같은 아이의 이야기」로 읽히지 않는다.
 *
 * 🔴 불변식 — ③에서 별 받은 건수 === ①의 「잘 써요」 실천 횟수.
 *    두 값이 갈라지면 흐름이 거짓말이 된다. src/fixtures/scenario.test.ts가 강제한다.
 */

import type { AreaState } from "@/contracts/tree";

export type RetroBranch = "KEPT" | "CATEGORY_DIFF" | "OVER";

export type RetroEntry = {
  id: string;
  branch: RetroBranch;
  /** 계획한 가게 · 실제 간 가게 */
  plannedPlace: string;
  actualPlace: string;
  plannedAmount: number;
  actualAmount: number;
  starGranted: boolean;
  /** 문장 풀 인덱스 — 실제 비복원 추출은 FR-021의 몫 */
  sentenceIndex: number;
};

export const CHILD = { name: "하율", cycleLabel: "이번 달" } as const;

/** ① 나무 화면의 4영역 상태 */
export const AREA_STATES: AreaState[] = [
  {
    area: "EARN",
    stage: "SPROUT",
    progress: { learn: 2, quiz: 3, practice: 2 },
    locked: false,
    daysSinceChange: 3,
    promotedThisCycle: false,
  },
  {
    area: "SPEND",
    stage: "SPROUT",
    progress: { learn: 2, quiz: 4, practice: 3 },
    locked: false,
    daysSinceChange: 1,
    promotedThisCycle: true, // ← 변화 문장(§5.2 분기 1)의 대상
  },
  {
    // 정체 시연 — 새싹이므로 다음은 새싹→나무(학습 3 · 퀴즈 5 · 실천 1)
    // 학습 1/3 · 퀴즈 2/5 · 실천 0/1 → 남음: 실천 1 · 학습 2 · 퀴즈 3 (계획 §5.1 검산)
    area: "SAVE",
    stage: "SPROUT",
    progress: { learn: 1, quiz: 2, practice: 0 },
    locked: false,
    daysSinceChange: 14,
    promotedThisCycle: false,
  },
  {
    area: "GROW",
    stage: "SEED",
    progress: { learn: 0, quiz: 0, practice: 0 },
    locked: true, // 실천 경로가 MVP에서 닫힘(F15 Could) → 「곧 열려요」
    daysSinceChange: 0,
    promotedThisCycle: false,
  },
];

/** ① 승인 대기 N건 — FR-016이 줄 값. 화면이 세지 않는다(AC-6.2) */
export const PENDING_APPROVALS = 2;

/**
 * ③ 회고 이력 — 최신순. 별 받음 3건(지킴 2 + 업종 다름 1) · 별 없음 3건(넘김)
 * 🔴 별 받은 3건이 곧 ①의 「잘 써요」 실천 3회다. scenario.test.ts가 강제한다.
 *
 * 앞 3건이 단건으로, 나머지가 요약 회고로 병합된다(ACE-5.2 · 계획 §8.4).
 * 앞 3건에 두 시각(별 받음/없음)과 세 문장 갈래가 모두 들어가도록 배치했다.
 */
export const RETRO_ENTRIES: RetroEntry[] = [
  {
    id: "r1",
    branch: "KEPT",
    plannedPlace: "분식집",
    actualPlace: "분식집",
    plannedAmount: 5000,
    actualAmount: 4000,
    starGranted: true,
    sentenceIndex: 0,
  },
  {
    id: "r2",
    branch: "CATEGORY_DIFF",
    plannedPlace: "분식집",
    actualPlace: "문구점",
    plannedAmount: 5000,
    actualAmount: 4000,
    starGranted: true,
    sentenceIndex: 0,
  },
  {
    id: "r3",
    branch: "OVER",
    plannedPlace: "분식집",
    actualPlace: "분식집",
    plannedAmount: 5000,
    actualAmount: 7000,
    starGranted: false,
    sentenceIndex: 0,
  },
  // ↓ 아래 3건은 밀려서 요약 회고로 병합된다 (ACE-5.2)
  {
    id: "r4",
    branch: "KEPT",
    plannedPlace: "편의점",
    actualPlace: "편의점",
    plannedAmount: 3000,
    actualAmount: 2500,
    starGranted: true,
    sentenceIndex: 1,
  },
  {
    id: "r5",
    branch: "OVER",
    plannedPlace: "문구점",
    actualPlace: "문구점",
    plannedAmount: 2000,
    actualAmount: 3500,
    starGranted: false,
    sentenceIndex: 1,
  },
  {
    id: "r6",
    branch: "OVER",
    plannedPlace: "분식집",
    actualPlace: "분식집",
    plannedAmount: 4000,
    actualAmount: 6000,
    starGranted: false,
    sentenceIndex: 2,
  },
];

/** 단건으로 보여줄 최대 건수 — 초과분은 요약 회고로 병합(ACE-5.2 · 계획 §8.4) */
export const RETRO_SINGLE_LIMIT = 3;

/** ② 학습 진행 — 「잘 써요」 한 편 이수 · 퀴즈 1개 정답 */
export const LEARN_PROGRESS = { topicsDone: 1, quizCorrect: 1 } as const;
