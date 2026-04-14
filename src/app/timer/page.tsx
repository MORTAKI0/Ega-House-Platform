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
import { formatTaskToken, getTaskStatusTone } from "@/lib/task-domain";

import {
  resolveSessionConflictAction,
  startTimerAction,
  stopTimerAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Timer | EGA House",
  description: "Start and stop focused task sessions.",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }

  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }

  return `${secs}s`;
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
    .select("id, task_id, started_at, tasks(title, status, projects(name))")
    .is("ended_at", null)
    .order("started_at", { ascending: false });

  const recentSessionsPromise = supabase
    .from("task_sessions")
    .select("id, started_at, ended_at, duration_seconds, tasks(title, projects(name))")
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

  return {
    tasks: tasksResult.data,
    openSessions: openSessionsResult.data,
    recentSessions: recentSessionsResult.data,
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
  const { tasks, openSessions, recentSessions } = await getTimerData();
  const activeSession = openSessions[0] ?? null;
  const recoveredExtraSessionCount = Math.max(0, openSessions.length - 1);
  const hasSessionConflict = recoveredExtraSessionCount > 0;

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
              <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="space-y-1">
                  <p className="text-base font-medium text-slate-100">
                    {activeSession.tasks?.title ?? "Untitled task"}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {activeSession.tasks?.projects?.name ?? "Unknown project"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={getTaskStatusTone(activeSession.tasks?.status ?? "todo")}>
                    {formatTaskToken(activeSession.tasks?.status ?? "todo")}
                  </Badge>
                  <Badge>
                    Started {formatDateTime(activeSession.started_at)}
                  </Badge>
                </div>

                <form action={stopTimerAction}>
                  <input type="hidden" name="sessionId" value={activeSession.id} />
                  <input type="hidden" name="returnTo" value="/timer" />
                  <Button
                    type="submit"
                    variant="danger"
                    disabled={hasSessionConflict}
                  >
                    Stop timer
                  </Button>
                </form>
              </div>
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
                      {session.ended_at ? formatDateTime(session.ended_at) : "-"} ·{" "}
                      {formatDuration(session.duration_seconds ?? 0)}
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
