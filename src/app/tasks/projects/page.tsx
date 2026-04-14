import type { Metadata } from "next";

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
import type { Tables } from "@/lib/supabase/database.types";

type ProjectRow = Pick<
  Tables<"projects">,
  "id" | "name" | "slug" | "description" | "created_at" | "updated_at"
>;

type TaskRow = Pick<
  Tables<"tasks">,
  "id" | "project_id" | "title" | "status" | "priority" | "updated_at"
>;

type ProjectCardData = ProjectRow & {
  taskCount: number;
  statusCounts: Array<{ status: string; count: number }>;
  recentTasks: TaskRow[];
};

export const metadata: Metadata = {
  title: "Projects | Tasks | EGA House",
  description: "Projects list with task context for the tasks workspace.",
};

function formatStatusLabel(status: string) {
  return status
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

function formatPriorityLabel(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function getStatusTone(status: string) {
  const normalized = status.toLowerCase();

  if (["done", "complete", "completed"].includes(normalized)) {
    return "success" as const;
  }

  if (["blocked", "cancelled", "canceled"].includes(normalized)) {
    return "danger" as const;
  }

  if (["in progress", "in_progress", "active"].includes(normalized)) {
    return "accent" as const;
  }

  return "neutral" as const;
}

async function getProjectsWithTaskContext() {
  const supabase = await createClient();

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, slug, description, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (projectsError) {
    throw new Error(`Failed to load projects: ${projectsError.message}`);
  }

  if (!projects.length) {
    return [];
  }

  const projectIds = projects.map((project) => project.id);
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, project_id, title, status, priority, updated_at")
    .in("project_id", projectIds)
    .order("updated_at", { ascending: false });

  if (tasksError) {
    throw new Error(`Failed to load task context: ${tasksError.message}`);
  }

  const tasksByProject = new Map<string, TaskRow[]>();

  for (const task of tasks) {
    const projectTasks = tasksByProject.get(task.project_id) ?? [];
    projectTasks.push(task);
    tasksByProject.set(task.project_id, projectTasks);
  }

  return projects.map((project) => {
    const projectTasks = tasksByProject.get(project.id) ?? [];
    const statusCountMap = new Map<string, number>();

    for (const task of projectTasks) {
      statusCountMap.set(task.status, (statusCountMap.get(task.status) ?? 0) + 1);
    }

    const statusCounts = Array.from(statusCountMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((left, right) => right.count - left.count || left.status.localeCompare(right.status))
      .slice(0, 3);

    return {
      ...project,
      taskCount: projectTasks.length,
      statusCounts,
      recentTasks: projectTasks.slice(0, 3),
    } satisfies ProjectCardData;
  });
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <Badge tone="accent" className="w-fit">
          Projects
        </Badge>
        <CardTitle>No projects yet</CardTitle>
        <CardDescription>
          The tasks workspace is wired to the real database, but there are no
          project rows to show yet. Once projects and tasks exist, this view
          will summarize task volume and recent execution context for each one.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" disabled>
          Project creation comes next
        </Button>
        <p className="text-sm leading-7 text-slate-400">
          This MVP intentionally stops at the read-only list view.
        </p>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle>{project.name}</CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
              {project.slug}
            </CardDescription>
          </div>
          <Badge tone={project.taskCount > 0 ? "accent" : "neutral"}>
            {project.taskCount} {project.taskCount === 1 ? "Task" : "Tasks"}
          </Badge>
        </div>
        <CardDescription>
          {project.description?.trim() || "No project description added yet."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {project.statusCounts.length ? (
            project.statusCounts.map((entry) => (
              <Badge key={entry.status} tone={getStatusTone(entry.status)}>
                {entry.count} {formatStatusLabel(entry.status)}
              </Badge>
            ))
          ) : (
            <Badge>No task activity yet</Badge>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-200">Recent tasks</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Updated in project
            </p>
          </div>

          {project.recentTasks.length ? (
            <div className="space-y-3">
              {project.recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-6 text-slate-100">
                      {task.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={getStatusTone(task.status)}>
                        {formatStatusLabel(task.status)}
                      </Badge>
                      <Badge>{formatPriorityLabel(task.priority)}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-7 text-slate-400">
              No tasks are attached to this project yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TasksProjectsPage() {
  const projects = await getProjectsWithTaskContext();

  return (
    <AppShell
      eyebrow="Tasks Workspace"
      title="Projects"
      description="Projects grounded in the live tasks schema, with enough context to see task volume and current execution without building detail pages yet."
      navigation={
        <>
          <Badge tone="accent">Projects</Badge>
          <Badge>Tasks MVP</Badge>
          <Badge>Read Only</Badge>
        </>
      }
    >
      {projects.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </AppShell>
  );
}
