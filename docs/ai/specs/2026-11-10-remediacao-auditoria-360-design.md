# Especificação Técnica (Spec) — Remediação Completa da Auditoria 360° (`/review max geral`)

- **Artefato:** `docs/ai/specs/2026-11-10-remediacao-auditoria-360-design.md`
- **Padrão Normativo:** `docs/ai/specs/` (Harness Nível 3 CPB)
- **Data:** 10 de Novembro de 2026
- **Branch Alvo:** `feat/redesign`
- **Status:** Aprovado pelo Usuário (Risk Score 0/100 no `/plan-criticize`)

---

## 1. Contexto, Motivação e Escopo

A auditoria exaustiva de 360° (`/review max geral`) realizada sobre a branch `feat/redesign` (comparada à `main` e incluindo alterações locais de governança) inspecionou o monorepo (`frontend/` Angular 22 SSR + `functions/` Firebase Cloud Functions v2 / Express 5) sob os **8 Eixos Normativos Corporativos**.

Foram identificados **12 apontamentos técnicos** (4 `🚨 SEC`, 4 `🔴 BUG`, 4 `🟡 RISK`) que precisam ser remediados antes da abertura/fusão do Pull Request para `main`.

### 1.1. Mapa de Rastreabilidade dos 12 Apontamentos

| ID | Severidade | Eixo Normativo | Arquivo(s) Alvo | Síntese do Problema |
| :--- | :---: | :--- | :--- | :--- |
| **SEC-01** | `🚨 SEC` | Eixo 2 (Zero-Trust) | `functions/src/config.ts` | `appEnv` assume `'development'` por padrão se `APP_ENV` não estiver definida no Cloud Run (`K_SERVICE`), expondo `/scalar`, `/openapi.json` e CORS irrestrito em produção. |
| **SEC-02** | `🚨 SEC` | Eixo 2 (Zero-Trust) | `functions/src/index.ts` | CORS aceita qualquer domínio terminado em `.web.app` ou `.firebaseapp.com` com `credentials: true`, permitindo requisições cross-origin de projetos Firebase de terceiros. |
| **SEC-03** | `🚨 SEC` | Eixo 2 / Eixo 3 | `firestore.rules` | Coleções públicas `mensagens_contato`, `pedidos_oracao` e `pedidos_estudo` não restringem chaves com `.keys().hasOnly(...)`, permitindo injeção de campos arbitrários até 1 MiB. |
| **SEC-04** | `🚨 SEC` | Eixo 2 / Eixo 7 | `frontend/src/app/core/services/admin-cms.service.ts` | `uploadBanner` e `uploadMinisterioImage` não validam magic bytes reais nem tamanho máximo (5 MB) no cliente e interpolam `file.name` sem sanitização no Storage path. |
| **BUG-01** | `🔴 BUG` | Eixo 1 / Eixo 5 | `functions/src/services/notification.service.ts`, `functions/src/routes/forms.router.ts` | Falhas de persistência no Firestore são silenciadas (`catch` apenas loga) retornando HTTP 200 falso-positivo; `...data` persiste propriedades extras não sanitizadas; `fetch` do Telegram não possui `AbortSignal.timeout`. |
| **BUG-02** | `🔴 BUG` | Eixo 2 (OpenAPI DX) | `functions/src/openapi.ts`, `docs/api/openapi.json`, `frontend/src/app/core/models/api-generated.d.ts` | `servers: [{ url: '/api' }]` combinado a paths `/api/...` gera chamadas duplicadas `/api/api/...` no Scalar; 4 rotas produtivas estão ausentes da spec. |
| **BUG-03** | `🔴 BUG` | Eixo 4 (CI/CD) | `.github/workflows/ci.yml` | Job `validate-backend` tenta executar Python 3.14 / `uv` no diretório inexistente `backend/`, quebrando a esteira de CI e deixando `functions/` sem validação. |
| **BUG-04** | `🔴 BUG` | Eixo 7 (Tokens/A11y) | `frontend/src/tokens.css` | Tokens semânticos de Dark Mode e High Contrast estão restritos a `@media`, ignorando as classes `.dark` e `.high-contrast` aplicadas dinamicamente no `<html>`/`<body>`. |
| **RISK-01** | `🟡 RISK` | Eixo 3 (Cache) | `functions/src/services/youtube.service.ts` | `getPlaylistVideos`, `getLatestVideos` e `getLiveStatus` usam `get`/`set` manual em vez de `memoryCache.singleflight(...)`, ficando vulneráveis a *Cache Stampede*. |
| **RISK-02** | `🟡 RISK` | Eixo 3 (`/db-documentar`) | `docs/database/database-schema.md` | Ausência do artefato canônico de documentação de esquema das coleções Firestore introduzidas/alteradas na branch. |
| **RISK-03** | `🟡 RISK` | Eixo 4 (Hardening CI) | `.github/workflows/{ci,adr-lint,gitleaks,openapi-diff}.yml` | Actions referenciadas por tags mutáveis (`@v4`, `@v2`) em vez de commit SHA-256 de 40 dígitos, e ausência de `permissions: contents: read` e `timeout-minutes` em todos os jobs. |
| **RISK-04** | `🟡 RISK` | Eixo 7 (WCAG 2.2 AA) | `frontend/src/app/shared/ui/modal/modal.component.ts` | Modal utiliza `z-50` hardcoded em vez de `z-[var(--z-modal)]`, botão fechar tem `32x32px` (`h-8 w-8`, abaixo do mínimo WCAG de `44x44px`) e foco só roda no `ngAfterViewInit`/`ngOnDestroy` em vez de reagir a `isOpen()`. |

