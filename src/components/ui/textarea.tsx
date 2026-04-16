import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-white placeholder:text-[var(--color-ink-faint)] resize-y transition-all duration-150",
        "hover:border-[var(--border-strong)]",
        "focus:outline-none focus:border-[var(--accent-green-border)] focus:ring-2 focus:ring-[var(--accent-green)] focus:ring-opacity-15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
