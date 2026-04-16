"use client";

import { WorkspaceErrorFallback } from "@/components/layout/workspace-error-fallback";

type RootErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootErrorPage({ error, reset }: RootErrorPageProps) {
  void error;

  return <WorkspaceErrorFallback reset={reset} scopeLabel="EGA House" />;
}
