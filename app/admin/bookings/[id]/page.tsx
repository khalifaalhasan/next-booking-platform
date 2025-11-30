"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Tables } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Hapus CardDescription
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  MessageCircle,
  ExternalLink,
  Phone,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Define Types
type BookingDetail = Tables<"bookings"> & {
  service: Tables<"services"> | null;
  profile: { full_name: string; email: string; phone_number: string } | null;
};

export default function AdminBookingDetail({ params }: PageProps) {
  const { id } = use(params);
  const supabase = createClient();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [payments, setPayments] = useState<Tables<"payments">[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      // 1. Get Booking
      const { data: bData, error } = await supabase
        .from("bookings")
        .select(
          `*, service:services(*), profile:profiles(full_name, email, phone_number)`
        )
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Data booking tidak ditemukan");
        router.push("/admin/bookings");
        return;
      }
      setBooking(bData as BookingDetail);

      // 2. Get Payments
      const { data: pData } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", id)
        .order("created_at", { ascending: false });
      setPayments(pData || []);

      setLoading(false);
    };
    fetchData();
  }, [id, supabase, router]);

  // Helper: Get Image URL
  const getImageUrl = (path: string) => {
    if (!path) return "";
    const cleanPath = path.replace(/^receipts\//, "");
    const { data } = supabase.storage.from("receipts").getPublicUrl(cleanPath);
    return data.publicUrl;
  };

  // Handle Verify
  // PERBAIKAN: Gunakan status yang sesuai dengan ENUM di database (verified / rejected)
  // ... (Kode sebelumnya tetap sama)

  // Handle Verify
  // ... kode sebelumnya ...

  // Handle Verify
  const handleVerify = async (
    paymentId: string,
    status: "verified" | "rejected"
  ) => {
    if (!booking) return;

    // Cari data payment yang sedang diproses
    const currentPayment = payments.find((p) => p.id === paymentId);
    if (!currentPayment) return;

    setProcessingId(paymentId);

    try {
      // 1. Update Payment Status (Tabel Payments)
      // PERBAIKAN: Gunakan 'status' langsung (verified/rejected), JANGAN diubah jadi success/failed
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          status: status,
          verified_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (paymentError) throw paymentError;

      // 2. Update Booking Status (Jika Verified)
      if (status === "verified") {
        // Hitung total yang sudah dibayar sebelumnya + pembayaran ini
        const previousPaid = booking.total_paid || 0;
        const newTotalPaid = previousPaid + currentPayment.amount;

        // Tentukan Status Pembayaran Baru (Lunas atau Masih Nyicil?)
        const isFullyPaid = newTotalPaid >= booking.total_price - 100;
        const newPaymentStatus = isFullyPaid ? "paid" : "partial";

        // Update Booking
        const { error: bookingError } = await supabase
          .from("bookings")
          .update({
            status: "confirmed", // Booking aktif
            payment_status: newPaymentStatus,
            total_paid: newTotalPaid,
          })
          .eq("id", id);

        if (bookingError) throw bookingError;

        // Notifikasi WA
        if (isFullyPaid) {
          toast.success("Pembayaran Lunas Diterima!");
          const message = `Halo ${booking.customer_name}, pembayaran LUNAS untuk booking ${booking.service?.name} telah dikonfirmasi. E-tiket sudah terbit. Terima kasih!`;
          window.open(
            `https://wa.me/${booking.customer_phone}?text=${encodeURIComponent(
              message
            )}`,
            "_blank"
          );
        } else {
          toast.success("Pembayaran DP Diterima!");
          const sisa = booking.total_price - newTotalPaid;
          const message = `Halo ${
            booking.customer_name
          }, pembayaran DP sebesar ${formatRupiah(
            currentPayment.amount
          )} untuk ${
            booking.service?.name
          } telah dikonfirmasi. Sisa tagihan: ${formatRupiah(sisa)}.`;
          window.open(
            `https://wa.me/${booking.customer_phone}?text=${encodeURIComponent(
              message
            )}`,
            "_blank"
          );
        }
      } else {
        // Jika Ditolak (Rejected)
        // Cek apakah ini pembayaran pertama? Jika iya, balikin status booking ke pending
        const isFirstPayment = (booking.total_paid || 0) === 0;

        if (isFirstPayment) {
          await supabase
            .from("bookings")
            .update({ status: "pending_payment" })
            .eq("id", id);
        }

        toast.info("Pembayaran Ditolak");
        const message = `Halo ${booking.customer_name}, bukti pembayaran Anda ditolak karena tidak valid/buram. Mohon upload ulang.`;
        window.open(
          `https://wa.me/${booking.customer_phone}?text=${encodeURIComponent(
            message
          )}`,
          "_blank"
        );
      }

     router.refresh(); // Refresh data server component
        setTimeout(() => {
            window.location.reload(); // Force reload browser agar state benar-benar fresh
        }, 1000);
      // window.location.reload(); // Opsional, router.refresh biasanya cukup
      // ... kode sebelumnya
    } catch (err: unknown) {
      // 1. Ganti any dengan unknown
      console.error("Verification Error:", err);

      let message = "Gagal memproses verifikasi";

      // 2. Lakukan Type Narrowing
      if (err instanceof Error) {
        // Jika error adalah instance Error standar JS
        message = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        // Jika error adalah object custom (seperti dari Supabase PostgrestError)
        // Kita lakukan casting aman di sini
        const errorObj = err as { message: string; details?: string };
        message = errorObj.message;
        if (errorObj.details) {
          message += ` (${errorObj.details})`;
        }
      } else if (typeof err === "string") {
        // Jika error dilempar sebagai string mentah
        message = err;
      }

      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  // ... sisa kode ...

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  if (!booking) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Verifikasi Pembayaran
          </h1>
          <p className="text-sm text-slate-500">ID: {booking.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* KIRI: Detail Pesanan */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg">Informasi Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">
                Layanan
              </p>
              <p className="text-xl font-bold text-blue-600">
                {booking.service?.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Check-in</p>
                <p className="font-medium">
                  {new Date(booking.start_time).toLocaleDateString("id-ID", {
                    dateStyle: "medium",
                  })}
                </p>
                <p className="text-xs text-slate-600">
                  {new Date(booking.start_time).toLocaleTimeString("id-ID", {
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Check-out</p>
                <p className="font-medium">
                  {new Date(booking.end_time).toLocaleDateString("id-ID", {
                    dateStyle: "medium",
                  })}
                </p>
                <p className="text-xs text-slate-600">
                  {new Date(booking.end_time).toLocaleTimeString("id-ID", {
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Tagihan</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(booking.total_price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Status System</span>
                <Badge
                  variant={
                    booking.status === "confirmed" ? "default" : "secondary"
                  }
                  className={
                    booking.status === "confirmed" ? "bg-green-600" : ""
                  }
                >
                  {booking.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KANAN: Data Pemesan */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg">Data Pemesan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">{booking.customer_name}</p>
                <p className="text-sm text-slate-500">User Terdaftar</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{booking.customer_phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{booking.customer_email}</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
              onClick={() =>
                window.open(`https://wa.me/${booking.customer_phone}`, "_blank")
              }
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Chat WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <h2 className="text-xl font-bold text-slate-900">
        Riwayat Bukti Transfer
      </h2>

      <div className="space-y-4">
        {payments.map((payment) => {
          const imgUrl = getImageUrl(payment.payment_proof_url || "");
          // PERBAIKAN: Logic Badge Status yang konsisten
          const isVerified = payment.status === "verified";
          const isRejected = payment.status === "rejected";

          return (
            <Card
              key={payment.id}
              className={`overflow-hidden transition-all ${
                payment.status === "pending"
                  ? "border-blue-300 shadow-md ring-1 ring-blue-100"
                  : "opacity-80"
              }`}
            >
              <CardContent className="p-0 flex flex-col md:flex-row">
                {/* KOLOM GAMBAR */}
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="w-full md:w-64 h-48 bg-slate-100 relative cursor-zoom-in group shrink-0">
                      {imgUrl ? (
                        <>
                          <Image
                            src={imgUrl}
                            alt="Bukti"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs">
                            <ExternalLink className="w-4 h-4 mr-1" /> Perbesar
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
                    <div className="relative w-full h-[80vh]">
                      {imgUrl && (
                        <Image
                          src={imgUrl}
                          alt="Bukti Full"
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* KOLOM INFO */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-2xl font-bold text-slate-900">
                          {formatRupiah(payment.amount)}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          Via {payment.payment_type}
                        </div>
                      </div>
                      <Badge
                        variant={
                          isVerified
                            ? "default"
                            : isRejected
                            ? "destructive"
                            : "secondary"
                        }
                        className={isVerified ? "bg-green-600" : ""}
                      >
                        {payment.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      Diupload pada:{" "}
                      {new Date(payment.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* TOMBOL AKSI */}
                  {payment.status === "pending" && (
                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                      <Button
                        onClick={() => handleVerify(payment.id, "verified")}
                        disabled={!!processingId}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        {processingId === payment.id ? (
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Terima Lunas
                      </Button>

                      <Button
                        onClick={() => handleVerify(payment.id, "rejected")}
                        disabled={!!processingId}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Tolak
                      </Button>
                    </div>
                  )}

                  {isVerified && (
                    <div className="mt-4 text-sm text-green-600 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Pembayaran ini telah
                      diverifikasi valid.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {payments.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
            Belum ada bukti pembayaran yang diupload user.
          </div>
        )}
      </div>
    </div>
  );
}
