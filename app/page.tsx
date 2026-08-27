import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * 진입점 — 사용자 선택(아동 / 보호자 2명 시점)
 */
export default function Home() {
  return (
    <main data-theme="guardian" className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="text-center space-y-2">
        <Badge className="bg-emerald-600 text-white">시각 프로토타입 v2.0</Badge>
        <h1 className="text-3xl font-bold">핀프렌즈 (FinFriends)</h1>
        <p className="text-muted-foreground text-sm">
          아동과 보호자 2명의 사용자 시점으로 아바타 꾸미기, 미션 승인, 회고 등 핵심 서비스를 직접 경험해 보세요.
        </p>
      </div>

      {/* 사용자 선택 2개 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. 아동(아이) 사용자 */}
        <Card className="border-2 border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500 transition-colors">
          <CardHeader>
            <div className="flex justify-between items-center">
              <span className="text-2xl">👦</span>
              <Badge className="bg-amber-500 text-white">아동 시점</Badge>
            </div>
            <CardTitle className="text-xl">아이 화면 시작하기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              아바타를 직접 입히고, 나만의 미션을 만들며, 오늘 쓴 돈을 직접 기록하고 회고해요.
            </p>
            <Link
              href="/child/home"
              className="block w-full text-center py-2.5 px-4 rounded-md font-bold bg-amber-500 hover:bg-amber-600 text-white shadow"
            >
              아이 홈 대시보드 &rarr;
            </Link>
          </CardContent>
        </Card>

        {/* 2. 보호자(부모) 사용자 */}
        <Card className="border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-600 transition-colors">
          <CardHeader>
            <div className="flex justify-between items-center">
              <span className="text-2xl">👩‍👧‍👦</span>
              <Badge className="bg-emerald-600 text-white">보호자 시점</Badge>
            </div>
            <CardTitle className="text-xl">부모 화면 시작하기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              아이가 실천한 미션을 승인하고 ⭐ 별과 칭찬을 보내며, 나무 성장 진화 연출과 월간 숲을 확인해요.
            </p>
            <Link
              href="/guardian/home"
              className="block w-full text-center py-2.5 px-4 rounded-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow"
            >
              부모 홈 대시보드 &rarr;
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 전체 화면 직통 링크 디렉터리 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">전체 화면 바로가기</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <div className="font-semibold text-xs text-amber-700 dark:text-amber-400">👶 아동 화면 (6종)</div>
            <ul className="space-y-1 text-xs">
              <li><Link href="/avatar" className="hover:underline font-bold text-amber-600">🎨 마이 아바타 꾸미기 룸 (/avatar)</Link></li>
              <li><Link href="/wishlist" className="hover:underline text-primary">⭐ 위시리스트 & 별 상점 (/wishlist)</Link></li>
              <li><Link href="/missions" className="hover:underline text-primary">🎯 미션 목록 (나만의 미션 추가) (/missions)</Link></li>
              <li><Link href="/history" className="hover:underline text-primary">📜 소비 내역 (오늘 쓴 돈 기록) (/history)</Link></li>
              <li><Link href="/learn/spend" className="hover:underline text-primary">📚 배워요 & 퀴즈 (/learn/spend)</Link></li>
              <li><Link href="/plan" className="hover:underline text-primary">💡 소비 계획 미리 적기 (/plan)</Link></li>
              <li><Link href="/retro" className="hover:underline text-primary">📝 두 갈래 회고 (/retro)</Link></li>
            </ul>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-xs text-emerald-700 dark:text-emerald-400">🛡️ 보호자 화면 (3종)</div>
            <ul className="space-y-1 text-xs">
              <li><Link href="/guardian/missions" className="hover:underline font-bold text-emerald-700">🛡️ 미션 승인 및 칭찬 룸 (/guardian/missions)</Link></li>
              <li><Link href="/tree" className="hover:underline text-primary">🌳 성장 나무 (성장 진화 연출) (/tree)</Link></li>
              <li><Link href="/forest" className="hover:underline text-primary">🌲 월간 숲 (/forest)</Link></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
