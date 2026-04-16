import { Button } from "@/components/ui/button";
import { GOAL_STATUS_VALUES, formatTaskToken } from "@/lib/task-domain";

type InlineGoalStatusFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  goalId: string;
  returnTo: string;
  defaultStatus: string;
  error?: string | null;
};

export function InlineGoalStatusForm({
  action,
  goalId,
  returnTo,
  defaultStatus,
  error,
}: InlineGoalStatusFormProps) {
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="goalId" value={goalId} />
      <input type="hidden" name="returnTo" value={returnTo} />

      <div className="flex flex-wrap items-end gap-2">
        <label className="space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Status
          </span>
          <select
            name="status"
            defaultValue={defaultStatus}
            className="min-h-10 rounded-xl border border-white/12 bg-slate-950/70 px-3 text-xs uppercase tracking-[0.14em] text-slate-200 outline-none transition focus:border-cyan-300/50"
          >
            {GOAL_STATUS_VALUES.map((statusValue) => (
              <option key={statusValue} value={statusValue}>
                {formatTaskToken(statusValue)}
              </option>
            ))}
          </select>
        </label>

        <Button size="sm" type="submit" variant="secondary">
          Save
        </Button>
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-400/35 bg-rose-400/10 px-3 py-2 text-sm leading-6 text-rose-100">
          {error}
        </p>
      ) : null}
    </form>
  );
}
