# IASD-Mangueiras — Agent Instructions & Harness Guide

Este documento consolida as diretrizes operacionais, arquiteturais e de governança do repositório, fundamentado nos manuais técnicos em `docs/guides/`.

---

## 🌐 1. Idioma e Comunicação

- **Documentação e Explicações**: Sempre em Português do Brasil (pt-BR) — planos, specs, ADRs, relatórios de sessão (`docs/reports/`) e comentários explicativos.
- **Código e Commits**: Código-fonte, identificadores, variáveis e commits em Inglês (EN-US) no padrão **Conventional Commits** (`<type>(<scope>): <subject>`).

---

## 🧭 2. Navegação por Grafo de Conhecimento (Graphify)

- **Diretriz Mandatória "Graphify Before Grep/Glob"**: Antes de executar varreduras cegas por texto (`Grep`, `Glob`, `find`), consulte o Grafo de Conhecimento (`graphify-out/graph.json`) via:
  - `graphify query "<pergunta>"`: Retorna o subgrafo contextualizado relevante.
  - `graphify path "<EntidadeA>" "<EntidadeB>"`: Mapeia o fluxo e dependências entre componentes.
  - `graphify explain "<conceito>"`: Explica o papel de um nó ou domínio específico.
- **Injeção Obrigatória em Subagentes**: Todo subagente disparado herda compulsoriamente a diretiva de usar `graphify` para orientação antes de qualquer busca textual.
- **Manutenção do Grafo**: Após alterações estruturais de código, execute `graphify update .`. Se alterar `.graphifyignore`, execute `graphify extract . --force --code-only`.

---

## 🎨 3. Padrões de UI/UX, Acessibilidade e Design System

- **Framework das 5 Lentes (`/design-review`)**: Toda interface deve ser auditada sob Arquitetura & UX, Micro-UX, Animação/GPU, Tipografia e Filtro Anti-Slop.
- **In-House Design System First**: Priorize a construção e reutilização de componentes atômicos próprios, evitando bibliotecas pesadas de terceiros (zero bloat, controle total do DOM e acessibilidade nativa).
- **Tailwind CSS First**: Estilização prioritária via classes utilitárias; CSS/SCSS personalizado apenas para exceções estritas (keyframes complexos, tokens globais, variáveis CSS).
- **Suporte Arquitetural Multi-Tema (Nativo)**: Toda tela deve suportar os 3 modos: **Tema Claro (Light)**, **Tema Escuro (Dark)** (elevação por luminosidade, sem preto puro) e **Tema de Alto Contraste (High Contrast / WCAG AAA)**.
- **Tipografia e Ícones**: Família padrão **Inter**; biblioteca padronizada de ícones **Material Symbols Outlined** (proibido misturar bibliotecas).
- **Acessibilidade WCAG 2.2 AA/AAA**: Touch targets ≥ 44px, anéis de foco visíveis (`:focus-visible`), contraste ≥ 4.5:1 (AA) e ≥ 7.0:1 (AAA), suporte a `prefers-reduced-motion`.
- **Micro-UX e 5 Estados**: Todo componente de dados deve contemplar os 5 estados: *Loading (Skeletons sem CLS)*, *Empty State explicativo*, *Error com ação de recuperação*, *Success/Preenchido* e *Disabled com motivo*.

---

## 🛡️ 4. Segurança Máxima Zero-Trust & Governança de APIs

- **Identidade Limpa nas APIs**: Proibido trafegar identificadores de usuário (`idUsuario`, `cpf`) em URLs de recursos do próprio usuário logado; resolva a identidade estritamente via contexto seguro/token JWT no servidor.
- **Proteção de Segredos**: Nunca comite chaves, certificados, credenciais ou arquivos `.env`. Utilize referências seguras e variáveis de ambiente.
- **Prevenção de Timing Attacks**: Validações de tokens, assinaturas e hashes devem usar comparação em tempo constante (`secrets.compare_digest`).
- **Sanitização de Uploads**: Validação obrigatória de MIME type real (magic bytes) e sanitização estrita de SVGs contra XSS.
- **Scalar OpenAPI DX**: Em produção, configure `AgentScalarConfig(disabled=True)` e `show_developer_tools="never"`.

---

## 🧪 5. Padrões de Testes & Qualidade

