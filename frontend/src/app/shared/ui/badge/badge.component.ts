import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeColor = 'blue' | 'gold' | 'green' | 'red' | 'amber' | 'neutral' | 'indigo' | 'purple';

@Component({
  selector: 'app-ui-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider select-none"
      [class.bg-advent-blue/10]="color() === 'blue'"
      [class.text-advent-blue]="color() === 'blue'"
      [class.bg-amber-100]="color() === 'gold' || color() === 'amber'"
      [class.text-amber-800]="color() === 'gold' || color() === 'amber'"
      [class.bg-green-100]="color() === 'green'"
      [class.text-green-800]="color() === 'green'"
      [class.bg-red-100]="color() === 'red'"
      [class.text-red-800]="color() === 'red'"
      [class.bg-slate-100]="color() === 'neutral'"
      [class.text-advent-muted]="color() === 'neutral'"
      [class.bg-indigo-100]="color() === 'indigo'"
      [class.text-indigo-800]="color() === 'indigo'"
      [class.bg-purple-100]="color() === 'purple'"
      [class.text-purple-800]="color() === 'purple'"
    >
      @if (dot()) {
        <span
          class="h-1.5 w-1.5 rounded-full"
          [class.bg-advent-blue]="color() === 'blue'"
          [class.bg-amber-500]="color() === 'gold' || color() === 'amber'"
          [class.bg-green-600]="color() === 'green'"
          [class.bg-red-600]="color() === 'red'"
          [class.bg-slate-400]="color() === 'neutral'"
          [class.bg-indigo-600]="color() === 'indigo'"
          [class.bg-purple-600]="color() === 'purple'"
        ></span>
      }
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly color = input<BadgeColor>('blue');
  readonly dot = input<boolean>(false);
}
