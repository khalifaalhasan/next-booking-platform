"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash, UploadCloud, X, Wand2 } from "lucide-react"; // Tambah icon Wand2

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema Validasi
const serviceSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.coerce.number().min(1000, "Harga minimal 1000"),
  unit: z.enum(["per_day", "per_hour"]),
  is_active: z.boolean().default(true),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export default function ServiceForm({
  initialData,
  onSuccess,
}: ServiceFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploading, setUploading] = useState(false);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    initialData?.specifications
      ? Object.entries(initialData.specifications).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : [{ key: "", value: "" }]
  );

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      unit: initialData?.unit || "per_day",
      is_active: initialData?.is_active ?? true,
    },
  });

  // --- FITUR BARU: AUTO GENERATE SLUG ---
  // Pantau perubahan pada field 'name'
  const watchedName = form.watch("name");

  useEffect(() => {
    // Hanya auto-generate jika:
    // 1. Bukan mode EDIT (initialData kosong)
    // 2. Ada nama yang diketik
    if (!initialData && watchedName) {
      const slug = watchedName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Hapus karakter aneh
        .replace(/[\s_-]+/g, "-") // Ganti spasi dengan -
        .replace(/^-+|-+$/g, ""); // Hapus - di awal/akhir

      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [watchedName, initialData, form]);

  // Fitur Manual Generate (Tombol Magic)
  const handleGenerateSlug = () => {
    const currentName = form.getValues("name");
    if (currentName) {
      const slug = currentName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  };
  // --------------------------------------

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `service-${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    try {
      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, file);
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);
      setImages([...images, publicUrl]);
    } catch (error: any) {
      alert("Gagal upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: ServiceFormValues) => {
    setLoading(true);
    try {
      const specsObject = specs.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      const payload = {
        ...values,
        images: images,
        specifications: specsObject,
      };
      let error;

      if (initialData) {
        const { error: updateError } = await supabase
          .from("services")
          .update(payload)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("services")
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;
      router.refresh();
      onSuccess();
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (index: number) =>
    setSpecs(specs.filter((_, i) => i !== index));
  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Service</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Gedung A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug URL</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="gedung-a" {...field} />
                  </FormControl>
                  {/* Tombol Manual Generate (opsional) */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGenerateSlug}
                    title="Generate slug otomatis"
                  >
                    <Wand2 className="h-4 w-4 text-blue-600" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Satuan</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="per_day">Harian</SelectItem>
                    <SelectItem value="per_hour">Jam</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea className="h-20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* GAMBAR */}
        <div>
          <FormLabel>Foto</FormLabel>
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden border group"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed rounded cursor-pointer hover:bg-slate-50">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-5 w-5 text-slate-400" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* SPECS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Spesifikasi</FormLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addSpec}
              className="h-6 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" /> Tambah
            </Button>
          </div>
          {specs.map((spec, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="Label"
                className="h-8 text-sm"
                value={spec.key}
                onChange={(e) => updateSpec(idx, "key", e.target.value)}
              />
              <Input
                placeholder="Nilai"
                className="h-8 text-sm"
                value={spec.value}
                onChange={(e) => updateSpec(idx, "value", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSpec(idx)}
                className="h-8 w-8 text-red-500"
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-sm">Status Aktif</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </div>
      </form>
    </Form>
  );
}
