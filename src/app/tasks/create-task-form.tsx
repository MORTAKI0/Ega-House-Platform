"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  TASK_PRIORITY_VALUES,
  TASK_STATUS_VALUES,
  formatTaskToken,
} from "@/lib/task-domain";

import { type CreateTaskFormState, createTaskAction } from "./actions";

type CreateTaskFormProps = {
  projects: Array<{ id: string; name: string }>;
  goals: Array<{ id: string; title: string; project_id: string }>;
  projectId?: string;
  returnTo?: string;
};

export function CreateTaskForm({
  projects,
  goals,
  projectId,
  returnTo = "/tasks",
}: CreateTaskFormProps) {
  const selectedProjectId = projectId ?? projects[0]?.id ?? "";
  const isProjectScoped = Boolean(projectId);

  const initialState: CreateTaskFormState = {
    error: null,
    values: {
      title: "",
      projectId: selectedProjectId,
      goalId: "",
      description: "",
      status: "todo",
      priority: "medium",
      returnTo,
    },
  };

  const [state, formAction, isPending] = useActionState(
    createTaskAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="returnTo" value={state.values.returnTo} />
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-200">
          Title
        </label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Ship timer session recovery"
          defaultValue={state.values.title}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="projectId"
            className="text-sm font-medium text-slate-200"
          >
            Project
          </label>
          {isProjectScoped ? (
            <>
              <input type="hidden" name="projectId" value={state.values.projectId} />
              <div className="flex min-h-12 items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-slate-100">
                {projects.find((project) => project.id === state.values.projectId)?.name ??
                  "Selected project"}
              </div>
            </>
          ) : (
            <select
              id="projectId"
              name="projectId"
              defaultValue={state.values.projectId}
              required
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50 focus-visible:ring-4 focus-visible:ring-cyan-300/15"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="goalId" className="text-sm font-medium text-slate-200">
            Goal (optional)
          </label>
          <select
            id="goalId"
            name="goalId"
            defaultValue={state.values.goalId}
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50 focus-visible:ring-4 focus-visible:ring-cyan-300/15"
          >
            <option value="">No goal</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-slate-200">
            Initial status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={state.values.status}
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50 focus-visible:ring-4 focus-visible:ring-cyan-300/15"
          >
            {TASK_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {formatTaskToken(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="priority"
            className="text-sm font-medium text-slate-200"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={state.values.priority}
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50 focus-visible:ring-4 focus-visible:ring-cyan-300/15"
          >
            {TASK_PRIORITY_VALUES.map((priority) => (
              <option key={priority} value={priority}>
                {formatTaskToken(priority)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-200"
        >
          Description (optional)
        </label>
        <Textarea
          id="description"
          name="description"
          placeholder="Capture scope, constraints, and delivery notes."
          defaultValue={state.values.description}
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-2xl border border-rose-400/35 bg-rose-400/10 px-4 py-3 text-sm leading-7 text-rose-100"
        >
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending || projects.length === 0}>
        {isPending ? "Creating task..." : "Create task"}
      </Button>
    </form>
  );
}
