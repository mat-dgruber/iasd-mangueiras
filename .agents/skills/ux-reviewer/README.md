# 🧠 UX, Cognitive Psychology & Behavioral Reviewer (`/ux-reviewer`)

<div align="center">

[![Skill Type](https://img.shields.io/badge/Type-Orchestrator%20Skill-8B5CF6?style=for-the-badge)](../../../README.md)
[![Category](https://img.shields.io/badge/Category-Design%20%7C%20UI%2FUX-EC4899?style=for-the-badge)](../README.md)
[![Normative Guide](https://img.shields.io/badge/Standard-Behavioral%20UX%20%26%20Cognition-10B981?style=for-the-badge)](../../../guides/design-ui-ux/guia-regras-ux-design-cognicao-comportamental.md)

<p align="center">
  <b>Skill orquestradora para auditoria profunda de Experiência do Usuário (UX), Psicologia Cognitiva, Funil CREATE, Arquitetura de Decisão, Prevenção de Fricção e Filtro Anti-Dark Patterns.</b>
</p>

</div>

---

## 📌 Visão Geral & Papel de Orquestrador

A skill `/ux-reviewer` opera como um **Orquestrador Central de UX Comportamental e Cognição** para sistemas web e mobile. Enquanto a `/design-review` avalia os aspectos visuais, design tokens, tipografia e acessibilidade técnica (WCAG 2.2 AAA), a `/ux-reviewer` audita a **mecânica mental, a facilidade de decisão e a integridade comportamental** das interfaces com base no [Guia Oficial de Regras de UX Design, Psicologia Cognitiva e Arquitetura Comportamental](../../../guides/design-ui-ux/guia-regras-ux-design-cognicao-comportamental.md).

```mermaid
graph TD
    Start([Escopo: Fluxo / Tela / Formulário / Sistema]) --> Orchestrator["🧠 /ux-reviewer (Orquestrador)"]
    
    subgraph "🔍 As 5 Lentes Cognitivas e Comportamentais"
        Orchestrator --> L1["1. Carga Cognitiva & Leis de UX<br/>(Sistema 1 vs 2, Hick, Fitts, Miller, Jakob, Nielsen)"]
        Orchestrator --> L2["2. Dinâmica Comportamental & CREATE<br/>(Fogg B=MAP, 6 Bloqueadores de Simplicidade, Funil CREATE)"]
        Orchestrator --> L3["3. Arquitetura de Decisão & Esforço<br/>(Defaults seguros, Fricção protetiva, Zero 'OK/Cancelar' genérico)"]
        Orchestrator --> L4["4. Jornada, Hábitos & Pico-Fim<br/>(Tiny Habits, Feedback <=200ms, Endowed Progress, Peak-End)"]
        Orchestrator --> L5["5. Integridade Ética & Anti-Dark Patterns<br/>(Anti-Roach Motel, Paridade de cancelamento, Zero confirmshaming)"]
    end

    L1 & L2 & L3 & L4 & L5 --> Consolidacao["📊 Scorecard Unificado (50 pts)"]
    Consolidacao --> Funnel["🔍 Diagnóstico do Funil CREATE"]
    Funnel --> ActionPlan["🚀 Quick Wins & Refatorações Estruturais"]
    ActionPlan --> End([Interface Cognitivamente Fluida & Ética])
```

---

## ⚡ Como Utilizar

No terminal interativo do seu assistente (**Claude Code**, **OpenClaude** ou **Google Antigravity**):

```text
# Auditoria no contexto atual ou repositório completo
> /ux-reviewer

# Auditoria em fluxo, formulário ou componente específico
> /ux-reviewer src/features/checkout
> /ux-reviewer src/app/onboarding
> /ux-reviewer src/components/DeleteAccountModal.tsx
```

---

## 📊 Matriz do Scorecard de Avaliação (50 Pontos)

| Lente Cognitiva & Comportamental | Foco Técnico Principal | Peso |
| :--- | :--- | :---: |
| **1. Carga Cognitiva & Leis de UX** | Preservação do Sistema 1, Lei de Hick (3-5 opções), Fitts (>= 48px), Miller (7 ± 2), Jakob e 10 Heurísticas de Nielsen. | `10 pts` |
| **2. Dinâmica Comportamental & CREATE** | 6 Fatores de facilidade de Fogg (B = MAP) e auditoria do funil CREATE de 6 elos (Cue, Reaction, Evaluation, Ability, Timing, Execution). | `10 pts` |
| **3. Arquitetura de Decisão & Esforço** | Defaults estruturais éticos, ações incidentais, fricção defensiva em ações irreversíveis (digitação exata do identificador, CTA descritivo). | `10 pts` |
| **4. Jornada, Hábitos & Efeito Pico-Fim** | Tiny Habits, Habit Stacking, resposta <= 200ms, prevenção de duplo clique, Endowed Progress e Peak-End Rule. | `10 pts` |
| **5. Integridade Ética & Anti-Dark Patterns** | Paridade estrita de cancelamento (anti-Roach Motel), comunicação neutra de opt-out (anti-confirmshaming), ausência de cobranças surpresa e sludge. | `10 pts` |

---

## 📦 Distribuição e Instalação

Esta skill faz parte do ecossistema unificado de engenharia do repositório `ai-guides` e é instalada automaticamente através do manifesto [`.claude-plugin/plugin.json`](../../../.claude-plugin/plugin.json):

```bash
# Registrar marketplace oficial e instalar a biblioteca no projeto
openclaude plugin marketplace add Casa-Publicadora-Brasileira/ai-guides
openclaude plugin install ai-guides-suite@ai-engineering-skills-library --scope project
```

Para instalação manual no seu runtime:

```bash
mkdir -p ~/.claude/skills/ux-reviewer
cp skills/design-ui-ux/ux-reviewer/SKILL.md ~/.claude/skills/ux-reviewer/
```

---

## 🔗 Referência Canônica

Para o referencial teórico detalhado, modelos matemáticos e bases bibliográficas (Kahneman, Fogg, Wendel, Eyal, Duhigg, Norman, Nielsen), consulte:
[`guides/design-ui-ux/guia-regras-ux-design-cognicao-comportamental.md`](../../../guides/design-ui-ux/guia-regras-ux-design-cognicao-comportamental.md).
