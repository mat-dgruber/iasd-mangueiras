---
name: setup
description: >
  Configura um projeto conforme os guias normativos do ai-guides: materializa o runtime em .agents/ai-guides/, analisa o repositório (inclusive monorepos), apresenta a matriz de guias obrigatórios/recomendados/opcionais, PERGUNTA ao usuário o que instalar, executa as sub-skills setup-<slug> na ordem de dependência, instala as dependências de cada skill (macOS/Linux/Windows) e prova tudo com verify_setup.py mais um smoke test (hooks sem erro, Graphify respondendo). Idempotente.
user-invocable: true
output_format: markdown-rich
triggers:
  - /setup
  - configurar projeto conforme os guias
  - aplicar os guias ai-guides neste repositório
  - instalar harness e padrões corporativos
  - verificar setup do projeto
follow_up_skills:
  - commit-e-documentar
  - architecture-review
example_inputs:
  - "/setup"
  - "/setup API FastAPI em produção, prioridade em testes e segurança"
  - "/setup --verify"
  - "/setup --only harness-commit-memoria"
  - "/setup --ref dev-matdgruber"
---

# /setup — Configuração Determinística por Guias

Entrada: `/setup [instruções livres] [--verify] [--only slug,slug] [--force] [--ref branch|tag]`.
`SETUP` = diretório base desta skill (informado ao carregá-la). Script: `uv run $SETUP/scripts/verify_setup.py`.
`R` = valor de `AI_GUIDES_RUNTIME` impresso pelo script (a raiz do runtime dentro do projeto).

Se o usuário especificar `--ref <branch>` ou a variável de ambiente `AI_GUIDES_REF` estiver definida (ex.: `AI_GUIDES_REF=dev-matdgruber`), o `fetch` baixará o runtime diretamente da branch ou tag apontada.

## ⛔ Gates invioláveis

Os 6 gates são **sequenciais e obrigatórios**. Gate sem a prova exigida = setup inválido: **PARE e resolva**, não avance, não improvise.

| # | Gate | Prova obrigatória (vai no relatório final) |
| :-: | :-- | :-- |
| **G1** | Runtime materializado **dentro do projeto** | `where` imprime `origem=projeto`, `test -d .agents/ai-guides/guides` passa e `git ls-files .agents/ai-guides/VERSION` diz se já está versionado (vazio = ainda não: o relatório diz isso, nunca "commitado") |
| **G2** | **Análise + matriz de guias apresentada** antes de qualquer pergunta | tabela da Fase 1 com nível e motivo de **todos** os guias de `list` |
| **G3** | Perguntar com **AskUserQuestion** (contexto **e** seleção item a item) | ≥ 2 chamadas de AskUserQuestion respondidas |
| **G4** | Lista final **aprovada** pelo usuário | resposta "Aprovar e executar" à AskUserQuestion da Fase 3 |
| **G5** | Sub-skills executadas uma a uma, na ordem de `list`, **com suas dependências instaladas** | saída do `apply` e tabela do `verify` por guia; nenhuma heurística de instalação em ❌ |
| **G6** | `verify --all --manifest` sem ❌ **e smoke test verde**, incluindo a suíte de testes que o projeto já tinha | tabela final + saída de `verify_hooks.py`, de `graph_smoke.sh` e da suíte do projeto (baseline × agora) |

**Proibições absolutas:**

