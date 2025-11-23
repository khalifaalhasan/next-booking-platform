'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Tables } from '@/types/supabase'; // Menggunakan tipe otomatis
import Link from 'next/link';

// 1. Definisikan Tipe Props untuk Halaman (Next.js 15 Style)
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// 2. Definisikan tipe gabungan untuk data Booking + Service
// Kita extend tipe Booking bawaan Supabase
type BookingWithService = Tables<'bookings'> & {
  service: Tables<'services'> | null;
};

export default function PaymentPage({ params }: PageProps) {
  const router = useRouter();
  const supabase = createClient();

  // State dengan Tipe Eksplisit
  const [bookingId, setBookingId] = useState<string>('');
  const [booking, setBooking] = useState<BookingWithService | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  
  // State Form
  const [amount, setAmount] = useState<string>(''); // String agar input text mudah
  const [file, setFile] = useState<File | null>(null);
  const [paymentType, setPaymentType] = useState<string>('transfer');

  // Unwrap params (Next.js 15)
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setBookingId(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  // Fetch Data Booking
  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services ( * )
        `)
        .eq('id', bookingId)
        .single();

      if (error) {
        alert('Gagal mengambil data booking: ' + error.message);
        router.push('/dashboard/bookings');
        return;
      }

      // Casting data ke tipe yang sudah kita definisikan
      setBooking(data as BookingWithService);
      
      // Set default amount (Sisa tagihan)
      if (data) {
        const sisa = data.total_price - (data.total_paid || 0);
        setAmount(sisa.toString());
      }
      setLoading(false);
    };

    fetchBooking();
  }, [bookingId, supabase, router]);

  // Handle File Change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Handle Submit Upload
  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!booking || !file) return;

    setUploading(true);

    try {
      // 1. Get User
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User tidak ditemukan');

      // 2. Upload File ke Storage Bucket 'receipts'
      const fileExt = file.name.split('.').pop();
      const fileName = `${bookingId}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Dapatkan Public URL (Jika bucket public) atau Path saja
      // Karena bucket 'receipts' biasanya private, kita simpan path-nya saja atau signed URL nanti.
      // Untuk simplisitas di tabel payments, kita simpan path full storage.
      const fullPath = `receipts/${filePath}`; 

      // 4. Insert ke Tabel Payments
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          user_id: user.id,
          amount: Number(amount), // Convert string ke number
          payment_type: paymentType,
          payment_proof_url: fullPath,
          status: 'pending'
        });

      if (insertError) throw insertError;

      alert('Bukti pembayaran berhasil dikirim! Tunggu verifikasi admin.');
      router.push('/dashboard/bookings');
      router.refresh();

    } catch (error) {
      let msg = 'Gagal upload.';
      if (error instanceof Error) msg = error.message;
      alert(msg);
    } finally {
      setUploading(false);
    }
  };

  // Helper Currency
  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  if (loading) return <div className="p-10 text-center">Memuat data pembayaran...</div>;
  if (!booking) return <div className="p-10 text-center text-red-500">Data tidak ditemukan.</div>;

  const sisaTagihan = booking.total_price - (booking.total_paid || 0);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-6 border-b pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Konfirmasi Pembayaran</h1>
        <p className="text-gray-500">Upload bukti transfer untuk pesanan Anda.</p>
      </div>

      {/* Ringkasan Pesanan */}
      <div className="bg-blue-50 p-4 rounded-xl mb-8 text-sm">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Layanan:</span>
          <span className="font-bold text-gray-900">{booking.service?.name}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Total Tagihan:</span>
          <span className="font-medium">{formatRupiah(booking.total_price)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Sudah Dibayar (Verified):</span>
          <span className="font-medium text-green-600">{formatRupiah(booking.total_paid || 0)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-blue-100 mt-2">
          <span className="font-bold text-blue-800">Sisa Pembayaran:</span>
          <span className="font-bold text-blue-800 text-lg">{formatRupiah(sisaTagihan)}</span>
        </div>
      </div>

      {/* Form Upload */}
      <form onSubmit={handleUpload} className="space-y-6">
        
        {/* Input Nominal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nominal yang Anda Transfer (Rp)
          </label>
          <input
            type="number"
            required
            min={10000}
            max={sisaTagihan}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Contoh: 1000000"
          />
          <p className="text-xs text-gray-400 mt-1">
            * Anda bisa membayar sebagian (DP) atau lunas.
          </p>
        </div>

        {/* Metode Bayar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Metode Pembayaran
          </label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="transfer">Transfer Bank (Manual)</option>
            <option value="qris">QRIS</option>
            <option value="cash">Tunai (Di Kantor)</option>
          </select>
        </div>

        {/* Upload File */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bukti Transfer (Gambar)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition relative">
            <input
              type="file"
              accept="image/*"
              required
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-gray-500">
              {file ? (
                <span className="text-blue-600 font-medium flex items-center justify-center gap-2">
                  📄 {file.name}
                </span>
              ) : (
                <span>Klik untuk pilih gambar atau drag & drop disini</span>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-4 pt-4">
          <Link 
            href="/dashboard/bookings"
            className="w-1/3 py-3 text-center border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={uploading || !file || Number(amount) <= 0}
            className="w-2/3 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {uploading ? 'Mengupload...' : 'Kirim Bukti Bayar'}
          </button>
        </div>

      </form>

      {/* Info Rekening (Hardcoded untuk contoh) */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500 mb-2">Silakan transfer ke rekening berikut:</p>
        <div className="inline-block bg-gray-100 px-6 py-3 rounded-lg">
          <p className="font-mono font-bold text-lg text-gray-800">BCA 123-456-7890</p>
          <p className="text-xs text-gray-500 uppercase">a.n. PT Pusat Pengembangan Bisnis</p>
        </div>
      </div>
    </div>
  );
}