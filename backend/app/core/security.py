import html
import re
import unicodedata
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


def sanitize_text(value: str | None) -> str:
    """Sanitiza strings de entrada para neutralizar ataques XSS e normalizar caracteres Unicode."""
    if not value:
        return ""
    # 1. Normalização Unicode NFC
    normalized = unicodedata.normalize("NFC", value.strip())
    # 2. Remoção de tags HTML / scripts
    clean = re.sub(r"<[^>]*>", "", normalized)
    # 3. Escape de entidades HTML para segurança em visualizações
    return html.escape(clean)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Injeta cabeçalhos de segurança HTTP em todas as respostas da API."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(self)"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https: data:; "
            "frame-src https://www.youtube-nocookie.com https://www.youtube.com; "
            "connect-src 'self' https:; "
            "object-src 'none'; "
            "base-uri 'self';"
        )
        return response

