"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const onUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (isMismatch) {
      setErrorMsg("Kata sandi tidak cocok.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      setLoading(false);
      return;
    }

    // Fungsi Supabase untuk update user data (termasuk password)
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      toast.success("Kata Sandi Berhasil Diubah!", {
        description: "Silakan login dengan kata sandi baru Anda.",
      });
      // Redirect ke login atau dashboard
      router.replace("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-900/5">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-slate-900 py-10 text-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative z-10 px-6">
            <div className="mx-auto w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 text-green-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              Buat Kata Sandi Baru
            </h1>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Amankan akun Anda dengan kombinasi kata sandi yang kuat.
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="p-8">
          <form onSubmit={onUpdatePassword} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{" "}
                <span className="pt-0.5">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">
                Kata Sandi Baru
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pl-10 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-lg transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? (
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
                    isMismatch ? "text-red-400" : "text-slate-400"
                  }`}
                />
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`h-11 pl-10 pr-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all focus:ring-2 ${
                    isMismatch
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {isMismatch && (
                <div className="flex items-center gap-2 mt-1 animate-in slide-in-from-top-1 fade-in text-red-500">
                  <XCircle className="w-3 h-3" />
                  <span className="text-[10px] font-bold">
                    Kata sandi tidak cocok
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || isMismatch}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Simpan Kata Sandi Baru"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
