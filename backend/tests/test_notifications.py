import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.models.contato import ContatoIn, OracaoIn
from app.services.notification_service import notification_service


@pytest.mark.anyio
async def test_get_licao_hoje():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/licao/hoje")
        assert response.status_code == 200
        data = response.json()
        assert "titulo" in data
        assert "versiculo_dia" in data
        assert "referencia" in data
        assert "link_cpb" in data


@pytest.mark.anyio
async def test_notification_service_handles_missing_keys_gracefully():
    # Sem credenciais configuradas, o serviço não quebra e retorna False ou True silencioso
    contato = ContatoIn(
        nome="Teste Notificação",
        email="teste@email.com",
        mensagem="Mensagem de teste para webhook",
    )
    result = await notification_service.notify_new_contato(contato)
    # Como não há webhook_url nem bot_token no .env de teste, deve completar sem erros
    assert isinstance(result, bool)

    oracao = OracaoIn(
        nome="Teste Oração",
        pedido="Pedido de teste de notificação",
        confidencial=True,
    )
    result_oracao = await notification_service.notify_new_oracao(oracao)
    assert isinstance(result_oracao, bool)
