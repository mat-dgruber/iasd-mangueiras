from fastapi import APIRouter, Request, status
from app.core.rate_limiter import youtube_rate_limiter
from app.models.youtube import YouTubeLatestResponse, YouTubeLiveResponse
from app.services.youtube_service import youtube_service

router = APIRouter(prefix="/youtube", tags=["Transmissões & Vídeos"])


@router.get(
    "/latest",
    response_model=YouTubeLatestResponse,
    status_code=status.HTTP_200_OK,
    summary="Listar vídeos recentes do canal",
    description="Retorna os últimos cultos, sermões e transmissões gravadas no canal oficial da IASD Mangueiras no YouTube.",
    responses={
        200: {"description": "Lista de vídeos recentes", "model": YouTubeLatestResponse},
        429: {"description": "Limite de requisições excedido"},
        500: {"description": "Erro ao consultar a API do YouTube ou chave não configurada"},
    },
)
async def get_latest_videos(request: Request) -> YouTubeLatestResponse:
    youtube_rate_limiter.check(request)
    return await youtube_service.get_latest_videos()


@router.get(
    "/catalog",
    response_model=YouTubeLatestResponse,
    status_code=status.HTTP_200_OK,
    summary="Catálogo de mensagens agregado e ordenado",
    description="Retorna os últimos 6 vídeos de cada playlist oficial (Sábado, Domingo, Quarta e Presente 7) em ordem cronológica decrescente.",
    responses={
        200: {"description": "Catálogo completo de mensagens", "model": YouTubeLatestResponse},
        429: {"description": "Limite de requisições excedido"},
        500: {"description": "Erro ao carregar catálogo de vídeos"},
    },
)
async def get_catalog_videos(request: Request) -> YouTubeLatestResponse:
    youtube_rate_limiter.check(request)
    return await youtube_service.get_latest_videos()


@router.get(
    "/playlist/{category}",
    response_model=YouTubeLatestResponse,
    status_code=status.HTTP_200_OK,
    summary="Listar vídeos de uma categoria ou playlist específica",
    description="Retorna os vídeos da categoria informada (sabado, domingo, quarta, presente7) obtidos dinamicamente da respectiva playlist.",
    responses={
        200: {"description": "Vídeos da playlist selecionada", "model": YouTubeLatestResponse},
        429: {"description": "Limite de requisições excedido"},
        500: {"description": "Erro ao carregar vídeos da playlist"},
    },
)
async def get_playlist_by_category(category: str, request: Request) -> YouTubeLatestResponse:
    youtube_rate_limiter.check(request)
    return await youtube_service.get_playlist_videos(category=category.lower())


@router.get(
    "/presente7",
    response_model=YouTubeLatestResponse,
    status_code=status.HTTP_200_OK,
    summary="Listar episódios recentes da Série Presente 7",
    description="Retorna os últimos episódios publicados da série especial Presente 7 gravada na IASD Mangueiras.",
    responses={
        200: {"description": "Lista de episódios da Série Presente 7", "model": YouTubeLatestResponse},
        429: {"description": "Limite de requisições excedido"},
        500: {"description": "Erro ao consultar a API do YouTube"},
    },
)
async def get_presente7_videos(request: Request) -> YouTubeLatestResponse:
    youtube_rate_limiter.check(request)
    return await youtube_service.get_presente7_videos()


@router.get(
    "/live",
    response_model=YouTubeLiveResponse,
    status_code=status.HTTP_200_OK,
    summary="Verificar status de transmissão ao vivo",
    description="Informa se a IASD Mangueiras está com um culto ou programação sendo transmitida ao vivo neste momento.",
    responses={
        200: {"description": "Status de transmissão ao vivo", "model": YouTubeLiveResponse},
        429: {"description": "Limite de requisições excedido"},
        500: {"description": "Erro ao consultar status da transmissão"},
    },
)
async def get_live_status(request: Request) -> YouTubeLiveResponse:
    youtube_rate_limiter.check(request)
    return await youtube_service.get_live_status()

