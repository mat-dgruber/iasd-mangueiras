from fastapi import APIRouter, BackgroundTasks, Request, status
from app.core.rate_limiter import form_rate_limiter
from app.models.contato import FormResponse, OracaoIn
from app.services.email_service import email_service
from app.services.notification_service import notification_service

router = APIRouter(prefix="/oracao", tags=["Oração & Intercessão"])


@router.post(
    "",
    response_model=FormResponse,
    status_code=status.HTTP_200_OK,
    summary="Enviar pedido de oração",
    description="Recebe pedidos de oração de visitantes e membros para a equipe de intercessão pastoral da IASD Mangueiras.",
    responses={
        200: {"description": "Pedido de oração recebido com sucesso", "model": FormResponse},
        422: {"description": "Erro de validação nos campos informados"},
        429: {"description": "Limite de envios excedido (Rate Limit)"},
    },
)
async def submit_oracao(
    data: OracaoIn, request: Request, background_tasks: BackgroundTasks
) -> FormResponse:
    # 1. Proteção de Rate Limit por IP
    form_rate_limiter.check(request)

    # 2. Envio seguro por e-mail
    await email_service.send_oracao_email(data)

    # 3. Notificação em background (Telegram/Webhook)
    background_tasks.add_task(notification_service.notify_new_oracao, data)

    return FormResponse(
        success=True,
        message="Pedido de oração recebido! Nossa equipe e congregação estarão em oração por você.",
    )

