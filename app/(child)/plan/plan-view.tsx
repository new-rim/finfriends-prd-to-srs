"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PLAN as INITIAL_PLAN } from "@/fixtures/plan";
import { ChildHeader } from "@/components/ChildHeader";

interface CustomPlanItem {
  id: string;
  when: string;
  where: string;
  amount: number;
  reason: string;
  isKept?: boolean;
}

const INITIAL_CUSTOM_PLANS: CustomPlanItem[] = [
  { id: "p1", when: "이번 주 토요일", where: "학교 앞 문구점", amount: 3000, reason: "수학 공책과 지우개 사기" },
  { id: "p2", when: "다음 주 수요일", where: "CU 편의점", amount: 2000, reason: "친구와 간식 사먹기" },
];

export function PlanView() {
  const [budget, setBudget] = useState(INITIAL_PLAN.monthlyBudget);
  const [usedAmount] = useState(INITIAL_PLAN.usedAmount);
  const [plans, setPlans] = useState<CustomPlanItem[]>(INITIAL_CUSTOM_PLANS);

  // 3가지 핵심 필드 상태 (언제, 어디서, 얼마까지)
  const [whenText, setWhenText] = useState("이번 주 토요일");
  const [whereText, setWhereText] = useState("");
  const [amountText, setAmountText] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const usagePercent = Math.min(
    100,
    Math.round((usedAmount / budget) * 100)
  );

  // 새 소비 계획 등록하기 (언제, 어디서, 얼마까지)
  const handleCreatePlan = () => {
    if (!whereText || !amountText) return;
    const newPlan: CustomPlanItem = {
      id: `plan-${Date.now()}`,
      when: whenText,
      where: whereText,
      amount: parseInt(amountText, 10) || 0,
      reason: reasonText || "미리 계획해둔 소비",
    };
    setPlans([newPlan, ...plans]);
    setWhereText("");
    setAmountText("");
    setReasonText("");
    setToastMessage(`🎉 '${whenText}'에 '${whereText}'에서 ${parseInt(amountText, 10).toLocaleString()}원 소비 계획 등록 완료! 약속을 지키면 별 ⭐을 받아요.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <main className="p-4 max-w-md mx-auto space-y-4 pb-12">
      <ChildHeader title="소비 계획" />

      {/* 안내 팁 카드 */}
      <div className="bg-sky-50 dark:bg-sky-950 p-3 rounded-lg border border-sky-300 text-xs text-sky-900 dark:text-sky-200">
        💡 <strong>쓰기 전 미리 적어두기:</strong> 돈을 쓰기 전에 <strong>언제, 어디서, 얼마까지 쓸지</strong> 미리 계획을 등록해두면 잘 써요 나무가 성장해요.
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 🎯 [핵심 신규] 소비 계획 등록 폼 (언제, 어디서, 얼마까지) */}
      <Card className="border-2 border-sky-400 bg-sky-50/40 dark:bg-sky-950/40 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold text-sky-900 dark:text-sky-200">
            📝 새 소비 계획 미리 적기
          </CardTitle>
          <Badge className="bg-sky-600 text-white text-[10px]">3개 필드 입력</Badge>
        </div>

        <div className="space-y-2 text-xs">
          {/* 1. 언제 돈을 쓸 건지 */}
          <div>
            <label className="font-bold text-sky-800 dark:text-sky-300 block mb-1">
              📅 1. 언제 돈을 쓸 건가요?
            </label>
            <select
              value={whenText}
              onChange={(e) => setWhenText(e.target.value)}
              className="w-full px-2.5 py-2 rounded border bg-background text-xs font-medium"
            >
              <option value="오늘 저녁">오늘 저녁</option>
              <option value="내일 방과 후">내일 방과 후</option>
              <option value="이번 주 토요일">이번 주 토요일</option>
              <option value="다음 주 주말">다음 주 주말</option>
            </select>
          </div>

          {/* 2. 어디서 쓸 건지 */}
          <div>
            <label className="font-bold text-sky-800 dark:text-sky-300 block mb-1">
              🏪 2. 어디서 쓸 건가요? (가게 이름)
            </label>
            <input
              type="text"
              placeholder="예: 학교 앞 문구점, CU 편의점"
              value={whereText}
              onChange={(e) => setWhereText(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background"
            />
          </div>

          {/* 3. 얼마까지 쓸 건지 */}
          <div>
            <label className="font-bold text-sky-800 dark:text-sky-300 block mb-1">
              💰 3. 얼마까지 쓸 건가요? (한도 금액)
            </label>
            <input
              type="number"
              placeholder="예: 3000 (원)"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background"
            />
          </div>

          {/* 사려는 이유 (선택) */}
          <div>
            <label className="font-bold text-sky-800 dark:text-sky-300 block mb-1">
              ❓ 무얼 사려고 하나요? (용도)
            </label>
            <input
              type="text"
              placeholder="예: 수학 준비물 공책 구매"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background"
            />
          </div>

          <button
            onClick={handleCreatePlan}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded shadow transition-colors mt-2"
          >
            [소비 계획 등록하기] 미리 적어두기 저장 &rarr;
          </button>
        </div>
      </Card>

      {/* 이번 달 잘 써요 예산 한도 요약 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-semibold">이번 달 목표 예산 한도</CardTitle>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded">
              계획 지킴 중
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>월 예산 설정</span>
            <span className="font-bold text-sky-700 dark:text-sky-400">{budget.toLocaleString()}원</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>현재 집행액</span>
              <span>{usedAmount.toLocaleString()}원 ({usagePercent}%)</span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 내가 등록한 소비 계획 목록 */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground flex justify-between items-center">
          <span>내가 등록한 미리 적은 소비 계획 ({plans.length}건)</span>
          <Badge className="bg-emerald-600 text-white text-[10px]">약속 대기중</Badge>
        </h2>

        {plans.map((p) => (
          <Card key={p.id} className="transition-all hover:shadow-md border-emerald-300">
            <CardContent className="p-3.5 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200 text-[10px] mb-1">
                    📅 {p.when}
                  </Badge>
                  <div className="font-bold text-base">{p.where}</div>
                  <div className="text-xs text-muted-foreground">{p.reason}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">계획 한도</div>
                  <div className="font-bold text-base text-sky-700 dark:text-sky-300">
                    {p.amount.toLocaleString()}원
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
