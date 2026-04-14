import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { ReviewForm } from "./review-form";

export const metadata: Metadata = {
  title: "Review | EGA House",
  description: "Weekly review reflection workflow.",
};

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function getRecentReviews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("week_reviews")
    .select("id, week_start, week_end, summary, created_at")
    .order("week_start", { ascending: false })
    .limit(6);

  if (error) {
    throw new Error(`Failed to load reviews: ${error.message}`);
  }

  return data;
}

export default async function ReviewPage() {
  const recentReviews = await getRecentReviews();

  return (
    <AppShell
      eyebrow="Review Workspace"
      title="Weekly Review"
      description="Capture written reflection and save weekly review snapshots."
      navigation={
        <>
          <Badge tone="accent">Review</Badge>
          <Badge>Reflection</Badge>
          <Badge>Supabase Live</Badge>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <CardTitle>Reflection</CardTitle>
            <CardDescription>
              Write your weekly reflection and persist it to the review log.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewForm defaultWeekOf={getTodayIsoDate()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent reviews</CardTitle>
            <CardDescription>
              Latest saved week reviews.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentReviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-7 text-slate-400">
                No reviews saved yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {review.week_start} to {review.week_end}
                    </p>
                    <p className="mt-2 line-clamp-4 text-sm leading-7 text-slate-200">
                      {review.summary?.trim() || "No summary text"}
                    </p>
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
