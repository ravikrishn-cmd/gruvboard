from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.config import GruvBoardConfig
from backend.models.schemas import ServiceActionResponse
from backend.services.systemd_monitor import SystemdMonitor


def create_services_router(
    config: GruvBoardConfig, systemd: SystemdMonitor
) -> APIRouter:
    router = APIRouter(prefix="/api/services", tags=["services"])

    def _validate_unit(unit: str) -> None:
        """Only allow controlling units that are in our config."""
        allowed = {app.systemd_unit for app in config.apps}
        if unit not in allowed:
            raise HTTPException(
                status_code=403,
                detail=f"Unit '{unit}' is not managed by GruvBoard",
            )

    @router.post("/{unit}/start", response_model=ServiceActionResponse)
    async def start_service(unit: str):
        _validate_unit(unit)
        success = await systemd.start_unit(unit)
        return ServiceActionResponse(
            unit=unit,
            action="start",
            success=success,
            message="Started" if success else "Failed to start",
        )

    @router.post("/{unit}/stop", response_model=ServiceActionResponse)
    async def stop_service(unit: str):
        _validate_unit(unit)
        success = await systemd.stop_unit(unit)
        return ServiceActionResponse(
            unit=unit,
            action="stop",
            success=success,
            message="Stopped" if success else "Failed to stop",
        )

    @router.post("/{unit}/restart", response_model=ServiceActionResponse)
    async def restart_service(unit: str):
        _validate_unit(unit)
        success = await systemd.restart_unit(unit)
        return ServiceActionResponse(
            unit=unit,
            action="restart",
            success=success,
            message="Restarted" if success else "Failed to restart",
        )

    return router
