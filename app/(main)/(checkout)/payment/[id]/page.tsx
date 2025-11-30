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
  ArrowRight,
  Copy,
  Info, // Tambah icon Info
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
  icon: React.ReactNode;
  selected: string;
  onSelect: (value: string) => void;
  logo: string;
}

export default function PaymentPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const paymentTypeParam =
    (searchParams.get("type") as "dp" | "full") || "full";

  const [bookingId, setBookingId] = useState<string>("");
  const [booking, setBooking] = useState<BookingWithService | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [step, setStep] = useState<"selection" | "upload">("selection");
  const [selectedMethod, setSelectedMethod] = useState<string>("bca_manual");

  const [uploading, setUploading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      setBookingId(resolvedParams.id);
    };
    init();
  }, [params]);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`*, service:services (*)`)
        .eq("id", bookingId)
        .single();

      if (error) {
        toast.error("Data tidak ditemukan", { description: "Redirecting..." });
        router.push("/");
        return;
      }
      setBooking(data as BookingWithService);
      setLoading(false);
    };
    fetchBooking();
  }, [bookingId, supabase, router]);

  const calculateBill = () => {
    if (!booking) return 0;
    const totalPrice = booking.total_price;
    const totalPaid = booking.total_paid || 0;
    const remaining = totalPrice - totalPaid;

    if (paymentTypeParam === "dp") {
      if (totalPaid >= totalPrice) return 0;
      return totalPrice * 0.5;
    }
    return remaining;
  };

  const amountToPay = calculateBill();

  const handleCopyRekening = () => {
    navigator.clipboard.writeText("8210981234");
    toast.success("Nomor Rekening Disalin!", {
      icon: <Copy className="w-4 h-4 text-green-600" />,
      duration: 2000,
    });
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!booking || !file) return;
    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis, silakan login ulang.");

      const fileExt = file.name.split(".").pop();
      const fileName = `${bookingId}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 1. Upload File
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      // 2. Insert Payment Record
      // (Trigger Database akan otomatis update status booking jadi 'waiting_verification')
      const { error: insertError } = await supabase.from("payments").insert({
        booking_id: booking.id,
        user_id: user.id,
        amount: amountToPay,
        payment_type: selectedMethod,
        payment_proof_url: `receipts/${filePath}`,
        status: "pending",
      });
      if (insertError) throw insertError;

      // --- BAGIAN UPDATE BOOKING DIHAPUS (Sudah Otomatis) ---

      toast.success("Bukti Pembayaran Terkirim!", {
        description: "Admin akan memverifikasi dalam 1x24 jam.",
        duration: 5000,
      });

      router.push("/dashboard/mybooking");
      router.refresh();
    } catch (err: unknown) {
      // ... error handling
    } finally {
      setUploading(false);
    }
  };

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse">Memuat data transaksi...</p>
      </div>
    );

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Link
            href="/dashboard/mybooking"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-slate-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-none">
              Pembayaran
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              ID: {booking.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {/* BANNER TIMER */}
      <div className="bg-blue-600 text-white py-3 px-4 text-center text-sm font-medium">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-3">
          <Clock className="w-4 h-4 opacity-80" />
          <span>Selesaikan dalam</span>
          <span className="bg-blue-800 px-2 py-0.5 rounded text-yellow-300 font-mono font-bold tracking-wider">
            00:59:21
          </span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* === KOLOM KIRI: PROSES PEMBAYARAN === */}
          <div className="lg:col-span-2 space-y-6">
            {step === "selection" ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Pilih Metode Transfer
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="font-medium">Aman & Terpercaya</span>
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
                  <div className="p-5 border-t border-gray-100 flex items-center justify-between opacity-50 cursor-not-allowed bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-400 font-medium">
                          Kartu Kredit (Maintenance)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // === STEP 2: UPLOAD BUKTI ===
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 animate-in fade-in zoom-in duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <UploadCloud className="w-6 h-6 text-blue-600" /> Upload Bukti
                  Transfer
                </h2>

                {/* ALERT TAGIHAN */}
                <div className="bg-orange-50 border border-orange-100 p-5 rounded-xl mb-8 text-orange-900 text-sm flex gap-4 items-start shadow-sm">
                  <div className="mt-0.5 text-xl">⚠️</div>
                  <div className="space-y-1">
                    <p className="font-medium text-orange-800">
                      Instruksi Pembayaran:
                    </p>
                    <p className="leading-relaxed opacity-90">
                      Silakan transfer sebesar{" "}
                      <strong className="text-base text-slate-900">
                        {formatRupiah(amountToPay)}
                      </strong>
                      {paymentTypeParam === "dp" ? " (DP 50%)" : " (Lunas)"} ke
                      rekening di bawah ini.
                    </p>
                  </div>
                </div>

                {/* KOTAK REKENING */}
                <div className="flex flex-col items-center p-8 bg-slate-50 rounded-2xl mb-8 border-2 border-dashed border-slate-300 relative group transition-colors hover:bg-blue-50/30 hover:border-blue-300">
                  <p className="text-slate-500 text-xs mb-3 font-bold uppercase tracking-widest">
                    Bank {selectedMethod.split("_")[0].toUpperCase()}
                  </p>
                  <p className="text-3xl md:text-4xl font-mono font-bold text-slate-800 tracking-widest group-hover:text-blue-700 transition-colors select-all cursor-text">
                    821 098 1234
                  </p>
                  <p className="text-sm text-slate-500 mt-2 font-medium">
                    a.n. PT Pusat Bisnis
                  </p>
                  <button
                    className="mt-6 text-xs bg-white border border-slate-200 px-4 py-2 rounded-full font-bold text-blue-600 hover:shadow-md hover:border-blue-200 transition active:scale-95 flex items-center gap-2"
                    onClick={handleCopyRekening}
                    type="button"
                  >
                    <Copy className="w-3 h-3" /> Salin Nomor Rekening
                  </button>
                </div>

                <form onSubmit={handleUpload}>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    File Bukti Transfer
                  </label>

                  <div className="border-2 border-slate-200 rounded-xl p-1 hover:border-blue-400 transition-colors bg-white">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) =>
                        e.target.files && setFile(e.target.files[0])
                      }
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-slate-100 file:text-slate-600 hover:file:bg-blue-50 cursor-pointer"
                    />
                  </div>

                  {/* ALERT INFORMASI WA (BARU) */}
                  <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-bold mb-1">Konfirmasi Cepat</p>
                      <p className="text-xs leading-relaxed opacity-90">
                        Setelah mengupload bukti pembayaran, Anda disarankan
                        untuk <strong>menghubungi Admin (WhatsApp)</strong>{" "}
                        untuk konfirmasi lebih cepat. Kontak admin tersedia di
                        halaman <strong>Detail Pesanan</strong> atau Footer.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200/50 transition-transform active:scale-[0.99]"
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <UploadCloud className="animate-bounce" /> Mengirim...
                        </span>
                      ) : (
                        "Kirim Bukti Pembayaran"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep("selection")}
                      className="w-full text-slate-500 text-sm font-medium hover:text-slate-800 py-2 hover:bg-slate-50 rounded-lg transition"
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
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                  <Building2 className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    Rincian Pesanan
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    #{booking.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <h4 className="font-bold text-gray-900 mb-2 text-lg leading-tight">
                  {booking.service?.name}
                </h4>
                <div className="flex gap-2 mb-6">
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold uppercase tracking-wide">
                    {booking.service?.unit === "per_day" ? "Harian" : "Per Jam"}
                  </span>
                  <span className="text-[10px] bg-green-100 px-2 py-1 rounded text-green-700 font-bold uppercase tracking-wide">
                    {paymentTypeParam === "dp" ? "DP 50%" : "Lunas"}
                  </span>
                </div>

                {/* Timeline */}
                <div className="flex border border-slate-200 rounded-lg p-3 mb-6 text-center bg-slate-50/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                  <div className="flex-1 border-r border-slate-200 pr-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Check-in
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(booking.start_time).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "short" }
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(booking.start_time).toLocaleTimeString(
                        "id-ID",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </p>
                  </div>
                  <div className="flex-1 pl-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Check-out
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(booking.end_time).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(booking.end_time).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Rincian Harga */}
                <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Harga Asli</span>
                    <span className="line-through text-xs decoration-slate-400">
                      {formatRupiah(booking.total_price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-slate-700">
                      Tagihan Saat Ini
                    </span>
                    <span className="text-xl font-extrabold text-blue-600 leading-none">
                      {formatRupiah(amountToPay)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right italic">
                    {paymentTypeParam === "dp"
                      ? "*Sisa pelunasan dibayar nanti"
                      : "*Harga sudah termasuk pajak"}
                  </p>
                </div>

                <div className="mt-6 bg-blue-50/50 text-blue-800 p-3 rounded-lg text-xs font-medium text-center border border-blue-100">
                  Pembayaran aman & terverifikasi.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BAR */}
      {step === "selection" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 safe-area-bottom">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center justify-between w-full md:w-auto gap-8">
              <div className="text-left">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                  Total Tagihan
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatRupiah(amountToPay)}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                    {paymentTypeParam === "dp" ? "DP 50%" : "FULL"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("upload")}
              className="w-full md:w-auto bg-blue-600 text-white font-bold text-base px-8 py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Bayar {selectedMethod === "bca_manual" ? "BCA" : "Mandiri"}{" "}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB KOMPONEN (Sama seperti sebelumnya) ---
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
        isSelected ? "bg-blue-50/40" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
              isSelected ? "border-blue-600" : "border-gray-300"
            }`}
          >
            {isSelected && (
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-in zoom-in duration-200" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-9 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-blue-900 shadow-sm shrink-0">
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
          <span className="hidden sm:block text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded uppercase tracking-wide">
            Terpilih
          </span>
        )}
      </div>

      {isSelected && (
        <div className="ml-[3.25rem] mt-3 text-sm text-slate-500 animate-in slide-in-from-top-1 fade-in duration-300">
          <ul className="list-disc pl-4 space-y-1 text-xs md:text-sm marker:text-blue-300">
            <li>Verifikasi manual 1x24 jam</li>
            <li>Simpan bukti transfer Anda</li>
          </ul>
        </div>
      )}
    </div>
  );
}
