import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDiscipline } from "@/lib/discipline/store";
import { todayISO } from "@/lib/discipline/dates";
import type { Priority, Recurrence, Timeline } from "@/lib/discipline/types";

export function AddTaskDialog({
  timeline,
  trigger,
}: {
  timeline: Timeline;
  trigger?: React.ReactNode;
}) {
  const { sectors, segments, addTask } = useDiscipline();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [sectorId, setSectorId] = useState(sectors[0]?.id ?? "");
  const [segmentId, setSegmentId] = useState("none");
  const [tl, setTl] = useState<Timeline>(timeline);
  const [date, setDate] = useState(todayISO());
  const [dueTime, setDueTime] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [priority, setPriority] = useState<Priority>("medium");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState("");

  const activeSector = sectorId || sectors[0]?.id || "";
  const sectorSegments = segments.filter((s) => s.sectorId === activeSector);

  function reset() {
    setTitle("");
    setNotes("");
    setSegmentId("none");
    setDueTime("");
    setRecurrence("none");
    setPriority("medium");
    setSubtasks([]);
    setSubtaskDraft("");
    setDate(todayISO());
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (!activeSector) {
      toast.error("Create a sector first, then add tasks to it.");
      return;
    }
    addTask({
      title,
      notes,
      sectorId: activeSector,
      segmentId: segmentId === "none" ? undefined : segmentId,
      timeline: tl,
      date,
      dueTime,
      recurrence,
      priority,
      subtasks,
    });
    toast.success(`"${title.trim()}" added`);
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setTl(timeline);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="size-4" aria-hidden="true" />
            New task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>
            Set a timeline and sector, then break it into subtasks if it helps.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Finish thesis draft"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional detail"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-sector">Sector</Label>
              <Select
                value={activeSector}
                onValueChange={(v) => {
                  setSectorId(v);
                  setSegmentId("none");
                }}
              >
                <SelectTrigger id="task-sector">
                  <SelectValue placeholder="Choose a sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-segment">Segment</Label>
              <Select value={segmentId} onValueChange={setSegmentId}>
                <SelectTrigger id="task-segment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {sectorSegments.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-timeline">Timeline</Label>
              <Select value={tl} onValueChange={(v) => setTl(v as Timeline)}>
                <SelectTrigger id="task-timeline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-date">Date</Label>
              <Input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-time">Due time</Label>
              <Input
                id="task-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-recurrence">Repeats</Label>
              <Select value={recurrence} onValueChange={(v) => setRecurrence(v as Recurrence)}>
                <SelectTrigger id="task-recurrence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Never</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger id="task-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical — do this first</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-subtask">Subtasks</Label>
            {subtasks.length > 0 ? (
              <ul className="space-y-1">
                {subtasks.map((s, i) => (
                  <li
                    key={`${s}-${i}`}
                    className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm"
                  >
                    {s}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      aria-label={`Remove subtask ${s}`}
                      onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex gap-2">
              <Input
                id="task-subtask"
                value={subtaskDraft}
                onChange={(e) => setSubtaskDraft(e.target.value)}
                placeholder="Break it into steps"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!subtaskDraft.trim()) return;
                    setSubtasks([...subtasks, subtaskDraft.trim()]);
                    setSubtaskDraft("");
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!subtaskDraft.trim()) return;
                  setSubtasks([...subtasks, subtaskDraft.trim()]);
                  setSubtaskDraft("");
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Create task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}