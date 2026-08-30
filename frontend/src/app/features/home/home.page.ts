import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { YoutubeService } from '../../core/services/youtube.service';
import { SITE_CONFIG } from '../../core/site/site.config';

interface NextServiceInfo {
  name: string;
  dayName: string;
  timeStr: string;
  timeRemainingText: string;
  isToday: boolean;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo">
      <!-- Banner Dinâmico de Avisos & Comunicados Urgentes -->
      @if (activeBanner(); as banner) {
        <aside
          class="border-b border-amber-300/40 bg-amber-500/10 px-4 py-3 text-advent-text backdrop-blur-md"
          role="region"
          aria-label="Aviso importante da congregação"
        >
          <div class="mx-auto flex max-w-site items-center justify-between gap-4 text-xs md:text-sm">
            <div class="flex items-center gap-2.5 font-medium">
              <span
                class="inline-flex items-center rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
              >
                {{ banner.tipo === 'urgente' ? 'Urgente' : 'Comunicado' }}
              </span>
              <span class="font-bold text-advent-text">{{ banner.titulo }}</span>
              @if (banner.mensagem || banner.descricao) {
                <span class="hidden text-advent-muted md:inline">
                  — {{ banner.mensagem || banner.descricao }}
                </span>
              }
            </div>
            <a
              routerLink="/eventos"
              class="shrink-0 font-semibold text-advent-blue hover:underline"
            >
              Ver comunicado →
            </a>
          </div>
        </aside>
      }

      <!-- Hero Section com Visual Profundo e Ambient Glow -->
      <section
        class="relative overflow-hidden bg-gradient-to-br from-[#062c4a] via-advent-blue to-[#0b3b60] text-white"
      >
        <!-- Elementos de iluminação de fundo (ambient mesh) -->
        <div
          class="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-advent-gold/15 blur-3xl"
          aria-hidden="true"
        ></div>
        <div
          class="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl"
          aria-hidden="true"
        ></div>

        <div
          class="relative mx-auto grid max-w-site gap-10 px-4 py-16 md:grid-cols-[1.25fr_0.75fr] md:items-center md:py-24"
        >
          <div>
            <div
              class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-advent-gold backdrop-blur-md"
            >
              <span class="h-2 w-2 rounded-full bg-advent-gold animate-pulse"></span>
              {{ site.city }}-{{ site.state }}
            </div>

            <h1
              class="mt-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl tracking-tight text-balance"
            >
              Igreja Adventista do Sétimo Dia <span class="text-white/90">das Mangueiras</span>
            </h1>

            <p class="mt-5 max-w-2xl text-lg text-white/85 leading-relaxed">
              Um ponto de encontro para adoração, esperança, estudo da Bíblia e serviço acolhedor à
              comunidade em Tatuí. Venha nos conhecer!
            </p>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                class="rounded-card bg-white px-7 py-3.5 text-center font-semibold text-advent-blue shadow-lg transition-all hover:bg-white/95 hover:shadow-xl active:scale-[0.98] active:shadow-inner"
                routerLink="/horarios"
              >
                Como chegar e horários
              </a>
              <a
                class="rounded-card border border-white/30 bg-white/10 px-7 py-3.5 text-center font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-[0.98] active:shadow-inner"
                routerLink="/ao-vivo"
              >
                Assistir ao vivo
              </a>
            </div>
          </div>

          <!-- Card Dinâmico do Próximo Encontro -->
          <aside
            class="rounded-section border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-2xl"
          >
            <div class="flex items-center justify-between">
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                {{ nextService().isToday ? 'Hoje' : 'Próximo Encontro' }}
              </span>
              <span class="text-xs font-medium text-white/75">{{
                nextService().timeRemainingText
              }}</span>
            </div>

            <h2 class="mt-4 text-2xl font-bold text-white">{{ nextService().name }}</h2>
            <p class="mt-1 text-sm font-semibold text-advent-gold">
              {{ nextService().dayName }} às {{ nextService().timeStr }}
            </p>

            <div class="mt-5 space-y-3 border-t border-white/15 pt-4 text-white/90">
              <div class="flex items-start gap-3">
                <div
                  class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white"
                  aria-hidden="true"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-white">Culto Presencial & Aberto</p>
                  <p class="text-xs text-white/75">Estacionamento e ambiente climatizado</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div
                  class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white"
                  aria-hidden="true"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-white">Classes para Crianças</p>
                  <p class="text-xs text-white/75">Professores preparados e dedicados</p>
                </div>
              </div>
            </div>

