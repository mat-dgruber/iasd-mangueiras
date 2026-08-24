---
title: Guia de Segurança Máxima, Conformidade e Governança Zero-Trust
description: Manual técnico definitivo de segurança e privacidade do meuCPB, consolidando as políticas de proteção de PII (LGPD), blindagem lógica (IDOR/BFLA), conformidade Portaria MTE nº 671/2021 e antifraude de ponto eletrônico (REP-P), resiliência financeira Swile, GitGuardian, Redis 8 Security, Scalar DX e Sandbox de IA.
version: 1.3.0
date: 2026-08-24
---

# <!--

# LOG DE MANUTENÇÃO E ALTERAÇÕES DO DOCUMENTO

| Data          | Autor                                                | Descrição da Alteração                             |
| ------------- | ---------------------------------------------------- | -------------------------------------------------- |
| 2026-08-14    | Matheus Diniz                                        | Criação do Guia de Segurança Máxima unificado,     |
| (OpenClaude)  | consolidando as ADRs 0010, 0014, 0016, 0019, 0021,   |
|               | e 0022 do ecossistema meuCPB.                        |
| 2026-08-14    | Matheus Diniz                                        | Expansão drástica do guia cobrindo padrões para    |
| (OpenClaude)  | futuros projetos, boas práticas e correção de        |
|               | inconformidades de markdownlint.                     |
| 2026-08-14    | Matheus Diniz                                        | Integração síncrona completa das 16 ADRs ativas    |
| (OpenClaude)  | de segurança do portal meuCPB e correção do MD030.   |
| 2026-08-20    | Matheus Diniz                                        | Inclusão das diretrizes de segurança com Redis 8   |
| (OpenClaude)  | (RedisBloom, ACLs v2, TLS 1.3), Scalar DX Security,  |
|               | prevenção de Timing Attacks e Anti-SVG XSS.          |
| 2026-08-24    | Matheus Diniz                                        | Atualização pós-implementação da Portaria 671/2021 |
| (Antigravity) | e ADR 0040: antifraude não-bloqueante (Art. 74),     |
|               | geofencing com persistência de auditoria, Zero-Trust |
|               | de timestamp, leiaute AFD Anexo V, RBAC fiscal e     |
|               | extração autônoma de comprovantes (Art. 80).         |

=================================================================================
-->

# 🛡️ Guia de Segurança Máxima, Conformidade e Governança Zero-Trust

Este documento atua como o manual técnico definitivo de governança, conformidade regulatória e segurança de dados do ecossistema **meuCPB**. Ele reúne, unifica e detalha todas as decisões técnicas tomadas ao longo das **17 Decisões de Arquitetura (ADRs)** ativas no repositório. O objetivo deste manual é servir como blueprint obrigatório de desenvolvimento de software seguro para toda a equipe e como referência de segurança máxima para futuros projetos da instituição.

---

## 🏛️ 1. Filosofia de Segurança Zero-Trust

O princípio fundamental do modelo **Zero-Trust** adotado no meuCPB é: **"Nunca confiar, sempre verificar"**. Em nossa infraestrutura corporativa, nenhuma requisição ou fluxo de dados é considerado inerentemente seguro, independentemente do tráfego se originar de um cliente autenticado ou de canais da rede interna.

### A. Princípio da Identidade Limpa nas APIs (ADR 0022)

Para neutralizar por completo as ameaças de **IDOR (Insecure Direct Object Reference)**, **BOLA (Broken Object Level Authorization)** e **ID Scraping** (onde um atacante varre a API alterando parâmetros numéricos na URL), o meuCPB adota de forma compulsória a regra da **Identidade Limpa**.

- **Regra de Ouro:** É terminantemente proibido expor, trafegar ou receber identificadores de usuários dinâmicos (como `idUsuario`, `cpf` ou `matricula`) nas URLs físicas de rotas do BFF que consultam ou alteram dados do próprio colaborador logado.

- **Exemplo de Rota Incorreta (Insegura):**
  `GET /api/v1/financeiro/historico-salarial/{idUsuario}`

- **Exemplo de Rota Correta (Segura):**
  `GET /api/v1/historico-salarial`

- **Mecanismo de Resolução:** O backend intercepta o cabeçalho HTTP de autorização, decodifica o token JWT de forma segura e extrai o ID do usuário de forma estritamente interna no servidor, através do middleware de autenticação (`get_current_active_user`).

```python
# ponytail: Extração segura de contexto do usuário logado via dependência
@router.get("/historico-salarial", response_model=List[HistoricoSalarialSchema])
def obter_historico(
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # A identidade é deduzida diretamente do JWT, sem inputs arbitrários do cliente
    return financeiro_service.obter_historico_salarial(db, current_user.id_Usuario)
```

### B. Validação Síncrona de Posse de Dados (ADR 0017 & 0022)

Para requisições que tratam de objetos específicos compartilhados (como download de holerites históricos, upload de atestados de dependentes, etc.), o backend deve validar de forma implacável se o objeto solicitado pertence ao usuário autenticado.

```python
# ponytail: Validação estrita de autorização lógica em nível de objeto
def obter_informe_rendimento_detalhado(db: Session, id_informe: int, id_usuario_logado: int):
    informe = db.query(FinanceiroInformeRendimento).filter_by(id=id_informe).first()
    if not informe:
         raise HTTPException(status_code=404, detail="Informe de rendimento não localizado.")

    if informe.id_Usuario != id_usuario_logado:
         # Registro obrigatório de tentativa de violação de dados
         gravar_log_auditoria(
             db,
             id_usuario_logado,
             "LEITURA_INFORME_NEGADA",
             {"id_informe": id_informe, "alerta": "Tentativa de acesso a documento de terceiros!"}
         )
         raise HTTPException(status_code=403, detail="Acesso negado aos dados solicitados.")

    return informe
```

