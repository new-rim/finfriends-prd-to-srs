"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChildHeader } from "@/components/ChildHeader";
import {
  RETRO_BACKLOG,
  RETRO_ENTRIES,
  RETRO_SINGLE_LIMIT,
  type RetroEntry,
} from "@/fixtures/scenario";
import { RETRO_SENTENCES, RETRO_TITLE } from "@/fixtures/retro-sentences";
import { EMPTY_STATE } from "@/contracts/areas";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

function sentenceFor(e: RetroEntry) {
  const pool = RETRO_SENTENCES[e.branch];
  return pool[e.sentenceIndex % pool.length];
}

export function RetroView({ initialState }: { initialState?: string }) {
  const [entries, setEntries] = useState<RetroEntry[]>(
    initialState === "empty" ? [] : initialState === "backlog" ? RETRO_BACKLOG : RETRO_ENTRIES
  );
  // 아이가 적은 기분/생각 입력 상태 (id -> string)
  const [feelings, setFeelings] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleFeelingChange = (id: string, text: string) => {
    setFeelings((prev) => ({ ...prev, [id]: text }));
  };

  // 1. 아이 시점 별 보상 제출 (나무 반영 등 시스템 용어 제거)
  const handleSubmitRetro = (id: string, starGranted: boolean) => {
    const userFeeling = feelings[id] || "기분이 좋아졌어요!";
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, submitted: true } : item))
    );
    if (starGranted) {
      setToastMessage(`🎉 "${userFeeling}" 소감과 함께 회고 작성 완료! ⭐ 1개를 얻었어요!`);
    } else {
      setToastMessage(`🔍 "${userFeeling}" 솔직한 마음을 되돌아보고 ⭐ 1개를 얻었어요!`);
    }
    setTimeout(() => setToastMessage(null), 5000);
  };

  const single = entries.slice(0, RETRO_SINGLE_LIMIT);
  const merged = entries.slice(RETRO_SINGLE_LIMIT);

  return (
    <main className="mx-auto max-w-xl space-y-4 p-4 pb-12">
      <ChildHeader title="두 갈래 회고" />

      {/* 안내 팁 카드 */}
      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-300 text-xs text-amber-900 dark:text-amber-200">
        💡 <strong>내 소비 솔직하게 돌아보기:</strong> 그때의 기분이 어땠는지 마음을 적어보고 <strong>[⭐ 별 1개 받고 제출하기]</strong>를 누르면 별을 받아요!
      </div>

      {toastMessage && (
        <div className="p-3 bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {entries.length === 0 ? (
        <Card className="p-6 text-center space-y-2">
          <p className="text-lg font-bold">{EMPTY_STATE.retroEmpty.title}</p>
          <p className="text-xs text-muted-foreground">{EMPTY_STATE.retroEmpty.hint}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground">오늘의 소비 돌아보기</h2>

          {single.map((e) => (
            <Card key={e.id} className="p-4 space-y-3 transition-all hover:shadow-md">
              {e.starGranted ? (
                <Alert tone="earned" className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-base font-bold flex items-center gap-1">
                      <span>⭐</span>
                      <span>{RETRO_TITLE.earned}</span>
                    </p>
                    <Badge className="bg-amber-500 text-white text-[10px]">⭐ 1개 보상</Badge>
                  </div>
                  <dl className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">미리 적은 금액</dt>
                      <dd className="font-semibold">{won(e.plannedAmount)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">실제 쓴 금액</dt>
                      <dd className="font-semibold">{won(e.actualAmount)}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs border-t pt-2 text-emerald-800 dark:text-emerald-300 font-medium">
                    {sentenceFor(e)}
                  </p>
                </Alert>
              ) : (
                <Alert tone="review" className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-base font-bold flex items-center gap-1">
                      <span>🔍</span>
                      <span>{RETRO_TITLE.review}</span>
                    </p>
                    <Badge className="bg-slate-200 text-slate-700 text-[10px]">솔직한 성찰</Badge>
                  </div>
                  <dl className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">미리 적은 금액</dt>
                      <dd className="font-semibold">{won(e.plannedAmount)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">실제 쓴 금액</dt>
                      <dd className="font-semibold">{won(e.actualAmount)}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs border-t pt-2 text-amber-800 dark:text-amber-300 font-medium">
                    {sentenceFor(e)}
                  </p>
                </Alert>
              )}

              {/* 🟢 [수정 1] 아이가 기분과 마음을 직접 적는 대화형 입력 폼 */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                  💬 이때 어떤 기분이었나요? 마음을 자유롭게 적어보세요:
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 미리 적어둔 대로 필요한 노트를 사서 뿌듯하고 기분이 좋았어요!"
                  value={feelings[e.id] || ""}
                  onChange={(eTarget) => handleFeelingChange(e.id, eTarget.target.value)}
                  className="w-full p-2.5 text-xs rounded border bg-background resize-none focus:outline-amber-500"
                />
              </div>

              {/* 🟢 [수정 1] 아이 시점의 별 보상 제출 버튼 (나무 시스템 용어 제거) */}
              <button
                onClick={() => handleSubmitRetro(e.id, e.starGranted)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded shadow transition-colors"
              >
                [⭐ 별 1개 받고 제출하기]
              </button>
            </Card>
          ))}

          {merged.length > 0 && (
            <section className="rounded-xl border-2 border-dashed p-4 space-y-3 bg-muted/20">
              <p className="font-semibold text-xs text-muted-foreground">{merged.length}일치를 한 번에 모아 회고해요</p>
              {merged.map((e) => (
                <Card key={e.id} className="p-3 text-xs space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>{e.starGranted ? "⭐ 약속을 지켰어요" : "🔍 생각하고 썼어요"}</span>
                    <span>{won(e.actualAmount)}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="이때 기분을 적어보세요..."
                    value={feelings[e.id] || ""}
                    onChange={(eTarget) => handleFeelingChange(e.id, eTarget.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border bg-background"
                  />
                  <button
                    onClick={() => handleSubmitRetro(e.id, e.starGranted)}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded"
                  >
                    [⭐ 별 1개 받고 제출하기]
                  </button>
                </Card>
              ))}
            </section>
          )}
        </div>
      )}
    </main>
  );
}
