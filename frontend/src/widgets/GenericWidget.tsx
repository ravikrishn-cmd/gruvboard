import { formatBytes, formatMs } from "@/lib/utils";
import { SparkLine } from "@/components/common/SparkLine";
import type { WidgetProps } from "./types";

export function GenericWidget({ status, history }: WidgetProps) {
  const responseTimes = history
    .slice(0, 30)
    .reverse()
    .map((r) => r.response_time_ms ?? 0);

  return (
    <div>
      <h3 className="text-sm font-medium text-grv-fg2 mb-2">Overview</h3>
      <div className="bg-grv-bg rounded-md p-3 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-grv-fg3 text-xs">Status</span>
            <p className="text-grv-fg font-mono">{status.health.status}</p>
          </div>
          <div>
            <span className="text-grv-fg3 text-xs">Response</span>
            <p className="text-grv-fg font-mono">{formatMs(status.health.response_time_ms)}</p>
          </div>
          {status.systemd?.memory_bytes != null && (
            <div>
              <span className="text-grv-fg3 text-xs">Memory</span>
              <p className="text-grv-fg font-mono">{formatBytes(status.systemd.memory_bytes)}</p>
            </div>
          )}
          <div>
            <span className="text-grv-fg3 text-xs">systemd</span>
            <p className="text-grv-fg font-mono">
              {status.systemd?.active_state ?? "unknown"} ({status.systemd?.sub_state ?? "?"})
            </p>
          </div>
        </div>
        {responseTimes.length > 2 && (
          <div>
            <span className="text-grv-fg3 text-xs">Response Trend</span>
            <SparkLine data={responseTimes} height={32} />
          </div>
        )}
      </div>
    </div>
  );
}