---

## 🔑 2. Criptografia de Sessão, JWT e Gestão de Contas (ADR 0014 & 0033)

A arquitetura de autenticação deve proteger dados pessoais contra vazamentos em trânsito, anular roubos de sessão via scripts maliciosos e garantir o encerramento físico de conexões.

### A. Minimização de Dados e JWT Minimalista (ADR 0014)

O token JWT trafega entre o frontend e o backend em cookies criptografados ou cabeçalhos seguros. Ele nunca deve conter Dados Pessoais Sensíveis (PII).

- **Dados Permitidos no JWT:** Identificadores estruturais não-confidenciais (`sub` como login corporativo do AD, `idUsuario`, `scopes`, `jti` como identificador de token único para revogação, e `exp` como timestamp de expiração).

- **Dados Proibidos no JWT:** CPF, Nome completo, cargo, e-mail, salário, data de nascimento e matrícula.

- **Resolução Cadastral:** O frontend deve consumir esses dados estritamente a partir do endpoint seguro `GET /api/v1/auth/me` no momento do carregamento da aplicação, que consulta as propriedades do usuário logado de forma dinâmica diretamente no banco local.

### B. Transporte Seguro de Token via Cookies HttpOnly (ADR 0033)

Os tokens JWT emitidos no login são injetados diretamente em Cookies HttpOnly pelo servidor FastAPI:

- **Flags Ativadas:** `httponly=True` (proíbe terminantemente leitura de JavaScript, mitigando vulnerabilidades XSS), `secure=True` (tráfego exclusivo sob TLS), `samesite="lax"`, e `path="/api"`.

- **Duração de Sessão Inteligente:** O tempo de expiração do cookie é dinâmico. Dispositivos móveis (`is_mobile` ou validação do User-Agent) mantêm sessão estendida de até 720 horas (30 dias) para melhor usabilidade, enquanto desktops expiram estritamente após 8 horas.

- **Transmissão Automática:** O `AuthService` do Angular anexa globalmente `withCredentials: true` para todas as requisições, permitindo que o navegador gerencie a transmissão de forma transparente.

- **Consumo Unificado:** A dependência `get_current_active_user` no backend resolve a credencial priorizando o Cookie HttpOnly e fornecendo suporte ao cabeçalho clássico `Bearer Token` como fallback.

### C. Invalidação de Sessão e Logout (JTI Blacklist) (ADR 0014)

Como o JWT padrão é stateless, o backend utiliza um controle de blacklist baseado em banco de dados para invalidar tokens quando o usuário clica em Logout.

1. Ao efetuar logout (`POST /api/v1/auth/logout`), o `jti` (JWT ID) do token atual é persistido na tabela física `TokenRevogado` (banco de dados local GSRH).

2. O interceptador global `get_current_active_user` consulta a tabela `TokenRevogado` antes de autorizar qualquer rota. Se o `jti` estiver contido na blacklist, a requisição é sumariamente rejeitada com erro `HTTP 401 Unauthorized`.

```python
# ponytail: Validação síncrona de token revogado
def get_current_active_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decodificar_token(token)
    jti = payload.get("jti")

    # Verifica blacklist de sessões invalidadas
    if db.query(TokenRevogado).filter_by(jti=jti).first():
        raise HTTPException(status_code=401, detail="Sessão encerrada. Efetue login novamente.")

    return obter_usuario_por_payload(db, payload)
```

### D. Centralização de Estado, Redis 8 Security e Lockout de Brute-Force (ADR 0033 & ADR 0038)

Centralizamos o cache LDAP corporativo e o histórico de tentativas de login falhas consecutivas (`login_failures:{username}`) em um servidor **Redis 8**:

- **Janela de Bloqueio:** A partir de 5 tentativas consecutivas de login incorreto dentro de uma janela de 5 minutos, o usuário é bloqueado temporariamente por 15 minutos (com TTL de 30 minutos gerenciado nativamente pelo Redis).

- **Sanitização de Payload e Proteção Anti-LDAP Injection:** Antes de realizar a conexão com o Active Directory, o payload de entrada `LoginRequest` sanitiza os campos (username ≤ 150 caracteres, password ≤ 256 caracteres) e rejeita sumariamente caracteres especiais perigosos `*()\/&|><=` para extinguir injeções LDAP.

- **Blacklist de JWT em O(1) com RedisBloom:** Utilização de Filtros de Bloom (`RedisBloom`) para consulta ultra-rápida de tokens revogados em memória antes de queries ao SQL Server, consumindo poucos bytes por token e blindando o banco de dados contra sobrecarga.

- **Mitigação de Cache Penetration (Enumeração de PII):** Validação prévia via Bloom Filter para existência de IDs e CPFs antes de consultas no SQL Server GSRH, neutralizando tentativas automatizadas de varredura (ID Scraping).

- **Controle de Acesso por Mínimo Privilégio (Redis ACLs v2):** O BFF conecta-se utilizando usuários dedicados com escopo restrito de prefixos de chaves (ex: `~auth:*` para autenticação, `~msg:*` para mensageria) e bloqueio total de comandos administrativos destrutivos (`FLUSHALL`, `KEYS`, `CONFIG`, `DEBUG`).

