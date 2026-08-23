import { ChangeDetectionStrategy, Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SeoService } from '../../core/seo/seo.service';
import { VideoItem } from '../../core/models/youtube.models';
import { YoutubeService } from '../../core/services/youtube.service';
import { SITE_CONFIG } from '../../core/site/site.config';


@Component({
  selector: 'app-ao-vivo-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" href="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page">Ao Vivo e Mensagens</span>
        </nav>

        <header class="max-w-3xl">
          <span class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
            Canal Oficial da Igreja
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Transmissões e Mensagens
          </h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Cultos ao vivo aos <strong>sábados às 10:15</strong> e às <strong>quartas-feiras às 19:30</strong>. Assista onde você estiver e compartilhe a mensagem com quem precisa.
          </p>
        </header>

        <!-- Player / Status da Live -->
        <section class="mt-12 overflow-hidden rounded-section border border-advent-border bg-white shadow-sm" aria-label="Transmissão principal">
          <div class="aspect-video w-full bg-gray-950 flex flex-col items-center justify-center text-center p-6 text-white relative">
            @if (isLive()) {
              <span class="absolute top-4 left-4 inline-flex items-center gap-2 rounded bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white animate-pulse">
                <span class="h-2 w-2 rounded-full bg-white"></span>
                Ao Vivo Agora
              </span>
              <h2 class="text-2xl font-bold md:text-3xl max-w-xl">
                {{ liveVideo()?.title || 'Culto Ao Vivo — IASD Mangueiras' }}
              </h2>
              <p class="mt-2 text-sm text-gray-300 max-w-md">
                {{ liveVideo()?.description || 'Acompanhe a transmissão em tempo real.' }}
              </p>
              @if (liveVideo()) {
                <button
                  type="button"
                  class="mt-6 inline-flex items-center gap-2 rounded-card bg-red-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer"
                  (click)="openModal(liveVideo()!)"
                >
                  ▶ Assistir Ao Vivo no Site
                </button>
              }
            } @else {
              <div class="max-w-xl">
                <span class="inline-block rounded bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
                  Próxima Transmissão
                </span>
                <h2 class="mt-3 text-2xl font-bold md:text-3xl">
                  Nenhuma transmissão ao vivo no momento
                </h2>
                <p class="mt-3 text-gray-300 text-sm md:text-base leading-relaxed">
                  Nossos cultos regulares acontecem aos sábados às 10:15 e quartas às 19:30. Veja abaixo as últimas mensagens gravadas ou acesse nosso canal completo.
                </p>
                <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    class="rounded-card bg-advent-blue px-6 py-3 text-sm font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner"
                    href="{{ site.social.youtube }}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Inscrever-se no Canal ↗
                  </a>
                  <a
                    class="rounded-card border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98] active:shadow-inner"
                    href="/horarios"
                  >
                    Ver Todos os Horários
                  </a>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Série Presente 7 -->
        <section class="mt-16" aria-labelledby="serie-title">
          <div class="rounded-section border border-advent-border bg-advent-neutral p-6 md:p-10">
            <div class="max-w-2xl">
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Série Especial</span>
              <h2 id="serie-title" class="mt-2 text-3xl font-bold text-advent-text">
                Série Presente 7
              </h2>
              <p class="mt-2 text-advent-muted leading-relaxed">
                Descubra o propósito original do sábado como um dia de restauração, comunhão e bênção divina para a humanidade.
              </p>
            </div>

            <div class="mt-8 grid gap-6 md:grid-cols-2">
              <article class="flex flex-col justify-between rounded-card border border-advent-border bg-white p-6 shadow-sm">
                <div>
                  <span class="inline-block rounded bg-advent-blue/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
                    Episódio 1
                  </span>
                  <h3 class="mt-3 text-xl font-bold text-advent-text">O Princípio da Criação</h3>
                  <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                    Um estudo sobre como o descanso sagrado foi estabelecido no Éden para todo ser humano.
                  </p>
                </div>
                <div class="mt-6 pt-4 border-t border-advent-border">
                  <a
                    class="text-sm font-semibold text-advent-blue hover:underline"
                    [href]="site.social.youtube"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Assistir no YouTube ↗
                  </a>
                </div>
              </article>

              <article class="flex flex-col justify-between rounded-card border border-advent-border bg-white p-6 shadow-sm">
                <div>
                  <span class="inline-block rounded bg-advent-blue/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
                    Episódio 2
                  </span>
                  <h3 class="mt-3 text-xl font-bold text-advent-text">Um Dia de Descanso e Cura</h3>
                  <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                    Como Jesus vivenciou o sábado como dia de alívio, libertação e restauração espiritual.
                  </p>
                </div>
                <div class="mt-6 pt-4 border-t border-advent-border">
                  <a
                    class="text-sm font-semibold text-advent-blue hover:underline"
                    [href]="site.social.youtube"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Assistir no YouTube ↗
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <!-- Mensagens Recentes com Player Modal -->
        <section class="mt-16" aria-labelledby="mensagens-title">
          <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 id="mensagens-title" class="text-2xl font-bold text-advent-text">
                Mensagens Recentes
              </h2>
              <p class="mt-1 text-advent-muted">
                Clique para assistir diretamente pelo site ou acesse o canal.
              </p>
            </div>
            <a
              class="font-semibold text-advent-blue hover:underline text-sm"
              [href]="site.social.youtube"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver arquivo completo no YouTube ↗
            </a>
          </div>

          @if (videos().length === 0) {
            <div class="mt-8 grid gap-6 md:grid-cols-3" aria-label="Carregando mensagens...">
              @for (i of [1, 2, 3]; track i) {
                <div class="rounded-section border border-advent-border bg-white shadow-sm overflow-hidden animate-pulse">
                  <div class="aspect-video bg-gray-200"></div>
                  <div class="p-5 space-y-3">
                    <div class="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-3 bg-gray-100 rounded w-full"></div>
                    <div class="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="mt-8 grid gap-6 md:grid-cols-3">
              @for (vid of videos(); track vid.id) {
                <article
                  class="group flex flex-col justify-between rounded-section border border-advent-border bg-white shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  (click)="openModal(vid)"
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
                    <!-- Overlay de Play -->
                    <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div class="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                        <svg class="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 class="text-lg font-bold text-advent-text line-clamp-2 group-hover:text-advent-blue transition-colors">
                        {{ vid.title }}
                      </h3>
                      <p class="mt-2 text-sm text-advent-muted line-clamp-3 leading-relaxed">
                        {{ vid.description }}
                      </p>
                    </div>
                    <div class="mt-4 pt-4 border-t border-advent-border flex items-center justify-between">
                      <span class="text-sm font-semibold text-advent-blue flex items-center gap-1">
                        ▶ Assistir no site
                      </span>
                      <span class="text-xs text-advent-muted">YouTube</span>
                    </div>
                  </div>
                </article>
              }
            </div>
          }
        </section>
      </div>

      <!-- Modal de Reprodução de Vídeo Inline -->
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
            <div class="flex items-center justify-between p-4 bg-gray-950 border-b border-white/10 text-white">
              <h3 class="text-base font-bold line-clamp-1 pr-4">{{ activeVideo()?.title }}</h3>
              <button
                type="button"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                (click)="closeModal()"
                aria-label="Fechar vídeo"
              >
                ✕
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
export class AoVivoPage implements OnInit {
  protected readonly site = SITE_CONFIG;
  private readonly youtubeService = inject(YoutubeService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seo = inject(SeoService);

  protected readonly isLive = this.youtubeService.isLive;
  protected readonly liveVideo = this.youtubeService.liveVideo;
  protected readonly videos = this.youtubeService.videos;

  protected readonly activeVideo = signal<VideoItem | null>(null);

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
  }

  openModal(video: VideoItem): void {
    this.activeVideo.set(video);
  }

  closeModal(): void {
    this.activeVideo.set(null);
  }


  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.closeModal();
  }
}

