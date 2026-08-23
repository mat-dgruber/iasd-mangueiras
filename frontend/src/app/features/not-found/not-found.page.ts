import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="mx-auto max-w-site px-4 py-10">
      <h1 class="text-4xl font-bold text-advent-text">Página não encontrada</h1>
      <p class="mt-4 text-lg text-advent-muted">A página solicitada não foi encontrada no site da IASD Mangueiras.</p>
      <a class="mt-6 inline-block underline" href="/">Voltar para início</a>
    </main>
  `,
})
export class NotFoundPage {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      title: 'Página não encontrada — IASD Mangueiras',
      description: 'A página solicitada não foi encontrada no site da IASD Mangueiras.',
      path: '/pagina-nao-encontrada',
    });
  }
}
