from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


class EventBus:
    """Simple pub/sub event bus for SSE streaming."""

    def __init__(self):
        self._subscribers: list[asyncio.Queue[dict[str, Any]]] = []

    def subscribe(self) -> asyncio.Queue[dict[str, Any]]:
        queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=100)
        self._subscribers.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue[dict[str, Any]]) -> None:
        self._subscribers = [q for q in self._subscribers if q is not queue]

    async def publish(self, event_type: str, data: Any) -> None:
        if hasattr(data, "model_dump"):
            payload = data.model_dump()
        elif isinstance(data, dict):
            payload = data
        else:
            payload = {"value": data}

        message = {"event": event_type, "data": json.dumps(payload)}
        dead_queues = []
        for queue in self._subscribers:
            try:
                queue.put_nowait(message)
            except asyncio.QueueFull:
                dead_queues.append(queue)
                logger.warning("Dropping slow SSE subscriber")
        for q in dead_queues:
            self.unsubscribe(q)

    @property
    def subscriber_count(self) -> int:
        return len(self._subscribers)
