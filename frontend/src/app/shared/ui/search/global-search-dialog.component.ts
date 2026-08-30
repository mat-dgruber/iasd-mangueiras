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
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-global-search-dialog',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-16 bg-black/65 backdrop-blur-xs animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        (click)="onBackdropClick($event)"
      >
        <div
          class="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-advent-border overflow-hidden flex flex-col max-h-[88vh] animate-scaleUp"
          (click)="$event.stopPropagation()"
        >
          <!-- Input Header -->
          <div class="relative flex items-center border-b border-advent-border px-4 py-3.5 sm:px-6 bg-white">
            <svg
              class="h-5 w-5 text-advent-blue shrink-0 mr-3"
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

            <input
              #searchInput
              id="search-modal-title"
              type="search"
              [ngModel]="query()"
              (ngModelChange)="onQueryChange($event)"
              placeholder="Pergunte em linguagem natural (ex: 'onde levar meus filhos', 'oração para angústia')..."
              class="w-full text-base sm:text-lg bg-transparent text-advent-text placeholder:text-advent-muted focus:outline-hidden min-h-[44px]"
              autocomplete="off"
            />

            @if (searchService.isLoading()) {
              <div class="flex items-center gap-1.5 text-xs text-advent-blue font-semibold mr-2 shrink-0">
                <span class="inline-block h-2 w-2 rounded-full bg-advent-blue animate-ping"></span>
                <span>IA Carregando</span>
              </div>
            }

            <button
              type="button"
              (click)="close()"
              class="rounded-lg p-1.5 text-advent-muted hover:text-advent-text hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Fechar busca"
            >
              <kbd class="hidden sm:inline-block rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-xs mr-2">ESC</kbd>
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Sugestões Rápidas / Zero-State Prompts -->
          @if (!query()) {
            <div class="px-4 py-3 sm:px-6 bg-blue-50/40 border-b border-advent-border">
              <span class="text-[11px] font-bold uppercase tracking-wider text-advent-muted block mb-2">
                💡 Sugestões de Perguntas & Temas
              </span>
              <div class="flex flex-wrap gap-1.5">
                @for (prompt of promptSuggestions; track prompt) {
                  <button
                    type="button"
                    (click)="applyPrompt(prompt)"
                    class="rounded-xl border border-blue-200/70 bg-white px-3 py-1.5 text-xs font-medium text-advent-text hover:border-advent-blue hover:text-advent-blue hover:bg-blue-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    {{ prompt }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Filtros de Categorias Rápidas -->
          <div class="flex items-center gap-1.5 px-4 py-2.5 sm:px-6 bg-slate-50 border-b border-advent-border overflow-x-auto no-scrollbar">
            @for (cat of categories; track cat.id) {
              <button
                type="button"
                (click)="setCategory(cat.id)"
                class="rounded-xl px-3 py-1 text-xs font-bold transition-all whitespace-nowrap min-h-[32px] cursor-pointer"
                [class.bg-advent-blue]="selectedCategory() === cat.id"
                [class.text-white]="selectedCategory() === cat.id"
                [class.shadow-xs]="selectedCategory() === cat.id"
                [class.bg-white]="selectedCategory() !== cat.id"
                [class.text-advent-muted]="selectedCategory() !== cat.id"
                [class.border]="selectedCategory() !== cat.id"
                [class.border-advent-border]="selectedCategory() !== cat.id"
              >
                {{ cat.label }}
              </button>
            }
          </div>

          <!-- Lista de Resultados -->
          <div class="overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-slate-100 flex-1">
            @if (results().length === 0) {
              <div class="py-12 text-center text-advent-muted">
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-advent-neutral text-advent-blue mb-3">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p class="font-bold text-advent-text text-base">Nenhum resultado encontrado</p>
                <p class="text-xs sm:text-sm mt-1">
                  Tente buscar por palavras como "música", "família", "oração", "sábado" ou "jovens".
                </p>
              </div>
            } @else {
              @for (item of results(); track item.id; let idx = $index) {
                <div
                  (click)="navigate(item.url)"
                  (keydown.enter)="navigate(item.url)"
                  tabindex="0"
                  class="group flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl hover:bg-blue-50/60 transition-colors cursor-pointer border border-transparent hover:border-advent-blue/20 pt-3"
                  [class.bg-blue-50]="selectedIndex() === idx"
                >
                  <div class="space-y-1.5 max-w-xl">
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
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
                        <span class="text-[11px] text-advent-muted font-medium">
                          • {{ item.departmentOrCategory }}
                        </span>
                      }
                    </div>

                    <h4 class="text-base font-bold text-advent-text group-hover:text-advent-blue transition-colors leading-snug">
                      {{ item.title }}
                    </h4>

                    <p class="text-xs text-advent-muted line-clamp-2 leading-relaxed">
                      {{ item.description }}
                    </p>
                  </div>

                  <!-- Ações Rápidas & Match Badge -->
                  <div class="flex items-center gap-2.5 self-end md:self-center shrink-0 pt-2 md:pt-0">
                    @if (item.metadata?.['whatsapp'] || item.metadata?.['telefone'] || item.metadata?.['whatsapp_contato']) {
                      <button
                        type="button"
                        (click)="$event.stopPropagation(); openWhatsApp(item)"
                        class="text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-xl transition-colors min-h-[36px] flex items-center gap-1.5 cursor-pointer"
                        title="Falar no WhatsApp"
                      >
                        💬 WhatsApp
                      </button>
                    }

                    <span class="rounded-full bg-slate-100 group-hover:bg-advent-blue group-hover:text-white px-3 py-1 text-[11px] font-extrabold text-advent-text transition-colors">
                      {{ item.matchPercentage }}% afinidade
                    </span>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Rodapé com Dicas e Atalhos -->
          <div class="px-4 py-3 bg-slate-50 border-t border-advent-border flex flex-wrap items-center justify-between text-xs text-advent-muted">
            <div class="flex items-center gap-3">
              <span>Navegue com <kbd class="rounded border border-slate-200 bg-white px-1 font-semibold">↑</kbd> <kbd class="rounded border border-slate-200 bg-white px-1 font-semibold">↓</kbd></span>
              <span>Abrir com <kbd class="rounded border border-slate-200 bg-white px-1 font-semibold">ENTER</kbd></span>
            </div>
            <span class="font-bold text-advent-blue flex items-center gap-1">
              ✨ Busca Semântica Híbrida (Neural RRF + On-Device AI)
            </span>
          </div>
        </div>
      </div>
    }
  `,
})
export class GlobalSearchDialogComponent {
  protected readonly searchService = inject(GlobalSemanticSearchService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  readonly isOpen = signal<boolean>(false);
  readonly query = signal<string>('');
  readonly selectedCategory = signal<SearchEntityType | 'all'>('all');
  readonly results = signal<SemanticSearchResult[]>([]);
  readonly selectedIndex = signal<number>(0);

  readonly promptSuggestions = [
    'O que a Bíblia diz sobre ansiedade e paz?',
    'Atividades para crianças e adolescentes',
    'Horário da Escola Sabatina e Culto',
    'Onde tem Pequeno Grupo perto de mim?',
    'Quero ajudar com cestas básicas (ASA)',
    'Culto jovem e ministério de louvor',
  ];

  readonly categories = [
    { id: 'all' as const, label: 'Tudo' },
    { id: 'evento' as const, label: 'Eventos' },
    { id: 'horario' as const, label: 'Cultos & Horários' },
    { id: 'ministerio' as const, label: 'Ministérios' },
    { id: 'pg' as const, label: 'Pequenos Grupos' },
    { id: 'versiculo' as const, label: 'Bíblia & Temas' },
    { id: 'video' as const, label: 'Vídeos / Ao Vivo' },
  ];

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => {
          this.searchInput?.nativeElement?.focus();
          this.searchService.initializeNeuralModel();
        }, 50);
        this.runSearch();
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

  applyPrompt(prompt: string): void {
    this.query.set(prompt);
    this.selectedIndex.set(0);
    this.runSearch();
  }

  onQueryChange(val: string): void {
    this.query.set(val);
    this.selectedIndex.set(0);
    this.runSearch();
  }

  setCategory(cat: SearchEntityType | 'all'): void {
    this.selectedCategory.set(cat);
    this.selectedIndex.set(0);
    this.runSearch();
  }

  private async runSearch(): Promise<void> {
    const res = await this.searchService.search(this.query(), {
      category: this.selectedCategory(),
      maxResults: 15,
    });
    this.results.set(res);
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
