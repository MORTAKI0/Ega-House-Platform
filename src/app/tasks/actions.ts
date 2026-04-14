"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  TASK_PRIORITY_VALUES,
  TASK_STATUS_VALUES,
  isTaskPriority,
  isTaskStatus,
} from "@/lib/task-domain";

export type CreateTaskFormState = {
  error: string | null;
  values: {
    title: string;
    projectId: string;
    goalId: string;
    description: string;
    status: string;
    priority: string;
  };
};

function createErrorState(
  error: string,
  values: CreateTaskFormState["values"],
): CreateTaskFormState {
  return { error, values };
}

function getTasksReturnPath(rawReturnTo: unknown) {
  const returnTo = String(rawReturnTo ?? "").trim();
  return returnTo.startsWith("/tasks") ? returnTo : "/tasks";
}

function redirectWithTasksError(returnPath: string, errorMessage: string) {
  const target = new URL(returnPath, "https://egawilldoit.online");
  target.searchParams.set("statusUpdateError", errorMessage);
  redirect(`${target.pathname}${target.search}`);
}

export async function createTaskAction(
  _previous: CreateTaskFormState,
  formData: FormData,
): Promise<CreateTaskFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const goalId = String(formData.get("goalId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "todo").trim();
  const priority = String(formData.get("priority") ?? "medium").trim();

  const values = {
    title,
    projectId,
    goalId,
    description,
    status,
    priority,
  };

  if (!title) {
    return createErrorState("Task title is required.", values);
  }

  if (!projectId) {
    return createErrorState("Project is required.", values);
  }

  if (!isTaskStatus(status)) {
    return createErrorState(
      `Status must be one of: ${TASK_STATUS_VALUES.join(", ")}.`,
      values,
    );
  }

  if (!isTaskPriority(priority)) {
    return createErrorState(
      `Priority must be one of: ${TASK_PRIORITY_VALUES.join(", ")}.`,
      values,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    title,
    project_id: projectId,
    goal_id: goalId || null,
    description: description || null,
    status,
    priority,
  });

  if (error) {
    return createErrorState("Unable to create task right now.", values);
  }

  revalidatePath("/tasks");
  revalidatePath("/timer");

  return {
    error: null,
    values: {
      title: "",
      projectId,
      goalId: "",
      description: "",
      status: "todo",
      priority: "medium",
    },
  };
}

export async function updateTaskStatusAction(formData: FormData) {
  const returnPath = getTasksReturnPath(formData.get("returnTo"));
  const taskId = String(formData.get("taskId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!taskId || !isTaskStatus(status)) {
    redirectWithTasksError(returnPath, "Task status update request is invalid.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    redirectWithTasksError(returnPath, "Unable to update task status right now.");
  }

  revalidatePath("/tasks");
  redirect(returnPath);
}
