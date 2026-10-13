import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ClerkAuthService } from '../services/clerk-auth.service';
import { ToastService } from '../services/toast.service';
import { UserRole } from '../models/auth.models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(ClerkAuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  const allowedRoles = (route.data['roles'] as UserRole[]) || [];
  if (allowedRoles.length === 0) {
    return true;
  }

  const currentRole = authService.userRole();
  if (allowedRoles.includes(currentRole)) {
    return true;
  }

  toastService.showError(
    `Your role (${currentRole}) does not have permission for this view.`,
    'Access Denied',
  );

  return router.createUrlTree(['/dashboard']);
};
