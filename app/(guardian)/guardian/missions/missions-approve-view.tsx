"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuardianHeader } from "@/components/GuardianHeader";
import { MISSIONS as INITIAL_MISSIONS } from "@/fixtures/missions";
import type { MissionItem } from "@/contracts/missions";

export function MissionsApproveView() {
  const [missions, setMissions] = useState<MissionItem[]>(INITIAL_MISSIONS);
  const [praiseText, setPraiseText] = useState<{ [key: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 부모 미션 승인 처리
  const handleApprove = (id: string, title: string, stars: number) => {
    const praise = praiseText[id] || "약속을 정성껏 지켜줘서 대견해! ❤️";
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "COMPLETED" as const } : m))
    );
    setToastMessage(`🎉 '${title}' 미션을 승인했습니다! 민우에게 ⭐ ${stars}개와 칭찬("${praise}")이 전달되었습니다.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 부모 미션 다시 시도 요청 처리
  const handleReject = (id: string, title: string) => {
    const reason = praiseText[id] || "사진이 조금 어두워요. 한 번 더 선명하게 찍어볼까요?";
    setMissions((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: "REJECTED" as const, rejectionReason: reason }
          : m
      )
    );
    setToastMessage(`💬 '${title}' 미션에 대해 아이에게 재시도를 조언했습니다.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const waitingMissions = missions.filter((m) => m.status === "WAITING");

  return (
    <main className="p-4 max-w-md mx-auto space-y-4 pb-12">
      <GuardianHeader title="🛡️ 미션 승인 및 칭찬 룸" />

      {/* 안내 팁 */}
      <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded-lg border border-emerald-300 text-xs text-emerald-900 dark:text-emerald-200">
        💡 <strong>부모님 전용 공간:</strong> 민우가 실천 후 올려둔 미션을 확인하고 <strong>[승인 및 ⭐ 지급]</strong>과 <strong>칭찬 한마디</strong>를 남겨주세요.
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 승인 대기 미션 목록 */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold flex justify-between items-center text-muted-foreground">
          <span>아이 승인 대기 미션 ({waitingMissions.length}건)</span>
          <Badge className="bg-amber-500 text-white text-[10px]">확인 필요</Badge>
        </h2>

        {missions.map((mission) => (
          <Card key={mission.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {mission.title}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    보상: <strong className="text-amber-600 font-bold">⭐ {mission.rewardStars}개</strong>
                  </div>
                </div>
                {mission.status === "WAITING" && (
                  <Badge className="bg-amber-500 text-white">승인 대기중</Badge>
                )}
                {mission.status === "COMPLETED" && (
                  <Badge className="bg-emerald-600 text-white">승인 완료됨</Badge>
                )}
                {mission.status === "REJECTED" && (
                  <Badge className="bg-slate-200 text-slate-700">재시도 요청됨</Badge>
                )}
                {mission.status === "AVAILABLE" && (
                  <Badge className="bg-slate-100 text-slate-500">아이 미실천</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mission.status === "WAITING" && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                  <label className="text-xs font-semibold block text-slate-700 dark:text-slate-300">
                    💬 아이에게 남길 칭찬 한마디 / 의견:
                  </label>
                  <input
                    type="text"
                    placeholder="예: 정성껏 정리했네! 정말 기특하다 ❤️"
                    value={praiseText[mission.id] || ""}
                    onChange={(e) =>
                      setPraiseText({ ...praiseText, [mission.id]: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded border bg-background"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(mission.id, mission.title, mission.rewardStars)}
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-colors shadow-sm"
                    >
                      [승인] ⭐ {mission.rewardStars}개 지급하기 &rarr;
                    </button>
                    <button
                      onClick={() => handleReject(mission.id, mission.title)}
                      className="py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-colors shadow-sm"
                    >
                      [조언] 다시 시도 요청하기
                    </button>
                  </div>
                </div>
              )}

              {mission.status === "COMPLETED" && (
                <div className="text-xs bg-emerald-50 dark:bg-emerald-950 p-2.5 rounded text-emerald-800 dark:text-emerald-200">
                  ✅ 미션이 승인되어 아이에게 ⭐ {mission.rewardStars}개가 지급되었습니다.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
