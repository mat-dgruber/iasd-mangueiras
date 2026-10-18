# 📚 Acervo de Guias Técnicos & Padrões Arquiteturais

<div align="center">

[![Guides Count](https://img.shields.io/badge/Guides-30%20Normativos-0284C7?style=for-the-badge)](../README.md#acervo-de-guias-técnicos)
[![Standards](https://img.shields.io/badge/Standards-OWASP%20%7C%20WCAG%20%7C%20SemVer%20%7C%20ADR-10B981?style=for-the-badge)](../README.md)
[![Ecosystem](https://img.shields.io/badge/Architecture-Dual--Harness%20%7C%20Polyglot-7C3AED?style=for-the-badge)](../README.md)

<p align="center">
  <b>Biblioteca canônica de padrões técnicos, arquitetura de sistemas, gestão de produtos, design e infraestrutura de testes.</b>
</p>

</div>

---

## 📂 Organização das Categorias de Guias

```text
guides/
├── essentials/         ──> ⭐ 4 Pilares mandatórios: Harness/Memória, Graphify, ADRs e SemVer
├── architecture/       ──> 🏛️ Clean Architecture, System Design, Resiliência Defensiva, Segurança Zero-Trust e DDD (Front & Back)
├── design-ui-ux/       ──> 🎨 Design System, Acessibilidade WCAG 2.2 AAA, Regras de UX & Product Design
├── product-management/ ──> 🚀 Gestão de Produto: Descoberta, Estratégia, Dual-Track, Métricas AARRR & Risco
├── ai-engineering/     ──> 🤖 Orquestração de Skills (Zero ao Release), Harness N3, Sandbox e Knowledge Graphs
├── integrations/       ──> 🔌 Integrações de Terceiros, SDKs e Developer Experience (OpenAPI 3.1 & Scalar DX)
└── testing/            ──> 🧪 Suítes de testes para Backend (Pytest/Pest/JUnit) e Frontend (Karma/Playwright)
```

---

## 🗺️ Matriz de Adoção Rápida

```mermaid
graph TD
    Start([🚀 Novo Projeto / Manutenção]) --> Stack{Qual a stack e escopo do projeto?}

    Stack -->|Orquestração End-to-End com IA| AIOrch[0. /setup — harness e guias verificados<br/>1. guides/ai-engineering/guia-orquestracao-ciclo-de-vida-skills.md<br/>2. Execução das 65 Skills Especializadas<br/>3. Gestão contínua de Token Economy]
    Stack -->|Backend / APIs| Back[1. guides/essentials/<br/>2. guides/architecture/<br/>3. guides/testing/backend/<br/>4. templates/Makefile.api.template]
    Stack -->|Frontend / Web| Front[1. guides/essentials/<br/>2. guides/design-ui-ux/<br/>3. guides/testing/frontend/<br/>4. templates/Makefile.frontend.template]
    Stack -->|Product / Design & Discovery| Prod[1. guides/product-management/<br/>2. guides/design-ui-ux/<br/>3. guides/essentials/ (ADRs & SemVer)]
    Stack -->|Full-Stack / Polyglot| Full[1. guides/essentials/<br/>2. guides/architecture/ & design-ui-ux/<br/>3. guides/product-management/<br/>4. guides/testing/<br/>5. templates/AGENTS.md e CLAUDE.md]
    Stack -->|Integrações & DX de APIs| Integ[1. guides/integrations/guia-scalar-openapi-dx.md<br/>2. OpenAPI 3.1 & Suíte Oficial Scalar DX]
    Stack -->|Setup de Harness / Sandbox| Harness[1. guides/ai-engineering/<br/>2. ai-jail & notificações<br/>3. Graphify Knowledge Graph]

    AIOrch --> Done([✅ Repositório Governado e Padronizado])
    Back --> Done
    Front --> Done
    Prod --> Done
    Full --> Done
    Integ --> Done
    Harness --> Done
```

---

## ⚙️ Heurísticas Executáveis

Guias convertidos ao formato determinístico embutem, logo após o título, uma seção `## ⚙️ Heurísticas Executáveis` com um único bloco ```` ```yaml heuristics ````:

```yaml
guide: <slug>            # = nome da sub-skill setup-<slug>
version: 1               # incrementa quando as heurísticas mudam
requires: []             # slugs de guias que devem ser aplicados antes
heuristics:
  - id: PREFIXO-01       # prefixo único por guia
    title: O que garante
    when: "<shell: exit 0 = aplicar>"
    do: "<shell> | agent: <instrução para o agente>"
    verify: "<shell: exit 0 = provado>"
    depends_on: []       # ids do mesmo guia
    optional: false      # true = falha vira ⚠️, não ❌
```

Regras: `when`/`verify` sempre shell (cwd = raiz do projeto, `AI_GUIDES_RUNTIME` no ambiente); `do` nunca mistura shell com `agent:`; `do` shell é executado pelo `verify_setup.py apply` (`sh -c`, stdin fechado, sem TTY, teto de 900 s, status dado pelo `verify`), então tem de ser não interativo e idempotente, e cada `do` novo precisa de teste when → do → verify em fixture (ADR 0003); a prosa original desce para `## 📚 Fundamentos`. Valide com `uv run skills/setup/scripts/verify_setup.py --lint <guia>`; **todos os 30 guias do acervo estão convertidos** (24 slugs — os 8 arquivos de `testing/` entram pelos 2 READMEs de suíte) e aparecem em `verify_setup.py list`, aplicados pelo `/setup`. Piloto: [`essentials/guia-completo-harness-commit-memoria.md`](essentials/guia-completo-harness-commit-memoria.md).

---

## 📋 Resumo das Seções

| Subdiretório | Foco Temático | Guias Chave |
| :--- | :--- | :--- |
| [`essentials/`](essentials/README.md) | Fundamentos & Governança Mandatória | 4 Pilares: Harness & Micro-commits, Graphify (AST), ADRs Canônicos, SemVer 2.0.0. |
| [`architecture/`](architecture/README.md) | Engenharia de Software & Arquitetura | 4 Pilares agnósticos corporativos (Clean Architecture & SOLID, System Design Distribuído, Resiliência Defensiva, DDD) e Segurança Zero-Trust com cobertura total de Frontend e Backend. |
| [`design-ui-ux/`](design-ui-ux/README.md) | Design System, UX & Product Design | Framework das 5 Lentes, Psicologia Cognitiva/Comportamental, WCAG 2.2 AAA e Ciclo Completo de Product Design. |
| [`product-management/`](product-management/README.md) | Gestão & Estratégia de Produtos | Descoberta Contínua, Roadmaps Now/Next/Later, Métricas AARRR & North Star, Matriz de Mendelow e 4 Riscos de Cagan. |
| [`ai-engineering/`](ai-engineering/README.md) | Engenharia de Agentes & Harness | Orquestração do Ciclo de Vida das Skills (Zero ao Release), Construção de Harness Nível 3, Sandbox ai-jail, Knowledge Graphs, Notificações. |
| [`integrations/`](integrations/README.md) | Integrações, Ferramentas & DX | Padrões canônicos institucionais de ferramentas externas, OpenAPI 3.1 com suíte oficial `@scalar` (FastAPI, Express, Hono, SPAs e CDN). |
| [`testing/`](testing/README.md) | Infraestrutura & Padrões de Testes | Padrão AAA Backend (Pytest/Pest), Frontend (Karma/Signals/Playwright), Troubleshooting. |
