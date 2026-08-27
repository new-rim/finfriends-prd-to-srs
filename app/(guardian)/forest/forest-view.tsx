"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FOREST } from "@/fixtures/forest";
import { GuardianHeader } from "@/components/GuardianHeader";

export function ForestView({ initialState }: { initialState?: string }) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isFirstMonth = initialState === "first" || FOREST.isFirstMonth;

  const handleSelectMonth = (month: string) => {
    setSelectedMonth(month);
    setToastMessage(`🌲 ${month} 성장 숲 데이터를 지목 분석 중입니다.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <main className="p-4 max-w-md mx-auto space-y-4 pb-12">
      <GuardianHeader title="월간 숲 요약" />

      {/* 안내 팁 카드 */}
      <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded-lg border border-emerald-300 text-xs text-emerald-900 dark:text-emerald-200">
        💡 <strong>보호자 리포트:</strong> 숲 뷰를 통해 지난달과 비교하여 아이의 금융 행동 성장(나무 성장 수)을 60초 내 한눈에 파악하세요.
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 주요 성과 변화 3가지 */}
      <Card className="border-2 border-emerald-500 bg-emerald-50/30">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base text-emerald-800 dark:text-emerald-300 font-bold">
              전월 대비 주요 성과 변화 (3가지)
            </CardTitle>
            <Badge className="bg-emerald-600 text-white text-[10px]">60초 분석</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isFirstMonth ? (
            <p className="text-sm text-muted-foreground">
              다음 달부터 전월과 비교할 수 있어요.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {FOREST.highlights.map((h) => (
                <li key={h.id} className="text-xs bg-background p-2.5 rounded border">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                    • {h.title}
                  </span>
                  <span className="text-muted-foreground">{h.description}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 월별 나무 성장 현황 */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground flex justify-between items-center">
          <span>월별 나무 성장 추이</span>
          <span className="text-xs text-emerald-700 font-normal">월을 클릭해 상세 보기</span>
        </h2>
        {FOREST.monthsData.map((m) => (
          <Card
            key={m.month}
            onClick={() => handleSelectMonth(m.month)}
            className={`cursor-pointer transition-all hover:border-emerald-500 ${
              selectedMonth === m.month ? "border-2 border-emerald-500 bg-emerald-50/40 shadow-md" : ""
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold">{m.month}</CardTitle>
                {selectedMonth === m.month && (
                  <Badge className="bg-emerald-600 text-white text-[10px]">지목 분석중</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around text-center text-xs">
                <div className="p-1.5 bg-amber-50 rounded w-full mr-1">
                  <div className="text-[10px] text-muted-foreground">씨앗</div>
                  <div className="font-bold text-amber-700 text-sm">{m.seedCount}개</div>
                </div>
                <div className="p-1.5 bg-emerald-50 rounded w-full mr-1">
                  <div className="text-[10px] text-muted-foreground">새싹</div>
                  <div className="font-bold text-emerald-600 text-sm">{m.sproutCount}개</div>
                </div>
                <div className="p-1.5 bg-green-50 rounded w-full">
                  <div className="text-[10px] text-muted-foreground">나무</div>
                  <div className="font-bold text-green-700 text-sm">{m.treeCount}개</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
