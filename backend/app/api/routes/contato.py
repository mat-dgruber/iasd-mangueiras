from fastapi import APIRouter, Request, status
from app.core.rate_limiter import form_rate_limiter
from app.models.contato import ContatoIn, FormResponse
from app.services.email_service import email_service

router = APIRouter(prefix="/contato", tags=["Contato & Atendimento"])


@router.post(
    "",
    response_model=FormResponse,
    status_code=status.HTTP_200_OK,
    summary="Enviar mensagem de contato",
    description="Recebe mensagens e dúvidas de membros e visitantes e as encaminha com segurança para a equipe da igreja.",
    responses={
        200: {"description": "Mensagem enviada com sucesso", "model": FormResponse},
        422: {"description": "Erro de validação nos campos informados"},
        429: {"description": "Limite de envios excedido (Rate Limit)"},
    },
)
async def submit_contato(data: ContatoIn, request: Request) -> FormResponse:
    # 1. Proteção de Rate Limit por IP
    form_rate_limiter.check(request)

    # 2. Envio seguro por e-mail
    await email_service.send_contato_email(data)

    return FormResponse(
        success=True,
        message="Mensagem enviada com sucesso! Em breve entraremos em contato.",
    )
