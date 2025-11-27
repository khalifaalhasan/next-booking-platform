"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingSkeleton } from "@/components/ui/Skeleton";
import { User } from "@supabase/supabase-js";
import { differenceInHours, differenceInDays } from "date-fns";
import { CheckCircle2, LogIn, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";

// --- IMPORT KOMPONEN AUTH ---
import AuthDialog from "@/components/auth/AuthDialog";
import EmailVerificationDialog from "@/components/auth/EmailVerificationDialog";
import { Tables } from "@/types/supabase";

// Helper format rupiah
const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

export default function BookingProcessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const { slug } = use(params);
  const startDateStr = searchParams.get("start");
  const endDateStr = searchParams.get("end");

  // State Data
  const [service, setService] = useState<Tables<"services"> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Dialog
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showVerification, setShowVerification] = useState(false); // <--- UNTUK POPUP OTP

  // State Form Input
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isForSelf, setIsForSelf] = useState(true);
  const [paymentOption, setPaymentOption] = useState<"full" | "dp">("full");

  // 1. Load Draft
  useEffect(() => {
    const loadDraft = () => {
      if (typeof window !== "undefined") {
        const savedData = localStorage.getItem("booking-form-draft");
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.fullName) setFullName(parsed.fullName);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.guestName) setGuestName(parsed.guestName);
          if (parsed.isForSelf !== undefined) setIsForSelf(parsed.isForSelf);
          if (parsed.paymentOption) setPaymentOption(parsed.paymentOption);
        }
      }
    };
    loadDraft();
  }, []);

  // 2. Auto Save
  useEffect(() => {
    const draft = {
      fullName,
      phone,
      email,
      guestName,
      isForSelf,
      paymentOption,
    };
    localStorage.setItem("booking-form-draft", JSON.stringify(draft));
  }, [fullName, phone, email, guestName, isForSelf, paymentOption]);

  // 3. Fetch Data & Listener Auth
  useEffect(() => {
    const initData = async () => {
      // Ambil user awal
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      fillUserData(user);

      // Ambil service
      const { data: serviceData } = await supabase
        .from("services")
        .select("*")
        .eq("slug", slug)
        .single();

      setService(serviceData);
      setLoading(false);
    };

    initData();

    // Listener Realtime
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        fillUserData(session.user);
        if (event === "SIGNED_IN") setIsAuthOpen(false);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [slug, supabase]);

  const fillUserData = (currentUser: User | null) => {
    if (currentUser) {
      setFullName((prev) => prev || currentUser.user_metadata?.full_name || "");
      setEmail((prev) => prev || currentUser.email || "");
      if (isForSelf) {
        setGuestName(
          (prev) => prev || currentUser.user_metadata?.full_name || ""
        );
      }
    }
  };

  useEffect(() => {
    if (isForSelf) setGuestName(fullName);
  }, [isForSelf, fullName]);

  const calculateTotal = () => {
    if (!service || !startDateStr || !endDateStr) return 0;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (service.unit === "per_hour") {
      return differenceInHours(end, start) * service.price;
    }
    return (differenceInDays(end, start) || 1) * service.price;
  };

  const fullPrice = calculateTotal();
  const amountToPay = paymentOption === "full" ? fullPrice : fullPrice * 0.5;

  // --- LOGIC SUBMIT (YANG DIPERBAIKI) ---
  const handleSubmit = async () => {
    // 1. Cek Login (Pakai State)
    if (!user) {
      toast.error("Silakan Login", {
        description: "Anda harus login untuk memesan.",
      });
      setIsAuthOpen(true);
      return;
    }

    if (!service) return;

    setSubmitting(true); // Loading ON sementara

    // 2. AMBIL USER TERBARU DARI SERVER (Wajib!)
    // Ini memastikan metadata 'email_verified_custom' benar-benar fresh
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setSubmitting(false);
      return;
    }

    // 3. LOGIC VERIFIKASI KETAT
    // Provider 'google' biasanya aman. Provider 'email' harus cek metadata custom.
    const isGoogleUser = currentUser.app_metadata.provider === "google";
    const isCustomVerified =
      currentUser.user_metadata?.email_verified_custom === true;

    // Jika BUKAN Google DAN (Belum Verifikasi ATAU Metadata tidak ada) -> BLOKIR
    if (!isGoogleUser && !isCustomVerified) {
      toast.error("Verifikasi Diperlukan", {
        description:
          "Demi keamanan, mohon verifikasi email Anda dengan kode OTP.",
        duration: 5000,
      });

      setShowVerification(true); // Buka Popup OTP
      setSubmitting(false); // Matikan Loading
      return; // STOP PROSES!
    }

    // 4. Validasi Form
    if (!fullName || !phone || !email || !guestName) {
      toast.error("Data Belum Lengkap", {
        description: "Mohon lengkapi nama, telepon, dan email pemesan.",
      });
      setSubmitting(false);
      return;
    }

    // 5. Eksekusi Booking (Hanya jika lolos verifikasi)
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          service_id: service.id,
          user_id: currentUser.id,
          start_time: new Date(startDateStr!).toISOString(),
          end_time: new Date(endDateStr!).toISOString(),
          total_price: fullPrice,
          status: "pending_payment",
          payment_status: "unpaid",
          customer_name: guestName,
          customer_email: email,
          customer_phone: phone,
          notes: isForSelf
            ? "Pesan untuk diri sendiri"
            : `Dipesankan oleh ${fullName}`,
        })
        .select()
        .single();

      if (error) throw error;

      localStorage.removeItem("booking-form-draft");
      router.push(`/payment/${data.id}?type=${paymentOption}`);
    } catch (err: unknown) {
      let message = "Terjadi Kesalahan pada sistem";
      if (err instanceof Error) message = err.message;

      toast.error("Gagal Memproses Booking", { description: message });
      setSubmitting(false);
    }
  };

  if (loading) return <BookingSkeleton />;
  if (!service)
    return <div className="p-10 text-center">Layanan tidak ditemukan</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. DIALOG LOGIN */}
      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />

      {/* 2. DIALOG VERIFIKASI (WAJIB ADA DI SINI) */}
      {user && user.email && (
        <EmailVerificationDialog
          open={showVerification}
          onOpenChange={setShowVerification}
          email={user.email}
          onSuccess={() => {
            // Setelah OTP sukses, refresh halaman agar metadata terbaca ulang
            router.refresh();
          }}
        />
      )}

      {/* HEADER PAGE */}
      <div className="bg-white shadow-sm border-b border-gray-200 py-6 mb-8">
        {/* GUNAKAN CONTAINER YANG RAPI */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Booking: {service.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi data pemesanan di bawah ini.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* KOLOM KIRI (FORM) - LEBAR 8/12 */}
          <div className="lg:col-span-8 space-y-8">
            {/* ALERT INFO AUTO SAVE */}
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-4 py-3 rounded-lg border border-green-100 w-full md:w-fit animate-fade-in shadow-sm">
              <Save className="w-4 h-4" /> Data formulir tersimpan otomatis.
            </div>

            {/* CARD 1: Data Pemesan */}
            <div
              className={`bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 transition-all ${
                !user
                  ? "opacity-60 pointer-events-none grayscale-[0.8]"
                  : "hover:border-blue-200"
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                  👤
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Data Pemesan
                  </h2>
                  <p className="text-xs text-gray-500">
                    Informasi kontak pemesan.
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!user}
                    placeholder="Sesuai KTP"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      No. Handphone
                    </label>
                    <input
                      type="tel"
                      className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!user}
                      placeholder="0812..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!user}
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Detail Tamu */}
            <div
              className={`bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 transition-all ${
                !user
                  ? "opacity-60 pointer-events-none grayscale-[0.8]"
                  : "hover:border-blue-200"
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                  🏨
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Detail Tamu
                  </h2>
                  <p className="text-xs text-gray-500">
                    Siapa yang akan check-in?
                  </p>
                </div>
              </div>
              <div
                className="mb-6 flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition"
                onClick={() => user && setIsForSelf(!isForSelf)}
              >
                <input
                  type="checkbox"
                  checked={isForSelf}
                  onChange={(e) => setIsForSelf(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  disabled={!user}
                />
                <label className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Sama dengan pemesan
                </label>
              </div>
              {!isForSelf && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap Tamu
                  </label>
                  <input
                    type="text"
                    className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-sm"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    disabled={!user}
                    placeholder="Nama tamu yang akan menginap"
                  />
                </div>
              )}
              {isForSelf && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-blue-800 text-sm">
                  Tamu yang terdaftar: <strong>{fullName || "-"}</strong>
                </div>
              )}
            </div>

            {/* CARD 3: Opsi Pembayaran */}
            <div
              className={`bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 transition-all ${
                !user
                  ? "opacity-60 pointer-events-none grayscale-[0.8]"
                  : "hover:border-blue-200"
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-50 p-3 rounded-full text-green-600">
                  💳
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Metode Pembayaran
                  </h2>
                  <p className="text-xs text-gray-500">
                    Pilih skema pembayaran Anda.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setPaymentOption("full")}
                  className={`p-5 border-2 rounded-2xl cursor-pointer relative transition-all duration-200 ${
                    paymentOption === "full"
                      ? "border-blue-600 bg-blue-50/50 shadow-md scale-[1.02]"
                      : "border-gray-100 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  {paymentOption === "full" && (
                    <CheckCircle2 className="absolute top-4 right-4 text-blue-600 w-6 h-6" />
                  )}
                  <p className="font-bold text-gray-900">Bayar Lunas (100%)</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pembayaran penuh di awal.
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-4">
                    {formatRupiah(fullPrice)}
                  </p>
                </div>
                <div
                  onClick={() => setPaymentOption("dp")}
                  className={`p-5 border-2 rounded-2xl cursor-pointer relative transition-all duration-200 ${
                    paymentOption === "dp"
                      ? "border-blue-600 bg-blue-50/50 shadow-md scale-[1.02]"
                      : "border-gray-100 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  {paymentOption === "dp" && (
                    <CheckCircle2 className="absolute top-4 right-4 text-blue-600 w-6 h-6" />
                  )}
                  <p className="font-bold text-gray-900">Bayar DP (50%)</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Amankan slot dengan uang muka.
                  </p>
                  <p className="text-lg font-bold text-orange-600 mt-4">
                    {formatRupiah(fullPrice * 0.5)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (STICKY SUMMARY) - LEBAR 4/12 */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Ringkasan Pesanan
              </h3>

              <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                {service.images?.[0] ? (
                  <img
                    src={service.images[0]}
                    alt="img"
                    className="w-20 h-20 rounded-xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-200 animate-pulse"></div>
                )}
                <div>
                  <p className="font-bold text-gray-800 line-clamp-2 leading-tight mb-1">
                    {service.name}
                  </p>
                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                    {new Date(startDateStr!).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-gray-600 mb-8">
                <div className="flex justify-between items-center">
                  <span>Total Harga</span>
                  <span className="font-medium">{formatRupiah(fullPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Opsi Bayar</span>
                  <span
                    className={`font-medium px-2 py-0.5 rounded text-xs ${
                      paymentOption === "full"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {paymentOption === "full" ? "Lunas" : "DP 50%"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                  <span className="font-bold text-gray-900">Total Tagihan</span>
                  <span className="font-extrabold text-xl text-blue-600">
                    {formatRupiah(amountToPay)}
                  </span>
                </div>
              </div>

              {/* LOGIKA TOMBOL */}
              {user ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>Memproses...</>
                  ) : (
                    <>
                      Lanjut Pembayaran <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-orange-800 mb-1">
                        Login Diperlukan
                      </p>
                      <p className="text-xs text-orange-700 leading-relaxed">
                        Masuk untuk melanjutkan pesanan dan mendapatkan poin
                        member.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <LogIn className="w-5 h-5" />
                    Masuk / Daftar
                  </button>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-[10px] text-gray-400">
                  Dengan melanjutkan, Anda menyetujui{" "}
                  <span className="underline cursor-pointer hover:text-blue-600">
                    Syarat & Ketentuan
                  </span>{" "}
                  kami.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
