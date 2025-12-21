"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Loader2, Mail, Lock, User, ArrowLeft, CheckCircle2, Eye, EyeOff, AlertCircle, XCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Toggles
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validation
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (isMismatch) {
        setErrorMsg("Password konfirmasi tidak cocok.");
        setLoading(false);
        return;
    }

    if (password.length < 6) {
        setErrorMsg("Password minimal 6 karakter.");
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

    // Cek apakah session langsung ada (Auto confirm OFF) atau butuh verifikasi email
    if (data.session) {
      toast.success("Akun Berhasil Dibuat!");
      router.push("/dashboard");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Cek Email Anda</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Link verifikasi telah dikirim ke <span className="font-semibold text-slate-900">{email}</span>. <br/>Silakan cek kotak masuk atau folder spam Anda.
          </p>
          <Link href="/login">
            <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
              Kembali ke Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-900/5">
        
        {/* HEADER */}
        <div className="relative overflow-hidden bg-slate-900 py-10 text-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <Link href="/" className="absolute top-4 left-4 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="relative z-10 px-6">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Mulai Perjalanan Anda 🚀</h1>
            <p className="text-slate-400 text-sm">Buat akun gratis dalam hitungan detik.</p>
          </div>
        </div>

        {/* FORM */}
        <div className="p-8">
          <form onSubmit={onRegister} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> <span className="pt-0.5">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Sesuai identitas" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-11 pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-lg transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-lg transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input type={showPass ? "text" : "password"} placeholder="Min. 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 pl-10 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-lg transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-600 font-medium text-xs uppercase tracking-wide">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-3.5 h-4 w-4 ${isMismatch ? "text-red-400" : "text-slate-400"}`} />
                <Input 
                    type={showConfirm ? "text" : "password"} 
                    placeholder="Ulangi password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className={`h-11 pl-10 pr-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 ${isMismatch ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "focus:border-blue-500 focus:ring-blue-100"}`} 
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isMismatch && (
                <div className="flex items-center gap-2 mt-1 animate-in slide-in-from-top-1 fade-in text-red-500">
                    <XCircle className="w-3 h-3" />
                    <span className="text-[10px] font-bold">Password tidak cocok</span>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading || isMismatch} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:shadow-blue-300 hover:-translate-y-0.5 mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buat Akun Gratis"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:underline">
              Masuk Disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}