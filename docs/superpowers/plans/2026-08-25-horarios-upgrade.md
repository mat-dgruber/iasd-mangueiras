# Horários & Localização Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernizar o módulo de Horários (`/horarios`) e o painel administrativo (`/admin/horarios`) com cálculo solar astronômico do pôr do sol em Tatuí-SP, ações rápidas de calendário (.ics / Google Calendar) e mobilidade (Waze, Maps, Uber, WhatsApp), além de gestão completa de cultos regulares e avisos com auto-expiração no Firestore.

**Architecture:** Módulos de utilitários puros (`solar-time`, `calendar-links`, `mobility-links`) desacoplados para máxima testabilidade e zero-bloat; reatividade com Signals do Angular 19/20 no `ContentService` com fallback seguro para `content/horarios.json`; componentes standalone acessíveis (WCAG 2.2 AA) com feedback visual via `ToastService`.

**Tech Stack:** Angular 19/20 Standalone Components & Signals, TypeScript 5+, Tailwind CSS, Firebase/Firestore, Vitest / Jasmine / Karma para testes unitários.

## Global Constraints

- **Language & Conventions:** Código-fonte e commits em inglês (EN-US Conventional Commits), documentação e comentários em pt-BR.
- **Zero Bloat:** Não instalar bibliotecas externas para cálculos solares ou calendários; utilizar funções matemáticas puras e padrões RFC 5545.
- **Acessibilidade:** Touch targets mínimos de 44x44px, contraste mínimo 4.5:1, `aria-label` descritivos e controle de teclado (`Escape`, `Enter`).
- **Padrão de Testes:** AAA (Arrange, Act, Assert) com cobertura estática e `npx tsc --noEmit` 100% limpo.

---

### Task 1: Utilitário de Cálculo Solar Astronômico (`solar-time.util.ts`)

**Files:**
- Create: `frontend/src/app/core/utils/solar-time.util.ts`
- Test: `frontend/src/app/core/utils/solar-time.util.spec.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface SunsetResult {
    hours: number;
    minutes: number;
    formatted: string;
  }
  export function getSunsetTime(date: Date, lat?: number, lng?: number): SunsetResult;
  export function getTodaySunset(): string;
  export function getSabbathSunsets(referenceDate?: Date): {
    fridaySunset: string;
    saturdaySunset: string;
    isSabbathNow: boolean;
  };
  ```

- [ ] **Step 1: Escrever os testes unitários com falha para o cálculo solar**

Criar `frontend/src/app/core/utils/solar-time.util.spec.ts`:
```typescript
import { getSunsetTime, getTodaySunset, getSabbathSunsets } from './solar-time.util';

describe('solar-time.util', () => {
  it('deve calcular o horário de pôr do sol para Tatuí-SP em uma data específica', () => {
    // Solstício de Inverno no Hemisfério Sul (21 de Junho) ~ 17:30 a 17:40
    const winterDate = new Date(2026, 5, 21); // 21/06/2026
    const sunsetWinter = getSunsetTime(winterDate);
    expect(sunsetWinter.hours).toBe(17);
    expect(sunsetWinter.minutes).toBeGreaterThanOrEqual(30);
    expect(sunsetWinter.minutes).toBeLessThanOrEqual(45);
    expect(sunsetWinter.formatted).toMatch(/^17:\d{2}$/);

    // Solstício de Verão no Hemisfério Sul (21 de Dezembro) ~ 18:50 a 19:10
    const summerDate = new Date(2026, 11, 21); // 21/12/2026
    const sunsetSummer = getSunsetTime(summerDate);
    expect(sunsetSummer.hours).toBe(18);
    expect(sunsetSummer.minutes).toBeGreaterThanOrEqual(45);
    expect(sunsetSummer.formatted).toMatch(/^18:\d{2}$/);
  });

  it('deve retornar string formatada para o pôr do sol de hoje', () => {
    const todayStr = getTodaySunset();
    expect(todayStr).toMatch(/^\d{2}:\d{2}$/);
  });

  it('deve retornar horários de pôr do sol de sexta e sábado da semana', () => {
    const midWeek = new Date(2026, 7, 26); // Quarta-feira, 26/08/2026
    const sabbathInfo = getSabbathSunsets(midWeek);
    expect(sabbathInfo.fridaySunset).toMatch(/^\d{2}:\d{2}$/);
    expect(sabbathInfo.saturdaySunset).toMatch(/^\d{2}:\d{2}$/);
    expect(typeof sabbathInfo.isSabbathNow).toBe('boolean');
  });

  it('deve identificar corretamente quando está dentro das horas do sábado', () => {
    // Sexta-feira às 20:00 (após o pôr do sol)
    const fridayNight = new Date(2026, 7, 28, 20, 0, 0);
    const sabbathCheck = getSabbathSunsets(fridayNight);
    expect(sabbathCheck.isSabbathNow).toBe(true);

    // Domingo às 10:00 (fora do sábado)
    const sundayMorning = new Date(2026, 7, 30, 10, 0, 0);
    const nonSabbathCheck = getSabbathSunsets(sundayMorning);
    expect(nonSabbathCheck.isSabbathNow).toBe(false);
  });
});
```

