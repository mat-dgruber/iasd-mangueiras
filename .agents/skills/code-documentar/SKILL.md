---
name: code-documentar
description: >
  Atua como um Engenheiro de Software Sênior especializado em Clean Code e Technical Writing para estruturar e documentar código inline (docstrings idiomáticas e divisores MARK:) e gerar especificações técnicas diretamente nos arquivos do projeto, sem poluir o chat.
user-invocable: true
output_format: markdown-rich
triggers:
  - /code-documentar
  - documentar código
  - gerar documentação técnica
  - padronizar docstrings
  - clean code doc
  - adicionar divisores mark
follow_up_skills:
  - commit-e-documentar
  - architecture-review
example_inputs:
  - "Documente as funções públicas e endpoints do arquivo src/services/auth.service.ts"
  - "/code-documentar aplicando TSDoc e divisores MARK: no módulo de checkout"
  - "Gere docstrings no padrão Google Style para os métodos em app/services/calculator.py"
---

# Universal Clean Code Documenter (`code-documentar`)

Esta skill transforma o agente em um **Engenheiro de Software Sênior & Technical Writer** de alta precisão técnica. Ela automatiza a organização arquitetural em seções lógicas (`MARK:`), a inserção de docstrings idiomáticas e a geração de especificações técnicas externas diretamente nos arquivos do projeto, **sem poluir o chat com longos blocos de código redundantes**.

---

## ⚠️ Regras Críticas de Execução

### 1. REGRA DE OURO: Aplicação Direta nos Arquivos (NUNCA Despejar Código no Chat)
- **NUNCA** imprima o arquivo inteiro documentado ou blocos massivos de código no chat da conversa.
- **Modificação Direta no Disco**: Utilize as ferramentas de edição de arquivos (`replace_file_content`, `write_to_file`) para alterar o código-fonte no repositório e criar/atualizar especificações técnicas em Markdown (ex: `docs/ai/specs/`, `guides/` ou diretórios correlatos).
- **Resposta Concisa no Chat**: A resposta no chat deve se restringir a um sumário executivo com badges, confirmando os arquivos alterados, divisores `MARK:` estruturados, padrões de docstring adotados e eventuais alertas técnicos identificados.

### 2. Princípios Fundamentais de Clean Documentation
- **Foco no "Porquê", Jamais no "O Quê"**: Abstenha-se de comentários óbvios que apenas traduzem a sintaxe para português (ex.: evitar `// incrementa o contador`). Documente a intenção de negócio, invariantes de domínio, garantias de concorrência, restrições de escala e tratamentos de borda.
- **Precisão Rigorosa de Tipos e Contratos**: Descreva detalhadamente parâmetros, retornos, exceções disparadas e premissas de execução (`@throws`, `Raises:`, `Errors:`).
- **Sobriedade e Manutenibilidade**: A documentação inline deve ser compacta, assertiva e resiliente a refatorações triviais de código.

---

## 🏗️ Divisores Estruturais Universais (`MARK:`)

Adicione **obrigatoriamente** divisores visuais padronizados para navegação intuitiva em IDEs modernas (VS Code, JetBrains, Xcode), respeitando a sintaxe canônica de comentários de cada linguagem:

### Sintaxes por Família de Linguagem

| Sintaxe de Comentário | Linguagens / Tecnologias | Exemplo Canônico do Divisor |
| :--- | :--- | :--- |
| `//` | TypeScript, JavaScript, Go, Rust, Java, Kotlin, C#, C++, Swift, PHP | `// MARK: - Imports & Dependencies` |
| `#` | Python, Ruby, Shell Script, YAML, Dockerfile, Elixir, R | `# MARK: - Core Business Logic` |
| `/* ... */` | CSS, SCSS, SQL (blocos), C legado | `/* MARK: - Animations & Keyframes */` |
| `--` | SQL, Lua, Haskell, Ada | `-- MARK: - Migrations & Indexes` |
| `<!-- ... -->` | HTML, Vue SFC, Svelte, XML, Markdown | `<!-- MARK: - Header Component -->` |

### Ordem Estrutural Padronizada dos Blocos

