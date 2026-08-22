# PLAN.md — Site IASD Mangueiras

## Regras
- Fazer UM passo por vez.
- NÃO avançar até o passo atual estar marcado como ✅ CONCLUÍDO.
- Cada passo deve ser testado antes de ser marcado como concluído.
- Se um passo falhar, corrigir antes de continuar.

---

## Fase 1 — Setup do projeto
- [ ] Passo 1: Criar projeto Angular 21+ com SSR habilitado, standalone components e TypeScript strict (`ng new` com `--ssr`)
- [ ] Passo 2: Instalar e configurar Tailwind CSS 3.4.17
- [ ] Passo 3: Instalar PrimeNG 21+ e configurar tema/provider
- [ ] Passo 4: Montar a estrutura de pastas do ARCHITECTURE.md (`core/`, `features/`, `shared/`, `layout/`, `content/`)
- [ ] Passo 5: Configurar tokens de cor da marca em `tailwind.config.js`
- [ ] Passo 6: Configurar `environment.ts` (apiBaseUrl, mapsEmbedUrl, whatsappNumber)
- [ ] Passo 7: Criar os arquivos de conteúdo iniciais em `content/` (horarios.json, eventos.json, comunicados.json, ministerios.json)
- [ ] Passo 8: Inicializar o backend FastAPI com `uv init` — confirmar que o servidor sobe no `uvicorn`
- [ ] Passo 9: Fazer deploy do frontend em branco (Vercel/Netlify/Cloudflare) e confirmar que renderiza no servidor

## Fase 2 — Layout e navegação
- [ ] Passo 10: Construir HeaderComponent (logo, nav, CTA "Assista ao vivo", botão WhatsApp)
- [ ] Passo 11: Construir FooterComponent (redes, endereço, WhatsApp, link de dízimos externo)
- [ ] Passo 12: Registrar Header e Footer no `app.component.ts`
- [ ] Passo 13: Configurar `app.routes.ts` com todas as rotas (home, horarios, ao-vivo, eventos, ministerios, sou-novo, contato)
- [ ] Passo 14: Testar Header e Footer em mobile, tablet e desktop

## Fase 3 — Página inicial
- [ ] Passo 15: Construir Hero (identidade, próximo culto/live, CTA primário)
- [ ] Passo 16: Construir seção Horários + Localização com mapa e botão "Como chegar"
- [ ] Passo 17: Construir seção de destaques de vídeo (placeholder até a integração do YouTube)
- [ ] Passo 18: Construir seção de eventos/comunicados em destaque (lendo do ContentService)
- [ ] Passo 19: Construir prévia de Ministérios
- [ ] Passo 20: Construir banner de CTA de conexão (WhatsApp / visite-nos)
- [ ] Passo 21: Montar todas as seções em `home.component.ts` na ordem correta
- [ ] Passo 22: Testar a home inteira em mobile e corrigir layout

## Fase 4 — Conteúdo e páginas internas
- [ ] Passo 23: Criar `ContentService` que lê os arquivos JSON de `content/`
- [ ] Passo 24: Definir interfaces tipadas (Evento, Comunicado, Horario, Ministerio) em `core/models/`
- [ ] Passo 25: Construir página `/eventos` (lista de eventos + comunicados)
- [ ] Passo 26: Construir página `/ministerios`
- [ ] Passo 27: Construir página `/sou-novo` (o que esperar na primeira visita)
- [ ] Passo 28: Construir página `/horarios` completa
- [ ] Passo 29: Testar todas as páginas prerenderizadas (ver HTML pronto sem JS)

## Fase 5 — Integração com o YouTube
- [ ] Passo 30: No backend, criar `youtube_service.py` chamando a YouTube Data API v3
- [ ] Passo 31: Criar endpoints `GET /api/youtube/latest` e `GET /api/youtube/live` com modelos Pydantic
- [ ] Passo 32: Implementar cache com TTL (`core/cache.py`) para respeitar a cota
- [ ] Passo 33: Criar `YoutubeService` no frontend consumindo o backend
- [ ] Passo 34: Construir página `/ao-vivo` (player da live + últimas + série "Presente 7")
- [ ] Passo 35: Ligar os destaques de vídeo da home ao YoutubeService
- [ ] Passo 36: Testar comportamento quando há live no ar e quando não há

## Fase 6 — Formulários (contato e oração)
- [ ] Passo 37: Construir formulários de contato e oração com Angular Reactive Forms
- [ ] Passo 38: Adicionar validadores (campos obrigatórios, formato de e-mail/telefone)
- [ ] Passo 39: Criar `ContatoService` para enviar os dados ao backend
- [ ] Passo 40: Criar endpoints FastAPI `POST /api/contato` e `POST /api/oracao` com Pydantic
- [ ] Passo 41: Implementar `email_service.py` (SMTP/Resend) enviando para o e-mail da igreja
- [ ] Passo 42: Ligar formulários ao serviço com estados de sucesso e erro
- [ ] Passo 43: Testar ponta a ponta — confirmar recebimento do e-mail

## Fase 7 — SEO e performance
- [ ] Passo 44: Adicionar `Title` e `Meta` em todas as páginas
- [ ] Passo 45: Adicionar Open Graph no `index.html` e por rota
- [ ] Passo 46: Adicionar dados estruturados JSON-LD (Church/Organization + Event) no `index.html`
- [ ] Passo 47: Otimizar imagens (WebP, largura/altura explícitas, `loading="lazy"`)
- [ ] Passo 48: Rodar Lighthouse — corrigir qualquer nota abaixo de 90 em Performance e Acessibilidade
- [ ] Passo 49: Adicionar `robots.txt` e `sitemap.xml`
- [ ] Passo 50: Confirmar que o conteúdo aparece renderizado no servidor (view-source mostra o HTML)

## Fase 8 — QA final e lançamento
- [ ] Passo 51: QA completo em mobile, tablet e desktop
- [ ] Passo 52: Conferir todos os links, WhatsApp, mapa e destino dos formulários
- [ ] Passo 53: Verificar se o analytics está disparando corretamente
- [ ] Passo 54: Deploy final em produção (frontend + backend)
- [ ] Passo 55: Confirmar site no ar — abrir a live, enviar um formulário de teste, clicar no WhatsApp

---

✅ PROJETO CONCLUÍDO QUANDO: todos os passos estiverem marcados e o site no ar mostrar corretamente os horários, exibir as últimas lives/séries do YouTube e receber um envio real de formulário.

## Fase 2 (futuro) — CMS de conteúdo
Quando houver um voluntário responsável por manter o site, conectar um CMS headless (Sanity, plano gratuito) e trocar apenas a implementação do `ContentService`, sem mexer nos componentes.
