"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isProjectStatus } from "@/lib/task-domain";

function getProjectsReturnPath(rawReturnTo: unknown) {
  const returnTo = String(rawReturnTo ?? "").trim();
  return returnTo.startsWith("/tasks/projects") ? returnTo : "/tasks/projects";
}

function getProjectsPathname(returnPath: string) {
  return new URL(returnPath, "https://egawilldoit.online").pathname;
}

function redirectWithProjectsError(
  returnPath: string,
  errorMessage: string,
  projectId?: string,
): never {
  const target = new URL(returnPath, "https://egawilldoit.online");
  target.searchParams.set("projectUpdateError", errorMessage);

  if (projectId) {
    target.searchParams.set("projectUpdateProjectId", projectId);
  }

  redirect(
    `${target.pathname}${target.search}${projectId ? `#project-${projectId}` : ""}`,
  );
}

export async function updateProjectStatusAction(formData: FormData) {
  const returnPath = getProjectsReturnPath(formData.get("returnTo"));
  const projectId = String(formData.get("projectId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!projectId || !isProjectStatus(status)) {
    redirectWithProjectsError(
      returnPath,
      "Project update request is invalid.",
      projectId,
    );
  }

  const updatedAt = new Date().toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      status,
      updated_at: updatedAt,
    })
    .eq("id", projectId);

  if (error) {
    redirectWithProjectsError(
      returnPath,
      "Unable to update project right now.",
      projectId,
    );
  }

  const returnPathname = getProjectsPathname(returnPath);

  revalidatePath("/tasks/projects");
  revalidatePath(returnPathname);
  revalidatePath("/tasks");
  revalidatePath("/goals");
  redirect(`${returnPath}#project-${projectId}`);
}
