import { useState, useEffect } from "react";
import { formatUptime } from "@/lib/utils";
import type { SystemMetrics } from "@/types/system";

interface HeaderProps {
  title: string;
  metrics: SystemMetrics | null;
}

export function Header({ title, metrics }: HeaderProps) {
  return (
    <header className="h-14 border-b border-grv-bg2 bg-grv-bg1 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-grv-fg">{title}</h1>
      <div className="flex items-center gap-4 text-sm text-grv-fg2">
        {metrics && (
          <span className="font-mono">
            Uptime: {formatUptime(metrics.uptime_seconds)}
          </span>
        )}
        <Clock />
      </div>
    </header>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="font-mono tabular-nums">
      {time.toLocaleTimeString()}
    </span>
  );
}
