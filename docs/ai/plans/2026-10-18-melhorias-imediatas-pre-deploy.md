# Plano de Implementação — Melhorias Imediatas de Pré-Deploy (IASD Mangueiras)

- **Artefato:** `docs/ai/plans/2026-10-18-melhorias-imediatas-pre-deploy.md`
- **Padrão Normativo:** `docs/ai/plans/` (Harness Nível 3 CPB)
- **Data:** 18 de Outubro de 2026  
- **Status:** Em Revisão (Blindado via `/plan-criticize`)
- **Autores:** Orchestrator & Engenharia de Software

---

## 🎯 1. Objetivo & Escopo Core

### 1.1. Contexto e Motivação
A auditoria técnica geral do ecossistema identificou pendências pontuais de infraestrutura, conformidade PWA e regras de segurança que impedem uma publicação 100% segura e resiliente:
1. **Infraestrutura/DX:** A rota `/scalar` aponta para `/openapi.json` que não existe e fica exposta em produção sem proteção; os health checks `/livez` e `/readyz` não são roteados no `firebase.json`.
2. **PWA Compliance:** O manifest PWA não possui ícones quadrados (192x192 e 512x512) com suporte a maskable, inviabilizando a instalação do app no Android/iOS.
3. **Storage Security:** `storage.rules` restringe uploads apenas a `/banners` e `/ministerios`, quebrando uploads de eventos, comunicados e pequenos grupos.
4. **SEO Freshness:** Metadados do `sitemap.xml` possuem datas defasadas de agosto de 2026.

### 1.2. O que NÃO será feito (Anti-Scope)
- Não será alterada a lógica de autenticação do `AuthService` ou modelo de usuários.
- Não serão feitas refatorações de grande porte em componentes Angular neste ciclo.
- Não haverá criação de coleções de banco sem validação prévia de esquema.

---

## ⚖️ 2. Matriz de 3 Alternativas de Resolução

| Dimensão | Opção 1: Abordagem Lean (Mínima) | Opção 2: Abordagem Equilibrada (Recomendada) | Opção 3: Abordagem Robusta (Complexa) |
| :--- | :--- | :--- | :--- |
| **Scalar / OpenAPI** | Apenas comentar ou remover a rota `/scalar` do Express. | **Condicionar `/scalar` estritamente a `appEnv !== 'production'`** e incluir mock/spec estática local para desenvolvimento. | Implementar gerador dinâmico de OpenAPI a partir das rotas Express + Swagger UI autenticado. |
| **Ícones PWA** | Redimensionar via CSS o `og-image.png`. | **Gerar ícones PNG quadrados dedicados (192x192 e 512x512)** em `frontend/public/icons/` com `purpose: "any maskable"`. | Pipeline de geração dinâmica de splash screens para todos os breakpoints iOS/Android. |
| **Storage Rules** | Abrir permissão genérica para qualquer pasta sob autenticação admin. | **Adicionar explicitamente as coleções do CMS (`banners`, `ministerios`, `eventos`, `comunicados`, `pgs`)** com restrição de MIME e tamanho $\le 5\text{MB}$. | Implementar Cloud Function com trigger `onObjectFinalized` para scan de malware e otimização WebP no upload. |

**Defesa da Escolha (Opção 2):**
A Opção 2 adota a **Navalha de Ockham**, resolvendo a causa raiz dos 4 problemas com zero dependências externas adicionais, mantendo segurança Zero-Trust e garantindo aderência estrita aos guias normativos da CPB.

---

## 🚧 3. Restrições Técnicas & Limites Operacionais

