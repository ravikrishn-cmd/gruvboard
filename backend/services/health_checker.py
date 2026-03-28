from __future__ import annotations

import logging
import time
from datetime import datetime, timezone

import httpx

from backend.config import AppConfig
from backend.models.schemas import HealthStatus

logger = logging.getLogger(__name__)

DEGRADED_THRESHOLD_MS = 2000
UNHEALTHY_THRESHOLD_MS = 5000


def determine_health_status(
    status_code: int, expected_status: int, response_time_ms: int
) -> str:
    if status_code != expected_status:
        return "unhealthy"
    if response_time_ms >= UNHEALTHY_THRESHOLD_MS:
        return "unhealthy"
    if response_time_ms >= DEGRADED_THRESHOLD_MS:
        return "degraded"
    return "healthy"


async def check_app_health(
    app: AppConfig,
    client: httpx.AsyncClient,
    insecure_client: httpx.AsyncClient | None = None,
) -> HealthStatus:
    now = datetime.now(timezone.utc).isoformat()
    try:
        start = time.monotonic()
        base_url = app.effective_health_url
        use_client = insecure_client if (not app.verify_ssl and insecure_client) else client
        response = await use_client.request(
            method=app.health_method,
            url=f"{base_url}{app.health_endpoint}",
            timeout=10.0,
        )
        elapsed_ms = int((time.monotonic() - start) * 1000)

        status = determine_health_status(
            status_code=response.status_code,
            expected_status=app.expected_status,
            response_time_ms=elapsed_ms,
        )

        return HealthStatus(
            app_id=app.id,
            status=status,
            response_time_ms=elapsed_ms,
            status_code=response.status_code,
            checked_at=now,
        )
    except Exception as e:
        logger.warning("Health check failed for %s: %s", app.id, e)
        return HealthStatus(
            app_id=app.id,
            status="unhealthy",
            error_message=str(e),
            checked_at=now,
        )
