"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChildHeader } from "@/components/ChildHeader";
import { AVATAR_ITEMS } from "@/fixtures/avatar";
import type { AvatarItem } from "@/contracts/avatar";

export function AvatarView() {
  const [stars, setStars] = useState(12);
  const [equippedHead, setEquippedHead] = useState<AvatarItem | null>(AVATAR_ITEMS[0]); // 새싹 왕관 기본 착용
  const [equippedEye, setEquippedEye] = useState<AvatarItem | null>(AVATAR_ITEMS[2]); // 별빛 안경 기본 착용
  const [equippedClothes, setEquippedClothes] = useState<AvatarItem | null>(AVATAR_ITEMS[4]); // 초록 새싹 티 기본 착용
  const [equippedSticker, setEquippedSticker] = useState<AvatarItem | null>(AVATAR_ITEMS[6]); // 무지개 스티커 기본 착용
  const [unlockedItems, setUnlockedItems] = useState<string[]>(
    AVATAR_ITEMS.filter((i) => i.isUnlocked).map((i) => i.id)
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 아이템 착용 / 해제 토글
  const toggleEquip = (item: AvatarItem) => {
    const isUnlocked = unlockedItems.includes(item.id);

    if (!isUnlocked) {
      if (stars < item.priceStars) {
        setToastMessage(`⭐ 별이 부족해요! 미션과 회고를 풀어 별 ${item.priceStars}개를 먼저 모아주세요.`);
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }
      // 구매 후 해금
      setStars((prev) => prev - item.priceStars);
      setUnlockedItems((prev) => [...prev, item.id]);
      setToastMessage(`🎉 ⭐ ${item.priceStars}개로 '${item.name}' 해금 완료!`);
      setTimeout(() => setToastMessage(null), 3000);
    }

    // 착용 토글
    if (item.category === "HEAD") {
      setEquippedHead(equippedHead?.id === item.id ? null : item);
    } else if (item.category === "EYE") {
      setEquippedEye(equippedEye?.id === item.id ? null : item);
    } else if (item.category === "CLOTHES") {
      setEquippedClothes(equippedClothes?.id === item.id ? null : item);
    } else if (item.category === "STICKER") {
      setEquippedSticker(equippedSticker?.id === item.id ? null : item);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto space-y-4 pb-12">
      <ChildHeader title="🎨 마이 아바타 꾸미기" />

      {/* 안내 팁 */}
      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-300 text-xs text-amber-900 dark:text-amber-200">
        💡 <strong>직접 입혀보세요!</strong> 내가 모은 별 ⭐로 왕관, 안경, 의상을 구매하고 클릭하여 아바타를 멋지게 꾸며보세요.
      </div>

      {toastMessage && (
        <div className="p-3 bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 아바타 3D/SVG 미니 룸 메인 스테이지 */}
      <Card className="border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <CardContent className="p-6 flex flex-col items-center justify-center relative min-h-[220px]">
          {/* 장착된 스티커 배경 데코 */}
          {equippedSticker && (
            <div className="absolute top-3 left-4 text-3xl animate-pulse">
              {equippedSticker.icon}
            </div>
          )}

          {/* 아바타 캐릭터 메인 스태치 (나무 요정 핀) */}
          <div className="relative flex flex-col items-center transition-transform hover:scale-105">
            {/* 머리 장식 (왕관/모자) */}
            <div className="h-8 text-2xl z-10 transition-all">
              {equippedHead ? equippedHead.icon : null}
            </div>

            {/* 얼굴 & 안경 */}
            <div className="w-24 h-24 bg-emerald-400 dark:bg-emerald-600 rounded-full border-4 border-emerald-600 dark:border-emerald-300 flex flex-col items-center justify-center relative shadow-lg">
              {/* 눈 & 안경 */}
              <div className="text-xl font-bold flex items-center gap-1 z-10">
                {equippedEye ? (
                  <span>{equippedEye.icon}</span>
                ) : (
                  <span>👀</span>
                )}
              </div>

              {/* 볼 터치 & 입 */}
              <div className="flex items-center gap-4 mt-1">
                <span className="w-2 h-2 bg-pink-300 rounded-full"></span>
                <span className="text-xs">‿</span>
                <span className="w-2 h-2 bg-pink-300 rounded-full"></span>
              </div>
            </div>

            {/* 몸통 & 의상 */}
            <div className="w-20 h-16 bg-emerald-500 rounded-b-2xl mt-[-8px] flex items-center justify-center text-xl shadow border-2 border-emerald-600">
              {equippedClothes ? equippedClothes.icon : "🌱"}
            </div>
          </div>

          <div className="mt-4 text-center">
            <Badge className="bg-amber-500 text-white text-xs font-bold px-3 py-1">
              ✨ 민우의 나무 요정 핀
            </Badge>
            <div className="text-[11px] text-muted-foreground mt-1">
              현재 모은 별: <strong className="text-amber-600">⭐ {stars}개</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 아이템 선택 옷장 / 라커룸 드레스 탭 */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground flex justify-between items-center">
          <span>👔 아바타 옷장 (클릭하여 착용/해제)</span>
          <span className="text-xs text-amber-600 font-bold">내 별 ⭐ {stars}개</span>
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          {AVATAR_ITEMS.map((item) => {
            const isUnlocked = unlockedItems.includes(item.id);
            const isEquipped =
              equippedHead?.id === item.id ||
              equippedEye?.id === item.id ||
              equippedClothes?.id === item.id ||
              equippedSticker?.id === item.id;

            return (
              <Card
                key={item.id}
                onClick={() => toggleEquip(item)}
                className={`cursor-pointer transition-all ${
                  isEquipped
                    ? "border-2 border-amber-500 bg-amber-100/60 dark:bg-amber-900/40 shadow-sm"
                    : "hover:border-slate-400"
                }`}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-bold text-xs">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {isUnlocked ? (
                          isEquipped ? (
                            <span className="text-amber-700 font-bold">★ 착용 중</span>
                          ) : (
                            "착용 가능"
                          )
                        ) : (
                          <span className="text-amber-600 font-bold">⭐ {item.priceStars}개 필요</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEquipped ? (
                    <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">
                      입음
                    </Badge>
                  ) : !isUnlocked ? (
                    <Badge className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5">
                      잠김
                    </Badge>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
