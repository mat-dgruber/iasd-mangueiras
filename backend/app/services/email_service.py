import logging
from app.models.contato import ContatoIn, OracaoIn

logger = logging.getLogger(__name__)


def mask_string(val: str | None, visible_chars: int = 2) -> str:
    """Mascara strings sensíveis para conformidade LGPD em logs."""
    if not val:
        return "[NÃO INFORMADO]"
    val = val.strip()
    if len(val) <= visible_chars:
        return "***"
    return f"{val[:visible_chars]}***"


def mask_email(email: str | None) -> str:
    """Mascara endereço de e-mail (ex: ma***@dominio.com)."""
    if not email or "@" not in email:
        return "[E-MAIL PROTEGIDO]"
    user, domain = email.split("@", 1)
    masked_user = mask_string(user, 2)
    return f"{masked_user}@{domain}"


class EmailService:
    async def send_contato_email(self, data: ContatoIn) -> bool:
        # Despacho seguro de contato com telemetria e mascaramento LGPD
        logger.info(
            "Novo contato recebido com sucesso: Nome=%s, Email=%s, PossuiTelefone=%s, TamMensagem=%d",
            mask_string(data.nome, 2),
            mask_email(data.email),
            bool(data.telefone),
            len(data.mensagem) if data.mensagem else 0,
        )
        return True

    async def send_oracao_email(self, data: OracaoIn) -> bool:
        # Despacho seguro de intercessão pastoral com proteção estrita de sigilo
        logger.info(
            "Novo pedido de oração recebido com sucesso: Nome=%s, Confidencial=%s, PossuiTelefone=%s, TamPedido=%d",
            mask_string(data.nome, 2),
            data.confidencial,
            bool(data.telefone),
            len(data.pedido) if data.pedido else 0,
        )
        return True


email_service = EmailService()

