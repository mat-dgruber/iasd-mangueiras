from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from scalar_fastapi import AgentScalarConfig, get_scalar_api_reference
from app.api.routes import contato, licao, oracao, youtube
from app.core.config import settings
from app.core.security import SecurityHeadersMiddleware

tags_metadata = [
    {
        "name": "Transmissões & Vídeos",
        "description": "Endpoints para consultar vídeos recentes e status de transmissão ao vivo do canal oficial da IASD Mangueiras no YouTube.",
    },
    {
        "name": "Contato & Atendimento",
        "description": "Canais seguros de comunicação e envio de mensagens para a liderança e secretaria da igreja com notificações automáticas.",
    },
    {
        "name": "Oração & Intercessão",
        "description": "Recepção de pedidos de oração com suporte a sigilo confidencial e encaminhamento pastoral.",
    },
    {
        "name": "Estudo & Lição da Bíblia",
        "description": "Recursos de estudo bíblico diário, temas da Lição da Escola Sabatina e versículos.",
    },
    {
        "name": "Monitoramento & Saúde",
        "description": "Verificação de disponibilidade e telemetria operacional da API.",
    },
]

is_production = settings.app_env.lower() == "production"

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="API oficial da Igreja Adventista do Sétimo Dia das Mangueiras (Tatuí-SP). Fornece serviços de integração com YouTube, formulários de contato, pedidos de oração e estudos bíblicos.",
    openapi_tags=tags_metadata,
    openapi_url="/openapi.json" if not is_production or settings.debug else None,
    docs_url=None,
    redoc_url=None,
    debug=settings.debug,
)

# 1. Middleware de Cabeçalhos de Segurança HTTP
app.add_middleware(SecurityHeadersMiddleware)

# 2. Middleware de CORS (Restrição explícita de métodos e cabeçalhos - SEC-03)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
)

# 3. Rotas da API
app.include_router(youtube.router, prefix="/api")
app.include_router(contato.router, prefix="/api")
app.include_router(oracao.router, prefix="/api")
app.include_router(licao.router, prefix="/api")



@app.get(
    "/health",
    tags=["Monitoramento & Saúde"],
    summary="Verificar saúde da API",
    description="Endpoint leve para sondas de liveness e readiness de infraestrutura.",
)
async def health_check() -> dict[str, str]:
    return {"status": "ok", "app": settings.app_name}


# 4. Documentação Interativa Scalar (Auto-Hospedada com padrão DX e proteção em produção - SEC-10)
@app.get("/scalar", include_in_schema=False)
async def scalar_docs():
    if is_production and not settings.debug:
        raise HTTPException(status_code=404, detail="Documentação desabilitada em ambiente de produção.")

    return get_scalar_api_reference(
        openapi_url=app.openapi_url or "/openapi.json",
        title=f"{settings.app_name} — Documentação da API",
        scalar_proxy_url="https://proxy.scalar.com",
        show_developer_tools="never" if is_production else "localhost",
        agent=AgentScalarConfig(disabled=True),
        servers=[
            {"url": "https://api.iasdmangueiras.org.br", "description": "Servidor de Produção"},
            {"url": "http://localhost:8000", "description": "Ambiente de Desenvolvimento Local"},
        ],
    )

