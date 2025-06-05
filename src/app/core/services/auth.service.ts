import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, shareReplay, switchMap, take, tap, throwError, timer } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

// Remove UserRole and VALID_ROLES
// interface JwtPayload without role
interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  email: string;
  name: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private accessToken: string | null = null;
  private tokenExpiryTime: number | null = null;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userEmailSubject = new BehaviorSubject<string | null>(null);
  private userNameSubject = new BehaviorSubject<string | null>(null);
  private userRoleSubject = new BehaviorSubject<string | null>(null);
  private refreshingToken = false;

  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  readonly email$ = this.userEmailSubject.asObservable();
  readonly name$ = this.userNameSubject.asObservable();
  readonly role$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) {
    this.setupTokenExpirationTimer();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const loginData = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).pipe(
      tap(response => {
        if (!response || !response.accessToken) {
          throw new Error('No access token received');
        }
        this.setToken(response.accessToken);
      }),
      catchError(error => {
        return throwError(() => ({
          message: this.getErrorMessage(error),
          status: error.status,
          statusText: error.statusText,
          error: error.error
        }));
      }),
      shareReplay(1)
    );
  }

  signup(name: string, email: string, password: string): Observable<any> {
    const signupData = { name, email, password };
    return this.http.post(`${this.apiUrl}/register`, signupData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).pipe(
      catchError(error => {
        return throwError(() => ({
          message: this.getErrorMessage(error),
          status: error.status,
          statusText: error.statusText,
          error: error.error
        }));
      }),
      shareReplay(1)
    );
  }

  refreshSession(): Observable<AuthResponse | null> {
    if (this.refreshingToken) {
      return of(null);
    }
    this.refreshingToken = true;
    return this.http.get<AuthResponse>(`${this.apiUrl}/refresh-token`, {
      withCredentials: true,
      headers: { 'X-CSRF-Protection': 'true' }
    }).pipe(
      tap(response => {
        this.setToken(response.accessToken);
      }),
      catchError(error => {
        this.clearSession();
        return of(null);
      }),
      tap({ finalize: () => { this.refreshingToken = false; } }),
      shareReplay(1)
    );
  }

  private setToken(token: string): void {
    if (!token) {
      this.clearSession();
      return;
    }
    try {
      this.accessToken = token;
      const decoded = jwtDecode<JwtPayload>(token);
      this.userEmailSubject.next(decoded.email);
      this.userNameSubject.next(decoded.name);
      this.userRoleSubject.next(decoded.role);
      if (decoded.exp) {
        this.tokenExpiryTime = decoded.exp * 1000;
      } else {
        this.tokenExpiryTime = null;
      }
      this.isAuthenticatedSubject.next(true);
      this.setupTokenExpirationTimer();
    } catch (error) {
      this.clearSession();
    }
  }

  private setupTokenExpirationTimer(): void {
    if (!this.tokenExpiryTime) return;
    const now = Date.now();
    const timeUntilExpiry = this.tokenExpiryTime - now;
    const refreshBuffer = 30 * 1000;
    const refreshTime = Math.max(0, timeUntilExpiry - refreshBuffer);
    if (refreshTime < 10000) {
      this.refreshSession().subscribe();
      return;
    }
    timer(refreshTime)
      .pipe(
        take(1),
        switchMap(() => this.refreshSession())
      )
      .subscribe();
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Unable to connect to the server. Please check your internet connection.';
      }
      const serverError = error.error?.message || error.message || 'Unknown server error';
      return `Server error: ${serverError}`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred';
  }

  clearSession(): void {
    this.accessToken = null;
    this.tokenExpiryTime = null;
    this.userEmailSubject.next(null);
    this.userNameSubject.next(null);
    this.userRoleSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe();
  }

  getToken(): string | null {
    return this.accessToken;
  }

  getUserEmail(): string | null {
    return this.userEmailSubject.value;
  }

  getUserName(): string | null {
    return this.userNameSubject.value;
  }

  getUserRole(): string | null {
    return this.userRoleSubject.value;
  }

  isAuthenticated(): boolean {
    if (!this.accessToken || !this.tokenExpiryTime) {
      return false;
    }
    const now = Date.now();
    return now < this.tokenExpiryTime;
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.accessToken = null;
        this.tokenExpiryTime = null;
        this.userEmailSubject.next(null);
        this.userNameSubject.next(null);
        this.userRoleSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }),
      catchError(() => {
        this.accessToken = null;
        this.tokenExpiryTime = null;
        this.userEmailSubject.next(null);
        this.userNameSubject.next(null);
        this.userRoleSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        return of(void 0);
      })
    );
  }
}
