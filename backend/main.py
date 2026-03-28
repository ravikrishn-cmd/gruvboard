from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend.config import load_config
from backend.db import Database
from backend.models.schemas import HealthStatus, SSEHealthUpdate, SSEMetricsUpdate
from backend.routers.apps import create_apps_router
from backend.routers.events import create_events_router
from backend.routers.services import create_services_router
from backend.routers.system import router as system_router
from backend.services.health_checker import check_app_health
from backend.services.metrics_collector import collect_system_metrics
from backend.services.systemd_monitor import SystemdMonitor
from backend.utils.sse import EventBus

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def _resolve_config_path() -> Path:
    env_path = os.environ.get("GRUVBOARD_CONFIG")
    if env_path:
        return Path(env_path)
    return Path(__file__).parent.parent / "config.toml"


def _resolve_db_path() -> Path:
    return Path(__file__).parent.parent / "data" / "gruvboard.db"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    config_path = _resolve_config_path()
    logger.info("Loading config from %s", config_path)
    config = load_config(config_path)

    db = Database(_resolve_db_path())
    await db.initialize()

    systemd = SystemdMonitor()
    await systemd.connect()

    event_bus = EventBus()
    http_client = httpx.AsyncClient()
    insecure_client = httpx.AsyncClient(verify=False)
    health_cache: dict[str, HealthStatus] = {}

    # Register routers (must happen before static mount)
    app.include_router(system_router)
    app.include_router(create_apps_router(config, db, systemd, health_cache, http_client))
    app.include_router(create_services_router(config, systemd))
    app.include_router(create_events_router(event_bus))

    # Mount static files after routers so /api/* routes take priority
    static_dir = Path(__file__).parent / "static"
    if static_dir.exists():
        app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")

    # Background tasks
    async def health_check_loop():
        while True:
            for app_config in config.apps:
                try:
                    result = await check_app_health(app_config, http_client, insecure_client)
                    previous = health_cache.get(app_config.id)
                    health_cache[app_config.id] = result

                    await db.insert_health_check(
                        app_id=result.app_id,
                        status=result.status,
                        response_time_ms=result.response_time_ms,
                        status_code=result.status_code,
                        error_message=result.error_message,
                    )

                    if previous and previous.status != result.status:
                        await event_bus.publish(
                            "health_update",
                            SSEHealthUpdate(
                                app_id=result.app_id,
                                status=result.status,
                                response_time_ms=result.response_time_ms,
                                previous_status=previous.status,
                            ),
                        )
                except Exception as e:
                    logger.error("Health check error for %s: %s", app_config.id, e)
            await asyncio.sleep(config.dashboard.poll_interval_seconds)

    async def metrics_push_loop():
        while True:
            try:
                metrics = await collect_system_metrics()
                disk_percent = max((d.percent for d in metrics.disks), default=0.0)
                await event_bus.publish(
                    "metrics_update",
                    SSEMetricsUpdate(
                        cpu_percent=metrics.cpu_percent,
                        memory_percent=metrics.memory_percent,
                        disk_percent=disk_percent,
                        net_sent_bytes=metrics.net_sent_bytes,
                        net_recv_bytes=metrics.net_recv_bytes,
                    ),
                )

                await db.insert_system_metrics(
                    cpu_percent=metrics.cpu_percent,
                    memory_percent=metrics.memory_percent,
                    disk_percent=disk_percent,
                    net_sent_bytes=metrics.net_sent_bytes,
                    net_recv_bytes=metrics.net_recv_bytes,
                )
            except Exception as e:
                logger.error("Metrics collection error: %s", e)
            await asyncio.sleep(5)

    async def cleanup_loop():
        while True:
            try:
                deleted = await db.cleanup_old_records(config.dashboard.metrics_history_days)
                if deleted > 0:
                    logger.info("Cleaned up %d old records", deleted)
            except Exception as e:
                logger.error("Cleanup error: %s", e)
            await asyncio.sleep(3600)  # hourly

    # Subscribe to systemd state changes
    def on_state_change(unit: str, active: str, sub: str):
        from backend.models.schemas import SSEServiceStateChange

        asyncio.create_task(
            event_bus.publish(
                "service_state_change",
                SSEServiceStateChange(unit=unit, active_state=active, sub_state=sub),
            )
        )

    systemd.on_state_change(on_state_change)
    unit_names = [app.systemd_unit for app in config.apps]
    await systemd.subscribe_unit_changes(unit_names)

    tasks = [
        asyncio.create_task(health_check_loop()),
        asyncio.create_task(metrics_push_loop()),
        asyncio.create_task(cleanup_loop()),
    ]

    logger.info("GruvBoard started — monitoring %d apps", len(config.apps))

    yield

    # --- Shutdown ---
    for task in tasks:
        task.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)
    await http_client.aclose()
    await insecure_client.aclose()
    await systemd.disconnect()
    await db.close()
    logger.info("GruvBoard shut down")


app = FastAPI(title="GruvBoard", lifespan=lifespan)
