from __future__ import annotations

import logging

import httpx

logger = logging.getLogger(__name__)


async def get_ollama_metrics(base_url: str, client: httpx.AsyncClient) -> dict:
    result: dict = {"models": [], "running": [], "version": None}
    try:
        version_resp = await client.get(f"{base_url}/api/version", timeout=5.0)
        if version_resp.status_code == 200:
            result["version"] = version_resp.json().get("version")
    except Exception as e:
        logger.warning("Failed to get Ollama version: %s", e)

    try:
        tags_resp = await client.get(f"{base_url}/api/tags", timeout=5.0)
        if tags_resp.status_code == 200:
            result["models"] = tags_resp.json().get("models", [])
    except Exception as e:
        logger.warning("Failed to get Ollama models: %s", e)

    try:
        ps_resp = await client.get(f"{base_url}/api/ps", timeout=5.0)
        if ps_resp.status_code == 200:
            result["running"] = ps_resp.json().get("models", [])
    except Exception as e:
        logger.warning("Failed to get Ollama running models: %s", e)

    return result
