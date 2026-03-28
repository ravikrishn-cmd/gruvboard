export interface SSEHealthUpdate {
  app_id: string;
  status: string;
  response_time_ms: number | null;
  previous_status: string | null;
}

export interface SSEMetricsUpdate {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  net_sent_bytes: number;
  net_recv_bytes: number;
}

export interface SSEServiceStateChange {
  unit: string;
  active_state: string;
  sub_state: string;
}

export interface SSEAlert {
  level: "warning" | "critical";
  message: string;
  app_id: string | null;
}

export type SSEEventType =
  | "health_update"
  | "metrics_update"
  | "service_state_change"
  | "alert";
