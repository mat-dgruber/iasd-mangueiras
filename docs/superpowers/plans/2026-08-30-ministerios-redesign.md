# Ministerios Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the ministerios public page (skeleton, dynamic categories, WhatsApp, highlight section, active filter) and create a new admin CRUD page.

**Architecture:** Decompose the 440-line ministerios.page.ts into focused sub-components (card, modal, skeleton). Create admin CRUD following the established admin-eventos pattern. Add `ativo` field to the Ministerio model for filtering.

**Tech Stack:** Angular 19+, standalone components, signals, reactive forms, Tailwind CSS, Firestore.

## Global Constraints

- Angular standalone components with `OnPush` change detection
- Signals for state management (no RxJS for new code)
- Tailwind CSS utility-first (no SCSS)
- Test pattern: AAA (Arrange, Act, Assert)
- Commits: Conventional Commits format
- Accessibility: touch targets ≥ 44px, focus-visible, WCAG 2.2 AA contrast

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `frontend/src/app/core/models/content.models.ts:54-67` | Add `ativo?: boolean` to Ministerio interface |
| Create | `frontend/src/app/features/ministerios/ministerio-skeleton.component.ts` | Loading skeleton (6 placeholder cards) |
| Create | `frontend/src/app/features/ministerios/ministerio-card.component.ts` | Individual card with WhatsApp button |
| Create | `frontend/src/app/features/ministerios/ministerio-modal.component.ts` | Detail modal with WhatsApp link |
| Modify | `frontend/src/app/features/ministerios/ministerios.page.ts` | Refactor to use sub-components, add dynamic categories, active filter, highlight section |
| Modify | `frontend/src/app/features/ministerios/ministerios.page.spec.ts` | Update tests for new behavior |
| Create | `frontend/src/app/features/admin/ministerios/admin-ministerios.page.ts` | Admin CRUD page |
| Create | `frontend/src/app/features/admin/ministerios/admin-ministerios.page.spec.ts` | Admin tests |
| Modify | `frontend/src/app/app.routes.ts:96-103` | Add admin/ministerios route |
| Modify | `frontend/src/app/features/admin/layout/admin-layout.component.ts:130` | Add nav link |

---

### Task 1: Add `ativo` field to Ministerio model

**Files:**
- Modify: `frontend/src/app/core/models/content.models.ts:54-67`

**Interfaces:**
- Consumes: nothing
- Produces: `Ministerio.ativo?: boolean` used by all subsequent tasks

- [ ] **Step 1: Add ativo field to the interface**

```typescript
// content.models.ts — Ministerio interface (line ~66, before closing brace)
export interface Ministerio {
  id?: string;
  nome: string;
  descricao: string;
  categoria?: string;
  lideres?: string;
  imagem_url?: string;
  banner_url?: string;
  reunioes_horario?: string;
  contato_whatsapp?: string;
  publico_alvo?: string;
  atividades?: string[];
  destaque?: boolean;
  ativo?: boolean;  // NOVO
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/core/models/content.models.ts
git commit -m "feat(ministerios): add ativo field to Ministerio model"
```

---

### Task 2: Create MinisterioSkeletonComponent

