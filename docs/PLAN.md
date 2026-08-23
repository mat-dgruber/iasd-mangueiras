# PLAN.md — Site IASD Mangueiras

## Regras

- Fazer UM passo por vez.
- NÃO avançar até o passo atual estar marcado como ✅ CONCLUÍDO.
- Cada passo deve ser testado antes de ser marcado como concluído.
- Se um passo falhar, corrigir antes de continuar.

---

## Fase 1 — Frontend SSR e skeleton navegável

- [x] Passo 1: Criar projeto Angular 21+ com SSR habilitado, standalone components e TypeScript strict (`ng new` com `--ssr`) ✅ CONCLUÍDO
- [x] Passo 2: Instalar e configurar Tailwind CSS 3.4.17 ✅ CONCLUÍDO
- [x] Passo 3: Instalar PrimeNG 21+ e configurar tema/provider somente para compatibilidade futura ✅ CONCLUÍDO
- [x] Passo 4: Montar a estrutura de pastas do ARCHITECTURE.md para o frontend (`core/`, `features/`, `shared/`, `layout/`, `content/`) ✅ CONCLUÍDO
- [x] Passo 5: Configurar tokens de cor da marca em `tailwind.config.js` ✅ CONCLUÍDO
- [x] Passo 6: Configurar `environment.ts` com valores públicos necessários ao frontend (`mapsEmbedUrl`, `whatsappNumber`, `analyticsId` opcional); deixar `apiBaseUrl` vazio ou local até o backend existir ✅ CONCLUÍDO
- [x] Passo 7: Configurar `app.routes.ts` com todas as rotas do MVP (home, horarios, ao-vivo, eventos, ministerios, sou-novo, contato) ✅ CONCLUÍDO
- [x] Passo 8: Criar HeaderComponent e FooterComponent simples, com WhatsApp e horários/localização sempre acessíveis ✅ CONCLUÍDO
- [x] Passo 9: Criar páginas placeholder navegáveis para todas as rotas do MVP ✅ CONCLUÍDO
- [x] Passo 10: Testar build/SSR e navegação local antes de avançar ✅ CONCLUÍDO
- [x] Passo 10.1: Validar base visual com `docs/design/brand-guidelines.md` e `docs/design/design.md` ✅ CONCLUÍDO
- [x] Passo 10.2: Validar base SEO/AEO/GEO inicial (`robots.txt`, `sitemap.xml`, `llms.txt`, canônicas e JSON-LD`) ✅ CONCLUÍDO

## Fase 2 — Conteúdo institucional via JSON

- [x] Passo 11: Criar os arquivos de conteúdo iniciais em `content/` (horarios.json, eventos.json, comunicados.json, ministerios.json) ✅ CONCLUÍDO
- [x] Passo 12: Definir interfaces tipadas (Evento, Comunicado, Horario, Ministerio) em `core/models/` ✅ CONCLUÍDO
- [x] Passo 13: Criar `ContentService` que lê os arquivos JSON de `content/` ✅ CONCLUÍDO
- [x] Passo 14: Preencher Home com hero, horários/localização, placeholder de vídeos, eventos em destaque, ministérios e CTA de conexão ✅ CONCLUÍDO
- [x] Passo 15: Preencher página `/horarios` completa ✅ CONCLUÍDO
- [x] Passo 16: Preencher página `/eventos` com eventos e comunicados ✅ CONCLUÍDO
- [x] Passo 17: Preencher página `/ministerios` ✅ CONCLUÍDO
- [x] Passo 18: Preencher página `/sou-novo` ✅ CONCLUÍDO
- [x] Passo 19: Testar todas as páginas prerenderizadas e confirmar conteúdo visível no HTML sem depender de JavaScript client-side ✅ CONCLUÍDO

## Fase 3 — Integração com o YouTube

- [x] Passo 20: Inicializar o backend FastAPI com `uv init` e confirmar que o servidor sobe no `uvicorn` ✅ CONCLUÍDO
- [x] Passo 21: Criar configuração backend com `pydantic-settings` para YouTube, CORS e cache TTL ✅ CONCLUÍDO
- [x] Passo 22: Criar `youtube_service.py` chamando a YouTube Data API v3 ✅ CONCLUÍDO
- [x] Passo 23: Implementar cache com TTL (`core/cache.py`) para respeitar a cota ✅ CONCLUÍDO
- [x] Passo 24: Criar endpoints `GET /api/youtube/latest` e `GET /api/youtube/live` com modelos Pydantic ✅ CONCLUÍDO
- [x] Passo 25: Criar `YoutubeService` no frontend consumindo o backend ✅ CONCLUÍDO
- [x] Passo 26: Construir página `/ao-vivo` com player da live, últimas transmissões e série "Presente 7" ✅ CONCLUÍDO
- [x] Passo 27: Ligar os destaques de vídeo da home ao YoutubeService ✅ CONCLUÍDO
- [x] Passo 28: Testar comportamento quando há live no ar, quando não há live e quando a API falha ✅ CONCLUÍDO

## Fase 4 — Formulários (contato e oração)

- [x] Passo 29: Construir formulários de contato e oração com Angular Reactive Forms ✅ CONCLUÍDO
- [x] Passo 30: Adicionar validadores de campos obrigatórios, formato de e-mail e telefone ✅ CONCLUÍDO
- [x] Passo 31: Criar endpoints FastAPI `POST /api/contato` e `POST /api/oracao` com modelos Pydantic ✅ CONCLUÍDO
- [x] Passo 32: Implementar `email_service.py` via SMTP ou Resend, conforme credencial disponível ✅ CONCLUÍDO
- [x] Passo 33: Criar `ContatoService` no frontend para enviar os dados ao backend ✅ CONCLUÍDO
- [x] Passo 34: Ligar formulários ao serviço com estados de loading, sucesso e erro ✅ CONCLUÍDO
- [x] Passo 35: Testar ponta a ponta e confirmar recebimento real do e-mail ou fluxo WhatsApp aprovado ✅ CONCLUÍDO

## Fase 5 — SEO, performance e deploy

- [x] Passo 36: Adicionar `Title` e `Meta` em todas as páginas ✅ CONCLUÍDO
- [x] Passo 37: Adicionar Open Graph no `index.html` e por rota ✅ CONCLUÍDO
- [x] Passo 38: Adicionar dados estruturados JSON-LD (Church/Organization + Event) ✅ CONCLUÍDO
- [x] Passo 39: Otimizar imagens (WebP, largura/altura explícitas, `loading="lazy"`) ✅ CONCLUÍDO
- [x] Passo 40: Adicionar `robots.txt` e `sitemap.xml` ✅ CONCLUÍDO
- [x] Passo 40.1: Gerar relatório SEO/AEO/GEO em `docs/reports/` antes do deploy ✅ CONCLUÍDO
- [x] Passo 41: Fazer deploy do frontend SSR navegável e confirmar renderização no servidor ✅ CONCLUÍDO
- [x] Passo 42: Fazer deploy do backend somente após YouTube/formulários funcionarem localmente ✅ CONCLUÍDO
- [x] Passo 43: Rodar Lighthouse e corrigir qualquer nota abaixo de 90 em Performance e Acessibilidade ✅ CONCLUÍDO

## Fase 6 — QA final e lançamento

- [x] Passo 44: QA completo em mobile, tablet e desktop ✅ CONCLUÍDO
- [x] Passo 45: Conferir todos os links, WhatsApp, mapa e destino dos formulários ✅ CONCLUÍDO
- [x] Passo 46: Verificar se o analytics está disparando corretamente, se configurado ✅ CONCLUÍDO
- [x] Passo 47: Confirmar site no ar — abrir a live, enviar um formulário de teste, clicar no WhatsApp e abrir horários/localização ✅ CONCLUÍDO

---

✅ PROJETO CONCLUÍDO: todos os passos marcados, site institucional no ar com horários, integração com canal do YouTube, formulários de contato/oração, suporte a AEO/GEO e prerender completo.

## Fase 2 (futuro) — CMS de conteúdo

Quando houver um voluntário responsável por manter o site, conectar um CMS headless (Sanity, plano gratuito) e trocar apenas a implementação do `ContentService`, sem mexer nos componentes.
