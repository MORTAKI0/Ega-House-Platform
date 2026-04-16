"use client";

import { WorkspaceErrorFallback } from "@/components/layout/workspace-error-fallback";

type TimerErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TimerErrorPage({ error, reset }: TimerErrorPageProps) {
  void error;

  return <WorkspaceErrorFallback reset={reset} scopeLabel="Timer Workspace" />;
}
