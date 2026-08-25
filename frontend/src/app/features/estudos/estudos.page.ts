import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { SITE_CONFIG } from '../../core/site/site.config';
import { PequenoGrupo } from '../../core/models/content.models';
import { PgProfileCardComponent } from './pg-profile-card.component';
import { PgRecommenderService, PgMatch } from '../../core/services/pg-recommender.service';
import { UserProfileService, UserPgProfile } from '../../core/services/user-profile.service';
import { BibleService, DailyVerse } from '../../core/services/bible.service';
import { StoryFormat, StoryBackground, SemanticVerseMatch } from '../../core/models/story.models';
import { STORY_BACKGROUND_PRESETS } from '../../core/constants/story-presets';
import { VerseAiService } from '../../core/services/verse-ai.service';
import { StoryCanvasService } from '../../core/services/story-canvas.service';

@Component({
  selector: 'app-estudos-page',
  standalone: true,
  imports: [RouterLink, PgProfileCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-8 md:py-12 w-full overflow-x-clip">
      <div class="mx-auto max-w-site px-4 sm:px-6 w-full min-w-0">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" routerLink="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page"
            >Estudos Bíblicos & PGs</span
          >
        </nav>

        <header class="max-w-3xl">
          <span
            class="inline-block rounded-lg bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue border border-slate-200/60"
          >
            Crescimento Espiritual & Comunhão
          </span>
          <h1
            class="mt-3 text-3xl font-extrabold tracking-tight text-advent-text sm:text-4xl md:text-5xl"
          >
            Estudos Bíblicos & Pequenos Grupos
          </h1>
          <p class="mt-3 text-base sm:text-lg text-advent-muted leading-relaxed">
            Fortaleça sua fé através do estudo diário da Bíblia, participe de um Pequeno Grupo
            próximo a você em Tatuí e compartilhe mensagens de esperança.
          </p>
        </header>

        <!-- Alternador de Abas Principais (Sem quebras desordenadas e sem scroll lateral) -->
        <div class="mt-8 border-b border-advent-border w-full min-w-0">
          <nav
            class="flex gap-2 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth -mb-px w-full min-w-0"
            role="tablist"
            aria-label="Abas de Conteúdo"
          >
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="activeTab() === 'pgs'"
              class="pb-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all relative cursor-pointer inline-flex items-center gap-2 shrink-0 border-b-2"
              [class.border-advent-blue]="activeTab() === 'pgs'"
              [class.text-advent-blue]="activeTab() === 'pgs'"
              [class.border-transparent]="activeTab() !== 'pgs'"
              [class.text-advent-muted]="activeTab() !== 'pgs'"
              [class.hover:text-advent-text]="activeTab() !== 'pgs'"
              (click)="setTab('pgs')"
            >
              <svg
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
              <span>Pequenos Grupos (PGs)</span>
            </button>
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="activeTab() === 'licao'"
              class="pb-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all relative cursor-pointer inline-flex items-center gap-2 shrink-0 border-b-2"
              [class.border-advent-blue]="activeTab() === 'licao'"
              [class.text-advent-blue]="activeTab() === 'licao'"
              [class.border-transparent]="activeTab() !== 'licao'"
              [class.text-advent-muted]="activeTab() !== 'licao'"
              [class.hover:text-advent-text]="activeTab() !== 'licao'"
              (click)="setTab('licao')"
            >
              <svg
                class="h-4 w-4 shrink-0"
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
              <span>Lição da Escola Sabatina & Vídeos</span>
            </button>
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="activeTab() === 'versiculo'"
              class="pb-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all relative cursor-pointer inline-flex items-center gap-2 shrink-0 border-b-2"
              [class.border-advent-blue]="activeTab() === 'versiculo'"
              [class.text-advent-blue]="activeTab() === 'versiculo'"
              [class.border-transparent]="activeTab() !== 'versiculo'"
              [class.text-advent-muted]="activeTab() !== 'versiculo'"
              [class.hover:text-advent-text]="activeTab() !== 'versiculo'"
              (click)="setTab('versiculo')"
            >
              <svg
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
              <span>Versículo do Dia & Stories</span>
            </button>
          </nav>
        </div>

        <!-- ============================================================ -->
        <!-- ABA 1: PEQUENOS GRUPOS (PGs) -->
        <!-- ============================================================ -->
        @if (activeTab() === 'pgs') {
          <section class="mt-8 space-y-8 animate-fadeIn" aria-label="Lista de Pequenos Grupos">
            <!-- 1. Card de Perfil com Inteligência Artificial Local (Sem Cookies) -->
            <app-pg-profile-card
              [bairros]="availableBairros()"
              [perfis]="perfis"
              (profileSaved)="onProfileUpdated($event)"
              (profileCleared)="onProfileCleared()"
            />

            <!-- 2. Barra de Busca Semântica em Linguagem Natural (IA Neural) -->
            <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-sm">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="flex-1">
                  <label
                    for="semantic-search"
                    class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-advent-blue mb-1"
                  >
                    <span>🧠 Busca Inteligente em Linguagem Natural</span>
                    @if (isAiLoading()) {
                      <span
                        class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 animate-pulse"
                      >
                        Carregando modelo IA...
                      </span>
                    } @else if (isAiReady()) {
                      <span
                        class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800"
                      >
                        IA Pronta no Navegador
                      </span>
                    }
                  </label>
                  <div class="relative">
                    <input
                      id="semantic-search"
                      type="text"
                      [value]="searchQuery()"
                      (input)="onSearchInput($event)"
                      placeholder="Descreva o que procura... ex: 'jovens que se reúnem na sexta à noite perto do centro'"
                      class="w-full rounded-xl border border-advent-border bg-slate-50/50 px-4 py-2.5 pl-10 text-xs font-medium text-advent-text focus:border-advent-blue focus:bg-white focus:outline-none transition-colors"
                    />
                    <svg
                      class="absolute left-3.5 top-3 h-4 w-4 text-advent-muted"
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
                    @if (searchQuery()) {
                      <button
                        type="button"
                        (click)="clearSearch()"
                        class="absolute right-3 top-2.5 rounded-full p-1 text-xs text-advent-muted hover:bg-slate-200 hover:text-advent-text cursor-pointer"
                        title="Limpar busca"
                      >
                        ✕
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Seção de Recomendações por IA (Aparece se houver matches de IA) -->
            @if (recommendedPgs().length > 0) {
              <div
                class="rounded-3xl border border-advent-blue/20 bg-linear-to-b from-blue-50/40 via-white to-white p-6 shadow-xs animate-fadeIn"
              >
                <div class="flex items-center justify-between gap-2 mb-4">
                  <div class="flex items-center gap-2">
                    <span
                      class="flex h-7 w-7 items-center justify-center rounded-lg bg-advent-blue text-white text-xs font-bold"
                    >
                      ✨
                    </span>
                    <div>
                      <h3 class="text-base font-bold text-advent-text">Recomendados para Você</h3>
                      <p class="text-[11px] text-advent-muted">
                        Calculado por similaridade semântica via Universal Sentence Encoder
                      </p>
                    </div>
                  </div>
                  <span class="text-xs font-semibold text-advent-blue"
                    >Top {{ recommendedPgs().length }} Encontros</span
                  >
                </div>

                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
                  @for (match of recommendedPgs(); track match.pg.id || match.pg.nome) {
                    <article
                      class="flex flex-col justify-between rounded-2xl border-2 border-advent-blue/30 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden"
                    >
                      <div
                        class="absolute top-0 right-0 bg-advent-blue text-white px-3 py-0.5 rounded-bl-xl text-[10px] font-extrabold tracking-wider"
                      >
                        {{ match.matchPercentage }}% MATCH
                      </div>

                      <div>
                        <div class="flex items-center gap-2 pr-16">
                          <span
                            class="rounded bg-advent-blue/10 px-2 py-0.5 text-xs font-bold text-advent-blue"
                          >
                            {{ match.pg.bairro }}
                          </span>
                          <span
                            class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-advent-muted"
                          >
                            {{ match.pg.perfil }}
                          </span>
                        </div>

                        <h4 class="mt-2.5 text-base font-bold text-advent-text">
                          {{ match.pg.nome }}
                        </h4>
                        <p class="mt-1.5 text-xs text-advent-muted leading-relaxed line-clamp-3">
                          {{ match.pg.descricao }}
                        </p>

                        <div
                          class="mt-3.5 space-y-1 border-t border-advent-border/60 pt-2.5 text-xs text-advent-text"
                        >
                          <p class="flex items-center gap-1.5">
                            <span class="text-advent-muted">📅 Encontros:</span>
                            <strong>{{ match.pg.dia }} às {{ match.pg.horario }}</strong>
                          </p>
                          <p class="flex items-center gap-1.5">
                            <span class="text-advent-muted">👤 Líder:</span>
                            <span>{{ match.pg.lider }}</span>
                          </p>
                        </div>
                      </div>

                      <div
                        class="mt-5 pt-3 border-t border-advent-border flex items-center justify-between"
                      >
                        <a
                          [href]="getWhatsAppLink(match.pg)"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 transition-colors"
                        >
                          <svg
                            class="h-3.5 w-3.5 fill-current"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
                            />
                          </svg>
                          Falar com Líder
                        </a>
                        <a
                          routerLink="/contato"
                          class="text-xs font-semibold text-advent-blue hover:underline"
                        >
                          Como chegar →
                        </a>
                      </div>
                    </article>
                  }
                </div>
              </div>
            }

            <!-- 4. Filtros Convencionais e Lista Completa de PGs -->
            <div class="rounded-2xl border border-advent-border bg-white p-6 shadow-sm">
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 class="text-xl font-bold text-advent-text">
                    Todos os Pequenos Grupos em Tatuí
                  </h2>
                  <p class="text-xs text-advent-muted mt-0.5">
                    Explore todos os lares abertos ou filtre por localização e faixa etária.
                  </p>
                </div>

                <!-- Filtro por Bairro -->
                <div class="flex items-center gap-2">
                  <label for="bairro-filter" class="text-xs font-semibold text-advent-muted"
                    >Bairro:</label
                  >
                  <select
                    id="bairro-filter"
                    [value]="selectedBairro()"
                    (change)="onBairroChange($event)"
                    class="rounded-card border border-advent-border bg-white px-3 py-1.5 text-xs font-medium text-advent-text focus:border-advent-blue focus:outline-none"
                  >
                    <option value="Todos">Todos os Bairros</option>
                    @for (b of availableBairros(); track b) {
                      <option [value]="b">{{ b }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Filtros de Perfil / Público -->
              <div class="mt-6 flex flex-wrap gap-2 pt-4 border-t border-advent-border">
                <span class="text-xs font-semibold text-advent-muted self-center mr-1"
                  >Perfil:</span
                >
                @for (perfil of perfis; track perfil) {
                  <button
                    type="button"
                    (click)="selectedPerfil.set(perfil)"
                    class="rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer"
                    [class.bg-advent-blue]="selectedPerfil() === perfil"
                    [class.text-white]="selectedPerfil() === perfil"
                    [class.shadow-xs]="selectedPerfil() === perfil"
                    [class.bg-slate-100]="selectedPerfil() !== perfil"
                    [class.text-advent-text]="selectedPerfil() !== perfil"
                    [class.hover:bg-slate-200]="selectedPerfil() !== perfil"
                  >
                    {{ perfil }}
                  </button>
                }
              </div>
            </div>

            <!-- Cards de Todos os PGs -->
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
              @for (pg of filteredPgs(); track pg.id || pg.nome) {
                <article
                  class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    <div class="flex items-center justify-between gap-2">
                      <span
                        class="rounded bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold text-advent-blue"
                      >
                        {{ pg.bairro }}
                      </span>
                      <span
                        class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-advent-muted"
                      >
                        {{ pg.perfil }}
                      </span>
                    </div>

                    <h3 class="mt-3 text-lg font-bold text-advent-text">{{ pg.nome }}</h3>
                    <p class="mt-2 text-xs text-advent-muted leading-relaxed">{{ pg.descricao }}</p>

                    <div
                      class="mt-4 space-y-1.5 border-t border-advent-border/60 pt-3 text-xs text-advent-text"
                    >
                      <p class="flex items-center gap-1.5">
                        <span class="text-advent-muted">📅 Encontros:</span>
                        <strong>{{ pg.dia }} às {{ pg.horario }}</strong>
                      </p>
                      <p class="flex items-center gap-1.5">
                        <span class="text-advent-muted">👤 Líder:</span>
                        <span>{{ pg.lider }}</span>
                      </p>
                      @if (pg.anfitriao) {
                        <p class="flex items-center gap-1.5">
                          <span class="text-advent-muted">🏠 Anfitrião:</span>
                          <span>{{ pg.anfitriao }}</span>
                        </p>
                      }
                    </div>
                  </div>

                  <div
                    class="mt-6 pt-4 border-t border-advent-border flex items-center justify-between"
                  >
                    <a
                      [href]="getWhatsAppLink(pg)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 transition-colors"
                    >
                      <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
                        />
                      </svg>
                      Falar com Líder
                    </a>

                    <a
                      routerLink="/contato"
                      class="text-xs font-semibold text-advent-blue hover:underline"
                    >
                      Como chegar →
                    </a>
                  </div>
                </article>
              } @empty {
                <div
                  class="col-span-full rounded-2xl border border-dashed border-advent-border bg-white p-12 text-center text-advent-muted"
                >
                  Nenhum Pequeno Grupo encontrado com os filtros selecionados. Tente selecionar
                  outro perfil ou bairro.
                </div>
              }
            </div>
          </section>
        }

        <!-- ============================================================ -->
        <!-- ABA 2: LIÇÃO DA ESCOLA SABATINA & VÍDEOS -->
        <!-- ============================================================ -->
        @if (activeTab() === 'licao') {
          <section class="mt-8 space-y-12 animate-fadeIn" aria-label="Lição da Escola Sabatina">
            <!-- Destaque: Plataforma Open-Source Sabbath School (Adventech) -->
            <div
              class="overflow-hidden rounded-3xl border border-blue-200 bg-linear-to-br from-advent-blue/5 via-white to-blue-50/20 p-6 md:p-8 shadow-xs"
            >
              <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div class="space-y-3 max-w-2xl">
                  <div class="flex items-center gap-2">
                    <span
                      class="rounded-full bg-advent-blue px-3 py-1 text-xs font-extrabold uppercase text-white shadow-xs"
                    >
                      🔥 Open-Source & Leitor Web
                    </span>
                    <span
                      class="rounded-full bg-white border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-advent-blue"
                    >
                      Sabbath School (Adventech)
                    </span>
                  </div>

                  <h2 class="text-2xl md:text-3xl font-extrabold text-advent-text leading-tight">
                    Estudo Diário da Lição no Navegador
                  </h2>

                  <p class="text-sm text-advent-muted leading-relaxed">
                    Acesse o leitor interativo aberto da Escola Sabatina com textos bíblicos
                    embutidos, versículos de memória, comentários e suporte offline em múltiplos
                    idiomas.
                  </p>

                  <div class="pt-2 flex flex-wrap gap-3">
                    <a
                      href="https://sabbath-school.adventech.io/pt"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 rounded-xl bg-advent-blue px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-advent-blue-dark active:scale-[0.98] transition-all"
                    >
                      Abrir Leitor Interativo Adventech ↗
                    </a>
                    <a
                      href="https://www.adventistas.org/pt/escolasabatina/"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 rounded-xl border border-advent-border bg-white px-5 py-2.5 text-xs font-bold text-advent-text hover:bg-gray-50 transition-all shadow-xs"
                    >
                      Portal Oficial Adventistas ↗
                    </a>
                  </div>
                </div>

                <div
                  class="w-full lg:w-80 shrink-0 bg-white p-5 rounded-2xl border border-advent-border shadow-sm space-y-2"
                >
                  <span class="text-xs font-bold uppercase tracking-wider text-advent-blue block"
                    >Recursos Inclusos:</span
                  >
                  <ul class="space-y-1.5 text-xs text-advent-text">
                    <li class="flex items-center gap-2">
                      ✓ <strong>Leitura Diária:</strong> Domingo a Sábado
                    </li>
                    <li class="flex items-center gap-2">
                      ✓ <strong>Textos Bíblicos:</strong> Clique e leia o verso
                    </li>
                    <li class="flex items-center gap-2">
                      ✓ <strong>Guia do Professor:</strong> Esboços didáticos
                    </li>
                    <li class="flex items-center gap-2">
                      ✓ <strong>Multilíngue:</strong> PT, EN, ES, FR
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Canais Parceiros em Destaque (Lamed, Presente 7, TV Novo Tempo e CPB) -->
            <div>
              <div class="max-w-2xl mb-6">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
                  >Canais Recomendados</span
                >
                <h2 class="mt-1 text-2xl font-bold text-advent-text">
                  Aprofunde seu Estudo com Especialistas
                </h2>
                <p class="mt-1 text-sm text-advent-muted">
                  Canais dedicados à transmissão e estudo aprofundado da Lição da Escola Sabatina.
                </p>
              </div>

              <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full min-w-0">
                <!-- 1. Canal Lamed (Laranja) -->
                <div
                  class="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-orange-200/90 bg-gradient-to-b from-orange-50/90 via-orange-50/30 to-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-400"
                >
                  <div
                    class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-orange-400/15 blur-2xl pointer-events-none"
                  ></div>

                  <div class="relative z-10">
                    <!-- Eyebrow Badge Row: Sem colisão e sem corte -->
                    <div class="flex items-center justify-between gap-2 mb-4">
                      <span
                        class="inline-flex items-center rounded-full bg-orange-100/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-orange-900 border border-orange-200/80"
                      >
                        Juventude & Reflexão
                      </span>
                      <span
                        class="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-700"
                      >
                        <span class="h-2 w-2 rounded-full bg-orange-500"></span>
                        YouTube
                      </span>
                    </div>

                    <!-- Identity Block: Avatar + Título & @ -->
                    <div class="flex items-center gap-3.5">
                      <div
                        class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-orange-200 shadow-md shadow-orange-500/10 p-1 transition-transform duration-300 group-hover:scale-105 overflow-hidden"
                      >
                        <img
                          src="/logos/lamed-logo.png"
                          alt="Logo Canal Lamed"
                          class="h-full w-full object-contain scale-120 drop-shadow-xs"
                          loading="lazy"
                        />
                      </div>
                      <div class="min-w-0 flex-1">
                        <h3
                          class="text-xl font-black text-advent-text tracking-tight truncate leading-tight"
                        >
                          Canal Lamed
                        </h3>
                        <p
                          class="mt-0.5 text-xs font-bold text-orange-700 flex items-center gap-0.5"
                        >
                          <span class="opacity-75">@</span>Lamed148
                        </p>
                      </div>
                    </div>

                    <p class="mt-3.5 text-xs text-advent-muted leading-relaxed min-h-[58px]">
                      Estudos semanais das Sagradas Escrituras voltados para adolescentes e jovens,
                      articulando princípios bíblicos atemporais com reflexões contemporâneas e
                      práticas para o cotidiano.
                    </p>

                    <div class="mt-4 flex flex-wrap gap-1.5">
                      <span
                        class="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-800 border border-orange-200/70"
                      >
                        Jovens & Adolescentes
                      </span>
                      <span
                        class="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-800 border border-orange-200/70"
                      >
                        Reflexão Contemporânea
                      </span>
                    </div>
                  </div>

                  <div class="relative z-10 mt-6 pt-4 border-t border-orange-100/80">
                    <a
                      href="https://www.youtube.com/@Lamed148"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-[0.98] transition-all"
                      aria-label="Acessar Canal Lamed no YouTube"
                    >
                      <svg
                        class="h-4 w-4 fill-current shrink-0"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                        />
                      </svg>
                      Assistir no YouTube ↗
                    </a>
                  </div>
                </div>

                <!-- 2. Michelson Borges (Emerald) -->
                <div
                  class="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/90 via-emerald-50/30 to-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-400"
                >
                  <div
                    class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none"
                  ></div>

                  <div class="relative z-10">
                    <!-- Eyebrow Badge Row -->
                    <div class="flex items-center justify-between gap-2 mb-4">
                      <span
                        class="inline-flex items-center rounded-full bg-emerald-100/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 border border-emerald-200/80"
                      >
                        Comentários & Dicas
                      </span>
                      <span
                        class="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700"
                      >
                        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Semanal
                      </span>
                    </div>

                    <!-- Identity Block: Avatar + Título & @ -->
                    <div class="flex items-center gap-3.5">
                      <div
                        class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-700 via-teal-800 to-emerald-950 border-2 border-emerald-500/40 text-white shadow-md shadow-emerald-950/20 p-2 transition-transform duration-300 group-hover:scale-105 overflow-hidden"
                      >
                        <span
                          class="font-sans text-2xl font-black tracking-tight text-white drop-shadow-xs"
                          >MB</span
                        >
                      </div>
                      <div class="min-w-0 flex-1">
                        <h3
                          class="text-xl font-black text-advent-text tracking-tight truncate leading-tight"
                        >
                          Michelson Borges
                        </h3>
                        <p
                          class="mt-0.5 text-xs font-bold text-emerald-700 flex items-center gap-0.5"
                        >
                          <span class="opacity-75">@</span>MichelsonBorges
                        </p>
                      </div>
                    </div>

                    <p class="mt-3.5 text-xs text-advent-muted leading-relaxed min-h-[58px]">
                      Comentários dinâmicos da Lição da Escola Sabatina, fidelidade ao texto bíblico
                      e orientações pedagógicas para professores e estudantes da Bíblia.
                    </p>

                    <div class="mt-4 flex flex-wrap gap-1.5">
                      <span
                        class="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/70"
                      >
                        Professores de ES
                      </span>
                      <span
                        class="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/70"
                      >
                        Didática Bíblica
                      </span>
                    </div>
                  </div>

                  <div class="relative z-10 mt-6 pt-4 border-t border-emerald-100/80">
                    <a
                      href="https://www.youtube.com/@MichelsonBorges"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-[0.98] transition-all"
                      aria-label="Acessar Canal do Pr. Michelson Borges no YouTube"
                    >
                      <svg
                        class="h-4 w-4 fill-current shrink-0"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                        />
                      </svg>
                      Assistir no YouTube ↗
                    </a>
                  </div>
                </div>

                <!-- 3. Presente 7 (Rose Escuro) -->
                <div
                  class="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-rose-200/90 bg-gradient-to-b from-rose-50/90 via-rose-50/30 to-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-rose-400"
                >
                  <div
                    class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-rose-400/15 blur-2xl pointer-events-none"
                  ></div>

                  <div class="relative z-10">
                    <!-- Eyebrow Badge Row -->
                    <div class="flex items-center justify-between gap-2 mb-4">
                      <span
                        class="inline-flex items-center rounded-full bg-rose-100/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-rose-900 border border-rose-200/80"
                      >
                        IASD Mangueiras
                      </span>
                      <span
                        class="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-800"
                      >
                        <span class="h-2 w-2 rounded-full bg-rose-600"></span>
                        Canal Local
                      </span>
                    </div>

                    <!-- Identity Block: Avatar + Título & @ -->
                    <div class="flex items-center gap-3.5">
                      <div
                        class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-800 via-rose-900 to-pink-950 border-2 border-rose-600/40 text-white shadow-md shadow-rose-950/25 p-2 transition-transform duration-300 group-hover:scale-105 overflow-hidden"
                      >
                        <span
                          class="font-sans text-3xl font-black tracking-tight text-white drop-shadow-sm"
                          >7</span
                        >
                      </div>
                      <div class="min-w-0 flex-1">
                        <h3
                          class="text-xl font-black text-advent-text tracking-tight truncate leading-tight"
                        >
                          Presente 7
                        </h3>
                        <p class="mt-0.5 text-xs font-bold text-rose-800 flex items-center gap-0.5">
                          <span class="opacity-75">@</span>IASDMangueiras
                        </p>
                      </div>
                    </div>

                    <p class="mt-3.5 text-xs text-advent-muted leading-relaxed min-h-[58px]">
                      Série semanal da nossa igreja no YouTube com comentários dos pastores e
                      professores da Escola Sabatina das Mangueiras.
                    </p>

                    <div class="mt-4 flex flex-wrap gap-1.5">
                      <span
                        class="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-900 border border-rose-200/70"
                      >
                        Projeto Maná
                      </span>
                      <span
                        class="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-900 border border-rose-200/70"
                      >
                        Estudo Diário
                      </span>
                    </div>
                  </div>

                  <div class="relative z-10 mt-6 pt-4 border-t border-rose-100/80">
                    <a
                      href="https://www.youtube.com/@IASDMangueiras"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-800 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-rose-900 active:scale-[0.98] transition-all"
                      aria-label="Acessar Canal da IASD Mangueiras no YouTube"
                    >
                      <svg
                        class="h-4 w-4 fill-current shrink-0"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                        />
                      </svg>
                      Assistir no YouTube ↗
                    </a>
                  </div>
                </div>

                <!-- 4. CPB / Lições da Bíblia (Advent Blue) -->
                <div
                  class="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-blue-200/90 bg-gradient-to-b from-blue-50/90 via-blue-50/30 to-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-400"
                >
                  <div
                    class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-400/15 blur-2xl pointer-events-none"
                  ></div>

                  <div class="relative z-10">
                    <!-- Eyebrow Badge Row -->
                    <div class="flex items-center justify-between gap-2 mb-4">
                      <span
                        class="inline-flex items-center rounded-full bg-blue-100/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-advent-blue border border-blue-200/80"
                      >
                        Oficial CPB
                      </span>
                      <span
                        class="inline-flex items-center gap-1.5 text-[11px] font-bold text-advent-blue"
                      >
                        <span class="h-2 w-2 rounded-full bg-advent-blue"></span>
                        Lições
                      </span>
                    </div>

                    <!-- Identity Block: Avatar + Título & @ -->
                    <div class="flex items-center gap-3.5">
                      <div
                        class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-blue-200 shadow-md shadow-blue-500/10 p-2 transition-transform duration-300 group-hover:scale-105 overflow-hidden"
                      >
                        <img
                          src="/logos/licoes-logo.png"
                          alt="Logo Lições da Bíblia CPB"
                          class="h-full w-full object-contain drop-shadow-xs"
                          loading="lazy"
                        />
                      </div>
                      <div class="min-w-0 flex-1">
                        <h3
                          class="text-xl font-black text-advent-text tracking-tight truncate leading-tight"
                        >
                          Lições da Bíblia
                        </h3>
                        <p
                          class="mt-0.5 text-xs font-bold text-advent-blue flex items-center gap-0.5"
                        >
                          <span class="opacity-75">@</span>LicoesdaBiblia
                        </p>
                      </div>
                    </div>

                    <p class="mt-3.5 text-xs text-advent-muted leading-relaxed min-h-[58px]">
                      Programa oficial da Casa Publicadora Brasileira e TV Novo Tempo com o Pr.
                      Vinícius Mendes e teólogos convidados debatendo os temas do trimestre.
                    </p>

                    <div class="mt-4 flex flex-wrap gap-1.5">
                      <span
                        class="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-advent-blue border border-blue-200/70"
                      >
                        Pr. Vinícius Mendes
                      </span>
                      <span
                        class="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-advent-blue border border-blue-200/70"
                      >
                        TV Novo Tempo
                      </span>
                    </div>
                  </div>

                  <div class="relative z-10 mt-6 pt-4 border-t border-blue-100/80">
                    <a
                      href="https://www.youtube.com/@LicoesdaBiblia"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="w-full flex items-center justify-center gap-2 rounded-xl bg-advent-blue px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-advent-blue-dark active:scale-[0.98] transition-all"
                      aria-label="Acessar Lições da Bíblia no YouTube"
                    >
                      <svg
                        class="h-4 w-4 fill-current shrink-0"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                        />
                      </svg>
                      Assistir no YouTube ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Portais das Lições por Faixa Etária e Materiais -->
            <div class="border-t border-advent-border pt-10">
              <div class="max-w-2xl">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
                  >Recursos & Materiais</span
                >
                <h2 class="mt-1 text-2xl font-bold text-advent-text">
                  Lições e Materiais por Faixa Etária
                </h2>
                <p class="mt-1 text-sm text-advent-muted">
                  Acesse os portais oficiais com materiais didáticos, guias de estudo e recursos
                  complementares.
                </p>
              </div>

              <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <!-- Adultos -->
                <a
                  href="https://sabbath-school.adventech.io/pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group rounded-3xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-advent-blue hover:shadow-md block"
                >
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-advent-blue font-bold shadow-xs transition-transform group-hover:scale-110"
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
                        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                  </div>
                  <h3
                    class="mt-4 text-lg font-bold text-advent-text group-hover:text-advent-blue transition-colors"
                  >
                    Lição dos Adultos
                  </h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Guia temático semanal no Leitor Adventech com versículos comentados e estudo
                    diário.
                  </p>
                  <span
                    class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-advent-blue"
                    >Ler Online ↗</span
                  >
                </a>

                <!-- Jovens -->
                <a
                  href="https://www.adventistas.org/pt/jovens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group rounded-3xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500 hover:shadow-md block"
                >
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-bold shadow-xs transition-transform group-hover:scale-110"
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
                        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                      />
                    </svg>
                  </div>
                  <h3
                    class="mt-4 text-lg font-bold text-advent-text group-hover:text-amber-600 transition-colors"
                  >
                    Ministério Jovem
                  </h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Textos práticos e temas focados na juventude, fé e desafios do cotidiano.
                  </p>
                  <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600"
                    >Acessar Portal ↗</span
                  >
                </a>

                <!-- Universitários -->
                <a
                  href="https://dialogue.adventist.org/pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group rounded-3xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-600 hover:shadow-md block"
                >
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold shadow-xs transition-transform group-hover:scale-110"
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
                        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                      />
                    </svg>
                  </div>
                  <h3
                    class="mt-4 text-lg font-bold text-advent-text group-hover:text-emerald-600 transition-colors"
                  >
                    Diálogo Universitário
                  </h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Revista internacional oficial de fé, ciência e razão para universitários e
                    profissionais.
                  </p>
                  <span
                    class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600"
                    >Ler Artigos ↗</span
                  >
                </a>

                <!-- Crianças -->
                <a
                  href="https://www.adventistas.org/pt/criancas/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group rounded-3xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-600 hover:shadow-md block"
                >
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 font-bold shadow-xs transition-transform group-hover:scale-110"
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
                        d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                      />
                    </svg>
                  </div>
                  <h3
                    class="mt-4 text-lg font-bold text-advent-text group-hover:text-purple-600 transition-colors"
                  >
                    Ministério da Criança
                  </h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Histórias ilustradas e materiais para Rol do Berço, Jardim, Primários e Juvenis.
                  </p>
                  <span
                    class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple-600"
                    >Acessar Portal ↗</span
                  >
                </a>
              </div>

              <!-- Links Complementares de Estudo e Livros -->
              <div class="mt-6 grid gap-4 sm:grid-cols-3">
                <a
                  href="https://escolasabatina.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-2xl border border-advent-border bg-slate-50/70 p-4 hover:bg-white hover:border-advent-blue hover:shadow-xs transition-all flex items-center justify-between group"
                >
                  <div>
                    <strong
                      class="text-xs text-advent-text block group-hover:text-advent-blue transition-colors"
                      >EscolaSabatina.net</strong
                    >
                    <span class="text-[11px] text-advent-muted"
                      >Slides e Esboços para Professores</span
                    >
                  </div>
                  <span class="text-xs font-bold text-advent-blue">↗</span>
                </a>

                <a
                  href="https://mais.cpb.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-2xl border border-advent-border bg-slate-50/70 p-4 hover:bg-white hover:border-advent-blue hover:shadow-xs transition-all flex items-center justify-between group"
                >
                  <div>
                    <strong
                      class="text-xs text-advent-text block group-hover:text-advent-blue transition-colors"
                      >CPB Mais</strong
                    >
                    <span class="text-[11px] text-advent-muted">Livros e Materiais Oficiais</span>
                  </div>
                  <span class="text-xs font-bold text-advent-blue">↗</span>
                </a>

                <a
                  href="https://m.egwwritings.org/pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-2xl border border-advent-border bg-slate-50/70 p-4 hover:bg-white hover:border-advent-blue hover:shadow-xs transition-all flex items-center justify-between group"
                >
                  <div>
                    <strong
                      class="text-xs text-advent-text block group-hover:text-advent-blue transition-colors"
                      >Ellen G. White Writings</strong
                    >
                    <span class="text-[11px] text-advent-muted">Espírito de Profecia Online</span>
                  </div>
                  <span class="text-xs font-bold text-advent-blue">↗</span>
                </a>
              </div>
            </div>
          </section>
        }

        <!-- ============================================================ -->
        <!-- ABA 3: VERSÍCULO DO DIA & ESTÚDIO DE STORIES -->
        <!-- ============================================================ -->
        @if (activeTab() === 'versiculo') {
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
                    Crie belos cards e stories com passagens bíblicas para compartilhar no
                    Instagram, WhatsApp e redes sociais.
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
                    Como você está se sentindo hoje? Digite sua emoção ou necessidade e a IA
                    encontrará a promessa bíblica ideal:
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
                  <div class="flex flex-wrap gap-1.5 pt-1">
                    <span class="text-[11px] text-advent-muted py-1">Sentimentos:</span>
                    @for (mood of quickMoodChips; track mood) {
                      <button
                        type="button"
                        (click)="searchByFeeling(mood)"
                        class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-advent-text hover:bg-advent-blue/10 hover:text-advent-blue transition-colors cursor-pointer min-h-[32px]"
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
                      Ajuste o contraste escuro sobre a foto para garantir máxima legibilidade do
                      texto sagrado.
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
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
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
        }
      </div>
    </main>

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
          <!-- Imagem gerada -->
          <img
            [src]="generatedPreviewUrl()"
            alt="Preview do Story gerado com o versículo bíblico"
            class="max-h-[75vh] w-auto rounded-3xl shadow-2xl border-4 border-white/20 object-contain"
          />
          <!-- Ações do Modal -->
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
export class EstudosPage {
  readonly generatedPreviewUrl = signal<string | null>(null);
  private _pendingDownloadFilename = '';

  private readonly contentService = inject(ContentService);
  private readonly seo = inject(SeoService);
  private readonly recommender = inject(PgRecommenderService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly bibleService = inject(BibleService);
  private readonly verseAi = inject(VerseAiService);
  private readonly storyCanvas = inject(StoryCanvasService);
  protected readonly site = SITE_CONFIG;

  readonly activeTab = signal<'pgs' | 'licao' | 'versiculo'>('pgs');
  readonly selectedPerfil = signal<string>('Todos');
  readonly selectedBairro = signal<string>('Todos');
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

  // Estados da IA Neural de Recomendação de PGs
  readonly searchQuery = signal<string>('');
  readonly recommendedPgs = signal<PgMatch[]>([]);
  readonly isAiLoading = computed(() => this.recommender.isLoading());
  readonly isAiReady = computed(() => this.recommender.isReady());

  readonly perfis = [
    'Todos',
    'Geral',
    'Jovens (JA)',
    'Famílias',
    'Casais',
    'Universitários',
    'Melhor Idade',
  ];

  protected readonly pgs = () => this.contentService.pgs();

  // Presets e Estados do Estúdio de Stories & Feed
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
  // ponytail: alias de compatibilidade para caches e hot-reload anteriores
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

  constructor() {
    this.seo.apply({
      title: 'Estudos Bíblicos, Pequenos Grupos & Lição — IASD Mangueiras',
      description:
        'Encontre um Pequeno Grupo próximo a você em Tatuí, assista à playlist do Presente 7 no canal da IASD Mangueiras e aos estudos do Canal Lamed.',
      path: '/estudos',
    });

    // Se o usuário já tiver perfil salvo no LocalStorage, inicializa recomendação automática
    effect(() => {
      const pgsList = this.pgs();
      const profile = this.userProfileService.profile();
      if (pgsList.length > 0 && profile) {
        this.runProfileRecommendation(profile, pgsList);
      }
    });
  }

  onProfileUpdated(profile: UserPgProfile): void {
    const list = this.pgs();
    this.runProfileRecommendation(profile, list);
  }

  onProfileCleared(): void {
    this.recommendedPgs.set([]);
  }

  private async runProfileRecommendation(
    profile: UserPgProfile,
    pgs: readonly PequenoGrupo[] | PequenoGrupo[],
  ): Promise<void> {
    const query = this.userProfileService.buildQueryFromProfile(profile);
    if (!query) {
      this.recommendedPgs.set([]);
      return;
    }
    const matches = await this.recommender.recommend(query, pgs, 3);
    this.recommendedPgs.set(matches);
  }

  private searchDebounceTimer?: any;
  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);

    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(async () => {
      const query = this.searchQuery().trim();
      const list = this.pgs();
      if (!query) {
        const profile = this.userProfileService.profile();
        if (profile) {
          this.runProfileRecommendation(profile, list);
        } else {
          this.recommendedPgs.set([]);
        }
        return;
      }

      const matches = await this.recommender.recommend(query, list, 3);
      this.recommendedPgs.set(matches);
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    const list = this.pgs();
    const profile = this.userProfileService.profile();
    if (profile) {
      this.runProfileRecommendation(profile, list);
    } else {
      this.recommendedPgs.set([]);
    }
  }

  readonly availableBairros = computed(() => {
    const list = this.pgs();
    return Array.from(new Set(list.map((p) => p.bairro))).filter(Boolean);
  });

  readonly filteredPgs = computed(() => {
    const list = this.pgs();
    const perfil = this.selectedPerfil();
    const bairro = this.selectedBairro();

    return list.filter((p) => {
      const matchPerfil = perfil === 'Todos' || p.perfil === perfil;
      const matchBairro = bairro === 'Todos' || p.bairro === bairro;
      return matchPerfil && matchBairro;
    });
  });

  setTab(tab: 'pgs' | 'licao' | 'versiculo'): void {
    this.activeTab.set(tab);
  }

  onBairroChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedBairro.set(val);
  }

  getWhatsAppLink(pg: PequenoGrupo): string {
    const cleanPhone = pg.telefone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá ${pg.lider}! Vi o Pequeno Grupo "${pg.nome}" no site da IASD Mangueiras e gostaria de participar dos encontros!`,
    );
    return `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${msg}`;
  }

  // Ações de Busca Bíblica na API
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

        // Adiciona à lista caso não exista
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

  // ponytail: alias de compatibilidade para hot-reload
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
