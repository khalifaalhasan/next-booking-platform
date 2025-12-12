"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tables } from "@/types/supabase";

// SCHEMA VALIDASI
// Kita gunakan z.string().optional() untuk bio agar aman
const teamSchema = z.object({
  name: z.string().min(2, "Nama wajib diisi"),
  position: z.string().min(2, "Jabatan wajib diisi"),
  bio: z.string().optional(), 
  sort_order: z.coerce.number().min(0),
});

type TeamFormValues = z.infer<typeof teamSchema>;
type TeamMember = Tables<"teams">;

interface TeamFormProps {
  initialData?: TeamMember | null;
  onSuccessAction: () => void;
}

export default function TeamForm({ initialData, onSuccessAction }: TeamFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<string>("");

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      position: "",
      bio: "",
      sort_order: 0,
    },
  });

  // Reset Form
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        position: initialData.position,
        // Konversi null ke string kosong agar sesuai schema Zod
        bio: initialData.bio || "", 
        sort_order: initialData.sort_order,
      });
      setImage(initialData.image_url || "");
    } else {
      form.reset({
        name: "",
        position: "",
        bio: "",
        sort_order: 0,
      });
      setImage("");
    }
  }, [initialData, form]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `teams/${Date.now()}.${fileExt}`;

    try {
      const { error } = await supabase.storage.from("images").upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      setImage(data.publicUrl);
    } catch {
      toast.error("Gagal upload foto");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: TeamFormValues) => {
    setLoading(true);
    try {
      // Payload ke DB (bio boleh null)
      const payload = { 
          name: values.name,
          position: values.position,
          bio: values.bio || null, 
          sort_order: values.sort_order,
          image_url: image || null 
      };
      
      if (initialData) {
        await supabase.from("teams").update(payload).eq("id", initialData.id);
        toast.success("Data tim diperbarui");
      } else {
        await supabase.from("teams").insert(payload);
        toast.success("Anggota tim ditambahkan");
      }

      router.refresh();
      onSuccessAction();
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Upload Foto UI */}
        <div className="flex justify-center mb-4">
             <div className="relative w-32 h-40 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center overflow-hidden group hover:border-blue-400 transition cursor-pointer">
                {image ? (
                    <>
                        <Image src={image} alt="Profile" fill className="object-cover" />
                        <button type="button" onClick={() => setImage("")} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition z-10"><X className="h-3 w-3" /></button>
                    </>
                ) : (
                    <div className="text-center text-slate-400">
                        {uploading ? <Loader2 className="w-6 h-6 animate-spin mx-auto"/> : <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />}
                        <span className="text-[10px]">Upload Foto</span>
                    </div>
                )}
                {!image && !uploading && <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />}
             </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl><Input placeholder="Dr. Fulan..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="position" render={({ field }) => (
                <FormItem>
                    <FormLabel>Jabatan</FormLabel>
                    <FormControl><Input placeholder="Kepala Pusat..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>

        <FormField control={form.control} name="bio" render={({ field }) => (
            <FormItem>
                <FormLabel>Bio Singkat</FormLabel>
                {/* Pastikan value selalu string (default "") */}
                <FormControl><Textarea className="h-20" placeholder="Deskripsi singkat..." {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <FormField control={form.control} name="sort_order" render={({ field }) => (
            <FormItem>
                <FormLabel>Urutan Tampil</FormLabel>
                <FormControl>
                    <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(e.target.valueAsNumber)} 
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onSuccessAction} disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
        </div>
      </form>
    </Form>
  );
}