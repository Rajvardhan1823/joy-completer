import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { levelProgress, useDiscipline } from "@/lib/discipline/store";

export function AppHeader() {
  const { stats } = useDiscipline();
  const { level, into, span, pct } = levelProgress(stats.xp);

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Discipline
          </Link>
          <nav className="flex items-center gap-1 text-sm" aria-label="Main">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-md px-3 py-1.5 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/sectors"
              activeProps={{ className: "bg-secondary text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-md px-3 py-1.5 font-medium transition-colors"
            >
              My Sectors
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <div
            className="flex items-center gap-1.5 text-sm font-semibold"
            title={`${stats.streak} day streak`}
          >
            <Flame className="size-4 text-sector-orange" aria-hidden="true" />
            <span>{stats.streak}</span>
            <span className="text-xs font-medium text-muted-foreground">day streak</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Level {level} · {into}/{span} XP
            </span>
            <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}