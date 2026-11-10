# Verification Checklist — Post-Migration

> Checklist de referência para o subagente de validação (papel `migration-validator`, Phase 5 do `migration-mythos`). Todos os itens devem ser verificados
> antes de aprovar a migração. Items marcados com 🔴 são BLOQUEANTES.

---

## A. Completude Estrutural

- [ ] Todos os arquivos listados em `feature_map.json` têm um artefato correspondente no destino
- [ ] Nenhum arquivo migrado está vazio ou contém apenas comentários placeholder
- [ ] A estrutura de diretórios do destino segue as convenções do repo alvo
- [ ] `extraction_manifest.json` não tem itens com strategy = `BRIDGE` sem implementação correspondente

---

## B. Qualidade de Código

- [ ] Nenhum erro de sintaxe nos arquivos migrados (linter passa clean)
- [ ] Nenhum `print()` / `console.log()` / `debugger` em código de produção
- [ ] Nenhum comentário `TODO: migrate this` ou `FIXME` em caminhos críticos
- [ ] Nomenclatura segue as convenções do repositório destino (variáveis, classes, funções)
- [ ] Nenhum arquivo de UI legado importado diretamente

---

## C. Integridade de Dependências

- 🔴 Nenhum import apontando para caminhos do legado (`from legacy.*`, `import OldSystem`, etc.)
- 🔴 Nenhuma URL hardcoded do ambiente legado (IPs internos, hostnames legados)
- [ ] Todas as dependências externas novas declaradas em `requirements.txt` / `package.json` / equivalente
- [ ] Nenhuma variável de ambiente legada usada sem mapeamento documentado para a equivalente no destino

---

## D. Segurança

- 🔴 Nenhuma credencial hardcoded (passwords, API keys, tokens, private keys)
- 🔴 Nenhuma chave privada ou certificado em qualquer arquivo migrado
- 🔴 Nenhum AWS/GCP/Azure key em código ou comentários
- [ ] Nenhuma URL com credenciais embutidas (ex: `mongodb://user:pass@host`)
- [ ] Nenhum PII em fixtures de teste (CPF real, e-mail real, cartão real)

---

## E. Cobertura de Testes

- [ ] Testes unitários existem para todas as funções/métodos principais migrados
- [ ] Cobertura de testes ≥ 80% dos caminhos de negócio
- [ ] Pelo menos um teste de integração end-to-end da feature no contexto do destino
- [ ] Cada regra de negócio listada em `business_rules.md` tem pelo menos um cenário de teste
- [ ] Casos de borda identificados na arqueologia têm testes correspondentes

---

## F. Ausência de Regressões

- 🔴 Nenhum teste existente no repositório destino que passou antes da migração agora falha
- [ ] A taxa de cobertura geral do repo destino não caiu mais de 2%
- [ ] CI/CD pipeline passa completamente na branch de migração

---

## G. Contrato de API

- [ ] Assinaturas de funções públicas batem com o `api_contract` em `migration_plan.json`
- [ ] Tipos de retorno batem com o contrato
- [ ] Erros/exceptions tratados conforme especificado no contrato
- [ ] Todos os invariantes documentados são satisfeitos

---

## H. Equivalência Comportamental

- [ ] Para cada `cenário` em `business_rules.md`, o comportamento migrado é idêntico ao legado
- [ ] Side effects documentados em `tech_design.md` estão todos presentes (ou intencionalmente removidos com justificativa)
- [ ] Comportamento para entradas inválidas é equivalente ou deliberadamente melhorado

---

## I. Documentação

- [ ] `MIGRATION_REPORT_<FEATURE>_<DATE>.md` gerado e completo
- [ ] Todas as decisões de migração documentadas com justificativa
- [ ] `deferred_items` do `migration_plan.json` registrados em issues/tickets do repo destino
- [ ] README do repo destino atualizado se a feature adicionou nova funcionalidade pública

---

## Score de Aprovação

| Score | Status |
|-------|--------|
| 0 itens 🔴 bloqueantes e ≥ 90% dos demais | ✅ APPROVE |
| 0 itens 🔴 bloqueantes e 70-89% dos demais | ⚠️ APPROVE WITH CONDITIONS |
| Qualquer item 🔴 pendente | ❌ REQUEST CHANGES |
