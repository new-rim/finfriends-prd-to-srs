import { Alert } from "@/components/ui/alert";
import { AREAS, EMPTY_STATE } from "@/contracts/areas";
import { RETRO_ENTRIES, RETRO_SINGLE_LIMIT, type RetroEntry } from "@/fixtures/scenario";
import { RETRO_SENTENCES, RETRO_TITLE } from "@/fixtures/retro-sentences";

/**
 * ③ 두 갈래 회고 — 계획 §7 · §8 · §9
 *
 * 🔴 시각은 「별 받음 / 별 없음」 2종이고 문장이 3종이다(§7).
 *    「업종 다름」은 ⭐1을 받은 경우라 계획 지킴과 같은 시각이고 문장만 다르다.
 * 🔴 두 갈래를 카드 「구조」로 가른다(§8) — 별 받음은 ⭐가 주인공,
 *    별 없음은 금액 비교가 주인공. 색·아이콘은 보조다.
 * 🔴 경고색 · 부정 아이콘 · 차감 표기 · 점수·등급을 쓰지 않는다(§8.3).
 *    FR-021은 별을 안 줄 뿐 차감하지 않는다(P-03 「별은 모으기만」).
 */
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

function sentenceFor(e: RetroEntry) {
  const pool = RETRO_SENTENCES[e.branch];
  return pool[e.sentenceIndex % pool.length];
}

/** 별 받음 — ⭐가 주인공인 「잘했어」 카드 */
function EarnedCard({ e }: { e: RetroEntry }) {
  return (
    <Alert tone="earned">
      <p className="text-center text-5xl leading-none" aria-hidden="true">
        ⭐
      </p>
      <p className="mt-3 text-center text-xl font-bold">{RETRO_TITLE.earned}</p>
      <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
        {e.actualPlace} {won(e.actualAmount)}
        {e.branch === "CATEGORY_DIFF" && ` · 적어둔 곳은 ${e.plannedPlace}`}
      </p>
      <p className="mt-4 border-t border-[var(--border)] pt-4">{sentenceFor(e)}</p>
      <p className="mt-2 text-sm font-medium text-[var(--accent)]">⭐ 1개 받았어요</p>
      {/* 🔴 ③ → ① 연결. PRD US-2 AC1의 실천 트리거 3종에 「소비 회고」가 있고,
          "⭐ 지급 + 해당 나무 진행도 갱신이 동일 세션 내 반영"을 요구한다.
          퀴즈(AC-2.1 비담지)에만 나무를 가리키고 정작 담지 화면이 비어 있었다.
          🔴 갈래 B 카드에는 넣지 않는다 — 별을 못 받은 건은 실천에 가산되지 않는다. */}
      <p className="text-sm text-[var(--text-muted)]">
        {AREAS.SPEND.label} 나무의 실천이 하나 늘었어요.
      </p>
    </Alert>
  );
}

/** 별 없음 — 금액 비교가 주인공인 「따져보는」 카드. 🔴 혼내는 화면이 아니다 */
function ReviewCard({ e }: { e: RetroEntry }) {
  const diff = e.actualAmount - e.plannedAmount;
  return (
    <Alert tone="review">
      <p className="text-lg font-bold">
        <span aria-hidden="true">🔍 </span>
        {RETRO_TITLE.review}
      </p>
      <dl className="mt-4 space-y-1">
        <div className="flex items-baseline justify-between">
          <dt className="text-[var(--text-muted)]">적어둔 금액</dt>
          <dd className="text-2xl font-semibold">{won(e.plannedAmount)}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-[var(--text-muted)]">실제로 쓴 금액</dt>
          <dd className="text-2xl font-semibold">{won(e.actualAmount)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[var(--text-muted)]">{won(diff)} 더 썼어요</p>
      <p className="mt-4 border-t border-[var(--border)] pt-4">{sentenceFor(e)}</p>
    </Alert>
  );
}

export default async function RetroPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const entries = state === "empty" ? [] : RETRO_ENTRIES;

  if (entries.length === 0) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-bold">{EMPTY_STATE.retroEmpty.title}</h1>
        <p className="mt-1 text-[var(--text-muted)]">{EMPTY_STATE.retroEmpty.hint}</p>
      </main>
    );
  }

  const single = entries.slice(0, RETRO_SINGLE_LIMIT);
  const merged = entries.slice(RETRO_SINGLE_LIMIT);

  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-xl font-bold">오늘 돌아볼 것</h1>

      {single.map((e) => (e.starGranted ? <EarnedCard key={e.id} e={e} /> : <ReviewCard key={e.id} e={e} />))}

      {/* 요약 회고 — 갈래와 별개의 축이다(§8.4 · ACE-5.2). 테두리·여백으로 단건과 구별 */}
      {merged.length > 0 && (
        <section className="rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border)] p-4">
          <p className="mb-3 font-semibold">{merged.length}일치를 모았어요</p>
          <div className="space-y-3">
            {merged.map((e) =>
              e.starGranted ? <EarnedCard key={e.id} e={e} /> : <ReviewCard key={e.id} e={e} />,
            )}
          </div>
        </section>
      )}
    </main>
  );
}