### 1.2. Anti-Escopo (O que NÃO será alterado)
- Nenhuma nova dependência de runtime será instalada em `frontend/` ou `functions/` (princípio YAGNI / Ponytail).
- Nenhuma alteração na arquitetura de autenticação Firebase Auth ou no fluxo de login administrativo.
- Nenhuma migração destrutiva de dados existentes no Cloud Firestore.

### 1.3. Restrições Técnicas & Limites Operacionais
1. **Orçamento de Memória e Timeout no Cloud Functions v2:** Operação restrita a `256MiB` de RAM, `timeoutSeconds: 30` e `maxInstances: 10` em `southamerica-east1`. Chamadas externas (`fetch` para YouTube Data API v3 e Telegram Bot API) têm orçamento máximo de latência de **5000ms** (`AbortSignal.timeout(5000)`).
2. **Limites do Cloud Firestore e Firebase Storage:** Documentos públicos de formulários (`mensagens_contato`, `pedidos_oracao`, `pedidos_estudo`) têm limite estrito de chaves via `.keys().hasOnly(...)` e tamanho máximo por campo para evitar exaustão do limite de `1 MiB` por documento. Uploads no Storage têm teto de `5 MiB` (`5 * 1024 * 1024` bytes).
3. **Orçamento de Bundle Angular 22 SSR:** Nenhuma biblioteca externa de validação de arquivos (ex.: `file-type`) pode ser adicionada ao bundle do navegador; a inspeção de magic bytes deve usar `File.slice(0, 12).arrayBuffer()` nativo da Web API (`0 KB` de overhead).
4. **Compatibilidade Retrógrada de Contratos:** Rotas legadas (`/api/contato`, `/api/oracao`) devem continuar retornando `{ error: string }` por padrão e `application/problem+json` (RFC 9457) quando o cliente enviar `Accept: application/problem+json` ou acessar `/api/v2/*`.

### 1.4. Matriz de 3 Alternativas de Resolução

| Dimensão | Abordagem A: Lean (Mínima) | Abordagem B: Equilibrada (Escolhida — Ockham/Ponytail) | Abordagem C: Robusta / Enterprise |
| :--- | :--- | :--- | :--- |
| **Segurança CORS & Env (`SEC-01`, `SEC-02`)** | Hardcodar `appEnv = 'production'` e apenas 1 domínio no `index.ts`. | **Detectar Cloud Run via `K_SERVICE`/`FUNCTION_TARGET` com fallback seguro para `'production'` e validar contra allowlist explícita `config.corsOrigins`.** | Provisionar Cloud Armor WAF + Secret Manager dinâmico para lista de origens por tenant. |
| **Persistência & Notificações (`BUG-01`)** | Remover o `try/catch` do `notification.service.ts` e deixar quebrar tudo (inclusive se o Telegram falhar). | **Isolar responsabilidades: falha no Firestore propaga erro HTTP 500/RFC 9457; falha no Telegram usa `AbortSignal.timeout(5000)` com degradação graciosa (log sem abortar request).** | Implementar fila Cloud Tasks / PubSub com Outbox Pattern transacional para envio assíncrono ao Telegram. |
| **Validação de Upload (`SEC-04`)** | Validar apenas a extensão do arquivo via regex `.endsWith('.png')`. | **Ler os primeiros 12 bytes (`slice(0, 12).arrayBuffer()`) no cliente para validar magic bytes reais (JPEG/PNG/WebP), limitar a 5 MB e sanitizar `file.name`.** | Cloud Function trigger `onObjectFinalized` com quarantine bucket, ClamAV e re-encoding Sharp. |
| **Temas & Acessibilidade (`BUG-04`, `RISK-04`)** | Duplicar manualmente os hexadecimais dentro de cada componente. | **Unificar seletores `@media` e classes `.dark`/`.high-contrast` em `tokens.css` e usar `effect()` reativo em `ModalComponent` com `z-[var(--z-modal)]` e alvo `44x44px`.** | Migrar para biblioteca externa de componentes (Angular CDK Overlay / Material Dialog completo). |

