import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { BrowserStorageService } from '../browser-storage/browser-storage.service';

export const authGuard: CanActivateFn = (_, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const browserStorageService = inject(BrowserStorageService);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    browserStorageService.redirectUrl = state.url;
    return router.parseUrl('/login');
  }
};
