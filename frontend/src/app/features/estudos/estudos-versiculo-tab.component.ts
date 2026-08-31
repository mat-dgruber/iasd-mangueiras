import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { BibleService } from '../../core/services/bible.service';
import { VerseAiService } from '../../core/services/verse-ai.service';
import { StoryCanvasService } from '../../core/services/story-canvas.service';
import {
  DailyVerse,
  SemanticVerseMatch,
  StoryBackground,
  StoryFormat,
} from '../../core/models/story.models';
import { STORY_BACKGROUND_PRESETS } from '../../core/constants/story-presets';

@Component({
  selector: 'app-estudos-versiculo-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="mt-8 animate-fadeIn w-full min-w-0"
      aria-label="Versículo do Dia e Estúdio de Stories"
    >
      <div class="grid gap-8 lg:grid-cols-12 items-start w-full min-w-0">
        <!-- PAINEL ESQUERDO: CONTROLES & PERSONALIZAÇÃO (7 Colunas) -->
        <div class="lg:col-span-7 space-y-6 w-full min-w-0">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">
              Estúdio Visual & IA
            </span>
            <h2 class="mt-1 text-2xl sm:text-3xl font-extrabold text-advent-text">
              Versículo & Gerador de Stories
            </h2>
            <p class="mt-1 text-sm text-advent-muted leading-relaxed">
              Crie belos cards e stories com passagens bíblicas para compartilhar no Instagram,
              WhatsApp e redes sociais.
            </p>
          </div>

          <!-- 1. SELETOR DE FORMATO (9:16 Story vs 1:1 Feed) -->
          <div
            class="rounded-3xl border border-advent-border bg-white p-5 sm:p-6 shadow-xs space-y-3 w-full min-w-0"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-bold uppercase tracking-wider text-advent-blue flex items-center gap-1.5"
              >
                <svg
                  class="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Formato da Imagem
              </span>
              <span class="text-[11px] font-semibold text-advent-muted">
                {{ selectedFormat() === 'story' ? '9:16 (1080×1920)' : '1:1 (1080×1080)' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 w-full min-w-0">
              <button
                type="button"
                (click)="setFormat('story')"
                class="flex items-center justify-center gap-2.5 rounded-2xl p-3.5 border transition-all cursor-pointer min-h-[44px]"
                [class]="
                  selectedFormat() === 'story'
                    ? 'border-advent-blue bg-blue-50/70 text-advent-blue font-bold shadow-xs ring-2 ring-advent-blue/20'
                    : 'border-advent-border bg-white text-advent-text hover:bg-slate-50'
                "
                aria-label="Selecionar formato Story 9 para 16"
              >
                <svg
                  class="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="5" y="2" width="14" height="20" rx="3" />
                  <line
                    x1="12"
                    y1="18"
                    x2="12"
                    y2="18.01"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                </svg>
                <div class="text-left">
                  <div class="text-xs font-bold leading-tight">Story (9:16)</div>
                  <div class="text-[10px] text-advent-muted">Instagram / WhatsApp</div>
                </div>
              </button>

              <button
                type="button"
                (click)="setFormat('feed')"
                class="flex items-center justify-center gap-2.5 rounded-2xl p-3.5 border transition-all cursor-pointer min-h-[44px]"
                [class]="
                  selectedFormat() === 'feed'
                    ? 'border-advent-blue bg-blue-50/70 text-advent-blue font-bold shadow-xs ring-2 ring-advent-blue/20'
                    : 'border-advent-border bg-white text-advent-text hover:bg-slate-50'
                "
                aria-label="Selecionar formato Feed 1 para 1"
              >
                <svg
                  class="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                <div class="text-left">
                  <div class="text-xs font-bold leading-tight">Feed Post (1:1)</div>
                  <div class="text-[10px] text-advent-muted">Instagram / Facebook</div>
                </div>
              </button>
            </div>
          </div>

          <!-- 2. BUSCA INTELIGENTE POR SENTIMENTO (IA TENSORFLOW/SEMÂNTICA) -->
          <div
            class="rounded-3xl border border-advent-border bg-white p-5 sm:p-6 shadow-xs space-y-4 w-full min-w-0"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-bold uppercase tracking-wider text-advent-blue flex items-center gap-1.5"
              >
                <svg
                  class="h-4 w-4 shrink-0 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
                Sentimento & Inspiração com IA
              </span>
              <span
                class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
              >
                Busca Semântica
              </span>
            </div>

            <p class="text-xs text-advent-muted">
              Como você está se sentindo hoje? Digite sua emoção ou necessidade e a IA encontrará a
              promessa bíblica ideal:
            </p>

            <div class="flex flex-col sm:flex-row gap-2 w-full min-w-0">
              <input
                type="text"
                [value]="aiQuery()"
                (input)="onAiQueryInput($event)"
                (keydown.enter)="searchByFeeling()"
                placeholder="Ex: ansioso com o futuro, precisando de paz, grato por livramento..."
                class="w-full min-w-0 rounded-xl border border-advent-border bg-slate-50/70 px-3.5 py-2.5 text-xs text-advent-text placeholder:text-advent-muted focus:border-advent-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-advent-blue/20 transition-all min-h-[44px]"
              />
              <button
                type="button"
                (click)="searchByFeeling()"
                [disabled]="isSearchingAi()"
                class="rounded-xl bg-advent-blue px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-advent-blue-dark active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 min-h-[44px]"
              >
                @if (isSearchingAi()) {
                  <svg
                    class="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Buscando...</span>
                } @else {
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <span>Buscar com IA</span>
                }
              </button>
            </div>

            <!-- Chips de sentimentos rápidos -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1">
              <span class="text-[11px] text-advent-muted py-1">Sentimentos:</span>
              @for (mood of quickMoodChips; track mood) {
                <button
                  type="button"
                  (click)="searchByFeeling(mood)"
                  class="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-advent-text hover:bg-advent-blue/10 hover:text-advent-blue transition-colors cursor-pointer min-h-[38px] sm:min-h-[34px] inline-flex items-center justify-center"
                >
                  {{ mood }}
                </button>
              }
            </div>

            <!-- Resultados da busca semântica -->
            @if (aiMatches().length > 0) {
              <div class="pt-2 space-y-2 border-t border-slate-100 animate-fadeIn">
                <span class="text-[11px] font-bold text-advent-blue uppercase tracking-wider">
                  Recomendações da IA para seu coração:
                </span>
                <div class="grid gap-2">
                  @for (match of aiMatches(); track match.verse.id) {
                    <button
                      type="button"
                      (click)="selectAiMatch(match)"
                      class="w-full text-left rounded-2xl p-3 text-xs transition-all flex items-center justify-between border cursor-pointer min-w-0 min-h-[44px]"
                      [class]="
                        currentVerse().id === match.verse.id
                          ? 'border-advent-blue bg-blue-50/80 text-advent-text font-bold shadow-xs'
                          : 'border-advent-border/60 bg-white text-advent-muted hover:border-advent-blue/50 hover:bg-slate-50'
                      "
                    >
                      <div class="truncate pr-2 min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                          <strong class="text-advent-text truncate">{{
                            match.verse.referencia
                          }}</strong>
                          <span
                            class="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold"
                          >
                            {{ match.matchPercentage }}% Afinidade
                          </span>
                        </div>
                        <span
                          class="text-[11px] font-normal text-advent-muted truncate block mt-0.5"
                        >
                          “{{ match.verse.texto }}”
                        </span>
                      </div>
                      <span
                        class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-advent-muted ml-2"
                      >
                        {{ match.verse.tema }}
                      </span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <!-- 3. ESTÚDIO DE FUNDOS (FOTOS REAIS, GRADIENTES & FOTO DO USUÁRIO) -->
          <div
            class="rounded-3xl border border-advent-border bg-white p-5 sm:p-6 shadow-xs space-y-4 w-full min-w-0"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-bold uppercase tracking-wider text-advent-blue flex items-center gap-1.5"
              >
                <svg
                  class="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
                Estúdio de Fundos & Cores
              </span>
              <span class="text-[11px] font-bold text-advent-muted">
                {{ selectedBackground().nome }}
              </span>
            </div>

            <!-- Abas do Estúdio de Fundos -->
            <div class="flex border-b border-slate-200">
              <button
                type="button"
                (click)="setBackgroundTab('photo')"
                class="pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer min-h-[44px]"
                [class.border-advent-blue]="activeBackgroundTab() === 'photo'"
                [class.text-advent-blue]="activeBackgroundTab() === 'photo'"
                [class.border-transparent]="activeBackgroundTab() !== 'photo'"
                [class.text-advent-muted]="activeBackgroundTab() !== 'photo'"
              >
                🏞️ Fotos Reais (6)
              </button>
              <button
                type="button"
                (click)="setBackgroundTab('gradient')"
                class="pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer min-h-[44px]"
                [class.border-advent-blue]="activeBackgroundTab() === 'gradient'"
                [class.text-advent-blue]="activeBackgroundTab() === 'gradient'"
                [class.border-transparent]="activeBackgroundTab() !== 'gradient'"
                [class.text-advent-muted]="activeBackgroundTab() !== 'gradient'"
              >
                🎨 Gradientes Nobres (4)
              </button>
              <button
                type="button"
                (click)="setBackgroundTab('custom')"
                class="pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer min-h-[44px]"
                [class.border-advent-blue]="activeBackgroundTab() === 'custom'"
                [class.text-advent-blue]="activeBackgroundTab() === 'custom'"
                [class.border-transparent]="activeBackgroundTab() !== 'custom'"
                [class.text-advent-muted]="activeBackgroundTab() !== 'custom'"
              >
                📷 Usar Minha Foto
              </button>
            </div>

            <!-- Galeria: Fotos Reais -->
            @if (activeBackgroundTab() === 'photo') {
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full min-w-0">
                @for (preset of photoPresets; track preset.id) {
                  <button
                    type="button"
                    (click)="selectBackground(preset)"
                    class="group relative overflow-hidden rounded-2xl border transition-all cursor-pointer text-left min-h-[84px] focus-visible:ring-2 focus-visible:ring-advent-blue"
                    [class]="
                      selectedBackground().id === preset.id
                        ? 'border-advent-blue ring-2 ring-advent-blue shadow-md'
                        : 'border-advent-border hover:border-advent-blue/60'
                    "
                  >
                    <img
                      [src]="preset.thumbnailUrl || preset.imageUrl"
                      [alt]="preset.nome"
                      loading="lazy"
                      class="h-20 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-2"
                    >
                      <span class="text-[11px] font-bold text-white leading-tight truncate">
                        {{ preset.nome }}
                      </span>
                    </div>
                    @if (selectedBackground().id === preset.id) {
                      <div
                        class="absolute top-1.5 right-1.5 bg-advent-blue text-white rounded-full p-1 shadow-sm"
                      >
                        <svg
                          class="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="3"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    }
                  </button>
                }
              </div>
            }

            <!-- Galeria: Gradientes Nobres -->
            @if (activeBackgroundTab() === 'gradient') {
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full min-w-0">
                @for (preset of gradientPresets; track preset.id) {
                  <button
                    type="button"
                    (click)="selectBackground(preset)"
                    class="flex flex-col items-center gap-2 rounded-2xl p-3 border transition-all cursor-pointer text-center min-w-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-advent-blue"
                    [class]="
                      selectedBackground().id === preset.id
                        ? 'border-advent-blue ring-2 ring-advent-blue/20 bg-blue-50/40 shadow-xs'
                        : 'border-advent-border bg-white hover:border-slate-300'
                    "
                  >
                    <div
                      class="h-10 w-full rounded-xl shadow-inner border border-white/20"
                      [style.background]="preset.bgGradientCss"
                    ></div>
                    <span class="text-[11px] font-bold text-advent-text truncate w-full">{{
                      preset.nome
                    }}</span>
                  </button>
                }
              </div>
            }

            <!-- Galeria: Minha Foto (Upload Customizado) -->
            @if (activeBackgroundTab() === 'custom') {
              <div class="space-y-3">
                <input
                  #customFileInput
                  type="file"
                  accept="image/*"
                  (change)="onCustomPhotoSelected($event)"
                  class="hidden"
                />

                @if (customImagePreview()) {
                  <div
                    class="flex items-center gap-4 p-3 rounded-2xl border border-advent-border bg-slate-50"
                  >
                    <img
                      [src]="customImagePreview()"
                      alt="Prévia da foto personalizada"
                      class="h-16 w-16 rounded-xl object-cover border border-slate-300 shadow-xs"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-bold text-advent-text">
                        Sua Foto Personalizada
                      </div>
                      <div class="text-[11px] text-advent-muted">
                        Carregada e pronta para o story
                      </div>
                      <div class="flex gap-2 mt-2">
                        <button
                          type="button"
                          (click)="customFileInput.click()"
                          class="text-xs font-bold text-advent-blue hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
                        >
                          Trocar Foto
                        </button>
                        <span class="text-slate-300 self-center">|</span>
                        <button
                          type="button"
                          (click)="clearCustomImage()"
                          class="text-xs font-bold text-rose-600 hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                } @else {
                  <button
                    type="button"
                    (click)="customFileInput.click()"
                    class="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-advent-blue/40 rounded-2xl bg-blue-50/30 hover:bg-blue-50/70 transition-all cursor-pointer min-h-[110px] focus-visible:ring-2 focus-visible:ring-advent-blue"
                  >
                    <svg
                      class="h-8 w-8 text-advent-blue mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span class="text-xs font-bold text-advent-blue"
                      >Carregar Foto do Celular / Computador</span
                    >
                    <span class="text-[11px] text-advent-muted mt-0.5"
                      >JPG, PNG ou WebP em alta resolução</span
                    >
                  </button>
                }
              </div>
            }

            <!-- Slider de Escurecimento / Dimming -->
            <div class="pt-2 space-y-2 border-t border-slate-100">
              <div class="flex items-center justify-between">
                <label for="dimming-range" class="text-xs font-bold text-advent-text">
                  Escurecimento do Fundo: {{ overlayOpacityPercent() }}%
                </label>
                <span class="text-[10px] font-semibold text-advent-muted">
                  {{
                    overlayOpacityPercent() < 50 ? 'Mais claro' : 'Alto contraste (WCAG AAA)'
                  }}
                </span>
              </div>
              <input
                id="dimming-range"
                type="range"
                min="35"
                max="85"
                [value]="overlayOpacityPercent()"
                (input)="onOpacityChange($event)"
                class="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-[#003767] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-advent-blue transition-all"
                [style.background]="
                  'linear-gradient(to right, #003767 0%, #003767 ' +
                  dimmingSliderFillPercent() +
                  '%, #E2E8F0 ' +
                  dimmingSliderFillPercent() +
                  '%, #E2E8F0 100%)'
                "
                aria-label="Controle de opacidade do escurecimento do fundo"
              />
              <div class="flex items-center justify-between text-[10px] font-medium text-advent-muted px-0.5">
                <span>35% (Sutil)</span>
                <span>60% (Recomendado)</span>
                <span>85% (Forte)</span>
              </div>
              <p class="text-[10px] text-advent-muted">
                Ajuste o contraste escuro sobre a foto para garantir máxima legibilidade do texto
                sagrado.
              </p>
            </div>
          </div>

          <!-- 4. BUSCA BÍBLICA NA API & PROMESSAS POR CATEGORIA -->
          <div
            class="rounded-3xl border border-advent-border bg-white p-5 sm:p-6 shadow-xs space-y-4 w-full min-w-0"
          >
            <div class="flex items-center justify-between gap-2">
              <span
                class="text-xs font-bold uppercase tracking-wider text-advent-blue flex items-center gap-1.5 truncate"
              >
                <svg
                  class="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
                Buscar Passagem na Bíblia
              </span>
              <span class="text-[11px] font-semibold text-advent-muted shrink-0"
                >Tradução Almeida</span
              >
            </div>

            <div class="flex flex-col sm:flex-row gap-2 w-full min-w-0">
              <input
                type="text"
                [value]="bibleQuery()"
                (input)="onBibleQueryInput($event)"
                (keydown.enter)="searchBiblePassage()"
                placeholder="Ex: João 14:1-3, Salmos 91, Romanos 8:28, Isaías 40:31..."
                class="w-full min-w-0 rounded-xl border border-advent-border bg-slate-50/70 px-3.5 py-2.5 text-xs text-advent-text placeholder:text-advent-muted focus:border-advent-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-advent-blue/20 transition-all min-h-[44px]"
              />
              <button
                type="button"
                (click)="searchBiblePassage()"
                [disabled]="isSearchingBible()"
                class="rounded-xl bg-advent-blue px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-advent-blue-dark active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 min-h-[44px]"
              >
                @if (isSearchingBible()) {
                  <svg
                    class="animate-spin h-3.5 w-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Carregando...</span>
                } @else {
                  <svg
                    class="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  <span>Carregar Passagem</span>
                }
              </button>
              <button
                type="button"
                (click)="drawRandomOnlineVerse()"
                [disabled]="isSearchingBible()"
                class="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2.5 text-xs font-bold text-advent-blue shadow-xs hover:bg-blue-100 hover:border-blue-300 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 min-h-[44px]"
                title="Sortear uma passagem bíblica online aleatória"
              >
                <svg
                  class="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                  />
                </svg>
                <span>🎲 Sortear</span>
              </button>
            </div>

            <!-- Sugestões Rápidas de Passagens Bíblicas -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1">
              <span class="text-[11px] text-advent-muted">Sugestões rápidas:</span>
              @for (sug of quickSuggestions; track sug) {
                <button
                  type="button"
                  (click)="quickSearchPassage(sug)"
                  class="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-advent-text hover:bg-advent-blue/10 hover:text-advent-blue transition-colors cursor-pointer min-h-[32px]"
                >
                  {{ sug }}
                </button>
              }
            </div>

            @if (searchError()) {
              <p
                class="text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl p-2.5 border border-rose-200 animate-fadeIn"
              >
                {{ searchError() }}
              </p>
            }

            <!-- Filtros de Promessas por Tema -->
            <div class="pt-3 border-t border-slate-100 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">
                  Promessas Selecionadas:
                </span>
                <button
                  type="button"
                  (click)="nextVerse()"
                  class="inline-flex items-center gap-1 text-xs font-bold text-advent-blue hover:underline cursor-pointer min-h-[44px]"
                >
                  <span>Sortear Promessa</span>
                  <span>↻</span>
                </button>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  (click)="selectedCategory.set('todas')"
                  class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer min-h-[36px]"
                  [class]="
                    selectedCategory() === 'todas'
                      ? 'bg-advent-blue text-white shadow-xs'
                      : 'bg-slate-100 text-advent-text hover:bg-slate-200'
                  "
                >
                  ✨ Todas
                </button>
                <button
                  type="button"
                  (click)="selectedCategory.set('paz')"
                  class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer min-h-[36px]"
                  [class]="
                    selectedCategory() === 'paz'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-advent-text hover:bg-slate-200'
                  "
                >
                  🕊️ Paz & Conforto
                </button>
                <button
                  type="button"
                  (click)="selectedCategory.set('esperanca')"
                  class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer min-h-[36px]"
                  [class]="
                    selectedCategory() === 'esperanca'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-advent-text hover:bg-slate-200'
                  "
                >
                  🌅 Esperança
                </button>
                <button
                  type="button"
                  (click)="selectedCategory.set('oracao')"
                  class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer min-h-[36px]"
                  [class]="
                    selectedCategory() === 'oracao'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-advent-text hover:bg-slate-200'
                  "
                >
                  🙏 Oração
                </button>
                <button
                  type="button"
                  (click)="selectedCategory.set('coragem')"
                  class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer min-h-[36px]"
                  [class]="
                    selectedCategory() === 'coragem'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-advent-text hover:bg-slate-200'
                  "
                >
                  🛡️ Coragem
                </button>
                <button
                  type="button"
                  (click)="selectedCategory.set('amor')"
                  class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer min-h-[36px]"
                  [class]="
                    selectedCategory() === 'amor'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-advent-text hover:bg-slate-200'
                  "
                >
                  ❤️ Amor
                </button>
              </div>

              <!-- Lista de Versículos Filtrados -->
              <div class="grid gap-2 max-h-48 overflow-y-auto pr-1">
                @for (v of filteredVerses(); track v.id) {
                  <button
                    type="button"
                    (click)="selectVerse(v)"
                    class="w-full text-left rounded-2xl p-3 text-xs transition-all flex items-center justify-between border cursor-pointer min-w-0 min-h-[44px]"
                    [class]="
                      currentVerse().id === v.id
                        ? 'border-advent-blue bg-blue-50/70 text-advent-text font-bold shadow-xs'
                        : 'border-advent-border/60 bg-white text-advent-muted hover:border-advent-blue/50 hover:bg-slate-50'
                    "
                  >
                    <div class="truncate pr-2 min-w-0 flex-1">
                      <strong class="text-advent-text block truncate">{{
                        v.referencia
                      }}</strong>
                      <span class="text-[11px] font-normal text-advent-muted truncate block"
                        >“{{ v.texto }}”</span
                      >
                    </div>
                    <span
                      class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-advent-muted ml-2"
                    >
                      {{ v.tema }}
                    </span>
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- 5. AÇÕES RÁPIDAS DE COMPARTILHAMENTO DE TEXTO -->
          <div
            class="rounded-3xl border border-advent-border bg-white p-5 sm:p-6 shadow-xs space-y-3 w-full min-w-0"
          >
            <span class="text-xs font-bold uppercase tracking-wider text-advent-blue block">
              Citação & Compartilhamento Direto:
            </span>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full min-w-0">
              <button
                type="button"
                (click)="copyVerseText()"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-advent-border px-3.5 py-3 text-xs font-bold text-advent-text hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px]"
              >
                <svg
                  class="h-4 w-4 shrink-0 text-advent-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
                <span class="truncate">{{ copyFeedback() || 'Copiar Citação Bíblica' }}</span>
              </button>

              <a
                [href]="getWhatsAppShareLink()"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-3.5 py-3 text-xs font-bold text-white shadow-xs hover:bg-green-800 transition-colors text-center min-h-[44px]"
              >
                <svg class="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
                  />
                </svg>
                <span class="truncate">Enviar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <!-- PAINEL DIREITO: LIVE PREVIEW RESPONSIVO & EXPORTAÇÃO (5 Colunas) -->
        <div
          class="lg:col-span-5 w-full min-w-0 lg:sticky lg:top-24 flex flex-col items-center"
        >
          <div class="w-full max-w-[360px] sm:max-w-[390px] mx-auto min-w-0">
            <div class="flex items-center justify-between pb-3 px-1">
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">
                Pré-Visualização em Tempo Real:
              </span>
              <span class="text-[11px] font-semibold text-advent-muted">
                {{
                  selectedFormat() === 'story' ? 'Formato 9:16 (Story)' : 'Formato 1:1 (Feed)'
                }}
              </span>
            </div>

            <!-- Frame do Celular (Story 9:16) ou Card do Feed (Feed 1:1) -->
            <div
              class="relative overflow-hidden bg-slate-950 p-2 shadow-2xl transition-all duration-300 w-full"
              [class]="
                selectedFormat() === 'story'
                  ? 'rounded-[38px] border-[7px] border-slate-900 aspect-[9/16]'
                  : 'rounded-[28px] border-[6px] border-slate-900 aspect-square'
              "
            >
              <!-- Ilha Dinâmica do Celular (visível apenas em 9:16) -->
              @if (selectedFormat() === 'story') {
                <div
                  class="absolute top-3 left-1/2 -translate-x-1/2 h-3.5 w-24 rounded-full bg-slate-900 z-20 flex items-center justify-center pointer-events-none"
                >
                  <div class="h-1.5 w-1.5 rounded-full bg-slate-950/80 mr-2.5"></div>
                  <div class="h-1.5 w-1.5 rounded-full bg-blue-950/80"></div>
                </div>
              }

              <!-- Conteúdo Interno do Story / Feed -->
              <div
                class="relative w-full h-full overflow-hidden p-5 sm:p-6 flex flex-col justify-between text-white transition-all duration-500 shadow-inner"
                [class]="selectedFormat() === 'story' ? 'rounded-[28px]' : 'rounded-[20px]'"
                [style.background]="
                  selectedBackground().tipo === 'gradient'
                    ? selectedBackground().bgGradientCss
                    : 'transparent'
                "
              >
                <!-- Imagem de Fundo (Foto real ou Foto do Usuário) -->
                @if (customImagePreview()) {
                  <img
                    [src]="customImagePreview()"
                    alt="Fundo personalizado do usuário"
                    class="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                } @else if (
                  selectedBackground().tipo === 'photo' && selectedBackground().imageUrl
                ) {
                  <img
                    [src]="selectedBackground().imageUrl"
                    [alt]="selectedBackground().nome"
                    class="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                }

                <!-- Camada de Escurecimento com Opacidade Ajustável (WCAG Contrast) -->
                <div
                  class="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  [style.backgroundColor]="'rgba(0,0,0,' + overlayOpacity() + ')'"
                ></div>

                <!-- Vinheta Suave Superior e Inferior -->
                <div
                  class="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/50"
                ></div>

                <!-- Borda Decorativa Acentuada -->
                <div
                  class="absolute inset-3 rounded-2xl border pointer-events-none opacity-40 transition-colors"
                  [style.borderColor]="selectedBackground().accentColor"
                ></div>

                <!-- Cabeçalho do Story / Card -->
                <div class="pt-4 text-center space-y-1 relative z-10">
                  <span
                    class="text-[10px] font-extrabold uppercase tracking-widest block transition-colors"
                    [style.color]="selectedBackground().accentColor"
                  >
                    IASD MANGUEIRAS • TATUÍ
                  </span>
                  <span
                    class="text-[11px] font-bold text-white/90 uppercase tracking-wider block"
                  >
                    Versículo do Dia
                  </span>
                </div>

                <!-- Corpo do Versículo Bíblico -->
                <div class="my-auto text-center space-y-2 px-1 relative z-10">
                  <span
                    class="font-serif text-3xl font-bold opacity-40 block leading-none transition-colors"
                    [style.color]="selectedBackground().accentColor"
                  >
                    “
                  </span>
                  <blockquote
                    class="font-serif italic leading-relaxed drop-shadow-md transition-all"
                    [class]="
                      selectedFormat() === 'story'
                        ? currentVerse().texto.length > 200
                          ? 'text-xs sm:text-sm'
                          : 'text-sm sm:text-base'
                        : currentVerse().texto.length > 200
                          ? 'text-xs'
                          : 'text-xs sm:text-sm'
                    "
                    [style.color]="selectedBackground().primaryTextColor"
                  >
                    {{ currentVerse().texto }}
                  </blockquote>
                  <span
                    class="font-serif text-3xl font-bold opacity-40 block leading-none transition-colors"
                    [style.color]="selectedBackground().accentColor"
                  >
                    ”
                  </span>

                  <div class="pt-1">
                    <span
                      class="inline-block rounded-full px-3.5 py-1 text-xs font-black tracking-wide border shadow-sm backdrop-blur-sm transition-colors"
                      [style.color]="selectedBackground().accentColor"
                      [style.borderColor]="selectedBackground().accentColor"
                      [style.backgroundColor]="'rgba(0,0,0,0.45)'"
                    >
                      — {{ currentVerse().referencia }} —
                    </span>
                  </div>
                </div>

                <!-- Rodapé Institucional -->
                <div class="pb-1 text-center space-y-0.5 relative z-10">
                  <span class="text-[9px] font-medium tracking-wider text-white/75 block">
                    iasdmangueiras.org.br
                  </span>
                </div>
              </div>
            </div>

            <!-- Botões de Ação do Estúdio -->
            <div class="mt-4 space-y-2.5 w-full min-w-0">
              <button
                type="button"
                (click)="downloadHighResImage()"
                [disabled]="isDownloading()"
                class="w-full rounded-2xl bg-advent-blue px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-advent-blue-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
              >
                @if (isDownloading()) {
                  <svg
                    class="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Gerando em Alta Resolução...</span>
                } @else {
                  <svg
                    class="h-4 w-4 fill-none shrink-0"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  <span>Baixar Imagem em Alta Resolução (PNG)</span>
                }
              </button>

              <button
                type="button"
                (click)="shareStoryGraphic()"
                [disabled]="isSharing()"
                class="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
              >
                @if (isSharing()) {
                  <svg
                    class="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Preparando...</span>
                } @else {
                  <svg
                    class="h-4 w-4 shrink-0 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                    />
                  </svg>
                  <span>Compartilhar no Instagram / WhatsApp</span>
                }
              </button>

              <button
                type="button"
                (click)="generateAndDownloadStory(true)"
                [disabled]="isDownloading()"
                class="w-full rounded-xl border border-advent-border bg-white px-3 py-2 text-[11px] font-bold text-advent-text hover:bg-slate-50 transition-all text-center cursor-pointer min-h-[44px]"
              >
                🔍 Pré-visualizar Imagem em Tela Cheia
              </button>

              @if (downloadSuccess()) {
                <div
                  class="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center text-xs font-bold text-emerald-700 animate-fadeIn"
                >
                  ✓ {{ downloadSuccess() }}
                </div>
              }

              <p class="text-[11px] text-center text-advent-muted">
                Renderização direta no navegador em resolução 1080p ({{
                  selectedFormat() === 'story' ? '1080×1920' : '1080×1080'
                }}).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal de Preview da Imagem Gerada em Alta Resolução -->
    @if (generatedPreviewUrl()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4"
        (click)="closePreviewModal()"
        role="dialog"
        aria-modal="true"
        aria-label="Pré-visualização do Story gerado"
      >
        <div
          class="relative flex flex-col items-center gap-4 max-h-[95vh]"
          (click)="$event.stopPropagation()"
        >
          <img
            [src]="generatedPreviewUrl()"
            alt="Preview do Story gerado com o versículo bíblico"
            class="max-h-[75vh] w-auto rounded-3xl shadow-2xl border-4 border-white/20 object-contain"
          />
          <div class="flex gap-3">
            <button
              type="button"
              (click)="closePreviewModal()"
              class="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              (click)="downloadGeneratedStory()"
              class="rounded-2xl bg-advent-blue px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-advent-blue-dark active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Baixar PNG
            </button>
          </div>
          <p class="text-xs text-white/50">Clique fora para fechar</p>
        </div>
      </div>
    }
  `,
})
export class EstudosVersiculoTabComponent {
  private readonly bibleService = inject(BibleService);
  private readonly verseAi = inject(VerseAiService);
  private readonly storyCanvas = inject(StoryCanvasService);

  readonly generatedPreviewUrl = signal<string | null>(null);
  private _pendingDownloadFilename = '';

  readonly selectedCategory = signal<string>('todas');
  readonly copyFeedback = signal<string | null>(null);

  // Estados da API Bíblica & Busca Dinâmica
  readonly bibleQuery = signal<string>('');
  readonly isSearchingBible = signal<boolean>(false);
  readonly searchError = signal<string | null>(null);
  readonly isDownloading = signal<boolean>(false);
  readonly isSharing = signal<boolean>(false);
  readonly downloadSuccess = signal<string | null>(null);

  readonly quickSuggestions = [
    'Salmos 23:1-2',
    'João 3:16',
    'Isaías 41:10',
    'Salmos 91:1-2',
    'Jeremias 29:11',
    'Romanos 8:28',
    'Filipenses 4:6',
    'Mateus 11:28',
  ];

  readonly backgroundPresets = STORY_BACKGROUND_PRESETS;
  readonly photoPresets = STORY_BACKGROUND_PRESETS.filter((p) => p.tipo === 'photo');
  readonly gradientPresets = STORY_BACKGROUND_PRESETS.filter((p) => p.tipo === 'gradient');
  readonly quickMoodChips = [
    'Ansioso',
    'Grato',
    'Cansado',
    'Com medo',
    'Em dúvida',
    'Buscando paz',
    'Precisando de fé',
  ];

  readonly verses = signal<DailyVerse[]>(this.bibleService.getCuratedVerses());
  readonly selectedBackground = signal<StoryBackground>(STORY_BACKGROUND_PRESETS[0]);
  readonly selectedTheme = computed(() => this.selectedBackground().id);
  readonly selectedFormat = signal<StoryFormat>('story');
  readonly overlayOpacity = signal<number>(STORY_BACKGROUND_PRESETS[0].defaultOverlayOpacity);
  readonly overlayOpacityPercent = computed(() => Math.round(this.overlayOpacity() * 100));
  readonly dimmingSliderFillPercent = computed(() => {
    const min = 35;
    const max = 85;
    const val = this.overlayOpacityPercent();
    const clamped = Math.max(min, Math.min(max, val));
    return Math.round(((clamped - min) / (max - min)) * 100);
  });
  readonly aiQuery = signal<string>('');
  readonly aiMatches = signal<SemanticVerseMatch[]>([]);
  readonly isSearchingAi = signal<boolean>(false);
  readonly customImagePreview = signal<string | null>(null);
  readonly activeBackgroundTab = signal<'photo' | 'gradient' | 'custom'>('photo');
  readonly currentVerse = signal<DailyVerse>(this.bibleService.getCuratedVerses()[0]);

  readonly filteredVerses = computed(() => {
    const list = this.verses();
    const cat = this.selectedCategory();
    if (cat === 'todas') return list;
    return list.filter((v) => v.categoria === cat);
  });

  readonly popularOnlineReferences: string[] = [
    'João 14:1-3',
    'Salmos 23:1-3',
    'Filipenses 4:13',
    'Isaías 40:31',
    'Jeremias 29:11',
    'Romanos 8:28',
    'Provérbios 3:5-6',
    'Salmos 91:1-2',
    'Josué 1:9',
    'Mateus 11:28-30',
    'Salmos 46:1',
    '2 Coríntios 12:9',
    '1 Pedro 5:7',
    'Sofonias 3:17',
    'Salmos 121:1-3',
    'Apocalipse 21:4',
    'João 3:16',
    'Salmos 37:5',
    'Isaías 41:10',
    'Lamentações 3:22-23',
  ];

  onBibleQueryInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.bibleQuery.set(val);
    this.searchError.set(null);
  }

  quickSearchPassage(ref: string): void {
    this.bibleQuery.set(ref);
    this.searchBiblePassage(ref);
  }

  searchBiblePassage(customPassage?: string): void {
    const query = (customPassage || this.bibleQuery()).trim();
    if (!query) return;

    this.isSearchingBible.set(true);
    this.searchError.set(null);

    this.bibleService.fetchPassage(query, 'Passagem Selecionada', 'geral').subscribe({
      next: (verse) => {
        this.currentVerse.set(verse);
        const currentList = this.verses();
        if (
          !currentList.some((v) => v.referencia.toLowerCase() === verse.referencia.toLowerCase())
        ) {
          this.verses.set([verse, ...currentList]);
        }
        this.isSearchingBible.set(false);
      },
      error: (err) => {
        this.searchError.set(
          err.message ||
            'Passagem não encontrada. Tente outra referência como "João 14:1" ou "Salmos 23:1".',
        );
        this.isSearchingBible.set(false);
      },
    });
  }

  drawRandomOnlineVerse(): void {
    const list = this.popularOnlineReferences;
    const randomIndex = Math.floor(Math.random() * list.length);
    const selectedRef = list[randomIndex];
    this.bibleQuery.set(selectedRef);
    this.searchBiblePassage();
  }

  setFormat(format: StoryFormat): void {
    this.selectedFormat.set(format);
  }

  selectBackground(bg: StoryBackground): void {
    this.selectedBackground.set(bg);
    this.overlayOpacity.set(bg.defaultOverlayOpacity ?? 0.5);
  }

  selectTheme(id: string): void {
    const bg = this.backgroundPresets.find((p) => p.id === id);
    if (bg) this.selectBackground(bg);
  }

  setBackgroundTab(tab: 'photo' | 'gradient' | 'custom'): void {
    this.activeBackgroundTab.set(tab);
  }

  setOverlayOpacity(val: number): void {
    const clamped = Math.min(0.85, Math.max(0.35, val));
    this.overlayOpacity.set(clamped);
  }

  onOpacityChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.setOverlayOpacity(val / 100);
  }

  onCustomPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      this.customImagePreview.set(dataUrl);
      const customBg: StoryBackground = {
        id: 'custom-user-photo',
        nome: 'Minha Foto Personalizada',
        tipo: 'custom',
        imageUrl: dataUrl,
        primaryTextColor: '#FFFFFF',
        accentColor: '#F59E0B',
        defaultOverlayOpacity: 0.6,
      };
      this.selectBackground(customBg);
      this.activeBackgroundTab.set('custom');
    };
    reader.readAsDataURL(file);
  }

  clearCustomImage(): void {
    this.customImagePreview.set(null);
    this.selectBackground(STORY_BACKGROUND_PRESETS[0]);
    this.activeBackgroundTab.set('photo');
  }

  onAiQueryInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.aiQuery.set(val);
  }

  async searchByFeeling(customQuery?: string): Promise<void> {
    const query = (customQuery !== undefined ? customQuery : this.aiQuery()).trim();
    if (!query) {
      this.aiMatches.set([]);
      return;
    }
    if (customQuery !== undefined) {
      this.aiQuery.set(customQuery);
    }

    this.isSearchingAi.set(true);
    try {
      const matches = await this.verseAi.findRelevantVerses(query);
      this.aiMatches.set(matches);
      if (matches.length > 0) {
        this.selectVerse(matches[0].verse);
      }
    } catch (err) {
      console.error('Erro na busca por sentimento:', err);
    } finally {
      this.isSearchingAi.set(false);
    }
  }

  selectAiMatch(match: SemanticVerseMatch): void {
    this.selectVerse(match.verse);
  }

  selectVerse(v: DailyVerse): void {
    this.currentVerse.set(v);
  }

  nextVerse(): void {
    const currentList = this.filteredVerses();
    const cur = this.currentVerse();
    const idx = currentList.findIndex((v) => v.id === cur.id);
    const nextIdx = (idx + 1) % currentList.length;
    this.currentVerse.set(currentList[nextIdx] || this.verses()[0]);
  }

  copyVerseText(): void {
    const v = this.currentVerse();
    const text = `"${v.texto}" — ${v.referencia}\n\nIASD Mangueiras • Tatuí\nhttps://iasdmangueiras.org.br`;
    navigator.clipboard?.writeText(text);
    this.copyFeedback.set('Copiado!');
    setTimeout(() => this.copyFeedback.set(null), 3000);
  }

  getWhatsAppShareLink(): string {
    const v = this.currentVerse();
    const text = encodeURIComponent(
      `*Versículo do Dia:*\n"${v.texto}"\n— _${v.referencia}_\n\nIgreja Adventista do Sétimo Dia das Mangueiras (Tatuí-SP)\nhttps://iasdmangueiras.org.br`,
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  }

  closePreviewModal(): void {
    const currentUrl = this.generatedPreviewUrl();
    if (currentUrl && currentUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentUrl);
    }
    this.generatedPreviewUrl.set(null);
  }

  async downloadHighResImage(): Promise<void> {
    this.isDownloading.set(true);
    this.downloadSuccess.set(null);

    try {
      const blob = await this.storyCanvas.renderStoryToBlob({
        verse: this.currentVerse(),
        background: this.selectedBackground(),
        format: this.selectedFormat(),
        overlayOpacity: this.overlayOpacity(),
        customImageUrl: this.customImagePreview(),
      });

      const filename = this.storyCanvas.generateFilename(
        this.currentVerse(),
        this.selectedFormat(),
      );

      this.storyCanvas.downloadStory(blob, filename);
      this.downloadSuccess.set('Imagem em alta resolução baixada com sucesso!');
      setTimeout(() => this.downloadSuccess.set(null), 4000);
    } catch (err) {
      console.error('Erro ao baixar imagem:', err);
    } finally {
      this.isDownloading.set(false);
    }
  }

  async shareStoryGraphic(): Promise<void> {
    this.isSharing.set(true);

    try {
      const blob = await this.storyCanvas.renderStoryToBlob({
        verse: this.currentVerse(),
        background: this.selectedBackground(),
        format: this.selectedFormat(),
        overlayOpacity: this.overlayOpacity(),
        customImageUrl: this.customImagePreview(),
      });

      const filename = this.storyCanvas.generateFilename(
        this.currentVerse(),
        this.selectedFormat(),
      );

      const shared = await this.storyCanvas.shareStory({
        blob,
        filename,
        title: `Versículo do Dia: ${this.currentVerse().referencia}`,
        text: `"${this.currentVerse().texto}" — ${this.currentVerse().referencia}\n\nIASD Mangueiras • Tatuí\nhttps://iasdmangueiras.org.br`,
      });

      if (shared) {
        this.copyFeedback.set('Compartilhado com sucesso!');
        setTimeout(() => this.copyFeedback.set(null), 3000);
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      this.copyVerseText();
    } finally {
      this.isSharing.set(false);
    }
  }

  async generateAndDownloadStory(openPreviewOnly = false): Promise<void> {
    if (openPreviewOnly) {
      this.isDownloading.set(true);
      try {
        const dataUrl = await this.storyCanvas.renderStoryToDataUrl({
          verse: this.currentVerse(),
          background: this.selectedBackground(),
          format: this.selectedFormat(),
          overlayOpacity: this.overlayOpacity(),
          customImageUrl: this.customImagePreview(),
        });
        this.generatedPreviewUrl.set(dataUrl);
        this._pendingDownloadFilename = this.storyCanvas.generateFilename(
          this.currentVerse(),
          this.selectedFormat(),
        );
      } catch (err) {
        console.error('Erro ao gerar preview:', err);
      } finally {
        this.isDownloading.set(false);
      }
      return;
    }

    await this.downloadHighResImage();
  }

  async shareStory(): Promise<void> {
    await this.shareStoryGraphic();
  }

  downloadGeneratedStory(): void {
    const dataUrl = this.generatedPreviewUrl();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = this._pendingDownloadFilename || 'versiculo.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
    }, 200);

    this.closePreviewModal();
  }
}