**Defesa da Escolha (Abordagem B):** Resolve 100% da causa raiz dos 12 apontamentos com zero novas dependências npm, mantendo o bundle intacto e preservando a simplicidade operacional do monorepo.

### 1.5. Pre-Mortem ("Falha às 3h da Manhã") & Casos de Borda Blindados

> *"Assuma que o deploy foi para produção e gerou incidente às 3h da manhã. O que causou e como blindamos?"*

1. **Cenário de Falha 1: Frontend em Preview Channel ou domínio `www` bloqueado pelo CORS após remover `.endsWith('.web.app')`.**
   - *Blindagem:* Incluir explicitamente tanto `https://iasdmangueiras.org.br` quanto `https://www.iasdmangueiras.org.br`, `https://iasd-mangueiras-web.web.app`, `https://iasd-mangueiras-web.firebaseapp.com`, `https://iasd-mangueiras.web.app` e `https://iasd-mangueiras.firebaseapp.com` em `config.corsOrigins`, além de permitir sobrescrita via variável de ambiente `CORS_ORIGINS` separada por vírgula.
2. **Cenário de Falha 2: Payload do frontend em `pedidos_oracao` ou `pedidos_estudo` é rejeitado por `PERMISSION_DENIED` no Firestore devido a campo opcional legítimo omitido no `.hasOnly(...)`.**
   - *Blindagem:* Mapeamos exaustivamente todos os escritores no frontend (`contato.service.ts`, `admin-cms.service.ts`, `estudos.page.ts`, `oracoes.page.ts`) e no backend (`notification.service.ts`) para garantir que 100% das chaves legítimas (`oracoesCount`, `origem`, `telefone`, `email`, etc.) constem na lista `.hasOnly([...])`.
3. **Cenário de Falha 3: Testes unitários do `AdminCmsService` quebram porque o objeto `File` mockado no Vitest/JSDOM não implementa `file.slice(0, 12).arrayBuffer()`.**
   - *Blindagem:* Se `typeof file.slice === 'function'` e `arrayBuffer` estiver disponível e o arquivo tiver `size >= 4`, valida os magic bytes; se `size === 0` ou os bytes lidos não baterem com JPEG/PNG/WebP (quando `size >= 4`), rejeita; em mocks sintéticos de teste com conteúdo textual curto (ex.: `new File(['x'], 'b.jpg', { type: 'image/jpeg' })`), exigir que os testes unitários passem magic bytes reais ou validar `file.type` quando `buffer.byteLength < 4` apenas se não houver assinatura inválida. Melhor ainda: atualizar os testes em `admin-cms.service.spec.ts` com um helper de `File` contendo os 12 magic bytes válidos de JPEG/PNG/WebP e um teste explícito rejeitando arquivo falsificado (ex.: executável `.exe` renomeado para `.png`).
4. **Cenário de Falha 4: Na `ModalComponent`, o `effect()` tenta focar `closeBtn` antes do `@if (isOpen())` renderizar o elemento no DOM.**
   - *Blindagem:* Usar `setTimeout(() => this.closeBtn?.nativeElement?.focus(), 0)` dentro do ramo `if (open)` do `effect()`, garantindo que a view condicional do Angular já tenha instanciado o `<button #closeBtn>` no DOM.

### 1.6. Reversibilidade & Procedimento de Rollback

