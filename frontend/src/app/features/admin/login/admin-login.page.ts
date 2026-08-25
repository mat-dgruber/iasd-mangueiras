import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SITE_CONFIG } from '../../../core/site/site.config';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main
      id="conteudo"
      class="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#062c4a] via-advent-blue to-[#0b3b60] p-4 text-advent-text"
    >
      <div
        class="w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl"
      >
        <!-- Cabeçalho com Logo -->
        <div class="flex flex-col items-center text-center">
          <div class="flex items-center gap-2">
            <a
              routerLink="/"
              class="text-2xl font-bold tracking-tight text-advent-blue font-brand"
            >
              {{ site.name }}
            </a>
            <span
              class="rounded-full bg-advent-blue/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue"
            >
              Painel Administrativo
            </span>
          </div>
          <h1 class="mt-4 text-2xl font-bold text-advent-text">Entrar no Sistema</h1>
          <p class="mt-1 text-sm text-advent-muted">
            Acesso restrito para a liderança e equipe de comunicação.
          </p>
        </div>

        <!-- Feedback de Erro de Autenticação -->
        @if (authService.errorMessage()) {
          <div
            class="mt-6 rounded-card border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 animate-fadeIn"
            role="alert"
          >
            <strong>Não foi possível entrar:</strong> {{ authService.errorMessage() }}
          </div>
        }

        <!-- Feedback de Recuperação de Senha -->
        @if (resetFeedback()) {
          <div
            class="mt-6 rounded-card p-3.5 text-xs animate-fadeIn flex items-center gap-2"
            [class.border-green-200]="resetFeedback()?.type === 'success'"
            [class.bg-green-50]="resetFeedback()?.type === 'success'"
            [class.text-green-800]="resetFeedback()?.type === 'success'"
            [class.border-red-200]="resetFeedback()?.type === 'error'"
            [class.bg-red-50]="resetFeedback()?.type === 'error'"
            [class.text-red-800]="resetFeedback()?.type === 'error'"
            role="status"
            aria-live="polite"
          >
            @if (resetFeedback()?.type === 'success') {
              <svg
                class="h-4 w-4 shrink-0 text-green-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            }
            <span>{{ resetFeedback()?.message }}</span>
          </div>
        }

        <!-- Formulário Email/Senha -->
        <form
          [formGroup]="loginForm"
          (ngSubmit)="handleEmailLogin()"
          class="mt-6 space-y-4"
          aria-label="Formulário de acesso administrativo"
        >
          <div>
            <label for="email" class="block text-xs font-semibold uppercase text-advent-muted mb-1"
              >E-mail</label
            >
            <input
              id="email"
              type="email"
              name="email"
              autocomplete="email"
              inputmode="email"
              spellcheck="false"
              formControlName="email"
              class="w-full rounded-card border border-advent-border bg-white px-4 py-2.5 text-sm text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="password" class="block text-xs font-semibold uppercase text-advent-muted"
                >Senha</label
              >
              <button
                type="button"
                (click)="handleResetPassword()"
                class="text-xs font-semibold text-advent-blue hover:underline cursor-pointer"
              >
                Esqueci a senha
              </button>
            </div>
            <input
              id="password"
              type="password"
              name="current-password"
              autocomplete="current-password"
              formControlName="password"
              class="w-full rounded-card border border-advent-border bg-white px-4 py-2.5 text-sm text-advent-text focus:border-advent-blue focus:outline-none focus:ring-2 focus:ring-advent-blue/30"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || authService.isLoading()"
            class="w-full rounded-card bg-advent-blue px-4 py-3 text-sm font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer"
          >
            {{ authService.isLoading() ? 'Autenticando…' : 'Acessar Painel' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <a
            routerLink="/"
            class="text-xs font-semibold text-advent-muted hover:text-advent-blue hover:underline"
          >
            ← Voltar para o site público
          </a>
        </div>
      </div>
    </main>
  `,
})
export class AdminLoginPage {
  protected readonly site = SITE_CONFIG;
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly resetFeedback = signal<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  async handleEmailLogin(): Promise<void> {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;
    try {
      const user = await this.authService.loginWithEmail(email!, password!);
      if (user) {
        this.router.navigate(['/admin']);
      }
    } catch {
      // Mensagem já manipulada no sinal de erro do AuthService
    }
  }

  async handleResetPassword(): Promise<void> {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.resetFeedback.set({
        type: 'error',
        message: 'Digite seu e-mail no campo acima antes de solicitar a recuperação de senha.',
      });
      return;
    }

    try {
      await this.authService.resetPassword(email);
      this.resetFeedback.set({
        type: 'success',
        message: 'Link de redefinição de senha enviado para o seu e-mail.',
      });
    } catch {
      this.resetFeedback.set({
        type: 'error',
        message: 'Não foi possível enviar o e-mail de redefinição. Verifique o endereço.',
      });
    }
  }
}
