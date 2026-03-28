from fastapi import APIRouter

from backend.models.schemas import SystemMetrics
from backend.services.metrics_collector import collect_system_metrics

router = APIRouter(prefix="/api/system", tags=["system"])


@router.get("", response_model=SystemMetrics)
async def get_system_metrics():
    return await collect_system_metrics()
