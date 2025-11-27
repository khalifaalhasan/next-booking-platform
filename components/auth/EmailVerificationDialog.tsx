"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input untuk edit email
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, ShieldAlert, Pencil, ArrowLeft, Timer } from "lucide-react"; // Tambah Icon
import { toast } from "sonner";

interface VerificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string; // Email awal dari props
  onSuccess?: () => void;
}

export default function EmailVerificationDialog({
  open,
  onOpenChange,
  email: initialEmail, // Rename jadi initialEmail
  onSuccess,
}: VerificationProps) {
  const router = useRouter();
  const supabase = createClient();

  // State Utama
  const [currentEmail, setCurrentEmail] = useState(initialEmail);
  const [step, setStep] = useState<"send" | "verify" | "edit">("send");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  // State Edit Email
  const [newEmailInput, setNewEmailInput] = useState(initialEmail);

  // State Countdown (60 detik default Supabase)
  const [timeLeft, setTimeLeft] = useState(0);

  // LOGIC COUNTDOWN
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  // 1. KIRIM KODE OTP
  const handleSendOtp = async () => {
    // Cek countdown
    if (timeLeft > 0) {
      toast.warning(`Mohon tunggu ${timeLeft} detik lagi.`);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: currentEmail,
      options: { shouldCreateUser: false },
    });

    if (error) {
      // Menangani error rate limit Supabase (biasanya 429)
      if (error.message.includes("rate limit") || error.status === 429) {
        toast.error("Terlalu Banyak Permintaan", {
          description: "Silakan tunggu 60 detik sebelum mencoba lagi.",
        });
        setTimeLeft(60); // Set hukuman waktu
      } else {
        toast.error("Gagal mengirim kode", { description: error.message });
      }
      setLoading(false);
    } else {
      toast.success("Kode Terkirim", {
        description: `Cek inbox ${currentEmail}`,
      });
      setStep("verify");
      setTimeLeft(60); // Mulai hitung mundur 60 detik
      setLoading(false);
    }
  };

  // 2. UPDATE EMAIL (FITUR BARU)
  const handleUpdateEmail = async () => {
    if (!newEmailInput || newEmailInput === currentEmail) {
      setStep("send");
      return;
    }

    setLoading(true);

    // Update email user di Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      email: newEmailInput,
    });

    if (error) {
      toast.error("Gagal Mengganti Email", { description: error.message });
      setLoading(false);
    } else {
      toast.success("Email Diperbarui", {
        description: "Kode verifikasi dikirim ke email baru.",
      });

      // Update state lokal
      setCurrentEmail(newEmailInput);

      // Supabase biasanya otomatis kirim OTP ke email baru saat update,
      // tapi untuk memastikan flow UX, kita arahkan ke step verify
      setStep("verify");
      setTimeLeft(60);
      setLoading(false);
    }
  };

  // 3. VERIFIKASI KODE
  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: currentEmail, // Pastikan pakai email yang terbaru
      token: otp,
      type: "email",
    });

    if (error) {
      toast.error("Kode Salah/Kadaluarsa", { description: "Coba lagi." });
      setLoading(false);
    } else {
      // Update Metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { email_verified_custom: true },
      });

      if (updateError) {
        toast.error("Gagal update status user");
      } else {
        toast.success("Email Terverifikasi!", {
          description: "Akun Anda kini aktif.",
        });
        setStep("send");
        setOtp("");
        onOpenChange(false);
        if (onSuccess) onSuccess();
        router.refresh();
      }
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "edit" ? "Ganti Alamat Email" : "Verifikasi Keamanan"}
          </DialogTitle>
          <DialogDescription>
            {step === "send" &&
              "Demi keamanan, verifikasi email Anda sebelum lanjut."}
            {step === "verify" && "Masukkan 6 digit kode OTP."}
            {step === "edit" && "Masukkan alamat email yang benar."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          {/* TAMPILAN 1: SEND OTP (AWAL) */}
          {step === "send" && (
            <div className="text-center space-y-4 w-full">
              <div className="bg-orange-100 p-4 rounded-full mx-auto w-fit">
                <ShieldAlert className="w-10 h-10 text-orange-600" />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="text-left overflow-hidden">
                  <p className="text-xs text-slate-400">Email Tujuan</p>
                  <p
                    className="text-sm font-bold text-slate-700 truncate max-w-[200px]"
                    title={currentEmail}
                  >
                    {currentEmail}
                  </p>
                </div>
                {/* Tombol Edit Email */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setNewEmailInput(currentEmail);
                    setStep("edit");
                  }}
                  className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={loading || timeLeft > 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                {timeLeft > 0
                  ? `Tunggu ${timeLeft} detik...`
                  : "Kirim Kode OTP"}
              </Button>
            </div>
          )}

          {/* TAMPILAN 2: INPUT OTP */}
          {step === "verify" && (
            <div className="space-y-6 w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Kode dikirim ke:</p>
                <p className="text-sm font-bold text-gray-900">
                  {currentEmail}
                </p>
                <button
                  onClick={() => setStep("edit")}
                  className="text-[10px] text-blue-600 hover:underline mt-1"
                >
                  (Bukan email anda? Ganti disini)
                </button>
              </div>

              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <div className="flex flex-col gap-2 w-full">
                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Verifikasi & Lanjut"
                  )}
                </Button>

                {/* Tombol Resend dengan Countdown */}
                <Button
                  variant="ghost"
                  onClick={handleSendOtp}
                  disabled={timeLeft > 0 || loading}
                  className="text-xs text-gray-500 flex items-center gap-2"
                >
                  {timeLeft > 0 ? (
                    <>
                      <Timer className="w-3 h-3" /> Kirim ulang dalam {timeLeft}
                      s
                    </>
                  ) : (
                    "Tidak terima kode? Kirim Ulang"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* TAMPILAN 3: EDIT EMAIL FORM */}
          {step === "edit" && (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-left-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Alamat Email Baru
                </p>
                <Input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="contoh@email.com"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("send")}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Batal
                </Button>
                <Button
                  onClick={handleUpdateEmail}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Simpan & Kirim"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
