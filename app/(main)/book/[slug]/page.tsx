"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingSkeleton } from "@/components/ui/Skeleton";
import { User } from "@supabase/supabase-js";
import { differenceInDays, differenceInHours } from "date-fns";
import { CheckCircle2, LogIn, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";
import AuthDialog from "@/components/auth/AuthDialog"; // <--- IMPORT BARU

import { Tables } from "@/types/supabase";

// ... (Helper formatRupiah tetap sama)
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

  // State Dialog Login
  const [isAuthOpen, setIsAuthOpen] = useState(false); // <--- STATE BARU

  // State Form Input
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isForSelf, setIsForSelf] = useState(true);
  const [paymentOption, setPaymentOption] = useState<"full" | "dp">("full");

  // --- 1. FITUR PERSISTENCE (LOAD DRAFT) ---
  // ... (Kode sama persis) ...
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

  // --- 2. FITUR PERSISTENCE (AUTO SAVE) ---
  // ... (Kode sama persis) ...
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

  // --- 3. LOGIC AUTH LISTENER & DATA FETCHING (DIPERBARUI) ---
  useEffect(() => {
    const initData = async () => {
      // Fetch User Awal
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      fillUserData(user); // Isi form jika user ada

      // Fetch Service
      const { data: serviceData } = await supabase
        .from("services")
        .select("*")
        .eq("slug", slug)
        .single();

      setService(serviceData);
      setLoading(false);
    };

    initData();

    // --- REALTIME AUTH LISTENER ---
    // Ini kuncinya: mendeteksi login dari Dialog tanpa refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        fillUserData(session.user);
        setIsAuthOpen(false); // Tutup dialog jika sukses login
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [slug, supabase]);

  // Helper mengisi form dari user data
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

  // Checkbox logic sync
  useEffect(() => {
    if (isForSelf) {
      setGuestName(fullName);
    }
  }, [isForSelf, fullName]);

  // Kalkulasi Harga
  // ... (Kode sama persis) ...
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

  // SUBMIT BOOKING
  // ... (Kode sama persis) ...
  const handleSubmit = async () => {
    if (!user || !service) return;

    if (!fullName || !phone || !email || !guestName) {
      toast.error("Data Belum Lengkap", {
        description: "Mohon lengkapi nama, telepon, dan email pemesan.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          service_id: service.id,
          user_id: user.id,
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

      // Clear draft
      localStorage.removeItem("booking-form-draft");

      router.push(`/payment/${data.id}?type=${paymentOption}`);
    } catch (err: unknown) {
      let message = "Terjadi Kesalahan pada sistem";
      if (err instanceof Error) {
        message = err.message;
      }
      toast.error("Gagal Memproses Booking", {
        description: message,
      });
      setSubmitting(false);
    }
  };

  if (loading) return <BookingSkeleton />;
  if (!service)
    return <div className="p-10 text-center">Layanan tidak ditemukan</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Component Dialog (Invisible unless triggered) */}
      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />

      <div className="bg-white shadow-sm border-b border-gray-200 py-4 mb-8">
        {/* ... Header Content ... */}
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-bold text-gray-800">
            Booking: {service.name}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* KOLOM KIRI */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Auto Save & Card User Data ... (Sama persis dengan kodemu sebelumnya) */}
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-md w-fit animate-fade-in">
              <Save className="w-3 h-3" />
              Data formulir tersimpan otomatis.
            </div>

            {/* CARD 1: Data Pemesan */}
            <div
              className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${
                !user ? "opacity-50 pointer-events-none grayscale-[0.5]" : ""
              }`}
            >
              {/* ... Isi Form Data Pemesan ... */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  👤
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Data Pemesan
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!user}
                    placeholder="Sesuai KTP"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      No. Handphone
                    </label>
                    <input
                      type="tel"
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!user}
                      placeholder="0812..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!user}
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Detail Tamu ... (Sama persis) */}
            <div
              className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${
                !user ? "opacity-50 pointer-events-none grayscale-[0.5]" : ""
              }`}
            >
              {/* ... Isi Detail Tamu ... */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  🏨
                </div>
                <h2 className="text-lg font-bold text-gray-800">Detail Tamu</h2>
              </div>
              <div className="mb-6 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <input
                  type="checkbox"
                  checked={isForSelf}
                  onChange={(e) => setIsForSelf(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  disabled={!user}
                />
                <label className="text-sm font-medium text-gray-700">
                  Sama dengan pemesan
                </label>
              </div>
              {!isForSelf && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nama Lengkap Tamu
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    disabled={!user}
                  />
                </div>
              )}
              {isForSelf && (
                <div className="p-4 bg-gray-50 rounded-lg text-gray-600 text-sm">
                  Tamu: <strong>{fullName || "-"}</strong>
                </div>
              )}
            </div>

            {/* CARD 3: Opsi Pembayaran ... (Sama persis) */}
            <div
              className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${
                !user ? "opacity-50 pointer-events-none grayscale-[0.5]" : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  💳
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Opsi Pembayaran
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setPaymentOption("full")}
                  className={`p-4 border-2 rounded-xl cursor-pointer relative transition-all ${
                    paymentOption === "full"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {paymentOption === "full" && (
                    <CheckCircle2 className="absolute top-4 right-4 text-blue-600 w-6 h-6" />
                  )}
                  <p className="font-bold text-gray-900">Bayar Lunas (Full)</p>
                  <p className="text-lg font-bold text-blue-600 mt-3">
                    {formatRupiah(fullPrice)}
                  </p>
                </div>
                <div
                  onClick={() => setPaymentOption("dp")}
                  className={`p-4 border-2 rounded-xl cursor-pointer relative transition-all ${
                    paymentOption === "dp"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {paymentOption === "dp" && (
                    <CheckCircle2 className="absolute top-4 right-4 text-blue-600 w-6 h-6" />
                  )}
                  <p className="font-bold text-gray-900">Bayar DP 50%</p>
                  <p className="text-lg font-bold text-orange-600 mt-3">
                    {formatRupiah(fullPrice * 0.5)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (STICKY) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Rincian Harga
              </h3>

              {/* ... Detail Service & Harga ... */}
              <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100">
                {service.images?.[0] && (
                  <img
                    src={service.images[0]}
                    alt="img"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-bold text-gray-800 line-clamp-2">
                    {service.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(startDateStr!).toLocaleDateString("id-ID")} -{" "}
                    {new Date(endDateStr!).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Harga Sewa Total</span>
                  <span>{formatRupiah(fullPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600 font-medium">Opsi Bayar</span>
                  <span className="font-medium">
                    {paymentOption === "full" ? "Lunas (100%)" : "DP (50%)"}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg text-blue-600 pt-3 border-t border-gray-100">
                  <span>Yang Harus Dibayar</span>
                  <span>{formatRupiah(amountToPay)}</span>
                </div>
              </div>

              {/* TOMBOL LOGIC DIUBAH DISINI */}
              {user ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {submitting ? "Memproses..." : "Lanjutkan Pembayaran"}
                </button>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-2 items-start">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-800 leading-tight">
                      Masuk untuk menyimpan pesanan dan mendapatkan poin member.
                    </p>
                  </div>

                  {/* BUTTON TRIGGER DIALOG (Bukan Redirect) */}
                  <button
                    onClick={() => setIsAuthOpen(true)} // <--- TRIGGER OPEN DIALOG
                    className="w-full py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <LogIn className="w-5 h-5" />
                    Masuk / Daftar
                  </button>
                </div>
              )}

              <p className="text-xs text-center text-gray-400 mt-4">
                Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
