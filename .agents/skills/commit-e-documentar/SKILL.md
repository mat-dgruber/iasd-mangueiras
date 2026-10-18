---
name: commit-e-documentar
description: >
  Orquestrador universal e agnóstico de commits atômicos, documentação inline/externa, governança de Architecture Decision Records (ADRs), push remoto automático, monitoramento de CI/CD (watchdog de pipelines) e acompanhamento do ciclo de vida de Pull Requests e Merges em 9 fases determinísticas.
user-invocable: true
output_format: markdown-rich
triggers:
  - /commit-e-documentar
  - /turbo-commit
  - /commit-push
  - /commit-pr
  - /commit-ci
  - comitar tudo
  - commit e documentar
  - salvar alterações com adr
  - criar commits semânticos
  - comitar e dar push
  - comitar, push e acompanhar ci
  - comitar e abrir pr
  - comitar e mergear
follow_up_skills:
  - architecture-review
  - code-documentar
example_inputs:
  - "/turbo-commit"
  - "/commit-push"
  - "/commit-pr"
  - "Valide os testes, verifique se precisa de ADR e comite todas as alterações pendentes"
  - "/commit-e-documentar organizando os commits por camada técnica"
  - "/commit-e-documentar --push --watch-ci --pr"
  - "/commit-e-documentar --push --watch-ci --pr main --merge"
---

# Universal Commit, Doc, Push, CI/CD & PR Orchestrator (`commit-e-documentar`)

Esta skill orquestra a execução de um fluxo de engenharia rigoroso, determinístico e multi-stack para organizar, validar, documentar, avaliar necessidades de **Architecture Decision Records (ADRs)**, comitar alterações no repositório de forma incremental e atômica (*micro-commits*), realizar o **push remoto**, monitorar ativamente a esteira de **CI/CD** e acompanhar a abertura e o **merge de Pull Requests**.

---

## 🔁 As 9 Fases do Fluxo Determinístico

O ciclo executa em loop contínuo até que todas as alterações da árvore de trabalho sejam comitadas, grava o relatório técnico consolidado da sessão em `docs/commits/`, sincroniza remotamente via push, audita a esteira de CI/CD com watchdog ativo e gerencia o ciclo de vida do PR até o merge final (quando solicitado).

```mermaid
graph TD
    Start([Início: /commit-e-documentar]) --> F1[Fase 1: Stage & Agrupamento Lógico]
    F1 --> F2[Fase 2: Validação Técnica, Documentação & Checagem de ADR]
    F2 --> F3[Fase 3: Commit Individual Atômico]
    F3 --> F4{Fase 4: Restam alterações pendentes?}
    F4 -- Sim --> F1
    F4 -- Não --> F5[Fase 5: Documentação Técnica da Sessão em docs/commits/]
    F5 --> F6{Fase 6: Push Solicitado ou Habilitado?}
    F6 -- Sim --> F6_Exec[Executar git push para upstream]
    F6 -- Não / Local-only --> F9[Fase 9: Relatório Final Formatado]
    F6_Exec --> F7{Fase 7: CI/CD Configurado?}
    F7 -- Sim --> F7_Watch[Watchdog de Pipelines: gh run watch / checks]
    F7 -- Não / Sem CI --> F8{Fase 8: PR ou Merge Solicitado?}
    F7_Watch -- CI Verde --> F8
    F7_Watch -- CI Quebrou --> F7_Fail[Diagnóstico de Logs: gh run view --log-failed]
    F8 -- Abrir/Acompanhar PR --> F8_PR[gh pr create & monitorar checks]
    F8 -- Auto-Merge Solicitado --> F8_Merge[gh pr merge & checkout/pull base]
    F8 -- Apenas Push/CI --> F9
    F8_PR --> F9
    F8_Merge --> F9
    F7_Fail --> Stop([Parada para Correção Imediata])
    F9 --> End([Fim: Repositório Sincronizado e Auditável])
```

---

### Fase 1: Stage & Agrupamento Lógico (Stage)

