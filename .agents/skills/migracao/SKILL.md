---
name: migracao
description: "Hub Master de Engenharia Reversa, Arqueologia de Software, Legados e Modernização do Claude Code. Disparado automaticamente sempre que o usuário mencionar 'legado', 'sistema antigo', 'migração', 'engenharia reversa', 'reverse engineer', 'descompilar', 'desmontar binário', 'apk', 'hopper', 'ghidra', 'caixa preta', 'código espaguete', 'monolito', 'rea', 'reversa', 'descobrir regras de negócio', 'extrair especificação' ou usar os comandos /migracao, /legado ou /engenharia-reversa. Orquestra de forma unificada a suíte Reversa (73 skills), REA (engenharia reversa de binários/runtime), Migration Mythos e fluxos contínuos autônomos."
---

# 🕵️ Hub Master de Engenharia Reversa, Legados & Modernização

Este hub unifica e categoriza todo o ecossistema de arqueologia de software, análise de executáveis/binários e modernização de código legado. O usuário não precisa memorizar dezenas de comandos isolados — ao descrever uma necessidade ou citar um sistema legado/binário, o agente roteia para a categoria e ferramenta exata:

---

## 1. 🔍 Inspeção de Binários, Runtime & Apps Nativos (REA)
Para examinar executáveis sem código-fonte, analisar pacotes, debugar tráfego ou inspecionar runtime:
- **/reverse-engineer-anything** (REA): Análise estruturada de executáveis nativos (Mach-O, ELF, PE), apps Electron/ASAR, pacotes Android (APK/JADX), assemblies .NET, WebAssembly e firmware.
- **REA CLI & MCP**: Integração com Hopper Disassembler, Ghidra e IDA Pro (`npx rea-agents setup`).
- **Ferramentas de Suporte REA**:
  - `rea-tool-design`: Desenho de novos contratos de inspeção e providers de evidência.
  - `rea-ci-tests-audit`: Auditoria de suítes de teste de engenharia reversa.

---

## 2. 🏛️ Arqueologia & Extração de Especificações (Reversa Core)
Para transformar bases legadas volumosas em especificações executáveis (SDD) e contratos de arquitetura:
- **/reversa**: Ponto de entrada do framework Reversa. Orquestra a extração completa e iterativa de especificações.
- **/reversa-scout**: Mapeia a superfície do projeto (pastas, frameworks, dependências, linguagens e entry points).
- **/reversa-extract-soul**: Sintetiza a alma do projeto (`soul.md`) — propósito do sistema e entidades fundamentais.
- **/reversa-archaeologist**: Escavação módulo a módulo de algoritmos, fluxos de controle e dicionários de dados.
- **/reversa-detective**: Minera regras de negócio implícitas, máquinas de estado e matrizes de permissão.
- **/reversa-data-master**: Documentação canônica de banco de dados (DDL, relacionamentos, constraints, triggers e ERD).
- **/reversa-writer**: Gera especificações executáveis (requisitos, design técnico e tarefas).
- **/reversa-reviewer**: Revisão crítica adversarial das specs geradas para apontar lacunas e inconsistências.
- **/legacy-context-engineer**: Reconstituição histórica de intenções de negócio em códigos opacos.
- **/legacy-feature-archaeologist**: Isolamento cirúrgico de features específicas em legados volumosos.
- **/forensic-adr-recovery**: Recuperação de decisões de arquitetura históricas via Git blame e histórico de commits.

---

## 3. 🔄 Migração, Quebra de Monolito & Refatoração
Para modernizar stacks obsoletas, desacoplar dependências e garantir paridade funcional:
- **/reversa-migrate**: Orquestrador do Time de Migração (conduz as 6 etapas com supervisão humana).
- **/reversa-paradigm-advisor**: Detecta paradigma de origem/destino e aponta gaps estruturais.
- **/reversa-curator**: Define o que migra, o que é descartado e o que exige decisão humana.
- **/reversa-designer**: Topologia do novo sistema e especificação da arquitetura de destino.
- **/reversa-screen-translator**: Tradução de interfaces de usuário (literal, modernizado ou híbrido).
- **/reversa-inspector**: Especificação de testes de paridade comportamental (Gherkin/features).
- **/migration-mythos**: Metodologia canônica para decomposição segura de monolitos em produção.
- **/reversa-decouple**: Desacoplamento de dependências e quebra de ciclos com medição antes/depois.
- **/reversa-modularize**: Divisão de blocos monolíticos em módulos coesos.
- **/reversa-simplify**: Simplificação algorítmica preservando rigorosamente o comportamento externo.

---

## 4. 🚀 Ideação, SDD & Greenfield
Para clarificar requisitos e evoluir novas funcionalidades ancoradas no legado ou em projetos novos:
- **/reversa-new**: Criação greenfield a partir de linguagem natural com especificações SDD completas.
- **/reversa-brainstorm**: Clarificação e framing de ideias antes de codificar (framing, riscos, opções).
- **/reversa-drafter**: Síntese de PRD completo (problema, métricas, escopo e restrições).
- **/reversa-spec-sdd**: Decomposição de PRD em especificações SDD com pontuação de qualidade.
- **/reversa-forward**: Orquestrador do ciclo forward (conduz feature ativa da especificação ao código).
- **/reversa-coding**: Execução de planos de ação (`actions.md`) em código com tracking de regressão.

---

## 5. 🐛 Depuração, Debates & Inspeção Pente-Fino
Para triagem de bugs, análise de falhas silenciosas e debates multiagente:
- **/reversa-debugger**: Registro, triagem e rastreabilidade SPEC ↔ CODE ↔ TEST ↔ BUG.
- **/reversa-debugger-debate**: Debate multiagente competitivo entre N solvers com juiz independente.
- **/reversa-debugger-fix**: Investigação de causa-raiz, reprodução via testes e correção segura com gates.
- **/reversa-depth-inspection**: Inspeção pente-fino de conformidade, contratos, concorrência e dados.

---

## 6. 📊 Visualização de Arquitetura 3D & Mini-Sites
Para documentar visualmente o conhecimento extraído:
- **/reversa-docs**: Gera um mini-site HTML autocontido com arquitetura interativa e dashboards.
- **/reversa-arquitetura-3d**: Visualização 3D de software (Code City) navegável com Three.js.
- **/reversa-docs-mapper**: Mapeamento espacial (mapas 2D D3.js e comparação de topologias).
- **/reversa-especialista-d3**: Visualizações analíticas avançadas (force-directed, sankey, treemaps).

---

## 7. ⚡ Modos Contínuos & Autônomos (Continuous Execution)
Para cenários onde o usuário deseja execução ponta a ponta sem pausas a cada micro-etapa:
- **/reversa-autonomous**:
  - Roda a extração completa do `/reversa` (Scout → Archaeologist → Detective → Architect → Writer) em sequência contínua.
  - Concentra todas as perguntas de parametrização numa entrevista única no início.
  - Ideal para análises noturnas ou modo autônomo (YOLO / Auto Mode).
- **/reversa-forward-autonomous**:
  - Implementa uma fila de features de ponta a ponta (requisitos → plano → to-do → código → sync) sem parar entre fases nem entre features.
- **/loop**:
  - Execução periódica ou polling de status para tarefas longas de descompilação ou mineração.
