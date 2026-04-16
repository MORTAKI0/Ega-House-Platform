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
import {
  formatDurationLabel,
  getCurrentDayWindow,
  getSessionDurationWithinWindowSeconds,
  getTaskSessionDurationSeconds,
  getTaskTotalDurationMap,
} from "@/lib/task-session";
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
  const now = new Date();
  const nowIso = now.toISOString();
  const todayWindow = getCurrentDayWindow(now);
  const nextDayStartIso = new Date(
    new Date(todayWindow.startIso).getTime() + 24 * 60 * 60 * 1000,
  ).toISOString();

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

  const completedSessionsPromise = supabase
    .from("task_sessions")
    .select(
      "id, task_id, started_at, ended_at, duration_seconds, tasks(id, title, projects(name))",
    )
    .not("ended_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(80);

  const todaySessionsPromise = supabase
    .from("task_sessions")
    .select("id, task_id, started_at, ended_at, duration_seconds, tasks(id, title)")
    .lt("started_at", nextDayStartIso)
    .or(`ended_at.gte.${todayWindow.startIso},ended_at.is.null`)
    .order("started_at", { ascending: false });

  const [tasksResult, openSessionsResult, completedSessionsResult, todaySessionsResult] =
    await Promise.all([
      tasksPromise,
      openSessionsPromise,
      completedSessionsPromise,
      todaySessionsPromise,
    ]);

  if (tasksResult.error) {
    throw new Error(`Failed to load tasks: ${tasksResult.error.message}`);
  }

  if (openSessionsResult.error) {
    throw new Error(`Failed to load open sessions: ${openSessionsResult.error.message}`);
  }

  if (completedSessionsResult.error) {
    throw new Error(
      `Failed to load completed sessions: ${completedSessionsResult.error.message}`,
    );
  }

  if (todaySessionsResult.error) {
    throw new Error(`Failed to load today's sessions: ${todaySessionsResult.error.message}`);
  }

  const taskIds = [
    ...tasksResult.data.map((task) => task.id),
    ...openSessionsResult.data.map((session) => session.task_id),
    ...completedSessionsResult.data
      .map((session) => session.tasks?.id)
      .filter((taskId): taskId is string => Boolean(taskId)),
    ...todaySessionsResult.data.map((session) => session.task_id),
  ];
  const taskTotalDurations = await getTaskTotalDurationMap(supabase, taskIds, nowIso);

  const todayTaskDurationMap = todaySessionsResult.data.reduce<
    Record<string, { taskTitle: string; durationSeconds: number }>
  >((totals, session) => {
    const durationSeconds = getSessionDurationWithinWindowSeconds(
      session,
      todayWindow,
      nowIso,
    );

    if (durationSeconds <= 0) {
      return totals;
    }

    const existing = totals[session.task_id];
    totals[session.task_id] = {
      taskTitle: existing?.taskTitle ?? session.tasks?.title ?? "Untitled task",
      durationSeconds: (existing?.durationSeconds ?? 0) + durationSeconds,
    };
    return totals;
  }, {});

  const todayTaskBreakdown = Object.entries(todayTaskDurationMap)
    .map(([taskId, details]) => ({
      taskId,
      taskTitle: details.taskTitle,
      durationSeconds: details.durationSeconds,
    }))
    .sort((left, right) => right.durationSeconds - left.durationSeconds);
  const todayTotalDurationSeconds = todayTaskBreakdown.reduce(
    (sum, row) => sum + row.durationSeconds,
    0,
  );

  const historyByTask = completedSessionsResult.data.reduce<
    Record<
      string,
      {
        taskId: string;
        taskTitle: string;
        projectName: string;
        sessions: Array<{
          id: string;
          startedAt: string;
          endedAt: string | null;
          durationSeconds: number;
        }>;
      }
    >
  >((groups, session) => {
    const existing = groups[session.task_id];
    const bucket =
      existing ??
      {
        taskId: session.task_id,
        taskTitle: session.tasks?.title ?? "Untitled task",
        projectName: session.tasks?.projects?.name ?? "Unknown project",
        sessions: [],
      };
    bucket.sessions.push({
      id: session.id,
      startedAt: session.started_at,
      endedAt: session.ended_at,
      durationSeconds: getTaskSessionDurationSeconds(session, nowIso),
    });
    groups[session.task_id] = bucket;
    return groups;
  }, {});
  const sessionHistoryByTask = Object.values(historyByTask).sort((left, right) => {
    const leftStartedAt = left.sessions[0]?.startedAt ?? "";
    const rightStartedAt = right.sessions[0]?.startedAt ?? "";
    return new Date(rightStartedAt).getTime() - new Date(leftStartedAt).getTime();
  });

  return {
    tasks: tasksResult.data,
    openSessions: openSessionsResult.data,
    todayTaskBreakdown,
    todayTotalDurationSeconds,
    sessionHistoryByTask,
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
  const {
    tasks,
    openSessions,
    todayTaskBreakdown,
    todayTotalDurationSeconds,
    sessionHistoryByTask,
    taskTotalDurations,
  } = await getTimerData();
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
            <CardTitle>Today summary</CardTitle>
            <CardDescription>
              Logged focus time for the current day, including open sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">
                Today total
              </p>
              <p className="mt-2 text-2xl font-semibold text-cyan-50">
                {formatDurationLabel(todayTotalDurationSeconds)}
              </p>
            </div>

            {todayTaskBreakdown.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-7 text-slate-400">
                No focus sessions logged today.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {todayTaskBreakdown.map((row) => (
                  <div
                    key={row.taskId}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <p className="text-sm font-medium text-slate-100">
                      {row.taskTitle}
                    </p>
                    <p className="mt-2 text-xs text-slate-300">
                      {formatDurationLabel(row.durationSeconds)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Session history by task</CardTitle>
          <CardDescription>
            Prior completed work sessions grouped by task.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionHistoryByTask.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-7 text-slate-400">
              No completed sessions yet.
            </p>
          ) : (
            <div className="space-y-4">
              {sessionHistoryByTask.map((taskHistory) => (
                <section
                  key={taskHistory.taskId}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <p className="text-sm font-medium text-slate-100">
                    {taskHistory.taskTitle}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {taskHistory.projectName}
                  </p>
                  <div className="mt-3 space-y-2">
                    {taskHistory.sessions.slice(0, 6).map((session) => (
                      <div
                        key={session.id}
                        className="rounded-xl border border-white/8 bg-slate-950/30 px-3 py-2 text-xs text-slate-300"
                      >
                        <p>Started {formatTimerDateTime(session.startedAt)}</p>
                        <p>
                          Ended{" "}
                          {session.endedAt ? formatTimerDateTime(session.endedAt) : "-"}
                        </p>
                        <p>Duration {formatDurationLabel(session.durationSeconds)}</p>
                      </div>
                    ))}
                  </div>
                  {taskHistory.sessions.length > 6 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Showing latest 6 of {taskHistory.sessions.length} sessions.
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-400">
                    Total tracked{" "}
                    {formatDurationLabel(taskTotalDurations[taskHistory.taskId] ?? 0)}
                  </p>
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
