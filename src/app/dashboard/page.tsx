import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";

import {
  ActiveTimerPanel,
  LinearProgressPanel,
  ProjectStatusPanel,
  TodaysTasksPanel,
} from "./_components/dashboard-panels";
import { HealthCardAutoRefresh } from "./_components/health-card-auto-refresh";
import { getDashboardData } from "./_lib/dashboard-data";

export const metadata: Metadata = {
  title: "Dashboard | EGA House",
  description: "Read-only operational snapshot across health, tasks, and timer.",
};

export default async function DashboardPage() {
  const { health, todaysTasks, activeTimer, projectStatuses, linearProject } =
    await getDashboardData();

  return (
    <AppShell
      eyebrow="Dashboard Workspace"
      title="Dashboard"
      description="Read-only operational snapshot for platform health, today's tasks, and active timer state."
      navigation={
        <>
          <Badge tone="accent">Dashboard</Badge>
          <Badge>Read Only</Badge>
          <Badge>Supabase + OpenClaw</Badge>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <TodaysTasksPanel tasks={todaysTasks.data} error={todaysTasks.error} />
        <div className="space-y-6">
          <HealthCardAutoRefresh initialHealth={health} />
          <ActiveTimerPanel
            activeSession={activeTimer.data}
            error={activeTimer.error}
          />
          <ProjectStatusPanel
            projects={projectStatuses.data}
            error={projectStatuses.error}
          />
          <LinearProgressPanel
            project={linearProject.data}
            error={linearProject.error}
          />
        </div>
      </div>
    </AppShell>
  );
}
