import type { Sector, Task } from "./types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toUtcStamp(date: Date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

/** Start/end for a task: timed event when dueTime is set, otherwise an all-day event. */
function taskWindow(task: Task) {
  if (task.dueTime) {
    const [h, m] = task.dueTime.split(":").map(Number);
    const start = new Date(`${task.date}T00:00:00`);
    start.setHours(h ?? 9, m ?? 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { start, end, allDay: false as const };
  }
  const start = new Date(`${task.date}T00:00:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end, allDay: true as const };
}

function dateOnly(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

const RRULE: Record<Task["recurrence"], string | null> = {
  none: null,
  daily: "RRULE:FREQ=DAILY",
  weekdays: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
  weekly: "RRULE:FREQ=WEEKLY",
};

export function buildICS(tasks: Task[], sectors: Sector[]): string {
  const stamp = toUtcStamp(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Discipline//Tasks//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Discipline",
  ];

  for (const task of tasks) {
    const sector = sectors.find((s) => s.id === task.sectorId);
    const { start, end, allDay } = taskWindow(task);
    const details = [
      sector ? `Sector: ${sector.name}` : null,
      `Priority: ${task.priority ?? "medium"}`,
      task.notes || null,
      task.subtasks.length ? `Steps: ${task.subtasks.map((s) => s.title).join(" • ")}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${task.id}@discipline.app`);
    lines.push(`DTSTAMP:${stamp}`);
    if (allDay) {
      lines.push(`DTSTART;VALUE=DATE:${dateOnly(start)}`);
      lines.push(`DTEND;VALUE=DATE:${dateOnly(end)}`);
    } else {
      lines.push(`DTSTART:${toUtcStamp(start)}`);
      lines.push(`DTEND:${toUtcStamp(end)}`);
    }
    lines.push(`SUMMARY:${escapeText(task.title)}`);
    if (details) lines.push(`DESCRIPTION:${escapeText(details)}`);
    const rule = RRULE[task.recurrence];
    if (rule) lines.push(rule);
    lines.push(`STATUS:${task.done ? "COMPLETED" : "CONFIRMED"}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(tasks: Task[], sectors: Sector[], filename = "discipline.ics") {
  const blob = new Blob([buildICS(tasks, sectors)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** One-click "add to Google Calendar" link for a single task. */
export function googleCalendarUrl(task: Task, sector?: Sector): string {
  const { start, end, allDay } = taskWindow(task);
  const dates = allDay
    ? `${dateOnly(start)}/${dateOnly(end)}`
    : `${toUtcStamp(start)}/${toUtcStamp(end)}`;
  const details = [sector ? `Sector: ${sector.name}` : null, task.notes || null]
    .filter(Boolean)
    .join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: task.title,
    dates,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