1. **NUNCA** trabalhar com o runtime do plugin (`origem=plugin`). Os guias têm de estar copiados em `.agents/ai-guides/` do projeto; versioná-los é do usuário, depois do G6 (proibição 9).
2. **NUNCA** perguntar antes de mostrar a matriz (G2). O usuário decide vendo o que existe, por que se aplica e o que cada guia instala.
3. **NUNCA** pular a Fase 2. Mesmo com propósito óbvio ou instruções livres completas, as chamadas de AskUserQuestion acontecem — no limite, como confirmação.
4. **NUNCA** escrever nada no projeto antes da resposta "Aprovar e executar" do G4 (a Fase 0 só lê; `fetch` é a única escrita permitida antes) nem mexer, em fase nenhuma, no que nenhuma heurística manda (testes, código, configs do projeto): problema pré-existente — suíte que não coleta, hook quebrado de outra origem — vai para o relatório como pendência e só é corrigido com um sim do usuário.
5. **NUNCA** declarar sucesso com ❌ aberto, com dependência faltando, com smoke test vermelho ou com teste do projeto que passava antes do setup e agora falha.
6. **NUNCA** decidir sozinho que "o projeto não tem frontend/backend" olhando só a raiz: em monorepo eles vivem em `apps/`, `services/`, `packages/`. Use `detect_stack.sh`.
7. **NUNCA** gravar artefato de IA fora de `docs/ai/`: planos em `docs/ai/plans/`, relatórios em `docs/ai/reports/`, specs em `docs/ai/specs/`, checkpoints em `docs/ai/sessions/`, transcrições em `docs/ai/chats/` (`YYYY-MM-DD-<topico>.md`); o manifesto é `docs/ai/setup-manifest.yaml`. Nada em `docs/superpowers/`, `plans/`, `reports/` ou na raiz. O `AGENTS.md` do projeto tem de sair no padrão completo do template, com a seção `docs/ai/` (HARNESS-05), **sem perder nada** do que o projeto já tinha em `CLAUDE.md`/`GEMINI.md`: mescle só via `templates/harness/merge_agent_md.py`, nunca sobrescreva; o `CLAUDE.md` vira `@AGENTS.md` e o `GEMINI.md` da raiz sai só pelo `--migrate` (HARNESS-06).
8. **NUNCA** filtrar ou truncar a saída de `plan`, `apply` ou `verify` (`| head`, `| grep`, `| tail`) nem encadear `; echo "✅"` depois de um comando: o exit code e as linhas ⚠️ somem e o relatório passa a mentir. Quem diz se passou é o `verify`.
9. **NUNCA** commitar nem oferecer commit: o `/setup` termina no relatório do G6, sem AskUserQuestion de próximo passo. Commit só quando o usuário pedir (`/commit-e-documentar`), depois de revisar o `git diff`.

**Racionalizações que significam que você está violando um gate:**

| Pensamento | Realidade |
| :-- | :-- |
| "O `where` respondeu um caminho, então o runtime está ok" | Só `origem=projeto` vale. |
| "Já sei quais guias se aplicam, pergunto direto" | A matriz vem primeiro (G2); a pergunta se apoia nela. |
| "Ele respondeu tudo no comando, não preciso perguntar" | G3 é binário: as chamadas acontecem, como confirmação. |
| "Não achei package.json na raiz, então não tem frontend" | `detect_stack.sh frontend --list` decide, não o `ls` da raiz. |
| "A dependência falhou, mas era opcional" | Dependência de skill executada não é opcional: instale (o helper cobre macOS/Linux/Windows) ou pare e reporte. |
| "Tudo ✅ no verify, posso encerrar" | Falta o smoke test do G6: hooks sem erro, Graphify respondendo e a suíte do projeto sem falha nova. |
| "O `verify` disse sem ❌: o guia está pronto" | ⚠️ é `AGENT` por fazer ou pendência registrada: faça-o ou justifique cada um no relatório. |
| "Parece um projeto novo" | A maturidade vem das evidências da Fase 0 (commits, tags, migrações, deploy, testes), não da impressão. |
| "O comando imprimiu ✅" | Só a tabela do `verify` prova; `echo` depois de `cp` não prova nada. |
| "Esse template deve estar em `templates/<x>`" | Confira com `ls $R/templates`; caminho inventado = heurística falsa. |
| "Rodo as sub-skills em paralelo para ganhar tempo" | Uma por mensagem, na ordem de `list`: a próxima depende do `verify` da anterior. |
| "Perguntei 'Confirma?' no texto; ele vai concordar" | G4 é a resposta à AskUserQuestion. Sem ela, a Fase 4 não começa. |
| "O `do` gera só um arquivo; escrevo à mão e ganho tempo" | Rode `apply <slug>`: arquivo escrito à mão inventa valores (ex.: `reviewers` com usuário inexistente). |
| "Já que estou aqui, conserto esse teste/hook quebrado" | Fora de heurística é pendência no relatório; corrigir só com o sim do usuário. |
| "O validador do projeto reclamou do arquivo que o setup criou; ajusto o validador" | A checagem é do projeto: mexa no que o setup criou ou pergunte (AskUserQuestion). |
| "É legado, mas este guia ajudaria; recomendo" | Stack legada recebe só os guias de harness e Graphify; outro guia, só se o usuário pedir pelo nome (`--only`). |
| "Pergunto se commito e marco como recomendado; é o passo natural" | O setup termina no relatório. Commit é do usuário, depois de revisar o diff: nunca como opção `(Recomendado)`. |

