from pathlib import Path

import pytest

from backend.db import Database


@pytest.fixture
async def db(sample_db_path: Path) -> Database:
    database = Database(sample_db_path)
    await database.initialize()
    yield database
    await database.close()


async def test_initialize_creates_tables(db: Database):
    tables = await db.fetch_all("SELECT name FROM sqlite_master WHERE type='table'")
    table_names = {row["name"] for row in tables}
    assert "health_checks" in table_names
    assert "system_metrics" in table_names


async def test_insert_health_check(db: Database):
    await db.insert_health_check(
        app_id="test-app",
        status="healthy",
        response_time_ms=42,
        status_code=200,
    )
    rows = await db.fetch_all("SELECT * FROM health_checks WHERE app_id = 'test-app'")
    assert len(rows) == 1
    assert rows[0]["status"] == "healthy"
    assert rows[0]["response_time_ms"] == 42


async def test_get_health_history(db: Database):
    for i in range(5):
        await db.insert_health_check(
            app_id="test-app",
            status="healthy",
            response_time_ms=40 + i,
            status_code=200,
        )
    history = await db.get_health_history("test-app", limit=3)
    assert len(history) == 3
    # Most recent first
    assert history[0]["response_time_ms"] == 44


async def test_insert_system_metrics(db: Database):
    await db.insert_system_metrics(
        cpu_percent=23.5,
        memory_percent=48.2,
        disk_percent=67.0,
        net_sent_bytes=1000,
        net_recv_bytes=2000,
    )
    rows = await db.fetch_all("SELECT * FROM system_metrics")
    assert len(rows) == 1
    assert rows[0]["cpu_percent"] == 23.5


async def test_get_system_metrics_history(db: Database):
    for i in range(3):
        await db.insert_system_metrics(
            cpu_percent=20.0 + i,
            memory_percent=45.0,
            disk_percent=60.0,
            net_sent_bytes=1000 * i,
            net_recv_bytes=2000 * i,
        )
    history = await db.get_system_metrics_history(limit=2)
    assert len(history) == 2


async def test_cleanup_old_records(db: Database):
    await db.insert_health_check(
        app_id="old-app", status="healthy", response_time_ms=10, status_code=200
    )
    # Cleanup with 0 days retention should remove everything
    deleted = await db.cleanup_old_records(retention_days=0)
    assert deleted > 0
    rows = await db.fetch_all("SELECT * FROM health_checks")
    assert len(rows) == 0
