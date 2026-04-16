import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type TaskSessionDurationRow = Pick<
  Tables<"task_sessions">,
  "task_id" | "started_at" | "ended_at" | "duration_seconds"
>;

function getDurationFromDates(startedAt: string, endedAt: string) {
  return Math.max(
    0,
    Math.floor(
      (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000,
    ),
  );
}

export function getTaskSessionDurationSeconds(
  session: TaskSessionDurationRow,
  nowIso = new Date().toISOString(),
) {
  if (typeof session.duration_seconds === "number") {
    return Math.max(0, session.duration_seconds);
  }

  const endTime = session.ended_at ?? nowIso;
  return getDurationFromDates(session.started_at, endTime);
}

export async function getTaskTotalDurationMap(
  supabase: SupabaseServerClient,
  taskIds: string[],
  nowIso = new Date().toISOString(),
) {
  const uniqueTaskIds = Array.from(new Set(taskIds.filter(Boolean)));

  if (uniqueTaskIds.length === 0) {
    return {} as Record<string, number>;
  }

  const { data, error } = await supabase
    .from("task_sessions")
    .select("task_id, started_at, ended_at, duration_seconds")
    .in("task_id", uniqueTaskIds);

  if (error) {
    throw new Error(`Failed to load task session totals: ${error.message}`);
  }

  return (data ?? []).reduce<Record<string, number>>((totals, session) => {
    const sessionDuration = getTaskSessionDurationSeconds(session, nowIso);
    totals[session.task_id] = (totals[session.task_id] ?? 0) + sessionDuration;
    return totals;
  }, {});
}

export function formatDurationLabel(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }

  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }

  return `${secs}s`;
}
