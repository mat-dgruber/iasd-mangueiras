import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SITE_CONFIG } from '../../core/site/site.config';
import { Horario } from '../../core/models/content.models';
import { getTodaySunset, getSabbathSunsets } from '../../core/utils/solar-time.util';
import {
  buildGoogleCalendarUrl,
  downloadIcsFile,
} from '../../core/utils/calendar-links.util';
import {
  getGoogleMapsUrl,
  getWazeUrl,
  getAppleMapsUrl,
  getUberUrl,
  getWhatsAppShareUrl,
} from '../../core/utils/mobility-links.util';

@Component({
  selector: 'app-horarios-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Header / Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" routerLink="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page"
            >Horários e Localização</span
          >
        </nav>

        <header class="max-w-3xl">
          <!-- Compact Pill Badge: Pôr do sol e Próximo Culto -->
          <div
            class="mb-4 inline-flex flex-wrap items-center gap-2.5 rounded-full border border-advent-border bg-white px-3.5 py-1.5 text-xs font-medium text-advent-text shadow-xs"
          >
            <span class="inline-flex items-center gap-1.5 text-amber-700">
              <svg
                class="h-4 w-4 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
              <span>Pôr do sol hoje em Tatuí: <strong>{{ sunsetToday() }}</strong></span>
            </span>

            <span class="text-advent-border" aria-hidden="true">•</span>

            @if (nextService(); as next) {
              <span class="inline-flex items-center gap-1.5 text-advent-blue">
                <svg
                  class="h-4 w-4 text-advent-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Próximo Culto: <strong>{{ next.text }}</strong> ({{ next.horario.titulo }})</span>
              </span>
            }
          </div>

          <span
            class="block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue w-fit"
          >
            Planeje sua visita
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Horários e Localização
          </h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Será uma alegria receber você e sua família. Confira os dias e horários de nossas
            reuniões regulares na IASD Mangueiras em Tatuí-SP.
          </p>
        </header>

        <!-- Avisos de Horários Especiais (caso haja ativo no Firestore) -->
        @if (avisosHorarios().length > 0) {
          <section class="mt-8 space-y-3" aria-label="Avisos de alterações temporárias de horários">
            @for (aviso of avisosHorarios(); track (aviso.id || aviso.titulo)) {
              <div
                class="flex flex-col gap-3 rounded-2xl border border-amber-300/80 bg-amber-500/10 p-5 backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      class="inline-flex items-center rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                    >
                      {{ aviso.data_evento || 'Alteração Temporária' }}
                    </span>
                    <h2 class="text-sm font-bold text-amber-950">{{ aviso.titulo }}</h2>
                  </div>
                  <p class="text-xs text-amber-900 leading-relaxed">{{ aviso.mensagem }}</p>
                </div>
              </div>
            }
          </section>
        }

        <!-- Programações Regulares -->
        <section class="mt-12" aria-labelledby="programacoes-title">
          <div class="flex items-center justify-between">
            <h2 id="programacoes-title" class="text-2xl font-bold text-advent-text">
              Programação Semanal
            </h2>
            <span class="text-xs font-semibold text-advent-muted">Cultos Regulares</span>
          </div>

          <div class="mt-6 grid gap-6 md:grid-cols-2">
            @for (item of horarios(); track item.titulo) {
              <article
                class="relative flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                [class.ring-2]="isTodayService(item)"
                [class.ring-advent-blue]="isTodayService(item)"
              >
                <div>
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-flex items-center gap-1.5 rounded bg-advent-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
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

                      @if (isTodayService(item)) {
                        <span
                          class="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                        >
                          Hoje
                        </span>
                      } @else if (isNextService(item)) {
                        <span
                          class="inline-flex items-center rounded-full bg-advent-gold/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 border border-amber-300"
                        >
                          Próximo
                        </span>
                      }
                    </div>

                    <span class="text-2xl font-bold text-advent-blue">{{ item.horario }}</span>
                  </div>

                  <h3 class="mt-4 text-2xl font-bold text-advent-text">{{ item.titulo }}</h3>
                  <p class="mt-2 text-advent-muted leading-relaxed text-sm">{{ item.descricao }}</p>
                </div>

                <!-- Ações por Culto -->
                <div
                  class="mt-6 flex flex-wrap items-center gap-2.5 pt-4 border-t border-advent-border/60"
                  data-calendar-container
                >
                  <!-- Botão Adicionar à Agenda com Dropdown -->
                  <div class="relative" data-calendar-menu>
                    <button
                      type="button"
                      (click)="toggleCalendarMenu(item.titulo)"
                      class="inline-flex items-center gap-1.5 rounded-card border border-advent-border bg-advent-neutral/60 px-3 py-2 text-xs font-semibold text-advent-text hover:bg-advent-neutral hover:text-advent-blue transition-colors cursor-pointer min-h-[38px]"
                      [attr.aria-expanded]="openCalendarMenuId() === item.titulo"
                      [attr.aria-controls]="'calendar-menu-' + item.titulo"
                      aria-label="Adicionar {{ item.titulo }} à agenda"
                    >
                      <svg
                        class="h-4 w-4 text-advent-blue"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                        />
                      </svg>
                      <span>+ Adicionar à Agenda</span>
                      <svg
                        class="h-3 w-3 text-advent-muted transition-transform"
                        [class.rotate-180]="openCalendarMenuId() === item.titulo"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>

                    @if (openCalendarMenuId() === item.titulo) {
                      <div
                        [id]="'calendar-menu-' + item.titulo"
                        class="absolute left-0 bottom-full mb-1.5 z-20 w-52 rounded-xl border border-advent-border bg-white p-1.5 shadow-xl animate-fadeIn"
                        role="menu"
                      >
                        <a
                          [href]="getGoogleCalendarLink(item)"
                          target="_blank"
                          rel="noopener noreferrer"
                          (click)="closeCalendarMenu()"
                          class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-advent-text hover:bg-advent-neutral hover:text-advent-blue transition-colors"
                          role="menuitem"
                        >
                          <svg
                            class="h-4 w-4 text-red-500 shrink-0"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"
                            />
                          </svg>
                          <span>Google Agenda</span>
                        </a>
                        <button
                          type="button"
                          (click)="downloadIcsAndClose(item)"
                          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-advent-text hover:bg-advent-neutral hover:text-advent-blue transition-colors cursor-pointer text-left"
                          role="menuitem"
                        >
                          <svg
                            class="h-4 w-4 text-blue-600 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                            aria-hidden="true"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>
                          <span>Apple / Outlook (.ics)</span>
                        </button>
                      </div>
                    }
                  </div>

                  <!-- Botão Convidar no WhatsApp -->
                  <a
                    [href]="getWhatsAppLink(item)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 rounded-card border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer min-h-[38px]"
                    aria-label="Convidar no WhatsApp para {{ item.titulo }}"
                  >
                    <svg
                      class="h-4 w-4 text-emerald-600 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
                      />
                    </svg>
                    <span>Convidar no WhatsApp</span>
                  </a>
                </div>
              </article>
            }
          </div>
        </section>

        <!-- Localização, Como Chegar & Mobilidade -->
        <section
          class="mt-14 rounded-section border border-advent-border bg-advent-neutral p-6 md:p-10"
          aria-labelledby="localizacao-title"
        >
          <div class="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
                >Onde Estamos</span
              >
              <h2 id="localizacao-title" class="mt-2 text-3xl font-bold text-advent-text">
                Como Chegar
              </h2>
              <p class="mt-3 text-advent-muted leading-relaxed">
                A IASD Mangueiras está localizada no coração de Tatuí-SP, com fácil acesso,
                estacionamento e ambiente acolhedor preparado para você e seus convidados.
              </p>

              <!-- Card de Endereço Oficial com Copiar Endereço -->
              <div class="mt-6 rounded-2xl border border-advent-border bg-white p-5 shadow-xs">
                <div class="flex items-start justify-between gap-4">
                  <div class="space-y-1">
                    <span class="text-xs font-bold uppercase tracking-wider text-advent-muted"
                      >Endereço Oficial</span
                    >
                    <p class="text-base font-semibold text-advent-text">{{ fullAddress() }}</p>
                    <p class="text-xs text-advent-muted">{{ site.legalName }}</p>
                  </div>
                  <button
                    type="button"
                    (click)="copyAddress()"
                    class="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-advent-border bg-advent-neutral px-3.5 py-2 text-xs font-semibold text-advent-blue hover:bg-advent-blue hover:text-white transition-all active:scale-95 cursor-pointer min-h-[40px]"
                    aria-label="Copiar endereço completo da IASD Mangueiras"
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
                        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                      />
                    </svg>
                    <span>Copiar Endereço</span>
                  </button>
                </div>
              </div>

              <!-- 4 Botões de Navegação & Mobilidade -->
              <div class="mt-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-advent-muted mb-3">
                  Rotas e Aplicativos de Navegação
                </h3>
                <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <!-- Google Maps -->
                  <a
                    [href]="googleMapsUrl()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-advent-border bg-white p-3 text-center transition-all hover:-translate-y-0.5 hover:border-advent-blue hover:shadow-xs cursor-pointer"
                    aria-label="Traçar rota no Google Maps"
                  >
                    <span class="text-sm font-bold text-advent-text">Google Maps</span>
                    <span class="text-[10px] text-advent-muted">Abrir mapa ↗</span>
                  </a>

                  <!-- Waze -->
                  <a
                    [href]="wazeUrl()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-advent-border bg-white p-3 text-center transition-all hover:-translate-y-0.5 hover:border-advent-blue hover:shadow-xs cursor-pointer"
                    aria-label="Navegar com Waze"
                  >
                    <span class="text-sm font-bold text-advent-text">Waze</span>
                    <span class="text-[10px] text-advent-muted">Navegar ↗</span>
                  </a>

                  <!-- Apple Maps -->
                  <a
                    [href]="appleMapsUrl()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-advent-border bg-white p-3 text-center transition-all hover:-translate-y-0.5 hover:border-advent-blue hover:shadow-xs cursor-pointer"
                    aria-label="Abrir no Apple Maps"
                  >
                    <span class="text-sm font-bold text-advent-text">Apple Maps</span>
                    <span class="text-[10px] text-advent-muted">Abrir mapa ↗</span>
                  </a>

                  <!-- Uber -->
                  <a
                    [href]="uberUrl()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-advent-border bg-white p-3 text-center transition-all hover:-translate-y-0.5 hover:border-advent-blue hover:shadow-xs cursor-pointer"
                    aria-label="Pedir Uber para IASD Mangueiras"
                  >
                    <span class="text-sm font-bold text-advent-text">Uber</span>
                    <span class="text-[10px] text-advent-muted">Chamar corrida ↗</span>
                  </a>
                </div>
              </div>

              <!-- Link Sou Novo -->
              <div class="mt-6">
                <a
                  routerLink="/sou-novo"
                  class="inline-flex items-center gap-2 text-sm font-semibold text-advent-blue hover:underline"
                >
                  <span>Primeira vez na igreja? Veja o que esperar em sua visita</span>
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
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <!-- Coluna Direita: Comodidades & Dúvidas Frequentes -->
            <div class="space-y-6">
              <!-- Comodidades & Acessibilidade -->
              <div class="rounded-2xl border border-advent-border bg-white p-6 shadow-xs">
                <h3 class="text-base font-bold text-advent-text">Comodidades & Acessibilidade</h3>
                <p class="text-xs text-advent-muted mt-1">
                  Nossa estrutura foi preparada para acolher você e sua família com conforto.
                </p>

                <div class="mt-4 grid gap-3 sm:grid-cols-2">
                  <!-- Estacionamento -->
                  <div class="flex items-start gap-3 rounded-xl bg-advent-neutral/50 p-3">
                    <div class="rounded-lg bg-advent-blue/10 p-2 text-advent-blue shrink-0">
                      <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.676a6.002 6.002 0 00-4-1.954V12h5.666"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-advent-text">Estacionamento</h4>
                      <p class="text-[11px] text-advent-muted mt-0.5">
                        Vagas gratuitas e seguras no entorno.
                      </p>
                    </div>
                  </div>

                  <!-- Acessibilidade -->
                  <div class="flex items-start gap-3 rounded-xl bg-advent-neutral/50 p-3">
                    <div class="rounded-lg bg-advent-blue/10 p-2 text-advent-blue shrink-0">
                      <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.765z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-advent-text">Acessibilidade</h4>
                      <p class="text-[11px] text-advent-muted mt-0.5">
                        Rampas de acesso e assentos prioritários.
                      </p>
                    </div>
                  </div>

                  <!-- Espaço Infantil -->
                  <div class="flex items-start gap-3 rounded-xl bg-advent-neutral/50 p-3">
                    <div class="rounded-lg bg-advent-blue/10 p-2 text-advent-blue shrink-0">
                      <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-advent-text">Espaço Infantil</h4>
                      <p class="text-[11px] text-advent-muted mt-0.5">
                        Classes infantis e berçário acolhedor.
                      </p>
                    </div>
                  </div>

                  <!-- Ambiente Climatizado -->
                  <div class="flex items-start gap-3 rounded-xl bg-advent-neutral/50 p-3">
                    <div class="rounded-lg bg-advent-blue/10 p-2 text-advent-blue shrink-0">
                      <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-advent-text">Ambiente Climatizado</h4>
                      <p class="text-[11px] text-advent-muted mt-0.5">
                        Templo e salas com ar-condicionado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- FAQ Accordion -->
              <div class="rounded-2xl border border-advent-border bg-white p-6 shadow-xs">
                <h3 class="text-base font-bold text-advent-text">Dúvidas Frequentes do Visitante</h3>
                <div class="mt-4 space-y-3">
                  @for (faq of faqs; track faq.question) {
                    <div
                      class="overflow-hidden rounded-lg border border-advent-border/80 bg-advent-neutral/40 transition-colors"
                    >
                      <button
                        type="button"
                        class="flex w-full items-center justify-between p-3.5 text-left text-sm font-bold text-advent-text hover:text-advent-blue transition-colors cursor-pointer"
                        (click)="toggleFaq(faq.question)"
                        [attr.aria-expanded]="isExpanded(faq.question)"
                      >
                        <span class="pr-2">{{ faq.question }}</span>
                        <svg
                          class="h-4 w-4 shrink-0 text-advent-blue transition-transform duration-300 ease-out"
                          [class.rotate-180]="isExpanded(faq.question)"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2.5"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </button>

                      <div
                        class="grid transition-[grid-template-rows] duration-300 ease-in-out"
                        [class.grid-rows-[1fr]]="isExpanded(faq.question)"
                        [class.grid-rows-[0fr]]="!isExpanded(faq.question)"
                      >
                        <div class="overflow-hidden">
                          <div
                            class="border-t border-advent-border/60 bg-white p-3.5 text-xs text-advent-muted leading-relaxed transition-opacity duration-300"
                            [class.opacity-100]="isExpanded(faq.question)"
                            [class.opacity-0]="!isExpanded(faq.question)"
                          >
                            <p>{{ faq.answer }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class HorariosPage {
  protected readonly site = SITE_CONFIG;
  private readonly contentService = inject(ContentService);
  private readonly toastService = inject(ToastService);
  private readonly seo = inject(SeoService);

  readonly horarios = () => this.contentService.horarios();
  readonly avisosHorarios = () => this.contentService.avisosHorarios();

  readonly sunsetToday = signal<string>(getTodaySunset());
  readonly sabbathInfo = signal(getSabbathSunsets());
  readonly openCalendarMenuId = signal<string | null>(null);

  readonly fullAddress = computed(
    () => `${this.site.address.street}, ${this.site.city} - ${this.site.state}`,
  );

  readonly googleMapsUrl = computed(() => getGoogleMapsUrl(this.fullAddress()));
  readonly wazeUrl = computed(() => getWazeUrl());
  readonly appleMapsUrl = computed(() => getAppleMapsUrl(this.fullAddress()));
  readonly uberUrl = computed(() => getUberUrl(this.fullAddress()));

  readonly nextService = computed(() => this.calculateNextService(this.horarios()));

  protected readonly faqs = [
    {
      question: 'Como devo me vestir?',
      answer: 'Venha com roupas confortáveis e adequadas para um ambiente de culto e reflexão.',
    },
    {
      question: 'Tem espaço para crianças?',
      answer:
        'Sim! Temos classes da Escola Sabatina divididas por faixa etária durante as manhãs de sábado e berçário acolhedor.',
    },
    {
      question: 'Preciso pagar alguma coisa?',
      answer:
        'Não. A participação em todas as nossas programações é totalmente gratuita e aberta a todos.',
    },
  ];

  protected readonly openFaqs = signal<Set<string>>(new Set([this.faqs[0].question]));

  constructor() {
    this.seo.apply({
      title: 'Horários dos Cultos e Localização — IASD Mangueiras',
      description:
        'Conheça os horários dos cultos de sábado e quarta-feira da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP e saiba como chegar.',
      path: '/horarios',
      breadcrumbs: [
        { name: 'Início', url: 'https://iasdmangueiras.org.br/' },
        { name: 'Horários e Localização', url: 'https://iasdmangueiras.org.br/horarios' },
      ],
      faqs: this.faqs,
    });
  }

  isExpanded(question: string): boolean {
    return this.openFaqs().has(question);
  }

  toggleFaq(question: string): void {
    this.openFaqs.update((set) => {
      const next = new Set(set);
      if (next.has(question)) {
        next.delete(question);
      } else {
        next.add(question);
      }
      return next;
    });
  }

  toggleCalendarMenu(titulo: string): void {
    this.openCalendarMenuId.update((current) => (current === titulo ? null : titulo));
  }

  closeCalendarMenu(): void {
    this.openCalendarMenuId.set(null);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.closeCalendarMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (this.openCalendarMenuId() && target && !target.closest('[data-calendar-menu]')) {
      this.closeCalendarMenu();
    }
  }

  async copyAddress(): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(this.fullAddress());
      }
      this.toastService.success(
        'Endereço copiado para a área de transferência!',
        'Endereço Copiado',
      );
    } catch {
      this.toastService.info(this.fullAddress(), 'Endereço');
    }
  }

  getDayOfWeek(dia: string): number {
    const normalized = (dia || '').toLowerCase().trim();
    if (normalized.includes('domingo')) return 0;
    if (normalized.includes('segunda')) return 1;
    if (normalized.includes('terça') || normalized.includes('terca')) return 2;
    if (normalized.includes('quarta')) return 3;
    if (normalized.includes('quinta')) return 4;
    if (normalized.includes('sexta')) return 5;
    if (normalized.includes('sábado') || normalized.includes('sabado')) return 6;
    return 0;
  }

  isTodayService(horario: Horario, refDate: Date = new Date()): boolean {
    const currentDay = refDate.getDay();
    return this.getDayOfWeek(horario.dia) === currentDay;
  }

  isNextService(horario: Horario): boolean {
    const next = this.nextService();
    return next?.horario.titulo === horario.titulo && next?.horario.dia === horario.dia;
  }

  getGoogleCalendarLink(horario: Horario): string {
    return buildGoogleCalendarUrl({
      title: `${horario.titulo} — IASD Mangueiras`,
      description: `${horario.descricao}\n\nLocal: ${this.fullAddress()}`,
      location: this.fullAddress(),
      dayOfWeek: this.getDayOfWeek(horario.dia),
      time: horario.horario,
      durationMinutes: 90,
    });
  }

  downloadIcsAndClose(horario: Horario): void {
    const filename = `${horario.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
    downloadIcsFile(
      {
        title: `${horario.titulo} — IASD Mangueiras`,
        description: `${horario.descricao}\n\nLocal: ${this.fullAddress()}`,
        location: this.fullAddress(),
        dayOfWeek: this.getDayOfWeek(horario.dia),
        time: horario.horario,
        durationMinutes: 90,
      },
      filename,
    );
    this.closeCalendarMenu();
  }

  getWhatsAppLink(horario: Horario): string {
    return getWhatsAppShareUrl({
      title: horario.titulo,
      day: horario.dia,
      time: horario.horario,
      address: this.fullAddress(),
    });
  }

  private calculateNextService(
    horarios: readonly Horario[],
    refDate: Date = new Date(),
  ): { horario: Horario; isToday: boolean; text: string } | null {
    if (!horarios || horarios.length === 0) return null;

    const currentDay = refDate.getDay();
    const currentMinutes = refDate.getHours() * 60 + refDate.getMinutes();

    let closest: { horario: Horario; diffMinutes: number; isToday: boolean } | null = null;

    for (const h of horarios) {
      const targetDay = this.getDayOfWeek(h.dia);
      const [hours, mins] = (h.horario || '00:00').split(':').map(Number);
      const serviceMinutes = (isNaN(hours) ? 0 : hours) * 60 + (isNaN(mins) ? 0 : mins);

      let daysToAdd = (targetDay - currentDay + 7) % 7;
      let diff = daysToAdd * 1440 + (serviceMinutes - currentMinutes);

      if (diff < 0) {
        diff += 7 * 1440;
        daysToAdd = 7;
      }

      const isToday = daysToAdd === 0 && diff >= 0;

      if (!closest || diff < closest.diffMinutes) {
        closest = { horario: h, diffMinutes: diff, isToday };
      }
    }

    if (!closest) return null;

    const text = closest.isToday
      ? `Hoje às ${closest.horario.horario}`
      : `${closest.horario.dia} às ${closest.horario.horario}`;

    return {
      horario: closest.horario,
      isToday: closest.isToday,
      text,
    };
  }
}
