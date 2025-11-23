import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

// Helper format tanggal & rupiah
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
});
const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

export default async function MyBookingsPage() {
  const supabase = await createClient();

  // 1. Ambil User ID
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Ambil Data Booking + Data Service (Join)
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services ( name, images ) 
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-500">Error loading bookings</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Booking Saya</h1>

      {bookings?.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
          <p className="text-gray-500 mb-4">Anda belum memiliki booking.</p>
          <Link href="/services" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Cari Layanan Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings?.map((booking: any) => (
            <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
              
              {/* Gambar Service */}
              <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                 {booking.service?.images?.[0] && (
                   <img 
                     src={booking.service.images[0]} 
                     alt="Service" 
                     className="w-full h-full object-cover"
                   />
                 )}
              </div>

              {/* Info Booking */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{booking.service?.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(booking.start_time)} - {formatDate(booking.end_time)}
                    </p>
                  </div>
                  
                  {/* Badge Status */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-4 flex flex-col md:flex-row justify-between items-end border-t pt-4 border-gray-50">
                  <div>
                     <p className="text-sm text-gray-500">Total Harga</p>
                     <p className="text-lg font-bold text-blue-600">{formatRupiah(booking.total_price)}</p>
                     <p className="text-xs text-gray-400 mt-1">
                       Terbayar: {formatRupiah(booking.total_paid || 0)} 
                       ({booking.payment_status === 'paid' ? 'Lunas' : booking.payment_status === 'partial' ? 'Sebagian/DP' : 'Belum Bayar'})
                     </p>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="mt-4 md:mt-0 flex gap-3">
                     {booking.status !== 'cancelled' && booking.payment_status !== 'paid' && (
                       <Link 
                         href={`/dashboard/bookings/${booking.id}/payment`}
                         className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                       >
                         Bayar / Upload Bukti
                       </Link>
                     )}
                     
                     {booking.status === 'confirmed' && (
                       <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                         Download Tiket
                       </button>
                     )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}