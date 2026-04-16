import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "bg-[var(--accent-green)] border border-[var(--accent-green-border)] text-[#064e3b] font-semibold hover:bg-[var(--accent-green-strong)] hover:border-[var(--accent-green-strong)] active:scale-[0.98]",
  secondary:
    "border border-[var(--border-default)] bg-[var(--surface-2)] text-slate-100 hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)] hover:text-white active:scale-[0.98]",
  ghost:
    "border border-transparent bg-transparent text-slate-300 hover:border-[var(--border-subtle)] hover:bg-[var(--surface-1)] hover:text-white",
  danger:
    "border border-rose-400/25 bg-rose-400/10 text-rose-300 hover:border-rose-400/40 hover:bg-rose-400/15 active:scale-[0.98]",
} as const;

const buttonSizes = {
  sm: "h-8 px-3.5 text-xs rounded-lg",
  md: "h-9 px-4 text-sm rounded-xl",
  lg: "h-11 px-5 text-sm rounded-xl",
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-green)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}
