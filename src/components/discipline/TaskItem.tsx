import { useState } from "react";
import { Check, Clock, Plus, Repeat, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sectorColorVar } from "./ProgressRing";
import { useDiscipline } from "@/lib/discipline/store";
import type { Task, Timeline } from "@/lib/discipline/types";

const RECURRENCE_LABEL: Record<Task["recurrence"], string> = {
  none: "",
  daily: "Daily",
  weekdays: "Weekdays",
  weekly: "Weekly",
};

export function TaskItem({ task }: { task: Task }) {
  const { sectors, segments, toggleTask, toggleSubtask, addSubtask, deleteTask, moveTask } =
    useDiscipline();
  const [newSubtask, setNewSubtask] = useState("");
  const sector = sectors.find((s) => s.id === task.sectorId);
  const segment = segments.find((s) => s.id === task.segmentId);
  const accent = sector ? sectorColorVar(sector.color) : "var(--sector-slate)";

  return (
    <li className={`group py-4 ${task.done ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => toggleTask(task.id)}
          aria-pressed={task.done}
          aria-label={task.done ? `Mark ${task.title} as not done` : `Complete ${task.title}`}
          className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 border-border transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          style={task.done ? { backgroundColor: accent, borderColor: accent } : undefined}
        >
          {task.done ? <Check className="animate-pop size-3.5 text-background" /> : null}
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={`text-base font-medium ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}
          >
            {task.title}
          </h3>
          {task.notes ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{task.notes}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="grid size-3.5 place-items-center rounded-full text-[8px] text-background"
                style={{ backgroundColor: accent }}
              >
                {sector?.icon}
              </span>
              <span className="text-foreground/70">
                {sector?.name ?? "Unassigned"}
                {segment ? ` · ${segment.name}` : ""}
              </span>
            </span>
            {task.dueTime ? (
              <span className="flex items-center gap-1">
                <Clock className="size-3" aria-hidden="true" />
                {task.dueTime}
              </span>
            ) : null}
            {task.recurrence !== "none" ? (
              <span className="flex items-center gap-1">
                <Repeat className="size-3" aria-hidden="true" />
                {RECURRENCE_LABEL[task.recurrence]}
              </span>
            ) : null}
            {task.subtasks.length > 0 ? (
              <span
                className="rounded px-1.5 py-0.5 font-semibold"
                style={{
                  color: accent,
                  backgroundColor: `color-mix(in oklab, ${accent} 12%, transparent)`,
                }}
              >
                {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} steps
              </span>
            ) : null}
          </div>

          {task.subtasks.length > 0 ? (
            <ul className="mt-3 space-y-2 border-l-2 border-border pl-4">
              {task.subtasks.map((sub) => (
                <li key={sub.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSubtask(task.id, sub.id)}
                    aria-pressed={sub.done}
                    aria-label={sub.done ? `Undo ${sub.title}` : `Complete ${sub.title}`}
                    className="grid size-4 shrink-0 place-items-center rounded border border-border transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    style={sub.done ? { backgroundColor: accent, borderColor: accent } : undefined}
                  >
                    {sub.done ? <Check className="animate-pop size-3 text-background" /> : null}
                  </button>
                  <span
                    className={`text-sm ${sub.done ? "text-muted-foreground line-through" : "text-foreground/80"}`}
                  >
                    {sub.title}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <form
            className="mt-3 flex items-center gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newSubtask.trim()) return;
              addSubtask(task.id, newSubtask.trim());
              setNewSubtask("");
            }}
          >
            <Input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add a subtask"
              aria-label={`Add a subtask to ${task.title}`}
              className="h-8 max-w-56 text-sm"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-8">
              <Plus className="size-3.5" aria-hidden="true" />
              Add
            </Button>
          </form>
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <Select value={task.timeline} onValueChange={(v) => moveTask(task.id, v as Timeline)}>
            <SelectTrigger
              className="h-8 w-24 text-xs"
              aria-label={`Timeline for ${task.title}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            aria-label={`Delete ${task.title}`}
            onClick={() => deleteTask(task.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}