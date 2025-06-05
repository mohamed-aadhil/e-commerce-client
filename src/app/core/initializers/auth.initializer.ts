import { APP_INITIALIZER } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Factory function that returns a function which initializes the auth state
 * by attempting to refresh the access token on application startup
 */
export function initializeAuth(authService: AuthService) {
  return async () => {
    try {
      await authService.refreshSession().toPromise();
      return true;
    } catch {
      return false;
    }
  };
}

/**
 * Provider for the auth initializer
 */
export const authInitializerProvider = {
  provide: APP_INITIALIZER,
  useFactory: initializeAuth,
  deps: [AuthService],
  multi: true
};

