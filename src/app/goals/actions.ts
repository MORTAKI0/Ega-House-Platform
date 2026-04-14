"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { GOAL_STATUS_VALUES, isGoalStatus } from "@/lib/task-domain";

export type CreateGoalFormState = {
  error: string | null;
  values: {
    title: string;
    projectId: string;
    description: string;
    status: string;
    slug: string;
  };
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function createErrorState(
  message: string,
  values: CreateGoalFormState["values"],
): CreateGoalFormState {
  return { error: message, values };
}

export async function createGoalAction(
  _previous: CreateGoalFormState,
  formData: FormData,
): Promise<CreateGoalFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const rawSlug = String(formData.get("slug") ?? "");
  const slug = normalizeSlug(rawSlug);

  const values = {
    title,
    projectId,
    description,
    status,
    slug,
  };

  if (!title) {
    return createErrorState("Goal title is required.", values);
  }

  if (!projectId) {
    return createErrorState("Project is required.", values);
  }

  if (!status) {
    return createErrorState("Status is required.", values);
  }

  if (!isGoalStatus(status)) {
    return createErrorState(
      `Status must be one of: ${GOAL_STATUS_VALUES.join(", ")}.`,
      values,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("goals").insert({
    title,
    project_id: projectId,
    description: description || null,
    status,
    slug: slug || null,
  });

  if (error) {
    return createErrorState("Unable to create goal right now.", values);
  }

  revalidatePath("/goals");

  return {
    error: null,
    values: {
      title: "",
      projectId,
      description: "",
      status,
      slug: "",
    },
  };
}
