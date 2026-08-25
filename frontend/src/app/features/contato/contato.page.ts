import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { ContatoService } from '../../core/services/contato.service';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-contato-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" routerLink="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page">Contato e Oração</span>
        </nav>

        <header class="max-w-3xl">
          <span
            class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue"
          >
            Estamos com Você
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Contato e Pedido de Oração
          </h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Seja para tirar dúvidas sobre a igreja, pedir uma oração ou solicitar um estudo bíblico
            gratuito, preencha o formulário abaixo ou fale conosco pelo WhatsApp.
          </p>
        </header>

        <div class="mt-12 grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <!-- Área de Formulários -->
          <div class="rounded-section border border-advent-border bg-white p-6 md:p-8 shadow-sm">
            <!-- Alternador de Abas -->
            <div class="flex flex-wrap border-b border-advent-border mb-8 gap-2" role="tablist">
              <button
                type="button"
                role="tab"
                id="tab-contato"
                [attr.aria-selected]="activeTab() === 'contato'"
                [attr.aria-controls]="'panel-contato'"
                class="pb-3 px-4 text-sm font-bold transition-colors relative cursor-pointer"
                [class.text-advent-blue]="activeTab() === 'contato'"
                [class.text-advent-muted]="activeTab() !== 'contato'"
                (click)="setTab('contato')"
              >
                Fale Conosco
                @if (activeTab() === 'contato') {
                  <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-advent-blue"></span>
                }
              </button>
              <button
                type="button"
                role="tab"
                id="tab-oracao"
                [attr.aria-selected]="activeTab() === 'oracao'"
                [attr.aria-controls]="'panel-oracao'"
                class="pb-3 px-4 text-sm font-bold transition-colors relative cursor-pointer inline-flex items-center gap-2"
                [class.text-advent-blue]="activeTab() === 'oracao'"
                [class.text-advent-muted]="activeTab() !== 'oracao'"
                (click)="setTab('oracao')"
              >
                <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                Pedido de Oração
                @if (activeTab() === 'oracao') {
                  <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-advent-blue"></span>
                }
              </button>
              <button
                type="button"
                role="tab"
                id="tab-estudo"
                [attr.aria-selected]="activeTab() === 'estudo'"
                [attr.aria-controls]="'panel-estudo'"
                class="pb-3 px-4 text-sm font-bold transition-colors relative cursor-pointer inline-flex items-center gap-2"
                [class.text-advent-blue]="activeTab() === 'estudo'"
                [class.text-advent-muted]="activeTab() !== 'estudo'"
                (click)="setTab('estudo')"
              >
                <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Estudo Bíblico
                @if (activeTab() === 'estudo') {
                  <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-advent-blue"></span>
                }
              </button>
            </div>

            <!-- Feedback de Sucesso -->
            @if (successMessage()) {
              <div
                class="mb-6 rounded-card border border-green-200 bg-green-50 p-4 text-green-800 animate-fadeIn"
                role="status"
                aria-live="polite"
              >
                <p class="font-bold flex items-center gap-2">
                  <span
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white"
                    aria-hidden="true"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  Mensagem Enviada com Sucesso!
                </p>
                <p class="text-sm mt-1.5">{{ successMessage() }}</p>
              </div>
            }

            <!-- Feedback de Erro -->
            @if (errorMessage()) {
              <div
                class="mb-6 rounded-card border border-red-200 bg-red-50 p-4 text-red-800 animate-fadeIn"
                role="alert"
                aria-live="assertive"
              >
                <p class="font-bold flex items-center gap-2">
                  <span
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs"
                    aria-hidden="true"
                    >!</span
                  >
                  Não foi possível enviar
                </p>
                <p class="text-sm mt-1.5">{{ errorMessage() }}</p>
              </div>
            }

            <!-- Formulário de Contato -->
            @if (activeTab() === 'contato') {
              <form
                id="panel-contato"
                role="tabpanel"
                aria-labelledby="tab-contato"
                [formGroup]="contatoForm"
                (ngSubmit)="submitContato()"
                class="space-y-5"
                aria-label="Formulário de contato"
              >
                <div>
                  <label
                    for="contato-nome"
                    class="block text-sm font-semibold text-advent-text mb-1"
                    >Nome completo *</label
                  >
                  <input
                    id="contato-nome"
                    type="text"
                    name="name"
                    autocomplete="name"
                    formControlName="nome"
                    class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
                    placeholder="Seu nome completo"
                    [attr.aria-invalid]="contatoForm.get('nome')?.touched && contatoForm.get('nome')?.invalid"
                    aria-describedby="contato-nome-erro"
                  />
                  @if (contatoForm.get('nome')?.touched && contatoForm.get('nome')?.invalid) {
                    <p id="contato-nome-erro" class="mt-1 text-xs text-red-600" role="alert">Por favor, informe seu nome.</p>
                  }
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      for="contato-email"
                      class="block text-sm font-semibold text-advent-text mb-1"
                      >E-mail *</label
                    >
                    <input
                      id="contato-email"
                      type="email"
                      name="email"
                      autocomplete="email"
                      inputmode="email"
                      spellcheck="false"
                      formControlName="email"
                      class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
                      placeholder="seu@email.com"
                      [attr.aria-invalid]="contatoForm.get('email')?.touched && contatoForm.get('email')?.invalid"
                      aria-describedby="contato-email-erro"
                    />
                    @if (contatoForm.get('email')?.touched && contatoForm.get('email')?.invalid) {
                      <p id="contato-email-erro" class="mt-1 text-xs text-red-600" role="alert">Informe um e-mail válido.</p>
                    }
                  </div>

                  <div>
                    <label
                      for="contato-telefone"
                      class="block text-sm font-semibold text-advent-text mb-1"
                      >Telefone / WhatsApp</label
                    >
                    <input
                      id="contato-telefone"
                      type="tel"
                      name="tel"
                      autocomplete="tel"
                      inputmode="tel"
                      formControlName="telefone"
                      (input)="formatPhone($event, contatoForm, 'telefone')"
                      class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
                      placeholder="(15) 99999-9999"
                      maxlength="15"
                    />
                  </div>
                </div>

                <div>
                  <label
                    for="contato-mensagem"
                    class="block text-sm font-semibold text-advent-text mb-1"
                    >Mensagem *</label
                  >
                  <textarea
                    id="contato-mensagem"
                    rows="4"
                    formControlName="mensagem"
                    class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
                    placeholder="Como podemos ajudar você?…"
                    [attr.aria-invalid]="contatoForm.get('mensagem')?.touched && contatoForm.get('mensagem')?.invalid"
                    aria-describedby="contato-mensagem-erro"
                  ></textarea>
                  @if (
                    contatoForm.get('mensagem')?.touched && contatoForm.get('mensagem')?.invalid
                  ) {
                    <p id="contato-mensagem-erro" class="mt-1 text-xs text-red-600" role="alert">
                      Por favor, escreva sua mensagem (mínimo 5 caracteres).
                    </p>
                  }
                </div>

                <button
                  type="submit"
                  [disabled]="contatoForm.invalid || isSubmitting()"
                  class="w-full sm:w-auto rounded-card bg-advent-blue px-8 py-3.5 font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {{ isSubmitting() ? 'Enviando…' : 'Enviar Mensagem' }}
                </button>
              </form>
            }

            <!-- Formulário de Oração -->
            @if (activeTab() === 'oracao') {
              <form
                id="panel-oracao"
                role="tabpanel"
                aria-labelledby="tab-oracao"
                [formGroup]="oracaoForm"
                (ngSubmit)="submitOracao()"
                class="space-y-5"
                aria-label="Formulário de pedido de oração"
              >
                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      for="oracao-nome"
                      class="block text-sm font-semibold text-advent-text mb-1"
                      >Seu Nome *</label
                    >
                    <input
                      id="oracao-nome"
                      type="text"
                      name="name"
                      autocomplete="name"
                      formControlName="nome"
                      class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
                      placeholder="Seu nome"
                      [attr.aria-invalid]="oracaoForm.get('nome')?.touched && oracaoForm.get('nome')?.invalid"
                      aria-describedby="oracao-nome-erro"
                    />
                    @if (oracaoForm.get('nome')?.touched && oracaoForm.get('nome')?.invalid) {
                      <p id="oracao-nome-erro" class="mt-1 text-xs text-red-600" role="alert">Por favor, informe seu nome.</p>
                    }
                  </div>

                  <div>
                    <label
                      for="oracao-telefone"
                      class="block text-sm font-semibold text-advent-text mb-1"
                      >Telefone (opcional)</label
                    >
                    <input
                      id="oracao-telefone"
                      type="tel"
                      name="tel"
                      autocomplete="tel"
                      inputmode="tel"
                      formControlName="telefone"
                      (input)="formatPhone($event, oracaoForm, 'telefone')"
                      class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
                      placeholder="(15) 99999-9999"
                      maxlength="15"
                    />
                  </div>
                </div>

                <div>
                  <label
                    for="oracao-pedido"
                    class="block text-sm font-semibold text-advent-text mb-1"
                    >Motivo de Oração *</label
                  >
                  <textarea
                    id="oracao-pedido"
                    rows="4"
                    formControlName="pedido"
                    class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
                    placeholder="Compartilhe seu pedido (saúde, família, decisões, gratidão…)…"
                    [attr.aria-invalid]="oracaoForm.get('pedido')?.touched && oracaoForm.get('pedido')?.invalid"
                    aria-describedby="oracao-pedido-erro"
                  ></textarea>
                  @if (oracaoForm.get('pedido')?.touched && oracaoForm.get('pedido')?.invalid) {
                    <p id="oracao-pedido-erro" class="mt-1 text-xs text-red-600" role="alert">
                      Por favor, descreva seu pedido de oração.
                    </p>
                  }
                </div>

                <div class="flex items-center gap-3 pt-1">
                  <input
                    id="oracao-confidencial"
                    type="checkbox"
                    formControlName="confidencial"
                    class="h-4 w-4 rounded border-advent-border text-advent-blue accent-advent-blue focus:ring-2 focus:ring-advent-blue/20 cursor-pointer"
                  />
                  <label for="oracao-confidencial" class="text-sm font-medium text-advent-text cursor-pointer select-none">
                    Desejo que este pedido seja confidencial (somente equipe pastoral e liderança).
                  </label>
                </div>

                <button
                  type="submit"
                  [disabled]="oracaoForm.invalid || isSubmitting()"
                  class="w-full sm:w-auto rounded-card bg-advent-blue px-8 py-3.5 font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {{ isSubmitting() ? 'Enviando…' : 'Enviar Pedido de Oração' }}
                </button>
              </form>
            }

            <!-- Formulário de Estudo Bíblico -->
            @if (activeTab() === 'estudo') {
              <form
                id="panel-estudo"
                role="tabpanel"
                aria-labelledby="tab-estudo"
                [formGroup]="estudoForm"
                (ngSubmit)="submitEstudo()"
                class="space-y-5"
                aria-label="Formulário de solicitação de estudo bíblico"
              >
                <div
                  class="rounded-card border border-blue-100 bg-blue-50/60 p-4 text-xs text-advent-blue leading-relaxed flex items-start gap-2.5"
                >
                  <svg class="h-5 w-5 shrink-0 text-advent-blue mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  <div>
                    <strong>Estudo Bíblico Gratuito:</strong> Você receberá materiais práticos para
                    estudar as profecias e os ensinamentos bíblicos de forma dinâmica e sem custo
                    algum.
                  </div>
                </div>

                <div>
                  <label for="estudo-nome" class="block text-sm font-semibold text-advent-text mb-1"
                    >Seu Nome *</label
                  >
                  <input
                    id="estudo-nome"
                    type="text"
                    name="name"
                    autocomplete="name"
                    formControlName="nome"
                    class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
                    placeholder="Seu nome completo"
                    [attr.aria-invalid]="estudoForm.get('nome')?.touched && estudoForm.get('nome')?.invalid"
                    aria-describedby="estudo-nome-erro"
                  />
                  @if (estudoForm.get('nome')?.touched && estudoForm.get('nome')?.invalid) {
                    <p id="estudo-nome-erro" class="mt-1 text-xs text-red-600" role="alert">Por favor, informe seu nome.</p>
                  }
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      for="estudo-email"
                      class="block text-sm font-semibold text-advent-text mb-1"
                      >E-mail *</label
                    >
                    <input
                      id="estudo-email"
                      type="email"
                      name="email"
                      autocomplete="email"
                      inputmode="email"
                      spellcheck="false"
                      formControlName="email"
                      class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
                      placeholder="seu@email.com"
                      [attr.aria-invalid]="estudoForm.get('email')?.touched && estudoForm.get('email')?.invalid"
                      aria-describedby="estudo-email-erro"
                    />
                    @if (estudoForm.get('email')?.touched && estudoForm.get('email')?.invalid) {
                      <p id="estudo-email-erro" class="mt-1 text-xs text-red-600" role="alert">Informe um e-mail válido.</p>
                    }
                  </div>

                  <div>
                    <label
                      for="estudo-telefone"
                      class="block text-sm font-semibold text-advent-text mb-1"
                      >WhatsApp / Telefone *</label
                    >
                    <input
                      id="estudo-telefone"
                      type="tel"
                      name="tel"
                      autocomplete="tel"
                      inputmode="tel"
                      formControlName="telefone"
                      (input)="formatPhone($event, estudoForm, 'telefone')"
                      class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
                      placeholder="(15) 99999-9999"
                      maxlength="15"
                      [attr.aria-invalid]="estudoForm.get('telefone')?.touched && estudoForm.get('telefone')?.invalid"
                      aria-describedby="estudo-tel-erro"
                    />
                    @if (
                      estudoForm.get('telefone')?.touched && estudoForm.get('telefone')?.invalid
                    ) {
                      <p id="estudo-tel-erro" class="mt-1 text-xs text-red-600" role="alert">
                        Informe seu WhatsApp para envio do material.
                      </p>
                    }
                  </div>
                </div>

                <div>
                  <label
                    for="estudo-preferencia"
                    class="block text-sm font-semibold text-advent-text mb-1"
                    >Como prefere estudar?</label
                  >
                  <select
                    id="estudo-preferencia"
                    formControlName="preferencia"
                    class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30 bg-white"
                  >
                    <option value="digital">Guia Digital por WhatsApp / E-mail</option>
                    <option value="presencial">Presencialmente com um instrutor na igreja</option>
                    <option value="correio">Material impresso gratuito</option>
                  </select>
                </div>

                <button
                  type="submit"
                  [disabled]="estudoForm.invalid || isSubmitting()"
                  class="w-full sm:w-auto rounded-card bg-advent-blue px-8 py-3.5 font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {{ isSubmitting() ? 'Enviando…' : 'Solicitar Estudo Gratuito' }}
                </button>
              </form>
            }
          </div>

          <!-- Informações de Apoio e WhatsApp -->
          <aside class="space-y-6">
            <!-- Card de WhatsApp -->
            <div class="rounded-section border border-green-200 bg-green-50 p-6 md:p-8">
              <span class="text-xs font-bold uppercase tracking-wider text-green-800">
                Atendimento Rápido
              </span>
              <h2 class="mt-2 text-2xl font-bold text-green-950">Fale pelo WhatsApp</h2>
              <p class="mt-2 text-sm text-green-900 leading-relaxed">
                Prefere conversar diretamente pelo celular? Nossa equipe de acolhimento e recepção
                pode tirar suas dúvidas em tempo real.
              </p>
              <a
                class="mt-6 inline-flex items-center gap-2 rounded-card bg-green-700 px-6 py-3.5 font-semibold text-white shadow transition-all hover:bg-green-800 active:scale-[0.98] active:shadow-inner"
                [href]="whatsAppLink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir WhatsApp ↗
              </a>
            </div>

            <!-- Card de Localização / Horários -->
            <div class="rounded-section border border-advent-border bg-advent-neutral p-6 md:p-8">
              <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
                >Visite-nos</span
              >
              <h2 class="mt-1 text-xl font-bold text-advent-text">Cultos Presenciais</h2>
              <p class="mt-2 text-sm text-advent-muted">
                Venha nos visitar em nossos encontros regulares:
              </p>
              <ul class="mt-4 space-y-2 text-sm text-advent-text">
                <li>• <strong>Sábados:</strong> 09:00 (Escola Sabatina) e 10:15 (Culto Divino)</li>
                <li>• <strong>Domingos:</strong> 19:30 (Culto de Domingo)</li>
                <li>• <strong>Quartas:</strong> 19:30 (Culto de Oração)</li>
              </ul>
              <a
                class="mt-5 inline-block text-sm font-semibold text-advent-blue hover:underline"
                routerLink="/horarios"
              >
                Ver endereço e mapa →
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  `,
})
export class ContatoPage {
  protected readonly site = SITE_CONFIG;
  private readonly contatoService = inject(ContatoService);
  private readonly seo = inject(SeoService);

  readonly activeTab = signal<'contato' | 'oracao' | 'estudo'>('contato');
  readonly isSubmitting = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly contatoForm = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefone: new FormControl(''),
    mensagem: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  readonly oracaoForm = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(2)]),
    telefone: new FormControl(''),
    pedido: new FormControl('', [Validators.required, Validators.minLength(5)]),
    confidencial: new FormControl(false),
  });

  readonly estudoForm = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefone: new FormControl('', [Validators.required, Validators.minLength(10)]),
    preferencia: new FormControl('digital'),
  });

  protected readonly whatsAppLink = this.contatoService.getWhatsAppLink(
    'Olá! Gostaria de falar com a equipe da IASD Mangueiras.',
  );

  constructor() {
    this.seo.apply({
      title: 'Contato, Oração & Estudos Bíblicos — IASD Mangueiras',
      description:
        'Fale com a equipe da IASD Mangueiras em Tatuí-SP, tire dúvidas sobre programações, solicite um estudo bíblico gratuito ou envie seu pedido de oração.',
      path: '/contato',
    });
  }

  setTab(tab: 'contato' | 'oracao' | 'estudo'): void {
    this.activeTab.set(tab);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  formatPhone(event: Event, form: FormGroup, controlName: string): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '');
    if (digits.length > 11) digits = digits.slice(0, 11);

    let formatted = '';
    if (digits.length > 0) {
      formatted = `(${digits.slice(0, 2)}`;
      if (digits.length > 2) {
        if (digits.length > 6) {
          formatted += `) ${digits.slice(2, 7)}-${digits.slice(7)}`;
        } else {
          formatted += `) ${digits.slice(2)}`;
        }
      }
    }
    form.get(controlName)?.setValue(formatted, { emitEvent: false });
  }

  submitContato(): void {
    if (this.contatoForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const formValue = this.contatoForm.value;
    this.contatoService
      .sendContato({
        nome: formValue.nome || '',
        email: formValue.email || '',
        telefone: formValue.telefone || undefined,
        mensagem: formValue.mensagem || '',
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.successMessage.set(res.message);
          this.contatoForm.reset();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            'Não foi possível enviar a mensagem. Por favor, tente novamente ou fale conosco pelo WhatsApp.',
          );
        },
      });
  }

  submitOracao(): void {
    if (this.oracaoForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const formValue = this.oracaoForm.value;
    this.contatoService
      .sendOracao({
        nome: formValue.nome || '',
        telefone: formValue.telefone || undefined,
        pedido: formValue.pedido || '',
        confidencial: formValue.confidencial || false,
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.successMessage.set(res.message);
          this.oracaoForm.reset();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            'Não foi possível enviar seu pedido. Por favor, tente novamente ou fale conosco pelo WhatsApp.',
          );
        },
      });
  }

  submitEstudo(): void {
    if (this.estudoForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const formValue = this.estudoForm.value;
    const msg = `Solicitação de Estudo Bíblico gratuito (${formValue.preferencia || 'digital'}). Telefone: ${formValue.telefone}`;

    this.contatoService
      .sendContato({
        nome: formValue.nome || '',
        email: formValue.email || '',
        telefone: formValue.telefone || undefined,
        mensagem: msg,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.successMessage.set(
            'Sua solicitação de Estudo Bíblico foi recebida com sucesso! Nossa equipe entrará em contato via WhatsApp/E-mail.',
          );
          this.estudoForm.reset({ preferencia: 'digital' });
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            'Não foi possível enviar a solicitação. Por favor, tente novamente ou nos envie uma mensagem no WhatsApp.',
          );
        },
      });
  }
}
