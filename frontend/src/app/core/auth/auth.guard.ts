import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // No servidor (SSR), fail-closed: nunca expor conteúdo protegido
  if (!isPlatformBrowser(platformId)) {
    return router.createUrlTree(['/admin/login']);
  }

  await authService.waitForAuthInit();

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/admin/login']);
};

