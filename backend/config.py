from __future__ import annotations

import tomllib
from pathlib import Path

from pydantic import BaseModel, Field


class DashboardConfig(BaseModel):
    title: str = "GruvBoard"
    host: str = "127.0.0.1"
    port: int = 9500
    poll_interval_seconds: int = 30
    metrics_history_days: int = 30


class AppConfig(BaseModel):
    id: str
    name: str
    icon: str = "box"
    url: str
    health_endpoint: str = "/"
    health_method: str = "GET"
    expected_status: int = 200
    systemd_unit: str
    widget: str = "generic"
    tags: list[str] = Field(default_factory=list)
    category: str = "Uncategorized"


class GruvBoardConfig(BaseModel):
    dashboard: DashboardConfig
    apps: list[AppConfig] = Field(default_factory=list)

    def apps_by_category(self) -> dict[str, list[AppConfig]]:
        result: dict[str, list[AppConfig]] = {}
        for app in self.apps:
            result.setdefault(app.category, []).append(app)
        return result

    def get_app(self, app_id: str) -> AppConfig | None:
        for app in self.apps:
            if app.id == app_id:
                return app
        return None


def load_config(path: Path) -> GruvBoardConfig:
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")
    with open(path, "rb") as f:
        raw = tomllib.load(f)
    return GruvBoardConfig.model_validate(raw)
