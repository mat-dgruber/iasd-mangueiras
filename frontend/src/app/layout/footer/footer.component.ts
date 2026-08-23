import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="mt-16 bg-advent-blue text-white">
      <div class="mx-auto grid max-w-site gap-8 px-4 py-10 md:grid-cols-3">
        <section>
          <h2 class="font-brand text-xl">{{ site.name }}</h2>
          <p class="mt-3 text-white/85">{{ site.description }}</p>
        </section>
        <section>
          <h2 class="text-lg font-semibold">Encontre-nos</h2>
          <p class="mt-3 text-white/85">{{ site.city }}-{{ site.state }}</p>
          <a class="mt-2 inline-block underline" href="/horarios">Ver horários e localização</a>
        </section>
        <section>
          <h2 class="text-lg font-semibold">Canais oficiais</h2>
          <ul class="mt-3 space-y-2 text-white/85">
            <li><a class="underline" [href]="site.social.instagram">Instagram</a></li>
            <li><a class="underline" [href]="site.social.facebook">Facebook</a></li>
            <li><a class="underline" [href]="site.social.youtube">YouTube</a></li>
          </ul>
        </section>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly site = SITE_CONFIG;
}
