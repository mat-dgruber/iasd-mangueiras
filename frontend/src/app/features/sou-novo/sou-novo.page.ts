import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { SITE_CONFIG } from '../../core/site/site.config';

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
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">Primeira vez conosco?</h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Seja você morador de Tatuí ou visitante na cidade, nossa congregação está de braços abertos para receber você e sua família. Preparamos este guia para você se sentir em casa desde o primeiro instante.
          </p>
        </header>

        <!-- O que esperar na primeira visita -->
        <section class="mt-14" aria-labelledby="o-que-esperar-title">
          <h2 id="o-que-esperar-title" class="text-2xl font-bold text-advent-text">O que esperar na sua visita</h2>
          <p class="mt-1 text-advent-muted">Veja como é simples e acolhedor participar dos nossos encontros.</p>

          <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm">
              <div>
                <span class="flex h-10 w-10 items-center justify-center rounded-full bg-advent-blue/10 text-lg font-bold text-advent-blue">1</span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Recepção Calorosa</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Logo na entrada, nossa equipe de voluntários estará pronta para acolher você, tirar dúvidas e indicar os melhores lugares.
                </p>
              </div>
            </article>

            <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm">
              <div>
                <span class="flex h-10 w-10 items-center justify-center rounded-full bg-advent-blue/10 text-lg font-bold text-advent-blue">2</span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Escola Sabatina</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Aos sábados às 09:00, nos reunimos em pequenas classes para estudar a Bíblia e compartilhar experiências de vida.
                </p>
              </div>
            </article>

            <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm">
              <div>
                <span class="flex h-10 w-10 items-center justify-center rounded-full bg-advent-blue/10 text-lg font-bold text-advent-blue">3</span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Culto de Adoração</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Às 10:15, desfrutamos de música inspiradora, oração comunitária e uma mensagem bíblica clara e prática para a semana.
                </p>
              </div>
            </article>

            <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm">
              <div>
                <span class="flex h-10 w-10 items-center justify-center rounded-full bg-advent-blue/10 text-lg font-bold text-advent-blue">4</span>
                <h3 class="mt-4 text-lg font-bold text-advent-text">Espaço para Crianças</h3>
                <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                  Temos salas dedicadas e professoras preparadas para cada idade, ensinando lições da Bíblia com segurança e alegria.
                </p>
              </div>
            </article>
          </div>
        </section>

        <!-- Perguntas Frequentes -->
        <section class="mt-16 rounded-section border border-advent-border bg-advent-neutral p-6 md:p-10" aria-labelledby="faq-title">
          <h2 id="faq-title" class="text-2xl font-bold text-advent-text">Perguntas Frequentes de Visitantes</h2>

          <div class="mt-6 grid gap-6 md:grid-cols-2">
            <div class="rounded-card border border-advent-border bg-white p-6 shadow-sm">
              <h3 class="text-lg font-bold text-advent-text">Preciso ser membro ou ter alguma religião para visitar?</h3>
              <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                Não! Todos são bem-vindos, independentemente de sua fé, origem ou momento de vida. Nossas portas estão abertas para todos que buscam a Deus.
              </p>
            </div>

            <div class="rounded-card border border-advent-border bg-white p-6 shadow-sm">
              <h3 class="text-lg font-bold text-advent-text">Qual tipo de roupa devo vestir?</h3>
              <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                Use roupas confortáveis e respeitosas para um ambiente de adoração. Você verá pessoas com roupas sociais simples e outras casuais. Venha como estiver!
              </p>
            </div>

            <div class="rounded-card border border-advent-border bg-white p-6 shadow-sm">
              <h3 class="text-lg font-bold text-advent-text">Preciso pagar alguma coisa ou ofertar obrigatoriamente?</h3>
              <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                Absolutamente não. A participação nos cultos é totalmente gratuita. Dízimos e ofertas são atos voluntários e privativos de quem já frequenta e deseja contribuir.
              </p>
            </div>

            <div class="rounded-card border border-advent-border bg-white p-6 shadow-sm">
              <h3 class="text-lg font-bold text-advent-text">Preciso levar Bíblia?</h3>
              <p class="mt-2 text-sm text-advent-muted leading-relaxed">
                Se tiver uma Bíblia física ou no celular, pode trazer para acompanhar. Caso não tenha, os versos principais são projetados ou lidos em conjunto.
              </p>
            </div>
          </div>

          <!-- CTAs de Ação -->
          <div class="mt-10 pt-8 border-t border-advent-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-advent-text">Pronto para nos visitar?</h3>
              <p class="text-sm text-advent-muted">Veja os horários completos e como chegar ao nosso endereço em Tatuí.</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a class="rounded-card bg-advent-blue px-6 py-3 text-center text-sm font-semibold text-white hover:bg-advent-blue-dark transition-colors" href="/horarios">
                Ver Horários e Mapa
              </a>
              <a class="rounded-card border border-advent-border bg-white px-6 py-3 text-center text-sm font-semibold text-advent-text hover:bg-gray-50 transition-colors" href="/contato">
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

  constructor() {
    this.seo.apply({
      title: 'Sou Novo Aqui — IASD Mangueiras',
      description: 'Primeira vez na IASD Mangueiras? Descubra o que esperar, como são os cultos, espaço para crianças e tire suas principais dúvidas.',
      path: '/sou-novo',
    });
  }
}

