import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" href="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page">Sou Novo Aqui</span>
        </nav>

        <header class="max-w-3xl">
          <span class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
            Bem-vindo à IASD Mangueiras
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Primeira vez conosco?
          </h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Seja você morador de Tatuí ou visitante na cidade, nossa congregação está de braços abertos para receber você e sua família. Preparamos este guia para você se sentir em casa desde o primeiro instante.
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
            <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div>
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-advent-blue text-lg font-bold text-white shadow-sm">
                  1
                </span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Recepção Calorosa</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Logo na entrada, nossa equipe de acolhimento estará pronta para receber você, tirar dúvidas e indicar os melhores lugares.
                </p>
              </div>
            </article>

            <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div>
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-advent-blue text-lg font-bold text-white shadow-sm">
                  2
                </span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Escola Sabatina</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Aos sábados às 09:00, nos reunimos em pequenas classes participativas para estudar a Bíblia e compartilhar experiências.
                </p>
              </div>
            </article>

            <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div>
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-advent-blue text-lg font-bold text-white shadow-sm">
                  3
                </span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Culto de Adoração</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Às 10:15, desfrutamos de música inspiradora, oração comunitária e uma mensagem bíblica clara e prática para a semana.
                </p>
              </div>
            </article>

            <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div>
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-advent-blue text-lg font-bold text-white shadow-sm">
                  4
                </span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Espaço para Crianças</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Temos salas dedicadas e professoras preparadas para cada idade, ensinando lições da Bíblia com segurança e alegria.
                </p>

              </div>
            </article>
          </div>
        </section>

        <!-- Perguntas Frequentes em Accordion Interativo -->
        <section class="mt-16 rounded-section border border-advent-border bg-advent-neutral p-6 md:p-10" aria-labelledby="faq-title">
          <div class="max-w-2xl">
            <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Dúvidas Frequentes</span>
            <h2 id="faq-title" class="mt-1 text-2xl font-bold text-advent-text">
              Perguntas Frequentes de Visitantes
            </h2>
            <p class="mt-1 text-sm text-advent-muted">
              Clique em uma pergunta para visualizar a resposta completa.
            </p>
          </div>

          <div class="mt-8 space-y-4">
            @for (faq of faqs; track faq.id) {
              <div class="overflow-hidden rounded-card border border-advent-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
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
                    ▼
                  </span>
                </button>

                <div
                  [id]="'faq-answer-' + faq.id"
                  class="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  [class.grid-rows-[1fr]]="isExpanded(faq.id)"
                  [class.grid-rows-[0fr]]="!isExpanded(faq.id)"
                >
                  <div class="overflow-hidden">
                    <div class="border-t border-advent-border px-5 pb-5 pt-3 text-sm text-advent-muted leading-relaxed">
                      <p>{{ faq.resposta }}</p>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- CTAs de Ação e Compartilhamento -->
          <div class="mt-12 pt-8 border-t border-advent-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="text-xl font-bold text-advent-text">Pronto para nos visitar?</h3>
              <p class="text-sm text-advent-muted mt-1">
                Veja os horários completos ou convide um amigo para ir junto com você!
              </p>
            </div>
            <div class="flex flex-wrap gap-3 w-full md:w-auto">
              <a
                class="rounded-card bg-advent-blue px-6 py-3 text-center text-sm font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner"
                href="/horarios"
              >
                Ver Horários e Mapa
              </a>
              <button
                type="button"
                class="rounded-card border border-green-600/30 bg-green-50 px-5 py-3 text-center text-sm font-semibold text-green-800 shadow-sm transition-all hover:bg-green-100 active:scale-[0.98] cursor-pointer"
                (click)="shareInvite()"
              >
                📲 Convidar no WhatsApp
              </button>
              <a
                class="rounded-card border border-advent-border bg-white px-5 py-3 text-center text-sm font-semibold text-advent-text shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] active:shadow-inner"
                href="/contato"
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
      navigator.share({
        title: 'Convite — IASD Mangueiras',
        text,
        url: 'https://iasdmangueiras.org.br/horarios',
      }).catch(() => {
        this.openWhatsApp(text);
      });
    } else {
      this.openWhatsApp(text);
    }
  }

  private openWhatsApp(text: string): void {
    if (typeof window !== 'undefined') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  }
}

