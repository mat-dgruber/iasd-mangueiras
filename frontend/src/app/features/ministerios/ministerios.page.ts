import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { Ministerio } from '../../core/models/content.models';

@Component({
  selector: 'app-ministerios-page',
  standalone: true,
  imports: [RouterLink],
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
            <div class="flex flex-wrap gap-2">
              @for (cat of categories; track cat) {
                <button
                  type="button"
                  class="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
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
          @if (filteredMinisterios().length === 0) {
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
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              @for (item of filteredMinisterios(); track (item.id || item.nome)) {
                <article
                  class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    <!-- Imagem ou Header Visual do Ministério -->
                    @if (item.banner_url || item.imagem_url) {
                      <div class="aspect-video w-full overflow-hidden bg-gray-100 border-b border-advent-border">
                        <img
                          [src]="item.banner_url || item.imagem_url"
                          [alt]="item.nome"
                          class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    } @else {
                      <div class="h-3 bg-linear-to-r from-advent-blue via-blue-400 to-advent-gold/70"></div>
                    }

                    <div class="p-6">
                      <div class="flex flex-wrap items-center gap-2 mb-3">
                        @if (item.categoria) {
                          <span
                            class="inline-block rounded-md bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue"
                          >
                            {{ item.categoria }}
                          </span>
                        }

                        @if (item.destaque) {
                          <span class="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                            ⭐ Destaque
                          </span>
                        }
                      </div>

                      <h3 class="text-xl font-bold text-advent-text leading-snug">{{ item.nome }}</h3>
                      
                      <p class="mt-2.5 text-sm text-advent-muted leading-relaxed">
                        {{ item.descricao }}
                      </p>

                      <!-- Metadados Adicionais -->
                      <div class="mt-4 space-y-2 border-t border-advent-border/60 pt-3 text-xs text-advent-text">
                        @if (item.lideres) {
                          <p class="flex items-center gap-1.5 font-medium">
                            <span class="text-advent-muted">👥 Liderança:</span>
                            <span class="font-semibold text-advent-blue">{{ item.lideres }}</span>
                          </p>
                        }

                        @if (item.publico_alvo) {
                          <p class="flex items-center gap-1.5 font-medium">
                            <span class="text-advent-muted">🎯 Público:</span>
                            <span>{{ item.publico_alvo }}</span>
                          </p>
                        }

                        @if (item.reunioes_horario) {
                          <p class="flex items-start gap-1.5 font-medium">
                            <span class="text-advent-muted shrink-0">⏰ Encontros:</span>
                            <span>{{ item.reunioes_horario }}</span>
                          </p>
                        }

                        @if (item.atividades && item.atividades.length > 0) {
                          <div class="pt-2">
                            <span class="text-advent-muted font-semibold block mb-1">Principais Atividades:</span>
                            <ul class="list-disc list-inside space-y-0.5 text-advent-muted text-[11px]">
                              @for (ativ of item.atividades.slice(0, 3); track ativ) {
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
                      (click)="openDetails(item)"
                      class="text-xs font-semibold text-advent-blue hover:underline cursor-pointer"
                    >
                      Ver detalhes completos →
                    </button>

                    <a
                      class="rounded-lg bg-advent-blue/10 hover:bg-advent-blue hover:text-white text-advent-blue px-3 py-1.5 text-xs font-bold transition-colors"
                      routerLink="/contato"
                    >
                      Quero Servir
                    </a>
                  </div>
                </article>
              }
            </div>
          }
        </section>

        <!-- Modal de Detalhes do Ministério -->
        @if (selectedMinisterio(); as modalItem) {
          <div
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-ministerio-title"
          >
            <div class="w-full max-w-xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div class="flex items-center justify-between pb-4 border-b border-advent-border">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">
                    {{ modalItem.categoria }}
                  </span>
                  <h3 id="modal-ministerio-title" class="text-2xl font-bold text-advent-text mt-0.5">
                    {{ modalItem.nome }}
                  </h3>
                </div>
                <button
                  type="button"
                  (click)="closeDetails()"
                  class="text-advent-muted hover:text-advent-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                  aria-label="Fechar modal"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              @if (modalItem.banner_url || modalItem.imagem_url) {
                <div class="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-advent-border shadow-xs bg-slate-100">
                  <img
                    [src]="modalItem.banner_url || modalItem.imagem_url"
                    [alt]="modalItem.nome"
                    class="h-full w-full object-cover"
                  />
                </div>
              }

              <div class="mt-5 space-y-4">
                <div>
                  <h4 class="text-xs font-bold uppercase tracking-wider text-advent-muted mb-1">Sobre o Ministério</h4>
                  <p class="text-sm text-advent-text leading-relaxed">{{ modalItem.descricao }}</p>
                </div>

                <div class="grid gap-3 sm:grid-cols-2 bg-advent-neutral p-4 rounded-2xl border border-advent-border">
                  @if (modalItem.lideres) {
                    <div>
                      <span class="text-xs font-bold text-advent-muted block">Liderança Responsável</span>
                      <span class="text-sm font-semibold text-advent-blue">{{ modalItem.lideres }}</span>
                    </div>
                  }
                  @if (modalItem.publico_alvo) {
                    <div>
                      <span class="text-xs font-bold text-advent-muted block">Público-Alvo</span>
                      <span class="text-sm text-advent-text">{{ modalItem.publico_alvo }}</span>
                    </div>
                  }
                  @if (modalItem.reunioes_horario) {
                    <div class="sm:col-span-2">
                      <span class="text-xs font-bold text-advent-muted block">Horários e Encontros</span>
                      <span class="text-sm text-advent-text">{{ modalItem.reunioes_horario }}</span>
                    </div>
                  }
                </div>

                @if (modalItem.atividades && modalItem.atividades.length > 0) {
                  <div>
                    <h4 class="text-xs font-bold uppercase tracking-wider text-advent-muted mb-2">Projetos & Atividades</h4>
                    <ul class="space-y-1.5">
                      @for (ativ of modalItem.atividades; track ativ) {
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
                  (click)="closeDetails()"
                  class="w-full sm:w-auto rounded-card border border-advent-border px-5 py-2.5 text-xs font-semibold text-advent-text hover:bg-slate-50 cursor-pointer"
                >
                  Fechar
                </button>
                <a
                  routerLink="/contato"
                  (click)="closeDetails()"
                  class="w-full sm:w-auto rounded-card bg-advent-blue px-6 py-2.5 text-center text-xs font-bold text-white shadow-sm hover:bg-advent-blue-dark active:scale-[0.98]"
                >
                  Entrar em Contato para Servir →
                </a>
              </div>
            </div>
          </div>
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

  protected readonly categories = [
    'Todos',
    'Novas Gerações & Família',
    'Louvor & Adoração',
    'Ação Social & Comunidade',
    'Comunicação & Acolhimento',
  ] as const;

  readonly selectedCategory = signal<string>('Todos');
  readonly searchQuery = signal<string>('');
  readonly selectedMinisterio = signal<Ministerio | null>(null);

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
        m.descricao.toLowerCase().includes(query) ||
        (m.lideres && m.lideres.toLowerCase().includes(query));
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

  openDetails(ministerio: Ministerio): void {
    this.selectedMinisterio.set(ministerio);
  }

  closeDetails(): void {
    this.selectedMinisterio.set(null);
  }
}
