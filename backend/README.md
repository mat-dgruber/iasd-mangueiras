# Backend — IASD Mangueiras API 🚀

Serviço de backend construído em **Python 3.14+** com **FastAPI**, integração com **Scalar OpenAPI DX**, **Rate Limiting**, **Security Headers** e proxy seguro para **YouTube API** e formulários de atendimento.

---

## 🛠️ Stack Tecnológica

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Async, Pydantic v2, OpenAPI 3.1)
- **Documentação Interativa:** [Scalar FastAPI](https://github.com/scalar/scalar) (`scalar-fastapi`) com padrão DX auto-hospedado em `/scalar`
- **Segurança & Resiliência:**
  - Middleware de Cabeçalhos HTTP de Segurança (`X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, `Permissions-Policy`, `Referrer-Policy`)
  - Rate Limiting em memória thread-safe (5 req/min por IP) para formulários
  - Sanitização rigorosa de texto contra injeção de scripts (XSS) e normalização Unicode NFC
- **Integração Externa:** YouTube Data API v3 com cache em memória (TTL 30m)
- **Gerenciador de Dependências:** [uv](https://github.com/astral-sh/uv)
- **Testes:** [Pytest](https://docs.pytest.org/) com `anyio` e `httpx`

---

## 📖 Documentação Interativa da API (Scalar DX)

O backend implementa a especificação OpenAPI 3.1 com interface moderna e rica renderizada via **Scalar**:

- **Interface Interativa Scalar:** `http://localhost:8000/scalar`
- **Especificação OpenAPI JSON:** `http://localhost:8000/openapi.json`
- **Swagger UI Clássico:** `http://localhost:8000/docs`

---

## 🧭 Endpoints Disponíveis

| Método | Rota | Descrição | Tag |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Verificação de disponibilidade da API | Monitoramento & Saúde |
| `GET` | `/api/youtube/latest` | Lista os últimos vídeos publicados no canal oficial | Transmissões & Vídeos |
| `GET` | `/api/youtube/live` | Verifica se há culto/transmissão ao vivo ativa | Transmissões & Vídeos |
| `POST` | `/api/contato` | Envia mensagem de contato com validação e rate limit | Contato & Atendimento |
| `POST` | `/api/oracao` | Envia pedido de oração com opção de sigilo pastoral | Oração & Intercessão |

---

## 🚀 Como Executar Localmente

### 1. Instalar dependências com `uv`

```bash
cd backend
uv sync
```

### 2. Configurar variáveis de ambiente (`.env`)

Crie o arquivo `.env` baseado no exemplo:

```env
APP_NAME="IASD Mangueiras API"
APP_ENV=development
DEBUG=true
YOUTUBE_API_KEY=sua_chave_opcional
YOUTUBE_CHANNEL_ID=UC4x7BBBm6Ds1JZYit0yMhuQ
```

### 3. Iniciar o servidor Uvicorn

```bash
uv run uvicorn app.main:app --reload --port 8000
```

Acesse a API em `http://localhost:8000/health` e a documentação em `http://localhost:8000/scalar`.

---

## 🧪 Testes Automatizados

Para rodar todos os testes de segurança, rotas e documentação:

```bash
uv run pytest
```
