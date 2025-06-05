import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(roles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }
    const userRole = authService.getUserRole();
    if (!userRole || !roles.includes(userRole)) {
      router.navigate(['/login']); // or a /forbidden page
      return false;
    }
    return true;
  };
} 