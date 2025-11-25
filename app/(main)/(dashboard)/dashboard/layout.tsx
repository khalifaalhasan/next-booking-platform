import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar'; // Import Sidebar Baru

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* KOLOM KIRI (Sidebar) - Lebar 1/4 */}
          <div className="md:col-span-1">
            <Sidebar user={user} />
          </div>

          {/* KOLOM KANAN (Konten) - Lebar 3/4 */}
          <main className="md:col-span-3">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}