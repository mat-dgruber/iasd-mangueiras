import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { SITE_CONFIG } from '../../core/site/site.config';

interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
}

@Component({
  selector: 'app-sou-novo-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" routerLink="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page">Sou Novo Aqui</span>
        </nav>

        <header class="max-w-3xl">
          <span
            class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
          >
            Bem-vindo à IASD Mangueiras
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Primeira vez conosco?
          </h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Seja você morador de Tatuí ou visitante na cidade, nossa congregação está de braços
            abertos para receber você e sua família. Preparamos este guia para você se sentir em
            casa desde o primeiro instante.
          </p>
        </header>

        <!-- O que esperar na primeira visita -->
        <section class="mt-14" aria-labelledby="o-que-esperar-title">
          <h2 id="o-que-esperar-title" class="text-2xl font-bold text-advent-text">
            O que esperar na sua visita
          </h2>
          <p class="mt-1 text-advent-muted">
            Veja como é simples e acolhedor participar dos nossos encontros.
          </p>

          <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article
              class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-advent-blue text-lg font-bold text-white shadow-sm"
                >
                  1
                </span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Recepção Calorosa</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Logo na entrada, nossa equipe de acolhimento estará pronta para receber você, tirar
                  dúvidas e indicar os melhores lugares.
                </p>
              </div>
            </article>

            <article
              class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-advent-blue text-lg font-bold text-white shadow-sm"
                >
                  2
                </span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Escola Sabatina</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Aos sábados às 09:00, nos reunimos em pequenas classes participativas para estudar
                  a Bíblia e compartilhar experiências.
                </p>
              </div>
            </article>

            <article
              class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-advent-blue text-lg font-bold text-white shadow-sm"
                >
                  3
                </span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Culto de Adoração</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Às 10:15, desfrutamos de música inspiradora, oração comunitária e uma mensagem
                  bíblica clara e prática para a semana.
                </p>
              </div>
            </article>

            <article
              class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-advent-blue text-lg font-bold text-white shadow-sm"
                >
                  4
                </span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Espaço para Crianças</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Temos salas dedicadas e professoras preparadas para cada idade, ensinando lições da
                  Bíblia com segurança e alegria.
                </p>
              </div>
            </article>
          </div>
        </section>

        <!-- Perguntas Frequentes em Accordion Interativo -->
        <section
          class="mt-16 rounded-section border border-advent-border bg-advent-neutral p-6 md:p-10"
          aria-labelledby="faq-title"
        >
          <div class="max-w-2xl">
            <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
              >Dúvidas Frequentes</span
            >
            <h2 id="faq-title" class="mt-1 text-2xl font-bold text-advent-text">
              Perguntas Frequentes de Visitantes
            </h2>
            <p class="mt-1 text-sm text-advent-muted">
              Clique em uma pergunta para visualizar a resposta completa.
            </p>
          </div>

          <div class="mt-8 space-y-4">
            @for (faq of faqs; track faq.id) {
              <div
                class="overflow-hidden rounded-card border border-advent-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <button
                  type="button"
                  class="flex w-full items-center justify-between p-5 text-left font-bold text-advent-text hover:text-advent-blue transition-colors cursor-pointer"
                  (click)="toggleFaq(faq.id)"
                  [attr.aria-expanded]="isExpanded(faq.id)"
                  [attr.aria-controls]="'faq-answer-' + faq.id"
                >
                  <span class="text-base md:text-lg pr-4 leading-snug">{{ faq.pergunta }}</span>
                  <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-advent-neutral text-advent-blue transition-transform duration-300 ease-out"
                    [class.rotate-180]="isExpanded(faq.id)"
                    aria-hidden="true"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </span>
                </button>

                <div
                  [id]="'faq-answer-' + faq.id"
                  class="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  [class.grid-rows-[1fr]]="isExpanded(faq.id)"
                  [class.grid-rows-[0fr]]="!isExpanded(faq.id)"
                >
                  <div class="overflow-hidden">
                    <div
                      class="border-t border-advent-border px-5 pb-5 pt-3 text-sm text-advent-muted leading-relaxed transition-opacity duration-300"
                      [class.opacity-100]="isExpanded(faq.id)"
                      [class.opacity-0]="!isExpanded(faq.id)"
                    >
                      <p>{{ faq.resposta }}</p>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Card Especial de Convite / Visita -->
        <section
          class="mt-14 overflow-hidden rounded-3xl border border-advent-blue/20 bg-linear-to-br from-white via-blue-50/30 to-advent-neutral p-8 md:p-10 shadow-sm"
          aria-labelledby="visita-cta-title"
        >
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div class="max-w-xl">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-advent-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
                📍 Estamos esperando por você
              </span>
              <h3 id="visita-cta-title" class="mt-3 text-2xl md:text-3xl font-bold text-advent-text">
                Pronto para nos fazer uma visita?
              </h3>
              <p class="mt-2 text-sm md:text-base text-advent-muted leading-relaxed">
                Venha conhecer nossa comunidade em Tatuí. Você pode conferir os horários e localização no mapa ou convidar um amigo agora mesmo pelo WhatsApp!
              </p>
            </div>

            <div class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 shrink-0">
              <a
                class="rounded-xl bg-advent-blue px-6 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-advent-blue-dark active:scale-[0.98] flex items-center justify-center gap-2"
                routerLink="/horarios"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Ver Horários e Mapa
              </a>

              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-green-600/30 bg-green-50 px-5 py-3.5 text-center text-sm font-semibold text-green-800 shadow-xs transition-all hover:bg-green-100 active:scale-[0.98] cursor-pointer"
                (click)="shareInvite()"
              >
                <svg
                  class="h-4 w-4 shrink-0 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
                  />
                </svg>
                Convidar no WhatsApp
              </button>

              <a
                class="rounded-xl border border-advent-border bg-white px-5 py-3.5 text-center text-sm font-semibold text-advent-text shadow-xs transition-all hover:bg-gray-50 active:scale-[0.98]"
                routerLink="/contato"
              >
                Fale Conosco
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class SouNovoPage {
  protected readonly site = SITE_CONFIG;
  private readonly seo = inject(SeoService);

  protected readonly faqs: readonly FaqItem[] = [
    {
      id: 'membro',
      pergunta: 'Preciso ser membro ou ter alguma religião para visitar?',
      resposta:
        'Não! Todos são bem-vindos, independentemente de sua fé, denominação ou momento de vida. Nossas portas estão abertas para qualquer pessoa que busque a Deus e deseje comunhão.',
    },
    {
      id: 'roupa',
      pergunta: 'Qual tipo de roupa devo vestir no culto?',
      resposta:
        'Use roupas confortáveis e respeitosas para um ambiente de adoração e reflexão. Você verá pessoas com roupas sociais simples e outras casuais. O mais importante é a sua presença!',
    },
    {
      id: 'pagar',
      pergunta: 'Preciso pagar alguma coisa ou ofertar obrigatoriamente?',
      resposta:
        'Absolutamente não. A participação em todas as nossas programações é totalmente gratuita e aberta. Dízimos e ofertas são atos voluntários de quem já frequenta e deseja contribuir com a missão.',
    },
    {
      id: 'biblia',
      pergunta: 'Preciso levar Bíblia física?',
      resposta:
        'Se tiver uma Bíblia física ou no celular, pode trazer para acompanhar. Caso não tenha, os versos principais são projetados na tela ou lidos em conjunto pelo pregador.',
    },
  ];

  // Controla quais FAQs estão abertos (por padrão o primeiro fica aberto)
  protected readonly openFaqs = signal<Set<string>>(new Set(['membro']));

  constructor() {
    this.seo.apply({
      title: 'Sou Novo Aqui — IASD Mangueiras',
      description:
        'Primeira vez na IASD Mangueiras? Descubra o que esperar, como são os cultos, espaço para crianças e tire suas principais dúvidas.',
      path: '/sou-novo',
      breadcrumbs: [
        { name: 'Início', url: 'https://iasdmangueiras.org.br/' },
        { name: 'Sou Novo Aqui', url: 'https://iasdmangueiras.org.br/sou-novo' },
      ],
      faqs: this.faqs.map((f) => ({ question: f.pergunta, answer: f.resposta })),
    });
  }

  isExpanded(id: string): boolean {
    return this.openFaqs().has(id);
  }

  toggleFaq(id: string): void {
    this.openFaqs.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  shareInvite(): void {
    const text = `Olá! Gostaria de te convidar para nos visitar na Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP. Confira os horários e endereço: https://iasdmangueiras.org.br/horarios`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: 'Convite — IASD Mangueiras',
          text,
          url: 'https://iasdmangueiras.org.br/horarios',
        })
        .catch(() => {
          this.openWhatsApp(text);
        });
    } else {
      this.openWhatsApp(text);
    }
  }

  private openWhatsApp(text: string): void {
    if (typeof window !== 'undefined') {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
        '_blank',
        'noopener,noreferrer',
      );
    }
  }
}
