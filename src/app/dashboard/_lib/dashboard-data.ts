import { getOpenClawHealth } from "@/lib/openclaw";
import { createClient } from "@/lib/supabase/server";
import {
  formatDurationLabel,
  getTaskSessionDurationSeconds,
} from "@/lib/task-session";

const TODAY_TASK_LIMIT = 8;

type PanelResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export type DashboardHealthData = {
  state: "healthy" | "unavailable";
  statusText: string;
  checkedAt: string;
};

export type DashboardTodayTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  updatedAt: string;
  projectName: string;
  goalTitle: string | null;
};

export type DashboardActiveSession = {
  sessionId: string;
  taskId: string;
  startedAt: string;
  elapsedLabel: string;
  taskTitle: string;
  taskStatus: string;
  taskPriority: string;
  projectName: string;
  projectSlug: string | null;
  goalTitle: string | null;
};

export type DashboardProjectStatus = {
  id: string;
  name: string;
  slug: string;
  status: string;
  updatedAt: string;
};

export type DashboardData = {
  health: DashboardHealthData;
  todaysTasks: PanelResult<DashboardTodayTask[]>;
  activeTimer: PanelResult<DashboardActiveSession | null>;
  projectStatuses: PanelResult<DashboardProjectStatus[]>;
};

function getTodayWindow() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

export async function getDashboardHealthData(): Promise<DashboardHealthData> {
  try {
    const health = await getOpenClawHealth();

    return {
      state: health.reachable ? "healthy" : "unavailable",
      statusText:
        health.statusText?.trim() ||
        (health.reachable ? "Healthy" : "OpenClaw is currently unavailable."),
      checkedAt: health.checkedAt,
    };
  } catch {
    return {
      state: "unavailable",
      statusText: "Health probe unavailable in this environment.",
      checkedAt: new Date().toISOString(),
    };
  }
}

async function getTodaysTasks(): Promise<PanelResult<DashboardTodayTask[]>> {
  try {
    const supabase = await createClient();
    const { startIso, endIso } = getTodayWindow();

    const { data, error } = await supabase
      .from("tasks")
      .select(
        "id, title, status, priority, updated_at, projects(name), goals(title)",
      )
      .gte("updated_at", startIso)
      .lt("updated_at", endIso)
      .order("updated_at", { ascending: false })
      .limit(TODAY_TASK_LIMIT);

    if (error) {
      return {
        data: null,
        error: `Failed to load today's tasks: ${error.message}`,
      };
    }

    return {
      data: (data ?? []).map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        updatedAt: task.updated_at,
        projectName: task.projects?.name ?? "Unknown project",
        goalTitle: task.goals?.title ?? null,
      })),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load today's tasks.",
    };
  }
}

async function getActiveTimer(): Promise<PanelResult<DashboardActiveSession | null>> {
  try {
    const supabase = await createClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from("task_sessions")
      .select(
        "id, task_id, started_at, ended_at, duration_seconds, tasks(id, title, status, priority, goals(title), projects(name, slug))",
      )
      .is("ended_at", null)
      .order("started_at", { ascending: false })
      .limit(1);

    if (error) {
      return {
        data: null,
        error: `Failed to load active timer: ${error.message}`,
      };
    }

    const activeSession = data?.[0];

    if (!activeSession) {
      return {
        data: null,
        error: null,
      };
    }

    return {
      data: {
        sessionId: activeSession.id,
        taskId: activeSession.task_id,
        startedAt: activeSession.started_at,
        elapsedLabel: formatDurationLabel(
          getTaskSessionDurationSeconds(activeSession, nowIso),
        ),
        taskTitle: activeSession.tasks?.title ?? "Untitled task",
        taskStatus: activeSession.tasks?.status ?? "todo",
        taskPriority: activeSession.tasks?.priority ?? "medium",
        projectName: activeSession.tasks?.projects?.name ?? "Unknown project",
        projectSlug: activeSession.tasks?.projects?.slug ?? null,
        goalTitle: activeSession.tasks?.goals?.title ?? null,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to load active timer.",
    };
  }
}

async function getProjectStatuses(): Promise<PanelResult<DashboardProjectStatus[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, slug, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(8);

    if (error) {
      return {
        data: null,
        error: `Failed to load project statuses: ${error.message}`,
      };
    }

    return {
      data: (data ?? []).map((project) => ({
        id: project.id,
        name: project.name,
        slug: project.slug,
        status: project.status,
        updatedAt: project.updated_at,
      })),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load project statuses.",
    };
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const [health, todaysTasks, activeTimer, projectStatuses] = await Promise.all([
    getDashboardHealthData(),
    getTodaysTasks(),
    getActiveTimer(),
    getProjectStatuses(),
  ]);

  return {
    health,
    todaysTasks,
    activeTimer,
    projectStatuses,
  };
}
