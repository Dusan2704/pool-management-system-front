import { apiClient } from './client';

export interface PoolSession {
  session_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  status: 'open' | 'cancelled';
  created_by: string;
  created_at: string;
  reserved_count: number;
  free_spots: number;
}

export interface SessionReservation {
  reservation_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  reserved_at: string;
  cancelled_at: string | null;
}

export interface CreateSessionInput {
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
}

export const sessionsApi = {
  list: () => apiClient.get<PoolSession[]>('/sessions').then((r) => r.data),

  getById: (id: string) => apiClient.get<PoolSession>(`/sessions/${id}`).then((r) => r.data),

  adminList: () => apiClient.get<PoolSession[]>('/admin/sessions').then((r) => r.data),

  adminCreate: (data: CreateSessionInput) =>
    apiClient.post<PoolSession>('/admin/sessions', data).then((r) => r.data),

  adminUpdate: (id: string, data: Partial<CreateSessionInput>) =>
    apiClient.patch<PoolSession>(`/admin/sessions/${id}`, data).then((r) => r.data),

  adminDelete: (id: string) => apiClient.delete(`/admin/sessions/${id}`),

  adminCancel: (id: string) =>
    apiClient.post<PoolSession>(`/admin/sessions/${id}/cancel`).then((r) => r.data),

  adminGetReservations: (id: string) =>
    apiClient.get<SessionReservation[]>(`/admin/sessions/${id}/reservations`).then((r) => r.data),
};
