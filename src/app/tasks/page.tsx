import type { Metadata } from "next";
import Link from "next/link";

import { updateTaskInlineAction } from "@/app/tasks/actions";
import { CreateTaskForm } from "@/app/tasks/create-task-form";
import { InlineTaskUpdateForm } from "@/components/tasks/inline-task-update-form";
import {
  TaskFilterControls,
  buildTaskFilterReturnPath,
} from "@/components/tasks/task-filter-controls";
import { TasksWorkspaceShell } from "@/components/tasks/tasks-workspace-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDurationLabel, getTaskTotalDurationMap } from "@/lib/task-session";
import {
  formatTaskToken,
  getTaskStatusTone,
  isTaskStatus,
} from "@/lib/task-domain";

export const metadata: Metadata = {
  title: "Tasks | EGA House",
  description: "Task list with status and goal filters plus creation flow.",
};

type TasksPageProps = {
  searchParams: Promise<{
    status?: string;
    project?: string;
    goal?: string;
    taskUpdateError?: string;
    taskUpdateTaskId?: string;
    statusUpdateError?: string;
  }>;
};

async function getTasksData(
  activeStatus: string | null,
  requestedProjectId: string | null,
  requestedGoalId: string | null,
) {
  const supabase = await createClient();

  const [projectsResult, goalsResult] = await Promise.all([
    supabase.from("projects").select("id, name").order("name", { ascending: true }),
    supabase
      .from("goals")
      .select("id, title, project_id")
      .order("created_at", { ascending: false }),
  ]);

  if (projectsResult.error) {
    throw new Error(`Failed to load projects: ${projectsResult.error.message}`);
  }

  if (goalsResult.error) {
    throw new Error(`Failed to load goals: ${goalsResult.error.message}`);
  }

  const activeProjectId =
    requestedProjectId &&
    projectsResult.data.some((project) => project.id === requestedProjectId)
      ? requestedProjectId
      : null;
  const visibleGoals = activeProjectId
    ? goalsResult.data.filter((goal) => goal.project_id === activeProjectId)
    : goalsResult.data;
  const activeGoalId =
    requestedGoalId && visibleGoals.some((goal) => goal.id === requestedGoalId)
      ? requestedGoalId
      : null;

  const tasksQuery = supabase
    .from("tasks")
    .select(
      "id, title, description, status, priority, updated_at, project_id, goal_id, projects(name), goals(title)",
    )
    .order("updated_at", { ascending: false });

  if (activeStatus) {
    tasksQuery.eq("status", activeStatus);
  }

  if (activeProjectId) {
    tasksQuery.eq("project_id", activeProjectId);
  }

  if (activeGoalId) {
    tasksQuery.eq("goal_id", activeGoalId);
  }

  const tasksResult = await tasksQuery;

  if (tasksResult.error) {
    throw new Error(`Failed to load tasks: ${tasksResult.error.message}`);
  }

  const tasks = tasksResult.data;
  const taskTotalDurations = await getTaskTotalDurationMap(
    supabase,
    tasks.map((task) => task.id),
  );

  return {
    projects: projectsResult.data,
    goals: visibleGoals,
    tasks,
    taskTotalDurations,
    activeProjectId,
    activeGoalId,
  };
}

