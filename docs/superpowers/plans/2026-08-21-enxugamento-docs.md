# Enxugamento dos Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Atualizar os docs-fonte para refletir a abordagem aprovada: skeleton completo primeiro, backend FastAPI só na fase de integração e deploy depois de SSR navegável.

**Architecture:** Este plano é doc-only. `PLAN.md` vira o contrato operacional principal; `ARCHITECTURE.md` mantém a arquitetura final do MVP, mas esclarece quando o backend nasce; `AI_RULES.md` impede agentes de criarem backend/deploy antes do passo correto. `PRD.md` fica intacto porque produto e escopo continuam válidos.

**Tech Stack:** Markdown, Angular 21+ SSR/prerender, Tailwind CSS 3.4.17, PrimeNG 21+ quando economizar complexidade, Python 3.14+ FastAPI com uv somente na fase de integração.

## Global Constraints

- Responder e documentar em português do Brasil.
- Angular 21+ com SSR/prerender é obrigatório; nunca transformar em SPA client-only.
- Tailwind CSS 3.4.17 é obrigatório; não trocar por Angular Material, Bootstrap ou estilos inline.
- PrimeNG 21+ só quando economizar complexidade real.
- Backend é Python 3.14+ com FastAPI e uv, mas só deve ser criado na fase de integração.
- Não adicionar dependências, hooks, sandbox, CI/CD ou automações sem necessidade atual explícita.
- Seguir `PLAN.md` passo a passo; não avançar sem teste e confirmação do passo atual.
- Não há git repo válido neste diretório; substituir commits por verificação local e registrar ao usuário.

---

## File Structure

- Modify: `docs/PLAN.md` — fonte da ordem de execução. Deve ser reordenado para skeleton SSR completo antes de backend/deploy.
- Modify: `docs/ARCHITECTURE.md` — fonte da arquitetura final. Deve deixar claro que `backend/` é arquitetura do MVP, não requisito do setup inicial.
- Modify: `docs/AI_RULES.md` — fonte das regras para agentes. Deve impedir criação prematura de backend/deploy e manter autoridade do `PLAN.md`.
- Leave unchanged: `docs/PRD.md` — produto continua o mesmo; YouTube automático e formulários reais permanecem no MVP.
- Reference only: `docs/superpowers/specs/2026-08-21-enxugamento-escopo-design.md` — decisões aprovadas.

---

### Task 1: Reordenar `PLAN.md`

**Files:**
- Modify: `docs/PLAN.md:11-80`

**Interfaces:**
- Consumes: decisões aprovadas no spec `2026-08-21-enxugamento-escopo-design.md`.
- Produces: sequência oficial de execução para todos os agentes.

- [ ] **Step 1: Ler o plano atual**

Use `Read` em `docs/PLAN.md` e confirme que os pontos problemáticos ainda existem:

```markdown
- Passo 8: Inicializar o backend FastAPI com `uv init`
- Passo 9: Fazer deploy do frontend em branco
```

- [ ] **Step 2: Substituir as fases operacionais**

Substitua de `## Fase 1 — Setup do projeto` até `## Fase 8 — QA final e lançamento` por este bloco:

