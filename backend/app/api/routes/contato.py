from fastapi import APIRouter
from app.models.contato import ContatoIn, FormResponse
from app.services.email_service import email_service

router = APIRouter(prefix="/contato", tags=["contato"])


@router.post("", response_model=FormResponse)
async def submit_contato(data: ContatoIn) -> FormResponse:
    await email_service.send_contato_email(data)
    return FormResponse(
        success=True,
        message="Mensagem enviada com sucesso! Em breve entraremos em contato.",
    )
