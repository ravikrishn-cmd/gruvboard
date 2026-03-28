import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  size?: "sm" | "md";
}

const statusConfig = {
  healthy: { label: "Healthy", dotClass: "bg-grv-green", textClass: "text-grv-green" },
  degraded: { label: "Degraded", dotClass: "bg-grv-yellow", textClass: "text-grv-yellow" },
  unhealthy: { label: "Down", dotClass: "bg-grv-red", textClass: "text-grv-red" },
  unknown: { label: "Unknown", dotClass: "bg-grv-fg3", textClass: "text-grv-fg3" },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5", size === "sm" ? "text-xs" : "text-sm")}>
      <span className={cn("inline-block rounded-full", config.dotClass, size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")} />
      <span className={config.textClass}>{config.label}</span>
    </span>
  );
}
