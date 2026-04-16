import type { ReactNode } from "react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

import { cn } from "@/lib/utils";
import { Sidebar, type SidebarProject } from "./sidebar";

type AppShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Deprecated – kept for backwards compat, but no longer rendered */
  navigation?: ReactNode;
  className?: string;
  contentClassName?: string;
};

async function getSidebarProjects(): Promise<SidebarProject[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select("id, name")
      .order("name", { ascending: true })
      .limit(15);
    return data ?? [];
  } catch {
    return [];
  }
}

async function TopBar({ title }: { title: string }) {
  return (
    <div className="ega-topbar flex items-center justify-between px-6 gap-4">
      {/* Page title (mobile) */}
      <h1
        className="text-sm font-semibold text-white truncate lg:hidden"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h1>

      {/* Search */}
      <label className="hidden sm:flex items-center gap-2.5 flex-1 max-w-sm bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 h-9 text-sm text-slate-400 cursor-text hover:bg-white/[0.06] transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Search tasks...</span>
      </label>

      {/* Right side actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Upgrade hint */}
        <span className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-white/10 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
          Upgrade
        </span>

        {/* Notifications */}
        <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>

        {/* Settings */}
        <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-cyan)] flex items-center justify-center text-xs font-bold text-[#0d1117] flex-shrink-0 select-none">
          EG
        </div>
      </div>
    </div>
  );
}

export async function AppShell({
  children,
  eyebrow,
  title,
  description,
  actions,
  className,
  contentClassName,
}: AppShellProps) {
  const headerStore = await headers();
  const currentPath = headerStore.get("x-current-path") ?? "/";
  const projects = await getSidebarProjects();

  return (
    <div className="ega-shell">
      <Sidebar projects={projects} currentPath={currentPath} />

      <main className={cn("ega-main", className)}>
        <TopBar title={title} />

        <div className={cn("ega-content", contentClassName)}>
          {/* Page header */}
          <div className="mb-6 md:mb-8">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-green)] mb-2 opacity-80">
                {eyebrow}
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h1>
                {description && (
                  <p className="mt-1.5 text-sm text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
