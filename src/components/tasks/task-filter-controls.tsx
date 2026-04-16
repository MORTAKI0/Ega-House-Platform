import Link from "next/link";

import {
  TASK_PRIORITY_VALUES,
  TASK_STATUS_VALUES,
  formatTaskToken,
} from "@/lib/task-domain";

type TaskFilterControlsProps = {
  basePath: string;
  activeStatus?: string | null;
  activePriority?: string | null;
  activeProjectId?: string | null;
  activeGoalId?: string | null;
  projectOptions?: Array<{ id: string; name: string }>;
  goalOptions?: Array<{ id: string; title: string }>;
  includePriority?: boolean;
};

type FilterOption = {
  value: string | null;
  label: string;
};

function buildFilterHref(
  basePath: string,
  filters: {
    status?: string | null;
    priority?: string | null;
    project?: string | null;
    goal?: string | null;
  },
) {
  const searchParams = new URLSearchParams();

  if (filters.status) {
    searchParams.set("status", filters.status);
  }

  if (filters.priority) {
    searchParams.set("priority", filters.priority);
  }

  if (filters.project) {
    searchParams.set("project", filters.project);
  }

  if (filters.goal) {
    searchParams.set("goal", filters.goal);
  }

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function FilterPills({
  label,
  options,
  activeValue,
  hrefForValue,
}: {
  label: string;
  options: FilterOption[];
  activeValue: string | null;
  hrefForValue: (value: string | null) => string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.value === activeValue;

          return (
            <Link
              key={`${label}-${option.label}`}
              href={hrefForValue(option.value)}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "inline-flex min-h-10 items-center rounded-full border border-cyan-300/35 bg-cyan-300/15 px-4 text-xs font-medium uppercase tracking-[0.2em] text-cyan-100"
                  : "inline-flex min-h-10 items-center rounded-full border border-white/12 bg-white/5 px-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-100"
              }
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function TaskFilterControls({
  basePath,
  activeStatus = null,
  activePriority = null,
  activeProjectId = null,
  activeGoalId = null,
  projectOptions = [],
  goalOptions = [],
  includePriority = false,
}: TaskFilterControlsProps) {
  const statusOptions: FilterOption[] = [
    { value: null, label: "All" },
    ...TASK_STATUS_VALUES.map((status) => ({
      value: status,
      label: formatTaskToken(status),
    })),
  ];

  const priorityOptions: FilterOption[] = [
    { value: null, label: "All" },
    ...TASK_PRIORITY_VALUES.map((priority) => ({
      value: priority,
      label: formatTaskToken(priority),
    })),
  ];
  const projectFilterOptions: FilterOption[] = [
    { value: null, label: "All" },
    ...projectOptions.map((project) => ({
      value: project.id,
      label: project.name,
    })),
  ];
  const goalFilterOptions: FilterOption[] = [
    { value: null, label: "All" },
    ...goalOptions.map((goal) => ({
      value: goal.id,
      label: goal.title,
    })),
  ];

  return (
    <div className="space-y-4">
      <FilterPills
        label="Status"
        options={statusOptions}
        activeValue={activeStatus}
        hrefForValue={(status) =>
          buildFilterHref(basePath, {
            status,
            priority: activePriority,
            project: activeProjectId,
            goal: activeGoalId,
          })
        }
      />

      {projectOptions.length > 0 ? (
        <FilterPills
          label="Project"
          options={projectFilterOptions}
          activeValue={activeProjectId}
          hrefForValue={(project) =>
            buildFilterHref(basePath, {
              status: activeStatus,
              priority: activePriority,
              project,
              goal: activeGoalId,
            })
          }
        />
      ) : null}

      {goalOptions.length > 0 ? (
        <FilterPills
          label="Goal"
          options={goalFilterOptions}
          activeValue={activeGoalId}
          hrefForValue={(goal) =>
            buildFilterHref(basePath, {
              status: activeStatus,
              priority: activePriority,
              project: activeProjectId,
              goal,
            })
          }
        />
      ) : null}

      {includePriority ? (
        <FilterPills
          label="Priority"
          options={priorityOptions}
          activeValue={activePriority}
          hrefForValue={(priority) =>
            buildFilterHref(basePath, {
              status: activeStatus,
              priority,
              project: activeProjectId,
              goal: activeGoalId,
            })
          }
        />
      ) : null}
    </div>
  );
}

export function buildTaskFilterReturnPath(
  basePath: string,
  filters: {
    status?: string | null;
    priority?: string | null;
    project?: string | null;
    goal?: string | null;
  },
) {
  return buildFilterHref(basePath, filters);
}
