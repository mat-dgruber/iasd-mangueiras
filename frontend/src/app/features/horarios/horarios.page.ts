import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-horarios-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Header / Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" routerLink="/">Início</a>
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
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Será uma alegria receber você e sua família. Confira os dias e horários de nossas
            reuniões regulares na IASD Mangueiras em Tatuí-SP.
          </p>
        </header>

        <!-- Avisos de Horários Especiais (caso haja ativo no Firestore) -->
        @if (avisosHorarios().length > 0) {
          <section class="mt-8 space-y-3" aria-label="Avisos de alterações temporárias de horários">
            @for (aviso of avisosHorarios(); track (aviso.id || aviso.titulo)) {
              <div
                class="flex flex-col gap-2 rounded-2xl border border-amber-300/80 bg-amber-500/10 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex items-center rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                    >
                      {{ aviso.data_evento || 'Alteração Temporária' }}
                    </span>
                    <h2 class="text-sm font-bold text-amber-950">{{ aviso.titulo }}</h2>
                  </div>
                  <p class="text-xs text-amber-900 leading-relaxed">{{ aviso.mensagem }}</p>
                </div>
              </div>
            }
          </section>
        }

        <!-- Programações Regulares -->
        <section class="mt-12" aria-labelledby="programacoes-title">
          <div class="flex items-center justify-between">
            <h2 id="programacoes-title" class="text-2xl font-bold text-advent-text">
              Programação Semanal
            </h2>
            <span class="text-xs font-semibold text-advent-muted">Cultos Regulares</span>
          </div>

          <div class="mt-6 grid gap-6 md:grid-cols-2">
            @for (item of horarios(); track item.titulo) {
              <article
                class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <div class="flex items-center justify-between">
                    <span
                      class="inline-flex items-center gap-1.5 rounded bg-advent-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
                    >
                      <svg
                        class="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {{ item.dia }}
                    </span>
                    <span class="text-2xl font-bold text-advent-blue">{{ item.horario }}</span>
                  </div>
                  <h3 class="mt-4 text-2xl font-bold text-advent-text">{{ item.titulo }}</h3>
                  <p class="mt-2 text-advent-muted leading-relaxed">{{ item.descricao }}</p>
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
              <p class="mt-3 text-advent-muted leading-relaxed">
                A IASD Mangueiras está localizada em Tatuí-SP, com fácil acesso e ambiente acolhedor
                preparado para você e seus convidados.
              </p>

              <div class="mt-6 space-y-3 text-advent-text">
                <p class="flex items-start gap-3">
                  <svg
                    class="h-5 w-5 text-advent-blue shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  <span
                    ><strong>Endereço:</strong> {{ site.address.street }}, {{ site.city }} -
                    {{ site.state }}</span
                  >
                </p>
                <p class="flex items-start gap-3">
                  <svg
                    class="h-5 w-5 text-advent-blue shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333A48.42 48.42 0 0012 9.75c-2.551 0-5.056.2-7.5.583V21"
                    />
                  </svg>
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
                  routerLink="/sou-novo"
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
                  <div
                    class="overflow-hidden rounded-lg border border-advent-border/80 bg-advent-neutral/40 transition-colors"
                  >
                    <button
                      type="button"
                      class="flex w-full items-center justify-between p-3.5 text-left text-sm font-bold text-advent-text hover:text-advent-blue transition-colors cursor-pointer"
                      (click)="toggleFaq(faq.question)"
                      [attr.aria-expanded]="isExpanded(faq.question)"
                    >
                      <span class="pr-2">{{ faq.question }}</span>
                      <svg
                        class="h-4 w-4 shrink-0 text-advent-blue transition-transform duration-300 ease-out"
                        [class.rotate-180]="isExpanded(faq.question)"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                        aria-hidden="true"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    <div
                      class="grid transition-[grid-template-rows] duration-300 ease-in-out"
                      [class.grid-rows-[1fr]]="isExpanded(faq.question)"
                      [class.grid-rows-[0fr]]="!isExpanded(faq.question)"
                    >
                      <div class="overflow-hidden">
                        <div
                          class="border-t border-advent-border/60 bg-white p-3.5 text-xs text-advent-muted leading-relaxed transition-opacity duration-300"
                          [class.opacity-100]="isExpanded(faq.question)"
                          [class.opacity-0]="!isExpanded(faq.question)"
                        >
                          <p>{{ faq.answer }}</p>
                        </div>
                      </div>
                    </div>
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
  protected readonly avisosHorarios = () => this.contentService.avisosHorarios();

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