- **Criptografia em Trânsito (TLS 1.3 / mTLS):** Toda comunicação entre os workers do FastAPI e o cluster Redis corporativo em produção deve utilizar canais criptografados sob TLS 1.3 com validação mútua de certificados.

- **ResilientCache (Fallback Thread-Safe):** Criamos uma abstração de conexão que monitora a saúde do Redis. Se o servidor cair, o backend redireciona as transações de forma transparente para um dicionário local em memória protegido por `threading.Lock()`, com expiração manual baseada em TTL e clonagem estrutural de objetos via JSON para evitar vazamentos de memória (Zero Crash).

### E. Criptografia Simétrica Local Militar (AES-GCM 256 bits) para PII (ADR 0033)

Para resguardar informações cadastrais sensíveis mantidas localmente no navegador do usuário (atendendo à conformidade da LGPD):

- **AES-GCM:** Todas as chaves persistidas no `localStorage` (`cpb_user`, `scopes`, `id_usuario`, `cpb_user_avatar`) são cifradas e decifradas assincronamente através da Web Crypto API do próprio navegador.

- **IndexedDB Sandbox:** A chave simétrica de 256 bits é gerada localmente e persistida de forma **não extraível** no armazenamento IndexedDB seguro do browser (`cpb_secure`), impedindo exfiltração física ou clonagem externa por extensões ou scripts maliciosos.

- **Sinais Reativos:** Componentes consomem os dados de perfil via Angular Signals reativos (`currentUser`), eliminando leituras síncronas bloqueantes do armazenamento e prevenindo `TypeErrors` durante a latência de inicialização.

- **RxJS Memory Leaks:** Aplicamos operadores `.pipe(take(1))` em subscrições do frontend (como no Perfil) para garantir a destruição limpa de dados em memória.

---

## 🏃‍♂️ 3. Módulo de Ponto Eletrônico Antifraude e Conformidade REP-P (ADR 0010, 0016, 0025, 0033 & 0040)

A conformidade jurídica do Ponto Eletrônico no **meuCPB** atende estritamente às diretrizes da **Portaria MTP nº 671/2021** (Registrador Eletrônico de Ponto via Programa — **REP-P**), da **Portaria MTP nº 1.486/2022**, do **Art. 74 da CLT**, da **Súmula 338 do TST** e da **LGPD (Lei nº 13.709/2018)**. O sistema conjuga mecanismos de telemetria antifraude, inviolabilidade _Append-Only_, geofencing com persistência de auditoria e geração padronizada de arquivos fiscais.

### A. Princípio da Não-Recusa e Antifraude Não-Bloqueante (Art. 74 da Portaria 671/2021 & ADR 0040)

O **Art. 74, inciso I** da Portaria 671/2021 veda expressamente qualquer ação que restrinja ou impeça o trabalhador de registrar seu ponto. Por essa razão, mecanismos de antifraude de geolocalização **não devem rejeitar a requisição com códigos HTTP 4xx**, mas sim registrar a marcação marcando-a para auditoria:

1. **Fake GPS Check (Mock Location):** Se a flag `isMocked` for avaliada como `True` nos metadados do GPS, o ponto **é gravado com sucesso no banco de dados**, recebendo os sinalizadores `isMocked = 1`, `isDuvidoso = 1` e `motivoAlerta = 'MOCK_LOCATION_DETECTADO'`. Previne o bloqueio indevido de colaboradores com falhas de sinal enquanto preserva a prova documental da fraude para o RH.

2. **Precisão Horizontal de Coordenadas:** Caso a precisão reportada pelo hardware seja superior a 100.0 metros, o ponto é registrado com `isDuvidoso = 1` e `motivoAlerta = 'PRECISAO_BAIXA'`.

3. **Exceção de Bloqueio Rígido (Blacklist de Emuladores):** A única hipótese de recusa síncrona imediata (`HTTP 403 Forbidden`) ocorre quando o `deviceFingerprint` do dispositivo constar na tabela física `PontoEmulatorBlacklist` (emuladores de software conhecidos como Genymotion, Nox, BlueStacks).

### B. Detecção Cinemática de Teleporte (Haversine ≤ 120 km/h) & Filtro de Altitude (ADR 0040)

O backend calcula a distância geodésica linear entre a batida atual e a batida imediatamente anterior do mesmo colaborador utilizando a **Fórmula de Haversine**:

$$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

- **Limiar de Velocidade Realista (≤ 120 km/h):** Se o deslocamento linear entre duas batidas sucessivas exigir velocidade física superior a **120 km/h** (limiar compatível com tráfego terrestre), o registro é persistido com `isDuvidoso = 1` e `motivoAlerta = 'TELEPORTE_DETECTADO'`.

- **Filtro de Altitude Constante:** Se um dispositivo enviar 10 batidas consecutivas com altitude exatamente `0.0`, o registro é gravado com `isDuvidoso = 1` e `motivoAlerta = 'ALTITUDE_ZERADA_SUSPEITA'`, identificando ferramentas de injeção sintética de localização.

### C. Geofencing Não-Bloqueante com Auditoria (`isForaCerca` & `distanciaCercaMetros`)

