import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { InlineGoalStatusForm } from "@/components/goals/inline-goal-status-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
      navigation={
        <>
          <Badge tone="accent">Goals</Badge>
          <Badge>Planning</Badge>
          <Badge>Supabase Live</Badge>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <CardTitle>Goals list</CardTitle>
            <CardDescription>
              Current goals across projects, ordered by recent updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-7 text-slate-400">
                No goals yet.
              </p>
            ) : (
              <div className="space-y-3">
                {goals.map((goal) => (
                  <article
                    id={`goal-${goal.id}`}
                    key={goal.id}
                    className="scroll-mt-24 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-medium text-slate-100">{goal.title}</h3>
                      <Badge tone={getTaskStatusTone(goal.status)}>
                        {formatTaskToken(goal.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                      {goal.projects?.name ?? "Unknown project"}
                    </p>
                    {goal.description ? (
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {goal.description}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                      <p className="pt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        Update goal status inline.
                      </p>
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

        <Card>
          <CardHeader>
            <CardTitle>Create goal</CardTitle>
            <CardDescription>
              Add a goal scoped to a project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm leading-7 text-amber-100">
                Create a project first before adding goals.
              </p>
            ) : (
              <CreateGoalForm projects={projects} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
