from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException

from backend.config import GruvBoardConfig
from backend.db import Database
from backend.models.schemas import (
    AppConfigResponse,
    AppStatus,
    DashboardConfigResponse,
    HealthRecord,
    HealthStatus,
)
from backend.services.systemd_monitor import SystemdMonitor


def create_apps_router(
    config: GruvBoardConfig,
    db: Database,
    systemd: SystemdMonitor,
    health_cache: dict[str, HealthStatus],
    http_client: httpx.AsyncClient,
) -> APIRouter:
    router = APIRouter(prefix="/api", tags=["apps"])

    @router.get("/config", response_model=DashboardConfigResponse)
    async def get_config():
        categories = sorted(set(app.category for app in config.apps))
        return DashboardConfigResponse(
            title=config.dashboard.title,
            apps=[
                AppConfigResponse(
                    id=app.id,
                    name=app.name,
                    icon=app.icon,
                    url=app.url,
                    category=app.category,
                    tags=app.tags,
                    widget=app.widget,
                    systemd_unit=app.systemd_unit,
                )
                for app in config.apps
            ],
            categories=categories,
        )

    @router.get("/apps", response_model=list[AppStatus])
    async def get_all_apps():
        results = []
        for app in config.apps:
            health = health_cache.get(
                app.id,
                HealthStatus(app_id=app.id, status="unknown"),
            )
            systemd_status = (
                await systemd.get_unit_status(app.systemd_unit)
                if app.systemd_unit
                else None
            )
            results.append(
                AppStatus(
                    app_id=app.id,
                    name=app.name,
                    icon=app.icon,
                    url=app.url,
                    category=app.category,
                    tags=app.tags,
                    widget=app.widget,
                    health=health,
                    systemd=systemd_status,
                )
            )
        return results

    @router.get("/apps/{app_id}", response_model=AppStatus)
    async def get_app(app_id: str):
        app = config.get_app(app_id)
        if not app:
            raise HTTPException(status_code=404, detail=f"App '{app_id}' not found")
        health = health_cache.get(
            app_id,
            HealthStatus(app_id=app_id, status="unknown"),
        )
        systemd_status = (
            await systemd.get_unit_status(app.systemd_unit)
            if app.systemd_unit
            else None
        )
        return AppStatus(
            app_id=app.id,
            name=app.name,
            icon=app.icon,
            url=app.url,
            category=app.category,
            tags=app.tags,
            widget=app.widget,
            health=health,
            systemd=systemd_status,
        )

    @router.get("/apps/{app_id}/history", response_model=list[HealthRecord])
    async def get_app_history(app_id: str, limit: int = 100):
        app = config.get_app(app_id)
        if not app:
            raise HTTPException(status_code=404, detail=f"App '{app_id}' not found")
        rows = await db.get_health_history(app_id, limit=limit)
        return [
            HealthRecord(
                app_id=row["app_id"],
                status=row["status"],
                response_time_ms=row["response_time_ms"],
                status_code=row["status_code"],
                error_message=row.get("error_message"),
                checked_at=row["checked_at"],
            )
            for row in rows
        ]

    @router.get("/apps/{app_id}/metrics")
    async def get_app_metrics(app_id: str):
        """Proxy app-specific metrics from the app's own API."""
        app = config.get_app(app_id)
        if not app:
            raise HTTPException(status_code=404, detail=f"App '{app_id}' not found")

        if app.widget == "ollama":
            from backend.services.app_apis.ollama import get_ollama_metrics

            return await get_ollama_metrics(app.url, http_client)
        elif app.widget == "caddy":
            from backend.services.app_apis.caddy import get_caddy_metrics

            return await get_caddy_metrics(app.url, http_client)
        else:
            return {"message": "No custom metrics available for this app"}

    return router
