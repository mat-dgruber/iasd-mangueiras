import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { Ministerio } from '../../core/models/content.models';
import { MinisterioSkeletonComponent } from './ministerio-skeleton.component';
import { MinisterioCardComponent } from './ministerio-card.component';
import { MinisterioModalComponent } from './ministerio-modal.component';

@Component({
  selector: 'app-ministerios-page',
  standalone: true,
  imports: [RouterLink, MinisterioSkeletonComponent, MinisterioCardComponent, MinisterioModalComponent],
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
          <span
            class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
          >
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
            <!-- Chips de Categoria -->
            <div class="flex overflow-x-auto pb-1 gap-2">
              @for (cat of categories(); track cat) {
                <button
                  type="button"
                  class="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
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
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              }
            </div>
          </div>
        </section>

        <!-- Lista de Ministérios Filtrados -->
        <section class="mt-8" aria-labelledby="ministerios-title">
          <h2 id="ministerios-title" class="sr-only">Todos os Ministérios</h2>

          @if (isLoading()) {
            <app-ministerio-skeleton />
          } @else if (filteredMinisterios().length === 0) {
            <div
              class="rounded-card border border-advent-border bg-white p-12 text-center text-advent-muted shadow-sm"
            >
              <div
                class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-advent-neutral text-advent-blue mb-3"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <p class="font-bold text-advent-text text-lg">Nenhum ministério encontrado.</p>
              <p class="text-sm mt-1">
                Tente buscar com outros termos ou selecione outra categoria acima.
              </p>
              <button
                type="button"
                class="mt-4 rounded-card bg-advent-blue px-4 py-2 text-xs font-semibold text-white hover:bg-advent-blue-dark cursor-pointer"
                (click)="resetFilters()"
              >
                Limpar Filtros
              </button>
            </div>
          } @else {
            <!-- Destaques -->
            @if (highlightedMinisterios().length > 0) {
              <div class="mb-8">
                <h3 class="text-xs font-bold uppercase tracking-wider text-advent-blue mb-4">Destaques</h3>
                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  @for (item of highlightedMinisterios(); track (item.id || item.nome)) {
                    <app-ministerio-card [ministerio]="item" (details)="openDetails($event)" />
                  }
                </div>
              </div>
            }

            <!-- Todos (ou filtrados sem destaques) -->
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              @for (item of nonHighlightedMinisterios(); track (item.id || item.nome)) {
                <app-ministerio-card [ministerio]="item" (details)="openDetails($event)" />
              }
            </div>
          }
        </section>

        <!-- Modal de Detalhes do Ministério -->
        @if (selectedMinisterio(); as modalItem) {
          <app-ministerio-modal [ministerio]="modalItem" (close)="closeDetails()" />
        }

        <!-- Chamada para Envolvimento -->
        <section
          class="mt-16 rounded-3xl border border-advent-border bg-advent-neutral p-6 md:p-10 text-center md:text-left"
        >
          <div class="md:flex md:items-center md:justify-between gap-8">
            <div class="max-w-2xl">
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
                >Faça Parte</span
              >
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

  readonly selectedCategory = signal<string>('Todos');
  readonly searchQuery = signal<string>('');
  readonly selectedMinisterio = signal<Ministerio | null>(null);
  readonly isLoading = signal<boolean>(true);

  /** Categorias derivadas dinamicamente dos dados */
  readonly categories = computed(() => {
    const cats = this.activeMinisterios()
      .map(m => m.categoria)
      .filter((c): c is string => !!c);
    return ['Todos', ...new Set(cats)];
  });

  /** Apenas ministérios ativos (ativo !== false) */
  protected readonly activeMinisterios = computed(() =>
    this.contentService.ministerios().filter(m => m.ativo !== false),
  );

  /** Ministérios filtrados por categoria e busca */
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

  /** Destaques: só quando category='Todos' e sem busca */
  readonly highlightedMinisterios = computed(() => {
    if (this.selectedCategory() !== 'Todos' || this.searchQuery().trim()) return [];
    return this.filteredMinisterios().filter(m => m.destaque);
  });

  /** Restante: não-destaque quando há destaques, senão todos os filtrados */
  readonly nonHighlightedMinisterios = computed(() => {
    const highlighted = this.highlightedMinisterios();
    if (!highlighted.length) return this.filteredMinisterios();
    const ids = new Set(highlighted.map(m => m.id ?? m.nome));
    return this.filteredMinisterios().filter(m => !ids.has(m.id ?? m.nome));
  });

  constructor() {
    this.seo.apply({
      title: 'Ministérios — IASD Mangueiras',
      description:
        'Conheça os ministérios e áreas de serviço da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP e descubra como participar.',
      path: '/ministerios',
    });

    // ponytail: simula carregamento async do Firestore; substituir por signal real quando ContentService expor loading
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
