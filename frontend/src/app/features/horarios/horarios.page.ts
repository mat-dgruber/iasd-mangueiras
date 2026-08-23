import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { SITE_CONFIG } from '../../core/site/site.config';


@Component({
  selector: 'app-horarios-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Header / Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" href="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page"
            >Horários e Localização</span
          >
        </nav>

        <header class="max-w-3xl">
          <span
            class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
          >
            Planeje sua visita
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Horários e Localização
          </h1>
          <p class="mt-4 text-lg text-advent-muted">
            Será uma alegria receber você e sua família. Confira os dias e horários de nossas
            reuniões regulares na IASD Mangueiras em Tatuí-SP.
          </p>
        </header>

        <!-- Programações Regulares -->
        <section class="mt-12" aria-labelledby="programacoes-title">
          <h2 id="programacoes-title" class="text-2xl font-bold text-advent-text">
            Programação Semanal
          </h2>
          <div class="mt-6 grid gap-6 md:grid-cols-2">
            @for (item of horarios(); track item.titulo) {
              <article
                class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <div class="flex items-center justify-between">
                    <span
                      class="rounded bg-advent-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
                    >
                      {{ item.dia }}
                    </span>
                    <span class="text-xl font-bold text-advent-blue">{{ item.horario }}</span>
                  </div>
                  <h3 class="mt-4 text-2xl font-bold text-advent-text">{{ item.titulo }}</h3>
                  <p class="mt-2 text-advent-muted">{{ item.descricao }}</p>
                </div>
              </article>
            }
          </div>
        </section>

        <!-- Localização e Como Chegar -->
        <section
          class="mt-14 rounded-section border border-advent-border bg-advent-neutral p-6 md:p-10"
          aria-labelledby="localizacao-title"
        >
          <div class="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
                >Onde Estamos</span
              >
              <h2 id="localizacao-title" class="mt-2 text-3xl font-bold text-advent-text">
                Como Chegar
              </h2>
              <p class="mt-3 text-advent-muted">
                A IASD Mangueiras está localizada em Tatuí-SP, com fácil acesso e ambiente acolhedor
                preparado para você.
              </p>

              <div class="mt-6 space-y-3 text-advent-text">
                <p class="flex items-start gap-3">
                  <span class="font-bold text-advent-blue" aria-hidden="true">📍</span>
                  <span
                    ><strong>Endereço:</strong> {{ site.address.street }}, {{ site.city }} -
                    {{ site.state }}</span
                  >
                </p>
                <p class="flex items-start gap-3">
                  <span class="font-bold text-advent-blue" aria-hidden="true">⛪</span>
                  <span><strong>Comunidade:</strong> {{ site.legalName }}</span>
                </p>
              </div>

              <div class="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  class="rounded-card bg-advent-blue px-6 py-3.5 text-center font-semibold text-white shadow-sm transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner"
                  href="https://www.google.com/maps/search/?api=1&query=IASD+Mangueiras+Tatui+SP"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir no Google Maps ↗
                </a>
                <a
                  class="rounded-card border border-advent-border bg-white px-6 py-3.5 text-center font-semibold text-advent-text shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] active:shadow-inner"
                  href="/sou-novo"
                >
                  Primeira vez? Veja o que esperar
                </a>
              </div>
            </div>

            <!-- Card Informativo de Acolhimento em Accordion -->
            <div class="rounded-card border border-advent-border bg-white p-6 shadow-sm">
              <h3 class="text-xl font-bold text-advent-text">Dúvidas Frequentes do Visitante</h3>
              <div class="mt-4 space-y-3">
                @for (faq of faqs; track faq.question) {
                  <div class="overflow-hidden rounded-lg border border-advent-border/80 bg-advent-neutral/50 transition-all">
                    <button
                      type="button"
                      class="flex w-full items-center justify-between p-3.5 text-left text-sm font-bold text-advent-text hover:text-advent-blue transition-colors cursor-pointer"
                      (click)="toggleFaq(faq.question)"
                      [attr.aria-expanded]="isExpanded(faq.question)"
                    >
                      <span class="pr-2">{{ faq.question }}</span>
                      <span
                        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs text-advent-blue transition-transform duration-200"
                        [class.rotate-180]="isExpanded(faq.question)"
                        aria-hidden="true"
                      >
                        ▼
                      </span>
                    </button>

                    @if (isExpanded(faq.question)) {
                      <div class="border-t border-advent-border/60 bg-white p-3.5 text-xs text-advent-muted leading-relaxed">
                        <p>{{ faq.answer }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class HorariosPage {
  protected readonly site = SITE_CONFIG;
  private readonly contentService = inject(ContentService);
  private readonly seo = inject(SeoService);

  protected readonly horarios = () => this.contentService.horarios();

  protected readonly faqs = [
    {
      question: 'Como devo me vestir?',
      answer: 'Venha com roupas confortáveis e adequadas para um ambiente de culto e reflexão.',
    },
    {
      question: 'Tem espaço para crianças?',
      answer: 'Sim! Temos classes da Escola Sabatina divididas por faixa etária durante as manhãs de sábado.',
    },
    {
      question: 'Preciso pagar alguma coisa?',
      answer: 'Não. A participação em todas as nossas programações é totalmente gratuita e aberta a todos.',
    },
  ];

  protected readonly openFaqs = signal<Set<string>>(new Set([this.faqs[0].question]));

  constructor() {
    this.seo.apply({
      title: 'Horários dos Cultos e Localização — IASD Mangueiras',
      description:
        'Conheça os horários dos cultos de sábado e quarta-feira da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP e saiba como chegar.',
      path: '/horarios',
      faqs: this.faqs,
    });
  }

  isExpanded(question: string): boolean {
    return this.openFaqs().has(question);
  }

  toggleFaq(question: string): void {
    this.openFaqs.update((set) => {
      const next = new Set(set);
      if (next.has(question)) {
        next.delete(question);
      } else {
        next.add(question);
      }
      return next;
    });
  }
}