## Fase 0 — Runtime e análise do repositório (não pergunta nada)

**Passo 1 (G1) — incondicional, antes de tudo:**

```bash
uv run $SETUP/scripts/verify_setup.py fetch ${REF_FLAG} # copia do plugin/clone, ou baixa da branch/tag apontada (padrão: AI_GUIDES_REF ou v<VERSION>)
uv run $SETUP/scripts/verify_setup.py where             # TEM de imprimir "origem=projeto"
test -d .agents/ai-guides/guides && echo "G1 OK"
```

`origem=plugin` (exit 3) ou `ausente` → rode `fetch` de novo e investigue; não siga. Se o usuário passou `--ref <branch>` (ex.: `--ref dev-matdgruber`) ou `AI_GUIDES_REF` estiver no ambiente, use `fetch --ref <branch>`. Avise em uma linha que versionar `.agents/ai-guides/` é do usuário, depois do G6 (proibição 9). Se o `fetch` falhar com erro HTTP 401/403 por repositório privado, lembre-se que o `.npmrc` autentica apenas o npm: configure o Git Credential Helper (`credential.helper = store`) ou defina `GITHUB_TOKEN`.

**Passo 2 — análise real do repositório (só leitura).** Não se contente com a raiz:

```bash
R=.agents/ai-guides
for alvo in backend frontend api mobile python node php go rust java docker ci legacy; do
  printf '%-9s ' "$alvo"; sh $R/templates/detect_stack.sh "$alvo" --list 2>/dev/null | tr '\n' ' '; echo
done
for f in AGENTS.md CLAUDE.md GEMINI.md .agents .claude .gemini docs/adr docs/adrs docs/domains graphify-out Makefile .pre-commit-config.yaml docs/ai/setup-manifest.yaml; do test -e $f && echo "presente: $f"; done
git log --oneline -5 2>/dev/null; ls

# evidências de maturidade (greenfield × em produção/brownfield)
echo "commits=$(git rev-list --count HEAD 2>/dev/null || echo 0) tags=$(git tag -l 2>/dev/null | wc -l | tr -d ' ')"
git grep -l -E 'alembic|prisma migrate|flyway|liquibase|helm|kubectl|docker-compose\.prod' -- ':!.agents' ':!docs' ':!*.md' 2>/dev/null | head -5
ls -d migrations alembic */migrations k8s helm deploy tests test 2>/dev/null

# ferramentas faltando: a Fase 1 lista só o que este laço imprimir
for t in uv graphify jq make op terminal-notifier; do PATH="$HOME/.local/bin:$PATH" command -v "$t" >/dev/null 2>&1 || echo "faltando: $t"; done
```

**Maturidade:** é **em produção (brownfield)** se houver mais de 20 commits, alguma tag, migrações/deploy (saída do `git grep`/`ls` acima) ou código de negócio já existente com testes; **greenfield** só para repositório inicial (poucos commits, só esqueleto/README). Em brownfield as heurísticas nunca travam o CI com regra que o código atual viola (ARCH-03/04) e o G6 exige a suíte do projeto sem falha nova.

