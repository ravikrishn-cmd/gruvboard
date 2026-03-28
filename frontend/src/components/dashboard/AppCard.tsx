import { ExternalLink } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatMs } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AppStatus } from "@/types/app";

interface AppCardProps {
  app: AppStatus;
  onClick: () => void;
}

const borderColors = {
  healthy: "border-l-grv-green",
  degraded: "border-l-grv-yellow",
  unhealthy: "border-l-grv-red",
  unknown: "border-l-grv-fg3",
};

function getIcon(iconName: string) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  // Convert kebab-case to PascalCase
  const pascalName = iconName
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return icons[pascalName] || LucideIcons.Box;
}

export function AppCard({ app, onClick }: AppCardProps) {
  const Icon = getIcon(app.icon);
  const systemdState = app.systemd?.active_state ?? "unknown";

  return (
    <Card
      className={cn(
        "bg-grv-bg1 border-grv-bg2 border-l-4 cursor-pointer hover:bg-grv-bg2 transition-colors p-4",
        borderColors[app.health.status]
      )}
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-9 h-9 rounded-md bg-grv-bg2 flex items-center justify-center">
            <Icon className="h-5 w-5 text-grv-blue" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-grv-fg truncate">{app.name}</h3>
            <StatusBadge status={app.health.status} size="sm" />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 text-grv-fg2 hover:text-grv-blue hover:bg-grv-bg3"
          onClick={(e) => {
            e.stopPropagation();
            window.open(app.url, "_blank");
          }}
          title="Open in new tab"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-grv-fg2">
        <span className="font-mono">{formatMs(app.health.response_time_ms)}</span>
        <span className={cn(
          "font-mono",
          systemdState === "active" ? "text-grv-green" : systemdState === "failed" ? "text-grv-red" : "text-grv-fg3"
        )}>
          {systemdState}
        </span>
      </div>
    </Card>
  );
}
