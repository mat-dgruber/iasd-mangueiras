import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { SITE_CONFIG } from '../../core/site/site.config';
import { EstudosPgsTabComponent } from './estudos-pgs-tab.component';
import { EstudosLicaoTabComponent } from './estudos-licao-tab.component';
import { EstudosVersiculoTabComponent } from './estudos-versiculo-tab.component';
import { StoryBackground, StoryFormat } from '../../core/models/story.models';

@Component({
  selector: 'app-estudos-page',
  standalone: true,
  imports: [
    EstudosPgsTabComponent,
    EstudosLicaoTabComponent,
    EstudosVersiculoTabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="min-h-screen bg-slate-50 py-12 md:py-16">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <!-- Header da Página -->
        <header class="text-center max-w-3xl mx-auto space-y-4">
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-advent-blue/10 px-3.5 py-1 text-xs font-bold text-advent-blue tracking-wide uppercase"
          >
            Crescimento Espiritual & Comunhão
          </span>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-advent-text">
            Estudos Bíblicos & Pequenos Grupos
          </h1>
          <p class="text-base text-advent-muted leading-relaxed">
            Conecte-se com a comunidade da {{ site.name }}, encontre um Pequeno Grupo perto da sua
            casa ou aprofunde seu conhecimento com a Lição da Escola Sabatina e versículos diários.
          </p>
        </header>

        <!-- Navegação por Abas (Tabs) -->
        <nav
          class="mt-10 flex justify-center border-b border-advent-border"
          role="tablist"
          aria-label="Abas de Conteúdo"
        >
          <div class="flex flex-wrap gap-2 sm:gap-8 justify-center">
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="activeTab() === 'pgs'"
              (click)="setTab('pgs')"
              class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer min-h-[44px]"
              [class.border-advent-blue]="activeTab() === 'pgs'"
              [class.text-advent-blue]="activeTab() === 'pgs'"
              [class.border-transparent]="activeTab() !== 'pgs'"
              [class.text-advent-muted]="activeTab() !== 'pgs'"
              [class.hover:text-advent-text]="activeTab() !== 'pgs'"
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
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              <span>Pequenos Grupos (PGs)</span>
            </button>

            <button
              type="button"
              role="tab"
              [attr.aria-selected]="activeTab() === 'licao'"
              (click)="setTab('licao')"
              class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer min-h-[44px]"
              [class.border-advent-blue]="activeTab() === 'licao'"
              [class.text-advent-blue]="activeTab() === 'licao'"
              [class.border-transparent]="activeTab() !== 'licao'"
              [class.text-advent-muted]="activeTab() !== 'licao'"
              [class.hover:text-advent-text]="activeTab() !== 'licao'"
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
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              <span>Lição da Escola Sabatina</span>
            </button>

            <button
              type="button"
              role="tab"
              [attr.aria-selected]="activeTab() === 'versiculo'"
              (click)="setTab('versiculo')"
              class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer min-h-[44px]"
              [class.border-advent-blue]="activeTab() === 'versiculo'"
              [class.text-advent-blue]="activeTab() === 'versiculo'"
              [class.border-transparent]="activeTab() !== 'versiculo'"
              [class.text-advent-muted]="activeTab() !== 'versiculo'"
              [class.hover:text-advent-text]="activeTab() !== 'versiculo'"
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
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
              <span>Versículo do Dia</span>
            </button>
          </div>
        </nav>

        <!-- Conteúdo das Abas Delegado para Subcomponentes Especializados -->
        @if (activeTab() === 'pgs') {
          <app-estudos-pgs-tab #pgsTab />
        }

        @if (activeTab() === 'licao') {
          <app-estudos-licao-tab />
        }

        @if (activeTab() === 'versiculo') {
          <app-estudos-versiculo-tab #versiculoTab />
        }
      </div>
    </main>
  `,
})
export class EstudosPage {
  @ViewChild('pgsTab') pgsTab?: EstudosPgsTabComponent;
  @ViewChild('versiculoTab') versiculoTab?: EstudosVersiculoTabComponent;

  private readonly seo = inject(SeoService);
  protected readonly site = SITE_CONFIG;

  readonly activeTab = signal<'pgs' | 'licao' | 'versiculo'>('pgs');

  constructor() {
    this.seo.apply({
      title: 'Estudos Bíblicos, Pequenos Grupos & Lição — IASD Mangueiras',
      description:
        'Encontre um Pequeno Grupo próximo a você em Tatuí, assista à playlist do Presente 7 no canal da IASD Mangueiras e aos estudos do Canal Lamed.',
      path: '/estudos',
      breadcrumbs: [
        { name: 'Início', url: 'https://iasdmangueiras.org.br/' },
        { name: 'Estudos Bíblicos & Lição', url: 'https://iasdmangueiras.org.br/estudos' },
      ],
    });
  }

  setTab(tab: 'pgs' | 'licao' | 'versiculo'): void {
    this.activeTab.set(tab);
  }

  // Proxies / Delegators para compatibilidade transparente com testes e serviços
  get selectedPerfil() {
    return this.pgsTab?.selectedPerfil || signal('Todos');
  }

  get filteredPgs() {
    return this.pgsTab?.filteredPgs || (() => []);
  }

  get currentVerse() {
    return this.versiculoTab?.currentVerse || signal({ id: '', referencia: '', texto: '', tema: '', categoria: 'geral' });
  }

  get bibleQuery() {
    return this.versiculoTab?.bibleQuery || signal('');
  }

  get isSearchingBible() {
    return this.versiculoTab?.isSearchingBible || signal(false);
  }

  get popularOnlineReferences() {
    return this.versiculoTab?.popularOnlineReferences || [];
  }

  get selectedFormat() {
    return this.versiculoTab?.selectedFormat || signal('story' as StoryFormat);
  }

  get selectedBackground() {
    return this.versiculoTab?.selectedBackground || signal({} as StoryBackground);
  }

  get overlayOpacity() {
    return this.versiculoTab?.overlayOpacity || signal(0.5);
  }

  get dimmingSliderFillPercent() {
    return this.versiculoTab?.dimmingSliderFillPercent || signal(50);
  }

  get customImagePreview() {
    return this.versiculoTab?.customImagePreview || signal(null);
  }

  get aiQuery() {
    return this.versiculoTab?.aiQuery || signal('');
  }

  get aiMatches() {
    return this.versiculoTab?.aiMatches || signal([]);
  }

  get downloadSuccess() {
    return this.versiculoTab?.downloadSuccess || signal(null);
  }

  get copyFeedback() {
    return this.versiculoTab?.copyFeedback || signal(null);
  }

  nextVerse(): void {
    this.versiculoTab?.nextVerse();
  }

  quickSearchPassage(ref: string): void {
    this.versiculoTab?.quickSearchPassage(ref);
  }

  drawRandomOnlineVerse(): void {
    this.versiculoTab?.drawRandomOnlineVerse();
  }

  copyVerseText(): void {
    this.versiculoTab?.copyVerseText();
  }

  setFormat(format: StoryFormat): void {
    this.versiculoTab?.setFormat(format);
  }

  selectBackground(bg: StoryBackground): void {
    this.versiculoTab?.selectBackground(bg);
  }

  setOverlayOpacity(val: number): void {
    this.versiculoTab?.setOverlayOpacity(val);
  }

  onOpacityChange(event: Event): void {
    this.versiculoTab?.onOpacityChange(event);
  }

  clearCustomImage(): void {
    this.versiculoTab?.clearCustomImage();
  }

  searchByFeeling(query?: string): Promise<void> {
    return this.versiculoTab?.searchByFeeling(query) || Promise.resolve();
  }

  selectAiMatch(match: any): void {
    this.versiculoTab?.selectAiMatch(match);
  }

  downloadHighResImage(): Promise<void> {
    return this.versiculoTab?.downloadHighResImage() || Promise.resolve();
  }

  shareStoryGraphic(): Promise<void> {
    return this.versiculoTab?.shareStoryGraphic() || Promise.resolve();
  }
}