```markdown
## Fase 1 — Frontend SSR e skeleton navegável
- [ ] Passo 1: Criar projeto Angular 21+ com SSR habilitado, standalone components e TypeScript strict (`ng new` com `--ssr`)
- [ ] Passo 2: Instalar e configurar Tailwind CSS 3.4.17
- [ ] Passo 3: Instalar PrimeNG 21+ e configurar tema/provider somente para compatibilidade futura
- [ ] Passo 4: Montar a estrutura de pastas do ARCHITECTURE.md para o frontend (`core/`, `features/`, `shared/`, `layout/`, `content/`)
- [ ] Passo 5: Configurar tokens de cor da marca em `tailwind.config.js`
- [ ] Passo 6: Configurar `environment.ts` com valores públicos necessários ao frontend (`mapsEmbedUrl`, `whatsappNumber`, `analyticsId` opcional); deixar `apiBaseUrl` vazio ou local até o backend existir
- [ ] Passo 7: Configurar `app.routes.ts` com todas as rotas do MVP (home, horarios, ao-vivo, eventos, ministerios, sou-novo, contato)
- [ ] Passo 8: Criar HeaderComponent e FooterComponent simples, com WhatsApp e horários/localização sempre acessíveis
- [ ] Passo 9: Criar páginas placeholder navegáveis para todas as rotas do MVP
- [ ] Passo 10: Testar build/SSR e navegação local antes de avançar

## Fase 2 — Conteúdo institucional via JSON
- [ ] Passo 11: Criar os arquivos de conteúdo iniciais em `content/` (horarios.json, eventos.json, comunicados.json, ministerios.json)
- [ ] Passo 12: Definir interfaces tipadas (Evento, Comunicado, Horario, Ministerio) em `core/models/`
- [ ] Passo 13: Criar `ContentService` que lê os arquivos JSON de `content/`
- [ ] Passo 14: Preencher Home com hero, horários/localização, placeholder de vídeos, eventos em destaque, ministérios e CTA de conexão
- [ ] Passo 15: Preencher página `/horarios` completa
- [ ] Passo 16: Preencher página `/eventos` com eventos e comunicados
- [ ] Passo 17: Preencher página `/ministerios`
- [ ] Passo 18: Preencher página `/sou-novo`
- [ ] Passo 19: Testar todas as páginas prerenderizadas e confirmar conteúdo visível no HTML sem depender de JavaScript client-side

## Fase 3 — Integração com o YouTube
- [ ] Passo 20: Inicializar o backend FastAPI com `uv init` e confirmar que o servidor sobe no `uvicorn`
- [ ] Passo 21: Criar configuração backend com `pydantic-settings` para YouTube, CORS e cache TTL
- [ ] Passo 22: Criar `youtube_service.py` chamando a YouTube Data API v3
- [ ] Passo 23: Implementar cache com TTL (`core/cache.py`) para respeitar a cota
- [ ] Passo 24: Criar endpoints `GET /api/youtube/latest` e `GET /api/youtube/live` com modelos Pydantic
- [ ] Passo 25: Criar `YoutubeService` no frontend consumindo o backend
- [ ] Passo 26: Construir página `/ao-vivo` com player da live, últimas transmissões e série "Presente 7"
- [ ] Passo 27: Ligar os destaques de vídeo da home ao YoutubeService
- [ ] Passo 28: Testar comportamento quando há live no ar, quando não há live e quando a API falha

## Fase 4 — Formulários (contato e oração)
- [ ] Passo 29: Construir formulários de contato e oração com Angular Reactive Forms
- [ ] Passo 30: Adicionar validadores de campos obrigatórios, formato de e-mail e telefone
- [ ] Passo 31: Criar endpoints FastAPI `POST /api/contato` e `POST /api/oracao` com modelos Pydantic
- [ ] Passo 32: Implementar `email_service.py` via SMTP ou Resend, conforme credencial disponível
- [ ] Passo 33: Criar `ContatoService` no frontend para enviar os dados ao backend
- [ ] Passo 34: Ligar formulários ao serviço com estados de loading, sucesso e erro
- [ ] Passo 35: Testar ponta a ponta e confirmar recebimento real do e-mail ou fluxo WhatsApp aprovado

## Fase 5 — SEO, performance e deploy
- [ ] Passo 36: Adicionar `Title` e `Meta` em todas as páginas
- [ ] Passo 37: Adicionar Open Graph no `index.html` e por rota
- [ ] Passo 38: Adicionar dados estruturados JSON-LD (Church/Organization + Event)
- [ ] Passo 39: Otimizar imagens (WebP, largura/altura explícitas, `loading="lazy"`)
- [ ] Passo 40: Adicionar `robots.txt` e `sitemap.xml`
- [ ] Passo 41: Fazer deploy do frontend SSR navegável e confirmar renderização no servidor
- [ ] Passo 42: Fazer deploy do backend somente após YouTube/formulários funcionarem localmente
- [ ] Passo 43: Rodar Lighthouse e corrigir qualquer nota abaixo de 90 em Performance e Acessibilidade

## Fase 6 — QA final e lançamento
- [ ] Passo 44: QA completo em mobile, tablet e desktop
- [ ] Passo 45: Conferir todos os links, WhatsApp, mapa e destino dos formulários
- [ ] Passo 46: Verificar se o analytics está disparando corretamente, se configurado
- [ ] Passo 47: Confirmar site no ar — abrir a live, enviar um formulário de teste, clicar no WhatsApp e abrir horários/localização
```

