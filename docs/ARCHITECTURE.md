# ARCHITECTURE.md — Site IASD Mangueiras

## 1. Tech Stack

**Frontend**
- **Angular 21+** (standalone components, signals, novo control flow) — framework escolhido pela equipe; base sólida e tipada.
- **Angular SSR + prerender** (`@angular/ssr`) — renderização no servidor/estática é **essencial para SEO**: o Google precisa ler o conteúdo (horários, eventos) sem depender de JavaScript. Um SPA puro seria fraco em busca, que é justamente como novos visitantes chegam.
- **Tailwind CSS 3.4.17** — estilização utilitária, mobile-first.
- **TypeScript** (strict mode sempre).
- **PrimeNG 21+** — apenas para componentes complexos (Carousel de fotos/depoimentos, Galleria). Preferir componentes Angular customizados primeiro.

**Backend (mínimo)**
- **Python 3.14+** com **FastAPI** — API enxuta, com apenas duas responsabilidades: proxy do YouTube e recebimento de formulários. **Sem banco de dados no MVP.**
- **uv** — gerenciador de pacotes (substitui pip/poetry).

**Camada de conteúdo**
- **MVP:** eventos, comunicados, horários e ministérios ficam em **arquivos JSON no repositório**, servidos via `ContentService` e prerenderizados.
- **Fase 2:** quando houver um editor voluntário definido, plugar um **CMS headless (Sanity — plano gratuito, amigável em pt-BR)**. A troca afeta apenas a implementação do `ContentService`, não os componentes.

**Fora de escopo (por decisão)**
- Pagamentos/dízimos: link externo para o sistema oficial da Igreja. Não construímos gateway nem guardamos dados de pagamento.

## 2. Folder Structure

```
mangueiras-site/
├── frontend/                        # Angular 21 (SSR + prerender)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── services/         # YoutubeService, ContentService, ContatoService
│   │   │   │   └── models/           # Interfaces: Video, Evento, Comunicado, Ministerio, Horario
│   │   │   ├── features/
│   │   │   │   ├── home/             # Página inicial (hero, próximo culto, destaques)
│   │   │   │   ├── horarios/         # Horários + localização + mapa
│   │   │   │   ├── ao-vivo/          # Lives + séries do YouTube
│   │   │   │   ├── eventos/          # Agenda e comunicados
│   │   │   │   ├── ministerios/      # Lista de ministérios
│   │   │   │   ├── sou-novo/         # Primeira visita
│   │   │   │   └── contato/          # Contato + pedidos de oração
│   │   │   ├── shared/
│   │   │   │   ├── components/       # Card, SectionTitle, VideoCard, EventoCard, CtaBanner
│   │   │   │   └── pipes/            # Ex.: DataBrPipe
│   │   │   ├── layout/
│   │   │   │   ├── header/           # Logo, nav, CTA "Assista ao vivo", WhatsApp
│   │   │   │   └── footer/           # Redes, WhatsApp, endereço, dízimos (link externo)
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts         # Providers standalone + provideClientHydration
│   │   │   ├── app.config.server.ts  # Configuração SSR
│   │   │   └── app.routes.ts         # Rotas
│   │   ├── content/                  # CONTEÚDO EDITÁVEL (MVP)
│   │   │   ├── eventos.json
│   │   │   ├── comunicados.json
│   │   │   ├── horarios.json
│   │   │   └── ministerios.json
│   │   ├── assets/images/
│   │   ├── styles.css                # Tailwind + tokens da marca
│   │   └── index.html
│   ├── server.ts                     # Entrypoint SSR (Express)
│   ├── tailwind.config.js            # Configuração + tokens da marca
│   └── angular.json
│
├── backend/                          # FastAPI mínimo (Python 3.14 + uv)
│   ├── app/
│   │   ├── main.py                   # App FastAPI + CORS
│   │   ├── api/routes/
│   │   │   ├── youtube.py            # GET /api/youtube/latest e /api/youtube/live
│   │   │   ├── contato.py            # POST /api/contato
│   │   │   └── oracao.py             # POST /api/oracao
│   │   ├── core/
│   │   │   ├── config.py             # pydantic-settings (.env)
│   │   │   └── cache.py              # Cache simples em memória (TTL)
│   │   ├── models/                   # Pydantic: ContatoIn, OracaoIn, VideoOut
│   │   └── services/
│   │       ├── youtube_service.py    # Chama a YouTube Data API v3
│   │       └── email_service.py      # Envio via SMTP / Resend
│   ├── pyproject.toml
│   ├── uv.lock
│   └── .env
│
├── PRD.md
├── ARCHITECTURE.md
├── AI_RULES.md
└── PLAN.md
```

