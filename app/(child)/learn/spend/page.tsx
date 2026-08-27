import { Progress } from "@/components/ui/progress";
import { AREAS } from "@/contracts/areas";
import { LEARN_TOPIC } from "@/fixtures/learn";
import { LEARN_PROGRESS } from "@/fixtures/scenario";
import { PROMOTION } from "@/contracts/tree";
import { Quiz } from "./quiz";

/**
 * ② 학습·퀴즈 — 계획 §10 · §11
 *
 * 🔴 프로토타입은 이 한 경로만 렌더한다. 학습 목록 화면을 만들지 않는다 —
 *    실제 원고 4주제는 콘텐츠 담당의 외부 선행이며 FR-014에서 온다.
 * 🔴 4영역 표기는 src/contracts/areas.ts에서만 온다. 문자열을 여기 쓰지 않는다.
 */
export default async function LearnSpendPage({
  searchParams,
}: {
  searchParams: Promise<{ picked?: string }>;
}) {
  const { picked } = await searchParams;
  const area = AREAS[LEARN_TOPIC.area];
  const need = PROMOTION.SPROUT;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="mb-6">
        <p className="text-sm font-semibold text-[var(--accent)]">{area.label}</p>
        <h1 className="mt-1 text-2xl font-bold leading-snug">{LEARN_TOPIC.title}</h1>
        <p className="mt-1 text-[var(--text-muted)]">{area.description}</p>
      </header>

      <section className="mb-6">
        <div className="mb-1 flex items-baseline justify-between text-sm text-[var(--text-muted)]">
          <span>배우기</span>
          <span>
            {LEARN_PROGRESS.topicsDone} / {need.learn}
          </span>
        </div>
        <Progress value={LEARN_PROGRESS.topicsDone} max={need.learn} />
      </section>

      <article className="space-y-4 text-[var(--text)]">
        {LEARN_TOPIC.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

      <Quiz initialPicked={picked ?? null} />
    </main>
  );
}