            <a
              class="mt-6 inline-flex items-center text-sm font-semibold text-white underline underline-offset-4 transition-colors hover:text-white/80"
              routerLink="/horarios"
            >
              Ver todos os horários e mapa →
            </a>
          </aside>
        </div>
      </section>

      <!-- Horários e Localização -->
      <section class="mx-auto max-w-site px-4 py-16">
        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
              >Programação Semanal</span
            >
            <h2 class="mt-1 text-3xl font-bold leading-tight text-advent-text text-balance">
              Horários e localização
            </h2>
            <p class="mt-2 text-advent-muted leading-relaxed">
              Portas abertas para você e sua família participarem dos nossos encontros semanais.
            </p>
          </div>
          <a
            class="inline-flex font-semibold text-advent-blue hover:underline text-sm"
            routerLink="/horarios"
          >
            Ver detalhes e mapa completo →
          </a>
        </div>

        @if (horarios().length === 0) {
          <div
            class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Carregando horários…"
          >
            @for (i of [1, 2, 3, 4]; track i) {
              <div
                class="rounded-section border border-advent-border bg-white p-6 shadow-sm overflow-hidden"
              >
                <div class="h-5 w-20 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
                <div class="mt-3 h-8 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
                <div class="mt-2 h-5 w-3/4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
                <div class="mt-2 h-4 w-full rounded bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-shimmer"></div>
              </div>
            }
          </div>
        } @else {
          <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            @for (item of horarios(); track item.titulo) {
              <article
                class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  <span
                    class="inline-flex items-center gap-1.5 rounded bg-advent-blue/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
                  >
                    <svg
                      class="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {{ item.dia }}
                  </span>
                  <p class="mt-3 text-2xl font-bold text-advent-text">{{ item.horario }}</p>
                  <h3 class="mt-1 text-lg font-semibold leading-snug text-advent-text">
                    {{ item.titulo }}
                  </h3>
                  <p class="mt-2 text-sm text-advent-muted leading-relaxed">{{ item.descricao }}</p>
                </div>
              </article>
            }
          </div>
        }
      </section>

      <!-- Ao Vivo e Vídeos com Thumbnail Real e Player CTA -->
      <section class="bg-advent-neutral py-16">
        <div class="mx-auto max-w-site px-4">
          <div class="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
                >Transmissões Oficiais</span
              >
              <h2 class="mt-1 text-3xl font-bold leading-tight text-advent-text">
                Ao vivo e mensagens
              </h2>
              <p class="mt-3 text-advent-muted leading-relaxed">
                Acompanhe as transmissões dos nossos cultos ao vivo ou reveja as mensagens bíblicas
                e séries de estudos pelo nosso canal oficial no YouTube.
              </p>
              <div class="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  class="rounded-card bg-advent-blue px-6 py-3.5 text-center font-semibold text-white shadow-sm transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner"
                  routerLink="/ao-vivo"
                >
                  Assistir no site
                </a>
                <a
                  class="rounded-card border border-advent-border bg-white px-6 py-3.5 text-center font-semibold text-advent-text shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] active:shadow-inner"
                  [href]="site.social.youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Canal no YouTube ↗
                </a>
              </div>
            </div>

