import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { DashboardConfig, AppStatus } from "@/types/app";
import type { SSEHealthUpdate, SSEServiceStateChange } from "@/types/events";

export function useApps() {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [apps, setApps] = useState<AppStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getConfig(), api.getApps()])
      .then(([cfg, appList]) => {
        setConfig(cfg);
        setApps(appList);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleHealthUpdate = useCallback((data: SSEHealthUpdate) => {
    setApps((prev) =>
      prev.map((app) =>
        app.app_id === data.app_id
          ? {
              ...app,
              health: {
                ...app.health,
                status: data.status as AppStatus["health"]["status"],
                response_time_ms: data.response_time_ms,
              },
            }
          : app
      )
    );
  }, []);

  const handleServiceStateChange = useCallback((data: SSEServiceStateChange) => {
    setApps((prev) =>
      prev.map((app) =>
        app.systemd?.unit === data.unit
          ? {
              ...app,
              systemd: app.systemd
                ? { ...app.systemd, active_state: data.active_state, sub_state: data.sub_state }
                : null,
            }
          : app
      )
    );
  }, []);

  return { config, apps, loading, error, handleHealthUpdate, handleServiceStateChange };
}
