// loading.interceptor.ts

import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
} from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoadingService } from '../../service/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  // grab your singleton LoadingService
  const loadingService = inject(LoadingService);

  // signal start
  loadingService.onRequestStart();

  // forward the request & signal end in finalize
  return next(req).pipe(finalize(() => loadingService.onRequestEnd()));
};
