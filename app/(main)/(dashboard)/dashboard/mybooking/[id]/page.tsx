import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowLeft,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/types/supabase";

// Import komponen Download Ticket (Client Component)
import DownloadTicketButton from "@/components/booking/DownloadTicketButton";

// Tipe Data
type ServiceWithCategory = Tables<"services"> & {
  categories: Tables<"categories"> | null;
};
type BookingDetailData = Tables<"bookings"> & {
  service: ServiceWithCategory;
  payments: Tables<"payments">[];
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const { id: bookingId } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch Booking Detail
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
    *,
    service:services (
      *,
      categories (*)  
    ),
    payments (*)
  `
    )
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) notFound();

  // Casting ke tipe data lengkap
  const booking = data as unknown as BookingDetailData;

  // --- HELPER ---
  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const formatDate = (date: string) =>
    format(new Date(date), "EEE, dd MMM yyyy", { locale: id });

  const formatTime = (date: string) =>
    format(new Date(date), "HH:mm", { locale: id });

  // --- LOGIC PENCEGAH DOUBLE PAY ---
  // Cek apakah ada pembayaran yang masih 'pending' (belum diverifikasi admin)
  const payments = booking.payments || [];
  const hasPendingPayment = payments.some((p) => p.status === "pending");

  // --- KALKULASI DURASI ---
  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);
  let durationQty = 0;
  let durationUnit = "";

  if (booking.service.unit === "per_hour") {
    durationQty = differenceInHours(endDate, startDate);
    durationUnit = "Jam";
  } else {
    durationQty = differenceInDays(endDate, startDate) || 1;
    durationUnit = "Malam";
  }
  const unitPrice = booking.service.price;

  // --- LOGIC STATUS & TOMBOL ---
  const getStatusInfo = () => {
    // 1. LUNAS & VERIFIED (Tiket Ready)
    if (booking.status === "confirmed" && booking.payment_status === "paid") {
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: CheckCircle2,
        label: "Pesanan Lunas",
        msg: "Selamat! E-Tiket Anda sudah terbit.",
        action: "ticket",
      };
    }

    // 2. SUDAH DP (Tapi belum lunas -> Butuh Pelunasan)
    if (
      booking.status === "confirmed" &&
      booking.payment_status === "partial"
    ) {
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: CheckCircle2,
        label: "Booking Terkonfirmasi (DP)",
        msg: "Slot aman. Silakan lunasi sisa tagihan.",
        action: "pay_remaining",
      };
    }

    // 3. DIBATALKAN
    if (booking.status === "cancelled") {
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: AlertCircle,
        label: "Dibatalkan",
        msg: "Pesanan ini telah dibatalkan.",
        action: "none",
      };
    }

    // 4. MENUNGGU VERIFIKASI ADMIN (Pending Payment uploaded)
    if (hasPendingPayment || booking.status === "waiting_verification") {
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-800",
        border: "border-yellow-200",
        icon: Hourglass,
        label: "Menunggu Verifikasi",
        msg: "Admin sedang mengecek bukti bayar Anda.",
        action: "contact_admin",
      };
    }

    // 5. BELUM BAYAR (DEFAULT / Initial State / Rejected)
    return {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      icon: Clock,
      label: "Menunggu Pembayaran",
      msg: "Segera selesaikan pembayaran Anda.",
      action: "pay_full",
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Link WA Admin
  const waMessage = `Halo Admin, saya mau konfirmasi pesanan Order ID: ${booking.id}. Mohon dicek. Terima kasih.`;
  const waLink = `https://wa.me/6281234567890?text=${encodeURIComponent(
    waMessage
  )}`; // Ganti nomor WA Admin

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/mybooking">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Detail Pesanan</h1>
          <p className="text-xs text-slate-500">
            Order ID: {booking.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border} p-4 rounded-xl flex items-start gap-3 shadow-sm`}
      >
        <StatusIcon className="h-5 w-5 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-bold text-sm">{statusInfo.label}</h3>
          <p className="text-xs mt-1 opacity-90">{statusInfo.msg}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Detail Service */}
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-700">
                <div className="p-1.5 bg-white rounded border shadow-sm">
                  <span className="text-lg">🏢</span>
                </div>
                <span className="font-bold text-sm">
                  {booking.service.categories?.name || "Layanan"}
                </span>
              </div>
              <Badge variant="outline" className="bg-white">
                {booking.service.unit === "per_day" ? "Harian" : "Per Jam"}
              </Badge>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 aspect-video bg-slate-200 rounded-lg overflow-hidden relative">
                  {booking.service.images?.[0] ? (
                    <Image
                      src={booking.service.images[0]}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    {booking.service.name}
                  </h2>
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>Lokasi Utama Pusat Bisnis (Gedung A)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Check-in</p>
                      <p className="font-bold text-slate-800">
                        {formatDate(booking.start_time)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatTime(booking.start_time)} WIB
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Check-out</p>
                      <p className="font-bold text-slate-800">
                        {formatDate(booking.end_time)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatTime(booking.end_time)} WIB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Riwayat Transaksi */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800">
                Riwayat Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booking.payments && booking.payments.length > 0 ? (
                <div className="space-y-4">
                  {booking.payments.map((pay: Tables<"payments">) => (
                    <div
                      key={pay.id}
                      className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded ${
                            pay.status === "pending"
                              ? "bg-yellow-50 text-yellow-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Transfer {pay.payment_type}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(
                              new Date(pay.created_at),
                              "dd MMM yyyy, HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {formatRupiah(pay.amount)}
                        </p>
                        {/* Status Badge Payment */}
                        <Badge
                          variant={
                            pay.status === "verified" // Fix: Sesuaikan dengan enum DB (verified/rejected)
                              ? "default"
                              : pay.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            pay.status === "verified" ? "bg-green-600" : ""
                          }
                        >
                          {pay.status === "pending"
                            ? "Menunggu Verifikasi"
                            : pay.status === "verified"
                            ? "Diterima"
                            : "Ditolak"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic text-center py-4">
                  Belum ada transaksi.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN: HARGA & AKSI */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-50">
                <CardTitle className="text-base font-bold text-slate-800">
                  Rincian Harga
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Harga Sewa</span>
                    <span>{formatRupiah(unitPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Durasi</span>
                    <span>
                      x {durationQty} {durationUnit}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-slate-900 font-medium border-b border-slate-100 pb-4">
                  <span>Total Harga Sewa</span>
                  <span>{formatRupiah(booking.total_price)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Biaya Layanan</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-slate-900">
                    Total Tagihan
                  </span>
                  <span className="font-bold text-xl text-blue-600">
                    {formatRupiah(booking.total_price)}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg space-y-2 border border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Sudah Dibayar</span>
                    <span className="font-bold text-green-600">
                      {formatRupiah(booking.total_paid || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Sisa Tagihan</span>
                    <span
                      className={`font-bold ${
                        booking.total_price - (booking.total_paid || 0) > 0
                          ? "text-orange-600"
                          : "text-slate-400"
                      }`}
                    >
                      {formatRupiah(
                        booking.total_price - (booking.total_paid || 0)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ACTION BUTTONS */}
            <div className="space-y-3">
              {/* 1. TOMBOL BAYAR AWAL (Full/DP) */}
              {statusInfo.action === "pay_full" && (
                <Link href={`/payment/${booking.id}?type=full`}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 shadow-lg shadow-orange-100 text-lg">
                    Bayar Sekarang
                  </Button>
                </Link>
              )}

              {/* 2. TOMBOL PELUNASAN (Jika Partial) */}
              {statusInfo.action === "pay_remaining" && (
                <Link href={`/payment/${booking.id}?type=full`}>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 shadow-lg shadow-green-100 text-lg animate-pulse">
                    <CreditCard className="mr-2 h-5 w-5" /> Lunasi Tagihan
                  </Button>
                </Link>
              )}

              {/* 3. TOMBOL WA (Jika Pending Verifikasi) */}
              {statusInfo.action === "contact_admin" && (
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 shadow-lg shadow-green-100 text-base">
                    <MessageCircle className="mr-2 h-5 w-5" /> Konfirmasi ke
                    Admin (WA)
                  </Button>
                </a>
              )}

              {/* 4. TOMBOL TIKET (Hanya jika Lunas & Verified) */}
              {statusInfo.action === "ticket" && (
                // Pass booking data ke Client Component
                <DownloadTicketButton booking={booking} />
              )}

              <Link href="/services">
                <Button
                  variant="outline"
                  className="w-full border-slate-300 text-slate-600"
                >
                  Pesan Layanan Lain
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
