from __future__ import annotations

from pydantic import BaseModel

# --- System Metrics ---

class DiskInfo(BaseModel):
    mountpoint: str
    device: str
    total_bytes: int
    used_bytes: int
    free_bytes: int
    percent: float


class SystemMetrics(BaseModel):
    cpu_percent: float
    cpu_count: int
    memory_percent: float
    memory_total_bytes: int
    memory_used_bytes: int
    memory_available_bytes: int
    disks: list[DiskInfo]
    net_sent_bytes: int
    net_recv_bytes: int
    uptime_seconds: float
    load_avg: tuple[float, float, float]


# --- App Health ---

class HealthStatus(BaseModel):
    app_id: str
    status: str  # "healthy", "degraded", "unhealthy", "unknown"
    response_time_ms: int | None = None
    status_code: int | None = None
    error_message: str | None = None
    checked_at: str | None = None


class SystemdUnitStatus(BaseModel):
    unit: str
    active_state: str
    sub_state: str
    load_state: str
    memory_bytes: int | None = None
    cpu_usage_ns: int | None = None
    active_enter_timestamp: int | None = None


class AppStatus(BaseModel):
    app_id: str
    name: str
    icon: str
    url: str
    category: str
    tags: list[str]
    widget: str
    health: HealthStatus
    systemd: SystemdUnitStatus | None = None


class HealthRecord(BaseModel):
    app_id: str
    status: str
    response_time_ms: int | None = None
    status_code: int | None = None
    error_message: str | None = None
    checked_at: str


# --- Config response ---

class AppConfigResponse(BaseModel):
    id: str
    name: str
    icon: str
    url: str
    category: str
    tags: list[str]
    widget: str
    systemd_unit: str


class DashboardConfigResponse(BaseModel):
    title: str
    apps: list[AppConfigResponse]
    categories: list[str]


# --- Service actions ---

class ServiceActionResponse(BaseModel):
    unit: str
    action: str
    success: bool
    message: str


# --- SSE Events ---

class SSEHealthUpdate(BaseModel):
    app_id: str
    status: str
    response_time_ms: int | None = None
    previous_status: str | None = None


class SSEMetricsUpdate(BaseModel):
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    net_sent_bytes: int
    net_recv_bytes: int


class SSEServiceStateChange(BaseModel):
    unit: str
    active_state: str
    sub_state: str


class SSEAlert(BaseModel):
    level: str  # "warning", "critical"
    message: str
    app_id: str | None = None