Leia também o `README.md` do projeto e os manifests encontrados (dependências, scripts, versão). Derive: **o que o projeto é**, onde cada subprojeto vive, o que já está configurado e o que falta. Ferramentas ausentes (as linhas `faltando:` do laço acima) são **lacunas a instalar**, não motivo para pular guia.

**Passo 3.** `uv run $SETUP/scripts/verify_setup.py list` → os guias e a ordem de dependência.

**Passo 4.** Com `--verify`: pule para a Fase 5 (G2-G4 dispensados; G1 e G6 continuam).

**Passo 5.** Manifesto existente e sem `--force` → **modo incremental**: candidatos = guias com `status` ≠ `pass`/`skipped`, guias com `version` maior que a do manifesto e guias novos. Sem candidatos: informe "projeto já configurado; use `--force` para reaplicar", rode o smoke test do G6 e encerre.

## Fase 1 — Diagnóstico e matriz de guias (G2 — antes de qualquer pergunta)

Apresente, em uma mensagem:

1. **O que eu vi** (3-6 linhas): stack e caminhos de cada subprojeto, harness presente/ausente, CI, Docker, testes, docs, e as **ferramentas faltando**. Se `legacy` listou algum diretório, diga qual e a evidência (Java 1.8 no `pom.xml`, `"php": ">=5.5.9"`, `.dpr` do Delphi).
   Se a Fase 0 imprimiu `presente: docs/adr` sem `presente: docs/adrs` e o `AGENTS.md` não tem `ADRs mantidas em docs/adr/`, inclua a linha `ADRs em docs/adr/ (padrão antigo): migração para docs/adrs/ oferecida na Fase 3`.
   Termine com a linha `Maturidade recomendada: <em produção (brownfield) | greenfield> — <evidências: N commits, tags, migrações, testes>`.
2. **Matriz completa** — uma linha para cada guia de `list`, nesta ordem de níveis:

| Guia (slug) | Nível | Por que (evidência do repositório) | O que instala |
| :-- | :-- | :-- | :-- |
| … | **obrigatório** / **recomendado** / **opcional** / ⏭️ não se aplica | `services/api/pyproject.toml` tem FastAPI | probes `/livez`, Ruff `S113`, … |

Níveis pela matriz abaixo; "não se aplica" só com evidência (ex.: `detect_stack.sh frontend` não achou nada).

**Projeto legado** — `legacy` listou algum diretório e nenhum outro alvo de stack (`python`, `node`, `php`, `go`, `rust`, `java`, `backend`, `frontend`, `api`, `mobile`) listou diretório (Java ou Kotlin até o 8 ou sem versão declarada, Ant, PHP até o 7 ou sem Composer, Delphi): os guias modernos não servem para essa stack. A matriz tem só os guias de harness e Graphify como obrigatórios — `harness-commit-memoria`, `graph-engineering` e `construcao-harness` —, mais o `semver-versioning`, que o `construcao-harness` exige (`requires`). Todos os outros guias ficam ⏭️ com o motivo `stack legada (<dir>: <evidência>)`, inclusive os que a tabela abaixo marca como "sempre". A chamada 2 da Fase 2 vira confirmação (Seguir só com harness e Graphify · Cancelar). Outro guia só entra se o usuário pedir pelo nome, com `/setup --only <slug>`, e o G4 continua valendo. Repositório com subprojeto legado e subprojeto moderno usa a matriz normal: o `detect_stack.sh` tira os diretórios legados dos outros alvos, e nenhum guia moderno toca neles.

