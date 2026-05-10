import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pagesApi, type AdminPage } from '../../api/pages.api';
import { pageFormSchema, type PageFormInput } from '../../schemas/pages.schema';
import { Toast, useToast } from '../../components/ui/Toast';

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; page: AdminPage }
  | { type: 'delete'; page: AdminPage };

function extractMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response;
    return res?.data?.message ?? null;
  }
  return null;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const { toast, showToast, clearToast } = useToast();

  function fetchPages() {
    setLoading(true);
    pagesApi
      .adminList()
      .then(setPages)
      .catch(() => showToast('Greška pri učitavanju stranica', 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchPages(); }, []);

  async function handleDelete(page: AdminPage) {
    try {
      await pagesApi.adminDelete(page.page_id);
      showToast('Stranica je obrisana', 'success');
      setModal({ type: 'none' });
      fetchPages();
    } catch (err) {
      showToast(extractMessage(err) ?? 'Greška pri brisanju', 'error');
    }
  }

  async function handleTogglePublish(page: AdminPage) {
    try {
      await pagesApi.adminUpdate(page.page_id, { is_published: !page.is_published });
      showToast(page.is_published ? 'Stranica je skrivena' : 'Stranica je objavljena', 'success');
      fetchPages();
    } catch (err) {
      showToast(extractMessage(err) ?? 'Greška', 'error');
    }
  }

  const closeModal = () => setModal({ type: 'none' });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upravljanje stranicama</h1>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + Nova stranica
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Učitavanje...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Red</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Naslov</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pages.map((p) => (
                  <tr key={p.page_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 w-16">{p.sort_order}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.title}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.slug}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          p.is_published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {p.is_published ? 'Objavljena' : 'Skrivena'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => setModal({ type: 'edit', page: p })}
                          className="text-xs text-gray-600 hover:underline"
                        >
                          Izmeni
                        </button>
                        <button
                          onClick={() => setModal({ type: 'delete', page: p })}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Obriši
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                      Nema stranica
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal.type === 'create' && (
        <PageFormModal
          title="Nova stranica"
          onClose={closeModal}
          onSaved={() => { closeModal(); fetchPages(); showToast('Stranica je kreirana', 'success'); }}
        />
      )}

      {modal.type === 'edit' && (
        <PageFormModal
          title="Izmena stranice"
          page={modal.page}
          onClose={closeModal}
          onSaved={() => { closeModal(); fetchPages(); showToast('Stranica je izmenjena', 'success'); }}
        />
      )}

      {modal.type === 'delete' && (
        <Modal title="Brisanje stranice" onClose={closeModal}>
          <p className="text-gray-600 mb-6">
            Da li ste sigurni da želite da obrišete stranicu{' '}
            <strong>{modal.page.title}</strong>?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Odustani
            </button>
            <button
              onClick={() => handleDelete(modal.page)}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Obriši
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function PageFormModal({
  title,
  page,
  onClose,
  onSaved,
}: {
  title: string;
  page?: AdminPage;
  onClose: () => void;
  onSaved: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PageFormInput>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: page
      ? {
          title:        page.title,
          slug:         page.slug,
          content:      page.content,
          is_published: page.is_published,
          sort_order:   page.sort_order,
        }
      : {
          content:      '',
          is_published: true,
          sort_order:   0,
        },
  });

  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(data: PageFormInput) {
    setServerError(null);
    try {
      if (page) {
        await pagesApi.adminUpdate(page.page_id, data);
      } else {
        await pagesApi.adminCreate(data);
      }
      onSaved();
    } catch (err) {
      setServerError(
        (err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null) ?? 'Greška pri čuvanju stranice',
      );
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      {serverError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Naslov" error={errors.title?.message}>
          <input type="text" {...register('title')} className={inputCls(!!errors.title)} />
        </Field>

        <Field label="Slug (URL identifikator)" error={errors.slug?.message}>
          <input
            type="text"
            placeholder="npr. o-nama"
            {...register('slug')}
            className={inputCls(!!errors.slug)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Redosled prikaza" error={errors.sort_order?.message}>
            <input
              type="number"
              min={0}
              {...register('sort_order', { valueAsNumber: true })}
              className={inputCls(!!errors.sort_order)}
            />
          </Field>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_published')}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Objavljena</span>
            </label>
          </div>
        </div>

        <Field label="Sadržaj (HTML)" error={errors.content?.message}>
          <textarea
            rows={10}
            {...register('content')}
            className={`${inputCls(!!errors.content)} resize-y font-mono text-xs`}
            placeholder="<p>Tekst stranice...</p>"
          />
        </Field>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Odustani
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Čuvanje...' : 'Sačuvaj'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    hasError ? 'border-red-400' : 'border-gray-300'
  }`;
}
