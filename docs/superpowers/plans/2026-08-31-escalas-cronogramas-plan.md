# Portal Público de Escalas & Gestão Integrada de Cronogramas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o Portal Público de Escalas (`/escalas`) com arquitetura reativa em Angular 21+ Standalone + Signals, integração com `ContentService` (Firestore + fallback offline `escalas.json`), ações rápidas de produtividade (Google Calendar, `.ics`, WhatsApp para liderança e compartilhamento), acessibilidade WCAG 2.2 AA/AAA e auto-sugestão de voluntários no painel administrativo.

**Architecture:** Módulo frontend isolado sob `src/app/features/escalas/` com componentes atômicos desacoplados, utilitários puros para geração de arquivos `.ics` e URLs de calendário/WhatsApp (100% testáveis), e consumo reativo via `computed()` Signals do `ContentService`. No admin, enriquecimento do formulário existente com auto-complete de voluntários prévios e cálculo automático de dia da semana.

**Tech Stack:** Angular 21+ (Standalone Components, Signals, OnPush), TypeScript 5.8+, Tailwind CSS (Multi-tema: Claro, Escuro, Alto Contraste), Vitest / Testing Library.

## Global Constraints

- **Language Policy:** Documentação e comentários em Português do Brasil (pt-BR); código, tipos, variáveis e mensagens de commit em Inglês (EN-US - Conventional Commits).
- **Design System First:** Utilizar tokens e classes Tailwind do projeto (`text-advent-text`, `bg-advent-blue`, `border-advent-border`, `rounded-card`), sem bibliotecas visuais de terceiros.
- **Acessibilidade:** Touch targets ≥ 44px, anéis de foco visíveis (`focus-visible:ring-2`), contraste ≥ 4.5:1 (AA) e suporte a `prefers-reduced-motion`.
- **Testes (Padrão AAA):** Cobertura unitária com testes determinísticos sem chamadas de rede reais.

---

### Task 1: Modelagem e Tipagem de Agrupamentos de Escalas

**Files:**
- Modify: `frontend/src/app/core/models/content.models.ts:84-93`
- Test: `frontend/src/app/core/models/content.models.spec.ts`

**Interfaces:**
- Consumes: Definição existente de `EscalaItem`.
- Produces: `CultoEscalaGroup`, tipo estendido de departamentos e utilitários de tipo.

- [ ] **Step 1: Escrever o teste para os modelos e tipos**

Criar `frontend/src/app/core/models/content.models.spec.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { EscalaItem, CultoEscalaGroup } from './content.models';

describe('content.models - Escala e CultoEscalaGroup', () => {
  it('deve validar a estrutura de CultoEscalaGroup', () => {
    const mockEscala: EscalaItem = {
      id: 'esc-1',
      data: '2026-09-05',
      dia_semana: 'Sábado',
      departamento: 'Sonorização & Transmissão',
      oficiais: ['Matheus Diniz', 'Lucas Oliveira'],
      horario: '08:45',
      observacoes: 'Chegar 15 min antes'
    };

    const group: CultoEscalaGroup = {
      data: '2026-09-05',
      dataFormatada: '05 de Setembro de 2026',
      diaSemana: 'Sábado',
      isHoje: false,
      isProximoCulto: true,
      isPassado: false,
      escalas: [mockEscala]
    };

    expect(group.data).toBe('2026-09-05');
    expect(group.escalas.length).toBe(1);
    expect(group.escalas[0].departamento).toBe('Sonorização & Transmissão');
  });
});
```

- [ ] **Step 2: Executar o teste para verificar a falha**

Run: `cd frontend && npm test -- src/app/core/models/content.models.spec.ts --watch=false`
Expected: FAIL com erro de compilação `"Module has no exported member 'CultoEscalaGroup'"`.

- [ ] **Step 3: Implementar a tipagem em `content.models.ts`**

Adicionar em `frontend/src/app/core/models/content.models.ts`:
```typescript
export interface CultoEscalaGroup {
  data: string; // YYYY-MM-DD
  dataFormatada: string; // Ex: '05 de Setembro de 2026'
  diaSemana: string; // Ex: 'Sábado'
  isHoje: boolean;
  isProximoCulto: boolean;
  isPassado: boolean;
  escalas: EscalaItem[];
}
```

- [ ] **Step 4: Executar o teste para verificar se passa**