- [ ] **Step 2: Executar o teste para verificar que falha**

Run: `npx ng test --include=src/app/core/utils/solar-time.util.spec.ts --watch=false` ou `npm test -- --include=src/app/core/utils/solar-time.util.spec.ts`
Expected: FAIL (módulo não encontrado)

- [ ] **Step 3: Implementar o utilitário solar com algoritmo NOAA**

Criar `frontend/src/app/core/utils/solar-time.util.ts`:
```typescript
/**
 * Utilitário determinístico para cálculo astronômico do pôr do sol em Tatuí-SP.
 * Coordenadas padrão da IASD Mangueiras: Latitude -23.3556, Longitude -47.8569, Fuso UTC-3.
 */

export const TATUI_COORDINATES = {
  latitude: -23.3556,
  longitude: -47.8569,
  timezoneOffsetHours: -3,
};

export interface SunsetResult {
  hours: number;
  minutes: number;
  formatted: string;
}

/**
 * Calcula o pôr do sol astronômico para uma data e coordenadas usando aproximação NOAA.
 */
export function getSunsetTime(
  date: Date,
  lat: number = TATUI_COORDINATES.latitude,
  lng: number = TATUI_COORDINATES.longitude,
): SunsetResult {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Ângulo fracionário do ano em radianos
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1);

  // Equação do tempo em minutos
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Declinação solar em radianos
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = (lat * Math.PI) / 180;
  // Ângulo zenital para pôr do sol padrão (90.833° incluindo refração atmosférica)
  const zenithRad = (90.833 * Math.PI) / 180;

  const cosHourAngle =
    (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(decl)) /
    (Math.cos(latRad) * Math.cos(decl));

  let hourAngleDeg = 90;
  if (cosHourAngle >= -1 && cosHourAngle <= 1) {
    hourAngleDeg = (Math.acos(cosHourAngle) * 180) / Math.PI;
  }

  // Minutos a partir da meia-noite UTC para o pôr do sol
  const sunsetUtcMinutes = 720 - 4 * lng - eqtime + 4 * hourAngleDeg;

  // Ajuste para horário local (Tatuí UTC-3)
  let localMinutes = sunsetUtcMinutes + TATUI_COORDINATES.timezoneOffsetHours * 60;
  while (localMinutes < 0) localMinutes += 1440;
  while (localMinutes >= 1440) localMinutes -= 1440;

  const hours = Math.floor(localMinutes / 60);
  const minutes = Math.round(localMinutes % 60);

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return { hours, minutes, formatted };
}

/**
 * Retorna o pôr do sol de hoje formatado como HH:mm.
 */
export function getTodaySunset(): string {
  return getSunsetTime(new Date()).formatted;
}

/**
 * Retorna os dados do pôr do sol de sexta e sábado para a semana de referência,
 * e se o momento atual corresponde às horas sagradas do sábado.
 */
export function getSabbathSunsets(referenceDate: Date = new Date()): {
  fridaySunset: string;
  saturdaySunset: string;
  isSabbathNow: boolean;
} {
  const currentDay = referenceDate.getDay(); // 0 = Domingo, 5 = Sexta, 6 = Sábado
  const diffToFriday = 5 - currentDay;

  const friday = new Date(referenceDate);
  friday.setDate(referenceDate.getDate() + diffToFriday);

  const saturday = new Date(friday);
  saturday.setDate(friday.getDate() + 1);

  const friSunset = getSunsetTime(friday);
  const satSunset = getSunsetTime(saturday);

  // Instantes exatos em timestamp
  const fridaySunsetDate = new Date(friday);
  fridaySunsetDate.setHours(friSunset.hours, friSunset.minutes, 0, 0);

  const saturdaySunsetDate = new Date(saturday);
  saturdaySunsetDate.setHours(satSunset.hours, satSunset.minutes, 0, 0);

  const isSabbathNow =
    referenceDate.getTime() >= fridaySunsetDate.getTime() &&
    referenceDate.getTime() <= saturdaySunsetDate.getTime();

  return {
    fridaySunset: friSunset.formatted,
    saturdaySunset: satSunset.formatted,
    isSabbathNow,
  };
}
```

