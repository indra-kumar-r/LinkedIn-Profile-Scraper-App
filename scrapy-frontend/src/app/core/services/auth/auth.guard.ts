import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const storageService = inject(StorageService);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    storageService.redirectUrl = state.url;
    return router.parseUrl('/login');
  }
};
