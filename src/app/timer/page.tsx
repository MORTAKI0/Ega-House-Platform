import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { ActiveTimerDisplay } from "@/components/timer/active-timer-display";
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
import { formatDurationLabel, getTaskTotalDurationMap } from "@/lib/task-session";
import { formatTimerDateTime } from "@/lib/timer-domain";

import { resolveSessionConflictAction, startTimerAction } from "./actions";

export const metadata: Metadata = {
  title: "Timer | EGA House",
  description: "Start and stop focused task sessions.",
};

function getTaskContextHref(taskId: string | null | undefined, projectSlug: string | null | undefined) {
  if (!taskId || !projectSlug) {
    return null;
  }

  return `/tasks/projects/${projectSlug}#task-${taskId}`;
}

async function getTimerData() {
  const supabase = await createClient();

  const tasksPromise = supabase
    .from("tasks")
    .select("id, title, status, projects(name)")
    .order("updated_at", { ascending: false })
    .limit(100);

  const openSessionsPromise = supabase
    .from("task_sessions")
    .select(
      "id, task_id, started_at, tasks(id, title, description, status, priority, goals(title), projects(name, slug))",
    )
    .is("ended_at", null)
    .order("started_at", { ascending: false });

  const recentSessionsPromise = supabase
    .from("task_sessions")
    .select("id, started_at, ended_at, duration_seconds, tasks(id, title, projects(name))")
    .not("ended_at", "is", null)
    .order("ended_at", { ascending: false })
    .limit(6);

  const [tasksResult, openSessionsResult, recentSessionsResult] = await Promise.all([
    tasksPromise,
    openSessionsPromise,
    recentSessionsPromise,
  ]);

  if (tasksResult.error) {
    throw new Error(`Failed to load tasks: ${tasksResult.error.message}`);
  }

  if (openSessionsResult.error) {
    throw new Error(`Failed to load open sessions: ${openSessionsResult.error.message}`);
  }

  if (recentSessionsResult.error) {
    throw new Error(
      `Failed to load recent sessions: ${recentSessionsResult.error.message}`,
    );
  }

  const taskIds = [
    ...tasksResult.data.map((task) => task.id),
    ...openSessionsResult.data.map((session) => session.task_id),
    ...recentSessionsResult.data
      .map((session) => session.tasks?.id)
      .filter((taskId): taskId is string => Boolean(taskId)),
  ];
  const taskTotalDurations = await getTaskTotalDurationMap(supabase, taskIds);

  return {
    tasks: tasksResult.data,
    openSessions: openSessionsResult.data,
    recentSessions: recentSessionsResult.data,
    taskTotalDurations,
  };
}

type TimerPageProps = {
  searchParams: Promise<{
    actionError?: string;
  }>;
};

function getActionErrorMessage(value: string | undefined) {
  if (!value) {
    return null;
  }

  return value.slice(0, 180);
}

export default async function TimerPage({ searchParams }: TimerPageProps) {
  const resolvedSearchParams = await searchParams;
  const actionError = getActionErrorMessage(resolvedSearchParams.actionError);
  const { tasks, openSessions, recentSessions, taskTotalDurations } = await getTimerData();
  const activeSession = openSessions[0] ?? null;
  const recoveredExtraSessionCount = Math.max(0, openSessions.length - 1);
  const hasSessionConflict = recoveredExtraSessionCount > 0;
  const activeTaskContextHref = getTaskContextHref(
    activeSession?.task_id,
    activeSession?.tasks?.projects?.slug,
  );

  return (
    <AppShell
      eyebrow="Timer Workspace"
      title="Focus Timer"
      description="Run single-task focus sessions and preserve recovery state if a session is already open on page load."
      navigation={
        <>
          <Badge tone="accent">Timer</Badge>
          <Badge>Single Active Session</Badge>
          <Badge>Recovery Enabled</Badge>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <CardTitle>Current session</CardTitle>
            <CardDescription>
              {activeSession
                ? "Recovered active session state from the database."
                : "No open session is currently running."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionError ? (
              <p className="rounded-2xl border border-rose-400/35 bg-rose-400/10 px-4 py-3 text-sm leading-7 text-rose-100">
                {actionError}
              </p>
            ) : null}

            {recoveredExtraSessionCount > 0 ? (
              <div className="space-y-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-4 text-sm leading-7 text-amber-100">
                <p>
                  Detected {recoveredExtraSessionCount} extra open session
                  {recoveredExtraSessionCount > 1 ? "s" : ""}. Timer controls are
                  temporarily locked to prevent unpredictable starts/stops.
                </p>
                <form action={resolveSessionConflictAction}>
                  <input type="hidden" name="returnTo" value="/timer" />
                  <Button type="submit" variant="secondary">
                    Resolve session conflict
                  </Button>
                </form>
              </div>
            ) : null}

            {activeSession ? (
              <ActiveTimerDisplay
                session={activeSession}
                taskContextHref={activeTaskContextHref}
                hasSessionConflict={hasSessionConflict}
                totalTrackedDurationSeconds={
                  taskTotalDurations[activeSession.task_id] ?? 0
                }
              />
            ) : (
              <form action={startTimerAction} className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-200">Task</span>
                  <select
                    name="taskId"
                    required
                    disabled={tasks.length === 0}
                    className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50 focus-visible:ring-4 focus-visible:ring-cyan-300/15"
                  >
                    {tasks.length === 0 ? (
                      <option value="">No tasks available</option>
                    ) : (
                      tasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title} · {task.projects?.name ?? "Unknown"}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <input type="hidden" name="returnTo" value="/timer" />
                <Button
                  type="submit"
                  disabled={tasks.length === 0 || hasSessionConflict}
                >
                  Start timer
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent sessions</CardTitle>
            <CardDescription>
              Last completed focus sessions with tracked durations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-7 text-slate-400">
                No completed sessions yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <p className="text-sm font-medium text-slate-100">
                      {session.tasks?.title ?? "Untitled task"}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {session.tasks?.projects?.name ?? "Unknown project"}
                    </p>
                    <p className="mt-2 text-xs text-slate-300">
                      {session.ended_at ? formatTimerDateTime(session.ended_at) : "-"} ·{" "}
                      {formatDurationLabel(session.duration_seconds ?? 0)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Total tracked {formatDurationLabel(taskTotalDurations[session.tasks?.id ?? ""] ?? 0)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
