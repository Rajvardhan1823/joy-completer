import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, TrendingUp } from "lucide-react";
import { AppHeader } from "@/components/discipline/AppHeader";
import { AddTaskDialog } from "@/components/discipline/AddTaskDialog";
import { ProgressRing, sectorColorVar } from "@/components/discipline/ProgressRing";
import { RewardToast } from "@/components/discipline/RewardToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  completionPct,
  levelProgress,
  SECTOR_COLORS,
  SECTOR_ICONS,
  taskXp,
  useDiscipline,
} from "@/lib/discipline/store";
import { addDays, isSameMonth, isSameWeek, parseISO, todayISO } from "@/lib/discipline/dates";
import type { SectorColor, Task } from "@/lib/discipline/types";

export const Route = createFileRoute("/_authenticated/analytics")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Analytics — Discipline" },
      {
        name: "description",
        content:
          "See completion percentage for every sector and segment, XP earned, difficulty mix and your 7-day activity trend.",
      },
      { property: "og:title", content: "Analytics — Discipline" },
      {
        property: "og:description",
        content: "Per-sector completion percentages, XP breakdown and activity trends.",
      },
    ],
  }),
  component: AnalyticsPage,
});

type Range = "week" | "month" | "all";
const RANGES: { id: Range; label: string }[] = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];

function inRange(task: Task, range: Range, today: string) {
  if (range === "all") return true;
  if (range === "week") return isSameWeek(task.date, today);
  return isSameMonth(task.date, today);
}

function Bar({ pct, color }: { pct: number; color: SectorColor }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: sectorColorVar(color) }}
      />
    </div>
  );
}

