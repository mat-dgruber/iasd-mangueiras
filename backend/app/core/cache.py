import threading
import time
from typing import Any


class SimpleMemoryCache:
    """Cache em memória thread-safe com limite de tamanho e evicção LRU/expiração (SEC-12)."""

    def __init__(self, maxsize: int = 500) -> None:
        self.maxsize = maxsize
        self._store: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Any | None:
        now = time.time()
        with self._lock:
            if key in self._store:
                expiry, value = self._store[key]
                if now < expiry:
                    del self._store[key]
                    self._store[key] = (expiry, value)
                    return value
                del self._store[key]
            return None

    def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        now = time.time()
        expiry = now + ttl_seconds
        with self._lock:
            if key in self._store:
                del self._store[key]
            elif len(self._store) >= self.maxsize:
                # 1. Purga itens expirados primeiro
                expired_keys = [k for k, (exp, _) in self._store.items() if now >= exp]
                for exp_k in expired_keys:
                    del self._store[exp_k]

                # 2. Se ainda exceder maxsize, remove o item mais antigo (LRU)
                if len(self._store) >= self.maxsize:
                    oldest_key = next(iter(self._store))
                    del self._store[oldest_key]

            self._store[key] = (expiry, value)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()


cache = SimpleMemoryCache()

