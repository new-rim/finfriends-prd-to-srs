import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PENDING_APPROVALS, AREA_STATES } from "@/fixtures/scenario";
import { FOREST_SUMMARY } from "@/fixtures/scenario";
import { AREAS } from "@/contracts/areas";

export default function GuardianHomePage() {
  const promotedArea = AREA_STATES.find((s) => s.promotedThisCycle);
  const promotedName = promotedArea ? AREAS[promotedArea.area].label : "잘 써요";

  return (
    <main className="p-4 max-w-md mx-auto space-y-4 pb-12">
      {/* 보호자 상단 프로필 헤더 */}
      <div className="flex justify-between items-center bg-emerald-600 text-white p-4 rounded-xl shadow">
        <div>
          <span className="text-xs font-medium text-emerald-100">민우 보호자님</span>
          <h1 className="text-xl font-bold">부모 홈 대시보드</h1>
        </div>
        <Link href="/guardian/missions">
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-amber-300 font-bold px-2.5 py-1 text-xs cursor-pointer">
            승인 대기 {PENDING_APPROVALS}건 &rarr;
          </Badge>
        </Link>
      </div>

      {/* 🛡️ 부모 미션 승인 룸 메인 카드 (신규) */}
      <Card className="border-2 border-amber-400 bg-amber-50/50 dark:bg-amber-950/40 hover:border-amber-500 transition-all">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-amber-500 text-white text-[10px]">핵심 기능</Badge>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">양방향 상호작용</span>
            </div>
            <div className="text-base font-bold mt-0.5">🛡️ 미션 승인 & 칭찬 룸</div>
            <div className="text-xs text-muted-foreground mt-0.5">아이가 실천한 미션을 확인하고 ⭐ 별과 칭찬을 보내요.</div>
          </div>
          <Link
            href="/guardian/missions"
            className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow whitespace-nowrap"
          >
            승인하기 &rarr;
          </Link>
        </CardContent>
      </Card>

      {/* 1. 성장 나무 요약 카드 */}
      <Card className="border-2 border-emerald-500">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold">🌳 아이의 성장 나무</CardTitle>
            <Link href="/tree" className="text-xs text-emerald-600 font-bold hover:underline">
              상세 보기 &rarr;
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded-md text-sm">
            <div className="font-bold text-emerald-800 dark:text-emerald-200">
              이번 달, {promotedName}가 새싹이 됐어요.
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              쓰기 전에 3번 적어서 자란 거예요. (행동 변화 감지)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {AREA_STATES.map((s) => (
              <div key={s.area} className="p-2 border rounded bg-background flex justify-between items-center">
                <span>{AREAS[s.area].label}</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {s.stage === "SEED" ? "씨앗" : s.stage === "SPROUT" ? "새싹" : "나무"}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/tree"
            className="block text-center w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-sm"
          >
            성장 나무 진화 연출 & 정체 분석 &rarr;
          </Link>
        </CardContent>
      </Card>

      {/* 2. 월간 숲 요약 카드 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold">🌲 월간 숲 요약</CardTitle>
            <Link href="/forest" className="text-xs text-primary font-medium hover:underline">
              전체 보기 &rarr;
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            전월 대비 주요 성과 (60초 내 지목):
          </div>
          <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
            {FOREST_SUMMARY.highlights.map((h) => (
              <li key={h.id}>{h.title}</li>
            ))}
          </ul>
          <Link
            href="/forest"
            className="block text-center w-full py-2 border border-emerald-600 text-emerald-700 dark:text-emerald-300 rounded font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950 mt-2"
          >
            월간 숲 리포트 보기 &rarr;
          </Link>
        </CardContent>
      </Card>

      <div className="pt-4 text-center">
        <Link href="/" className="text-xs text-muted-foreground underline">
          &larr; 첫 진입 화면(사용자 선택)으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