Run: `cd frontend && npm test -- src/app/core/models/content.models.spec.ts --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit das alterações**

```bash
git add frontend/src/app/core/models/content.models.ts frontend/src/app/core/models/content.models.spec.ts
git commit -m "feat(models): add CultoEscalaGroup interface for public scales portal"
```

---

### Task 2: Utilitários Puros de Agrupamento, Calendário (ICS/Google) e WhatsApp

**Files:**
- Create: `frontend/src/app/features/escalas/utils/escalas.utils.ts`
- Test: `frontend/src/app/features/escalas/utils/escalas.utils.spec.ts`

**Interfaces:**
- Consumes: `EscalaItem`, `CultoEscalaGroup` de `content.models.ts`.
- Produces:
  - `groupEscalasByCulto(escalas: EscalaItem[], referenceDate?: Date): CultoEscalaGroup[]`
  - `generateGoogleCalendarUrl(escala: EscalaItem): string`
  - `generateIcsBlob(escala: EscalaItem): Blob`
  - `downloadIcsFile(blob: Blob, filename: string): void`
  - `generateWhatsAppTrocaUrl(escala: EscalaItem, oficialNome?: string): string`
  - `formatEscalaShareText(group: CultoEscalaGroup): string`
  - `filterEscalas(escalas: EscalaItem[], searchTerm: string, department: string): EscalaItem[]`

- [ ] **Step 1: Escrever os testes unitários completos em `escalas.utils.spec.ts`**

Criar `frontend/src/app/features/escalas/utils/escalas.utils.spec.ts`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EscalaItem } from '../../../core/models/content.models';
import {
  groupEscalasByCulto,
  generateGoogleCalendarUrl,
  generateIcsBlob,
  generateWhatsAppTrocaUrl,
  formatEscalaShareText,
  filterEscalas,
  normalizeText,
} from './escalas.utils';

describe('escalas.utils', () => {
  const mockEscalas: EscalaItem[] = [
    {
      id: '1',
      data: '2026-09-05',
      dia_semana: 'Sábado',
      departamento: 'Sonorização & Transmissão',
      oficiais: ['Matheus Diniz', 'Lucas Oliveira'],
      horario: '08:45',
      observacoes: 'Ensaio geral',
    },
    {
      id: '2',
      data: '2026-09-05',
      dia_semana: 'Sábado',
      departamento: 'Diaconato',
      oficiais: ['João Santos'],
      horario: '08:30',
    },
    {
      id: '3',
      data: '2026-09-12',
      dia_semana: 'Sábado',
      departamento: 'Recepção',
      oficiais: ['Ana Lima'],
      horario: '08:45',
    },
    {
      id: '4',
      data: '2026-08-20',
      dia_semana: 'Quarta',
      departamento: 'Música & Louvor',
      oficiais: ['Paulo Silva'],
      horario: '19:30',
    },
  ];

  const refDate = new Date('2026-09-01T12:00:00Z');

  describe('normalizeText', () => {
    it('deve remover acentos e converter para minúsculas', () => {
      expect(normalizeText('João São Paulo')).toBe('joao sao paulo');
      expect(normalizeText('MÚSICA & LOUVOR')).toBe('musica & louvor');
    });
  });

  describe('filterEscalas', () => {
    it('deve filtrar por termo de busca em oficiais ou departamento', () => {
      const res = filterEscalas(mockEscalas, 'matheus', 'todos');
      expect(res.length).toBe(1);
      expect(res[0].departamento).toBe('Sonorização & Transmissão');
    });

    it('deve filtrar por departamento específico', () => {
      const res = filterEscalas(mockEscalas, '', 'Diaconato');
      expect(res.length).toBe(1);
      expect(res[0].id).toBe('2');
    });

    it('deve retornar todas quando filtros forem vazios', () => {
      const res = filterEscalas(mockEscalas, '', 'todos');
      expect(res.length).toBe(4);
    });
  });

  describe('groupEscalasByCulto', () => {
    it('deve agrupar escalas por data e ordenar cronologicamente', () => {
      const groups = groupEscalasByCulto(mockEscalas, refDate);
      expect(groups.length).toBe(3); // 2026-08-20, 2026-09-05, 2026-09-12

      const sept05 = groups.find((g) => g.data === '2026-09-05');
      expect(sept05).toBeDefined();
      expect(sept05?.escalas.length).toBe(2);
      expect(sept05?.isProximoCulto).toBe(true);
      expect(sept05?.isPassado).toBe(false);

      const aug20 = groups.find((g) => g.data === '2026-08-20');
      expect(aug20?.isPassado).toBe(true);
    });
  });

  describe('generateGoogleCalendarUrl', () => {
    it('deve gerar URL do Google Calendar com parâmetros corretos', () => {
      const url = generateGoogleCalendarUrl(mockEscalas[0]);
      expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE');
      expect(url).toContain('text=Escala%3A+Sonoriza%C3%A7%C3%A3o');
      expect(url).toContain('details=');
    });
  });

  describe('generateIcsBlob', () => {
    it('deve gerar um Blob com formato VCALENDAR válido', async () => {
      const blob = generateIcsBlob(mockEscalas[0]);
      expect(blob).toBeInstanceOf(Blob);
      const text = await blob.text();
      expect(text).toContain('BEGIN:VCALENDAR');
      expect(text).toContain('SUMMARY:Escala: Sonorização & Transmissão');
      expect(text).toContain('END:VCALENDAR');
    });
  });

  describe('generateWhatsAppTrocaUrl', () => {
    it('deve gerar link do WhatsApp com mensagem pré-formatada', () => {
      const url = generateWhatsAppTrocaUrl(mockEscalas[0], 'Matheus Diniz');
      expect(url).toContain('https://wa.me/?text=');
      expect(url).toContain('Matheus+Diniz');
      expect(url).toContain('Sonoriza%C3%A7%C3%A3o');
    });
  });

  describe('formatEscalaShareText', () => {
    it('deve formatar texto legível para compartilhamento em grupos', () => {
      const groups = groupEscalasByCulto(mockEscalas, refDate);
      const sept05 = groups.find((g) => g.data === '2026-09-05')!;
      const text = formatEscalaShareText(sept05);

      expect(text).toContain('📋 *ESCALA DO CULTO*');
      expect(text).toContain('Sonorização & Transmissão');
      expect(text).toContain('Diaconato');
      expect(text).toContain('Matheus Diniz');
    });
  });
});
```

- [ ] **Step 2: Executar o teste para verificar a falha**

Run: `cd frontend && npm test -- src/app/features/escalas/utils/escalas.utils.spec.ts --watch=false`
Expected: FAIL com erro de arquivo não encontrado.

- [ ] **Step 3: Implementar `escalas.utils.ts`**

