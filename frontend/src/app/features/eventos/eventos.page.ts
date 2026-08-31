import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { Evento, Comunicado } from '../../core/models/content.models';
import { getWhatsAppShareUrl } from '../../core/utils/mobility-links.util';
import { buildGoogleCalendarUrl, downloadIcsFile } from '../../core/utils/calendar-links.util';

@Component({
  selector: 'app-eventos-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" routerLink="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page">Eventos e Comunicados</span>
        </nav>

        <header class="max-w-3xl">
          <span
            class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
          >
            Agenda e Avisos
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Eventos e Programações
          </h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Acompanhe a agenda de programações especiais, semanas de oração, conferências comunitárias e os
            comunicados oficiais da IASD Mangueiras em Tatuí-SP.
          </p>
        </header>

        <!-- Banner de Evento em Destaque Especial (Hero) -->
        @if (featuredEvento(); as destaque) {
          <section
            class="mt-10 overflow-hidden rounded-3xl border border-amber-200/80 bg-linear-to-r from-amber-500/10 via-amber-100/30 to-blue-50/20 p-6 md:p-8 shadow-md"
            aria-label="Evento em destaque"
          >
            <div class="flex flex-col lg:flex-row items-center gap-8 justify-between">
              <div class="space-y-4 max-w-2xl">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-extrabold uppercase text-white shadow-xs">
                    ⭐ Evento em destaque
                  </span>
                  @if (destaque.departamento) {
                    <span class="rounded-full bg-white/80 border border-amber-200 px-3 py-1 text-xs font-semibold text-advent-blue">
                      {{ destaque.departamento }}
                    </span>
                  }
                  @if (getCountdownText(destaque); as countdown) {
                    <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-advent-blue border border-blue-200">
                      ⏳ {{ countdown }}
                    </span>
                  }
                </div>

                <h2 class="text-2xl md:text-3xl font-extrabold text-advent-text leading-tight">
                  {{ destaque.titulo }}
                </h2>

                <p class="text-sm md:text-base text-advent-muted leading-relaxed">
                  {{ destaque.descricao }}
                </p>

                <div class="flex flex-wrap gap-y-2 gap-x-6 text-sm text-advent-text font-medium">
                  <span class="flex items-center gap-2">
                    📅 <strong>Data:</strong> {{ destaque.data }} às {{ destaque.horario }}
                  </span>
                  @if (destaque.local || destaque.endereco) {
                    <span class="flex items-center gap-2">
                      📍 <strong>Local:</strong> {{ destaque.endereco || destaque.local }}
                    </span>
                  }
                  @if (destaque.palestrante) {
                    <span class="flex items-center gap-2 text-advent-blue font-bold">
                      🎙️ <strong>Orador:</strong> {{ destaque.palestrante }}
                    </span>
                  }
                  @if (destaque.valor_entrada) {
                    <span class="flex items-center gap-2 text-green-700 font-bold">
                      🏷️ <strong>Entrada:</strong> {{ destaque.valor_entrada }}
                    </span>
                  }
                </div>

                <div class="pt-3 flex flex-wrap items-center gap-3">
                  @if (destaque.link_inscricao || destaque.href) {
                    <a
                      [href]="destaque.link_inscricao || destaque.href"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center rounded-xl bg-advent-blue px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-advent-blue-dark active:scale-[0.98] min-h-[44px]"
                    >
                      Inscrever-se
                    </a>
                  } @else {
                    <a
                      routerLink="/contato"
                      class="inline-flex items-center justify-center rounded-xl bg-advent-blue px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-advent-blue-dark active:scale-[0.98] min-h-[44px]"
                    >
                      Falar com a igreja
                    </a>
                  }

                  @if (destaque.data_inicio) {
                    <a
                      [href]="getGoogleCalendarUrlForEvento(destaque)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center rounded-xl border border-advent-blue/40 bg-white/90 px-4 py-3 text-sm font-semibold text-advent-blue shadow-xs hover:bg-blue-50 transition-colors min-h-[44px]"
                    >
                      📅 Adicionar à agenda
                    </a>
                  }

                  <a
                    [href]="getShareWhatsAppUrlForEvento(destaque)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center justify-center rounded-xl border border-green-600/40 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 shadow-xs hover:bg-green-100 transition-colors min-h-[44px]"
                  >
                    💬 Compartilhar
                  </a>
                </div>
              </div>

              @if (destaque.banner_url || destaque.imagem_url) {
                <div class="w-full lg:w-96 shrink-0 aspect-video lg:aspect-4/3 overflow-hidden rounded-2xl border border-advent-border shadow-lg bg-white">
                  <img
                    [src]="destaque.banner_url || destaque.imagem_url"
                    [alt]="destaque.titulo"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    width="384"
                    height="288"
                  />
                </div>
              }
            </div>
          </section>
        }

        <!-- Abas & Filtros -->
        <section class="mt-12">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-advent-border pb-4">
            <!-- Abas de navegação -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Seções de eventos">
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="activeTab() === 'proximos'"
                [attr.aria-pressed]="activeTab() === 'proximos'"
                (click)="activeTab.set('proximos')"
                class="rounded-xl px-4 py-2.5 text-sm font-bold transition-all min-h-[44px] cursor-pointer"
                [class.bg-advent-blue]="activeTab() === 'proximos'"
                [class.text-white]="activeTab() === 'proximos'"
                [class.shadow-sm]="activeTab() === 'proximos'"
                [class.bg-slate-100]="activeTab() !== 'proximos'"
                [class.text-advent-muted]="activeTab() !== 'proximos'"
                [class.hover:text-advent-text]="activeTab() !== 'proximos'"
              >
                Próximos ({{ upcomingEventos().length }})
              </button>

              <button
                type="button"
                role="tab"
                [attr.aria-selected]="activeTab() === 'comunicados'"
                [attr.aria-pressed]="activeTab() === 'comunicados'"
                (click)="activeTab.set('comunicados')"
                class="rounded-xl px-4 py-2.5 text-sm font-bold transition-all min-h-[44px] cursor-pointer"
                [class.bg-advent-blue]="activeTab() === 'comunicados'"
                [class.text-white]="activeTab() === 'comunicados'"
                [class.shadow-sm]="activeTab() === 'comunicados'"
                [class.bg-slate-100]="activeTab() !== 'comunicados'"
                [class.text-advent-muted]="activeTab() !== 'comunicados'"
                [class.hover:text-advent-text]="activeTab() !== 'comunicados'"
              >
                Comunicados ({{ comunicados().length }})
              </button>

              <button
                type="button"
                role="tab"
                [attr.aria-selected]="activeTab() === 'encerrados'"
                [attr.aria-pressed]="activeTab() === 'encerrados'"
                (click)="activeTab.set('encerrados')"
                class="rounded-xl px-4 py-2.5 text-sm font-bold transition-all min-h-[44px] cursor-pointer"
                [class.bg-advent-blue]="activeTab() === 'encerrados'"
                [class.text-white]="activeTab() === 'encerrados'"
                [class.shadow-sm]="activeTab() === 'encerrados'"
                [class.bg-slate-100]="activeTab() !== 'encerrados'"
                [class.text-advent-muted]="activeTab() !== 'encerrados'"
                [class.hover:text-advent-text]="activeTab() !== 'encerrados'"
              >
                Encerrados ({{ archivedEventos().length }})
              </button>
            </div>

            <!-- Filtros (busca e departamento) -->
            @if (activeTab() !== 'comunicados') {
              <div class="flex flex-wrap items-center gap-3">
                <div class="relative min-w-[200px] flex-1 sm:flex-initial">
                  <label for="search-eventos" class="sr-only">Buscar eventos</label>
                  <input
                    id="search-eventos"
                    type="search"
                    [ngModel]="searchTerm()"
                    (ngModelChange)="searchTerm.set($event)"
                    placeholder="Buscar por nome, orador..."
                    class="w-full rounded-xl border border-advent-border bg-white px-3.5 py-2.5 text-sm text-advent-text placeholder:text-advent-muted focus:border-advent-blue focus:outline-hidden min-h-[44px]"
                  />
                </div>

                @if (availableDepartments().length > 0) {
                  <div>
                    <label for="dept-filter" class="sr-only">Filtrar por departamento</label>
                    <select
                      id="dept-filter"
                      [ngModel]="departmentFilter()"
                      (ngModelChange)="departmentFilter.set($event)"
                      class="rounded-xl border border-advent-border bg-white px-3 py-2.5 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden min-h-[44px]"
                    >
                      <option value="">Todos os Departamentos</option>
                      @for (dept of availableDepartments(); track dept) {
                        <option [value]="dept">{{ dept }}</option>
                      }
                    </select>
                  </div>
                }

                @if (searchTerm() || departmentFilter()) {
                  <button
                    type="button"
                    (click)="clearFilters()"
                    class="text-xs font-semibold text-advent-blue hover:underline min-h-[44px] px-2 flex items-center cursor-pointer"
                  >
                    Limpar filtros
                  </button>
                }
              </div>
            }
          </div>
        </section>

        <!-- Conteúdo Principal por Aba -->
        @if (activeTab() === 'proximos' || activeTab() === 'encerrados') {
          <section class="mt-8" [attr.aria-labelledby]="activeTab() === 'proximos' ? 'proximos-title' : 'encerrados-title'">
            <h2 id="proximos-title" class="sr-only">
              {{ activeTab() === 'proximos' ? 'Próximos Eventos' : 'Eventos Encerrados' }}
            </h2>

            @if (filteredEventos().length === 0) {
              <div class="mt-6 rounded-2xl border border-advent-border bg-white p-8 text-center text-advent-muted shadow-xs">
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-advent-neutral text-advent-blue mb-3">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p class="font-medium text-advent-text text-base">
                  Nenhum evento encontrado.
                </p>
                <p class="text-sm mt-1">
                  @if (searchTerm() || departmentFilter()) {
                    Tente ajustar ou limpar seus filtros de busca.
                  } @else {
                    Acompanhe nossos cultos regulares ou fale com nossa liderança.
                  }
                </p>
                @if (searchTerm() || departmentFilter()) {
                  <button
                    type="button"
                    (click)="clearFilters()"
                    class="mt-4 inline-flex items-center justify-center rounded-xl bg-advent-blue px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-advent-blue-dark min-h-[44px] cursor-pointer"
                  >
                    Limpar filtros
                  </button>
                }
              </div>
            } @else {
              <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                @for (evento of filteredEventos(); track (evento.id || evento.titulo)) {
                  <article
                    class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white overflow-hidden shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div>
                      <!-- Banner Visual -->
                      @if (evento.banner_url || evento.imagem_url) {
                        <div class="aspect-video w-full overflow-hidden bg-gray-100 border-b border-advent-border">
                          <img
                            [src]="evento.banner_url || evento.imagem_url"
                            [alt]="evento.titulo"
                            class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                            width="400"
                            height="225"
                          />
                        </div>
                      }

                      <div class="p-6">
                        <div class="flex flex-wrap items-center gap-2">
                          <span class="inline-flex items-center gap-1 rounded-md bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue">
                            📅 {{ evento.data }} • {{ evento.horario }}
                          </span>

                          @if (evento.departamento) {
                            <span class="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                              {{ evento.departamento }}
                            </span>
                          }

                          @if (evento.valor_entrada) {
                            <span class="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                              {{ evento.valor_entrada }}
                            </span>
                          }
                        </div>

                        <h3 class="mt-4 text-xl font-bold text-advent-text leading-snug">
                          {{ evento.titulo }}
                        </h3>

                        @if (evento.palestrante) {
                          <p class="mt-1 text-xs font-bold text-advent-blue">
                            🎙️ Orador: {{ evento.palestrante }}
                          </p>
                        }

                        <p class="mt-2.5 text-sm text-advent-muted leading-relaxed">
                          {{ evento.descricao }}
                        </p>

                        @if (evento.local || evento.endereco) {
                          <p class="mt-3 inline-flex items-center gap-1 text-xs text-advent-muted">
                            <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {{ evento.endereco || evento.local }}
                          </p>
                        }
                      </div>
                    </div>

                    <div class="p-6 pt-0 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 mt-4">
                      @if (evento.link_inscricao || evento.href) {
                        <a
                          class="text-xs font-bold text-white bg-advent-blue hover:bg-advent-blue-dark px-4 py-2 rounded-lg shadow-xs transition-colors min-h-[44px] flex items-center justify-center"
                          [href]="evento.link_inscricao || evento.href"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Inscrever-se
                        </a>
                      } @else {
                        <a
                          class="text-xs font-semibold text-advent-blue hover:underline min-h-[44px] flex items-center"
                          routerLink="/contato"
                        >
                          Falar com a igreja
                        </a>
                      }

                      <div class="flex items-center gap-2">
                        @if (evento.data_inicio) {
                          <a
                            [href]="getGoogleCalendarUrlForEvento(evento)"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-xs font-semibold text-advent-blue hover:bg-blue-50 p-2 rounded-lg transition-colors min-h-[44px] flex items-center"
                            title="Adicionar ao Google Agenda"
                          >
                            Adicionar à agenda
                          </a>
                        }

                        <a
                          [href]="getShareWhatsAppUrlForEvento(evento)"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-xs font-semibold text-green-700 hover:bg-green-50 p-2 rounded-lg transition-colors min-h-[44px] flex items-center"
                          title="Compartilhar via WhatsApp"
                        >
                          Compartilhar
                        </a>
                      </div>
                    </div>
                  </article>
                }
              </div>
            }
          </section>
        }

        <!-- Mural de Comunicados -->
        @if (activeTab() === 'comunicados' || activeTab() === 'proximos') {
          <section
            class="mt-16 rounded-3xl border border-advent-border bg-advent-neutral p-6 md:p-10"
            aria-labelledby="comunicados-title"
          >
            <div class="flex items-center justify-between">
              <h2 id="comunicados-title" class="text-2xl font-bold text-advent-text">
                Comunicados e Avisos Gerais
              </h2>
              <span class="text-xs font-semibold text-advent-muted">Mural da Igreja</span>
            </div>
            <p class="mt-1 text-advent-muted">
              Orientações, comunicados administrativos e avisos para a congregação.
            </p>

            @if (comunicados().length === 0) {
              <div class="mt-6 rounded-2xl border border-advent-border bg-white p-8 text-center text-advent-muted shadow-xs">
                <p class="font-medium text-advent-text">Nenhum comunicado recente publicado.</p>
              </div>
            } @else {
              <div class="mt-6 grid gap-4 md:grid-cols-3">
                @for (comunicado of comunicados(); track (comunicado.id || comunicado.titulo)) {
                  <div class="rounded-2xl border border-advent-border bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between gap-2">
                        <span class="inline-block rounded bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue">
                          {{ comunicado.data }}
                        </span>
                        @if (comunicado.tipo === 'urgente') {
                          <span class="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                            Urgente
                          </span>
                        } @else if (comunicado.tipo === 'destaque_banner') {
                          <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                            Destaque
                          </span>
                        }
                      </div>

                      <h3 class="mt-3 text-lg font-bold text-advent-text leading-snug">
                        {{ comunicado.titulo }}
                      </h3>
                      <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                        {{ comunicado.mensagem || comunicado.descricao }}
                      </p>
                    </div>
                  </div>
                }
              </div>
            }

            <div class="mt-8 rounded-2xl border border-advent-blue/30 bg-advent-blue/5 p-6 text-center md:text-left md:flex md:items-center md:justify-between">
              <div>
                <h3 class="font-bold text-advent-blue text-lg">
                  Deseja divulgar uma atividade ou tem dúvidas?
                </h3>
                <p class="text-sm text-advent-muted mt-1">
                  Entre em contato com nossa liderança ou equipe de comunicação.
                </p>
              </div>
              <a
                class="mt-4 md:mt-0 inline-flex items-center justify-center rounded-xl bg-advent-blue px-6 py-3 text-center text-sm font-semibold text-white shadow-xs transition-all hover:bg-advent-blue-dark active:scale-[0.98] min-h-[44px]"
                routerLink="/contato"
              >
                Falar com a equipe
              </a>
            </div>
          </section>
        }
      </div>
    </main>
  `,
})
export class EventosPage {
  private readonly contentService = inject(ContentService);
  private readonly seo = inject(SeoService);

  readonly activeTab = signal<'proximos' | 'comunicados' | 'encerrados'>('proximos');
  readonly departmentFilter = signal<string>('');
  readonly searchTerm = signal<string>('');

  protected readonly rawEventos = () => this.contentService.eventos();
  protected readonly comunicados = () => this.contentService.comunicados();

  readonly publishedEventos = computed(() => {
    return this.rawEventos().filter((e) => e.status !== 'rascunho');
  });

  readonly featuredEvento = computed(() => {
    const published = this.publishedEventos();
    const destaques = published.filter((e) => e.destaque);
    if (destaques.length === 0) return null;

    // Preferencialmente o destaque que tem data_inicio futura/mais próxima
    const comData = destaques.find((e) => e.data_inicio && e.status !== 'encerrado');
    return comData || destaques[0];
  });

  readonly upcomingEventos = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.publishedEventos().filter((e) => {
      if (e.status === 'encerrado') return false;
      if (e.data_fim && e.data_fim < today) return false;
      if (e.data_inicio && !e.data_fim && e.data_inicio < today) return false;
      return true;
    });
  });

  readonly archivedEventos = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.publishedEventos().filter((e) => {
      if (e.status === 'encerrado') return true;
      if (e.data_fim && e.data_fim < today) return true;
      if (e.data_inicio && !e.data_fim && e.data_inicio < today) return true;
      return false;
    });
  });

  readonly availableDepartments = computed(() => {
    const depts = new Set<string>();
    for (const e of this.publishedEventos()) {
      if (e.departamento) depts.add(e.departamento);
    }
    return Array.from(depts).sort();
  });

  readonly filteredEventos = computed(() => {
    const baseList =
      this.activeTab() === 'encerrados' ? this.archivedEventos() : this.upcomingEventos();
    const dept = this.departmentFilter().toLowerCase().trim();
    const term = this.searchTerm().toLowerCase().trim();

    return baseList.filter((evento) => {
      const matchDept = !dept || (evento.departamento && evento.departamento.toLowerCase() === dept);
      if (!matchDept) return false;

      if (!term) return true;

      const titleMatch = evento.titulo?.toLowerCase().includes(term);
      const descMatch = evento.descricao?.toLowerCase().includes(term);
      const speakerMatch = evento.palestrante?.toLowerCase().includes(term);
      const locationMatch = evento.local?.toLowerCase().includes(term) || evento.endereco?.toLowerCase().includes(term);
      const targetMatch = evento.publico_alvo?.toLowerCase().includes(term);

      return titleMatch || descMatch || speakerMatch || locationMatch || targetMatch;
    });
  });

  constructor() {
    this.seo.apply({
      title: 'Eventos e Comunicados — IASD Mangueiras',
      description:
        'Confira a agenda de eventos especiais, semanas de oração e comunicados da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP.',
      path: '/eventos',
      breadcrumbs: [
        { name: 'Início', url: 'https://iasdmangueiras.org.br/' },
        { name: 'Eventos e Comunicados', url: 'https://iasdmangueiras.org.br/eventos' },
      ],
    });

    effect(() => {
      const eventos = this.upcomingEventos();
      if (eventos.length > 0) {
        this.seo.apply({
          title: 'Eventos e Comunicados — IASD Mangueiras',
          description:
            'Confira a agenda de eventos especiais, semanas de oração e comunicados da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP.',
          path: '/eventos',
          breadcrumbs: [
            { name: 'Início', url: 'https://iasdmangueiras.org.br/' },
            { name: 'Eventos e Comunicados', url: 'https://iasdmangueiras.org.br/eventos' },
          ],
          events: eventos.slice(0, 10).map((e) => ({
            name: e.titulo,
            description: e.descricao || 'Evento na IASD Mangueiras em Tatuí-SP',
            startDate: e.data_inicio ? `${e.data_inicio}T${e.horario || '09:00'}:00` : '2026-08-31T09:00:00',
            endDate: e.data_fim ? `${e.data_fim}T12:00:00` : undefined,
            locationName: e.local || 'IASD Mangueiras',
            locationAddress: e.endereco || 'Av. Cônego João Clímaco, 195 - Centro, Tatuí - SP',
            image: e.banner_url || e.imagem_url,
          })),
        });
      }
    });
  }

  clearFilters(): void {
    this.departmentFilter.set('');
    this.searchTerm.set('');
  }

  getCountdownText(evento: Evento): string | null {
    if (!evento.data_inicio) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const [year, month, day] = evento.data_inicio.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);
    eventDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoje!';
    if (diffDays === 1) return 'É amanhã!';
    if (diffDays > 1) return `Faltam ${diffDays} dias`;
    return null;
  }

  getGoogleCalendarUrlForEvento(evento: Evento): string {
    const address = evento.endereco || evento.local || 'IASD Mangueiras - Tatuí, SP';
    const dayOfWeek = evento.data_inicio ? new Date(evento.data_inicio + 'T12:00:00Z').getUTCDay() : 6;
    const time = (evento.horario && /^\d{2}:\d{2}$/.test(evento.horario)) ? evento.horario : '19:30';

    return buildGoogleCalendarUrl({
      title: evento.titulo,
      description: evento.descricao,
      location: address,
      dayOfWeek: dayOfWeek,
      time: time,
      durationMinutes: 120,
    });
  }

  getShareWhatsAppUrlForEvento(evento: Evento): string {
    const address = evento.endereco || evento.local || 'IASD Mangueiras, Tatuí - SP';
    return getWhatsAppShareUrl({
      title: evento.titulo,
      day: evento.data,
      time: evento.horario,
      address: address,
    });
  }
}
