"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type SaveReviewFormState = {
  error: string | null;
  saved: boolean;
  values: {
    reflection: string;
    weekOf: string;
  };
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getWeekBounds(weekOf: string) {
  const parsed = new Date(`${weekOf}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const day = parsed.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const weekStart = new Date(parsed);
  weekStart.setUTCDate(parsed.getUTCDate() + diffToMonday);

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

  return {
    weekStart: toIsoDate(weekStart),
    weekEnd: toIsoDate(weekEnd),
  };
}

function errorState(
  error: string,
  values: SaveReviewFormState["values"],
): SaveReviewFormState {
  return {
    error,
    saved: false,
    values,
  };
}

export async function saveReviewAction(
  _previous: SaveReviewFormState,
  formData: FormData,
): Promise<SaveReviewFormState> {
  const reflection = String(formData.get("reflection") ?? "").trim();
  const weekOf = String(formData.get("weekOf") ?? "").trim();

  const values = { reflection, weekOf };

  if (!weekOf) {
    return errorState("Week date is required.", values);
  }

  if (!reflection) {
    return errorState("Reflection is required.", values);
  }

  const bounds = getWeekBounds(weekOf);

  if (!bounds) {
    return errorState("Week date is invalid.", values);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("week_reviews").insert({
    week_start: bounds.weekStart,
    week_end: bounds.weekEnd,
    summary: reflection,
  });

  if (error) {
    return errorState("Unable to save review right now.", values);
  }

  revalidatePath("/review");

  return {
    error: null,
    saved: true,
    values: {
      reflection: "",
      weekOf,
    },
  };
}