1. **Identificar Alterações Pendentes:**
   Execute `git status --porcelain` para inspecionar com precisão o estado de cada arquivo modificado, adicionado ou deletado.
2. **Agrupamento por Afinidade Funcional e Camadas:**
   Isole as modificações em conjuntos coesos e desacoplados:
   - **Camada de Dados:** Schemas de banco de dados, migrations DDL e seeds.
   - **Camada de Domínio & Aplicação:** Entidades, use cases, services de backend e seus testes unitários correspondentes.
   - **Camada de Apresentação / UI:** Componentes de interface, páginas, estilos e testes de componentes.
   - **Infraestrutura & Configuração:** Pipelines de CI/CD, Dockerfiles, variáveis de ambiente ou dependências do projeto.
3. **Adicionar ao Staging com Isolamento:**
   Adicione estritamente os arquivos do grupo selecionado via `git add <arquivos>`. Mantenha os demais arquivos em estado *unstaged*.

---

### Fase 2: Validação Técnica, Documentação & ADR Check

Para cada grupo isolado no staging, execute **obrigatoriamente** as verificações abaixo:

#### 0. Auditoria Visual de Diffs (Mod: Replay Theater)

Se o mod `replay-theater` estiver ativo ou se o comando estiver disponível no ambiente:
- Dispare ou recomende o comando `/replay` (ou `$replay`) para auditar visualmente as alterações do turno registradas pelo hook `PostToolUse` em `.cache/replay-history.json`.
- Verifique se as linhas adicionadas (verde) e removidas (vermelho) correspondem estritamente ao escopo funcional do grupo antes de comitar.

#### 1. Documentação de Código (Inline e Externa)

- **Documentação Inline (Clean Code e Marcadores de Seção):**
  - Inserir divisores lógicos `MARK: - [Seção]` na sintaxe correspondente da linguagem (ex: `// MARK: - Handlers`, `# MARK: - Services`, `// MARK: - Interfaces`).
  - Documentar contratos de métodos, funções e tipos com docstrings padronizadas:
    - **TypeScript / JavaScript:** TSDoc / JSDoc (`/** ... */`) com `@param`, `@returns`, `@throws`.
    - **Python:** Google Style Docstrings (`Args:`, `Returns:`, `Raises:`).
    - **PHP:** PHPDoc (`/** ... */`) com declarações de tipos estritos e `@throws`.
    - **Go:** Comentários idiomáticos no padrão Godoc.
    - **Rust:** Documentação nativa Rustdoc (`///`).
    - **Java:** Javadoc (`/** ... */`).
    - **.NET / C#:** Comentários estruturados XML (`/// <summary>`).
  - Justificar o *porquê* de regras de negócio complexas e tratamentos de exceção.
- **Documentação Externa (`guides/` ou `docs/ai/specs/`):**
  - Se a alteração introduzir novos contratos de API, especificações ou guias operacionais, crie ou atualize o respectivo documento Markdown com o log de manutenção no topo.

#### 2. Avaliação dos 6 Gatilhos Arquiteturais Canônicos de ADR

Avalie se as alterações do grupo enquadram-se em um ou mais dos 6 gatilhos normativos definidos em `.agents/ai-guides/guides/essentials/guia-padrao-criacao-adrs.md` (runtime do `/setup`; no plugin, `$CLAUDE_PLUGIN_ROOT/guides/`):

| Gatilho Arquitetural | Exemplos de Mudanças que Exigem ADR Obrigatória |
| :--- | :--- |
| **1. Comunicação / Protocolos** | Introdução ou alteração de API Gateways, mensageria assíncrona (Kafka, RabbitMQ, SQS), WebSockets, gRPC, REST, GraphQL ou BFF. |
| **2. Modelagem & Persistência** | Criação ou alteração estrutural de tabelas SQL/NoSQL, migrations DDL críticas, padrão *Append-Only*, particionamento ou sharding. |
| **3. Segurança, Auth & Zero-Trust** | Políticas de autenticação corporativa, RBAC, tokens/cookies httpOnly, criptografia, resolução server-side de identidade (Anti-IDOR). |
| **4. Regulação & Privacidade** | Adequação à LGPD/GDPR, normas trabalhistas, fiscais, assinaturas eletrônicas avançadas, custódia probatória ou trilhas de auditoria. |
| **5. Resiliência Distribuída** | Implementação de *Circuit Breakers*, *Idempotency Keys*, retentativas com *Jitter*, filas de mensagens mortas (*DLQ*) ou *Storage Lock*. |
| **6. Adoção/Descontinuação Tech** | Seleção de novos frameworks, substituição de bibliotecas centrais de infraestrutura, mudança de paradigmas de gerenciamento de estado. |

