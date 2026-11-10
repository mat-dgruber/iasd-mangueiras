# Relatório de Análise e Preparação para Produção — IASD Mangueiras

**Data da Auditoria:** 31 de Agosto de 2026  
**Repositório:** `IASD-Mangueiras` (Angular 22 SSR + Firebase Functions TypeScript)  
**Status do Build & Testes:** 39 arquivos de teste / 188 testes passando (100% OK), compilação SSR concluída.

---

## 1. Síntese Executiva por Severidade

### 🔴 Crítico (Bloqueadores de Deploy e Segurança)

1. **Regra de Storage Bloqueia Upload de Fotos dos Ministérios**
   - **Localização:** `storage.rules:1-28` vs `frontend/src/app/core/services/admin-cms.service.ts:251`
   - **Problema:** `storage.rules` possui apenas regra para `/banners/{allPaths=**}`. A função `AdminCmsService.uploadMinisterioImage()` faz upload para `/ministerios/${Date.now()}_${file.name}`, o que resultará em erro `Firebase Storage: permission-denied` para qualquer administrador no painel.
   - **Ação:** Adicionar bloco de permissão no `storage.rules` para `match /ministerios/{allPaths=**}` com validação de `isAdmin()`, tamanho (< 5MB) e MIME type.

2. **Variável `APP_ENV` em Cloud Functions e Validação de CORS**
   - **Localização:** `functions/src/config.ts:16` e `functions/src/index.ts:14-38`
   - **Problema:** Em `config.ts`, `appEnv` utiliza fallback para `'development'`. Se a variável de ambiente `APP_ENV=production` não for injetada no deploy das Cloud Functions, a validação de CORS aceitará qualquer origem (`origin: true`), permitindo requisições arbitrárias de outros domínios para a API.
   - **Ação:** Configurar `APP_ENV=production` no ambiente das Functions ou garantir que `config.appEnv` adote fail-closed por padrão.

3. **Injeção de Segredos no GCP / Firebase Cloud Functions (v2)**
   - **Localização:** `functions/src/index.ts:17`
   - **Problema:** As Cloud Functions declaram dependência explícita dos segredos `YOUTUBE_API_KEY`, `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` via Secret Manager. O deploy falhará se esses segredos não estiverem criados no projeto Firebase/GCP.
   - **Ação:** Executar `firebase functions:secrets:set` para cada variável antes de disparar o comando `firebase deploy --only functions`.

---

### 🟠 Alto (Integridade de Dados, UX e Consistência Institucional)

1. **Dados de Fallback / Mocks em Arquivos JSON Locais**
   - **Localização:**
     - `frontend/src/content/eventos.json:9-13`: Evento com data retroativa (`2026-03-15`), endereço incorreto de outra localidade (`Rua Alcântara, 301 - Mangueiras, Belo Horizonte - MG` em vez de Tatuí-SP) e WhatsApp mockado (`5531999999999`).
     - `frontend/src/content/pgs.json:1-80`: Telefones e nomes mockados (`(15) 99811-2233`, `Lucas e Beatriz Oliveira`, etc.).
     - `frontend/src/content/escalas.json:4-46`: Escalas com datas retroativas fixas (`2026-08-29`).
   - **Problema:** Como o `ContentService` usa esses arquivos JSON locais como estado inicial antes de sincronizar com o Firestore (ou como fallback em falhas de rede / coleções vazias), usuários finais podem visualizar dados de exemplo ou endereços incorretos.
   - **Ação:** Limpar ou atualizar os JSONs locais com dados reais e oficiais de Tatuí-SP e semear o banco Firestore em produção.

2. **Endpoint de Lição com Resposta Hardcoded**
   - **Localização:** `functions/src/routes/forms.router.ts:49-60`
   - **Problema:** A rota `/licao/hoje` retorna resposta JSON estática ("3º Trimestre de 2026", Lição 8). Quando o trimestre avançar, os dados ficarão desatualizados.
   - **Ação:** Conectar à API externa de Lições da CPB/Adventech ou remover o endpoint se o frontend já utiliza o leitor web Adventech direto.

