import { cn } from "@/lib/utils";

/** 🔴 컴포넌트는 하나씩만 존재한다. ChildCard/GuardianCard 같은 쌍을 만들지 않는다(UX-001 Scenario 2) */
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("font-semibold text-[var(--text)]", className)} {...props} />;
}

export function CardMuted({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-[var(--text-muted)]", className)} {...props} />;
}
