from backend.models.schemas import SystemMetrics
from backend.services.metrics_collector import collect_system_metrics


async def test_collect_system_metrics_returns_model():
    metrics = await collect_system_metrics()
    assert isinstance(metrics, SystemMetrics)


async def test_collect_system_metrics_has_cpu():
    metrics = await collect_system_metrics()
    assert 0.0 <= metrics.cpu_percent <= 100.0


async def test_collect_system_metrics_has_memory():
    metrics = await collect_system_metrics()
    assert 0.0 <= metrics.memory_percent <= 100.0
    assert metrics.memory_total_bytes > 0
    assert metrics.memory_used_bytes >= 0


async def test_collect_system_metrics_has_disk():
    metrics = await collect_system_metrics()
    assert len(metrics.disks) >= 1
    for disk in metrics.disks:
        assert disk.mountpoint
        assert disk.total_bytes > 0


async def test_collect_system_metrics_has_network():
    metrics = await collect_system_metrics()
    assert metrics.net_sent_bytes >= 0
    assert metrics.net_recv_bytes >= 0


async def test_collect_system_metrics_has_uptime():
    metrics = await collect_system_metrics()
    assert metrics.uptime_seconds > 0
