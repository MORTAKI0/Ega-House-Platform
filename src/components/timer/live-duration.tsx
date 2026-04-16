"use client";

import { useEffect, useState } from "react";

import { formatDurationLabel } from "@/lib/task-session";
import {
  formatDurationClock,
  getElapsedDurationSeconds,
} from "@/lib/timer-domain";

type LiveDurationProps = {
  startedAt: string;
};

export function LiveDuration({ startedAt }: LiveDurationProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    getElapsedDurationSeconds(startedAt),
  );

  useEffect(() => {
    setElapsedSeconds(getElapsedDurationSeconds(startedAt));

    const intervalId = window.setInterval(() => {
      setElapsedSeconds(getElapsedDurationSeconds(startedAt));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [startedAt]);

  return (
    <div className="space-y-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-4 text-cyan-50 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-200/80">
        Running duration
      </p>
      <p
        className="font-mono text-3xl font-semibold tracking-[0.14em] text-cyan-50 sm:text-4xl"
        suppressHydrationWarning
      >
        {formatDurationClock(elapsedSeconds)}
      </p>
      <p className="text-sm text-cyan-100/80" suppressHydrationWarning>
        {formatDurationLabel(elapsedSeconds)} elapsed
      </p>
    </div>
  );
}
