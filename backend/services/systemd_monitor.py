from __future__ import annotations

import logging
from typing import Callable

from backend.models.schemas import SystemdUnitStatus

logger = logging.getLogger(__name__)

# Type alias for state change callback
StateChangeCallback = Callable[[str, str, str], None]


class SystemdMonitor:
    def __init__(self):
        self._bus = None
        self._manager = None
        self._unit_paths: dict[str, str] = {}
        self._callbacks: list[StateChangeCallback] = []
        self._available = False

    @property
    def available(self) -> bool:
        return self._available

    async def connect(self) -> None:
        try:
            from dbus_next import BusType
            from dbus_next.aio import MessageBus

            self._bus = await MessageBus(bus_type=BusType.SYSTEM).connect()
            introspection = await self._bus.introspect(
                "org.freedesktop.systemd1", "/org/freedesktop/systemd1"
            )
            proxy = self._bus.get_proxy_object(
                "org.freedesktop.systemd1",
                "/org/freedesktop/systemd1",
                introspection,
            )
            self._manager = proxy.get_interface("org.freedesktop.systemd1.Manager")
            self._available = True
            logger.info("Connected to systemd D-Bus")
        except Exception as e:
            logger.warning("Could not connect to systemd D-Bus: %s", e)
            self._available = False

    async def disconnect(self) -> None:
        if self._bus:
            self._bus.disconnect()
            self._bus = None
            self._manager = None
            self._available = False

    def on_state_change(self, callback: StateChangeCallback) -> None:
        self._callbacks.append(callback)

    async def get_unit_path(self, unit_name: str) -> str | None:
        if not self._available or not self._manager:
            return None
        if unit_name in self._unit_paths:
            return self._unit_paths[unit_name]
        try:
            path = await self._manager.call_load_unit(unit_name)
            self._unit_paths[unit_name] = path
            return path
        except Exception as e:
            logger.warning("Could not load unit %s: %s", unit_name, e)
            return None

    async def get_unit_status(self, unit_name: str) -> SystemdUnitStatus:
        if not self._available or not self._bus:
            return SystemdUnitStatus(
                unit=unit_name,
                active_state="unknown",
                sub_state="unknown",
                load_state="unknown",
            )

        try:
            unit_path = await self.get_unit_path(unit_name)
            if not unit_path:
                return SystemdUnitStatus(
                    unit=unit_name,
                    active_state="unknown",
                    sub_state="unknown",
                    load_state="not-found",
                )

            introspection = await self._bus.introspect(
                "org.freedesktop.systemd1", unit_path
            )
            proxy = self._bus.get_proxy_object(
                "org.freedesktop.systemd1", unit_path, introspection
            )
            unit_iface = proxy.get_interface("org.freedesktop.systemd1.Unit")
            service_iface = proxy.get_interface("org.freedesktop.systemd1.Service")

            active_state = await unit_iface.get_active_state()
            sub_state = await unit_iface.get_sub_state()
            load_state = await unit_iface.get_load_state()
            active_enter_ts = await unit_iface.get_active_enter_timestamp()

            memory_bytes = None
            cpu_usage_ns = None
            try:
                memory_bytes = await service_iface.get_memory_current()
                if memory_bytes == 2**64 - 1:  # systemd returns max uint64 when N/A
                    memory_bytes = None
            except Exception:
                pass
            try:
                cpu_usage_ns = await service_iface.get_cpu_usage_n_sec()
                if cpu_usage_ns == 2**64 - 1:
                    cpu_usage_ns = None
            except Exception:
                pass

            return SystemdUnitStatus(
                unit=unit_name,
                active_state=active_state,
                sub_state=sub_state,
                load_state=load_state,
                memory_bytes=memory_bytes,
                cpu_usage_ns=cpu_usage_ns,
                active_enter_timestamp=active_enter_ts,
            )
        except Exception as e:
            logger.warning("Error getting status for %s: %s", unit_name, e)
            return SystemdUnitStatus(
                unit=unit_name,
                active_state="unknown",
                sub_state="unknown",
                load_state="error",
            )

    async def start_unit(self, unit_name: str) -> bool:
        if not self._available or not self._manager:
            return False
        try:
            await self._manager.call_start_unit(unit_name, "replace")
            return True
        except Exception as e:
            logger.error("Failed to start %s: %s", unit_name, e)
            return False

    async def stop_unit(self, unit_name: str) -> bool:
        if not self._available or not self._manager:
            return False
        try:
            await self._manager.call_stop_unit(unit_name, "replace")
            return True
        except Exception as e:
            logger.error("Failed to stop %s: %s", unit_name, e)
            return False

    async def restart_unit(self, unit_name: str) -> bool:
        if not self._available or not self._manager:
            return False
        try:
            await self._manager.call_restart_unit(unit_name, "replace")
            return True
        except Exception as e:
            logger.error("Failed to restart %s: %s", unit_name, e)
            return False

    async def subscribe_unit_changes(self, unit_names: list[str]) -> None:
        """Subscribe to PropertiesChanged signals for the given units."""
        if not self._available or not self._bus:
            return
        try:
            await self._manager.call_subscribe()
        except Exception as e:
            logger.warning("Could not subscribe to systemd signals: %s", e)
            return

        for unit_name in unit_names:
            unit_path = await self.get_unit_path(unit_name)
            if not unit_path:
                continue
            try:
                introspection = await self._bus.introspect(
                    "org.freedesktop.systemd1", unit_path
                )
                proxy = self._bus.get_proxy_object(
                    "org.freedesktop.systemd1", unit_path, introspection
                )
                props_iface = proxy.get_interface(
                    "org.freedesktop.DBus.Properties"
                )

                def _make_handler(name: str):
                    def handler(iface_name, changed, invalidated):
                        if "ActiveState" in changed or "SubState" in changed:
                            active = changed.get("ActiveState", {}).get("value", "unknown")
                            sub = changed.get("SubState", {}).get("value", "unknown")
                            for cb in self._callbacks:
                                cb(name, active, sub)
                    return handler

                props_iface.on_properties_changed(_make_handler(unit_name))
                logger.info("Subscribed to changes for %s", unit_name)
            except Exception as e:
                logger.warning("Could not subscribe to %s: %s", unit_name, e)
