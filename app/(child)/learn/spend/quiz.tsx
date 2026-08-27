"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardMuted, CardTitle } from "@/components/ui/card";
import { QUIZ } from "@/fixtures/learn";

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
export function Quiz() {
  const [picked, setPicked] = useState<string | null>(null);
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
              <CardMuted className="text-sm">퀴즈 1개를 맞혔어요.</CardMuted>
            </>
          ) : (
            <CardMuted>다시 한 번 생각해 볼까요?</CardMuted>
          )}
        </div>
      )}
    </Card>
  );
}
