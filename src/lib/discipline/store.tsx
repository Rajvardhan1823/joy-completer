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
  Difficulty,
  Sector,
  SectorColor,
  Segment,
  Task,
  Timeline,
} from "./types";
import { addDays, isSameMonth, isSameWeek, startOfWeek, todayISO } from "./dates";

const STORAGE_KEY = "discipline.state.v1";

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

export const DIFFICULTY_XP: Record<Difficulty, number> = {
  easy: 10,
  normal: 25,
  hard: 50,
};

export const SUBTASK_XP = 5;

export function taskXp(task: Task): number {
  return DIFFICULTY_XP[task.difficulty] + task.subtasks.length * SUBTASK_XP;
}

export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}

export function xpForLevel(level: number): number {
  return 50 * Math.pow(level - 1, 2);
}

export function levelProgress(xp: number) {
  const level = levelForXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return {
    level,
    into: xp - floor,
    span: ceil - floor,
    pct: Math.min(100, Math.round(((xp - floor) / (ceil - floor)) * 100)),
  };
}

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
      difficulty: "normal",
      recurrence: "daily",
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
      difficulty: "hard",
      recurrence: "none",
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
      difficulty: "hard",
      recurrence: "none",
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
      difficulty: "easy",
      recurrence: "none",
      subtasks: [],
      done: false,
      createdAt: today,
    },
  ];
  return {
    sectors,
    segments,
    tasks,
    stats: { xp: 0, streak: 0, longestStreak: 0, lastCompletionDate: null },
    userName: "there",
  };
}

/** Roll recurring tasks forward into the current period. */
function normalize(state: DisciplineState): DisciplineState {
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
  lastReward: { xp: number; perfectDay: boolean; key: number } | null;
}

export interface NewTaskInput {
  title: string;
  notes?: string | undefined;
  sectorId: string;
  segmentId?: string | undefined;
  timeline: Timeline;
  date: string;
  dueTime?: string | undefined;
  difficulty: Difficulty;
  recurrence: Recurrence;
  subtasks: string[];
}

type Recurrence = Task["recurrence"];

const DisciplineContext = createContext<Ctx | null>(null);

export function DisciplineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DisciplineState>(() => seed());
  const [ready, setReady] = useState(false);
  const [lastReward, setLastReward] = useState<Ctx["lastReward"]>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setState(normalize(raw ? (JSON.parse(raw) as DisciplineState) : seed()));
    } catch {
      setState(seed());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, ready]);

  const awardXp = useCallback((s: DisciplineState, amount: number): DisciplineState => {
    const today = todayISO();
    const stats = { ...s.stats };
    stats.xp = Math.max(0, stats.xp + amount);
    if (amount > 0 && stats.lastCompletionDate !== today) {
      stats.streak = stats.lastCompletionDate === addDays(today, -1) ? stats.streak + 1 : 1;
      stats.lastCompletionDate = today;
      stats.longestStreak = Math.max(stats.longestStreak, stats.streak);
    }
    return { ...s, stats };
  }, []);

  const toggleTask = useCallback(
    (id: string) => {
      setState((prev) => {
        const task = prev.tasks.find((t) => t.id === id);
        if (!task) return prev;
        const nowDone = !task.done;
        const gained = nowDone ? taskXp(task) : -taskXp(task);
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
        const next = awardXp({ ...prev, tasks }, gained);
        if (nowDone) {
          const today = todayISO();
          const todays = tasks.filter((t) => t.timeline === "day" && t.date === today);
          const perfect = todays.length > 1 && todays.every((t) => t.done);
          setLastReward({ xp: taskXp(task), perfectDay: perfect, key: Date.now() });
        }
        return next;
      });
    },
    [awardXp],
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
        if (nowDone) setLastReward({ xp: SUBTASK_XP, perfectDay: false, key: Date.now() });
        return awardXp({ ...prev, tasks }, nowDone ? SUBTASK_XP : -SUBTASK_XP);
      });
    },
    [awardXp],
  );

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      lastReward,
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
              difficulty: input.difficulty,
              recurrence: input.recurrence,
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
    [state, ready, lastReward, toggleTask, toggleSubtask],
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
    if (timeline === "day") return t.date === anchor;
    if (timeline === "week") return isSameWeek(t.date, anchor);
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