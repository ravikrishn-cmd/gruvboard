import { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/common/StatusBadge";
import { HealthChart } from "./HealthChart";
import { ServiceControls } from "./ServiceControls";
import { useAppHistory } from "@/hooks/useAppHistory";
import { formatBytes, formatUptime, formatMs, cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { widgetRegistry } from "@/widgets/registry";
import type { AppStatus, AppConfig } from "@/types/app";

interface AppDrawerProps {
  app: AppStatus | null;
  appConfig: AppConfig | null;
  onClose: () => void;
}

export function AppDrawer({ app, appConfig, onClose }: AppDrawerProps) {
  const { history } = useAppHistory(app?.app_id ?? null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!app || !appConfig) return null;

  const activeState = app.systemd?.active_state ?? "unknown";
  const subState = app.systemd?.sub_state ?? "unknown";
  const memoryBytes = app.systemd?.memory_bytes;
  const activeEnterTs = app.systemd?.active_enter_timestamp;

  const uptimeStr =
    activeEnterTs && activeEnterTs > 0
      ? formatUptime(Date.now() / 1000 - activeEnterTs / 1_000_000)
      : "N/A";

  async function handleServiceAction(action: "start" | "stop" | "restart") {
    const method = action === "start" ? "startService" : action === "stop" ? "stopService" : "restartService";
    await api[method](appConfig!.systemd_unit);
  }

  // Look up custom widget
  const Widget = widgetRegistry[app.widget];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-grv-bg-hard/60 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-grv-bg1 border-l border-grv-bg2 z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-grv-bg2">
          <h2 className="text-lg font-semibold text-grv-fg">{app.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-grv-fg2 hover:text-grv-fg">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Status row */}
            <div className="flex items-center justify-between">
              <StatusBadge status={app.health.status} />
              <span className="text-sm text-grv-fg2 font-mono">
                Uptime: {uptimeStr}
              </span>
            </div>

            {/* Systemd info */}
            <div className="bg-grv-bg rounded-md p-3 space-y-1 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-grv-fg2">systemd:</span>
                <span className={cn(
                  activeState === "active" ? "text-grv-green" : activeState === "failed" ? "text-grv-red" : "text-grv-fg3"
                )}>
                  {activeState} ({subState})
                </span>
              </div>
              {memoryBytes != null && (
                <div className="flex justify-between">
                  <span className="text-grv-fg2">Memory:</span>
                  <span className="text-grv-fg1">{formatBytes(memoryBytes)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-grv-fg2">Response:</span>
                <span className="text-grv-fg1">{formatMs(app.health.response_time_ms)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <ServiceControls onAction={handleServiceAction} activeState={activeState} />
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-grv-blue hover:bg-grv-blue-dim/20"
                onClick={() => window.open(app.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Web UI
              </Button>
            </div>

            <Separator className="bg-grv-bg2" />

            {/* Response Time Chart */}
            <div>
              <h3 className="text-sm font-medium text-grv-fg2 mb-2">Response Time (Recent)</h3>
              <HealthChart history={history} />
            </div>

            <Separator className="bg-grv-bg2" />

            {/* Custom Widget */}
            {Widget && (
              <Widget
                app={appConfig}
                status={app}
                history={history}
                onServiceAction={handleServiceAction}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