- A validação de proximidade em relação às filiais da **Casa Publicadora Brasileira (CPB)** é efetuada contra os polígonos/raios cadastrados na tabela `PontoCercaVirtual`.
- Se o colaborador bater ponto fora do raio permitido (ex: teletrabalho não cadastrado ou viagem), o ponto é **registrado normalmente** com `isForaCerca = 1` e a `distanciaCercaMetros` exata calculada via Haversine é persistida na tabela `PontoRegistro`.
- No frontend, um badge informativo é exibido na UI sem interrupção do fluxo de trabalho.

### D. Zero-Trust de Relógio do Cliente (Timestamp Autoritativo do Servidor)

- O horário oficial da batida é obtido **exclusivamente no servidor** no instante de recebimento da requisição HTTP (`datetime.now(timezone.utc)`), com sincronização via NTP.br.
- Qualquer parâmetro de data/hora enviado no payload do cliente é sumariamente desconsiderado para efeitos legais de marcação, neutralizando fraudes de ajuste manual de relógio em smartphones.

### E. Imutabilidade Absoluta e Arquitetura Append-Only (ADR 0040)

- **Proibição de UPDATE e DELETE:** A tabela física `PontoRegistro` opera sob o padrão estrito de _Append-Only_.
- **Tabelas Satélites de Tratamento:** Ajustes de marcação esquecida, abonos médicos e correções efetuadas pelo RH são gravados exclusivamente nas tabelas satélites `PontoTratamento` e `PontoAbono`, mantendo o registro original perfeitamente íntegro e auditável perante a Justiça do Trabalho e auditores do MTE.

### F. Comprovante do Trabalhador e Extração das Últimas 48h (Arts. 79 e 80)

- **Conteúdo Obrigatório do Comprovante (Art. 79):**
  - Título oficial: `"Comprovante de Registro de Ponto do Trabalhador"`;
  - Número Sequencial de Registro (NSR);
  - Razão Social do Empregador (`Casa Publicadora Brasileira`) e CNPJ (`00.701.077/0001-38`);
  - Local da prestação de serviços (`localPrestacaoServico`);
  - Nome completo e CPF do colaborador;
  - Data e horário oficial da marcação;
  - Número de registro do software no INPI (`numeroRegistroINPI`);
  - Código Hash de autenticidade (SHA-256 de 64 caracteres).
- **Extração Autônoma (Art. 80, § único, III):** Endpoint seguro `GET /ponto/comprovantes?ultimas_horas=48` com resolução Zero-Trust do `id_usuario` via JWT, garantindo que o trabalhador extraia suas marcações recentes sem prévia autorização da chefia.

### G. Geração do Arquivo Fonte de Dados — AFD (Anexo V da Portaria 671) & RBAC Fiscal

- **Formato Posicional Oficial:** O gerador fiscal em `fiscal.py` produz arquivos no padrão ASCII (ISO 8859-1) com quebra de linha `CR+LF` e campos posicionais exatos:
  - **Tipo 1 (Cabeçalho):** 9 zeros + Tipo `"1"` + CNPJ/CPF + Razão Social + Nº INPI + Datas + Campo unificado `DH` de 24 caracteres (`AAAA-MM-DDThh:mm:ss-0300`) + Versão `"003"` + CNPJ Desenvolvedor + CRC-16 CCITT/XMODEM (257 caracteres no payload base).
  - **Tipo 3 (Marcação):** NSR (9 dígitos) + Tipo `"3"` + Campo `DH` (24 caracteres) + **CPF com 12 dígitos** (preenchido com zeros à esquerda nas posições 035-046) + CRC-16 (50 caracteres no payload base).
  - **Tipo 9 (Trailer):** Quantitativo de registros e totalizadores.
- **Segurança e RBAC Fiscal:** Os endpoints de extração global `/fiscal/afd` e `/fiscal/aej` são estritamente protegidos com `Security(get_current_active_user, scopes=["rh", "admin"])`, bloqueando qualquer extração não autorizada por colaboradores comuns (`HTTP 403 Forbidden`).

### H. Autenticação e Assinatura Criptográfica de Dispositivos (ES256) (ADR 0016)

- **Assinatura por Hardware:** O aplicativo móvel assina digitalmente os metadados da batida utilizando chaves assimétricas de curvas elípticas geradas no hardware seguro do dispositivo (Android Keystore / iOS Secure Enclave).
- **Padrão de Curva:** Algoritmo **ES256** sob a curva elíptica P-256 (`SECP256R1`).
- **Limite de Dispositivos:** Limitação de até 3 smartphones ativos simultaneamente por colaborador na tabela `DispositivoColaborador` para mitigação de personificação.

---

## 💳 4. Resiliência Financeira e Matriz PAT Swile (ADR 0019, 0021, 0025 & 0028)

Operações de benefícios corporativos exigem controle estrito de transações e conformidade com leis fiscais nacionais.

### A. Idempotência Transacional Síncrona (ADR 0019 & 0028)

Para prevenir duplicidades de transferências de benefícios corporativos por cliques múltiplos ou instabilidade de conexões móveis, implementa-se o controle de idempotência ativa.

- **Idempotency-Key:** O endpoint de transferência (`POST /api/v1/swile/carteira/transferir`) exige obrigatoriamente um cabeçalho HTTP `Idempotency-Key` (UUIDv4).

- **Uso de Criptografia Nativa no Browser (ADR 0028):** A geração das chaves UUIDv4 do lado do cliente no Angular utiliza exclusivamente a API nativa do navegador `crypto.randomUUID()`, reduzindo dependências de pacotes volumosos externos de terceiros (Zero dependency).