Criar `frontend/src/app/features/escalas/utils/escalas.utils.ts`:
```typescript
import { CultoEscalaGroup, EscalaItem } from '../../../core/models/content.models';

const CHURCH_LOCATION = 'Rua Chiquinha Rodrigues, 1005 - Mangueiras, Tatuí - SP';

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterEscalas(
  escalas: EscalaItem[],
  searchTerm: string,
  department: string,
): EscalaItem[] {
  const normSearch = normalizeText(searchTerm);
  const isDeptAll = !department || department === 'todos';

  return escalas.filter((item) => {
    const matchDept = isDeptAll || item.departamento === department;
    if (!matchDept) return false;

    if (!normSearch) return true;

    const normDept = normalizeText(item.departamento);
    const normOficiais = item.oficiais.map(normalizeText);
    const normObs = item.observacoes ? normalizeText(item.observacoes) : '';

    return (
      normDept.includes(normSearch) ||
      normOficiais.some((o) => o.includes(normSearch)) ||
      normObs.includes(normSearch)
    );
  });
}

export function formatDateBr(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function groupEscalasByCulto(
  escalas: EscalaItem[],
  referenceDate: Date = new Date(),
): CultoEscalaGroup[] {
  const groupsMap = new Map<string, EscalaItem[]>();

  for (const escala of escalas) {
    const list = groupsMap.get(escala.data) || [];
    list.push(escala);
    groupsMap.set(escala.data, list);
  }

  const sortedDates = Array.from(groupsMap.keys()).sort((a, b) => a.localeCompare(b));

  const todayStr = referenceDate.toISOString().split('T')[0];
  let foundProximo = false;

  return sortedDates.map((dateStr) => {
    const items = groupsMap.get(dateStr) || [];
    const diaSemana = items[0]?.dia_semana || 'Culto';
    const isHoje = dateStr === todayStr;
    const isPassado = dateStr < todayStr;

    let isProximoCulto = false;
    if (!isPassado && !foundProximo) {
      isProximoCulto = true;
      foundProximo = true;
    }

    return {
      data: dateStr,
      dataFormatada: formatDateBr(dateStr),
      diaSemana,
      isHoje,
      isProximoCulto,
      isPassado,
      escalas: items,
    };
  });
}

function parseTimeToHoursMinutes(horarioStr?: string): { startHour: number; startMinute: number } {
  if (!horarioStr) return { startHour: 9, startMinute: 0 };
  const match = horarioStr.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return { startHour: parseInt(match[1], 10), startMinute: parseInt(match[2], 10) };
  }
  return { startHour: 9, startMinute: 0 };
}

export function generateGoogleCalendarUrl(escala: EscalaItem): string {
  const { startHour, startMinute } = parseTimeToHoursMinutes(escala.horario);
  const [year, month, day] = escala.data.split('-').map(Number);

  const startDate = new Date(Date.UTC(year, month - 1, day, startHour + 3, startMinute, 0)); // UTC+3 compensation
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

  const formatUtc = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dates = `${formatUtc(startDate)}/${formatUtc(endDate)}`;

  const title = `Escala: ${escala.departamento} — IASD Mangueiras`;
  const details = `Oficiais escalados: ${escala.oficiais.join(', ')}\n${escala.observacoes ? 'Obs: ' + escala.observacoes + '\n' : ''}IASD Mangueiras - Tatuí`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details,
    location: CHURCH_LOCATION,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsBlob(escala: EscalaItem): Blob {
  const { startHour, startMinute } = parseTimeToHoursMinutes(escala.horario);
  const [year, month, day] = escala.data.split('-').map(Number);

  const format2 = (n: number) => n.toString().padStart(2, '0');
  const dtStart = `${year}${format2(month)}${format2(day)}T${format2(startHour)}${format2(startMinute)}00`;
  const dtEnd = `${year}${format2(month)}${format2(day)}T${format2(startHour + 2)}${format2(startMinute)}00`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IASD Mangueiras//Escalas e Voluntarios//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:escala-${escala.id || escala.data}-${escala.departamento.replace(/\s+/g, '')}@iasdmangueiras.org.br`,
    `DTSTAMP:${year}${format2(month)}${format2(day)}T000000Z`,
    `DTSTART;TZID=America/Sao_Paulo:${dtStart}`,
    `DTEND;TZID=America/Sao_Paulo:${dtEnd}`,
    `SUMMARY:Escala: ${escala.departamento} — IASD Mangueiras`,
    `DESCRIPTION:Oficiais: ${escala.oficiais.join(', ')}\\n${escala.observacoes ? 'Obs: ' + escala.observacoes : ''}`,
    `LOCATION:${CHURCH_LOCATION}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
}

export function downloadIcsFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateWhatsAppTrocaUrl(escala: EscalaItem, oficialNome?: string): string {
  const nomePart = oficialNome ? `Sou ${oficialNome}, e estou` : 'Estou';
  const msg = `Olá! ${nomePart} na escala de *${escala.departamento}* no dia *${formatDateBr(escala.data)}* (${escala.dia_semana}) e gostaria de verificar uma dúvida / solicitar uma troca na escala.`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

export function formatEscalaShareText(group: CultoEscalaGroup): string {
  const lines: string[] = [
    `📋 *ESCALA DO CULTO — IASD MANGUEIRAS*`,
    `📅 *${group.diaSemana}, ${group.dataFormatada}*`,
    `📍 ${CHURCH_LOCATION}`,
    ``,
  ];

  for (const esc of group.escalas) {
    lines.push(`🔹 *${esc.departamento}*${esc.horario ? ` (${esc.horario})` : ''}`);
    lines.push(`   👥 ${esc.oficiais.join(', ')}`);
    if (esc.observacoes) {
      lines.push(`   ℹ️ _${esc.observacoes}_`);
    }
    lines.push(``);
  }

  lines.push(`Consulte a escala online: https://iasdmangueiras.org.br/escalas`);
  return lines.join('\n');
}
```

- [ ] **Step 4: Executar o teste para verificar se passa**

Run: `cd frontend && npm test -- src/app/features/escalas/utils/escalas.utils.spec.ts --watch=false`
Expected: PASS com 100% dos testes cobrindo todos os métodos utilitários.

- [ ] **Step 5: Commit das alterações**

```bash
git add frontend/src/app/features/escalas/utils/
git commit -m "feat(escalas): add pure utility functions for grouping, calendar and whatsapp actions"
```

---

### Task 3: Componente de Linha de Ministério e Ações

**Files:**
- Create: `frontend/src/app/features/escalas/components/escala-ministerio-row.component.ts`
- Test: `frontend/src/app/features/escalas/components/escala-ministerio-row.component.spec.ts`

**Interfaces:**
- Consumes: `EscalaItem` de `content.models.ts`, utilitários de `escalas.utils.ts`.
- Produces: `EscalaMinisterioRowComponent` com inputs `escala: input.required<EscalaItem>()`, `highlightName: input<string>('')`.

- [ ] **Step 1: Escrever os testes unitários para o componente de linha de ministério**

Criar `frontend/src/app/features/escalas/components/escala-ministerio-row.component.spec.ts`:
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscalaMinisterioRowComponent } from './escala-ministerio-row.component';
import { EscalaItem } from '../../../core/models/content.models';
import { describe, it, expect, beforeEach } from 'vitest';

describe('EscalaMinisterioRowComponent', () => {
  let component: EscalaMinisterioRowComponent;
  let fixture: ComponentFixture<EscalaMinisterioRowComponent>;

  const mockEscala: EscalaItem = {
    id: '1',
    data: '2026-09-05',
    dia_semana: 'Sábado',
    departamento: 'Sonorização & Transmissão',
    oficiais: ['Matheus Diniz', 'Lucas Oliveira'],
    horario: '08:45',
    observacoes: 'Operar mesa digital',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscalaMinisterioRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EscalaMinisterioRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('escala', mockEscala);
    fixture.detectChanges();
  });

  it('deve renderizar o nome do departamento e o horário', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Sonorização & Transmissão');
    expect(element.textContent).toContain('08:45');
    expect(element.textContent).toContain('Matheus Diniz');
    expect(element.textContent).toContain('Lucas Oliveira');
  });

  it('deve realçar o oficial quando corresponder ao termo de busca', () => {
    fixture.componentRef.setInput('highlightName', 'Matheus');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const highlighted = element.querySelector('.highlight-oficial');
    expect(highlighted?.textContent).toContain('Matheus Diniz');
  });
});
```

