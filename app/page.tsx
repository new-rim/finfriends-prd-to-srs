import Link from "next/link";

/**
 * 진입점 — 계획 §14.2
 *
 * 🔴 프로토타입 전용이다. 제품 사양이 아니며 FR-010(인증·라우팅)이 오면 사라진다.
 * 🔴 링크 순서가 곧 주장이다 — PRD §0-1의 위계(선언①이 일어나야 선언②가
 *    보여줄 것이 생긴다)를 ②→③→① 순서가 그대로 재현한다.
 */
const STEPS = [
  { href: "/learn/spend", n: 1, label: "배워요", note: "아이가 배운다" },
  { href: "/retro", n: 2, label: "돌아봐요", note: "아이가 실천을 되돌아본다" },
  { href: "/tree", n: 3, label: "부모 화면", note: "그 결과가 부모에게 보인다" },
];

export default function Home() {
  return (
    <main data-theme="guardian" className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">핀프렌즈 프로토타입</h1>
      <p className="mt-1 text-[var(--text-muted)]">
        아래 순서로 보면 「성장이 일어난다 → 그 성장이 보인다」가 한 줄로 읽힙니다.
      </p>

      <ol className="mt-6 space-y-3">
        {STEPS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex items-baseline gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <span className="font-bold text-[var(--accent)]">{s.n}</span>
              <span className="font-semibold">{s.label}</span>
              <span className="text-sm text-[var(--text-muted)]">{s.note}</span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-sm text-[var(--text-muted)]">
        빈 화면 검수 — <Link className="underline" href="/tree?state=empty">나무 · 실천 0건</Link>
        {" · "}
        <Link className="underline" href="/retro?state=empty">회고 · 큐 빔</Link>
      </p>
    </main>
  );
}
