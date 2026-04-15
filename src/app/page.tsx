import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/tasks");
  }

  return (
    <AppShell
      eyebrow="Shared Foundation"
      title="EGA House"
      description="The visual system, app shell, and shared primitives are now in place for the goals, tasks, timer, and review surfaces."
      actions={
        <>
          <Button className="min-w-36">Explore foundation</Button>
          <Button variant="secondary" className="min-w-36">
            Review auth flow
          </Button>
        </>
      }
      navigation={
        <>
          <Badge tone="accent">Goals</Badge>
          <Badge>Tasks</Badge>
          <Badge>Timer</Badge>
          <Badge>Review</Badge>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
        <Card>
          <CardHeader>
            <Badge tone="accent" className="w-fit">
              Token Layer
            </Badge>
            <CardTitle>Shared design language</CardTitle>
            <CardDescription>
              Dark surfaces, cyan accents, rounded framing, and calm editorial
              spacing copied forward from the old operational dashboard and
              normalized for this repo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Surfaces
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Shell, panel, and muted card tones are aligned for future app
                pages.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Typography
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Sans and mono stacks are defined globally without pulling in a
                separate page-level font system.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Primitives
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Buttons, inputs, badges, cards, and the shell are ready for the
                next pages.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge tone="success" className="w-fit">
              Next Build Step
            </Badge>
            <CardTitle>App pages can plug in directly</CardTitle>
            <CardDescription>
              The next shared pages can focus on data and workflow instead of
              rebuilding layout and styling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
              Start each subdomain with <code className="font-mono text-cyan-100">AppShell</code>,
              compose page sections from <code className="font-mono text-cyan-100">Card</code>,
              and use the OpenClaw utility from server code when a health probe
              is needed.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary">Shell ready</Button>
              <Button variant="ghost">Probe ready</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
