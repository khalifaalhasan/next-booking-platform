"use client";

import { useState, ChangeEvent } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

// 1. Tipe Data dari Database
interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

// 2. Tipe Data Form
interface TeamFormValues {
  name: string;
  position: string;
  sort_order: number;
  bio: string | null;
}

// 3. Schema Validasi Yup
const formSchema: yup.ObjectSchema<TeamFormValues> = yup.object({
  name: yup.string().required("Nama lengkap wajib diisi"),
  position: yup.string().required("Jabatan wajib diisi"),
  bio: yup.string().nullable().defined().default(null),
  sort_order: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required("Urutan wajib diisi")
    .min(1, "Urutan minimal 1"),
});

interface TeamFormProps {
  initialData?: TeamMember | null;
  onSuccess?: () => void;
}

export default function TeamForm({ initialData, onSuccess }: TeamFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // State khusus untuk File Upload
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.image_url || null
  );

  // Setup Form
  const form = useForm<TeamFormValues>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      position: initialData?.position || "",
      bio: initialData?.bio || "",
      sort_order: initialData?.sort_order || 1,
    },
  });

  // Handle saat user memilih file gambar
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validasi ukuran (opsional, misal max 2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Buat preview lokal
    }
  };

  // Handle hapus gambar (opsional)
  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(null);
    // Reset value input file secara manual jika perlu (via ref), tapi state cukup
  };

  const onSubmit: SubmitHandler<TeamFormValues> = async (values) => {
    try {
      setLoading(true);

      let finalImageUrl = initialData?.image_url || null;

      // 1. PROSES UPLOAD GAMBAR (Jika ada file baru dipilih)
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`; // Nama file unik
        const filePath = `teams/${fileName}`; // Folder 'teams' di dalam bucket

        // Upload ke Supabase Storage (Pastikan bucket 'images' sudah dibuat)
        const { error: uploadError } = await supabase.storage
          .from("images") // Ganti dengan nama bucket Anda
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Ambil URL Publik
        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      } else if (previewUrl === null) {
        // Jika user menghapus gambar (klik silang), set null
        finalImageUrl = null;
      }

      // 2. PERSIAPAN PAYLOAD DB
      const payload = {
        name: values.name,
        position: values.position,
        bio: values.bio === "" ? null : values.bio,
        sort_order: values.sort_order,
        image_url: finalImageUrl,
      };

      // 3. SIMPAN KE DATABASE
      if (initialData) {
        // --- UPDATE ---
        const { error } = await supabase
          .from("teams")
          .update(payload)
          .eq("id", initialData.id);
        if (error) throw error;
        toast.success("Data berhasil diperbarui");
      } else {
        // --- INSERT ---
        const { error } = await supabase.from("teams").insert([payload]);
        if (error) throw error;
        toast.success("Tim baru berhasil ditambahkan");
      }

      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error(error);
      let message = "Terjadi kesalahan";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* --- SECTION UPLOAD FOTO --- */}
        <div className="space-y-2">
          <FormLabel>Foto Profil</FormLabel>
          <div className="flex items-start gap-4">
            {/* Preview Area */}
            <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  {/* Tombol Hapus Gambar */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl shadow hover:bg-red-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <Upload className="w-8 h-8 text-slate-300" />
              )}
            </div>

            {/* Input File */}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer file:cursor-pointer file:text-blue-600 file:font-medium"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Format: JPG, PNG. Maks 2MB. Disarankan rasio 1:1 (Kotak).
              </p>
            </div>
          </div>
        </div>

        {/* --- FIELD NAMA --- */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Nama..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* --- FIELD JABATAN --- */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jabatan</FormLabel>
                <FormControl>
                  <Input placeholder="Jabatan..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- FIELD URUTAN --- */}
          <FormField
            control={form.control}
            name="sort_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urutan</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- FIELD BIO --- */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio / Quote</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi..."
                  className="resize-none h-20"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- TOMBOL SUBMIT --- */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Simpan Perubahan" : "Tambah Anggota"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
