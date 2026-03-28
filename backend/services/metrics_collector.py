from __future__ import annotations

import asyncio
import time

import psutil

from backend.models.schemas import DiskInfo, SystemMetrics


async def collect_system_metrics() -> SystemMetrics:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _collect_sync)


def _collect_sync() -> SystemMetrics:
    cpu_percent = psutil.cpu_percent(interval=0.1)
    cpu_count = psutil.cpu_count() or 1
    mem = psutil.virtual_memory()
    net = psutil.net_io_counters()
    boot_time = psutil.boot_time()
    load_avg = psutil.getloadavg()

    disks: list[DiskInfo] = []
    for partition in psutil.disk_partitions(all=False):
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            disks.append(
                DiskInfo(
                    mountpoint=partition.mountpoint,
                    device=partition.device,
                    total_bytes=usage.total,
                    used_bytes=usage.used,
                    free_bytes=usage.free,
                    percent=usage.percent,
                )
            )
        except PermissionError:
            continue

    return SystemMetrics(
        cpu_percent=cpu_percent,
        cpu_count=cpu_count,
        memory_percent=mem.percent,
        memory_total_bytes=mem.total,
        memory_used_bytes=mem.used,
        memory_available_bytes=mem.available,
        disks=disks,
        net_sent_bytes=net.bytes_sent,
        net_recv_bytes=net.bytes_recv,
        uptime_seconds=time.time() - boot_time,
        load_avg=load_avg,
    )
