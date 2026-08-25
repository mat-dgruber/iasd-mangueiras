import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { SITE_CONFIG } from '../../core/site/site.config';
import { PequenoGrupo, LicaoVideo } from '../../core/models/content.models';
import { PgProfileCardComponent } from './pg-profile-card.component';
import { PgRecommenderService, PgMatch } from '../../core/services/pg-recommender.service';
import { UserProfileService, UserPgProfile } from '../../core/services/user-profile.service';

interface DailyVerse {
  id: string;
  texto: string;
  referencia: string;
  tema: string;
  categoria: 'paz' | 'esperanca' | 'oracao' | 'coragem' | 'amor';
}

interface StoryTheme {
  id: string;
  nome: string;
  bgGradientCss: string;
  primaryColor: string;
  accentColor: string;
  canvasColors: [string, string, string];
}

@Component({
  selector: 'app-estudos-page',
  standalone: true,
  imports: [RouterLink, PgProfileCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" routerLink="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page">Estudos Bíblicos & PGs</span>
        </nav>

        <header class="max-w-3xl">
          <span class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
            Crescimento Espiritual & Comunhão
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Estudos Bíblicos & Pequenos Grupos
          </h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Fortaleça sua fé através do estudo diário da Bíblia, participe de um Pequeno Grupo próximo a você em Tatuí e compartilhe mensagens de esperança.
          </p>
        </header>

        <!-- Alternador de Abas Principais -->
        <div class="mt-10 flex flex-wrap border-b border-advent-border gap-2" role="tablist">
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeTab() === 'pgs'"
            class="pb-3.5 px-4 text-sm font-bold transition-colors relative cursor-pointer inline-flex items-center gap-2"
            [class.text-advent-blue]="activeTab() === 'pgs'"
            [class.text-advent-muted]="activeTab() !== 'pgs'"
            (click)="setTab('pgs')"
          >
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            Pequenos Grupos (PGs)
            @if (activeTab() === 'pgs') {
              <span class="absolute bottom-0 left-0 right-0 h-[3px] bg-advent-blue rounded-t-full"></span>
            }
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeTab() === 'licao'"
            class="pb-3.5 px-4 text-sm font-bold transition-colors relative cursor-pointer inline-flex items-center gap-2"
            [class.text-advent-blue]="activeTab() === 'licao'"
            [class.text-advent-muted]="activeTab() !== 'licao'"
            (click)="setTab('licao')"
          >
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Lição da Escola Sabatina & Vídeos
            @if (activeTab() === 'licao') {
              <span class="absolute bottom-0 left-0 right-0 h-[3px] bg-advent-blue rounded-t-full"></span>
            }
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeTab() === 'versiculo'"
            class="pb-3.5 px-4 text-sm font-bold transition-colors relative cursor-pointer inline-flex items-center gap-2"
            [class.text-advent-blue]="activeTab() === 'versiculo'"
            [class.text-advent-muted]="activeTab() !== 'versiculo'"
            (click)="setTab('versiculo')"
          >
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            Versículo do Dia & Stories
            @if (activeTab() === 'versiculo') {
              <span class="absolute bottom-0 left-0 right-0 h-[3px] bg-advent-blue rounded-t-full"></span>
            }
          </button>
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
                  <label for="semantic-search" class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-advent-blue mb-1">
                    <span>🧠 Busca Inteligente em Linguagem Natural</span>
                    @if (isAiLoading()) {
                      <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 animate-pulse">
                        Carregando modelo IA...
                      </span>
                    } @else if (isAiReady()) {
                      <span class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
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
                    <svg class="absolute left-3.5 top-3 h-4 w-4 text-advent-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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
              <div class="rounded-3xl border border-advent-blue/20 bg-linear-to-b from-blue-50/40 via-white to-white p-6 shadow-xs animate-fadeIn">
                <div class="flex items-center justify-between gap-2 mb-4">
                  <div class="flex items-center gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-advent-blue text-white text-xs font-bold">
                      ✨
                    </span>
                    <div>
                      <h3 class="text-base font-bold text-advent-text">Recomendados para Você</h3>
                      <p class="text-[11px] text-advent-muted">Calculado por similaridade semântica via Universal Sentence Encoder</p>
                    </div>
                  </div>
                  <span class="text-xs font-semibold text-advent-blue">Top {{ recommendedPgs().length }} Encontros</span>
                </div>

                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  @for (match of recommendedPgs(); track (match.pg.id || match.pg.nome)) {
                    <article class="flex flex-col justify-between rounded-2xl border-2 border-advent-blue/30 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden">
                      <div class="absolute top-0 right-0 bg-advent-blue text-white px-3 py-0.5 rounded-bl-xl text-[10px] font-extrabold tracking-wider">
                        {{ match.matchPercentage }}% MATCH
                      </div>

                      <div>
                        <div class="flex items-center gap-2 pr-16">
                          <span class="rounded bg-advent-blue/10 px-2 py-0.5 text-xs font-bold text-advent-blue">
                            {{ match.pg.bairro }}
                          </span>
                          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-advent-muted">
                            {{ match.pg.perfil }}
                          </span>
                        </div>

                        <h4 class="mt-2.5 text-base font-bold text-advent-text">{{ match.pg.nome }}</h4>
                        <p class="mt-1.5 text-xs text-advent-muted leading-relaxed line-clamp-3">{{ match.pg.descricao }}</p>

                        <div class="mt-3.5 space-y-1 border-t border-advent-border/60 pt-2.5 text-xs text-advent-text">
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

                      <div class="mt-5 pt-3 border-t border-advent-border flex items-center justify-between">
                        <a
                          [href]="getWhatsAppLink(match.pg)"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 transition-colors"
                        >
                          <svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                          </svg>
                          Falar com Líder
                        </a>
                        <a routerLink="/contato" class="text-xs font-semibold text-advent-blue hover:underline">
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
                  <h2 class="text-xl font-bold text-advent-text">Todos os Pequenos Grupos em Tatuí</h2>
                  <p class="text-xs text-advent-muted mt-0.5">
                    Explore todos os lares abertos ou filtre por localização e faixa etária.
                  </p>
                </div>

                <!-- Filtro por Bairro -->
                <div class="flex items-center gap-2">
                  <label for="bairro-filter" class="text-xs font-semibold text-advent-muted">Bairro:</label>
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
                <span class="text-xs font-semibold text-advent-muted self-center mr-1">Perfil:</span>
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
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              @for (pg of filteredPgs(); track (pg.id || pg.nome)) {
                <article class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div>
                    <div class="flex items-center justify-between gap-2">
                      <span class="rounded bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold text-advent-blue">
                        {{ pg.bairro }}
                      </span>
                      <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-advent-muted">
                        {{ pg.perfil }}
                      </span>
                    </div>

                    <h3 class="mt-3 text-lg font-bold text-advent-text">{{ pg.nome }}</h3>
                    <p class="mt-2 text-xs text-advent-muted leading-relaxed">{{ pg.descricao }}</p>

                    <div class="mt-4 space-y-1.5 border-t border-advent-border/60 pt-3 text-xs text-advent-text">
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

                  <div class="mt-6 pt-4 border-t border-advent-border flex items-center justify-between">
                    <a
                      [href]="getWhatsAppLink(pg)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 transition-colors"
                    >
                      <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                      Falar com Líder
                    </a>

                    <a routerLink="/contato" class="text-xs font-semibold text-advent-blue hover:underline">
                      Como chegar →
                    </a>
                  </div>
                </article>
              } @empty {
                <div class="col-span-full rounded-2xl border border-dashed border-advent-border bg-white p-12 text-center text-advent-muted">
                  Nenhum Pequeno Grupo encontrado com os filtros selecionados. Tente selecionar outro perfil ou bairro.
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
            <div class="overflow-hidden rounded-3xl border border-blue-200 bg-linear-to-br from-advent-blue/5 via-white to-blue-50/20 p-6 md:p-8 shadow-xs">
              <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div class="space-y-3 max-w-2xl">
                  <div class="flex items-center gap-2">
                    <span class="rounded-full bg-advent-blue px-3 py-1 text-xs font-extrabold uppercase text-white shadow-xs">
                      🔥 Open-Source & Leitor Web
                    </span>
                    <span class="rounded-full bg-white border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-advent-blue">
                      Sabbath School (Adventech)
                    </span>
                  </div>

                  <h2 class="text-2xl md:text-3xl font-extrabold text-advent-text leading-tight">
                    Estudo Diário da Lição no Navegador
                  </h2>

                  <p class="text-sm text-advent-muted leading-relaxed">
                    Acesse o leitor interativo aberto da Escola Sabatina com textos bíblicos embutidos, versículos de memória, comentários e suporte offline em múltiplos idiomas.
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

                <div class="w-full lg:w-80 shrink-0 bg-white p-5 rounded-2xl border border-advent-border shadow-sm space-y-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-advent-blue block">Recursos Inclusos:</span>
                  <ul class="space-y-1.5 text-xs text-advent-text">
                    <li class="flex items-center gap-2">✓ <strong>Leitura Diária:</strong> Domingo a Sábado</li>
                    <li class="flex items-center gap-2">✓ <strong>Textos Bíblicos:</strong> Clique e leia o verso</li>
                    <li class="flex items-center gap-2">✓ <strong>Guia do Professor:</strong> Esboços didáticos</li>
                    <li class="flex items-center gap-2">✓ <strong>Multilíngue:</strong> PT, EN, ES, FR</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Canais Parceiros em Destaque (Lamed, Presente 7 e CPB) -->
            <div>
              <div class="max-w-2xl mb-6">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Canais Recomendados</span>
                <h2 class="mt-1 text-2xl font-bold text-advent-text">Aprofunde seu Estudo com Especialistas</h2>
                <p class="mt-1 text-sm text-advent-muted">
                  Canais dedicados à transmissão e estudo aprofundado da Lição da Escola Sabatina.
                </p>
              </div>

              <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <!-- Canal Lamed -->
                <div class="group flex flex-col justify-between rounded-3xl border border-indigo-200/80 bg-linear-to-b from-indigo-50/80 via-white to-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div>
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-700 to-indigo-900 text-white shadow-md transition-transform group-hover:scale-105">
                        <span class="font-serif text-2xl font-black tracking-tight">ל</span>
                      </div>
                      <span class="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-800">
                        Exegese & Teologia
                      </span>
                    </div>

                    <h3 class="mt-4 text-xl font-black text-advent-text">Canal Lamed</h3>
                    
                    <p class="mt-2 text-xs text-advent-muted leading-relaxed">
                      Estudos profundos versículo por versículo com análise das línguas originais (hebraico/grego), contexto histórico-gramatical e materiais pedagógicos semanais.
                    </p>

                    <div class="mt-4 flex flex-wrap gap-1.5">
                      <span class="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                        Hebraico & Grego
                      </span>
                      <span class="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                        Bundles Semanais
                      </span>
                    </div>
                  </div>

                  <div class="mt-6 pt-4 border-t border-indigo-100 flex items-center justify-between">
                    <a
                      href="https://www.youtube.com/@Lamed148"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                      <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Canal Lamed ↗
                    </a>

                    <span class="text-[11px] font-bold text-indigo-700">YouTube Oficial</span>
                  </div>
                </div>

                <!-- Presente 7 (Canal IASD Mangueiras) -->
                <div class="group flex flex-col justify-between rounded-3xl border border-amber-200/80 bg-linear-to-b from-amber-50/80 via-white to-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div>
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-amber-500 to-orange-600 text-white shadow-md transition-transform group-hover:scale-105">
                        <span class="font-sans text-2xl font-black tracking-tight">7</span>
                      </div>
                      <span class="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                        IASD Mangueiras
                      </span>
                    </div>

                    <h3 class="mt-4 text-xl font-black text-advent-text">Presente 7</h3>
                    
                    <p class="mt-2 text-xs text-advent-muted leading-relaxed">
                      Série semanal e diária da nossa igreja no YouTube com comentários dos pastores e professores da Escola Sabatina das Mangueiras.
                    </p>

                    <div class="mt-4 flex flex-wrap gap-1.5">
                      <span class="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-100">
                        Projeto Maná
                      </span>
                      <span class="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-100">
                        Estudo Diário
                      </span>
                    </div>
                  </div>

                  <div class="mt-6 pt-4 border-t border-amber-100 flex items-center justify-between">
                    <a
                      href="https://www.youtube.com/@IASDMangueiras"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors"
                    >
                      <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Canal Oficial ↗
                    </a>

                    <span class="text-[11px] font-bold text-amber-800">@IASDMangueiras</span>
                  </div>
                </div>

                <!-- CPB / Lições da Bíblia -->
                <div class="group flex flex-col justify-between rounded-3xl border border-blue-200/80 bg-linear-to-b from-blue-50/80 via-white to-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div>
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-sky-600 to-blue-800 text-white shadow-md transition-transform group-hover:scale-105">
                        <span class="font-sans text-lg font-black tracking-wider">CPB</span>
                      </div>
                      <span class="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-advent-blue">
                        Oficial CPB
                      </span>
                    </div>

                    <h3 class="mt-4 text-xl font-black text-advent-text">Lições da Bíblia</h3>
                    
                    <p class="mt-2 text-xs text-advent-muted leading-relaxed">
                      Programa oficial da Casa Publicadora Brasileira e TV Novo Tempo com o Pr. Adolfo Suárez e teólogos convidados debatendo os temas do trimestre.
                    </p>

                    <div class="mt-4 flex flex-wrap gap-1.5">
                      <span class="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-advent-blue border border-blue-100">
                        Pr. Adolfo Suárez
                      </span>
                      <span class="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-advent-blue border border-blue-100">
                        TV Novo Tempo
                      </span>
                    </div>
                  </div>

                  <div class="mt-6 pt-4 border-t border-blue-100 flex items-center justify-between">
                    <a
                      href="https://www.youtube.com/@LicoesdaBiblia"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 rounded-xl bg-advent-blue px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-advent-blue-dark transition-colors"
                    >
                      <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Lições da Bíblia ↗
                    </a>

                    <span class="text-[11px] font-bold text-advent-blue">Casa Publicadora</span>
                  </div>
                </div>

                <!-- TV Novo Tempo -->
                <div class="group flex flex-col justify-between rounded-3xl border border-teal-200/80 bg-linear-to-b from-teal-50/80 via-white to-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div>
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-teal-600 to-emerald-700 text-white shadow-md transition-transform group-hover:scale-105">
                        <span class="font-sans text-base font-black tracking-tighter text-center leading-tight">NT</span>
                      </div>
                      <span class="rounded-full bg-teal-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-teal-800">
                        TV Oficial
                      </span>
                    </div>

                    <h3 class="mt-4 text-xl font-black text-advent-text">TV Novo Tempo</h3>

                    <p class="mt-2 text-xs text-advent-muted leading-relaxed">
                      Canal oficial adventista no Brasil com programas espirituais, notícias, transmissões ao vivo e estudos bíblicos 24 horas por dia.
                    </p>

                    <div class="mt-4 flex flex-wrap gap-1.5">
                      <span class="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-100">
                        Ao Vivo 24h
                      </span>
                      <span class="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-100">
                        TV Adventista
                      </span>
                    </div>
                  </div>

                  <div class="mt-6 pt-4 border-t border-teal-100 flex items-center justify-between">
                    <a
                      href="https://www.youtube.com/@novotempo"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-colors"
                    >
                      <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      TV Novo Tempo ↗
                    </a>

                    <span class="text-[11px] font-bold text-teal-800">@novotempo</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Portais das Lições por Faixa Etária e Materiais -->
            <div class="border-t border-advent-border pt-10">
              <div class="max-w-2xl">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Recursos & Materiais</span>
                <h2 class="mt-1 text-2xl font-bold text-advent-text">Lições e Materiais por Faixa Etária</h2>
                <p class="mt-1 text-sm text-advent-muted">
                  Acesse os portais oficiais com materiais didáticos, guias de estudo e recursos complementares.
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
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-advent-blue font-bold shadow-xs transition-transform group-hover:scale-110">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <h3 class="mt-4 text-lg font-bold text-advent-text group-hover:text-advent-blue transition-colors">Lição dos Adultos</h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Guia temático semanal no Leitor Adventech com versículos comentados e estudo diário.
                  </p>
                  <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-advent-blue">Ler Online ↗</span>
                </a>

                <!-- Jovens -->
                <a
                  href="https://www.adventistas.org/pt/jovens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group rounded-3xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500 hover:shadow-md block"
                >
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-bold shadow-xs transition-transform group-hover:scale-110">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <h3 class="mt-4 text-lg font-bold text-advent-text group-hover:text-amber-600 transition-colors">Ministério Jovem</h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Textos práticos e temas focados na juventude, fé e desafios do cotidiano.
                  </p>
                  <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600">Acessar Portal ↗</span>
                </a>

                <!-- Universitários -->
                <a
                  href="https://dialogue.adventist.org/pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group rounded-3xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-600 hover:shadow-md block"
                >
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold shadow-xs transition-transform group-hover:scale-110">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                  </div>
                  <h3 class="mt-4 text-lg font-bold text-advent-text group-hover:text-emerald-600 transition-colors">Diálogo Universitário</h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Revista internacional oficial de fé, ciência e razão para universitários e profissionais.
                  </p>
                  <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600">Ler Artigos ↗</span>
                </a>

                <!-- Crianças -->
                <a
                  href="https://www.adventistas.org/pt/criancas/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group rounded-3xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-600 hover:shadow-md block"
                >
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 font-bold shadow-xs transition-transform group-hover:scale-110">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                    </svg>
                  </div>
                  <h3 class="mt-4 text-lg font-bold text-advent-text group-hover:text-purple-600 transition-colors">Ministério da Criança</h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Histórias ilustradas e materiais para Rol do Berço, Jardim, Primários e Juvenis.
                  </p>
                  <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple-600">Acessar Portal ↗</span>
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
                    <strong class="text-xs text-advent-text block group-hover:text-advent-blue transition-colors">EscolaSabatina.net</strong>
                    <span class="text-[11px] text-advent-muted">Slides e Esboços para Professores</span>
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
                    <strong class="text-xs text-advent-text block group-hover:text-advent-blue transition-colors">CPB Mais</strong>
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
                    <strong class="text-xs text-advent-text block group-hover:text-advent-blue transition-colors">Ellen G. White Writings</strong>
                    <span class="text-[11px] text-advent-muted">Espírito de Profecia Online</span>
                  </div>
                  <span class="text-xs font-bold text-advent-blue">↗</span>
                </a>
              </div>
            </div>

            <!-- Vídeos da Semana com Links Oficiais -->
            <div class="border-t border-advent-border pt-10">
              <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div class="max-w-2xl">
                  <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Vídeos & Comentários</span>
                  <h2 class="mt-1 text-2xl font-bold text-advent-text">Estudos e Comentários da Semana</h2>
                  <p class="mt-1 text-sm text-advent-muted">
                    Assista aos comentários em vídeo produzidos pela IASD Mangueiras e canais parceiros.
                  </p>
                </div>

                <!-- Filtro de Canais de Vídeo -->
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    (click)="selectedVideoCategory.set('todos')"
                    class="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    [class]="selectedVideoCategory() === 'todos' ? 'bg-advent-blue text-white shadow-xs' : 'bg-slate-100 text-advent-text hover:bg-slate-200'"
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    (click)="selectedVideoCategory.set('presente7')"
                    class="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    [class]="selectedVideoCategory() === 'presente7' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-advent-text hover:bg-slate-200'"
                  >
                    🎁 Presente 7 (IASD Mangueiras)
                  </button>
                  <button
                    type="button"
                    (click)="selectedVideoCategory.set('lamed')"
                    class="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    [class]="selectedVideoCategory() === 'lamed' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-advent-text hover:bg-slate-200'"
                  >
                    🦁 Canal Lamed
                  </button>
                  <button
                    type="button"
                    (click)="selectedVideoCategory.set('cpb')"
                    class="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    [class]="selectedVideoCategory() === 'cpb' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-advent-text hover:bg-slate-200'"
                  >
                    📺 CPB / Novo Tempo
                  </button>
                </div>
              </div>

              <!-- Grid de Vídeos com Cards Modernos e Ação Direta -->
              <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                @for (vid of filteredLicaoVideos(); track vid.id) {
                  <article class="group flex flex-col justify-between overflow-hidden rounded-3xl border border-advent-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <div>
                      <!-- Capa com Thumbnail e Botão de Play Direto -->
                      <a
                        [href]="vid.video_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="relative aspect-video w-full overflow-hidden bg-slate-900 block cursor-pointer"
                        [attr.aria-label]="'Assistir ' + vid.titulo + ' no YouTube'"
                      >
                        <img
                          [src]="vid.thumbnail_url"
                          [alt]="vid.titulo"
                          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div class="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity group-hover:bg-black/20">
                          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110">
                            <svg class="h-6 w-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>

                        @if (vid.duracao) {
                          <span class="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                            {{ vid.duracao }}
                          </span>
                        }
                      </a>

                      <div class="p-6">
                        <div class="flex items-center gap-2 mb-2">
                          <span
                            class="rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            [class]="
                              vid.categoria === 'lamed'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : vid.categoria === 'presente7'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                            "
                          >
                            {{ vid.canal }}
                          </span>
                        </div>

                        <h3 class="text-lg font-bold text-advent-text leading-snug">{{ vid.titulo }}</h3>
                        
                        @if (vid.descricao) {
                          <p class="mt-2 text-xs text-advent-muted leading-relaxed">{{ vid.descricao }}</p>
                        }

                        <p class="mt-3 text-xs font-semibold text-advent-blue">
                          Apresentado por: {{ vid.autor }}
                        </p>
                      </div>
                    </div>

                    <div class="p-6 pt-0 border-t border-advent-border/50 flex items-center justify-between">
                      <a
                        [href]="vid.video_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
                      >
                        <svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        Assistir Playlist ↗
                      </a>

                      <span class="text-xs font-semibold text-advent-muted">YouTube</span>
                    </div>
                  </article>
                }
              </div>
            </div>
          </section>
        }

        <!-- ============================================================ -->
        <!-- ABA 3: VERSÍCULO DO DIA & ESTÚDIO DE STORIES -->
        <!-- ============================================================ -->
        @if (activeTab() === 'versiculo') {
          <section class="mt-8 animate-fadeIn" aria-label="Versículo do Dia e Estúdio de Stories">
            
            <div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
              
              <!-- PAINEL ESQUERDO: CONTROLES & SELEÇÃO DE VERSÍCULO -->
              <div class="space-y-6">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Estúdio de Compartilhamento</span>
                  <h2 class="mt-1 text-2xl md:text-3xl font-extrabold text-advent-text">Versículo & Gerador de Stories</h2>
                  <p class="mt-1 text-sm text-advent-muted">
                    Selecione uma promessa bíblica inspiradora, personalize o estilo visual e gere imagens prontas para Instagram e WhatsApp.
                  </p>
                </div>

                <!-- Filtros Rápidos por Tema -->
                <div class="rounded-3xl border border-advent-border bg-white p-6 shadow-sm space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Filtrar por Sentimento:</span>
                    <button
                      type="button"
                      (click)="nextVerse()"
                      class="inline-flex items-center gap-1 text-xs font-bold text-advent-blue hover:underline cursor-pointer"
                    >
                      <span>Sortear Promessa</span>
                      <span>↻</span>
                    </button>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      (click)="selectedCategory.set('todas')"
                      class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer"
                      [class]="selectedCategory() === 'todas' ? 'bg-advent-blue text-white shadow-xs' : 'bg-slate-100 text-advent-text hover:bg-slate-200'"
                    >
                      ✨ Todos
                    </button>
                    <button
                      type="button"
                      (click)="selectedCategory.set('paz')"
                      class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer"
                      [class]="selectedCategory() === 'paz' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-advent-text hover:bg-slate-200'"
                    >
                      🕊️ Paz & Conforto
                    </button>
                    <button
                      type="button"
                      (click)="selectedCategory.set('esperanca')"
                      class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer"
                      [class]="selectedCategory() === 'esperanca' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-advent-text hover:bg-slate-200'"
                    >
                      🌅 Esperança & Futuro
                    </button>
                    <button
                      type="button"
                      (click)="selectedCategory.set('oracao')"
                      class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer"
                      [class]="selectedCategory() === 'oracao' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-advent-text hover:bg-slate-200'"
                    >
                      🙏 Oração & Serenidade
                    </button>
                    <button
                      type="button"
                      (click)="selectedCategory.set('coragem')"
                      class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer"
                      [class]="selectedCategory() === 'coragem' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-advent-text hover:bg-slate-200'"
                    >
                      🛡️ Coragem & Força
                    </button>
                    <button
                      type="button"
                      (click)="selectedCategory.set('amor')"
                      class="rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer"
                      [class]="selectedCategory() === 'amor' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-advent-text hover:bg-slate-200'"
                    >
                      ❤️ Amor & Graça
                    </button>
                  </div>
                </div>

                <!-- Seletor de Versículos da Categoria -->
                <div class="rounded-3xl border border-advent-border bg-white p-6 shadow-sm space-y-4">
                  <span class="text-xs font-bold uppercase tracking-wider text-advent-blue block">Escolha o Versículo:</span>
                  
                  <div class="grid gap-2 max-h-56 overflow-y-auto pr-1">
                    @for (v of filteredVerses(); track v.id) {
                      <button
                        type="button"
                        (click)="selectVerse(v)"
                        class="w-full text-left rounded-2xl p-3 text-xs transition-all flex items-center justify-between border cursor-pointer"
                        [class]="
                          currentVerse().id === v.id
                            ? 'border-advent-blue bg-blue-50/70 text-advent-text font-bold shadow-xs'
                            : 'border-advent-border/60 bg-white text-advent-muted hover:border-advent-blue/50 hover:bg-slate-50'
                        "
                      >
                        <div class="truncate pr-2">
                          <strong class="text-advent-text block truncate">{{ v.referencia }}</strong>
                          <span class="text-[11px] font-normal text-advent-muted truncate block">“{{ v.texto }}”</span>
                        </div>
                        <span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-advent-muted">
                          {{ v.tema }}
                        </span>
                      </button>
                    }
                  </div>
                </div>

                <!-- Personalização Visual do Story -->
                <div class="rounded-3xl border border-advent-border bg-white p-6 shadow-sm space-y-4">
                  <span class="text-xs font-bold uppercase tracking-wider text-advent-blue block">Tema Visual do Story:</span>
                  
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    @for (theme of storyThemes; track theme.id) {
                      <button
                        type="button"
                        (click)="selectedTheme.set(theme)"
                        class="flex flex-col items-center gap-2 rounded-2xl p-3 border transition-all cursor-pointer text-center"
                        [class]="
                          selectedTheme().id === theme.id
                            ? 'border-advent-blue ring-2 ring-advent-blue/20 bg-blue-50/40 shadow-xs'
                            : 'border-advent-border bg-white hover:border-slate-300'
                        "
                      >
                        <div class="h-10 w-full rounded-xl shadow-inner border border-white/20" [style.background]="theme.bgGradientCss"></div>
                        <span class="text-[11px] font-bold text-advent-text">{{ theme.nome }}</span>
                      </button>
                    }
                  </div>
                </div>

                <!-- Ações Rápidas de Compartilhamento -->
                <div class="rounded-3xl border border-advent-border bg-white p-6 shadow-sm space-y-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-advent-blue block">Compartilhamento Rápido:</span>
                  
                  <div class="flex flex-wrap gap-3">
                    <button
                      type="button"
                      (click)="copyVerseText()"
                      class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-advent-border px-4 py-3 text-xs font-bold text-advent-text hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <svg class="h-4 w-4 shrink-0 text-advent-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      {{ copyFeedback() || 'Copiar Texto' }}
                    </button>

                    <a
                      [href]="getWhatsAppShareLink()"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-green-800 transition-colors"
                    >
                      <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                      Enviar no WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <!-- PAINEL DIREITO: LIVE PREVIEW EM DISPOSITIVO MOBILE (MOCKUP INTERATIVO) -->
              <div class="lg:sticky lg:top-24 flex flex-col items-center">
                
                <div class="w-full max-w-sm">
                  <div class="flex items-center justify-between pb-3 px-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Pré-Visualização em Tempo Real:</span>
                    <span class="text-[11px] font-semibold text-advent-muted">Formato 9:16 (Story)</span>
                  </div>

                  <!-- Frame do Celular / Story -->
                  <div class="relative overflow-hidden rounded-[36px] border-[6px] border-slate-900 bg-slate-950 p-2 shadow-2xl">
                    
                    <!-- Ilha do Celular -->
                    <div class="absolute top-4 left-1/2 -translate-x-1/2 h-4 w-28 rounded-full bg-slate-900 z-20 flex items-center justify-center">
                      <div class="h-2 w-2 rounded-full bg-slate-950/80 mr-3"></div>
                      <div class="h-2 w-2 rounded-full bg-blue-900/60"></div>
                    </div>

                    <!-- Conteúdo do Story -->
                    <div
                      class="relative aspect-[9/16] w-full rounded-[28px] overflow-hidden p-6 flex flex-col justify-between text-white transition-all duration-500 shadow-inner"
                      [style.background]="selectedTheme().bgGradientCss"
                    >
                      <!-- Borda Decorativa Dourada/Acentuada -->
                      <div class="absolute inset-3 rounded-2xl border pointer-events-none opacity-40" [style.borderColor]="selectedTheme().accentColor"></div>

                      <!-- Cabeçalho do Story -->
                      <div class="pt-6 text-center space-y-1 relative z-10">
                        <span class="text-[10px] font-extrabold uppercase tracking-widest block" [style.color]="selectedTheme().accentColor">
                          IASD Mangueiras • Tatuí
                        </span>
                        <span class="text-[11px] font-bold text-white/90 uppercase tracking-wider block">
                          Versículo do Dia
                        </span>
                      </div>

                      <!-- Corpo do Versículo -->
                      <div class="my-auto text-center space-y-4 px-2 relative z-10">
                        <span class="font-serif text-3xl font-bold opacity-30 block leading-none" [style.color]="selectedTheme().accentColor">
                          “
                        </span>
                        <blockquote class="font-serif italic text-base md:text-lg leading-relaxed text-white/95 drop-shadow-xs">
                          {{ currentVerse().texto }}
                        </blockquote>
                        <span class="font-serif text-3xl font-bold opacity-30 block leading-none" [style.color]="selectedTheme().accentColor">
                          ”
                        </span>
                        
                        <div class="pt-2">
                          <span
                            class="inline-block rounded-full px-4 py-1 text-xs font-black tracking-wide border shadow-sm"
                            [style.color]="selectedTheme().accentColor"
                            [style.borderColor]="selectedTheme().accentColor"
                            [style.backgroundColor]="'rgba(0,0,0,0.3)'"
                          >
                            — {{ currentVerse().referencia }}
                          </span>
                        </div>
                      </div>

                      <!-- Rodapé do Story -->
                      <div class="pb-3 text-center space-y-1 relative z-10">
                        <span class="text-[9px] font-medium tracking-wider text-white/70 block">
                          iasdmangueiras.org.br
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Botão de Download Principal em Alta Resolução -->
                  <div class="mt-4 space-y-2">
                    <button
                      type="button"
                      (click)="generateAndDownloadStory()"
                      class="w-full rounded-2xl bg-advent-blue px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-advent-blue-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg class="h-4 w-4 fill-none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Baixar Story em Alta Resolução (PNG)
                    </button>
                    <p class="text-[11px] text-center text-advent-muted">
                      Imagem gerada em 1080×1920px (9:16) ideal para Instagram e WhatsApp.
                    </p>
                  </div>
                </div>

                <!-- Canvas de renderização em alta resolução (oculto) -->
                <div class="hidden">
                  <canvas #storyCanvas width="1080" height="1920"></canvas>
                </div>
              </div>

            </div>
          </section>
        }
      </div>
    </main>

    <!-- Modal de Preview da Imagem Gerada -->
    @if (generatedPreviewUrl()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4"
        (click)="generatedPreviewUrl.set(null)"
        role="dialog"
        aria-modal="true"
        aria-label="Pré-visualização do Story gerado"
      >
        <div class="relative flex flex-col items-center gap-4 max-h-[95vh]" (click)="$event.stopPropagation()">
          <!-- Imagem gerada -->
          <img
            [src]="generatedPreviewUrl()"
            alt="Preview do Story gerado com o versículo bíblico"
            class="max-h-[75vh] w-auto rounded-3xl shadow-2xl border-4 border-white/20 object-contain"
          />
          <!-- Ações -->
          <div class="flex gap-3">
            <button
              type="button"
              (click)="generatedPreviewUrl.set(null)"
              class="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              (click)="downloadGeneratedStory()"
              class="rounded-2xl bg-advent-blue px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-advent-blue-dark active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
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
  @ViewChild('storyCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly generatedPreviewUrl = signal<string | null>(null);
  private _pendingDownloadFilename = '';

  private readonly contentService = inject(ContentService);
  private readonly seo = inject(SeoService);
  private readonly recommender = inject(PgRecommenderService);
  private readonly userProfileService = inject(UserProfileService);
  protected readonly site = SITE_CONFIG;

  readonly activeTab = signal<'pgs' | 'licao' | 'versiculo'>('pgs');
  readonly selectedPerfil = signal<string>('Todos');
  readonly selectedBairro = signal<string>('Todos');
  readonly selectedVideoCategory = signal<string>('todos');
  readonly selectedCategory = signal<string>('todas');
  readonly copyFeedback = signal<string | null>(null);

  // Estados da IA Neural no Navegador
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

  private async runProfileRecommendation(profile: UserPgProfile, pgs: readonly PequenoGrupo[] | PequenoGrupo[]): Promise<void> {
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

  readonly licaoVideos: LicaoVideo[] = [
    {
      id: 'Presente7-Mangueiras',
      titulo: 'Presente 7 — Comentários da Lição (IASD Mangueiras)',
      canal: 'IASD Mangueiras',
      autor: 'Pastores & Professores IASD Mangueiras',
      video_url: 'https://www.youtube.com/@IASDMangueiras',
      thumbnail_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
      categoria: 'presente7',
      duracao: '15 min',
      descricao: 'Série oficial da IASD Mangueiras com estudos diários, reflexões pastorais e recapitulação da Lição da Escola Sabatina.',
    },
    {
      id: 'Lamed-Estudos',
      titulo: 'Estudos Bíblicos & Exegese da Lição — Canal Lamed',
      canal: 'Canal Lamed',
      autor: 'Professores & Teólogos do Lamed',
      video_url: 'https://www.youtube.com/@Lamed148',
      thumbnail_url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80',
      categoria: 'lamed',
      duracao: '45 min',
      descricao: 'Estudo aprofundado com análise das línguas bíblicas originais, contexto histórico e aplicações espirituais sólidas.',
    },
    {
      id: 'CPB-LicoesBiblia',
      titulo: 'Lições da Bíblia Oficial — CPB & TV Novo Tempo',
      canal: 'Casa Publicadora Brasileira',
      autor: 'Pr. Adolfo Suárez & Convidados',
      video_url: 'https://www.youtube.com/@LicoesdaBiblia',
      thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
      categoria: 'cpb',
      duracao: '30 min',
      descricao: 'Apresentação oficial semanal com debates teológicos e aplicações espirituais da Lição dos Adultos.',
    },
    {
      id: 'Michelson-Borges',
      titulo: 'Comentários da Lição — Pr. Michelson Borges',
      canal: 'Pr. Michelson Borges',
      autor: 'Pr. Michelson Borges',
      video_url: 'https://www.youtube.com/@MichelsonBorges',
      thumbnail_url: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=800&q=80',
      categoria: 'cpb',
      duracao: '20 min',
      descricao: 'Análise dinâmica, fidelidade ao texto e dicas pedagógicas para os alunos e professores da Escola Sabatina.',
    },
  ];

  readonly filteredLicaoVideos = computed(() => {
    const cat = this.selectedVideoCategory();
    if (cat === 'todos') return this.licaoVideos;
    return this.licaoVideos.filter((v) => v.categoria === cat);
  });

  readonly verses: DailyVerse[] = [
    {
      id: 'salmos-23',
      texto:
        'O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.',
      referencia: 'Salmos 23:1-2',
      tema: 'Confiança & Paz',
      categoria: 'paz',
    },
    {
      id: 'jeremias-29',
      texto:
        'Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.',
      referencia: 'Jeremias 29:11',
      tema: 'Esperança & Futuro',
      categoria: 'esperanca',
    },
    {
      id: 'filipenses-4',
      texto:
        'Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.',
      referencia: 'Filipenses 4:6',
      tema: 'Oração & Serenidade',
      categoria: 'oracao',
    },
    {
      id: 'mateus-11',
      texto:
        'Venham a mim, todos os que estão cansados e sobrecarregados, e eu darei descanso a vocês.',
      referencia: 'Mateus 11:28',
      tema: 'Descanso em Jesus',
      categoria: 'paz',
    },
    {
      id: 'isaias-41',
      texto:
        'Por isso não tema, pois estou com você; não tenha medo, pois sou o seu Deus. Eu o fortalecerei e o ajudarei; eu o segurarei com a minha mão direita vitoriosa.',
      referencia: 'Isaías 41:10',
      tema: 'Coragem & Força',
      categoria: 'coragem',
    },
    {
      id: 'joao-3',
      texto:
        'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.',
      referencia: 'João 3:16',
      tema: 'Amor Incondicional',
      categoria: 'amor',
    },
    {
      id: 'romanos-8',
      texto:
        'Sabemos que Deus age em todas as coisas para o bem daqueles que o amam, dos que foram chamados de acordo com o seu propósito.',
      referencia: 'Romanos 8:28',
      tema: 'Fé & Soberania',
      categoria: 'esperanca',
    },
    {
      id: 'salmos-91',
      texto:
        'Aquele que habita no abrigo do Altíssimo e descansa à sombra do Todo-poderoso pode dizer ao Senhor: Tu és o meu refúgio e a minha fortaleza, o meu Deus, em quem confio.',
      referencia: 'Salmos 91:1-2',
      tema: 'Proteção & Refúgio',
      categoria: 'coragem',
    },
    {
      id: 'proverbios-3',
      texto:
        'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
      referencia: 'Provérbios 3:5-6',
      tema: 'Confiança & Direção',
      categoria: 'esperanca',
    },
    {
      id: '2-timoteo-1',
      texto:
        'Porque Deus não nos deu espírito de covardia, mas de poder, de amor e de moderação.',
      referencia: '2 Timóteo 1:7',
      tema: 'Coragem & Poder',
      categoria: 'coragem',
    },
    {
      id: 'salmos-46',
      texto:
        'Aquietai-vos e sabei que eu sou Deus; serei exaltado entre as nações, serei exaltado sobre a terra.',
      referencia: 'Salmos 46:10',
      tema: 'Silêncio & Presença',
      categoria: 'paz',
    },
    {
      id: '2-corintios-12',
      texto:
        'Disse-me ele: A minha graça te é suficiente, porque o meu poder se aperfeiçoa na fraqueza. De boa vontade, pois, me gloriarei nas minhas fraquezas, para que sobre mim repouse o poder de Cristo.',
      referencia: '2 Coríntios 12:9',
      tema: 'Graça & Fraqueza',
      categoria: 'amor',
    },
    {
      id: 'josue-1',
      texto:
        'Não te ordenei eu? Sê forte e corajoso! Não te atemorizes nem te desanimes, porque o Senhor, teu Deus, estará contigo por onde quer que andares.',
      referencia: 'Josué 1:9',
      tema: 'Força & Ânimo',
      categoria: 'coragem',
    },
    {
      id: 'efesios-3',
      texto:
        'Àquele que é poderoso para fazer muito mais abundantemente além de tudo quanto pedimos ou pensamos, de acordo com o poder que opera em nós.',
      referencia: 'Efésios 3:20',
      tema: 'Abundância & Fé',
      categoria: 'esperanca',
    },
    {
      id: 'lucas-11',
      texto:
        'E eu vos digo: Pedi e dar-se-vos-á; buscai e achareis; batei e abrir-se-vos-á.',
      referencia: 'Lucas 11:9',
      tema: 'Oração & Perseverança',
      categoria: 'oracao',
    },
  ];

  readonly storyThemes: StoryTheme[] = [
    {
      id: 'azul-imperial',
      nome: 'Azul Imperial',
      bgGradientCss: 'linear-gradient(135deg, #041d33 0%, #0b3d68 50%, #062642 100%)',
      primaryColor: '#ffffff',
      accentColor: '#fbbf24',
      canvasColors: ['#041d33', '#0b3d68', '#062642'],
    },
    {
      id: 'dourado-aurora',
      nome: 'Dourado & Luz',
      bgGradientCss: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #451a03 100%)',
      primaryColor: '#ffffff',
      accentColor: '#fef08a',
      canvasColors: ['#78350f', '#b45309', '#451a03'],
    },
    {
      id: 'verde-esperanca',
      nome: 'Verde Esperança',
      bgGradientCss: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #022c22 100%)',
      primaryColor: '#ffffff',
      accentColor: '#a7f3d0',
      canvasColors: ['#064e3b', '#047857', '#022c22'],
    },
    {
      id: 'noite-celestial',
      nome: 'Noite Celestial',
      bgGradientCss: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)',
      primaryColor: '#ffffff',
      accentColor: '#e0e7ff',
      canvasColors: ['#1e1b4b', '#312e81', '#0f172a'],
    },
  ];

  readonly selectedTheme = signal<StoryTheme>(this.storyThemes[0]);
  readonly currentVerse = signal<DailyVerse>(this.verses[0]);

  readonly filteredVerses = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'todas') return this.verses;
    return this.verses.filter((v) => v.categoria === cat);
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

  selectVerse(v: DailyVerse): void {
    this.currentVerse.set(v);
  }

  nextVerse(): void {
    const currentList = this.filteredVerses();
    const cur = this.currentVerse();
    const idx = currentList.findIndex((v) => v.id === cur.id);
    const nextIdx = (idx + 1) % currentList.length;
    this.currentVerse.set(currentList[nextIdx] || this.verses[0]);
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

  generateAndDownloadStory(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    const theme = this.selectedTheme();
    const verse = this.currentVerse();

    // 1. Fundo com Gradiente Nobre
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, theme.canvasColors[0]);
    gradient.addColorStop(0.5, theme.canvasColors[1]);
    gradient.addColorStop(1, theme.canvasColors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Detalhes Decorativos e Moldura
    ctx.strokeStyle = theme.accentColor;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, width - 120, height - 120);
    ctx.globalAlpha = 1.0;

    // 3. Cabeçalho Institucional
    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IASD MANGUEIRAS • TATUÍ', width / 2, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('VERSÍCULO DO DIA', width / 2, 280);

    // 4. Aspas e Texto do Versículo
    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 120px serif';
    ctx.fillText('"', width / 2, height / 2 - 200);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 52px serif';
    this.wrapText(ctx, `${verse.texto}`, width / 2, height / 2 - 100, 860, 78);

    // 5. Referência Bíblica com Pílula Decorativa
    const refText = `— ${verse.referencia} —`;
    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(refText, width / 2, height / 2 + 320);

    // 6. Rodapé Institucional
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '28px sans-serif';
    ctx.fillText('iasdmangueiras.org.br', width / 2, height - 160);

    // 7. Exibir preview ao invés de baixar diretamente
    const dataUrl = canvas.toDataURL('image/png');
    this._pendingDownloadFilename = `versiculo-${verse.referencia.replace(/\s+/g, '-').toLowerCase()}-${theme.id}.png`;
    this.generatedPreviewUrl.set(dataUrl);
  }

  downloadGeneratedStory(): void {
    const dataUrl = this.generatedPreviewUrl();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = this._pendingDownloadFilename || 'story-versiculo.png';
    link.href = dataUrl;
    link.click();
    this.generatedPreviewUrl.set(null);
  }

  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }
}
