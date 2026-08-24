import time
import threading
from fastapi import HTTPException, Request, status


def get_client_ip(request: Request) -> str:
    """Extrai o IP real do cliente considerando cabeçalhos de proxies reversos e CDNs."""
    # 1. Cloudflare
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()

    # 2. X-Real-IP (Nginx / Caddy)
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    # 3. X-Forwarded-For (Primeiro hop não-confiável)
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        parts = [p.strip() for p in forwarded_for.split(",") if p.strip()]
        if parts:
            return parts[0]

    # 4. Fallback para conexão de socket direto
    if request.client and request.client.host:
        return request.client.host

    return "unknown"


class InMemoryRateLimiter:
    """Rate limiter em memória thread-safe baseado em janela deslizante por IP com limpeza automática."""

    def __init__(self, max_requests: int = 5, window_seconds: int = 60, max_tracked_ips: int = 5000):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.max_tracked_ips = max_tracked_ips
        self._requests: dict[str, list[float]] = {}
        self._lock = threading.Lock()
        self._last_cleanup = time.time()

    def _cleanup_expired(self, now: float) -> None:
        """Purga IPs inativos para mitigar exaustão de memória sob tráfego massivo."""
        if now - self._last_cleanup < self.window_seconds and len(self._requests) < self.max_tracked_ips:
            return

        self._last_cleanup = now
        stale_ips = []
        for ip, timestamps in self._requests.items():
            valid_ts = [ts for ts in timestamps if now - ts < self.window_seconds]
            if not valid_ts:
                stale_ips.append(ip)
            else:
                self._requests[ip] = valid_ts

        for ip in stale_ips:
            self._requests.pop(ip, None)

    def check(self, request: Request) -> None:
        client_ip = get_client_ip(request)
        now = time.time()

        with self._lock:
            self._cleanup_expired(now)

            if client_ip not in self._requests:
                self._requests[client_ip] = []

            # Filtra requisições dentro da janela ativa
            self._requests[client_ip] = [
                ts for ts in self._requests[client_ip] if now - ts < self.window_seconds
            ]

            if len(self._requests[client_ip]) >= self.max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Muitas requisições enviadas em curto intervalo. Por favor, aguarde um momento antes de tentar novamente.",
                )

            self._requests[client_ip].append(now)


# Instância padrão para formulários de contato e oração (5 requisições por minuto por IP)
form_rate_limiter = InMemoryRateLimiter(max_requests=5, window_seconds=60)

# Instância dedicada para consultas da API do YouTube (60 requisições por minuto por IP - SEC-08)
youtube_rate_limiter = InMemoryRateLimiter(max_requests=60, window_seconds=60)

