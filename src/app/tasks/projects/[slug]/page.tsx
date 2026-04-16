import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDurationLabel, getTaskTotalDurationMap } from "@/lib/task-session";
import {
  TASK_STATUS_VALUES,
  formatTaskToken,
  getTaskStatusTone,
  isTaskPriority,
  isTaskStatus,
} from "@/lib/task-domain";
import type { Tables } from "@/lib/supabase/database.types";

type ProjectRow = Pick<Tables<"projects">, "id" | "name" | "slug" | "description">;
type GoalRow = Pick<Tables<"goals">, "id" | "title" | "project_id">;
type TaskRow = Pick<
  Tables<"tasks">,
  "id" | "title" | "description" | "status" | "priority" | "updated_at" | "goal_id"
> & {
  goals: Pick<Tables<"goals">, "title"> | null;
};

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    status?: string;
    priority?: string;
    taskUpdateError?: string;
    taskUpdateTaskId?: string;
  }>;
};

async function getProjectDetail(slug: string) {
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .maybeSingle();

  if (projectError) {
    throw new Error(`Failed to load project: ${projectError.message}`);
  }

  if (!project) {
    return null;
  }

  const [goalsResult, tasksResult] = await Promise.all([
    supabase
      .from("goals")
      .select("id, title, project_id")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id, title, description, status, priority, updated_at, goal_id, goals(title)")
      .eq("project_id", project.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (goalsResult.error) {
    throw new Error(`Failed to load project goals: ${goalsResult.error.message}`);
  }

  if (tasksResult.error) {
    throw new Error(`Failed to load project tasks: ${tasksResult.error.message}`);
  }

  const allTasks = tasksResult.data as TaskRow[];
  const statusCounts = TASK_STATUS_VALUES.map((status) => ({
    status,
    count: allTasks.filter((task) => task.status === status).length,
  })).filter((entry) => entry.count > 0);

  const taskTotalDurations = await getTaskTotalDurationMap(
    supabase,
    allTasks.map((task) => task.id),
  );

  return {
    project: project as ProjectRow,
    goals: goalsResult.data as GoalRow[],
    tasks: allTasks,
    statusCounts,
    taskTotalDurations,
  };
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const projectDetail = await getProjectDetail(slug);

  if (!projectDetail) {
    return {
      title: "Project Not Found | Tasks | EGA House",
    };
  }

  return {
    title: `${projectDetail.project.name} | Projects | Tasks | EGA House`,
    description:
      projectDetail.project.description?.trim() ||
      `Task workspace for ${projectDetail.project.name}.`,
  };
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const projectDetail = await getProjectDetail(slug);

  if (!projectDetail) {
    notFound();
  }

  const activeStatus =
    resolvedSearchParams.status && isTaskStatus(resolvedSearchParams.status)
      ? resolvedSearchParams.status
      : null;
  const activePriority =
    resolvedSearchParams.priority && isTaskPriority(resolvedSearchParams.priority)
      ? resolvedSearchParams.priority
      : null;
  const taskUpdateError = resolvedSearchParams.taskUpdateError?.slice(0, 180) ?? null;
  const taskUpdateTaskId = resolvedSearchParams.taskUpdateTaskId ?? null;

  const { project, goals, tasks, statusCounts, taskTotalDurations } = projectDetail;
  const returnTo = buildTaskFilterReturnPath(`/tasks/projects/${project.slug}`, {
    status: activeStatus,
    priority: activePriority,
  });
  const filteredTasks = tasks.filter((task) => {
    if (activeStatus && task.status !== activeStatus) {
      return false;
    }

    if (activePriority && task.priority !== activePriority) {
      return false;
    }

    return true;
  });

  return (
    <TasksWorkspaceShell
      eyebrow="Tasks Workspace"
      title={project.name}
      description={
        project.description?.trim() ||
        "Project-scoped task view with direct task creation in the same workspace."
      }
      actions={
        <Link
          href="/tasks/projects"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 text-sm font-medium text-slate-100 transition duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/10"
        >
          Back to projects
        </Link>
      }
      navigation={
        <>
          <Badge tone="accent">{project.slug}</Badge>
          <Badge>{tasks.length} tasks</Badge>
          <Badge>{goals.length} goals</Badge>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <CardTitle>Project tasks</CardTitle>
                <CardDescription>
                  Everything here is already scoped to {project.name}.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusCounts.length ? (
                  statusCounts.map((entry) => (
                    <Badge key={entry.status} tone={getTaskStatusTone(entry.status)}>
                      {entry.count} {formatTaskToken(entry.status)}
                    </Badge>
                  ))
                ) : (
                  <Badge>No task activity yet</Badge>
                )}
              </div>
            </div>

            <TaskFilterControls
              basePath={`/tasks/projects/${project.slug}`}
              activeStatus={activeStatus}
              activePriority={activePriority}
              includePriority
            />
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-7 text-slate-400">
                No tasks match the current project filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const inlineError = taskUpdateTaskId === task.id ? taskUpdateError : null;

                  return (
                    <article
                      id={`task-${task.id}`}
                      key={task.id}
                      className="scroll-mt-24 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="text-base font-medium text-slate-100">{task.title}</h3>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            {task.goals?.title ? task.goals.title : "No goal linked"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={getTaskStatusTone(task.status)}>
                            {formatTaskToken(task.status)}
                          </Badge>
                          <Badge>{formatTaskToken(task.priority)}</Badge>
                        </div>
                      </div>

                      {task.description ? (
                        <p className="mt-2 text-sm leading-7 text-slate-300">{task.description}</p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1 pt-2">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Update status or priority without leaving this project view.
                          </p>
                          <p className="text-xs text-slate-400">
                            Total tracked {formatDurationLabel(taskTotalDurations[task.id] ?? 0)}
                          </p>
                        </div>
                        <InlineTaskUpdateForm
                          action={updateTaskInlineAction}
                          taskId={task.id}
                          returnTo={returnTo}
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

        <Card>
          <CardHeader>
            <CardTitle>Create task</CardTitle>
            <CardDescription>
              New tasks from this form stay attached to {project.name} automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTaskForm
              projects={[{ id: project.id, name: project.name }]}
              goals={goals}
              projectId={project.id}
              returnTo={returnTo}
            />
          </CardContent>
        </Card>
      </div>
    </TasksWorkspaceShell>
  );
}
