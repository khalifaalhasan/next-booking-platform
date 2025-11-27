"use client";

import { useState, useEffect, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Tables } from "@/types/supabase";
import {
  Clock,
  ShieldCheck,
  Building2,
  CreditCard,
  UploadCloud,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// --- TIPE DATA ---
interface PageProps {
  params: Promise<{ id: string }>;
}

type BookingWithService = Tables<"bookings"> & {
  service: Tables<"services"> | null;
};

interface PaymentOptionProps {
  id: string;
  title: string;
  icon: React.ReactNode; // Tipe untuk element React (seperti icon Lucide)
  selected: string;
  onSelect: (value: string) => void; // Function yang menerima string
  logo: string;
}

export default function PaymentPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook untuk ambil ?type=...
  const supabase = createClient();

  // Ambil tipe pembayaran dari URL (default 'full' jika tidak ada)
  const paymentTypeParam =
    (searchParams.get("type") as "dp" | "full") || "full";

  // State Data
  const [bookingId, setBookingId] = useState<string>("");
  const [booking, setBooking] = useState<BookingWithService | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State UI
  const [step, setStep] = useState<"selection" | "upload">("selection");
  const [selectedMethod, setSelectedMethod] = useState<string>("bca_manual");

  // State Upload
  const [uploading, setUploading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);

  // 1. Init Data
  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      setBookingId(resolvedParams.id);
    };
    init();
  }, [params]);

  // 2. Fetch Booking
  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`*, service:services (*)`)
        .eq("id", bookingId)
        .single();

      if (error) {
        alert("Data tidak ditemukan");
        router.push("/");
        return;
      }
      setBooking(data as BookingWithService);
      setLoading(false);
    };
    fetchBooking();
  }, [bookingId, supabase, router]);

  // --- KALKULASI TAGIHAN ---
  const calculateBill = () => {
    if (!booking) return 0;
    const totalPrice = booking.total_price;
    const totalPaid = booking.total_paid || 0;
    const remaining = totalPrice - totalPaid;

    // Jika user memilih DP 50%
    if (paymentTypeParam === "dp") {
      // Pastikan belum lunas dulu
      if (totalPaid >= totalPrice) return 0;
      return totalPrice * 0.5;
    }

    // Jika Full (atau pelunasan sisa)
    return remaining;
  };

  const amountToPay = calculateBill();

  // Logic Upload Bukti
  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!booking || !file) return;
    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis");

      const fileExt = file.name.split(".").pop();
      const fileName = `${bookingId}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 1. Upload ke Storage
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      // 2. Insert ke Tabel Payments
      const { error: insertError } = await supabase.from("payments").insert({
        booking_id: booking.id,
        user_id: user.id,
        amount: amountToPay,
        payment_type: selectedMethod,
        payment_proof_url: `receipts/${filePath}`,
        status: "pending",
      });
      if (insertError) throw insertError;

      // 3. Update Status Booking
      const { error: updateBookingError } = await supabase
        .from("bookings")
        .update({
          status: "waiting_verification",
        })
        .eq("id", booking.id);

      if (updateBookingError) throw updateBookingError;

      alert("Pembayaran Berhasil Dikirim! Menunggu verifikasi.");
      router.push("/dashboard/mybooking");
      router.refresh();
    } catch (err: unknown) {
      // --- PERBAIKAN: Gunakan unknown ---
      let message = "Terjadi kesalahan saat upload.";

      // Type Narrowing: Cek apakah error adalah Error object
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }

      alert(message);
    } finally {
      setUploading(false);
    }
  };

  // Helper
  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  if (loading)
    return <div className="p-10 text-center">Memuat data transaksi...</div>;
  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <Link
            href="/dashboard/mybooking"
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-700 leading-none">
              Pembayaran
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Order ID: {booking.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {/* BANNER TIMER */}
      <div className="bg-blue-600 text-white py-3 px-4 text-center text-sm font-medium flex justify-center items-center gap-2">
        <span>
          Tenang, harganya tidak akan berubah. Yuk selesaikan pembayaran dalam
        </span>
        <span className="bg-blue-800 px-2 py-0.5 rounded text-yellow-300 font-mono font-bold">
          00:59:21
        </span>
        <Clock className="w-4 h-4" />
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* === KOLOM KIRI: PROSES PEMBAYARAN === */}
          <div className="lg:col-span-2 space-y-6">
            {step === "selection" ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Pilih Metode Transfer
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                    <ShieldCheck className="w-3 h-3" />
                    Aman & Terpercaya
                  </div>
                </div>

                {/* LIST METODE PEMBAYARAN */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <PaymentOption
                    id="bca_manual"
                    title="BCA Transfer Manual"
                    icon={<Building2 className="text-blue-600" />}
                    selected={selectedMethod}
                    onSelect={setSelectedMethod}
                    logo="BCA"
                  />
                  <PaymentOption
                    id="mandiri_manual"
                    title="Mandiri Transfer"
                    icon={<Building2 className="text-yellow-600" />}
                    selected={selectedMethod}
                    onSelect={setSelectedMethod}
                    logo="Mandiri"
                  />
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between opacity-50 cursor-not-allowed bg-gray-50">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <span className="text-gray-500 font-medium">
                        Kartu Kredit (Maintenance)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // === STEP 2: UPLOAD BUKTI ===
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in zoom-in duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Selesaikan Pembayaran
                </h2>

                {/* ALERT TAGIHAN */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 text-yellow-900 text-sm flex gap-3 items-start">
                  <div className="mt-0.5 text-lg">⚠️</div>
                  <p>
                    Silakan transfer sebesar{" "}
                    <strong className="text-lg text-black">
                      {formatRupiah(amountToPay)}
                    </strong>
                    {paymentTypeParam === "dp" ? " (DP 50%) " : " (Lunas) "}
                    ke rekening di bawah ini, lalu upload bukti transfernya.
                  </p>
                </div>

                {/* KOTAK REKENING */}
                <div className="flex flex-col items-center p-8 bg-slate-50 rounded-xl mb-8 border border-dashed border-slate-300">
                  <p className="text-slate-500 text-sm mb-2 font-medium uppercase tracking-wider">
                    Bank {selectedMethod.split("_")[0].toUpperCase()}
                  </p>
                  <p className="text-4xl font-mono font-bold text-slate-800 tracking-widest">
                    821 098 1234
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    a.n. PT Pusat Bisnis
                  </p>
                  <button
                    className="mt-4 text-xs text-blue-600 font-bold hover:underline"
                    onClick={() => navigator.clipboard.writeText("8210981234")}
                  >
                    Salin Nomor Rekening
                  </button>
                </div>

                <form onSubmit={handleUpload}>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Upload Bukti Transfer
                  </label>

                  <div className="border-2 border-slate-200 rounded-lg p-1 hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) =>
                        e.target.files && setFile(e.target.files[0])
                      }
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-blue-50 cursor-pointer"
                    />
                  </div>

                  <div className="mt-8 space-y-3">
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="w-full bg-orange-500 text-white font-bold text-lg py-4 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-100 transition-transform active:scale-[0.99]"
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <UploadCloud className="animate-bounce" /> Mengirim...
                        </span>
                      ) : (
                        "Saya Sudah Transfer"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep("selection")}
                      className="w-full text-slate-500 text-sm hover:text-slate-800 py-2"
                    >
                      Ganti Metode Pembayaran
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* === KOLOM KANAN: RINCIAN (Sticky) === */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    Rincian Pesanan
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    No. Pesanan {booking.id.slice(0, 8)}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <h4 className="font-bold text-gray-900 mb-1 text-lg">
                  {booking.service?.name}
                </h4>
                <div className="flex gap-2 mb-4">
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                    {booking.service?.unit === "per_day" ? "Harian" : "Per Jam"}
                  </span>
                  <span className="text-xs bg-green-100 px-2 py-0.5 rounded text-green-700 font-medium">
                    {paymentTypeParam === "dp" ? "Pembayaran DP" : "Pelunasan"}
                  </span>
                </div>

                {/* Timeline */}
                <div className="flex border border-slate-200 rounded-lg p-3 mb-6 text-center bg-slate-50/50">
                  <div className="flex-1 border-r border-slate-200 pr-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                      Check-in
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {new Date(booking.start_time).toLocaleDateString("id-ID")}
                    </p>
                    <p className="text-xs text-slate-400">14:00</p>
                  </div>
                  <div className="flex-1 pl-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                      Check-out
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {new Date(booking.end_time).toLocaleDateString("id-ID")}
                    </p>
                    <p className="text-xs text-slate-400">12:00</p>
                  </div>
                </div>

                {/* Rincian Harga */}
                <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Harga Asli</span>
                    <span className="line-through text-xs text-slate-400 decoration-slate-400">
                      {formatRupiah(booking.total_price)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Tagihan Saat Ini</span>
                    <span className="text-lg text-blue-600">
                      {formatRupiah(amountToPay)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">
                    {paymentTypeParam === "dp"
                      ? "*Sisa pelunasan dibayar nanti"
                      : "*Harga sudah termasuk pajak"}
                  </p>
                </div>

                <div className="mt-6 bg-green-50 text-green-800 p-3 rounded text-xs font-bold text-center border border-green-100">
                  Ini pilihan yang tepat untukmu.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BAR (Selection Step Only) */}
      {step === "selection" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs text-slate-500 mb-1">
                Total yang harus dibayar
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {formatRupiah(amountToPay)}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold uppercase">
                  {paymentTypeParam === "dp" ? "DP 50%" : "FULL"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep("upload")}
              className="w-full md:w-auto bg-orange-500 text-white font-bold text-lg px-10 py-3 rounded-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200 active:scale-95"
            >
              Bayar dengan {selectedMethod === "bca_manual" ? "BCA" : "Mandiri"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB KOMPONEN ---
function PaymentOption({
  id,
  title,
  selected,
  onSelect,
  logo,
}: PaymentOptionProps) {
  const isSelected = selected === id;
  return (
    <div
      onClick={() => onSelect(id)}
      className={`p-5 border-b border-gray-100 cursor-pointer transition-all ${
        isSelected ? "bg-blue-50/50" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Radio Circle Custom */}
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected ? "border-blue-600" : "border-gray-300"
            }`}
          >
            {isSelected && (
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-in zoom-in duration-200" />
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Bank Logo Placeholder */}
            <div className="w-14 h-9 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-blue-900 shadow-sm">
              {logo}
            </div>
            <span
              className={`font-medium text-base ${
                isSelected ? "text-blue-700" : "text-gray-700"
              }`}
            >
              {title}
            </span>
          </div>
        </div>
        {isSelected && (
          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
            Terpilih
          </span>
        )}
      </div>

      {isSelected && (
        <div className="ml-[3.25rem] mt-3 text-sm text-slate-500 animate-in slide-in-from-top-2 fade-in duration-200">
          <ul className="list-disc pl-4 space-y-1">
            <li>Terima pembayaran dari semua rekening bank</li>
            <li>Verifikasi manual dalam 1x24 jam</li>
          </ul>
        </div>
      )}
    </div>
  );
}
