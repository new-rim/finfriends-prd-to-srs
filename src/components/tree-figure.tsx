import type { Stage } from "@/contracts/tree.ts";
import { STAGE_LABEL } from "@/contracts/tree.ts";

/**
 * 나무 3단계 도형 — 계획 §5.4
 *
 * 🔴 CSS/SVG로 그린다. 일러스트·3D 에셋을 만들거나 발주하지 않는다 —
 *    사양이 PRD·SRS 어디에도 없다(PRD §7-3의 에셋 미결은 아바타 건이다).
 * 🔴 색은 currentColor로 받는다. 색 리터럴을 쓰면 check:style이 막는다.
 * 🔴 data-stage를 남긴다 — 스냅샷 DOM 개요에 어느 단계가 그려졌는지 잡히게 한다.
 *    그게 없으면 평가자(브라우저 없음)가 도형의 존재를 확인할 길이 없다.
 *
 * 도형은 장식이고 뜻은 옆의 글자 라벨이 진다(UX-001 — 색·그림만으로 상태를
 * 구별하지 않는다). 그래서 role="img" + aria-label로 이름을 함께 준다.
 */
export function TreeFigure({ stage }: { stage: Stage }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className="size-12 text-[var(--accent)]"
      data-stage={stage}
      role="img"
      aria-label={STAGE_LABEL[stage]}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      {/* 흙 — 세 단계 공통 */}
      <path d="M10 40h28" strokeWidth="2.5" />

      {stage === "SEED" && (
        /* 씨앗 — 흙 속에 묻힌 알 하나 */
        <ellipse cx="24" cy="36" rx="4" ry="3" fill="currentColor" stroke="none" />
      )}

      {stage === "SPROUT" && (
        /* 새싹 — 짧은 줄기 + 잎 두 장 */
        <>
          <path d="M24 40v-12" />
          <path d="M24 30c-5 0-7-3-7-6 4 0 7 2 7 6z" fill="currentColor" stroke="none" />
          <path d="M24 32c5 0 7-3 7-6-4 0-7 2-7 6z" fill="currentColor" stroke="none" />
        </>
      )}

      {stage === "TREE" && (
        /* 나무 — 긴 줄기 + 가지 + 둥근 수관 */
        <>
          <path d="M24 40V20" />
          <path d="M24 28l-6-5M24 24l6-5" />
          <circle cx="24" cy="14" r="9" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
