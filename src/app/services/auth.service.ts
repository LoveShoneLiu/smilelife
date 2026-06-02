import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthSession, User } from '../models/user.model';

interface LoginCredentials {
  account: string;
  password: string;
}

interface AuthState {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
}

interface LoginApiUser {
  id: number | string;
  email: string | null;
  phone: string | null;
  displayName?: string | null;
  display_name?: string | null;
  role?: User['role'] | null;
}

interface LoginApiResponse {
  success: boolean;
  user?: LoginApiUser;
  accessToken?: string;
  token?: string;
  message?: string;
}

const STORAGE_KEY = 'smilelife.auth.session';
const LOGIN_ENDPOINT = `${environment.apiBaseUrl}/api/auth/smilelife/login`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // Signals keep the current auth snapshot synchronous for guards and templates.
  private readonly state = signal<AuthState>({
    session: this.readStoredSession(),
    loading: false,
    error: null,
  });

  readonly session = computed(() => this.state().session);
  readonly user = computed(() => this.state().session?.user ?? null);
  readonly isAuthenticated = computed(() => Boolean(this.state().session?.accessToken));
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const account = credentials.account.trim();
    const password = credentials.password;

    this.state.update((state) => ({ ...state, loading: true, error: null }));

    if (!account || !password) {
      return this.failLogin('Enter your account and password');
    }

    let response: LoginApiResponse;

    try {
      response = await firstValueFrom(
        this.http.post<LoginApiResponse>(LOGIN_ENDPOINT, { account, password }),
      );
    } catch {
      return this.failLogin('Unable to sign in. Please check the API service and try again.');
    }

    if (!response.success || !response.user) {
      return this.failLogin(response.message ?? 'The account or password is incorrect');
    }

    const session: AuthSession = {
      accessToken: response.accessToken ?? response.token ?? 'local-dev-session',
      user: this.mapApiUser(response.user, account),
    };

    // Persist only the session token and user profile; never store passwords locally.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.state.set({ session, loading: false, error: null });

    return session;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state.set({ session: null, loading: false, error: null });
  }

  clearError(): void {
    this.state.update((state) => ({ ...state, error: null }));
  }

  private failLogin(message: string): never {
    this.state.update((state) => ({ ...state, loading: false, error: message }));
    throw new Error(message);
  }

  private mapApiUser(apiUser: LoginApiUser, account: string): User {
    const displayName = apiUser.displayName ?? apiUser.display_name;
    const fallbackName = apiUser.email ?? apiUser.phone ?? account;

    return {
      id: String(apiUser.id),
      name: displayName ?? fallbackName,
      account,
      email: apiUser.email,
      phone: apiUser.phone,
      role: apiUser.role ?? 'field_worker',
    };
  }

  private readStoredSession(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      // Drop malformed session data instead of blocking app startup.
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
