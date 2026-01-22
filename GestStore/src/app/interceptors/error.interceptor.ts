import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          // No redirigir si estamos en login o register (el usuario está intentando autenticarse)
          const currentUrl = router.url || '/';
          const isAuthPage = currentUrl.startsWith('/login') || currentUrl.startsWith('/register');
          const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');
          
          if (!isAuthPage && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
          }
        }
      }

      return throwError(() => err);
    })
  );
};
