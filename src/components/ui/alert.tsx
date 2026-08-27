import { cn } from "@/lib/utils";

/**
 * 🔴 variant에 경고색이 없다 — 회고 어느 갈래에도 빨강·주황을 쓰지 않는다(계획 §8.3).
 *    earned = 「잘했어」 카드 · review = 「따져보는」 카드. 둘 다 긍정 계열이다.
 */
export function Alert({
  tone = "review",
  className,
  ...props
}: React.ComponentProps<"div"> & { tone?: "earned" | "review" }) {
  return (
    <div
      role="note"
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--border)] p-5",
        tone === "earned" ? "bg-[var(--retro-earned)]" : "bg-[var(--retro-review)]",
        className,
      )}
      {...props}
    />
  );
}
