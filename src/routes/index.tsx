import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, CheckCircle2, Flame, Layers, ListChecks } from "lucide-react";
import { ThemeToggle } from "@/components/discipline/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discipline — Gamified Checklist & Progress Dashboard" },
      {
        name: "description",
        content:
          "Discipline is a clear checklist for day, week and month planning across your life sectors, with streaks and completion analytics.",
      },
      { property: "og:title", content: "Discipline — Gamified Checklist & Progress Dashboard" },
      {
        property: "og:description",
        content:
          "Plan by day, week or month across your life sectors and track completion for everything that matters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: ListChecks,
    title: "Flexible timelines",
    body: "Plan the same task by day, week or month and move it between horizons without losing progress.",
  },
  {
    icon: Layers,
    title: "Sectors & segments",
    body: "Split life into sectors — academics, fitness, work — then break each into focused segments.",
  },
  {
    icon: CheckCircle2,
    title: "Subtasks that count",
    body: "Break any task into steps — every step you tick moves the completion percentage.",
  },
  {
    icon: Flame,
    title: "Streaks that stick",
    body: "Finish something every day to keep your streak alive — miss a day and it resets.",
  },
  {
    icon: BarChart3,
    title: "Completion analytics",
    body: "See the completion percentage for every sector and segment, plus your 7-day trend.",
  },
];

function Landing() {
  const { user } = useAuth();
  const ctaLabel = user ? "Open dashboard" : "Sign in";

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-lg font-semibold tracking-tight">Discipline</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild size="sm">
              <Link to={user ? "/dashboard" : "/auth"}>{ctaLabel}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Precision productivity
          </p>
          <h1 className="mt-4 max-w-[18ch] text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
            Make discipline the most rewarding habit you have.
          </h1>
          <p className="mt-6 max-w-[58ch] text-pretty text-lg text-muted-foreground">
            A checklist that shows your progress. Plan across day, week and month horizons, organise
            work into sectors, and watch completion and streaks turn consistency into visible
            progress.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Go to dashboard" : "Create your account"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={user ? "/analytics" : "/auth"}>
                {user ? "See analytics" : "Sign in"}
              </Link>
            </Button>
          </div>

          <dl className="mt-16 grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
            {[
              ["3 horizons", "Day, week and month planning in one place"],
              ["8 sectors", "Colour-threaded areas of life with progress rings"],
              ["Live analytics", "Completion percentage for every sector and segment"],
            ].map(([term, desc]) => (
              <div key={term}>
                <dt className="text-2xl font-semibold tracking-tight">{term}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-y border-border bg-card/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Built for momentum
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <article
                  key={f.title}
                  className="rounded-xl border border-border bg-card p-6 shadow-panel"
                >
                  <f.icon className="size-5 text-accent" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-balance text-3xl font-semibold tracking-tight">
            Your streak starts with one checked box.
          </h2>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Open the dashboard" : "Get started free"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
          Discipline — a local-first gamified checklist.
        </div>
      </footer>
    </div>
  );
}
