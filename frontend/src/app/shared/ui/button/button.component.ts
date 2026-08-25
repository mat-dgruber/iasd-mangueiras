import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      class="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]"
      [class.rounded-card]="rounded() === 'card'"
      [class.rounded-full]="rounded() === 'full'"
      [class.rounded-lg]="rounded() === 'lg'"
      [class.text-xs]="size() === 'sm'"
      [class.px-3]="size() === 'sm'"
      [class.py-1.5]="size() === 'sm'"
      [class.text-sm]="size() === 'md'"
      [class.px-5]="size() === 'md'"
      [class.py-2.5]="size() === 'md'"
      [class.text-base]="size() === 'lg'"
      [class.px-7]="size() === 'lg'"
      [class.py-3.5]="size() === 'lg'"
      [class.bg-advent-blue]="variant() === 'primary'"
      [class.text-white]="variant() === 'primary' || variant() === 'whatsapp' || variant() === 'danger'"
      [class.hover:bg-advent-blue-dark]="variant() === 'primary'"
      [class.shadow-sm]="variant() === 'primary' || variant() === 'whatsapp'"
      [class.bg-advent-gold]="variant() === 'secondary'"
      [class.text-advent-text]="variant() === 'secondary'"
      [class.hover:bg-amber-500]="variant() === 'secondary'"
      [class.bg-white]="variant() === 'outline'"
      [class.border]="variant() === 'outline'"
      [class.border-advent-border]="variant() === 'outline'"
      [class.text-advent-text]="variant() === 'outline'"
      [class.hover:bg-gray-50]="variant() === 'outline'"
      [class.bg-red-600]="variant() === 'danger'"
      [class.hover:bg-red-700]="variant() === 'danger'"
      [class.bg-green-700]="variant() === 'whatsapp'"
      [class.hover:bg-green-800]="variant() === 'whatsapp'"
      [class.bg-transparent]="variant() === 'ghost'"
      [class.text-advent-muted]="variant() === 'ghost'"
      [class.hover:text-advent-text]="variant() === 'ghost'"
      [class.hover:bg-black/5]="variant() === 'ghost'"
      [class.w-full]="fullWidth()"
    >
      @if (loading()) {
        <svg class="h-4 w-4 animate-spin shrink-0 text-current" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly rounded = input<'card' | 'full' | 'lg'>('card');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);
}
