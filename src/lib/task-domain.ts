export const TASK_STATUS_VALUES = ["todo", "in_progress", "done", "blocked"] as const;
export const TASK_PRIORITY_VALUES = ["low", "medium", "high", "urgent"] as const;
export const GOAL_STATUS_VALUES = ["draft", "active", "done", "paused"] as const;

export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];
export type TaskPriority = (typeof TASK_PRIORITY_VALUES)[number];
export type GoalStatus = (typeof GOAL_STATUS_VALUES)[number];

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUS_VALUES.includes(value as TaskStatus);
}

export function isTaskPriority(value: string): value is TaskPriority {
  return TASK_PRIORITY_VALUES.includes(value as TaskPriority);
}

export function isGoalStatus(value: string): value is GoalStatus {
  return GOAL_STATUS_VALUES.includes(value as GoalStatus);
}

export function formatTaskToken(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getTaskStatusTone(status: string) {
  const normalized = status.toLowerCase();

  if (["done", "complete", "completed"].includes(normalized)) {
    return "success" as const;
  }

  if (["blocked", "cancelled", "canceled"].includes(normalized)) {
    return "danger" as const;
  }

  if (["in progress", "in_progress", "active"].includes(normalized)) {
    return "accent" as const;
  }

  return "neutral" as const;
}