1. **Imports & Dependencies** (Módulos externos, internos e utilitários)
2. **Types, Interfaces & DTOs** (Tipagens, schemas de validação, contratos, enums)
3. **Constants & Configuration** (Configurações, variáveis de ambiente, constantes estáticas)
4. **State, Stores & Dependency Injection** (Injeção de dependências, signals, hooks, repositórios injetados)
5. **Helper Functions & Utilities** (Funções puras auxiliares e formatadores isolados)
6. **Core Business Logic / Service / Domain** (Regras de negócio principais e use cases)
7. **API Routes / Controllers / Handlers** (Endpoints, middlewares e adapters de entrada)
8. **Lifecycle & Event Listeners** (Mount, destroy, subscribers, consumers de fila)
9. **Exports & Public API** (Exportações de módulos e contratos públicos)

---

## 📚 Padrões de Docstrings Idiomáticas (7 Ecossistemas Líderes)

### 1. TypeScript / JavaScript (JSDoc / TSDoc)
Utilizado em React, Node.js, Next.js, Vue, Angular, NestJS, Hono e Express.

```typescript
// MARK: - Core Service Logic

/**
 * Processa a liquidação financeira de uma transação de pagamento.
 *
 * @remarks
 * Esta função é estritamente idempotente e utiliza lock otimista no registro de conta.
 *
 * @param transactionId - Identificador único UUIDv4 da transação.
 * @param amount - Valor monetário em centavos (inteiro positivo).
 * @param options - Metadados e opções adicionais de liquidação.
 * @returns Promessa contendo o comprovante estruturado da liquidação.
 * @throws {PaymentGatewayException} Se a comunicação externa falhar após 3 retentativas com jitter.
 * @throws {InsufficientFundsException} Quando a conta de origem não possui saldo líquido disponível.
 *
 * @example
 * ```ts
 * const receipt = await settleTransaction("tx-9876-uuid", 15000, { notifyCustomer: true });
 * console.log(receipt.settledAt);
 * ```
 */
export async function settleTransaction(
  transactionId: string,
  amount: number,
  options?: SettlementOptions
): Promise<SettlementReceipt> {
  // Implementação...
}
```

---

### 2. Python (Google Style Docstring)
Utilizado em FastAPI, Django, Flask, PyTorch, Celery e scripts de engenharia de dados.

```python
# MARK: - Core Calculation Service

def calculate_compound_yield(
    principal: float,
    annual_rate: float,
    periods_per_year: int = 12,
    years: int = 1,
) -> float:
    """Calcula o rendimento composto acumulado para um investimento base.

    Aplica a fórmula padrão A = P(1 + r/n)^(nt) considerando capitalização
    periódica e arredondamento financeiro de duas casas decimais.

    Args:
        principal: Montante inicial investido (deve ser estritamente > 0).
        annual_rate: Taxa de juros anual expressa em decimal (ex: 0.12 para 12%).
        periods_per_year: Frequência de capitalização por ano (padrão: 12 para mensal).
        years: Período total do investimento em anos completos.

    Returns:
        O montante financeiro total acumulado após o período.

    Raises:
        ValueError: Se `principal` for menor ou igual a zero ou se `annual_rate` for negativo.
        ZeroDivisionError: Se `periods_per_year` for fornecido como zero.

    Example:
        >>> calculate_compound_yield(1000.0, 0.10, periods_per_year=12, years=2)
        1220.39
    """
    if principal <= 0:
        raise ValueError("Principal must be strictly positive.")
    # Implementação...
```

---

### 3. PHP (PHPDoc & Attributes)
Utilizado em Laravel, Symfony e WordPress moderno.

```php
// MARK: - Customer Billing Service

/**
 * Executa a cobrança recorrente da assinatura do cliente.
 *
 * Garante a sincronização atômica entre o gateway de pagamento externo
 * e os registros de fatura locais via transação de banco de dados.
 *
 * @param Customer $customer Instância do modelo do cliente pagador.
 * @param SubscriptionPlan $plan Plano de assinatura associado.
 * @param array<string, mixed> $metadata Metadados contextuais para auditoria.
 * @return Invoice Objeto da fatura liquidada.
 * @throws PaymentFailedException Quando o gateway recusa a cobrança.
 * @throws SubscriptionInactiveException Se o contrato estiver suspenso.
 */
public function chargeRecurringSubscription(
    Customer $customer,
    SubscriptionPlan $plan,
    array $metadata = []
): Invoice {
    // Implementação...
}
```

---

### 4. Go (Godoc)
Utilizado em microsserviços Go, CLIs, Kubernetes tooling e APIs de alta performance.