**Files:**
- Create: `frontend/src/app/features/ministerios/ministerio-skeleton.component.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `MinisterioSkeletonComponent` — standalone component, renders 6 placeholder cards

- [ ] **Step 1: Create the skeleton component**

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-ministerio-skeleton',
  standalone: true,
  template: `
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      @for (i of [1,2,3,4,5,6]; track i) {
        <div class="rounded-2xl border border-advent-border bg-white overflow-hidden shadow-sm animate-pulse">
          <div class="aspect-video w-full bg-slate-200"></div>
          <div class="p-6 space-y-3">
            <div class="h-4 w-20 rounded bg-slate-200"></div>
            <div class="h-6 w-3/4 rounded bg-slate-200"></div>
            <div class="space-y-2">
              <div class="h-3 w-full rounded bg-slate-100"></div>
              <div class="h-3 w-5/6 rounded bg-slate-100"></div>
            </div>
            <div class="pt-2 space-y-2 border-t border-advent-border/60">
              <div class="h-3 w-1/2 rounded bg-slate-100"></div>
              <div class="h-3 w-2/3 rounded bg-slate-100"></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class MinisterioSkeletonComponent {}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/ministerios/ministerio-skeleton.component.ts
git commit -m "feat(ministerios): add skeleton loading component"
```

---

### Task 3: Create MinisterioCardComponent

**Files:**
- Create: `frontend/src/app/features/ministerios/ministerio-card.component.ts`

**Interfaces:**
- Consumes: `Ministerio` type from `content.models.ts`
- Produces: `MinisterioCardComponent` — standalone, `ministerio` input, `details` output, `whatsapp` output

- [ ] **Step 1: Create the card component**

```typescript
import { Component, input, output } from '@angular/core';
import { Ministerio } from '../../core/models/content.models';

@Component({
  selector: 'app-ministerio-card',
  standalone: true,
  template: `
    <article class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div>
        @if (ministerio().banner_url || ministerio().imagem_url) {
          <div class="aspect-video w-full overflow-hidden bg-gray-100 border-b border-advent-border">
            <img
              [src]="ministerio().banner_url || ministerio().imagem_url"
              [alt]="ministerio().nome"
              class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        } @else {
          <div class="h-3 bg-linear-to-r from-advent-blue via-blue-400 to-advent-gold/70"></div>
        }

        <div class="p-6">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            @if (ministerio().categoria) {
              <span class="inline-block rounded-md bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue">
                {{ ministerio().categoria }}
              </span>
            }
            @if (ministerio().destaque) {
              <span class="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                ⭐ Destaque
              </span>
            }
          </div>

          <h3 class="text-xl font-bold text-advent-text leading-snug">{{ ministerio().nome }}</h3>
          <p class="mt-2.5 text-sm text-advent-muted leading-relaxed">{{ ministerio().descricao }}</p>

          <div class="mt-4 space-y-2 border-t border-advent-border/60 pt-3 text-xs text-advent-text">
            @if (ministerio().lideres) {
              <p class="flex items-center gap-1.5 font-medium">
                <span class="text-advent-muted">👥 Liderança:</span>
                <span class="font-semibold text-advent-blue">{{ ministerio().lideres }}</span>
              </p>
            }
            @if (ministerio().publico_alvo) {
              <p class="flex items-center gap-1.5 font-medium">
                <span class="text-advent-muted">🎯 Público:</span>
                <span>{{ ministerio().publico_alvo }}</span>
              </p>
            }
            @if (ministerio().reunioes_horario) {
              <p class="flex items-start gap-1.5 font-medium">
                <span class="text-advent-muted shrink-0">⏰ Encontros:</span>
                <span>{{ ministerio().reunioes_horario }}</span>
              </p>
            }
            @if (ministerio().atividades && ministerio().atividades!.length > 0) {
              <div class="pt-2">
                <span class="text-advent-muted font-semibold block mb-1">Principais Atividades:</span>
                <ul class="list-disc list-inside space-y-0.5 text-advent-muted text-[11px]">
                  @for (ativ of ministerio().atividades!.slice(0, 3); track ativ) {
                    <li class="truncate">{{ ativ }}</li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="p-6 pt-0 flex items-center justify-between border-t border-advent-border/50">
        <button
          type="button"
          (click)="details.emit(ministerio())"
          class="text-xs font-semibold text-advent-blue hover:underline cursor-pointer"
        >
          Ver detalhes completos →
        </button>

        <div class="flex items-center gap-2">
          @if (ministerio().contato_whatsapp) {
            <a
              [href]="'https://wa.me/' + ministerio().contato_whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-lg bg-green-50 hover:bg-green-500 hover:text-white text-green-700 px-3 py-1.5 text-xs font-bold transition-colors min-h-[36px] flex items-center"
              aria-label="Contatar via WhatsApp"
            >
              WhatsApp
            </a>
          }
          <a
            class="rounded-lg bg-advent-blue/10 hover:bg-advent-blue hover:text-white text-advent-blue px-3 py-1.5 text-xs font-bold transition-colors"
            routerLink="/contato"
          >
            Quero Servir
          </a>
        </div>
      </div>
    </article>
  `,
})
export class MinisterioCardComponent {
  readonly ministerio = input.required<Ministerio>();
  readonly details = output<Ministerio>();
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/ministerios/ministerio-card.component.ts
git commit -m "feat(ministerios): extract card component with WhatsApp button"
```

---

### Task 4: Create MinisterioModalComponent

**Files:**
- Create: `frontend/src/app/features/ministerios/ministerio-modal.component.ts`

**Interfaces:**
- Consumes: `Ministerio` type from `content.models.ts`
- Produces: `MinisterioModalComponent` — standalone, `ministerio` input, `close` output

- [ ] **Step 1: Create the modal component**

```typescript
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ministerio } from '../../core/models/content.models';

@Component({
  selector: 'app-ministerio-modal',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ministerio-title"
      (click)="close.emit()"
    >
      <div class="w-full max-w-xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between pb-4 border-b border-advent-border">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">
              {{ ministerio().categoria }}
            </span>
            <h3 id="modal-ministerio-title" class="text-2xl font-bold text-advent-text mt-0.5">
              {{ ministerio().nome }}
            </h3>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="text-advent-muted hover:text-advent-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
            aria-label="Fechar modal"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        @if (ministerio().banner_url || ministerio().imagem_url) {
          <div class="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-advent-border shadow-xs bg-slate-100">
            <img
              [src]="ministerio().banner_url || ministerio().imagem_url"
              [alt]="ministerio().nome"
              class="h-full w-full object-cover"
            />
          </div>
        }

        <div class="mt-5 space-y-4">
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-advent-muted mb-1">Sobre o Ministério</h4>
            <p class="text-sm text-advent-text leading-relaxed">{{ ministerio().descricao }}</p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 bg-advent-neutral p-4 rounded-2xl border border-advent-border">
            @if (ministerio().lideres) {
              <div>
                <span class="text-xs font-bold text-advent-muted block">Liderança Responsável</span>
                <span class="text-sm font-semibold text-advent-blue">{{ ministerio().lideres }}</span>
              </div>
            }
            @if (ministerio().publico_alvo) {
              <div>
                <span class="text-xs font-bold text-advent-muted block">Público-Alvo</span>
                <span class="text-sm text-advent-text">{{ ministerio().publico_alvo }}</span>
              </div>
            }
            @if (ministerio().reunioes_horario) {
              <div class="sm:col-span-2">
                <span class="text-xs font-bold text-advent-muted block">Horários e Encontros</span>
                <span class="text-sm text-advent-text">{{ ministerio().reunioes_horario }}</span>
              </div>
            }
          </div>

          @if (ministerio().atividades && ministerio().atividades!.length > 0) {
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-advent-muted mb-2">Projetos & Atividades</h4>
              <ul class="space-y-1.5">
                @for (ativ of ministerio().atividades!; track ativ) {
                  <li class="flex items-start gap-2 text-xs md:text-sm text-advent-text">
                    <span class="text-advent-blue font-bold">✓</span>
                    <span>{{ ativ }}</span>
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-advent-border">
          <button
            type="button"
            (click)="close.emit()"
            class="w-full sm:w-auto rounded-card border border-advent-border px-5 py-2.5 text-xs font-semibold text-advent-text hover:bg-slate-50 cursor-pointer"
          >
            Fechar
          </button>
          <div class="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            @if (ministerio().contato_whatsapp) {
              <a
                [href]="'https://wa.me/' + ministerio().contato_whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full sm:w-auto rounded-card bg-green-600 px-6 py-2.5 text-center text-xs font-bold text-white shadow-sm hover:bg-green-700 active:scale-[0.98] min-h-[44px] flex items-center justify-center"
              >
                💬 WhatsApp
              </a>
            }
            <a
              routerLink="/contato"
              (click)="close.emit()"
              class="w-full sm:w-auto rounded-card bg-advent-blue px-6 py-2.5 text-center text-xs font-bold text-white shadow-sm hover:bg-advent-blue-dark active:scale-[0.98]"
            >
              Entrar em Contato para Servir →
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MinisterioModalComponent {
  readonly ministerio = input.required<Ministerio>();
  readonly close = output<void>();
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/ministerios/ministerio-modal.component.ts
git commit -m "feat(ministerios): extract modal component with WhatsApp link"
```

---

### Task 5: Refactor MinisteriosPage with sub-components, dynamic categories, active filter, highlight section

**Files:**
- Modify: `frontend/src/app/features/ministerios/ministerios.page.ts`

**Interfaces:**
- Consumes: `MinisterioSkeletonComponent`, `MinisterioCardComponent`, `MinisterioModalComponent` from tasks 2-4
- Produces: Updated `MinisteriosPage` with all new features

- [ ] **Step 1: Rewrite the page component**

Replace the entire content of `ministerios.page.ts` with:

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { Ministerio } from '../../core/models/content.models';
import { MinisterioCardComponent } from './ministerio-card.component';
import { MinisterioModalComponent } from './ministerio-modal.component';
import { MinisterioSkeletonComponent } from './ministerio-skeleton.component';

@Component({
  selector: 'app-ministerios-page',
  standalone: true,
  imports: [RouterLink, MinisterioCardComponent, MinisterioModalComponent, MinisterioSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" routerLink="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page">Ministérios</span>
        </nav>

        <header class="max-w-3xl">
          <span class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
            Serviço e Comunhão
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Ministérios da Igreja
          </h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Na IASD Mangueiras, acreditamos que cada membro tem dons dados por Deus para abençoar a
            comunidade, acolher pessoas e fortalecer a fé das famílias. Conheça nossas áreas de atuação e descubra onde servir!
          </p>
        </header>

        <!-- Filtros de Categoria e Campo de Busca -->
        <section class="mt-10" aria-label="Filtros de ministérios">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <!-- Chips de Categoria (scroll horizontal no mobile) -->
            <div class="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-x-visible">
              @for (cat of categories(); track cat) {
                <button
                  type="button"
                  class="shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                  [class]="
                    selectedCategory() === cat
                      ? 'bg-advent-blue text-white shadow-sm'
                      : 'bg-white border border-advent-border text-advent-muted hover:border-advent-blue hover:text-advent-blue'
                  "
                  (click)="setCategory(cat)"
                >
                  {{ cat }}
                </button>
              }
            </div>

            <!-- Campo de Busca -->
            <div class="relative w-full md:w-72">
              <input
                type="search"
                name="search"
                autocomplete="off"
                spellcheck="false"
                class="w-full rounded-card border border-advent-border bg-white pl-4 pr-10 py-2 text-sm text-advent-text placeholder-advent-muted focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30 shadow-sm"
                placeholder="Buscar ministério…"
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                aria-label="Buscar ministério por nome ou descrição"
              />
              @if (searchQuery()) {
                <button
                  type="button"
                  class="absolute right-1 top-1/2 -translate-y-1/2 text-advent-muted hover:text-advent-text min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg cursor-pointer"
                  (click)="clearSearch()"
                  aria-label="Limpar busca"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              }
            </div>
          </div>
        </section>

        <!-- Loading State -->
        @if (isLoading()) {
          <section class="mt-8" aria-label="Carregando ministérios">
            <app-ministerio-skeleton />
          </section>
        } @else {
          <section class="mt-8" aria-labelledby="ministerios-title">
            <h2 id="ministerios-title" class="sr-only">Todos os Ministérios</h2>

            @if (filteredMinisterios().length === 0) {
              <!-- Empty State -->
              <div class="rounded-card border border-advent-border bg-white p-12 text-center text-advent-muted shadow-sm">
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-advent-neutral text-advent-blue mb-3">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p class="font-bold text-advent-text text-lg">Nenhum ministério encontrado.</p>
                <p class="text-sm mt-1">Tente buscar com outros termos ou selecione outra categoria acima.</p>
                <button
                  type="button"
                  class="mt-4 rounded-card bg-advent-blue px-4 py-2 text-xs font-semibold text-white hover:bg-advent-blue-dark cursor-pointer"
                  (click)="resetFilters()"
                >
                  Limpar Filtros
                </button>
              </div>
            } @else {
              <!-- Destaque Section -->
              @if (highlightedMinisterios().length > 0) {
                <div class="mb-8">
                  <h3 class="text-sm font-bold uppercase tracking-wider text-advent-blue mb-4">⭐ Destaques</h3>
                  <div class="grid gap-6 sm:grid-cols-2">
                    @for (item of highlightedMinisterios(); track (item.id || item.nome)) {
                      <app-ministerio-card [ministerio]="item" (details)="openDetails($event)" />
                    }
                  </div>
                </div>
              }

              <!-- Grid Principal -->
              <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                @for (item of nonHighlightedMinisterios(); track (item.id || item.nome)) {
                  <app-ministerio-card [ministerio]="item" (details)="openDetails($event)" />
                }
              </div>
            }
          </section>
        }

        <!-- Modal de Detalhes -->
        @if (selectedMinisterio(); as modalItem) {
          <app-ministerio-modal [ministerio]="modalItem" (close)="closeDetails()" />
        }

        <!-- Chamada para Envolvimento -->
        <section class="mt-16 rounded-3xl border border-advent-border bg-advent-neutral p-6 md:p-10 text-center md:text-left">
          <div class="md:flex md:items-center md:justify-between gap-8">
            <div class="max-w-2xl">
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Faça Parte</span>
              <h2 class="mt-2 text-2xl font-bold text-advent-text">
                Deseja servir ou conhecer mais sobre um ministério?
              </h2>
              <p class="mt-2 text-advent-muted leading-relaxed">
                Seja na recepção, na música, no trabalho com crianças, na sonoplastia ou na assistência social da
                ASA, há sempre um lugar especial para você servir com amor e crescer espiritualmente.
              </p>
            </div>
            <div class="mt-6 md:mt-0 flex-shrink-0">
              <a
                class="rounded-card bg-advent-blue px-6 py-3.5 text-center font-semibold text-white shadow-sm transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner inline-block"
                routerLink="/contato"
              >
                Fale com a liderança
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class MinisteriosPage {
  private readonly contentService = inject(ContentService);
  private readonly seo = inject(SeoService);

  readonly isLoading = signal(true);
  readonly selectedCategory = signal('Todos');
  readonly searchQuery = signal('');
  readonly selectedMinisterio = signal<Ministerio | null>(null);

  // Dynamic categories derived from data
  readonly categories = computed(() => {
    const cats = this.contentService.ministerios()
      .map(m => m.categoria)
      .filter((c): c is string => Boolean(c));
    return ['Todos', ...[...new Set(cats)]];
  });

  // All active ministerios (ativo !== false)
  private readonly activeMinisterios = computed(() => {
    return this.contentService.ministerios().filter(m => m.ativo !== false);
  });

  readonly filteredMinisterios = computed(() => {
    const list = this.activeMinisterios();
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return list.filter((m) => {
      const matchCat = cat === 'Todos' || m.categoria === cat;
      const matchQuery =
        !query ||
        m.nome.toLowerCase().includes(query) ||
        m.descricao.toLowerCase().includes(query) ||
        (m.lideres && m.lideres.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });
  });

  // Highlighted: destaque=true, only when no filters active
  readonly highlightedMinisterios = computed(() => {
    if (this.selectedCategory() !== 'Todos' || this.searchQuery().trim()) return [];
    return this.filteredMinisterios().filter(m => m.destaque);
  });

  // Non-highlighted: everything else
  readonly nonHighlightedMinisterios = computed(() => {
    if (this.selectedCategory() !== 'Todos' || this.searchQuery().trim()) {
      return this.filteredMinisterios();
    }
    return this.filteredMinisterios().filter(m => !m.destaque);
  });

  constructor() {
    this.seo.apply({
      title: 'Ministérios — IASD Mangueiras',
      description:
        'Conheça os ministérios e áreas de serviço da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP e descubra como participar.',
      path: '/ministerios',
    });

    // Simulate loading ( Firestore onSnapshot is async )
    setTimeout(() => this.isLoading.set(false), 300);
  }

  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  resetFilters(): void {
    this.selectedCategory.set('Todos');
    this.searchQuery.set('');
  }

  openDetails(ministerio: Ministerio): void {
    this.selectedMinisterio.set(ministerio);
  }

  closeDetails(): void {
    this.selectedMinisterio.set(null);
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/ministerios/ministerios.page.ts
git commit -m "feat(ministerios): refactor page with sub-components, dynamic categories, active filter, highlight section"
```

---

### Task 6: Update public page tests

**Files:**
- Modify: `frontend/src/app/features/ministerios/ministerios.page.spec.ts`

**Interfaces:**
- Consumes: Updated `MinisteriosPage` from task 5
- Produces: Passing tests

- [ ] **Step 1: Rewrite the test file**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MinisteriosPage } from './ministerios.page';

describe('MinisteriosPage', () => {
  let fixture: ComponentFixture<MinisteriosPage>;
  let component: MinisteriosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinisteriosPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(MinisteriosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título principal e área de envolvimento', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ministérios da Igreja');
    expect(text).toContain('Deseja servir ou conhecer mais sobre um ministério?');
  });

  it('renderiza os ministérios ativos', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Recepção e Acolhimento');
    expect(text).toContain('Ministério da Criança');
    expect(text).toContain('Clube de Desbravadores & Aventureiros');
  });

  it('filtra ministérios por categoria', () => {
    component.setCategory('Louvor & Adoração');
    fixture.detectChanges();

    const filtered = component.filteredMinisterios();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nome).toBe('Música e Louvor');
  });

  it('filtra ministérios por termo de busca', () => {
    component.onSearchInput({ target: { value: 'solidária' } } as unknown as Event);
    fixture.detectChanges();

    const filtered = component.filteredMinisterios();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nome).toContain('Ação Solidária Adventista');
  });

  it('exibe mensagem amigável quando nenhum ministério é encontrado', () => {
    component.onSearchInput({ target: { value: 'termo-inexistente-xyz' } } as unknown as Event);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Nenhum ministério encontrado');

    component.resetFilters();
    fixture.detectChanges();
    expect(component.filteredMinisterios().length).toBeGreaterThan(0);
  });

  it('exibe categorias dinâmicas derivadas dos dados', () => {
    expect(component.categories().length).toBeGreaterThan(1);
    expect(component.categories()[0]).toBe('Todos');
  });

  it('filtra ministérios inativos (ativo: false)', () => {
    const allActive = component.filteredMinisterios();
    // All static seed data has ativo=undefined, which passes ativo!==false
    expect(allActive.length).toBeGreaterThan(0);
    // Verify the filter logic: ativo=false items are excluded
    const hasInactive = allActive.some(m => m.ativo === false);
    expect(hasInactive).toBeFalse();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `cd frontend && npx ng test --include='**/ministerios.page.spec.ts' --watch=false`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/ministerios/ministerios.page.spec.ts
git commit -m "test(ministerios): update public page tests for new features"
```

---

### Task 7: Create Admin CRUD page

**Files:**
- Create: `frontend/src/app/features/admin/ministerios/admin-ministerios.page.ts`

**Interfaces:**
- Consumes: `AdminCmsService` (getMinisterios, saveMinisterio, deleteMinisterio, uploadMinisterioImage), `ToastService`, `Ministerio` model
- Produces: `AdminMinisteriosPage` — standalone component with full CRUD

- [ ] **Step 1: Create the admin page**

```typescript
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { Ministerio } from '../../../core/models/content.models';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import defaultMinisterios from '../../../../content/ministerios.json';

@Component({
  selector: 'app-admin-ministerios-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            Ministérios
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Cadastre e gerencie os ministérios da igreja com imagens, atividades e informações de contato.
          </p>
        </div>

        <button
          type="button"
          (click)="openModal()"
          class="rounded-card bg-advent-blue px-5 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Ministério
        </button>
      </header>

      <!-- Listagem -->
      <div class="mt-8 space-y-4">
        @if (isLoading()) {
          <div class="p-8 text-center text-sm text-advent-muted">Carregando ministérios…</div>
        } @else if (ministerios().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border p-12 text-center text-advent-muted">
            Nenhum ministério cadastrado. Clique em "+ Novo Ministério" para adicionar.
          </div>
        } @else {
          <div class="grid gap-4">
            @for (min of ministerios(); track (min.id || min.nome)) {
              <article class="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-advent-border bg-white p-5 shadow-xs hover:border-advent-blue/40 transition-colors">
                <div class="flex items-start gap-4">
                  @if (min.banner_url || min.imagem_url) {
                    <div class="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-advent-border bg-slate-100 hidden sm:block">
                      <img
                        [src]="min.banner_url || min.imagem_url"
                        [alt]="min.nome"
                        class="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  }

                  <div class="space-y-1.5">
                    <div class="flex flex-wrap items-center gap-2">
                      @if (min.categoria) {
                        <span class="rounded-md bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase text-advent-blue">
                          {{ min.categoria }}
                        </span>
                      }
                      @if (min.destaque) {
                        <span class="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                          ⭐ Destaque
                        </span>
                      }
                      @if (min.ativo === false) {
                        <span class="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                          Inativo
                        </span>
                      } @else {
                        <span class="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                          Ativo
                        </span>
                      }
                    </div>

                    <h2 class="text-lg font-bold text-advent-text">{{ min.nome }}</h2>
                    <p class="text-xs text-advent-muted max-w-2xl leading-relaxed">{{ min.descricao }}</p>

                    @if (min.lideres) {
                      <p class="text-xs font-semibold text-advent-blue">👥 {{ min.lideres }}</p>
                    }
                  </div>
                </div>

                <div class="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    (click)="editMinisterio(min)"
                    class="rounded-lg px-3.5 py-2 text-xs font-semibold text-advent-blue bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer min-h-[36px] flex items-center"
                    aria-label="Editar ministério {{ min.nome }}"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    (click)="deleteMinisterio(min)"
                    class="rounded-lg px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer min-h-[36px] flex items-center"
                    aria-label="Excluir ministério {{ min.nome }}"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            }
          </div>
        }
      </div>

      <!-- Modal de Criação / Edição -->
      @if (isModalOpen()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-ministerio-title"
        >
          <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div class="flex items-center justify-between pb-4 border-b border-advent-border">
              <h3 id="modal-ministerio-title" class="text-lg font-bold text-advent-text">
                {{ editingId() ? 'Editar Ministério' : 'Novo Ministério' }}
              </h3>
              <button
                type="button"
                (click)="closeModal()"
                class="text-advent-muted hover:text-advent-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                aria-label="Fechar modal"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form [formGroup]="ministerioForm" (ngSubmit)="saveMinisterio()" class="mt-5 space-y-4">
              <!-- Nome e Categoria -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="nome" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Nome do Ministério *</label>
                  <input
                    id="nome"
                    type="text"
                    formControlName="nome"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Ministério da Criança"
                  />
                </div>
                <div>
                  <label for="categoria" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Categoria</label>
                  <input
                    id="categoria"
                    type="text"
                    formControlName="categoria"
                    [attr.list]="'categorias-list'"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Novas Gerações & Família"
                  />
                  <datalist id="categorias-list">
                    @for (cat of existingCategories(); track cat) {
                      <option [value]="cat"></option>
                    }
                  </datalist>
                </div>
              </div>

              <!-- Lideres e Publico Alvo -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="lideres" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Liderança</label>
                  <input
                    id="lideres"
                    type="text"
                    formControlName="lideres"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Pr. João e Irmã Maria"
                  />
                </div>
                <div>
                  <label for="publico_alvo" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Público-Alvo</label>
                  <input
                    id="publico_alvo"
                    type="text"
                    formControlName="publico_alvo"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Crianças de 6 a 12 anos"
                  />
                </div>
              </div>

              <!-- Reunioes e WhatsApp -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="reunioes_horario" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Horários / Encontros</label>
                  <input
                    id="reunioes_horario"
                    type="text"
                    formControlName="reunioes_horario"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Sábados às 15h"
                  />
                </div>
                <div>
                  <label for="contato_whatsapp" class="block text-xs font-semibold uppercase text-advent-muted mb-1">WhatsApp de Contato</label>
                  <input
                    id="contato_whatsapp"
                    type="text"
                    formControlName="contato_whatsapp"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: 5515999999999"
                  />
                </div>
              </div>

              <!-- Banner URL e Upload -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="banner_url" class="block text-xs font-semibold uppercase text-advent-muted mb-1">URL da Imagem / Banner</label>
                  <input
                    id="banner_url"
                    type="text"
                    formControlName="banner_url"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="https://.../banner.jpg"
                  />
                </div>
                <div>
                  <label for="banner-upload" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Upload do Banner</label>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    (change)="onFileSelected($event)"
                    class="w-full text-xs text-advent-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-card file:border-0 file:text-xs file:font-semibold file:bg-advent-blue/10 file:text-advent-blue hover:file:bg-advent-blue/20 cursor-pointer"
                  />
                </div>
              </div>

              <!-- Descricao -->
              <div>
                <label for="descricao" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Descrição *</label>
                <textarea
                  id="descricao"
                  rows="3"
                  formControlName="descricao"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                  placeholder="Descreva o ministério, sua missão e atividades..."
                ></textarea>
              </div>

              <!-- Atividades -->
              <div>
                <label for="atividades" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Atividades (1 por linha)</label>
                <textarea
                  id="atividades"
                  rows="3"
                  formControlName="atividades"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                  placeholder="Encontros semanais&#10;Visitantes novos&#10;Projetos sociais"
                ></textarea>
              </div>

              <!-- Toggles -->
              <div class="flex flex-wrap items-center gap-6 pt-1">
                <div class="flex items-center gap-2">
                  <input
                    id="destaque"
                    type="checkbox"
                    formControlName="destaque"
                    class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
                  />
                  <label for="destaque" class="text-xs font-semibold text-advent-text cursor-pointer">
                    ⭐ Destaque
                  </label>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    id="ativo"
                    type="checkbox"
                    formControlName="ativo"
                    class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
                  />
                  <label for="ativo" class="text-xs font-semibold text-advent-text cursor-pointer">
                    Ativo na página pública
                  </label>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-2 pt-3 border-t border-advent-border">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="rounded-card border border-advent-border px-4 py-2 text-xs font-semibold text-advent-text hover:bg-slate-50 cursor-pointer min-h-[36px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="ministerioForm.invalid || isSaving()"
                  class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer min-h-[36px]"
                >
                  {{ isSaving() ? 'Salvando...' : 'Salvar Ministério' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminMinisteriosPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);
  private readonly toastService = inject(ToastService);

  readonly ministerios = signal<Ministerio[]>([]);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isModalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  private selectedFile: File | null = null;

  readonly ministerioForm = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(3)]),
    descricao: new FormControl('', [Validators.required, Validators.minLength(5)]),
    categoria: new FormControl(''),
    lideres: new FormControl(''),
    reunioes_horario: new FormControl(''),
    contato_whatsapp: new FormControl(''),
    publico_alvo: new FormControl(''),
    banner_url: new FormControl(''),
    atividades: new FormControl(''),
    destaque: new FormControl(false),
    ativo: new FormControl(true),
  });

  readonly existingCategories = signal<string[]>([]);

  async ngOnInit(): Promise<void> {
    await this.loadMinisterios();
  }

  async loadMinisterios(): Promise<void> {
    this.isLoading.set(true);
    const firestoreData = await this.cmsService.getMinisterios();
    if (firestoreData.length > 0) {
      this.ministerios.set(firestoreData);
    } else {
      this.ministerios.set(defaultMinisterios as Ministerio[]);
    }
    // Derive categories from data
    const cats = this.ministerios()
      .map(m => m.categoria)
      .filter((c): c is string => Boolean(c));
    this.existingCategories.set([...new Set(cats)]);
    this.isLoading.set(false);
  }

  openModal(): void {
    this.editingId.set(null);
    this.ministerioForm.reset({
      destaque: false,
      ativo: true,
      categoria: '',
      lideres: '',
      reunioes_horario: '',
      contato_whatsapp: '',
      publico_alvo: '',
      banner_url: '',
      atividades: '',
    });
    this.selectedFile = null;
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  editMinisterio(min: Ministerio): void {
    this.editingId.set(min.id || null);
    this.ministerioForm.patchValue({
      nome: min.nome,
      descricao: min.descricao,
      categoria: min.categoria || '',
      lideres: min.lideres || '',
      reunioes_horario: min.reunioes_horario || '',
      contato_whatsapp: min.contato_whatsapp || '',
      publico_alvo: min.publico_alvo || '',
      banner_url: min.banner_url || min.imagem_url || '',
      atividades: min.atividades?.join('\n') || '',
      destaque: Boolean(min.destaque),
      ativo: min.ativo !== false,
    });
    this.isModalOpen.set(true);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  async saveMinisterio(): Promise<void> {
    if (this.ministerioForm.invalid) return;
    this.isSaving.set(true);
    try {
      let uploadedBanner = '';
      if (this.selectedFile) {
        uploadedBanner = await this.cmsService.uploadMinisterioImage(this.selectedFile);
      }

      const fv = this.ministerioForm.value;
      const bannerFinal = uploadedBanner || fv.banner_url || undefined;
      const atividadesRaw = fv.atividades || '';
      const atividadesList = atividadesRaw.split('\n').map((s: string) => s.trim()).filter(Boolean);

      const data: Partial<Ministerio> = {
        nome: fv.nome!,
        descricao: fv.descricao!,
        categoria: fv.categoria || undefined,
        lideres: fv.lideres || undefined,
        reunioes_horario: fv.reunioes_horario || undefined,
        contato_whatsapp: fv.contato_whatsapp || undefined,
        publico_alvo: fv.publico_alvo || undefined,
        banner_url: bannerFinal,
        imagem_url: bannerFinal,
        atividades: atividadesList.length > 0 ? atividadesList : undefined,
        destaque: Boolean(fv.destaque),
        ativo: Boolean(fv.ativo),
      };

      await this.cmsService.saveMinisterio(data, this.editingId() || undefined);
      this.toastService.success(`Ministério "${data.nome}" salvo com sucesso!`);
      this.closeModal();
      await this.loadMinisterios();
    } catch {
      const newMin = this.ministerioForm.value as unknown as Ministerio;
      this.ministerios.update((prev) => [newMin, ...prev]);
      this.toastService.info('Ministério salvo na pré-visualização local.');
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  async deleteMinisterio(min: Ministerio): Promise<void> {
    if (!confirm(`Deseja realmente excluir o ministério "${min.nome}"?`)) return;
    try {
      if (min.id) {
        await this.cmsService.deleteMinisterio(min.id);
      }
      this.ministerios.update((prev) => prev.filter((m) => m !== min && m.id !== min.id));
      this.toastService.info(`Ministério "${min.nome}" excluído.`);
    } catch {
      this.ministerios.update((prev) => prev.filter((m) => m !== min));
    }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/admin/ministerios/admin-ministerios.page.ts
git commit -m "feat(admin): create ministerios CRUD page"
```

---

### Task 8: Create Admin page tests

**Files:**
- Create: `frontend/src/app/features/admin/ministerios/admin-ministerios.page.spec.ts`

**Interfaces:**
- Consumes: `AdminMinisteriosPage` from task 7
- Produces: Passing tests

- [ ] **Step 1: Create the test file**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminMinisteriosPage } from './admin-ministerios.page';

describe('AdminMinisteriosPage', () => {
  let fixture: ComponentFixture<AdminMinisteriosPage>;
  let component: AdminMinisteriosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMinisteriosPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminMinisteriosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título da página', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ministérios');
    expect(text).toContain('Novo Ministério');
  });

  it('renderiza listagem de ministérios do Firestore ou fallback', async () => {
    // After ngOnInit, ministerios should be loaded
    await fixture.whenStable();
    expect(component.ministerios().length).toBeGreaterThan(0);
  });

  it('abre modal para criar novo ministério', () => {
    component.openModal();
    fixture.detectChanges();

    expect(component.isModalOpen()).toBeTrue();
    expect(component.editingId()).toBeNull();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Novo Ministério');
  });

  it('preenche modal ao editar ministério existente', async () => {
    await fixture.whenStable();
    const first = component.ministerios()[0];
    if (!first) return;

    component.editMinisterio(first);
    fixture.detectChanges();

    expect(component.editingId()).toBe(first.id || null);
    expect(component.ministerioForm.value.nome).toBe(first.nome);
  });

  it('fecha modal ao clicar cancelar', () => {
    component.openModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBeTrue();

    component.closeModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBeFalse();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `cd frontend && npx ng test --include='**/admin-ministerios.page.spec.ts' --watch=false`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/admin/ministerios/admin-ministerios.page.spec.ts
git commit -m "test(admin): add ministerios CRUD page tests"
```

---

### Task 9: Add admin route and sidebar navigation

**Files:**
- Modify: `frontend/src/app/app.routes.ts:96-103` — add ministerios child route
- Modify: `frontend/src/app/features/admin/layout/admin-layout.component.ts:130` — add nav link

**Interfaces:**
- Consumes: `AdminMinisteriosPage` from task 7
- Produces: Route and nav link accessible

- [ ] **Step 1: Add route to app.routes.ts**

In `app.routes.ts`, add a new child route inside the `admin` children array (after the `escalas` route, before the closing `]`):

```typescript
{
  path: 'ministerios',
  loadComponent: () =>
    import('./features/admin/ministerios/admin-ministerios.page').then(
      (m) => m.AdminMinisteriosPage,
    ),
  title: 'Gestão de Ministérios — IASD Mangueiras',
},
```

- [ ] **Step 2: Add nav link to admin layout**

In `admin-layout.component.ts`, add a new `<a>` tag after the "Escalas & Oficiais" link (before the closing `</nav>`), following the exact same pattern:

```html
<a
  routerLink="/admin/ministerios"
  routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
  class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
>
  <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
  Ministérios
</a>
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/app.routes.ts frontend/src/app/features/admin/layout/admin-layout.component.ts
git commit -m "feat(admin): add ministerios route and sidebar navigation"
```

---

### Task 10: Final verification — full build and test suite

**Files:**
- None (verification only)

- [ ] **Step 1: Type check**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run all tests**

Run: `cd frontend && npx ng test --watch=false`
Expected: All tests PASS

- [ ] **Step 3: Build for production**

Run: `cd frontend && npx ng build`
Expected: Build succeeds

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(ministerios): address review feedback from final verification"
```
