import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeoService } from '../../core/seo/seo.service';
import { ContatoService } from '../../core/services/contato.service';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-contato-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" href="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page">Contato e Oração</span>
        </nav>

        <header class="max-w-3xl">
          <span class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
            Estamos com Você
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">Contato e Pedido de Oração</h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Seja para tirar dúvidas sobre a igreja, pedir uma oração ou falar com nossa equipe pastoral, preencha o formulário abaixo ou fale conosco pelo WhatsApp.
          </p>
        </header>

        <div class="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <!-- Área de Formulários -->
          <div class="rounded-section border border-advent-border bg-white p-6 md:p-8 shadow-sm">
            <!-- Alternador de Abas -->
            <div class="flex border-b border-advent-border mb-8" role="tablist">
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="activeTab() === 'contato'"
                class="pb-3 px-4 text-sm font-bold transition-colors relative"
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
                [attr.aria-selected]="activeTab() === 'oracao'"
                class="pb-3 px-4 text-sm font-bold transition-colors relative"
                [class.text-advent-blue]="activeTab() === 'oracao'"
                [class.text-advent-muted]="activeTab() !== 'oracao'"
                (click)="setTab('oracao')"
              >
                Pedido de Oração 🙏
                @if (activeTab() === 'oracao') {
                  <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-advent-blue"></span>
                }
              </button>
            </div>

            <!-- Feedback de Sucesso -->
            @if (successMessage()) {
              <div class="mb-6 rounded-card border border-green-200 bg-green-50 p-4 text-green-800" role="status">
                <p class="font-bold">✓ Sucesso!</p>
                <p class="text-sm mt-1">{{ successMessage() }}</p>
              </div>
            }

            <!-- Formulário de Contato -->
            @if (activeTab() === 'contato') {
              <form [formGroup]="contatoForm" (ngSubmit)="submitContato()" class="space-y-5" aria-label="Formulário de contato">
                <div>
                  <label for="contato-nome" class="block text-sm font-semibold text-advent-text mb-1">Nome completo *</label>
                  <input
                    id="contato-nome"
                    type="text"
                    formControlName="nome"
                    class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-1 focus:ring-advent-blue"
                    placeholder="Seu nome"
                  />
                  @if (contatoForm.get('nome')?.touched && contatoForm.get('nome')?.invalid) {
                    <p class="mt-1 text-xs text-red-600">Por favor, informe seu nome.</p>
                  }
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label for="contato-email" class="block text-sm font-semibold text-advent-text mb-1">E-mail *</label>
                    <input
                      id="contato-email"
                      type="email"
                      formControlName="email"
                      class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-1 focus:ring-advent-blue"
                      placeholder="seu@email.com"
                    />
                    @if (contatoForm.get('email')?.touched && contatoForm.get('email')?.invalid) {
                      <p class="mt-1 text-xs text-red-600">Informe um e-mail válido.</p>
                    }
                  </div>

                  <div>
                    <label for="contato-telefone" class="block text-sm font-semibold text-advent-text mb-1">Telefone / WhatsApp</label>
                    <input
                      id="contato-telefone"
                      type="tel"
                      formControlName="telefone"
                      class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-1 focus:ring-advent-blue"
                      placeholder="(15) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label for="contato-mensagem" class="block text-sm font-semibold text-advent-text mb-1">Mensagem *</label>
                  <textarea
                    id="contato-mensagem"
                    rows="4"
                    formControlName="mensagem"
                    class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-1 focus:ring-advent-blue"
                    placeholder="Como podemos ajudar você?"
                  ></textarea>
                  @if (contatoForm.get('mensagem')?.touched && contatoForm.get('mensagem')?.invalid) {
                    <p class="mt-1 text-xs text-red-600">Por favor, escreva sua mensagem (mínimo 5 caracteres).</p>
                  }
                </div>

                <button
                  type="submit"
                  [disabled]="contatoForm.invalid || isSubmitting()"
                  class="w-full sm:w-auto rounded-card bg-advent-blue px-8 py-3 font-semibold text-white shadow transition-colors hover:bg-advent-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSubmitting() ? 'Enviando...' : 'Enviar Mensagem' }}
                </button>
              </form>
            }

            <!-- Formulário de Oração -->
            @if (activeTab() === 'oracao') {
              <form [formGroup]="oracaoForm" (ngSubmit)="submitOracao()" class="space-y-5" aria-label="Formulário de pedido de oração">
                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label for="oracao-nome" class="block text-sm font-semibold text-advent-text mb-1">Seu Nome *</label>
                    <input
                      id="oracao-nome"
                      type="text"
                      formControlName="nome"
                      class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-1 focus:ring-advent-blue"
                      placeholder="Seu nome"
                    />
                    @if (oracaoForm.get('nome')?.touched && oracaoForm.get('nome')?.invalid) {
                      <p class="mt-1 text-xs text-red-600">Por favor, informe seu nome.</p>
                    }
                  </div>

                  <div>
                    <label for="oracao-telefone" class="block text-sm font-semibold text-advent-text mb-1">Telefone (opcional)</label>
                    <input
                      id="oracao-telefone"
                      type="tel"
                      formControlName="telefone"
                      class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-1 focus:ring-advent-blue"
                      placeholder="(15) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label for="oracao-pedido" class="block text-sm font-semibold text-advent-text mb-1">Motivo de Oração *</label>
                  <textarea
                    id="oracao-pedido"
                    rows="4"
                    formControlName="pedido"
                    class="w-full rounded-card border border-advent-border px-4 py-2.5 text-advent-text focus:border-advent-blue focus:outline-none focus:ring-1 focus:ring-advent-blue"
                    placeholder="Compartilhe seu pedido (saúde, família, decisões, gratidão...)"
                  ></textarea>
                  @if (oracaoForm.get('pedido')?.touched && oracaoForm.get('pedido')?.invalid) {
                    <p class="mt-1 text-xs text-red-600">Por favor, descreva seu pedido de oração.</p>
                  }
                </div>

                <div class="flex items-center gap-3 pt-1">
                  <input
                    id="oracao-confidencial"
                    type="checkbox"
                    formControlName="confidencial"
                    class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
                  />
                  <label for="oracao-confidencial" class="text-sm text-advent-text">
                    Desejo que este pedido seja confidencial (somente equipe pastoral e liderança).
                  </label>
                </div>

                <button
                  type="submit"
                  [disabled]="oracaoForm.invalid || isSubmitting()"
                  class="w-full sm:w-auto rounded-card bg-advent-blue px-8 py-3 font-semibold text-white shadow transition-colors hover:bg-advent-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSubmitting() ? 'Enviando...' : 'Enviar Pedido de Oração' }}
                </button>
              </form>
            }
          </div>

          <!-- Informações de Apoio e WhatsApp -->
          <aside class="space-y-6">
            <!-- Card de WhatsApp -->
            <div class="rounded-section border border-green-200 bg-green-50 p-6 md:p-8">
              <span class="text-xs font-bold uppercase tracking-wider text-green-800">Atendimento Rápido</span>
              <h2 class="mt-2 text-2xl font-bold text-green-950">Fale pelo WhatsApp</h2>
              <p class="mt-2 text-sm text-green-900 leading-relaxed">
                Prefere conversar diretamente pelo celular? Nossa equipe de atendimento e recepção pode tirar suas dúvidas em tempo real.
              </p>
              <a
                class="mt-6 inline-flex items-center gap-2 rounded-card bg-green-700 px-6 py-3 font-semibold text-white shadow hover:bg-green-800 transition-colors"
                [href]="whatsAppLink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir WhatsApp ↗
              </a>
            </div>

            <!-- Card de Localização / Horários -->
            <div class="rounded-section border border-advent-border bg-advent-neutral p-6 md:p-8">
              <h2 class="text-xl font-bold text-advent-text">Cultos Presenciais</h2>
              <p class="mt-2 text-sm text-advent-muted">Venha nos visitar em nossos horários regulares:</p>
              <ul class="mt-4 space-y-2 text-sm text-advent-text">
                <li>• <strong>Sábados:</strong> 09:00 (Escola Sabatina) e 10:15 (Culto Divino)</li>
                <li>• <strong>Quartas:</strong> 19:30 (Culto de Oração)</li>
              </ul>
              <a class="mt-4 inline-block text-sm font-semibold text-advent-blue hover:underline" href="/horarios">
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

  readonly activeTab = signal<'contato' | 'oracao'>('contato');
  readonly isSubmitting = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);

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

  protected readonly whatsAppLink = this.contatoService.getWhatsAppLink('Olá! Gostaria de falar com a equipe da IASD Mangueiras.');

  constructor() {
    this.seo.apply({
      title: 'Contato e Pedido de Oração — IASD Mangueiras',
      description: 'Fale com a equipe pastoral da IASD Mangueiras em Tatuí-SP, tire dúvidas sobre programações ou envie seu pedido de oração.',
      path: '/contato',
    });
  }

  setTab(tab: 'contato' | 'oracao'): void {
    this.activeTab.set(tab);
    this.successMessage.set(null);
  }

  submitContato(): void {
    if (this.contatoForm.invalid) return;
    this.isSubmitting.set(true);
    const formValue = this.contatoForm.value;
    this.contatoService
      .sendContato({
        nome: formValue.nome || '',
        email: formValue.email || '',
        telefone: formValue.telefone || undefined,
        mensagem: formValue.mensagem || '',
      })
      .subscribe((res) => {
        this.isSubmitting.set(false);
        this.successMessage.set(res.message);
        this.contatoForm.reset();
      });
  }

  submitOracao(): void {
    if (this.oracaoForm.invalid) return;
    this.isSubmitting.set(true);
    const formValue = this.oracaoForm.value;
    this.contatoService
      .sendOracao({
        nome: formValue.nome || '',
        telefone: formValue.telefone || undefined,
        pedido: formValue.pedido || '',
        confidencial: formValue.confidencial || false,
      })
      .subscribe((res) => {
        this.isSubmitting.set(false);
        this.successMessage.set(res.message);
        this.oracaoForm.reset();
      });
  }
}

