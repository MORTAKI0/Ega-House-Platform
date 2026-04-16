import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIsoDate } from "@/lib/review-week";

type WeekSelectorProps = {
  selectedWeekOf: string;
  weekStart: string;
  weekEnd: string;
  previousWeekOf: string;
  nextWeekOf: string;
  existingReviewCount: number;
};

export function WeekSelector({
  selectedWeekOf,
  weekStart,
  weekEnd,
  previousWeekOf,
  nextWeekOf,
  existingReviewCount,
}: WeekSelectorProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <form action="/review" method="get" className="space-y-3">
        <label htmlFor="review-week-selector" className="text-sm font-medium text-slate-200">
          Selected week
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            id="review-week-selector"
            name="weekOf"
            type="date"
            defaultValue={selectedWeekOf}
            required
            className="max-w-xs"
          />
          <Button type="submit" variant="secondary">
            View week
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          {formatIsoDate(weekStart)} to {formatIsoDate(weekEnd)}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={`/review?weekOf=${previousWeekOf}`}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 bg-white/8 px-4 text-sm font-medium text-slate-100 transition duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/10"
          >
            Previous
          </Link>
          <Link
            href={`/review?weekOf=${nextWeekOf}`}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 bg-white/8 px-4 text-sm font-medium text-slate-100 transition duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/10"
          >
            Next
          </Link>
        </div>
      </div>

      <p className="text-sm leading-7 text-slate-300">
        {existingReviewCount > 0
          ? `${existingReviewCount} saved ${existingReviewCount === 1 ? "review" : "reviews"} for this week.`
          : "No saved review yet for this week."}
      </p>
    </div>
  );
}
