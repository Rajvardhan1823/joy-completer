import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  DisciplineState,
  Sector,
  SectorColor,
  Segment,
  Task,
  Timeline,
  Priority,
} from "./types";
import { addDays, isSameMonth, isSameWeek, startOfWeek, todayISO } from "./dates";
import { useAuth } from "@/lib/auth";

const STORAGE_KEY = "discipline.state.v1";

function storageKey(userId: string | null) {
  return userId ? `${STORAGE_KEY}.${userId}` : STORAGE_KEY;
}

export const SECTOR_COLORS: SectorColor[] = [
  "emerald",
  "azure",
  "orange",
  "rose",
  "violet",
  "amber",
  "teal",
  "slate",
];

export const SECTOR_ICONS = ["◆", "▲", "●", "■", "★", "✦", "❖", "▮"];

const uid = () => Math.random().toString(36).slice(2, 10);

function seed(): DisciplineState {
  const today = todayISO();
  const sectors: Sector[] = [
    { id: "s-acad", name: "Academics", color: "azure", icon: "◆" },
    { id: "s-fit", name: "Fitness", color: "emerald", icon: "▲" },
    { id: "s-work", name: "Work Project", color: "orange", icon: "■" },
    { id: "s-personal", name: "Personal", color: "rose", icon: "●" },
  ];
  const segments: Segment[] = [
    { id: "g-thesis", sectorId: "s-acad", name: "Thesis" },
    { id: "g-exam", sectorId: "s-acad", name: "Exam Prep" },
    { id: "g-strength", sectorId: "s-fit", name: "Strength" },
  ];
  const tasks: Task[] = [
    {
      id: uid(),
      title: "Morning 5k trail run",
      sectorId: "s-fit",
      segmentId: undefined,
      timeline: "day",
      date: today,
      recurrence: "daily",
      priority: "medium",
      subtasks: [],
      done: false,
      createdAt: today,
    },
    {
      id: uid(),
      title: "Draft research thesis chapter",
      notes: "Focus on the methodology section",
      sectorId: "s-acad",
      segmentId: "g-thesis",
      timeline: "day",
      date: today,
      recurrence: "none",
      priority: "high",
      subtasks: [
        { id: uid(), title: "Outline methodology chapter", done: false },
        { id: uid(), title: "Format bibliography", done: false },
      ],
      done: false,
      createdAt: today,
    },
    {
      id: uid(),
      title: "Complete quarterly performance audit",
      notes: "Review all contributor metrics for Q3",
      sectorId: "s-work",
      timeline: "week",
      date: today,
      dueTime: "16:00",
      recurrence: "none",
      priority: "critical",
      subtasks: [{ id: uid(), title: "Export CSV for finance", done: false }],
      done: false,
      createdAt: today,
    },
    {
      id: uid(),
      title: "Plan next month's reading list",
      sectorId: "s-personal",
      timeline: "month",
      date: today,
      recurrence: "none",
      priority: "medium",
      subtasks: [],
      done: false,
      createdAt: today,
    },
  ];
  return {
    sectors,
    segments,
    tasks,
    stats: { streak: 0, longestStreak: 0, lastCompletionDate: null, completedCount: 0 },
    userName: "there",
  };
}

/** Migrate older saved shapes (XP-era) into the current one. */
function migrate(raw: DisciplineState): DisciplineState {
  const s = raw.stats ?? ({} as DisciplineState["stats"]);
  return {
    sectors: raw.sectors ?? [],
    segments: raw.segments ?? [],
    tasks: (raw.tasks ?? []).map((t) => ({
      ...t,
      subtasks: t.subtasks ?? [],
      priority: t.priority ?? "medium",
    })),
    stats: {
      streak: s.streak ?? 0,
      longestStreak: s.longestStreak ?? 0,
      lastCompletionDate: s.lastCompletionDate ?? null,
      completedCount:
        typeof s.completedCount === "number"
          ? s.completedCount
          : (raw.tasks ?? []).filter((t) => t.done).length,
    },
    userName: raw.userName ?? "there",
  };
}

/** Roll recurring tasks forward into the current period. */
function normalize(input: DisciplineState): DisciplineState {
  const state = migrate(input);
  const today = todayISO();
  let changed = false;
  const tasks = state.tasks.map((t) => {
    if (t.recurrence === "none" || t.date >= today) return t;
    if (t.recurrence === "weekly" && isSameWeek(t.date, today)) return t;
    if (t.recurrence === "weekdays") {
      const dow = new Date().getDay();
      if (dow === 0 || dow === 6) return t;
    }
    changed = true;
    return {
      ...t,
      date: today,
      done: false,
      completedAt: undefined,
      subtasks: t.subtasks.map((s) => ({ ...s, done: false })),
    };
  });

  // break the streak if a full day was missed
  let stats = state.stats;
  const last = stats.lastCompletionDate;
  if (last && last !== today && last !== addDays(today, -1) && stats.streak > 0) {
    stats = { ...stats, streak: 0 };
    changed = true;
  }
  return changed ? { ...state, tasks, stats } : state;
}

interface Ctx extends DisciplineState {
  ready: boolean;
  addTask: (input: NewTaskInput) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  moveTask: (id: string, timeline: Timeline) => void;
  addSector: (name: string, color: SectorColor, icon: string) => void;
  updateSector: (id: string, patch: Partial<Sector>) => void;
  deleteSector: (id: string) => void;
  addSegment: (sectorId: string, name: string) => void;
  deleteSegment: (id: string) => void;
  setUserName: (name: string) => void;
}

export interface NewTaskInput {
  title: string;
  notes?: string | undefined;
  sectorId: string;
  segmentId?: string | undefined;
  timeline: Timeline;
  date: string;
  dueTime?: string | undefined;
  recurrence: Recurrence;
  priority: Priority;
  subtasks: string[];
}