Todas as alterações são backward-compatible e não alteram formatos de documentos já persistidos no Firestore. Em caso de anomalia pós-deploy:
```bash
# 1. Reverter commit de remediação mantendo histórico limpo
git revert HEAD

# 2. Rollback imediato do Hosting e Rules
firebase hosting:rollback
firebase deploy --only firestore:rules,storage:rules,functions
```

---

## 2. Design Técnico Detalhado por Frente de Trabalho

### Frente 1 — Segurança Zero-Trust, Resiliência & Cloud Functions (`functions/`)

#### 2.1. Detecção Segura de Ambiente (`functions/src/config.ts`) — `SEC-01`
- **Causa Raiz:** No Cloud Functions v2 (Cloud Run), `process.env.K_SERVICE` é injetada automaticamente pelo runtime do Google Cloud, mas `process.env.APP_ENV` pode não estar definida caso o deploy ocorra sem `.env` de produção.
- **Especificação da Mudança:**
  ```ts
  const isCloudRuntime = Boolean(process.env.K_SERVICE || process.env.FUNCTION_TARGET);
  export const config = {
    appName: process.env.APP_NAME || 'IASD Mangueiras API',
    appEnv: process.env.APP_ENV || (isCloudRuntime ? 'production' : 'development'),
    corsOrigins: [
      'https://iasdmangueiras.org.br',
      'https://www.iasdmangueiras.org.br',
      'https://iasd-mangueiras-web.web.app',
      'https://iasd-mangueiras-web.firebaseapp.com',
      'https://iasd-mangueiras.web.app',
      'https://iasd-mangueiras.firebaseapp.com',
      'http://localhost:4200',
      'http://localhost:4000',
      'http://127.0.0.1:4200',
      'http://127.0.0.1:4000',
    ],
    // ...
  };
  ```

#### 2.2. Política Estrita de CORS (`functions/src/index.ts`) — `SEC-02`
- **Causa Raiz:** `origin.endsWith('.web.app') || origin.endsWith('.firebaseapp.com')` autoriza qualquer aplicação hospedada no Firebase Hosting globalmente.
- **Especificação da Mudança:**
  - Remover os sufixos genéricos `.endsWith('.web.app')` e `.endsWith('.firebaseapp.com')`.
  - Permitir apenas `!origin || config.corsOrigins.includes(origin) || config.appEnv === 'development'`.

#### 2.3. Integridade de Persistência, Sanitização de Payload e Timeout Universal (`functions/src/services/notification.service.ts` & `functions/src/routes/forms.router.ts`) — `BUG-01`
- **Causa Raiz:**
  1. `saveContato` e `saveOracao` engolem exceções do Firestore no `catch`, fazendo a rota responder `200 OK` mesmo quando o dado foi perdido.
  2. O spread `...data` grava qualquer propriedade extra enviada no body JSON.
  3. O `fetch` para a API do Telegram não define `signal: AbortSignal.timeout(5000)`, podendo reter a função até o limite de 30s.
- **Especificação da Mudança:**
  - Em `notification.service.ts`:
    - `saveContato(data: ContatoIn)`: Desestruturar explicitamente `{ nome, email, telefone: data.telefone ?? '', assunto, mensagem, criadoEm: admin.firestore.FieldValue.serverTimestamp(), lido: false }` e deixar erros do Firestore propagarem para o caller (logando antes de relançar).
    - `saveOracao(data: OracaoIn)`: Desestruturar explicitamente `{ nome, email: data.email ?? '', pedido, privado: Boolean(data.privado), criadoEm: admin.firestore.FieldValue.serverTimestamp(), orado: false }` e propagar falhas do Firestore.
    - `sendTelegramAlert(text: string)`: Adicionar `signal: AbortSignal.timeout(5000)` na chamada `fetch` e verificar `!res.ok`. Manter degradação graciosa (falha no Telegram não deve abortar a resposta `200 OK` se o registro já foi salvo no Firestore).
  - Em `forms.router.ts`:
    - Envolver os handlers `POST /contato` e `POST /oracao` em `try { ... } catch (err) { next(err); }` para que falhas reais de persistência sejam encaminhadas ao middleware global de erros (RFC 9457 / HTTP 500).

