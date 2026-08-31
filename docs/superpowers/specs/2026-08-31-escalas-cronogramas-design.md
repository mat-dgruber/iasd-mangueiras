# Design Doc: Portal Público de Escalas & Gestão Integrada de Cronogramas

**Data:** 2026-08-31  
**Status:** Aprovado para Implementação  
**Autor:** OpenClaude / Matheus Diniz  
**Módulo:** `src/app/features/escalas/` & `src/app/features/admin/escalas/`

---

## 1. Contexto e Motivação

A IASD Mangueiras conta com diversas frentes de trabalho ministerial e voluntariado (Sonorização & Transmissão, Diaconato, Recepção, Música & Louvor, Escola Sabatina, Ministério Infantil, etc.). Atualmente:
- As escalas são cadastradas e exportadas pelos administradores em `admin-escalas.page.ts` para WhatsApp e Stories (.png via Canvas).
- **Principal Gargalo:** Não existe uma página pública de consulta (`/escalas`) para que os membros e voluntários possam consultar suas escalas no site/boletim digital, buscar por seu nome, adicionar compromissos diretamente à agenda de seus celulares (.ics / Google Calendar) ou solicitar trocas/substituições de forma rápida.
- **Painel Administrativo:** A entrada de dados pode ser acelerada com auto-sugestão de voluntários prévios e validações de data para evitar inconsistências.

O objetivo deste projeto é implementar o **Portal Público de Escalas (`/escalas`)** com arquitetura reativa (Angular 21+ Standalone + Signals), integrado com o `ContentService` existente (Firestore + fallback offline `escalas.json`), com ações rápidas de produtividade (Google Calendar, `.ics`, WhatsApp para liderança e compartilhamento), em total conformidade com o Design System e diretrizes WCAG 2.2 AA/AAA.

---

## 2. Requisitos e Escopo

### 2.1. Requisitos Funcionais

1. **Página Pública de Escalas (`/escalas`):**
   - **Visualização por Data/Culto:** Escalas organizadas cronologicamente (próximos sábados, domingos e quartas), agrupando todos os departamentos daquele dia em um único cartão de culto.
   - **Busca Global Instantânea:** Campo de busca reativo que permite ao membro digitar seu nome (ou parte dele) e destacar visualmente todas as suas participações.
   - **Filtro Rápido por Departamento:** Chips horizontais com scroll suave (`Todos`, `Diaconato`, `Sonorização & Transmissão`, `Recepção`, `Música & Louvor`, `Escola Sabatina`, `Ministério Infantil`).
   - **Destaque Temporal:** Badges automáticos de `Hoje` (se o culto for no dia atual) e `Próximo Culto` (no primeiro sábado futuro da grade).
   - **Filtro de Histórico:** Ocultação padrão de cultos que já passaram há mais de 7 dias, com botão discreto *"Ver escalas anteriores"*.

2. **Ações Rápidas para Voluntários:**
   - **Adicionar à Minha Agenda:**
     - Link direto para criação de evento no *Google Calendar* com título, horário, local e observações.
     - Download de arquivo `.ics` para integração nativa com Apple Calendar, Outlook e calendários móveis.
   - **Solicitar Troca / Falar com Líder via WhatsApp:**
     - Botão que abre conversa no WhatsApp com o líder ou com mensagem estruturada pré-preenchida:
       > *"Olá! Sou [Nome], estou na escala de [Departamento] no dia [Data] e gostaria de tirar uma dúvida / solicitar uma troca."*
   - **Compartilhamento de Escala:**
     - Ação de compartilhar a escala completa do culto formatada em texto ou via Web Share API do navegador.

3. **Melhorias no Painel Administrativo (`/admin/escalas`):**
   - Auto-sugestão rápida de nomes de oficiais já cadastrados em escalas anteriores para acelerar o preenchimento e evitar duplicidades por erros de digitação.
   - Preenchimento automático do `dia_semana` baseado na seleção da data `YYYY-MM-DD`.
   - Botão no cabeçalho administrativo com atalho *"Ver Portal Público"*.

### 2.2. Requisitos Não Funcionais & Acessibilidade (WCAG 2.2 AA/AAA)

1. **Design System & Multi-Tema:**
   - Suporte nativo aos 3 modos: Tema Claro (Light), Tema Escuro (Dark - paleta Midnight Blue/Slate) e Tema de Alto Contraste (High Contrast / WCAG AAA).
   - Tipografia padrão `Inter` e ícones padronizados `Material Symbols Outlined`.
2. **Acessibilidade:**
   - Touch targets de botões e chips ≥ 44px de altura.
   - Foco navegável por teclado com anéis de foco visíveis (`focus-visible:ring-2 focus-visible:ring-primary-500`).
   - Respeito à preferência de animações do sistema (`motion-reduce`).
   - Textos e badges com contraste cromático ≥ 4.5:1 (AA) e ≥ 7.0:1 (AAA).
3. **Performance e Resiliência:**
   - Zero dependências pesadas de terceiros (zero bloat).
   - Renderização reativa com Angular Signals (`computed()`).
   - Fallback offline garantido via `src/content/escalas.json` caso o Firestore esteja inacessível.

---

## 3. Arquitetura Técnica & Modelagem de Dados

