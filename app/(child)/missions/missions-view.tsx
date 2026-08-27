"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MISSIONS as INITIAL_MISSIONS } from "@/fixtures/missions";
import { ChildHeader } from "@/components/ChildHeader";
import type { MissionItem } from "@/contracts/missions";

export function MissionsView() {
  const [missions, setMissions] = useState<MissionItem[]>(INITIAL_MISSIONS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newReward, setNewReward] = useState("3");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 나만의 미션 신규 등록
  const handleCreateMission = () => {
    if (!newTitle) return;
    const newMission: MissionItem = {
      id: `m-custom-${Date.now()}`,
      title: newTitle,
      category: "EARN" as const,
      rewardStars: parseInt(newReward, 10) || 2,
      status: "AVAILABLE",
    };
    setMissions([newMission, ...missions]);
    setShowCreateModal(false);
    setNewTitle("");
    setToastMessage(`🎯 나만의 미션 '${newTitle}'(⭐ ${newReward}개)이 만들어졌어요! 완수 후 승인을 요청해 보세요.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePractice = (id: string, title: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "WAITING" as const } : m))
    );
    setToastMessage(`🎉 '${title}' 미션 실천 완료! 엄마에게 승인 요청이 전달되었습니다.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResubmit = (id: string, title: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "WAITING" as const, rejectionReason: undefined } : m))
    );
    setToastMessage(`📸 '${title}' 미션을 다시 촬영해 승인을 요청했습니다.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <main className="p-4 max-w-md mx-auto space-y-4 pb-12">
      <ChildHeader title="미션 목록" />

      {/* 나만의 미션 만들기 상단 바 */}
      <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-300">
        <div className="text-xs text-amber-900 dark:text-amber-200">
          💡 내가 하고 싶은 도전 미션을 직접 만들어볼까요?
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow whitespace-nowrap"
        >
          [+ 나만의 미션 만들기]
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 나만의 미션 만들기 모달 폼 */}
      {showCreateModal && (
        <Card className="border-2 border-amber-400 bg-amber-50/60 dark:bg-amber-950/60 p-4 space-y-3">
          <div className="font-bold text-sm text-amber-900 dark:text-amber-200 flex justify-between items-center">
            <span>🎯 나만의 새로운 미션 만들기</span>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕ 닫기
            </button>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="미션 이름 (예: 내 장난감 스스로 정리하기)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border bg-background"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold whitespace-nowrap">받고 싶은 별:</label>
              <select
                value={newReward}
                onChange={(e) => setNewReward(e.target.value)}
                className="px-2 py-1.5 text-xs rounded border bg-background"
              >
                <option value="2">⭐ 2개</option>
                <option value="3">⭐ 3개</option>
                <option value="5">⭐ 5개</option>
              </select>
            </div>
            <button
              onClick={handleCreateMission}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded shadow"
            >
              [미션 만들기 등록 완료] &rarr;
            </button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {missions.map((mission) => (
          <Card key={mission.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-semibold">
                  {mission.title}
                </CardTitle>
                {mission.status === "AVAILABLE" && (
                  <Badge className="bg-amber-500 text-white border-amber-500">
                    할 수 있는 미션
                  </Badge>
                )}
                {mission.status === "WAITING" && (
                  <Badge className="bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300">
                    보호자 승인 대기
                  </Badge>
                )}
                {mission.status === "REJECTED" && (
                  <Badge className="text-amber-600 border-amber-600">
                    다시 시도
                  </Badge>
                )}
                {mission.status === "COMPLETED" && (
                  <Badge className="bg-emerald-600 text-white border-emerald-600">
                    ⭐ 완료됨
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground flex justify-between items-center">
                <span>완료 보상: <strong className="text-amber-500 font-bold">⭐ {mission.rewardStars}개</strong></span>
              </div>

              {mission.status === "REJECTED" && mission.rejectionReason && (
                <div className="text-xs bg-amber-50 dark:bg-amber-950 p-2.5 rounded border border-amber-200 text-amber-800 dark:text-amber-200">
                  <div className="font-semibold mb-1">💬 부모님 의견:</div>
                  {mission.rejectionReason}
                </div>
              )}

              {mission.status === "AVAILABLE" && (
                <button
                  onClick={() => handlePractice(mission.id, mission.title)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded transition-colors shadow-sm"
                >
                  [실천 완료] 부모님께 승인 요청하기 &rarr;
                </button>
              )}

              {mission.status === "REJECTED" && (
                <button
                  onClick={() => handleResubmit(mission.id, mission.title)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-colors shadow-sm"
                >
                  [다시 제출] 사진 찍어 다시 요청하기 &rarr;
                </button>
              )}

              {mission.status === "WAITING" && (
                <div className="text-xs text-center text-slate-500 py-1 bg-slate-100 dark:bg-slate-900 rounded">
                  ⏳ 부모님이 미션을 확인하고 계십니다
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
