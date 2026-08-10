import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/discipline/AppHeader";
import { AddTaskDialog } from "@/components/discipline/AddTaskDialog";
import { ProgressRing } from "@/components/discipline/ProgressRing";
import { TaskItem } from "@/components/discipline/TaskItem";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { completionPct, tasksInPeriod, useDiscipline } from "@/lib/discipline/store";
import { formatPeriodLabel, greeting, todayISO } from "@/lib/discipline/dates";
import { useHydrated } from "@/lib/theme";
import type { Timeline } from "@/lib/discipline/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — Discipline" },
      {
        name: "description",
        content:
          "Plan tasks by day, week or month across your life sectors and track completion for every area.",
      },
      { property: "og:title", content: "Dashboard — Discipline" },
      {
        property: "og:description",
        content: "Flexible task planning with sector progress rings and daily streaks.",
      },
    ],
  }),
  component: Dashboard,
});

const TIMELINES: Timeline[] = ["day", "week", "month"];

function Dashboard() {
  const { tasks, sectors, stats, ready, userName } = useDiscipline();
  const [timeline, setTimeline] = useState<Timeline>("day");
  const today = todayISO();
  const hydrated = useHydrated();

  const periodTasks = tasksInPeriod(tasks, timeline, today);
  const open = periodTasks.filter((t) => !t.done);
  const pct = completionPct(periodTasks);
  const nextBest = open[0];

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 space-y-8 lg:col-span-7">
            <header>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">
                {hydrated ? greeting() : "Welcome back"}, {userName === "there" ? "let's go" : userName}.
              </h1>
              <p className="mt-1 max-w-[56ch] text-pretty text-muted-foreground">
                {ready && open.length > 0
                  ? `${open.length} task${open.length === 1 ? "" : "s"} left this ${timeline}. ${nextBest ? `Next up: ${nextBest.title}.` : ""}`
                  : "Nothing left here — add a task and keep the streak alive."}
              </p>
            </header>

            <div
              className="inline-flex items-center gap-1 rounded-lg bg-secondary p-1"
              role="tablist"
              aria-label="Timeline"
            >
              {TIMELINES.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={timeline === t}
                  onClick={() => setTimeline(t)}
                  className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
                    timeline === t
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {formatPeriodLabel(today, timeline)}
                </h2>
                <AddTaskDialog timeline={timeline} />
              </div>

              {periodTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
                  <p className="font-medium">Nothing here yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your first task and start your streak.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border border-y border-border">
                  {[...periodTasks]
                    .sort((a, b) => Number(a.done) - Number(b.done))
                    .map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                </ul>
              )}
            </section>
          </div>

          <div className="col-span-12 space-y-10 lg:col-span-5">
            <div className="flex flex-col items-center rounded-xl border border-border bg-card p-8 text-center shadow-panel">
              <ProgressRing
                value={pct}
                size={160}
                stroke={8}
                color="emerald"
                label={`${pct}% of this ${timeline} complete`}
              >
                <span className="text-3xl font-semibold leading-none tracking-tight">{pct}%</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {timeline} goal
                </span>
              </ProgressRing>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xl font-semibold">{stats.streak}</span>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    Day streak
                  </span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex flex-col">
                  <span className="text-xl font-semibold">{periodTasks.filter((t) => t.done).length}</span>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    Done this {timeline}
                  </span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex flex-col">
                  <span className="text-xl font-semibold">{stats.completedCount}</span>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    All time
                  </span>
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Active sectors
                </h2>
                <Link to="/sectors" className="text-xs font-medium text-accent hover:underline">
                  Manage
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sectors.map((sector) => {
                  const st = periodTasks.filter((t) => t.sectorId === sector.id);
                  const sp = completionPct(st);
                  return (
                    <div
                      key={sector.id}
                      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-panel"
                    >
                      <ProgressRing
                        value={sp}
                        size={48}
                        stroke={10}
                        color={sector.color}
                        label={`${sector.name} ${sp}% complete`}
                      />
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          <span aria-hidden="true" className="mr-1">
                            {sector.icon}
                          </span>
                          {sector.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {st.length === 0 ? "No tasks this period" : `${sp}% complete`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      <AddTaskDialog
        timeline={timeline}
        trigger={
          <Button
            size="icon"
            aria-label="Quick add task"
            className="fixed bottom-8 right-8 size-14 rounded-2xl shadow-panel"
          >
            <Plus className="size-6" />
          </Button>
        }
      />
    </div>
  );
}
