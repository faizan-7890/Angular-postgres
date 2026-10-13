import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { ClerkAuthService } from '../services/clerk-auth.service';

export const clerkAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(ClerkAuthService);

  // Skip adding auth header if not targeting the backend API
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  return from(authService.getToken()).pipe(
    switchMap((token) => {
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(authReq);
      }
      return next(req);
    }),
  );
};