- **Fluxo de Validação:**
  1. O backend busca a chave na tabela física `SwileTransacaoIdempotencia`.
  2. Se a chave for localizada e a transação correspondente estiver concluída, o sistema retorna o payload de sucesso original de forma transparente, sem re-processar a transação financeira.
  3. Se a chave não existir, a chave é registrada no banco e a transferência prossegue de forma síncrona.

### B. Validação Síncrona da Matriz de Carteiras do PAT (ADR 0021 & 0025)

O Programa de Alimentação do Trabalhador proíbe a transferência de saldos alimentícios para fins não previstos em lei.

- **Regra de Negócio Física:** O backend valida de forma ativa o domínio das carteiras de origem e destino na transferência de saldos.

- **Combinações Permitidas:** Somente é permitida a transferência entre saldos homólogos e complementares: `Refeição <-> Alimentação` e `Mobilidade <-> Home Office`.

- Qualquer tentativa de movimentação cruzada (ex: `Alimentação -> Mobilidade`) é rejeitada síncronamente com erro `HTTP 400 Bad Request`.

- **Trava de UI (ADR 0025):** Para melhorar a UX e evitar erros desnecessários, opções inválidas de transferência são desabilitadas com o atributo nativo `disabled` nos dropdowns de seleção da interface do colaborador.

### C. Mascaramento LGPD (Minimização de Dados) (ADR 0021)

Dados pessoais retornados de APIs integradoras de benefícios devem sofrer minificação e anonimização parcial em tempo de execução no servidor para proteger a privacidade dos colaboradores.

- **CPF Mascarado:** A propriedade de CPF retornada em rotas de saldos e extratos deve ser truncada no servidor no formato `123.***.**9-00` antes de compor o JSON de resposta ao frontend Angular.

### D. Validação de Upload de Planilhas de Recarga (ADR 0021)

Processamento em lote de recargas de cartões por importação de planilhas Excel representa um vetor de ataque crítico (exaustão de recursos, injeções XML).

- **Limites Rígidos de Entrada:**
  - Tamanho máximo do arquivo físico `.xlsx`: **5MB**.
  - Quantidade máxima de dados permitida: **1.000 linhas**.
  - Validação estrutural de colunas: O arquivo deve conter exatamente as 7 colunas obrigatórias mapeadas no backend, sob pena de rejeição síncrona imediata com erro `HTTP 422 Unprocessable Entity`.

---

## 👥 5. Regras de RBAC e Performance de Cache (ADR 0038)

A gestão de papéis de acesso (**Role-Based Access Control - RBAC**) deve seguir o princípio do privilégio mínimo, evitando acoplamentos indevidos entre domínios de negócio específicos no BFF.

### A. Invalidação de Cache de Permissões em Lote (delete_pattern) (ADR 0038)

Estendemos a classe `ResilientCache` em `app/core/redis_cache.py` para oferecer a operação `delete_pattern(pattern: str)`:

- **Modo Redis:** Executa `cache._redis.keys(pattern)` e remove fisicamente as chaves correspondentes no servidor distribuído.

- **Modo Local (In-Memory Fallback):** Utiliza a biblioteca nativa `fnmatch` para filtrar chaves do dicionário `_local_cache` sob proteção de exclusão mútua do `threading.Lock()`, garantindo estabilidade e integridade multithread absoluta (thread-safety) no ambiente local.

```python
def delete_pattern(self, pattern: str) -> None:
    if self._redis_active:
        try:
            keys = self._redis.keys(pattern)
            if keys:
                self._redis.delete(*keys)
            return
        except Exception:
            self._redis_active = False

    with self._lock:
        keys_to_remove = [k for k in self._local_cache if fnmatch.fnmatch(k, pattern)]
        for k in keys_to_remove:
            self._local_cache.pop(k, None)
```

### B. Normalização Diacrítica Universal (Unicode NFD) (ADR 0038)

Para erradicar falhas de falsos negativos por acentuação ou caixa alta/baixa de módulos no banco de dados corporativo legado:

- **Backend:** Implementação da função `normalizar_texto` em `PermissaoService` que decompõe caracteres Unicode (NFD) e remove diacríticos:

```python
def normalizar_texto(texto: str) -> str:
    if not texto: return ""
    return unicodedata.normalize("NFD", texto.lower().strip()).encode("ascii", "ignore").decode("utf-8")
```

- **Frontend:** Implementação do método `normalizarTexto` no `AuthService` do Angular v21:

```typescript
private normalizarTexto(texto: string): string {
  if (!texto) return '';
  return texto.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
```

### C. Desatrelamento de Domínios no Gateway (ADR 0038)

As verificações globais de rotas administrativas (ex: interceptar URLs contendo `/administracao` no middleware de segurança) devem ser baseadas estritamente nas permissões corporativas gerais do usuário (`usuario.administrador == 1`).

- **Proibido:** Condicionar a autorização global administrativa a propriedades de domínios específicos de benefícios (como `usuario.temSwile == 1`).

- **Efeito Negativo Eliminado:** Evita que analistas de RH sem elegibilidade a cartões Swile fiquem impedidos de acessar os painéis de controle da Central de Mensageria e Comunicação Interna.

- **Resolução:** Validações de domínios específicos devem ser efetuadas em escopos de tokens JWT específicos (`scopes=["swile"]`) ou isolados na camada interna de lógica de negócio (`services.py`).

### D. Ocultação Preventiva no Frontend

