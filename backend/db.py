from __future__ import annotations

from pathlib import Path

import aiosqlite

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS health_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL,
    status TEXT NOT NULL,
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_checks_app_id ON health_checks(app_id);
CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at ON health_checks(checked_at);

CREATE TABLE IF NOT EXISTS system_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpu_percent REAL NOT NULL,
    memory_percent REAL NOT NULL,
    disk_percent REAL NOT NULL,
    net_sent_bytes INTEGER NOT NULL DEFAULT 0,
    net_recv_bytes INTEGER NOT NULL DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON system_metrics(recorded_at);
"""


class Database:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self._conn: aiosqlite.Connection | None = None

    async def initialize(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = await aiosqlite.connect(self.db_path)
        self._conn.row_factory = aiosqlite.Row
        await self._conn.executescript(SCHEMA_SQL)
        await self._conn.commit()

    async def close(self) -> None:
        if self._conn:
            await self._conn.close()
            self._conn = None

    @property
    def conn(self) -> aiosqlite.Connection:
        assert self._conn is not None, "Database not initialized"
        return self._conn

    async def fetch_all(self, query: str, params: tuple = ()) -> list[dict]:
        cursor = await self.conn.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

    async def insert_health_check(
        self,
        app_id: str,
        status: str,
        response_time_ms: int | None,
        status_code: int | None,
        error_message: str | None = None,
    ) -> None:
        await self.conn.execute(
            "INSERT INTO health_checks"
            " (app_id, status, response_time_ms, status_code, error_message)"
            " VALUES (?, ?, ?, ?, ?)",
            (app_id, status, response_time_ms, status_code, error_message),
        )
        await self.conn.commit()

    async def get_health_history(self, app_id: str, limit: int = 100) -> list[dict]:
        return await self.fetch_all(
            """SELECT * FROM health_checks
               WHERE app_id = ?
               ORDER BY checked_at DESC, id DESC
               LIMIT ?""",
            (app_id, limit),
        )

    async def insert_system_metrics(
        self,
        cpu_percent: float,
        memory_percent: float,
        disk_percent: float,
        net_sent_bytes: int,
        net_recv_bytes: int,
    ) -> None:
        await self.conn.execute(
            "INSERT INTO system_metrics"
            " (cpu_percent, memory_percent, disk_percent, net_sent_bytes, net_recv_bytes)"
            " VALUES (?, ?, ?, ?, ?)",
            (cpu_percent, memory_percent, disk_percent, net_sent_bytes, net_recv_bytes),
        )
        await self.conn.commit()

    async def get_system_metrics_history(self, limit: int = 100) -> list[dict]:
        return await self.fetch_all(
            """SELECT * FROM system_metrics
               ORDER BY recorded_at DESC
               LIMIT ?""",
            (limit,),
        )

    async def cleanup_old_records(self, retention_days: int) -> int:
        total = 0
        for table, col in [("health_checks", "checked_at"), ("system_metrics", "recorded_at")]:
            cursor = await self.conn.execute(
                f"DELETE FROM {table} WHERE {col} <= datetime('now', '-{retention_days} days')"
            )
            total += cursor.rowcount
        await self.conn.commit()
        return total
