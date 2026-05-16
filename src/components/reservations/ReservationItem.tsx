import { useState } from 'react';
import { reservationsApi, type MyReservation } from '../../api/reservations.api';

interface ReservationItemProps {
  reservation: MyReservation;
  onCancelled: () => void;
}

function formatDate(d: string) {
  return new Date(d.slice(0, 10) + 'T12:00:00').toLocaleDateString('sr-RS', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

function isPast(dateStr: string, endTime: string): boolean {
  return new Date(`${dateStr.slice(0, 10)}T${endTime}`) < new Date();
}

const STATUS_LABEL: Record<MyReservation['status'], string> = {
  active: 'Aktivna',
  cancelled_by_user: 'Otkazana (vi)',
  cancelled_by_admin: 'Otkazana (admin)',
};

const STATUS_STYLE: Record<MyReservation['status'], string> = {
  active: 'bg-green-100 text-green-700',
  cancelled_by_user: 'bg-gray-100 text-gray-500',
  cancelled_by_admin: 'bg-orange-100 text-orange-700',
};

const PAST_ACTIVE_STYLE = 'bg-blue-100 text-blue-700';

export function ReservationItem({ reservation: r, onCancelled }: ReservationItemProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const past = isPast(r.session_date, r.end_time);
  const canCancel = r.status === 'active' && !past;
  const isCancelled = r.status !== 'active';

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      await reservationsApi.cancel(r.reservation_id);
      onCancelled();
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        setError(res?.data?.message ?? 'Greška pri otkazivanju');
      } else {
        setError('Greška pri otkazivanju');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col gap-3 transition-opacity ${isCancelled ? 'opacity-60 border-gray-200' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
            {past ? 'Prošli termin' : 'Predstojeći termin'}
          </p>
          <p className="text-lg font-bold text-gray-800 capitalize">
            {formatDate(r.session_date)}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatTime(r.start_time)} – {formatTime(r.end_time)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.status === 'active' && past ? PAST_ACTIVE_STYLE : STATUS_STYLE[r.status]}`}>
            {isCancelled && <span className="mr-1">✕</span>}
            {r.status === 'active' && past ? 'Završen' : STATUS_LABEL[r.status]}
          </span>
          {r.status === 'cancelled_by_admin' && (
            <span className="text-xs text-orange-600">Otkazao administrator</span>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={loading}
          className="self-start rounded-lg border border-red-300 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Otkazivanje...' : 'Otkaži rezervaciju'}
        </button>
      )}
    </div>
  );
}
