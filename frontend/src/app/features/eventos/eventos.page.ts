import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-eventos-page',
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
          <span class="font-medium text-advent-text" aria-current="page"
            >Eventos e Comunicados</span
          >
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

        <!-- Banner de Evento em Destaque Especial (se houver) -->
        @if (eventoDestaque(); as destaque) {
          <section class="mt-10 overflow-hidden rounded-3xl border border-amber-200/80 bg-linear-to-r from-amber-500/10 via-amber-100/30 to-blue-50/20 p-6 md:p-8 shadow-md">
            <div class="flex flex-col lg:flex-row items-center gap-8 justify-between">
              <div class="space-y-4 max-w-2xl">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-extrabold uppercase text-white shadow-xs">
                    ⭐ Grande Programação em Destaque
                  </span>
                  @if (destaque.departamento) {
                    <span class="rounded-full bg-white/80 border border-amber-200 px-3 py-1 text-xs font-semibold text-advent-blue">
                      {{ destaque.departamento }}
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
                  @if (destaque.local) {
                    <span class="flex items-center gap-2">
                      📍 <strong>Local:</strong> {{ destaque.local }}
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

                @if (destaque.link_inscricao || destaque.href) {
                  <div class="pt-2">
                    <a
                      [href]="destaque.link_inscricao || destaque.href"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center rounded-xl bg-advent-blue px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-advent-blue-dark active:scale-[0.98]"
                    >
                      Inscrever-se / Mais Detalhes →
                    </a>
                  </div>
                }
              </div>

              @if (destaque.banner_url || destaque.imagem_url) {
                <div class="w-full lg:w-96 shrink-0 aspect-video lg:aspect-4/3 overflow-hidden rounded-2xl border border-advent-border shadow-lg bg-white">
                  <img
                    [src]="destaque.banner_url || destaque.imagem_url"
                    [alt]="destaque.titulo"
                    class="h-full w-full object-cover"
                  />
                </div>
              }
            </div>
          </section>
        }

        <!-- Próximos Eventos -->
        <section class="mt-14" aria-labelledby="eventos-title">
          <div class="flex items-center justify-between">
            <h2 id="eventos-title" class="text-2xl font-bold text-advent-text">Próximos Eventos</h2>
            <span class="text-xs font-semibold text-advent-muted">Programação Especial</span>
          </div>
          <p class="mt-1 text-advent-muted">
            Programe-se e convide amigos e familiares para participar conosco.
          </p>

          @if (eventos().length === 0) {
            <div
              class="mt-6 rounded-card border border-advent-border bg-white p-8 text-center text-advent-muted shadow-sm"
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p class="font-medium text-advent-text text-base">
                Nenhum evento especial agendado no momento.
              </p>
              <p class="text-sm mt-1">
                Acompanhe nossos cultos regulares aos sábados e quartas-feiras ou tire suas dúvidas conosco.
              </p>
            </div>
          } @else {
            <div class="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              @for (evento of eventos(); track (evento.id || evento.titulo)) {
                <article
                  class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
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
                        />
                      </div>
                    }

                    <div class="p-6">
                      <div class="flex flex-wrap items-center gap-2">
                        <span
                          class="inline-flex items-center gap-1 rounded-md bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue"
                        >
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

                      @if (evento.local) {
                        <p class="mt-3 inline-flex items-center gap-1 text-xs text-advent-muted">
                          <svg
                            class="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                            aria-hidden="true"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                            />
                          </svg>
                          {{ evento.local }}
                        </p>
                      }
                    </div>
                  </div>

                  <div
                    class="p-6 pt-0 flex items-center justify-between"
                  >
                    @if (evento.link_inscricao || evento.href) {
                      <a
                        class="text-xs font-bold text-white bg-advent-blue hover:bg-advent-blue-dark px-4 py-2 rounded-lg shadow-xs transition-colors"
                        [href]="evento.link_inscricao || evento.href"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Participar / Inscrição →
                      </a>
                    } @else {
                      <a
                        class="text-xs font-semibold text-advent-blue hover:underline"
                        routerLink="/contato"
                      >
                        Mais informações →
                      </a>
                    }
                  </div>
                </article>
              }
            </div>
          }
        </section>

        <!-- Comunicados e Avisos Gerais -->
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
            <div
              class="mt-6 rounded-card border border-advent-border bg-white p-8 text-center text-advent-muted shadow-sm"
            >
              <p class="font-medium text-advent-text">Nenhum comunicado recente publicado.</p>
            </div>
          } @else {
            <div class="mt-6 grid gap-4 md:grid-cols-3">
              @for (comunicado of comunicados(); track (comunicado.id || comunicado.titulo)) {
                <div
                  class="rounded-card border border-advent-border bg-white p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div class="flex items-center justify-between gap-2">
                      <span
                        class="inline-block rounded bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue"
                      >
                        {{ comunicado.data }}
                      </span>
                      @if (comunicado.tipo === 'urgente') {
                        <span
                          class="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700"
                        >
                          Urgente
                        </span>
                      } @else if (comunicado.tipo === 'destaque_banner') {
                        <span
                          class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800"
                        >
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

          <div
            class="mt-8 rounded-card border border-advent-blue/30 bg-advent-blue/5 p-6 text-center md:text-left md:flex md:items-center md:justify-between"
          >
            <div>
              <h3 class="font-bold text-advent-blue text-lg">
                Deseja divulgar uma atividade ou tem dúvidas?
              </h3>
              <p class="text-sm text-advent-muted mt-1">
                Entre em contato com nossa liderança ou equipe de comunicação.
              </p>
            </div>
            <a
              class="mt-4 md:mt-0 inline-block rounded-card bg-advent-blue px-6 py-3 text-center text-sm font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner"
              routerLink="/contato"
            >
              Falar com a equipe
            </a>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class EventosPage {
  private readonly contentService = inject(ContentService);
  private readonly seo = inject(SeoService);

  protected readonly eventos = () => this.contentService.eventos();
  protected readonly comunicados = () => this.contentService.comunicados();

  protected readonly eventoDestaque = computed(() => {
    return this.eventos().find((e) => e.destaque) || null;
  });

  constructor() {
    this.seo.apply({
      title: 'Eventos e Comunicados — IASD Mangueiras',
      description:
        'Confira a agenda de eventos especiais, semanas de oração e comunicados da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP.',
      path: '/eventos',
    });
  }
}
