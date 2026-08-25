import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="animate-pulse bg-slate-200"
      [class.rounded]="rounded() === 'sm'"
      [class.rounded-card]="rounded() === 'md'"
      [class.rounded-2xl]="rounded() === 'lg'"
      [class.rounded-full]="rounded() === 'full'"
      [style.width]="width()"
      [style.height]="height()"
      aria-hidden="true"
    ></div>
  `,
})
export class SkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
  readonly rounded = input<'sm' | 'md' | 'lg' | 'full'>('md');
}
