import { isDevMode } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isDevMode()) {
    return next(req);
  }

  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

  return next(req).pipe(
    finalize(() => {
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const durationMs = Math.round((end - start) * 10) / 10;

      // Avoid logging bodies or sensitive headers; keep it request-line only.
      // eslint-disable-next-line no-console
      console.debug(`[HTTP] ${req.method} ${req.urlWithParams} (${durationMs}ms)`);
    })
  );
};
