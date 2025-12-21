"use client";

import { useState, useEffect, Suspense } from "react"; // Tambah Suspense
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Komponen Form Login dipisah agar bisa dibungkus Suspense (Wajib di Next.js App Router saat pakai useSearchParams)
function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();

  // Ambil Error dari URL
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");
  const nextUrl = searchParams.get("next") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Efek untuk mendeteksi Error Link Expired saat halaman dimuat
  useEffect(() => {
    if (errorParam) {
      // FIX: Gunakan setTimeout agar update state bersifat asynchronous
      // Ini menghilangkan error ESLint "setState synchronously within an effect"
      const timer = setTimeout(() => {
        // Cek apakah error karena link expired atau invalid
        if (
          errorParam.includes("expired") ||
          errorParam.includes("invalid") ||
          errorParam.includes("auth_callback_failed") ||
          (errorDesc && errorDesc.includes("expired"))
        ) {
          setErrorMsg(
            "Link verifikasi telah kedaluwarsa atau tidak valid. Silakan coba lagi."
          );
        } else {
          // Error umum lainnya
          setErrorMsg(decodeURIComponent(errorParam));
        }
      }, 0);

      // Cleanup function untuk mencegah memory leak
      return () => clearTimeout(timer);
    }
  }, [errorParam, errorDesc]);

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
          ? "Email atau kata sandi salah."
          : error.message
      );
      setLoading(false);
    } else {
      toast.success("Login Berhasil", { description: "Mengalihkan anda..." });
      router.refresh();
      router.replace(nextUrl);
    }
  };

  return (
    <div className="p-8">
      {/* --- ALERT ERROR KHUSUS --- */}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex flex-col gap-2 mb-6 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-2 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="pt-0.5">{errorMsg}</span>
          </div>

          {/* Jika error expired, tawarkan tombol cepat ke Lupa Password */}
          {(errorMsg.includes("kedaluwarsa") ||
            errorMsg.includes("expired")) && (
            <Link href="/forgot-password">
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-1 bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Kirim Ulang Link Reset
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Button Google (Disabled) */}
      <Button
        variant="outline"
        disabled
        className="w-full h-12 bg-slate-50 text-slate-400 font-medium border-slate-200 rounded-xl flex items-center justify-center gap-3 mb-6 cursor-not-allowed opacity-70"
      >
        <span>Masuk dengan Google (Segera)</span>
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold text-slate-400">
          <span className="bg-white px-3">Atau via Email</span>
        </div>
      </div>

      <form onSubmit={onLogin} className="space-y-5">
        <div className="space-y-2">
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
              className="h-11 pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-lg transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">
              Password
            </Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 pl-10 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-lg transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? (
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
            "Masuk Sekarang"
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-bold text-blue-600 hover:underline"
        >
          Daftar Gratis
        </Link>
      </p>
    </div>
  );
}

// Main Component (Wrapper untuk Suspense)
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-900/5">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-blue-600 py-10 text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <Link
            href="/"
            className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="relative z-10 px-6">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              Selamat Datang Kembali!
            </h1>
            <p className="text-blue-100 text-sm">
              Masuk untuk mengelola akun Anda.
            </p>
          </div>
        </div>

        {/* CONTENT with Suspense */}
        <Suspense
          fallback={
            <div className="p-10 text-center text-slate-400">
              Memuat form...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
