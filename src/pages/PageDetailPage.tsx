import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pagesApi, type PublicPage } from '../api/pages.api';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function PageDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PublicPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    pagesApi
      .get(slug)
      .then(setPage)
      .catch(() => setError('Stranica nije pronađena'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-gray-500">
        Učitavanje...
      </div>
    );
  }

  if (error || !page) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <p className="text-red-600 mb-4">{error ?? 'Stranica nije pronađena'}</p>
        <Link to="/stranice" className="text-blue-600 hover:underline text-sm">
          ← Nazad na informacije
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <Link
        to="/stranice"
        className="inline-block text-sm text-blue-600 hover:underline mb-6"
      >
        ← Nazad na informacije
      </Link>

      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{page.title}</h1>
        {page.updated_at && (
          <p className="text-xs text-gray-400 mb-6">
            Poslednja izmena: {formatDate(page.updated_at)}
          </p>
        )}
        <div
          className="prose prose-sm max-w-none text-gray-700
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-3 [&_h2]:mt-5
            [&_p]:mb-3 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1
            [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
            [&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:font-semibold [&_th]:border [&_th]:border-gray-200
            [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-gray-200
            [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </main>
  );
}
