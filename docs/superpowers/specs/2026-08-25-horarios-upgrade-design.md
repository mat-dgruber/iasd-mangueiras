# Design Doc — Upgrade e Modernização do Módulo de Horários & Localização

**Data**: 2026-08-25  
**Autor**: OpenClaude & Equipe IASD Mangueiras  
**Status**: Aprovado (Aguardando Plano de Implementação)  
**Escopo**: Frontend (`features/horarios`, `features/admin/horarios`, `core/utils`, `core/services`)

---

## 1. Visão Geral e Objetivos

O módulo de Horários (`/horarios`) é uma das principais portas de entrada e conversão de visitantes da IASD Mangueiras em Tatuí-SP. Atualmente, a página lista apenas os cultos semanais de forma estática com alguns alertas e um link simples para o Google Maps.

Este projeto tem como objetivo transformar o módulo de Horários em uma experiência completa, interativa e orientada à ação, fornecendo:
1. **Contexto Temporal e Astronômico em Tempo Real**: Cálculo do pôr do sol em Tatuí-SP (para guiar o início e término do sábado) e identificação do próximo culto em um badge compacto e discreto.
2. **Ações Rápidas por Culto**: Botões nos cards de culto para adicionar à agenda (Google Agenda e download de `.ics` compatível com Apple/Outlook) e convidar no WhatsApp com mensagem formatada.
3. **Mobilidade Expandida & Acessibilidade**: Botões de rotas com 1 clique para Google Maps, Waze, Apple Maps e Uber, botão com feedback visual ("Copiar Endereço") e painel de comodidades (estacionamento, acessibilidade/rampas, berçário, ar-condicionado).
4. **Gestão Administrativa Completa no Firestore**: Painel `/admin/horarios` atualizado para gerenciar tanto a grade regular quanto avisos de horários especiais com auto-expiração por data e toggle ativo/inativo sem perder o fallback seguro do `horarios.json`.

---

## 2. Arquitetura e Estrutura de Arquivos

```
frontend/src/app/
├── core/
│   ├── models/
│   │   └── content.models.ts           # Extensão de Horario e AvisoHorarioEspecial
│   ├── services/
│   │   ├── content.service.ts          # Sincronização Firestore de horários regulares + avisos com expiração
│   │   └── admin-cms.service.ts        # CRUD Firestore para horários regulares e avisos
│   └── utils/
│       ├── solar-time.util.ts          # Algoritmo NOAA para pôr do sol em Tatuí-SP (-23.3556, -47.8569)
│       ├── solar-time.util.spec.ts     # Testes unitários para cálculo solar
│       ├── calendar-links.util.ts      # Geração de URLs Google Calendar e download de .ics (RFC 5545)
│       ├── calendar-links.util.spec.ts # Testes unitários de calendário
│       ├── mobility-links.util.ts      # Links para Google Maps, Waze, Apple Maps e Uber
│       └── mobility-links.util.spec.ts # Testes unitários de mobilidade
└── features/
    ├── horarios/
    │   ├── horarios.page.ts            # Nova interface com badge solar, cards de ação e mobilidade
    │   └── horarios.page.spec.ts       # Testes unitários da página
    └── admin/
        └── horarios/
            ├── admin-horarios.page.ts  # Painel de gestão completo (regulares + especiais com auto-expiração)
            └── admin-horarios.page.spec.ts # Testes unitários do painel admin
```

---

## 3. Especificação Técnica dos Módulos

### 3.1 Utilitários Centrais (`core/utils/`)

#### 3.1.1 `solar-time.util.ts`
- **Responsabilidade**: Cálculo puramente determinístico em TypeScript do pôr do sol astronômico em Tatuí-SP (Latitude `-23.3556`, Longitude `-47.8569`, UTC-3) usando algoritmo solar padrão NOAA sem bibliotecas externas.
- **Funções Exportadas**:
  - `getSunsetTime(date: Date, lat?: number, lng?: number): { hours: number; minutes: number; formatted: string }`: Retorna a hora e minuto do pôr do sol local.
  - `getTodaySunset(): string`: Retorna string formatada `HH:mm` para a data de hoje.
  - `getSabbathSunsets(refDate?: Date): { fridaySunset: string; saturdaySunset: string; isSabbathNow: boolean }`: Retorna os horários de pôr do sol de sexta e sábado da semana atual e indica se o instante atual está no período do sábado sagrado (sexta pôr do sol até sábado pôr do sol).

#### 3.1.2 `calendar-links.util.ts`
- **Responsabilidade**: Geração de deep links e arquivos de evento de calendário.
- **Funções Exportadas**:
  - `buildGoogleCalendarUrl(event: CalendarEventInput): string`: Monta a URL `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...` com horários formatados em UTC.
  - `generateIcsContent(event: CalendarEventInput): string`: Cria a string compatível com RFC 5545 (`BEGIN:VCALENDAR...`).
  - `downloadIcsFile(event: CalendarEventInput, filename?: string): void`: Dispara download nativo no navegador via `Blob` e `URL.createObjectURL`.

#### 3.1.3 `mobility-links.util.ts`
- **Responsabilidade**: Geração de URLs de navegação para aplicativos de trânsito e mobilidade com endereço e coordenadas de Tatuí-SP.
- **Funções Exportadas**:
  - `getGoogleMapsUrl(address: string, lat?: number, lng?: number): string`
  - `getWazeUrl(lat?: number, lng?: number): string`
  - `getAppleMapsUrl(address: string, lat?: number, lng?: number): string`
  - `getUberUrl(address: string, lat?: number, lng?: number): string`
  - `getWhatsAppShareUrl(horario: { titulo: string; dia: string; horario: string; endereco: string }): string`

