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

function ReviewEntrySkeleton() {
  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <Skeleton className="h-3 w-36" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-8/12" />
      </div>
    </article>
  );
}

export default function ReviewLoadingPage() {
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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-7 w-32" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-5/6" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-12 w-36 rounded-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-7 w-36" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-4/6" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-7 w-40" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-3/4" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ReviewEntrySkeleton />
            <ReviewEntrySkeleton />
            <ReviewEntrySkeleton />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
