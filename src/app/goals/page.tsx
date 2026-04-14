import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
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

import { CreateGoalForm } from "./create-goal-form";

export const metadata: Metadata = {
  title: "Goals | EGA House",
  description: "Goals list and creation flow.",
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

export default async function GoalsPage() {
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
                    key={goal.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
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
