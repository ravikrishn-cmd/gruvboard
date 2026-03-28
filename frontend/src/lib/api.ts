import type { DashboardConfig, AppStatus, HealthRecord, ServiceActionResponse } from "@/types/app";
import type { SystemMetrics } from "@/types/system";

const BASE = "/api";

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(`${BASE}${url}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function postJSON<T>(url: string): Promise<T> {
  const response = await fetch(`${BASE}${url}`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getConfig: () => fetchJSON<DashboardConfig>("/config"),
  getApps: () => fetchJSON<AppStatus[]>("/apps"),
  getApp: (id: string) => fetchJSON<AppStatus>(`/apps/${id}`),
  getAppHistory: (id: string, limit = 100) =>
    fetchJSON<HealthRecord[]>(`/apps/${id}/history?limit=${limit}`),
  getAppMetrics: (id: string) => fetchJSON<Record<string, unknown>>(`/apps/${id}/metrics`),
  getSystemMetrics: () => fetchJSON<SystemMetrics>("/system"),
  startService: (unit: string) => postJSON<ServiceActionResponse>(`/services/${unit}/start`),
  stopService: (unit: string) => postJSON<ServiceActionResponse>(`/services/${unit}/stop`),
  restartService: (unit: string) => postJSON<ServiceActionResponse>(`/services/${unit}/restart`),
};
