import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useDiscipline } from "@/lib/discipline/store";

export function RewardToast() {
  const { lastReward } = useDiscipline();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastReward) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(t);
  }, [lastReward]);

  if (!lastReward || !visible) return null;

  return (
    <div
      key={lastReward.key}
      role="status"
      aria-live="polite"
      className="animate-reward pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-panel">
        <Sparkles className="size-4 text-accent" aria-hidden="true" />
        <span className="text-sm font-semibold">+{lastReward.xp} XP</span>
        {lastReward.perfectDay ? (
          <span className="text-sm font-medium opacity-80">Perfect day — every task cleared</span>
        ) : null}
      </div>
    </div>
  );
}