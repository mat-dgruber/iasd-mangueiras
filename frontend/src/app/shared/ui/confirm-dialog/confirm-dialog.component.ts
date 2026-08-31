import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-ui-confirm-dialog',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-ui-modal
      [isOpen]="isOpen()"
      [title]="title()"
      [size]="'sm'"
      [showFooter]="true"
      [closeOnBackdrop]="!isLoading()"
      (close)="onCancel()"
    >
      <div class="flex items-start gap-4 py-1">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          [class.bg-red-100]="variant() === 'danger'"
          [class.text-red-600]="variant() === 'danger'"
          [class.bg-amber-100]="variant() === 'warning'"
          [class.text-amber-600]="variant() === 'warning'"
          [class.bg-blue-100]="variant() === 'primary'"
          [class.text-advent-blue]="variant() === 'primary'"
        >
          @if (variant() === 'danger') {
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          } @else if (variant() === 'warning') {
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          } @else {
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          }
        </div>

        <p class="text-sm leading-relaxed text-slate-600 select-none">
          {{ message() }}
        </p>
      </div>

      <div footer class="flex w-full items-center justify-end gap-2.5">
        <app-ui-button
          [variant]="'outline'"
          [size]="'sm'"
          [disabled]="isLoading()"
          (click)="onCancel()"
        >
          {{ cancelText() }}
        </app-ui-button>

        <app-ui-button
          [variant]="variant() === 'danger' ? 'danger' : 'primary'"
          [size]="'sm'"
          [loading]="isLoading()"
          (click)="onConfirm()"
        >
          {{ confirmText() }}
        </app-ui-button>
      </div>
    </app-ui-modal>
  `,
})
export class ConfirmDialogComponent {
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('Confirmar Ação');
  readonly message = input.required<string>();
  readonly confirmText = input<string>('Confirmar');
  readonly cancelText = input<string>('Cancelar');
  readonly variant = input<'danger' | 'warning' | 'primary'>('danger');
  readonly isLoading = input<boolean>(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    if (!this.isLoading()) {
      this.confirmed.emit();
    }
  }

  onCancel(): void {
    if (!this.isLoading()) {
      this.cancelled.emit();
    }
  }
}
