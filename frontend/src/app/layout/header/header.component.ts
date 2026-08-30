import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
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
          routerLink="/"
          aria-label="IASD Mangueiras — início"
        >
          {{ site.name }}
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:block" aria-label="Navegação principal">
          <ul class="flex items-center gap-6 text-sm font-medium text-advent-text">
            <li>
              <a
                class="transition-colors hover:text-advent-blue pb-1"
                routerLink="/horarios"
                routerLinkActive="text-advent-blue font-bold border-b-2 border-advent-blue"
              >Horários</a>
            </li>
            <li>
              <a
                class="transition-colors hover:text-advent-blue pb-1"
                routerLink="/ao-vivo"
                routerLinkActive="text-advent-blue font-bold border-b-2 border-advent-blue"
              >Ao vivo</a>
            </li>
            <li>
              <a
                class="transition-colors hover:text-advent-blue pb-1"
                routerLink="/eventos"
                routerLinkActive="text-advent-blue font-bold border-b-2 border-advent-blue"
              >Eventos</a>
            </li>
            <li>
              <a
                class="transition-colors hover:text-advent-blue pb-1"
                routerLink="/ministerios"
                routerLinkActive="text-advent-blue font-bold border-b-2 border-advent-blue"
              >Ministérios</a>
            </li>
            <li>
              <a
                class="transition-colors hover:text-advent-blue pb-1"
                routerLink="/estudos"
                routerLinkActive="text-advent-blue font-bold border-b-2 border-advent-blue"
              >Estudos & PGs</a>
            </li>
            <li>
              <a
                class="transition-colors hover:text-advent-blue pb-1"
                routerLink="/sou-novo"
                routerLinkActive="text-advent-blue font-bold border-b-2 border-advent-blue"
              >Sou novo</a>
            </li>

            <!-- Botão de Busca Global -->
            <li>
              <button
                type="button"
                (click)="onSearch()"
                class="inline-flex items-center gap-2 rounded-xl border border-advent-border bg-slate-50 px-3 py-1.5 text-xs text-advent-muted hover:border-advent-blue/40 hover:text-advent-blue hover:bg-white transition-all cursor-pointer shadow-2xs"
                title="Buscar no site (Ctrl + K)"
                aria-label="Abrir busca"
              >
                <svg class="h-4 w-4 text-advent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <span>Buscar</span>
                <kbd class="hidden lg:inline-block rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">⌘K</kbd>
              </button>
            </li>

            <li>
              <a
                class="rounded-card bg-advent-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner"
                routerLink="/contato"
              >
                Contato
              </a>
            </li>
          </ul>
        </nav>

        <!-- Mobile Buttons (Busca + Hamburger) -->
        <div class="flex items-center gap-2 md:hidden">
          <button
            type="button"
            (click)="onSearch()"
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-advent-border text-advent-text transition-colors hover:bg-gray-100 active:scale-95 cursor-pointer"
            aria-label="Abrir busca"
          >
            <svg class="h-5 w-5 text-advent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          <button
            #hamburgerBtn
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-advent-border text-advent-text transition-colors hover:bg-gray-100 active:scale-95 cursor-pointer"
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
          class="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col justify-between bg-white p-6 shadow-2xl transition-transform duration-300 md:hidden animate-slideInRight"
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal de navegação"
          (keydown)="handleDrawerKeydown($event)"
        >
          <div>
            <div class="flex items-center justify-between border-b border-advent-border pb-4">
              <span class="font-brand text-lg font-bold text-advent-blue">Menu Principal</span>
              <button
                #closeBtn
                type="button"
                class="rounded-lg p-1.5 text-advent-muted hover:bg-gray-100 hover:text-advent-text focus:outline-none focus:ring-2 focus:ring-advent-blue cursor-pointer"
                (click)="closeMenu()"
                aria-label="Fechar menu"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav class="mt-6" aria-label="Navegação móvel">
              <ul class="space-y-3 text-base font-medium text-advent-text">
                <li>
                  <button
                    type="button"
                    class="w-full flex items-center justify-between rounded-lg px-3 py-2.5 bg-blue-50/70 text-advent-blue font-bold transition-colors cursor-pointer"
                    (click)="onSearch(); closeMenu()"
                  >
                    <span class="flex items-center gap-3">
                      <svg class="h-5 w-5 text-advent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      Buscar no Site
                    </span>
                    <span class="text-xs text-advent-blue">⌘K</span>
                  </button>
                </li>
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    routerLink="/horarios"
                    (click)="closeMenu()"
                  >
                    <span class="flex items-center gap-3">
                      <svg class="h-5 w-5 text-advent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Horários de Culto
                    </span>
                    <span class="text-xs text-advent-muted">→</span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-advent-neutral hover:text-advent-blue active:bg-advent-neutral"
                    routerLink="/ao-vivo"
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
                    routerLink="/eventos"
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
                    routerLink="/ministerios"
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
                    routerLink="/estudos"
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
                    routerLink="/sou-novo"
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

          <div class="border-t border-advent-border pt-6">
            <a
              class="block w-full rounded-card bg-advent-blue py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner"
              routerLink="/contato"
              (click)="closeMenu()"
            >
              Fale Conosco
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

  @Output() searchClick = new EventEmitter<void>();

  @ViewChild('hamburgerBtn') private readonly hamburgerBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('closeBtn') private readonly closeBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('drawerElement') private readonly drawerElement?: ElementRef<HTMLElement>;

  onSearch(): void {
    this.searchClick.emit();
  }

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