function AnalyticsPage() {
  const { tasks, sectors, segments, stats, addSector } = useDiscipline();
  const [range, setRange] = useState<Range>("week");
  const [name, setName] = useState("");
  const [color, setColor] = useState<SectorColor>("violet");
  const today = todayISO();

  const scoped = useMemo(
    () => tasks.filter((t) => inRange(t, range, today)),
    [tasks, range, today],
  );

  const overall = completionPct(scoped);
  const { level, into, span } = levelProgress(stats.xp);
  const earnedXp = scoped.reduce((acc, t) => acc + (t.done ? taskXp(t) : 0), 0);
  const potentialXp = scoped.reduce((acc, t) => acc + taskXp(t), 0);

  const sectorRows = useMemo(
    () =>
      sectors
        .map((sector) => {
          const st = scoped.filter((t) => t.sectorId === sector.id);
          return {
            sector,
            tasks: st,
            pct: completionPct(st),
            done: st.filter((t) => t.done).length,
            xp: st.reduce((acc, t) => acc + (t.done ? taskXp(t) : 0), 0),
            segments: segments
              .filter((s) => s.sectorId === sector.id)
              .map((seg) => {
                const gt = st.filter((t) => t.segmentId === seg.id);
                return { seg, count: gt.length, pct: completionPct(gt) };
              }),
          };
        })
        .sort((a, b) => b.tasks.length - a.tasks.length),
    [sectors, segments, scoped],
  );

  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i - 6);
      const dayTasks = tasks.filter((t) => t.date === date);
      const done = dayTasks.filter((t) => t.done).length;
      return {
        date,
        label: parseISO(date).toLocaleDateString(undefined, { weekday: "narrow" }),
        done,
        total: dayTasks.length,
      };
    });
  }, [tasks, today]);
  const peak = Math.max(1, ...last7.map((d) => d.total));

  const difficultyMix = (["easy", "normal", "hard"] as const).map((d) => ({
    difficulty: d,
    total: scoped.filter((t) => t.difficulty === d).length,
    done: scoped.filter((t) => t.difficulty === d && t.done).length,
  }));

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
            <p className="mt-1 max-w-[62ch] text-muted-foreground">
              Completion percentage for everything you track — overall, per sector and per segment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-lg bg-secondary p-1">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  aria-pressed={range === r.id}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    range === r.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <AddTaskDialog timeline="day" />
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-panel">
            <ProgressRing value={overall} size={64} stroke={9} color="emerald">
              <span className="text-xs font-semibold">{overall}%</span>
            </ProgressRing>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Overall completion
              </p>
              <p className="text-sm text-muted-foreground">
                {scoped.filter((t) => t.done).length} of {scoped.length} tasks done
              </p>
            </div>
          </div>
          <Stat label="XP earned" value={`${earnedXp}`} sub={`of ${potentialXp} available`} />
          <Stat label="Level" value={`${level}`} sub={`${into}/${span} XP to next`} />
          <Stat
            label="Streak"
            value={`${stats.streak}`}
            sub={`longest ${stats.longestStreak} days`}
          />
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Sector breakdown
          </h2>
          {sectorRows.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No sectors yet — create one below to start tracking.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {sectorRows.map(({ sector, tasks: st, pct, done, xp, segments: segs }) => (
                <article
                  key={sector.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-panel"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      <span aria-hidden="true" style={{ color: sectorColorVar(sector.color) }}>
                        {sector.icon}
                      </span>
                      {sector.name}
                    </h3>
                    <span className="text-lg font-semibold tabular-nums">{pct}%</span>
                  </div>
                  <div className="mt-3">
                    <Bar pct={pct} color={sector.color} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {done}/{st.length} tasks · {xp} XP earned
                  </p>
                  {segs.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {segs.map(({ seg, count, pct: sp }) => (
                        <li key={seg.id} className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{seg.name}</span>
                            <span className="tabular-nums">
                              {count === 0 ? "—" : `${sp}%`}
                            </span>
                          </div>
                          <div className="mt-1">
                            <Bar pct={sp} color={sector.color} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5 shadow-panel">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="size-4" aria-hidden="true" />
              Last 7 days
            </h2>
            <div className="mt-6 flex h-36 items-end gap-3">
              {last7.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-28 w-full items-end justify-center rounded-md bg-muted/60">
                    <div
                      className="w-full rounded-md bg-accent transition-all duration-700"
                      style={{ height: `${Math.round((d.done / peak) * 100)}%` }}
                      title={`${d.done} of ${d.total} completed`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-panel">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Difficulty mix
            </h2>
            <ul className="mt-5 space-y-4">
              {difficultyMix.map((d) => (
                <li key={d.difficulty}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{d.difficulty}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {d.done}/{d.total}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <Bar
                      pct={d.total === 0 ? 0 : Math.round((d.done / d.total) * 100)}
                      color="azure"
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted-foreground">
              Harder tasks are worth more XP — easy 10, normal 25, hard 50, plus 5 per subtask.
            </p>
          </section>
        </div>

        <section className="mt-10 rounded-xl border border-border bg-card p-5 shadow-panel">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Add something new
          </h2>
          <form
            className="mt-4 flex flex-wrap items-end gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              addSector(name, color, SECTOR_ICONS[sectors.length % SECTOR_ICONS.length] ?? "◆");
              setName("");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="analytics-sector">New sector</Label>
              <Input
                id="analytics-sector"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Finance"
                className="w-56"
              />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Color</legend>
              <div className="flex gap-2">
                {SECTOR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Use ${c} color`}
                    aria-pressed={color === c}
                    onClick={() => setColor(c)}
                    className={`size-7 rounded-full transition-transform ${c === color ? "scale-110 ring-2 ring-ring ring-offset-2 ring-offset-card" : ""}`}
                    style={{ backgroundColor: sectorColorVar(c) }}
                  />
                ))}
              </div>
            </fieldset>
            <Button type="submit">
              <Plus className="size-4" aria-hidden="true" />
              Add sector
            </Button>
            <Link
              to="/sectors"
              className="text-xs font-medium text-accent hover:underline"
            >
              Manage sectors & segments
            </Link>
          </form>
        </section>
      </main>
      <RewardToast />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-panel">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
