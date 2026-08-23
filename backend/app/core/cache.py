import time
from typing import Any


class SimpleMemoryCache:
    def __init__(self) -> None:
        self._store: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        if key in self._store:
            expiry, value = self._store[key]
            if time.time() < expiry:
                return value
            del self._store[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        expiry = time.time() + ttl_seconds
        self._store[key] = (expiry, value)

    def clear(self) -> None:
        self._store.clear()


cache = SimpleMemoryCache()