            <div
              class="overflow-hidden rounded-section border border-advent-border bg-white shadow-sm"
            >
              @if (isYoutubeLoading()) {
                <div
                  class="aspect-video w-full rounded-lg bg-gray-200 animate-pulse flex items-center justify-center"
                >
                  <div class="h-12 w-12 rounded-full bg-gray-300"></div>
                </div>
              } @else if (featuredVideo(); as video) {
                <div class="group relative aspect-video w-full overflow-hidden bg-gray-900">
                  <img
                    [src]="video.thumbnail_url"
                    [alt]="video.title"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 flex flex-col justify-end p-5 md:p-6 text-white"
                  >
                    <div class="flex items-center gap-3.5">
                      <a
                        [href]="video.video_url || '/ao-vivo'"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110"
                        [attr.aria-label]="'Assistir ' + video.title + ' no YouTube'"
                      >
                        <svg
                          class="h-5 w-5 ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </a>
                      <div class="min-w-0">
                        <span class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-400">
                          <span class="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          Última Transmissão Oficial
                        </span>
                        <h3 class="mt-0.5 text-sm md:text-base font-bold text-white leading-snug line-clamp-2">
                          {{ video.title }}
                        </h3>
                      </div>
                    </div>
                    <div class="mt-3 flex items-center justify-between border-t border-white/15 pt-3">
                      <p class="text-xs text-gray-300">
                        Cultos ao vivo aos sábados às 10:15, domingos às 19:30 e quartas às 19:30
                      </p>
                      <a
                        routerLink="/ao-vivo"
                        class="rounded bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-white transition-colors"
                      >
                        Gravações →
                      </a>
                    </div>
                  </div>
                </div>
              } @else {
                <div
                  class="aspect-video w-full rounded-lg bg-gray-900 flex flex-col items-center justify-center text-center p-6 text-white relative"
                >
                  <div
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg"
                  >
                    <svg
                      class="h-6 w-6 ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p class="mt-4 font-bold text-lg text-white">IASD Mangueiras Online</p>
                  <p class="text-xs text-gray-300 mt-1">
                    Transmissões aos sábados às 10:15 e quartas às 19:30
                  </p>
                  <a
                    routerLink="/ao-vivo"
                    class="mt-4 inline-block rounded bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors"
                  >
                    Ver Gravações & Transmissão
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Eventos em Destaque -->
      <section class="mx-auto max-w-site px-4 py-16">
        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Agenda</span>
            <h2 class="mt-1 text-3xl font-bold leading-tight text-advent-text">
              Eventos e destaques
            </h2>
            <p class="mt-2 text-advent-muted leading-relaxed">
              Fique por dentro das programações especiais e atividades da nossa igreja.
            </p>
          </div>
          <a
            class="inline-flex font-semibold text-advent-blue hover:underline text-sm"
            routerLink="/eventos"
          >
            Ver todos os eventos →
          </a>
        </div>

        @if (eventos().length === 0) {
          <div
            class="mt-8 rounded-section border border-advent-border bg-white p-8 text-center shadow-sm"
          >
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-advent-neutral text-advent-blue"
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
            <h3 class="mt-3 text-lg font-bold text-advent-text">
              Nenhum evento especial no momento
            </h3>
            <p class="mt-1 text-sm text-advent-muted">
              Novas programações serão divulgadas em breve. Participe dos nossos cultos regulares!
            </p>
          </div>
        } @else {
          <div class="mt-8 grid gap-6 md:grid-cols-3">
            @for (evento of eventos().slice(0, 3); track (evento.id || evento.titulo)) {
              <article
                class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white overflow-hidden shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div>
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
                        class="inline-flex items-center gap-1.5 rounded bg-advent-blue/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
                      >
                        <svg
                          class="h-3.5 w-3.5"
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
                        {{ evento.data }} • {{ evento.horario }}
                      </span>

                      @if (evento.departamento) {
                        <span class="rounded bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                          {{ evento.departamento }}
                        </span>
                      }
                    </div>

                    <h3 class="mt-3 text-xl font-bold leading-snug text-advent-text">
                      {{ evento.titulo }}
                    </h3>

                    @if (evento.palestrante) {
                      <p class="mt-1 flex items-center gap-1.5 text-xs font-bold text-advent-blue">
                        <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                        Orador: {{ evento.palestrante }}
                      </p>
                    }

                    <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                      {{ evento.descricao }}
                    </p>
                  </div>
                </div>

                <div class="p-6 pt-0">
                  <a
                    class="text-sm font-semibold text-advent-blue hover:underline"
                    [routerLink]="evento.link_inscricao || evento.href || '/eventos'"
                  >
                    Mais informações →
                  </a>
                </div>
              </article>
            }
          </div>
        }
      </section>

      <!-- Ministérios em Destaque -->
      <section class="border-t border-advent-border bg-advent-neutral py-16">
        <div class="mx-auto max-w-site px-4">
          <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
                >Comunidade & Serviço</span
              >
              <h2 class="mt-1 text-3xl font-bold text-advent-text">Nossos ministérios</h2>
              <p class="mt-2 text-advent-muted">
                Diversas frentes de acolhimento, serviço e crescimento para todas as idades.
              </p>
            </div>
            <a
              class="inline-flex font-semibold text-advent-blue hover:underline text-sm"
              routerLink="/ministerios"
            >
              Conhecer todos os ministérios →
            </a>
          </div>

          <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            @for (min of ministerios().slice(0, 6); track (min.id || min.nome)) {
              <div
                class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden"
              >
                <div>
                  @if (min.categoria) {
                    <span class="inline-block rounded-md bg-advent-blue/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-advent-blue mb-2">
                      {{ min.categoria }}
                    </span>
                  }
                  <h3 class="text-lg font-bold text-advent-text">{{ min.nome }}</h3>
                  <p class="mt-1.5 text-xs text-advent-muted leading-relaxed">{{ min.descricao }}</p>
                  
                  @if (min.lideres) {
                    <p class="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-advent-blue">
                      <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      {{ min.lideres }}
                    </p>
                  }
                </div>

                <div class="mt-4 pt-3 border-t border-advent-border/60 flex items-center justify-between">
                  <a
                    routerLink="/ministerios"
                    class="text-xs font-semibold text-advent-blue hover:underline"
                  >
                    Conhecer mais →
                  </a>
                  <a
                    routerLink="/contato"
                    class="text-[11px] font-bold text-advent-muted hover:text-advent-blue"
                  >
                    Quero Servir
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Próximos Passos & Conexão (com ícones SVG) -->
      <section class="border-t border-advent-border bg-white py-16">
        <div class="mx-auto max-w-site px-4">
          <div class="text-center max-w-2xl mx-auto">
            <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
              >Conecte-se Conosco</span
            >
            <h2 class="mt-1 text-3xl font-bold text-advent-text">Próximos passos</h2>
            <p class="mt-2 text-advent-muted">
              Escolha uma das opções abaixo para se aproximar, tirar dúvidas ou orar conosco.
            </p>
          </div>

          <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Sou Novo -->
            <a
              class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-advent-blue hover:shadow-md"
              routerLink="/sou-novo"
            >
              <div>
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-advent-blue/10 text-advent-blue"
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
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 class="mt-5 text-xl font-bold text-advent-text">Sou novo por aqui</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Descubra o que esperar em sua primeira visita, como chegar e tire suas principais
                  dúvidas.
                </p>
              </div>
              <span class="mt-6 inline-flex items-center text-sm font-semibold text-advent-blue">
                Saiba mais <span class="ml-1">→</span>
              </span>
            </a>

            <!-- Pequenos Grupos -->
            <a
              class="flex flex-col justify-between rounded-section border border-advent-border bg-advent-neutral/50 p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-advent-blue hover:shadow-md"
              routerLink="/estudos"
            >
              <div>
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-advent-blue/10 text-advent-blue"
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
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <h3 class="mt-5 text-xl font-bold text-advent-text">Pequenos Grupos (PGs)</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Encontre um grupo acolhedor no seu bairro em Tatuí para orar, estudar e fazer
                  amigos.
                </p>
              </div>
              <span class="mt-6 inline-flex items-center text-sm font-semibold text-advent-blue">
                Encontrar meu PG <span class="ml-1">→</span>
              </span>
            </a>

            <!-- Pedido de Oração -->
            <a
              class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-advent-blue hover:shadow-md"
              routerLink="/contato"
            >
              <div>
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-advent-blue/10 text-advent-blue"
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 class="mt-5 text-xl font-bold text-advent-text">Pedido de oração</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Nossa equipe pastoral e de oração terá alegria em interceder por você e por sua
                  família com discrição.
                </p>
              </div>
              <span class="mt-6 inline-flex items-center text-sm font-semibold text-advent-blue">
                Enviar pedido <span class="ml-1">→</span>
              </span>
            </a>

            <!-- Estudo Bíblico -->
            <a
              class="flex flex-col justify-between rounded-section border border-advent-border bg-advent-neutral/50 p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-advent-blue hover:shadow-md"
              routerLink="/contato"
            >
              <div>
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-advent-blue/10 text-advent-blue"
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 class="mt-5 text-xl font-bold text-advent-text">Estudo Bíblico Gratuito</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Deseja entender melhor as profecias e os ensinamentos de Jesus? Solicite um
                  instrutor bíblico ou guia digital.
                </p>
              </div>
              <span class="mt-6 inline-flex items-center text-sm font-semibold text-advent-blue">
                Solicitar estudo <span class="ml-1">→</span>
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class HomePage implements OnInit {
  protected readonly site = SITE_CONFIG;
  private readonly contentService = inject(ContentService);
  private readonly youtubeService = inject(YoutubeService);
  private readonly seo = inject(SeoService);

  protected readonly horarios = () => this.contentService.horarios();
  protected readonly eventos = () => this.contentService.eventos();
  protected readonly ministerios = () => this.contentService.ministerios();
  protected readonly featuredVideo = computed(() => this.youtubeService.videos()[0]);
  protected readonly isYoutubeLoading = () => this.youtubeService.loading();

  protected readonly activeBanner = computed(() => {
    const coms = this.contentService.comunicados();
    return (
      coms.find(
        (c) => c.ativo !== false && (c.tipo === 'urgente' || c.tipo === 'destaque_banner'),
      ) || null
    );
  });

  protected readonly nextService = signal<NextServiceInfo>(this.calculateNextService());

  constructor() {
    this.seo.apply({
      title: 'IASD Mangueiras — Igreja Adventista em Tatuí-SP',
      description: SITE_CONFIG.description,
      path: '',
    });
  }

  ngOnInit(): void {
    this.youtubeService.fetchLatestVideos().subscribe();
    this.nextService.set(this.calculateNextService());
  }

  private calculateNextService(): NextServiceInfo {
    const now = new Date();
    const day = now.getDay(); // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb
    const hour = now.getHours();
    const min = now.getMinutes();
    const currentTime = hour * 60 + min;

    // Horários regulares:
    // Sábado: 09:00 (Escola Sabatina) e 10:15 (Culto Divino)
    // Domingo: 19:30 (Culto de Domingo)
    // Quarta: 19:30 (Culto de Oração)

    // Domingo
    if (day === 0 && currentTime < 19 * 60 + 30) {
      return {
        name: 'Culto de Domingo',
        dayName: 'Hoje (Domingo)',
        timeStr: '19:30',
        timeRemainingText: 'Hoje às 19h30',
        isToday: true,
      };
    }

    // Quarta
    if (day === 3 && currentTime < 19 * 60 + 30) {
      return {
        name: 'Culto de Oração e Estudo Bíblico',
        dayName: 'Hoje (Quarta-feira)',
        timeStr: '19:30',
        timeRemainingText: 'Hoje às 19h30',
        isToday: true,
      };
    }

    // Sábado
    if (day === 6) {
      if (currentTime < 9 * 60) {
        return {
          name: 'Escola Sabatina',
          dayName: 'Hoje (Sábado)',
          timeStr: '09:00',
          timeRemainingText: 'Hoje às 09h00',
          isToday: true,
        };
      }
      if (currentTime < 10 * 60 + 15) {
        return {
          name: 'Culto Divino',
          dayName: 'Hoje (Sábado)',
          timeStr: '10:15',
          timeRemainingText: 'Hoje às 10h15',
          isToday: true,
        };
      }
    }

    // Dias antes de quarta (Segunda, Terça, ou Domingo após 19h30)
    if (day === 1 || day === 2 || (day === 0 && currentTime >= 19 * 60 + 30)) {
      const daysUntilWed = (3 - day + 7) % 7 || 7;
      return {
        name: 'Culto de Oração e Estudo Bíblico',
        dayName: 'Quarta-feira',
        timeStr: '19:30',
        timeRemainingText: daysUntilWed === 1 ? 'Amanhã às 19h30' : `Em ${daysUntilWed} dias`,
        isToday: false,
      };
    }

    // Dias entre quinta e sexta
    if (day === 4 || day === 5 || (day === 3 && currentTime >= 19 * 60 + 30)) {
      const daysUntilSat = (6 - day + 7) % 7 || 7;
      return {
        name: 'Escola Sabatina & Culto Divino',
        dayName: 'Neste Sábado',
        timeStr: '09:00 e 10:15',
        timeRemainingText: daysUntilSat === 1 ? 'Amanhã a partir das 09h' : `Em ${daysUntilSat} dias`,
        isToday: false,
      };
    }

    // Sábado após o culto matutino -> Domingo 19:30
    return {
      name: 'Culto de Domingo',
      dayName: 'Amanhã (Domingo)',
      timeStr: '19:30',
      timeRemainingText: 'Amanhã às 19h30',
      isToday: false,
    };
  }
}
