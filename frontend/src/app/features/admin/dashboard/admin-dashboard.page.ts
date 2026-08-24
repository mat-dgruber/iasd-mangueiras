import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminCmsService } from '../../../core/services/admin-cms.service';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <!-- Header do Dashboard -->
      <header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            Olá, {{ user()?.displayName || 'Líder / Administrador' }} 👋
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Painel de controle de conteúdos da IASD Mangueiras.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/eventos"
            class="rounded-card bg-advent-blue px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-advent-blue-dark transition-all cursor-pointer"
          >
            + Novo Evento
          </a>
        </div>
      </header>

      <!-- Cards de Métricas e Resumos -->
      <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Eventos -->
        <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-advent-muted"
              >Eventos na Agenda</span
            >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-advent-blue text-base"
            >
              📅
            </span>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-advent-text">{{ totalEventos() }}</span>
            <span class="text-xs text-advent-muted">programações</span>
          </div>
          <a
            routerLink="/admin/eventos"
            class="mt-3 inline-block text-xs font-semibold text-advent-blue hover:underline"
          >
            Gerenciar eventos →
          </a>
        </div>

        <!-- Comunicados -->
        <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-advent-muted"
              >Comunicados & Banners</span
            >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-base"
            >
              📢
            </span>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-advent-text">{{ totalComunicados() }}</span>
            <span class="text-xs text-advent-muted">avisos</span>
          </div>
          <a
            routerLink="/admin/comunicados"
            class="mt-3 inline-block text-xs font-semibold text-advent-blue hover:underline"
          >
            Gerenciar avisos →
          </a>
        </div>

        <!-- Pequenos Grupos -->
        <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-advent-muted"
              >Pequenos Grupos</span
            >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-base"
            >
              🏠
            </span>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-advent-text">{{ totalPgs() }}</span>
            <span class="text-xs text-indigo-700 font-semibold">em Tatuí</span>
          </div>
          <a
            routerLink="/admin/pgs"
            class="mt-3 inline-block text-xs font-semibold text-advent-blue hover:underline"
          >
            Gerenciar PGs →
          </a>
        </div>

        <!-- Pedidos de Oração -->
        <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-advent-muted"
              >Pedidos de Oração</span
            >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-base"
            >
              🙏
            </span>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-advent-text">{{ totalOracoes() }}</span>
            <span class="text-xs text-emerald-700 font-semibold">recebidos</span>
          </div>
          <a
            routerLink="/admin/oracoes"
            class="mt-3 inline-block text-xs font-semibold text-advent-blue hover:underline"
          >
            Ver orações →
          </a>
        </div>
      </div>

      <!-- Guia Rápido de Uso para Usuários Leigos -->
      <section class="mt-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 md:p-8">
        <h2 class="text-base font-bold text-advent-blue flex items-center gap-2">
          💡 Como funciona a publicação no site?
        </h2>
        <div class="mt-4 grid gap-4 md:grid-cols-3 text-xs text-advent-text leading-relaxed">
          <div class="bg-white p-4 rounded-xl border border-blue-100/80 shadow-2xs">
            <strong class="block text-sm text-advent-blue mb-1">1. Alterações em Tempo Real</strong>
            Tudo o que você publicar, editar ou excluir aqui no painel aparecerá imediatamente para
            os visitantes do site.
          </div>
          <div class="bg-white p-4 rounded-xl border border-blue-100/80 shadow-2xs">
            <strong class="block text-sm text-advent-blue mb-1"
              >2. Pequenos Grupos & Banners</strong
            >
            Cadastre os Pequenos Grupos nos bairros de Tatuí e atualize os contatos de líderes no
            WhatsApp.
          </div>
          <div class="bg-white p-4 rounded-xl border border-blue-100/80 shadow-2xs">
            <strong class="block text-sm text-advent-blue mb-1">3. Pedidos Confidenciais</strong>
            Pedidos marcados como confidenciais pelo visitante só podem ser vistos pela liderança
            autenticada neste painel.
          </div>
        </div>
      </section>
    </div>
  `,
})
export class AdminDashboardPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly cmsService = inject(AdminCmsService);

  protected readonly user = this.authService.currentUser;

  readonly totalEventos = signal<number>(0);
  readonly totalComunicados = signal<number>(0);
  readonly totalPgs = signal<number>(0);
  readonly totalOracoes = signal<number>(0);

  async ngOnInit(): Promise<void> {
    const eventos = await this.cmsService.getEventos();
    this.totalEventos.set(eventos.length);

    const comunicados = await this.cmsService.getComunicados();
    this.totalComunicados.set(comunicados.length);

    const pgs = await this.cmsService.getPgs();
    this.totalPgs.set(pgs.length > 0 ? pgs.length : 6);

    const oracoes = await this.cmsService.getOracoes();
    this.totalOracoes.set(oracoes.length);
  }
}
