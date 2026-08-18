export type Timeline = "day" | "week" | "month";
export type Recurrence = "none" | "daily" | "weekdays" | "weekly";
export type Priority = "low" | "medium" | "high" | "critical";

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
  notes?: string | undefined;
  sectorId: string;
  segmentId?: string | undefined;
  timeline: Timeline;
  /** ISO date (yyyy-mm-dd) anchoring the task to a day/week/month */
  date: string;
  dueTime?: string | undefined;
  recurrence: Recurrence;
  priority: Priority;
  subtasks: Subtask[];
  done: boolean;
  completedAt?: string | undefined;
  createdAt: string;
}

export interface Stats {
  streak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  completedCount: number;
}

export interface DisciplineState {
  sectors: Sector[];
  segments: Segment[];
  tasks: Task[];
  stats: Stats;
  userName: string;
}