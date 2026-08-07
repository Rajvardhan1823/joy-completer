export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addDays(s: string, n: number): string {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Monday-based start of week */
export function startOfWeek(s: string): string {
  const d = parseISO(s);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return toISODate(d);
}

export function isSameWeek(a: string, b: string): boolean {
  return startOfWeek(a) === startOfWeek(b);
}

export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function formatPeriodLabel(date: string, timeline: "day" | "week" | "month"): string {
  const d = parseISO(date);
  if (timeline === "day") {
    return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  }
  if (timeline === "week") {
    const start = parseISO(startOfWeek(date));
    const end = parseISO(addDays(startOfWeek(date), 6));
    return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} — ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}