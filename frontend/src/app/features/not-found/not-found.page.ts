import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="mx-auto max-w-site px-4 py-16 text-center">
      <div
        class="mx-auto max-w-md rounded-section border border-advent-border bg-white p-8 shadow-sm"
      >
        <span
          class="inline-block rounded bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700"
        >
          Erro 404
        </span>
        <h1 class="mt-4 text-3xl font-bold text-advent-text md:text-4xl">Página não encontrada</h1>
        <p class="mt-3 text-sm text-advent-muted leading-relaxed">
          O link que você tentou acessar pode ter sido alterado ou não existe mais. Use os links
          abaixo para navegar:
        </p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            class="rounded-card bg-advent-blue px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner"
            href="/"
          >
            Voltar para o Início
          </a>
          <a
            class="rounded-card border border-advent-border bg-white px-6 py-3 text-sm font-semibold text-advent-text shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] active:shadow-inner"
            href="/horarios"
          >
            Ver Horários
          </a>
        </div>
      </div>
    </main>
  `,
})
export class NotFoundPage {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      title: 'Página não encontrada (404) — IASD Mangueiras',
      description: 'A página solicitada não foi encontrada no site da IASD Mangueiras.',
      path: '/404',
      noIndex: true,
    });
  }
}
