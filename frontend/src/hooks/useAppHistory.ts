import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { HealthRecord } from "@/types/app";

export function useAppHistory(appId: string | null, limit = 100) {
  const [history, setHistory] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appId) {
      setHistory([]);
      return;
    }
    setLoading(true);
    api
      .getAppHistory(appId, limit)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [appId, limit]);

  return { history, loading };
}
