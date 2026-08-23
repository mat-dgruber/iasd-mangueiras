from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import contato, oracao, youtube
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(youtube.router, prefix="/api")
app.include_router(contato.router, prefix="/api")
app.include_router(oracao.router, prefix="/api")


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "app": settings.app_name}

