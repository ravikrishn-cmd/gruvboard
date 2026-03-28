import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { SystemMetrics } from "@/types/system";
import type { SSEMetricsUpdate } from "@/types/events";

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getSystemMetrics().then(setMetrics).catch((e) => setError(e.message));
  }, []);

  const handleSSEUpdate = useCallback((data: SSEMetricsUpdate) => {
    setMetrics((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cpu_percent: data.cpu_percent,
        memory_percent: data.memory_percent,
        net_sent_bytes: data.net_sent_bytes,
        net_recv_bytes: data.net_recv_bytes,
      };
    });
  }, []);

  return { metrics, error, handleSSEUpdate };
}
