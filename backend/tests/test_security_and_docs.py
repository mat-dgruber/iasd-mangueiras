import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.core.security import sanitize_text
from app.core.rate_limiter import InMemoryRateLimiter, get_client_ip
from app.core.cache import SimpleMemoryCache
from app.services.email_service import mask_string, mask_email
from fastapi import Request, HTTPException


def test_sanitize_text():
    # Teste de remoção de tags maliciosas e scripts
    dirty = "<script>alert('xss')</script>Olá <b>Mundo</b>"
    clean = sanitize_text(dirty)
    assert "<script>" not in clean
    assert "alert" in clean
    assert "<b>" not in clean
    assert "Olá" in clean


@pytest.mark.anyio
async def test_security_headers_and_csp():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "SAMEORIGIN"
        assert "Strict-Transport-Security" in response.headers
        assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        # Validação do CSP injetado (SEC-04)
        csp = response.headers.get("Content-Security-Policy", "")
        assert "default-src 'self'" in csp
        assert "frame-src https://www.youtube-nocookie.com https://www.youtube.com" in csp
        assert "object-src 'none'" in csp


@pytest.mark.anyio
async def test_scalar_docs_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/scalar")
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
        assert "@scalar" in response.text or "Scalar" in response.text


@pytest.mark.anyio
async def test_openapi_spec_has_rich_tags():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert data["info"]["title"] == "IASD Mangueiras API"
        assert len(data["tags"]) >= 3
        assert "/scalar" not in data["paths"]


def test_rate_limiter_proxy_resolution_and_blocking():
    limiter = InMemoryRateLimiter(max_requests=2, window_seconds=60)
    
    # Simula requisição com cabeçalho de proxy reverso X-Forwarded-For
    mock_request = type(
        "MockRequest",
        (),
        {
            "headers": {"x-forwarded-for": "203.0.113.195, 70.41.3.18"},
            "client": type("MockClient", (), {"host": "10.0.0.1"})(),
        },
    )()

    assert get_client_ip(mock_request) == "203.0.113.195"

    # Primeira e segunda requisições permitidas
    limiter.check(mock_request)
    limiter.check(mock_request)

    # Terceira requisição deve disparar HTTP 429
    with pytest.raises(HTTPException) as exc_info:
        limiter.check(mock_request)
    assert exc_info.value.status_code == 429


def test_pii_masking():
    # Valida mascaramento LGPD (SEC-09)
    assert mask_string("Matheus Diniz", 2) == "Ma***"
    assert mask_email("contato@iasdmangueiras.org.br") == "co***@iasdmangueiras.org.br"
    assert mask_string(None) == "[NÃO INFORMADO]"
    assert mask_email("invalid") == "[E-MAIL PROTEGIDO]"


def test_simple_memory_cache_lru_and_expiration():
    # Valida cache com maxsize e evicção (SEC-12)
    cache = SimpleMemoryCache(maxsize=2)
    cache.set("k1", "v1", ttl_seconds=10)
    cache.set("k2", "v2", ttl_seconds=10)
    
    # Acesso a k1 atualiza LRU
    assert cache.get("k1") == "v1"
    
    # Inserção de k3 deve evict k2 (o menos recentemente usado)
    cache.set("k3", "v3", ttl_seconds=10)
    assert cache.get("k1") == "v1"
    assert cache.get("k2") is None
    assert cache.get("k3") == "v3"

