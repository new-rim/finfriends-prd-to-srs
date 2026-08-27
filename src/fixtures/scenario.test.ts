import { test } from "node:test";
import assert from "node:assert/strict";

import { AREA_STATES, RETRO_ENTRIES } from "./scenario.ts";
import { PROMOTION, remainingConditions } from "../contracts/tree.ts";

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
