import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { AddBookComponent } from './components/add-book/add-book.component';

import { AuthService } from './core/services/auth.service';
import { authInitializerProvider } from './core/initializers/auth.initializer';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { inject } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'customer-dashboard', pathMatch: 'full' },
      { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
      { path: 'signup', loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent) },
      { path: 'admin-dashboard', loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [roleGuard(['Admin'])] },
      { path: 'add-book', loadComponent: () => import('./components/add-book/add-book.component').then(m => m.AddBookComponent), canActivate: [roleGuard(['Admin'])] },
      { path: 'customer-dashboard', loadComponent: () => import('./components/customer-dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent) },
      { path: '**', redirectTo: 'customer-dashboard' }
    ]),
    // HTTP client configuration
    provideHttpClient(
      withInterceptors([
        (request, next) => inject(AuthInterceptor).intercept(request, { handle: next })
      ]),
    ),

    // Authentication configuration
    AuthService,

    // Auth initializer - attempts to refresh token on startup
    authInitializerProvider,

    AuthInterceptor
  ]
};