- **Padrão AAA (Arrange, Act, Assert)**: Testes organizados, determinísticos e com nomes descritivos.
- **Backend (FastAPI / pytest)**: Pirâmide Domain-First (~70% Unit, ~20% Integration, ~10% E2E), fixtures assíncronas com isolamento em memória e limpeza obrigatória no `finally` (`app.dependency_overrides.clear()`).
- **Frontend (Angular)**: Standalone Components, Signals reativos, testes unitários sem chamadas HTTP reais e checagem de tipos estática `npx tsc --noEmit` 100% limpa.
- **Meta de Cobertura**: Cobertura de testes ≥ 80% nos módulos críticos.

---

## 📦 6. Versionamento Semântico e Documentação de Domínio

- **SemVer (MAJOR.MINOR.PATCH)**: Conforme `docs/guides/semver-versioning-guide.md`.
- **Documentação de Domínio**: Módulos de negócio documentados em `docs/domains/{modulo}/` com `overview.md`, `business-rules.md` e `tech-design.md`.
- **Relatórios de Sessão**: Registre marcos e relatórios de desenvolvimento em `docs/reports/` ou `docs/commits/`.

## 🎯 Identidade e Filosofia
Você é o engenheiro de software sênior atuando como agente autônomo neste repositório.
Siga rigorosamente os padrões estabelecidos nos guias técnicos em `.agents/ai-guides/guides/`.

---

## 🛠️ Comandos de Desenvolvimento e Validação (Padrão Canônico CPB)

```bash
# Ambiente e Dependências
npm install                         # Instala dependências do monorepo
npm --prefix frontend install       # Instala dependências do frontend Angular
npm --prefix functions install      # Instala dependências das Cloud Functions

# Execução e Build
npm run dev                         # Inicia frontend e build watch das functions
npm start                            # Inicia o frontend Angular
npm run dev:firebase                # Inicia os emuladores Firebase
npm run build                       # Gera os builds do frontend e das functions
npm run build:functions             # Gera o build das Cloud Functions

# Qualidade e Testes
npm test                            # Executa a suíte de testes do frontend
npm run check                        # Executa testes e build completo
npm --prefix frontend run test:ci   # Executa testes do frontend sem watch
npm --prefix frontend run build     # Gera o build de produção do frontend
npm --prefix functions run build    # Verifica a compilação das Cloud Functions
```

---

## 🧭 Guias e Padrões Normativos do Repositório

Consulte e siga os guias canônicos em `.agents/ai-guides/guides/` para cada tarefa:

### 1. Governança e Decisões de Arquitetura
- **Decisões Arquiteturais (ADRs):** Siga `.agents/ai-guides/guides/essentials/guia-padrao-criacao-adrs.md` para qualquer nova decisão ou mudança estrutural.
- **Versionamento & Releases:** Siga `.agents/ai-guides/guides/essentials/semver-versioning-guide.md` e mantenha o `CHANGELOG.md`.
- **Especificação de Domínios:** Siga `.agents/ai-guides/guides/architecture/domain-documentation-standards.md` para documentar regras de negócio e contratos técnicos.
- **Product Management:** Siga `.agents/ai-guides/guides/product-management/guia-product-management-ciclo-completo.md`; toda iniciativa nasce de um PRD em `docs/product/` (copiado de `PRD-TEMPLATE.md`, com BDD) e passa pelo checklist GTM em `.agents/rules/product-management-ciclo.md`.
- **System Design:** Siga `.agents/ai-guides/guides/architecture/guia-system-design-sistemas-distribuidos.md`; mantenha `docs/architecture/system-design.md` atualizado a cada decisão de escala (checklist em `.agents/rules/system-design-distribuidos.md`).
- **DX de API (Scalar/OpenAPI 3.1):** Siga `.agents/ai-guides/guides/integrations/guia-scalar-openapi-dx.md` — rota `/scalar` oficial, spec fiel com erros tipados e `securitySchemes`, `docs/api/openapi.json` versionado e CI `openapi-diff` (regra em `.agents/rules/scalar-openapi.md`).