3. **Headers de Segurança HTTP Ausentes no `firebase.json`**
   - **Localização:** `firebase.json:85-91`
   - **Problema:** O cabeçalho `X-Content-Type-Options: nosniff` e `Referrer-Policy` estão configurados, mas faltam `X-Frame-Options` (proteção anti-clickjacking) e `Permissions-Policy`.
   - **Ação:** Incluir `X-Frame-Options: SAMEORIGIN` e `Permissions-Policy: camera=(), microphone=(), geolocation=()` nas regras globais do Hosting.

---

### 🟡 Médio (PWA, Assets e Boas Práticas)

1. **Ícones PWA Incompletos no Webmanifest**
   - **Localização:** `frontend/public/manifest.webmanifest:11-23`
   - **Problema:** O manifesto define apenas `favicon.ico` e `og-image.png` (1200x630). Faltam os ícones padrão para instalação mobile (`192x192` e `512x512` com `purpose: "maskable any"`).
   - **Ação:** Gerar os assets `icon-192x192.png` e `icon-512x512.png` e referenciá-los no manifesto.

2. **Avisos de Pacotes CommonJS no Build Angular**
   - **Localização:** `frontend/angular.json`
   - **Problema:** Dependências transitivas do `@tensorflow/tfjs` e `@firebase/firestore` (`seedrandom`, `@grpc/grpc-js`, `@grpc/proto-loader`, `whatwg-url`, `long`) emitem warnings de otimização durante o build.
   - **Ação:** Incluir os pacotes na lista `allowedCommonJsDependencies` do `angular.json` sob o target `build`.

3. **Restrições de API Key no Google Cloud Console**
   - **Localização:** `frontend/src/environments/environment.ts:10`
   - **Problema:** A API Key do Firebase (`AIzaSy...`) é pública por padrão no client web. Se não tiver restrição de HTTP Referrers no console GCP, ela pode ser reutilizada por terceiros.
   - **Ação:** Configurar restrição de domínio para `https://iasdmangueiras.org.br/*` e `https://iasd-mangueiras-web.firebaseapp.com/*` no GCP Console.

---

### 🟢 Baixo (Polimento e Manutenibilidade)

1. **Verificação de Permissão no AuthGuard**
   - **Localização:** `frontend/src/app/core/auth/auth.guard.ts:18`
   - **Problema:** O guard valida apenas `authService.isAuthenticated()`. A segurança real de gravação é garantida com excelência pelo `firestore.rules` (`isAdmin()`), mas na interface seria recomendável validar claims antes de exibir a rota administrativa.
   - **Ação:** Adicionar verificação de custom claim ou documento de admin após o login inicial.

---

## 2. Checklist de Ações Pré-Deploy

- [ ] **1. Firestore & Storage Rules:**
  - [ ] Adicionar regra de upload para `/ministerios/{allPaths=**}` em `storage.rules`.
  - [ ] Executar deploy de regras: `firebase deploy --only firestore:rules,storage`.
- [ ] **2. Firebase Cloud Functions:**
  - [ ] Configurar segredos no Secret Manager:
    - `firebase functions:secrets:set YOUTUBE_API_KEY`
    - `firebase functions:secrets:set TELEGRAM_BOT_TOKEN`
    - `firebase functions:secrets:set TELEGRAM_CHAT_ID`
  - [ ] Definir `APP_ENV=production` no ambiente das Functions.
  - [ ] Executar deploy: `firebase deploy --only functions`.
- [ ] **3. Conteúdo & Banco de Dados:**
  - [ ] Cadastrar o primeiro usuário administrador no Firestore (`usuarios_admin/{uid}`).
  - [ ] Atualizar os dados dos arquivos `frontend/src/content/eventos.json` (corrigir endereço de Belo Horizonte para Tatuí) e `pgs.json` com os PGs reais da igreja.
- [ ] **4. Hosting & Segurança:**
  - [ ] Adicionar `X-Frame-Options` e `Permissions-Policy` no `firebase.json`.
  - [ ] Adicionar ícones `192x192` e `512x512` no `manifest.webmanifest`.
  - [ ] Restringir a Firebase API Key no GCP Console para o domínio `iasdmangueiras.org.br`.
  - [ ] Executar deploy do Hosting: `firebase deploy --only hosting`.