```go
// MARK: - Tenant Store Implementation

// FetchTenantByID busca e desserializa os dados cadastrais de um Tenant pelo seu UUID.
// Retorna ErrTenantNotFound caso a chave não exista no cache Redis nem no PostgreSQL primário.
//
// Esta operação é thread-safe através do uso de leitura compartilhada com sync.RWMutex.
func (s *TenantStore) FetchTenantByID(ctx context.Context, tenantID string) (*Tenant, error) {
    // Implementação...
}
```

---

### 5. Rust (Rustdoc)
Utilizado em serviços Rust, WebAssembly, CLIs e sistemas embarcados.

```rust
// MARK: - Cryptographic Token Verification

/// Valida a assinatura criptográfica Ed25519 de um payload recebido via webhook.
///
/// # Arguments
///
/// * `payload` - Bytes brutos da mensagem recebida no corpo HTTP.
/// * `signature_hex` - Assinatura codificada em hexadecimal de 64 bytes.
/// * `public_key` - Chave pública do emissor autorizado.
///
/// # Errors
///
/// Retorna [`CryptoError::InvalidSignature`] se a verificação matemática falhar
/// ou [`CryptoError::MalformedHex`] se a string de assinatura for malformada.
///
/// # Examples
///
/// ```rust
/// use auth::verify_webhook_signature;
///
/// let valid = verify_webhook_signature(b"{\"event\":\"paid\"}", "a1b2...", &pub_key)?;
/// assert!(valid);
/// ```
pub fn verify_webhook_signature(
    payload: &[u8],
    signature_hex: &str,
    public_key: &PublicKey,
) -> Result<bool, CryptoError> {
    // Implementação...
}
```

---

### 6. Java / Kotlin (Javadoc / KDoc)
Utilizado em Spring Boot, Micronaut, Quarkus e Android.

#### Java (Javadoc)
```java
// MARK: - Order Processing Service

/**
 * Processa a validação e reserva de estoque para os itens de um pedido.
 *
 * @param orderId Identificador único do pedido no formato UUID.
 * @param items Lista de itens contendo SKU e quantidade solicitada.
 * @return Confirmação de reserva contendo código de autorização e prazo de expiração.
 * @throws InsufficientStockException Se algum item solicitado não possuir saldo em estoque.
 * @throws InvalidOrderStateException Caso o pedido já esteja cancelado ou faturado.
 * @see OrderReservation
 */
public OrderReservation reserveInventory(UUID orderId, List<OrderItemDto> items) 
        throws InsufficientStockException, InvalidOrderStateException {
    // Implementação...
}
```

#### Kotlin (KDoc)
```kotlin
// MARK: - Order Processing Service

/**
 * Processa a validação e reserva de estoque para os itens de um pedido.
 *
 * @param orderId Identificador único do pedido no formato UUID.
 * @param items Lista de itens contendo SKU e quantidade solicitada.
 * @return [OrderReservation] Confirmação contendo código de autorização e prazo de expiração.
 * @throws InsufficientStockException Se algum item solicitado não possuir saldo em estoque.
 * @throws InvalidOrderStateException Caso o pedido já esteja cancelado ou faturado.
 */
fun reserveInventory(orderId: UUID, items: List<OrderItemDto>): OrderReservation {
    // Implementação...
}
```

---

### 7. C# (.NET - XML Documentation Comments)
Utilizado em ASP.NET Core, Minimal APIs, Blazor e Entity Framework Core.

```csharp
// MARK: - Identity Management Service