type Recurrence = Task["recurrence"];

const DisciplineContext = createContext<Ctx | null>(null);

export function DisciplineProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState<DisciplineState>(() => seed());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    setReady(false);
    try {
      const raw = window.localStorage.getItem(storageKey(userId));
      setState(normalize(raw ? (JSON.parse(raw) as DisciplineState) : seed()));
    } catch {
      setState(seed());
    }
    setReady(true);
  }, [userId, loading]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(storageKey(userId), JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, ready, userId]);

  /** Track completion counts and keep the daily streak alive. */
  const registerCompletion = useCallback(
    (s: DisciplineState, delta: number): DisciplineState => {
      const today = todayISO();
      const stats = { ...s.stats };
      stats.completedCount = Math.max(0, stats.completedCount + delta);
      if (delta > 0 && stats.lastCompletionDate !== today) {
        stats.streak = stats.lastCompletionDate === addDays(today, -1) ? stats.streak + 1 : 1;
        stats.lastCompletionDate = today;
        stats.longestStreak = Math.max(stats.longestStreak, stats.streak);
      }
      return { ...s, stats };
    },
    [],
  );

  const toggleTask = useCallback(
    (id: string) => {
      setState((prev) => {
        const task = prev.tasks.find((t) => t.id === id);
        if (!task) return prev;
        const nowDone = !task.done;
        const tasks = prev.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                done: nowDone,
                completedAt: nowDone ? new Date().toISOString() : undefined,
                subtasks: nowDone ? t.subtasks.map((s) => ({ ...s, done: true })) : t.subtasks,
              }
            : t,
        );
        return registerCompletion({ ...prev, tasks }, nowDone ? 1 : -1);
      });
    },
    [registerCompletion],
  );

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      setState((prev) => {
        const task = prev.tasks.find((t) => t.id === taskId);
        const sub = task?.subtasks.find((s) => s.id === subtaskId);
        if (!task || !sub) return prev;
        const nowDone = !sub.done;
        const tasks = prev.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, done: nowDone } : s,
                ),
              }
            : t,
        );
        return registerCompletion({ ...prev, tasks }, nowDone ? 1 : -1);
      });
    },
    [registerCompletion],
  );

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      toggleTask,
      toggleSubtask,
      addTask: (input) =>
        setState((prev) => ({
          ...prev,
          tasks: [
            {
              id: uid(),
              title: input.title.trim(),
              notes: input.notes?.trim() || undefined,
              sectorId: input.sectorId,
              segmentId: input.segmentId,
              timeline: input.timeline,
              date: input.date,
              dueTime: input.dueTime || undefined,
              recurrence: input.recurrence,
              priority: input.priority,
              subtasks: input.subtasks
                .map((s) => s.trim())
                .filter(Boolean)
                .map((title) => ({ id: uid(), title, done: false })),
              done: false,
              createdAt: todayISO(),
            },
            ...prev.tasks,
          ],
        })),
      updateTask: (id, patch) =>
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTask: (id) =>
        setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) })),
      addSubtask: (taskId, title) =>
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: [...t.subtasks, { id: uid(), title, done: false }] }
              : t,
          ),
        })),
      moveTask: (id, timeline) =>
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, timeline } : t)),
        })),
      addSector: (name, color, icon) =>
        setState((prev) => ({
          ...prev,
          sectors: [...prev.sectors, { id: uid(), name: name.trim(), color, icon }],
        })),
      updateSector: (id, patch) =>
        setState((prev) => ({
          ...prev,
          sectors: prev.sectors.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      deleteSector: (id) =>
        setState((prev) => ({
          ...prev,
          sectors: prev.sectors.filter((s) => s.id !== id),
          segments: prev.segments.filter((s) => s.sectorId !== id),
          tasks: prev.tasks.filter((t) => t.sectorId !== id),
        })),
      addSegment: (sectorId, name) =>
        setState((prev) => ({
          ...prev,
          segments: [...prev.segments, { id: uid(), sectorId, name: name.trim() }],
        })),
      deleteSegment: (id) =>
        setState((prev) => ({
          ...prev,
          segments: prev.segments.filter((s) => s.id !== id),
          tasks: prev.tasks.map((t) => (t.segmentId === id ? { ...t, segmentId: undefined } : t)),
        })),
      setUserName: (name) => setState((prev) => ({ ...prev, userName: name })),
    }),
    [state, ready, toggleTask, toggleSubtask],
  );

  return <DisciplineContext.Provider value={value}>{children}</DisciplineContext.Provider>;
}

export function useDiscipline(): Ctx {
  const ctx = useContext(DisciplineContext);
  if (!ctx) throw new Error("useDiscipline must be used within DisciplineProvider");
  return ctx;
}

export function tasksInPeriod(tasks: Task[], timeline: Timeline, anchor: string): Task[] {
  return tasks.filter((t) => {
    if (timeline === "day") return t.timeline === "day" && t.date === anchor;
    if (timeline === "week") return t.timeline !== "month" && isSameWeek(t.date, anchor);
    return isSameMonth(t.date, anchor);
  });
}

export function completionPct(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const units = tasks.reduce((acc, t) => acc + 1 + t.subtasks.length, 0);
  const done = tasks.reduce(
    (acc, t) => acc + (t.done ? 1 : 0) + t.subtasks.filter((s) => s.done).length,
    0,
  );
  return Math.round((done / units) * 100);
}

export { startOfWeek };
export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

/** Incomplete first, then by priority, then by due time. */
export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      (a.dueTime ?? "99:99").localeCompare(b.dueTime ?? "99:99"),
  );
}
