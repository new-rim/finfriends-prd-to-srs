"use client";

import { useState } from "react";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardMuted, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEARN_TOPIC, QUIZ } from "@/fixtures/learn";
import { AREAS } from "@/contracts/areas";

export function Quiz({ initialPicked = null }: { initialPicked?: string | null }) {
  const [picked, setPicked] = useState<string | null>(initialPicked);
  const [plannedMerchant, setPlannedMerchant] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [isPlanSaved, setIsPlanSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const correct = picked === QUIZ.correctId;

  // 퀴즈 푼 직후 인라인 소비 미리 적기 저장
  const handleSaveInlinePlan = () => {
    if (!plannedMerchant || !plannedAmount) return;
    setIsPlanSaved(true);
    setToastMessage(`🎉 '${plannedMerchant}' ${parseInt(plannedAmount, 10).toLocaleString()}원 쓰기 전 미리 적기 완료! '잘 써요' 나무의 실천 조건 1회가 가산되었습니다.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-6 mt-6">
      {/* 퀴즈 카드 */}
      <Card className="border-2 border-amber-400">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <span>🧠 퀴즈:</span>
          <span>{QUIZ.question}</span>
        </CardTitle>
        <RadioGroup
          className="mt-4 space-y-2"
          value={picked ?? undefined}
          onValueChange={setPicked}
          aria-label={QUIZ.question}
        >
          {QUIZ.options.map((o) => (
            <div key={o.id} className="flex items-center space-x-2 p-2 rounded hover:bg-amber-50/50">
              <RadioGroupItem key={o.id} value={o.id} />
              <span className="text-sm font-medium">{o.text}</span>
            </div>
          ))}
        </RadioGroup>

        {picked !== null && (
          <div className="mt-4 p-3 rounded-lg border">
            {correct ? (
              <div className="space-y-1">
                <p className="font-bold text-emerald-600 flex items-center gap-1 text-sm">
                  <span>🎉 정답이에요!</span>
                  <Badge className="bg-amber-500 text-white text-[10px]">⭐ 1개 획득</Badge>
                </p>
                <CardMuted className="text-xs">
                  {AREAS[LEARN_TOPIC.area].label} 나무의 퀴즈 조건이 채워졌어요.
                </CardMuted>
              </div>
            ) : (
              <CardMuted className="text-xs text-amber-700">
                🔍 다시 한 번 생각해보세요! 필요한 것인지 먼저 따져보는 게 핵심이에요.
              </CardMuted>
            )}
          </div>
        )}
      </Card>

      {/* 🟢 [퀴즈 이후의 핵심 경험 1] 방금 배운 내용 바로 미리 적어보기 폼 */}
      {correct && (
        <Card className="border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 p-4 space-y-3 animate-fadeIn">
          <div className="flex justify-between items-center">
            <Badge className="bg-emerald-600 text-white text-[10px]">1단계 실천</Badge>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">💡 배운 내용 바로 적용하기</span>
          </div>

          <div className="text-sm font-bold">
            방금 배운대로 다음 소비를 미리 적어볼까요?
          </div>
          <p className="text-xs text-muted-foreground">
            쓰기 전에 미리 적어두고 그대로 소비하면 별 ⭐을 더 받고 잘 써요 나무가 자라나요!
          </p>

          {toastMessage && (
            <div className="p-2.5 bg-emerald-600 text-white rounded text-xs font-semibold shadow animate-bounce">
              {toastMessage}
            </div>
          )}

          {!isPlanSaved ? (
            <div className="space-y-2 pt-1">
              <input
                type="text"
                placeholder="어디서 쓸 예정인가요? (예: 편의점)"
                value={plannedMerchant}
                onChange={(e) => setPlannedMerchant(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border bg-background"
              />
              <input
                type="number"
                placeholder="얼마나 쓸 예정인가요? (예: 3000)"
                value={plannedAmount}
                onChange={(e) => setPlannedAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border bg-background"
              />
              <button
                onClick={handleSaveInlinePlan}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow"
              >
                [미리 적어두기 저장] 잘 써요 실천 완료하기 &rarr;
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-200">
              ✅ '{plannedMerchant}' {parseInt(plannedAmount, 10).toLocaleString()}원 미리 적어두기가 완료되었습니다!
            </div>
          )}

          {/* 🟢 [퀴즈 이후의 핵심 경험 2 & 3] 다음 단계 연계 액션 버튼들 */}
          <div className="pt-3 border-t space-y-2">
            <div className="text-xs font-bold text-muted-foreground">다음 경험으로 이어가기:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                href="/retro"
                className="block text-center py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-xs shadow"
              >
                📝 2단계: 약속 지킨 회고 작성 &rarr;
              </Link>
              <Link
                href="/tree"
                className="block text-center py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs shadow"
              >
                🌳 3단계: 자란 성장 나무 보기 &rarr;
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
