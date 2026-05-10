import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  }

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-xl font-bold flex items-center gap-2 hover:text-blue-100 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 10c0-1 .6-2 1.5-2.5L12 3l7.5 4.5C20.4 8 21 9 21 10v5a9 9 0 01-9 9 9 9 0 01-9-9v-5z" />
            </svg>
            PoolBuddy
          </Link>

          <button
            className="md:hidden p-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Otvori navigaciju"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/stranice" className="hover:text-blue-100 transition-colors text-sm">
              Informacije
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/sessions" className="hover:text-blue-100 transition-colors text-sm">
                      Termini
                    </Link>
                    <Link to="/admin/pages" className="hover:text-blue-100 transition-colors text-sm">
                      Stranice
                    </Link>
                  </>
                )}
                {user.role === 'user' && (
                  <>
                    <Link to="/sessions" className="hover:text-blue-100 transition-colors text-sm">
                      Termini
                    </Link>
                    <Link to="/my-reservations" className="hover:text-blue-100 transition-colors text-sm">
                      Moje rezervacije
                    </Link>
                  </>
                )}
                <Link to="/profile" className="text-sm text-blue-100 hover:text-white transition-colors">
                  {user.firstName} {user.lastName}
                </Link>
                {user.role === 'admin' && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-white text-blue-600 px-4 py-1.5 rounded-md font-medium hover:bg-blue-50 transition-colors text-sm"
                >
                  Odjavi se
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-100 transition-colors">
                  Prijava
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-4 py-1.5 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Registracija
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-blue-500 space-y-2">
            <Link
              to="/stranice"
              className="block py-2 hover:text-blue-100 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Informacije
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 text-sm text-blue-200 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {user.firstName} {user.lastName}
                </Link>
                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/sessions"
                      className="block py-2 hover:text-blue-100 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Termini
                    </Link>
                    <Link
                      to="/admin/pages"
                      className="block py-2 hover:text-blue-100 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Stranice
                    </Link>
                  </>
                )}
                {user.role === 'user' && (
                  <>
                    <Link
                      to="/sessions"
                      className="block py-2 hover:text-blue-100 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Termini
                    </Link>
                    <Link
                      to="/my-reservations"
                      className="block py-2 hover:text-blue-100 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Moje rezervacije
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 hover:text-blue-100 transition-colors"
                >
                  Odjavi se
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 hover:text-blue-100 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Prijava
                </Link>
                <Link
                  to="/register"
                  className="block py-2 hover:text-blue-100 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Registracija
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
