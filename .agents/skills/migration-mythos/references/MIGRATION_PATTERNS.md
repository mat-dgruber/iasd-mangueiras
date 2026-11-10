# Migration Patterns Reference

> Guia de referência para o `migration-architect`. Cada padrão inclui quando usar,
> estrutura básica, prós, contras e adaptações para sistemas legados.

---

## 1. Strangler Fig

**Quando usar:** Feature é consumida por muitos módulos. Migração incremental. Sistema legado precisa
continuar funcionando em paralelo ao novo.

**Como funciona:**
1. Criar novo componente no repositório destino
2. Criar um proxy/router que redireciona chamadas para o novo ou o antigo
3. Migrar consumidor por consumidor para o novo componente
4. Quando 100% dos consumidores estão no novo → desligar o legado

```
Callers → [Strangler Facade] → [Legacy OR New]
                                    ↕
                               feature flag / config
```

**Prós:** Zero-downtime, reversível, gradual  
**Contras:** Mantém dois sistemas vivos em paralelo, sincronização de estado é complexa  
**Atenção em legados:** Se o legado usa banco de dados compartilhado, usar ACL para isolar schemas

---

## 2. Anti-Corruption Layer (ACL)

**Quando usar:** Legado e destino têm modelos de domínio radicalmente diferentes.
O novo sistema não deve "contaminar" seu modelo com conceitos legados.

**Como funciona:**
1. Criar uma camada de tradução explícita entre os dois domínios
2. O novo sistema só fala com a ACL — nunca com o legado diretamente
3. A ACL traduz chamadas e dados nos dois sentidos

```
[Novo Sistema] → [ACL / Translator] → [Legado]
                      ↓
             modelos convertidos
```

**Prós:** Isolamento total do modelo, evolução independente  
**Contras:** Overhead de manutenção da camada de tradução  
**Atenção em legados Fat-Database:** A ACL frequentemente precisa "interpretar" procedures SQL

---

## 3. Branch-by-Abstraction

**Quando usar:** Feature está fortemente acoplada e não pode ser desacoplada facilmente.
A mudança precisa acontecer de forma segura sem criar um fork do código.

**Como funciona:**
1. Criar uma abstração (interface) sobre o componente legado existente
2. Criar a nova implementação por trás da mesma interface
3. Usar feature flag para alternar entre as implementações
4. Remover a flag e a implementação legada quando estável

```
[Interface/Contract]
    ├── [LegacyImpl]   ← flag=OFF
    └── [NewImpl]      ← flag=ON
```

**Prós:** Fácil rollback (flip da flag), testável em isolamento  
**Contras:** Interface precisa ser desenhada com cuidado para não vazar conceitos legados  

---

## 4. Direct Port

**Quando usar:** Feature é pequena, isolada, sem acoplamentos, e a linguagem/framework é a mesma
ou muito similar.

**Como funciona:**
1. Copiar os artefatos para o destino
2. Adaptar imports e convenções de nomenclatura
3. Adicionar testes
4. Remover do legado

**Prós:** Mais simples, rápido  
**Contras:** Não funciona bem com código fortemente acoplado  

---

## 5. Rewrite with Contract Test

**Quando usar:** Mudança de linguagem ou framework. A lógica pode ser reimplementada do zero,
mas o comportamento público deve ser preservado.

**Como funciona:**
1. Documentar o comportamento atual com testes de contrato (Consumer-Driven Contract Testing)
2. Reimplementar a feature no novo contexto
3. Executar os contract tests contra a nova implementação
4. Aprovação → nova implementação substitui a legada

```
[Legacy Behavior] → [Contract Tests] ← [New Implementation]
                         ↑
                   spec de comportamento
```

**Prós:** Garantia formal de equivalência comportamental  
**Contras:** Escrever contract tests antes de reimplementar é trabalhoso  
**Ferramentas:** Pact (JS/Java), pytest-contract (Python)

---

## 6. Adapter + Shadow Mode

**Quando usar:** Feature com muitos efeitos colaterais (escreve em DB, envia e-mails, dispara
integrações). Precisa-se validar a nova implementação em produção sem efeitos reais.

**Como funciona:**
1. Criar adapter que chama legado E novo em paralelo
2. Novo executa em "shadow mode" (lógica rodada, efeitos bloqueados)
3. Comparar outputs de legacy vs. novo sem afetar produção
4. Quando outputs são equivalentes → ativar efeitos do novo, desligar legado

```
[Caller]
   ↓
[Adapter]
   ├── → [Legacy]  (efeitos reais)
   └── → [New]     (shadow: sem efeitos, log only)
```

**Prós:** Validação segura em produção, sem risco  
**Contras:** Complexidade do adapter, custo de dobrar cada chamada  

---

## 7. Canonical Selection + Behavioral Spec

**Quando usar:** Existem múltiplas versões da mesma feature (v1, v2, v3...) com comportamentos
conflitantes. Precisa-se definir qual é a verdade antes de migrar.

**Como funciona:**
1. Executar `diff_versions.py` para mapear divergências
2. Selecionar versão canônica com base nos critérios (mais recente, mais completa, mais testada)
3. Documentar explicitamente os comportamentos divergentes e qual foi escolhido
4. Gerar Behavioral Spec (Gherkin) antes de qualquer migração
5. Executar a migração usando o Direct Port ou Rewrite a partir da versão canônica

**Prós:** Elimina ambiguidade antes da migração, documenta decisões  
**Contras:** Requer decisão de negócio sobre comportamentos conflitantes  