- [ ] **Step 4: Executar os testes e validar aprovação**

Run: `npm test -- --include=src/app/core/utils/solar-time.util.spec.ts`
Expected: PASS (4/4 testes passando)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/core/utils/solar-time.util.ts frontend/src/app/core/utils/solar-time.util.spec.ts
git commit -m "feat(core): add NOAA astronomical sunset calculation utility for Tatui"
```

---

### Task 2: Utilitários de Calendário e Mobilidade (`calendar-links.util.ts` & `mobility-links.util.ts`)

**Files:**
- Create: `frontend/src/app/core/utils/calendar-links.util.ts`
- Create: `frontend/src/app/core/utils/calendar-links.util.spec.ts`
- Create: `frontend/src/app/core/utils/mobility-links.util.ts`
- Create: `frontend/src/app/core/utils/mobility-links.util.spec.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface CalendarEventInput {
    title: string;
    description: string;
    location: string;
    dayOfWeek: number; // 0=Domingo, 3=Quarta, 6=Sábado
    time: string; // "09:00", "19:30"
    durationMinutes?: number;
  }
  export function buildGoogleCalendarUrl(event: CalendarEventInput): string;
  export function generateIcsContent(event: CalendarEventInput): string;
  export function downloadIcsFile(event: CalendarEventInput, filename?: string): void;

  export function getGoogleMapsUrl(address: string, lat?: number, lng?: number): string;
  export function getWazeUrl(lat?: number, lng?: number): string;
  export function getAppleMapsUrl(address: string, lat?: number, lng?: number): string;
  export function getUberUrl(address: string, lat?: number, lng?: number): string;
  export function getWhatsAppShareUrl(info: { title: string; day: string; time: string; address: string }): string;
  ```

- [ ] **Step 1: Escrever os testes unitários de calendário e mobilidade**

Criar `frontend/src/app/core/utils/calendar-links.util.spec.ts`:
```typescript
import { buildGoogleCalendarUrl, generateIcsContent } from './calendar-links.util';

describe('calendar-links.util', () => {
  const mockEvent = {
    title: 'Culto Divino / Adoração',
    description: 'Momento solene de louvor e reflexão bíblica.',
    location: 'Rua Chiquinha Rodrigues, 1005 - Mangueiras, Tatuí - SP',
    dayOfWeek: 6, // Sábado
    time: '10:15',
    durationMinutes: 90,
  };

  it('deve gerar uma URL válida para o Google Calendar', () => {
    const url = buildGoogleCalendarUrl(mockEvent);
    expect(url).toContain('https://calendar.google.com/calendar/render');
    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain(encodeURIComponent(mockEvent.title));
    expect(url).toContain('dates=');
  });

  it('deve gerar conteúdo no formato VCALENDAR (RFC 5545)', () => {
    const ics = generateIcsContent(mockEvent);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain(`SUMMARY:${mockEvent.title}`);
    expect(ics).toContain(`LOCATION:${mockEvent.location}`);
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });
});
```

Criar `frontend/src/app/core/utils/mobility-links.util.spec.ts`:
```typescript
import {
  getGoogleMapsUrl,
  getWazeUrl,
  getAppleMapsUrl,
  getUberUrl,
  getWhatsAppShareUrl,
} from './mobility-links.util';