Como medida complementar de UX e segurança, botões de ação e painéis administrativos devem ser ocultados fisicamente do DOM do navegador utilizando controle reativo do Angular v21.

```typescript
// ponytail: Uso do fluxo declarativo reativo para ocultação de botões
@if (authService.isAdministrador()) {
    <button (click)="abrirPainelRh()">Painel RH</button>
}
```

---

## 👤 6. Autenticação, Sincronização LDAP e Completude Cadastral (ADR 0004 & 0030)

O portal meuCPB utiliza autenticação integrada baseada no Active Directory (AD) / LDAP corporativo, sincronizando dados de login do usuário diretamente com o banco de dados **SQL Server GSRH** local.

### A. Sincronização Segura contra Duplicidade e Colisões (ADR 0030)

Durante o login inicial, o backend sincroniza as credenciais de forma robusta e defensiva:

- **Buscas Case-Insensitive:** Toda a lógica de identificação de usuários no `sync_usuario` utiliza buscas com `func.lower()`, neutralizando qualquer duplicação por colisão de caixas de login vindas do LDAP (ex: `Matheus.Diniz` vs. `matheus.diniz`).

- **Isolamento de Busca por CPF Nulo:** A cláusula de busca por CPF in `sync_usuario` só é injetada se o CPF retornado pelo LDAP for preenchido, válido e não-nulo. Se o CPF for nulo, a busca realiza-se estritamente pelo login de rede, eliminando cruzamento indevido de contas corporativas com CPF em branco.

- **Garantia de Desempenho e Consistência (db.refresh):** Injetado o método `db.refresh()` do SQLAlchemy síncrono no endpoint `/me` e na dependência `get_current_active_user` para forçar a releitura física do banco de dados SQL Server, invalidando o cache em memória do SQLAlchemy e atualizando perfis em tempo real.

### B. Guarda de Rotas e Redirecionamento Automático no Frontend (ADR 0030)

- **Guarda Global de Rotas (`authGuard`):** Guarda funcional robusto que protege todas as rotas internas da aplicação Angular v21 (`/dashboard`, `/ponto`, `/financeiro`, etc.), impedindo que usuários anônimos exponham esqueletos de layouts.

- **Redirecionamento Automatizado por Token Expirado (401):** Interceptor Angular funcional `authInterceptor` que monitora respostas HTTP com status `401 Unauthorized` (Token Expirado). Ao capturar o erro, limpa o estado ativo e redireciona automaticamente para `/login`.

- **Logout Incondicional e Limpeza Forçada:** O logout limpa de forma síncrona, imediata e incondicional todo o `localStorage` do navegador e redefiniu os Signals de sessão. Isso evita que tokens antigos de sessões desativadas ou de outros IDs fiquem presos no navegador do usuário caso o endpoint de logout do servidor sofra lentidão ou falhas temporárias.

---

## ✍️ 7. Protocolo Avançado de Assinatura Eletrônica e MFA (ADR 0015 & 0033)

Para garantir a validade jurídica de contratos, termos e acordos corporativos no portal meuCPB:

### A. Protocolo Criptográfico de Assinatura Eletrônica (ADR 0015)

- **Chave Privada em Hardware (On-Premises Device):** O app mobile gera um par de chaves criptográficas ECDSA no hardware seguro do dispositivo (Android Keystore / iOS Secure Enclave). A chave privada é mantida não-extraível fisicamente do aparelho.

- **Validação com Nonce de Uso Único:** A assinatura biométrica do dispositivo é validada através de um protocolo de Nonce único, com tempo de expiração de 60 segundos gerenciado de forma atômica pelo backend, bloqueando ataques de replay.

- **Hash SHA-512 de Não-Repúdio:** O recibo da assinatura é consolidado por um hash SHA-512 contendo ID, CPF, IP, Geocalização, hash do PDF original e carimbo de tempo gravado em banco de dados utilizando a hora do servidor (`GETUTCDATE()`), aniquilando adulterações de timestamps de cliente.

### B. MFA Seguro de Alta Confiabilidade (ADR 0033)

- **Banimento Completo de Verificação por SMS:** Banida permanentemente a verificação em duas etapas via SMS devido a vulnerabilidades graves de engenharia social e sequestro de linha celular (SIM Swapping).

- **Opções de Alta Autenticidade:** O MFA utiliza exclusivamente **TOTP (RFC 6238)** gerado 100% offline no smartphone do colaborador ou fallback por e-mail corporativo institucional (`@cpb.org.br`) com PIN numérico de alta entropia gerado pelo módulo `secrets` do Python (`secrets.token_hex(4)`).

---

## 💾 8. Armazenamento Centralizado e Integridade Criptográfica (ADR 0035)

À medida que o portal meuCPB evolui para uma arquitetura nativa em nuvem altamente disponível, o armazenamento de arquivos (como comprovantes e recibos de assinatura eletrônica) é centralizado de forma abstrata.

### A. Centralização no Google Cloud Storage (GCS) com Lazy Loading

- **Storage Centralizado:** Todo upload de arquivos sensíveis do monorepo é persistido em buckets seguros no Google Cloud Storage (GCS) via classe de serviço `StorageService` em `app/core/storage.py`, removendo o acoplamento físico ao disco local do servidor e viabilizando escalabilidade horizontal plena em múltiplos containers stateless.

- **Importação Dinâmica de Pacotes (Lazy Loading):** O pacote `google-cloud-storage` e suas bibliotecas criptográficas são importados exclusivamente sob demanda e apenas se o modo de mock cloud estiver desativado (`GCP_MOCK_ENABLED=False`). Isso permite que desenvolvedores instalem e executem o projeto sem falhas de rede corporativas ou restrições SSL em ambientes locais e offline.

