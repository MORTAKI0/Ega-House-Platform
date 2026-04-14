"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GOAL_STATUS_VALUES, formatTaskToken } from "@/lib/task-domain";

import { type CreateGoalFormState, createGoalAction } from "./actions";

type CreateGoalFormProps = {
  projects: Array<{ id: string; name: string }>;
};

export function CreateGoalForm({ projects }: CreateGoalFormProps) {
  const initialState: CreateGoalFormState = {
    error: null,
    values: {
      title: "",
      projectId: projects[0]?.id ?? "",
      description: "",
      status: "draft",
      slug: "",
    },
  };

  const [state, formAction, isPending] = useActionState(
    createGoalAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-200">
          Goal title
        </label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Ship shared timer flow"
          defaultValue={state.values.title}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="projectId" className="text-sm font-medium text-slate-200">
          Project
        </label>
        <select
          id="projectId"
          name="projectId"
          required
          defaultValue={state.values.projectId}
          className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50 focus-visible:ring-4 focus-visible:ring-cyan-300/15"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-slate-200">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={state.values.status}
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50 focus-visible:ring-4 focus-visible:ring-cyan-300/15"
          >
            {GOAL_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {formatTaskToken(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium text-slate-200">
            Slug (optional)
          </label>
          <Input
            id="slug"
            name="slug"
            placeholder="timer-mvp"
            defaultValue={state.values.slug}
          />
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
          defaultValue={state.values.description}
          placeholder="Outcome-focused detail for this goal."
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
        {isPending ? "Creating goal..." : "Create goal"}
      </Button>
    </form>
  );
}
