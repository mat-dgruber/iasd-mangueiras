import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
          <span class="font-medium text-advent-text" aria-current="page">Horários e Localização</span>
        </nav>

        <header class="max-w-3xl">
          <span class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
            Planeje sua visita
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">Horários e Localização</h1>
          <p class="mt-4 text-lg text-advent-muted">
            Será uma alegria receber você e sua família. Confira os dias e horários de nossas reuniões regulares na IASD Mangueiras em Tatuí-SP.
          </p>
        </header>

        <!-- Programações Regulares -->
        <section class="mt-12" aria-labelledby="programacoes-title">
          <h2 id="programacoes-title" class="text-2xl font-bold text-advent-text">Programação Semanal</h2>
          <div class="mt-6 grid gap-6 md:grid-cols-2">
            @for (item of horarios(); track item.titulo) {
              <article class="flex flex-col justify-between rounded-section border border-advent-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="rounded bg-advent-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
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
        <section class="mt-14 rounded-section border border-advent-border bg-advent-neutral p-6 md:p-10" aria-labelledby="localizacao-title">
          <div class="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Onde Estamos</span>
              <h2 id="localizacao-title" class="mt-2 text-3xl font-bold text-advent-text">Como Chegar</h2>
              <p class="mt-3 text-advent-muted">
                A IASD Mangueiras está localizada em Tatuí-SP, com fácil acesso e ambiente acolhedor preparado para você.
              </p>

              <div class="mt-6 space-y-3 text-advent-text">
                <p class="flex items-start gap-3">
                  <span class="font-bold text-advent-blue" aria-hidden="true">📍</span>
                  <span><strong>Cidade:</strong> {{ site.city }} - {{ site.state }}</span>
                </p>
                <p class="flex items-start gap-3">
                  <span class="font-bold text-advent-blue" aria-hidden="true">⛪</span>
                  <span><strong>Comunidade:</strong> {{ site.legalName }}</span>
                </p>
              </div>

              <div class="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  class="rounded-card bg-advent-blue px-6 py-3.5 text-center font-semibold text-white shadow-sm transition-colors hover:bg-advent-blue-dark"
                  href="https://www.google.com/maps/search/?api=1&query=IASD+Mangueiras+Tatui+SP"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir no Google Maps ↗
                </a>
                <a
                  class="rounded-card border border-advent-border bg-white px-6 py-3.5 text-center font-semibold text-advent-text shadow-sm transition-colors hover:bg-gray-50"
                  href="/sou-novo"
                >
                  Primeira vez? Veja o que esperar
                </a>
              </div>
            </div>

            <!-- Card Informativo de Acolhimento -->
            <div class="rounded-card border border-advent-border bg-white p-6 shadow-sm">
              <h3 class="text-xl font-bold text-advent-text">Dúvidas Frequentes do Visitante</h3>
              <ul class="mt-4 space-y-4 text-sm text-advent-muted">
                <li class="flex items-start gap-2">
                  <span class="font-bold text-advent-blue" aria-hidden="true">✓</span>
                  <span><strong>Como devo me vestir?</strong> Venha com roupas confortáveis e adequadas para um ambiente de culto e reflexão.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="font-bold text-advent-blue" aria-hidden="true">✓</span>
                  <span><strong>Tem espaço para crianças?</strong> Sim! Temos classes da Escola Sabatina divididas por faixa etária durante as manhãs de sábado.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="font-bold text-advent-blue" aria-hidden="true">✓</span>
                  <span><strong>Preciso pagar alguma coisa?</strong> Não. A participação em todas as nossas programações é totalmente gratuita e aberta a todos.</span>
                </li>
              </ul>
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

  constructor() {
    this.seo.apply({
      title: 'Horários dos Cultos e Localização — IASD Mangueiras',
      description: 'Conheça os horários dos cultos de sábado e quarta-feira da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP e saiba como chegar.',
      path: '/horarios',
    });
  }
}