- [ ] **Step 3: Verificar cortes aplicados**

Use `Grep` em `docs/PLAN.md` para confirmar:

```text
Pattern: "deploy do frontend em branco|Inicializar o backend FastAPI" 
Expected: nenhuma ocorrência de "deploy do frontend em branco"; backend aparece só na Fase 3.
```

- [ ] **Step 4: Fazer leitura final da seção alterada**

Use `Read` em `docs/PLAN.md:11-84` e confira manualmente:

```text
Fase 1 termina em build/SSR e navegação local.
Fase 3 começa com backend FastAPI.
Deploy aparece só na Fase 5.
```

---

### Task 2: Ajustar timing do backend em `ARCHITECTURE.md`

**Files:**
- Modify: `docs/ARCHITECTURE.md:12-14`
- Modify: `docs/ARCHITECTURE.md:63-79`
- Modify: `docs/ARCHITECTURE.md:141-145`

**Interfaces:**
- Consumes: `PLAN.md` reordenado na Task 1.
- Produces: arquitetura final sem sugerir backend prematuro.

- [ ] **Step 1: Ajustar descrição do backend mínimo**

Substitua:

```markdown
**Backend (mínimo)**
- **Python 3.14+** com **FastAPI** — API enxuta, com apenas duas responsabilidades: proxy do YouTube e recebimento de formulários. **Sem banco de dados no MVP.**
- **uv** — gerenciador de pacotes (substitui pip/poetry).
```

Por:

```markdown
**Backend (mínimo, criado só na fase de integração)**
- **Python 3.14+** com **FastAPI** — API enxuta, com apenas duas responsabilidades: proxy do YouTube e recebimento de formulários. **Sem banco de dados no MVP.**
- **uv** — gerenciador de pacotes (substitui pip/poetry).
- O diretório `backend/` não bloqueia o setup inicial: ele nasce quando o `PLAN.md` chegar à integração com YouTube.
```

- [ ] **Step 2: Ajustar comentário da árvore de pastas**

Substitua:

```markdown
├── backend/                          # FastAPI mínimo (Python 3.14 + uv)
```

Por:

```markdown
├── backend/                          # FastAPI mínimo (criado na Fase 3 do PLAN.md)
```

- [ ] **Step 3: Ajustar Deployment**

Substitua:

```markdown
## 6. Deployment
- **Frontend (Angular SSR):** Vercel, Netlify ou Cloudflare Pages com suporte a SSR. Build via `ng build` + adapter de SSR; deploy automático a cada push na `main`.
- **Backend (FastAPI):** Render ou Fly.io (planos gratuitos), rodando com `uvicorn`. Variáveis de ambiente configuradas no painel do provedor.
- **CI/CD:** GitHub Actions — lint + build do frontend e checagem do backend a cada PR; deploy automático na `main`.
- **Alternativa mais enxuta:** se preferir não manter um servidor separado, o proxy do YouTube e os formulários podem virar **serverless functions** no mesmo host do frontend, dispensando o FastAPI. Mantido como opção.
```

Por:

```markdown
## 6. Deployment
- **Frontend (Angular SSR):** Vercel, Netlify ou Cloudflare Pages com suporte a SSR. O primeiro deploy acontece depois do skeleton navegável validar SSR localmente.
- **Backend (FastAPI):** Render ou Fly.io (planos gratuitos), rodando com `uvicorn`. Só fazer deploy depois de YouTube ou formulários funcionarem localmente.
- **CI/CD:** GitHub Actions pode ser adicionado quando houver necessidade explícita de automação. Não é gate do setup inicial.
- **Alternativa mais enxuta:** serverless functions ficam fora do caminho padrão porque `AI_RULES.md` fixa FastAPI; reabrir essa decisão só com aprovação explícita.
```

- [ ] **Step 4: Verificar consistência da arquitetura**

Use `Grep` em `docs/ARCHITECTURE.md`:

```text
Pattern: "deploy automático|serverless functions|criado na Fase 3|não bloqueia o setup inicial"
Expected: "deploy automático" ausente; "criado na Fase 3" e "não bloqueia o setup inicial" presentes; serverless descrito como fora do caminho padrão.
```