- [ ] **Step 2: Executar o teste para verificar a falha**

Run: `cd frontend && npm test -- src/app/features/escalas/components/escala-ministerio-row.component.spec.ts --watch=false`
Expected: FAIL com erro de arquivo não encontrado.

- [ ] **Step 3: Implementar `escala-ministerio-row.component.ts`**

Criar `frontend/src/app/features/escalas/components/escala-ministerio-row.component.ts`:
```typescript
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { EscalaItem } from '../../../core/models/content.models';
import {
  generateGoogleCalendarUrl,
  generateIcsBlob,
  downloadIcsFile,
  generateWhatsAppTrocaUrl,
  normalizeText,
} from '../utils/escalas.utils';

@Component({
  selector: 'app-escala-ministerio-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="group relative rounded-xl border border-advent-border/60 bg-white/70 p-4 transition-all hover:border-advent-blue/40 hover:bg-white hover:shadow-xs dark:bg-slate-800/60 dark:hover:bg-slate-800"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <!-- Info Principal -->
        <div class="flex items-start gap-3 min-w-0">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-advent-blue/10 text-advent-blue dark:bg-advent-blue/20 dark:text-blue-300"
            [attr.aria-hidden]="true"
          >
            <span class="material-symbols-outlined text-[20px]">{{ iconName() }}</span>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="text-sm font-bold text-advent-text dark:text-white truncate">
                {{ escala().departamento }}
              </h4>
              @if (escala().horario) {
                <span
                  class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                >
                  <span class="material-symbols-outlined text-[14px]">schedule</span>
                  {{ escala().horario }}
                </span>
              }
            </div>

            <!-- Lista de Oficiais -->
            <div class="mt-2.5 flex flex-wrap gap-1.5">
              @for (oficial of escala().oficiais; track oficial) {
                <span
                  class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                  [class.highlight-oficial]="isHighlighted(oficial)"
                  [class.bg-amber-100]="isHighlighted(oficial)"
                  [class.text-amber-900]="isHighlighted(oficial)"
                  [class.dark:bg-amber-900/40]="isHighlighted(oficial)"
                  [class.dark:text-amber-200]="isHighlighted(oficial)"
                  [class.ring-2]="isHighlighted(oficial)"
                  [class.ring-amber-500]="isHighlighted(oficial)"
                  [class.bg-slate-100]="!isHighlighted(oficial)"
                  [class.text-slate-800]="!isHighlighted(oficial)"
                  [class.dark:bg-slate-700/60]="!isHighlighted(oficial)"
                  [class.dark:text-slate-200]="!isHighlighted(oficial)"
                >
                  <span class="material-symbols-outlined text-[14px]">person</span>
                  {{ oficial }}
                </span>
              }
            </div>

            @if (escala().observacoes) {
              <p class="mt-2 text-xs text-advent-muted dark:text-slate-400 italic">
                {{ escala().observacoes }}
              </p>
            }
          </div>
        </div>

        <!-- Ações Rápidas -->
        <div class="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1">
          <!-- WhatsApp Troca -->
          <a
            [href]="whatsappUrl()"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 rounded-lg border border-advent-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 cursor-pointer min-h-[36px] transition-colors"
            title="Solicitar troca ou tirar dúvida via WhatsApp"
            aria-label="Solicitar troca ou falar com líder via WhatsApp"
          >
            <span class="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">chat</span>
            <span class="hidden md:inline">Trocar</span>
          </a>

          <!-- Google Calendar -->
          <a
            [href]="googleCalUrl()"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 rounded-lg border border-advent-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 cursor-pointer min-h-[36px] transition-colors"
            title="Adicionar ao Google Calendar"
            aria-label="Adicionar escala ao Google Calendar"
          >
            <span class="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">calendar_today</span>
            <span class="hidden md:inline">Google</span>
          </a>

          <!-- Download .ICS -->
          <button
            type="button"
            (click)="onDownloadIcs()"
            class="inline-flex items-center gap-1 rounded-lg border border-advent-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 cursor-pointer min-h-[36px] transition-colors"
            title="Baixar arquivo .ICS (Apple / Outlook)"
            aria-label="Baixar arquivo ICS para Apple ou Outlook"
          >
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span class="hidden md:inline">.ICS</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class EscalaMinisterioRowComponent {
  readonly escala = input.required<EscalaItem>();
  readonly highlightName = input<string>('');

  readonly iconName = computed(() => {
    const dept = normalizeText(this.escala().departamento);
    if (dept.includes('som') || dept.includes('sonorizacao') || dept.includes('transmissao')) return 'volume_up';
    if (dept.includes('diacon')) return 'volunteer_activism';
    if (dept.includes('recep')) return 'waving_hand';
    if (dept.includes('musica') || dept.includes('louvor')) return 'piano';
    if (dept.includes('escola') || dept.includes('sabatina')) return 'menu_book';
    if (dept.includes('infantil') || dept.includes('crianca')) return 'child_care';
    return 'group';
  });

  readonly googleCalUrl = computed(() => generateGoogleCalendarUrl(this.escala()));
  readonly whatsappUrl = computed(() => generateWhatsAppTrocaUrl(this.escala()));

  isHighlighted(oficial: string): boolean {
    const search = normalizeText(this.highlightName());
    if (!search || search.length < 2) return false;
    return normalizeText(oficial).includes(search);
  }

  onDownloadIcs(): void {
    const esc = this.escala();
    const blob = generateIcsBlob(esc);
    const filename = `escala-${esc.departamento.toLowerCase().replace(/\s+/g, '-')}-${esc.data}.ics`;
    downloadIcsFile(blob, filename);
  }
}
```

