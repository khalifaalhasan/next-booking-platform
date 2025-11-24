'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Lock, Mail, User, CheckCircle2, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthDialog() {
  const router = useRouter();
  const supabase = createClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State Khusus UI
  const [activeTab, setActiveTab] = useState('login');
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false); // Untuk tampilan "Cek Email"

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Handle Login
  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message === 'Invalid login credentials' ? 'Email atau password salah' : error.message);
      setLoading(false);
    } else {
      setIsOpen(false);
      router.refresh();
      setLoading(false);
    }
  };

  // Handle Register
  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: fullName },
        // Opsional: Redirect ke halaman tertentu setelah klik link email
        emailRedirectTo: `${location.origin}/auth/callback` 
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // SUKSES: Tampilkan UI instruksi cek email
      setIsRegisterSuccess(true);
      setLoading(false);
    }
  };

  // Reset state saat dialog ditutup/dibuka
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form saat tutup
      setTimeout(() => {
        setIsRegisterSuccess(false);
        setErrorMsg('');
        setActiveTab('login');
      }, 300);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 font-bold text-white">
          Masuk / Daftar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[400px] backdrop-blur-sm bg-white/95">
        
        {/* --- VIEW 1: SUKSES REGISTER (INSTRUKSI EMAIL) --- */}
        {isRegisterSuccess ? (
          <div className="flex flex-col items-center text-center py-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <Mail className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Cek Email Anda</h2>
            <p className="text-gray-500 text-sm mb-6">
              Kami telah mengirimkan link verifikasi ke <strong>{email}</strong>.<br/>
              Silakan klik link tersebut untuk mengaktifkan akun.
            </p>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full">
              Tutup & Cek Email
            </Button>
            <p className="text-xs text-gray-400 mt-4">
              Belum terima email? Cek folder Spam/Junk.
            </p>
          </div>
        ) : (
          
          /* --- VIEW 2: FORM LOGIN/REGISTER --- */
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-blue-600">
                Pusat Bisnis
              </DialogTitle>
              <DialogDescription className="text-center">
                Kelola pesanan gedung & aset Anda.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Masuk</TabsTrigger>
                <TabsTrigger value="register">Daftar</TabsTrigger>
              </TabsList>

              {/* TAB LOGIN */}
              <TabsContent value="login">
                <form onSubmit={onLogin} className="space-y-4">
                  {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-200">{errorMsg}</div>}
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input type="email" placeholder="nama@email.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Masuk Sekarang'}
                  </Button>
                </form>
              </TabsContent>

              {/* TAB REGISTER */}
              <TabsContent value="register">
                <form onSubmit={onRegister} className="space-y-4">
                  {errorMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-200">{errorMsg}</div>}

                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="Budi Santoso" className="pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input type="email" placeholder="nama@email.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Daftar Akun Baru'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}