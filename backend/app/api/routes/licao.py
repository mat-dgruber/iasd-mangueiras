from fastapi import APIRouter, status
from app.models.licao import LicaoHojeResponse

router = APIRouter(prefix="/licao", tags=["Estudo & Lição da Bíblia"])


@router.get(
    "/hoje",
    response_model=LicaoHojeResponse,
    status_code=status.HTTP_200_OK,
    summary="Consultar a Lição da Escola Sabatina e Versículo de Hoje",
    description="Retorna os dados temáticos da lição bíblica diária da CPB e versículo de reflexão para o dia atual.",
    responses={
        200: {"description": "Dados da lição e versículo de hoje", "model": LicaoHojeResponse},
    },
)
async def get_licao_hoje() -> LicaoHojeResponse:
    return LicaoHojeResponse(
        titulo="O Plano da Redenção e a Esperança Viva",
        tema="Mensagens de Esperança para os Nossos Dias",
        trimestre="3º Trimestre de 2026",
        versiculo_dia="Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.",
        referencia="Jeremias 29:11",
        link_cpb="https://licoesbiblicas.cpb.com.br/",
        licao_numero=8,
    )
