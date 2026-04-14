import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none ring-0 transition",
          "placeholder:text-slate-500 focus:border-cyan-300/50 focus:bg-slate-950/88 focus-visible:ring-4 focus-visible:ring-cyan-300/15",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