- **Mock local de desenvolvimento:** Quando `GCP_MOCK_ENABLED=True`, o serviço intercepta as gravações e as salva localmente na pasta `.gcp_mock_storage`, montada no FastAPI como arquivos estáticos no path `/local-mock-storage`.

### B. Rollback Físico de Arquivos Órfãos

- Caso a transação do banco de dados falhe após a conclusão do upload (como violação de constraint de CPF em cadastros de dependentes), o BFF executa síncronamente o rollback físico do arquivo no storage chamando `storage_service.delete_file` de forma preemptiva, impedindo o vazamento ou acúmulo de armazenamento de arquivos órfãos.

```python
# ponytail: Exemplo de rollback físico na falha de inserção SQL Server
try:
    cadastrar_dependente_banco(db, dependente_data)
except ValueError as e:
    logger.warning("Falha ao salvar dependente no banco de dados. Executando rollback do arquivo no Storage.")
    storage_service.delete_file(f"dependentes/{unique_filename}")
    raise HTTPException(status_code=400, detail=str(e))
```

### C. Auditoria de Documentos via Hash SHA-256 (Audit Trail)

- Ao compor e salvar documentos finais (como contratos de casamentos ou termos assinados), o backend grava o hash **SHA-256** do arquivo no banco de dados (`hashPdfFinal`).

- A cada solicitação de download, o BFF reconstrói o hash do arquivo em tempo real e o valida contra o registro histórico do banco. Caso ocorra qualquer discrepância física de bytes, o download é imediatamente bloqueado por violação de integridade.

### D. Sanitização de Uploads e Prevenção de SVG XSS

Uploads de mídia e imagens de perfis/documentos devem ser rigorosamente validados antes da persistência no storage:

- **Validação de MIME Type Real (Magic Bytes):** A verificação de extensão deve ser validada contra os bytes mágicos do cabeçalho do arquivo (`python-magic` / validação binária), rejeitando arquivos executáveis disfarçados de imagem.

- **Neutralização de SVG XSS:** Arquivos no formato SVG recebidos em formulários devem passar por sanitização XML para remoção de tags `<script>`, manipuladores inline de eventos (`onload`, `onerror`) e links `javascript:`, prevenindo execução de scripts maliciosos ao abrir a imagem no navegador.

---

## 🗄️ 9. Persistência Unificada no SQL Server e Auditoria (ADR 0006, 0017 & 0022)

Toda a persistência e governança relacional de dados do monorepo está consolidada no banco de dados corporativo **Microsoft SQL Server GSRH** (banco `GSRH`).

### A. Padrões de Modelagem e Nomenclatura (ADR 0006)

- **Padrão Físico:** Tabelas seguem a convenção `PascalCase` sem sublinhados (`_`), e as propriedades de colunas em banco utilizam `camelCase` com chaves estrangeiras prefixadas por `id` (ex: `idUsuario`, `idColaboradorSwile`), garantindo consistência relacional e conformidade.

### B. Trilha de Auditoria Universal e logs estruturados JSON (ADR 0022)

Toda ação sensível (leitura ou modificação de dados financeiros confidenciais como holerites e informes de IR) gera obrigatoriamente logs de auditoria estruturados salvos na tabela `FinanceiroLogAuditoria`.

- **Estrutura da Tabela:**

| Coluna      | Tipo                 | Descrição                                                       |
| :---------- | :------------------- | :-------------------------------------------------------------- |
| `idLog`     | `INT (PK, IDENTITY)` | Identificador sequencial do log.                                |
| `idUsuario` | `INT (FK)`           | Referência direta ao usuário que efetuou a ação.                |
| `dataHora`  | `DATETIME`           | Timestamp UTC do evento.                                        |
| `acao`      | `VARCHAR(100)`       | Código da ação executada (ex: `LEITURA_HOLERITE`).              |
| `detalhes`  | `NVARCHAR(MAX)`      | Detalhes estruturados em formato JSON (IDs, parâmetros).        |
| `ipOrigem`  | `VARCHAR(45)`        | Endereço IP do cliente (suporta IPv4 e IPv6).                   |
| `userAgent` | `VARCHAR(500)`       | String de identificação do navegador ou dispositivo do cliente. |

- **Geração Dinâmica de Logs no Backend:**

```python
# ponytail: Gravação de log de auditoria estruturado
def gravar_log_auditoria(db: Session, id_usuario: int, acao: str, detalhes: dict, request: Request):
    log = FinanceiroLogAuditoria(
        id_Usuario=id_usuario,
        acao=acao,
        detalhes=json.dumps(detalhes),
        ipOrigem=request.client.host,
        userAgent=request.headers.get("user-agent", "Desconhecido")
    )
    db.add(log)
    db.commit()
```

---

## ⚙️ 10. Gestão Enterprise de Segredos e SDLC (ADR 0039)

A governança do desenvolvimento local e de esteiras de CI/CD é garantida por travas no ciclo de vida de commits, sandbox rígido para IAs e gerenciamento centralizado de segredos corporativos.

### A. Injeção Dinâmica em Tempo de Execução via 1Password CLI (`op run`)

- **Nenhum Segredo em Disco:** É terminantemente proibido gravar credenciais, tokens, chaves privadas ou senhas de banco de dados em texto claro (_plaintext_) no disco de computadores pessoais de desenvolvedores.