#### 2.4. Prevenção de Cache Stampede via Single-Flight (`functions/src/services/youtube.service.ts`) — `RISK-01`
- **Causa Raiz:** `MemoryCache.singleflight` já existe e está testado em `cache.service.ts`, mas `YoutubeService` ainda faz `memoryCache.get()` / `memoryCache.set()` manualmente.
- **Especificação da Mudança:**
  - Refatorar `getPlaylistVideos`, `getLatestVideos` e `getLiveStatus` em `functions/src/services/youtube.service.ts` para encapsular a lógica de busca externa dentro de `memoryCache.singleflight(cacheKey, ttlSeconds, async () => { ... })`.
  - No caso de `getLatestVideos` com fallback quando `results.length === 0`, retornar o resultado do fallback dentro do loader (ou preservar o TTL reduzido de 60s apenas quando vazio).

---

### Frente 2 — Contrato OpenAPI 3.1, Regras Firestore & Governança de Banco (`docs/database/`)

#### 2.5. Alinhamento e Completude do Contrato OpenAPI 3.1 (`functions/src/openapi.ts`, `docs/api/openapi.json`, `frontend/src/app/core/models/api-generated.d.ts`) — `BUG-02`
- **Causa Raiz:** `servers: [{ url: '/api' }]` conflita com paths iniciados em `/api/...`, e 4 rotas ativas nos routers não constam na especificação.
- **Especificação da Mudança:**
  - Alterar `servers` em `functions/src/openapi.ts` para `[{ url: '/', description: 'API Root' }]`.
  - Documentar os 4 endpoints faltantes em `paths`:
    1. `GET /api/youtube/catalog` (retorna catálogo estruturado por categorias + vídeos recentes).
    2. `GET /api/youtube/playlist/{category}` (parâmetro de path `category`, query `max_results`, resposta `YouTubeLatestResponse` ou 404 `ProblemDetails`).
    3. `GET /api/youtube/presente7` (query `max_results`, resposta `YouTubeLatestResponse`).
    4. `GET /api/licao/hoje` (resposta `LicaoHojeResponse` com `{ data, titulo, licao, link }`).
  - Sincronizar `docs/api/openapi.json` e regenerar `frontend/src/app/core/models/api-generated.d.ts` via `npm run openapi:types`.

#### 2.6. Blindagem de Schemas nas Regras do Firestore (`firestore.rules`) — `SEC-03`
- **Causa Raiz:** As regras públicas `allow create` de `mensagens_contato`, `pedidos_oracao` e `pedidos_estudo` validam os campos obrigatórios, mas não impedem a inserção de chaves arbitrárias extras.
- **Especificação da Mudança:**
  - `mensagens_contato`: adicionar `request.resource.data.keys().hasOnly(['nome', 'email', 'telefone', 'assunto', 'mensagem', 'criadoEm', 'lido'])`.
  - `pedidos_oracao`: adicionar `request.resource.data.keys().hasOnly(['nome', 'email', 'pedido', 'privado', 'criadoEm', 'orado', 'oracoesCount'])`.
  - `pedidos_estudo`: adicionar `request.resource.data.keys().hasOnly(['acao', 'estudoId', 'estudoTitulo', 'categoria', 'criadoEm', 'origem', 'nome', 'telefone', 'email'])`.

#### 2.7. Documentação Canônica de Banco de Dados (`docs/database/database-schema.md`) — `RISK-02`
- **Causa Raiz:** Conformidade obrigatória com o Eixo 3 (`/db-documentar`) para mudanças em modelos/coleções e regras de persistência.
- **Especificação da Mudança:**
  - Criar `docs/database/database-schema.md` contendo:
    1. Visão Geral da Arquitetura de Dados (Cloud Firestore NoSQL em `southamerica-east1` + Firebase Storage + Cache L1 In-Memory com Single-Flight).
    2. Diagrama Entidade-Relacionamento / Coleções em **Mermaid (`erDiagram`)** cobrindo todas as 15 coleções (`banners`, `comunicados`, `eventos`, `ministerios`, `pequenos_grupos`, `estudos`, `horarios`, `avisos_horario`, `escalas`, `cronogramas_culto`, `mensagens_contato`, `pedidos_oracao`, `pedidos_estudo`, `users`, `config`).
    3. Dicionário de Dados completo com tipos, obrigatoriedade, validadores de `firestore.rules` e **Escala de Confiança (`🟢 Alta`)** extraída diretamente de `firestore.rules` e dos services TypeScript.
    4. Matriz de Controle de Acesso (RBAC Público vs Autenticado vs Admin) e Políticas de Storage (`storage.rules`).

---

### Frente 3 — Hardening de CI/CD & Workflows GitHub Actions (`.github/workflows/`)

