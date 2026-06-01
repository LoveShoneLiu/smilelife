// Auth models mirror the shape expected from POST /api/auth/login.
export interface User {
  id: string;
  name: string;
  account: string;
  email: string;
  phone: string;
  role: 'field_worker' | 'admin';
}

export interface AuthSession {
  accessToken: string;
  user: User;
}
