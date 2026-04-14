import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm leading-7 text-white outline-none ring-0 transition",
          "placeholder:text-slate-500 focus:border-cyan-300/50 focus:bg-slate-950/88 focus-visible:ring-4 focus-visible:ring-cyan-300/15",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