- [ ] **Step 4: Executar o teste para verificar se passa**

Run: `cd frontend && npm test -- src/app/features/escalas/components/escala-ministerio-row.component.spec.ts --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit das alterações**

```bash
git add frontend/src/app/features/escalas/components/escala-ministerio-row.component.ts frontend/src/app/features/escalas/components/escala-ministerio-row.component.spec.ts
git commit -m "feat(escalas): add EscalaMinisterioRowComponent with actions and highlighting"
```

---

### Task 4: Componente de Card de Culto Agrupado

**Files:**
- Create: `frontend/src/app/features/escalas/components/escala-culto-card.component.ts`
- Test: `frontend/src/app/features/escalas/components/escala-culto-card.component.spec.ts`

**Interfaces:**
- Consumes: `CultoEscalaGroup` de `content.models.ts`, `EscalaMinisterioRowComponent`.
- Produces: `EscalaCultoCardComponent` com inputs `group: input.required<CultoEscalaGroup>()`, `highlightName: input<string>('')`.

- [ ] **Step 1: Escrever os testes unitários para o card de culto**

Criar `frontend/src/app/features/escalas/components/escala-culto-card.component.spec.ts`:
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscalaCultoCardComponent } from './escala-culto-card.component';
import { CultoEscalaGroup } from '../../../core/models/content.models';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EscalaCultoCardComponent', () => {
  let component: EscalaCultoCardComponent;
  let fixture: ComponentFixture<EscalaCultoCardComponent>;

  const mockGroup: CultoEscalaGroup = {
    data: '2026-09-05',
    dataFormatada: '05 de Setembro de 2026',
    diaSemana: 'Sábado',
    isHoje: true,
    isProximoCulto: true,
    isPassado: false,
    escalas: [
      {
        id: '1',
        data: '2026-09-05',
        dia_semana: 'Sábado',
        departamento: 'Diaconato',
        oficiais: ['Carlos Silva'],
        horario: '08:30',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscalaCultoCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EscalaCultoCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('group', mockGroup);
    fixture.detectChanges();
  });

  it('deve exibir o cabeçalho do culto com badges de Hoje e Próximo Culto', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Sábado');
    expect(element.textContent).toContain('05 de Setembro de 2026');
    expect(element.textContent).toContain('Hoje');
    expect(element.textContent).toContain('Próximo Culto');
  });

  it('deve disparar cópia de texto ao clicar no botão de compartilhar', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextSpy },
    });

    const shareButton = fixture.nativeElement.querySelector('button[aria-label="Compartilhar escala do culto"]');
    shareButton.click();

    expect(writeTextSpy).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Executar o teste para verificar a falha**

Run: `cd frontend && npm test -- src/app/features/escalas/components/escala-culto-card.component.spec.ts --watch=false`
Expected: FAIL com erro de arquivo não encontrado.

- [ ] **Step 3: Implementar `escala-culto-card.component.ts`**

Criar `frontend/src/app/features/escalas/components/escala-culto-card.component.ts`:
```typescript
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { CultoEscalaGroup } from '../../../core/models/content.models';
import { EscalaMinisterioRowComponent } from './escala-ministerio-row.component';
import { formatEscalaShareText } from '../utils/escalas.utils';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-escala-culto-card',
  standalone: true,
  imports: [EscalaMinisterioRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm"
      [class.border-advent-blue]="group().isProximoCulto && !group().isPassado"
      [class.ring-2]="group().isProximoCulto && !group().isPassado"
      [class.ring-advent-blue/20]="group().isProximoCulto && !group().isPassado"
      [class.border-advent-border]="!group().isProximoCulto || group().isPassado"
      [class.bg-white]="!group().isPassado"
      [class.dark:bg-slate-900]="!group().isPassado"
      [class.bg-slate-50/70]="group().isPassado"
      [class.dark:bg-slate-950/70]="group().isPassado"
      [class.opacity-85]="group().isPassado"
    >
      <!-- Header do Card -->
      <div
        class="flex flex-col gap-3 border-b border-advent-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        [class.bg-advent-blue/5]="group().isProximoCulto && !group().isPassado"
        [class.dark:bg-advent-blue/10]="group().isProximoCulto && !group().isPassado"
        [class.bg-slate-50/50]="!group().isProximoCulto"
        [class.dark:bg-slate-800/40]="!group().isProximoCulto"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-white border border-advent-border/80 shadow-2xs dark:bg-slate-800 dark:border-slate-700"
          >
            <span class="text-[10px] font-bold uppercase tracking-wider text-advent-blue dark:text-blue-400">
              {{ group().diaSemana.slice(0, 3) }}
            </span>
            <span class="text-base font-extrabold leading-none text-advent-text dark:text-white">
              {{ group().data.split('-')[2] }}
            </span>
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base font-bold text-advent-text dark:text-white">
                {{ group().diaSemana }}, {{ group().dataFormatada }}
              </h3>

              @if (group().isHoje) {
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Hoje
                </span>
              }

              @if (group().isProximoCulto && !group().isHoje && !group().isPassado) {
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold text-advent-blue dark:bg-blue-950/80 dark:text-blue-300"
                >
                  Próximo Culto
                </span>
              }

              @if (group().isPassado) {
                <span
                  class="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  Encerrado
                </span>
              }
            </div>

            <p class="text-xs text-advent-muted dark:text-slate-400 mt-0.5">
              {{ group().escalas.length }} equipe{{ group().escalas.length > 1 ? 's' : '' }} escalada{{ group().escalas.length > 1 ? 's' : '' }}
            </p>
          </div>
        </div>

        <!-- Botão de Compartilhar Escala do Culto -->
        <button
          type="button"
          (click)="onShare()"
          class="inline-flex items-center gap-1.5 rounded-xl border border-advent-border bg-white px-3 py-1.5 text-xs font-semibold text-advent-text shadow-2xs hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer min-h-[38px] dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 self-start sm:self-center"
          aria-label="Compartilhar escala do culto"
        >
          <span class="material-symbols-outlined text-[16px] text-advent-blue dark:text-blue-400">share</span>
          <span>Compartilhar Dia</span>
        </button>
      </div>

      <!-- Lista de Ministérios -->
      <div class="p-5 flex flex-col gap-3">
        @for (escala of group().escalas; track escala.id || escala.departamento) {
          <app-escala-ministerio-row
            [escala]="escala"
            [highlightName]="highlightName()"
          />
        }
      </div>
    </article>
  `,
})
export class EscalaCultoCardComponent {
  private readonly toast = inject(ToastService, { optional: true });

  readonly group = input.required<CultoEscalaGroup>();
  readonly highlightName = input<string>('');

  async onShare(): Promise<void> {
    const text = formatEscalaShareText(this.group());
    const title = `Escala ${this.group().diaSemana} - ${this.group().dataFormatada}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch (err) {
        // Usuário cancelou ou navegador não suportou, fallback para clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      this.toast?.success('Escala do dia copiada para a área de transferência!');
    } catch {
      this.toast?.error('Não foi possível copiar o texto da escala.');
    }
  }
}
```

- [ ] **Step 4: Executar o teste para verificar se passa**

Run: `cd frontend && npm test -- src/app/features/escalas/components/escala-culto-card.component.spec.ts --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit das alterações**

