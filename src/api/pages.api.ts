import { apiClient } from './client';

export interface PublicPage {
  page_id: string;
  slug: string;
  title: string;
  content: string;
  sort_order: number;
  updated_at: string | null;
}

export interface AdminPage extends PublicPage {
  is_published: boolean;
  updated_by: string | null;
  created_at: string;
}

export const pagesApi = {
  list: () =>
    apiClient.get<PublicPage[]>('/pages').then((r) => r.data),

  get: (slug: string) =>
    apiClient.get<PublicPage>(`/pages/${slug}`).then((r) => r.data),

  adminList: () =>
    apiClient.get<AdminPage[]>('/admin/pages').then((r) => r.data),

  adminCreate: (data: {
    slug: string;
    title: string;
    content?: string;
    is_published?: boolean;
    sort_order?: number;
  }) =>
    apiClient.post<{ page_id: string }>('/admin/pages', data).then((r) => r.data),

  adminUpdate: (
    id: string,
    data: Partial<{
      slug: string;
      title: string;
      content: string;
      is_published: boolean;
      sort_order: number;
    }>,
  ) =>
    apiClient.patch(`/admin/pages/${id}`, data).then((r) => r.data),

  adminDelete: (id: string) =>
    apiClient.delete(`/admin/pages/${id}`).then((r) => r.data),
};
