export type Timeline = "day" | "week" | "month";
export type Difficulty = "easy" | "normal" | "hard";
export type Recurrence = "none" | "daily" | "weekdays" | "weekly";

export type SectorColor =
  | "emerald"
  | "azure"
  | "orange"
  | "rose"
  | "violet"
  | "amber"
  | "teal"
  | "slate";

export interface Sector {
  id: string;
  name: string;
  color: SectorColor;
  icon: string;
}

export interface Segment {
  id: string;
  sectorId: string;
  name: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  sectorId: string;
  segmentId?: string;
  timeline: Timeline;
  /** ISO date (yyyy-mm-dd) anchoring the task to a day/week/month */
  date: string;
  dueTime?: string;
  difficulty: Difficulty;
  recurrence: Recurrence;
  subtasks: Subtask[];
  done: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Stats {
  xp: number;
  streak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
}

export interface DisciplineState {
  sectors: Sector[];
  segments: Segment[];
  tasks: Task[];
  stats: Stats;
  userName: string;
}