import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Tables } from "@/types/supabase";

// UI
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Helper Format

export const metadata = {
  title: "Pesanan Saya",
  description:
    "Lihat dan kelola pesanan aktif Anda di Pusat Bisnis UIN Raden Fatah.",
};

type BookingRow = Tables<"bookings">;
export interface BookingWithService extends BookingRow {
  service: {
    name: string;
    images: string[] | null; // Sesuai tipe di tabel services Anda
    unit: string;
  } | null;
}

const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

// --- LOGIKA LABEL STATUS (UPDATE) ---
const getStatusLabel = (status: string, paymentStatus: string) => {
  // Prioritas 1: Cek jika sudah DP tapi belum lunas
  if (paymentStatus === "partial" && status !== "cancelled") {
    return "Menunggu Pelunasan"; // Atau "DP Diterima"
  }

  // Prioritas 2: Status bawaan
  const labels: Record<string, string> = {
    pending_payment: "Menunggu Pembayaran",
    waiting_verification: "Sedang Diverifikasi", // User sudah upload, admin cek
    confirmed: "E-Tiket Terbit",
    cancelled: "Dibatalkan",
    completed: "Selesai",
    rejected: "Pembayaran Ditolak",
  };
  return labels[status] || status;
};

// --- LOGIKA WARNA STATUS (UPDATE) ---
const getStatusColor = (status: string, paymentStatus: string) => {
  if (paymentStatus === "partial" && status !== "cancelled") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200"; // Kuning untuk DP
  }

  switch (status) {
    case "pending_payment":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "waiting_verification":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "confirmed":
      return "bg-green-100 text-green-700 border-green-200";
    case "cancelled":
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default async function UserBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Ambil Data
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`*, service:services (name, images, unit)`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const activeBookings =
    bookings?.filter((b) =>
      ["pending_payment", "waiting_verification", "confirmed"].includes(
        b.status
      )
    ) || [];

  return (
    <div className="space-y-6">
      {/* 1. BANNER PENGGANTI (PROMO MEMBER) */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white flex flex-col md:flex-row justify-between items-center shadow-md relative overflow-hidden">
        <div className="relative z-10 mb-4 md:mb-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
              MEMBER VIP
            </span>
            <h2 className="text-xl font-bold">Layanan Prioritas</h2>
          </div>
          <p className="text-slate-300 text-sm max-w-md">
            Nikmati kemudahan reservasi gedung dan aset bisnis dengan dukungan
            prioritas. Butuh bantuan mendesak?
          </p>
          <Link
            href="/about"
            className="inline-block mt-4 text-sm font-bold text-yellow-400 hover:text-yellow-300 hover:underline"
          >
            Hubungi Layanan Pelanggan &rarr;
          </Link>
        </div>
        {/* Hiasan */}
        <div className="hidden md:block opacity-10 absolute right-0 bottom-0 transform translate-x-1/4 translate-y-1/4">
          <Sparkles size={180} />
        </div>
      </div>

      {/* 2. SECTION: Daftar Pesanan Aktif */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          Pesanan Aktif
          {activeBookings.length > 0 && (
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
              {activeBookings.length}
            </span>
          )}
        </h2>

        {activeBookings.length === 0 ? (
          <Card className="border-gray-200 shadow-sm bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-4xl">
                📭
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Belum Ada Pesanan Aktif
              </h3>
              <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">
                Pesanan yang sedang berjalan atau menunggu pembayaran akan
                muncul di sini.
              </p>
              <Link href="/services">
                <Button className="mt-6 bg-blue-600 hover:bg-blue-700 font-bold rounded-full">
                  Cari Layanan Baru
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeBookings.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      {/* 3. SECTION: Daftar Pembelian (Riwayat) */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Menu Lainnya</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/transactions">
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group">
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition">
                    Riwayat Transaksi
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Lihat pesanan lampau yang sudah selesai
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-50 transition">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Placeholder menu lain */}
          <Link href="/dashboard/profile">
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group">
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition">
                    Pengaturan Akun
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Ubah profil dan kontak darurat
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-50 transition">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENT: LIST ITEM ---
function BookingItem({ booking }: { booking: BookingWithService }) {
  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden hover:border-blue-300 transition-colors group">
      <CardContent className="p-0 flex flex-col md:flex-row">
        {/* Gambar Service */}
        <div className="w-full md:w-48 h-40 md:h-auto bg-gray-100 relative shrink-0">
          {booking.service?.images?.[0] ? (
            <img
              src={booking.service.images[0]}
              className="w-full h-full object-cover"
              alt=""
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
              No Image
            </div>
          )}

          {/* Label Unit Overlay */}
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
            {booking.service?.unit === "per_day" ? "Sewa Harian" : "Sewa Jam"}
          </div>
        </div>

        {/* Konten */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
                {booking.service?.name}
              </h3>

              {/* UPDATE: Panggil fungsi dengan 2 parameter */}
              <Badge
                className={`${getStatusColor(
                  booking.status,
                  booking.payment_status
                )} border-0`}
              >
                {getStatusLabel(booking.status, booking.payment_status)}
              </Badge>
            </div>

            <div className="text-sm text-gray-500 flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <span>
                {format(new Date(booking.start_time), "dd MMM yyyy", {
                  locale: id,
                })}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 text-xs">
                Order ID: {booking.id.slice(0, 8)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-4 mt-2 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Total Tagihan</p>
              <span className="font-bold text-lg text-slate-800">
                {formatRupiah(booking.total_price)}
              </span>
              {booking.payment_status === "partial" && (
                <span className="text-xs text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded ml-2 font-medium">
                  Sudah DP
                </span>
              )}
            </div>

            {/* TOMBOL SELALU KE DETAIL */}
            <Link href={`/dashboard/mybooking/${booking.id}`}>
              <Button
                size="sm"
                variant="default"
                className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 font-bold shadow-sm"
              >
                Lihat Detail
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
