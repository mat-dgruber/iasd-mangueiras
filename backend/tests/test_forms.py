import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.anyio
async def test_submit_contato() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "nome": "Visitante Teste",
            "email": "visitante@example.com",
            "telefone": "(15) 99999-9999",
            "mensagem": "Gostaria de conhecer os horários da congregação.",
        }
        response = await client.post("/api/contato", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "sucesso" in data["message"].lower()


@pytest.mark.anyio
async def test_submit_oracao() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "nome": "Irmão Teste",
            "telefone": "(15) 98888-8888",
            "pedido": "Peço oração pela saúde da minha família.",
            "confidencial": True,
        }
        response = await client.post("/api/oracao", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "oração" in data["message"].lower() or "recebido" in data["message"].lower()
