import type { Metadata } from "next";
import Link from "next/link";

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
import {
  TASK_STATUS_VALUES,
  formatTaskToken,
  getTaskStatusTone,
  isTaskStatus,
} from "@/lib/task-domain";

import { updateTaskStatusAction } from "./actions";
import { CreateTaskForm } from "./create-task-form";

export const metadata: Metadata = {
  title: "Tasks | EGA House",
  description: "Task list with status filter and creation flow.",
};

type TasksPageProps = {
  searchParams: Promise<{
    status?: string;
    statusUpdateError?: string;
  }>;
};

async function getTasksData(activeStatus: string | null) {
  const supabase = await createClient();

  const projectsQuery = supabase
    .from("projects")
    .select("id, name")
    .order("name", { ascending: true });

  const goalsQuery = supabase
    .from("goals")
    .select("id, title, project_id")
    .order("created_at", { ascending: false });

  const tasksQuery = supabase
    .from("tasks")
    .select(
      "id, title, description, status, priority, updated_at, project_id, goal_id, projects(name), goals(title)",
    )
    .order("updated_at", { ascending: false });

  if (activeStatus) {
    tasksQuery.eq("status", activeStatus);
  }

  const [projectsResult, goalsResult, tasksResult] = await Promise.all([
    projectsQuery,
    goalsQuery,
    tasksQuery,
  ]);

  if (projectsResult.error) {
    throw new Error(`Failed to load projects: ${projectsResult.error.message}`);
  }

  if (goalsResult.error) {
    throw new Error(`Failed to load goals: ${goalsResult.error.message}`);
  }

  if (tasksResult.error) {
    throw new Error(`Failed to load tasks: ${tasksResult.error.message}`);
  }

  return {
    projects: projectsResult.data,
    goals: goalsResult.data,
    tasks: tasksResult.data,
  };
}

function StatusFilter({ activeStatus }: { activeStatus: string | null }) {
  const options = [
    { value: null, label: "All" },
    ...TASK_STATUS_VALUES.map((status) => ({
      value: status,
      label: formatTaskToken(status),
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.value === activeStatus;
        const href = option.value ? `/tasks?status=${option.value}` : "/tasks";

        return (
          <Link
            key={option.label}
            href={href}
            className={
              isActive
                ? "inline-flex min-h-10 items-center rounded-full border border-cyan-300/35 bg-cyan-300/15 px-4 text-xs font-medium uppercase tracking-[0.2em] text-cyan-100"
                : "inline-flex min-h-10 items-center rounded-full border border-white/12 bg-white/5 px-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-100"
            }
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedSearchParams = await searchParams;
  const statusParam = resolvedSearchParams.status;
  const activeStatus: string | null =
    statusParam && isTaskStatus(statusParam) ? statusParam : null;
  const statusUpdateError = resolvedSearchParams.statusUpdateError?.slice(0, 180) ?? null;
  const returnPath = activeStatus ? `/tasks?status=${activeStatus}` : "/tasks";

  const { projects, goals, tasks } = await getTasksData(activeStatus);

  return (
    <AppShell
      eyebrow="Tasks Workspace"
      title="Tasks"
      description="Track execution with status-based filtering, quick status updates, and direct task creation."
      actions={
        <Link
          href="/tasks/projects"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 text-sm font-medium text-slate-100 transition duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/10"
        >
          Projects
        </Link>
      }
      navigation={
        <>
          <Badge tone="accent">Tasks</Badge>
          <Badge>Filter + Mutations</Badge>
          <Badge>Supabase Live</Badge>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card>
          <CardHeader className="space-y-4">
            <CardTitle>Task list</CardTitle>
            <CardDescription>
              Filter by status and update task state directly from the list.
            </CardDescription>
            <StatusFilter activeStatus={activeStatus} />
          </CardHeader>
          <CardContent>
            {statusUpdateError ? (
              <p className="mb-4 rounded-2xl border border-rose-400/35 bg-rose-400/10 px-4 py-3 text-sm leading-7 text-rose-100">
                {statusUpdateError}
              </p>
            ) : null}

            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-7 text-slate-400">
                No tasks found for this filter.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-base font-medium text-slate-100">
                          {task.title}
                        </h3>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {task.projects?.name ?? "Unknown Project"}
                          {task.goals?.title ? ` • ${task.goals.title}` : ""}
                        </p>
                      </div>
                      <Badge tone={getTaskStatusTone(task.status)}>
                        {formatTaskToken(task.status)}
                      </Badge>
                    </div>

                    {task.description ? (
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {task.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Priority: {formatTaskToken(task.priority)}
                      </p>
                      <form action={updateTaskStatusAction} className="flex gap-2">
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="returnTo" value={returnPath} />
                        <select
                          name="status"
                          defaultValue={task.status}
                          className="min-h-10 rounded-xl border border-white/12 bg-slate-950/70 px-3 text-xs uppercase tracking-[0.14em] text-slate-200 outline-none transition focus:border-cyan-300/50"
                        >
                          {TASK_STATUS_VALUES.map((statusValue) => (
                            <option key={statusValue} value={statusValue}>
                              {formatTaskToken(statusValue)}
                            </option>
                          ))}
                        </select>
                        <Button size="sm" type="submit" variant="secondary">
                          Update
                        </Button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create task</CardTitle>
            <CardDescription>
              Add a task with project/goal context and initial execution state.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="space-y-4">
                <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm leading-7 text-amber-100">
                  Create at least one project before creating tasks.
                </p>
                <Link
                  href="/tasks/projects/new"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/90 px-5 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
                >
                  Create project
                </Link>
              </div>
            ) : (
              <CreateTaskForm projects={projects} goals={goals} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
