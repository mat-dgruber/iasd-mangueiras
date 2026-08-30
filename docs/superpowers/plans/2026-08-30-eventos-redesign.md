# Redesign da Página de Eventos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar a página `/eventos` para destacar a programação, facilitar descoberta e compartilhamento, e expor os campos opcionais de evento no admin sem backend novo nem dependências novas.

**Architecture:** Vamos manter a página pública como standalone component e concentrar a lógica de filtro/seleção em `computed()` e `signal()` no próprio componente. O modelo `Evento` recebe apenas campos opcionais novos; o admin expõe esses campos no formulário e reaproveita o fluxo atual de gravação. Testes cobrem a página pública, o admin e o contrato do modelo sem criar novas camadas.

**Tech Stack:** Angular standalone components, Signals, Reactive Forms, TypeScript, Tailwind CSS, Firebase/Firestore via `ContentService`, Jasmine/Karma.

## Global Constraints

- **Language & Conventions:** Código-fonte e commits em inglês (EN-US Conventional Commits), documentação e comentários em pt-BR.
- **Zero Bloat:** Sem backend novo e sem dependências novas.
- **Acessibilidade:** Touch targets com pelo menos 44px, `focus-visible`, `aria-pressed`, textos claros para estados vazio/erro e suporte a `prefers-reduced-motion`.
- **Padrão de UI:** Light, Dark e High Contrast precisam continuar suportados.
- **Dados:** `data` continua como texto amigável; `data_inicio` é opcional e habilita ordenação/contagem regressiva/agenda quando existir.

---

### Task 1: Expandir o contrato de evento

**Files:**
- Modify: `frontend/src/app/core/models/content.models.ts:21-38`
- Modify: `frontend/src/content/eventos.json`
- Test: `frontend/src/app/core/services/content.service.spec.ts`

**Interfaces:**
- Consumes: `Evento` usado por `ContentService`, `EventosPage` e `AdminEventosPage`
- Produces: `Evento` com `data_inicio?: string`, `data_fim?: string`, `endereco?: string`, `whatsapp_contato?: string`

- [ ] **Step 1: Write the failing test**

```ts
// frontend/src/app/core/services/content.service.spec.ts
it('expõe os novos campos opcionais de evento', () => {
  const service = TestBed.inject(ContentService);
  const evento = service.eventos()[0] as Partial<Evento>;

  expect(evento).toBeDefined();
  expect('data_inicio' in evento).toBeTrue();
  expect('data_fim' in evento).toBeTrue();
  expect('endereco' in evento).toBeTrue();
  expect('whatsapp_contato' in evento).toBeTrue();
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `ng test --watch=false --include=frontend/src/app/core/services/content.service.spec.ts`
Expected: FAIL until the model and fixture JSON expose the new fields.

- [ ] **Step 3: Add the new optional properties**

```ts
export interface Evento {
  id?: string;
  titulo: string;
  data: string;
  horario: string;
  descricao: string;
  local?: string;
  imagem_url?: string;
  banner_url?: string;
  href?: string;
  destaque?: boolean;
  palestrante?: string;
  departamento?: string;
  valor_entrada?: string;
  link_inscricao?: string;
  publico_alvo?: string;
  status?: 'publicado' | 'rascunho' | 'encerrado';
  data_inicio?: string;
  data_fim?: string;
  endereco?: string;
  whatsapp_contato?: string;
}
```

- [ ] **Step 4: Add sample values to the fallback JSON**

Update at least one published event in `frontend/src/content/eventos.json` with `data_inicio`, `data_fim`, `endereco` and `whatsapp_contato` so the public page can exercise the new flow without Firestore.

- [ ] **Step 5: Run the test again**

Run: `ng test --watch=false --include=frontend/src/app/core/services/content.service.spec.ts`
Expected: PASS.

---

### Task 2: Reestruturar a página pública de eventos

**Files:**
- Modify: `frontend/src/app/features/eventos/eventos.page.ts`
- Test: `frontend/src/app/features/eventos/eventos.page.spec.ts`

**Interfaces:**
- Consumes: `ContentService.eventos()`, `ContentService.comunicados()`, `Evento`
- Produces: hero de destaque, abas de navegação, filtros locais, cards filtrados e CTAs de agenda/compartilhamento

- [ ] **Step 1: Write the failing test**

```ts
// frontend/src/app/features/eventos/eventos.page.spec.ts
it('filtra eventos por departamento e termo de busca', () => {
  const fixture = TestBed.createComponent(EventosPage);
  const component = fixture.componentInstance;

  component.departmentFilter.set('Família');
  component.searchTerm.set('oração');
  fixture.detectChanges();

  expect(component.filteredEventos().length).toBeGreaterThanOrEqual(0);
});
```

- [ ] **Step 2: Run the test to confirm the current page does not support the new flow**

Run: `ng test --watch=false --include=frontend/src/app/features/eventos/eventos.page.spec.ts`
Expected: FAIL because the component still has only the current static rendering.

- [ ] **Step 3: Add the local state and derived views**

```ts
readonly activeTab = signal<'proximos' | 'comunicados' | 'encerrados'>('proximos');
readonly departmentFilter = signal('');
readonly searchTerm = signal('');

