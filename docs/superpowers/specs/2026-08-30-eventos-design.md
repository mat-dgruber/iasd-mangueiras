---
date: 2026-08-30
status: approved
---

## Redesign da Página de Eventos

## Objetivo

Melhorar a página pública `/eventos` para facilitar descoberta, participação e compartilhamento dos eventos da IASD Mangueiras, mantendo o fluxo atual de conteúdo via `ContentService`, Firestore e fallback JSON.

## Escopo aprovado

A implementação seguirá a abordagem completa, sem criar backend novo e sem adicionar dependências:

- hero com evento em destaque;
- filtros por aba, departamento e busca textual;
- grid de eventos com CTAs úteis;
- mural de comunicados integrado;
- estados completos de loading, vazio, erro, preenchido e ação indisponível;
- suporte a Light, Dark e High Contrast;
- ajustes opcionais no modelo e no admin para datas estruturadas e CTAs melhores.

## Arquitetura

A página continua como standalone component em `frontend/src/app/features/eventos/eventos.page.ts`.

O componente deve consumir:

- `ContentService.eventos()`;
- `ContentService.comunicados()`.

Adicionar estado local com `signal()` para:

- aba ativa: `proximos`, `comunicados` ou `encerrados`;
- departamento selecionado;
- termo de busca.

Adicionar derivados com `computed()` para:

- eventos publicados;
- evento em destaque;
- próximos eventos;
- eventos encerrados;
- departamentos disponíveis;
- eventos filtrados.

Reaproveitar utilitários existentes:

- `calendar-links.util.ts` para Google Calendar e arquivo `.ics`;
- `mobility-links.util.ts` para convite por WhatsApp.

## Experiência de usuário

### Hero com evento em destaque

O hero mostra o evento publicado marcado com `destaque === true`. Se houver mais de um, a implementação deve escolher o próximo evento com `data_inicio`; se nenhum tiver data estruturada, usar o primeiro destaque vindo do conteúdo.

O hero deve exibir:

- título;
- descrição curta;
- data amigável;
- horário;
- local;
- departamento;
- contagem regressiva quando `data_inicio` existir;
- CTA de inscrição quando `link_inscricao` existir;
- CTA de agenda quando `data_inicio` existir;
- CTA de convite via WhatsApp.

### Filtros e busca

A página terá abas para:

- próximos eventos;
- comunicados;
- encerrados.

Os filtros devem permitir:

- selecionar departamento;
- buscar por título, descrição, público-alvo, local e departamento;
- limpar filtros quando não houver resultado.

### Grid de eventos

Cada card deve mostrar:

- badge visual de data;
- título;
- resumo;
- departamento;
- público-alvo;
- horário;
- local;
- ações disponíveis.

Ações:

- `Inscrever-se`, quando houver `link_inscricao`;
- `Adicionar à agenda`, quando houver `data_inicio`;
- `Compartilhar`, sempre que houver conteúdo suficiente para montar mensagem;
- `Falar com a igreja`, quando não houver inscrição específica.

### Mural de comunicados

Comunicados continuam separados de eventos reais, mas próximos da agenda. Comunicados urgentes devem receber destaque visual moderado para não competir com o hero.

## Dados e admin

Manter os campos atuais do modelo `Evento` e adicionar campos opcionais:

- `data_inicio?: string` no formato `YYYY-MM-DD`;
- `data_fim?: string` no formato `YYYY-MM-DD`;
- `endereco?: string`;
- `whatsapp_contato?: string`.

Regras:

- `data` permanece como texto amigável exibido na interface;
- `data_inicio` habilita ordenação, contagem regressiva, separação entre próximos e encerrados e agenda;
- se `data_inicio` não existir, o evento continua visível no fluxo de próximos eventos;
- os campos novos são opcionais para preservar dados existentes.

O admin de eventos deve expor esses campos no formulário, sem torná-los obrigatórios.

## Acessibilidade e temas

A implementação deve seguir os padrões do projeto:

- touch targets com pelo menos 44px;
- `button` para abas e filtros clicáveis;
- estado ativo perceptível com `aria-pressed`;
- busca com label acessível;
- foco visível com `focus-visible`;
- textos claros para estados vazio e erro;
- suporte a `prefers-reduced-motion`;
- tema claro, escuro sem preto puro e alto contraste com bordas e contraste reforçados.

## Estados da interface

A página deve cobrir:

- loading com skeleton sem layout shift;
- empty state com orientação para limpar filtros ou contatar a igreja;
- error state com ação de tentar novamente quando o serviço oferecer reload;
- success state com conteúdo preenchido;
- disabled state para ações indisponíveis, explicando o motivo visualmente ou por texto acessível.

## Testes

Adicionar ou atualizar testes Angular para validar:

- filtro por busca;
- filtro por departamento;
- separação de próximos e encerrados via `data_inicio`;
- fallback quando evento não tem `data_inicio`;
- renderização de CTAs conforme disponibilidade de `link_inscricao` e `data_inicio`.

Rodar typecheck Angular e testes relevantes antes de concluir a implementação.

## Fora de escopo

Não faz parte deste redesign:

- backend novo;
- dependência nova de calendário ou UI;
- calendário mensal customizado;
- migração obrigatória dos dados antigos;
- notificações push;
- RSVP interno.