| Guia (caminho em guides/) | Condição | Nível |
| :-- | :-- | :-- |
| `essentials/*` | sempre | obrigatório |
| `ai-engineering/guia-construcao-harness.md` | sempre | obrigatório |
| `ai-engineering/1password-credentials-guide.md` | prioridade segurança | recomendado |
| `ai-engineering/guia-ai-jail-sandbox.md`, `guia-configuracao-notificacoes-openclaude.md`, `guia-orquestracao-ciclo-de-vida-skills.md`, `guia-mods-tui-observabilidade.md` | sempre (ai-jail e mods nunca são recomendados nem obrigatórios) | opcional |
| `architecture/guia-arquitetura-software-design-clean-code.md` | sempre | recomendado |
| `architecture/guia-seguranca-defensiva-zero-trust.md` | sempre; obrigatório se prioridade segurança ou em produção | recomendado |
| `architecture/guia-system-design-sistemas-distribuidos.md`, `guia-padroes-resiliencia-defensiva.md` | `detect_stack.sh backend` ou `api` | recomendado |
| `architecture/domain-documentation-standards.md` | em produção ou legado | opcional |
| `testing/backend/*` | `detect_stack.sh python`/`php`/`go` | recomendado; obrigatório se prioridade testes |
| `testing/frontend/*` | `detect_stack.sh frontend` | recomendado; obrigatório se prioridade testes |
| `design-ui-ux/guia-universal-design-ui-ux-acessibilidade.md`, `guia-regras-ux-design-cognicao-comportamental.md` | `detect_stack.sh frontend` ou `mobile` | recomendado |
| `design-ui-ux/guia-product-design-ciclo-completo.md` | frontend/mobile e prioridade UX | recomendado |
| `design-ui-ux/guia-componente-tabela-*.md`, `guia-dashboard-*.md`, `guia-liquid-glass-*.md` | frontend | opcional |
| `product-management/*` | produto em discovery ou prioridade gestão de produto | recomendado |
| `integrations/guia-scalar-openapi-dx.md` | `detect_stack.sh api` | recomendado; obrigatório se prioridade DX de API |

## Fase 2 — Perguntas (G3 — AskUserQuestion, no mínimo 2 chamadas)

**Chamada 1 — contexto** (pule só as perguntas que as instruções livres já responderam literalmente; se todas foram respondidas, faça uma pergunta de confirmação):

1. **Propósito** (single): API/backend · web app · fullstack · mobile · biblioteca/SDK · monolito legado · produto em discovery.
2. **Maturidade** (single): greenfield · em produção. A opção diagnosticada na Fase 1 vem primeiro, marcada `(Recomendado)`.
3. **Prioridades** (multiSelect): testes · segurança · arquitetura · UX/design · gestão de produto · DX de API.
4. **Instalar dependências de sistema faltando?** (single): sim, instale (`uv`, `graphify`, `jq`, `make`, …) · pergunte antes de cada uma · não instale nada.

**Chamada 2 — seleção item a item** (multiSelect, uma opção por guia **recomendado** e **opcional**, com o nível no rótulo; os obrigatórios vão listados na pergunta como já incluídos). O AskUserQuestion aceita **no máximo 4 opções por pergunta e 4 perguntas por chamada**: agrupe os guias por categoria em perguntas de até 4 opções (ex.: segurança · arquitetura · testes/DX · harness/opcionais), na mesma chamada; passando de 16 guias, faça uma segunda chamada com o restante. O que não for marcado entra em `--skip`. Em projeto legado (Fase 1), a chamada 2 é só a confirmação da regra do projeto legado.

## Fase 3 — Lista final e aprovação (G4)

Mostre a lista final na ordem de execução (`list` já respeita `requires`), com o que será instalado e o que ficará de fora, e peça a aprovação com **AskUserQuestion** (single: Aprovar e executar · Ajustar a lista · Cancelar). Pergunta em texto não vale: a Fase 4 só começa na mensagem seguinte à resposta "Aprovar e executar". `--only` substitui a seleção, mas não dispensa esta aprovação.

**Migração para `AGENTS.md`.** Se a Fase 0 imprimiu `presente: GEMINI.md`, ou `presente: CLAUDE.md` cujo conteúdo ainda não é o stub `@AGENTS.md`, a lista mostrada nessa chamada inclui a linha `Instruções migram para AGENTS.md: CLAUDE.md vira @AGENTS.md e GEMINI.md da raiz é removido (git rm, recuperável) — HARNESS-06`.

