import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Aguarda inicialização do estado de autenticação se ainda estiver carregando
  if (authService.isLoading()) {
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (!authService.isLoading()) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
      // Timeout de segurança após 3 segundos
      setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, 3000);
    });
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/admin/login']);
};
