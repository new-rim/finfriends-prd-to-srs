"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { WISHLIST_SUMMARY } from "@/fixtures/wishlist";
import { ChildHeader } from "@/components/ChildHeader";

export function WishlistView() {
  const [stars, setStars] = useState(WISHLIST_SUMMARY.totalStars);
  const [inventory, setInventory] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeItem = WISHLIST_SUMMARY.activeItem;
  const progressPercent = Math.min(
    100,
    Math.round((stars / activeItem.requiredStars) * 100)
  );
  const remainingStars = Math.max(0, activeItem.requiredStars - stars);

  const handleExchange = (itemName: string, cost: number) => {
    if (stars < cost) {
      setToastMessage(`⭐ 별이 부족해요! 미션과 회고를 더 완료하면 별을 얻을 수 있어요.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setStars((prev) => prev - cost);
    setInventory((prev) => [...prev, itemName]);
    setToastMessage(`🎉 ⭐ ${cost}개로 '${itemName}' 선물 교환 완료! 내 보물상자에 보관되었습니다.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <main className="p-4 max-w-md mx-auto space-y-4 pb-12">
      <ChildHeader title="위시리스트 & 별 상점" />

      <Card className="border-amber-400 bg-amber-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            민우가 모은 내 별 잔액
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <div className="text-3xl font-bold text-amber-500 flex items-center gap-2">
            <span>⭐</span>
            <span>{stars}개</span>
          </div>
          <div className="text-xs text-muted-foreground">
            모은 별로 위시리스트 목표를 달성하거나<br />선물을 교환해 보세요!
          </div>
        </CardContent>
      </Card>

      {toastMessage && (
        <div className="p-3 bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md animate-bounce">
          {toastMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-bold">{activeItem.name}</CardTitle>
            <Badge className="bg-amber-500 text-white">{activeItem.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-muted-foreground">목표 달성률</span>
              <span className="font-bold text-amber-600">
                ⭐ {stars} / {activeItem.requiredStars}개 ({progressPercent}%)
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded text-xs text-center font-semibold text-amber-800 dark:text-amber-200">
            {remainingStars > 0
              ? `별 ${remainingStars}개만 더 모으면 얻을 수 있어요!`
              : `🎉 축하해요! 목표 별을 모두 모았어요!`}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-muted-foreground">🎁 지금 모은 별로 교환할 수 있는 선물</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="hover:border-amber-400 transition-colors">
            <CardContent className="p-3 text-center space-y-2">
              <span className="text-2xl block">🌈</span>
              <div className="font-bold text-xs">무지개 스티커</div>
              <div className="text-xs text-amber-600 font-semibold">⭐ 3개 필요</div>
              <button
                onClick={() => handleExchange("무지개 스티커", 3)}
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded transition-colors"
              >
                [교환하기]
              </button>
            </CardContent>
          </Card>

          <Card className="hover:border-amber-400 transition-colors">
            <CardContent className="p-3 text-center space-y-2">
              <span className="text-2xl block">👓</span>
              <div className="font-bold text-xs">별빛 안경</div>
              <div className="text-xs text-amber-600 font-semibold">⭐ 5개 필요</div>
              <button
                onClick={() => handleExchange("별빛 안경", 5)}
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded transition-colors"
              >
                [교환하기]
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {inventory.length > 0 && (
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              📦 내가 교환한 보물상자
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {inventory.map((item, idx) => (
              <Badge key={idx} className="bg-emerald-600 text-white text-xs">
                🎁 {item}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
