import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
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
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">Transmissões e Mensagens</h1>
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
              <h2 class="text-2xl font-bold md:text-3xl max-w-xl">{{ liveVideo()?.title || 'Culto Ao Vivo — IASD Mangueiras' }}</h2>
              <p class="mt-2 text-sm text-gray-300 max-w-md">{{ liveVideo()?.description || 'Acompanhe a transmissão em tempo real.' }}</p>
              <a
                class="mt-6 inline-flex items-center gap-2 rounded-card bg-red-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-red-700 transition-colors"
                [href]="liveVideo()?.video_url || site.social.youtube"
                target="_blank"
                rel="noopener noreferrer"
              >
                Assistir no YouTube ↗
              </a>
            } @else {
              <div class="max-w-xl">
                <span class="inline-block rounded bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
                  Próxima Transmissão
                </span>
                <h2 class="mt-3 text-2xl font-bold md:text-3xl">Nenhuma transmissão ao vivo no momento</h2>
                <p class="mt-3 text-gray-300 text-sm md:text-base leading-relaxed">
                  Nossos cultos regulares acontecem aos sábados às 10:15 e quartas às 19:30. Veja abaixo as últimas mensagens gravadas ou acesse nosso canal completo.
                </p>
                <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    class="rounded-card bg-advent-blue px-6 py-3 text-sm font-semibold text-white hover:bg-advent-blue-dark transition-colors shadow"
                    href="{{ site.social.youtube }}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Inscrever-se no Canal ↗
                  </a>
                  <a class="rounded-card border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors" href="/horarios">
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
              <h2 id="serie-title" class="mt-2 text-3xl font-bold text-advent-text">Série Presente 7</h2>
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
                  <a class="text-sm font-semibold text-advent-blue hover:underline" [href]="site.social.youtube" target="_blank" rel="noopener noreferrer">
                    Assistir Episódio 1 no YouTube ↗
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
                  <a class="text-sm font-semibold text-advent-blue hover:underline" [href]="site.social.youtube" target="_blank" rel="noopener noreferrer">
                    Assistir Episódio 2 no YouTube ↗
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <!-- Mensagens Recentes -->
        <section class="mt-16" aria-labelledby="mensagens-title">
          <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 id="mensagens-title" class="text-2xl font-bold text-advent-text">Mensagens Recentes</h2>
              <p class="mt-1 text-advent-muted">Reveja pregações e sermões gravados em nossa igreja.</p>
            </div>
            <a class="font-semibold text-advent-blue hover:underline text-sm" [href]="site.social.youtube" target="_blank" rel="noopener noreferrer">
              Ver arquivo completo no YouTube ↗
            </a>
          </div>

          <div class="mt-8 grid gap-6 md:grid-cols-3">
            @for (vid of videos(); track vid.id) {
              <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                <div class="aspect-video w-full bg-gray-200 relative overflow-hidden">
                  <img
                    class="w-full h-full object-cover"
                    [src]="vid.thumbnail_url"
                    [alt]="vid.title"
                    loading="lazy"
                  />
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 class="text-lg font-bold text-advent-text line-clamp-2">{{ vid.title }}</h3>
                    <p class="mt-2 text-sm text-advent-muted line-clamp-3 leading-relaxed">{{ vid.description }}</p>
                  </div>
                  <div class="mt-4 pt-4 border-t border-advent-border">
                    <a class="text-sm font-semibold text-advent-blue hover:underline" [href]="vid.video_url" target="_blank" rel="noopener noreferrer">
                      Assistir vídeo ↗
                    </a>
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      </div>
    </main>
  `,
})
export class AoVivoPage implements OnInit {
  protected readonly site = SITE_CONFIG;
  private readonly youtubeService = inject(YoutubeService);
  private readonly seo = inject(SeoService);

  protected readonly isLive = this.youtubeService.isLive;
  protected readonly liveVideo = this.youtubeService.liveVideo;
  protected readonly videos = this.youtubeService.videos;

  constructor() {
    this.seo.apply({
      title: 'Transmissões Ao Vivo e Mensagens — IASD Mangueiras',
      description: 'Assista aos cultos ao vivo e mensagens gravadas da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP e acompanhe a série Presente 7.',
      path: '/ao-vivo',
    });
  }

  ngOnInit(): void {
    this.youtubeService.fetchLiveStatus().subscribe();
    this.youtubeService.fetchLatestVideos().subscribe();
  }
}

