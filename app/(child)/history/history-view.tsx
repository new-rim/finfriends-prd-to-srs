"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChildHeader } from "@/components/ChildHeader";

interface CustomHistoryItem {
  id: string;
  merchantName: string;
  amount: number;
  dateText: string;
  plannedAmount?: number;
  retroWritten?: boolean;
}

const INITIAL_HISTORY: CustomHistoryItem[] = [
  { id: "h1", merchantName: "학교 앞 문구점", amount: 2500, dateText: "오늘 15:30", plannedAmount: 3000, retroWritten: false },
  { id: "h2", merchantName: "CU 편의점", amount: 1500, dateText: "어제 17:10", plannedAmount: 1500, retroWritten: true },
  { id: "h3", merchantName: "알라딘 서점", amount: 8500, dateText: "8월 24일", plannedAmount: 8000, retroWritten: true },
];

export function HistoryView() {
  const [historyList, setHistoryList] = useState<CustomHistoryItem[]>(INITIAL_HISTORY);
  const [merchantName, setMerchantName] = useState("");
  const [amountText, setAmountText] = useState("");
  const [plannedText, setPlannedText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 새 소비 내역 직접 등록
  const handleAddHistory = () => {
    if (!merchantName || !amountText) return;
    const newAmount = parseInt(amountText, 10) || 0;
    const newPlanned = plannedText ? parseInt(plannedText, 10) : newAmount;

    const newItem: CustomHistoryItem = {
      id: `h-${Date.now()}`,
      merchantName,
      amount: newAmount,
      dateText: "방금 전",
      plannedAmount: newPlanned,
      retroWritten: false,
    };

    setHistoryList([newItem, ...historyList]);
    setMerchantName("");
    setAmountText("");
    setPlannedText("");
    setShowModal(false);
    setToastMessage(`🎉 '${merchantName}' ${newAmount.toLocaleString()}원 기록 완료! 곧바로 이 건의 회고를 작성하고 ⭐ 별을 받아보세요.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <main className="p-4 max-w-md mx-auto space-y-4 pb-12">
      <ChildHeader title="소비 내역" />

      {/* 안내 팁 카드 */}
      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-300 text-xs text-amber-900 dark:text-amber-200">
        💡 <strong>소비 내역 & 회고의 관계:</strong> 내가 실제로 쓴 돈(소비 내역)에 대해 <strong>[📝 회고 작성하러 가기]</strong>를 누르면 당시의 마음을 되돌아보고 ⭐ 별 보상을 받아요.
      </div>

      {toastMessage && (
        <div className="p-3 bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 오늘 쓴 돈 직접 기록하기 버튼 */}
      <Card className="border-2 border-amber-400 bg-amber-50/30">
        <CardContent className="p-3 flex justify-between items-center">
          <div>
            <div className="font-bold text-sm">오늘 돈을 쓰셨나요?</div>
            <div className="text-xs text-muted-foreground">직접 상점 이름과 금액을 적고 회고로 연결해요.</div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded shadow transition-colors shrink-0"
          >
            [+ 쓴 돈 기록하기]
          </button>
        </CardContent>
      </Card>

      {/* 기록 팝업 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card className="w-full max-w-sm p-4 space-y-3 bg-background">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-bold">오늘 쓴 돈 직접 기록하기</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-xs text-muted-foreground font-bold">✕ 닫기</button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold block mb-1">🏪 어디서 썼나요? (상점/가게 이름)</label>
                <input
                  type="text"
                  placeholder="예: 학교 앞 문구점"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full px-3 py-2 rounded border bg-background"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">💰 얼마나 썼나요? (실제 금액)</label>
                <input
                  type="number"
                  placeholder="예: 2500 (원)"
                  value={amountText}
                  onChange={(e) => setAmountText(e.target.value)}
                  className="w-full px-3 py-2 rounded border bg-background"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-muted-foreground">💡 쓰기 전 미리 적어둔 금액이 있나요? (선택)</label>
                <input
                  type="number"
                  placeholder="예: 3000 (원)"
                  value={plannedText}
                  onChange={(e) => setPlannedText(e.target.value)}
                  className="w-full px-3 py-2 rounded border bg-background"
                />
              </div>

              <button
                onClick={handleAddHistory}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded shadow mt-2"
              >
                [소비 내역 저장하기]
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* 내 소비 내역 리스트 (회고와 1:1 연결) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground flex justify-between items-center">
          <span>최근 소비 내역 ({historyList.length}건)</span>
          <span className="text-xs text-amber-700 font-normal">회고 작성하고 ⭐ 별 받기</span>
        </h2>

        {historyList.map((h) => (
          <Card key={h.id} className="transition-all hover:shadow-md">
            <CardContent className="p-3.5 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-sm">{h.merchantName}</span>
                    {h.retroWritten ? (
                      <Badge className="bg-emerald-600 text-white text-[9px]">회고 완료 ⭐</Badge>
                    ) : (
                      <Badge className="bg-amber-500 text-white text-[9px]">회고 대기 중</Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{h.dateText}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-base">{h.amount.toLocaleString()}원</div>
                  {h.plannedAmount && (
                    <div className="text-[10px] text-muted-foreground">
                      (미리 계획: {h.plannedAmount.toLocaleString()}원)
                    </div>
                  )}
                </div>
              </div>

              {/* 🟢 [수정 2] 소비 내역과 두갈래 회고 간의 1:1 직행 연동 버튼 */}
              {!h.retroWritten ? (
                <Link
                  href="/retro"
                  className="block w-full text-center py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded shadow transition-colors mt-1"
                >
                  📝 이 소비 회고 작성하고 ⭐ 별 1개 받으러 가기 &rarr;
                </Link>
              ) : (
                <div className="text-right text-[11px] text-emerald-600 font-semibold pt-1 border-t">
                  ✅ 회고를 작성하여 ⭐ 1개 보상을 받았습니다!
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
