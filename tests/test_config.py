from pathlib import Path
import pytest
from backend.config import load_config, DashboardConfig, AppConfig, GruvBoardConfig


def test_load_config_returns_gruvboard_config(sample_config_path: Path):
    config = load_config(sample_config_path)
    assert isinstance(config, GruvBoardConfig)


def test_load_config_dashboard_fields(sample_config_path: Path):
    config = load_config(sample_config_path)
    assert config.dashboard.title == "TestBoard"
    assert config.dashboard.host == "127.0.0.1"
    assert config.dashboard.port == 9500
    assert config.dashboard.poll_interval_seconds == 30
    assert config.dashboard.metrics_history_days == 7


def test_load_config_apps_parsed(sample_config_path: Path):
    config = load_config(sample_config_path)
    assert len(config.apps) == 2
    assert config.apps[0].id == "test-app"
    assert config.apps[1].id == "ollama"


def test_load_config_app_fields(sample_config_path: Path):
    config = load_config(sample_config_path)
    app = config.apps[0]
    assert app.name == "Test App"
    assert app.icon == "box"
    assert app.url == "http://localhost:8080"
    assert app.health_endpoint == "/health"
    assert app.health_method == "GET"
    assert app.expected_status == 200
    assert app.systemd_unit == "test-app.service"
    assert app.widget == "generic"
    assert app.tags == ["test"]
    assert app.category == "Testing"


def test_load_config_invalid_path_raises():
    with pytest.raises(FileNotFoundError):
        load_config(Path("/nonexistent/config.toml"))


def test_load_config_missing_required_field(tmp_path: Path):
    config = tmp_path / "bad.toml"
    config.write_text("""
[dashboard]
title = "Test"

[[apps]]
id = "broken-app"
""")
    with pytest.raises(Exception):
        load_config(config)


def test_get_apps_by_category(sample_config_path: Path):
    config = load_config(sample_config_path)
    by_cat = config.apps_by_category()
    assert "Testing" in by_cat
    assert "AI & ML" in by_cat
    assert len(by_cat["Testing"]) == 1
    assert len(by_cat["AI & ML"]) == 1


def test_get_app_by_id(sample_config_path: Path):
    config = load_config(sample_config_path)
    app = config.get_app("test-app")
    assert app is not None
    assert app.name == "Test App"
    assert config.get_app("nonexistent") is None
