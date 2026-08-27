import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--accent)]",
        "px-3 py-1 text-sm font-medium text-[var(--accent)]",
        className,
      )}
      {...props}
    />
  );
}
