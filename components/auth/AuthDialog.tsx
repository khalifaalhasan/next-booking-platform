"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation"; // 1. IMPORT USEROUTER
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Logo Google Asli (SVG)
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" aria-hidden="true">
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
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const router = useRouter(); // 2. INISIALISASI ROUTER
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // State UI
  const [activeTab, setActiveTab] = useState("login");
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const resetForm = () => {
    setIsRegisterSuccess(false);
    setErrorMsg("");
    setActiveTab("login");
    setEmail("");
    setPassword("");
    setFullName("");
  };

  // --- HANDLER GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error("Gagal Login Google", { description: error.message });
      setLoading(false);
    }
  };

  // --- HANDLER EMAIL LOGIN (YANG DIPERBAIKI) ---
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
          ? "Email atau password salah"
          : error.message
      );
      setLoading(false);
    } else {
      // 3. STEP PENTING: REFRESH SERVER COMPONENT
      toast.success("Berhasil Masuk");
      onOpenChange(false); // Tutup dialog
      router.refresh(); // <--- INI AKAN UPDATE NAVBAR OTOMATIS
      setLoading(false);
      resetForm();
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setIsRegisterSuccess(true);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) setTimeout(resetForm, 300);
      }}
    >
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-white gap-0">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-center text-white">
          <h2 className="text-xl font-bold">Selamat Datang</h2>
          <p className="text-blue-100 text-sm opacity-90">
            Masuk untuk melanjutkan pesanan
          </p>
        </div>

        <div className="p-6 pt-4">
          {isRegisterSuccess ? (
            <div className="flex flex-col items-center text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Cek Email Anda
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Link verifikasi telah dikirim ke <strong>{email}</strong>.
              </p>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Tutup
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Button
                  variant="outline"
                  className="w-full py-5 text-gray-600 font-medium border-gray-300 hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Lanjutkan dengan Google
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400">
                      Atau email
                    </span>
                  </div>
                </div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Masuk</TabsTrigger>
                  <TabsTrigger value="register">Daftar</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
                  <form onSubmit={onLogin} className="space-y-4">
                    {errorMsg && (
                      <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-start gap-2">
                        <span>⚠️</span> <span>{errorMsg}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Password</Label>
                        <span className="text-xs text-blue-600 cursor-pointer hover:underline">
                          Lupa Password?
                        </span>
                      </div>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Masuk Sekarang"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-0">
                  <form onSubmit={onRegister} className="space-y-4">
                    {errorMsg && (
                      <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                        {errorMsg}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Nama Lengkap</Label>
                      <Input
                        placeholder="Nama Sesuai KTP"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        placeholder="Minimal 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 h-11 text-base"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Daftar Akun Baru"
                      )}
                    </Button>
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
