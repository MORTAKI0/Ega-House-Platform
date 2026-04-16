import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatDateTime,
  formatIsoDate,
  getTodayIsoDate,
  getWeekBounds,
  getWeekWindow,
  isIsoDate,
  shiftIsoDateByDays,
} from "@/lib/review-week";
import { createClient } from "@/lib/supabase/server";
import { getTaskSessionDurationSeconds } from "@/lib/task-session";

import { ReviewForm } from "./review-form";
import { StatsCards, type WeeklyStats } from "./stats-cards";
import { WeekSelector } from "./week-selector";

export const metadata: Metadata = {
  title: "Review | EGA House",
  description: "Weekly review reflection workflow.",
};

const PAST_REVIEW_LIMIT = 100;

type ReviewPageProps = {
  searchParams: Promise<{
    weekOf?: string;
  }>;
};

function toSummaryPreview(summary: string | null, maxLength = 220) {
  const normalized = summary?.trim() ?? "";

  if (!normalized) {
    return "No summary text.";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

async function getPastReviews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("week_reviews")
    .select("id, week_start, week_end, summary, created_at, updated_at")
    .order("week_start", { ascending: false })
    .limit(PAST_REVIEW_LIMIT);

  if (error) {
    throw new Error(`Failed to load reviews: ${error.message}`);
  }

  return data;
}

async function getSelectedWeekReviews(weekStart: string, weekEnd: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("week_reviews")
    .select("id, summary, created_at, updated_at")
    .eq("week_start", weekStart)
    .eq("week_end", weekEnd)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load selected week reviews: ${error.message}`);
  }

  return data;
}

async function getWeeklyStats(weekStart: string, weekEnd: string): Promise<WeeklyStats> {
  const { startIso, endExclusiveIso } = getWeekWindow(weekStart, weekEnd);
  const nowIso = new Date().toISOString();
  const sessionNowIso = nowIso < endExclusiveIso ? nowIso : endExclusiveIso;

  const supabase = await createClient();
  const [tasksResult, sessionsResult, goalsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startIso)
      .lt("created_at", endExclusiveIso),
    supabase
      .from("task_sessions")
      .select("id, task_id, started_at, ended_at, duration_seconds")
      .gte("started_at", startIso)
      .lt("started_at", endExclusiveIso),
    supabase
      .from("goals")
      .select("id, status")
      .gte("updated_at", startIso)
      .lt("updated_at", endExclusiveIso),
  ]);

  if (tasksResult.error) {
    throw new Error(`Failed to load weekly task stats: ${tasksResult.error.message}`);
  }

  if (sessionsResult.error) {
    throw new Error(`Failed to load weekly session stats: ${sessionsResult.error.message}`);
  }

  if (goalsResult.error) {
    throw new Error(`Failed to load weekly goal stats: ${goalsResult.error.message}`);
  }

  const trackedSeconds = (sessionsResult.data ?? []).reduce((total, session) => {
    return total + getTaskSessionDurationSeconds(session, sessionNowIso);
  }, 0);

  const goalStatusCounts = Array.from(
    (goalsResult.data ?? []).reduce<Map<string, number>>((counts, goal) => {
      counts.set(goal.status, (counts.get(goal.status) ?? 0) + 1);
      return counts;
    }, new Map()),
  )
    .map(([status, count]) => ({ status, count }))
    .sort((left, right) => right.count - left.count || left.status.localeCompare(right.status))
    .slice(0, 3);

  return {
    tasksCreated: tasksResult.count ?? 0,
    sessionsLogged: sessionsResult.data?.length ?? 0,
    trackedSeconds,
    goalsTouched: goalsResult.data?.length ?? 0,
    goalStatusCounts,
  };
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedWeekOf =
    resolvedSearchParams.weekOf && isIsoDate(resolvedSearchParams.weekOf)
      ? resolvedSearchParams.weekOf
      : getTodayIsoDate();
  const bounds = getWeekBounds(selectedWeekOf);

  if (!bounds) {
    throw new Error("Failed to resolve selected week.");
  }

  const [pastReviews, selectedWeekReviews, weeklyStats] = await Promise.all([
    getPastReviews(),
    getSelectedWeekReviews(bounds.weekStart, bounds.weekEnd),
    getWeeklyStats(bounds.weekStart, bounds.weekEnd),
  ]);

  return (
    <AppShell
      eyebrow="Review Workspace"
      title="Weekly Review"
      description="Capture written reflection, inspect weekly stats, and review prior snapshots."
      navigation={
        <>
          <Badge tone="accent">Review</Badge>
          <Badge>Weekly Metrics</Badge>
          <Badge>Supabase Live</Badge>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reflection</CardTitle>
              <CardDescription>
                Select a week, review existing context, and save a weekly reflection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <WeekSelector
                selectedWeekOf={selectedWeekOf}
                weekStart={bounds.weekStart}
                weekEnd={bounds.weekEnd}
                previousWeekOf={shiftIsoDateByDays(selectedWeekOf, -7)}
                nextWeekOf={shiftIsoDateByDays(selectedWeekOf, 7)}
                existingReviewCount={selectedWeekReviews.length}
              />

              {selectedWeekReviews.length > 0 ? (
                <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Saved in this week
                  </p>
                  <div className="space-y-3">
                    {selectedWeekReviews.slice(0, 2).map((review) => (
                      <article key={review.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                        <p className="text-sm leading-7 text-slate-200">
                          {toSummaryPreview(review.summary, 160)}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                          <span>
                            Saved {formatDateTime(review.updated_at ?? review.created_at)}
                          </span>
                          <Link
                            href={`/review/${review.id}`}
                            className="font-medium text-cyan-100 transition hover:text-cyan-200"
                          >
                            Open
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              <ReviewForm defaultWeekOf={selectedWeekOf} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly stats</CardTitle>
              <CardDescription>
                Computed from tasks, sessions, and goals for {formatIsoDate(bounds.weekStart)} to{" "}
                {formatIsoDate(bounds.weekEnd)}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatsCards stats={weeklyStats} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Past reviews</CardTitle>
            <CardDescription>Browse previously saved weekly reflections.</CardDescription>
          </CardHeader>
          <CardContent>
            {pastReviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-7 text-slate-400">
                No reviews saved yet.
              </p>
            ) : (
              <div className="max-h-[54rem] space-y-3 overflow-y-auto pr-1">
                {pastReviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {formatIsoDate(review.week_start)} to {formatIsoDate(review.week_end)}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-200">
                      {toSummaryPreview(review.summary)}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                      <span>Saved {formatDateTime(review.updated_at ?? review.created_at)}</span>
                      <Link
                        href={`/review/${review.id}`}
                        className="font-medium text-cyan-100 transition hover:text-cyan-200"
                      >
                        View detail
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
