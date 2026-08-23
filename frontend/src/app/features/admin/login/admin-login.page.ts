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

        <!-- Botão Google Sign-In -->
        <div class="mt-6">
          <button
            type="button"
            (click)="handleGoogleLogin()"
            [disabled]="authService.isLoading()"
            class="flex w-full items-center justify-center gap-3 rounded-card border border-advent-border bg-white px-4 py-3 text-sm font-semibold text-advent-text shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] active:shadow-inner cursor-pointer disabled:opacity-50"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Entrar com conta Google
          </button>
        </div>

        <div class="relative my-6 flex items-center justify-center">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-advent-border"></div>
          </div>
          <span class="relative bg-white px-3 text-xs font-semibold text-advent-muted uppercase">ou com e-mail</span>
        </div>

        <!-- Formulário Email/Senha -->
        <form [formGroup]="loginForm" (ngSubmit)="handleEmailLogin()" class="space-y-4">
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

  async handleGoogleLogin(): Promise<void> {
    try {
      const user = await this.authService.loginWithGoogle();
      if (user) {
        this.router.navigate(['/admin']);
      }
    } catch {
      // erro já capturado no authService
    }
  }

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
