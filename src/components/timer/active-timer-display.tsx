import Link from "next/link";

import { stopTimerAction } from "@/app/timer/actions";
import { LiveDuration } from "@/components/timer/live-duration";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTaskToken, getTaskStatusTone } from "@/lib/task-domain";
import { formatDurationLabel } from "@/lib/task-session";
import type { Tables } from "@/lib/supabase/database.types";
import { formatTimerDateTime } from "@/lib/timer-domain";

type ActiveTimerSession = Pick<Tables<"task_sessions">, "id" | "started_at" | "task_id"> & {
  tasks:
    | (Pick<
        Tables<"tasks">,
        "id" | "title" | "description" | "status" | "priority"
      > & {
        goals: Pick<Tables<"goals">, "title"> | null;
        projects: Pick<Tables<"projects">, "name" | "slug"> | null;
      })
    | null;
};

type ActiveTimerDisplayProps = {
  session: ActiveTimerSession;
  taskContextHref?: string | null;
  hasSessionConflict?: boolean;
  totalTrackedDurationSeconds?: number;
};

export function ActiveTimerDisplay({
  session,
  taskContextHref,
  hasSessionConflict = false,
  totalTrackedDurationSeconds,
}: ActiveTimerDisplayProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">Active now</Badge>
              <Badge tone={getTaskStatusTone(session.tasks?.status ?? "todo")}>
                {formatTaskToken(session.tasks?.status ?? "todo")}
              </Badge>
              <Badge>{formatTaskToken(session.tasks?.priority ?? "medium")}</Badge>
              {typeof totalTrackedDurationSeconds === "number" ? (
                <Badge>
                  Total tracked {formatDurationLabel(totalTrackedDurationSeconds)}
                </Badge>
              ) : null}
            </div>

            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-50">
                {session.tasks?.title ?? "Untitled task"}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {session.tasks?.projects?.name ?? "Unknown project"}
                {session.tasks?.goals?.title ? ` • ${session.tasks.goals.title}` : ""}
              </p>
            </div>
          </div>

          {session.tasks?.description ? (
            <p className="text-sm leading-7 text-slate-300">
              {session.tasks.description}
            </p>
          ) : (
            <p className="text-sm leading-7 text-slate-400">
              No additional task notes attached to this active session.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge>Started {formatTimerDateTime(session.started_at)}</Badge>
            {taskContextHref ? (
              <Link
                href={taskContextHref}
                className="inline-flex min-h-10 items-center rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
              >
                Open task in project workspace
              </Link>
            ) : null}
          </div>
        </div>

        <LiveDuration startedAt={session.started_at} />
      </div>

      <form action={stopTimerAction}>
        <input type="hidden" name="sessionId" value={session.id} />
        <input type="hidden" name="returnTo" value="/timer" />
        <Button type="submit" variant="danger" disabled={hasSessionConflict}>
          Stop timer
        </Button>
      </form>
    </div>
  );
}
