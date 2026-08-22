# AI_RULES.md — Site IASD Mangueiras

## Propósito
Este documento define as regras não-negociáveis para qualquer assistente de IA que trabalhe neste código. Elas existem para manter qualidade, consistência e evitar regressões. Violar estas regras não é aceitável.

## REGRAS ABSOLUTAS (nunca quebrar)

### Stack (inegociável)
- O frontend é sempre **Angular 21+** — nunca sugerir React, Vue ou Next.js.
- A estilização é sempre **Tailwind CSS 3.4.17** — nunca usar Angular Material, Bootstrap ou estilos inline.
- Quando um componente pronto for necessário, usar **PrimeNG 21+** — nunca instalar outra biblioteca de componentes.
- Preferir **componentes Angular customizados** primeiro; recorrer ao PrimeNG só quando ele realmente economiza tempo/complexidade (ex.: Carousel, Galleria).
- O backend é sempre **Python 3.14+ com FastAPI** — nunca Node/Express ou Django.
- O gerenciador de pacotes do backend é sempre **uv** — nunca pip install ou poetry direto.
- Sempre **standalone components** — nunca NgModules.
- O site é sempre **renderizado no servidor (SSR/prerender)** — nunca transformar em SPA client-only, pois SEO é requisito.

### Qualidade de código Angular
- Sempre usar **signals** (`signal()`, `computed()`, `effect()`) para estado reativo — nunca RxJS Subject/BehaviorSubject para estado local simples.
- Sempre o **novo control flow** (`@if`, `@for`, `@switch`) — nunca `*ngIf`, `*ngFor`, `*ngSwitch`.
- Sempre **TypeScript strict** — nunca o tipo `any`.
- Nunca colocar lógica de negócio em componentes — usar serviços em `core/services/`.
- Nunca pular interfaces tipadas — respostas de API e inputs de componente devem ser tipados.
- Nunca manipular o DOM com `ElementRef` — usar bindings do Angular.
- Nunca deixar `console.log` no código commitado.

### Arquitetura
- Nunca desviar da estrutura de pastas definida em ARCHITECTURE.md.
- Nunca criar um componente novo se um de `shared/components/` puder ser reutilizado.
- Nunca instalar uma dependência nova (npm ou Python) sem aprovação explícita.
- Todas as chamadas HTTP passam por um serviço em `core/services/` — nunca chamar `HttpClient` de dentro de um componente.
- Conteúdo (eventos, comunicados, horários) é lido **apenas** via `ContentService` — nunca hardcodar dados nos componentes.
- A chave da YouTube API vive **somente no backend** — nunca expor no frontend.

### Qualidade de código Backend
- Sempre definir entrada/saída com **modelos Pydantic**.
- Sempre usar **pydantic-settings** para configuração — nunca hardcodar valores.
- Nunca expor detalhes internos de erro nas respostas da API.
- Sempre configurar **CORS** liberando apenas a origem do frontend.
- Sempre **cachear** as respostas da YouTube Data API para respeitar a cota.

### Engajamento e conversão (inegociável)
- Toda página tem **um único CTA primário** acima da dobra (ex.: "Assista ao vivo", "Venha nos visitar").
- O **botão de WhatsApp** e o acesso a **horários/localização** devem estar sempre visíveis no header.
- A página de **contato/oração** deve estar acessível em no máximo 2 cliques de qualquer página.
- Nunca esconder informação essencial de visitante: horário do culto, endereço e como chegar.
- Nunca reduzir a fonte do corpo abaixo de 16px.

### Privacidade e escopo (inegociável)
- Nunca construir pagamento/dízimo no site — sempre link externo para o sistema oficial.
- Nunca armazenar dados sensíveis de membros no MVP; formulários vão para e-mail.
- Nunca adicionar login ou área de membros sem decisão explícita de escopo.

### Design
- Nunca mudar as cores de marca definidas em `tailwind.config.js`.
- Nunca usar mais de 2 famílias tipográficas.
- Sempre manter contraste que atende **WCAG AA**.
- **Mobile-first sempre** — nunca começar pelo desktop.
- Tom visual: adventista, sóbrio e acolhedor.

## PREFERÊNCIAS FORTES (seguir salvo instrução em contrário)
- Preferir inputs baseados em signal `input()` a `@Input()`.
- Preferir `output()` a `@Output()` / `EventEmitter`.
- Manter componentes com menos de 150 linhas — dividir se maior.
- Manter route handlers do FastAPI finos — delegar lógica à camada de serviço.
- Sempre adicionar `alt` nas imagens.
- Usar estratégia de detecção de mudança `OnPush` em todos os componentes.

## COMPORTAMENTO OBRIGATÓRIO
- Antes de qualquer mudança, dizer o que vai fazer e por quê.
- Depois de cada mudança, resumir o que foi alterado.
- Se estiver em dúvida sobre escopo, perguntar antes de construir.
- Sempre trabalhar a partir do PLAN.md — não inventar tarefas.
- Não avançar para o próximo passo do PLAN.md até o atual ser confirmado como concluído.
