import { useEffect, useState } from 'react';
import { sessionsApi, type PoolSession } from '../api/sessions.api';
import { SessionCard } from '../components/sessions/SessionCard';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<PoolSession[]>([]);
  const [filtered, setFiltered] = useState<PoolSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  function fetchSessions() {
    setLoading(true);
    sessionsApi
      .list()
      .then((data) => {
        setSessions(data);
      })
      .catch(() => setError('Greška pri učitavanju termina'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    let result = sessions;
    if (dateFrom) result = result.filter((s) => s.session_date >= dateFrom);
    if (dateTo) result = result.filter((s) => s.session_date <= dateTo);
    setFiltered(result);
  }, [sessions, dateFrom, dateTo]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Slobodni termini</h1>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Od datuma</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Do datuma</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Poništi filter
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center text-gray-500 py-12">Učitavanje termina...</div>
      )}

      {error && (
        <div className="text-center text-red-600 bg-red-50 rounded-xl py-8">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center text-gray-500 bg-white rounded-2xl shadow-sm py-12">
          Nema dostupnih termina za odabrani period.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((session) => (
          <SessionCard key={session.session_id} session={session} onReserved={fetchSessions} />
        ))}
      </div>
    </main>
  );
}
