export interface DiskInfo {
  mountpoint: string;
  device: string;
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  percent: number;
}

export interface SystemMetrics {
  cpu_percent: number;
  cpu_count: number;
  memory_percent: number;
  memory_total_bytes: number;
  memory_used_bytes: number;
  memory_available_bytes: number;
  disks: DiskInfo[];
  net_sent_bytes: number;
  net_recv_bytes: number;
  uptime_seconds: number;
  load_avg: [number, number, number];
}