readonly publishedEventos = computed(() => ...);
readonly featuredEvento = computed(() => ...);
readonly upcomingEventos = computed(() => ...);
readonly archivedEventos = computed(() => ...);
readonly availableDepartments = computed(() => ...);
readonly filteredEventos = computed(() => ...);
```

Implement the computed values inside `frontend/src/app/features/eventos/eventos.page.ts` so the template only consumes view-ready data.

- [ ] **Step 4: Rebuild the template around the approved layout**

Use the existing component file to render:

- hero com evento em destaque;
- abas `Próximos`, `Comunicados`, `Encerrados`;
- busca textual;
- filtro por departamento;
- grid de cards com `Inscrever-se`, `Adicionar à agenda`, `Compartilhar` e `Falar com a igreja`;
- mural de comunicados ao lado ou abaixo da lista.

Use `buildGoogleCalendarUrl`, `generateIcsContent` e `getWhatsAppShareUrl` only where `data_inicio` or `whatsapp_contato` exist.

- [ ] **Step 5: Reaproveitar o fallback quando a data estruturada não existir**

Keep the current text date visible everywhere, and only enable countdown/sorting/agenda when `data_inicio` exists.

- [ ] **Step 6: Expand the page test to cover the new states**

Add assertions for:

- hero render when there is a featured event;
- empty state when filters remove all results;
- correct CTA labels based on `link_inscricao` and `data_inicio`.

- [ ] **Step 7: Run the page tests**

Run: `ng test --watch=false --include=frontend/src/app/features/eventos/eventos.page.spec.ts`
Expected: PASS.

---

### Task 3: Expor os campos novos no admin de eventos

**Files:**
- Modify: `frontend/src/app/features/admin/eventos/admin-eventos.page.ts`
- Test: `frontend/src/app/features/admin/eventos/admin-eventos.page.spec.ts`

**Interfaces:**
- Consumes: `Evento` with the new optional fields
- Produces: formulário com `data_inicio`, `data_fim`, `endereco` e `whatsapp_contato` persistidos junto com os demais campos

- [ ] **Step 1: Write the failing test**

```ts
// frontend/src/app/features/admin/eventos/admin-eventos.page.spec.ts
it('exibe campos extras para data estruturada e contato', () => {
  const inputs = fixture.nativeElement.querySelectorAll('input, textarea');
  const labels = Array.from(fixture.nativeElement.querySelectorAll('label')).map(
    (el: HTMLLabelElement) => el.textContent?.trim(),
  );

  expect(labels).toContain('Data Início');
  expect(labels).toContain('Data Fim');
  expect(labels).toContain('Endereço');
  expect(labels).toContain('WhatsApp de Contato');
});
```

- [ ] **Step 2: Run the admin test to confirm the new fields are missing**

Run: `ng test --watch=false --include=frontend/src/app/features/admin/eventos/admin-eventos.page.spec.ts`
Expected: FAIL until the form is updated.

- [ ] **Step 3: Add the new controls to the form**

```ts
this.eventoForm = this.fb.group({
  // campos já existentes...
  data_inicio: [''],
  data_fim: [''],
  endereco: [''],
  whatsapp_contato: [''],
});
```

Render these controls in the modal below the existing date/time/location block, with labels and placeholders in pt-BR.

- [ ] **Step 4: Persist the new controls through the existing save flow**

Make sure `saveEvento()` sends the new form values together with the current payload. Do not add a new service layer; reuse the current admin save path.

- [ ] **Step 5: Run the admin test again**

Run: `ng test --watch=false --include=frontend/src/app/features/admin/eventos/admin-eventos.page.spec.ts`
Expected: PASS.

---

### Task 4: Fechar a qualidade do fluxo com testes e typecheck

**Files:**
- Modify: `frontend/src/app/features/eventos/eventos.page.spec.ts`
- Modify: `frontend/src/app/features/admin/eventos/admin-eventos.page.spec.ts`
- Modify: `frontend/src/app/core/services/content.service.spec.ts`
- Test: `frontend/tsconfig*.json` via typecheck command

**Interfaces:**
- Consumes: todas as mudanças das Tasks 1-3
- Produces: cobertura mínima dos fluxos público/admin e compilação limpa

- [ ] **Step 1: Strengthen the public page spec**

Add one assertion that the featured hero uses the structured date branch when `data_inicio` exists, and one assertion that a non-structured event still renders with the text `data`.

- [ ] **Step 2: Strengthen the admin spec**

Add one assertion that the modal opens with empty values for the new optional fields, so future edits do not accidentally mark them as required.

- [ ] **Step 3: Run the full frontend test slice**

Run:
- `ng test --watch=false --include=frontend/src/app/core/services/content.service.spec.ts`
- `ng test --watch=false --include=frontend/src/app/features/eventos/eventos.page.spec.ts`
- `ng test --watch=false --include=frontend/src/app/features/admin/eventos/admin-eventos.page.spec.ts`

Expected: PASS for all three specs.

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit -p frontend/tsconfig.app.json`
Expected: PASS with no type errors.

- [ ] **Step 5: Commit**

```bash
git add \
  frontend/src/app/core/models/content.models.ts \
  frontend/src/content/eventos.json \
  frontend/src/app/features/eventos/eventos.page.ts \
  frontend/src/app/features/admin/eventos/admin-eventos.page.ts \
  frontend/src/app/core/services/content.service.spec.ts \
  frontend/src/app/features/eventos/eventos.page.spec.ts \
  frontend/src/app/features/admin/eventos/admin-eventos.page.spec.ts

git commit -m "feat(eventos): redesign public events page"
```
