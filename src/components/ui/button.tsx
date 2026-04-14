import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "border border-cyan-300/20 bg-cyan-300/90 text-slate-950 hover:bg-cyan-200 hover:border-cyan-200/50",
  secondary:
    "border border-white/15 bg-white/8 text-slate-100 hover:border-cyan-300/40 hover:bg-cyan-300/10",
  ghost:
    "border border-transparent bg-transparent text-slate-200 hover:border-white/10 hover:bg-white/6",
  danger:
    "border border-rose-400/25 bg-rose-400/12 text-rose-100 hover:border-rose-300/40 hover:bg-rose-400/18",
} as const;

const buttonSizes = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-6 text-base",
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
        "inline-flex items-center justify-center rounded-full font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}
