import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/discipline/AppHeader";
import { ProgressRing, sectorColorVar } from "@/components/discipline/ProgressRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completionPct, SECTOR_COLORS, SECTOR_ICONS, useDiscipline } from "@/lib/discipline/store";
import { isSameWeek, todayISO } from "@/lib/discipline/dates";
import type { SectorColor } from "@/lib/discipline/types";

export const Route = createFileRoute("/_authenticated/sectors")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Sectors — Discipline" },
      {
        name: "description",
        content:
          "Organize your life into sectors and segments, and see completion health for each area this week.",
      },
      { property: "og:title", content: "My Sectors — Discipline" },
      {
        property: "og:description",
        content: "Track completion health across academics, work, fitness and personal sectors.",
      },
    ],
  }),
  component: SectorsPage,
});

function SectorsPage() {
  const {
    sectors,
    segments,
    tasks,
    addSector,
    updateSector,
    deleteSector,
    addSegment,
    deleteSegment,
  } = useDiscipline();
  const [name, setName] = useState("");
  const [color, setColor] = useState<SectorColor>("violet");
  const [icon, setIcon] = useState(SECTOR_ICONS[0] ?? "◆");
  const [segmentDrafts, setSegmentDrafts] = useState<Record<string, string>>({});
  const today = todayISO();

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">My Sectors</h1>
        <p className="mt-1 max-w-[60ch] text-muted-foreground">
          Sectors are your areas of life. Segments break a sector into focused threads. Health is
          measured across this week's tasks.
        </p>

        <form
          className="mt-8 flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-5 shadow-panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addSector(name, color, icon);
            toast.success(`Sector "${name.trim()}" added`);
            setName("");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="sector-name">New sector</Label>
            <Input
              id="sector-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Side Project"
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
                  className={`size-7 rounded-full transition-transform ${color === c ? "scale-110 ring-2 ring-ring ring-offset-2 ring-offset-card" : ""}`}
                  style={{ backgroundColor: sectorColorVar(c) }}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Icon</legend>
            <div className="flex gap-1">
              {SECTOR_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Use icon ${i}`}
                  aria-pressed={icon === i}
                  onClick={() => setIcon(i)}
                  className={`size-8 rounded-md border text-sm transition-colors ${icon === i ? "border-accent bg-accent/10" : "border-border"}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </fieldset>
          <Button type="submit">
            <Plus className="size-4" aria-hidden="true" />
            Add sector
          </Button>
        </form>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {sectors.map((sector) => {
            const weekTasks = tasks.filter(
              (t) => t.sectorId === sector.id && isSameWeek(t.date, today),
            );
            const pct = completionPct(weekTasks);
            const sectorSegments = segments.filter((s) => s.sectorId === sector.id);
            return (
              <section
                key={sector.id}
                className="rounded-xl border border-border bg-card p-5 shadow-panel"
              >
                <div className="flex items-start gap-4">
                  <ProgressRing
                    value={pct}
                    size={56}
                    stroke={9}
                    color={sector.color}
                    label={`${sector.name} ${pct}% complete this week`}
                  >
                    <span className="text-[11px] font-semibold">{pct}%</span>
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <h2 className="flex items-center gap-2 text-base font-semibold">
                      <span aria-hidden="true" style={{ color: sectorColorVar(sector.color) }}>
                        {sector.icon}
                      </span>
                      {sector.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {weekTasks.filter((t) => !t.done).length} open · {weekTasks.length} this week
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      {SECTOR_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-label={`Change ${sector.name} to ${c}`}
                          onClick={() => updateSector(sector.id, { color: c })}
                          className={`size-4 rounded-full ${sector.color === c ? "ring-2 ring-ring ring-offset-1 ring-offset-card" : ""}`}
                          style={{ backgroundColor: sectorColorVar(c) }}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete sector ${sector.name}`}
                    onClick={() => deleteSector(sector.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <ul className="mt-4 space-y-1">
                  {sectorSegments.map((seg) => (
                    <li
                      key={seg.id}
                      className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm"
                    >
                      {seg.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-destructive"
                        aria-label={`Delete segment ${seg.name}`}
                        onClick={() => deleteSegment(seg.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>

                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const draft = segmentDrafts[sector.id]?.trim();
                    if (!draft) return;
                    addSegment(sector.id, draft);
                    toast.success(`Segment "${draft}" added to ${sector.name}`);
                    setSegmentDrafts({ ...segmentDrafts, [sector.id]: "" });
                  }}
                >
                  <Input
                    value={segmentDrafts[sector.id] ?? ""}
                    onChange={(e) =>
                      setSegmentDrafts({ ...segmentDrafts, [sector.id]: e.target.value })
                    }
                    placeholder="Add a segment"
                    aria-label={`Add a segment to ${sector.name}`}
                    className="h-9"
                  />
                  <Button type="submit" variant="secondary" className="h-9">
                    Add
                  </Button>
                </form>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}