```bash
git add frontend/src/app/features/escalas/components/escala-culto-card.component.ts frontend/src/app/features/escalas/components/escala-culto-card.component.spec.ts
git commit -m "feat(escalas): add EscalaCultoCardComponent with grouped layout and sharing"
```

---

### Task 5: Página Pública de Escalas (`/escalas`) com Busca, Filtros e 5 Estados de UI

**Files:**
- Create: `frontend/src/app/features/escalas/escalas.page.ts`
- Create: `frontend/src/app/features/escalas/escalas.page.html`
- Test: `frontend/src/app/features/escalas/escalas.page.spec.ts`

**Interfaces:**
- Consumes: `ContentService.escalas()`, `SeoService`, `EscalaCultoCardComponent`, `SkeletonComponent`.
- Produces: `EscalasPage` standalone component para rota `/escalas`.

- [ ] **Step 1: Escrever os testes unitários completos da página em `escalas.page.spec.ts`**

Criar `frontend/src/app/features/escalas/escalas.page.spec.ts`:
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscalasPage } from './escalas.page';
import { ContentService } from '../../core/services/content.service';
import { SeoService } from '../../core/seo/seo.service';
import { signal } from '@angular/core';
import { EscalaItem } from '../../core/models/content.models';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EscalasPage', () => {
  let component: EscalasPage;
  let fixture: ComponentFixture<EscalasPage>;

  const mockEscalas: EscalaItem[] = [
    {
      id: '1',
      data: '2099-09-05',
      dia_semana: 'Sábado',
      departamento: 'Sonorização & Transmissão',
      oficiais: ['Matheus Diniz'],
      horario: '08:45',
    },
    {
      id: '2',
      data: '2099-09-05',
      dia_semana: 'Sábado',
      departamento: 'Diaconato',
      oficiais: ['Carlos Silva'],
      horario: '08:30',
    },
    {
      id: '3',
      data: '2099-09-12',
      dia_semana: 'Sábado',
      departamento: 'Recepção',
      oficiais: ['Ana Lima'],
      horario: '08:45',
    },
  ];

  const mockContentService = {
    escalas: signal<EscalaItem[]>(mockEscalas),
    loading: signal<boolean>(false),
  };

  const mockSeoService = {
    setCanonicalAndMeta: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscalasPage],
      providers: [
        { provide: ContentService, useValue: mockContentService },
        { provide: SeoService, useValue: mockSeoService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EscalasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar e configurar metadados de SEO', () => {
    expect(mockSeoService.setCanonicalAndMeta).toHaveBeenCalled();
  });

  it('deve renderizar a lista de cultos agrupados', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Escalas & Voluntários');
    expect(element.textContent).toContain('Sonorização & Transmissão');
    expect(element.textContent).toContain('Diaconato');
  });

  it('deve filtrar escalas quando o usuário digita no campo de busca', () => {
    component.searchTerm.set('Carlos');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Diaconato');
    expect(element.textContent).not.toContain('Recepção');
  });

  it('deve filtrar escalas por chip de departamento', () => {
    component.selectedDepartment.set('Recepção');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Recepção');
    expect(element.textContent).not.toContain('Sonorização & Transmissão');
  });

  it('deve exibir empty state quando nenhum resultado for encontrado', () => {
    component.searchTerm.set('NomeInexistenteXYZ');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Nenhuma escala encontrada');
  });
});
```

- [ ] **Step 2: Executar o teste para verificar a falha**

Run: `cd frontend && npm test -- src/app/features/escalas/escalas.page.spec.ts --watch=false`
Expected: FAIL com erro de módulo inexistente.

- [ ] **Step 3: Implementar `escalas.page.ts` e `escalas.page.html`**

Criar `frontend/src/app/features/escalas/escalas.page.html`:
```html
<main class="min-h-screen bg-advent-bg text-advent-text py-10 px-4 sm:px-6 lg:px-8">
  <div class="mx-auto max-w-5xl">
    <!-- Hero / Cabeçalho -->
    <header class="text-center mb-8 sm:mb-12">
      <div class="inline-flex items-center gap-2 rounded-full bg-advent-blue/10 px-3.5 py-1 text-xs font-semibold text-advent-blue dark:bg-blue-950/70 dark:text-blue-300 mb-3">
        <span class="material-symbols-outlined text-[16px]">calendar_month</span>
        <span>Escalas Ministeriais</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-advent-text dark:text-white">
        Escalas & Cronogramas
      </h1>
      <p class="mt-2 text-base text-advent-muted dark:text-slate-300 max-w-2xl mx-auto">
        Consulte as escalas de serviço das equipes e voluntários da IASD Mangueiras. Busque seu nome ou adicione seu compromisso à agenda.
      </p>
    </header>

    <!-- Barra de Filtros e Busca -->
    <section class="mb-8 space-y-4" aria-label="Filtros de escalas">
      <!-- Input de Busca -->
      <div class="relative max-w-xl mx-auto">
        <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" [attr.aria-hidden]="true">
          search
        </span>
        <input
          type="text"
          [value]="searchTerm()"
          (input)="onSearchInput($event)"
          placeholder="Buscar por seu nome ou ministério..."
          class="w-full rounded-2xl border border-advent-border bg-white pl-10 pr-10 py-3 text-sm text-advent-text shadow-sm placeholder:text-slate-400 focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          aria-label="Buscar escalas por nome ou ministério"
        />
        @if (searchTerm()) {
          <button
            type="button"
            (click)="clearSearch()"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Limpar busca"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        }
      </div>

      <!-- Chips de Departamentos -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center px-1">
        @for (dept of departments; track dept.id) {
          <button
            type="button"
            (click)="selectedDepartment.set(dept.id)"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer min-h-[38px]"
            [class.bg-advent-blue]="selectedDepartment() === dept.id"
            [class.text-white]="selectedDepartment() === dept.id"
            [class.shadow-sm]="selectedDepartment() === dept.id"
            [class.bg-white]="selectedDepartment() !== dept.id"
            [class.text-slate-700]="selectedDepartment() !== dept.id"
            [class.border]="selectedDepartment() !== dept.id"
            [class.border-advent-border]="selectedDepartment() !== dept.id"
            [class.hover:bg-slate-50]="selectedDepartment() !== dept.id"
            [class.dark:bg-slate-800]="selectedDepartment() !== dept.id"
            [class.dark:border-slate-700]="selectedDepartment() !== dept.id"
            [class.dark:text-slate-300]="selectedDepartment() !== dept.id"
            [class.dark:hover:bg-slate-700]="selectedDepartment() !== dept.id"
          >
            <span class="material-symbols-outlined text-[16px]">{{ dept.icon }}</span>
            <span>{{ dept.label }}</span>
          </button>
        }
      </div>
    </section>

    <!-- Estados de UI -->
    <!-- 1. Loading State -->
    @if (isLoading()) {
      <div class="space-y-6">
        @for (i of [1, 2]; track i) {
          <div class="rounded-2xl border border-advent-border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <app-skeleton width="40%" height="24px" className="mb-4" />
            <app-skeleton width="100%" height="60px" className="mb-3" />
            <app-skeleton width="100%" height="60px" />
          </div>
        }
      </div>
    }

    <!-- 2. Empty State -->
    @else if (activeGroups().length === 0 && pastGroups().length === 0) {
      <div class="rounded-2xl border border-advent-border bg-white p-12 text-center shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
          <span class="material-symbols-outlined text-[32px]">event_busy</span>
        </div>
        <h3 class="text-lg font-bold text-advent-text dark:text-white">Nenhuma escala encontrada</h3>
        <p class="mt-1 text-sm text-advent-muted dark:text-slate-400 max-w-md mx-auto">
          Não encontramos nenhuma escala com os filtros aplicados. Tente buscar por outro termo ou selecione todos os ministérios.
        </p>
        <button
          type="button"
          (click)="clearFilters()"
          class="mt-5 inline-flex items-center gap-2 rounded-xl bg-advent-blue px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-800 transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-[16px]">refresh</span>
          Limpar Filtros
        </button>
      </div>
    }

    <!-- 3. Lista de Cultos Ativos / Futuros -->
    @else {
      <div class="space-y-6">
        @for (group of activeGroups(); track group.data) {
          <app-escala-culto-card
            [group]="group"
            [highlightName]="searchTerm()"
          />
        }

        <!-- Toggle de Escalas Anteriores -->
        @if (pastGroups().length > 0) {
          <div class="pt-4 text-center">
            <button
              type="button"
              (click)="showPastEscalas.set(!showPastEscalas())"
              class="inline-flex items-center gap-2 rounded-xl border border-advent-border bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <span class="material-symbols-outlined text-[18px]">
                {{ showPastEscalas() ? 'expand_less' : 'history' }}
              </span>
              <span>
                {{ showPastEscalas() ? 'Ocultar escalas anteriores' : 'Ver escalas anteriores (' + pastGroups().length + ')' }}
              </span>
            </button>
          </div>

          @if (showPastEscalas()) {
            <div class="space-y-6 pt-2">
              @for (group of pastGroups(); track group.data) {
                <app-escala-culto-card
                  [group]="group"
                  [highlightName]="searchTerm()"
                />
              }
            </div>
          }
        }
      </div>
    }
  </div>
</main>
```

Criar `frontend/src/app/features/escalas/escalas.page.ts`:
```typescript
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ContentService } from '../../core/services/content.service';
import { SeoService } from '../../core/seo/seo.service';
import { CultoEscalaGroup, EscalaItem } from '../../core/models/content.models';
import { EscalaCultoCardComponent } from './components/escala-culto-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { filterEscalas, groupEscalasByCulto } from './utils/escalas.utils';

