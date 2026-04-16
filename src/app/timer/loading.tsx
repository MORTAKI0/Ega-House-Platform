import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function TimerSummaryRowSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <Skeleton className="h-4 w-40 max-w-full" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}

function TimerHistorySectionSkeleton() {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
      <Skeleton className="h-5 w-56 max-w-full" />
      <Skeleton className="mt-2 h-3 w-28" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      <Skeleton className="mt-2 h-3 w-40" />
    </section>
  );
}

export default function TimerLoadingPage() {
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
            <CardTitle>
              <Skeleton className="h-7 w-44" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-5/6" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-36 rounded-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-7 w-36" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-4/5" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-4">
              <Skeleton className="h-3 w-20 bg-cyan-100/25" />
              <Skeleton className="mt-2 h-7 w-32 bg-cyan-100/25" />
            </div>
            <div className="mt-4 space-y-3">
              <TimerSummaryRowSkeleton />
              <TimerSummaryRowSkeleton />
              <TimerSummaryRowSkeleton />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-56" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-2/3" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TimerHistorySectionSkeleton />
          <TimerHistorySectionSkeleton />
        </CardContent>
      </Card>
    </AppShell>
  );
}
