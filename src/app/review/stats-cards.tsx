import { Badge } from "@/components/ui/badge";
import { formatDurationLabel } from "@/lib/task-session";

type WeeklyStats = {
  tasksCreated: number;
  sessionsLogged: number;
  trackedSeconds: number;
  goalsTouched: number;
  goalStatusCounts: Array<{ status: string; count: number }>;
};

type StatsCardsProps = {
  stats: WeeklyStats;
};

function formatStatusToken(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (token) => token.toUpperCase());
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tasks created</p>
        <p className="mt-2 text-2xl font-semibold text-slate-100">{stats.tasksCreated}</p>
      </article>

      <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sessions logged</p>
        <p className="mt-2 text-2xl font-semibold text-slate-100">{stats.sessionsLogged}</p>
      </article>

      <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tracked time</p>
        <p className="mt-2 text-2xl font-semibold text-slate-100">
          {formatDurationLabel(stats.trackedSeconds)}
        </p>
      </article>

      <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Goals touched</p>
        <p className="mt-2 text-2xl font-semibold text-slate-100">{stats.goalsTouched}</p>
        {stats.goalStatusCounts.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.goalStatusCounts.map((entry) => (
              <Badge key={entry.status}>
                {entry.count} {formatStatusToken(entry.status)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No goal updates this week.</p>
        )}
      </article>
    </div>
  );
}

export type { WeeklyStats };