**Migração de ADRs.** Se a Fase 0 achou `docs/adr` sem `docs/adrs` (e o `AGENTS.md` não tem `ADRs mantidas em docs/adr/`, escolha feita antes), a mesma chamada leva uma segunda pergunta (single): **Migrar para `docs/adrs/` (Recomendado)** — `git mv` preserva o histórico; links externos para `docs/adr/...` quebram · **Manter `docs/adr/`** — scripts e heurísticas continuam usando a pasta antiga; o ADR-08 registra a escolha no `AGENTS.md`. Com as duas pastas presentes, não pergunte: o relatório aponta a duplicidade (os scripts usam `docs/adr/`).

## Fase 4 — Execução (G5)

**Baseline da suíte do projeto (antes de qualquer sub-skill):** registre se os testes que o projeto já tem passam hoje, para o G6 separar falha causada pelo setup de falha pré-existente:

```bash
sh .agents/ai-guides/templates/test_baseline.sh save   # grava dir, comando, exit code e log de cada suíte (fora do repo)
```

**Migração de ADRs** (só com "Migrar" na Fase 3), antes da primeira sub-skill. Se o projeto tem validador de ADRs, rode-o antes e depois: o resultado não pode piorar.

```bash
git mv docs/adr docs/adrs 2>/dev/null || mv docs/adr docs/adrs   # sem git ou sem arquivo rastreado: mv
test -d docs/adrs && ! test -e docs/adr
git grep -n 'docs/adr/' -- ':!.agents/ai-guides' 2>/dev/null || grep -rn 'docs/adr/' --exclude-dir=.git --exclude-dir=.agents .
```

Troque para `docs/adrs/` cada referência viva dessa saída: `AGENTS.md`, READMEs, links entre ADRs, workflows de CI e scripts do projeto. Logs de manutenção, changelogs e relatórios históricos ficam como estão.

Para cada slug aprovado, **uma por vez**, na ordem:

- Invoque a skill `setup-<slug>` (prefixada pelo plugin quando instalada como plugin); se não estiver registrada, leia `$SETUP/<slug>/SKILL.md` e execute os passos literalmente. **Uma sub-skill por mensagem, nunca duas em paralelo**: a próxima só começa depois do `verify` da anterior. Os `do` shell quem executa é o `apply`; você só faz os passos `AGENT`.
- **Dependências são parte da skill.** As heurísticas de instalação usam `$R/templates/install_dep.sh <comando> [gerenciador:pacote…]`, que cobre brew, winget, scoop, choco, apt, dnf, yum, pacman, zypper e apk. O `apply` executa as instalações sem perguntar: se o usuário pediu confirmação (Fase 2, pergunta 4), rode antes `plan <slug>`, pergunte sobre cada id cujo `do` instala software (`install_dep.sh`, `brew`, `uv tool install`, `npm install`, …) e passe `--skip <ID>` ao `apply` para cada instalação recusada; com "não instale nada", passe `--skip` em todas. O id pulado fica ⏭️ e seus dependentes ⏸️; se isso deixar ❌ no `verify`, marque o guia como `--skip` na Fase 5 em vez de fingir que passou.
- Uma heurística de instalação em ❌ **interrompe** aquele guia: reporte o comando e o erro; não siga para o próximo sem dizer.
- `apply` parou no **HARNESS-16** (hook quebrado): se o hook é de um guia selecionado que o reescreve (hook-guard ou `graphify update` → GRAPH-04/05), rode de novo com `--skip HARNESS-16` e siga — o G6 prova tudo no fim. Hook do projeto que nenhum guia cobre → AskUserQuestion (corrigir o caminho · remover · manter e deixar ❌); nunca remova nem reescreva hook sem essa resposta.
- Um arquivo criado pelo setup quebrou uma checagem que o projeto já tinha (validador de ADR, lint, CI) → ajuste o que o setup criou ou pergunte ao usuário (AskUserQuestion); nunca edite a checagem do projeto sem essa resposta.
- Guias não selecionados na Fase 2 entram em `--skip` na Fase 5.

## Fase 5 — Verificação e smoke test (G6)

