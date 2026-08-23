import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-ministerios-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" href="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page">Ministérios</span>
        </nav>

        <header class="max-w-3xl">
          <span class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
            Serviço e Comunhão
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">Ministérios da Igreja</h1>
          <p class="mt-4 text-lg text-advent-muted">
            Na IASD Mangueiras, acreditamos que cada membro tem dons dados por Deus para abençoar a comunidade, acolher pessoas e fortalecer a fé das famílias.
          </p>
        </header>

        <!-- Lista de Ministérios -->
        <section class="mt-12" aria-labelledby="ministerios-title">
          <h2 id="ministerios-title" class="sr-only">Todos os Ministérios</h2>
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (item of ministerios(); track item.nome) {
              <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div>
                  <h3 class="text-xl font-bold text-advent-text">{{ item.nome }}</h3>
                  <p class="mt-3 text-sm text-advent-muted leading-relaxed">{{ item.descricao }}</p>
                </div>
              </article>
            }
          </div>
        </section>

        <!-- Chamada para Envolvimento -->
        <section class="mt-16 rounded-section border border-advent-border bg-advent-neutral p-6 md:p-10 text-center md:text-left">
          <div class="md:flex md:items-center md:justify-between gap-8">
            <div class="max-w-2xl">
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Faça Parte</span>
              <h2 class="mt-2 text-2xl font-bold text-advent-text">Deseja servir ou conhecer mais sobre um ministério?</h2>
              <p class="mt-2 text-advent-muted leading-relaxed">
                Seja na recepção, na música, no trabalho com crianças ou na assistência social da ASA, há sempre um lugar para você servir e crescer.
              </p>
            </div>
            <div class="mt-6 md:mt-0 flex-shrink-0">
              <a
                class="rounded-card bg-advent-blue px-6 py-3.5 text-center font-semibold text-white shadow-sm transition-colors hover:bg-advent-blue-dark inline-block"
                href="/contato"
              >
                Fale com a liderança
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class MinisteriosPage {
  private readonly contentService = inject(ContentService);
  private readonly seo = inject(SeoService);

  protected readonly ministerios = () => this.contentService.ministerios();

  constructor() {
    this.seo.apply({
      title: 'Ministérios — IASD Mangueiras',
      description: 'Conheça os ministérios e áreas de serviço da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP e descubra como participar.',
      path: '/ministerios',
    });
  }
}

