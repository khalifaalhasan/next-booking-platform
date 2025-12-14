"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/admin/AdminPageheader";
import { User } from "@supabase/supabase-js"; // Import Tipe User

// Schema Validasi
const profileSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AdminProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Menggunakan tipe User resmi
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Setup Form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      email: "",
    },
  });

  // 1. Fetch User Data saat Load
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        form.reset({
          full_name: user.user_metadata?.full_name || "",
          email: user.email || "",
        });
      }
    };
    getUser();
  }, [supabase, form]);

  // 2. Handle Upload Avatar
  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload ke Bucket 'images'
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get URL
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
      toast.success("Foto berhasil diupload (Klik Simpan untuk menerapkan)");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Gagal upload avatar";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Submit Update Profile
  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: values.full_name,
          avatar_url: avatarUrl,
        },
      });

      if (error) throw error;

      toast.success("Profil berhasil diperbarui");
      router.refresh();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Gagal update profil";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi akun dan tampilan profil Anda."
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
            <CardDescription>
              Foto profil dan nama ini akan ditampilkan di pojok kanan atas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* SECTION AVATAR */}
                <div className="flex flex-col items-center sm:flex-row gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-2 border-slate-100 shadow-sm">
                      <AvatarImage
                        src={avatarUrl || ""}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-slate-100 text-slate-400">
                        <UserIcon className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>

                    {/* Overlay Upload Button */}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <h3 className="font-medium text-slate-900">Foto Profil</h3>
                    <p className="text-xs text-slate-500">
                      Format: JPG, PNG. Maksimal 2MB. <br />
                      Klik foto untuk mengganti.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-slate-50" />
                        </FormControl>
                        <FormDescription>
                          Email tidak dapat diubah secara langsung.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap / Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Admin UPT" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading || uploading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
