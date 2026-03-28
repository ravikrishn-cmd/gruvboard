export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  url: string;
  category: string;
  tags: string[];
  widget: string;
  systemd_unit: string; // empty string for non-systemd services (Docker)
}

export interface DashboardConfig {
  title: string;
  apps: AppConfig[];
  categories: string[];
}

export interface HealthStatus {
  app_id: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  response_time_ms: number | null;
  status_code: number | null;
  error_message: string | null;
  checked_at: string | null;
}

export interface SystemdUnitStatus {
  unit: string;
  active_state: string;
  sub_state: string;
  load_state: string;
  memory_bytes: number | null;
  cpu_usage_ns: number | null;
  active_enter_timestamp: number | null;
}

export interface AppStatus {
  app_id: string;
  name: string;
  icon: string;
  url: string;
  category: string;
  tags: string[];
  widget: string;
  health: HealthStatus;
  systemd: SystemdUnitStatus | null;
}

export interface HealthRecord {
  app_id: string;
  status: string;
  response_time_ms: number | null;
  status_code: number | null;
  error_message: string | null;
  checked_at: string;
}

export interface ServiceActionResponse {
  unit: string;
  action: string;
  success: boolean;
  message: string;
}
