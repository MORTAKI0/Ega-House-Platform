import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeTones = {
  neutral: "border-white/10 bg-white/[0.06] text-slate-300",
  accent:  "border-[var(--accent-green-border)] bg-[var(--accent-green-dim)] text-[var(--accent-green)]",
  success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  danger:  "border-rose-400/25 bg-rose-400/10 text-rose-300",
  info:    "border-blue-400/20 bg-blue-400/10 text-blue-300",
} as const;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof badgeTones;
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}