1. **Cold Start & Limites das Cloud Functions v2:** As Cloud Functions operam na região `southamerica-east1` com 256MiB de memória e timeout de 30s. Nenhuma nova dependência pesada pode ser adicionada ao bundle do backend.
2. **Cloud Secret Manager:** A função depende dos segredos `YOUTUBE_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. Caso não configurados, o backend deve entrar em degradação graciosa (*graceful degradation*) e nunca falhar o processo do Express.
3. **Compatibilidade PWA:** Ícones devem ser PNG reais, com padding de segurança para ícones adaptativos (*maskable*).

---

## 🔍 4. Casos de Borda & Invariantes de Segurança

1. **Tentativa de acesso a `/scalar` em Produção:** Deve retornar HTTP 404 estrito sem headers de depuração ou stack traces.
2. **Upload de arquivos maliciosos ou MIME spoofing:** `storage.rules` exige verificação de `request.resource.contentType.matches('image/(jpeg|jpg|png|webp)')` e `size < 5 * 1024 * 1024`.
3. **Ausência dos segredos do Telegram ou YouTube:**
   - Se `YOUTUBE_API_KEY` for omitida: o backend faz fallback para o RSS feed público do YouTube.
   - Se `TELEGRAM_BOT_TOKEN` for omitido: as mensagens de contato continuam sendo salvas com segurança no Firestore, sem lançar erro 500 no endpoint `/api/contato`.
4. **Sondas de Liveness (`/livez`) vs Readiness (`/readyz`):**
   - `/livez` responde 200 imediatamente para o balanceador.
   - `/readyz` verifica conectividade com o Firestore sem sobrecarregar a quota.

---

## 💀 5. Pre-Mortem & Análise de Modos de Falha

> *"Assuma que a aplicação falhou às 3h da manhã após o deploy. O que causou o incidente?"*

1. **Modo de Falha 1: Deploy das Cloud Functions falha porque os segredos não foram criados no GCP.**
   - *Mitigação:* As variáveis em `config.ts` já usam fallback `process.env.YOUTUBE_API_KEY || ''`. No entanto, na declaração de `functions.https.onRequest({ secrets: [...] })`, se a secret não existir no GCP Secret Manager, o deployment do Firebase CLI aborta.
   - *Ação Preventiva:* Criar as secrets ou passar flag condicional antes do deploy.
2. **Modo de Falha 2: Cache do Hosting serve versão antiga de ícones ou rotas 404.**
   - *Mitigação:* `firebase.json` já configura cache-control curto (3600s) para manifest e sitemap.

---

## 🔄 6. Reversibilidade & Procedimento de Rollback

1. **Atomicidade:** Todas as alterações desta rodada tocam apenas arquivos estáticos (`firebase.json`, `storage.rules`, `sitemap.xml`, `manifest.webmanifest`) e uma condicional simples em `functions/src/index.ts`.
2. **Rollback Rápido:**
   ```bash
   # Reverter arquivos locais
   git checkout HEAD -- firebase.json storage.rules functions/src/index.ts frontend/public/
   # Re-deploy do estado anterior estável
   firebase hosting:rollback
   ```
3. **Zero Downtime:** Não há alterações de esquema de banco de dados (Firestore migrations) envolvidas, tornando o rollback 100% instantâneo e livre de risco de corrupção de dados.

---

## 📋 7. Detalhamento das Tarefas de Implementação

### Tarefa 1: Proteção da Rota Scalar e Rewrites de Health em `firebase.json`
* **Arquivos:** [`functions/src/index.ts`](file:///Users/matheus.diniz_1/Documents/GitHub/IASD-Mangueiras/functions/src/index.ts), [`firebase.json`](file:///Users/matheus.diniz_1/Documents/GitHub/IASD-Mangueiras/firebase.json)
* **Ação:**
  - Em `functions/src/index.ts`, ativar `/scalar` exclusivamente quando `config.appEnv !== 'production'`.
  - Em `firebase.json`, adicionar as entradas de rewrite para `/livez` e `/readyz` apontando para a Cloud Function `api`.

### Tarefa 2: Ícones PWA e Atualização de `manifest.webmanifest`
* **Arquivos:** `frontend/public/icons/icon-192.png`, `frontend/public/icons/icon-512.png`, [`frontend/public/manifest.webmanifest`](file:///Users/matheus.diniz_1/Documents/GitHub/IASD-Mangueiras/frontend/public/manifest.webmanifest)
* **Ação:**
  - Gerar ícones 192x192 e 512x512 em `frontend/public/icons/`.
  - Registrar no manifest com `purpose: "any maskable"` e tipos `image/png`.

### Tarefa 3: Ampliação das Regras de Armazenamento (`storage.rules`)
* **Arquivo:** [`storage.rules`](file:///Users/matheus.diniz_1/Documents/GitHub/IASD-Mangueiras/storage.rules)
* **Ação:**
  - Adicionar permissões explícitas de escrita para administradores nas pastas: `banners`, `ministerios`, `eventos`, `comunicados`, `pgs`.

### Tarefa 4: Atualização de Metadados do `sitemap.xml`
* **Arquivo:** [`frontend/public/sitemap.xml`](file:///Users/matheus.diniz_1/Documents/GitHub/IASD-Mangueiras/frontend/public/sitemap.xml)
* **Ação:**
  - Atualizar o nó `<lastmod>` para a data atual (`2026-10-18`).

---

## 🧪 8. Testabilidade & Critérios de Aceite

- [ ] `tsc` em `functions` compila com zero erros.
- [ ] `npm --prefix functions test` executa com sucesso os 3 testes de liveness e readiness (`health.test.ts`).
- [ ] `npm --prefix frontend run typecheck` e `npm --prefix frontend run build` passam sem erros.
- [ ] `npm test` passa os 270 testes unitários sem regressão.
- [ ] Rota `/livez` e `/readyz` testadas via roteamento de desenvolvimento ou emulador.
- [ ] Manifest PWA validado sem avisos de ícone ausente.
