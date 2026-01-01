"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  XCircle, // Icon baru untuk alert mismatch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";

// --- ASSETS ---
const GoogleIcon = ({ grayscale = false }: { grayscale?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-5 h-5 ${grayscale ? "grayscale opacity-50" : ""}`}
    aria-hidden="true"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: "login" | "register";
}

export default function AuthDialog({
  open,
  onOpenChange,
  defaultView = "login",
}: AuthDialogProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Visibility Toggles
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Real-time Validation State
  const isPasswordMismatch =
    activeTab === "register" &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setActiveTab(defaultView);
        setErrorMsg("");
        setIsRegisterSuccess(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, defaultView]);

  const resetForm = () => {
    setIsRegisterSuccess(false);
    setErrorMsg("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setShowLoginPass(false);
    setShowRegPass(false);
    setShowConfirmPass(false);
  };

  const handleGoogleLogin = async () => {
    // DISABLED sementara
    toast.info("Fitur Google Login segera hadir!");
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(
        error.message === "Invalid login credentials"
          ? "Email atau kata sandi tidak cocok."
          : error.message
      );
      setLoading(false);
    } else {
      toast.success("Selamat Datang Kembali! 👋");
      onOpenChange(false);
      router.refresh();
      setLoading(false);
      resetForm();
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Validasi Final sebelum Submit
    if (password !== confirmPassword) {
      setErrorMsg("Kata sandi dan konfirmasi tidak cocok.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, email_verified_custom: false },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      toast.success("Akun Berhasil Dibuat!", {
        description: "Selamat bergabung di ekosistem kami.",
      });
      onOpenChange(false);
      router.refresh();
      resetForm();
    } else {
      setIsRegisterSuccess(true);
    }
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) setTimeout(resetForm, 300);
      }}
    >
      <DialogContent className="sm:max-w-[450px] p-0 gap-0 bg-white overflow-hidden border-0 shadow-2xl rounded-2xl ring-1 ring-slate-900/5">
        {/* --- HEADER PREMIUM BLUE --- */}
        <div className="relative overflow-hidden bg-blue-600 py-10 text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative z-10 px-6">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              {activeTab === "login"
                ? "Halo, Partner Bisnis! 👋"
                : "Mulai Perjalanan Anda 🚀"}
            </h2>
            <p className="text-blue-100 text-sm max-w-xs mx-auto leading-relaxed">
              {activeTab === "login"
                ? "Masuk untuk mengelola pesanan dan akses layanan eksklusif."
                : "Bergabung sekarang untuk akselerasi pertumbuhan bisnis Anda."}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-white relative">
          {isRegisterSuccess ? (
            <div className="flex flex-col items-center text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Cek Email Masuk Anda
              </h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-xs">
                Link verifikasi telah dikirim ke{" "}
                <span className="font-semibold text-slate-800">{email}</span>.
              </p>
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12 rounded-xl font-medium"
              >
                Siap, Saya Cek Sekarang
              </Button>
            </div>
          ) : (
            <>
              {/* --- GOOGLE DISABLED --- */}
              <Button
                variant="outline"
                disabled
                className="w-full h-12 bg-slate-50 text-slate-400 font-medium border-slate-200 rounded-xl flex items-center justify-center gap-3 mb-6 cursor-not-allowed opacity-70"
              >
                <GoogleIcon grayscale />
                <span>Google (Segera Hadir)</span>
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold text-slate-400">
                  <span className="bg-white px-3">Atau via Email</span>
                </div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6">
                  <TabsTrigger
                    value="login"
                    className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all py-2.5"
                  >
                    Masuk
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all py-2.5"
                  >
                    Daftar Baru
                  </TabsTrigger>
                </TabsList>

                {/* --- LOGIN FORM --- */}
                <TabsContent
                  value="login"
                  className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-2 duration-300"
                >
                  <form onSubmit={onLogin} className="space-y-5">
                    {errorMsg && (
                      <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-100 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />{" "}
                        <span className="pt-0.5">{errorMsg}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="nama@perusahaan.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 pl-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">
                          Kata Sandi
                        </Label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          type={showLoginPass ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11 pl-10 pr-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPass(!showLoginPass)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                          {showLoginPass ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:shadow-blue-300 hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Masuk ke Dashboard"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* --- REGISTER FORM --- */}
                <TabsContent
                  value="register"
                  className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  <form onSubmit={onRegister} className="space-y-4">
                    {errorMsg && (
                      <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-100 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />{" "}
                        <span className="pt-0.5">{errorMsg}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">
                        Nama Lengkap
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Nama sesuai identitas"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="h-11 pl-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="nama@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 pl-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">
                        Kata Sandi
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          type={showRegPass ? "text" : "password"}
                          placeholder="Min. 6 karakter"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11 pl-10 pr-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPass(!showRegPass)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                          {showRegPass ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">
                        Konfirmasi Kata Sandi
                      </Label>
                      <div className="relative">
                        <Lock
                          className={`absolute left-3.5 top-3.5 h-4 w-4 ${
                            isPasswordMismatch
                              ? "text-red-400"
                              : "text-slate-400"
                          }`}
                        />
                        <Input
                          type={showConfirmPass ? "text" : "password"}
                          placeholder="Ulangi kata sandi"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className={`h-11 pl-10 pr-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:border-blue-500 ${
                            isPasswordMismatch
                              ? "border-red-300 focus:ring-red-100 focus:border-red-500"
                              : "focus:ring-blue-100"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPass ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* --- REALTIME ALERT MISMATCH --- */}
                      {isPasswordMismatch && (
                        <div className="flex items-center gap-2 mt-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs font-medium text-red-500">
                            Kata sandi tidak cocok
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || isPasswordMismatch}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-blue-300 hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="flex items-center">
                          Buat Akun Gratis{" "}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                      )}
                    </Button>

                    <p className="text-[10px] text-slate-400 text-center px-4 leading-tight mt-2">
                      Dengan mendaftar, Anda menyetujui{" "}
                      <span className="underline cursor-pointer hover:text-blue-600">
                        Syarat & Ketentuan
                      </span>{" "}
                      kami.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
