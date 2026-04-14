"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  type CreateProjectFormState,
  createProjectAction,
} from "./actions";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateProjectForm() {
  const initialState: CreateProjectFormState = {
    error: null,
    values: {
      name: "",
      slug: "",
      description: "",
    },
  };
  const [state, formAction, isPending] = useActionState(
    createProjectAction,
    initialState,
  );
  const [slugEdited, setSlugEdited] = useState(Boolean(state.values.slug));

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-200">
          Name
        </label>
        <Input
          id="name"
          name="name"
          required
          autoComplete="off"
          placeholder="Acme Website Relaunch"
          defaultValue={state.values.name}
          onChange={(event) => {
            if (slugEdited) {
              return;
            }
            const form = event.currentTarget.form;
            if (!form) {
              return;
            }
            const slugInput = form.elements.namedItem("slug");
            if (!(slugInput instanceof HTMLInputElement)) {
              return;
            }
            slugInput.value = normalizeSlug(event.currentTarget.value);
          }}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium text-slate-200">
          Slug
        </label>
        <Input
          id="slug"
          name="slug"
          required
          autoComplete="off"
          inputMode="text"
          pattern="[a-z0-9-]+"
          title="Lowercase letters, numbers, and hyphens only."
          placeholder="acme-website-relaunch"
          defaultValue={state.values.slug}
          onChange={(event) => {
            const nextValue = normalizeSlug(event.currentTarget.value);
            setSlugEdited(nextValue.length > 0);
            event.currentTarget.value = nextValue;
          }}
        />
        <p className="text-xs leading-6 text-slate-400">
          Lowercase letters, numbers, and hyphens only.
        </p>
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
          placeholder="What this project is for and what done looks like."
          defaultValue={state.values.description}
        />
      </div>

      {state.error ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-400/35 bg-rose-400/10 px-4 py-3 text-sm leading-7 text-rose-100"
        >
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating project..." : "Create project"}
        </Button>
        <Link
          href="/tasks/projects"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-transparent bg-transparent px-5 text-sm font-medium text-slate-200 transition duration-200 hover:border-white/10 hover:bg-white/6"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
