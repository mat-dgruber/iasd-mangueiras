---
name: resume-session
description: >
  Restaura o contexto de trabalho a partir do último checkpoint de sessão salvo em docs/ai/sessions/ ou .agents/memory/,
  apresentando o estado do git, arquivos modificados, decisões tomadas e próximos passos com mínimo consumo de tokens.
user-invocable: true
triggers:
  - /resume-session
  - retomar sessao
  - restaurar contexto
  - onde paramos
  - resume session
output_format: concise
follow_up_skills:
  - token-economy
  - architecture-review
  - commit-e-documentar
---

# Retomada de Sessão (`resume-session`)

Esta skill restaura o foco técnico de forma cirúrgica e imediata ao iniciar uma nova interação com o agente de IA, lendo o último checkpoint salvo em vez de reler conversas longas ou varrer o repositório inteiro.

## Procedimento de Execução

1. **Localizar o Último Checkpoint:**
   - Tenta ler `.agents/memory/latest_session.json` ou o arquivo mais recente em `docs/ai/sessions/*_session-checkpoint.md` (com fallback para `docs/sessions/`).
2. **Checar Estado Atual do Git:**
   - Executa `git status -s` e `git branch --show-current`.
   - Compara arquivos modificados atuais com os do último checkpoint para detectar se houve commits ou alterações externas.
3. **Emitir Relatório de Foco Imediato (Formato Compacto):**

```markdown
### 🎯 Foco Restaurado: [Nome do Projeto / Branch]
- **Última Sessão:** [Data e Hora do Checkpoint]
- **O que foi concluído:** [2 a 3 tópicos diretos]
- **Estado dos Arquivos:** [X modificados / Y pendentes de commit]
- **Próximo Passo Imediato:** [Ação prioritária recomendada]
```

4. **Perguntar Confirmação ao Usuário:**
   - Solicitar se deve prosseguir com o próximo passo recomendado ou se há uma nova prioridade.
