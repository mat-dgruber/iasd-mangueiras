import logging
import httpx
from app.core.config import settings
from app.models.contato import ContatoIn, OracaoIn

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Serviço assíncrono e resiliente para disparo de notificações e webhooks
    para os canais de liderança e atendimento da IASD Mangueiras.
    """

    async def notify_new_contato(self, contato: ContatoIn) -> bool:
        """Envia alerta de nova mensagem de contato."""
        if not settings.notifications_enabled:
            return False

        telefone_str = f"\n📱 Telefone: {contato.telefone}" if contato.telefone else ""
        text = (
            f"📬 *Nova Mensagem de Contato — IASD Mangueiras*\n\n"
            f"👤 *Nome:* {contato.nome}\n"
            f"✉️ *E-mail:* {contato.email}"
            f"{telefone_str}\n\n"
            f"💬 *Mensagem:*\n{contato.mensagem}"
        )

        payload = {
            "event": "new_contact_message",
            "name": contato.nome,
            "email": contato.email,
            "phone": contato.telefone,
            "message": contato.mensagem,
        }

        return await self._dispatch_notifications(text, payload)

    async def notify_new_oracao(self, oracao: OracaoIn) -> bool:
        """Envia alerta de novo pedido de oração ou estudo bíblico."""
        if not settings.notifications_enabled:
            return False

        confidencial_tag = "🔒 *CONFIDENCIAL (Equipe Pastoral)*\n" if oracao.confidencial else "🕊️ *Pedido Público / Intercessão*\n"
        telefone_str = f"\n📱 Telefone: {oracao.telefone}" if oracao.telefone else ""

        text = (
            f"🙏 *Novo Pedido de Oração — IASD Mangueiras*\n"
            f"{confidencial_tag}\n"
            f"👤 *Nome:* {oracao.nome}"
            f"{telefone_str}\n\n"
            f"📖 *Motivo / Pedido:*\n{oracao.pedido}"
        )

        payload = {
            "event": "new_prayer_request",
            "name": oracao.nome,
            "phone": oracao.telefone,
            "confidential": oracao.confidencial,
            "prayer_request": oracao.pedido,
        }

        return await self._dispatch_notifications(text, payload)

    async def _dispatch_notifications(self, text: str, payload: dict) -> bool:
        """Despacha em paralelo para Telegram e Webhook configurados."""
        success = True

        # 1. Telegram Bot
        if settings.telegram_bot_token and settings.telegram_chat_id:
            try:
                url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        url,
                        json={
                            "chat_id": settings.telegram_chat_id,
                            "text": text,
                            "parse_mode": "Markdown",
                        },
                    )
                    if resp.status_code != 200:
                        logger.warning("Falha ao enviar notificação para o Telegram: %s", resp.text)
                        success = False
            except Exception as e:
                logger.error("Erro de conexão com Telegram API: %s", e)
                success = False

        # 2. Generic HTTP Webhook (Discord / WhatsApp Gateway / n8n / Zapier)
        if settings.notification_webhook_url:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        settings.notification_webhook_url,
                        json={"text": text, **payload},
                    )
                    if resp.status_code not in (200, 201, 202, 204):
                        logger.warning("Webhook retornou status não-OK: %s", resp.status_code)
                        success = False
            except Exception as e:
                logger.error("Erro ao despachar webhook: %s", e)
                success = False

        return success


notification_service = NotificationService()
