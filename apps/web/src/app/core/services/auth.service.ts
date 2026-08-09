import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, UserRole, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = 'http://localhost:3000/auth';

  // Signals para gerenciamento reativo do estado da sessão
  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly token = signal<string | null>(localStorage.getItem('nexus_token'));

  // Signals computados
  readonly isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  readonly isGamer = computed(() => this.currentUser()?.role === UserRole.GAMER);

  constructor() {
    // Se houver token armazenado, buscar perfil atualizado
    if (this.token() && !this.currentUser()) {
      this.loadProfile().subscribe();
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  register(credentials: { email: string; username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, credentials).pipe(
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  loadProfile(): Observable<User | null> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        localStorage.setItem('nexus_user', JSON.stringify(user));
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_refresh_token');
    localStorage.removeItem('nexus_user');
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(response: AuthResponse) {
    this.token.set(response.accessToken);
    this.currentUser.set(response.user);

    localStorage.setItem('nexus_token', response.accessToken);
    localStorage.setItem('nexus_refresh_token', response.refreshToken);
    localStorage.setItem('nexus_user', JSON.stringify(response.user));
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem('nexus_user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
}
