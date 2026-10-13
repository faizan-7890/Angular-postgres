import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClerkAuthService } from '../services/clerk-auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(ClerkAuthService);
  const router = inject(Router);

  if (authService.isSignedIn()) {
    return true;
  }

  // Redirect to login if user is not signed in
  return router.createUrlTree(['/login']);
};