- **Design & UI/UX:** Siga os guias em `.agents/ai-guides/guides/design-ui-ux/` — `guia-componente-tabela-data-table-ui-ux.md` (6 Decisões, tabular-nums, sticky, 6 estados, bulk actions), `guia-dashboard-design-anti-slop-ui-ux.md` (5 Pilares Anti-Slop, Hierarquia 1+N, hairline borders, tabular-nums, sparklines), `guia-liquid-glass-refracao-optica-web.md` (refração SVG, blur 2-4px, saturate, luz especular, prefers-reduced-transparency), `guia-product-design-ciclo-completo.md` (discovery com JTBD, OST, RICE/Kano, 8 estados por tela, handoff Dev Mode, HEART), `guia-regras-ux-design-cognicao-comportamental.md` (Sistema 1/2, Fogg, Funil CREATE, Leis de UX, zero dark patterns), `guia-universal-design-ui-ux-acessibilidade.md` (5 Lentes, WCAG 2.2, tokens dos 3 temas, `--z-*`, `prefers-reduced-motion`); checklists em `.agents/rules/`.

- **Padrões de Resiliência:** Siga `.agents/ai-guides/guides/architecture/guia-padroes-resiliencia-defensiva.md` (Timeout, Retry com Jitter, Circuit Breaker, Idempotência).
- **Engenharia de Banco de Dados e Schemas Resilientes:** Siga `.agents/ai-guides/guides/database/guia-engenharia-banco-dados-schemas-resilientes.md` (Expand-Contract, Online DDL, Keyset Pagination, Single-Flight anti-stampede e Timezone UTC).
- **Arquitetura & Clean Code:** Siga `.agents/ai-guides/guides/architecture/guia-arquitetura-software-design-clean-code.md` (regra de dependência, SOLID, Value Objects, sem except silencioso; checklist em `.agents/rules/arquitetura-clean-code.md`).
- **DDD Pragmático (Use Cases e Unit of Work):** Siga `.agents/ai-guides/guides/architecture/guia-ddd-pragmatico-unit-of-work-use-cases.md` (núcleo vertical slice, Use Cases e Unit of Work opcionais, transação curta e um store por UoW; checklist em `.agents/rules/ddd-pragmatico.md`).
- **Segurança Zero-Trust:** Siga `.agents/ai-guides/guides/architecture/guia-seguranca-defensiva-zero-trust.md` (Data Ownership Guard em toda rota, cookies HttpOnly, sem JWT em localStorage, comparações em tempo constante, PII mascarada antes de LLMs; checklist em `.agents/rules/seguranca-zero-trust.md`).

### 2. Ciclo de Sessão e Commits
- **Micro-Commits Determinísticos:** Siga `.agents/ai-guides/guides/essentials/guia-completo-harness-commit-memoria.md` para o ciclo `/turbo-commit` / `/commit-e-documentar` em 6 fases.

### 3. Navegação por Grafo de Conhecimento (Graphify)
- **Graphify Antes de Grep/Glob (Obrigatório):** Execute `graphify query "<pergunta>"`, `graphify path` ou `graphify explain` para exploração inicial de código antes de buscas textuais cegas.
- **Atualização do Grafo:** Ao alterar código, execute `graphify update .`. Para reindexação completa, execute `graphify extract . --force --code-only`.

### 4. Padrões de Testes Automatizados
- **Suíte de Testes:** Siga os padrões em `.agents/ai-guides/guides/testing/backend/README.md` ou `.agents/ai-guides/guides/testing/frontend/README.md` respeitando a pirâmide de testes (Unit, Integration, E2E), o padrão AAA (*Arrange, Act, Assert*) e meta de cobertura $\ge 80\%$.

- **Harness Nível 3:** Siga `.agents/ai-guides/guides/ai-engineering/guia-construcao-harness.md` (7 pilares, hooks de governança, subagentes de verificação e ciclo de vida do agente).
- **Sandbox:** execute os agentes isolados com `ai-jail` (`make jail-openclaude` / `make jail-gemini`); configuração em `.ai-jail` — ver `.agents/ai-guides/guides/ai-engineering/guia-ai-jail-sandbox.md`.
- **Ciclo de Vida com Skills:** siga a ordem canônica de `.agents/ai-guides/guides/ai-engineering/guia-orquestracao-ciclo-de-vida-skills.md` — /setup → Produto (opportunity-tree, pm-prioritize, product-spec, product-metrics) → Arquitetura (grill-me-architecture, plan-criticize, architecture-review, db-documentar) → Design (ux-reviewer, design-review) → Construção (TDD, code-documentar) → Segurança (security-audit, seo-aeo-geo) → Fechamento (commit-e-documentar).
- **Ciclo de Vida com Agentes & Subagentes:** siga a ordem canônica e a matriz de despacho de `.agents/ai-guides/guides/ai-engineering/guia-orquestracao-ciclo-de-vida-agentes.md` — Descoberta (consult.py) → Arqueologia/Legados (archeologist, legacy-archaeologist, spec-miner) → Planejamento & Arquitetura (planner, architect, adr-governor) → Design/UI/UX (ui-ux-auditor, motion-developer) → Construção & Review Polyglot (react-reviewer, mobile-developer, tdd-guide, code-reviewer) → Segurança & Pentest (security-reviewer, penetration-tester) → QA/Testes/DevOps (qa-automation-engineer, devops-reviewer) → Fechamento & Memória (doc-updater, token-economist).

