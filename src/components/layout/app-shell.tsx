import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { headers } from "next/headers";

type AppShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  navigation?: ReactNode;
  className?: string;
  contentClassName?: string;
};

type WorkspaceNavItem = {
  href: `/${string}`;
  label: string;
};

const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/goals", label: "Goals" },
  { href: "/timer", label: "Timer" },
  { href: "/review", label: "Review" },
];

function isActiveWorkspace(pathname: string, href: `/${string}`) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

async function WorkspaceNav() {
  const headerStore = await headers();
  const pathname = headerStore.get("x-current-path") ?? "/";

  return (
    <nav aria-label="Workspace navigation" className="flex flex-wrap gap-2">
      {WORKSPACE_NAV_ITEMS.map((item) => {
        const isActive = isActiveWorkspace(pathname, item.href);

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

export async function AppShell({
  children,
  eyebrow,
  title,
  description,
  actions,
  navigation,
  className,
  contentClassName,
}: AppShellProps) {
  return (
    <main
      className={cn(
        "flex min-h-screen px-4 py-6 text-slate-100 sm:px-6",
        className,
      )}
    >
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_32px_120px_rgba(2,6,23,0.65)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 border-b border-white/8 pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              {eyebrow ? (
                <p className="text-xs font-medium uppercase tracking-[0.35em] text-cyan-200/70">
                  {eyebrow}
                </p>
              ) : null}
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {title}
                </h1>
                {description ? (
                  <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            {actions ? (
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
          </div>

          <WorkspaceNav />

          {navigation ? (
            <div className="flex flex-wrap items-center gap-3">{navigation}</div>
          ) : null}
        </div>

        <div className={cn("pt-8", contentClassName)}>{children}</div>
      </section>
    </main>
  );
}
