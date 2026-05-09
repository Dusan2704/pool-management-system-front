import { useState } from 'react';
import type { PoolSession } from '../../api/sessions.api';
import { reservationsApi } from '../../api/reservations.api';

interface SessionCardProps {
  session: PoolSession;
  onReserved: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('sr-RS', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

export function SessionCard({ session, onReserved }: SessionCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleReserve() {
    setLoading(true);
    setError(null);
    try {
      await reservationsApi.create(session.session_id);
      setSuccess(true);
      onReserved();
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        setError(res?.data?.message ?? 'Greška pri rezervaciji');
      } else {
        setError('Greška pri rezervaciji');
      }
    } finally {
      setLoading(false);
    }
  }

  const freePercent = Math.round((session.free_spots / session.capacity) * 100);
  const capacityColor =
    freePercent > 50 ? 'bg-green-500' : freePercent > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-gray-500 capitalize">{formatDate(session.session_date)}</p>
          <p className="text-xl font-bold text-gray-800 mt-0.5">
            {formatTime(session.start_time)} – {formatTime(session.end_time)}
          </p>
        </div>
        <span className="shrink-0 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          Otvoreno
        </span>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Slobodna mesta</span>
          <span className="font-medium text-gray-700">
            {session.free_spots} / {session.capacity}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${capacityColor}`}
            style={{ width: `${freePercent}%` }}
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      {success ? (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 font-medium text-center">
          Rezervacija uspešna!
        </p>
      ) : (
        <button
          onClick={handleReserve}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Rezervisanje...' : 'Rezerviši'}
        </button>
      )}
    </div>
  );
}
