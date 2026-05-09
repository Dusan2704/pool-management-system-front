import { apiClient } from './client';

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  is_active: number;
  created_at: string;
}

export interface UpdateProfileInput {
  phone?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}

export const usersApi = {
  getMe: () => apiClient.get<UserProfile>('/users/me').then((r) => r.data),

  patchMe: (data: UpdateProfileInput) =>
    apiClient.patch<UserProfile>('/users/me', data).then((r) => r.data),

  adminListUsers: () => apiClient.get<UserProfile[]>('/admin/users').then((r) => r.data),

  adminToggleActive: (userId: string) =>
    apiClient.patch<UserProfile>(`/admin/users/${userId}`).then((r) => r.data),
};
