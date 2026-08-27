"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

export function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn("grid gap-3", className)} {...props} />;
}

export function RadioGroupItem({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & { value: string }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-[var(--radius-card)]",
        "border border-[var(--border)] bg-[var(--surface)] px-4 py-3",
        className,
      )}
    >
      <RadioGroupPrimitive.Item
        value={value}
        className="size-5 shrink-0 rounded-full border-2 border-[var(--text-muted)] outline-none"
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="block size-full rounded-full border-4 border-[var(--accent)]" />
      </RadioGroupPrimitive.Item>
      <span className="text-[var(--text)]">{children}</span>
    </label>
  );
}
