import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-white focus:px-4 focus:py-2 focus:text-advent-blue shadow-lg border border-advent-blue"
      href="#conteudo"
    >
      Ir para o conteúdo
    </a>

    <header
      class="sticky top-0 z-40 border-b border-advent-border bg-white/95 backdrop-blur-md transition-all"
    >
      <div class="mx-auto flex max-w-site items-center justify-between px-4 py-3.5 md:py-4">
        <!-- Logo -->
        <a
          class="font-brand text-xl text-advent-blue transition-opacity hover:opacity-90 tracking-tight"
          href="/"
          aria-label="IASD Mangueiras — início"
        >
          {{ site.name }}
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:block" aria-label="Navegação principal">
          <ul class="flex items-center gap-6 text-sm font-medium text-advent-text">
            <li>
              <a class="transition-colors hover:text-advent-blue" href="/horarios">Horários</a>
            </li>
            <li>
              <a class="transition-colors hover:text-advent-blue" href="/ao-vivo">Ao vivo</a>
            </li>
            <li>
              <a class="transition-colors hover:text-advent-blue" href="/eventos">Eventos</a>
            </li>
            <li>
              <a class="transition-colors hover:text-advent-blue" href="/ministerios"
                >Ministérios</a
              >
            </li>
            <li>
              <a class="transition-colors hover:text-advent-blue" href="/sou-novo">Sou novo</a>
            </li>
            <li>
              <a
                class="rounded-card bg-advent-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner"
                href="/contato"
              >
                Contato
              </a>
            </li>
          </ul>
        </nav>

        <!-- Mobile Hamburger Button -->
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-advent-border text-advent-text transition-colors hover:bg-gray-100 active:scale-95 md:hidden"
          (click)="toggleMenu()"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="mobile-menu-drawer"
          aria-label="Abrir ou fechar menu de navegação"
        >
          @if (!menuOpen()) {
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          } @else {
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        </button>
      </div>

      <!-- Mobile Drawer Backdrop & Panel -->
      @if (menuOpen()) {
        <div
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity md:hidden"
          (click)="closeMenu()"
          aria-hidden="true"
        ></div>

        <div
          id="mobile-menu-drawer"
          class="fixed inset-y-0 right-0 z-50 flex w-4/5 max-w-sm flex-col justify-between bg-white p-6 shadow-2xl transition-transform duration-300 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação móvel"
        >
          <div>
            <!-- Drawer Header -->
            <div class="flex items-center justify-between border-b border-advent-border pb-4">
              <span class="font-brand text-lg text-advent-blue">{{ site.name }}</span>
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-advent-border text-advent-muted hover:bg-gray-100 hover:text-advent-text active:scale-95"
                (click)="closeMenu()"
                aria-label="Fechar menu"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Drawer Links -->
            <nav class="mt-6" aria-label="Navegação móvel">
              <ul class="space-y-3 text-base font-medium text-advent-text">
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    href="/horarios"
                    (click)="closeMenu()"
                  >
                    <span>🕒 Horários & Localização</span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    href="/ao-vivo"
                    (click)="closeMenu()"
                  >
                    <span>🔴 Cultos Ao Vivo</span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    href="/eventos"
                    (click)="closeMenu()"
                  >
                    <span>📅 Eventos & Agenda</span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    href="/ministerios"
                    (click)="closeMenu()"
                  >
                    <span>🤝 Ministérios</span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    href="/sou-novo"
                    (click)="closeMenu()"
                  >
                    <span>👋 Sou Novo Aqui</span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <!-- Drawer Footer CTAs -->
          <div class="mt-6 border-t border-advent-border pt-6 space-y-3">
            <a
              class="block w-full rounded-card bg-advent-blue py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-advent-blue-dark active:scale-[0.98]"
              href="/contato"
              (click)="closeMenu()"
            >
              Fale Conosco & Oração 🙏
            </a>
            <a
              class="block w-full rounded-card border border-advent-border py-2.5 text-center text-xs font-semibold text-advent-muted hover:bg-gray-50 active:scale-[0.98]"
              [href]="site.social.whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              (click)="closeMenu()"
            >
              Conversar no WhatsApp ↗
            </a>
          </div>
        </div>
      }
    </header>
  `,
})
export class HeaderComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }
}