## 3. Data Flow

**Conteúdo estático (horários, ministérios, "sou novo")**
Vive em arquivos JSON em `content/`. Lido pelo `ContentService` em tempo de build/SSR e **prerenderizado** — chega ao Google como HTML pronto. Zero chamada de API em runtime.

**Conteúdo do YouTube (lives + séries)**
Frontend → `GET /api/youtube/latest` e `/api/youtube/live` no FastAPI → backend chama a **YouTube Data API v3** com a chave escondida no servidor → resposta **cacheada** (TTL) para respeitar a cota → devolve JSON enxuto (título, thumbnail, id, status de live) para o `YoutubeService`.

**Formulários (contato e oração)**
Frontend (Reactive Forms) → `POST /api/contato` ou `/api/oracao` → FastAPI valida com Pydantic → `email_service` envia por e-mail para `contato@igrejadasmangueiras.org.br` (e/ou monta link de WhatsApp). **Nada é persistido em banco no MVP.**

**Integrações de terceiros**
- YouTube Data API v3 (leitura de vídeos/lives).
- Provedor de e-mail (SMTP ou Resend).
- Google Maps embed / link de rota (localização).
- Link externo para dízimos e ofertas (sistema oficial).

## 4. Component Map

| Componente | Local | Responsabilidade |
|---|---|---|
| HeaderComponent | layout/header | Logo, navegação, CTA "Assista ao vivo", botão WhatsApp |
| FooterComponent | layout/footer | Redes sociais, endereço, WhatsApp, link de dízimos |
| HomeComponent | features/home | Monta hero, próximo culto, destaques de vídeo, eventos, CTA |
| HorariosComponent | features/horarios | Horários de culto + mapa + botão de rota |
| AoVivoComponent | features/ao-vivo | Player da live + lista de vídeos/séries (YoutubeService) |
| EventosComponent | features/eventos | Lista de eventos e comunicados (ContentService) |
| MinisteriosComponent | features/ministerios | Cartões dos ministérios |
| SouNovoComponent | features/sou-novo | O que esperar na primeira visita |
| ContatoComponent | features/contato | Formulários de contato e oração |
| VideoCard / EventoCard | shared/components | Cartões reutilizáveis |
| YoutubeService | core/services | Busca lives/vídeos via backend |
| ContentService | core/services | Lê conteúdo (arquivos no MVP; CMS na Fase 2) |
| ContatoService | core/services | Envia formulários ao backend |

## 5. Environment Variables

**Backend (`backend/.env`)**
- `YOUTUBE_API_KEY` — chave da YouTube Data API v3.
- `YOUTUBE_CHANNEL_ID` — ID do canal da igreja.
- `PRESENTE7_PLAYLIST_ID` — ID da playlist da série "Presente 7".
- `EMAIL_PROVIDER` — `smtp` ou `resend`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — se usar SMTP.
- `RESEND_API_KEY` — se usar Resend.
- `CONTACT_TO_EMAIL` — destino dos formulários (ex.: contato@igrejadasmangueiras.org.br).
- `FRONTEND_ORIGIN` — origem liberada no CORS.
- `CACHE_TTL_SECONDS` — validade do cache do YouTube (ex.: 900).

**Frontend (`environment.ts`)**
- `apiBaseUrl` — URL base do backend FastAPI.
- `mapsEmbedUrl` — URL do mapa da localização.
- `whatsappNumber` — número em formato internacional para o link do WhatsApp.
- `analyticsId` — (opcional) ID de analytics.

## 6. Deployment
- **Frontend (Angular SSR):** Vercel, Netlify ou Cloudflare Pages com suporte a SSR. Build via `ng build` + adapter de SSR; deploy automático a cada push na `main`.
- **Backend (FastAPI):** Render ou Fly.io (planos gratuitos), rodando com `uvicorn`. Variáveis de ambiente configuradas no painel do provedor.
- **CI/CD:** GitHub Actions — lint + build do frontend e checagem do backend a cada PR; deploy automático na `main`.
- **Alternativa mais enxuta:** se preferir não manter um servidor separado, o proxy do YouTube e os formulários podem virar **serverless functions** no mesmo host do frontend, dispensando o FastAPI. Mantido como opção.
