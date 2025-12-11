"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash, UploadCloud, X, Wand2 } from "lucide-react";
import Image from "next/image";

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

import { Tables } from "@/types/supabase";

type Service = Tables<"services">;
type Category = { id: string; name: string };

// 1. PERBAIKAN SCHEMA
// Hapus .coerce dan .default agar tipe datanya strict (cocok dengan useForm)
const serviceSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  // Ubah ke z.number() murni. Konversi string->number kita handle di onChange inputnya.
  price: z.number().min(1000, "Harga minimal 1000"),
  unit: z.enum(["per_day", "per_hour"]),
  category_id: z.string().min(1, "Wajib pilih kategori"),
  // Hapus .default() karena default value sudah dihandle di useForm
  is_active: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: Service | null;
  onSuccessAction: () => void;
}

export default function ServiceForm({
  initialData,
  onSuccessAction,
}: ServiceFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(() => {
    if (
      initialData?.specifications &&
      typeof initialData.specifications === "object" &&
      !Array.isArray(initialData.specifications)
    ) {
      return Object.entries(initialData.specifications).map(([key, value]) => ({
        key,
        value: String(value),
      }));
    }
    return [{ key: "", value: "" }];
  });

  // 2. SETUP FORM
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      unit: (initialData?.unit as "per_day" | "per_hour") || "per_day",
      category_id: initialData?.category_id || "",
      // Pastikan selalu return boolean, jangan undefined
      is_active: initialData?.is_active ?? true,
    },
  });

  // ... (Sisa kode fetchCategories, useEffect slug, handleGenerateSlug, handleImageUpload SAMA SEPERTI SEBELUMNYA) ...
  // Salin saja logic Fetch Categories, Auto Generate Slug, dan Upload Image dari kode lamamu ke sini.
  // Saya skip bagian itu agar jawaban fokus ke perbaikan error.

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [supabase]);

  // Auto Generate Slug
  const watchedName = form.watch("name");
  useEffect(() => {
    if (!initialData && watchedName) {
      const slug = watchedName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [watchedName, initialData, form]);

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
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Gagal upload gambar";
      alert(msg);
    } finally {
      setUploading(false);
    }
  };

  // Submit
  const onSubmit = async (values: ServiceFormValues) => {
    setLoading(true);
    try {
      const specsObject = specs.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        price: values.price,
        unit: values.unit,
        category_id: values.category_id,
        is_active: values.is_active,
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
      onSuccessAction();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Specs Helper
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
        {/* ... (FIELD NAME & SLUG SAMA SEPERTI SEBELUMNYA) ... */}
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
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGenerateSlug}
                    title="Generate Slug"
                  >
                    <Wand2 className="h-4 w-4 text-blue-600" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FIELD HARGA: Logic onChange manual sudah benar untuk z.number() */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (Rp)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    // field.value di sini akan selalu number (atau 0)
                    value={field.value}
                    onChange={(e) => {
                      // Konversi string input ke number agar sesuai schema z.number()
                      const val =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      field.onChange(val);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ... (FIELD UNIT, CATEGORY, DESC SAMA SEPERTI SEBELUMNYA) ... */}
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
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  className="h-24"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ... (BAGIAN GAMBAR & SPECS SAMA SEPERTI SEBELUMNYA) ... */}
        <div>
          <FormLabel>Foto Galeri</FormLabel>
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden border group"
              >
                <Image src={url} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-slate-50 transition shrink-0">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : (
                <UploadCloud className="h-6 w-6 text-gray-400" />
              )}
              <span className="text-[10px] text-gray-500 mt-1 font-medium">
                Upload
              </span>
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

        <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between">
            <FormLabel>Spesifikasi Teknis</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSpec}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" /> Tambah
            </Button>
          </div>
          {specs.map((spec, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                placeholder="Label (e.g. Luas)"
                className="h-9 text-sm bg-white"
                value={spec.key}
                onChange={(e) => updateSpec(idx, "key", e.target.value)}
              />
              <Input
                placeholder="Nilai (e.g. 100m)"
                className="h-9 text-sm bg-white"
                value={spec.value}
                onChange={(e) => updateSpec(idx, "value", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSpec(idx)}
                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* FIELD IS_ACTIVE (PERBAIKAN) */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-white">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status Aktif</FormLabel>
                <FormDescription>
                  Matikan jika layanan sedang tidak tersedia.
                </FormDescription>
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

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onSuccessAction}>
            Batal
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Simpan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
