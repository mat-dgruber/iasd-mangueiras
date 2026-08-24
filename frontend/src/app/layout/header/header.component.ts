import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  signal,
} from '@angular/core';
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
              <a class="transition-colors hover:text-advent-blue" href="/estudos">Estudos & PGs</a>
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
          #hamburgerBtn
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-advent-border text-advent-text transition-colors hover:bg-gray-100 active:scale-95 md:hidden cursor-pointer"
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

      <!-- Mobile Drawer Container com Backdrop e Focus Trap -->
      @if (menuOpen()) {
        <div
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden animate-fadeIn"
          (click)="closeMenu()"
          aria-hidden="true"
        ></div>

        <div
          #drawerElement
          id="mobile-menu-drawer"
          class="fixed inset-y-0 right-0 z-50 flex w-4/5 max-w-sm flex-col justify-between bg-white p-6 shadow-2xl transition-transform duration-300 ease-out md:hidden animate-slideLeft"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação móvel"
          (keydown)="handleDrawerKeydown($event)"
        >
          <div>
            <!-- Drawer Header -->
            <div class="flex items-center justify-between border-b border-advent-border pb-4">
              <span class="font-brand text-lg text-advent-blue">{{ site.name }}</span>
              <button
                #closeBtn
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-advent-border text-advent-muted hover:bg-gray-100 hover:text-advent-text active:scale-95 cursor-pointer"
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

            <!-- Drawer Links com Ícones SVG Limpos -->
            <nav class="mt-6" aria-label="Navegação móvel">
              <ul class="space-y-2 text-base font-medium text-advent-text">
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    href="/horarios"
                    (click)="closeMenu()"
                  >
                    <span class="flex items-center gap-3">
                      <svg class="h-5 w-5 text-advent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Horários & Localização
                    </span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    href="/ao-vivo"
                    (click)="closeMenu()"
                  >
                    <span class="flex items-center gap-3">
                      <svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Cultos Ao Vivo
                    </span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    href="/eventos"
                    (click)="closeMenu()"
                  >
                    <span class="flex items-center gap-3">
                      <svg class="h-5 w-5 text-advent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Eventos & Agenda
                    </span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    href="/ministerios"
                    (click)="closeMenu()"
                  >
                    <span class="flex items-center gap-3">
                      <svg class="h-5 w-5 text-advent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Ministérios
                    </span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    href="/estudos"
                    (click)="closeMenu()"
                  >
                    <span class="flex items-center gap-3">
                      <svg class="h-5 w-5 text-advent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Estudos Bíblicos & PGs
                    </span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    href="/sou-novo"
                    (click)="closeMenu()"
                  >
                    <span class="flex items-center gap-3">
                      <svg class="h-5 w-5 text-advent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Sou Novo Aqui
                    </span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <!-- Drawer Footer CTAs -->
          <div class="mt-6 border-t border-advent-border pt-6 space-y-3">
            <a
              class="flex items-center justify-center gap-2 w-full rounded-card bg-advent-blue py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-advent-blue-dark active:scale-[0.98]"
              href="/contato"
              (click)="closeMenu()"
            >
              <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Fale Conosco & Oração
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

  @ViewChild('hamburgerBtn') private readonly hamburgerBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('closeBtn') private readonly closeBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('drawerElement') private readonly drawerElement?: ElementRef<HTMLElement>;

  toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu(): void {
    this.menuOpen.set(true);
    setTimeout(() => {
      this.closeBtn?.nativeElement?.focus();
    }, 50);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.hamburgerBtn?.nativeElement?.focus();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    }
  }

  handleDrawerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.drawerElement) return;

    const focusable = this.drawerElement.nativeElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }
}
