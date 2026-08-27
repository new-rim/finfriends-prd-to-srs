import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WISHLIST_SUMMARY } from "@/fixtures/wishlist";
import { MISSIONS } from "@/fixtures/missions";
import { AREAS } from "@/contracts/areas";

export default function ChildHomePage() {
  const { totalStars, activeItem } = WISHLIST_SUMMARY;
  const progressPercent = Math.round((activeItem.currentStars / activeItem.requiredStars) * 100);
  const waitingCount = MISSIONS.filter((m) => m.status === "WAITING").length;

  return (
    <main className="p-4 max-w-md mx-auto space-y-4 pb-12">
      {/* 아동 상단 프로필 & 별 잔액 헤더 */}
      <div className="flex justify-between items-center bg-amber-400/20 p-4 rounded-xl border border-amber-300">
        <div>
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">민우의 모험</span>
          <h1 className="text-xl font-bold">아이 홈 대시보드</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Link href="/avatar" className="flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-1.5 rounded-full font-bold shadow text-xs hover:bg-emerald-700">
            <span>🎨</span>
            <span>아바타</span>
          </Link>
          <Link href="/wishlist" className="flex items-center gap-1 bg-amber-500 text-white px-3 py-1.5 rounded-full font-bold shadow text-sm hover:bg-amber-600">
            <span>⭐</span>
            <span>{totalStars}개</span>
          </Link>
        </div>
      </div>

      {/* 🎨 신규 아바타 꾸미기 룸 메인 카드 */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950 dark:to-emerald-950 hover:border-amber-500 transition-all">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Badge className="bg-amber-500 text-white text-[10px]">인기 기능</Badge>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">민우의 나무 요정</span>
            </div>
            <div className="text-base font-bold">🎨 마이 아바타 꾸미기 룸</div>
            <div className="text-xs text-muted-foreground">왕관, 별빛 안경, 의상으로 캐릭터를 직접 입혀요!</div>
          </div>
          <Link
            href="/avatar"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow whitespace-nowrap"
          >
            입어보기 &rarr;
          </Link>
        </CardContent>
      </Card>

      {/* 목표 위시리스트 요약 카드 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-semibold">내 위시리스트 목표</CardTitle>
            <Link href="/wishlist" className="text-xs text-primary font-medium hover:underline">
              전체 보기 &rarr;
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-bold">{activeItem.name}</span>
            <span className="text-xs font-semibold text-amber-600">⭐ {activeItem.currentStars}/{activeItem.requiredStars} ({progressPercent}%)</span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
        </CardContent>
      </Card>

      {/* 4영역 아동 서비스 메뉴 */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">활동 둘러보기</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* 1. 벌어요 */}
          <Link href="/missions">
            <Card className="hover:border-amber-400 transition-colors h-full">
              <CardContent className="p-3.5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">{AREAS.EARN.label}</span>
                  <span className="text-lg">🎯</span>
                </div>
                <p className="text-xs text-muted-foreground">{AREAS.EARN.description}</p>
                {waitingCount > 0 && (
                  <Badge className="mt-1 bg-amber-100 text-amber-800 text-[10px] border-amber-300">
                    승인 대기 {waitingCount}건
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* 2. 잘 써요 */}
          <Link href="/learn/spend">
            <Card className="hover:border-amber-400 transition-colors h-full">
              <CardContent className="p-3.5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">{AREAS.SPEND.label}</span>
                  <span className="text-lg">📚</span>
                </div>
                <p className="text-xs text-muted-foreground">{AREAS.SPEND.description}</p>
                <Badge className="mt-1 bg-emerald-100 text-emerald-800 text-[10px] border-emerald-300">
                  학습 1편 이수
                </Badge>
              </CardContent>
            </Card>
          </Link>

          {/* 3. 모아요 */}
          <Link href="/plan">
            <Card className="hover:border-amber-400 transition-colors h-full">
              <CardContent className="p-3.5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">{AREAS.SAVE.label}</span>
                  <span className="text-lg">💡</span>
                </div>
                <p className="text-xs text-muted-foreground">{AREAS.SAVE.description}</p>
              </CardContent>
            </Card>
          </Link>

          {/* 4. 늘려요 */}
          <Card className="opacity-75 bg-muted/30">
            <CardContent className="p-3.5 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-base">{AREAS.GROW.label}</span>
                <span className="text-lg">🌱</span>
              </div>
              <p className="text-xs text-muted-foreground">{AREAS.GROW.description}</p>
              <Badge className="mt-1 text-[10px]">곧 열려요</Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 핵심 기능 바로가기 3종 */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">바로가기</h2>
        <div className="space-y-2">
          <Link href="/retro" className="block">
            <Card className="hover:border-primary transition-colors bg-sky-50/40 dark:bg-sky-950/20">
              <CardContent className="p-3.5 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-sm">📝 소비 회고 작성하기</div>
                  <div className="text-xs text-muted-foreground">내가 쓴 돈을 되돌아보고 별을 받아요</div>
                </div>
                <span className="text-sm font-bold text-primary">&rarr;</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/history" className="block">
            <Card className="hover:border-primary transition-colors">
              <CardContent className="p-3.5 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-sm">📜 내 소비 내역 보기</div>
                  <div className="text-xs text-muted-foreground">최근 결제한 가게와 금액 목록</div>
                </div>
                <span className="text-sm font-bold text-primary">&rarr;</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="pt-4 text-center">
        <Link href="/" className="text-xs text-muted-foreground underline">
          &larr; 첫 진입 화면(사용자 선택)으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