```bash
uv run $SETUP/scripts/verify_setup.py verify --all --manifest \
  --set purpose=<propósito> --set stack=<a,b> --set priorities=<x,y> [--skip <slug>]...

# smoke test — o setup tem de funcionar na prática, não só existir:
python3 .agents/scripts/harness/verify_hooks.py            # hooks: JSON válido, binários presentes, scripts sem erro
PATH="$HOME/.local/bin:$PATH" graphify --version
sh .agents/ai-guides/templates/graph_smoke.sh                  # exige nós de verdade na resposta, não só exit 0

# suíte que o projeto já tinha — reexecuta os comandos do baseline da Fase 4 e os novos criados pelo setup
sh .agents/ai-guides/templates/test_baseline.sh check

# alvo de contrato OpenAPI (SCALAR-03), se existir: tem de rodar de verdade, não só existir
if grep -qs '^openapi:' Makefile; then make openapi; elif grep -qs '"openapi:export"' package.json; then npm run openapi:export; fi
git diff --stat -- docs/api/openapi.json   # diferença = drift do contrato: reporte; não descarte nem commite sem o usuário
```

- `test_baseline.sh check` com ❌ (suíte verde no baseline e vermelha agora, ou comando novo criado pelo setup falhando) → o setup quebrou o projeto: inspecione `git diff` (rotas novas como `/scalar` no `main.py`, dependências, configs de lint) e corrija a integração antes de encerrar. O `check` já compara os ids de teste que falharam: ❌ = falha nova, bloqueia. ⚠️ `sem falha nova` vai para o relatório. O pytest roda com `--continue-on-collection-errors`: coleta quebrada antes do setup não esconde teste novo quebrado. ⚠️ `baseline cego` (a suíte nem executou os testes): registre no relatório que o G6 **não prova** ausência de regressão e recomende consertar a coleta. O `check` reexecuta também o lint que o projeto já tinha (o `make lint` que não reescreve arquivo, ou o Ruff de cada subprojeto Python): verde antes e vermelho agora → ❌, porque o setup ligou regra sobre violação que o código já tinha e o CI que passava quebraria — desligue a regra e deixe o ⚠️ do id com o motivo; vermelho antes → ⚠️ com as violações antes → agora.

- Qualquer ❌ no `verify`, hook com problema, `graph_smoke.sh` falhando ou alvo `openapi` saindo ≠ 0 → rode `apply <slug>` do guia do id (o `do` shell refaz o arquivo; **nunca** o escreva à mão) e os passos `AGENT` que ele listar, **uma vez**, e repita. Se persistir, liste o `id`/comando que falhou e encerre **sem** declarar sucesso.
- ⚠️ no `verify` não é pronto: é um passo `AGENT` que ficou por fazer (`plan <slug>` mostra o texto sem executar nada; faça-o), um id que o usuário recusou (`--skip`, instalação recusada) ou uma pendência que o próprio `do` manda deixar (ex.: dívida registrada em ADR pelo ARCH-03). Cada ⚠️ que sobrar vai para o relatório como `⚠️ <ID>: <motivo>`.
- Tudo verde → relatório final com: **checklist dos 6 gates e a prova de cada um**, a saída **literal e completa** do `verify --all` (termina na linha `RESULTADO:`), uma linha `⚠️ <ID>: <motivo>` para cada ⚠️, saída do smoke test, caminho do manifesto, as contagens de guias (obrigatórios/recomendados/opcionais) copiadas da lista aprovada no G4, a saída do `git ls-files` do G1, a migração de ADRs (feita, recusada ou não oferecida) com as menções a `docs/adr/` mantidas por serem históricas, a saída literal de `git status --short` e, dela, os arquivos que nenhuma heurística manda tocar (lista vazia ou aprovada pelo usuário) e próximos passos, em texto: revisar o `git diff`, levar a branch a um PR com o CI verde e, só quando o usuário pedir, `/commit-e-documentar` (incluindo `.agents/ai-guides/`). Se a linha `RESULTADO:` tiver ❌, o relatório não diz sucesso.
