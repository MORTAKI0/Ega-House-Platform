import { TasksWorkspaceShell } from "@/components/tasks/tasks-workspace-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle>
              <Skeleton className="h-7 w-40" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-3 w-24" />
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
        <CardDescription>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Skeleton className="h-3 w-48 max-w-full pt-2" />
          <Skeleton className="h-10 w-44 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TasksProjectsLoadingPage() {
  return (
    <TasksWorkspaceShell
      eyebrow="Tasks Workspace"
      title="Projects"
      description="Projects grounded in the live tasks schema, with task volume, recent execution context, and direct links into each project workspace."
      actions={<Skeleton className="h-12 w-36 rounded-full" />}
      navigation={
        <>
          <Badge tone="accent">Projects</Badge>
          <Badge>Task Context</Badge>
          <Badge>Detail Pages</Badge>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </TasksWorkspaceShell>
  );
}