#### 2.8. Substituição do Job Obsoleto e Pinning SHA-256 (`.github/workflows/*.yml`) — `BUG-03` & `RISK-03`
- **Causa Raiz:** `ci.yml` referencia `backend/` (Python), que foi substituído por `functions/` (Node 22 / TypeScript). Os 4 workflows usam tags mutáveis e carecem de `timeout-minutes` / `permissions` uniformes.
- **Especificação da Mudança:**
  - Em `.github/workflows/ci.yml`:
    - Adicionar `permissions: contents: read` no topo do workflow.
    - Em `validate-frontend`: adicionar `timeout-minutes: 15`, incluir passo `npm run lint:deps` (Dependency Cruiser) e fixar actions por commit SHA-256:
      - `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2`
      - `actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0`
    - Substituir `validate-backend` por `validate-functions`:
      - `defaults.run.working-directory: functions`
      - `timeout-minutes: 10`
      - Node `22`, `cache: 'npm'`, `cache-dependency-path: functions/package-lock.json`
      - Steps: `npm ci`, `npm run lint:deps`, `npm test`, `npm run build`.
  - Em `.github/workflows/adr-lint.yml`, `gitleaks.yml` e `openapi-diff.yml`:
    - Garantir `permissions: contents: read` e `timeout-minutes: 10` em todos os jobs.
    - Fixar todas as actions públicas (`actions/checkout`, `actions/setup-python`, `actions/setup-node`, `gitleaks/gitleaks-action`) por commit SHA-256 de 40 dígitos com comentário da tag semântica correspondente.

---

### Frente 4 — Frontend Angular, Design Tokens, Acessibilidade WCAG 2.2 AA & Sanitização de Upload (`frontend/`)

#### 2.9. Validação de Magic Bytes, Tamanho e Sanitização de Nome no Upload (`frontend/src/app/core/services/admin-cms.service.ts`) — `SEC-04`
- **Causa Raiz:** `uploadBanner` e `uploadMinisterioImage` enviam o arquivo diretamente ao Firebase Storage sem validar assinatura binária (magic bytes), tamanho máximo (5 MB) ou caracteres especiais/path traversal em `file.name`.
- **Especificação da Mudança:**
  - Criar método privado `private async validateAndBuildStoragePath(folder: string, file: File): Promise<string>` em `AdminCmsService`:
    1. Verificar `file.size <= 5 * 1024 * 1024` (5 MB); lançar erro amigável caso exceda.
    2. Ler os primeiros 12 bytes via `file.slice(0, 12).arrayBuffer()` (com fallback seguro para ambientes de teste/mock onde `slice` possa não existir) e validar as assinaturas binárias permitidas:
       - JPEG: `FF D8 FF`
       - PNG: `89 50 4E 47 0D 0A 1A 0A`
       - WebP: `52 49 46 46` (`RIFF`) nos bytes 0..3 e `57 45 42 50` (`WEBP`) nos bytes 8..11.
    3. Sanitizar o nome do arquivo: `const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');`.
    4. Retornar `${folder}/${Date.now()}_${safeName}`.
  - Aplicar `validateAndBuildStoragePath` em `uploadBanner` e `uploadMinisterioImage` e adicionar testes unitários em `admin-cms.service.spec.ts`.

#### 2.10. Suporte Híbrido Media Query + Classe em `tokens.css` (`frontend/src/tokens.css`) — `BUG-04`
- **Causa Raiz:** `tokens.css` aplica variáveis de tema escuro apenas em `@media (prefers-color-scheme: dark)` e alto contraste apenas em `@media (prefers-contrast: more)`, deixando os seletores `.dark` e `.high-contrast` de `styles.css` sem atualização dos tokens `--bg-*`, `--text-*`, `--border-*` e `--surface-*`.
- **Especificação da Mudança:**
  - Extrair ou espelhar as declarações de variáveis de Dark Mode também para `:root.dark, .dark, [data-theme="dark"]`.
  - Extrair ou espelhar as declarações de variáveis de High Contrast (WCAG AAA) também para `:root.high-contrast, .high-contrast, [data-theme="high-contrast"]`.

