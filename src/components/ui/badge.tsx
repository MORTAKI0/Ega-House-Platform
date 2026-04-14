import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeTones = {
  neutral: "border-white/12 bg-white/7 text-slate-200",
  accent: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  success: "border-emerald-400/25 bg-emerald-400/12 text-emerald-100",
  warning: "border-amber-300/25 bg-amber-300/12 text-amber-100",
  danger: "border-rose-400/25 bg-rose-400/12 text-rose-100",
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
        "inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-medium uppercase tracking-[0.22em]",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}
