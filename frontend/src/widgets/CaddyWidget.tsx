import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { api } from "@/lib/api";
import { GenericWidget } from "./GenericWidget";
import type { WidgetProps } from "./types";

interface CaddyUpstream {
  address: string;
  num_requests: number;
  fails: number;
}

interface CaddyMetrics {
  config: Record<string, unknown> | null;
  upstreams: CaddyUpstream[];
}

export function CaddyWidget(props: WidgetProps) {
  const [metrics, setMetrics] = useState<CaddyMetrics | null>(null);

  useEffect(() => {
    api
      .getAppMetrics(props.app.id)
      .then((data) => setMetrics(data as unknown as CaddyMetrics))
      .catch(() => {});
  }, [props.app.id]);

  return (
    <div className="space-y-4">
      <GenericWidget {...props} />

      {metrics && (
        <div>
          <h3 className="text-sm font-medium text-grv-fg2 mb-2 flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            Caddy Reverse Proxy
          </h3>
          <div className="bg-grv-bg rounded-md p-3 space-y-3">
            {/* Upstreams */}
            {metrics.upstreams.length > 0 ? (
              <div>
                <span className="text-xs text-grv-fg3 mb-1 block">Upstreams</span>
                <div className="space-y-1.5">
                  {metrics.upstreams.map((upstream) => (
                    <div
                      key={upstream.address}
                      className="flex items-center justify-between text-xs bg-grv-bg1 rounded px-2 py-1.5"
                    >
                      <span className="text-grv-fg font-mono">{upstream.address}</span>
                      <div className="flex gap-3">
                        <span className="text-grv-aqua">
                          {upstream.num_requests} req
                        </span>
                        {upstream.fails > 0 && (
                          <span className="text-grv-red">{upstream.fails} fails</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-grv-fg3">No upstream data available</p>
            )}

            {/* Config present indicator */}
            {metrics.config && (
              <div className="text-xs text-grv-fg3">
                Config loaded ({Object.keys(metrics.config).length} top-level keys)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
