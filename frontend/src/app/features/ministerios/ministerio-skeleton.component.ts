import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-ministerio-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      @for (i of [1,2,3,4,5,6]; track i) {
        <div class="rounded-2xl border border-advent-border bg-white overflow-hidden animate-pulse">
          <div class="aspect-video w-full bg-advent-neutral"></div>
          <div class="p-6 space-y-3">
            <div class="h-4 w-20 bg-advent-neutral rounded"></div>
            <div class="h-6 w-3/4 bg-advent-neutral rounded"></div>
            <div class="h-4 w-full bg-advent-neutral rounded"></div>
            <div class="h-4 w-5/6 bg-advent-neutral rounded"></div>
            <div class="border-t border-advent-border/60 pt-3 space-y-2">
              <div class="h-3 w-2/3 bg-advent-neutral rounded"></div>
              <div class="h-3 w-1/2 bg-advent-neutral rounded"></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class MinisterioSkeletonComponent {}
