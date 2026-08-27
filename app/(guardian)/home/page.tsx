import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuardianHeader } from "@/components/GuardianHeader";

/**
 * 부모(보호자) 홈 대시보드
 */
export default function GuardianHomePage() {
  return (
    <main className="mx-auto max-w-md p-4 space-y-4 pb-12">
      <GuardianHeader title="부모 대시보드" />

      {/* 안내 팁 카드 */}
      <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded-lg border border-emerald-300 text-xs text-emerald-900 dark:text-emerald-200">
        🛡️ <strong>보호자 메인 룸:</strong> 아이의 <strong>성장 나무 현황</strong>을 가장 먼저 확인하고, 제출된 미션을 칭찬 메시지와 함께 승인해 주세요.
      </div>

      {/* 🟢 [수정 3] 부모 홈 대시보드 최상단(1위): 성장 나무 현황 & 성장 진화 연출 */}
      <Card className="border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl">🌳</span>
            <Badge className="bg-emerald-600 text-white">최우선 1위</Badge>
          </div>
          <CardTitle className="text-lg">아이의 4영역 성장 나무</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            벌어요, 잘 써요, 모아요, 늘려요 4가지 금융 영역에서 아이의 나무가 얼마나 자랐는지 관찰해 보세요.
          </p>

          <div className="grid grid-cols-4 gap-1.5 text-center text-xs pt-1">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded">
              <div className="text-[10px] text-muted-foreground">벌어요</div>
              <div className="font-bold text-emerald-700 dark:text-emerald-300">🌿 새싹</div>
            </div>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded border-2 border-amber-400">
              <div className="text-[10px] text-muted-foreground">잘 써요</div>
              <div className="font-bold text-amber-700 dark:text-amber-300">🌱 씨앗</div>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
              <div className="text-[10px] text-muted-foreground">모아요</div>
              <div className="font-bold text-muted-foreground">🌱 씨앗</div>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
              <div className="text-[10px] text-muted-foreground">늘려요</div>
              <div className="font-bold text-muted-foreground">🔒 잠김</div>
            </div>
          </div>

          <Link
            href="/tree"
            className="block w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow transition-colors"
          >
            [🌳 성장 나무 보러가기] ✨ 성장 진화 연출 체험 &rarr;
          </Link>
        </CardContent>
      </Card>

      {/* 2위: 아이의 미션 승인 및 칭찬 보내기 카드 */}
      <Card className="border-2 border-amber-400 bg-amber-50/40 dark:bg-amber-950/40">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl">🛡️</span>
            <Badge className="bg-amber-500 text-white">미션 1건 대기중</Badge>
          </div>
          <CardTitle className="text-lg">미션 승인 & 칭찬 룸</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            아이가 올려둔 미션 실천 인증을 확인하고, 칭찬 한마디와 함께 ⭐ 별을 지급해 주세요.
          </p>

          <Link
            href="/guardian/missions"
            className="block w-full text-center py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded shadow transition-colors"
          >
            [🛡️ 미션 승인하러 가기] 칭찬 메시지 보내기 &rarr;
          </Link>
        </CardContent>
      </Card>

      {/* 3위: 월간 숲 요약 리포트 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl">🌲</span>
            <Badge className="bg-muted text-foreground">월간 리포트</Badge>
          </div>
          <CardTitle className="text-base font-bold">월간 숲 요약</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            전월 대비 아이의 금융 습관 성장 지목 변화(3가지)를 60초 내로 확인합니다.
          </p>
          <Link
            href="/forest"
            className="block w-full text-center py-2 bg-muted hover:bg-accent text-foreground font-bold text-xs rounded border"
          >
            [🌲 월간 숲 보러가기] &rarr;
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
