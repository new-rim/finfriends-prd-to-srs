"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardMuted, CardTitle } from "@/components/ui/card";
import { LEARN_TOPIC, QUIZ } from "@/fixtures/learn";
import { AREAS } from "@/contracts/areas";

/**
 * ② 퀴즈 — 계획 §11. 1문항 · RadioGroup(단일 선택).
 *
 * 🔴 AC-2.1을 여기 걸지 않는다. PRD US-2 AC1은 실천 트리거 3종(미션·회고·위시리스트)
 *    한정이고, 부록 C가 "실천 트리거만 실천 카운트에 가산"이라고 못 박았다.
 *    퀴즈는 ⭐를 주지만 실천 카운트를 올리지 않는다.
 * 🔴 이 화면에 "실천"이라는 낱말을 쓰지 않는다 — §5.3이 지키는 실천/학습 구분이
 *    여기서 흐려지면 AC-1.2가 무너진다.
 * 🔴 실제 지급은 FR-013(grantStar)의 몫이다. 여기서는 화면 반영만 한다.
 */
export function Quiz({ initialPicked = null }: { initialPicked?: string | null }) {
  // initialPicked — 스냅샷이 정답 후 상태를 SSR로 뜰 수 있게 한다(?picked=b).
  // 이게 없으면 2R TOP_FIX 산출물인 「나무 조건이 채워졌어요」가 평가자에게 안 보인다.
  const [picked, setPicked] = useState<string | null>(initialPicked);
  const correct = picked === QUIZ.correctId;

  return (
    <Card className="mt-8">
      <CardTitle>{QUIZ.question}</CardTitle>
      <RadioGroup
        className="mt-4"
        value={picked ?? undefined}
        onValueChange={setPicked}
        aria-label={QUIZ.question}
      >
        {QUIZ.options.map((o) => (
          <RadioGroupItem key={o.id} value={o.id}>
            {o.text}
          </RadioGroupItem>
        ))}
      </RadioGroup>

      {picked !== null && (
        <div className="mt-4">
          {correct ? (
            <>
              <p className="font-semibold text-[var(--accent)]">⭐ 1개를 받았어요!</p>
              {/* 🔴 퀴즈가 움직이는 것은 나무의 「퀴즈 조건」뿐이다(PRD 부록 C).
                  "실천"이라는 낱말을 쓰지 않는다 — AC-1.2가 지키는 구분이다. */}
              <CardMuted className="text-sm">
                {AREAS[LEARN_TOPIC.area].label} 나무의 퀴즈 조건이 하나 채워졌어요.
              </CardMuted>
            </>
          ) : (
            <CardMuted>다시 한 번 생각해 볼까요?</CardMuted>
          )}
        </div>
      )}
    </Card>
  );
}