#### 2.11. Acessibilidade WCAG 2.2 AA e Z-Index Semântico no `ModalComponent` (`frontend/src/app/shared/ui/modal/modal.component.ts`) — `RISK-04`
- **Causa Raiz:**
  1. Uso de `z-50` em vez de `z-[var(--z-modal)]`.
  2. Botão de fechar com `h-8 w-8` (`32x32px`), inferior ao alvo mínimo de toque de `44x44px` (`h-11 w-11`).
  3. Gerenciamento de foco (`closeBtn.focus()` e `restoreFocus()`) atrelado ao ciclo de vida de criação/destruição do componente (`ngAfterViewInit`/`ngOnDestroy`) em vez de reagir às transições do signal `isOpen()`.
- **Especificação da Mudança:**
  - Substituir `z-50` por `z-[var(--z-modal)]` no backdrop do modal.
  - Alterar classes de dimensão do botão fechar de `h-8 w-8` para `h-11 w-11` (`44x44px`).
  - No `constructor()`, registrar um `effect()` que monitora `this.isOpen()`:
    - Quando `isOpen()` transicionar para `true`: capturar `document.activeElement` como `previouslyFocusedElement` e agendar foco no `closeBtn` (`queueMicrotask` / `setTimeout(..., 0)`).
    - Quando `isOpen()` transicionar para `false`: restaurar o foco para `previouslyFocusedElement`.
  - Atualizar/adicionar teste unitário em `modal.component.spec.ts` verificando as classes e o comportamento de foco.

---

## 3. Critérios de Aceite (BDD)

```gherkin
Funcionalidade: Remediação integral dos 12 apontamentos da Auditoria 360°

  Cenário 1: Ambiente de produção seguro por padrão nas Cloud Functions (SEC-01 & SEC-02)
    Dado que a Cloud Function executa no Cloud Run (variável K_SERVICE definida) sem APP_ENV explícita
    Quando o módulo config.ts é carregado
    Então config.appEnv deve ser "production"
    E requisições GET para "/scalar" ou "/openapi.json" devem retornar HTTP 404
    E requisições CORS de domínios ".web.app" não listados em corsOrigins devem retornar HTTP 403

  Cenário 2: Persistência confiável e timeout no envio de formulários (BUG-01)
    Dado que o cliente envia POST "/api/contato" com payload válido
    Quando o Firestore falha ao gravar o documento
    Então a API deve responder com erro HTTP 500 (ou RFC 9457 ProblemDetails) em vez de 200 OK
    E chamadas ao Telegram devem abortar após no máximo 5000ms sem bloquear a resposta

  Cenário 3: Prevenção de Cache Stampede no YouTube Service (RISK-01)
    Dado que o cache para "youtube:live:UC..." expirou
    Quando 5 requisições simultâneas solicitam getLiveStatus()
    Então apenas 1 chamada HTTP externa ao YouTube deve ser disparada via memoryCache.singleflight()

  Cenário 4: Contrato OpenAPI 3.1 íntegro e sincronizado (BUG-02)
    Dado o arquivo functions/src/openapi.ts atualizado
    Quando o script "npm run openapi:types" e a validação de contrato são executados
    Então "servers[0].url" deve ser "/"
    E todas as 9 rotas da API devem estar documentadas e refletidas em docs/api/openapi.json e api-generated.d.ts

  Cenário 5: Validação de upload e acessibilidade no Frontend (SEC-04, BUG-04, RISK-04)
    Dado um arquivo com magic bytes inválidos ou tamanho > 5MB
    Quando AdminCmsService.uploadBanner() é chamado
    Então o upload deve ser rejeitado antes de chamar o Firebase Storage
    E o ModalComponent deve exibir botão de fechar com 44x44px (h-11 w-11) e z-index var(--z-modal)
```

---

## 4. Plano de Verificação Determinística

Após a implementação (mediante aprovação desta Spec), os seguintes comandos deverão passar com 0 erros:

```bash
# 1. Testes e Build das Cloud Functions
npm --prefix functions run lint:deps
npm --prefix functions test
npm --prefix functions run build

# 2. Sincronização de Contratos OpenAPI -> Frontend Types
npm run openapi:types

# 3. Linters, Typecheck, Testes Unitários e Build do Frontend
npm --prefix frontend run lint:deps
npm --prefix frontend run lint:css
npm --prefix frontend run typecheck
npm --prefix frontend run test:ci
npm --prefix frontend run build

# 4. Governança do Harness e Grafo
python3 .agents/scripts/adr/validate_adrs.py
python3 .agents/scripts/harness/verify_hooks.py
graphify update .
```
