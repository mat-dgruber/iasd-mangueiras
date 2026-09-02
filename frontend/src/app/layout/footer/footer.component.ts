import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="mt-16 bg-advent-blue text-white">
      <div class="mx-auto grid max-w-site gap-8 px-4 py-12 md:grid-cols-3">
        <section>
          <h2 class="font-brand text-2xl text-white">{{ site.name }}</h2>
          <p class="mt-3 text-sm text-white/80 leading-relaxed">{{ site.description }}</p>
          <p class="mt-4 text-xs text-white/60">
            © {{ currentYear }} {{ site.legalName }}. Todos os direitos reservados.
          </p>
        </section>
        <section class="rounded-card bg-white/5 p-5 border border-white/10">
          <h2 class="text-base font-bold uppercase tracking-wider text-white">
            Encontre-nos & Cultos
          </h2>
          <p class="mt-2 text-sm font-medium text-white">{{ site.address.street }}</p>
          <p class="text-xs text-white/70">{{ site.address.locality }}-{{ site.address.region }}</p>
          <div class="mt-3 border-t border-white/10 pt-2 text-xs text-white/80 space-y-1">
            <p>• <strong>Sábados:</strong> 09:00 e 10:15</p>
            <p>• <strong>Domingos:</strong> 19:30</p>
            <p>• <strong>Quartas:</strong> 19:30</p>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <a
              class="inline-flex items-center text-xs font-semibold text-white underline hover:text-white/80"
              routerLink="/horarios"
            >
              Ver horários e mapa →
            </a>
          </div>
        </section>
        <section>
          <h2 class="text-base font-bold uppercase tracking-wider text-white">Canais Oficiais</h2>
          <ul class="mt-3 space-y-2 text-sm text-white/80">
            <li>
              <a
                class="hover:text-white hover:underline transition-colors"
                [href]="site.social.youtube"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube (Transmissões ao vivo) ↗
              </a>
            </li>
            <li>
              <a
                class="hover:text-white hover:underline transition-colors"
                [href]="site.social.instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram (@iasdmangueiras) ↗
              </a>
            </li>
            <li>
              <a
                class="hover:text-white hover:underline transition-colors"
                [href]="site.social.facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook ↗
              </a>
            </li>
            <li>
              <a class="hover:text-white hover:underline transition-colors" routerLink="/estudos">
                Pequenos Grupos & Estudos →
              </a>
            </li>
            <li>
              <a class="hover:text-white hover:underline transition-colors" routerLink="/contato">
                Fale Conosco / Oração →
              </a>
            </li>
          </ul>
        </section>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly currentYear = new Date().getFullYear();
}
