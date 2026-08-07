import type { SectorColor } from "@/lib/discipline/types";

const COLOR_VAR: Record<SectorColor, string> = {
  emerald: "var(--sector-emerald)",
  azure: "var(--sector-azure)",
  orange: "var(--sector-orange)",
  rose: "var(--sector-rose)",
  violet: "var(--sector-violet)",
  amber: "var(--sector-amber)",
  teal: "var(--sector-teal)",
  slate: "var(--sector-slate)",
};

export function sectorColorVar(color: SectorColor) {
  return COLOR_VAR[color];
}

export function ProgressRing({
  value,
  size = 48,
  stroke = 8,
  color = "emerald",
  children,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: SectorColor;
  children?: React.ReactNode;
  label?: string;
}) {
  const r = 50 - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${value}% complete`}
    >
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={COLOR_VAR[color]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="ring-sweep"
        />
      </svg>
      {children ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
      ) : null}
    </div>
  );
}