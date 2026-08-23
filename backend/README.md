# Backend API — IASD Mangueiras ⛪

API REST construída em **Python 3.14+ com FastAPI** e gerenciada com **uv**, responsável por prover integração segura com a YouTube Data API v3 (com cache TTL para economia de cota) e processamento dos formulários de contato e pedidos de oração.

---

## 🛠️ Stack Tecnológica

- **Linguagem:** Python 3.14+
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (assíncrono, OpenAPI nativo)
- **Gerenciador de Pacotes:** [uv](https://docs.astral.sh/uv/) (Astral)
- **Validação e Tipagem:** [Pydantic v2](https://docs.pydantic.dev/) e [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- **Cliente HTTP:** [HTTPX](https://www.python-httpx.org/) (AsyncClient)
- **Testes Automatizados:** [Pytest](https://docs.pytest.org/) com suporte AnyIO

---

## 📂 Estrutura de Pastas

```text
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── contato.py         # Endpoint POST /api/contato
│   │       ├── oracao.py          # Endpoint POST /api/oracao
│   │       └── youtube.py         # Endpoints GET /api/youtube/latest e /live
│   ├── core/
│   │   ├── cache.py               # Cache em memória thread-safe com TTL
│   │   └── config.py              # Configurações com pydantic-settings (.env)
│   ├── models/
│   │   ├── contato.py             # Modelos Pydantic de contato e oração
│   │   └── youtube.py             # Modelos Pydantic de vídeo e live
│   ├── services/
│   │   ├── email_service.py       # Despacho de notificações de contato/oração
│   │   └── youtube_service.py     # Integração YouTube Data API v3 + fallbacks
│   └── main.py                    # App FastAPI, middlewares de CORS e routers
├── tests/
│   ├── test_forms.py              # Testes unitários para contato e oração
│   └── test_youtube.py            # Testes unitários para rotas do YouTube
├── .env                           # Credenciais locais (chaves e IDs)
├── pyproject.toml                 # Dependências e configurações do projeto
└── uv.lock                        # Lockfile determinístico do uv
```

---

## ⚙️ Variáveis de Ambiente (.env)

Crie ou edite o arquivo `backend/.env`:

```env
# Configurações do App
APP_ENV=development
DEBUG=true

# YouTube Data API v3
YOUTUBE_API_KEY=AIzaSy...
YOUTUBE_CHANNEL_ID=UC4x7BBBm6Ds1JZYit0yMhuQ
YOUTUBE_CACHE_TTL_SECONDS=1800
```

> **Nota:** Se a `YOUTUBE_API_KEY` não for informada, o serviço utiliza dados estruturados de fallback institucional (incluindo a série _Presente 7_ e últimos cultos), garantindo que o frontend nunca fique quebrado ou vazio durante o desenvolvimento.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos

- Ter o gerenciador [uv](https://docs.astral.sh/uv/) instalado (`curl -LsSf https://astral.sh/uv/install.sh | sh` ou via Homebrew).

### 2. Instalar dependências

```bash
cd backend
uv sync
```

### 3. Iniciar o servidor de desenvolvimento

```bash
uv run uvicorn app.main:app --reload --port 8000
```

- **API Base:** `http://localhost:8000`
- **Documentação Swagger (OpenAPI):** `http://localhost:8000/docs`
- **Documentação Redoc:** `http://localhost:8000/redoc`

---

## 🧪 Como Rodar os Testes

Para executar toda a suíte de testes com Pytest:

```bash
uv run pytest
```

---

## 📌 Endpoints da API

| Método | Rota                  | Descrição                                                             |
| ------ | --------------------- | --------------------------------------------------------------------- |
| `GET`  | `/health`             | Verificação de saúde da API                                           |
| `GET`  | `/api/youtube/latest` | Lista os últimos vídeos/cultos gravados do canal (cache de 30 min)    |
| `GET`  | `/api/youtube/live`   | Verifica se há culto/transmissão ao vivo acontecendo (cache de 5 min) |
| `POST` | `/api/contato`        | Processa mensagem de contato institucional                            |
| `POST` | `/api/oracao`         | Processa pedido de oração (com suporte a confidencialidade)           |
