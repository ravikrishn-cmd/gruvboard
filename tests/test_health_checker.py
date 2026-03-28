from unittest.mock import AsyncMock, MagicMock

import pytest

from backend.config import AppConfig
from backend.services.health_checker import check_app_health, determine_health_status


@pytest.fixture
def app_config() -> AppConfig:
    return AppConfig(
        id="test",
        name="Test",
        url="http://localhost:8080",
        health_endpoint="/health",
        health_method="GET",
        expected_status=200,
        systemd_unit="test.service",
    )


def test_determine_health_status_healthy():
    status = determine_health_status(status_code=200, expected_status=200, response_time_ms=100)
    assert status == "healthy"


def test_determine_health_status_degraded():
    status = determine_health_status(status_code=200, expected_status=200, response_time_ms=3000)
    assert status == "degraded"


def test_determine_health_status_unhealthy_wrong_status():
    status = determine_health_status(status_code=500, expected_status=200, response_time_ms=100)
    assert status == "unhealthy"


def test_determine_health_status_unhealthy_timeout():
    status = determine_health_status(status_code=200, expected_status=200, response_time_ms=6000)
    assert status == "unhealthy"


async def test_check_app_health_success(app_config: AppConfig):
    mock_response = MagicMock()
    mock_response.status_code = 200

    mock_client = AsyncMock()
    mock_client.request = AsyncMock(return_value=mock_response)

    result = await check_app_health(app_config, mock_client)
    assert result.status in ("healthy", "degraded")
    assert result.status_code == 200
    assert result.app_id == "test"


async def test_check_app_health_failure(app_config: AppConfig):
    mock_client = AsyncMock()
    mock_client.request = AsyncMock(side_effect=Exception("Connection refused"))

    result = await check_app_health(app_config, mock_client)
    assert result.status == "unhealthy"
    assert result.error_message is not None
    assert "Connection refused" in result.error_message
