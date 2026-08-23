from fastapi import APIRouter
from app.models.contato import FormResponse, OracaoIn
from app.services.email_service import email_service

router = APIRouter(prefix="/oracao", tags=["oracao"])


@router.post("", response_model=FormResponse)
async def submit_oracao(data: OracaoIn) -> FormResponse:
    await email_service.send_oracao_email(data)
    return FormResponse(
        success=True,
        message="Pedido de oração recebido! Nossa equipe e congregação estarão em oração por você.",
    )
