import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pagesApi, type PublicPage } from '../api/pages.api';

export default function PagesPage() {
  const [pages, setPages] = useState<PublicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pagesApi
      .list()
      .then(setPages)
      .catch(() => setError('Greška pri učitavanju stranica'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-gray-500">
        Učitavanje...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Informacije</h1>

      {pages.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Nema dostupnih stranica.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {pages.map((page) => (
            <Link
              key={page.page_id}
              to={`/stranice/${page.slug}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-100 transition-all group"
            >
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {page.title}
              </h2>
              <p className="text-sm text-blue-600 mt-2 font-medium">Pročitaj više →</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
