import { RingGauge } from "@/components/common/RingGauge";
import { formatBytes, formatUptime } from "@/lib/utils";
import type { SystemMetrics } from "@/types/system";

interface SystemBarProps {
  metrics: SystemMetrics | null;
}

export function SystemBar({ metrics }: SystemBarProps) {
  if (!metrics) {
    return (
      <div className="h-14 bg-grv-bg-hard border-b border-grv-bg2 flex items-center px-6">
        <span className="text-xs text-grv-fg3">Loading system metrics...</span>
      </div>
    );
  }

  const rootDisk = metrics.disks.find((d) => d.mountpoint === "/");
  const storageDisk = metrics.disks.find((d) => d.mountpoint === "/mnt/ai-storage");

  return (
    <div className="h-14 bg-grv-bg-hard border-b border-grv-bg2 flex items-center px-6 gap-5">
      {/* CPU */}
      <RingGauge
        value={metrics.cpu_percent}
        label="CPU"
        detail={`${metrics.cpu_count} cores`}
      />

      <div className="w-px h-7 bg-grv-bg2" />

      {/* RAM */}
      <RingGauge
        value={metrics.memory_percent}
        label="RAM"
        detail={`${formatBytes(metrics.memory_used_bytes)} / ${formatBytes(metrics.memory_total_bytes)}`}
      />

      <div className="w-px h-7 bg-grv-bg2" />

      {/* Root disk */}
      {rootDisk && (
        <RingGauge
          value={rootDisk.percent}
          label="Root"
          detail={`${formatBytes(rootDisk.used_bytes)} / ${formatBytes(rootDisk.total_bytes)}`}
        />
      )}

      <div className="w-px h-7 bg-grv-bg2" />

      {/* AI Storage disk */}
      {storageDisk && (
        <RingGauge
          value={storageDisk.percent}
          label="Storage"
          detail={`${formatBytes(storageDisk.used_bytes)} / ${formatBytes(storageDisk.total_bytes)}`}
        />
      )}

      {/* Right section */}
      <div className="ml-auto flex items-center gap-4">
        <div className="w-px h-7 bg-grv-bg2" />

        {/* Network */}
        <div className="flex flex-col gap-px font-mono">
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-grv-orange">&#x25B2;</span>
            <span className="text-grv-fg2">{formatBytes(metrics.net_sent_bytes)}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-grv-aqua">&#x25BC;</span>
            <span className="text-grv-fg2">{formatBytes(metrics.net_recv_bytes)}</span>
          </div>
        </div>

        <div className="w-px h-7 bg-grv-bg2" />

        {/* Load averages */}
        <div className="flex flex-col gap-px font-mono">
          <span className="text-[10px] text-grv-fg3">Load</span>
          <span className="text-[10px] text-grv-fg2">
            {metrics.load_avg.map((v) => v.toFixed(2)).join("  ")}
          </span>
        </div>

        <div className="w-px h-7 bg-grv-bg2" />

        {/* Uptime */}
        <span className="text-[11px] text-grv-fg3 font-mono">
          {formatUptime(metrics.uptime_seconds)}
        </span>
      </div>
    </div>
  );
}
