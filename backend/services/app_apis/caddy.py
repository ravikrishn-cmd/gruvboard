from __future__ import annotations

import logging

import httpx

logger = logging.getLogger(__name__)


async def get_caddy_metrics(base_url: str, client: httpx.AsyncClient) -> dict:
    result: dict = {"config": None, "upstreams": []}
    try:
        config_resp = await client.get(f"{base_url}/config/", timeout=5.0)
        if config_resp.status_code == 200:
            result["config"] = config_resp.json()
    except Exception as e:
        logger.warning("Failed to get Caddy config: %s", e)

    try:
        upstream_resp = await client.get(
            f"{base_url}/reverse_proxy/upstreams", timeout=5.0
        )
        if upstream_resp.status_code == 200:
            result["upstreams"] = upstream_resp.json()
    except Exception as e:
        logger.warning("Failed to get Caddy upstreams: %s", e)

    return result
