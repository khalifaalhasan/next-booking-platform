'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Tables } from '@/types/supabase';
import { differenceInDays, differenceInHours } from 'date-fns';
import { User } from '@supabase/supabase-js';

type Service = Tables<'services'>;

export default function BookingForm({ service }: { service: Service }) {
  const supabase = createClient();
  const router = useRouter();

  // State Form
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // State Logic
  const [totalPrice, setTotalPrice] = useState(0);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState <User | null>(null);

  // 1. Cek User Session
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  // 2. Hitung Harga & Cek Ketersediaan
  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      setTotalPrice(0);
      setIsAvailable(false);
      return;
    }

    // Hitung Harga
    let calculatedPrice = 0;
    if (service.unit === 'per_hour') {
      const hours = differenceInHours(end, start);
      calculatedPrice = hours * service.price;
    } else {
      const days = differenceInDays(end, start) || 1;
      calculatedPrice = days * service.price;
    }
    setTotalPrice(calculatedPrice);

    // Cek Availability
    const checkAvailability = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('service_id', service.id)
        .neq('status', 'cancelled')
        .lt('start_time', endDate)
        .gt('end_time', startDate);

      if (error) {
        console.error('Error checking availability:', error);
      }

      setIsAvailable(data && data.length > 0 ? false : true);
      setIsLoading(false);
    };

    const timeoutId = setTimeout(() => checkAvailability(), 500);
    return () => clearTimeout(timeoutId);

  }, [startDate, endDate, service.id, service.price, service.unit, supabase]);

  // 3. Handle Submit Booking (BAGIAN YANG ERROR SEBELUMNYA)
  const handleBooking = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu.');
      return;
    }

    if (!isAvailable) return;

    const confirmMsg = `Total biaya: Rp ${totalPrice.toLocaleString('id-ID')}\nLanjutkan booking?`;
    if (!confirm(confirmMsg)) return;

    setIsLoading(true);

    try {
      // PERBAIKAN DI SINI:
      const { error } = await supabase.from('bookings').insert({
        service_id: service.id,
        user_id: user.id,
        // Typo StartDate diperbaiki jadi startDate
        start_time: new Date(startDate).toISOString(), 
        end_time: new Date(endDate).toISOString(),
        total_price: totalPrice,
        status: 'pending_payment',
        payment_status: 'unpaid',
        customer_email: user.email,
        customer_name: user.user_metadata?.full_name || 'Guest',
      });

      if (error) throw error;

      alert('Booking berhasil dibuat! Silakan lakukan pembayaran.');
      router.push('/dashboard/bookings'); 
    } catch (error) {
      // 3. Penanganan Error yang Type-Safe
      let errorMessage = 'Terjadi kesalahan saat booking.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      alert('Gagal booking: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Booking {service.unit === 'per_day' ? 'Harian' : 'Per Jam'}</h3>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selesai</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {startDate && endDate && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Status Jadwal:</span>
            {isLoading ? (
              <span className="text-gray-400 text-sm">Mengecek...</span>
            ) : isAvailable ? (
              <span className="text-green-600 font-bold flex items-center gap-1">
                ● Tersedia
              </span>
            ) : (
              <span className="text-red-600 font-bold flex items-center gap-1">
                ● Penuh
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-gray-900 font-semibold">Total Harga:</span>
            <span className="text-xl font-bold text-blue-600">
              Rp {totalPrice.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      )}

      {!user ? (
        <button 
          onClick={() => router.push('/login')}
          className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition"
        >
          Login untuk Booking
        </button>
      ) : (
        <button
          onClick={handleBooking}
          disabled={!isAvailable || isLoading || !startDate || !endDate}
          className={`w-full py-3 rounded-xl font-bold transition shadow-lg ${
            isAvailable && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Memproses...' : 'Booking Sekarang'}
        </button>
      )}
    </div>
  );
}