---

### Task 3: Ajustar regras operacionais em `AI_RULES.md`

**Files:**
- Modify: `docs/AI_RULES.md:27-34`
- Modify: `docs/AI_RULES.md:69-75`

**Interfaces:**
- Consumes: `PLAN.md` reordenado e `ARCHITECTURE.md` ajustado.
- Produces: regra clara para agentes não criarem infraestrutura fora de ordem.

- [ ] **Step 1: Adicionar regra de timing na seção Arquitetura**

Depois desta linha:

```markdown
- Nunca desviar da estrutura de pastas definida em ARCHITECTURE.md.
```

Adicione:

```markdown
- A estrutura de pastas é alvo final do MVP; criar diretórios somente quando o passo atual do PLAN.md exigir.
```

- [ ] **Step 2: Adicionar regra contra backend/deploy prematuros**

Depois desta linha:

```markdown
- Sempre trabalhar a partir do PLAN.md — não inventar tarefas.
```

Adicione:

```markdown
- Nunca criar backend, deploy, CI/CD ou automações antes do passo correspondente no PLAN.md.
```

- [ ] **Step 3: Verificar regras novas**

Use `Grep` em `docs/AI_RULES.md`:

```text
Pattern: "criar diretórios somente|Nunca criar backend, deploy, CI/CD"
Expected: as duas regras aparecem uma vez cada.
```

---

### Task 4: Confirmar que `PRD.md` fica intacto

**Files:**
- Read only: `docs/PRD.md`

**Interfaces:**
- Consumes: decisões do spec.
- Produces: confirmação de que produto não foi reescopado.

- [ ] **Step 1: Ler MVP e restrições**

Use `Read` em `docs/PRD.md:38-62` e confirme:

```text
YouTube Data API continua P0.
Contato e oração continuam P0.
Sem armazenar dados sensíveis continua explícito.
```

- [ ] **Step 2: Não editar o arquivo**

Não modifique `docs/PRD.md`. Se houver pressão para editar, limitar a uma nota de fase técnica só após aprovação do usuário.

---

### Task 5: Revisão final dos docs atualizados

**Files:**
- Read: `docs/PLAN.md`
- Read: `docs/ARCHITECTURE.md`
- Read: `docs/AI_RULES.md`
- Read: `docs/PRD.md`

**Interfaces:**
- Consumes: Tasks 1-4 concluídas.
- Produces: docs prontos para iniciar documentação/código pelo Passo 1.

- [ ] **Step 1: Rodar checagens textuais mínimas**

Use `Grep`:

```text
Path: docs/PLAN.md
Pattern: "deploy do frontend em branco"
Expected: zero ocorrências.
```

```text
Path: docs/PLAN.md
Pattern: "## Fase 3 — Integração com o YouTube"
Expected: uma ocorrência.
```

```text
Path: docs/ARCHITECTURE.md
Pattern: "criado só na fase de integração|criado na Fase 3"
Expected: ocorrências presentes.
```

```text
Path: docs/AI_RULES.md
Pattern: "Nunca criar backend, deploy, CI/CD ou automações antes do passo correspondente no PLAN.md"
Expected: uma ocorrência.
```

- [ ] **Step 2: Checar conflito principal**

Confirme manualmente:

```text
PLAN.md não pede backend antes da Fase 3.
ARCHITECTURE.md não diz que backend precisa existir no setup inicial.
AI_RULES.md manda seguir PLAN.md antes de criar backend/deploy/automações.
PRD.md mantém YouTube e formulários no MVP.
```

- [ ] **Step 3: Registrar status ao usuário**

Como este diretório não é um repo git válido, informe:

```text
Docs atualizados localmente. Não houve commit porque o diretório atual não é um repositório git válido.
```

---

## Self-Review

- Spec coverage: decisões aprovadas aparecem nas Tasks 1-3; `PRD.md` preservado na Task 4; revisão cruzada na Task 5.
- Placeholder scan: sem `TBD`, `TODO`, “implementar depois” ou instruções vagas.
- Type consistency: sem interfaces de código novas; nomes de fases e arquivos batem com os docs lidos.