> [!IMPORTANT]
> - Mudanças triviais ou cosméticas (ex: renomear variável local, refatorar função utilitária pura) **NÃO** exigem ADR.
> - Mudanças estruturais enquadradas nos 6 gatilhos tornam a criação de ADR **MANDATÓRIA**.

##### Procedimento para Geração da ADR

1. **Identificar Diretório e Número Sequencial:** O diretório de ADRs é `docs/adr/` se ele já existir no projeto (legado — não renomeie nem crie `docs/adrs/`); senão, `docs/adrs/`. Use-o em todos os caminhos abaixo. Consulte os arquivos nele e determine o próximo número sequencial de 4 dígitos (`0001`, `0002`, etc.).
2. **Nomenclatura Padrão:** `docs/adrs/[NUMERO_4_DIGITOS]-[slug-em-kebab-case].md`.
3. **Anatomia em 8 Seções Canônicas:**
   - Cabeçalho de Log de Manutenção (`Data | Autor | Descrição`).
   - Título: `# ADR [NUMERO_4_DIGITOS]: [Título Declarativo]`.
   - `## Status`: `**Proposta** (YYYY-MM-DD)` ou `**Aprovada** (YYYY-MM-DD)` ou `**Implementada** (YYYY-MM-DD)`.
   - `## Contexto` com `### Riscos Identificados e Problemas a Resolver`.
   - `## 1. Fundamentação Jurídica & Fontes Normativas Diretas` (se aplicável).
   - `## 2. Decisão de Arquitetura` (com diagramas em Mermaid).
   - `## 3. Matriz de Implementação Técnica (*IN-CODE*)` (Backend, Frontend e Banco de Dados com DDL executável).
   - `## 4. Matriz de Ações de Governança & Jurídicas (*OFF-CODE*)` (se aplicável).
   - `## 5. Prazos Legais de Guarda e Políticas de Retenção` (se aplicável).
   - `## 6. Matriz de Conformidade e Mitigação de Riscos`.
   - `## 7. Consequências e Resultados` (`### Positivas` e `### Mitigações e Desafios Gerenciados`).
4. **Adicionar ao Staging:** Execute `git add docs/adrs/[NUMERO_4_DIGITOS]-[slug-em-kebab-case].md`.

#### 3. Validação Técnica Agnóstica (Matriz por Ecossistema)

Execute as suítes de teste, linter e formatação correspondentes à stack do repositório antes de prosseguir:

| Ecossistema / Stack | Testes Unitários e Integração | Linter e Análise Estática | Formatação / Checagem de Tipos |
| :--- | :--- | :--- | :--- |
| **Python** | `pytest` | `ruff check .` ou `flake8` | `ruff format --check .`, `mypy .` |
| **PHP** | `vendor/bin/pest` ou `vendor/bin/phpunit` | `vendor/bin/phpstan analyse` | `vendor/bin/pint --test` |
| **Node.js / TypeScript** | `npm test` / `pnpm test` / `yarn test` | `npx eslint .` | `npx tsc --noEmit`, `npx prettier --check .` |
| **Go** | `go test ./...` | `golangci-lint run` | `gofmt -l .` |
| **Rust** | `cargo test` | `cargo clippy -- -D warnings` | `cargo fmt --check` |
| **Java** | `mvn test` ou `./gradlew test` | `mvn checkstyle:check` | `mvn spotless:check` |
| **.NET / C#** | `dotnet test` | `dotnet format --verify-no-changes` | `dotnet build --warnaserror` |

