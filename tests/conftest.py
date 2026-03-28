from pathlib import Path
import pytest

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def sample_config_path(tmp_path: Path) -> Path:
    config = tmp_path / "config.toml"
    config.write_text('''
[dashboard]
title = "TestBoard"
host = "127.0.0.1"
port = 9500
poll_interval_seconds = 30
metrics_history_days = 7

[[apps]]
id = "test-app"
name = "Test App"
icon = "box"
url = "http://localhost:8080"
health_endpoint = "/health"
health_method = "GET"
expected_status = 200
systemd_unit = "test-app.service"
widget = "generic"
tags = ["test"]
category = "Testing"

[[apps]]
id = "ollama"
name = "Ollama"
icon = "brain"
url = "http://localhost:11434"
health_endpoint = "/api/version"
health_method = "GET"
expected_status = 200
systemd_unit = "ollama.service"
widget = "ollama"
tags = ["ai", "llm"]
category = "AI & ML"
''')
    return config


@pytest.fixture
def sample_db_path(tmp_path: Path) -> Path:
    return tmp_path / "gruvboard.db"
