"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Loader2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Supabase akan mengirim email berisi link untuk reset password.
    // Link tersebut akan mengarah ke endpoint /auth/callback (jika ada)
    // atau kita arahkan langsung ke halaman update password.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setIsSuccess(true);
      setLoading(false);
      toast.success("Email pemulihan terkirim!");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300 ring-1 ring-slate-900/5">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Email Terkirim!
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed text-sm">
            Kami telah mengirimkan instruksi pemulihan kata sandi ke{" "}
            <span className="font-semibold text-slate-900">{email}</span>.{" "}
            <br />
            Cek folder Inbox atau Spam Anda.
          </p>
          <Link href="/login">
            <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold">
              Kembali ke Login
            </Button>
          </Link>
          <button
            onClick={() => setIsSuccess(false)}
            className="mt-6 text-xs text-slate-400 hover:text-slate-600 font-medium underline"
          >
            Salah email? Kirim ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-900/5">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-blue-600 py-10 text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <Link
            href="/login"
            className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="relative z-10 px-6">
            <div className="mx-auto w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 text-white">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              Lupa Kata Sandi?
            </h1>
            <p className="text-blue-100 text-sm max-w-xs mx-auto">
              Jangan khawatir, kami akan membantu Anda mengatur ulang kata
              sandi.
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="p-8">
          <form onSubmit={onReset} className="space-y-6">
            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{" "}
                <span className="pt-0.5">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">
                Email Terdaftar
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:shadow-blue-300 hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Kirim Link Pemulihan"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Ingat kata sandi Anda?{" "}
            <Link
              href="/login"
              className="font-bold text-blue-600 hover:underline"
            >
              Masuk Disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