// Map status strings to a display color dot
function getStatusDotColor(status: string): string {
  const map: Record<string, string> = {
    todo:        "bg-[var(--color-ink-faint)]",
    in_progress: "bg-[var(--accent-green)]",
    done:        "bg-[var(--accent-cyan)]",
    blocked:     "bg-[var(--color-danger)]",
  };
  return map[status] ?? "bg-white/30";
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedSearchParams = await searchParams;
  const statusParam = resolvedSearchParams.status;
  const projectParam = resolvedSearchParams.project?.trim() || null;
  const goalParam = resolvedSearchParams.goal?.trim() || null;
  const activeStatus: string | null =
    statusParam && isTaskStatus(statusParam) ? statusParam : null;
  const taskUpdateError =
    resolvedSearchParams.taskUpdateError?.slice(0, 180) ??
    resolvedSearchParams.statusUpdateError?.slice(0, 180) ??
    null;
  const taskUpdateTaskId = resolvedSearchParams.taskUpdateTaskId ?? null;
  const {
    projects,
    goals,
    tasks,
    taskTotalDurations,
    activeProjectId,
    activeGoalId,
  } = await getTasksData(activeStatus, projectParam, goalParam);
  const returnPath = buildTaskFilterReturnPath("/tasks", {
    status: activeStatus,
    project: activeProjectId,
    goal: activeGoalId,
  });

  return (
    <TasksWorkspaceShell
      eyebrow="Tasks Workspace"
      title="Tasks"
      description="Track execution with status and goal filtering, quick status updates, and direct task creation."
      actions={
        <Link
          href="/tasks/projects"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-sm font-medium text-slate-100 transition duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Projects
        </Link>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Task list */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Task list</CardTitle>
                <CardDescription>
                  Filter by status and goal, then update task state directly from the list.
                </CardDescription>
              </div>
              <span className="text-sm font-semibold text-[var(--color-ink-muted)]">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="mt-4">
              <TaskFilterControls
                basePath="/tasks"
                activeStatus={activeStatus}
                activeProjectId={activeProjectId}
                activeGoalId={activeGoalId}
                goalOptions={goals.map((goal) => ({ id: goal.id, title: goal.title }))}
              />
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-white/10 bg-white/[0.015] text-center">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-soft)]">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[var(--color-ink-muted)]">No tasks found</p>
                <p className="text-xs text-[var(--color-ink-faint)] mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const inlineError =
                    taskUpdateTaskId === task.id ? taskUpdateError : null;

                  return (
                    <article
                      id={`task-${task.id}`}
                      key={task.id}
                      className="scroll-mt-24 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-muted)] px-4 py-3.5 hover:border-[var(--border-default)] hover:bg-[var(--surface-2)] transition-all duration-150"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Status dot */}
                          <div className="mt-1 flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full ${getStatusDotColor(task.status)}`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white leading-snug truncate" style={{ fontFamily: "var(--font-display)" }}>
                              {task.title}
                            </h3>
                            <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
                              {task.projects?.name ?? "Unknown Project"}
                              {task.goals?.title ? (
                                <span className="text-[var(--color-ink-faint)]"> · {task.goals.title}</span>
                              ) : null}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                          <Badge tone={getTaskStatusTone(task.status)}>
                            {formatTaskToken(task.status)}
                          </Badge>
                          <Badge>{formatTaskToken(task.priority)}</Badge>
                        </div>
                      </div>

                      {task.description ? (
                        <p className="mt-2 ml-5 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                          {task.description}
                        </p>
                      ) : null}

                      <div className="mt-3 ml-5 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] text-[var(--color-ink-faint)]">
                          Tracked {formatDurationLabel(taskTotalDurations[task.id] ?? 0)}
                        </p>
                        <InlineTaskUpdateForm
                          action={updateTaskInlineAction}
                          taskId={task.id}
                          returnTo={returnPath}
                          defaultStatus={task.status}
                          defaultPriority={task.priority}
                          error={inlineError}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create task */}
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
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-xs leading-relaxed text-amber-200">
                  Create at least one project before creating tasks.
                </div>
                <Link
                  href="/tasks/projects/new"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-[var(--accent-green-border)] bg-[var(--accent-green)] px-4 text-sm font-semibold text-[#064e3b] transition hover:bg-[var(--accent-green-strong)]"
                >
                  Create project
                </Link>
              </div>
            ) : (
              <CreateTaskForm
                projects={projects}
                goals={goals}
                projectId={activeProjectId ?? undefined}
                returnTo={returnPath}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </TasksWorkspaceShell>
  );
}
