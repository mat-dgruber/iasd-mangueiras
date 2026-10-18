# ⚙️ Skills de Setup Determinístico por Guias

<div align="center">

[![Category](https://img.shields.io/badge/Category-Setup-4F46E5?style=for-the-badge)](../../README.md)
[![Standards](https://img.shields.io/badge/Standards-Heur%C3%ADsticas%20Execut%C3%A1veis%20%7C%20Manifesto-10B981?style=for-the-badge)](../../README.md)
[![Skills Count](https://img.shields.io/badge/Skills-25%20Dispon%C3%ADveis-0284C7?style=for-the-badge)](../../README.md)

<p align="center">
  <b>Orquestrador <code>/setup</code> e sub-skills <code>setup-&lt;slug&gt;</code> que aplicam os guias normativos a um projeto e provam cada heurística com <code>verify_setup.py</code>.</b>
</p>

</div>

---

## 📂 Estrutura

```text
skills/setup/
├── SKILL.md                         ──> /setup: detecção → perguntas → recomendação → execução → verify --all
├── VERSION                          ──> versão do runtime (= .claude-plugin/plugin.json)
├── scripts/verify_setup.py          ──> --lint | list | where | plan | apply | verify | fetch (apply roda só os do shell e prova com verify, --skip ID pula instalação recusada; exige runtime do projeto)
├── tests/                           ──> pytest (uv run --with pytest --with pyyaml pytest skills/setup/tests -q)
├── harness-commit-memoria/SKILL.md  ──> sub-skill piloto (guides/essentials/guia-completo-harness-commit-memoria.md)
├── graph-engineering/SKILL.md       ──> guides/essentials/guia-graph-engineering.md
├── padrao-criacao-adrs/SKILL.md     ──> guides/essentials/guia-padrao-criacao-adrs.md
├── semver-versioning/SKILL.md       ──> guides/essentials/semver-versioning-guide.md
├── testing-backend/SKILL.md         ──> guides/testing/backend/README.md
├── testing-frontend/SKILL.md        ──> guides/testing/frontend/README.md
├── construcao-harness/SKILL.md      ──> guides/ai-engineering/guia-construcao-harness.md
├── ai-jail-sandbox/SKILL.md         ──> guides/ai-engineering/guia-ai-jail-sandbox.md
├── notificacoes-openclaude/SKILL.md ──> guides/ai-engineering/guia-configuracao-notificacoes-openclaude.md
├── 1password-credentials/SKILL.md   ──> guides/ai-engineering/1password-credentials-guide.md
├── orquestracao-ciclo-de-vida-skills/SKILL.md ──> guides/ai-engineering/guia-orquestracao-ciclo-de-vida-skills.md
├── arquitetura-clean-code/SKILL.md  ──> guides/architecture/guia-arquitetura-software-design-clean-code.md
├── system-design-distribuidos/SKILL.md──> guides/architecture/guia-system-design-sistemas-distribuidos.md
├── resiliencia-defensiva/SKILL.md   ──> guides/architecture/guia-padroes-resiliencia-defensiva.md
├── seguranca-zero-trust/SKILL.md    ──> guides/architecture/guia-seguranca-defensiva-zero-trust.md
├── domain-documentation-standards/SKILL.md──> guides/architecture/domain-documentation-standards.md
├── design-universal-acessibilidade/SKILL.md──> guides/design-ui-ux/guia-universal-design-ui-ux-acessibilidade.md
├── ux-cognicao-comportamental/SKILL.md──> guides/design-ui-ux/guia-regras-ux-design-cognicao-comportamental.md
├── product-design-ciclo/SKILL.md    ──> guides/design-ui-ux/guia-product-design-ciclo-completo.md
├── data-table-ui-ux/SKILL.md        ──> guides/design-ui-ux/guia-componente-tabela-data-table-ui-ux.md
├── dashboard-anti-slop/SKILL.md     ──> guides/design-ui-ux/guia-dashboard-design-anti-slop-ui-ux.md
├── liquid-glass/SKILL.md            ──> guides/design-ui-ux/guia-liquid-glass-refracao-optica-web.md
├── product-management-ciclo/SKILL.md──> guides/product-management/guia-product-management-ciclo-completo.md
└── scalar-openapi/SKILL.md          ──> guides/integrations/guia-scalar-openapi-dx.md
```

## 📋 Skills

| Comando | Diretório | O que faz |
| :-- | :-- | :-- |
| `/setup [instruções] [--verify] [--only slug] [--force]` | `SKILL.md` | 6 gates invioláveis: runtime em `.agents/ai-guides/` · análise do repo (monorepos via `detect_stack.sh`) e matriz de guias **antes** das perguntas (stack legada — Java até o 8, PHP até o 7 ou sem Composer, Delphi — recebe só os guias de harness e Graphify, com o SemVer que a construção de harness exige) · AskUserQuestion (contexto + seleção item a item) · aprovação da lista · execução com instalação de dependências · `verify --all` + smoke test (hooks, Graphify e a suíte de testes e o lint que o projeto já tinha, comparados ao baseline) · relatório final com o motivo de cada ⚠️, sem commitar nem oferecer commit. Diagnostica a maturidade (greenfield × em produção) pelas evidências do repositório. Grava `docs/ai/setup-manifest.yaml`. |
| `/setup-harness-commit-memoria` | `harness-commit-memoria/` | Instala o harness Dual-Harness completo (`.agents/` canônico, symlinks de skills, `AGENTS.md` (`CLAUDE.md` com `@AGENTS.md`, Gemini via `context.fileName`), hooks, scripts de memória, pre-commit, `docs/`, Graphify). |
| `/setup-graph-engineering` | `graph-engineering/` | `.graphifyignore` canônico, diretriz Graphify-antes-de-Grep, hooks `hook-guard`, subagente `knowledge-graph-curator`, hooks Git e grafo inicial. Requer `harness-commit-memoria`. |
| `/setup-padrao-criacao-adrs` | `padrao-criacao-adrs/` | `docs/adrs/TEMPLATE.md` (se o projeto não tiver template próprio), scripts de índice/validação em `.agents/scripts/adr/`, ADRs conformes, índice, workflow de CI (opcional) e referência no `AGENTS.md`. Requer `harness-commit-memoria`. |
| `/setup-semver-versioning` | `semver-versioning/` | `CHANGELOG.md`, versão SemVer válida no manifesto, hook `commit-msg` de Conventional Commits (opcional) e referência no `AGENTS.md`. |
| `/setup-testing-backend` | `testing-backend/` | Python: pytest (markers/`--strict-markers`), deps de teste, `tests/{unit,integration,e2e}`, `fail_under = 80` (abaixo disso, catraca na cobertura atual, com ⚠️); PHP: Pest. Makefile, CI e `AGENTS.md` (opcionais/condicionais). |
| `/setup-testing-frontend` | `testing-frontend/` | Scripts `test`/`test:ci`/`typecheck`, threshold ≥ 80% no runner (abaixo disso, catraca na cobertura atual, com ⚠️), Playwright E2E (opcional), Makefile, CI e `AGENTS.md`. |
| `/setup-construcao-harness` | `construcao-harness/` | Harness N3 além do básico: `jq`/`make`, scripts de governança + hooks de bloqueio, lint zero-turn, `core-skills.md`, MCPs do Gemini, alvos de memória, `.env`. Requer `harness-commit-memoria`, `graph-engineering`, `semver-versioning`. |
| `/setup-ai-jail-sandbox` | `ai-jail-sandbox/` | `ai-jail` (opcional), `.ai-jail` versionado, alvos `jail-*`, `AGENTS.md`. |
| `/setup-notificacoes-openclaude` | `notificacoes-openclaude/` | macOS: `terminal-notifier` + hook `Notification`. ⏭️ em outros SOs. |
| `/setup-1password-credentials` | `1password-credentials/` | `op` CLI (opcional), `.env` fora do git e sem segredos em texto puro, `.env.example` com `op://`, `AGENTS.md`. |
| `/setup-orquestracao-ciclo-de-vida-skills` | `orquestracao-ciclo-de-vida-skills/` | Template de PR com checklist canônico e ordem das fases no `AGENTS.md`. |
| `/setup-arquitetura-clean-code` | `arquitetura-clean-code/` | Checklist §12 em `.agents/rules/`, Ruff `E722`/`BLE001`/`S110`/`C901` (não liga com violação sobre lint verde), contratos de dependência entre camadas (`import-linter` / `dependency-cruiser`, opcionais) e `AGENTS.md`. Requer `padrao-criacao-adrs`. |
| `/setup-system-design-distribuidos` | `system-design-distribuidos/` | Checklist §13, `docs/architecture/system-design.md` (4-Step Blueprint com escopo, QARs e estimativas preenchidos) e `AGENTS.md`. Requer `padrao-criacao-adrs`. |
| `/setup-resiliencia-defensiva` | `resiliencia-defensiva/` | Checklist §7-8, Ruff `S113` (não liga com violação sobre lint verde), probes `/livez` e `/readyz` (backend detectado), `HEALTHCHECK` no Dockerfile e `AGENTS.md`. |
| `/setup-seguranca-zero-trust` | `seguranca-zero-trust/` | Checklist §8, gitleaks no pre-commit e no CI, `.github/dependabot.yml` gerado pelos ecossistemas presentes, lockfiles versionados, Ruff `S` (não liga com violação sobre lint verde) e `AGENTS.md`. |
| `/setup-domain-documentation-standards` | `domain-documentation-standards/` | `docs/domains/_template/` com os 3 esqueletos, `validate_domains.py` em `.agents/scripts/domains/`, regra always-on e `AGENTS.md`. |
| `/setup-design-universal-acessibilidade` | `design-universal-acessibilidade/` | Scorecard §12, `tokens.css` (3 temas, `--z-*`, safety checks) importado no CSS global, `prefers-reduced-motion`, ESLint a11y, axe-core no Playwright, Stylelint anti-hardcode (opcionais) e `AGENTS.md`. |
| `/setup-ux-cognicao-comportamental` | `ux-cognicao-comportamental/` | Checklist §11 em `.agents/rules/` e `AGENTS.md`. |
| `/setup-product-design-ciclo` | `product-design-ciclo/` | Checklist §14 em `.agents/rules/` e `AGENTS.md`. |
| `/setup-data-table-ui-ux` | `data-table-ui-ux/` | Matriz §10, `tabular-nums` onde há tabelas e `AGENTS.md`. |
| `/setup-dashboard-anti-slop` | `dashboard-anti-slop/` | Checklist §9 em `.agents/rules/` e `AGENTS.md`. |
| `/setup-liquid-glass` | `liquid-glass/` | Matriz §8, fallback `prefers-reduced-transparency` onde há `backdrop-filter` e `AGENTS.md`. |
| `/setup-product-management-ciclo` | `product-management-ciclo/` | Checklist GTM §15, `docs/product/PRD-TEMPLATE.md` com BDD e `AGENTS.md`. |
| `/setup-scalar-openapi` | `scalar-openapi/` | Integração oficial `@scalar` da stack, rota `/scalar`, `docs/api/openapi.json` versionado, CI `openapi-diff` (opcionais), regra always-on e `AGENTS.md`. |

## 🔄 Como uma sub-skill funciona

1. **Gate de runtime:** `uv run $SETUP/scripts/verify_setup.py where` tem de imprimir `origem=projeto`; senão, `fetch` primeiro.
2. `uv run $SETUP/scripts/verify_setup.py apply <slug>` → executa os `do` shell aplicáveis, prova cada um com o `verify` e lista os passos `AGENT` pendentes.
3. O agente faz cada `AGENT` com as ferramentas de edição (e roda `apply` de novo se algum id ficou ⏸️ adiado).
4. `uv run $SETUP/scripts/verify_setup.py verify <slug> --manifest` → tabela ✅/❌/⚠️/⏭️, linha `RESULTADO:` e manifesto.

Toda a lógica vive no bloco ```` ```yaml heuristics ```` do guia (ver `guides/README.md`). Novas sub-skills são geradas de `templates/setup-subskill.SKILL.md.template`.

## 📥 Instalação e registro das sub-skills

- **Plugin** (`marketplace.json`): `/setup` e cada `setup-<slug>` são listados explicitamente → todos ficam invocáveis.
  - *Autenticação em Repositório Privado:* O comando de adicionar marketplace executa `git clone` HTTPS não-interativo. Ter `.npmrc` configurado não autentica o Git. O Git exige *Credential Helper* ativo (ou cadastro do token do `.npmrc` em `~/.git-credentials` com `credential.helper = store`).
- **Cópia/symlink** (`scripts/install_skills.sh <destino> [--link]`): `skills/setup/` vai inteiro para `<destino>/setup/` (as sub-skills precisam de `../scripts/verify_setup.py`). Só `/setup` é garantidamente registrado; as sub-skills aninhadas podem não aparecer no autocomplete — use `/setup --only <slug>`, que lê `setup/<slug>/SKILL.md` e executa os mesmos passos.

## 📦 Runtime dos guias

`fetch` materializa `guides/`, `templates/` e `VERSION` em `.agents/ai-guides/` do projeto alvo (copiando de `$CLAUDE_PLUGIN_ROOT`/`$AI_GUIDES_HOME` quando existem; senão baixando da tag `v<VERSION>` com fallback para `main`). É **incondicional e idempotente**: o `/setup` roda `fetch` na Fase 0 sempre, antes de qualquer outra coisa.

Resolução de leitura (`where` imprime a origem): `$AI_GUIDES_HOME` (`env`) → `.agents/ai-guides/` (`projeto`) → `$CLAUDE_PLUGIN_ROOT` (`plugin`).

> ⛔ **`origem=plugin` não é runtime de trabalho.** `list`, `plan` e `verify` recusam (exit 2) quando o runtime só existe no plugin, e `where` sai com 3: sem `.agents/ai-guides/` commitado, o projeto não se verifica sozinho (CI e colegas, sem rede e sem o plugin). A correção é sempre `fetch`.
