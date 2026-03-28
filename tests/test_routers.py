from pathlib import Path

import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.config import load_config
from backend.db import Database
from backend.models.schemas import HealthStatus
from backend.routers.apps import create_apps_router
from backend.routers.services import create_services_router
from backend.routers.system import router as system_router
from backend.services.systemd_monitor import SystemdMonitor


@pytest.fixture
def mock_systemd() -> SystemdMonitor:
    monitor = SystemdMonitor()
    monitor._available = False
    return monitor


@pytest.fixture
async def test_db(sample_db_path: Path) -> Database:
    db = Database(sample_db_path)
    await db.initialize()
    yield db
    await db.close()


@pytest.fixture
def test_app(sample_config_path: Path, test_db: Database, mock_systemd: SystemdMonitor) -> FastAPI:
    config = load_config(sample_config_path)
    health_cache: dict[str, HealthStatus] = {
        "test-app": HealthStatus(
            app_id="test-app", status="healthy", response_time_ms=42, status_code=200
        ),
    }
    http_client = httpx.AsyncClient()

    fastapi_app = FastAPI()
    fastapi_app.include_router(system_router)
    fastapi_app.include_router(
        create_apps_router(config, test_db, mock_systemd, health_cache, http_client)
    )
    fastapi_app.include_router(create_services_router(config, mock_systemd))
    return fastapi_app


@pytest.fixture
def client(test_app: FastAPI) -> TestClient:
    return TestClient(test_app)


def test_get_config(client: TestClient):
    resp = client.get("/api/config")
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "TestBoard"
    assert len(data["apps"]) == 2
    assert "AI & ML" in data["categories"]


def test_get_all_apps(client: TestClient):
    resp = client.get("/api/apps")
    assert resp.status_code == 200
    apps = resp.json()
    assert len(apps) == 2
    test_app = next(a for a in apps if a["app_id"] == "test-app")
    assert test_app["health"]["status"] == "healthy"


def test_get_single_app(client: TestClient):
    resp = client.get("/api/apps/test-app")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Test App"


def test_get_nonexistent_app(client: TestClient):
    resp = client.get("/api/apps/no-such-app")
    assert resp.status_code == 404


def test_get_system_metrics(client: TestClient):
    resp = client.get("/api/system")
    assert resp.status_code == 200
    data = resp.json()
    assert "cpu_percent" in data
    assert "memory_percent" in data


def test_service_action_forbidden_unit(client: TestClient):
    resp = client.post("/api/services/not-allowed.service/restart")
    assert resp.status_code == 403
