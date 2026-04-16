import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";

import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";

type TasksWorkspaceShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  navigation?: ReactNode;
  className?: string;
  contentClassName?: string;
};

type TasksSubnavItem = {
  href: "/tasks" | "/tasks/projects";
  label: string;
};

const TASKS_SUBNAV_ITEMS: TasksSubnavItem[] = [
  { href: "/tasks", label: "Tasks" },
  { href: "/tasks/projects", label: "Projects" },
];

function isActiveTasksSubnav(pathname: string, href: TasksSubnavItem["href"]) {
  if (href === "/tasks") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

async function TasksSubnav() {
  const headerStore = await headers();
  const pathname = headerStore.get("x-current-path") ?? "/";

  return (
    <nav aria-label="Tasks workspace navigation" className="flex flex-wrap gap-2">
      {TASKS_SUBNAV_ITEMS.map((item) => {
        const isActive = isActiveTasksSubnav(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition",
              isActive
                ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100 shadow-[0_0_0_1px_rgba(103,232,249,0.12)]"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export async function TasksWorkspaceShell({
  children,
  eyebrow,
  title,
  description,
  actions,
  navigation,
  className,
  contentClassName,
}: TasksWorkspaceShellProps) {
  return (
    <AppShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={actions}
      navigation={
        <div className="space-y-3">
          <TasksSubnav />
          {navigation ? (
            <div className="flex flex-wrap items-center gap-3">{navigation}</div>
          ) : null}
        </div>
      }
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </AppShell>
  );
}
