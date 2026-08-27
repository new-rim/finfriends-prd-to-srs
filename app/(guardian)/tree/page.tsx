import { Badge } from "@/components/ui/badge";
import { Card, CardMuted, CardTitle } from "@/components/ui/card";
import { AREAS, EMPTY_STATE } from "@/contracts/areas";
import { buildNarrative } from "@/contracts/narrative";
import { STAGE_LABEL, isStalled, remainingConditions } from "@/contracts/tree";
import { treeDefault, treeNoPractice } from "@/fixtures/tree";

/**
 * ① 성장 나무 + 정체 원인 — 계획 §5
 *
 * 🔴 기본 상태가 판정 대상이다(PRD US-1 AC2). Accordion·Dialog를 쓰지 않는다 —
 *    변화 문장 · 실천 근거 · 4칸 단계 · 실천 근거 · 정체 원인 · 승인 대기 Badge가
 *    전부 펼치지 않은 상태에 있어야 한다.
 * 🔴 최상단은 변화 문장이다. 숫자 요약을 맨 위에 두지 않는다 —
 *    PRD가 C1(성장 증거 부재)로 직접 비판한 형태다.
 */
export default async function TreePage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const view = state === "empty" ? treeNoPractice : treeDefault;
  const narrative = buildNarrative(view.states);

  const stalled = view.states.filter(isStalled);

  return (
    <main className="mx-auto max-w-2xl p-6">
      {/* 최상단 두 문장 — AC-1.1 변화 · AC-1.2 실천 근거 */}
      <section className="mb-5">
        <h1 className="text-2xl font-bold leading-snug text-[var(--text)]">
          {narrative.change}
        </h1>
        {narrative.reason && (
          <p className="mt-1 text-[var(--text-muted)]">{narrative.reason}</p>
        )}
        {narrative.isEmpty && (
          <p className="mt-1 text-[var(--text-muted)]">{EMPTY_STATE.noPractice.hint}</p>
        )}
      </section>

      {/* 승인 대기 N건 — AC-6.2. 화면이 세지 않는다. FR-016이 준 값 */}
      {view.pendingApprovals > 0 && (
        <section className="mb-5">
          <Badge>승인 대기 {view.pendingApprovals}건</Badge>
        </section>
      )}

      {/* 4칸 격자 — 단계 + 실천 근거 기본 노출 */}
      <section className="mb-6 grid grid-cols-2 gap-3">
        {view.states.map((s) => {
          const remaining = remainingConditions(s);
          return (
            <Card key={s.area}>
              <CardTitle>{AREAS[s.area].label}</CardTitle>
              <CardMuted className="mt-0.5 text-sm">{AREAS[s.area].description}</CardMuted>

              {s.locked ? (
                <>
                  <p className="mt-3 font-semibold text-[var(--text)]">
                    {EMPTY_STATE.growLocked.title}
                  </p>
                  <CardMuted className="text-sm">{EMPTY_STATE.growLocked.hint}</CardMuted>
                </>
              ) : (
                <>
                  <p className="mt-3 text-lg font-semibold text-[var(--accent)]">
                    {STAGE_LABEL[s.stage]}
                  </p>
                  <CardMuted className="text-sm">
                    {s.progress.practice > 0
                      ? `실천 ${s.progress.practice}회`
                      : (remaining[0]?.label ?? "")}
                  </CardMuted>
                </>
              )}
            </Card>
          );
        })}
      </section>

      {/* 정체 원인 — AC-3.1 · ACE-3.1. 미충족 조건 전부 · 가장 적게 남은 것이 최상단 */}
      {stalled.map((s) => (
        <section
          key={s.area}
          className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <p className="font-semibold text-[var(--text)]">
            {AREAS[s.area].label}가 {s.daysSinceChange}일째 그대로예요
          </p>
          <ul className="mt-2 space-y-1">
            {remainingConditions(s).map((c) => (
              <li key={c.label} className="text-[var(--text-muted)]">
                · {c.label}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
