import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastMessage, ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none"
      role="region"
      aria-label="Notificações do sistema"
    >
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all duration-300 animate-slideLeft"
          [class.bg-green-50]="toast.type === 'success'"
          [class.border-green-200]="toast.type === 'success'"
          [class.text-green-950]="toast.type === 'success'"
          [class.bg-red-50]="toast.type === 'error'"
          [class.border-red-200]="toast.type === 'error'"
          [class.text-red-950]="toast.type === 'error'"
          [class.bg-blue-50]="toast.type === 'info'"
          [class.border-blue-200]="toast.type === 'info'"
          [class.text-blue-950]="toast.type === 'info'"
          [class.bg-amber-50]="toast.type === 'warning'"
          [class.border-amber-200]="toast.type === 'warning'"
          [class.text-amber-950]="toast.type === 'warning'"
          role="status"
          aria-live="polite"
        >
          <!-- Ícone do Toast -->
          <div class="shrink-0 mt-0.5">
            @if (toast.type === 'success') {
              <div class="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            } @else if (toast.type === 'error') {
              <div class="h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            } @else if (toast.type === 'warning') {
              <div class="h-6 w-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
            } @else {
              <div class="h-6 w-6 rounded-full bg-advent-blue text-white flex items-center justify-center">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
            }
          </div>

          <!-- Conteúdo -->
          <div class="flex-1 min-w-0">
            @if (toast.title) {
              <p class="text-xs font-bold leading-snug">{{ toast.title }}</p>
            }
            <p class="text-xs leading-relaxed opacity-90">{{ toast.message }}</p>
          </div>

          <!-- Botão Fechar -->
          <button
            type="button"
            class="shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
            (click)="dismiss(toast.id)"
            aria-label="Fechar notificação"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  protected readonly toasts = this.toastService.toasts;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
