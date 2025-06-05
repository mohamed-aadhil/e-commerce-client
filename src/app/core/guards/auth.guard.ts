import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function authGuard(roles?: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }
    if (roles && roles.length > 0) {
      const userRole = authService.getUserRole();
      if (!userRole || !roles.includes(userRole)) {
        router.navigate(['/login']); // or a /forbidden page
        return false;
      }
    }
    return true;
  };
} 