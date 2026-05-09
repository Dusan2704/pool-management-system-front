import { Link } from 'react-router-dom'
import { useState } from 'react'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold flex items-center gap-2 hover:text-blue-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Bazeni
          </Link>

          <button
            className="md:hidden p-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Otvori navigaciju"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="hover:text-blue-100 transition-colors">Prijava</Link>
            <Link to="/register" className="bg-white text-blue-600 px-4 py-1.5 rounded-md font-medium hover:bg-blue-50 transition-colors">
              Registracija
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-3 border-t border-blue-500 space-y-2">
            <Link to="/login" className="block py-2 hover:text-blue-100 transition-colors" onClick={() => setMenuOpen(false)}>Prijava</Link>
            <Link to="/register" className="block py-2 hover:text-blue-100 transition-colors" onClick={() => setMenuOpen(false)}>Registracija</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
