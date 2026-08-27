"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

/**
 * 🔴 인라인 style을 쓰지 않는다(check:style 3번). 너비는 정적 Tailwind 분수 클래스로 낸다.
 *    동적 클래스 문자열을 만들면 Tailwind가 못 찾으므로 맵을 미리 적어 둔다.
 */
const WIDTH: Record<number, string> = {
  0: "w-0",
  20: "w-1/5",
  25: "w-1/4",
  33: "w-1/3",
  40: "w-2/5",
  50: "w-1/2",
  60: "w-3/5",
  66: "w-2/3",
  75: "w-3/4",
  80: "w-4/5",
  100: "w-full",
};

const STOPS = Object.keys(WIDTH).map(Number);

function snap(pct: number): string {
  const nearest = STOPS.reduce((a, b) => (Math.abs(b - pct) < Math.abs(a - pct) ? b : a), 0);
  return WIDTH[nearest];
}

export function Progress({
  value,
  max = 100,
  className,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { value: number; max?: number }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <ProgressPrimitive.Root
      value={pct}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-[var(--border)]",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full bg-[var(--accent)] transition-all", snap(pct))}
      />
    </ProgressPrimitive.Root>
  );
}
