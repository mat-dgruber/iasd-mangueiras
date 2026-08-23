import logging
from app.models.contato import ContatoIn, OracaoIn

logger = logging.getLogger(__name__)


class EmailService:
    async def send_contato_email(self, data: ContatoIn) -> bool:
        # No MVP, simula ou despacha envio via SMTP/Resend
        logger.info(
            "Novo contato recebido: Nome=%s, Email=%s, Telefone=%s, Mensagem=%s",
            data.nome,
            data.email,
            data.telefone,
            data.mensagem,
        )
        return True

    async def send_oracao_email(self, data: OracaoIn) -> bool:
        # No MVP, simula ou despacha envio para equipe de intercessão
        logger.info(
            "Novo pedido de oração recebido: Nome=%s, Telefone=%s, Confidencial=%s, Pedido=%s",
            data.nome,
            data.telefone,
            data.confidencial,
            data.pedido,
        )
        return True


email_service = EmailService()