---

### 3.2 Modelos de Dados (`content.models.ts`)

```typescript
export interface Horario {
  id?: string;
  titulo: string;
  dia: string;
  horario: string;
  descricao: string;
  ativo?: boolean;
  ordem?: number;
}

export interface AvisoHorarioEspecial {
  id?: string;
  titulo: string;
  data_evento?: string;
  mensagem: string;
  ativo?: boolean;
  expira_em?: string; // Formato YYYY-MM-DD para auto-expiração
  createdAt?: string;
}
```

---

### 3.3 Camada de Serviços (`ContentService` & `AdminCmsService`)

- **`ContentService`**:
  - Escuta em tempo real a coleção `horarios_regulares` no Firestore; se vazia ou offline, mantém o fallback imediato de `defaultHorarios` (`content/horarios.json`).
  - Filtra a coleção `avisos_horarios` descartando registros com `ativo === false` ou onde `expira_em` for anterior à data corrente (`YYYY-MM-DD < hoje`).
- **`AdminCmsService`**:
  - Adiciona métodos `getHorariosRegulares()`, `saveHorarioRegular()`, `deleteHorarioRegular()` e `toggleHorarioAtivo()`.
  - Aprimora `saveAvisoHorario()` para suportar `expira_em` e flags de ativação.

---

### 3.4 Página Pública de Horários (`horarios.page.ts`)

1. **Header com Badge Compacto**:
   - Barra estilizada em formato de pílula contendo:
     - 🌅 Pôr do sol hoje em Tatuí (`18:14`) / indicação de pôr do sol de sábado.
     - ⏱️ Indicador dinâmico de Próximo Culto com dia e hora.
2. **Cards de Cultos Regulares**:
   - Badge de destaque visual para o culto que ocorre hoje.
   - Botão **"+ Adicionar à Agenda"**: abre menu rápido para Google Agenda ou baixar arquivo `.ics`.
   - Botão **"Convidar no WhatsApp"**: abre o WhatsApp Web / App com mensagem cordial pronta.
3. **Seção Como Chegar & Mobilidade**:
   - Exibição clara do endereço com botão interativo **"Copiar Endereço"** que exibe toast de confirmação.
   - Grade de botões de navegação rápida: **Google Maps**, **Waze**, **Apple Maps** e **Uber**.
   - Seção de **Comodidades & Acessibilidade**:
     - 🚗 Estacionamento gratuito no local
     - ♿ Acessibilidade completa e rampas de acesso
     - 👶 Classes infantis e berçário acolhedor
     - ❄️ Ambiente 100% climatizado
4. **FAQ Acolhedor**:
   - Accordion expansível mantido com tipagem e schema.org para SEO local.

---

### 3.5 Painel Administrativo (`admin-horarios.page.ts`)

- **Seção de Cultos Regulares**:
  - Listagem dos cultos com status (Ativo/Inativo), horário e dia.
  - Botão "+ Novo Culto Regular" que abre modal para inclusão/edição.
  - Botão de toggle rápido de ativação sem necessidade de exclusão.
- **Seção de Avisos Especiais**:
  - Modal com formulário reativo contendo campo opcional de *Data de Expiração (YYYY-MM-DD)*.
  - Badge visual de alerta com indicação de data de término.
  - Exclusão com confirmação e feedback imediato via `ToastService`.

---

## 4. Diretrizes de Acessibilidade (WCAG 2.2 AA) & Design System

- **Cores & Contraste**: Uso rigoroso da paleta Tailwind do projeto (`advent-blue`, `advent-gold`, `advent-neutral`, `advent-text`), garantindo contraste mínimo de `4.5:1`.
- **Navegação por Teclado**: Todos os modais e menus de contexto possuem controle de tecla `Escape`, foco retido e botões com `min-h-[44px]` e `min-w-[44px]` para conformidade touch.
- **Leitores de Tela**: Atributos `aria-expanded`, `aria-label` descritivos em todos os botões de ação e regiões de status com `role="status"` ou `aria-live="polite"`.

---

## 5. Estratégia de Testes

1. **Testes Unitários de Utilitários**:
   - `solar-time.util.spec.ts`: Validar cálculo solar para datas conhecidas (solstício de verão, inverno, equinócios) e detecção correta do período sabático.
   - `calendar-links.util.spec.ts`: Validar formatação RFC 5545 de `.ics` e parâmetros da URL do Google Calendar.
   - `mobility-links.util.spec.ts`: Validar URLs de deeplink para Waze, Google Maps, Apple Maps, Uber e WhatsApp.
2. **Testes de Componentes e Serviços**:
   - `horarios.page.spec.ts`: Validar renderização do badge compacto, cópia de endereço para o clipboard e disparos de ação de calendário.
   - `admin-horarios.page.spec.ts`: Validar formulários reativos, CRUD de horários regulares e filtro de expiração de avisos.
   - `content.service.spec.ts`: Validar fallback com `horarios.json` e filtragem por data de expiração.

---

## 6. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Fuso horário incorreto em dispositivos do usuário | Baixa | Baixo | Utilitário solar fixa o offset UTC-3 (Horário de Brasília) de forma determinística para Tatuí-SP. |
| Bloqueador de popups ao baixar `.ics` ou abrir apps | Baixa | Baixo | Ações disparadas estritamente em resposta a clique direto do usuário com elementos nativos `<a>` ou download direto via `Blob`. |
| Falha de conexão com Firestore | Média | Baixo | `ContentService` inicia imediatamente com `horarios.json`, garantindo visualização completa mesmo offline. |
