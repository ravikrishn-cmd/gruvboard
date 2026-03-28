import { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import { api } from "@/lib/api";
import { formatBytes } from "@/lib/utils";
import { GenericWidget } from "./GenericWidget";
import type { WidgetProps } from "./types";

interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

interface OllamaRunning {
  name: string;
  size: number;
  size_vram: number;
  digest: string;
}

interface OllamaMetrics {
  version: string | null;
  models: OllamaModel[];
  running: OllamaRunning[];
}

export function OllamaWidget(props: WidgetProps) {
  const [metrics, setMetrics] = useState<OllamaMetrics | null>(null);

  useEffect(() => {
    api
      .getAppMetrics(props.app.id)
      .then((data) => setMetrics(data as unknown as OllamaMetrics))
      .catch(() => {});
  }, [props.app.id]);

  return (
    <div className="space-y-4">
      <GenericWidget {...props} />

      {metrics && (
        <div>
          <h3 className="text-sm font-medium text-grv-fg2 mb-2 flex items-center gap-1.5">
            <Brain className="h-4 w-4" />
            Ollama
          </h3>
          <div className="bg-grv-bg rounded-md p-3 space-y-3">
            {metrics.version && (
              <div className="text-xs text-grv-fg3">Version: {metrics.version}</div>
            )}

            {/* Running models */}
            {metrics.running.length > 0 && (
              <div>
                <span className="text-xs text-grv-fg3 mb-1 block">Running Models</span>
                <div className="space-y-1.5">
                  {metrics.running.map((model) => (
                    <div
                      key={model.digest}
                      className="flex items-center justify-between text-sm bg-grv-bg1 rounded px-2 py-1.5"
                    >
                      <span className="text-grv-fg font-mono text-xs">{model.name}</span>
                      <span className="text-grv-aqua text-xs font-mono">
                        {formatBytes(model.size_vram)} VRAM
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Installed models */}
            {metrics.models.length > 0 && (
              <div>
                <span className="text-xs text-grv-fg3 mb-1 block">
                  Installed Models ({metrics.models.length})
                </span>
                <div className="space-y-1">
                  {metrics.models.map((model) => (
                    <div
                      key={model.digest}
                      className="flex items-center justify-between text-xs text-grv-fg2 font-mono"
                    >
                      <span>{model.name}</span>
                      <span>{formatBytes(model.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {metrics.models.length === 0 && metrics.running.length === 0 && (
              <p className="text-xs text-grv-fg3">No models loaded</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
