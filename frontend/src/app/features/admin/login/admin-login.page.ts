import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SITE_CONFIG } from '../../../core/site/site.config';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#062c4a] via-advent-blue to-[#0b3b60] p-4 text-advent-text">
      <div class="w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
        <!-- Cabeçalho com Logo -->
        <div class="text-center">
          <a href="/" class="inline-block text-2xl font-bold tracking-tight text-advent-blue font-brand">
            {{ site.name }}
          </a>
          <span class="mt-2 inline-block rounded-full bg-advent-blue/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue">
            Painel Administrativo
          </span>
          <h1 class="mt-4 text-2xl font-bold text-advent-text">Entrar no Sistema</h1>
          <p class="mt-1 text-sm text-advent-muted">
            Acesso restrito para a liderança e equipe de comunicação.
          </p>
        </div>

        <!-- Feedback de Erro -->
        @if (authService.errorMessage()) {
          <div class="mt-6 rounded-card border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 animate-fadeIn" role="alert">
            <strong>Não foi possível entrar:</strong> {{ authService.errorMessage() }}
          </div>
        }

        <!-- Formulário Email/Senha -->
        <form [formGroup]="loginForm" (ngSubmit)="handleEmailLogin()" class="mt-6 space-y-4">
          <div>
            <label for="email" class="block text-xs font-semibold uppercase text-advent-muted mb-1">E-mail</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full rounded-card border border-advent-border bg-white px-4 py-2.5 text-sm text-advent-text focus:border-advent-blue focus:outline-none focus:ring-1 focus:ring-advent-blue"
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="password" class="block text-xs font-semibold uppercase text-advent-muted">Senha</label>
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
              formControlName="password"
              class="w-full rounded-card border border-advent-border bg-white px-4 py-2.5 text-sm text-advent-text focus:border-advent-blue focus:outline-none focus:ring-1 focus:ring-advent-blue"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || authService.isLoading()"
            class="w-full rounded-card bg-advent-blue px-4 py-3 text-sm font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer"
          >
            {{ authService.isLoading() ? 'Autenticando...' : 'Acessar Painel' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <a href="/" class="text-xs font-semibold text-advent-muted hover:text-advent-blue hover:underline">
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

  readonly resetSent = signal<boolean>(false);

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
      // erro já capturado no authService
    }
  }

  async handleResetPassword(): Promise<void> {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      alert('Por favor, informe seu e-mail no campo acima antes de solicitar a recuperação.');
      return;
    }
    try {
      await this.authService.resetPassword(email);
      alert(`Um e-mail com instruções para redefinir sua senha foi enviado para ${email}.`);
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Erro ao enviar e-mail de recuperação.');
    }
  }
}
