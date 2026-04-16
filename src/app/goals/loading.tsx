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

function GoalRowSkeleton() {
  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-5 w-48 max-w-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-3 w-36 max-w-full" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-10/12" />
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <Skeleton className="h-3 w-36 pt-2" />
        <Skeleton className="h-10 w-44 rounded-full" />
      </div>
    </article>
  );
}

export default function GoalsLoadingPage() {
  return (
    <AppShell
      eyebrow="Goals Workspace"
      title="Goals"
      description="Track strategic goals and attach them to existing projects."
      navigation={
        <>
          <Badge tone="accent">Goals</Badge>
          <Badge>Planning</Badge>
          <Badge>Supabase Live</Badge>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-7 w-28" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-4/5" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <GoalRowSkeleton />
            <GoalRowSkeleton />
            <GoalRowSkeleton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-7 w-28" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-2/3" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-12 w-36 rounded-full" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
