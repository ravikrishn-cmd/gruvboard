from __future__ import annotations

import asyncio
from typing import AsyncGenerator

from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

from backend.utils.sse import EventBus


def create_events_router(event_bus: EventBus) -> APIRouter:
    router = APIRouter(tags=["events"])

    @router.get("/api/events")
    async def event_stream(request: Request) -> EventSourceResponse:
        async def generate() -> AsyncGenerator[dict, None]:
            queue = event_bus.subscribe()
            try:
                while True:
                    if await request.is_disconnected():
                        break
                    try:
                        message = await asyncio.wait_for(queue.get(), timeout=30.0)
                        yield message
                    except asyncio.TimeoutError:
                        # Send keepalive comment
                        yield {"comment": "keepalive"}
            finally:
                event_bus.unsubscribe(queue)

        return EventSourceResponse(generate())

    return router
