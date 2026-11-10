<!--
================================================================================
LOG DE MANUTENÇÃO DE DOCUMENTAÇÃO
--------------------------------------------------------------------------------
Data       | Autor         | Descrição
--------------------------------------------------------------------------------
2026-10-18 | Matheus Diniz | Registra health checks e referência Scalar da API.
================================================================================
-->

# ADR 0001: Padronizar health checks e documentação interativa da API

| Metadado | Detalhe |
| :--- | :--- |
| **Status** | **Implementada** (2026-10-18) |
| **Decisores** | Matheus Diniz |
| **Tags** | `api`, `observability`, `scalar`, `firebase` |
| **Impacto Sistêmico** | Médio (Cloud Functions e operação da API) |
| **ADRs Relacionadas** | N/A |

## Contexto

A API HTTP executada em Firebase Cloud Functions precisava de contratos operacionais explícitos para separar disponibilidade do processo de disponibilidade da infraestrutura persistente. Também faltava uma entrada interativa para consulta da documentação OpenAPI durante desenvolvimento e operação.

### Riscos Identificados e Problemas a Resolver

1. **Confundir processo ativo com dependências disponíveis**: um endpoint único de saúde não diferencia falha de Firestore de indisponibilidade do processo.
2. **Detecção tardia de falhas de infraestrutura**: sem readiness check, o balanceamento e os operadores não têm uma resposta padronizada para a indisponibilidade do Firestore.
3. **Baixa descoberta do contrato HTTP**: sem uma referência interativa, consumidores e mantenedores dependem de documentação dispersa.

## 1. Fundamentação Jurídica & Fontes Normativas Diretas

Não aplicável. A decisão trata de observabilidade operacional e experiência de desenvolvimento, sem introduzir tratamento adicional de dados pessoais ou retenção regulatória.

## 2. Decisão de Arquitetura

A API passa a expor três sinais distintos:

- `/health`: mantém o diagnóstico básico existente, com informações do ambiente;
- `/livez`: confirma que o processo HTTP está respondendo, sem consultar infraestrutura externa;
- `/readyz`: consulta uma leitura limitada do Firestore e retorna `503` quando a dependência não está disponível.

A documentação interativa é servida em `/scalar` pela biblioteca `@scalar/express-api-reference`, apontando para `/openapi.json`. O contrato OpenAPI continua sendo a fonte da especificação HTTP; a rota Scalar é somente sua interface de consulta.

```mermaid
graph LR
    Client[Cliente ou plataforma de execução] --> API[Cloud Function HTTP]
    API --> Live[/livez: processo ativo/]
    API --> Ready[/readyz: Firestore disponível/]
    Ready --> Firestore[(Firebase Firestore)]
    Developer[Desenvolvedor ou operador] --> Scalar[/scalar]
    Scalar --> OpenAPI[/openapi.json]
```

### Matriz de Avaliação de Alternativas

| Critério | Endpoint único | Endpoints separados (eleito) | Plataforma externa de observabilidade |
| :--- | :--- | :--- | :--- |
| **Custo / Esforço** | Baixo | Baixo | Alto |
| **Precisão operacional** | Baixa | Alta | Alta |
| **Latência do liveness** | Média | Alta | Variável |
| **Complexidade operacional** | Baixa | Baixa | Alta |
| **Descoberta do contrato HTTP** | Baixa | Média com Scalar | Alta, porém externa |

## 3. Matriz de Implementação Técnica (*IN-CODE*)

### 3.1. Backend / API Gateway

- `functions/src/health.ts`: cria o router com `/livez` e `/readyz`.
- `functions/src/index.ts`: registra o router, injeta a leitura limitada do Firestore e monta `/scalar`.
- `/livez` responde `200` com `{ "status": "ok" }` sem depender do Firestore.
- `/readyz` responde `200` com `{ "status": "ready" }` quando a verificação passa e `503` com `{ "status": "not_ready" }` quando falha.
- `functions/src/health.test.ts`: cobre os cenários de liveness, readiness saudável e readiness indisponível.

### 3.2. Frontend / Client

Nenhuma alteração de frontend é necessária para consumir os endpoints. Clientes de infraestrutura podem chamar os endpoints diretamente por meio dos rewrites do Firebase Hosting.

### 3.3. Persistência e Banco de Dados

Não há alteração de schema. O readiness executa apenas uma consulta limitada à coleção `_health`, sem criar ou modificar documentos.

## 4. Matriz de Governança & Ações Institucionais (*OFF-CODE*)

| Ref | Ação | Responsável | Evidência |
| :--- | :--- | :--- | :--- |
| OFF-01 | Configurar probes do ambiente para usar `/livez` e `/readyz` conforme o objetivo do probe. | Infraestrutura | Configuração do Firebase/monitoramento |
| OFF-02 | Publicar o contrato OpenAPI real em `/openapi.json` antes de expor novos endpoints em produção. | Engenharia | Spec OpenAPI versionada |

## 5. Prazos Legais de Guarda e Políticas de Retenção

Não aplicável. Os endpoints não persistem dados de requisição e a consulta de readiness não altera o Firestore.

## 6. Matriz de Conformidade e Mitigação de Riscos

| Risco | Impacto | Mitigação |
| :--- | :--- | :--- |
| Liveness depender de Firestore | Alto | `/livez` não executa chamadas externas. |
| Readiness mascarar indisponibilidade | Alto | Falha da consulta retorna HTTP `503` e registra o erro no log da função. |
| Documentação divergir da API | Médio | Scalar aponta para `/openapi.json`; a spec deve ser mantida como artefato versionado. |
| Exposição de detalhes sensíveis | Médio | Respostas de saúde retornam apenas estados genéricos; detalhes ficam nos logs internos. |

## 7. Consequências e Resultados

### Positivas

- Probes de execução distinguem processo vivo de serviço pronto para atender tráfego.
- Falhas do Firestore podem ser detectadas por automação e operação sem interpretar logs da aplicação.
- A equipe possui uma interface interativa para consultar o contrato HTTP.
- A implementação é pequena e reutiliza Express, Firebase Admin e a infraestrutura existente.

### Mitigações e Desafios Gerenciados

- A consulta de readiness adiciona uma leitura ao Firestore por probe; a consulta é limitada e não altera dados.
- Scalar melhora a descoberta, mas não substitui a geração e a revisão de uma especificação OpenAPI completa.
- Métricas RED, tracing distribuído e alertas específicos ainda devem ser adicionados quando houver requisitos operacionais formais.
