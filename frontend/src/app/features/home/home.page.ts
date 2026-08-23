import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { YoutubeService } from '../../core/services/youtube.service';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo">
      <!-- Hero Section -->
      <section class="bg-advent-blue text-white">
        <div class="mx-auto grid max-w-site gap-8 px-4 py-14 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-20">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">{{ site.city }}-{{ site.state }}</p>
            <h1 class="mt-4 text-4xl font-bold leading-tight md:text-5xl">Igreja Adventista do Sétimo Dia das Mangueiras</h1>
            <p class="mt-5 max-w-2xl text-lg text-white/85">Um ponto de encontro para adoração, esperança, estudo da Bíblia e serviço à comunidade em Tatuí.</p>
            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <a class="rounded-card bg-white px-6 py-3.5 text-center font-semibold text-advent-blue shadow-md transition-colors hover:bg-white/90" href="/horarios">
                Como chegar e horários
              </a>
              <a class="rounded-card border border-white/40 px-6 py-3.5 text-center font-semibold text-white transition-colors hover:bg-white/10" href="/ao-vivo">
                Assistir ao vivo
              </a>
            </div>
          </div>

          <aside class="rounded-section border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
            <span class="inline-block rounded bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">Neste Sábado</span>
            <h2 class="mt-3 text-2xl font-bold text-white">Próximo encontro</h2>
            <div class="mt-4 space-y-3 text-white/90">
              <div class="flex items-start gap-3">
                <span class="mt-1 block h-2 w-2 rounded-full bg-white"></span>
                <div>
                  <p class="font-semibold">09:00 — Escola Sabatina</p>
                  <p class="text-sm text-white/75">Estudo da Bíblia em classes para todas as idades</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 block h-2 w-2 rounded-full bg-white"></span>
                <div>
                  <p class="font-semibold">10:15 — Culto Divino</p>
                  <p class="text-sm text-white/75">Louvor, oração e mensagem inspiradora</p>
                </div>
              </div>
            </div>
            <a class="mt-6 inline-flex items-center text-sm font-semibold text-white underline underline-offset-4 hover:text-white/80" href="/horarios">
              Ver programação semanal completa →
            </a>
          </aside>
        </div>
      </section>

      <!-- Horários e Localização -->
      <section class="mx-auto max-w-site px-4 py-14">
        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 class="text-3xl font-bold text-advent-text">Horários e localização</h2>
            <p class="mt-2 text-lg text-advent-muted">Portas abertas para você e sua família participarem dos nossos encontros semanais.</p>
          </div>
          <a class="inline-flex font-semibold text-advent-blue hover:underline" href="/horarios">
            Ver detalhes e mapa →
          </a>
        </div>

        <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (item of horarios(); track item.titulo) {
            <article class="flex flex-col justify-between rounded-card border border-advent-border bg-white p-6 shadow-sm">
              <div>
                <span class="inline-block rounded bg-advent-neutral px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
                  {{ item.dia }}
                </span>
                <p class="mt-3 text-2xl font-bold text-advent-text">{{ item.horario }}</p>
                <h3 class="mt-1 text-lg font-semibold text-advent-text">{{ item.titulo }}</h3>
                <p class="mt-2 text-sm text-advent-muted">{{ item.descricao }}</p>
              </div>
            </article>
          }
        </div>
      </section>

      <!-- Ao Vivo e Vídeos -->
      <section class="bg-advent-neutral py-14">
        <div class="mx-auto max-w-site px-4">
          <div class="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span class="text-sm font-semibold uppercase tracking-wider text-advent-blue">Transmissões Oficiais</span>
              <h2 class="mt-2 text-3xl font-bold text-advent-text">Ao vivo e mensagens</h2>
              <p class="mt-3 text-lg text-advent-muted">
                Acompanhe as transmissões dos nossos cultos ao vivo ou reveja as mensagens bíblicas e séries de estudos pelo nosso canal oficial.
              </p>
              <div class="mt-6 flex flex-col gap-3 sm:flex-row">
                <a class="rounded-card bg-advent-blue px-6 py-3 text-center font-semibold text-white shadow-sm transition-colors hover:bg-advent-blue-dark" href="/ao-vivo">
                  Assistir no site
                </a>
                <a class="rounded-card border border-advent-border bg-white px-6 py-3 text-center font-semibold text-advent-text shadow-sm transition-colors hover:bg-gray-50" href="{{ site.social.youtube }}" target="_blank" rel="noopener noreferrer">
                  Canal no YouTube ↗
                </a>
              </div>
            </div>

            <div class="overflow-hidden rounded-section border border-advent-border bg-white p-6 shadow-sm">
              <div class="aspect-video w-full rounded-lg bg-gray-900 flex flex-col items-center justify-center text-center p-6 text-white">
                <svg class="h-12 w-12 text-red-500 mb-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <p class="font-semibold text-lg">{{ featuredVideo()?.title || 'IASD Mangueiras Online' }}</p>
                <p class="text-sm text-gray-300 mt-1">Transmissões ao vivo aos sábados às 10:15 e quartas às 19:30</p>
                <a class="mt-4 inline-block rounded bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700" href="/ao-vivo">
                  Acessar Transmissão
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Eventos em Destaque -->
      <section class="mx-auto max-w-site px-4 py-14">
        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 class="text-3xl font-bold text-advent-text">Eventos e destaques</h2>
            <p class="mt-2 text-lg text-advent-muted">Fique por dentro das programações especiais e atividades da nossa igreja.</p>
          </div>
          <a class="inline-flex font-semibold text-advent-blue hover:underline" href="/eventos">
            Ver todos os eventos →
          </a>
        </div>

        <div class="mt-8 grid gap-6 md:grid-cols-3">
          @for (evento of eventos(); track evento.titulo) {
            <article class="flex flex-col justify-between rounded-card border border-advent-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div>
                <span class="inline-block rounded bg-advent-neutral px-2.5 py-1 text-xs font-semibold text-advent-blue">
                  {{ evento.data }} • {{ evento.horario }}
                </span>
                <h3 class="mt-3 text-xl font-bold text-advent-text">{{ evento.titulo }}</h3>
                <p class="mt-2 text-sm text-advent-muted">{{ evento.descricao }}</p>
              </div>
              <div class="mt-6 pt-4 border-t border-advent-border">
                <a class="text-sm font-semibold text-advent-blue hover:underline" [href]="evento.href || '/eventos'">
                  Mais informações →
                </a>
              </div>
            </article>
          }
        </div>
      </section>

      <!-- Ministérios -->
      <section class="bg-advent-neutral py-14">
        <div class="mx-auto max-w-site px-4">
          <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 class="text-3xl font-bold text-advent-text">Nossos ministérios</h2>
              <p class="mt-2 text-lg text-advent-muted">Diversas frentes de serviço, acolhimento e crescimento para todas as idades.</p>
            </div>
            <a class="inline-flex font-semibold text-advent-blue hover:underline" href="/ministerios">
              Conhecer todos os ministérios →
            </a>
          </div>

          <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (min of ministerios().slice(0, 6); track min.nome) {
              <div class="rounded-card border border-advent-border bg-white p-5 shadow-sm">
                <h3 class="text-lg font-bold text-advent-text">{{ min.nome }}</h3>
                <p class="mt-2 text-sm text-advent-muted">{{ min.descricao }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Próximos Passos / Conexão -->
      <section class="mx-auto max-w-site px-4 py-14">
        <div class="text-center max-w-2xl mx-auto">
          <h2 class="text-3xl font-bold text-advent-text">Próximos passos</h2>
          <p class="mt-2 text-lg text-advent-muted">Queremos caminhar com você. Escolha como deseja se conectar conosco hoje.</p>
        </div>

        <div class="mt-10 grid gap-6 md:grid-cols-3">
          <a class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all hover:border-advent-blue hover:shadow-md" href="/sou-novo">
            <div>
              <span class="text-3xl" aria-hidden="true">👋</span>
              <h3 class="mt-4 text-xl font-bold text-advent-text">Sou novo por aqui</h3>
              <p class="mt-2 text-sm text-advent-muted">Descubra o que esperar em sua primeira visita, como chegar e tire suas principais dúvidas.</p>
            </div>
            <span class="mt-6 text-sm font-semibold text-advent-blue">Saiba mais →</span>
          </a>

          <a class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all hover:border-advent-blue hover:shadow-md" href="/contato">
            <div>
              <span class="text-3xl" aria-hidden="true">🙏</span>
              <h3 class="mt-4 text-xl font-bold text-advent-text">Pedido de oração</h3>
              <p class="mt-2 text-sm text-advent-muted">Nossa equipe de oração e liderança terá alegria em orar por você e por sua família.</p>
            </div>
            <span class="mt-6 text-sm font-semibold text-advent-blue">Enviar pedido →</span>
          </a>

          <a class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all hover:border-advent-blue hover:shadow-md" href="/eventos">
            <div>
              <span class="text-3xl" aria-hidden="true">📅</span>
              <h3 class="mt-4 text-xl font-bold text-advent-text">Eventos e comunicados</h3>
              <p class="mt-2 text-sm text-advent-muted">Acompanhe as próximas programações especiais, congressos e projetos comunitários.</p>
            </div>
            <span class="mt-6 text-sm font-semibold text-advent-blue">Ver programação →</span>
          </a>
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

  constructor() {
    this.seo.apply({
      title: 'IASD Mangueiras — Igreja Adventista em Tatuí-SP',
      description: SITE_CONFIG.description,
      path: '',
    });
  }

  ngOnInit(): void {
    this.youtubeService.fetchLatestVideos().subscribe();
  }
}


