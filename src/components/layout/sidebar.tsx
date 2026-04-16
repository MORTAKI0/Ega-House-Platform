import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";

import { cn } from "@/lib/utils";

type NavItem = {
  href: `/${string}`;
  label: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    href: "/goals",
    label: "Goals",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    href: "/timer",
    label: "Timer",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
  {
    href: "/review",
    label: "Review",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: `/${string}`) {
  if (href === "/tasks") return pathname === "/tasks" || pathname.startsWith("/tasks/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

const PROJECT_COLORS = [
  "#f97316", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
  "#f59e0b", "#14b8a6", "#6366f1", "#ef4444", "#10b981",
];

function getProjectColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}

export type SidebarProject = {
  id: string;
  name: string;
};

type SidebarProps = {
  projects?: SidebarProject[];
  currentPath: string;
};

export function Sidebar({ projects = [], currentPath }: SidebarProps) {
  return (
    <aside className="ega-sidebar flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/[0.05]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #2dd4a0, #22d3ee)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d1117" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            EGA House
          </p>
          <p className="text-[10px] text-[var(--color-ink-faint)] leading-none mt-0.5">
            Focus workspace
          </p>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex flex-col gap-0.5 px-2.5 pt-4 pb-2" aria-label="Main navigation">
        <p className="sidebar-section-label mb-2">Workspace</p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(currentPath, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn("sidebar-link", active && "active")}
            >
              <span className="w-4 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/[0.05] my-2" />

      {/* Projects */}
      {projects.length > 0 && (
        <div className="px-2.5 pb-4 flex-1">
          <p className="sidebar-section-label mb-2">My Projects</p>
          <div className="flex flex-col gap-0.5">
            {projects.slice(0, 12).map((project) => (
              <Link
                key={project.id}
                href={`/tasks?project=${project.id}`}
                className="sidebar-link"
              >
                <span
                  className="project-dot flex-shrink-0"
                  style={{ background: getProjectColor(project.name) }}
                />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom spacer */}
      <div className="mt-auto px-2.5 pb-4">
        <Link
          href="/timer"
          className={cn(
            "sidebar-link",
            isActive(currentPath, "/timer") && "active"
          )}
        >
          <span className="w-4 flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          Track time
        </Link>
      </div>
    </aside>
  );
}