Todo artefato gerado por agente vai em `docs/ai/` — padrão único. Nomes: `YYYY-MM-DD-<topico>.md`.

| Artefato | Pasta |
| :-- | :-- |
| Specs de design e critérios de aceite | `docs/ai/specs/` (`YYYY-MM-DD-<topico>-design.md`) |
| Planos de implementação | `docs/ai/plans/` |
| Relatórios (auditorias, reviews, análises, investigações) | `docs/ai/reports/` |
| Checkpoints e contexto de sessão | `docs/ai/sessions/` |
| Transcrições e registros de conversas | `docs/ai/chats/` |

- **NUNCA** crie `docs/superpowers/`, `docs/plans/`, `plans/`, `reports/` ou arquivos soltos na raiz: quando uma skill (ex.: `brainstorming`, `writing-plans`) sugerir outro caminho, sobrescreva-o pelo de `docs/ai/`.
- Exceção de nome: `docs/ai/setup-manifest.yaml` é o estado do `/setup` (lido pelo `verify_setup.py`), não um artefato de sessão; não o renomeie.
- Fora de `docs/ai/`: ADRs em `docs/adrs/` (ou `docs/adr/`, se o projeto já o usa) e relatórios de commit/sessão do `/commit-e-documentar` em `docs/commits/`.
- `docs/ai/` fica fora do grafo (`.graphifyignore`): é contexto, não código.

---

## ✋ Aprovação Obrigatória de Specs e Planos

- Depois de propor ou escrever uma spec (`docs/ai/specs/`) ou um plano (`docs/ai/plans/`), **PARE** e peça a aprovação do usuário. Apresente o caminho do arquivo e um resumo. Recomenda-se executar o teste de estresse da skill `/plan-criticize` antes de submeter o plano.
- **NUNCA** pule essa aprovação: sem um "sim" explícito do usuário, não implemente, não escreva o próximo artefato (spec → plano → código) e não faça commit.
- Silêncio, pressa, "parece óbvio" ou autonomia concedida para outra tarefa **não** contam como aprovação. Uma aprovação vale só para a versão apresentada; se a spec ou o plano mudar, peça de novo.

---

## 🔒 Diretrizes de Segurança e Credenciais
- **Zero Hardcoded Secrets:** NUNCA escreva senhas, tokens ou credenciais em texto puro.
- **Segredos:** nunca em texto puro; use referências `op://` e `op run -- <comando>` conforme `.agents/ai-guides/guides/ai-engineering/1password-credentials-guide.md`.

## 📂 Artefatos de IA em `docs/ai/`

Todo artefato gerado por agente vai em `docs/ai/` — padrão único. Nomes: `YYYY-MM-DD-<topico>.md`.

| Artefato | Pasta |
| :-- | :-- |
| Specs de design e critérios de aceite | `docs/ai/specs/` (`YYYY-MM-DD-<topico>-design.md`) |
| Planos de implementação | `docs/ai/plans/` |
| Relatórios (auditorias, reviews, análises, investigações) | `docs/ai/reports/` |
| Checkpoints e contexto de sessão | `docs/ai/sessions/` |
| Transcrições e registros de conversas | `docs/ai/chats/` |

- **NUNCA** crie `docs/superpowers/`, `docs/plans/`, `plans/`, `reports/` ou arquivos soltos na raiz: quando uma skill (ex.: `brainstorming`, `writing-plans`) sugerir outro caminho, sobrescreva-o pelo de `docs/ai/`.
- Exceção de nome: `docs/ai/setup-manifest.yaml` é o estado do `/setup` (lido pelo `verify_setup.py`), não um artefato de sessão; não o renomeie.
- Fora de `docs/ai/`: ADRs em `docs/adrs/` (ou `docs/adr/`, se o projeto já o usa) e relatórios de commit/sessão do `/commit-e-documentar` em `docs/commits/`.
- `docs/ai/` fica fora do grafo (`.graphifyignore`): é contexto, não código.

---

