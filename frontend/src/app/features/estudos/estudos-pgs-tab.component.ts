import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { PgRecommenderService, PgMatch } from '../../core/services/pg-recommender.service';
import { UserProfileService, UserPgProfile } from '../../core/services/user-profile.service';
import { PequenoGrupo } from '../../core/models/content.models';
import { PgProfileCardComponent } from './pg-profile-card.component';

@Component({
  selector: 'app-estudos-pgs-tab',
  standalone: true,
  imports: [RouterLink, PgProfileCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
            Nenhum Pequeno Grupo encontrado com os filtros selecionados. Tente selecionar outro perfil
            ou bairro.
          </div>
        }
      </div>
    </section>
  `,
})
export class EstudosPgsTabComponent {
  private readonly contentService = inject(ContentService);
  private readonly recommender = inject(PgRecommenderService);
  private readonly userProfileService = inject(UserProfileService);

  readonly selectedPerfil = signal<string>('Todos');
  readonly selectedBairro = signal<string>('Todos');
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

  constructor() {
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
}
