// frontend/src/app/core/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const auth = inject(Auth);
  const router = inject(Router);

  // If this is running on the server during SSR, allow it to pass.
  // The real check will happen a millisecond later in the browser.
  if (!isPlatformBrowser(platformId)) {
    return true; 
  }

  // If we are in the browser, safely check the Firebase Auth state
  return authState(auth).pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      }
      
      router.navigate(['/login']);
      return false;
    })
  );
};