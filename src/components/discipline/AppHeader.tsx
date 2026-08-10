import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, displayName } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { useDiscipline } from "@/lib/discipline/store";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analytics", label: "Analytics" },
  { to: "/sectors", label: "My Sectors" },
] as const;

export function AppHeader() {
  const { stats } = useDiscipline();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Logo className="size-7" />
            <span>Discipline</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "bg-secondary text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="rounded-md px-2.5 py-1.5 font-medium transition-colors sm:px-3"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <div
            className="flex items-center gap-1.5 text-sm font-semibold"
            title={`${stats.streak} day streak`}
          >
            <Flame className="size-4 text-sector-orange" aria-hidden="true" />
            <span>{stats.streak}</span>
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              day streak
            </span>
          </div>
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Completed
            </span>
            <span className="text-sm font-semibold tabular-nums">{stats.completedCount}</span>
          </div>
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-medium text-muted-foreground md:inline">
                {displayName(user)}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
