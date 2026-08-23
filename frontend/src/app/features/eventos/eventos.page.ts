import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-eventos-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" href="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page"
            >Eventos e Comunicados</span
          >
        </nav>

        <header class="max-w-3xl">
          <span
            class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
          >
            Agenda e Avisos
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Eventos e Comunicados
          </h1>
          <p class="mt-4 text-lg text-advent-muted">
            Acompanhe a agenda de congressos, semanas especiais, atividades comunitárias e os
            comunicados da semana na IASD Mangueiras.
          </p>
        </header>

        <!-- Próximos Eventos -->
        <section class="mt-12" aria-labelledby="eventos-title">
          <h2 id="eventos-title" class="text-2xl font-bold text-advent-text">Próximos Eventos</h2>
          <p class="mt-1 text-advent-muted">
            Programe-se e convide amigos e familiares para participar.
          </p>

          @if (eventos().length === 0) {
            <div
              class="mt-6 rounded-card border border-advent-border bg-white p-8 text-center text-advent-muted shadow-sm"
            >
              <p class="font-medium text-advent-text">
                Nenhum evento especial agendado no momento.
              </p>
              <p class="text-sm mt-1">
                Acompanhe nossos cultos regulares aos sábados e quartas-feiras ou fale conosco.
              </p>
            </div>
          } @else {
            <div class="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              @for (evento of eventos(); track evento.titulo) {
                <article
                  class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div>
                    <span
                      class="inline-block rounded bg-advent-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
                    >
                      {{ evento.data }} • {{ evento.horario }}
                    </span>
                    <h3 class="mt-4 text-xl font-bold text-advent-text">{{ evento.titulo }}</h3>
                    <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                      {{ evento.descricao }}
                    </p>
                  </div>
                  <div
                    class="mt-6 pt-4 border-t border-advent-border flex items-center justify-between"
                  >
                    <a
                      class="text-sm font-semibold text-advent-blue hover:underline"
                      [href]="evento.href || '/contato'"
                    >
                      Saiba mais →
                    </a>
                  </div>
                </article>
              }
            </div>
          }
        </section>

        <!-- Comunicados e Avisos -->
        <section
          class="mt-16 rounded-section border border-advent-border bg-advent-neutral p-6 md:p-10"
          aria-labelledby="comunicados-title"
        >
          <h2 id="comunicados-title" class="text-2xl font-bold text-advent-text">
            Comunicados e Avisos Gerais
          </h2>
          <p class="mt-1 text-advent-muted">
            Informações e orientações para a congregação e comunidade.
          </p>

          @if (comunicados().length === 0) {
            <div
              class="mt-6 rounded-card border border-advent-border bg-white p-8 text-center text-advent-muted shadow-sm"
            >
              <p class="font-medium text-advent-text">Nenhum comunicado recente publicado.</p>
            </div>
          } @else {
            <div class="mt-6 grid gap-4 md:grid-cols-3">
              @for (comunicado of comunicados(); track comunicado.titulo) {
                <div class="rounded-card border border-advent-border bg-white p-6 shadow-sm">
                  <span
                    class="inline-block rounded bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue"
                  >
                    {{ comunicado.data }}
                  </span>
                  <h3 class="mt-3 text-lg font-bold text-advent-text">{{ comunicado.titulo }}</h3>
                  <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                    {{ comunicado.descricao }}
                  </p>
                </div>
              }
            </div>
          }

          <div
            class="mt-8 rounded-card border border-advent-blue/30 bg-advent-blue/5 p-6 text-center md:text-left md:flex md:items-center md:justify-between"
          >
            <div>
              <h3 class="font-bold text-advent-blue text-lg">
                Deseja divulgar uma atividade ou tem dúvidas?
              </h3>
              <p class="text-sm text-advent-muted mt-1">
                Entre em contato com nossa equipe de comunicação ou liderança.
              </p>
            </div>
            <a
              class="mt-4 md:mt-0 inline-block rounded-card bg-advent-blue px-6 py-3 text-center text-sm font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner"
              href="/contato"
            >
              Falar com a equipe
            </a>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class EventosPage {
  private readonly contentService = inject(ContentService);
  private readonly seo = inject(SeoService);

  protected readonly eventos = () => this.contentService.eventos();
  protected readonly comunicados = () => this.contentService.comunicados();

  constructor() {
    this.seo.apply({
      title: 'Eventos e Comunicados — IASD Mangueiras',
      description:
        'Confira a agenda de eventos especiais, semanas de oração e comunicados da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP.',
      path: '/eventos',
    });
  }
}
