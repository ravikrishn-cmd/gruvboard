import { MetricGauge } from "@/components/common/MetricGauge";
import { formatBytes } from "@/lib/utils";
import type { SystemMetrics } from "@/types/system";

interface SystemBarProps {
  metrics: SystemMetrics | null;
}

export function SystemBar({ metrics }: SystemBarProps) {
  if (!metrics) {
    return (
      <div className="h-8 bg-grv-bg-hard border-b border-grv-bg2 flex items-center px-6">
        <span className="text-xs text-grv-fg3">Loading system metrics...</span>
      </div>
    );
  }

  const maxDisk = metrics.disks.reduce((max, d) => Math.max(max, d.percent), 0);

  return (
    <div className="h-8 bg-grv-bg-hard border-b border-grv-bg2 flex items-center px-6 gap-6">
      <MetricGauge label="CPU" value={metrics.cpu_percent} />
      <MetricGauge label="RAM" value={metrics.memory_percent} />
      <MetricGauge label="Disk" value={maxDisk} />
      <div className="flex items-center gap-2 text-xs text-grv-fg2 ml-auto">
        <span className="font-mono">
          Net: {formatBytes(metrics.net_sent_bytes)} sent / {formatBytes(metrics.net_recv_bytes)} recv
        </span>
      </div>
    </div>
  );
}
