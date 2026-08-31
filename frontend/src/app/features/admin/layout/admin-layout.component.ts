import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SITE_CONFIG } from '../../../core/site/site.config';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-white focus:px-4 focus:py-2 focus:text-advent-blue shadow-lg border border-advent-blue"
      href="#conteudo"
    >
      Ir para o conteúdo
    </a>

    <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row text-advent-text">
      <!-- Barra Lateral / Sidebar -->
      <aside class="w-full md:w-64 bg-white border-r border-advent-border flex flex-col justify-between p-5 shadow-sm">
        <div>
          <!-- Logo & Header -->
          <div class="flex items-center justify-between pb-5 border-b border-advent-border">
            <div>
              <a routerLink="/admin" class="font-brand text-lg font-bold text-advent-blue">
                {{ site.name }}
              </a>
              <span class="block text-[10px] uppercase font-bold tracking-wider text-advent-muted">
                Gestor de Conteúdo
              </span>
            </div>
            <button
              type="button"
              class="md:hidden p-2.5 rounded-lg border border-advent-border text-advent-muted hover:text-advent-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              (click)="isMobileMenuOpen.set(!isMobileMenuOpen())"
              [attr.aria-expanded]="isMobileMenuOpen()"
              aria-label="Abrir ou fechar menu do painel"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

          <!-- Navegação -->
          <nav
            class="mt-6 space-y-1.5"
            [class.hidden]="!isMobileMenuOpen()"
            [class.block]="isMobileMenuOpen()"
            class="md:block"
            aria-label="Navegação administrativa"
          >
            <a
              routerLink="/admin"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Visão Geral
            </a>

            <a
              routerLink="/admin/eventos"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.253M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Eventos & Agenda
            </a>

            <a
              routerLink="/admin/comunicados"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
              Comunicados & Banners
            </a>

            <a
              routerLink="/admin/pgs"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              Pequenos Grupos (PGs)
            </a>

            <a
              routerLink="/admin/oracoes"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Pedidos de Oração
            </a>

            <a
              routerLink="/admin/contatos"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Mensagens de Contato
            </a>

            <a
              routerLink="/admin/horarios"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Avisos de Horários
            </a>

            <a
              routerLink="/admin/escalas"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Escalas & Oficiais
            </a>

            <a
              routerLink="/admin/ministerios"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Ministérios
            </a>
          </nav>
        </div>

        <!-- Rodapé do Painel (Usuário & Logout) -->
        <div class="mt-8 pt-4 border-t border-advent-border">
          <div class="flex items-center gap-3">
            @if (user()?.photoURL) {
              <img [src]="user()?.photoURL" class="h-9 w-9 rounded-full border border-advent-border" alt="Avatar" width="36" height="36" />
            } @else {
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-advent-blue/10 text-xs font-bold text-advent-blue">
                {{ userInitials() }}
              </div>
            }
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-advent-text truncate">{{ user()?.displayName || 'Administrador' }}</p>
              <p class="text-[11px] text-advent-muted truncate">{{ user()?.email }}</p>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between gap-2">
            <a
              href="/"
              target="_blank"
              class="text-xs font-semibold text-advent-blue hover:underline py-2"
            >
              Ver site ↗
            </a>

            <button
              type="button"
              (click)="handleLogout()"
              class="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer min-h-[36px] flex items-center justify-center"
              aria-label="Sair da conta administrativa"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      <!-- Conteúdo Principal -->
      <main id="conteudo" class="flex-1 p-6 md:p-10 max-w-6xl overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  protected readonly site = SITE_CONFIG;
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.authService.currentUser;
  readonly isMobileMenuOpen = signal<boolean>(false);

  userInitials(): string {
    const email = this.user()?.email || '';
    return email.slice(0, 2).toUpperCase() || 'AD';
  }

  async handleLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
