// frontend/src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Only attach the token to our backend API requests
  if (req.url.includes('/api/')) {
    return from(authService.getCurrentToken()).pipe(
      switchMap(token => {
        if (token) {
          const clonedRequest = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next(clonedRequest);
        }
        return next(req);
      })
    );
  }
  
  return next(req);
};