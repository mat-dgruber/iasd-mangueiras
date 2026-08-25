import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { VideoCategory, VideoItem } from '../../core/models/youtube.models';
import { YoutubeService } from '../../core/services/youtube.service';
import { SITE_CONFIG } from '../../core/site/site.config';
import {
  buildGoogleCalendarUrl,
  downloadIcsFile,
} from '../../core/utils/calendar-links.util';
import { getWhatsAppShareUrl } from '../../core/utils/mobility-links.util';

export interface ScheduledLiveService {
  readonly dayOfWeek: number; // 0 = Domingo, 3 = Quarta, 6 = Sábado
  readonly dayName: string;
  readonly time: string;
  readonly title: string;
  readonly description: string;
}

export const OFFICIAL_LIVE_SERVICES: readonly ScheduledLiveService[] = [
  {
    dayOfWeek: 6,
    dayName: 'Sábado',
    time: '10:15',
    title: 'Culto de Adoração e Mensagem Bíblica',
    description: 'Transmissão ao vivo do culto divino de adoração na IASD Mangueiras.',
  },
  {
    dayOfWeek: 0,
    dayName: 'Domingo',
    time: '19:30',
    title: 'Culto da Família e Evangelismo',
    description: 'Mensagem inspiradora e louvores para toda a família.',
  },
  {
    dayOfWeek: 3,
    dayName: 'Quarta-feira',
    time: '19:30',
    title: 'Culto de Oração e Estudo Bíblico',
    description: 'Momento especial de oração intercessória e estudo das Escrituras.',
  },
];

export interface CountdownState {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly formattedDays: string;
  readonly formattedHours: string;
  readonly formattedMinutes: string;
  readonly formattedSeconds: string;
  readonly targetService: ScheduledLiveService;
  readonly targetDate: Date;
}

export function calculateNextLiveCountdown(
  refDate: Date = new Date(),
  services: readonly ScheduledLiveService[] = OFFICIAL_LIVE_SERVICES,
): CountdownState {
  const currentDay = refDate.getDay();
  const currentTotalSeconds =
    refDate.getHours() * 3600 + refDate.getMinutes() * 60 + refDate.getSeconds();

  let closest: { service: ScheduledLiveService; targetDate: Date; diffMs: number } | null = null;

  for (const s of services) {
    const [hours, mins] = s.time.split(':').map(Number);
    const serviceSeconds = (hours || 0) * 3600 + (mins || 0) * 60;

    let daysToAdd = (s.dayOfWeek - currentDay + 7) % 7;
    if (daysToAdd === 0 && serviceSeconds <= currentTotalSeconds) {
      daysToAdd = 7;
    }

    const targetDate = new Date(refDate);
    targetDate.setDate(refDate.getDate() + daysToAdd);
    targetDate.setHours(hours || 0, mins || 0, 0, 0);

    const diffMs = Math.max(0, targetDate.getTime() - refDate.getTime());
    if (!closest || diffMs < closest.diffMs) {
      closest = { service: s, targetDate, diffMs };
    }
  }

  const defaultService = services[0];
  const targetDate = closest?.targetDate ?? new Date();
  const targetService = closest?.service ?? defaultService;
  const diffMs = closest?.diffMs ?? 0;

  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const pad = (n: number): string => String(Math.max(0, n)).padStart(2, '0');

  return {
    days,
    hours,
    minutes,
    seconds,
    formattedDays: pad(days),
    formattedHours: pad(hours),
    formattedMinutes: pad(minutes),
    formattedSeconds: pad(seconds),
    targetService,
    targetDate,
  };
}

export interface CategoryFilterOption {
  readonly id: VideoCategory;
  readonly label: string;
}

export const CATEGORY_OPTIONS: readonly CategoryFilterOption[] = [
  { id: 'todos', label: 'Todas as Mensagens' },
  { id: 'presente7', label: 'Série Presente 7' },
  { id: 'sabado', label: 'Cultos de Sábado' },
  { id: 'domingo', label: 'Cultos de Domingo' },
  { id: 'quarta', label: 'Cultos de Quarta' },
];

