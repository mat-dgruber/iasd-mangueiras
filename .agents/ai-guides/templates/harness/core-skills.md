# Regras Always-On do Repositório (`.agents/rules/core-skills.md`)

<!-- Fonte canônica: templates/harness/core-skills.md (guia-construcao-harness.md, Pilar 4) — instalado por HN3-07 -->

Regras compartilhadas por todos os harnesses (Claude Code / OpenClaude, Gemini CLI / Antigravity). Valem em toda sessão, sem invocação.

1. **Graphify antes de Grep/Glob.** Consulte `graphify query|path|explain` antes de qualquer busca textual; `graphify update .` após editar código de produção.
2. **Skills são Single Source of Truth em `.agents/skills/`.** `.claude/skills` e `.gemini/skills` são symlinks; nunca duplique.
3. **Guias normativos em `.agents/ai-guides/guides/`.** Siga-os; o `/setup` os aplica e prova (`docs/ai/setup-manifest.yaml`).
4. **ADR obrigatória** em `docs/adrs/` (ou `docs/adr/`, se o projeto já o usa) para os 6 gatilhos (dependência, persistência, contrato, segurança, infraestrutura, IA).
5. **Conventional Commits + SemVer.** Micro-commits atômicos; bump de versão e `CHANGELOG.md` antes de promover para `main`.
6. **Memória de equipe versionada** em `.claude/memory/team/` e `.gemini/memory/team/`; memória privada fora do git.
7. **Segredos nunca em texto puro.** `.env` fora do git e referências `op://` (1Password); o hook `protect-secrets.sh` bloqueia leitura de arquivos sensíveis.
8. **Subagentes recebem a diretiva Graphify** como primeira ação de contexto ao serem despachados.
