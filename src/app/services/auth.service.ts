import { Injectable, computed, signal } from '@angular/core';

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

const STORAGE_KEY = 'smilelife.auth.session';

// Temporary field-worker account used until the Next.js authentication API is connected.
const MOCK_USER: User = {
  id: 'user_001',
  name: 'Alex Chen',
  account: 'alex@smilelife.co.nz',
  email: 'alex@smilelife.co.nz',
  phone: '+64 21 000 0001',
  role: 'field_worker',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
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
    await this.delay(500);

    if (!account || !password) {
      return this.failLogin('Enter your account and password');
    }

    if (!this.isMockCredential(account, password)) {
      return this.failLogin('The account or password is incorrect');
    }

    const session: AuthSession = {
      accessToken: 'mock-access-token-smilelife',
      user: { ...MOCK_USER, account },
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

  // Keep mock credentials explicit so replacing this with POST /api/auth/login is straightforward.
  private isMockCredential(account: string, password: string): boolean {
    return ['alex@smilelife.co.nz', 'field@smilelife.co.nz', '0210000001'].includes(account)
      && password === 'Smile123';
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

  // Simulates network latency so loading states can be verified before the real API exists.
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
