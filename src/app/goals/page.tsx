import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { InlineGoalStatusForm } from "@/components/goals/inline-goal-status-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatTaskToken, getTaskStatusTone } from "@/lib/task-domain";

import { updateGoalStatusAction } from "./actions";
import { CreateGoalForm } from "./create-goal-form";

export const metadata: Metadata = {
  title: "Goals | EGA House",
  description: "Goals list and creation flow.",
};

type GoalsPageProps = {
  searchParams: Promise<{
    goalUpdateError?: string;
    goalUpdateGoalId?: string;
  }>;
};

async function getGoalsData() {
  const supabase = await createClient();

  const [projectsResult, goalsResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("goals")
      .select("id, title, description, status, updated_at, projects(name)")
      .order("updated_at", { ascending: false }),
  ]);

  if (projectsResult.error) {
    throw new Error(`Failed to load projects: ${projectsResult.error.message}`);
  }

  if (goalsResult.error) {
    throw new Error(`Failed to load goals: ${goalsResult.error.message}`);
  }

  return {
    projects: projectsResult.data,
    goals: goalsResult.data,
  };
}

export default async function GoalsPage({ searchParams }: GoalsPageProps) {
  const resolvedSearchParams = await searchParams;
  const goalUpdateError = resolvedSearchParams.goalUpdateError?.slice(0, 180) ?? null;
  const goalUpdateGoalId = resolvedSearchParams.goalUpdateGoalId ?? null;
  const { projects, goals } = await getGoalsData();

  return (
    <AppShell
      eyebrow="Goals Workspace"
      title="Goals"
      description="Track strategic goals and attach them to existing projects."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Goals list */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Goals list</CardTitle>
                <CardDescription>
                  Current goals across projects, ordered by recent updates.
                </CardDescription>
              </div>
              <span className="text-sm font-semibold text-[var(--color-ink-muted)]">
                {goals.length} goal{goals.length !== 1 ? "s" : ""}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-white/10 bg-white/[0.015] text-center">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-soft)]">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[var(--color-ink-muted)]">No goals yet</p>
                <p className="text-xs text-[var(--color-ink-faint)] mt-1">Create a goal to start tracking progress</p>
              </div>
            ) : (
              <div className="space-y-2">
                {goals.map((goal) => (
                  <article
                    id={`goal-${goal.id}`}
                    key={goal.id}
                    className="scroll-mt-24 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-muted)] px-4 py-3.5 hover:border-[var(--border-default)] hover:bg-[var(--surface-2)] transition-all duration-150"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3
                          className="text-sm font-semibold text-white leading-snug"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {goal.title}
                        </h3>
                        <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
                          {goal.projects?.name ?? "Unknown project"}
                        </p>
                      </div>
                      <Badge tone={getTaskStatusTone(goal.status)}>
                        {formatTaskToken(goal.status)}
                      </Badge>
                    </div>
                    {goal.description ? (
                      <p className="mt-2 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                        {goal.description}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] text-[var(--color-ink-faint)]">Update status inline</p>
                      <InlineGoalStatusForm
                        action={updateGoalStatusAction}
                        goalId={goal.id}
                        returnTo="/goals"
                        defaultStatus={goal.status}
                        error={goalUpdateGoalId === goal.id ? goalUpdateError : null}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create goal */}
        <Card>
          <CardHeader>
            <CardTitle>Create goal</CardTitle>
            <CardDescription>Add a goal scoped to a project.</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-xs leading-relaxed text-amber-200">
                Create a project first before adding goals.
              </div>
            ) : (
              <CreateGoalForm projects={projects} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
