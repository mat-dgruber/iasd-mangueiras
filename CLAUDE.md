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
