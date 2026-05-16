import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usersApi, type UserProfile } from '../api/users.api';
import { updateContactSchema, changePasswordSchema, type UpdateContactInput, type ChangePasswordInput } from '../schemas/users.schema';
import { Toast, useToast } from '../components/ui/Toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, clearToast } = useToast();

  const contactForm = useForm<UpdateContactInput>({
    resolver: zodResolver(updateContactSchema),
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    usersApi
      .getMe()
      .then((p) => {
        setProfile(p);
        contactForm.reset({ phone: p.phone, email: p.email });
      })
      .catch(() => showToast('Greška pri učitavanju profila', 'error'))
      .finally(() => setLoading(false));
  
  }, []);

  async function onContactSubmit(data: UpdateContactInput) {
    try {
      const updated = await usersApi.patchMe(data);
      setProfile(updated);
      showToast('Kontakt podaci su uspešno ažurirani', 'success');
    } catch (err) {
      const msg = extractMessage(err) ?? 'Greška pri ažuriranju podataka';
      showToast(msg, 'error');
    }
  }

  async function onPasswordSubmit(data: ChangePasswordInput) {
    try {
      await usersApi.patchMe({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      passwordForm.reset();
      showToast('Lozinka je uspešno promenjena', 'success');
    } catch (err) {
      const msg = extractMessage(err) ?? 'Greška pri promeni lozinke';
      showToast(msg, 'error');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <span className="text-gray-500">Učitavanje...</span>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <h1 className="text-2xl font-bold text-gray-800 mb-8">Moj profil</h1>

      {/* Prikaz podataka */}
      {profile && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Podaci naloga</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <dt className="text-gray-500">Ime</dt>
            <dd className="text-gray-800 font-medium">{profile.first_name}</dd>
            <dt className="text-gray-500">Prezime</dt>
            <dd className="text-gray-800 font-medium">{profile.last_name}</dd>
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-800 font-medium">{profile.email}</dd>
            <dt className="text-gray-500">Telefon</dt>
            <dd className="text-gray-800 font-medium">{profile.phone}</dd>
            <dt className="text-gray-500">Uloga</dt>
             <dd className="text-gray-800 font-medium">{profile.role === 'admin' ? 'Administrator' : 'Korisnik'}</dd>
            {/* <dd>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${profile.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                {profile.role === 'admin' ? 'Administrator' : 'Korisnik'}
              </span>
            </dd> */}
            <dt className="text-gray-500">Nalog kreiran</dt>
            <dd className="text-gray-800 font-medium">{new Date(profile.created_at).toLocaleDateString('sr-RS')}</dd>
          </dl>
        </div>
      )}

      {/* Forma za kontakt podatke */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Izmena kontakt podataka</h2>
        <form onSubmit={contactForm.handleSubmit(onContactSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email adresa
            </label>
            <input
              id="email"
              type="email"
              {...contactForm.register('email')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${contactForm.formState.errors.email ? 'border-red-400' : 'border-gray-300'}`}
            />
            {contactForm.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600">{contactForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Broj telefona
            </label>
            <input
              id="phone"
              type="tel"
              {...contactForm.register('phone')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${contactForm.formState.errors.phone ? 'border-red-400' : 'border-gray-300'}`}
            />
            {contactForm.formState.errors.phone && (
              <p className="mt-1 text-xs text-red-600">{contactForm.formState.errors.phone.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={contactForm.formState.isSubmitting}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {contactForm.formState.isSubmitting ? 'Čuvanje...' : 'Sačuvaj promene'}
          </button>
        </form>
      </div>

      {/* Forma za promenu lozinke */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Promena lozinke</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
              Trenutna lozinka
            </label>
            <input
              id="current_password"
              type="password"
              autoComplete="current-password"
              {...passwordForm.register('current_password')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordForm.formState.errors.current_password ? 'border-red-400' : 'border-gray-300'}`}
            />
            {passwordForm.formState.errors.current_password && (
              <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.current_password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
              Nova lozinka
            </label>
            <input
              id="new_password"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register('new_password')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordForm.formState.errors.new_password ? 'border-red-400' : 'border-gray-300'}`}
            />
            {passwordForm.formState.errors.new_password && (
              <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.new_password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
              Potvrda nove lozinke
            </label>
            <input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register('confirm_password')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordForm.formState.errors.confirm_password ? 'border-red-400' : 'border-gray-300'}`}
            />
            {passwordForm.formState.errors.confirm_password && (
              <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.confirm_password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className="rounded-lg bg-gray-800 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60 transition-colors"
          >
            {passwordForm.formState.isSubmitting ? 'Menjanje...' : 'Promeni lozinku'}
          </button>
        </form>
      </div>
    </main>
  );
}

function extractMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response;
    return res?.data?.message ?? null;
  }
  return null;
}
