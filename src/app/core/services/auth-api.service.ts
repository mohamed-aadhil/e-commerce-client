import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly API_LOGIN = '/api/auth/login';
  private readonly API_LOGOUT = '/api/auth/logout';
  private readonly API_REFRESH = '/api/auth/refresh-token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ accessToken: string; email: string; name: string; role: string }> {
    return this.http.post<{ accessToken: string; email: string; name: string; role: string }>(this.API_LOGIN, { email, password });
  }

  logout(): Observable<any> {
    return this.http.post(this.API_LOGOUT, {});
  }

  refreshSession(): Observable<{ accessToken: string; email: string; name: string; role: string }> {
    return this.http.post<{ accessToken: string; email: string; name: string; role: string }>(this.API_REFRESH, {});
  }

  signup(name: string, email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/signup', { name, email, password });
  }
} 