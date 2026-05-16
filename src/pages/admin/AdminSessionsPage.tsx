import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sessionsApi, type PoolSession, type SessionReservation } from '../../api/sessions.api';
import { sessionFormSchema, type SessionFormInput } from '../../schemas/sessions.schema';
import { Toast, useToast } from '../../components/ui/Toast';

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; session: PoolSession }
  | { type: 'reservations'; session: PoolSession }
  | { type: 'cancel'; session: PoolSession }
  | { type: 'delete'; session: PoolSession };

function formatDate(d: string) {
  return new Date(d.slice(0, 10) + 'T12:00:00').toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatTime(t: string) { return t.slice(0, 5); }

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<PoolSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [reservations, setReservations] = useState<SessionReservation[]>([]);
  const [resLoading, setResLoading] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  function fetchSessions() {
    setLoading(true);
    sessionsApi.adminList()
      .then(setSessions)
      .catch(() => showToast('Greška pri učitavanju termina', 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchSessions(); }, []); 

  async function openReservations(session: PoolSession) {
    setModal({ type: 'reservations', session });
    setResLoading(true);
    try {
      const data = await sessionsApi.adminGetReservations(session.session_id);
      setReservations(data);
    } catch {
      showToast('Greška pri učitavanju rezervacija', 'error');
    } finally {
      setResLoading(false);
    }
  }

  async function handleCancel(session: PoolSession) {
    try {
      await sessionsApi.adminCancel(session.session_id);
      showToast('Termin je otkazan', 'success');
      setModal({ type: 'none' });
      fetchSessions();
    } catch (err) {
      showToast(extractMessage(err) ?? 'Greška pri otkazivanju', 'error');
    }
  }

  async function handleDelete(session: PoolSession) {
    try {
      await sessionsApi.adminDelete(session.session_id);
      showToast('Termin je obrisan', 'success');
      setModal({ type: 'none' });
      fetchSessions();
    } catch (err) {
      showToast(extractMessage(err) ?? 'Greška pri brisanju', 'error');
    }
  }

  const closeModal = () => setModal({ type: 'none' });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upravljanje terminima</h1>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + Novi termin
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Vreme</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kapacitet</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rezervisano</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map((s) => (
                  <tr key={s.session_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{formatDate(s.session_date)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatTime(s.start_time)} – {formatTime(s.end_time)}</td>
                    <td className="px-4 py-3 text-gray-600">{s.capacity}</td>
                    <td className="px-4 py-3 text-gray-600">{s.reserved_count}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${s.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {s.status === 'open' ? 'Otvoren' : 'Otkazan'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openReservations(s)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Rezervacije
                        </button>
                        {s.status === 'open' && (
                          <>
                            <button
                              onClick={() => setModal({ type: 'edit', session: s })}
                              className="text-xs text-gray-600 hover:underline"
                            >
                              Izmeni
                            </button>
                            <button
                              onClick={() => setModal({ type: 'cancel', session: s })}
                              className="text-xs text-orange-600 hover:underline"
                            >
                              Otkaži
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setModal({ type: 'delete', session: s })}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Obriši
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      Nema termina
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create modal */}
      {modal.type === 'create' && (
        <SessionFormModal
          title="Novi termin"
          onClose={closeModal}
          onSaved={() => { closeModal(); fetchSessions(); showToast('Termin je kreiran', 'success'); }}
        />
      )}

      {/* Edit modal */}
      {modal.type === 'edit' && (
        <SessionFormModal
          title="Izmena termina"
          session={modal.session}
          onClose={closeModal}
          onSaved={() => { closeModal(); fetchSessions(); showToast('Termin je izmenjen', 'success'); }}
        />
      )}

      {/* Reservations modal */}
      {modal.type === 'reservations' && (
        <Modal title={`Rezervacije — ${formatDate(modal.session.session_date)}`} onClose={closeModal}>
          {resLoading ? (
            <p className="text-center text-gray-500 py-6">Učitavanje...</p>
          ) : reservations.length === 0 ? (
            <p className="text-center text-gray-400 py-6">Nema rezervacija za ovaj termin</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Korisnik</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Email</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Rezervisano</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reservations.map((r) => (
                    <tr key={r.reservation_id}>
                      <td className="px-3 py-2">{r.first_name} {r.last_name}</td>
                      <td className="px-3 py-2 text-gray-500">{r.email}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {r.status === 'active' ? 'Aktivna' : 'Otkazana'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {new Date(r.reserved_at).toLocaleString('sr-RS')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* Cancel confirmation */}
      {modal.type === 'cancel' && (
        <Modal title="Otkazivanje termina" onClose={closeModal}>
          <p className="text-gray-600 mb-1">
            Da li ste sigurni da želite da otkažete termin{' '}
            <strong>{formatDate(modal.session.session_date)}</strong>{' '}
            {formatTime(modal.session.start_time)}–{formatTime(modal.session.end_time)}?
          </p>
          <p className="text-sm text-orange-600 mb-6">
            Sve aktivne rezervacije za ovaj termin biće automatski otkazane.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
              Odustani
            </button>
            <button
              onClick={() => handleCancel(modal.session)}
              className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700"
            >
              Otkaži termin
            </button>
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}
      {modal.type === 'delete' && (
        <Modal title="Brisanje termina" onClose={closeModal}>
          <p className="text-gray-600 mb-1">
            Da li ste sigurni da želite da obrišete termin{' '}
            <strong>{formatDate(modal.session.session_date)}</strong>?
          </p>
          {modal.session.reserved_count > 0 && (
            <p className="text-sm text-red-600 mb-4">
              Termin ima {modal.session.reserved_count} aktivnih rezervacija i ne može biti obrisan. Najpre ga otkažite.
            </p>
          )}
          <div className="flex gap-3 justify-end">
            <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
              Odustani
            </button>
            <button
              onClick={() => handleDelete(modal.session)}
              disabled={modal.session.reserved_count > 0}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
            >
              Obriši
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function SessionFormModal({
  title,
  session,
  onClose,
  onSaved,
}: {
  title: string;
  session?: PoolSession;
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);
  const isCreate = !session;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormInput>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: session
      ? {
          session_date: session.session_date.slice(0, 10),
          start_time: session.start_time.slice(0, 5),
          end_time: session.end_time.slice(0, 5),
          capacity: session.capacity,
        }
      : undefined,
  });

  const selectedDate = watch('session_date');
  const minTime = isCreate && selectedDate === today ? nowTime : undefined;

  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(data: SessionFormInput) {
    setServerError(null);
    try {
      if (session) {
        await sessionsApi.adminUpdate(session.session_id, data);
      } else {
        await sessionsApi.adminCreate(data);
      }
      onSaved();
    } catch (err) {
      setServerError(extractMessage(err) ?? 'Greška pri čuvanju termina');
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
        <Field label="Datum" error={errors.session_date?.message}>
          <input type="date" {...register('session_date')} min={isCreate ? today : undefined} className={inputCls(!!errors.session_date)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Početak" error={errors.start_time?.message}>
            <input type="time" {...register('start_time')} min={minTime} className={inputCls(!!errors.start_time)} />
          </Field>
          <Field label="Kraj" error={errors.end_time?.message}>
            <input type="time" {...register('end_time')} className={inputCls(!!errors.end_time)} />
          </Field>
        </div>
        <Field label="Kapacitet" error={errors.capacity?.message}>
          <input type="number" min={1} {...register('capacity')} className={inputCls(!!errors.capacity)} />
        </Field>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
            Odustani
          </button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
            {isSubmitting ? 'Čuvanje...' : 'Sačuvaj'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-400' : 'border-gray-300'}`;
}

function extractMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response;
    return res?.data?.message ?? null;
  }
  return null;
}
