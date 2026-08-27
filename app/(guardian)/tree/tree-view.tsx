"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardMuted, CardTitle } from "@/components/ui/card";
import { TreeFigure } from "@/components/tree-figure";
import { AREA_ORDER, AREAS, EMPTY_STATE } from "@/contracts/areas";
import { buildNarrative } from "@/contracts/narrative";
import { STAGE_LABEL, isStalled } from "@/contracts/tree";
import { treeDefault, treeGrown, treeNoPractice } from "@/fixtures/tree";
import { GuardianHeader } from "@/components/GuardianHeader";

export function TreeView({ initialState }: { initialState?: string }) {
  const [isPromoted, setIsPromoted] = useState(initialState === "grown");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const view = initialState === "empty" ? treeNoPractice : isPromoted ? treeGrown : treeDefault;
  const narrative = buildNarrative(view.states);
  const stalled = view.states.filter(isStalled);

  // 성장 진화 시뮬레이션 버튼 클릭
  const handlePromoteSimulation = () => {
    setIsPromoted((prev) => !prev);
    if (!isPromoted) {
      setToastMessage("✨ [성장 진화 이펙트] 민우가 '잘 써요' 약속을 3회 실천하여 나무가 '새싹🌱 ➔ 새싹🌿'으로 성장했습니다! 🎉");
    } else {
      setToastMessage("🔄 성장 진화 이전 상태로 되돌렸습니다.");
    }
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <GuardianHeader title="성장 나무" />

      {/* 진화 시뮬레이션 조작 버튼 */}
      <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded-lg border border-emerald-300 flex justify-between items-center text-xs">
        <div>
          <span className="font-bold text-emerald-900 dark:text-emerald-200">🌳 성장 진화 연출 체험:</span>
          <span className="text-muted-foreground ml-1">아이가 3회 실천했을 때의 성장 변화를 직접 눌러보세요.</span>
        </div>
        <button
          onClick={handlePromoteSimulation}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow text-xs whitespace-nowrap"
        >
          {isPromoted ? "🔄 초기 상태로" : "✨ 3회 실천 ➔ 성장 진화 연출 보기"}
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 최상단 변화 문장 */}
      <section className={`mb-5 p-4 rounded-xl border transition-all ${isPromoted ? "bg-emerald-100/60 border-emerald-500 scale-[1.01]" : ""}`}>
        <h1 className="text-2xl font-bold leading-snug text-[var(--text)]">
          {narrative.change}
        </h1>
        {narrative.reason && (
          <p className="mt-1 text-[var(--text-muted)]">{narrative.reason}</p>
        )}
        {narrative.isEmpty && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">{EMPTY_STATE.noPractice.hint}</p>
        )}
      </section>

      {/* 4영역 단계 도형 */}
      <section className="mb-6 grid grid-cols-4 gap-2">
        {AREA_ORDER.map((areaKey) => {
          const st = view.states.find((s) => s.area === areaKey)!;
          const info = AREAS[areaKey];
          return (
            <div
              key={areaKey}
              className={`rounded-[var(--radius-card)] border border-[var(--border)] p-3 text-center transition-all ${
                st.promotedThisCycle ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 ring-2 ring-emerald-400" : ""
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center">
                <TreeFigure stage={st.stage} />
              </div>
              <p className="mt-2 font-semibold">{info.label}</p>
              {areaKey === "GROW" ? (
                <p className="text-[10px] text-[var(--text-muted)]">
                  {EMPTY_STATE.growLocked.title} {EMPTY_STATE.growLocked.hint}
                </p>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">{STAGE_LABEL[st.stage]}</p>
              )}
              {st.promotedThisCycle && (
                <Badge className="mt-1 bg-emerald-600 text-white text-[10px]">
                  이번달 성장!
                </Badge>
              )}
            </div>
          );
        })}
      </section>

      {/* 정체 원인 안내 */}
      {stalled.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">정체 원인 분석</h2>
          {stalled.map((st) => (
            <Card key={st.area} className="border-amber-300 bg-amber-50/20">
              <CardTitle className="text-sm font-bold text-amber-800">
                {AREAS[st.area].label} 영역이 정체 중이에요
              </CardTitle>
              <CardMuted className="text-xs">
                실천 횟수가 부족해요. 아이에게 미션을 추천하거나 함께 퀴즈를 풀어보세요.
              </CardMuted>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
