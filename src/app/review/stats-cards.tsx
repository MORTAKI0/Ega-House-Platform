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
    <div className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-muted)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">Tasks created</p>
        <p className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{stats.tasksCreated}</p>
      </article>

      <article className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-muted)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">Sessions logged</p>
        <p className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{stats.sessionsLogged}</p>
      </article>

      <article className="rounded-xl border border-[var(--accent-green-border)] bg-[var(--accent-green-dim)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-green)] opacity-80">Tracked time</p>
        <p className="mt-2 text-2xl font-bold text-[var(--accent-green)]" style={{ fontFamily: "var(--font-display)" }}>
          {formatDurationLabel(stats.trackedSeconds)}
        </p>
      </article>

      <article className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-muted)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">Goals touched</p>
        <p className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{stats.goalsTouched}</p>
        {stats.goalStatusCounts.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stats.goalStatusCounts.map((entry) => (
              <Badge key={entry.status}>
                {entry.count} {formatStatusToken(entry.status)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-[var(--color-ink-faint)]">No goal updates this week.</p>
        )}
      </article>
    </div>
  );
}


export type { WeeklyStats };
