# Especificação Técnica: Hub de Transmissões & Mensagens Ao Vivo

**Data**: 2026-08-25  
**Status**: Aprovado pelo Usuário  
**Alvo**: Frontend (`frontend/src/app/features/ao-vivo/`) e Backend (`backend/app/services/youtube_service.py`)  

---

## 1. Visão Geral e Objetivos

Modernizar a página `/ao-vivo` da IASD Mangueiras, transformando-a em um **Hub Completo de Transmissões e Conteúdo Bíblico**. O objetivo é oferecer uma experiência acolhedora, dinâmica e interativa tanto durante a transmissão dos cultos quanto nos períodos entre eles.

### Principais Metas:
1. **Hero com Inteligência de Estado**: Exibição em tempo real de status "Ao Vivo" com player imersivo ou "Contagem Regressiva (Countdown)" com dias/horas/minutos/segundos até o próximo culto.
2. **Série Especial Presente 7**: Destaque para a série semanal gravada na igreja, conectada com a playlist oficial e episódios categorizados.
3. **Catálogo de Mensagens com Filtros e Busca**: Busca reativa instantânea por orador, tema ou texto bíblico, além de abas de filtragem rápida (*Todas*, *Série Presente 7*, *Sermões de Sábado*, *Cultos de Quarta e Domingo*).
4. **Comunhão & Interatividade**: Botões de 1 clique para agendamento no calendário (.ics / Google Agenda), convite amigável no WhatsApp e pedido de oração direto.
5. **Acessibilidade e Desempenho**: WCAG 2.2 AA (touch targets ≥ 44px, navegação por teclado, leitor de tela), `youtube-nocookie.com` com carregamento preguiçoso de miniaturas.

---

## 2. Arquitetura e Estrutura de Componentes

### 2.1 Backend (FastAPI & YouTube Data API v3)
- **Rotas Existentes**:
  - `GET /api/youtube/live`: Retorna `{ is_live: bool, live_video: VideoItem | null }`.
  - `GET /api/youtube/latest`: Retorna lista dos últimos cultos e mensagens gravadas.
  - `GET /api/youtube/presente7`: Retorna os episódios curados da série Presente 7.
- **Resiliência & Cache**:
  - Cache em memória com TTL de 30 minutos para evitar esgotamento da cota de API do YouTube.
  - Fallbacks estáticos robustos caso a chave de API não esteja configurada ou o serviço de rede esteja indisponível.

### 2.2 Frontend (Angular 19+ Standalone & Signals)
- **Arquivo Principal**: `frontend/src/app/features/ao-vivo/ao-vivo.page.ts`
- **Serviços Consumidos**:
  - `YoutubeService`: Gerencia os Signals de `isLive`, `liveVideo`, `videos` e `presente7Videos`.
  - `SeoService`: Metatags dinâmicas, Open Graph e Twitter Cards para compartilhamento social.
  - Utilitários: `generateCalendarLinks()`, cálculo do próximo culto e links de WhatsApp.

---

## 3. Detalhamento de Funcionalidades & Telas

### 3.1 Hero Inteligente & Contagem Regressiva
- **Quando `isLive === true`**:
  - Badge vermelho pulsante `● AO VIVO AGORA`.
  - Título do culto ao vivo e botão em destaque para assistir no site (modal).
  - Botão secundário "Convidar no WhatsApp" com texto pronto.
- **Quando `isLive === false`**:
  - Identificação clara do próximo culto (ex: *Próximo Culto de Sábado às 10:15*).
  - Componente de **Timer Regressivo** reativo atualizado a cada segundo via `setInterval`, exibindo:
    - Dias, Horas, Minutos e Segundos.
  - Ações rápidas:
    - *Adicionar ao Google Agenda* / *Baixar .ics*.
    - *Acessar Canal do YouTube*.
    - *Ver escala completa de horários* (`/horarios`).

### 3.2 Seção da Série Presente 7
- Bloco visual com identidade visual própria (tons elegantes em rose/vinho e gradiente suave).
- Exibição dos episódios em grade responsiva com:
  - Miniatura de alta qualidade e botão de play sobreposto.
  - Badge indicando o número da lição/episódio.
  - Título e resumo explicativo.
  - Botões para assistir via modal ou abrir diretamente no YouTube.
- Link de destaque para a playlist completa no canal oficial da igreja.

### 3.3 Catálogo de Vídeos, Filtros & Busca Reativa
- **Barra de Controle**:
  - Campo de busca instantânea com debounce e ícone de limpar.
  - Pílulas/Chips de categorias: *Todas*, *Série Presente 7*, *Sermões de Sábado*, *Quarta & Domingo*.
- **Lista de Resultados**:
  - Filtragem em tempo real usando `computed()` do Angular com base no termo digitado e categoria ativa.
  - Animação suave de entrada.
  - Empty State claro caso nenhum vídeo corresponda aos critérios.

### 3.4 Card de Intercessão & Acolhimento
- Card convidativo com mensagem espiritual e botão para enviar pedido de oração diretamente à equipe pastoral ou página de contato.
- Atalho para o estudo da Lição da Escola Sabatina (`/estudos`).

### 3.5 Modal Player com `youtube-nocookie`
- Abertura com transição suave, sem bloqueio de renderização da página inicial.
- Iframe seguro com `autoplay=1`, `rel=0` e bloqueio de cookies invasivos.
- Suporte a fechamento com `Esc`, clique no backdrop ou botão de fechar acessível.

---

## 4. Requisitos de Acessibilidade & UX (WCAG 2.2 AA)
- Todos os botões e links possuem touch target mínimo de 44x44px.
- Todos os modais e botões possuem atributos `aria-label`, `role="dialog"` e foco gerenciado.
- Contraste de texto ≥ 4.5:1 no modo claro e escuro.
- Compatibilidade total com navegação via teclado (`Tab`, `Enter`, `Escape`).

---

## 5. Estratégia de Testes & Validação
- **Backend**:
  - Testes unitários com `pytest` e `httpx.AsyncClient` para garantir que `/api/youtube/live`, `/api/youtube/latest` e `/api/youtube/presente7` retornem status 200 e estruturas JSON válidas.
- **Frontend**:
  - Testes unitários com Jasmine/Karma para `AoVivoPage`, validando:
    - Renderização correta do estado Ao Vivo vs Countdown Offline.
    - Filtragem de categorias e busca textual de vídeos.
    - Abertura e fechamento do modal de reprodução.
  - Validação estática de tipos `npx tsc --noEmit`.