> [!CAUTION]
> **Bloqueio de Qualidade:** Se qualquer teste automatizado ou checagem estática falhar, interrompa o fluxo imediatamente. Corrija o código e revalide antes de gerar o commit.

---

### Fase 3: Commit Individual Atômico (Commit)

1. **Formatação Conventional Commits:**
   - Estrutura: `<tipo>(<escopo>): <descrição concisa no imperativo>`
   - Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`.
2. **Exemplo Real com Heredoc:**
   Execute via Heredoc no terminal para garantir a correta preservação de quebras de linha na mensagem:
   ```bash
   git commit -m "$(cat <<'EOF'
   feat(billing): implementar middleware de idempotencia com redis

   - Adiciona validacao obrigatoria do cabecalho Idempotency-Key em rotas POST
   - Configura lock atomico no Redis com TTL de 24 horas
   - Vincula a implementacao a ADR 0005
   EOF
   )"
   ```

---

### Fase 4: Repetição Controlada (Repeat)

1. **Verificar Estado da Árvore:**
   Execute `git status --porcelain`.
2. **Controle de Fluxo:**
   - **Se restarem arquivos pendentes:** Retorne para a **Fase 1** e isole o próximo grupo lógico.
   - **Se a árvore de trabalho estiver totalmente limpa:** Avance para a **Fase 5**.

---

### Fase 5: Documentação Técnica da Sessão em `docs/commits/`

Com todos os micro-commits concluídos, gere o arquivo consolidado de auditoria em `docs/commits/YYYY-MM-DD_<escopo-principal>.md`.

#### Estrutura Obrigatória do Documento
 
````markdown
<!--
================================================================================
LOG DE MANUTENÇÃO DE DOCUMENTAÇÃO
--------------------------------------------------------------------------------
Data       | Autor          | Descrição
--------------------------------------------------------------------------------
YYYY-MM-DD | Nome do Autor  | Registro consolidado de desenvolvimento da sessão.
================================================================================
-->

# Registro de Desenvolvimento — YYYY-MM-DD

| Metadado | Detalhe |
| :--- | :--- |
| **Escopo Principal** | `<módulo / feature principal>` |
| **Commits Gerados** | `<quantidade total de commits>` |
| **Arquivos Modificados** | `<quantidade de arquivos alterados>` |
| **ADRs Vinculadas / Geradas** | `docs/adrs/XXXX-slug.md` (ou "Nenhuma") |

---

## 1. Visão Geral das Alterações
> Resumo executivo em 2 a 4 frases explicando as entregas da sessão e os benefícios técnicos alcançados.

---

## 2. Arquitetura Afetada & Decisões (ADRs)
- **Decisões Registradas:**
  - `docs/adrs/XXXX-slug.md`: [Resumo da decisão tomada e seus impactos].
- **Diagrama de Relações e Fluxos:**

```mermaid
graph LR
    Client[Cliente / Frontend] --> Gateway[API Gateway]
    Gateway --> Service[Core Service]
    Service --> Redis[(Cache & Idempotency)]
    Service --> DB[(Banco Primário)]
