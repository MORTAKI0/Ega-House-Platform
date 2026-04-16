"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type WorkspaceErrorFallbackProps = {
  reset: () => void;
  scopeLabel: string;
  homeHref?: `/${string}`;
};

const WORKSPACE_LINKS: Array<{ href: `/${string}`; label: string }> = [
  { href: "/tasks", label: "Tasks" },
  { href: "/goals", label: "Goals" },
  { href: "/timer", label: "Timer" },
  { href: "/review", label: "Review" },
];

export function WorkspaceErrorFallback({
  reset,
  scopeLabel,
  homeHref = "/",
}: WorkspaceErrorFallbackProps) {
  return (
    <main className="flex min-h-screen px-4 py-6 text-slate-100 sm:px-6">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.65)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 border-b border-white/8 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-cyan-200/70">
            {scopeLabel}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Something went wrong
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            This area hit an unexpected error. You can retry now or switch to another
            workspace.
          </p>
          <nav aria-label="Workspace navigation" className="flex flex-wrap gap-2">
            {WORKSPACE_LINKS.map((workspace) => (
              <Link
                key={workspace.href}
                href={workspace.href}
                className="inline-flex h-10 items-center rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                {workspace.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recovery actions</CardTitle>
              <CardDescription>
                Retry the current route or return to a stable page.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={reset}>
                Try again
              </Button>
              <Link
                href={homeHref}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 text-sm font-medium text-slate-100 transition duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/10"
              >
                Go to home
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
