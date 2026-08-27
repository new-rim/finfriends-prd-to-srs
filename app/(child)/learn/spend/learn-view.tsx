"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AREAS } from "@/contracts/areas";
import { LEARN_TOPIC } from "@/fixtures/learn";
import { LEARN_PROGRESS } from "@/fixtures/scenario";
import { PROMOTION } from "@/contracts/tree";
import { Quiz } from "./quiz";
import { ChildHeader } from "@/components/ChildHeader";

export function LearnView({ initialPicked }: { initialPicked?: string | null }) {
  const area = AREAS[LEARN_TOPIC.area];
  const need = PROMOTION.SPROUT;

  return (
    <main className="mx-auto max-w-2xl p-4 space-y-4 pb-12">
      <ChildHeader title="배워요 & 퀴즈" />

      {/* 안내 팁 카드 */}
      <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded-lg border border-emerald-300 text-xs text-emerald-900 dark:text-emerald-200">
        💡 <strong>직접 해보세요!</strong> 올바른 소비 지식을 배우고 아래 <strong>퀴즈</strong>를 풀어 ⭐ 별을 받고, 바로 실천으로 이어가보세요.
      </div>

      <header className="mb-4">
        <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{area.label}</p>
        <h1 className="mt-1 text-2xl font-bold leading-snug">{LEARN_TOPIC.title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{area.description}</p>
      </header>

      {/* 학습 진도율 바 */}
      <section className="mb-4 bg-muted/30 p-3 rounded-lg border space-y-1.5">
        <div className="flex items-baseline justify-between text-xs text-muted-foreground">
          <span className="font-semibold">잘 써요 학습 이수 진도율</span>
          <span className="font-bold text-primary">
            {LEARN_PROGRESS.topicsDone} / {need.learn} 주제 이수 완료
          </span>
        </div>
        <Progress value={LEARN_PROGRESS.topicsDone} max={need.learn} className="h-2.5" />
      </section>

      {/* 본문 아티클 카드 */}
      <Card>
        <CardContent className="p-4 space-y-3 text-sm leading-relaxed">
          {LEARN_TOPIC.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </CardContent>
      </Card>

      {/* 퀴즈 및 인터랙티브 연속 실천 컴포넌트 */}
      <Quiz initialPicked={initialPicked} />
    </main>
  );
}