describe('mobility-links.util', () => {
  const address = 'Rua Chiquinha Rodrigues, 1005 - Mangueiras, Tatuí - SP';
  const lat = -23.3556;
  const lng = -47.8569;

  it('deve gerar URLs corretas de rotas e navegação', () => {
    expect(getGoogleMapsUrl(address, lat, lng)).toContain('https://www.google.com/maps/dir/?api=1');
    expect(getWazeUrl(lat, lng)).toBe(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`);
    expect(getAppleMapsUrl(address, lat, lng)).toContain('https://maps.apple.com/');
    expect(getUberUrl(address, lat, lng)).toContain('https://m.uber.com/ul/?action=setPickup');
  });

  it('deve gerar URL de compartilhamento no WhatsApp com dados do culto', () => {
    const shareUrl = getWhatsAppShareUrl({
      title: 'Culto Divino',
      day: 'Sábado',
      time: '10:15',
      address,
    });
    expect(shareUrl).toContain('https://api.whatsapp.com/send?text=');
    expect(shareUrl).toContain(encodeURIComponent('Culto Divino'));
    expect(shareUrl).toContain(encodeURIComponent('10:15'));
  });
});
```

- [ ] **Step 2: Executar os testes para verificar que falham**

Run: `npm test -- --include=src/app/core/utils/*.spec.ts`
Expected: FAIL (módulos não implementados)

- [ ] **Step 3: Implementar `calendar-links.util.ts` e `mobility-links.util.ts`**

Criar `frontend/src/app/core/utils/calendar-links.util.ts`:
```typescript
export interface CalendarEventInput {
  title: string;
  description: string;
  location: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  time: string; // "HH:mm" ex: "09:00" ou "19:30"
  durationMinutes?: number;
}

function getNextDateForDayOfWeek(dayOfWeek: number, timeStr: string): { start: Date; end: Date } {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const targetDate = new Date(now);
  targetDate.setHours(hours, minutes, 0, 0);

  const currentDay = now.getDay();
  let daysToAdd = (dayOfWeek - currentDay + 7) % 7;
  if (daysToAdd === 0 && targetDate.getTime() <= now.getTime()) {
    daysToAdd = 7;
  }
  targetDate.setDate(now.getDate() + daysToAdd);

  const endDate = new Date(targetDate);
  endDate.setMinutes(targetDate.getMinutes() + 90);

  return { start: targetDate, end: endDate };
}

function formatIsoUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function buildGoogleCalendarUrl(event: CalendarEventInput): string {
  const { start, end } = getNextDateForDayOfWeek(event.dayOfWeek, event.time);
  const startStr = formatIsoUtc(start);
  const endStr = formatIsoUtc(end);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startStr}/${endStr}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsContent(event: CalendarEventInput): string {
  const { start, end } = getNextDateForDayOfWeek(event.dayOfWeek, event.time);
  const startStr = formatIsoUtc(start);
  const endStr = formatIsoUtc(end);
  const nowStr = formatIsoUtc(new Date());
  const uid = `iasd-mangueiras-${event.dayOfWeek}-${event.time.replace(':', '')}-${Date.now()}@iasdmangueiras.com.br`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IASD Mangueiras//Calendario de Cultos//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(event: CalendarEventInput, filename: string = 'culto-iasd-mangueiras.ics'): void {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

Criar `frontend/src/app/core/utils/mobility-links.util.ts`:
```typescript
import { TATUI_COORDINATES } from './solar-time.util';

export function getGoogleMapsUrl(
  address: string,
  lat: number = TATUI_COORDINATES.latitude,
  lng: number = TATUI_COORDINATES.longitude,
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
}

export function getWazeUrl(
  lat: number = TATUI_COORDINATES.latitude,
  lng: number = TATUI_COORDINATES.longitude,
): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

export function getAppleMapsUrl(
  address: string,
  lat: number = TATUI_COORDINATES.latitude,
  lng: number = TATUI_COORDINATES.longitude,
): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&q=${encodeURIComponent('IASD Mangueiras')}`;
}

export function getUberUrl(
  address: string,
  lat: number = TATUI_COORDINATES.latitude,
  lng: number = TATUI_COORDINATES.longitude,
): string {
  const params = new URLSearchParams({
    action: 'setPickup',
    'dropoff[latitude]': String(lat),
    'dropoff[longitude]': String(lng),
    'dropoff[formatted_address]': address,
    'dropoff[nickname]': 'IASD Mangueiras',
  });
  return `https://m.uber.com/ul/?${params.toString()}`;
}

export function getWhatsAppShareUrl(info: {
  title: string;
  day: string;
  time: string;
  address: string;
}): string {
  const text = `Olá! Gostaria de convidar você e sua família para participar do *${info.title}* na IASD Mangueiras em Tatuí-SP.\n\n📅 *Dia:* ${info.day}\n⏰ *Horário:* ${info.time}\n📍 *Local:* ${info.address}\n\nSerá uma alegria receber você! Venha nos visitar.`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
```

- [ ] **Step 4: Executar os testes para validar aprovação**

Run: `npm test -- --include=src/app/core/utils/*.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/core/utils/calendar-links.util.ts frontend/src/app/core/utils/calendar-links.util.spec.ts frontend/src/app/core/utils/mobility-links.util.ts frontend/src/app/core/utils/mobility-links.util.spec.ts
git commit -m "feat(core): add calendar and mobility deep links utilities"
```

---

### Task 3: Atualização dos Modelos e Serviços (`content.models.ts`, `content.service.ts`, `admin-cms.service.ts`)

**Files:**
- Modify: `frontend/src/app/core/models/content.models.ts`
- Modify: `frontend/src/app/core/services/content.service.ts`
- Modify: `frontend/src/app/core/services/admin-cms.service.ts`
- Test: `frontend/src/app/core/services/content.service.spec.ts`

**Interfaces:**
- Consumes: `Horario`, `AvisoHorarioEspecial`
- Produces:
  - `ContentService.horarios()`: `Signal<readonly Horario[]>` (sincronizado com Firestore e com fallback seguro)
  - `ContentService.avisosHorarios()`: `Signal<readonly AvisoHorarioEspecial[]>` (filtrando avisos expirados)
  - `AdminCmsService.saveHorarioRegular(horario: Partial<Horario>): Promise<string>`
  - `AdminCmsService.deleteHorarioRegular(id: string): Promise<void>`
  - `AdminCmsService.toggleHorarioAtivo(id: string, ativo: boolean): Promise<void>`

- [ ] **Step 1: Atualizar os modelos de dados em `content.models.ts`**

Adicionar campos opcionais em `Horario` e `AvisoHorarioEspecial`:
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
  expira_em?: string; // Formato YYYY-MM-DD
  createdAt?: string;
}
```

- [ ] **Step 2: Atualizar `ContentService` com listener de horários regulares e auto-expiração de avisos**

Em `frontend/src/app/core/services/content.service.ts`:
- Adicionar listener para a coleção `horarios_regulares` no Firestore ordenada por `ordem`, atualizando `_horarios`. Se vazio ou offline, manter `defaultHorarios`.
- Na leitura de `avisos_horarios`, filtrar registros onde `expira_em` é anterior à data de hoje (`new Date().toISOString().split('T')[0]`) ou onde `ativo === false`.

- [ ] **Step 3: Atualizar `AdminCmsService` com métodos para gerenciar cultos regulares**

Em `frontend/src/app/core/services/admin-cms.service.ts`:
- Adicionar `saveHorarioRegular(horario: Partial<Horario>): Promise<string>` (cria ou atualiza documento em `horarios_regulares`).
- Adicionar `deleteHorarioRegular(id: string): Promise<void>`.
- Adicionar `toggleHorarioAtivo(id: string, ativo: boolean): Promise<void>`.
- Atualizar `saveAvisoHorario` para persistir `expira_em` e `ativo`.

- [ ] **Step 4: Atualizar e rodar os testes unitários de `content.service.spec.ts`**

Run: `npm test -- --include=src/app/core/services/content.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/core/models/content.models.ts frontend/src/app/core/services/content.service.ts frontend/src/app/core/services/admin-cms.service.ts frontend/src/app/core/services/content.service.spec.ts
git commit -m "feat(services): add regular schedule Firestore sync and auto-expiring notices filter"
```

---

### Task 4: Atualização da Página Pública de Horários (`horarios.page.ts`)

**Files:**
- Modify: `frontend/src/app/features/horarios/horarios.page.ts`
- Modify: `frontend/src/app/features/horarios/horarios.page.spec.ts`

**Interfaces:**
- Consumes:
  - `solar-time.util`: `getTodaySunset`, `getSabbathSunsets`
  - `calendar-links.util`: `buildGoogleCalendarUrl`, `downloadIcsFile`
  - `mobility-links.util`: `getGoogleMapsUrl`, `getWazeUrl`, `getAppleMapsUrl`, `getUberUrl`, `getWhatsAppShareUrl`
  - `ToastService`: `toast.success()`

- [ ] **Step 1: Escrever testes unitários em `horarios.page.spec.ts`**

Validar:
- Renderização do badge compacto de pôr do sol e próximo culto.
- Renderização dos cards de cultos regulares com botões de ação.
- Disparo do método de copiar endereço com invocação do Toast.
- Disparo do download de arquivo `.ics` e link do Google Calendar.
- Renderização dos botões de rotas e comodidades.

- [ ] **Step 2: Implementar a nova interface de `horarios.page.ts`**

Incluir:
1. **Header com Badge Compacto**:
   - Pílula com Pôr do Sol de hoje em Tatuí e Próximo Culto.
2. **Avisos Especiais**:
   - Cards com alerta e destaque visual.
3. **Grid de Cultos Regulares**:
   - Tag "Hoje" ou "Próximo".
   - Botão interativo de adicionar à agenda (com modal/dropdown amigável para escolher Google Agenda ou baixar .ics).
   - Botão "Convidar no WhatsApp".
4. **Seção Como Chegar & Mobilidade**:
   - Card com endereço e botão "Copiar Endereço" com Toast feedback.
   - 4 botões de rotas: Google Maps, Waze, Apple Maps e Uber.
   - Grid de 4 comodidades com ícones Material Symbols.
5. **FAQ Accordion**:
   - Mantido e enriquecido com animação suave e `aria-expanded`.

- [ ] **Step 3: Executar os testes unitários**

Run: `npm test -- --include=src/app/features/horarios/horarios.page.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/horarios/horarios.page.ts frontend/src/app/features/horarios/horarios.page.spec.ts
git commit -m "feat(horarios): upgrade public schedule page with sunset pill, calendar tools and mobility routes"
```

---

### Task 5: Atualização do Painel Administrativo (`admin-horarios.page.ts`)

**Files:**
- Modify: `frontend/src/app/features/admin/horarios/admin-horarios.page.ts`
- Modify: `frontend/src/app/features/admin/horarios/admin-horarios.page.spec.ts`

**Interfaces:**
- Consumes: `AdminCmsService`, `ContentService`, `ToastService`

- [ ] **Step 1: Escrever testes unitários em `admin-horarios.page.spec.ts`**

Validar:
- Abertura de modal para criar e editar culto regular.
- Toggle rápido de status ativo/inativo para cultos regulares e avisos.
- Formulário reativo de aviso especial com campo `expira_em`.
- Exclusão com confirmação e toast feedback.

- [ ] **Step 2: Implementar a interface administrativa aprimorada em `admin-horarios.page.ts`**

Incluir:
1. **Seção de Cultos Regulares**:
   - Tabela / Cards dos cultos regulares.
   - Botão "+ Novo Culto Regular" e Modal com formulário (`titulo`, `dia`, `horario`, `descricao`, `ativo`).
   - Ações rápidas: Editar, Alternar Ativo/Inativo, Excluir.
2. **Seção de Avisos Especiais**:
   - Formulário com campo `expira_em` (Data de expiração automática).
   - Toggle rápido ativo/inativo direto no card.
   - Feedback via `ToastService`.

- [ ] **Step 3: Executar os testes unitários**

Run: `npm test -- --include=src/app/features/admin/horarios/admin-horarios.page.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/admin/horarios/admin-horarios.page.ts frontend/src/app/features/admin/horarios/admin-horarios.page.spec.ts
git commit -m "feat(admin): enhance admin schedule manager with regular services CRUD and notice expiration"
```

---

### Task 6: Verificação Completa de Build, Tipos e Testes

**Files:**
- None (Validação de CI / Integridade)

- [ ] **Step 1: Checar tipagem estática do TypeScript**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 2: Executar toda a suíte de testes unitários do frontend**

Run: `cd frontend && npm test -- --watch=false`
Expected: All tests PASS

- [ ] **Step 3: Executar build de produção do Angular**

Run: `cd frontend && npm run build`
Expected: Build success

- [ ] **Step 4: Commit final de verificação se necessário**

```bash
git commit --allow-empty -m "chore: verify build, types and unit tests for horarios upgrade"
```