- **Secret References (`op://`):** O arquivo local `.env` do desenvolvedor deve conter apenas as URIs de referência dinâmica de cofres do 1Password Enterprise:

```env
# Database config via 1Password Reference
DB_SERVER=op://meuCPB-DEV/database/host
DB_PORT=1433
DB_NAME=op://meuCPB-DEV/database/name
DB_USER=op://meuCPB-DEV/database/username
DB_PASSWORD=op://meuCPB-DEV/database/password
```

- **Injeção em Memória em Tempo de Execução:** Para iniciar a aplicação FastAPI localmente ou executar suítes de testes, envolve-se o subprocesso Python utilizando o 1Password CLI. O utilitário resolve as URIs autenticadas biometricamente via Touch ID de forma remota e injeta as variáveis reais diretamente na RAM do subprocesso:

```bash
op run --env-file=.env -- .venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **GitGuardian pre-commit Hook (`ggshield`):** Integrado de forma síncrona no pre-commit. O scanner valida se existem segredos vazados no código de forma proativa antes da confirmação de cada commit. O uso de URIs estruturadas do 1Password (`op://`) é aprovado pelo analisador sem falsos alertas de credenciais.

### B. Sandbox Isolado para Ferramentas de IA (`ai-jail`)

Para proteger dados cadastrais confidenciais, chaves SSH do sistema operacional do desenvolvedor e histórico contra exfiltração por agentes de IA (`OpenClaude`, `Gemini CLI`, `Claude Code`), o desenvolvimento deve ser executado no ambiente de sandbox do `ai-jail`.

- **Arquivo de Configuração do meuCPB (`.ai-jail` TOML):**

```toml
command = ["openclaude"]
rw_maps = [
  "~/.openclaude",  # Armazenamento de logs de conversas locais
  "~/.gemini",      # Cache e memorias do Gemini CLI
  "~/.claude",      # Configurações globais do Claude Code
  "~/.cache",       # Cache de pacotes python, pytest e uv
  "~/.local"        # Binarios locais do desenvolvedor (~/.local/bin/uv)
]
ro_maps = [
  "~/.gitconfig",
  "~/.ssh/id_ed25519"  # Apenas leitura das chaves SSH para git push/pull seguro
]
```

- **Comando para Iniciar a Sessão Isolada:**

```bash
ai-jail openclaude
```

---

## 🧼 11. Manual de Higiene de Código Seguro para Desenvolvedores

Ao criar novos arquivos, rotas ou lógicas de negócio no meuCPB, adote as seguintes práticas defensivas diárias.

### Diretrizes de Escrita e Convenções Técnicas

- **Tratamento de Exceções Defensivo (Ruff B904):** Nunca levante novas exceções ocultando a exceção original no bloco `except`. Sempre encadeie explicitamente o erro utilizando a sintaxe `from e` para garantir a legibilidade do stack trace nos logs do gateway.

```python
# ponytail: Encadeamento de exceções conforme Ruff B904
try:
    processar_pagamento()
except BancoErro as e:
    raise HTTPException(status_code=500, detail="Erro interno de comunicação com o banco.") from e
```

- **Isolamento de Banco em Ambiente de Testes:** Suítes de testes automatizados do Pytest que utilizem bancos de dados SQLite locais em memória compartilhada devem definir `cache=shared` no engine para isolamento completo do processo de teste.

```python
engine = create_engine("sqlite:///file:testdb_financeiro?mode=memory&cache=shared")
```

- **Prevenção de Timing Attacks (Comparações em Tempo Constante):** Toda validação de assinaturas criptográficas, tokens temporários, hashes, nonces e chaves de API secretas deve utilizar obrigatoriamente `secrets.compare_digest()` ou `hmac.compare_digest()` em vez de operadores comuns (`==` ou `!=`), eliminando ataques por canais laterais baseados em tempo de resposta (timing side-channel).

```python
# ponytail: Comparação segura contra ataques de canal lateral de tempo
import secrets

def validar_token_secreto(token_fornecido: str, token_esperado: str) -> bool:
    return secrets.compare_digest(token_fornecido, token_esperado)
```

- **Blindagem de Documentação OpenAPI/Scalar (ADR 0037):** A documentação interativa servida via `scalar-fastapi` deve desativar permanentemente o assistente de IA na nuvem (`AgentScalarConfig(disabled=True)`) e ocultar ferramentas de desenvolvedor em produção (`show_developer_tools="never"`), blindando esquemas de rotas confidenciais contra vazamento externo.

- **Auditoria Estática SAST Contínua (Skill `/security-audit`):** Antes de cada entrega ou commit de novos módulos, execute a suíte SAST para validar conformidade do código contra vulnerabilidades OWASP Top 10 e LGPD:
  - Backend: `python3 meucpb-backend/scripts/security_audit.py`
  - Frontend: `npm --prefix meucpb-frontend run security-audit`

- **Suporte Nativo a Emojis e Unicode no SQL Server:** Toda conexão ou driver configurado para interagir com o banco de dados Microsoft SQL Server legado deve usar explicitamente o suporte do pool de conexões Unicode do `pyodbc`, impedindo a corrupção de caracteres especiais e falhas silenciosas de codificação de dados de formulários de mensagens corporativas.

---

Este guia é de leitura compulsória e adoção obrigatória para todos os contribuidores do ecossistema meuCPB. A segurança é um hábito de engenharia de software contínuo.