```

---

## 3. Mapa de Arquivos Modificados

| Arquivo | Camada Técnica | Resumo da Modificação |
| :--- | :--- | :--- |
| `src/modules/billing/service.ts` | Service / Core | Implementação do fluxo de idempotência |
| `docs/adrs/0005-idempotencia.md` | Governança | Nova ADR documentando lock no Redis |

---

## 4. Detalhamento por Commit

### `<tipo>(<escopo>): <título>`

- **Razão da alteração:** Motivação técnica ou de negócio.
- **Comportamento atual:** Como o sistema opera pós-implementação.
- **Decisões técnicas & ADRs:** Relação com decisões estruturais.
- **Arquivos envolvidos:**
  - `caminho/do/arquivo`: descrição sucinta da alteração.

---

## 5. Dívida Técnica & Próximos Passos

- [ ] Oportunidade de melhoria futura identificada na sessão.
- [ ] Próxima etapa prioritária de desenvolvimento.
````

#### Commit da Documentação de Sessão
```bash
git add docs/commits/YYYY-MM-DD_<escopo-principal>.md
git commit -m "docs(commits): registrar sessao de desenvolvimento de YYYY-MM-DD"
```

---

### Fase 6: Push Remoto & Sincronização de Upstream (Push)

O push é disparado quando o usuário solicita explicitamente (ex: `/commit-push`, `--push`, "dar push", "subir branch", "abrir PR") ou como etapa de continuidade no fluxo de entrega contínua.

1. **Inspeção de Branch e Upstream:**
   - Obter a branch ativa:
     ```bash
     BRANCH=$(git branch --show-current)
     ```
   - Verificar se existe upstream configurado:
     ```bash
     UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
     ```
2. **Execução Segura do Push:**
   - **Sem upstream prévio:** Configurar o tracking remoto e enviar:
     ```bash
     git push -u origin "$BRANCH"
     ```
   - **Com upstream configurado:**
     ```bash
     git push
     ```
3. **Guardrails de Segurança Git:**
   - NUNCA executar `git push --force` ou `git push -f` em branches compartilhadas (`main`, `master`, `develop`).
   - Se o push for rejeitado por divergência remota (`non-fast-forward`), execute `git fetch origin` e avalie com cautela a necessidade de rebase (`git pull --rebase origin <base>`).

---

### Fase 7: CI/CD Watchdog & Diagnóstico de Falhas (CI/CD Watch)

Após o push, se houver pipelines de CI/CD configuradas no repositório (GitHub Actions, workflows em `.github/workflows/`), a skill assume o papel de **watchdog ativo** para certificar a integridade da esteira.

1. **Identificação da Pipeline Ativa:**
   - Identificar o commit SHA recém-enviado (`COMMIT_SHA=$(git rev-parse HEAD)`).
   - Consultar as execuções de workflow disparadas para a branch:
     ```bash
     gh run list --branch "$BRANCH" --limit 3
     ```
2. **Monitoramento Ativo em Tempo Real:**
   - Localizar o ID da execução mais recente associada ao commit:
     ```bash
     RUN_ID=$(gh run list --branch "$BRANCH" --json databaseId,headSha --jq ".[] | select(.headSha == \"$COMMIT_SHA\") | .databaseId" | head -n 1)
     ```
   - Se houver PR aberto correspondente, monitorar os checks diretamente:
     ```bash
     gh pr checks --watch
     ```
   - Caso contrário, monitorar a run do workflow:
     ```bash
     gh run watch "$RUN_ID" --exit-status
     ```
3. **Tratamento de Falhas (Causa Raiz & Logs):**
   - Se qualquer job da esteira falhar (exit code diferente de 0):
     - Capturar imediatamente os logs específicos dos passos com falha:
       ```bash
       gh run view "$RUN_ID" --log-failed
       ```
     - Sintetizar o erro (falha de testes, quebra de tipagem, lint, timeout ou dependência).
     - **Bloqueio de Qualidade:** Notificar o usuário com a análise do log e prescrever a correção antes de prosseguir com qualquer solicitação de merge.
4. **Validação com Sucesso:**
   - Confirmar todos os jobs verdes (✅) com duração total da execução antes de prosseguir.

---

### Fase 8: Acompanhamento de PR & Merge Lifecycle (PR & Merge Tracking)

Se o usuário solicitou abertura de Pull Request ou merge em outra branch (ex: "abrir PR para main", "fazer merge na develop", `--pr`, `--merge`):

1. **Verificação de PR Existente:**
   - Verificar se já há um PR aberto para a branch atual:
     ```bash
     gh pr list --head "$BRANCH"
     ```
2. **Criação Automática do PR (se inexistente):**
   - Utilizar a convenção de Conventional Commits para o título e a documentação consolidada da sessão (`docs/commits/YYYY-MM-DD_<escopo>.md`) como base do corpo:
     ```bash
     gh pr create --base "${TARGET_BRANCH:-main}" --head "$BRANCH" \
       --title "<tipo>(<escopo>): <título resumido>" \
       --body "$(cat <<'EOF'
     ## Sumário das Modificações
     <!-- Resumo executivo dos commits e ADRs vinculadas -->

     ## Documentação de Sessão
     Consulte o relatório detalhado em `docs/commits/YYYY-MM-DD_<escopo>.md`.

     ## Checklist de Validação
     - [x] Testes automatizados executados localmente e no CI
     - [x] Conformidade com guias normativos e convenções arquiteturais
     - [x] Análise estática e lint 100% aprovados
     EOF
     )"
     ```
3. **Auditoria de Conflitos e Mergeability:**
   - Inspecionar se o PR está apto para merge sem conflitos:
     ```bash
     gh pr view <pr-number> --json mergeable,mergeStateStatus,reviewDecision
     ```
4. **Execução e Acompanhamento do Merge (se solicitado):**
   - Se o usuário instruiu explicitamente a realização do merge:
     - **Auto-merge:** Se o repositório exigir revisões ou checks obrigatórios em andamento:
       ```bash
       gh pr merge <pr-number> --auto --squash --delete-branch
       ```
     - **Merge Direto:** Se os checks estiverem verdes e autorizado:
       ```bash
       gh pr merge <pr-number> --squash --delete-branch
       ```
5. **Sincronização da Base Local Pós-Merge:**
   - Se o merge for concluído com sucesso, sincronizar a branch base local:
     ```bash
     git checkout "${TARGET_BRANCH:-main}"
     git pull origin "${TARGET_BRANCH:-main}"
     ```
   - Informar o status de conclusão e o encerramento da branch de trabalho.

---

### Fase 9: Relatório Final Formatado no Chat (Hand-off)

Após finalizar todo o fluxo (commits, documentação, push, CI/CD e PR/merge), exiba o sumário executivo detalhado no chat:

````markdown
# 🚀 Fluxo Determinístico Concluído com Sucesso

> [!NOTE]
> **Data da Sessão:** YYYY-MM-DD<br>
> **Status da Árvore de Trabalho:** 🟢 Limpa (Zero alterações pendentes)<br>
> **Status do Push:** 🟢 Sincronizado com `origin/<branch>`<br>
> **Status do CI/CD:** 🟢 Todos os checks aprovados (Run #XXXXX)<br>
> **Status do PR / Merge:** 🟢 PR #XX [Merged / Aberto] em `<target-branch>`

---

### 📦 Commits Atômicos Gerados

| Hash | Tipo e Escopo | Descrição das Modificações |
| :---: | :--- | :--- |
| `a1b2c3d` | `feat(billing)` | Implementar middleware de idempotência com Redis |
| `e4f5a6b` | `test(billing)` | Adicionar suíte de testes unitários para verificação de chaves |
| `c7d8e9f` | `docs(commits)` | Registrar sessão de desenvolvimento de YYYY-MM-DD |

---

### 🏛️ Decisões Arquiteturais Registradas (ADRs)
- 🟢 `docs/adrs/0005-idempotencia-com-redis.md` — Padronização de lock atômico para rotas financeiras.

---

### 📄 Documentação Técnica Consolidada
- 📝 `docs/commits/YYYY-MM-DD_billing-idempotencia.md`

---

### 🌐 Esteira de CI/CD & Integração
- **Branch Remota:** `origin/<branch>`
- **Workflow Run:** [Run #123456](https://github.com/org/repo/actions/runs/123456) — ✅ Sucesso (Duração: 1m 45s)
- **Pull Request:** [PR #42 — feat(billing): idempotência](https://github.com/org/repo/pull/42) — 🟢 Merged em `main`

---

## ⚡ Próximos Passos Sugeridos

- [ ] Executar `/architecture-review` para reavaliar o scorecard de resiliência e concorrência do módulo atualizado.
- [ ] Conectar as novas rotas à documentação interativa OpenAPI/Scalar através da skill `/code-documentar`.
````
