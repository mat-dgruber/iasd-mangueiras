import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-ministerios-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" href="/">Início</a>
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
            Na IASD Mangueiras, acreditamos que cada membro tem dons dados por Deus para abençoar a comunidade, acolher pessoas e fortalecer a fé das famílias.
          </p>
        </header>

        <!-- Filtros de Categoria e Campo de Busca -->
        <section class="mt-10" aria-label="Filtros de ministérios">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <!-- Chips de Categoria -->
            <div class="flex flex-wrap gap-2">
              @for (cat of categories; track cat) {
                <button
                  type="button"
                  class="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  [class]="selectedCategory() === cat
                    ? 'bg-advent-blue text-white shadow-sm'
                    : 'bg-white border border-advent-border text-advent-muted hover:border-advent-blue hover:text-advent-blue'"
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
                class="w-full rounded-card border border-advent-border bg-white px-4 py-2 text-sm text-advent-text placeholder-advent-muted focus:border-advent-blue focus:outline-none focus:ring-1 focus:ring-advent-blue shadow-sm"
                placeholder="Buscar ministério..."
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                aria-label="Buscar ministério por nome ou descrição"
              />
              @if (searchQuery()) {
                <button
                  type="button"
                  class="absolute right-3 top-2.5 text-xs text-advent-muted hover:text-advent-text"
                  (click)="clearSearch()"
                  aria-label="Limpar busca"
                >
                  ✕
                </button>
              }
            </div>
          </div>
        </section>

        <!-- Lista de Ministérios Filtrados -->
        <section class="mt-8" aria-labelledby="ministerios-title">
          <h2 id="ministerios-title" class="sr-only">Todos os Ministérios</h2>
          @if (filteredMinisterios().length === 0) {
            <div class="rounded-card border border-advent-border bg-white p-12 text-center text-advent-muted shadow-sm">
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-advent-neutral text-advent-blue text-xl mb-3">
                🔍
              </div>
              <p class="font-bold text-advent-text text-lg">Nenhum ministério encontrado.</p>
              <p class="text-sm mt-1">
                Tente buscar com outros termos ou selecione outra categoria acima.
              </p>
              <button
                type="button"
                class="mt-4 rounded-card bg-advent-blue px-4 py-2 text-xs font-semibold text-white hover:bg-advent-blue-dark"
                (click)="resetFilters()"
              >
                Limpar Filtros
              </button>
            </div>
          } @else {
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              @for (item of filteredMinisterios(); track item.nome) {
                <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div>
                    @if (item.categoria) {
                      <span class="inline-block rounded bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue mb-3">
                        {{ item.categoria }}
                      </span>
                    }
                    <h3 class="text-xl font-bold text-advent-text">{{ item.nome }}</h3>
                    <p class="mt-3 text-sm text-advent-muted leading-relaxed">
                      {{ item.descricao }}
                    </p>
                  </div>
                  <div class="mt-6 pt-4 border-t border-advent-border">
                    <a class="text-xs font-semibold text-advent-blue hover:underline" href="/contato">
                      Saber mais / Servir →
                    </a>
                  </div>
                </article>
              }
            </div>
          }
        </section>

        <!-- Chamada para Envolvimento -->
        <section class="mt-16 rounded-section border border-advent-border bg-advent-neutral p-6 md:p-10 text-center md:text-left">
          <div class="md:flex md:items-center md:justify-between gap-8">
            <div class="max-w-2xl">
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Faça Parte</span>
              <h2 class="mt-2 text-2xl font-bold text-advent-text">
                Deseja servir ou conhecer mais sobre um ministério?
              </h2>
              <p class="mt-2 text-advent-muted leading-relaxed">
                Seja na recepção, na música, no trabalho com crianças ou na assistência social da ASA, há sempre um lugar para você servir e crescer.
              </p>
            </div>
            <div class="mt-6 md:mt-0 flex-shrink-0">
              <a
                class="rounded-card bg-advent-blue px-6 py-3.5 text-center font-semibold text-white shadow-sm transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner inline-block"
                href="/contato"
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

  protected readonly categories = [
    'Todos',
    'Novas Gerações & Família',
    'Louvor & Adoração',
    'Ação Social & Comunidade',
    'Comunicação & Acolhimento',
  ] as const;

  readonly selectedCategory = signal<string>('Todos');
  readonly searchQuery = signal<string>('');

  protected readonly allMinisterios = () => this.contentService.ministerios();

  readonly filteredMinisterios = computed(() => {
    const list = this.allMinisterios();
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return list.filter((m) => {
      const matchCat = cat === 'Todos' || m.categoria === cat;
      const matchQuery =
        !query ||
        m.nome.toLowerCase().includes(query) ||
        m.descricao.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  });


  constructor() {
    this.seo.apply({
      title: 'Ministérios — IASD Mangueiras',
      description:
        'Conheça os ministérios e áreas de serviço da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP e descubra como participar.',
      path: '/ministerios',
    });
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
}