export interface DepartmentFilter {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-escalas-page',
  standalone: true,
  imports: [EscalaCultoCardComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escalas.page.html',
})
export class EscalasPage implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly seoService = inject(SeoService);

  readonly searchTerm = signal<string>('');
  readonly selectedDepartment = signal<string>('todos');
  readonly showPastEscalas = signal<boolean>(false);

  readonly departments: DepartmentFilter[] = [
    { id: 'todos', label: 'Todos', icon: 'apps' },
    { id: 'Sonorização & Transmissão', label: 'Som & Mídia', icon: 'volume_up' },
    { id: 'Diaconato', label: 'Diaconato', icon: 'volunteer_activism' },
    { id: 'Recepção', label: 'Recepção', icon: 'waving_hand' },
    { id: 'Música & Louvor', label: 'Música & Louvor', icon: 'piano' },
    { id: 'Escola Sabatina', label: 'Escola Sabatina', icon: 'menu_book' },
    { id: 'Ministério Infantil', label: 'Infantil', icon: 'child_care' },
  ];

  readonly isLoading = computed(() => this.contentService.loading?.() ?? false);

  private readonly filteredEscalas = computed<EscalaItem[]>(() => {
    const raw = this.contentService.escalas();
    return filterEscalas(raw, this.searchTerm(), this.selectedDepartment());
  });

  private readonly allGroups = computed<CultoEscalaGroup[]>(() => {
    return groupEscalasByCulto(this.filteredEscalas());
  });

  readonly activeGroups = computed<CultoEscalaGroup[]>(() => {
    return this.allGroups().filter((g) => !g.isPassado);
  });

  readonly pastGroups = computed<CultoEscalaGroup[]>(() => {
    return this.allGroups().filter((g) => g.isPassado);
  });

  ngOnInit(): void {
    this.seoService.setCanonicalAndMeta({
      title: 'Escalas & Voluntários — IASD Mangueiras',
      description: 'Consulte as escalas ministeriais e voluntários nos cultos da IASD Mangueiras em Tatuí.',
      url: 'https://iasdmangueiras.org.br/escalas',
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedDepartment.set('todos');
  }
}
```

- [ ] **Step 4: Executar o teste para verificar se passa**

Run: `cd frontend && npm test -- src/app/features/escalas/escalas.page.spec.ts --watch=false`
Expected: PASS com cobertura dos filtros, busca e estados de UI.

- [ ] **Step 5: Commit das alterações**

```bash
git add frontend/src/app/features/escalas/
git commit -m "feat(escalas): implement public EscalasPage with reactive signals, search and filters"
```

---

### Task 6: Roteamento e Navegação

**Files:**
- Modify: `frontend/src/app/app.routes.ts:1-55`
- Modify: `frontend/src/app/layout/header/header.component.ts`
- Modify: `frontend/src/app/layout/footer/footer.component.ts` (ou template)

**Interfaces:**
- Consumes: Rota `/escalas` com lazy loading.
- Produces: Links de navegação no header desktop/mobile e footer.

- [ ] **Step 1: Escrever os testes de navegação e rota**

Criar/Modificar `frontend/src/app/layout/header/header.component.spec.ts` para validar o link `/escalas`:
```typescript
it('deve conter o link para a página de escalas', () => {
  const links = fixture.nativeElement.querySelectorAll('a[routerLink="/escalas"]');
  expect(links.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Executar o teste para verificar a falha**

Run: `cd frontend && npm test -- src/app/layout/header/header.component.spec.ts --watch=false`
Expected: FAIL se o link ainda não estiver presente.

- [ ] **Step 3: Adicionar a rota em `app.routes.ts` e links no Header e Footer**

Em `frontend/src/app/app.routes.ts`:
```typescript
{
  path: 'escalas',
  loadComponent: () => import('./features/escalas/escalas.page').then((m) => m.EscalasPage),
  title: 'Escalas & Voluntários — IASD Mangueiras',
},
```

Em `frontend/src/app/layout/header/header.component.ts`:
Adicionar item de menu `{ label: 'Escalas', path: '/escalas' }`.

- [ ] **Step 4: Executar os testes para verificar se passam**

Run: `cd frontend && npm test -- src/app/layout/header/header.component.spec.ts --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit das alterações**

```bash
git add frontend/src/app/app.routes.ts frontend/src/app/layout/header/ frontend/src/app/layout/footer/
git commit -m "feat(navigation): register /escalas route and add links to header and footer"
```

---

### Task 7: Aprimoramento do Painel Administrativo de Escalas

**Files:**
- Modify: `frontend/src/app/features/admin/escalas/admin-escalas.page.ts`
- Test: `frontend/src/app/features/admin/escalas/admin-escalas.page.spec.ts`

**Interfaces:**
- Consumes: `AdminCmsService`, lista de escalas cadastradas.
- Produces:
  - Sugestões automáticas de nomes de voluntários existentes (`computed(() => ...)`).
  - Preenchimento automático de `dia_semana` a partir de `data`.
  - Botão no cabeçalho *"Ver Portal Público"*.

- [ ] **Step 1: Escrever teste unitário para os novos recursos administrativos em `admin-escalas.page.spec.ts`**

Adicionar teste em `frontend/src/app/features/admin/escalas/admin-escalas.page.spec.ts`:
```typescript
it('deve extrair a lista única de oficiais cadastrados para auto-sugestão', () => {
  const oficiais = component.uniqueOficiais();
  expect(oficiais).toContain('Carlos Silva');
});

it('deve atualizar automaticamente o dia da semana ao alterar a data no formulário', () => {
  component.form.get('data')?.setValue('2026-09-05');
  expect(component.form.get('dia_semana')?.value).toBe('Sábado');
});
```

- [ ] **Step 2: Executar o teste para verificar a falha**

Run: `cd frontend && npm test -- src/app/features/admin/escalas/admin-escalas.page.spec.ts --watch=false`
Expected: FAIL.

- [ ] **Step 3: Implementar as melhorias em `admin-escalas.page.ts`**

1. Adicionar `uniqueOficiais = computed<string[]>(() => ...)` extraindo e ordenando todos os nomes distintos de oficiais.
2. Adicionar listener reativo no form control `data` para calcular e setar `dia_semana` (`'Sábado'`, `'Domingo'`, `'Quarta'`).
3. Adicionar botão no header:
```html
<a
  routerLink="/escalas"
  target="_blank"
  class="inline-flex items-center gap-1.5 rounded-card border border-advent-border bg-white px-3.5 py-2 text-xs font-semibold text-advent-text shadow-2xs hover:bg-slate-50 transition-colors"
>
  <span class="material-symbols-outlined text-[16px] text-advent-blue">open_in_new</span>
  <span>Ver Portal Público</span>
</a>
```

- [ ] **Step 4: Executar o teste para verificar se passa**

Run: `cd frontend && npm test -- src/app/features/admin/escalas/admin-escalas.page.spec.ts --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit das alterações**

```bash
git add frontend/src/app/features/admin/escalas/
git commit -m "feat(admin): enhance admin escalas with name auto-suggestions and public portal link"
```

---

### Task 8: Verificação Final de Qualidade, Lint e Testes Globais

**Files:**
- Test: Suíte completa de testes unitários frontend (`npm run test:ci` ou `npm test -- --watch=false`)
- TypeCheck: `npx tsc --noEmit`

- [ ] **Step 1: Executar checagem de tipos estáticos TypeScript**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 2: Executar toda a suíte de testes unitários**

Run: `cd frontend && npm test -- --watch=false`
Expected: 100% dos testes passando sem falhas.

- [ ] **Step 3: Verificar build de produção**

Run: `cd frontend && npm run build`
Expected: Build concluído com sucesso sem warnings de sintaxe.

- [ ] **Step 4: Commit de finalização da feature**

```bash
git add .
git commit -m "chore(escalas): complete public portal and schedule enhancements with full test coverage"
```