/// <summary>
/// Autentica as credenciais do usuário e emite um par de tokens JWT (Access e Refresh).
/// </summary>
/// <param name="command">DTO contendo email sanitizado e senha criptografada.</param>
/// <param name="cancellationToken">Token de cancelamento da operação assíncrona.</param>
/// <returns>Resultado contendo os tokens emitidos e a expiração em segundos.</returns>
/// <exception cref="InvalidCredentialsException">Lançado quando email ou senha não conferem.</exception>
/// <exception cref="AccountLockedException">Lançado se o limite de tentativas incorretas for excedido.</exception>
/// <example>
/// <code>
/// var response = await authService.AuthenticateAsync(new LoginDto("user@org.com", "secret"), ct);
/// </code>
/// </example>
public async Task<AuthTokenResult> AuthenticateAsync(
    LoginCommand command, 
    CancellationToken cancellationToken = default)
{
    // Implementação...
}
```

---

## 🌐 Documentação de Contratos de API (OpenAPI 3.1 & Scalar DX)

A qualidade da documentação interativa gerada por ferramentas como **Scalar** e **Swagger UI** depende diretamente dos metadados expostos nos contratos do framework:

### Regras Gerais de Especificação OpenAPI
1. **Sumário e Descrição Detalhados**: Forneça `summary` conciso e `description` rica em Markdown contendo permissões necessárias (RBAC), escopos de token e efeitos colaterais.
2. **Respostas Negativas Explícitas**: Documente todas as respostas prováveis de erro:
   - `400 Bad Request`: Payload malformada ou violação de contrato.
   - `401 Unauthorized`: Ausência ou expiração de token.
   - `403 Forbidden`: Credencial válida, mas sem permissão/escopo suficiente.
   - `404 Not Found`: Recurso não localizado pelo identificador.
   - `409 Conflict`: Conflito de chave única ou colisão de idempotência.
   - `422 Unprocessable Entity`: Falha na validação semântica de regras de negócio.
3. **Exemplos Representativos**: Inclua exemplos reais para requests e responses, evitando dados fictícios sem sentido.

---

## 🧱 Estratégia de Documentação para Código Legado

Ao documentar código herdado (*legacy*) ou arquivos extensos com **zero documentação prévia**, aplique a abordagem progressiva em 3 etapas:

1. **Camada 1: Estruturação Inicial (`MARK:`)**:
   - Faça primeiro a varredura visual e organize o arquivo nos divisores de seção `MARK:`. Isso não altera o comportamento do código e cria clareza imediata.
2. **Camada 2: Contratos Públicos e Fronteiras**:
   - Documente estritamente os métodos públicos, endpoints exportados e contratos de interface que são consumidos por outros módulos.
3. **Camada 3: Refinamento de Lógica Crítica**:
   - Documente métodos privados e helpers internos apenas se envolverem regras de negócio complexas, cálculos financeiros ou tratamentos de borda não triviais.

---

## ✅ Checklist de Qualidade Pós-Documentação

Antes de concluir a tarefa, verifique:
- [ ] O código-fonte continua compilando/passando nos testes sem erros de sintaxe decorrentes dos comentários.
- [ ] Todos os métodos públicos e interfaces exportadas possuem docstring padronizada.
- [ ] Nenhum comentário redundante do tipo "O Quê" (parafraseando o nome do método) foi introduzido.
- [ ] Todos os divisores `MARK:` estão na sintaxe correta da linguagem correspondente.
- [ ] Nenhuma informação sensível (senhas, tokens, URLs internas de produção) foi inserida nos exemplos de documentação.

---

## 💬 Formato Padronizado da Resposta no Chat

Mantenha a resposta no chat estritamente focada em resultados objetivos:

````markdown
### ✅ Documentação e Organização Concluídas com Sucesso

**📁 Arquivos de Código Modificados no Disco:**
- `src/services/billing.service.ts`
  - Inseridas 4 docstrings TSDoc completas com tags `@throws`, `@remarks` e contratos de concorrência.
  - Estruturados 5 divisores lógicos `MARK:`.
- `src/controllers/billing.controller.ts`
  - Contratos OpenAPI 3.1 & Scalar DX com respostas `201`, `400`, `404` e `409`.

**📄 Especificações Técnicas Geradas / Atualizadas:**
- `docs/ai/specs/billing-api-spec.md` (Contrato de faturamento, fluxos de liquidação e matriz de idempotência)

**📌 Seções Estruturadas (`MARK:`):**
- `// MARK: - Imports & Dependencies`
- `// MARK: - Types, Interfaces & DTOs`
- `// MARK: - Core Payment Settlement Logic`
- `// MARK: - API Route Handlers`

> [!NOTE]
> **Alerta de Cobertura:** 2 funções auxiliares privadas (`formatTaxId`, `sanitizeAmount`) não receberam docstrings detalhadas por serem utilitários puros autoexplicativos.

---

## ⚡ Próximos Passos Sugeridos

- [ ] Executar validação técnica e testes via `/commit-e-documentar` para comitar as alterações em micro-commits atômicos.
- [ ] Executar auditoria arquitetural com `/architecture-review` caso novos módulos de domínio tenham sido introduzidos.
````
