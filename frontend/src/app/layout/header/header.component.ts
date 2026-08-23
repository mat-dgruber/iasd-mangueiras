import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-white focus:px-4 focus:py-2 focus:text-advent-blue" href="#conteudo">Ir para o conteúdo</a>
    <header class="border-b border-advent-border bg-white">
      <div class="mx-auto flex max-w-site flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <a class="font-brand text-xl text-advent-blue" href="/" aria-label="IASD Mangueiras — início">{{ site.name }}</a>
        <nav aria-label="Navegação principal">
          <ul class="flex flex-wrap gap-4 text-base text-advent-text">
            <li><a class="hover:text-advent-blue" href="/horarios">Horários</a></li>
            <li><a class="hover:text-advent-blue" href="/ao-vivo">Ao vivo</a></li>
            <li><a class="hover:text-advent-blue" href="/eventos">Eventos</a></li>
            <li><a class="hover:text-advent-blue" href="/ministerios">Ministérios</a></li>
            <li><a class="hover:text-advent-blue" href="/sou-novo">Sou novo</a></li>
            <li><a class="rounded-card bg-advent-blue px-4 py-2 text-white hover:bg-advent-blue-dark" href="/contato">Contato</a></li>
          </ul>
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly site = SITE_CONFIG;
}
