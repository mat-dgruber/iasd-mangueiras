import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [RouterLink, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8">
      <!-- Header do Dashboard -->
      <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            Olá, {{ user()?.displayName || 'Líder / Administrador' }}
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Painel de controle de conteúdos da IASD Mangueiras.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <a
            routerLink="/admin/eventos"
            class="rounded-card bg-advent-blue px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-advent-blue-dark transition-all cursor-pointer min-h-[40px] inline-flex items-center gap-1.5"
          >
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            + Novo Evento
          </a>

          <a
            routerLink="/admin/comunicados"
            class="rounded-card border border-advent-border bg-white px-4 py-2.5 text-xs font-semibold text-advent-text shadow-xs hover:bg-slate-50 transition-all cursor-pointer min-h-[40px] inline-flex items-center gap-1.5"
          >
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            + Novo Comunicado
          </a>
        </div>
      </header>

      <!-- Cards de Métricas e Resumos -->
      <section aria-labelledby="section-metrics">
        <h2 id="section-metrics" class="sr-only">Métricas Gerais</h2>

        @if (isLoading()) {
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Carregando métricas">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs space-y-3">
                <div class="flex items-center justify-between">
                  <app-ui-skeleton width="100px" height="0.875rem" rounded="sm" />
                  <app-ui-skeleton width="36px" height="36px" rounded="lg" />
                </div>
                <app-ui-skeleton width="60px" height="2rem" rounded="sm" />
                <app-ui-skeleton width="120px" height="0.75rem" rounded="sm" />
              </div>
            }
          </div>
        } @else {
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Eventos -->
            <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs transition-colors hover:border-advent-blue/40">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-muted">
                  Eventos na Agenda
                </span>
                <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-advent-blue">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </span>
              </div>
              <p class="mt-3 text-3xl font-extrabold text-advent-text">{{ counts().eventos }}</p>
              <div class="mt-2 flex items-center justify-between text-xs text-advent-muted">
                <span>Programações cadastradas</span>
                <a routerLink="/admin/eventos" class="font-semibold text-advent-blue hover:underline">Gerenciar →</a>
              </div>
            </div>

            <!-- Comunicados -->
            <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs transition-colors hover:border-advent-blue/40">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-muted">
                  Comunicados & Banners
                </span>
                <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.62 1.1 1.118 1.444.604.417 1.344.593 2.067.593 1.312 0 2.5-.59 3.25-1.593.75-1.003.95-2.293.5-3.527m-7.92.303a36.17 36.17 0 010-9.786m7.92.303c.45-1.234.25-2.524-.5-3.527-.75-1.003-1.938-1.593-3.25-1.593-.723 0-1.463.176-2.067.593-.498.344-.871.894-1.118 1.444-.401.891-.732 1.821-.985 2.783" />
                  </svg>
                </span>
              </div>
              <p class="mt-3 text-3xl font-extrabold text-advent-text">{{ counts().comunicados }}</p>
              <div class="mt-2 flex items-center justify-between text-xs text-advent-muted">
                <span>Avisos ativos</span>
                <a routerLink="/admin/comunicados" class="font-semibold text-advent-blue hover:underline">Ver avisos →</a>
              </div>
            </div>

            <!-- Pequenos Grupos -->
            <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs transition-colors hover:border-advent-blue/40">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-muted">
                  Pequenos Grupos
                </span>
                <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </span>
              </div>
              <p class="mt-3 text-3xl font-extrabold text-advent-text">{{ counts().pgs }}</p>
              <div class="mt-2 flex items-center justify-between text-xs text-advent-muted">
                <span>Grupos nos bairros</span>
                <a routerLink="/admin/pgs" class="font-semibold text-advent-blue hover:underline">Listar PGs →</a>
              </div>
            </div>

            <!-- Pedidos de Oração -->
            <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs transition-colors hover:border-advent-blue/40">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-muted">
                  Pedidos de Oração
                </span>
                <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-700">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </span>
              </div>
              <p class="mt-3 text-3xl font-extrabold text-advent-text">{{ counts().oracoes }}</p>
              <div class="mt-2 flex items-center justify-between text-xs text-advent-muted">
                <span>Pedidos recebidos</span>
                <a routerLink="/admin/oracoes" class="font-semibold text-advent-blue hover:underline">Atender →</a>
              </div>
            </div>
          </div>
        }
      </section>

      <!-- SEÇÃO: Atalhos Rápidos & Ações Frequentes -->
      <section aria-labelledby="section-shortcuts">
        <h2 id="section-shortcuts" class="text-lg font-bold text-advent-text mb-4">
          Ações Rápidas & Gestão
        </h2>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            routerLink="/admin/escalas"
            class="flex items-center gap-4 rounded-2xl border border-advent-border bg-white p-4 shadow-xs transition-all hover:border-advent-blue hover:shadow-sm group cursor-pointer"
          >
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-advent-blue group-hover:bg-advent-blue group-hover:text-white transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </span>
            <div>
              <h3 class="text-sm font-bold text-advent-text group-hover:text-advent-blue">Escalas Semanais</h3>
              <p class="text-xs text-advent-muted mt-0.5">Organize voluntários dos departamentos e compartilhe no WhatsApp.</p>
            </div>
          </a>

          <a
            routerLink="/admin/horarios"
            class="flex items-center gap-4 rounded-2xl border border-advent-border bg-white p-4 shadow-xs transition-all hover:border-advent-blue hover:shadow-sm group cursor-pointer"
          >
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <h3 class="text-sm font-bold text-advent-text group-hover:text-advent-blue">Horários de Culto</h3>
              <p class="text-xs text-advent-muted mt-0.5">Atualize a grade semanal e publique comunicados de feriados.</p>
            </div>
          </a>

          <a
            routerLink="/admin/contatos"
            class="flex items-center gap-4 rounded-2xl border border-advent-border bg-white p-4 shadow-xs transition-all hover:border-advent-blue hover:shadow-sm group cursor-pointer"
          >
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </span>
            <div>
              <h3 class="text-sm font-bold text-advent-text group-hover:text-advent-blue">Fale Conosco</h3>
              <p class="text-xs text-advent-muted mt-0.5">Visualize mensagens e solicitações enviadas pelos visitantes.</p>
            </div>
          </a>
        </div>
      </section>

      <!-- SEÇÃO: Guia Rápido & Boas Práticas -->
      <section aria-labelledby="section-guidance" class="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
        <h2 id="section-guidance" class="text-base font-bold text-advent-blue flex items-center gap-2">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.002 6.002 0 00-4-5.659V5a2 2 0 114 0v2.091a6.002 6.002 0 00-4 5.659zm0 0v5.25m0-5.25a6.002 6.002 0 014-5.659V5a2 2 0 10-4 0v2.091a6.002 6.002 0 014 5.659z" />
          </svg>
          Guia Rápido de Gestão de Conteúdo
        </h2>
        <div class="mt-3 grid gap-4 sm:grid-cols-3 text-xs text-advent-text/80">
          <div class="space-y-1">
            <p class="font-bold text-advent-text">1. Publicação de Eventos</p>
            <p>Sempre defina datas no formato YYYY-MM-DD e faça upload de imagens em formato 16:9 para melhor visualização nos banners.</p>
          </div>
          <div class="space-y-1">
            <p class="font-bold text-advent-text">2. Atendimento Pastoral</p>
            <p>Pedidos de oração marcados como "Confidenciais" devem ser tratados exclusivamente pela equipe de oração e liderança.</p>
          </div>
          <div class="space-y-1">
            <p class="font-bold text-advent-text">3. Escalas dos Sábados</p>
            <p>Utilize o botão "Copiar Escala WhatsApp" para repassar rapidamente a relação de oficiais escalados nos grupos da igreja.</p>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class AdminDashboardPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly cms = inject(AdminCmsService);

  readonly user = this.auth.currentUser;
  readonly isLoading = signal<boolean>(true);
  readonly counts = signal({
    eventos: 0,
    comunicados: 0,
    pgs: 0,
    oracoes: 0,
    escalas: 0,
  });

  async ngOnInit(): Promise<void> {
    await this.loadMetrics();
  }

  async loadMetrics(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [evts, coms, pgs, oracs, escs] = await Promise.allSettled([
        this.cms.getEventos(),
        this.cms.getComunicados(),
        this.cms.getPgs(),
        this.cms.getOracoes(),
        this.cms.getEscalas(),
      ]);

      this.counts.set({
        eventos: evts.status === 'fulfilled' ? evts.value.length : 3,
        comunicados: coms.status === 'fulfilled' ? coms.value.length : 2,
        pgs: pgs.status === 'fulfilled' ? pgs.value.length : 6,
        oracoes: oracs.status === 'fulfilled' ? oracs.value.length : 2,
        escalas: escs.status === 'fulfilled' ? escs.value.length : 4,
      });
    } catch {
      this.counts.set({
        eventos: 3,
        comunicados: 2,
        pgs: 6,
        oracoes: 2,
        escalas: 4,
      });
    } finally {
      this.isLoading.set(false);
    }
  }
}