@Component({
  selector: 'app-ao-vivo-page',
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
          <span class="font-medium text-advent-text" aria-current="page">Ao Vivo e Mensagens</span>
        </nav>

        <header class="max-w-3xl">
          <span
            class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
          >
            Canal Oficial da Igreja
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Transmissões e Mensagens
          </h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Cultos ao vivo aos <strong>sábados às 10:15</strong>, <strong>domingos às 19:30</strong> e às
            <strong>quartas-feiras às 19:30</strong>. Assista onde você estiver e compartilhe a
            mensagem bíblica com quem precisa.
          </p>
        </header>

        <!-- Player / Status da Live com Countdown em Tempo Real -->
        <section
          class="mt-10 overflow-hidden rounded-section border border-advent-border bg-white shadow-sm"
          aria-label="Transmissão principal"
        >
          @if (isLive()) {
            <!-- Hero Live Ativo -->
            <div
              class="w-full bg-slate-950 flex flex-col items-center justify-center text-center p-8 sm:p-12 text-white relative min-h-[360px]"
            >
              <span
                class="inline-flex items-center gap-2 rounded-full bg-red-600 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md animate-pulse"
              >
                <span class="h-2 w-2 rounded-full bg-white"></span>
                Ao Vivo Agora
              </span>
              <h2 class="mt-4 text-2xl font-bold md:text-4xl max-w-2xl leading-tight">
                {{ liveVideo()?.title || 'Culto Ao Vivo — IASD Mangueiras' }}
              </h2>
              <p class="mt-3 text-sm md:text-base text-gray-300 max-w-lg leading-relaxed">
                {{ liveVideo()?.description || 'Acompanhe a transmissão em tempo real diretamente de nossa igreja.' }}
              </p>
              <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
                @if (liveVideo()) {
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-card bg-red-600 px-6 py-3.5 font-semibold text-white shadow-lg hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer min-h-[44px]"
                    (click)="openModal(liveVideo()!)"
                    aria-label="Assistir transmissão ao vivo no site"
                  >
                    <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Assistir Ao Vivo no Site
                  </button>
                }
                <a
                  class="inline-flex items-center gap-2 rounded-card border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98] min-h-[44px]"
                  [href]="site.social.youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Abrir no YouTube ↗</span>
                </a>
              </div>
            </div>
          } @else {
            <!-- Hero Countdown Regressivo em Tempo Real -->
            <div
              class="w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 text-white relative flex flex-col items-center justify-center text-center"
            >
              <!-- Badge da Próxima Transmissão -->
              <div
                class="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3.5 py-1 text-xs font-semibold text-slate-200 backdrop-blur-xs"
              >
                <span class="h-2 w-2 rounded-full bg-amber-400"></span>
                <span>Próxima Transmissão Ao Vivo</span>
              </div>

              <!-- Título e Subtítulo do Próximo Culto -->
              <h2 class="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl text-white max-w-2xl">
                {{ countdown().targetService.title }}
              </h2>
              <p class="mt-2 text-sm sm:text-base text-slate-300">
                <strong>{{ countdown().targetService.dayName }} às {{ countdown().targetService.time }}</strong> • IASD Mangueiras
              </p>

              <!-- Blocos do Contador Regressivo -->
              <div
                class="mt-8 grid grid-cols-4 gap-2.5 sm:gap-4 max-w-xl w-full"
                aria-label="Contagem regressiva para o próximo culto ao vivo"
              >
                <div class="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 shadow-inner flex flex-col items-center justify-center">
                  <span class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
                    {{ countdown().formattedDays }}
                  </span>
                  <span class="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Dias
                  </span>
                </div>

                <div class="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 shadow-inner flex flex-col items-center justify-center">
                  <span class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
                    {{ countdown().formattedHours }}
                  </span>
                  <span class="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Horas
                  </span>
                </div>

                <div class="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 shadow-inner flex flex-col items-center justify-center">
                  <span class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
                    {{ countdown().formattedMinutes }}
                  </span>
                  <span class="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Minutos
                  </span>
                </div>

                <div class="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 shadow-inner flex flex-col items-center justify-center">
                  <span class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
                    {{ countdown().formattedSeconds }}
                  </span>
                  <span class="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Segundos
                  </span>
                </div>
              </div>

              <!-- Ações Rápidas de Agenda e Compartilhamento -->
              <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
                <!-- Dropdown Adicionar à Agenda -->
                <div class="relative" data-calendar-menu>
                  <button
                    type="button"
                    (click)="toggleCalendarMenu()"
                    class="inline-flex items-center gap-2 rounded-card bg-advent-blue px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-advent-blue-dark active:scale-[0.98] transition-all cursor-pointer min-h-[44px]"
                    [attr.aria-expanded]="openCalendarMenu()"
                    aria-controls="live-calendar-menu"
                    aria-label="Adicionar próximo culto à agenda"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <span>+ Adicionar à Agenda</span>
                    <svg class="h-3.5 w-3.5 transition-transform" [class.rotate-180]="openCalendarMenu()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  @if (openCalendarMenu()) {
                    <div
                      id="live-calendar-menu"
                      class="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 bottom-full mb-2 z-20 w-56 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl animate-fadeIn text-left text-white"
                      role="menu"
                    >
                      <a
                        [href]="getGoogleCalendarUrl()"
                        target="_blank"
                        rel="noopener noreferrer"
                        (click)="closeCalendarMenu()"
                        class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                        role="menuitem"
                      >
                        <svg class="h-4 w-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" />
                        </svg>
                        <span>Google Agenda</span>
                      </a>
                      <button
                        type="button"
                        (click)="downloadIcsAndClose()"
                        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                        role="menuitem"
                      >
                        <svg class="h-4 w-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        <span>Apple / Outlook (.ics)</span>
                      </button>
                    </div>
                  }
                </div>

                <!-- Botão Convidar no WhatsApp -->
                <a
                  [href]="getWhatsAppInviteUrl()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 rounded-card border border-emerald-500/40 bg-emerald-600/20 px-5 py-3 text-xs sm:text-sm font-semibold text-emerald-300 hover:bg-emerald-600/30 transition-all min-h-[44px]"
                  aria-label="Convidar amigos no WhatsApp para o próximo culto"
                >
                  <svg class="h-4 w-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Convidar no WhatsApp</span>
                </a>

                <!-- Link Canal YouTube -->
                <a
                  class="inline-flex items-center gap-1.5 rounded-card border border-white/20 bg-white/10 px-4 py-3 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/20 min-h-[44px]"
                  [href]="site.social.youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Canal no YouTube ↗</span>
                </a>
              </div>
            </div>
          }
        </section>

        <!-- Série Presente 7 (Carrossel Lateral) -->
        <section class="mt-14" aria-labelledby="serie-title">
          <div class="rounded-section border border-advent-border bg-advent-neutral p-6 md:p-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="max-w-2xl">
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-sm bg-advent-blue px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white"
                  >
                    Série Especial
                  </span>
                  <span class="text-xs text-advent-muted font-medium">Estudos e Lição da Semana</span>
                </div>
                <h2 id="serie-title" class="mt-2 text-2xl md:text-3xl font-bold text-advent-text">
                  Série Presente 7
                </h2>
                <p class="mt-1 text-sm text-advent-muted leading-relaxed">
                  Acompanhe os episódios mais recentes gravados na IASD Mangueiras. Deslize lateralmente para explorar a série.
                </p>
              </div>

              <div class="flex items-center gap-3 self-start md:self-auto">
                <!-- Controles de Navegação do Carrossel -->
                <div class="flex items-center gap-1.5 bg-white p-1 rounded-card border border-advent-border shadow-2xs">
                  <button
                    type="button"
                    (click)="scrollPresente7('prev')"
                    class="flex h-9 w-9 items-center justify-center rounded-sm text-advent-text hover:bg-advent-neutral hover:text-advent-blue transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-advent-blue"
                    aria-label="Episódios anteriores"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    (click)="scrollPresente7('next')"
                    class="flex h-9 w-9 items-center justify-center rounded-sm text-advent-text hover:bg-advent-neutral hover:text-advent-blue transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-advent-blue"
                    aria-label="Próximos episódios"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <a
                  class="font-semibold text-advent-blue hover:underline text-xs md:text-sm inline-flex items-center gap-1 shrink-0 min-h-[44px]"
                  [href]="site.playlists.presente7"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Playlist completa ↗
                </a>
              </div>
            </div>

            <!-- Trilho Horizontal do Carrossel -->
            <div
              id="presente7Carousel"
              class="mt-6 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 -mx-2 px-2 scrollbar-none"
              tabindex="0"
              role="region"
              aria-label="Carrossel de episódios da Série Presente 7"
            >
              @for (ep of presente7Videos(); track ep.id; let idx = $index) {
                <article
                  class="flex flex-col justify-between rounded-card border border-advent-border bg-white overflow-hidden shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 w-[280px] sm:w-[320px] shrink-0 snap-start"
                >
                  <div class="relative aspect-video bg-slate-900 overflow-hidden group">
                    <img
                      [src]="ep.thumbnail_url"
                      [alt]="ep.title"
                      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <button
                      type="button"
                      class="absolute inset-0 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-advent-blue"
                      (click)="openModal(ep)"
                      [attr.aria-label]="'Assistir ' + ep.title"
                    >
                      <span
                        class="flex h-11 w-11 items-center justify-center rounded-full bg-advent-blue/90 text-white shadow-lg backdrop-blur-xs transition-transform duration-300 group-hover:scale-110"
                      >
                        <svg class="h-5 w-5 fill-current ml-0.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </button>
                    <span
                      class="absolute top-2.5 left-2.5 rounded-full bg-advent-blue px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
                    >
                      Episódio {{ idx + 1 }}
                    </span>
                  </div>

                  <div class="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 class="text-sm font-bold text-advent-text line-clamp-2 leading-snug">
                        {{ ep.title }}
                      </h3>
                      <p class="mt-1.5 text-xs text-advent-muted line-clamp-2 leading-relaxed">
                        {{ ep.description }}
                      </p>
                    </div>

                    <div class="mt-4 pt-3 border-t border-advent-border flex items-center justify-between">
                      <button
                        type="button"
                        class="text-xs font-bold text-advent-blue hover:underline cursor-pointer flex items-center gap-1 min-h-[36px]"
                        (click)="openModal(ep)"
                        aria-label="Assistir episódio no site"
                      >
                        <svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>Assistir</span>
                      </button>
                      <a
                        class="text-[11px] text-advent-muted hover:text-advent-blue hover:underline flex items-center gap-0.5"
                        [href]="ep.video_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Abrir no YouTube"
                      >
                        YouTube ↗
                      </a>
                    </div>
                  </div>
                </article>
              }
            </div>
          </div>
        </section>

        <!-- Catálogo de Mensagens com Filtros e Busca Reativa -->
        <section class="mt-16" aria-labelledby="catalogo-title">
          <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">
                Acervo de Cultos
              </span>
              <h2 id="catalogo-title" class="mt-1 text-2xl sm:text-3xl font-bold text-advent-text">
                Catálogo de Mensagens
              </h2>
              <p class="mt-1 text-sm text-advent-muted leading-relaxed">
                Navegue pelas transmissões gravadas, cultos e séries bíblicas.
              </p>
            </div>
            <a
              class="font-semibold text-advent-blue hover:underline text-sm min-h-[44px] flex items-center"
              [href]="getCategoryPlaylistUrl().url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ getCategoryPlaylistUrl().label }}
            </a>
          </div>

          <!-- Barra de Busca e Filtro de Categorias -->
          <div class="mt-6 space-y-4">
            <!-- Campo de Busca -->
            <div class="relative max-w-md">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-advent-muted">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="search"
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                placeholder="Buscar por título, pregador ou assunto…"
                aria-label="Buscar mensagens e sermões"
                class="w-full rounded-xl border border-advent-border bg-white py-2.5 pl-10 pr-10 text-sm text-advent-text placeholder-advent-muted focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue min-h-[44px]"
              />
              @if (searchQuery()) {
                <button
                  type="button"
                  (click)="clearSearch()"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-advent-muted hover:text-advent-text cursor-pointer"
                  aria-label="Limpar busca"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              }
            </div>

            <!-- Pílulas de Categorias -->
            <div
              class="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filtrar por categoria"
            >
              @for (cat of categoryOptions; track cat.id) {
                <button
                  type="button"
                  (click)="selectCategory(cat.id)"
                  class="rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer min-h-[38px]"
                  [class.bg-advent-blue]="selectedCategory() === cat.id"
                  [class.text-white]="selectedCategory() === cat.id"
                  [class.shadow-xs]="selectedCategory() === cat.id"
                  [class.bg-white]="selectedCategory() !== cat.id"
                  [class.border]="selectedCategory() !== cat.id"
                  [class.border-advent-border]="selectedCategory() !== cat.id"
                  [class.text-advent-text]="selectedCategory() !== cat.id"
                  [class.hover:bg-advent-neutral]="selectedCategory() !== cat.id"
                  [attr.aria-pressed]="selectedCategory() === cat.id"
                >
                  {{ cat.label }}
                </button>
              }
            </div>
          </div>

          <!-- Grade de Resultados ou Empty State -->
          @if (filteredVideos().length === 0) {
            <div
              class="mt-8 rounded-section border border-dashed border-advent-border bg-white p-12 text-center"
            >
              <div
                class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-advent-neutral text-advent-muted"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-bold text-advent-text">Nenhuma mensagem encontrada</h3>
              <p class="mt-2 text-sm text-advent-muted max-w-md mx-auto">
                Não encontramos nenhum vídeo correspondente aos termos ou filtros selecionados.
              </p>
              <button
                type="button"
                (click)="resetFilters()"
                class="mt-5 inline-flex items-center gap-2 rounded-card bg-advent-blue px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-advent-blue-dark active:scale-[0.98] transition-all cursor-pointer min-h-[44px]"
              >
                Limpar Busca e Filtros
              </button>
            </div>
          } @else {
            <div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              @for (vid of filteredVideos(); track vid.id) {
                <article
                  class="group flex flex-col justify-between rounded-section border border-advent-border bg-white shadow-xs overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-advent-blue"
                  tabindex="0"
                  role="button"
                  [attr.aria-label]="'Assistir vídeo: ' + vid.title"
                  (click)="openModal(vid)"
                  (keydown.enter)="openModal(vid)"
                  (keydown.space)="$event.preventDefault(); openModal(vid)"
                >
                  <div class="aspect-video w-full bg-gray-200 relative overflow-hidden">
                    <img
                      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      [src]="vid.thumbnail_url"
                      [alt]="vid.title"
                      width="320"
                      height="180"
                      loading="lazy"
                    />
                    <div
                      class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div
                        class="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg"
                      >
                        <svg class="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        class="text-lg font-bold text-advent-text line-clamp-2 group-hover:text-advent-blue transition-colors leading-snug"
                      >
                        {{ vid.title }}
                      </h3>
                      <p class="mt-2 text-sm text-advent-muted line-clamp-3 leading-relaxed">
                        {{ vid.description }}
                      </p>
                    </div>
                    <div
                      class="mt-4 pt-4 border-t border-advent-border flex items-center justify-between"
                    >
                      <span class="text-sm font-semibold text-advent-blue flex items-center gap-1.5">
                        <svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Assistir no site
                      </span>
                      <span class="text-xs text-advent-muted">YouTube</span>
                    </div>
                  </div>
                </article>
              }
            </div>
          }
        </section>

        <!-- Card de Pedido de Oração e Intercessão -->
        <section
          class="mt-16 rounded-section border border-advent-blue/20 bg-gradient-to-br from-advent-neutral to-blue-50/40 p-6 md:p-10"
          aria-labelledby="oracao-title"
        >
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="max-w-2xl space-y-2">
              <span class="inline-block rounded bg-advent-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
                Cuidado e Intercessão
              </span>
              <h2 id="oracao-title" class="text-2xl sm:text-3xl font-bold text-advent-text">
                Precisa de Oração?
              </h2>
              <p class="text-advent-muted text-sm sm:text-base leading-relaxed">
                Nossa equipe pastoral e de oração intercessória se reúne semanalmente para orar pelos
                pedidos recebidos. Compartilhe seu motivo de oração ou gratidão com total sigilo.
              </p>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                [href]="getPrayerWhatsAppUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2 rounded-card bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 active:scale-[0.98] transition-all min-h-[44px]"
              >
                <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Pedir Oração no WhatsApp</span>
              </a>

              <a
                routerLink="/contato"
                class="inline-flex items-center justify-center gap-2 rounded-card border border-advent-border bg-white px-5 py-3.5 text-sm font-semibold text-advent-text hover:bg-advent-neutral transition-all min-h-[44px]"
              >
                <span>Falar Conosco</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <!-- Modal de Reprodução de Vídeo Inline Seguro -->
      @if (activeVideo()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
          (click)="closeModal()"
          role="dialog"
          aria-modal="true"
          aria-label="Player de vídeo"
        >
          <div
            class="relative w-full max-w-4xl rounded-2xl bg-gray-900 shadow-2xl overflow-hidden border border-white/10"
            (click)="$event.stopPropagation()"
          >
            <!-- Header do Modal -->
            <div
              class="flex items-center justify-between p-4 bg-gray-950 border-b border-white/10 text-white"
            >
              <h3 class="text-base font-bold line-clamp-1 pr-4">{{ activeVideo()?.title }}</h3>
              <button
                type="button"
                class="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                (click)="closeModal()"
                aria-label="Fechar vídeo"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Frame do Vídeo -->
            <div class="aspect-video w-full bg-black">
              @if (safeEmbedUrl()) {
                <iframe
                  class="h-full w-full border-0"
                  [src]="safeEmbedUrl()"
                  title="{{ activeVideo()?.title }}"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              }
            </div>
          </div>
        </div>
      }
    </main>
  `,
})
export class AoVivoPage implements OnInit, OnDestroy {
  protected readonly site = SITE_CONFIG;
  protected readonly categoryOptions = CATEGORY_OPTIONS;

  private readonly youtubeService = inject(YoutubeService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seo = inject(SeoService);

  protected readonly isLive = this.youtubeService.isLive;
  protected readonly liveVideo = this.youtubeService.liveVideo;
  protected readonly videos = this.youtubeService.videos;
  protected readonly presente7Videos = this.youtubeService.presente7Videos;
  protected readonly loading = this.youtubeService.loading;

  readonly selectedCategory = signal<VideoCategory>('todos');
  readonly searchQuery = signal<string>('');
  readonly activeVideo = signal<VideoItem | null>(null);
  readonly openCalendarMenu = signal<boolean>(false);
  readonly countdown = signal<CountdownState>(calculateNextLiveCountdown());

  private timerId: ReturnType<typeof setInterval> | null = null;

  readonly allVideos = computed<readonly VideoItem[]>(() => {
    const latest = this.videos();
    const presente7 = this.presente7Videos();
    const map = new Map<string, VideoItem>();
    for (const v of latest) {
      map.set(v.id, v);
    }
    for (const v of presente7) {
      if (!map.has(v.id)) {
        map.set(v.id, v);
      }
    }
    return Array.from(map.values());
  });

  readonly filteredVideos = computed<readonly VideoItem[]>(() => {
    const category = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    let list: readonly VideoItem[];
    if (category === 'presente7') {
      list = this.presente7Videos();
    } else if (category === 'sabado') {
      list = this.allVideos().filter((v) => {
        const text = `${v.title} ${v.description}`.toLowerCase();
        return (
          text.includes('sábado') ||
          text.includes('sabado') ||
          text.includes('adoração') ||
          text.includes('adoracao') ||
          text.includes('divino') ||
          text.includes('saudade') ||
          text.includes('dilemas') ||
          text.includes('haja luz') ||
          text.includes('viva seus') ||
          text.includes('essência') ||
          text.includes('essencia') ||
          text.includes('escola sabatina')
        );
      });
    } else if (category === 'domingo') {
      list = this.allVideos().filter((v) => {
        const text = `${v.title} ${v.description}`.toLowerCase();
        return (
          text.includes('domingo') ||
          text.includes('família') ||
          text.includes('familia') ||
          text.includes('evangelismo') ||
          text.includes('imortalidade') ||
          text.includes('santuário') ||
          text.includes('santuario') ||
          text.includes('grato') ||
          text.includes('marcados') ||
          text.includes('controle') ||
          text.includes('mais poderosa')
        );
      });
    } else if (category === 'quarta') {
      list = this.allVideos().filter((v) => {
        const text = `${v.title} ${v.description}`.toLowerCase();
        return (
          text.includes('quarta') ||
          text.includes('oração') ||
          text.includes('oracao') ||
          text.includes('servir') ||
          text.includes('financeira') ||
          text.includes('elias') ||
          text.includes('caminho') ||
          text.includes('cuida') ||
          text.includes('semeador')
        );
      });
    } else if (category === 'semana') {
      list = this.allVideos().filter((v) => {
        const text = `${v.title} ${v.description}`.toLowerCase();
        return (
          text.includes('quarta') ||
          text.includes('domingo') ||
          text.includes('oração') ||
          text.includes('oracao') ||
          text.includes('família') ||
          text.includes('familia') ||
          (!text.includes('sábado') && !text.includes('sabado') && !text.includes('presente 7'))
        );
      });
    } else {
      list = this.allVideos();
    }

    if (query) {
      list = list.filter((v) => {
        const titleMatch = v.title.toLowerCase().includes(query);
        const descMatch = v.description.toLowerCase().includes(query);
        return titleMatch || descMatch;
      });
    }

    // Ordenação rigorosamente decrescente: do mais recente para o mais antigo
    return [...list].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  });

  protected readonly safeEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const video = this.activeVideo();
    if (!video || !video.id) return null;
    const url = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  constructor() {
    this.seo.apply({
      title: 'Transmissões Ao Vivo e Mensagens — IASD Mangueiras',
      description:
        'Assista aos cultos ao vivo e mensagens gravadas da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP e acompanhe a série Presente 7.',
      path: '/ao-vivo',
    });
  }

  ngOnInit(): void {
    this.youtubeService.fetchLiveStatus().subscribe();
    this.youtubeService.fetchLatestVideos().subscribe();
    this.youtubeService.fetchPresente7Videos().subscribe();
    this.updateCountdown();

    if (typeof window !== 'undefined') {
      this.timerId = setInterval(() => {
        this.updateCountdown();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  updateCountdown(): void {
    this.countdown.set(calculateNextLiveCountdown());
  }

  selectCategory(cat: VideoCategory): void {
    this.selectedCategory.set(cat);
  }

  scrollPresente7(direction: 'prev' | 'next'): void {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('presente7Carousel');
    if (!container) return;
    const scrollAmount = 340;
    container.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input?.value ?? '');
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('todos');
  }

  openModal(video: VideoItem): void {
    this.activeVideo.set(video);
  }

  closeModal(): void {
    this.activeVideo.set(null);
  }

  toggleCalendarMenu(): void {
    this.openCalendarMenu.update((v) => !v);
  }

  closeCalendarMenu(): void {
    this.openCalendarMenu.set(false);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.closeModal();
    this.closeCalendarMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (this.openCalendarMenu() && target && !target.closest('[data-calendar-menu]')) {
      this.closeCalendarMenu();
    }
  }

  getCategoryPlaylistUrl(): { url: string; label: string } {
    const cat = this.selectedCategory();
    switch (cat) {
      case 'presente7':
        return {
          url: this.site.playlists.presente7,
          label: 'Ver playlist Presente 7 no YouTube ↗',
        };
      case 'sabado':
        return {
          url: this.site.playlists.cultosSabado,
          label: 'Ver playlist Cultos de Sábado no YouTube ↗',
        };
      case 'domingo':
        return {
          url: this.site.playlists.cultosDomingo,
          label: 'Ver playlist Cultos de Domingo no YouTube ↗',
        };
      case 'quarta':
        return {
          url: this.site.playlists.cultosQuarta,
          label: 'Ver playlist Cultos de Quarta no YouTube ↗',
        };
      case 'semana':
        return {
          url: this.site.playlists.cultosQuarta,
          label: 'Ver playlist Cultos de Quarta e Domingo no YouTube ↗',
        };
      default:
        return {
          url: this.site.social.youtube,
          label: 'Ver canal completo no YouTube ↗',
        };
    }
  }

  getGoogleCalendarUrl(): string {
    const target = this.countdown().targetService;
    const address = `${this.site.address.street}, ${this.site.city} - ${this.site.state}`;
    return buildGoogleCalendarUrl({
      title: `${target.title} — IASD Mangueiras`,
      description: `${target.description}\n\nAssista ao vivo: ${this.site.siteUrl}/ao-vivo\nLocal: ${address}`,
      location: address,
      dayOfWeek: target.dayOfWeek,
      time: target.time,
      durationMinutes: 90,
    });
  }

  downloadIcsAndClose(): void {
    const target = this.countdown().targetService;
    const address = `${this.site.address.street}, ${this.site.city} - ${this.site.state}`;
    const filename = `culto-${target.dayName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
    downloadIcsFile(
      {
        title: `${target.title} — IASD Mangueiras`,
        description: `${target.description}\n\nAssista ao vivo: ${this.site.siteUrl}/ao-vivo\nLocal: ${address}`,
        location: address,
        dayOfWeek: target.dayOfWeek,
        time: target.time,
        durationMinutes: 90,
      },
      filename,
    );
    this.closeCalendarMenu();
  }

  getWhatsAppInviteUrl(): string {
    const target = this.countdown().targetService;
    const address = `${this.site.address.street}, ${this.site.city} - ${this.site.state}`;
    return getWhatsAppShareUrl({
      title: target.title,
      day: target.dayName,
      time: target.time,
      address: `${address} (ou assista ao vivo em ${this.site.siteUrl}/ao-vivo)`,
    });
  }

  getPrayerWhatsAppUrl(): string {
    const text =
      'Olá! Gostaria de pedir uma oração para a equipe de intercessão da IASD Mangueiras.';
    return `https://api.whatsapp.com/send?phone=5515997864835&text=${encodeURIComponent(text)}`;
  }
}
