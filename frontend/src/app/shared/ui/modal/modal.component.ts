import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-ui-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-fadeIn"
        (click)="onBackdropClick($event)"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-label]="title()"
        tabindex="-1"
      >
        <div
          #modalPanel
          class="relative w-full rounded-2xl bg-white shadow-2xl border border-advent-border overflow-hidden transition-all duration-300 animate-scaleUp"
          [class.max-w-md]="size() === 'sm'"
          [class.max-w-xl]="size() === 'md'"
          [class.max-w-3xl]="size() === 'lg'"
          [class.max-w-5xl]="size() === 'xl'"
          (click)="$event.stopPropagation()"
        >
          <!-- Header do Modal -->
          <header class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 class="text-lg font-bold text-advent-text">{{ title() }}</h2>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              (click)="close.emit()"
              aria-label="Fechar janela modal"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <!-- Corpo do Modal -->
          <div class="px-6 py-5 max-h-[75vh] overflow-y-auto">
            <ng-content />
          </div>

          <!-- Rodapé do Modal (opcional) -->
          @if (showFooter()) {
            <footer class="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-3.5">
              <ng-content select="[footer]" />
            </footer>
          }
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly showFooter = input<boolean>(false);
  readonly closeOnBackdrop = input<boolean>(true);

  readonly close = output<void>();

  @ViewChild('modalPanel') modalPanel?: ElementRef<HTMLElement>;

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop()) {
      this.close.emit();
    }
  }
}
