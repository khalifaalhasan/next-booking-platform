import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Proteksi: Cek apakah user sudah login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Ambil role user (Opsional, buat sidebar admin vs user nanti)
  // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Sederhana */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-600">My Dashboard</h2>
          <p className="text-sm text-gray-500 truncate mt-1">{user.email}</p>
        </div>
        <nav className="p-4 space-y-2">
          <Link 
            href="/dashboard/bookings" 
            className="block px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium"
          >
            📅 Riwayat Booking
          </Link>
          <Link 
            href="/" 
            className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            🏠 Kembali ke Home
          </Link>
          
          {/* Tombol Logout (Nanti kita buat component terpisah biar interaktif) */}
          <form action="/auth/signout" method="post" className="mt-8 pt-8 border-t">
            <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
              Keluar
            </button>
          </form>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}