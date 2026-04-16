"use client";

import { WorkspaceErrorFallback } from "@/components/layout/workspace-error-fallback";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  void error;

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <WorkspaceErrorFallback reset={reset} scopeLabel="EGA House" />
      </body>
    </html>
  );
}
