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
            Olá, {{ user()?.displayName || 'Líder / Administrador' }}
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
                  d="M6.75 3v2.25M17.25 3v2.253M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
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
                  d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"
                />
              </svg>
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
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
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
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
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

        <!-- Escalas dos Departamentos -->
        <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-advent-muted"
              >Escalas Semanais</span
            >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-base"
            >
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
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                />
              </svg>
            </span>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-advent-text">{{ totalEscalas() }}</span>
            <span class="text-xs text-purple-700 font-semibold">equipes</span>
          </div>
          <a
            routerLink="/admin/escalas"
            class="mt-3 inline-block text-xs font-semibold text-advent-blue hover:underline"
          >
            Gerenciar escalas →
          </a>
        </div>
      </div>

      <!-- Guia Rápido de Uso para Usuários Leigos -->
      <section class="mt-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 md:p-8">
        <h2 class="text-base font-bold text-advent-blue flex items-center gap-2">
          <svg
            class="h-5 w-5 shrink-0 text-advent-blue"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M9.75 9.75c0-1.242.448-2.378 1.196-3.262A4.5 4.5 0 0118 9.75c0 1.258-.517 2.396-1.354 3.208a5.27 5.27 0 00-1.396 3.042H8.75a5.27 5.27 0 00-1.396-3.042A4.478 4.478 0 019.75 9.75z"
            />
          </svg>
          Como funciona a publicação no site?
        </h2>
        <div class="mt-4 grid gap-4 md:grid-cols-3 text-xs text-advent-text leading-relaxed">
          <div class="bg-white p-4 rounded-xl border border-blue-100/80 shadow-2xs">
            <strong class="block text-sm text-advent-blue mb-1">1. Alterações em Tempo Real</strong>
            Tudo o que você publicar, editar ou excluir aqui no painel aparecerá imediatamente para
            os visitantes do site.
          </div>
          <div class="bg-white p-4 rounded-xl border border-blue-100/80 shadow-2xs">
            <strong class="block text-sm text-advent-blue mb-1"
              >2. Pequenos Grupos & Escalas</strong
            >
            Cadastre os PGs nos bairros de Tatuí e copie as escalas dos oficiais formatadas direto para o WhatsApp.
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
  readonly totalEscalas = signal<number>(0);

  async ngOnInit(): Promise<void> {
    const eventos = await this.cmsService.getEventos();
    this.totalEventos.set(eventos.length);

    const comunicados = await this.cmsService.getComunicados();
    this.totalComunicados.set(comunicados.length);

    const pgs = await this.cmsService.getPgs();
    this.totalPgs.set(pgs.length > 0 ? pgs.length : 6);

    const oracoes = await this.cmsService.getOracoes();
    this.totalOracoes.set(oracoes.length);

    const escalas = await this.cmsService.getEscalas();
    this.totalEscalas.set(escalas.length > 0 ? escalas.length : 5);
  }
}
