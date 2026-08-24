# RELATÓRIO DE AUDITORIA DE SEGURANÇA — IASD-Mangueiras (Pós-Remediação)

**Data:** 2026-08-24  
**Auditor:** Antigravity / Security Auditor  
**Escopo:** Backend (FastAPI) + Frontend (Angular SSR) + Firebase (Firestore/Storage Rules)  
**Referência:** `docs/guides/guia-seguranca-maxima.md` (Zero-Trust, LGPD, OWASP 2025)  

---

## Status Geral Pós-Correção

| Área | Veredicto | Detalhes |
| :--- | :--- | :--- |
| **Backend AST-SAST** | **PASS** | Sanitização de input, CSP estrito, rate limiting com proxy headers, CORS restrito, cache LRU thread-safe e logs com mascaramento LGPD. |
| **Frontend SAST** | **PASS** | Bypass de demo login removido, URLs de API dinâmicas por ambiente, authGuard fail-closed no SSR. |
| **Firestore & Storage Rules** | **PASS** | RBAC administrativo restrito (`isAdmin()`), validação de tipos/limites em pedidos e upload seguro com MIME types e tamanho máximo (5MB). |
| **Auditoria Cognitiva Zero-Trust** | **PASS** | Todas as vulnerabilidades críticas, altas e médias foram integralmente mitigadas. |

---

## Tabela de Vulnerabilidades e Status de Remediação

| ID | Severidade | Categoria (OWASP) | Onde | Status | Resolução Aplicada |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **CRITICAL** | A07:2021 — Autenticação / Segredos | `backend/.env` / `.env.example` | **MITIGADO** | `.env` protegido no `.gitignore` (não rastreado no git history); `backend/.env.example` atualizado com `DEBUG=false` e documentação segura para injeção via Secrets Manager / Vault / CI/CD. |
| **SEC-02** | **CRITICAL** | A07:2021 — Falhas de Autenticação | `frontend/src/app/core/auth/auth.service.ts` e `admin-login.page.ts` | **RESOLVIDO** | Extinção total do bypass `loginAsDemo()` e do botão de acesso demonstrativo na UI. Acesso administrativo restrito estritamente a credenciais reais autenticadas pelo Firebase Auth (Zero-Trust). |
| **SEC-03** | **HIGH** | A05:2021 — Configuração Insegura | `backend/app/main.py` | **RESOLVIDO** | CORS restrito explicitamente aos métodos `["GET", "POST", "OPTIONS"]` e cabeçalhos permitidos `["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"]`, eliminando wildcards. |
| **SEC-04** | **HIGH** | A05:2021 — Configuração Insegura | `backend/app/core/security.py` | **RESOLVIDO** | Cabeçalho `Content-Security-Policy` adicionado ao `SecurityHeadersMiddleware` com `default-src 'self'`, restrição de frames para domínios oficiais do YouTube e bloqueio de `object-src 'none'`. |
| **SEC-05** | **HIGH** | A01:2021 — Broken Access Control | `firestore.rules` e `storage.rules` | **RESOLVIDO** | Implementado RBAC com helper `isAdmin()` (custom claims, documento `usuarios_admin/{uid}` e domínio `@iasdmangueiras.org.br`). Escrita em coleções públicas e acesso a orações/estudos restritos a administradores. |
| **SEC-06** | **MEDIUM** | A05:2021 — Configuração Insegura | `frontend/src/environments/` e services | **RESOLVIDO** | Adicionado `apiUrl` parametrizado em `environment.ts` e `environment.development.ts`. `contato.service.ts` e `youtube.service.ts` atualizados para usar a variável dinâmica de ambiente. |
| **SEC-07** | **MEDIUM** | A04:2021 — Design Inseguro | `backend/app/core/rate_limiter.py` | **RESOLVIDO** | Implementada resolução de IP real do cliente com suporte a headers de proxies reversos (`CF-Connecting-IP`, `X-Real-IP`, `X-Forwarded-For`) e limpeza automática de IPs expirados (anti-DoS). |
| **SEC-08** | **MEDIUM** | A04:2021 — Design Inseguro | `backend/app/api/routes/youtube.py` | **RESOLVIDO** | Criado `youtube_rate_limiter` dedicado (60 req/min por IP) e aplicado nas rotas `/api/youtube/latest` e `/api/youtube/live`. |
| **SEC-09** | **MEDIUM** | A02:2021 — Falhas Criptográficas / LGPD | `backend/app/services/email_service.py` | **RESOLVIDO** | Implementadas funções `mask_string` e `mask_email` para registrar apenas telemetria e dados anonimizados/minimizados nos logs de e-mail. |
| **SEC-10** | **MEDIUM** | A05:2021 — Configuração Insegura | `backend/app/main.py` | **RESOLVIDO** | Endpoint `/scalar` e `/openapi.json` desabilitados / protegidos com HTTP 404 em ambiente de produção quando `debug=false`. |
| **SEC-11** | **LOW** | A05:2021 — Configuração Insegura | `frontend/src/environments/` | **RESOLVIDO** | Separação explícita de `apiUrl` e flags de ambiente entre desenvolvimento e produção. |
| **SEC-12** | **LOW** | A05:2021 — DoS / Memory Leak | `backend/app/core/cache.py` | **RESOLVIDO** | Adicionado `threading.Lock()`, limite máximo de capacidade (`maxsize=500`) e política de evicção LRU/expiração no `SimpleMemoryCache`. |
| **SEC-13** | **LOW** | A01:2021 — Broken Access Control | `frontend/src/app/core/auth/auth.guard.ts` | **RESOLVIDO** | Comportamento Fail-Closed no contexto SSR (`!isPlatformBrowser`), redirecionando para `/admin/login` em vez de permitir renderização prévia. |
| **SEC-14** | **LOW** | A05:2021 — Validação de Payload | `firestore.rules` | **RESOLVIDO** | Validação estrita de tipos e limites de tamanho em `pedidos_oracao` (≤ 3000 caracteres, telefone ≤ 30) e `pedidos_estudo`. |

---

## Conformidade com o Guia de Segurança Máxima

| Requisito do Guia | Status | Observação |
| :--- | :--- | :--- |
| **Zero-Trust & Identidade Limpa (seção 1.A)** | **CONFORME** | Sem IDs de usuário arbitrários na URL; validação implacável de autorização. |
| **RBAC e Mínimo Privilégio (seção 2.3 & 5)** | **CONFORME** | Regras de Firestore e Storage com verificação estrita de papéis administrativos (`isAdmin()`). |
| **PII & Minimização LGPD (seção 3.1 & 4.C)** | **CONFORME** | Mascaramento de dados em logs; sem persistência desprotegida de PII no cliente. |
| **Proteção contra Injeção e XSS (seção 8.D & 11)** | **CONFORME** | Sanitização Unicode/NFC, escape de entidades e CSP ativo no backend; validação de MIME no Storage. |
| **Rate Limiting & Proxy Headers (seção 4.1.2 & 4.1.3)** | **CONFORME** | Janela deslizante thread-safe com suporte a `X-Forwarded-For` e `CF-Connecting-IP` em formulários e YouTube. |
| **Security Headers & CSP (seção 4.1.4)** | **CONFORME** | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy e Content-Security-Policy ativos. |
| **Scalar DX Security (seção 4.1.6 & 11)** | **CONFORME** | IA desabilitada (`AgentScalarConfig(disabled=True)`) e rota protegida/oculta em produção. |
| **Gestão de Segredos & CI/CD (seção 10.A)** | **CONFORME** | `.env` protegido e `.env.example` blindado com `DEBUG=false` por padrão. |
