---
name: seguranca
description: "Hub Master de Segurança Defensiva, Pentest e Governança do Claude Code. Disparado automaticamente sempre que o usuário mencionar 'segurança', 'vulnerabilidade', 'auditoria de segurança', 'pentest', 'OWASP', 'chaves de API', '1Password', 'sanitização' ou usar o comando /seguranca. Orquestra auditoria estática (security-audit), políticas Zero-Trust corporativas, injeção de credenciais seguras e sandboxes de execução (ai-jail-sandbox)."
---

# Hub Master de Segurança & Zero Trust

Centraliza as práticas de segurança ofensiva e defensiva, prevenção de vazamento de credenciais e conformidade com OWASP e LGPD.

---

## Ferramentas & Padrões Integrados:

1. **/security-audit**:
   - Auditoria estática de código (SAST), análise de endpoints, injeções (SQL/Command/XSS), quebras de autorização (IDOR/BOLA) e integridade de dependências.

2. **Políticas Zero Trust (`setup:seguranca-zero-trust`)**:
   - Princípio do menor privilégio, validação estrita em fronteiras externas e autenticação robusta.

3. **Injeção de Credenciais em RAM (`setup:1password-credentials`)**:
   - Proibição de segredos em arquivos `.env` ou texto plano; injeção dinâmica via 1Password CLI (`op run -- <cmd>`).

4. **Ambiente Isolado (`setup:ai-jail-sandbox`)**:
   - Isolamento de processos de risco e mitigação de execuções perigosas em ambientes locais.
