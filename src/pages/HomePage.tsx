import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { pagesApi, type PublicPage } from '../api/pages.api';

export default function HomePage() {
  const { user } = useAuth();
  const [pages, setPages] = useState<PublicPage[]>([]);

  useEffect(() => {
    pagesApi.list().then(setPages).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col">
      <HeroSection user={user} />
      <FeaturesSection />
      <HowItWorksSection />
      {pages.length > 0 && <InfoPagesSection pages={pages} />}
      {!user && <CtaSection />}
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────── */

function HeroSection({ user }: { user: { role: string; firstName: string } | null }) {
  return (
    <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white">
      <div className="container mx-auto px-4 py-20 md:py-28 max-w-4xl text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 rounded-full p-4">
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 10c0-1 .6-2 1.5-2.5L12 3l7.5 4.5C20.4 8 21 9 21 10v5a9 9 0 01-9 9 9 9 0 01-9-9v-5z" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
          Rezervišite termin<br className="hidden md:block" />online
        </h1>
        <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-xl mx-auto">
          Brzo, jednostavno i bez čekanja na kasi. Izaberite termin koji vam odgovara i uživajte u plivanju.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin/sessions' : '/sessions'}
              className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              {user.role === 'admin' ? 'Upravljaj terminima' : 'Pregledaj termine'}
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Registrujte se besplatno
              </Link>
              <Link
                to="/login"
                className="bg-blue-800/50 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-800/70 transition-colors border border-white/30"
              >
                Prijavi se
              </Link>
            </>
          )}
        </div>
      </div>
                {/* Wave divider */}
      <div className="overflow-hidden leading-none">
        <svg viewBox="0 0 1440 48" className="block w-full fill-gray-50">
          <path d="M0,32 C360,0 1080,64 1440,32 L1440,48 L0,48 Z" />
        </svg>
      </div>

    </section>
  );
}

/* ── Features ─────────────────────────────────────────────────── */

const features = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Jednostavna rezervacija',
    desc: 'Izaberite slobodan termin i rezervišite ga u samo nekoliko klikova - bez pozivanja, bez čekanja.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Uvid u slobodna mesta',
    desc: 'Vidite u realnom vremenu koliko mesta je preostalo za svaki termin - nema neprijatnih iznenađenja.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Upravljajte rezervacijama',
    desc: 'Sve vaše rezervacije na jednom mestu. Otkazivanje je brzo i besplatno pre početka termina.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Dostupno sa svakog uređaja',
    desc: 'Aplikacija radi podjednako dobro na telefonu, tabletu i računaru - rezervišite gde god da ste.',
  },
];

function FeaturesSection() {
  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-3">
          Zašto PoolBuddy?
        </h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          Sve što vam treba za udobno korišćenje bazena - na jednom mestu.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-800">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────────── */

const steps = [
  {
    n: '1',
    title: 'Kreirajte nalog',
    desc: 'Registracija traje manje od minute. Potrebni su samo vaše ime, email i lozinka.',
  },
  {
    n: '2',
    title: 'Izaberite termin',
    desc: 'Pregledajte dostupne termine, proverite slobodna mesta i kliknite "Rezerviši".',
  },
  {
    n: '3',
    title: 'Uživajte u plivanju',
    desc: 'Dođite u bazen u rezervisano vreme i prepustite se odmoru u vodi.',
  },
];

function HowItWorksSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-3">
          Kako funkcioniše?
        </h2>
        <p className="text-gray-500 text-center mb-12">
          Tri koraka do vaše rezervacije.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center shadow-md">
                {s.n}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Connector lines (desktop only) */}
        <div className="hidden md:flex justify-center items-center gap-0 -mt-[72px] mb-8 pointer-events-none select-none">
          <div className="w-1/3" />
          <div className="flex-1 border-t-2 border-dashed border-blue-200" />
          <div className="w-1/3" />
          <div className="flex-1 border-t-2 border-dashed border-blue-200" />
          <div className="w-1/3" />
        </div>
      </div>
    </section>
  );
}

/* ── Info pages ───────────────────────────────────────────────── */

function InfoPagesSection({ pages }: { pages: PublicPage[] }) {
  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-3">
          Korisne informacije
        </h2>
        <p className="text-gray-500 text-center mb-10">
          Sve što trebate znati pre dolaska u bazen.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pages.map((page) => (
            <Link
              key={page.page_id}
              to={`/stranice/${page.slug}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-blue-100 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-blue-600 group-hover:bg-blue-100 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                  {page.title}
                </p>
              </div>
              <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/stranice" className="text-sm text-blue-600 hover:underline font-medium">
            Sve informacije →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Bottom CTA ───────────────────────────────────────────────── */

function CtaSection() {
  return (
    <section className="bg-blue-700 text-white py-16">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Spremni za plivanje?
        </h2>
        <p className="text-blue-100 mb-8">
          Registrujte se besplatno i rezervišite prvi termin za nekoliko sekundi.
        </p>
        <Link
          to="/register"
          className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
        >
          Kreirajte nalog
        </Link>
      </div>
    </section>
  );
}
