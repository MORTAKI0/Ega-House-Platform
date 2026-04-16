"use client";

import { WorkspaceErrorFallback } from "@/components/layout/workspace-error-fallback";

type GoalsErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GoalsErrorPage({ error, reset }: GoalsErrorPageProps) {
  void error;

  return <WorkspaceErrorFallback reset={reset} scopeLabel="Goals Workspace" />;
}
