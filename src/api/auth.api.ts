import { authClient } from './client';

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  register: (data: RegisterInput) =>
    authClient
      .post<{ message: string; userId: string }>('/auth/register', data)
      .then((r) => r.data),

  login: (data: LoginInput) =>
    authClient.post<TokenPair>('/auth/login', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    authClient
      .post<TokenPair>('/auth/refresh', { refresh_token: refreshToken })
      .then((r) => r.data),

  logout: (refreshToken: string, accessToken: string) =>
    authClient
      .post('/auth/logout', { refresh_token: refreshToken }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((r) => r.data),
};
