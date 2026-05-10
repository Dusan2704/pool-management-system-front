import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { RegisterPage } from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SessionsPage from './pages/SessionsPage';
import AdminSessionsPage from './pages/admin/AdminSessionsPage';
import MyReservationsPage from './pages/MyReservationsPage';
import PagesPage from './pages/PagesPage';
import PageDetailPage from './pages/PageDetailPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AdminRoute } from './auth/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-3xl font-bold text-blue-600">
                      Dobrodosli na aplikaciju PoolBuddy
                    </h1>
                  </div>
                }
              />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
              <Route path="/admin/sessions" element={<AdminRoute><AdminSessionsPage /></AdminRoute>} />
              <Route path="/my-reservations" element={<ProtectedRoute><MyReservationsPage /></ProtectedRoute>} />
              <Route path="/stranice" element={<PagesPage />} />
              <Route path="/stranice/:slug" element={<PageDetailPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
