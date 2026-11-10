# 🏛️ Architecture Review (`/architecture-review`)

<div align="center">

[![Category](https://img.shields.io/badge/Category-Software%20Architecture-4F46E5?style=for-the-badge)](../../../README.md)
[![Standards](https://img.shields.io/badge/Standards-Clean%20Architecture%20%7C%20System%20Design-10B981?style=for-the-badge)](../../../guides/architecture/README.md)

<p align="center">
  <b>Skill orquestradora para auditoria de arquitetura de software, Clean Code, SOLID, system design, escalabilidade, persistência, observabilidade e governança evolutiva.</b>
</p>

</div>

---

## 🎯 Objetivo

`/architecture-review` analisa um sistema, diretório, serviço, RFC ou repositório e avalia conformidade com:

- [`guides/architecture/guia-arquitetura-software-design-clean-code.md`](../../../guides/architecture/guia-arquitetura-software-design-clean-code.md)
- [`guides/architecture/guia-system-design-sistemas-distribuidos.md`](../../../guides/architecture/guia-system-design-sistemas-distribuidos.md)

A skill usa sabatina interna estilo `grill-me`: se faltar contexto para avaliar SLOs, volume, consistência, topologia ou decisões irreversíveis, ela pergunta antes de concluir.

---

## 🧭 Fluxo

```mermaid
graph TD
    Start([/architecture-review]) --> Scope{Escopo informado?}
    Scope -- Sim --> Audit[Auditar alvo]
    Scope -- Não --> Scan[Varredura rápida]
    Scan --> Options[Propor escopos candidatos]
    Options --> Audit
    Audit --> Questions{Falta contexto?}
    Questions -- Sim --> Ask[Perguntar até fechar contexto]
    Ask --> Questions
    Questions -- Não --> Report[Scorecard 50 pts + plano]
```

---

## 🔍 As 5 Lentes

1. **Fronteiras, Domínio & Dependências** — Clean/Hexagonal, domínio puro, mappers, bounded contexts.
2. **Design Interno, SOLID & Clean Code** — SRP, DIP, SLAP, Value Objects, God Objects, YAGNI.
3. **Dados, Consistência & Persistência** — CAP/PACELC, CQRS, sharding, replicação, monolithic persistence.
4. **Escala, Resiliência & Comunicação** — p99, QPS, timeouts, retries com jitter, cache, filas, DLQ, idempotência.
5. **Governança, Observabilidade & Evolução** — ADRs, C4/arc42, fitness functions, RED/USE, tracing, Strangler Fig.

---

## 🚀 Como Executar

```text
> /architecture-review
> /architecture-review src/domain
> /architecture-review apps/api
> /architecture-review docs/rfcs/new-billing-architecture.md
```

Sem escopo explícito, a skill faz uma varredura rápida e pergunta qual alvo deve ser auditado.

---

## 📦 Instalação Local

```bash
mkdir -p ~/.claude/skills/architecture-review
cp skills/software-engineering/architecture-review/SKILL.md ~/.claude/skills/architecture-review/
```
