import { apiClient } from './client';

export interface MyReservation {
  reservation_id: string;
  session_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: 'active' | 'cancelled_by_user' | 'cancelled_by_admin';
  reserved_at: string;
  cancelled_at: string | null;
}

export const reservationsApi = {
  create: (sessionId: string) =>
    apiClient.post<{ reservation_id: string }>('/reservations', { session_id: sessionId }).then((r) => r.data),

  listMine: () => apiClient.get<MyReservation[]>('/reservations/me').then((r) => r.data),

  cancel: (reservationId: string) => apiClient.delete(`/reservations/${reservationId}`),
};
