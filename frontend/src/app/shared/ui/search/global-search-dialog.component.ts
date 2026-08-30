import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GlobalSemanticSearchService } from '../../../core/services/global-semantic-search.service';
import { SearchEntityType, SemanticSearchResult } from '../../../core/models/search.models';

@Component({
  selector: 'app-global-search-dialog',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-12 lg:pt-16 bg-slate-900/60 backdrop-blur-md animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        (click)="onBackdropClick($event)"
      >
        <div
          class="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[88vh] animate-modalSlideUp"
          (click)="$event.stopPropagation()"
        >
          <!-- Search Header Input -->
          <div class="relative flex items-center border-b border-slate-100 px-5 py-4 bg-white/90">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-advent-blue shrink-0 mr-3.5 border border-blue-100/80 shadow-2xs">
              <svg
                class="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>

            <div class="relative flex-1 min-w-0">
              <input
                #searchInput
                id="search-modal-title"
                type="search"
                [ngModel]="query()"
                (ngModelChange)="onQueryChange($event)"
                placeholder="Busque por sentimentos, oradores, eventos, PGs ou ministérios..."
                class="w-full text-base sm:text-lg bg-transparent text-advent-text placeholder:text-slate-400 focus:outline-none focus:ring-0 border-0 p-0 font-normal leading-relaxed"
                autocomplete="off"
              />
            </div>

            <div class="flex items-center gap-2 ml-3 shrink-0">
              @if (searchService.isLoading()) {
                <div class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-advent-blue border border-blue-200/60 animate-pulse">
                  <span class="h-1.5 w-1.5 rounded-full bg-advent-blue"></span>
                  <span>IA Ativa</span>
                </div>
              }

              @if (query()) {
                <button
                  type="button"
                  (click)="clearQuery()"
                  class="rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Limpar pesquisa"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              }

              <button
                type="button"
                (click)="close()"
                class="rounded-xl px-2 py-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 min-h-[36px]"
                aria-label="Fechar busca"
              >
                <kbd class="hidden sm:inline-block rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 shadow-2xs">ESC</kbd>
                <svg class="h-4.5 w-4.5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Sugestões Rápidas (Zero-State Prompts) -->
          @if (!query()) {
            <div class="px-5 py-3.5 sm:px-6 bg-gradient-to-r from-blue-50/50 via-slate-50/80 to-amber-50/20 border-b border-slate-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span>✨</span> Sugestões em Linguagem Natural
                </span>
                <span class="text-[10px] text-slate-400 font-medium hidden sm:inline-block">Clique para testar</span>
              </div>
              <div class="flex flex-wrap gap-2">
                @for (prompt of promptSuggestions; track prompt) {
                  <button
                    type="button"
                    (click)="applyPrompt(prompt)"
                    class="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-advent-blue/60 hover:text-advent-blue hover:bg-blue-50/50 hover:shadow-2xs transition-all duration-150 cursor-pointer active:scale-98"
                  >
                    <span>{{ prompt }}</span>
                    <span class="text-slate-300 group-hover:text-advent-blue transition-colors text-[10px]">→</span>
                  </button>
                }
              </div>
            </div>
          }

          <!-- Filtros de Categorias em Chips Minimalistas -->
          <div class="flex items-center gap-1.5 px-5 py-2.5 sm:px-6 bg-slate-50/70 border-b border-slate-100 overflow-x-auto no-scrollbar">
            @for (cat of categories; track cat.id) {
              <button
                type="button"
                (click)="setCategory(cat.id)"
                class="rounded-xl px-3 py-1 text-xs font-bold transition-all duration-150 whitespace-nowrap min-h-[30px] cursor-pointer flex items-center gap-1"
                [class.bg-advent-blue]="selectedCategory() === cat.id"
                [class.text-white]="selectedCategory() === cat.id"
                [class.shadow-xs]="selectedCategory() === cat.id"
                [class.bg-white]="selectedCategory() !== cat.id"
                [class.text-slate-600]="selectedCategory() !== cat.id"
                [class.border]="selectedCategory() !== cat.id"
                [class.border-slate-200]="selectedCategory() !== cat.id"
                [class.hover:border-advent-blue]="selectedCategory() !== cat.id"
              >
                <span>{{ cat.icon }}</span>
                <span>{{ cat.label }}</span>
              </button>
            }
          </div>

          <!-- Lista de Resultados com Transições e Hover Suave -->
          <div class="overflow-y-auto p-3 sm:p-5 space-y-2.5 flex-1 divide-y divide-slate-50">
            @if (results().length === 0) {
              <div class="py-14 text-center text-slate-400">
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-advent-blue mb-3 border border-blue-100 shadow-2xs">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p class="font-bold text-slate-700 text-base">Nenhum resultado para esta consulta</p>
                <p class="text-xs sm:text-sm mt-1 max-w-sm mx-auto text-slate-500 leading-relaxed">
                  Tente reformular sua busca usando termos bíblicos, sentimentos ou nomes de departamentos.
                </p>
              </div>
            } @else {
              @for (item of results(); track item.id; let idx = $index) {
                <div
                  (click)="navigate(item.url)"
                  (keydown.enter)="navigate(item.url)"
                  tabindex="0"
                  class="group relative flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl transition-all duration-150 cursor-pointer border border-transparent hover:border-advent-blue/20 hover:bg-blue-50/40 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
                  [class.bg-blue-50]="selectedIndex() === idx"
                  [class.border-advent-blue]="selectedIndex() === idx"
                >
                  <div class="space-y-1.5 max-w-xl min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs"
                        [class.bg-blue-100]="item.type === 'evento' || item.type === 'horario'"
                        [class.text-advent-blue]="item.type === 'evento' || item.type === 'horario'"
                        [class.bg-purple-100]="item.type === 'ministerio'"
                        [class.text-purple-800]="item.type === 'ministerio'"
                        [class.bg-amber-100]="item.type === 'versiculo'"
                        [class.text-amber-800]="item.type === 'versiculo'"
                        [class.bg-green-100]="item.type === 'pg'"
                        [class.text-green-800]="item.type === 'pg'"
                        [class.bg-red-100]="item.type === 'video'"
                        [class.text-red-800]="item.type === 'video'"
                      >
                        {{ item.badgeText }}
                      </span>

                      @if (item.departmentOrCategory) {
                        <span class="text-[11px] text-slate-400 font-medium truncate">
                          • {{ item.departmentOrCategory }}
                        </span>
                      }
                    </div>

                    <h4 class="text-base font-bold text-slate-900 group-hover:text-advent-blue transition-colors leading-snug">
                      {{ item.title }}
                    </h4>

                    <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                      {{ item.description }}
                    </p>
                  </div>

                  <!-- Ações Rápidas & Match Badge com Transição Elegante -->
                  <div class="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0">
                    @if (item.metadata?.['whatsapp'] || item.metadata?.['telefone'] || item.metadata?.['whatsapp_contato']) {
                      <button
                        type="button"
                        (click)="$event.stopPropagation(); openWhatsApp(item)"
                        class="text-xs font-semibold text-green-800 bg-green-50 hover:bg-green-100 border border-green-200/80 px-2.5 py-1.5 rounded-xl transition-all min-h-[34px] flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                        title="Falar no WhatsApp"
                      >
                        <span class="text-sm">💬</span>
                        <span class="hidden sm:inline">WhatsApp</span>
                      </button>
                    }

                    <div class="flex items-center gap-1.5 bg-slate-100/80 group-hover:bg-advent-blue group-hover:text-white px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-600 transition-colors shadow-2xs">
                      <span>{{ item.matchPercentage }}%</span>
                      <span class="text-[9px] uppercase tracking-wider opacity-80">afinidade</span>
                    </div>

                    <div class="h-6 w-6 rounded-full flex items-center justify-center text-slate-300 group-hover:text-advent-blue group-hover:translate-x-0.5 transition-all">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Rodapé Refinado -->
          <div class="px-5 py-3 bg-slate-50/90 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <kbd class="rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs">↑</kbd>
                <kbd class="rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs">↓</kbd>
                <span class="hidden sm:inline">navegar</span>
              </span>
              <span class="flex items-center gap-1">
                <kbd class="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs">↵</kbd>
                <span class="hidden sm:inline">abrir</span>
              </span>
            </div>

            <div class="flex items-center gap-1.5 font-semibold text-advent-blue text-[11px]">
              <span class="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>Busca Semântica Híbrida (Neural RRF + On-Device AI)</span>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class GlobalSearchDialogComponent {
  protected readonly searchService = inject(GlobalSemanticSearchService);
  private readonly router = inject(Router);

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  readonly isOpen = signal<boolean>(false);
  readonly query = signal<string>('');
  readonly selectedCategory = signal<SearchEntityType | 'all'>('all');
  readonly results = signal<SemanticSearchResult[]>([]);
  readonly selectedIndex = signal<number>(0);

  private debounceTimer: any = null;

  readonly promptSuggestions = [
    'O que a Bíblia diz sobre paz e ansiedade?',
    'Atividades para crianças e adolescentes',
    'Horário da Escola Sabatina e Culto',
    'Onde tem Pequeno Grupo em Tatuí?',
    'Quero ajudar com cestas básicas (ASA)',
    'Culto jovem e ministério de louvor',
  ];

  readonly categories = [
    { id: 'all' as const, label: 'Tudo', icon: '🌐' },
    { id: 'evento' as const, label: 'Eventos', icon: '📅' },
    { id: 'horario' as const, label: 'Cultos & Horários', icon: '⏰' },
    { id: 'ministerio' as const, label: 'Ministérios', icon: '🤝' },
    { id: 'pg' as const, label: 'Pequenos Grupos', icon: '🏡' },
    { id: 'versiculo' as const, label: 'Bíblia & Temas', icon: '📖' },
    { id: 'video' as const, label: 'Vídeos / Ao Vivo', icon: '📺' },
  ];

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => {
          this.searchInput?.nativeElement?.focus();
          this.searchService.initializeNeuralModel();
        }, 50);
        this.runInstantSearch();
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggle();
    } else if (event.key === 'Escape' && this.isOpen()) {
      this.close();
    } else if (this.isOpen()) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = this.selectedIndex() + 1;
        if (next < this.results().length) {
          this.selectedIndex.set(next);
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prev = this.selectedIndex() - 1;
        if (prev >= 0) {
          this.selectedIndex.set(prev);
        }
      } else if (event.key === 'Enter') {
        const item = this.results()[this.selectedIndex()];
        if (item) {
          this.navigate(item.url);
        }
      }
    }
  }

  open(): void {
    this.isOpen.set(true);
    this.query.set('');
    this.selectedIndex.set(0);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  clearQuery(): void {
    this.query.set('');
    this.selectedIndex.set(0);
    this.searchInput?.nativeElement?.focus();
    this.runInstantSearch();
  }

  applyPrompt(prompt: string): void {
    this.query.set(prompt);
    this.selectedIndex.set(0);
    this.runInstantSearch();
  }

  onQueryChange(val: string): void {
    this.query.set(val);
    this.selectedIndex.set(0);

    // Resposta imediata em 0ms (Léxica/BM25)
    this.runInstantSearch();

    // Refinamento neural assíncrono sem travar digitação
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.runDeepNeuralSearch();
    }, 180);
  }

  setCategory(cat: SearchEntityType | 'all'): void {
    this.selectedCategory.set(cat);
    this.selectedIndex.set(0);
    this.runInstantSearch();
  }

  // 1. Resposta em 0ms: atualiza a lista instantaneamente
  private runInstantSearch(): void {
    const instantResults = this.searchService.searchSync(this.query(), {
      category: this.selectedCategory(),
      maxResults: 15,
    });
    this.results.set(instantResults);
  }

  // 2. Refinamento Neural assíncrono em background
  private async runDeepNeuralSearch(): Promise<void> {
    if (!this.query().trim()) return;
    const deepResults = await this.searchService.search(this.query(), {
      category: this.selectedCategory(),
      maxResults: 15,
    });
    if (deepResults.length > 0) {
      this.results.set(deepResults);
    }
  }

  navigate(url: string): void {
    this.close();
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      this.router.navigateByUrl(url);
    }
  }

  openWhatsApp(item: SemanticSearchResult): void {
    const num =
      item.metadata?.['whatsapp'] ||
      item.metadata?.['telefone'] ||
      item.metadata?.['whatsapp_contato'];
    if (!num) return;

    const cleanNum = String(num).replace(/\D/g, '');
    const finalNum = cleanNum.startsWith('55') ? cleanNum : `55${cleanNum}`;
    const text = encodeURIComponent(
      `Olá! Vi o item "${item.title}" no site da IASD Mangueiras e gostaria de saber mais informações.`,
    );
    window.open(`https://wa.me/${finalNum}?text=${text}`, '_blank');
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
