import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] px-3.5 text-sm text-white placeholder:text-[var(--color-ink-faint)] transition-all duration-150",
        "hover:border-[var(--border-strong)]",
        "focus:outline-none focus:border-[var(--accent-green-border)] focus:ring-2 focus:ring-[var(--accent-green)] focus:ring-opacity-15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
