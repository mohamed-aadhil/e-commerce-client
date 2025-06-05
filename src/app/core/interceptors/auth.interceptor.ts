import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token for auth endpoints that handle their own authentication
    if (this.isAuthUrl(request.url)) {
      console.log('AuthInterceptor: Skipping auth for URL:', request.url);
      return next.handle(request);
    }

    // Add token to requests if available
    const token = this.authService.getToken();
    console.log('AuthInterceptor: token used for request:', token, 'for URL:', request.url);
    if (token) {
      const reqWithAuth = this.addToken(request, token);
      console.log('AuthInterceptor: Added Authorization header:', reqWithAuth.headers.get('Authorization'), 'for URL:', reqWithAuth.url);
      request = reqWithAuth;
    } else {
      console.warn('AuthInterceptor: No token available for request to', request.url);
    }

    // Log final headers before sending
    console.log('AuthInterceptor: Final headers for', request.url, request.headers.keys().map(k => `${k}: ${request.headers.get(k)}`));

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Add authorization token to request headers
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Handle 401 unauthorized errors by refreshing token
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If not already refreshing, start refresh
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshSession().pipe(
        switchMap(response => {
          this.isRefreshing = false;
          
          if (response) {
            this.refreshTokenSubject.next(response.accessToken);
            return next.handle(this.addToken(request, response.accessToken));
          }
          
          // If refresh fails, clear session and throw error
          this.authService.clearSession();
          return throwError(() => new Error('Session expired. Please login again.'));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.authService.clearSession();
          return throwError(() => new Error('Session expired. Please login again.'));
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } 
    
    // If already refreshing, wait for new token
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addToken(request, token)))
    );
  }

  /**
   * Check if the URL is an auth-related URL that should skip token handling
   */
  private isAuthUrl(url: string): boolean {
    return (
      url.includes('/api/auth/login') || 
      url.includes('/api/auth/refresh-token') ||
      url.includes('/api/auth/logout')
    );
  }
}

