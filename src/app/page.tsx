import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/tasks");
  }

  return (
    <AppShell
      title="EGA House"
      description="Shared operational surface connecting tasks, goals, timer, and weekly reviews."
      actions={
        <Link
          href="/login"
          className="inline-flex h-9 items-center justify-center rounded-xl border border-[var(--accent-green-border)] bg-[var(--accent-green)] px-5 text-sm font-semibold text-[#064e3b] transition hover:bg-[var(--accent-green-strong)] active:scale-[0.98]"
        >
          Sign in to get started →
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Surfaces" value="5" subtitle="Task, Goal, Timer, Review, Dashboard" />
        <StatCard label="Design" value="v1" subtitle="Premium dark sidebar interface" variant="green" />
        <StatCard label="Database" value="Live" subtitle="Supabase realtime backend" variant="cyan" />
        <StatCard label="Stack" value="Next 15" subtitle="React 19 + Tailwind v4" variant="muted" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Shared design language</CardTitle>
            <CardDescription>
              Dark sidebar, emerald accents, display typography, and calm editorial spacing
              across all workspace surfaces.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Surfaces", desc: "Shell, panel, and muted card tones aligned across all pages." },
              { label: "Typography", desc: "Plus Jakarta Sans display + DM Sans body stack." },
              { label: "Primitives", desc: "Buttons, inputs, badges, cards, and stat widgets." },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-muted)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-faint)] mb-2">
                  {item.label}
                </p>
                <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">{item.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App pages</CardTitle>
            <CardDescription>
              Each workspace surface focuses on data and workflow rather than rebuilding layout and styling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/tasks", label: "Tasks", desc: "Create & filter tasks" },
              { href: "/goals", label: "Goals", desc: "Track strategic objectives" },
              { href: "/timer", label: "Timer", desc: "Focus session tracking" },
              { href: "/review", label: "Review", desc: "Weekly reflection workflow" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-muted)] px-4 py-3 hover:border-[var(--border-default)] hover:bg-[var(--surface-2)] transition-all duration-150 group"
              >
                <div>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{item.label}</p>
                  <p className="text-xs text-[var(--color-ink-soft)]">{item.desc}</p>
                </div>
                <span className="text-[var(--color-ink-faint)] group-hover:text-[var(--accent-green)] transition-colors">→</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
