import { useEffect, useState } from 'react';
import { reservationsApi, type MyReservation } from '../api/reservations.api';
import { ReservationItem } from '../components/reservations/ReservationItem';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<MyReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function fetchReservations() {
    setLoading(true);
    reservationsApi
      .listMine()
      .then(setReservations)
      .catch(() => setError('Greška pri učitavanju rezervacija'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchReservations();
  }, []);

  function isSessionPast(r: MyReservation) {
    return new Date(`${r.session_date.slice(0, 10)}T${r.end_time}`) < new Date();
  }

  const upcoming  = reservations.filter((r) => r.status === 'active' && !isSessionPast(r));
  const completed = reservations.filter((r) => r.status === 'active' && isSessionPast(r));
  const cancelled = reservations.filter((r) => r.status !== 'active');

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Moje rezervacije</h1>

      {loading && (
        <div className="text-center text-gray-500 py-12">Učitavanje...</div>
      )}

      {error && (
        <div className="text-center text-red-600 bg-red-50 rounded-xl py-8">{error}</div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="text-center text-gray-500 bg-white rounded-2xl shadow-sm py-12">
          Nemate nijednu rezervaciju.
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Predstojeće rezervacije
          </h2>
          <div className="flex flex-col gap-3">
            {upcoming.map((r) => (
              <ReservationItem key={r.reservation_id} reservation={r} onCancelled={fetchReservations} />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Prošli termini
          </h2>
          <div className="flex flex-col gap-3">
            {completed.map((r) => (
              <ReservationItem key={r.reservation_id} reservation={r} onCancelled={fetchReservations} />
            ))}
          </div>
        </section>
      )}

      {cancelled.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Otkazane rezervacije
          </h2>
          <div className="flex flex-col gap-3">
            {cancelled.map((r) => (
              <ReservationItem key={r.reservation_id} reservation={r} onCancelled={fetchReservations} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