### 3.1. Modelagem de Dados (`content.models.ts`)

O modelo existente `EscalaItem` é mantido e complementado com o tipo derivado de agrupamento público:

```typescript
export interface EscalaItem {
  id: string;
  data: string;           // Formato YYYY-MM-DD
  dia_semana: string;     // 'Sábado', 'Quarta', 'Domingo'
  departamento: string;   // 'Sonorização & Transmissão', 'Diaconato', 'Recepção', etc.
  oficiais: string[];     // ['Matheus Diniz', 'João Silva']
  horario?: string;       // '08:45', '19:30'
  observacoes?: string;   // Instruções específicas
}

export interface CultoEscalaGroup {
  data: string;
  dataFormatada: string;     // '06 de Setembro, 2026'
  diaSemana: string;         // 'Sábado'
  isHoje: boolean;
  isProximoCulto: boolean;
  isPassado: boolean;
  escalas: EscalaItem[];
}
```

### 3.2. Utilitários Puros de Calendário e WhatsApp (`escalas.utils.ts`)

Funções puras desacopladas para facilidade de testes unitários:

```typescript
export function generateGoogleCalendarUrl(escala: EscalaItem): string;
export function generateIcsBlob(escala: EscalaItem): Blob;
export function generateWhatsAppTrocaUrl(escala: EscalaItem, oficialNome?: string): string;
export function formatEscalaShareText(group: CultoEscalaGroup): string;
export function groupEscalasByCulto(escalas: EscalaItem[], referenceDate?: Date): CultoEscalaGroup[];
```

### 3.3. Roteamento & Navegação

- Registro da rota `/escalas` em `frontend/src/app/app.routes.ts`:
```typescript
{
  path: 'escalas',
  loadComponent: () => import('./features/escalas/escalas.page').then(m => m.EscalasPage),
  title: 'Escalas & Voluntários | IASD Mangueiras'
}
```
- Inclusão de link no `NavbarComponent` (menu dropdown/navegação) e no `FooterComponent`.

---

## 4. UI/UX do Portal Público (`/escalas`)

### 4.1. Estrutura de Componentes

```
frontend/src/app/features/escalas/
├── escalas.page.ts              # Container principal com Signals e filtros
├── escalas.page.html            # Template com 5 estados de UI
├── components/
│   ├── escala-culto-card.component.ts      # Card de culto agrupado
│   ├── escala-ministerio-row.component.ts  # Linha de departamento e oficiais
│   └── escala-share-modal.component.ts     # Modal/Ações de compartilhamento e agenda
└── utils/
    └── escalas.utils.ts         # Helpers puros de ICS, Google Calendar e WhatsApp
```

### 4.2. Os 5 Estados da Interface

1. **Loading State:** Skeletons animados simulando os cards de culto sem salto de layout (Zero Cumulative Layout Shift).
2. **Empty State:** Ilustração com ícone `event_busy`, mensagem *"Nenhuma escala encontrada com os filtros selecionados"* e botão *"Limpar filtros"*.
3. **Error State:** Banner de alerta discreto com botão de recuperação *"Tentar reconectar"*.
4. **Success / Content State:** Linha do tempo de cultos com agrupamentos claros, badges de oficiais e botões de ação rápida.
5. **Disabled / Readonly:** Notificação informativa caso as escalas de determinado período ainda estejam em elaboração.

---

## 5. Estratégia de Testes

### 5.1. Testes Unitários Frontend (`*.spec.ts`)
- **`escalas.utils.spec.ts`**:
  - Validação de agrupamento cronológico e identificação precisa de `isHoje` e `isProximoCulto`.
  - Geração de URLs de Google Calendar com codificação correta de caracteres (espaços, acentuações).
  - Geração do arquivo `.ics` com timestamps válidos no padrão RFC 5545 (`DTSTART`, `DTEND`, `SUMMARY`, `LOCATION`).
  - Geração do link de WhatsApp para substituição.
- **`escalas.page.spec.ts`**:
  - Filtro reativo por texto com insensibilidade a maiúsculas e acentos (ex: "joao" -> "João").
  - Filtro por departamento e alternância de chips.
  - Alternância de visualização de escalas passadas vs. futuras.

---

## 6. Plano de Execução & Arquivos Impactados

1. **Modelos e Utilitários:**
   - `frontend/src/app/core/models/content.models.ts`
   - `frontend/src/app/features/escalas/utils/escalas.utils.ts`
   - `frontend/src/app/features/escalas/utils/escalas.utils.spec.ts`
2. **Componentes da Página Pública:**
   - `frontend/src/app/features/escalas/escalas.page.ts`
   - `frontend/src/app/features/escalas/escalas.page.html`
   - `frontend/src/app/features/escalas/components/escala-culto-card.component.ts`
3. **Roteamento e Menus:**
   - `frontend/src/app/app.routes.ts`
   - `frontend/src/app/shared/components/navbar/navbar.component.ts` / `navbar.component.html`
   - `frontend/src/app/shared/components/footer/footer.component.html`
4. **Melhorias no Admin:**
   - `frontend/src/app/features/admin/escalas/admin-escalas.page.ts` (auto-sugestão de nomes e atalho para página pública).
