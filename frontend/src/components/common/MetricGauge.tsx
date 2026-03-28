import { cn } from "@/lib/utils";

interface MetricGaugeProps {
  label: string;
  value: number;
  unit?: string;
}

function getColorClass(value: number): string {
  if (value >= 90) return "bg-grv-red";
  if (value >= 75) return "bg-grv-orange";
  if (value >= 50) return "bg-grv-yellow";
  return "bg-grv-green";
}

export function MetricGauge({ label, value, unit = "%" }: MetricGaugeProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-grv-fg2 w-10 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-grv-bg2 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColorClass(value))}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-grv-fg1 w-10 text-right font-mono">
        {value.toFixed(0)}{unit}
      </span>
    </div>
  );
}
