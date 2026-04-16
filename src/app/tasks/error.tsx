"use client";

import { WorkspaceErrorFallback } from "@/components/layout/workspace-error-fallback";

type TasksErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TasksErrorPage({ error, reset }: TasksErrorPageProps) {
  void error;

  return <WorkspaceErrorFallback reset={reset} scopeLabel="Tasks Workspace" />;
}
