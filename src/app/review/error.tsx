"use client";

import { WorkspaceErrorFallback } from "@/components/layout/workspace-error-fallback";

type ReviewErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ReviewErrorPage({ error, reset }: ReviewErrorPageProps) {
  void error;

  return <WorkspaceErrorFallback reset={reset} scopeLabel="Review Workspace" />;
}
