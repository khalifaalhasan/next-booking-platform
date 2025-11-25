import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// UI
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, RefreshCcw } from 'lucide-react';

// Helper Format
const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

export default async function UserBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Ambil Data
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`*, service:services (name, images, unit)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const activeBookings = bookings?.filter(b => 
    ['pending_payment', 'waiting_verification', 'confirmed'].includes(b.status)
  ) || [];

  return (
    <div className="space-y-6">
      
      {/* 1. BANNER PROMO (Easy Reschedule) */}
      <div className="bg-gradient-to-r from-[#0094FF] to-[#007CEF] rounded-lg p-6 text-white flex flex-col md:flex-row justify-between items-center shadow-sm">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold italic">easy</h2>
            <h2 className="text-2xl font-light">RESCHEDULE</h2>
          </div>
          <p className="font-bold text-lg">Traveloka Easy Reschedule</p>
          <p className="text-sm text-blue-100 mt-1 max-w-md">
            Mengubah jadwal booking bukan masalah. Kami pastikan jadi mudah.
          </p>
          <button className="mt-3 text-sm font-bold underline hover:text-blue-200">Pelajari selengkapnya</button>
        </div>
        {/* Ilustrasi hiasan (bisa diganti gambar asli) */}
        <div className="hidden md:block opacity-20">
           <RefreshCcw size={80} />
        </div>
      </div>

      {/* 2. SECTION: E-tiket & Voucher Aktif */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">E-tiket & Voucher Aktif</h2>
        
        {activeBookings.length === 0 ? (
          // EMPTY STATE (Seperti Screenshot)
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="flex flex-col md:flex-row items-center p-8 gap-6">
              {/* Gambar Ilustrasi Empty */}
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                 <span className="text-4xl">😴</span> 
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold text-gray-900">Belum Ada Pesanan</h3>
                <p className="text-gray-500 mt-2 text-sm">
                  Seluruh pesanan Anda akan muncul di sini, tapi kini Anda belum punya satu pun. Mari buat pesanan via homepage!
                </p>
                <Link href="/">
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700 font-bold">
                        Cari Layanan
                    </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          // ACTIVE BOOKINGS LIST
          <div className="space-y-4">
            {activeBookings.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      {/* 3. SECTION: Daftar Pembelian */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Daftar Pembelian</h2>
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer">
            <CardContent className="p-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Lihat Riwayat Pembelian</span>
                    <span className="text-blue-600">➔</span>
                </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

// --- SUB COMPONENT: LIST ITEM UNTUK BOOKING AKTIF ---
function BookingItem({ booking }: any) {
    return (
        <Card className="border-l-4 border-l-blue-600 overflow-hidden">
            <CardContent className="p-0 flex">
                <div className="w-32 bg-gray-100 relative hidden md:block">
                    {booking.service?.images?.[0] && (
                        <img src={booking.service.images[0]} className="w-full h-full object-cover" alt="" />
                    )}
                </div>
                <div className="p-4 flex-1">
                    <div className="flex justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{booking.service?.name}</h3>
                        <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded uppercase">
                            {booking.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mb-4">
                        <CalendarDays className="w-4 h-4" />
                        {format(new Date(booking.start_time), 'dd MMM yyyy', { locale: id })}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="font-bold text-gray-900">{formatRupiah(booking.total_price)}</span>
                        {booking.status === 'pending_payment' ? (
                            <Link href={`/payment/${booking.id}`}>
                                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">Bayar</Button>
                            </Link>
                        ) : (
                            <Button size="sm" variant="outline">Lihat Detail</Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}