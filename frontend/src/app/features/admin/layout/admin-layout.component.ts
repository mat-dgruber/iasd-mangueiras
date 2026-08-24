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
    <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row text-advent-text">
      <!-- Barra Lateral / Sidebar -->
      <aside class="w-full md:w-64 bg-white border-r border-advent-border flex flex-col justify-between p-5 shadow-sm">
        <div>
          <!-- Logo & Header -->
          <div class="flex items-center justify-between pb-5 border-b border-advent-border">
            <div>
              <a href="/admin" class="font-brand text-lg font-bold text-advent-blue">
                {{ site.name }}
              </a>
              <span class="block text-[10px] uppercase font-bold tracking-wider text-advent-muted">
                Gestor de Conteúdo
              </span>
            </div>
            <button
              type="button"
              class="md:hidden p-2 text-advent-muted hover:text-advent-text cursor-pointer"
              (click)="isMobileMenuOpen.set(!isMobileMenuOpen())"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          >
            <a
              routerLink="/admin"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <span>📊</span>
              Visão Geral
            </a>

            <a
              routerLink="/admin/eventos"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <span>📅</span>
              Eventos & Agenda
            </a>

            <a
              routerLink="/admin/comunicados"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <span>📢</span>
              Comunicados & Banners
            </a>

            <a
              routerLink="/admin/pgs"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <span>🏠</span>
              Pequenos Grupos (PGs)
            </a>

            <a
              routerLink="/admin/oracoes"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <span>🙏</span>
              Pedidos de Oração
            </a>


            <a
              routerLink="/admin/horarios"
              routerLinkActive="bg-advent-blue text-white shadow-sm font-semibold"
              class="flex items-center gap-3 rounded-card px-3.5 py-2.5 text-sm font-medium text-advent-text hover:bg-slate-100 transition-colors"
            >
              <span>⏰</span>
              Avisos de Horários
            </a>
          </nav>
        </div>

        <!-- Rodapé do Painel (Usuário & Logout) -->
        <div class="mt-8 pt-4 border-t border-advent-border">
          <div class="flex items-center gap-3">
            @if (user()?.photoURL) {
              <img [src]="user()?.photoURL" class="h-9 w-9 rounded-full border border-advent-border" alt="Avatar" />
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
              class="text-xs font-semibold text-advent-blue hover:underline"
            >
              Ver site ↗
            </a>

            <button
              type="button"
              (click)="handleLogout()"
              class="rounded px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      <!-- Conteúdo Principal -->
      <main class="flex-1 p-6 md:p-10 max-w-6xl overflow-y-auto">
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
