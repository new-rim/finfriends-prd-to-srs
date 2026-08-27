import { test } from "node:test";
import assert from "node:assert/strict";

import {
  AREA_STATES,
  LEARN_PROGRESS,
  RETRO_ENTRIES,
  PENDING_APPROVALS,
  TOTAL_STARS,
  WISHLIST_ITEM,
  MISSIONS_LIST,
  HISTORY_ITEMS,
} from "./scenario.ts";
import { PROMOTION, remainingConditions } from "../contracts/tree.ts";
import { buildNarrative, particle } from "../contracts/narrative.ts";
import { AREAS, AREA_ORDER } from "../contracts/areas.ts";
import { STAGE_LABEL } from "../contracts/tree.ts";

/**
 * 🔴 계획 §14.1의 불변식 — 세 화면이 한 이야기임을 강제한다.
 * ③에서 별 받은 건수 === ①의 「잘 써요」 실천 횟수.
 * 두 값이 갈라지면 흐름이 거짓말이 된다.
 */
test("L6 — 회고에서 별 받은 건수 = 나무의 「잘 써요」 실천 횟수", () => {
  const starred = RETRO_ENTRIES.filter((r) => r.starGranted).length;
  const spend = AREA_STATES.find((s) => s.area === "SPEND");
  assert.ok(spend, "SPEND 영역이 시나리오에 있어야 한다");
  assert.equal(starred, spend.progress.practice);
});

/** 계획 §5.1 검산 — 정체 칸의 남은 조건이 실천 1 · 학습 2 · 퀴즈 3 순 */
test("정체 칸의 남은 조건이 가장 적게 남은 것부터 온다 (ACE-3.1)", () => {
  const save = AREA_STATES.find((s) => s.area === "SAVE")!;
  const remaining = remainingConditions(save);
  assert.deepEqual(
    remaining.map((r) => r.label),
    ["실천 1회 남음", "학습 2회 남음", "퀴즈 3개 남음"],
  );
});

/** 진행도가 승급 조건을 넘는 칸이 없어야 한다 — 넘었다면 이미 승급했어야 한다 */
test("모든 칸의 진행도가 자기 단계의 승급 조건 안에 있다", () => {
  for (const s of AREA_STATES) {
    if (s.stage === "TREE") continue;
    const need = PROMOTION[s.stage];
    const met =
      s.progress.learn >= need.learn &&
      s.progress.quiz >= need.quiz &&
      s.progress.practice >= need.practice;
    assert.equal(met, false, `${s.area}는 조건을 다 채웠는데 승급하지 않았다`);
  }
});

/**
 * 🔴 ②→① 연결 — 학습 화면이 보여주는 학습·퀴즈가 나무의 「잘 써요」 조건과 같은 값이어야
 * 두 화면이 한 아이의 이야기로 읽힌다. 갈라지면 ②에서 배운 것이 ①에 안 나타난다.
 */
test("L6 — 학습 화면의 진행도 = 나무 「잘 써요」의 학습·퀴즈 조건", () => {
  const spend = AREA_STATES.find((s) => s.area === "SPEND")!;
  assert.equal(LEARN_PROGRESS.topicsDone, spend.progress.learn);
  assert.equal(LEARN_PROGRESS.quizCorrect, spend.progress.quiz);
});

/** 계획 §14.1이 확정한 회고 구성 — 카드 4장 · 별 받음 3 · 별 없음 1 */
test("회고 이력이 계획 §14.1과 일치한다", () => {
  assert.equal(RETRO_ENTRIES.length, 4);
  assert.equal(RETRO_ENTRIES.filter((r) => r.starGranted).length, 3);
  assert.equal(RETRO_ENTRIES.filter((r) => r.branch === "KEPT").length, 2);
  assert.equal(RETRO_ENTRIES.filter((r) => r.branch === "CATEGORY_DIFF").length, 1);
  assert.equal(RETRO_ENTRIES.filter((r) => r.branch === "OVER").length, 1);
});

/**
 * 🔴 한국어 조사는 앞말 받침으로 갈린다 — 고정하면 「나무이 됐어요」가 나온다.
 * 「새싹」(받침 있음)만 시연되던 동안 드러나지 않다가 「나무」 단계를 넣고 나타났다.
 * 3단계 · 4영역 전부를 돌려 재발을 막는다.
 */
test("변화 문장의 조사가 3단계·4영역 전부에서 맞다", () => {
  assert.equal(particle("나무", "이가"), "가");
  assert.equal(particle("새싹", "이가"), "이");
  assert.equal(particle("씨앗", "이가"), "이");

  for (const area of AREA_ORDER) {
    for (const stage of ["SEED", "SPROUT", "TREE"] as const) {
      const { change } = buildNarrative([
        {
          area,
          stage,
          progress: { learn: 1, quiz: 1, practice: 2 },
          locked: false,
          daysSinceChange: 0,
          promotedThisCycle: true,
        },
      ]);
      const a = AREAS[area].label;
      const g = STAGE_LABEL[stage];
      assert.equal(change, `이번 달, ${a}${particle(a, "이가")} ${g}${particle(g, "이가")} 됐어요.`);
      // 받침 없는 말에 「이」가 붙는 조합이 없어야 한다
      assert.ok(!/무이 |요이 /.test(change), `조사 오류: ${change}`);
    }
  }
});

/**
 * 🔴 조사 헬퍼가 buildNarrative 밖에도 적용되는지 — 8R가 정체 문장의 누락을 잡았다.
 * 4영역 라벨이 전부 「요」로 끝나 지금은 오출력이 없지만, 라벨이 바뀌면 재발한다.
 */
test("4영역 라벨 어느 것으로도 조사가 맞다", () => {
  for (const code of AREA_ORDER) {
    const label = AREAS[code].label;
    const sentence = `${label}${particle(label, "이가")} 14일째 그대로예요`;
    assert.ok(!/무이 |요이 |아이 /.test(sentence), `조사 오류: ${sentence}`);
  }
  // 받침 있는 가상 라벨에도 「이」가 붙는다
  assert.equal(particle("모음", "이가"), "이");
});

/**
 * 🔴 확장 L6 불변식 — 미션 목록의 승인 대기 건수(WAITING) === 나무 화면 승인 대기 N건(PENDING_APPROVALS)
 */
test("L6 — 미션 목록의 승인 대기 건수 = 나무 화면의 PENDING_APPROVALS (계획 §15.2)", () => {
  const waitingMissions = MISSIONS_LIST.filter((m) => m.status === "WAITING").length;
  assert.equal(waitingMissions, PENDING_APPROVALS);
});

/**
 * 🔴 확장 L6 불변식 — 소비 내역과 회고 이력의 1:1 연동 정합성
 */
test("L6 — 소비 내역과 회고 이력이 1:1로 매핑된다 (계획 §15.5)", () => {
  for (const entry of RETRO_ENTRIES) {
    const historyItem = HISTORY_ITEMS.find((h) => h.retroId === entry.id);
    assert.ok(historyItem, `회고 ${entry.id}에 대응하는 소비 내역이 존재해야 한다`);
    assert.equal(historyItem.retroStatus, "COMPLETED");
  }
});

/**
 * 🔴 확장 L6 불변식 — 위시리스트의 보유 별 잔액 = TOTAL_STARS (계획 §15.1)
 */
test("L6 — 위시리스트 보유 별 = TOTAL_STARS", () => {
  assert.equal(WISHLIST_ITEM.currentStars, TOTAL_STARS);
});

