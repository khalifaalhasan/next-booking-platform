'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, User, Phone, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function UserProfile() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(''); // Read only

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone_number || '');
        setEmail(profile.email || user.email || '');
      }
      setLoading(false);
    };
    getProfile();
  }, [supabase, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone_number: phone,
      })
      .eq('id', user.id);

    if (error) {
      toast.error("Gagal menyimpan profil");
    } else {
      toast.success("Profil berhasil diperbarui!");
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan Akun</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profil Saya</CardTitle>
          <CardDescription>Perbarui informasi pribadi Anda di sini.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input value={email} disabled className="pl-10 bg-gray-50 cursor-not-allowed" />
              </div>
              <p className="text-xs text-gray-500">Email tidak dapat diubah.</p>
            </div>

            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="pl-10" 
                  placeholder="Nama Anda"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nomor WhatsApp / HP</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="pl-10" 
                  placeholder="0812..."
                />
              </div>
              <p className="text-xs text-gray-500">Digunakan untuk konfirmasi booking mendesak.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}