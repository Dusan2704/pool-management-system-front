import { apiClient } from './client';

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterInput) =>
    apiClient
      .post<{ message: string; userId: string }>('/auth/register', data)
      .then((r) => r.data),
};
